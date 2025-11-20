
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationBell } from './notification-bell';
import { UserNav } from './user-nav';
import { useUser } from '@/firebase';

// This is a hardcoded UID for the super admin.
const SUPER_ADMIN_UID = 'F7hBfGV8QYhgZ7KXbcmThjlisuo2';

export function AppHeader() {
  const { user } = useUser();
  const isAdmin = user?.uid === SUPER_ADMIN_UID;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add a global search bar here if needed */}
      </div>
      {isAdmin && <NotificationBell />}
      <UserNav />
    </header>
  );
}
