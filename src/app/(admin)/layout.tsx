
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AdminLayout } from '@/components/admin/layout/admin-layout';
import { AccountProvider } from '@/contexts/account-context';
import { RedeemCodeProvider } from '@/contexts/redeem-code-context';

function AdminAuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading, isAdmin } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [isUserLoading, user, isAdmin, router]);

  if (isUserLoading || !user || !isAdmin) {
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
