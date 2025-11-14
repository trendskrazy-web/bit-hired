
"use client";

import { Badge } from "@/components/ui/badge";
import { type Deposit, useAccount } from "@/contexts/account-context";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Check, CheckCircle, Clock, Copy, MoreHorizontal, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
    toast({ title: "Copied!", description: "Value copied to clipboard." });
  };
  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
      <Copy className="h-3 w-3" />
    </Button>
  );
};

export { type Deposit };

export const columns: ColumnDef<Deposit>[] = [
    {
        id: "actions",
        cell: ({ row }) => {
          const deposit = row.original;
          const { updateDepositStatus, addBalance } = useAccount();
          const { toast } = useToast();

          const handleApprove = () => {
             updateDepositStatus(deposit.id, 'completed');
             addBalance(deposit.amount, deposit.userAccountId);
             toast({ title: "Deposit Approved", description: `KES ${deposit.amount} added to user ${deposit.userAccountId}.` });
          };

          const handleDecline = () => {
            updateDepositStatus(deposit.id, 'cancelled');
            toast({ title: "Deposit Declined", variant: "destructive" });
          };
    
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
                  onClick={() => navigator.clipboard.writeText(deposit.userAccountId)}
                >
                  Copy User ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {deposit.status === 'pending' && (
                    <>
                        <DropdownMenuItem onClick={handleApprove} className="text-green-600">
                            <Check className="mr-2 h-4 w-4"/>
                            Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDecline} className="text-red-600">
                            <X className="mr-2 h-4 w-4"/>
                            Decline
                        </DropdownMenuItem>
                    </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    {
    accessorKey: "userAccountId",
    header: "User ID",
     cell: ({ row }) => {
      const userId = row.getValue("userAccountId") as string;
      return (
        <div className="flex items-center gap-1 font-mono text-xs">
          <span>{userId.substring(0, 10)}...</span>
          <CopyButton value={userId} />
        </div>
      );
    },
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile Number",
  },
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
