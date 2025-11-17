
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
import { collection, doc, onSnapshot, increment } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  virtualBalance: number;
  referralCode?: string;
  invitedBy?: string;
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
  referralCode?: string;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined);
  
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore) return;

    const unsubscribers: (() => void)[] = [];

    // Fetch data for the logged-in user
    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as UserAccount;
        setBalance(userData.virtualBalance || 0);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setMobileNumber(userData.mobileNumber || '');
        setReferralCode(userData.referralCode);
      }
    }, (error) => {
      const permissionError = new FirestorePermissionError({ path: userDocRef.path, operation: 'get' });
      errorEmitter.emit('permission-error', permissionError);
    });
    unsubscribers.push(unsubscribeUser);

    const rentalsColRef = collection(firestore, 'users', user.uid, 'rentals');
    const unsubscribeRentals = onSnapshot(rentalsColRef, (snapshot) => {
      const rentalData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(rentalData);
    }, (error) => {
      const permissionError = new FirestorePermissionError({ path: rentalsColRef.path, operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
    });
    unsubscribers.push(unsubscribeRentals);
    

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, firestore]);

  const updateUserBalance = (amount: number, userIdToUpdate: string) => {
      if(userIdToUpdate && firestore) {
          const userDocRef = doc(firestore, 'users', userIdToUpdate);
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

  const addBalance = (amount: number, userIdToAdd?: string) => {
    const targetUserId = userIdToAdd || user?.uid;
    if (targetUserId) {
        updateUserBalance(amount, targetUserId);
    }
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

  const updateTransactionStatus = useCallback(
    (transactionId: string, status: 'Active' | 'Expired' | 'Pending') => {
      if(user && firestore) {
          const transactionDocRef = doc(firestore, 'users', user.uid, 'rentals', transactionId);
          updateDocumentNonBlocking(transactionDocRef, { status });
      }
    },
    [user, firestore]
  );
  
  const contextValue = {
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
    referralCode,
  };


  return (
    <AccountContext.Provider
      value={contextValue}
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

    