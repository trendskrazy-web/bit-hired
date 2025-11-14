
"use client";

import { columns as hireColumns } from "@/components/app/transactions/columns";
import { columns as depositColumns } from "@/components/app/transactions/deposit-columns";
import { columns as withdrawalColumns } from "@/components/app/transactions/withdrawal-columns";
import { DataTable } from "@/components/app/transactions/data-table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "@/contexts/account-context";

export default function TransactionsPage() {
  const { transactions, deposits, withdrawals } = useAccount();

  const activeTransactions = transactions.filter((t) => t.status === "Active");
  const expiredTransactions = transactions.filter(
    (t) => t.status === "Expired"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">
          Transaction History
        </h1>
        <p className="text-muted-foreground">
          A log of all your account activities.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="hire-history">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hire-history">Hire History</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        <TabsContent value="hire-history">
           <DataTable
            columns={hireColumns}
            data={transactions}
            filterColumn="machineName"
            filterPlaceholder="Filter by machine..."
          />
        </TabsContent>
        <TabsContent value="deposits">
          <DataTable
            columns={depositColumns}
            data={deposits}
            filterColumn="status"
            filterPlaceholder="Filter by status..."
          />
        </TabsContent>
        <TabsContent value="withdrawals">
           <DataTable
            columns={withdrawalColumns}
            data={withdrawals}
            filterColumn="status"
            filterPlaceholder="Filter by status..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
