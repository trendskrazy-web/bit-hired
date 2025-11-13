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
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function WithdrawCard() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const userPhoneNumber = "+254 712 345 678"; 

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setAmount("");
      toast({
        title: "Withdrawal Request Received",
        description: `Your request to withdraw KES ${amount} has been received. It will be processed in 2-3 working days.`,
      });
    }, 2000);
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
              value={userPhoneNumber}
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
          </div>
           <p className="text-xs text-muted-foreground">
              Withdrawals are processed within 2-3 working days.
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