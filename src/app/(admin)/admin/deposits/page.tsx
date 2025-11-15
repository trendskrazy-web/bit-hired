
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
import { useMemo, useState } from 'react';
import { AuthorizationDialog, type AuthAction } from '@/components/admin/transactions/authorization-dialog';
import type { Deposit } from '@/contexts/transaction-context';
import { useRedeemCodes } from '@/contexts/redeem-code-context';


export default function AdminDepositsPage() {
  const { deposits, updateDepositStatus } = useTransactions();
  const { codes: redeemCodes } = useRedeemCodes();
  const [authAction, setAuthAction] = useState<AuthAction<Deposit> | null>(null);

  const sortedDeposits = useMemo(() => {
    return [...deposits].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      // For items with the same status, sort by creation date descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [deposits]);

  const handleConfirmAction = (isAuthorized: boolean) => {
    if (isAuthorized && authAction) {
      updateDepositStatus(authAction.item.id, authAction.newStatus as 'completed' | 'cancelled', authAction.item.amount, authAction.item.userAccountId);
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
        itemType="deposit"
        redeemCodes={redeemCodes}
      />
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
              columns={columns({ onAction: setAuthAction })}
              data={sortedDeposits}
              filterColumn="mobileNumber"
              filterPlaceholder="Filter by mobile number..."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
