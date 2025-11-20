
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
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  useFirestore,
  useUser,
} from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

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
  generateCode: (amount: number) => Promise<string>;
  generateCodes: (amount: number, count: number) => Promise<void>;
  redeemCode: (
    code: string
  ) => Promise<{ success: boolean; message: string; amount: number }>;
  markCodeAsUsed: (code: string) => void;
  codes: RedeemCode[];
}

const RedeemCodeContext = createContext<RedeemCodeContextType | undefined>(
  undefined
);

// In a real app, you might use a more robust library like `uuid`
const generateUniqueCode = () => {
    return 'BH' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function RedeemCodeProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [codes, setCodes] = useState<RedeemCode[]>([]);

  // This is a hardcoded UID for the super admin.
  const SUPER_ADMIN_UID = 'F7hBfGV8QYhgZ7KXbcmThjlisuo2';

  // Admin: Fetch all redeem codes
  useEffect(() => {
    if (user?.uid === SUPER_ADMIN_UID && firestore) {
      const codesColRef = collection(firestore, 'redeem_codes');
      const q = query(codesColRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RedeemCode));
        setCodes(codesData);
      }, (error) => {
        const permissionError = new FirestorePermissionError({ path: codesColRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

      return () => unsubscribe();
    }
  }, [user, firestore]);


  const generateCode = useCallback(async (amount: number) => {
    if (!firestore) throw new Error("Firestore not available");
    
    const newCode = generateUniqueCode();
    const codeDocRef = doc(firestore, 'redeem_codes', newCode);
    const codeData = {
        code: newCode,
        amount,
        used: false,
        createdAt: new Date().toISOString(),
    };
    
    setDocumentNonBlocking(codeDocRef, codeData);

    return newCode;
  }, [firestore]);

  const generateCodes = useCallback(async (amount: number, count: number) => {
    for (let i = 0; i < count; i++) {
        await generateCode(amount);
    }
  }, [generateCode]);


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
        const permissionError = new FirestorePermissionError({ path: codeDocRef.path, operation: 'get' });
        errorEmitter.emit('permission-error', permissionError);
        return {
          success: false,
          message: "Could not verify redeem code. Please try again.",
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
      value={{ generateCode, generateCodes, redeemCode, markCodeAsUsed, codes }}
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
