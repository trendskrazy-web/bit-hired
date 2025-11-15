
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
import { useMemo, useState } from 'react';
import { AuthorizationDialog, type AuthAction } from '@/components/admin/transactions/authorization-dialog';
import type { Withdrawal } from '@/contexts/transaction-context';
import { useRedeemCodes } from '@/contexts/redeem-code-context';

export default function AdminWithdrawalsPage() {
  const { withdrawals, updateWithdrawalStatus } = useTransactions();
  const { codes: redeemCodes } = useRedeemCodes();
  const [authAction, setAuthAction] = useState<AuthAction<Withdrawal> | null>(null);


  const sortedWithdrawals = useMemo(() => {
    return [...withdrawals].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [withdrawals]);

  const handleConfirmAction = (isAuthorized: boolean) => {
    if (isAuthorized && authAction) {
      updateWithdrawalStatus(authAction.item.id, authAction.newStatus as 'completed' | 'cancelled', authAction.item.amount, authAction.item.userAccountId);
    }
    setAuthAction(null); // Close dialog
  };


  return (
    <>
      <AuthorizationDialog
        isOpen={!!authAction}
        onClose={() => setAuthAction(null)}
        onConfirm={handleConfirmAction}
        action={authAction}
        itemType="withdrawal"
        redeemCodes={redeemCodes}
      />
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
              columns={columns({ onAction: setAuthAction })}
              data={sortedWithdrawals}
              filterColumn="mobileNumber"
              filterPlaceholder="Filter by mobile number..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
