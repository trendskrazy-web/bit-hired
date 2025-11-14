
"use client";

import { columns as hireColumns } from "@/components/app/transactions/columns";
import { DataTable } from "@/components/app/transactions/data-table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "@/contexts/account-context";
import { depositColumns } from "@/components/app/transactions/deposit-columns";
import { withdrawalColumns } from "@/components/app/transactions/withdrawal-columns";

export default function TransactionsPage() {
  const { transactions, deposits, withdrawals } = useAccount();

  const activeTransactions = transactions.filter((t) => t.status === "Active");
  const expiredTransactions = transactions.filter(
    (t) => t.status === "Expired"
  );
  
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const completedDeposits = deposits.filter((d) => d.status === 'completed');
  const cancelledDeposits = deposits.filter((d) => d.status === 'cancelled');
  
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const completedWithdrawals = withdrawals.filter((w) => w.status === 'completed');
  const cancelledWithdrawals = withdrawals.filter((w) => w.status === 'cancelled');

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hiring">Hiring History</TabsTrigger>
          <TabsTrigger value="deposits">Deposit History</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
        </TabsList>
        <TabsContent value="hiring">
          <Tabs defaultValue="all" className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <DataTable
                columns={hireColumns}
                data={transactions}
                filterColumn="machineName"
                filterPlaceholder="Filter by machine..."
              />
            </TabsContent>
            <TabsContent value="active">
              <DataTable
                columns={hireColumns}
                data={activeTransactions}
                filterColumn="machineName"
                filterPlaceholder="Filter by machine..."
              />
            </TabsContent>
            <TabsContent value="expired">
              <DataTable
                columns={hireColumns}
                data={expiredTransactions}
                filterColumn="machineName"
                filterPlaceholder="Filter by machine..."
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="deposits">
             <Tabs defaultValue="all" className="mt-4">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <DataTable columns={depositColumns} data={deposits} filterColumn='transactionCode' filterPlaceholder='Filter by code...'/>
                </TabsContent>
                <TabsContent value="pending">
                    <DataTable columns={depositColumns} data={pendingDeposits} filterColumn='transactionCode' filterPlaceholder='Filter by code...'/>
                </TabsContent>
                <TabsContent value="completed">
                    <DataTable columns={depositColumns} data={completedDeposits} filterColumn='transactionCode' filterPlaceholder='Filter by code...'/>
                </TabsContent>
                <TabsContent value="cancelled">
                    <DataTable columns={depositColumns} data={cancelledDeposits} filterColumn='transactionCode' filterPlaceholder='Filter by code...'/>
                </TabsContent>
             </Tabs>
        </TabsContent>
        <TabsContent value="withdrawals">
             <Tabs defaultValue="all" className="mt-4">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <DataTable columns={withdrawalColumns} data={withdrawals} filterColumn='status' filterPlaceholder='Filter by status...'/>
                </TabsContent>
                <TabsContent value="pending">
                    <DataTable columns={withdrawalColumns} data={pendingWithdrawals} filterColumn='status' filterPlaceholder='Filter by status...'/>
                </TabsContent>
                <TabsContent value="completed">
                    <DataTable columns={withdrawalColumns} data={completedWithdrawals} filterColumn='status' filterPlaceholder='Filter by status...'/>
                </TabsContent>
                <TabsContent value="cancelled">
                    <DataTable columns={withdrawalColumns} data={cancelledWithdrawals} filterColumn='status' filterPlaceholder='Filter by status...'/>
                </TabsContent>
             </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
