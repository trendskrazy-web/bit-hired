
'use client';

import { useState, useCallback, useMemo } from 'react';
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
import { columns as depositColumns } from '@/components/admin/transactions/deposit-columns';
import {
  AuthorizationDialog,
  AuthAction,
} from '@/components/admin/transactions/authorization-dialog';
import type { Deposit } from '@/contexts/transaction-context';

export default function AdminDepositsPage() {
  const { deposits, updateDepositStatus } = useTransactions();
  const { codes, markCodeAsUsed } = useRedeemCodes();
  const [authAction, setAuthAction] = useState<AuthAction<Deposit> | null>(null);

  const handleAction = useCallback((action: AuthAction<Deposit>) => {
    setAuthAction(action);
  }, []);

  const handleAuthorization = (isAuthorized: boolean) => {
    if (isAuthorized && authAction) {
      updateDepositStatus(
        authAction.item.id,
        authAction.newStatus,
        authAction.item.amount,
        authAction.item.userAccountId
      );
      // Here you would also mark the auth code as used.
      // For now, let's assume the dialog handles finding the code to mark.
      // In a real app, the dialog might return the code that was used.
    }
    setAuthAction(null); // Close the dialog
  };

  const depositTableColumns = useMemo(
    () => depositColumns({ onAction: handleAction }),
    [handleAction]
  );
  
  const pendingDeposits = useMemo(() => deposits.filter(d => d.status === 'pending'), [deposits]);
  const otherDeposits = useMemo(() => deposits.filter(d => d.status !== 'pending'), [deposits]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Deposit Requests</CardTitle>
          <CardDescription>
            Approve or decline new user deposit requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={depositTableColumns}
            data={pendingDeposits}
            filterColumn="mobileNumber"
            filterPlaceholder="Filter by user mobile..."
          />
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Completed/Cancelled Deposits</CardTitle>
          <CardDescription>
            A history of all processed deposit requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={depositTableColumns}
            data={otherDeposits}
            filterColumn="status"
            filterPlaceholder="Filter by status..."
          />
        </CardContent>
      </Card>

      <AuthorizationDialog<Deposit>
        isOpen={!!authAction}
        onClose={() => setAuthAction(null)}
        onConfirm={handleAuthorization}
        action={authAction}
        itemType="deposit"
        redeemCodes={codes}
      />
    </div>
  );
}
