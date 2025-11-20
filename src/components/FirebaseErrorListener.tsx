
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error("Caught a permission error:", error);
      if (error instanceof FirestorePermissionError) {
        // In a real app, you might use a more sophisticated UI than a toast
        // For development, throwing the error makes it appear in the Next.js overlay
        if (process.env.NODE_ENV === 'development') {
           throw error;
        } else {
            toast({
                variant: "destructive",
                title: "Permission Denied",
                description: "You do not have permission to perform this action.",
            });
        }
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component doesn't render anything itself
}
