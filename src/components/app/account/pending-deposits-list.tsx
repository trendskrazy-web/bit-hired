
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccount } from "@/contexts/account-context";
import { DataTable } from "../transactions/data-table";
import { depositColumns } from "../transactions/deposit-columns";
import { Hourglass } from "lucide-react";

export function PendingDepositsList() {
  const { deposits } = useAccount();
  const pendingDeposits = deposits.filter(d => d.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hourglass className="w-5 h-5" />
          Pending Deposits
        </CardTitle>
        <CardDescription>
          These are your deposit requests awaiting confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={depositColumns}
          data={pendingDeposits}
          filterColumn="status"
          filterPlaceholder="Filter by status..."
        />
      </CardContent>
    </Card>
  );
}
