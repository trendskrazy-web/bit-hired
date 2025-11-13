
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type { Transaction, Deposit, DepositTransaction } from '@/lib/data';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, onSnapshot, increment, query, where, orderBy, writeBatch, getDocs } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePathname } from 'next/navigation';
import { deleteUser } from 'firebase/auth';

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
  allDeposits: DepositTransaction[];
  mobileNumber: string;
  deleteUserAccount: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<DepositTransaction[]>([]);
  const [allDeposits, setAllDeposits] = useState<DepositTransaction[]>([]);
  const [mobileNumber, setMobileNumber] = useState('');

  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    if (user && firestore) {
      // User-specific data listeners
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribeUser = onSnapshot(
        userDocRef,
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setBalance(userData.virtualBalance || 0);
            setMobileNumber(userData.mobileNumber || '');
          }
        },
        (error) => {
          const permissionError = new FirestorePermissionError({ path: userDocRef.path, operation: 'get' });
          errorEmitter.emit('permission-error', permissionError);
        }
      );

      const rentalsColRef = collection(firestore, 'users', user.uid, 'rentals');
      const unsubscribeRentals = onSnapshot(
        rentalsColRef,
        (snapshot) => {
          const rentalData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction));
          setTransactions(rentalData);
        },
        (error) => {
          const permissionError = new FirestorePermissionError({ path: rentalsColRef.path, operation: 'list' });
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      
      const userDepositsQuery = query(collection(firestore, 'deposit_transactions'), where('userAccountId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubscribeUserDeposits = onSnapshot(
        userDepositsQuery,
        (snapshot) => {
          const depositData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DepositTransaction));
          setDeposits(depositData);
        },
        (error) => {
           const permissionError = new FirestorePermissionError({ path: `deposit_transactions where userAccountId == ${user.uid}`, operation: 'list' });
           errorEmitter.emit('permission-error', permissionError);
        }
      );

      // Admin-specific data listener
      let unsubscribeAllDeposits = () => {};
      if (isAdminPage) {
        const allDepositsQuery = query(collection(firestore, 'deposit_transactions'), orderBy('createdAt', 'desc'));
        unsubscribeAllDeposits = onSnapshot(allDepositsQuery, (snapshot) => {
            const allDepositData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepositTransaction));
            setAllDeposits(allDepositData);
            setPendingDeposits(allDepositData.filter(d => d.status === 'pending'));
        }, (error) => {
            const permissionError = new FirestorePermissionError({ path: 'deposit_transactions', operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
        });
      } else {
        // Clear admin data when not on an admin page
        setAllDeposits([]);
        setPendingDeposits([]);
      }

      return () => {
        unsubscribeUser();
        unsubscribeRentals();
        unsubscribeUserDeposits();
        unsubscribeAllDeposits();
      };
    }
  }, [user, firestore, isAdminPage, pathname]);

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
  
  const deleteUserAccount = async () => {
    if (!user || !firestore) {
      throw new Error("User not authenticated or Firestore not available.");
    }
    const userId = user.uid;

    // Use a batch to delete all documents atomically.
    const batch = writeBatch(firestore);

    // 1. Delete user's rental documents
    const rentalsRef = collection(firestore, 'users', userId, 'rentals');
    const rentalsSnapshot = await getDocs(rentalsRef);
    rentalsSnapshot.forEach(doc => batch.delete(doc.ref));

    // 2. Delete user's deposit transactions
    const depositsQuery = query(collection(firestore, 'deposit_transactions'), where('userAccountId', '==', userId));
    const depositsSnapshot = await getDocs(depositsQuery);
    depositsSnapshot.forEach(doc => batch.delete(doc.ref));

    // 3. Delete the main user document
    const userDocRef = doc(firestore, 'users', userId);
    batch.delete(userDocRef);
    
    // Commit the batch
    await batch.commit();

    // 4. Finally, delete the user from Firebase Authentication
    await deleteUser(user);
  };

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
        allDeposits,
        mobileNumber,
        deleteUserAccount,
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
