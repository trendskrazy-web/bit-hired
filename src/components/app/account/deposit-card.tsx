
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
import { DollarSign, Copy, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export function DepositCard() {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { addDepositRequest, designatedDepositAccount, depositsEnabled, updateDesignatedAccount } = useTransactions();

  const handleDepositRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);

    if (!depositsEnabled || !designatedDepositAccount) {
      toast({
        title: 'Deposits Unavailable',
        description: 'Deposits are temporarily unavailable. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || depositAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to deposit.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    addDepositRequest(depositAmount, designatedDepositAccount);
    
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

  const handleCopy = () => {
    if (designatedDepositAccount) {
      navigator.clipboard.writeText(designatedDepositAccount);
      toast({
        title: 'Copied to clipboard',
        description: `Account number ${designatedDepositAccount} copied.`,
      });
    }
  }

  const handleRefresh = async () => {
    toast({
      title: 'Refreshing...',
      description: 'Getting another deposit number.',
    })
    await updateDesignatedAccount();
    toast({
      title: 'Refreshed!',
      description: 'The deposit number has been updated.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Deposit Funds
        </CardTitle>
        <CardDescription>
          Send money to the provided account and enter the amount below to confirm.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleDepositRequest}>
        <CardContent className="space-y-4">
            {depositsEnabled && designatedDepositAccount ? (
             <Alert>
                <Terminal className="h-4 w-4" />
                <div className="flex justify-between items-center">
                    <AlertTitle>Send Deposit To:</AlertTitle>
                    <div className="flex items-center gap-2">
                         <Button type="button" variant="ghost" size="icon" onClick={handleRefresh} className="h-6 w-6">
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Refresh Number</span>
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy Number</span>
                        </Button>
                    </div>
                </div>
                <AlertDescription className='font-bold text-lg'>
                  {designatedDepositAccount}
                </AlertDescription>
            </Alert>
            ) : (
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Deposits Temporarily Unavailable</AlertTitle>
                <AlertDescription>
                    We have reached our daily deposit limit. Please try again tomorrow.
                </AlertDescription>
            </Alert>
            )}

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
              disabled={!depositsEnabled}
            />
          </div>
           <p className="text-xs text-muted-foreground">
             Once you send the money, enter the amount to submit your deposit request for verification. Deposits are credited within a few minutes.
            </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isProcessing || !depositsEnabled}>
            {isProcessing ? "Submitting..." : "Submit Deposit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
