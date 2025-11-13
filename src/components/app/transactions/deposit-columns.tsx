"use client";

import { Badge } from "@/components/ui/badge";
import type { Deposit } from "@/lib/data";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusIcons = {
  Completed: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
};

export const columns: ColumnDef<Deposit>[] = [
  {
    accessorKey: "redeemCode",
    header: "Redeem Code",
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
      const status = row.getValue("status") as "Completed";
      return (
        <Badge variant="default" className="capitalize bg-green-500/20 text-green-700 hover:bg-green-500/30">
          {statusIcons[status]}
          {status}
        </Badge>
      );
    },
  },
];
