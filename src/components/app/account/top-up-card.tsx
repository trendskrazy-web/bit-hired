
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
import { Wallet, Copy } from "lucide-react";
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
import { useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const PAY_ACCOUNTS = ["0704367623", "0728477718"];
const DAILY_LIMIT = 500000;

export function TopUpCard() {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionCode, setTransactionCode] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const { toast } = useToast();
  const { addDepositRequest } = useAccount();
  const firestore = useFirestore();

  const generateTransactionCode = () => {
    return `BH${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard.",
    });
  };

  const handleInitiateDeposit = async (e: React.FormEvent) => {
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
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const availableAccounts = [];

        for (const account of PAY_ACCOUNTS) {
            const limitDocId = `${today}_${account}`;
            const limitDocRef = doc(firestore, "daily_limits", limitDocId);
            const docSnap = await getDoc(limitDocRef);

            let currentTotal = 0;
            if (docSnap.exists()) {
                currentTotal = docSnap.data().totalAmount || 0;
            }

            if (currentTotal + depositAmount <= DAILY_LIMIT) {
                availableAccounts.push(account);
            }
        }

        if (availableAccounts.length === 0) {
            toast({
                title: "Service Temporarily Unavailable",
                description: "All our payment accounts have reached their daily limit. Please try again tomorrow.",
                variant: "destructive",
            });
            setIsProcessing(false);
            return;
        }

        // Pick a random account from the available ones
        const randomAccount = availableAccounts[Math.floor(Math.random() * availableAccounts.length)];
        setSelectedAccount(randomAccount);
        
        const code = generateTransactionCode();
        setTransactionCode(code);

        addDepositRequest(depositAmount, code, randomAccount);

        setDialogOpen(true);

    } catch (error) {
        console.error("Error initiating deposit:", error);
        toast({
            title: "Error",
            description: "Could not initiate deposit. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsProcessing(false);
    }
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
            Send Money
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
                  please send money to the following details:
                </p>
                <div className="rounded-md border p-4 space-y-2">
                    <div className="flex justify-between items-center">
                         <span className="text-sm text-muted-foreground">Account Number</span>
                         <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">{selectedAccount}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(selectedAccount)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                         </div>
                    </div>
                     <div className="flex justify-between items-center">
                         <span className="text-sm text-muted-foreground">Reference Code</span>
                         <div className="flex items-center gap-2">
                             <span className="font-mono font-bold text-primary">{transactionCode}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(transactionCode)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                         </div>
                    </div>
                </div>
                 <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
                  <li>Go to your M-PESA menu and select "Send Money".</li>
                  <li>Enter the account number and amount shown above.</li>
                  <li>
                    In the M-PESA confirmation step, it is highly recommended to add the reference code to the message/comment field to speed up confirmation.
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
