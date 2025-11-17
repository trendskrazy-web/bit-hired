
'use client';

import {
  Bitcoin,
  Cpu,
  History,
  LayoutDashboard,
  User,
  Info,
  LogOut,
  Share2,
  CreditCard,
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
  useSidebar,
} from '@/components/ui/sidebar';
import { AppHeader } from './header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';

const userMenuItems = [
  { href: '/account', label: 'Billing', icon: CreditCard },
  { href: '/hire', label: 'Hire Machines', icon: Cpu },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: History },
  { href: '/invite', label: 'Invite', icon: Share2 },
  { href: '/about', label: 'About', icon: Info },
];

function SidebarFooterContent() {
  const auth = useAuth();
  const handleLogout = () => {
    auth.signOut();
  };

  const supportNumber = '254706541646';
  const whatsappUrl = `https://wa.me/${supportNumber}`;

  return (
    <>
      <div className="bg-primary/10 p-4 rounded-lg text-center space-y-2">
        <h4 className="font-semibold">Need Help?</h4>
        <p className="text-xs text-muted-foreground">
          Contact our support team for any questions.
        </p>
        <Button size="sm" className="w-full" asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Contact Support
          </a>
        </Button>
      </div>
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

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const renderMenuItems = (items: typeof userMenuItems) => {
    return items.map((item) => (
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
          <Link href={item.href} onClick={handleLinkClick}>
            <item.icon />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <>
      <Sidebar className="border-r" side="left" variant="sidebar">
        <SidebarHeader>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 py-2 font-headline text-lg font-semibold"
            onClick={handleLinkClick}
          >
            <Bitcoin className="h-6 w-6 text-primary" />
            <span>BitHired</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>{renderMenuItems(userMenuItems)}</SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:hidden space-y-2">
          <SidebarFooterContent />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </SidebarInset>
    </>
  );
}

export function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
