
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from "@/contexts/account-context";
import { useTransactions } from "@/contexts/transaction-context";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface WithdrawCardProps {
  accountBalance: number;
}

export function WithdrawCard({ accountBalance }: WithdrawCardProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { mobileNumber, deductBalance } = useAccount();
  const { addWithdrawalRequest } = useTransactions();

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > accountBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You cannot withdraw more than your account balance.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Deduct balance immediately upon request
    deductBalance(withdrawAmount);
    // Create the withdrawal request record
    addWithdrawalRequest(withdrawAmount);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setAmount("");
      toast({
        title: "Withdrawal Request Received",
        description: `Your request to withdraw KES ${withdrawAmount.toLocaleString()} has been logged for processing.`,
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>
          Transfer funds from your wallet to your M-PESA account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleWithdraw}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-number">Receiving Number</Label>
            <Input
              id="withdraw-number"
              value={mobileNumber}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (KES)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
             <p className="text-xs text-muted-foreground">
              Universal network fees may apply.
            </p>
          </div>
           <p className="text-xs text-muted-foreground">
              Withdrawals are processed within 2-3 working days. Your balance will be deducted immediately.
            </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Request Withdrawal"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
