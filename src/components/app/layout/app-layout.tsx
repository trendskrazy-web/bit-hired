"use client";

import {
  Bitcoin,
  Cpu,
  History,
  LayoutDashboard,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
} from "@/components/ui/sidebar";
import { AppHeader } from "./header";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hire", label: "Hire Machines", icon: Cpu },
  { href: "/transactions", label: "Transactions", icon: History },
  { href: "/account", label: "Account", icon: User },
];

const adminMenuItems = [
    { href: "/admin/redeem-codes", label: "Redeem Codes", icon: ShieldCheck },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

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
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
                  }
                  tooltip={{
                    children: item.label,
                    className: "bg-sidebar-background text-sidebar-foreground",
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
          {isAdminRoute && (
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
                      className: "bg-sidebar-background text-sidebar-foreground",
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
          )}
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:hidden">
          <div className="bg-primary/10 p-4 rounded-lg text-center space-y-2">
            <h4 className="font-semibold">Need Help?</h4>
            <p className="text-xs text-muted-foreground">
              Contact our support team for any questions.
            </p>
            <Button size="sm" className="w-full">
              Contact Support
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
