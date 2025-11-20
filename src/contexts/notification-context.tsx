
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import {
  useFirestore,
  useUser,
  updateDocumentNonBlocking,
} from "@/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  collectionGroup,
} from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  adminId: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markNotificationsAsRead: (notificationIds: string[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const SUPER_ADMIN_UID = 'F7hBfGV8QYhgZ7KXbcmThjlisuo2';

  useEffect(() => {
    if (user?.uid === SUPER_ADMIN_UID && firestore) {
      const notifsColRef = collectionGroup(firestore, 'notifications');
      const q = query(notifsColRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(notifsData);
      }, (error) => {
        const permissionError = new FirestorePermissionError({ path: 'notifications', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

      return () => unsubscribe();
    }
  }, [user, firestore]);
  
  const markNotificationsAsRead = useCallback((notificationIds: string[]) => {
      if (!firestore || notificationIds.length === 0) return;

      notificationIds.forEach(id => {
          const notifDocRef = doc(firestore, 'notifications', id);
          updateDocumentNonBlocking(notifDocRef, { read: true });
      });
  }, [firestore]);


  return (
    <NotificationContext.Provider value={{ notifications, markNotificationsAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
