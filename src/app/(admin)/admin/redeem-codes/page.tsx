
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
import { DataTable } from '@/components/admin/transactions/data-table';
import { columns } from '@/components/admin/redeem-codes/columns';

export default function AdminRedeemCodesPage() {
  const [amount, setAmount] = useState('');
  const [count, setCount] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateCodes, codes } = useRedeemCodes();
  const { toast } = useToast();

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numCount = parseInt(count, 10);
    if (!numAmount || numAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount.',
        variant: 'destructive',
      });
      return;
    }
     if (!numCount || numCount <= 0) {
      toast({
        title: 'Invalid Count',
        description: 'Please enter a valid number of codes to generate.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
        await generateCodes(numAmount, numCount);
        toast({
            title: 'Codes Generated',
            description: `${numCount} new code(s) for KES ${numAmount} created.`,
        });
        setAmount('');
        setCount('1');
    } catch (error) {
         toast({
            title: 'Error',
            description: 'Failed to generate codes.',
            variant: 'destructive',
        });
    }

    setIsGenerating(false);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Redeem Codes</CardTitle>
          <CardDescription>
            Create new codes that users can redeem for virtual currency.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerateCode}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) per Code</Label>
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
             <div className="space-y-2">
              <Label htmlFor="count">Number of Codes</Label>
              <Input
                id="count"
                type="number"
                placeholder="e.g., 10"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
                min="1"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? `Generating ${count} Codes...` : `Generate ${count} Code(s)`}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Redeem Codes</CardTitle>
          <CardDescription>
            A list of all generated codes and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <DataTable
            columns={columns}
            data={codes}
            filterColumn="code"
            filterPlaceholder="Filter by code..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
