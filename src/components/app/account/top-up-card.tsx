"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/contexts/account-context";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const PAYBILL_NUMBER = "400200";

export function TopUpCard() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { addDepositRequest, mobileNumber } = useAccount();

  const handleDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const newDeposit = await addDepositRequest(depositAmount, mobileNumber);
      setGeneratedCode(newDeposit.transactionCode);
      toast({
        title: "Deposit Request Created",
        description: `Use the transaction code ${newDeposit.transactionCode} to complete your M-PESA payment.`,
      });
      setAmount("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not create deposit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setGeneratedCode(null);
    setAmount("");
  };

  if (generatedCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Deposit</CardTitle>
          <CardDescription>
            Use the details below to complete your M-PESA payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <Label>PayBill Number</Label>
            <p className="font-bold text-lg">{PAYBILL_NUMBER}</p>
          </div>
          <div>
            <Label>Account Number</Label>
            <p className="font-bold text-lg text-primary">{generatedCode}</p>
            <p className="text-xs text-muted-foreground">Use this as the account number in your M-PESA transaction.</p>
          </div>
          <div className="pt-2">
             <p className="text-muted-foreground">Your account will be credited once an admin confirms your payment. You can track the status on this page.</p>
          </div>
          <Button onClick={resetForm} className="w-full">
            Make Another Deposit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Up Wallet</CardTitle>
        <CardDescription>
          Enter the amount you wish to add to your wallet.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleDepositRequest}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (KES)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>
        </CardContent>
        <CardContent>
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Generating Code..." : "Get Transaction Code"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
