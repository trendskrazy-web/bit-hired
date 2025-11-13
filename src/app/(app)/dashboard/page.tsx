"use client";

import { ActiveMachineCard } from "@/components/app/dashboard/active-machine-card";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/contexts/account-context";

export default function DashboardPage() {
  const { transactions } = useAccount();
  const activeTransactions = transactions.filter(
    (t) => t.status === "Active"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your mining operations.
        </p>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-1">
        <h2 className="text-xl font-headline font-bold">Active Machines</h2>
        {activeTransactions.length > 0 ? (
          activeTransactions.map((transaction) => (
            <ActiveMachineCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <p className="text-muted-foreground">
            You have no active mining machines.
          </p>
        )}
      </div>
    </div>
  );
}
