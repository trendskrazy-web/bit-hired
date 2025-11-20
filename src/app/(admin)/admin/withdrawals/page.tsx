
'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTransactions } from '@/contexts/transaction-context';
import { useRedeemCodes } from '@/contexts/redeem-code-context';
import { DataTable } from '@/components/admin/transactions/data-table';
import { columns as withdrawalColumns } from '@/components/admin/transactions/withdrawal-columns';
import { AuthorizationDialog, AuthAction } from '@/components/admin/transactions/authorization-dialog';
import type { Withdrawal } from '@/contexts/transaction-context';

export default function AdminWithdrawalsPage() {
  const { withdrawals, updateWithdrawalStatus } = useTransactions();
  const { codes } = useRedeemCodes();
  const [authAction, setAuthAction] = useState<AuthAction<Withdrawal> | null>(null);

  const handleAction = useCallback((action: AuthAction<Withdrawal>) => {
    setAuthAction(action);
  }, []);

  const handleAuthorization = (isAuthorized: boolean) => {
    if (isAuthorized && authAction) {
      updateWithdrawalStatus(
        authAction.item.id,
        authAction.newStatus,
        authAction.item.amount,
        authAction.item.userAccountId
      );
    }
    setAuthAction(null);
  };
  
  const withdrawalTableColumns = useMemo(
    () => withdrawalColumns({ onAction: handleAction }),
    [handleAction]
  );
  
  const pendingWithdrawals = useMemo(() => withdrawals.filter(w => w.status === 'pending'), [withdrawals]);
  const otherWithdrawals = useMemo(() => withdrawals.filter(w => w.status !== 'pending'), [withdrawals]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Withdrawal Requests</CardTitle>
          <CardDescription>
            Approve or decline user withdrawal requests. Actions are available 2 days after request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={withdrawalTableColumns}
            data={pendingWithdrawals}
            filterColumn="mobileNumber"
            filterPlaceholder="Filter by user mobile..."
          />
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Completed/Cancelled Withdrawals</CardTitle>
          <CardDescription>
            A history of all processed withdrawal requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={withdrawalTableColumns}
            data={otherWithdrawals}
            filterColumn="status"
            filterPlaceholder="Filter by status..."
          />
        </CardContent>
      </Card>

      <AuthorizationDialog<Withdrawal>
        isOpen={!!authAction}
        onClose={() => setAuthAction(null)}
        onConfirm={handleAuthorization}
        action={authAction}
        itemType="withdrawal"
        redeemCodes={codes}
      />
    </div>
  );
}
