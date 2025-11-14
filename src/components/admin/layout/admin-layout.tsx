
'use client';

import {
  Bitcoin,
  Cpu,
  History,
  LayoutDashboard,
  User,
  Info,
  LogOut,
  Bell,
  Shield,
  Gift,
  Settings,
  DatabaseZap,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app/layout/header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';

const adminMenuItems = [
  { href: '/admin/redeem-codes', label: 'Redeem Codes', icon: Gift },
];

const userMenuItems = [
  { href: '/account', label: 'Account', icon: User },
  { href: '/hire', label: 'Hire Machines', icon: Cpu },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: History },
  { href: '/about', label: 'About', icon: Info },
];

function SidebarFooterContent() {
  const auth = useAuth();
  const handleLogout = () => {
    // Also clear the admin flag from local storage on logout
    localStorage.removeItem('isAdmin');
    auth.signOut();
  };
  return (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log Out
      </Button>
    </>
  );
}

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const renderMenuItems = (items: typeof userMenuItems) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith(item.href)}
          tooltip={{
            children: item.label,
            className: 'bg-sidebar-background text-sidebar-foreground',
          }}
        >
          <Link href={item.href}>
            <item.icon />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };
  
    const renderAdminMenuItems = (items: typeof adminMenuItems) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith(item.href)}
          tooltip={{
            children: item.label,
            className: 'bg-sidebar-background text-sidebar-foreground',
          }}
        >
          <Link href={item.href}>
            <item.icon />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r" side="left" variant="sidebar">
        <SidebarHeader>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 py-2 font-headline text-lg font-semibold"
          >
            <Bitcoin className="h-6 w-6 text-primary" />
            <span>BitHired</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <div className="px-2 text-xs font-medium text-muted-foreground">Admin</div>
                </SidebarMenuItem>
                {renderAdminMenuItems(adminMenuItems)}
            </SidebarMenu>
            <SidebarSeparator />
            <SidebarMenu>
                 <SidebarMenuItem>
                    <div className="px-2 text-xs font-medium text-muted-foreground">User</div>
                </SidebarMenuItem>
                {renderMenuItems(userMenuItems)}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:hidden space-y-2">
          <SidebarFooterContent />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
