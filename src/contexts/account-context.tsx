
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type { Transaction, DepositTransaction, Notification } from '@/lib/data';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, onSnapshot, increment, query, where, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AccountContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'status'> & { status?: 'Active' | 'Expired' | 'Pending' }) => void;
  updateTransactionStatus: (
    transactionId: string,
    status: 'Active' | 'Expired' | 'Pending'
  ) => void;
  deposits: DepositTransaction[];
  addDepositRequest: (amount: number, mobileNumber: string) => Promise<DepositTransaction>;
  name: string;
  email: string;
  mobileNumber: string;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
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

    // Restore deposits subscription
    const depositsQuery = query(collection(firestore, 'deposit_transactions'), where('userAccountId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeUserDeposits = onSnapshot(depositsQuery, (snapshot) => {
      const depositData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DepositTransaction));
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

  const updateUserBalance = (amount: number, userId: string = user?.uid || '') => {
      if(userId && firestore) {
          const userDocRef = doc(firestore, 'users', userId);
          updateDocumentNonBlocking(userDocRef, {
              virtualBalance: increment(amount)
          });
      }
  }

  const deductBalance = (amount: number) => {
    updateUserBalance(-amount);
  };

  const addBalance = (amount: number) => {
    updateUserBalance(amount);
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
  
  const addDepositRequest = async (amount: number, mobileNumber: string): Promise<DepositTransaction> => {
    if (!user || !firestore) {
      throw new Error("User not authenticated");
    }
    
    const transactionCode = `BHT${Date.now().toString().slice(-6)}`;
    const newDeposit: Omit<DepositTransaction, 'id'> = {
      userAccountId: user.uid,
      amount,
      mobileNumber,
      transactionCode,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDocumentNonBlocking(collection(firestore, 'deposit_transactions'), newDeposit);
    
    return { ...newDeposit, id: docRef.id };
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
        addDepositRequest,
        name,
        email,
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
