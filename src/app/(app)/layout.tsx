import { AppLayout } from "@/components/app/layout/app-layout";
import { AccountProvider } from "@/contexts/account-context";
import { RedeemCodeProvider } from "@/contexts/redeem-code-context";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountProvider>
      <RedeemCodeProvider>
        <AppLayout>{children}</AppLayout>
      </RedeemCodeProvider>
    </AccountProvider>
  );
}
