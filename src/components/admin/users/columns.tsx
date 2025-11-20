
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserAccount } from "@/contexts/account-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";


export const columns: ColumnDef<UserAccount>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile Number",
  },
  {
    accessorKey: "virtualBalance",
    header: () => <div className="text-right">Balance (KES)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("virtualBalance"));
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "referralCode",
    header: "Referral Code",
     cell: ({ row }) => {
        const referralCode = row.getValue("referralCode") as string | undefined;
        return referralCode ? <div className="font-mono text-xs">{referralCode}</div> : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "invitedBy",
    header: "Invited By (UID)",
    cell: ({ row }) => {
        const invitedBy = row.getValue("invitedBy") as string | undefined;
        return invitedBy ? <div className="font-mono text-xs">{invitedBy}</div> : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${user.id}`}>View and Message User</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
