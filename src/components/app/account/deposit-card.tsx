
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
import { DollarSign, Copy, RefreshCw, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAccount } from '@/contexts/account-context';

export function DepositCard() {
  const [step, setStep] = useState<'enterAmount' | 'confirmPayment'>('enterAmount');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { addDepositRequest, designatedDepositAccount, depositsEnabled, updateDesignatedAccount } = useTransactions();
  const { mobileNumber } = useAccount();

  const handleAmountSubmit = (e: React.FormEvent) => {
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
    setStep('confirmPayment');
  };

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

    setIsProcessing(true);
    
    addDepositRequest(depositAmount, designatedDepositAccount);
    
    setTimeout(() => {
      setIsProcessing(false);
      setAmount('');
      setStep('enterAmount');
      toast({
        title: 'Deposit Request Submitted',
        description: `Your deposit request of KES ${depositAmount.toLocaleString()} has been submitted for verification.`,
      });
    }, 1500);
  };

    const copyToClipboard = (text: string) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            toast({
                title: 'Copied to clipboard',
                description: `Account number ${text} copied.`,
            });
        } catch (err) {
            toast({
                title: 'Copy Failed',
                description: 'Could not copy the account number.',
                variant: 'destructive',
            });
        } finally {
            document.body.removeChild(textarea);
        }
    };

  const handleCopy = () => {
    if (designatedDepositAccount) {
      copyToClipboard(designatedDepositAccount);
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

  const renderEnterAmountStep = () => (
    <form onSubmit={handleAmountSubmit}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Deposit Funds
            </CardTitle>
            <CardDescription>
            Enter the amount you wish to deposit into your account.
            </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!depositsEnabled ? (
            <Alert variant="destructive">
                <AlertTitle>Deposits Temporarily Unavailable</AlertTitle>
                <AlertDescription>
                    We have reached our daily deposit limit. Please try again tomorrow.
                </AlertDescription>
            </Alert>
        ) : null}
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
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={!depositsEnabled}>
          Continue
        </Button>
      </CardFooter>
    </form>
  );

  const renderConfirmPaymentStep = () => (
     <form onSubmit={handleDepositRequest}>
        <CardHeader>
             <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4 px-2"
                onClick={() => setStep('enterAmount')}
                >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <CardTitle className="flex items-center gap-2 pt-8">
                Confirm Your Deposit
            </CardTitle>
            <CardDescription>
                Send KES {parseFloat(amount).toLocaleString()} to the account below, then submit your request.
            </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {depositsEnabled && designatedDepositAccount ? (
        <div className="space-y-2">
            <Label>1. Send Deposit To:</Label>
             <Alert>
                <div className="flex justify-between items-center">
                   <AlertDescription className='font-bold text-lg'>
                    {designatedDepositAccount}
                    </AlertDescription>
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
            </Alert>
        </div>
        ) : (
         <Alert variant="destructive">
            <AlertTitle>Deposits Temporarily Unavailable</AlertTitle>
            <AlertDescription>
                The deposit limit was reached while you were entering details. Please try again later.
            </AlertDescription>
        </Alert>
        )}

        <div className="space-y-2">
            <Label htmlFor="payment-number">2. Your Sending Number</Label>
            <Input
              id="payment-number"
              type="tel"
              value={mobileNumber}
              disabled
            />
        </div>
         <p className="text-xs text-muted-foreground">
            After sending the money, click the button below to log your request for verification. Deposits are credited within a few minutes.
        </p>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={isProcessing || !depositsEnabled}>
          {isProcessing ? "Submitting..." : "I Have Paid, Submit Request"}
        </Button>
      </CardFooter>
    </form>
  );


  return (
    <Card className="relative">
      {step === 'enterAmount' ? renderEnterAmountStep() : renderConfirmPaymentStep()}
    </Card>
  );
}
