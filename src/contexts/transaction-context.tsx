
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, onSnapshot, query, where, setDoc, increment } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAccount } from './account-context';

export interface Deposit {
  id: string;
  userAccountId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  mobileNumber: string;
  depositTo?: string; // The account number the user is depositing to
}

export interface Withdrawal {
    id: string;
    userAccountId: string;
    amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: string;
    mobileNumber: string;
}

interface TransactionContextType {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  addDepositRequest: (amount: number, depositTo: string) => void;
  addWithdrawalRequest: (amount: number) => void;
  // Admin functions
  updateDepositStatus: (depositId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => void;
  updateWithdrawalStatus: (withdrawalId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { mobileNumber, addBalance, deductBalance, name } = useAccount();

  const SUPER_ADMIN_UID = 'GEGZNzOWg6bnU53iwJLzL5LaXwR2';

  const logAdminAction = useCallback((message: string) => {
    if (user && firestore && user.uid === SUPER_ADMIN_UID) {
      const notificationsColRef = collection(firestore, 'notifications');
      addDocumentNonBlocking(notificationsColRef, {
        message,
        adminId: user.uid,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  }, [user, firestore]);

  useEffect(() => {
    if (!firestore || !user) return;

    const unsubscribers: (() => void)[] = [];
    const isAdmin = user.uid === SUPER_ADMIN_UID;

    // Common query logic
    const createSubscription = <T,>(
      collectionName: string,
      isAdmin: boolean,
      setData: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      let q;
      const collectionRef = collection(firestore, collectionName);
      if (isAdmin) {
        q = query(collectionRef); // Admin gets all
      } else {
        q = query(collectionRef, where('userAccountId', '==', user.uid)); // User gets their own
      }
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(data);
      }, (error) => {
        const permissionError = new FirestorePermissionError({ path: collectionName, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });
      unsubscribers.push(unsubscribe);
    };

    // Create subscriptions for deposits and withdrawals
    createSubscription<Deposit>('deposit_transactions', isAdmin, setDeposits);
    createSubscription<Withdrawal>('withdrawal_transactions', isAdmin, setWithdrawals);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user, firestore]);

  const addDepositRequest = (amount: number, depositTo: string) => {
    if (user && firestore && mobileNumber) {
      const depositsColRef = collection(firestore, 'deposit_transactions');
      addDocumentNonBlocking(depositsColRef, {
        userAccountId: user.uid,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        mobileNumber: mobileNumber,
        depositTo: depositTo,
        userName: name,
      });

      const today = new Date().toISOString().split("T")[0];
      const limitDocId = `${today}_${depositTo}`;
      const limitDocRef = doc(firestore, 'daily_limits', limitDocId);

      setDoc(limitDocRef, 
        { totalAmount: increment(amount), date: today }, 
        { merge: true }
      ).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: limitDocRef.path,
            operation: 'write',
            requestResourceData: { totalAmount: `increment(${amount})`, date: today }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  };

   const addWithdrawalRequest = (amount: number) => {
    if (user && firestore && mobileNumber) {
      deductBalance(amount);
      const withdrawalsColRef = collection(firestore, 'withdrawal_transactions');
      addDocumentNonBlocking(withdrawalsColRef, {
        userAccountId: user.uid,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        mobileNumber: mobileNumber,
        userName: name,
      });
    }
  };
  
  const updateDepositStatus = useCallback(
    (depositId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => {
      if (firestore) {
        const depositDocRef = doc(firestore, 'deposit_transactions', depositId);
        if (status === 'completed') {
            addBalance(amount, userId);
            logAdminAction(`Approved deposit of KES ${amount} for user ${userId}.`);
        } else {
             logAdminAction(`Cancelled deposit of KES ${amount} for user ${userId}.`);
        }
        updateDocumentNonBlocking(depositDocRef, { status });
      }
    },
    [firestore, addBalance, logAdminAction]
  );

  const updateWithdrawalStatus = useCallback(
    (withdrawalId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => {
        if (firestore) {
            const withdrawalDocRef = doc(firestore, 'withdrawal_transactions', withdrawalId);
            if(status === 'cancelled') {
                // Refund the user if withdrawal is cancelled
                addBalance(amount, userId);
                logAdminAction(`Cancelled withdrawal of KES ${amount} for user ${userId}. Balance refunded.`);
            } else {
                 logAdminAction(`Completed withdrawal of KES ${amount} for user ${userId}.`);
            }
            updateDocumentNonBlocking(withdrawalDocRef, { status });
        }
    },
    [firestore, addBalance, logAdminAction]
  );

  const contextValue = {
    deposits,
    withdrawals,
    addDepositRequest,
    addWithdrawalRequest,
    updateDepositStatus,
    updateWithdrawalStatus,
  };


  return (
    <TransactionContext.Provider
      value={contextValue}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within an TransactionProvider');
  }
  return context;
}
