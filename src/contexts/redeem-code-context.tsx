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
  generateCodes: (count: number, amount: number) => Promise<RedeemCode[]>;
  redeemCode: (
    code: string
  ) => Promise<{ success: boolean; message: string; amount: number }>;
  markCodeAsUsed: (code: string) => void;
}

const RedeemCodeContext = createContext<RedeemCodeContextType | undefined>(
  undefined
);

export function RedeemCodeProvider({ children }: { children: ReactNode }) {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const firestore = useFirestore();
  const { user, isAdmin } = useUser();

  useEffect(() => {
    if (!firestore || !isAdmin) {
      setCodes([]);
      return;
    }
    const codesColRef = collection(firestore, "redeem_codes");
    const q = query(codesColRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const codesData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as RedeemCode)
      );
      setCodes(codesData);
    });
    return () => unsubscribe();
  }, [firestore, isAdmin]);

  const generateCodes = useCallback(
    async (count: number, amount: number): Promise<RedeemCode[]> => {
      if (!firestore) return [];
      const newCodes: RedeemCode[] = [];
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const codesColRef = collection(firestore, "redeem_codes");

      for (let i = 0; i < count; i++) {
        let code = "";
        for (let j = 0; j < 10; j++) {
          code += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }
        const newCode: Omit<RedeemCode, "id"> = {
          code,
          amount,
          used: false,
          createdAt: new Date().toISOString(),
        };
        // Use the code itself as the document ID for easy lookup
        const docRef = doc(codesColRef, code);
        addDocumentNonBlocking(docRef, newCode); // This is actually a setDoc operation
        newCodes.push({ id: code, ...newCode });
      }
      return newCodes;
    },
    [firestore]
  );

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
        console.error("Error redeeming code:", error);
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
      value={{ codes, generateCodes, redeemCode, markCodeAsUsed }}
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
