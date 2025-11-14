"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount, type Deposit } from "@/contexts/account-context";
import { ArrowUpDown, CheckCircle, Clock, Copy, XCircle } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

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

export const depositColumns: ColumnDef<Deposit>[] = [
  {
    accessorKey: "transactionCode",
    header: "Code",
    cell: ({ row }) => {
      const code = row.getValue("transactionCode") as string;
      return (
        <div className="flex items-center gap-1 font-mono text-xs">
          <span>{code}</span>
          <CopyButton value={code} item="Code" />
        </div>
      );
    },
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile Number",
    cell: ({ row }) => {
        const number = row.getValue("mobileNumber") as string;
        return (
            <div className="flex items-center gap-1 font-mono text-xs">
            <span>{number}</span>
            <CopyButton value={number} item="Number"/>
            </div>
        );
    }
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
  {
    id: "actions",
    cell: ({ row }) => {
      const deposit = row.original;
      const { updateDepositStatus } = useAccount();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(deposit.id)}
            >
              Copy transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             {deposit.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => updateDepositStatus(deposit.id, 'completed')}>Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateDepositStatus(deposit.id, 'cancelled')}>Decline</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
