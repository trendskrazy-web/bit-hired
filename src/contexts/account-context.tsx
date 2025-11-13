"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Transaction } from "@/lib/data";
import { getTransactions } from "@/lib/data";

interface AccountContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1234.56);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      const initialTransactions = await getTransactions();
      setTransactions(initialTransactions);
    }
    fetchTransactions();
  }, []);

  const deductBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance - amount);
  };

  const addBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance + amount);
  };
  
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn${transactions.length + 1}`,
    };
    setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
  };

  return (
    <AccountContext.Provider value={{ balance, setBalance, deductBalance, addBalance, transactions, addTransaction }}>
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
