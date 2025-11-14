
'use client';

import { AppLayout } from '@/components/app/layout/app-layout';
import { AccountProvider } from '@/contexts/account-context';
import { RedeemCodeProvider } from '@/contexts/redeem-code-context';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';

function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, isAdmin } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    // Redirect non-admins away from admin pages
    if (!isUserLoading && user && !isAdmin && pathname.startsWith('/admin')) {
      router.push('/dashboard');
    }
  }, [isUserLoading, user, router, isAdmin, pathname]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AccountProvider isAdmin={isAdmin}>
      <RedeemCodeProvider>
        <AppLayout isAdmin={isAdmin}>{children}</AppLayout>
      </RedeemCodeProvider>
    </AccountProvider>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </FirebaseClientProvider>
  );
}
