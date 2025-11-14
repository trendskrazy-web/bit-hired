
"use client";

import { Badge } from "@/components/ui/badge";
import type { RedeemCode } from "@/contexts/redeem-code-context";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<RedeemCode>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
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
    accessorKey: "used",
    header: "Status",
    cell: ({ row }) => {
      const used = row.getValue("used");
      return used ? (
        <Badge variant="secondary" className="capitalize">
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Redeemed
        </Badge>
      ) : (
        <Badge variant="outline" className="capitalize">
           <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
          Available
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "usedBy",
    header: "Redeemed By",
    cell: ({ row }) => {
        const usedBy = row.getValue("usedBy") as string | undefined;
        return usedBy ? <div className="font-mono text-xs">{usedBy}</div> : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "usedAt",
    header: "Redeemed At",
    cell: ({ row }) => {
        const usedAt = row.getValue("usedAt") as string | undefined;
        return usedAt ? <div>{new Date(usedAt).toLocaleString()}</div> : <span className="text-muted-foreground">-</span>;
    },
  }
];
