
'use client';

import { useAccount } from '@/contexts/account-context';
import { DataTable } from '@/components/app/transactions/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import type { Deposit, Withdrawal } from '@/contexts/account-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, CheckCircle, Clock, XCircle, Ban } from 'lucide-react';

const AdminTransactionActions = ({
  transaction,
  type,
  onUpdateStatus,
}: {
  transaction: Deposit | Withdrawal;
  type: 'deposit' | 'withdrawal',
  onUpdateStatus: (id: string, status: 'completed' | 'cancelled') => void;
}) => {
    if (transaction.status !== 'pending') {
        return <span className="text-sm text-muted-foreground">Processed</span>;
    }
  
    return (
        <div className="flex gap-2">
        <Button
            size="sm"
            variant="outline"
            className="text-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={() => onUpdateStatus(transaction.id, 'completed')}
        >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
        </Button>
        <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onUpdateStatus(transaction.id, 'cancelled')}
        >
            <Ban className="mr-2 h-4 w-4" />
            Decline
        </Button>
        </div>
  );
};


const statusInfo = {
    pending: { icon: Clock, color: 'text-yellow-500' },
    completed: { icon: CheckCircle, color: 'text-green-500' },
    cancelled: { icon: XCircle, color: 'text-red-500' },
};
  
const createColumns = (
    type: 'deposit' | 'withdrawal',
    onUpdateStatus: (id: string, status: 'completed' | 'cancelled') => void
): ColumnDef<Deposit | Withdrawal>[] => [
    {
        accessorKey: 'userAccountId',
        header: 'User ID',
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('userAccountId')}</div>
    },
    {
        accessorKey: 'mobileNumber',
        header: 'Mobile Number',
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Amount (KES)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"));
          const formatted = new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleString(),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as keyof typeof statusInfo;
            const Icon = statusInfo[status].icon;
            const color = statusInfo[status].color;
            return <Badge variant={status === 'pending' ? 'secondary' : status === 'completed' ? 'default' : 'destructive'} className='capitalize flex items-center gap-2'><Icon className={`h-4 w-4 ${color}`} />{status}</Badge>
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <AdminTransactionActions
                transaction={row.original}
                type={type}
                onUpdateStatus={onUpdateStatus}
            />
        ),
    },
];

export default function AdminTransactionsPage() {
    const { 
        allDeposits, 
        allWithdrawals, 
        updateDepositStatus, 
        updateWithdrawalStatus 
    } = useAccount();

    const depositColumns = useMemo(() => createColumns('deposit', updateDepositStatus), [updateDepositStatus]);
    const withdrawalColumns = useMemo(() => createColumns('withdrawal', updateWithdrawalStatus), [updateWithdrawalStatus]);
    
    const pendingDeposits = useMemo(() => allDeposits.filter(d => d.status === 'pending'), [allDeposits]);
    const pendingWithdrawals = useMemo(() => allWithdrawals.filter(w => w.status === 'pending'), [allWithdrawals]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Transactions</CardTitle>
          <CardDescription>
            Approve or decline user deposit and withdrawal requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposits">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposits">
                Deposits ({pendingDeposits.length} pending)
              </TabsTrigger>
              <TabsTrigger value="withdrawals">
                Withdrawals ({pendingWithdrawals.length} pending)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deposits">
                <Tabs defaultValue='pending' className='mt-4'>
                    <TabsList>
                        <TabsTrigger value='pending'>Pending</TabsTrigger>
                        <TabsTrigger value='all'>All</TabsTrigger>
                    </TabsList>
                    <TabsContent value='pending'>
                        <DataTable
                            columns={depositColumns}
                            data={pendingDeposits}
                            filterColumn="mobileNumber"
                            filterPlaceholder="Filter by mobile number..."
                        />
                    </TabsContent>
                    <TabsContent value='all'>
                        <DataTable
                            columns={depositColumns}
                            data={allDeposits}
                            filterColumn="mobileNumber"
                            filterPlaceholder="Filter by mobile number..."
                        />
                    </TabsContent>
                </Tabs>
            </TabsContent>
            <TabsContent value="withdrawals">
                 <Tabs defaultValue='pending' className='mt-4'>
                    <TabsList>
                        <TabsTrigger value='pending'>Pending</TabsTrigger>
                        <TabsTrigger value='all'>All</TabsTrigger>
                    </TabsList>
                    <TabsContent value='pending'>
                        <DataTable
                            columns={withdrawalColumns}
                            data={pendingWithdrawals}
                            filterColumn="mobileNumber"
                            filterPlaceholder="Filter by mobile number..."
                        />
                    </TabsContent>
                     <TabsContent value='all'>
                        <DataTable
                            columns={withdrawalColumns}
                            data={allWithdrawals}
                            filterColumn="mobileNumber"
                            filterPlaceholder="Filter by mobile number..."
                        />
                    </TabsContent>
                </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
