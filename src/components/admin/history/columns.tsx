
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/contexts/notification-context";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: "createdAt",
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
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "message",
    header: "Action",
  },
  {
    accessorKey: "adminId",
    header: "Admin UID",
     cell: ({ row }) => {
        const adminId = row.getValue("adminId") as string | undefined;
        return adminId ? <div className="font-mono text-xs">{adminId}</div> : null;
    },
  },
  {
    accessorKey: "read",
    header: "Status",
    cell: ({ row }) => {
        const read = row.getValue("read");
        return read ? (
            <Badge variant="secondary">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Read
            </Badge>
        ) : (
             <Badge variant="outline">
                <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                Unread
            </Badge>
        )
    }
  }
];
