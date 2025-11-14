
"use client";

import { Badge } from "@/components/ui/badge";
import { type Deposit } from "@/contexts/account-context";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Clock, Copy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

const CopyButton = ({ value }: { value: string }) => {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: "Transaction code copied to clipboard." });
  };
  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
      <Copy className="h-3 w-3" />
    </Button>
  );
};

export const depositColumns: ColumnDef<Deposit>[] = [
  {
    accessorKey: "transactionCode",
    header: "Code",
    cell: ({ row }) => {
      const code = row.getValue("transactionCode") as string;
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
      const status = row.getValue("status") as Deposit["status"];
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
