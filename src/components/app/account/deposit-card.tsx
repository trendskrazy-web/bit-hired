
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/contexts/transaction-context';
import { DollarSign } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// These would typically come from a remote config or database
const DEPOSIT_ACCOUNTS = [
    { name: "M-PESA Paybill 1", number: "123456" },
    { name: "M-PESA Paybill 2", number: "789012" },
]

export function DepositCard() {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(DEPOSIT_ACCOUNTS[0].number);
  const { toast } = useToast();
  const { addDepositRequest } = useTransactions();

  const handleDepositRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);

    if (!amount || depositAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to deposit.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    addDepositRequest(depositAmount, selectedAccount);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setAmount('');
      toast({
        title: 'Deposit Request Submitted',
        description: `Your deposit request of KES ${depositAmount.toLocaleString()} has been submitted for verification.`,
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Deposit Funds
        </CardTitle>
        <CardDescription>
          Send money to the provided account and enter the amount below.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleDepositRequest}>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="deposit-to">Send To</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger id="deposit-to">
                        <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                        {DEPOSIT_ACCOUNTS.map(acc => (
                            <SelectItem key={acc.number} value={acc.number}>
                                {acc.name} - {acc.number}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground">
                    Send your deposit to this account number.
                </p>
            </div>
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
           <p className="text-xs text-muted-foreground">
             Once you send the money, enter the amount to submit your deposit request for verification. Deposits are credited within a few minutes.
            </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Submitting..." : "Submit Deposit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
