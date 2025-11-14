
"use client";

import { Badge } from "@/components/ui/badge";
import { type Deposit, useAccount } from "@/contexts/account-context";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Clock, MoreHorizontal, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

const ActionsCell = ({ row }: { row: any }) => {
    const deposit = row.original as Deposit;
    const { updateDepositStatus } = useAccount();
    const { toast } = useToast();

    const handleUpdate = (status: 'completed' | 'cancelled') => {
        updateDepositStatus(deposit.id, status, deposit.amount, deposit.userAccountId);
        toast({
            title: "Success",
            description: `Deposit ${deposit.transactionCode} has been marked as ${status}.`
        })
    }

    if (deposit.status !== 'pending') {
        return null;
    }

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
                <DropdownMenuItem onClick={() => handleUpdate('completed')}>
                    Approve
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleUpdate('cancelled')}>
                    Decline
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export const depositColumns: ColumnDef<Deposit>[] = [
  {
    accessorKey: "transactionCode",
    header: "Code",
     cell: ({ row }) => {
      const code = row.getValue("transactionCode") as string;
      return <div className="font-mono">{code}</div>
    },
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile Number",
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
      id: 'actions',
      cell: ActionsCell,
  }
];
