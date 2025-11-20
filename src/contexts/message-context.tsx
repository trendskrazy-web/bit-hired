
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
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

export interface UserMessage {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
  userId: string;
}

interface MessageContextType {
  messages: UserMessage[];
  unreadCount: number;
  markMessageAsRead: (messageId: string) => void;
  sendMessage: (userId: string, title: string, content: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);

export function MessageProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch messages for the logged-in user
  useEffect(() => {
    if (user && firestore) {
      const messagesColRef = collection(firestore, `users/${user.uid}/messages`);
      const q = query(messagesColRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserMessage));
        setMessages(userMessages);
        const unread = userMessages.filter(msg => !msg.read).length;
        setUnreadCount(unread);
      }, (error) => {
        const permissionError = new FirestorePermissionError({ path: messagesColRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

      return () => unsubscribe();
    }
  }, [user, firestore]);

  const markMessageAsRead = useCallback((messageId: string) => {
    if (user && firestore) {
      const messageDocRef = doc(firestore, `users/${user.uid}/messages`, messageId);
      updateDocumentNonBlocking(messageDocRef, { read: true });
    }
  }, [user, firestore]);

  const sendMessage = useCallback(async (userId: string, title: string, content: string) => {
    if (firestore) {
      const messageColRef = collection(firestore, `users/${userId}/messages`);
      const messageData = {
        title,
        content,
        userId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await addDocumentNonBlocking(messageColRef, messageData);
    }
  }, [firestore]);


  return (
    <MessageContext.Provider value={{ messages, unreadCount, markMessageAsRead, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
}
