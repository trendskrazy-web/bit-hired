
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { UserAccount } from './account-context';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface AdminAccountContextType {
  allUsers: UserAccount[];
  isLoading: boolean;
}

const AdminAccountContext = createContext<AdminAccountContextType | undefined>(undefined);

export function AdminAccountProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();

  const SUPER_ADMIN_UID = 'F7hBfGV8QYhgZ7KXbcmThjlisuo2';

  useEffect(() => {
    if (user?.uid === SUPER_ADMIN_UID && firestore) {
      setIsLoading(true);
      const usersColRef = collection(firestore, 'users');
      const q = query(usersColRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount));
        setAllUsers(usersData);
        setIsLoading(false);
      }, (error) => {
        const permissionError = new FirestorePermissionError({ path: usersColRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setAllUsers([]);
      setIsLoading(false);
    }
  }, [user, firestore]);

  return (
    <AdminAccountContext.Provider value={{ allUsers, isLoading }}>
      {children}
    </AdminAccountContext.Provider>
  );
}

export function useAdminAccounts() {
  const context = useContext(AdminAccountContext);
  if (context === undefined) {
    throw new Error('useAdminAccounts must be used within an AdminAccountProvider');
  }
  return context;
}
