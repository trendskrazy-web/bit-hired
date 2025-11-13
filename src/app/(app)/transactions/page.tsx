"use client";

import { columns as hireColumns } from "@/components/app/transactions/columns";
import { columns as depositColumns } from "@/components/app/transactions/deposit-columns";
import { DataTable } from "@/components/app/transactions/data-table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "@/contexts/account-context";

export default function TransactionsPage() {
  const { transactions, deposits } = useAccount();

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
      <Tabs defaultValue="hiring">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hiring">Hiring History</TabsTrigger>
          <TabsTrigger value="deposits">Deposit History</TabsTrigger>
        </TabsList>
        <TabsContent value="hiring">
            <Tabs defaultValue="all" className="mt-4">
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                <DataTable columns={hireColumns} data={transactions} filterColumn="machineName" filterPlaceholder="Filter by machine..." />
            </TabsContent>
            <TabsContent value="active">
                <DataTable columns={hireColumns} data={activeTransactions} filterColumn="machineName" filterPlaceholder="Filter by machine..." />
            </TabsContent>
            <TabsContent value="expired">
                <DataTable columns={hireColumns} data={expiredTransactions} filterColumn="machineName" filterPlaceholder="Filter by machine..." />
            </TabsContent>
            </Tabs>
        </TabsContent>
        <TabsContent value="deposits">
            <DataTable columns={depositColumns} data={deposits} filterColumn="transactionCode" filterPlaceholder="Filter by code..." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
