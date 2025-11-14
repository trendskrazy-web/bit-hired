
"use client";

import { Badge } from "@/components/ui/badge";
import type { Deposit } from "@/contexts/transaction-context";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusIcons: Record<Deposit['status'], React.ReactNode> = {
  pending: <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
  completed: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
};

const statusVariants: Record<Deposit['status'], 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
};


export const columns: ColumnDef<Deposit>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount (KES)</div>,
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
    accessorKey: "transactionCode",
    header: "M-PESA Code",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Deposit['status'];
      return (
        <Badge variant={statusVariants[status]} className="capitalize">
          {statusIcons[status]}
          {status}
        </Badge>
      );
    },
  },
];
