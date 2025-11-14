
"use client";

import { columns as hireColumns } from "@/components/app/transactions/columns";
import { DataTable } from "@/components/app/transactions/data-table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "@/contexts/account-context";

export default function TransactionsPage() {
  const { transactions } = useAccount();

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
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="hire-history">Hire History</TabsTrigger>
        </TabsList>
        <TabsContent value="hire-history">
           <DataTable
            columns={hireColumns}
            data={transactions}
            filterColumn="machineName"
            filterPlaceholder="Filter by machine..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
