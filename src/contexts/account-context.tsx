
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type { Transaction } from '@/lib/data';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, onSnapshot, increment, query, where } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export interface Deposit {
  id: string;
  userAccountId: string;
  amount: number;
  transactionCode: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  mobileNumber: string;
}

interface AccountContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number, userId?: string) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'status'> & { status?: 'Active' | 'Expired' | 'Pending' }) => void;
  updateTransactionStatus: (
    transactionId: string,
    status: 'Active' | 'Expired' | 'Pending'
  ) => void;
  name: string;
  email: string;
  mobileNumber: string;
  deposits: Deposit[];
  addDepositRequest: (amount: number, transactionCode: string) => void;
  updateDepositStatus: (depositId: string, status: 'completed' | 'cancelled') => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore) return;

    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setBalance(userData.virtualBalance || 0);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setMobileNumber(userData.mobileNumber || '');
      }
    }, (error) => {
      const permissionError = new FirestorePermissionError({ path: userDocRef.path, operation: 'get' });
      errorEmitter.emit('permission-error', permissionError);
    });

    const rentalsColRef = collection(firestore, 'users', user.uid, 'rentals');
    const unsubscribeRentals = onSnapshot(rentalsColRef, (snapshot) => {
      const rentalData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(rentalData);
    }, (error) => {
      const permissionError = new FirestorePermissionError({ path: rentalsColRef.path, operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
    });

    const depositsColRef = collection(firestore, 'deposit_transactions');
    const userDepositsQuery = query(depositsColRef, where("userAccountId", "==", user.uid));
    const unsubscribeUserDeposits = onSnapshot(userDepositsQuery, (snapshot) => {
        const depositData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deposit));
        setDeposits(depositData);
    }, (error) => {
       const permissionError = new FirestorePermissionError({ path: `deposit_transactions where userAccountId == ${user.uid}`, operation: 'list' });
       errorEmitter.emit('permission-error', permissionError);
    });
    

    return () => {
      unsubscribeUser();
      unsubscribeRentals();
      unsubscribeUserDeposits();
    };
  }, [user, firestore]);

  const updateUserBalance = (amount: number, userId: string) => {
      if(userId && firestore) {
          const userDocRef = doc(firestore, 'users', userId);
          updateDocumentNonBlocking(userDocRef, {
              virtualBalance: increment(amount)
          });
      }
  }

  const deductBalance = (amount: number) => {
    if(user?.uid) {
        updateUserBalance(-amount, user.uid);
    }
  };

  const addBalance = (amount: number, userId: string = user?.uid || '') => {
    updateUserBalance(amount, userId);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'status'> & { status?: 'Active' | 'Expired' | 'Pending' }) => {
    if(user && firestore) {
        const rentalsColRef = collection(firestore, 'users', user.uid, 'rentals');
        addDocumentNonBlocking(rentalsColRef, {
            ...transaction,
            userAccountId: user.uid,
            status: transaction.status || 'Active',
        });
    }
  };

  const addDepositRequest = (amount: number, transactionCode: string) => {
    if (user && firestore && mobileNumber) {
      const depositsColRef = collection(firestore, 'deposit_transactions');
      addDocumentNonBlocking(depositsColRef, {
        userAccountId: user.uid,
        amount,
        transactionCode,
        status: 'pending',
        createdAt: new Date().toISOString(),
        mobileNumber: mobileNumber,
      });
    }
  };

  const updateTransactionStatus = useCallback(
    (transactionId: string, status: 'Active' | 'Expired' | 'Pending') => {
      if(user && firestore) {
          const transactionDocRef = doc(firestore, 'users', user.uid, 'rentals', transactionId);
          updateDocumentNonBlocking(transactionDocRef, { status });
      }
    },
    [user, firestore]
  );
  
  const updateDepositStatus = useCallback(
    (depositId: string, status: 'completed' | 'cancelled') => {
      // This function is now only for admins, but we leave the logic here
      // in case admin functionality is restored.
      // A non-admin call will fail due to security rules.
      if (firestore) {
        const depositDocRef = doc(firestore, 'deposit_transactions', depositId);
        const deposit = deposits.find(d => d.id === depositId);
        
        if (status === 'completed' && deposit) {
             addBalance(deposit.amount, deposit.userAccountId);
        }

        updateDocumentNonBlocking(depositDocRef, { status });
      }
    },
    [firestore, deposits, addBalance]
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
        name,
        email,
        mobileNumber,
        deposits,
        addDepositRequest,
        updateDepositStatus,
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
