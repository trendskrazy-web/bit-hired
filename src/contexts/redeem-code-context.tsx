"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { initialRedeemCodes, type RedeemCode } from "@/lib/redeem-codes";

interface RedeemCodeContextType {
  codes: RedeemCode[];
  generateCodes: (count: number, amount: number) => RedeemCode[];
  redeemCode: (code: string) => { success: boolean; message: string; amount: number };
  markCodeAsUsed: (code: string) => void;
}

const RedeemCodeContext = createContext<RedeemCodeContextType | undefined>(undefined);

export function RedeemCodeProvider({ children }: { children: ReactNode }) {
  const [codes, setCodes] = useState<RedeemCode[]>(initialRedeemCodes);

  const generateCodes = useCallback((count: number, amount: number): RedeemCode[] => {
    const newCodes: RedeemCode[] = [];
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < count; i++) {
      let code = "";
      for (let j = 0; j < 10; j++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      const newCode: RedeemCode = { code, amount, used: false, createdAt: new Date().toISOString() };
      newCodes.push(newCode);
    }
    setCodes(prev => [...newCodes, ...prev]);
    return newCodes;
  }, []);

  const redeemCode = useCallback((code: string): { success: boolean; message: string, amount: number } => {
    const foundCode = codes.find(c => c.code === code);
    if (!foundCode) {
      return { success: false, message: "This redeem code is invalid.", amount: 0 };
    }
    if (foundCode.used) {
      return { success: false, message: "This redeem code has already been used.", amount: 0 };
    }
    return { success: true, message: "Code redeemed successfully.", amount: foundCode.amount };
  }, [codes]);

  const markCodeAsUsed = useCallback((code: string) => {
    setCodes(prev =>
      prev.map(c => (c.code === code ? { ...c, used: true } : c))
    );
  }, []);

  return (
    <RedeemCodeContext.Provider value={{ codes, generateCodes, redeemCode, markCodeAsUsed }}>
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
