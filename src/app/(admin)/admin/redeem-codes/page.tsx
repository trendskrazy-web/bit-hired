'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RedeemCode, useRedeemCodes } from '@/contexts/redeem-code-context';
import { DataTable } from '@/components/app/transactions/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const CopyButton = ({ value }: { value: string }) => {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: 'Copied!',
      description: 'Redeem code copied to clipboard.',
    });
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-6 w-6"
    >
      <Copy className="h-3 w-3" />
    </Button>
  );
};

const redeemCodeColumns: ColumnDef<RedeemCode>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => {
      const code = row.getValue('code') as string;
      return (
        <div className="flex items-center gap-2 font-mono text-sm">
          <span>{code}</span>
          <CopyButton value={code} />
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'used',
    header: 'Status',
    cell: ({ row }) => {
      const used = row.getValue('used') as boolean;
      return (
        <Badge variant={used ? 'destructive' : 'default'}>
          {used ? 'Used' : 'Available'}
        </Badge>
      );
    },
  },
];

export default function AdminRedeemCodesPage() {
  const { codes, generateCodes } = useRedeemCodes();
  const { toast } = useToast();
  const [count, setCount] = useState('1');
  const [amount, setAmount] = useState('100');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const numCount = parseInt(count);
    const numAmount = parseInt(amount);

    if (isNaN(numCount) || numCount <= 0) {
      toast({
        title: 'Invalid Count',
        description: 'Please enter a valid number of codes to generate.',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount for the codes.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const newCodes = generateCodes(numCount, numAmount);
      toast({
        title: 'Codes Generated!',
        description: `${newCodes.length} new redeem codes have been created.`,
      });
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Redeem Codes</CardTitle>
          <CardDescription>
            Create new redeem codes for users to top up their balance.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerate}>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code-count">Number of Codes</Label>
              <Input
                id="code-count"
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code-amount">Amount (KES)</Label>
              <Input
                id="code-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Codes'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Existing Redeem Codes</CardTitle>
          <CardDescription>A list of all generated codes.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={redeemCodeColumns}
            data={codes}
            filterColumn="code"
            filterPlaceholder="Filter by code..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
