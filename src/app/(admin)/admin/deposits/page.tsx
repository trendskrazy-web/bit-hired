
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTransactions } from '@/contexts/transaction-context';
import { DataTable } from '@/components/admin/transactions/data-table';
import { columns } from '@/components/admin/transactions/deposit-columns';
import { useMemo } from 'react';

export default function AdminDepositsPage() {
  const { deposits, updateDepositStatus } = useTransactions();

  const sortedDeposits = useMemo(() => {
    return [...deposits].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      // For items with the same status, sort by creation date descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [deposits]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deposit Transactions</CardTitle>
          <CardDescription>
            Review and manage all user deposit requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <DataTable
            columns={columns({ onStatusUpdate: updateDepositStatus })}
            data={sortedDeposits}
            filterColumn="mobileNumber"
            filterPlaceholder="Filter by mobile number..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
