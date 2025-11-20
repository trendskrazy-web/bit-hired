
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
const DEPOSIT_ACCOUNTS = ["0706541646"];
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

    const createSubscription = <T,>(
        collectionName: string,
        setData: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
        let q: Query;
        if (isAdmin) {
            // Admin queries the root collection
            q = query(collection(firestore, collectionName), orderBy('createdAt', 'desc'));
        } else {
            // User queries their own sub-collection
            const userSubCollectionPath = `users/${user.uid}/${collectionName}`;
            q = query(collection(firestore, userSubCollectionPath), orderBy('createdAt', 'desc'));
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            setData(data);
        }, (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
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
      // 1. Add to the global collection for admin approval
      const depositsColRef = collection(firestore, 'deposit_transactions');
      const newDocRef = doc(depositsColRef); // Create a new doc reference with an auto-generated ID
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
        console.error("Error creating global deposit request:", error);
      });
      
      // 2. Denormalize: Add a copy to the user's sub-collection
      const userDepositDocRef = doc(firestore, `users/${user.uid}/deposit_transactions`, newDocRef.id);
      setDoc(userDepositDocRef, newDepositData).catch(error => {
         console.error("Error creating user deposit request:", error);
      });


      // 3. Update daily limit
      const today = new Date().toISOString().split("T")[0];
      const limitDocId = `${today}_${depositTo}`;
      const limitDocRef = doc(firestore, 'daily_limits', limitDocId);

      setDoc(limitDocRef, 
        { totalAmount: increment(amount), date: today, account: depositTo }, 
        { merge: true }
      ).catch(error => {
        console.error("Error updating daily limit:", error);
      });
      // Immediately update the state to reflect the new designated account
      updateDesignatedAccount();
    }
  };

  const addWithdrawalRequest = (amount: number) => {
    if (user && firestore && mobileNumber) {
       // 1. Add to the global collection for admin approval
      const withdrawalsColRef = collection(firestore, 'withdrawal_transactions');
      const newDocRef = doc(withdrawalsColRef); // Create a new doc reference with an auto-generated ID
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
        console.error("Error creating global withdrawal request:", error);
      });

      // 2. Denormalize: Add a copy to the user's sub-collection
      const userWithdrawalDocRef = doc(firestore, `users/${user.uid}/withdrawal_transactions`, newDocRef.id);
      setDoc(userWithdrawalDocRef, newWithdrawalData).catch(error => {
        console.error("Error creating user withdrawal request:", error);
      });
    }
  };
  
  const updateDepositStatus = useCallback(
    (depositId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => {
      if (firestore) {
        // Update the master record
        const depositDocRef = doc(firestore, 'deposit_transactions', depositId);
        updateDocumentNonBlocking(depositDocRef, { status });

        // Update the denormalized user record
        const userDepositDocRef = doc(firestore, `users/${userId}/deposit_transactions`, depositId);
        updateDocumentNonBlocking(userDepositDocRef, { status });

        if (status === 'completed') {
            addBalance(amount, userId);
            logAdminAction(`Approved deposit of KES ${amount} for user ${userId}.`);
        } else { // 'cancelled'
             logAdminAction(`Cancelled deposit of KES ${amount} for user ${userId}.`);
        }
      }
    },
    [firestore, addBalance, logAdminAction]
  );

  const updateWithdrawalStatus = useCallback(
    (withdrawalId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => {
      if (firestore) {
        // Update master record
        const withdrawalDocRef = doc(firestore, 'withdrawal_transactions', withdrawalId);
        updateDocumentNonBlocking(withdrawalDocRef, { status });
        
        // Update denormalized user record
        const userWithdrawalDocRef = doc(firestore, `users/${userId}/withdrawal_transactions`, withdrawalId);
        updateDocumentNonBlocking(userWithdrawalDocRef, { status });

        if (status === 'completed') {
            logAdminAction(`Completed withdrawal of KES ${amount} for user ${userId}.`);
        } else if (status === 'cancelled') {
            // If cancelled, refund the amount to the user's balance.
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
