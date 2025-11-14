
"use client";

import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/data";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusIcons = {
  Active: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
  Expired: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
  Pending: <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "machineName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Machine
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-right">Cost</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost"));
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "date",
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
      const date = new Date(row.getValue("date"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as "Active" | "Expired" | "Pending";
      const variant =
        status === "Active"
          ? "default"
          : status === "Expired"
          ? "destructive"
          : "secondary";
      return (
        <Badge variant={variant} className="capitalize">
          {statusIcons[status]}
          {status}
        </Badge>
      );
    },
  },
];
