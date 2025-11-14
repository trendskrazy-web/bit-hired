
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
import { collection, doc, onSnapshot, query, where, setDoc, increment, getDocs } from 'firebase/firestore';
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

export interface DailyLimit {
    id: string; // Composite key: YYYY-MM-DD_accountNumber
    totalAmount: number;
    date: string;
}

interface TransactionContextType {
  deposits: Deposit[];
  addDepositRequest: (amount: number, depositTo: string) => void;
  // Admin functions
  updateDepositStatus: (depositId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => void;
  designatedDepositAccount: string | null;
  depositsEnabled: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// These would typically come from a remote config or database
const DEPOSIT_ACCOUNTS = ["0704356623", "0758669258"];
const DAILY_LIMIT_PER_ACCOUNT = 500000;


export function TransactionProvider({ children }: { children: ReactNode }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
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

        for (const acc of DEPOSIT_ACCOUNTS) {
            if (accountTotals[acc] < DAILY_LIMIT_PER_ACCOUNT) {
                if (accountTotals[acc] < minTotal) {
                    minTotal = accountTotals[acc];
                    designatedAccount = acc;
                }
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
    // Re-check every minute
    const interval = setInterval(updateDesignatedAccount, 60000);
    return () => clearInterval(interval);
  }, [updateDesignatedAccount]);


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

    createSubscription<Deposit>('deposit_transactions', isAdmin, setDeposits);

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

  const contextValue = {
    deposits,
    addDepositRequest,
    updateDepositStatus,
    designatedDepositAccount,
    depositsEnabled,
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
