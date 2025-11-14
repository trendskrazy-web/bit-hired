
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccount } from "@/contexts/account-context";
import { DataTable } from "../transactions/data-table";
import { Hourglass } from "lucide-react";
import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingTransaction {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

const StatusInfo = {
  pending: {
    icon: <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
    variant: "secondary" as const,
  },
  completed: {
    icon: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
    variant: "default" as const,
  },
  cancelled: {
    icon: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
    variant: "destructive" as const,
  },
};


export const pendingTransactionColumns: ColumnDef<PendingTransaction>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const icon = type === 'Deposit' 
            ? <ArrowDownLeft className="mr-2 h-4 w-4 text-green-500" />
            : <ArrowUpRight className="mr-2 h-4 w-4 text-red-500" />;
        return (
            <div className="flex items-center">
                {icon}
                {type}
            </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
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
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div>{date.toLocaleString()}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as PendingTransaction["status"];
        const { icon, variant } = StatusInfo[status];
        return (
          <Badge variant={variant} className="capitalize">
            {icon}
            {status}
          </Badge>
        );
      },
    },
  ];

export function PendingTransactionsList() {
  const { deposits, withdrawals } = useAccount();

  const pendingTransactions = useMemo(() => {
    const pendingDeposits: PendingTransaction[] = deposits
      .filter(d => d.status === 'pending')
      .map(d => ({
        id: d.id,
        type: 'Deposit',
        amount: d.amount,
        status: d.status,
        createdAt: d.createdAt,
      }));

    const pendingWithdrawals: PendingTransaction[] = withdrawals
      .filter(w => w.status === 'pending')
      .map(w => ({
        id: w.id,
        type: 'Withdrawal',
        amount: w.amount,
        status: w.status,
        createdAt: w.createdAt,
      }));
      
    return [...pendingDeposits, ...pendingWithdrawals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deposits, withdrawals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hourglass className="w-5 h-5" />
          Pending Transactions
        </CardTitle>
        <CardDescription>
          These are your deposit and withdrawal requests awaiting confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={pendingTransactionColumns}
          data={pendingTransactions}
          filterColumn="type"
          filterPlaceholder="Filter by type..."
        />
      </CardContent>
    </Card>
  );
}
