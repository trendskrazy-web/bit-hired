
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, onSnapshot, query, setDoc, orderBy, CollectionReference, Query, collectionGroup } from 'firebase/firestore';
import { useAccount } from './account-context';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export interface Deposit {
  id: string;
  userAccountId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  mobileNumber: string;
  depositTo?: string; // The account number the user is depositing to
  userName?: string;
}

export interface Withdrawal {
    id: string;
    userAccountId: string;
    amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: string;
    mobileNumber: string;
    userName?: string;
}

interface TransactionContextType {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  addDepositRequest: (amount: number, depositTo: string) => void;
  addWithdrawalRequest: (amount: number) => void;
  // Admin functions
  updateDepositStatus: (depositId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => void;
  updateWithdrawalStatus: (withdrawalId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => void;
  designatedDepositAccount: string | null;
  depositsEnabled: boolean;
  updateDesignatedAccount: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// These would typically come from a remote config or database
const DEPOSIT_ACCOUNTS = ["0706541646"];


export function TransactionProvider({ children }: { children: ReactNode }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [designatedDepositAccount, setDesignatedDepositAccount] = useState<string | null>(null);
  const [depositsEnabled, setDepositsEnabled] = useState(true);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { mobileNumber, addBalance, name } = useAccount();

  const SUPER_ADMIN_UID = 'F7hBfGV8QYhgZ7KXbcmThjlisuo2';

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

  const updateDesignatedAccount = useCallback(async () => {
    if (!firestore) return;

    // With limits removed, we just pick a random account or the first one.
    if (DEPOSIT_ACCOUNTS.length > 0) {
      const randomIndex = Math.floor(Math.random() * DEPOSIT_ACCOUNTS.length);
      const designatedAccount = DEPOSIT_ACCOUNTS[randomIndex];
      setDesignatedDepositAccount(designatedAccount);
      setDepositsEnabled(true);
    } else {
      setDesignatedDepositAccount(null);
      setDepositsEnabled(false);
    }
  }, [firestore]);

  useEffect(() => {
    updateDesignatedAccount();
    // Re-check every 5 minutes
    const interval = setInterval(updateDesignatedAccount, 300000);
    return () => clearInterval(interval);
  }, [updateDesignatedAccount]);


  useEffect(() => {
    if (!firestore || !user) {
      setDeposits([]);
      setWithdrawals([]);
      return;
    }

    const isAdmin = user.uid === SUPER_ADMIN_UID;
    const unsubscribers: (() => void)[] = [];

    const createSubscription = <T,>(
      path: string,
      isCollectionGroup: boolean,
      setData: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      let q: Query;
      if (isCollectionGroup) {
        q = query(collectionGroup(firestore, path), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(firestore, path), orderBy('createdAt', 'desc'));
      }
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
          setData(data);
        }, 
        (error) => {
          const permissionError = new FirestorePermissionError({ path, operation: 'list' });
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      unsubscribers.push(unsubscribe);
    };

    if (isAdmin) {
      createSubscription<Deposit>('deposit_transactions', true, setDeposits);
      createSubscription<Withdrawal>('withdrawal_transactions', true, setWithdrawals);
    } else {
      createSubscription<Deposit>(`users/${user.uid}/deposit_transactions`, false, setDeposits);
      createSubscription<Withdrawal>(`users/${user.uid}/withdrawal_transactions`, false, setWithdrawals);
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, firestore]);

  const addDepositRequest = (amount: number, depositTo: string) => {
    if (user && firestore && mobileNumber) {
      const newDocRef = doc(collection(firestore, 'deposit_transactions')); 
      const newDepositData = {
        id: newDocRef.id,
        userAccountId: user.uid,
        amount,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        mobileNumber: mobileNumber,
        depositTo: depositTo,
        userName: name,
      };
      
      setDoc(newDocRef, newDepositData).catch(error => {
        const permissionError = new FirestorePermissionError({ path: newDocRef.path, operation: 'create', requestResourceData: newDepositData });
        errorEmitter.emit('permission-error', permissionError);
      });
      
      const userDepositDocRef = doc(firestore, `users/${user.uid}/deposit_transactions`, newDocRef.id);
      setDoc(userDepositDocRef, newDepositData).catch(error => {
         const permissionError = new FirestorePermissionError({ path: userDepositDocRef.path, operation: 'create', requestResourceData: newDepositData });
         errorEmitter.emit('permission-error', permissionError);
      });
      
      updateDesignatedAccount();
    }
  };

  const addWithdrawalRequest = (amount: number) => {
    if (user && firestore && mobileNumber) {
      const newDocRef = doc(collection(firestore, 'withdrawal_transactions'));
      const newWithdrawalData = {
          id: newDocRef.id,
          userAccountId: user.uid,
          amount,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          mobileNumber: mobileNumber,
          userName: name,
      };
      
      setDoc(newDocRef, newWithdrawalData).catch(error => {
        const permissionError = new FirestorePermissionError({ path: newDocRef.path, operation: 'create', requestResourceData: newWithdrawalData });
        errorEmitter.emit('permission-error', permissionError);
      });

      const userWithdrawalDocRef = doc(firestore, `users/${user.uid}/withdrawal_transactions`, newDocRef.id);
      setDoc(userWithdrawalDocRef, newWithdrawalData).catch(error => {
        const permissionError = new FirestorePermissionError({ path: userWithdrawalDocRef.path, operation: 'create', requestResourceData: newWithdrawalData });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  };
  
  const updateDepositStatus = useCallback(
    (depositId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => {
      if (firestore) {
        const depositDocRef = doc(firestore, 'deposit_transactions', depositId);
        updateDocumentNonBlocking(depositDocRef, { status });

        const userDepositDocRef = doc(firestore, `users/${userId}/deposit_transactions`, depositId);
        updateDocumentNonBlocking(userDepositDocRef, { status });

        if (status === 'completed') {
            addBalance(amount, userId);
            logAdminAction(`Approved deposit of KES ${amount} for user ${userId}.`);
        } else {
             logAdminAction(`Cancelled deposit of KES ${amount} for user ${userId}.`);
        }
      }
    },
    [firestore, addBalance, logAdminAction]
  );

  const updateWithdrawalStatus = useCallback(
    (withdrawalId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => {
      if (firestore) {
        const withdrawalDocRef = doc(firestore, 'withdrawal_transactions', withdrawalId);
        updateDocumentNonBlocking(withdrawalDocRef, { status });
        
        const userWithdrawalDocRef = doc(firestore, `users/${userId}/withdrawal_transactions`, withdrawalId);
        updateDocumentNonBlocking(userWithdrawalDocRef, { status });

        if (status === 'completed') {
            logAdminAction(`Completed withdrawal of KES ${amount} for user ${userId}.`);
        } else if (status === 'cancelled') {
            addBalance(amount, userId);
            logAdminAction(`Cancelled withdrawal of KES ${amount} for user ${userId}. Balance refunded.`);
        }
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
    designatedDepositAccount,
    depositsEnabled,
    updateDesignatedAccount,
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

    