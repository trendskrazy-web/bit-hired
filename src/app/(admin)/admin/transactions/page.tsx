
'use client';

import { useAccount } from '@/contexts/account-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/admin/transactions/data-table';
import { depositColumns } from '@/components/admin/transactions/deposit-columns';
import { withdrawalColumns } from '@/components/admin/transactions/withdrawal-columns';

export default function AdminTransactionsPage() {
  const { allDeposits, allWithdrawals } = useAccount();

  const pendingDeposits = allDeposits.filter((d) => d.status === 'pending');
  const completedDeposits = allDeposits.filter((d) => d.status === 'completed');
  const cancelledDeposits = allDeposits.filter((d) => d.status === 'cancelled');

  const pendingWithdrawals = allWithdrawals.filter((w) => w.status === 'pending');
  const completedWithdrawals = allWithdrawals.filter((w) => w.status === 'completed');
  const cancelledWithdrawals = allWithdrawals.filter((w) => w.status === 'cancelled');


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-headline font-bold">Manage Transactions</h1>
       <Tabs defaultValue="deposits">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        <TabsContent value="deposits">
            <Tabs defaultValue="pending" className="mt-4">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingDeposits.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                     <DataTable columns={depositColumns} data={pendingDeposits} filterColumn='mobileNumber' filterPlaceholder='Filter by mobile number...' />
                </TabsContent>
                 <TabsContent value="completed">
                     <DataTable columns={depositColumns} data={completedDeposits} filterColumn='mobileNumber' filterPlaceholder='Filter by mobile number...' />
                </TabsContent>
                 <TabsContent value="cancelled">
                     <DataTable columns={depositColumns} data={cancelledDeposits} filterColumn='mobileNumber' filterPlaceholder='Filter by mobile number...' />
                </TabsContent>
                <TabsContent value="all">
                    <DataTable columns={depositColumns} data={allDeposits} filterColumn='mobileNumber' filterPlaceholder='Filter by mobile number...' />
                </TabsContent>
            </Tabs>
        </TabsContent>
        <TabsContent value="withdrawals">
             <Tabs defaultValue="pending" className="mt-4">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingWithdrawals.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                 <TabsContent value="pending">
                     <DataTable columns={withdrawalColumns} data={pendingWithdrawals} filterColumn='mobileNumber' filterPlaceholder='Filter by mobile number...' />
                </TabsContent>
                 <TabsContent value="completed">
                     <DataTable columns={withdrawalColumns} data={completedWithdrawals} filterColumn='mobileNumber' filterPlaceholder='Filter by mobile number...' />
                </TabsContent>
                 <TabsContent value="cancelled">
                     <DataTable columns={withdrawalColumns} data={cancelledWithdrawals} filterColumn='mobileNumber' filterPlaceholder='Filter by mobile number...' />
                </TabsContent>
                <TabsContent value="all">
                    <DataTable columns={withdrawalColumns} data={allWithdrawals} filterColumn='mobileNumber' filterPlaceholder='Filter by mobile number...' />
                </TabsContent>
            </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
