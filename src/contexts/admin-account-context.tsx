
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import type { UserAccount } from './account-context';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';


interface AdminAccountContextType {
  allUsers: UserAccount[];
}

const AdminAccountContext = createContext<AdminAccountContextType | undefined>(undefined);

export function AdminAccountProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const { user } = useUser();
  const firestore = useFirestore();

  const SUPER_ADMIN_UID = 'F7hBfGV8QYhgZ7KXbcmThjlisuo2';

  useEffect(() => {
    if (user?.uid !== SUPER_ADMIN_UID || !firestore) return;

    const usersColRef = collection(firestore, 'users');
    const unsubscribeAllUsers = onSnapshot(usersColRef, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount));
        setAllUsers(usersData);
    }, (error) => {
        const permissionError = new FirestorePermissionError({ path: usersColRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
    });

    return () => {
      unsubscribeAllUsers();
    };
  }, [user, firestore]);

  const contextValue = {
    allUsers,
  };

  return (
    <AdminAccountContext.Provider value={contextValue}>
      {children}
    </AdminAccountContext.Provider>
  );
}

export function useAdminAccount() {
  const context = useContext(AdminAccountContext);
  if (context === undefined) {
    throw new Error('useAdminAccount must be used within an AdminAccountProvider');
  }
  return context;
}

    