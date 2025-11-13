"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import type { Transaction, Deposit } from "@/lib/data";
import { getTransactions } from "@/lib/data";

interface AccountContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransactionStatus: (transactionId: string, status: "Active" | "Expired" | "Pending") => void;
  deposits: Deposit[];
  addDeposit: (deposit: Omit<Deposit, "id">) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1234.56);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);

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

  const addDeposit = (deposit: Omit<Deposit, "id">) => {
    const newDeposit: Deposit = {
      ...deposit,
      id: `dep${deposits.length + 1}`,
    };
    addBalance(deposit.amount);
    setDeposits((prevDeposits) => [newDeposit, ...prevDeposits]);
  };

  const updateTransactionStatus = useCallback((transactionId: string, status: "Active" | "Expired" | "Pending") => {
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId ? { ...t, status } : t
      )
    );
  }, []);

  return (
    <AccountContext.Provider value={{ balance, setBalance, deductBalance, addBalance, transactions, addTransaction, updateTransactionStatus, deposits, addDeposit }}>
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
