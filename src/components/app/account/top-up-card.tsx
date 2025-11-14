
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
import { useState, useEffect } from "react";
import { Copy } from "lucide-react";


export function TopUpCard() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null);
  const { addDepositRequest, mobileNumber } = useAccount();

  const mpesaNumbers = ["0704367623", "0728477718"];

  useEffect(() => {
    if (!generatedCode && mpesaNumbers.length > 0) {
      // Pick a random number when the component loads or resets
      const randomIndex = Math.floor(Math.random() * mpesaNumbers.length);
      setSelectedPhoneNumber(mpesaNumbers[randomIndex]);
    }
  }, [generatedCode, mpesaNumbers]);

  const handleDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);

    if (mpesaNumbers.length === 0) {
      toast({
        title: "Deposits Unavailable",
        description: "No M-PESA numbers are configured for deposits. This is a demo feature.",
        variant: "destructive",
      });
      return;
    }

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
        title: "Deposit Request Created (Demonstration)",
        description: `Use the transaction code ${newDeposit.transactionCode} to complete your M-PESA payment. This is for demo purposes only.`,
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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copied!`,
      description: `${text} copied to clipboard.`,
    });
  };

  const resetForm = () => {
    setGeneratedCode(null);
    setAmount("");
  };

  if (generatedCode && selectedPhoneNumber) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Deposit (Demo)</CardTitle>
          <CardDescription>
            To deposit funds, send the exact amount to the M-PESA number below. Use the provided transaction code as the reference in your M-PESA transaction. An admin will confirm your payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <Label>Send Money To (Paybill)</Label>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg">{selectedPhoneNumber}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(selectedPhoneNumber, "Number")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Account Number (Transaction Reference)</Label>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg text-primary">{generatedCode}</p>
               <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(generatedCode, "Code")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">This code helps us identify your deposit.</p>
          </div>
          <div className="pt-2">
             <p className="text-muted-foreground">Your account balance will be updated once an admin confirms the transaction. You can track its status under "Pending Deposits".</p>
          </div>
          <Button onClick={resetForm} className="w-full">
            Make Another Deposit Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Up Wallet via M-PESA</CardTitle>
        <CardDescription>
          Enter the amount you wish to deposit to your wallet.
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
          <Button type="submit" className="w-full" disabled={isProcessing || mpesaNumbers.length === 0}>
            {isProcessing ? "Generating Code..." : "Get Transaction Code"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
