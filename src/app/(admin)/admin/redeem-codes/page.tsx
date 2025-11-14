
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRedeemCodes } from '@/contexts/redeem-code-context';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function AdminRedeemCodesPage() {
  const [amount, setAmount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateCode } = useRedeemCodes();
  const { toast } = useToast();

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
        const newCode = await generateCode(numAmount);
        toast({
            title: 'Code Generated',
            description: `New code "${newCode}" for KES ${numAmount} created.`,
        });
        setAmount('');
    } catch (error) {
         toast({
            title: 'Error',
            description: 'Failed to generate code.',
            variant: 'destructive',
        });
    }

    setIsGenerating(false);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Redeem Code</CardTitle>
          <CardDescription>
            Create a new code that users can redeem for virtual currency.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerateCode}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Code'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
