
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
import { collection, doc, onSnapshot, increment, query, where, setDoc } from 'firebase/firestore';
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
  // User specific
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  // Admin specific
  allDeposits: Deposit[];
  allWithdrawals: Withdrawal[];
  addDepositRequest: (amount: number, transactionCode: string, depositTo: string) => void;
  addWithdrawalRequest: (amount: number) => void;
  updateDepositStatus: (depositId: string, status: 'completed' | 'cancelled') => void;
  updateWithdrawalStatus: (withdrawalId: string, status: 'completed' | 'cancelled') => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // User-specific transaction states
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Admin-specific transaction states
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);


  const { user } = useUser();
  const firestore = useFirestore();
  const isAdmin = user?.uid === 'GEGZNzOWg6bnU53iwJLzL5LaXwR2';

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
    
    // Listen to all deposits and withdrawals for admin, and then filter for user
    const depositsQuery = query(collection(firestore, 'deposit_transactions'));
    const unsubscribeDeposits = onSnapshot(depositsQuery, (snapshot) => {
        const allDepositData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deposit));
        if (isAdmin) {
          setAllDeposits(allDepositData);
        }
        setDeposits(allDepositData.filter(d => d.userAccountId === user.uid));
    }, (error) => {
       const permissionError = new FirestorePermissionError({ path: 'deposit_transactions', operation: 'list' });
       errorEmitter.emit('permission-error', permissionError);
    });

    const withdrawalsQuery = query(collection(firestore, 'withdrawal_transactions'));
    const unsubscribeWithdrawals = onSnapshot(withdrawalsQuery, (snapshot) => {
        const allWithdrawalData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Withdrawal));
        if (isAdmin) {
          setAllWithdrawals(allWithdrawalData);
        }
        setWithdrawals(allWithdrawalData.filter(w => w.userAccountId === user.uid));
    }, (error) => {
       const permissionError = new FirestorePermissionError({ path: 'withdrawal_transactions', operation: 'list' });
       errorEmitter.emit('permission-error', permissionError);
    });

    return () => {
      unsubscribeUser();
      unsubscribeRentals();
      unsubscribeDeposits();
      unsubscribeWithdrawals();
    };
  }, [user, firestore, isAdmin]);

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

  const addDepositRequest = (amount: number, transactionCode: string, depositTo: string) => {
    if (user && firestore && mobileNumber) {
      const depositsColRef = collection(firestore, 'deposit_transactions');
      addDocumentNonBlocking(depositsColRef, {
        userAccountId: user.uid,
        amount,
        transactionCode,
        status: 'pending',
        createdAt: new Date().toISOString(),
        mobileNumber: mobileNumber,
        depositTo: depositTo,
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
      const withdrawalsColRef = collection(firestore, 'withdrawal_transactions');
      addDocumentNonBlocking(withdrawalsColRef, {
        userAccountId: user.uid,
        amount,
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
      if (firestore) {
        const depositDocRef = doc(firestore, 'deposit_transactions', depositId);
        
        if (status === 'completed') {
            const deposit = allDeposits.find(d => d.id === depositId);
            if (deposit) {
                 addBalance(deposit.amount, deposit.userAccountId);
            }
        }
        updateDocumentNonBlocking(depositDocRef, { status });
      }
    },
    [firestore, allDeposits, addBalance]
  );

  const updateWithdrawalStatus = useCallback(
    (withdrawalId: string, status: 'completed' | 'cancelled') => {
        if (firestore) {
            const withdrawalDocRef = doc(firestore, 'withdrawal_transactions', withdrawalId);
            if(status === 'cancelled') {
                const withdrawal = allWithdrawals.find(w => w.id === withdrawalId);
                if(withdrawal) {
                    // Refund the user if the withdrawal is cancelled
                    addBalance(withdrawal.amount, withdrawal.userAccountId);
                }
            }
            updateDocumentNonBlocking(withdrawalDocRef, { status });
        }
    },
    [firestore, allWithdrawals, addBalance]
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
        withdrawals,
        allDeposits,
        allWithdrawals,
        addDepositRequest,
        addWithdrawalRequest,
        updateDepositStatus,
        updateWithdrawalStatus,
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
