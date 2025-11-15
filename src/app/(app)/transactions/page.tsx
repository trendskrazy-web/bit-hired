
"use client";

import { columns as hireColumns } from "@/components/app/transactions/hire-columns";
import { DataTable } from "@/components/app/transactions/data-table";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/contexts/account-context";

export default function TransactionsPage() {
  const { transactions } = useAccount();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">
          Hire History
        </h1>
        <p className="text-muted-foreground">
          A log of all your machine hire activities.
        </p>
      </div>
      <Separator />
      <DataTable
        columns={hireColumns}
        data={transactions}
        filterColumn="machineName"
        filterPlaceholder="Filter by machine..."
      />
    </div>
  );
}
