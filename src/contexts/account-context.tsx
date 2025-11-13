'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type { Transaction, Deposit } from '@/lib/data';
import { getTransactions } from '@/lib/data';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AccountContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransactionStatus: (
    transactionId: string,
    status: 'Active' | 'Expired' | 'Pending'
  ) => void;
  deposits: Deposit[];
  addDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  mobileNumber: string;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [mobileNumber, setMobileNumber] = useState('');

  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);

      const unsubscribe = onSnapshot(
        userDocRef,
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setBalance(userData.virtualBalance || 0);
            setMobileNumber(userData.mobileNumber || '');
          }
        },
        (error) => {
          console.error('Error fetching user data:', error);
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      );

      const rentalsColRef = collection(firestore, 'users', user.uid, 'rentals');
      const unsubscribeRentals = onSnapshot(
        rentalsColRef,
        (snapshot) => {
          const rentalData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
          );
          setTransactions(rentalData);
        },
        (error) => {
          console.error('Error fetching rentals:', error);
          const permissionError = new FirestorePermissionError({
            path: rentalsColRef.path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      );

      const depositsColRef = collection(
        firestore,
        'users',
        user.uid,
        'deposits'
      );
      const unsubscribeDeposits = onSnapshot(
        depositsColRef,
        (snapshot) => {
          const depositData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Deposit)
          );
          setDeposits(depositData);
        },
        (error) => {
          console.error('Error fetching deposits:', error);
          const permissionError = new FirestorePermissionError({
            path: depositsColRef.path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      );

      return () => {
        unsubscribe();
        unsubscribeRentals();
        unsubscribeDeposits();
      };
    }
  }, [user, firestore]);

  const deductBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance - amount);
  };

  const addBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance + amount);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn${transactions.length + 1}`,
    };
    setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
  };

  const addDeposit = (deposit: Omit<Deposit, 'id'>) => {
    const newDeposit: Deposit = {
      ...deposit,
      id: `dep${deposits.length + 1}`,
    };
    addBalance(deposit.amount);
    setDeposits((prevDeposits) => [newDeposit, ...prevDeposits]);
  };

  const updateTransactionStatus = useCallback(
    (transactionId: string, status: 'Active' | 'Expired' | 'Pending') => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? { ...t, status } : t))
      );
    },
    []
  );

  return (
    <AccountContext.Provider
      value={{
        balance,
        setBalance,
        deductBalance,
        addBalance,
        transactions,
        addTransaction,
        updateTransactionStatus,
        deposits,
        addDeposit,
        mobileNumber,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
