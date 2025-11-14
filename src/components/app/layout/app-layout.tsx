
'use client';

import {
  Bitcoin,
  Cpu,
  History,
  LayoutDashboard,
  Bell,
  User,
  Gift,
  WalletCards,
  Info,
  Settings,
  LogOut,
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
} from '@/components/ui/sidebar';
import { AppHeader } from './header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';

const menuItems = [
  { href: '/account', label: 'Account', icon: User },
  { href: '/hire', label: 'Hire Machines', icon: Cpu },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: History },
  { href: '/about', label: 'About', icon: Info },
];

const adminMenuItems = [
  { href: '/admin/deposits', label: 'Deposits', icon: WalletCards },
  { href: '/admin/redeem-codes', label: 'Redeem Codes', icon: Gift },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function AdminMenu() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="mt-auto">
      <SidebarMenuItem>
        <span className="text-xs text-muted-foreground px-2">Admin</span>
      </SidebarMenuItem>
      {adminMenuItems.map((item) => (
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
      ))}
    </SidebarMenu>
  );
}

function SidebarFooterContent() {
  const auth = useAuth();
  const handleLogout = () => {
    auth.signOut();
  };
  return (
    <>
    <div className="bg-primary/10 p-4 rounded-lg text-center space-y-2">
      <h4 className="font-semibold">Need Help?</h4>
      <p className="text-xs text-muted-foreground">
        Contact our support team for any questions.
      </p>
      <Button size="sm" className="w-full">
        Contact Support
      </Button>
    </div>
     <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Log Out
      </Button>
    </>
  )
}

export function AppLayout({ children, isAdmin }: { children: React.ReactNode, isAdmin: boolean }) {
  const pathname = usePathname();
  
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
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    item.href === '/dashboard'
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
                  }
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
            ))}
          </SidebarMenu>
          {isAdmin && <AdminMenu />}
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:hidden space-y-2">
         <SidebarFooterContent />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <AppHeader isAdmin={isAdmin} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
