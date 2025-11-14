
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

export default function AdminWithdrawalsPage() {
  const { withdrawals, updateWithdrawalStatus } = useTransactions();

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
            columns={columns(updateWithdrawalStatus)}
            data={withdrawals}
            filterColumn="mobileNumber"
            filterPlaceholder="Filter by mobile number..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
