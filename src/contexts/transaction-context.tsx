
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
import { collection, doc, onSnapshot, query, where, setDoc, increment, getDocs, orderBy, CollectionReference, Query } from 'firebase/firestore';
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

export interface DailyLimit {
    id: string; // Composite key: YYYY-MM-DD_accountNumber
    totalAmount: number;
    date: string;
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
const DEPOSIT_ACCOUNTS = ["0704356623", "0758669258"];
const DAILY_LIMIT_PER_ACCOUNT = 500000;


export function TransactionProvider({ children }: { children: ReactNode }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [designatedDepositAccount, setDesignatedDepositAccount] = useState<string | null>(null);
  const [depositsEnabled, setDepositsEnabled] = useState(true);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { mobileNumber, addBalance, name } = useAccount();

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

  const updateDesignatedAccount = useCallback(async () => {
    if (!firestore) return;

    const today = new Date().toISOString().split("T")[0];
    const dailyLimitsRef = collection(firestore, 'daily_limits');
    
    const accountTotals: Record<string, number> = {};
    for (const acc of DEPOSIT_ACCOUNTS) {
        accountTotals[acc] = 0;
    }

    const q = query(dailyLimitsRef, where('date', '==', today));
    
    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const accountId = doc.id.split('_')[1];
            if(accountId && accountTotals.hasOwnProperty(accountId)) {
                accountTotals[accountId] = data.totalAmount;
            }
        });

        // Find the account with the minimum total
        let minTotal = Infinity;
        let designatedAccount: string | null = null;

        // Create a shuffled array of accounts to pick from randomly if totals are equal
        const shuffledAccounts = [...DEPOSIT_ACCOUNTS].sort(() => Math.random() - 0.5);

        for (const acc of shuffledAccounts) {
            if (accountTotals[acc] < DAILY_LIMIT_PER_ACCOUNT) {
                if (accountTotals[acc] < minTotal) {
                    minTotal = accountTotals[acc];
                    designatedAccount = acc;
                }
            }
        }
        
        // If all available accounts have the same minimum total, pick one
        if (!designatedAccount) {
             const availableAccounts = shuffledAccounts.filter(acc => accountTotals[acc] < DAILY_LIMIT_PER_ACCOUNT);
             if (availableAccounts.length > 0) {
                 designatedAccount = availableAccounts[0];
             }
        }

        setDesignatedDepositAccount(designatedAccount);
        setDepositsEnabled(designatedAccount !== null);

    } catch (error) {
        console.error("Error fetching daily limits:", error);
        const permissionError = new FirestorePermissionError({ path: 'daily_limits', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
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
    if (!firestore || !user) return;

    const unsubscribers: (() => void)[] = [];
    const isAdmin = user.uid === SUPER_ADMIN_UID;

    // Common query logic
    const createSubscription = <T,>(
      collectionName: string,
      setData: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      let q: Query;
      const collectionRef = collection(firestore, collectionName);
      if (isAdmin) {
        // Admin gets all documents, sorted by creation date
        q = query(collectionRef, orderBy('createdAt', 'desc'));
      } else {
        // Regular user gets only their own documents, sorted
        q = query(
          collectionRef,
          where('userAccountId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
      }
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(data);
      }, (error) => {
        // The path is extracted from the query object itself for accuracy.
        const path = (q as any)._query.path.canonicalString();
        const permissionError = new FirestorePermissionError({ path: path, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });
      unsubscribers.push(unsubscribe);
    };

    createSubscription<Deposit>('deposit_transactions', setDeposits);
    createSubscription<Withdrawal>('withdrawal_transactions', setWithdrawals);

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
        { totalAmount: increment(amount), date: today, account: depositTo }, 
        { merge: true }
      ).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: limitDocRef.path,
            operation: 'write',
            requestResourceData: { totalAmount: `increment(${amount})`, date: today }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      // Immediately update the state to reflect the new designated account
      updateDesignatedAccount();
    }
  };

  const addWithdrawalRequest = (amount: number) => {
    if (user && firestore && mobileNumber) {
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
        } else { // 'cancelled'
             logAdminAction(`Cancelled deposit of KES ${amount} for user ${userId}.`);
             // NOTE: No balance change needed for cancelling a deposit, as it was never added.
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
        if (status === 'completed') {
            // Balance is already deducted on request. Admin just confirms.
            logAdminAction(`Completed withdrawal of KES ${amount} for user ${userId}.`);
        } else if (status === 'cancelled') {
            // If cancelled, refund the amount to the user's balance.
            addBalance(amount, userId);
            logAdminAction(`Cancelled withdrawal of KES ${amount} for user ${userId}. Balance refunded.`);
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
