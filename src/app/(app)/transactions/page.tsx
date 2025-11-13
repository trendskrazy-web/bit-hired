"use client";

import { columns } from "@/components/app/transactions/columns";
import { DataTable } from "@/components/app/transactions/data-table";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/contexts/account-context";

export default function TransactionsPage() {
  const { transactions } = useAccount();

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-headline font-bold">Transaction History</h1>
        <p className="text-muted-foreground">
          A log of all your mining machine hiring activities.
        </p>
      </div>
      <Separator />
      <DataTable columns={columns} data={transactions} />
    </div>
  );
}
