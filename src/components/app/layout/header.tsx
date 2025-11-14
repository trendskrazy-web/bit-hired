'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';

export function AppHeader({ isAdmin }: { isAdmin: boolean }) {

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add a global search bar here if needed */}
      </div>
      <UserNav />
    </header>
  );
}
