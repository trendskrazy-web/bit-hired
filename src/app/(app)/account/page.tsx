
"use client";

import { WithdrawCard } from "@/components/app/account/withdraw-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/contexts/account-context";
import { RedeemCodeCard } from "@/components/app/account/redeem-code-card";
import { useUser } from "@/firebase";
import { DepositCard } from "@/components/app/account/deposit-card";
import { RecentTransactionsCard } from "@/components/app/account/recent-transactions-card";
import { useTransactions } from "@/contexts/transaction-context";
import { InviteCard } from "@/components/app/account/invite-card";

export default function AccountPage() {
  const { balance, mobileNumber, name, email, referralCode } = useAccount();
  const { user } = useUser();
  const { deposits, withdrawals } = useTransactions();

  // Get the last 5 transactions for display
  const recentDeposits = deposits.slice(0, 5);
  const recentWithdrawals = withdrawals.slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Account</h1>
        <p className="text-muted-foreground">
          Manage your account settings and fund your wallet.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{name}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mobile Number</span>
                <span className="font-medium">{mobileNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Balance</span>
                <span className="font-medium text-primary">
                  KES {balance.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
           <RecentTransactionsCard title="Recent Deposits" transactions={recentDeposits} type="deposit" />
           <RecentTransactionsCard title="Recent Withdrawals" transactions={recentWithdrawals} type="withdrawal" />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <InviteCard referralCode={referralCode} />
          <DepositCard />
          <WithdrawCard
            accountBalance={balance}
          />
          <RedeemCodeCard />
        </div>
      </div>
    </div>
  );
}
