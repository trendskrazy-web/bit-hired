
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  useFirestore,
  useUser,
  FirestorePermissionError,
  errorEmitter
} from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
} from "firebase/firestore";

export interface RedeemCode {
  id: string; // Document ID is the code itself
  code: string;
  amount: number;
  used: boolean;
  createdAt: string;
  usedBy?: string;
  usedAt?: string;
}

interface RedeemCodeContextType {
  codes: RedeemCode[];
  generateCode: (amount: number) => Promise<string>;
  redeemCode: (
    code: string
  ) => Promise<{ success: boolean; message: string; amount: number }>;
  markCodeAsUsed: (code: string) => void;
}

const RedeemCodeContext = createContext<RedeemCodeContextType | undefined>(
  undefined
);

// In a real app, you might use a more robust library like `uuid`
const generateUniqueCode = () => {
    return 'BH' + Math.random().toString(36).substring(2, 10).toUpperCase();
}


export function RedeemCodeProvider({ children }: { children: ReactNode }) {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.uid === 'GEGZNzOWg6bnU53iwJLzL5LaXwR2';

  useEffect(() => {
    if (!firestore || !isAdmin) {
        setCodes([]);
        return;
    };

    const codesColRef = collection(firestore, "redeem_codes");
    const q = query(codesColRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const codesData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as RedeemCode)
      );
      setCodes(codesData);
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: codesColRef.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsubscribe();
  }, [firestore, isAdmin]);


  const generateCode = useCallback(async (amount: number) => {
    if (!firestore) throw new Error("Firestore not available");
    
    const newCode = generateUniqueCode();
    const codeDocRef = doc(firestore, 'redeem_codes', newCode);
    
    await addDocumentNonBlocking(codeDocRef, {
        code: newCode,
        amount,
        used: false,
        createdAt: new Date().toISOString(),
    });

    return newCode;
  }, [firestore]);


  const redeemCode = useCallback(
    async (
      code: string
    ): Promise<{ success: boolean; message: string; amount: number }> => {
      if (!firestore)
        return {
          success: false,
          message: "Database not available.",
          amount: 0,
        };

      const codeDocRef = doc(firestore, "redeem_codes", code);
      try {
        const docSnap = await getDoc(codeDocRef);

        if (!docSnap.exists()) {
          return {
            success: false,
            message: "This redeem code is invalid.",
            amount: 0,
          };
        }

        const foundCode = docSnap.data() as RedeemCode;
        if (foundCode.used) {
          return {
            success: false,
            message: "This redeem code has already been used.",
            amount: 0,
          };
        }

        return {
          success: true,
          message: "Code redeemed successfully.",
          amount: foundCode.amount,
        };
      } catch (error) {
        const permissionError = new FirestorePermissionError({
          path: codeDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        return {
          success: false,
          message: "An error occurred while redeeming the code.",
          amount: 0,
        };
      }
    },
    [firestore]
  );

  const markCodeAsUsed = useCallback(
    (code: string) => {
      if (firestore && user) {
        const codeDocRef = doc(firestore, "redeem_codes", code);
        updateDocumentNonBlocking(codeDocRef, {
          used: true,
          usedBy: user.uid,
          usedAt: new Date().toISOString(),
        });
      }
    },
    [firestore, user]
  );

  return (
    <RedeemCodeContext.Provider
      value={{ codes, generateCode, redeemCode, markCodeAsUsed }}
    >
      {children}
    </RedeemCodeContext.Provider>
  );
}

export function useRedeemCodes() {
  const context = useContext(RedeemCodeContext);
  if (context === undefined) {
    throw new Error("useRedeemCodes must be used within a RedeemCodeProvider");
  }
  return context;
}
