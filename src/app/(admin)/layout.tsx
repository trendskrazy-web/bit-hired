
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AdminLayout } from '@/components/admin/layout/admin-layout';
import { AccountProvider } from '@/contexts/account-context';
import { RedeemCodeProvider } from '@/contexts/redeem-code-context';

const SUPER_ADMIN_UID = 'GEGZNzOWg6bnU53iwJLzL5LaXwR2';

function AdminAuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const isSuperAdmin = user?.uid === SUPER_ADMIN_UID;

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || !isSuperAdmin) {
        router.push('/dashboard');
      }
    }
  }, [isUserLoading, user, isSuperAdmin, router]);

  if (isUserLoading || !user || !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
     <AccountProvider>
      <RedeemCodeProvider>
        <AdminLayout>{children}</AdminLayout>
      </RedeemCodeProvider>
    </AccountProvider>
  );
}


export default function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <AdminAuthenticatedLayoutContent>{children}</AdminAuthenticatedLayoutContent>
    </FirebaseClientProvider>
  );
}
