
"use client";

import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Deposit } from "@/contexts/account-context";

const statusConfig: {
  [key in Deposit["status"]]: {
    icon: JSX.Element;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
} = {
  pending: {
    icon: <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
    variant: "secondary",
  },
  completed: {
    icon: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
    variant: "default",
  },
  cancelled: {
    icon: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
    variant: "destructive",
  },
};

export const columns: ColumnDef<Deposit>[] = [
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
    header: "Reference Code",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Deposit["status"];
      const config = statusConfig[status];
      return (
        <Badge variant={config.variant} className="capitalize">
          {config.icon}
          {status}
        </Badge>
      );
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
];
