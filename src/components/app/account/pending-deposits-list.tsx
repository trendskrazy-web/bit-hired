
"use client";

import { useAccount } from "@/contexts/account-context";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function PendingDepositsList() {
  const { deposits } = useAccount();
  const pending = deposits.filter((d) => d.status === "pending");

  if (pending.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no pending deposits.</p>;
  }

  return (
    <div className="space-y-3">
      {pending.map((deposit) => (
        <div key={deposit.id} className="flex justify-between items-center p-3 bg-secondary rounded-md">
          <div>
            <p className="font-semibold">
              KES {deposit.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              Code: <span className="font-mono">{deposit.transactionCode}</span>
            </p>
          </div>
          <Badge variant="secondary" className="capitalize">
            <Clock className="mr-1.5 h-3 w-3" />
            {deposit.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
