
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
import { collection, doc, onSnapshot, query, setDoc, orderBy, collectionGroup } from 'firebase/firestore';
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

const useAdminTransactions = () => {
    const firestore = useFirestore();
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

    useEffect(() => {
        if (!firestore) return;

        const depositsQuery = query(collectionGroup(firestore, 'deposit_transactions'), orderBy('createdAt', 'desc'));
        const depositsUnsub = onSnapshot(depositsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
            setDeposits(data);
        }, (error) => {
            const permissionError = new FirestorePermissionError({ path: 'deposit_transactions', operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
        });

        const withdrawalsQuery = query(collectionGroup(firestore, 'withdrawal_transactions'), orderBy('createdAt', 'desc'));
        const withdrawalsUnsub = onSnapshot(withdrawalsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Withdrawal));
            setWithdrawals(data);
        }, (error) => {
           const permissionError = new FirestorePermissionError({ path: 'withdrawal_transactions', operation: 'list' });
           errorEmitter.emit('permission-error', permissionError);
        });

        return () => {
            depositsUnsub();
            withdrawalsUnsub();
        };
    }, [firestore]);

    return { deposits, withdrawals };
};

const useUserTransactions = () => {
    const firestore = useFirestore();
    const { user } = useUser();
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

    useEffect(() => {
        if (!firestore || !user) return;

        const userDepositsPath = `users/${user.uid}/deposit_transactions`;
        const userDepositsQuery = query(collection(firestore, userDepositsPath), orderBy('createdAt', 'desc'));
        const userDepositsUnsub = onSnapshot(userDepositsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
            setDeposits(data);
        }, (error) => {
            const permissionError = new FirestorePermissionError({ path: userDepositsPath, operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
        });

        const userWithdrawalsPath = `users/${user.uid}/withdrawal_transactions`;
        const userWithdrawalsQuery = query(collection(firestore, userWithdrawalsPath), orderBy('createdAt', 'desc'));
        const userWithdrawalsUnsub = onSnapshot(userWithdrawalsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Withdrawal));
            setWithdrawals(data);
        }, (error) => {
            const permissionError = new FirestorePermissionError({ path: userWithdrawalsPath, operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
        });

        return () => {
            userDepositsUnsub();
            userWithdrawalsUnsub();
        };
    }, [firestore, user]);

    return { deposits, withdrawals };
}


export function TransactionProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { mobileNumber, addBalance, name } = useAccount();

  const [designatedDepositAccount, setDesignatedDepositAccount] = useState<string | null>(null);
  const [depositsEnabled, setDepositsEnabled] = useState(true);

  const SUPER_ADMIN_UID = 'F7hBfGV8QYhgZ7KXbcmThjlisuo2';
  const isAdmin = user?.uid === SUPER_ADMIN_UID;

  const { deposits: adminDeposits, withdrawals: adminWithdrawals } = useAdminTransactions();
  const { deposits: userDeposits, withdrawals: userWithdrawals } = useUserTransactions();

  const deposits = isAdmin ? adminDeposits : userDeposits;
  const withdrawals = isAdmin ? adminWithdrawals : userWithdrawals;

  const logAdminAction = useCallback((message: string) => {
    if (isAdmin && user && firestore) {
      const notificationsColRef = collection(firestore, 'notifications');
      addDocumentNonBlocking(notificationsColRef, {
        message,
        adminId: user.uid,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  }, [user, firestore, isAdmin]);

  const updateDesignatedAccount = useCallback(async () => {
    if (!firestore) return;

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
    const interval = setInterval(updateDesignatedAccount, 300000);
    return () => clearInterval(interval);
  }, [updateDesignatedAccount]);

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
      if (firestore && isAdmin) {
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
    [firestore, addBalance, logAdminAction, isAdmin]
  );

  const updateWithdrawalStatus = useCallback(
    (withdrawalId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => {
      if (firestore && isAdmin) {
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
    [firestore, addBalance, logAdminAction, isAdmin]
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
