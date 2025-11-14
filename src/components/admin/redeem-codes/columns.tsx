
"use client";

import { Badge } from "@/components/ui/badge";
import { type RedeemCode } from "@/lib/redeem-codes";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CopyButton = ({ value }: { value: string }) => {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
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
      const code = row.getValue("code") as string;
      return (
        <div className="flex items-center gap-2 font-mono text-sm">
          <span>{code}</span>
          <CopyButton value={code} />
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
    accessorKey: "used",
    header: "Used",
    cell: ({ row }) => {
      const used = row.getValue("used") as boolean;
      return (
        <Badge variant={used ? "destructive" : "default"}>
            {used ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          {used ? "Yes" : "No"}
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
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleString()}</div>;
    },
  },
];
