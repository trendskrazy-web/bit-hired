"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CheckCircle, Clock, Copy, XCircle } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import type { RedeemCode } from "@/contexts/redeem-code-context";

const CopyButton = ({ value, item }: { value: string; item: string }) => {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: `${item} copied to clipboard.` });
  };
  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
      <Copy className="h-3 w-3" />
    </Button>
  );
};

export const columns: ColumnDef<RedeemCode>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      const code = row.original.code;
      return (
        <div className="flex items-center gap-1 font-mono text-xs">
          <span>{code}</span>
          <CopyButton value={code} item="Code" />
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
      const amount = row.original.amount;
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
      const used = row.original.used;
      return used ? (
        <Badge variant="destructive">
          <XCircle className="mr-2 h-4 w-4" /> Used
        </Badge>
      ) : (
        <Badge variant="default">
          <CheckCircle className="mr-2 h-4 w-4" /> Available
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "usedBy",
    header: "Used By",
    cell: ({ row }) => {
      const usedBy = row.original.usedBy;
      return usedBy ? (
        <div className="font-mono text-xs">{usedBy}</div>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
   {
    accessorKey: "usedAt",
    header: "Used At",
    cell: ({ row }) => {
      const usedAt = row.original.usedAt;
      return usedAt ? (
        <div>{new Date(usedAt).toLocaleString()}</div>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
];
