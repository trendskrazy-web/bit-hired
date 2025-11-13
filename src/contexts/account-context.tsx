"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AccountContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1234.56);

  const deductBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance - amount);
  };

  const addBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance + amount);
  };

  return (
    <AccountContext.Provider value={{ balance, setBalance, deductBalance, addBalance }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
