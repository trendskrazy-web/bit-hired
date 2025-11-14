
"use client";

import { useState } from "react";
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
import { useAccount } from "@/contexts/account-context";
import { Wallet } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TopUpCard() {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionCode, setTransactionCode] = useState("");
  const { toast } = useToast();
  const { addDepositRequest } = useAccount();

  const generateTransactionCode = () => {
    return `BH${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  };

  const handleInitiateDeposit = (e: React.FormEvent) => {
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
    const code = generateTransactionCode();
    setTransactionCode(code);

    addDepositRequest(depositAmount, code);

    setTimeout(() => {
      setDialogOpen(true);
      setIsProcessing(false);
    }, 1000);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAmount("");
    toast({
      title: "Deposit Initiated",
      description:
        "Your deposit request has been logged. Please complete the M-PESA payment.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Top Up Wallet
          </CardTitle>
          <CardDescription>
            Add funds to your account balance via M-PESA.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleInitiateDeposit}>
          <CardContent>
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
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Deposit Funds"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your M-PESA Deposit</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p>
                  To complete your deposit of{" "}
                  <span className="font-bold text-primary">KES {amount}</span>,
                  please follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
                  <li>Go to your M-PESA menu.</li>
                  <li>Select "Lipa na M-PESA".</li>
                  <li>Select "Pay Bill".</li>
                  <li>
                    Enter Business Number:{" "}
                    <span className="font-bold text-primary">123456</span>
                  </li>
                  <li>
                    Enter Account Number:{" "}
                    <span className="font-bold text-primary">
                      {transactionCode}
                    </span>
                  </li>
                  <li>
                    Enter the amount:{" "}
                    <span className="font-bold text-primary">KES {amount}</span>
                  </li>
                  <li>Enter your M-PESA PIN and confirm.</li>
                </ol>
                <p className="font-semibold text-destructive text-xs">
                  Your account will be credited once the transaction is confirmed
                  by an admin.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseDialog}>
              I have made the payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
