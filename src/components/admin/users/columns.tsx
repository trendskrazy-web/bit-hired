
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserAccount } from "@/contexts/account-context";


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
    accessorKey: "id",
    header: "User ID",
    cell: ({ row }) => {
        const userId = row.getValue("id") as string | undefined;
        return userId ? <div className="font-mono text-xs">{userId}</div> : null;
    },
  },
];
