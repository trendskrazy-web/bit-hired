"use client";

import { Badge } from "@/components/ui/badge";
import type { Deposit, DepositTransaction } from "@/lib/data";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusIcons: { [key: string]: React.ReactNode } = {
  completed: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
  pending: <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
  cancelled: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
};

export const columns: ColumnDef<DepositTransaction>[] = [
  {
    accessorKey: "transactionCode",
    header: "Transaction Code",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "completed"
          ? "default"
          : status === "cancelled"
          ? "destructive"
          : "secondary";
      return (
        <Badge variant={variant} className={`capitalize ${status === 'completed' ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' : ''}`}>
          {statusIcons[status]}
          {status}
        </Badge>
      );
    },
  },
];
