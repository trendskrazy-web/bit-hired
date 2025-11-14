
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

export default function AdminDepositsPage() {
  const { deposits, updateDepositStatus } = useTransactions();

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
            columns={columns(updateDepositStatus)}
            data={deposits}
            filterColumn="status"
            filterPlaceholder="Filter by status..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
