"use client";

import { columns } from "@/components/app/transactions/columns";
import { DataTable } from "@/components/app/transactions/data-table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "@/contexts/account-context";

export default function TransactionsPage() {
  const { transactions } = useAccount();

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
          A log of all your mining machine hiring activities.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable columns={columns} data={transactions} />
        </TabsContent>
        <TabsContent value="active">
          <DataTable columns={columns} data={activeTransactions} />
        </TabsContent>
        <TabsContent value="expired">
          <DataTable columns={columns} data={expiredTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
