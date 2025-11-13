
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type { Transaction, Deposit, DepositTransaction, Notification } from '@/lib/data';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, onSnapshot, increment, query, where, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePathname } from 'next/navigation';

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
  addDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  addDepositRequest: (amount: number, mobileNumber: string) => Promise<DepositTransaction>;
  pendingDeposits: DepositTransaction[];
  approveDeposit: (depositId: string, userId: string, amount: number) => void;
  declineDeposit: (depositId: string, reason?: string) => void;
  allDeposits: DepositTransaction[];
  notifications: Notification[];
  mobileNumber: string;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const AUTO_DECLINE_MINUTES = 20;

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<DepositTransaction[]>([]);
  const [allDeposits, setAllDeposits] = useState<DepositTransaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mobileNumber, setMobileNumber] = useState('');

  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const declineDeposit = useCallback((depositId: string, reason: string = 'Declined by admin.') => {
    if (!firestore) return;
    const depositDocRef = doc(firestore, 'deposit_transactions', depositId);
    updateDocumentNonBlocking(depositDocRef, { status: 'cancelled' });
    
    // The notification creation is now inside declineDeposit
    if (!firestore || !user) return;
    const notificationsColRef = collection(firestore, 'notifications');
    const message = reason === 'auto-declined' 
      ? `Automatically declined deposit request ${depositId} (expired).`
      : `Declined deposit request ${depositId}.`;
    addDocumentNonBlocking(notificationsColRef, {
      message,
      read: false,
      createdAt: new Date().toISOString(),
      adminId: user.uid,
    });
  }, [firestore, user]);


  useEffect(() => {
    if (!user || !firestore) return;

    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setBalance(userData.virtualBalance || 0);
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

    const userDepositsQuery = query(collection(firestore, 'deposit_transactions'), where('userAccountId', '==', user.uid));
    const unsubscribeUserDeposits = onSnapshot(userDepositsQuery, (snapshot) => {
      const depositData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DepositTransaction));
      setDeposits(depositData);
    }, (error) => {
       const permissionError = new FirestorePermissionError({ path: `deposit_transactions where userAccountId == ${user.uid}`, operation: 'list' });
       errorEmitter.emit('permission-error', permissionError);
    });
    
    let unsubAllDeposits = () => {};
    let unsubNotifications = () => {};

    if (isAdminPage) {
      const allDepositsQuery = query(collection(firestore, 'deposit_transactions'), orderBy('createdAt', 'desc'));
      unsubAllDeposits = onSnapshot(allDepositsQuery, (snapshot) => {
        const allDepositData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepositTransaction));
        setAllDeposits(allDepositData);

        const now = new Date();
        const pending = allDepositData.filter(d => {
          if (d.status !== 'pending') return false;
          
          const createdAt = new Date(d.createdAt);
          const timeDiffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

          if (timeDiffMinutes > AUTO_DECLINE_MINUTES) {
            // This transaction is expired, so auto-decline it.
            declineDeposit(d.id, 'auto-declined');
            return false; // Exclude it from the pending list UI
          }
          return true;
        });

        setPendingDeposits(pending);

      }, (error) => {
        const permissionError = new FirestorePermissionError({ path: 'deposit_transactions', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

      const notificationsQuery = query(collection(firestore, 'notifications'), orderBy('createdAt', 'desc'));
      unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(notificationsData);
      }, (error) => {
        const permissionError = new FirestorePermissionError({ path: 'notifications', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

    }

    return () => {
      unsubscribeUser();
      unsubscribeRentals();
      unsubscribeUserDeposits();
      unsubAllDeposits();
      unsubNotifications();
    };
  }, [user, firestore, isAdminPage, declineDeposit]);

  const createNotification = (message: string) => {
    if (!firestore || !user) return;
    const notificationsColRef = collection(firestore, 'notifications');
    addDocumentNonBlocking(notificationsColRef, {
      message,
      read: false,
      createdAt: new Date().toISOString(),
      adminId: user.uid,
    });
  };

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

  const addDeposit = (deposit: Omit<Deposit, 'id'>) => {
     // This function is deprecated
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
    
    return { id: docRef.id, ...newDeposit };
  };

  const approveDeposit = (depositId: string, userId: string, amount: number) => {
    if (!firestore) return;
    const depositDocRef = doc(firestore, 'deposit_transactions', depositId);
    updateDocumentNonBlocking(depositDocRef, { status: 'completed' });
    updateUserBalance(amount, userId);
    createNotification(`Approved deposit of KES ${amount} for user ${userId}.`);
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
        addDeposit,
        addDepositRequest,
        pendingDeposits,
        approveDeposit,
        declineDeposit,
        allDeposits,
        notifications,
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
