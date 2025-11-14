
'use client';

import { AppLayout } from '@/components/app/layout/app-layout';
import { AccountProvider } from '@/contexts/account-context';
import { RedeemCodeProvider } from '@/contexts/redeem-code-context';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AccountProvider>
      <RedeemCodeProvider>
        <AppLayout>{children}</AppLayout>
      </RedeemCodeProvider>
    </AccountProvider>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No need for FirebaseClientProvider here as it's handled at the root and in the admin layout
  return <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>;
}
