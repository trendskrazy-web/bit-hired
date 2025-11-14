
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
  redeemCode: (
    code: string
  ) => Promise<{ success: boolean; message: string; amount: number }>;
  markCodeAsUsed: (code: string) => void;
}

const RedeemCodeContext = createContext<RedeemCodeContextType | undefined>(
  undefined
);


export function RedeemCodeProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();

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
      value={{ redeemCode, markCodeAsUsed }}
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
