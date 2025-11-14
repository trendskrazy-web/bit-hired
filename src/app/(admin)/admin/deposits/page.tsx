
'use client';

import { useAccount } from '@/contexts/account-context';
import { Separator } from '@/components/ui/separator';
import { Deposit, columns } from '@/components/admin/deposits/columns';
import { DataTable } from '@/components/admin/deposits/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function AdminDepositsPage() {
  const { allDeposits } = useAccount();

  const pendingDeposits = allDeposits.filter(d => d.status === 'pending');
  const completedDeposits = allDeposits.filter(d => d.status === 'completed');
  const cancelledDeposits = allDeposits.filter(d => d.status === 'cancelled');

  const totalPendingAmount = pendingDeposits.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Manage Deposits</h1>
        <p className="text-muted-foreground">
          Approve or decline user deposit requests.
        </p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              from {pendingDeposits.length} requests
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns} data={pendingDeposits} />
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
            <CardTitle>Completed Requests</CardTitle>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns} data={completedDeposits} />
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
            <CardTitle>Cancelled Requests</CardTitle>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns} data={cancelledDeposits} />
        </CardContent>
      </Card>

    </div>
  );
}
