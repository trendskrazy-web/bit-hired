
'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, CheckCircle, Clock, XCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Withdrawal } from '@/contexts/transaction-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusIcons: Record<Withdrawal['status'], React.ReactNode> = {
  pending: <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
  completed: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
};

const statusVariants: Record<Withdrawal['status'], 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
};

type UpdateStatusFn = (withdrawalId: string, status: 'completed' | 'cancelled', amount: number, userId: string) => void;

interface ColumnsProps {
  onStatusUpdate: UpdateStatusFn;
}

export const columns = ({ onStatusUpdate }: ColumnsProps): ColumnDef<Withdrawal>[] => [
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
    accessorKey: 'mobileNumber',
    header: 'User Mobile',
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount (KES)</div>,
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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Withdrawal['status'];
      return (
        <Badge variant={statusVariants[status]} className="capitalize">
          {statusIcons[status]}
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'userAccountId',
    header: 'User ID',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('userAccountId')}</div>
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const withdrawal = row.original;
      if (withdrawal.status !== 'pending') {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(withdrawal.id)}
            >
              Copy transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-green-600 focus:bg-green-100 focus:text-green-700"
              onClick={() => onStatusUpdate(withdrawal.id, 'completed', withdrawal.amount, withdrawal.userAccountId)}
            >
               <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
                className="text-red-600 focus:bg-red-100 focus:text-red-700"
                onClick={() => onStatusUpdate(withdrawal.id, 'cancelled', withdrawal.amount, withdrawal.userAccountId)}
            >
                 <XCircle className="mr-2 h-4 w-4" />
                Decline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];
