'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Deposit, useAccount } from '@/contexts/account-context';
import { DataTable } from '@/components/app/transactions/data-table';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Clock,
  Copy,
  ArrowUpDown,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StatusInfo = {
  pending: {
    icon: <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
    variant: 'secondary' as const,
  },
  completed: {
    icon: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
    variant: 'default' as const,
  },
  cancelled: {
    icon: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
    variant: 'destructive' as const,
  },
};

const CopyButton = ({ value }: { value: string }) => {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: 'Copied!',
      description: 'Transaction code copied to clipboard.',
    });
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-6 w-6"
    >
      <Copy className="h-3 w-3" />
    </Button>
  );
};

export default function AdminDepositsPage() {
  const { allDeposits, updateDepositStatus, addBalance } = useAccount();

  const handleUpdateStatus = (
    deposit: Deposit,
    status: 'completed' | 'cancelled'
  ) => {
    updateDepositStatus(deposit.id, status);
    if (status === 'completed') {
      addBalance(deposit.amount, deposit.userAccountId);
    }
  };

  const adminDepositColumns: ColumnDef<Deposit>[] = [
    {
      accessorKey: 'transactionCode',
      header: 'Code',
      cell: ({ row }) => {
        const code = row.getValue('transactionCode') as string;
        return (
          <div className="flex items-center gap-2 font-mono text-sm">
            <span>{code}</span>
            <CopyButton value={code} />
          </div>
        );
      },
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
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return <div>{date.toLocaleString()}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as Deposit['status'];
        const { icon, variant } = StatusInfo[status];
        return (
          <Badge variant={variant} className="capitalize">
            {icon}
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const deposit = row.original;
        if (deposit.status !== 'pending') {
          return null;
        }
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleUpdateStatus(deposit, 'completed')}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleUpdateStatus(deposit, 'cancelled')}
            >
              Decline
            </Button>
          </div>
        );
      },
    },
  ];

  const pendingDeposits = allDeposits.filter((d) => d.status === 'pending');
  const completedDeposits = allDeposits.filter((d) => d.status === 'completed');
  const cancelledDeposits = allDeposits.filter((d) => d.status === 'cancelled');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Deposits</CardTitle>
          <CardDescription>
            Review and approve or decline user deposit requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <DataTable
                columns={adminDepositColumns}
                data={allDeposits}
                filterColumn="mobileNumber"
                filterPlaceholder="Filter by number..."
              />
            </TabsContent>
            <TabsContent value="pending">
              <DataTable
                columns={adminDepositColumns}
                data={pendingDeposits}
                filterColumn="mobileNumber"
                filterPlaceholder="Filter by number..."
              />
            </TabsContent>
            <TabsContent value="completed">
              <DataTable
                columns={adminDepositColumns}
                data={completedDeposits}
                filterColumn="mobileNumber"
                filterPlaceholder="Filter by number..."
              />
            </TabsContent>
            <TabsContent value="cancelled">
              <DataTable
                columns={adminDepositColumns}
                data={cancelledDeposits}
                filterColumn="mobileNumber"
                filterPlaceholder="Filter by number..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
