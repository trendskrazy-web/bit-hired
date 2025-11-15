
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
import { columns } from '@/components/admin/transactions/withdrawal-columns';
import { useMemo } from 'react';

export default function AdminWithdrawalsPage() {
  const { withdrawals, updateWithdrawalStatus } = useTransactions();

  const sortedWithdrawals = useMemo(() => {
    return [...withdrawals].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [withdrawals]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Transactions</CardTitle>
          <CardDescription>
            Review and manage all user withdrawal requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <DataTable
            columns={columns({ onStatusUpdate: updateWithdrawalStatus })}
            data={sortedWithdrawals}
            filterColumn="mobileNumber"
            filterPlaceholder="Filter by mobile number..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
