'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { AdminLayout } from './admin/layout';
import { RedeemCodeProvider } from '@/contexts/redeem-code-context';
import { TransactionProvider } from '@/contexts/transaction-context';
import { AccountProvider } from '@/contexts/account-context';
import { AdminAccountProvider } from '@/contexts/admin-account-context';
import { MessageProvider } from '@/contexts/message-context';

// This is a hardcoded UID for the super admin.
// In a real-world application, you would use a more robust role-based access control system,
// like Firebase Custom Claims.
const SUPER_ADMIN_UID = 'F7hBfGV8QYhgZ7KXbcmThjlisuo2';

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If the user is not logged in or is not the super admin, redirect them.
  if (!user || user.uid !== SUPER_ADMIN_UID) {
    redirect('/dashboard');
    return null; // Return null to prevent rendering children during redirect
  }

  // If the user is the super admin, render the admin layout.
  return (
    <AccountProvider>
      <AdminAccountProvider>
        <TransactionProvider>
          <RedeemCodeProvider>
            <MessageProvider>
              <AdminLayout>{children}</AdminLayout>
            </MessageProvider>
          </RedeemCodeProvider>
        </TransactionProvider>
      </AdminAccountProvider>
    </AccountProvider>
  );
}
