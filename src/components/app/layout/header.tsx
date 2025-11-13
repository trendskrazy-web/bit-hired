'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { NotificationMenu } from './notification-menu';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AppHeader() {
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    setIsAdminRoute(pathname.startsWith('/admin'));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add a global search bar here if needed */}
      </div>
      {isAdminRoute && <NotificationMenu />}
      <UserNav />
    </header>
  );
}
