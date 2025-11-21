
'use client';

import {
  Bitcoin,
  LogOut,
  Users,
  KeyRound,
  History,
  ArrowDownToDot,
  ArrowUpFromDot,
  CheckSquare,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app/layout/header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const adminMenuItems = [
  { href: '/admin/redeem-codes', label: 'Redeem Codes', icon: KeyRound },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/history', label: 'Admin History', icon: History },
];

function SidebarFooterContent() {
  const auth = useAuth();
  const handleLogout = () => {
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

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();
    const isApprovalsActive = pathname.startsWith('/admin/deposits') || pathname.startsWith('/admin/withdrawals');
    
    const handleLinkClick = () => {
      setOpenMobile(false);
    };

    return (
        <>
            <Sidebar className="border-r" side="left" variant="sidebar">
                <SidebarHeader>
                <Link
                    href="/admin"
                    className="flex items-center gap-2 py-2 font-headline text-lg font-semibold"
                    onClick={handleLinkClick}
                >
                    <Bitcoin className="h-6 w-6 text-primary" />
                    <span>BitHired Admin</span>
                </Link>
                </SidebarHeader>
                <SidebarContent>
                <SidebarMenu>
                    <Collapsible defaultOpen={isApprovalsActive}>
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                    className="w-full"
                                    isActive={isApprovalsActive}
                                    tooltip={{
                                        children: 'Approvals',
                                        className: 'bg-sidebar-background text-sidebar-foreground',
                                    }}
                                >
                                    <CheckSquare />
                                    <span>Approvals</span>
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                        </SidebarMenuItem>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                <SidebarMenuItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.startsWith('/admin/deposits')}>
                                        <Link href="/admin/deposits" onClick={handleLinkClick}>
                                            <ArrowDownToDot />
                                            <span>Deposits</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.startsWith('/admin/withdrawals')}>
                                        <Link href="/admin/withdrawals" onClick={handleLinkClick}>
                                            <ArrowUpFromDot />
                                            <span>Withdrawals</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuItem>
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>

                    {adminMenuItems.map((item, index) => (
                    <SidebarMenuItem key={index}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith(item.href!)}
                            tooltip={{
                                children: item.label,
                                className: 'bg-sidebar-background text-sidebar-foreground',
                            }}
                        >
                            <Link href={item.href!} onClick={handleLinkClick}>
                            <item.icon />
                            <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))}
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
        </>
    )
}

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
