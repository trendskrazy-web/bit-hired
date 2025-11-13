import { AppLayout } from "@/components/app/layout/app-layout";
import { AccountProvider } from "@/contexts/account-context";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountProvider>
      <AppLayout>{children}</AppLayout>
    </AccountProvider>
  );
}
