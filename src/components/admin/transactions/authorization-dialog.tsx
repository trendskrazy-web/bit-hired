
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Deposit, Withdrawal } from '@/contexts/transaction-context';

// This is a hardcoded auth code for demonstration purposes.
// In a real application, this should be handled securely (e.g., environment variables, a backend check).
const ADMIN_AUTH_CODE = 'BITHIREDADMIN24';

export interface AuthAction<T> {
  item: T;
  newStatus: 'completed' | 'cancelled';
}

interface AuthorizationDialogProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (isAuthorized: boolean) => void;
  action: AuthAction<T> | null;
  itemType: 'deposit' | 'withdrawal';
}

export function AuthorizationDialog<T extends Deposit | Withdrawal>({
  isOpen,
  onClose,
  onConfirm,
  action,
  itemType,
}: AuthorizationDialogProps<T>) {
  const [authCode, setAuthCode] = useState('');
  const { toast } = useToast();

  if (!action) return null;

  const handleConfirm = () => {
    if (authCode === ADMIN_AUTH_CODE) {
      onConfirm(true);
      toast({
        title: 'Authorized',
        description: `The ${itemType} has been ${action.newStatus}.`,
      });
    } else {
      onConfirm(false);
      toast({
        title: 'Authorization Failed',
        description: 'The authorization code is incorrect.',
        variant: 'destructive',
      });
    }
    setAuthCode(''); // Clear code after attempt
  };

  const handleCancel = () => {
    setAuthCode('');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Admin Authorization Required
          </AlertDialogTitle>
          <AlertDialogDescription>
            To{' '}
            <span
              className={
                action.newStatus === 'completed'
                  ? 'font-bold text-green-500'
                  : 'font-bold text-red-500'
              }
            >
              {action.newStatus === 'completed' ? 'Approve' : 'Decline'}
            </span>{' '}
            this {itemType} of KES {action.item.amount.toLocaleString()}, please enter your
            authorization code.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="auth-code">Authorization Code</Label>
          <Input
            id="auth-code"
            type="password"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            placeholder="Enter your secret code"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm Action</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
