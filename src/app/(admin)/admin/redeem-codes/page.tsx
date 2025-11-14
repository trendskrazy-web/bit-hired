
'use client';

import { useState, useMemo } from 'react';
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
import { DataTable } from '@/components/app/transactions/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import type { RedeemCode } from '@/contexts/redeem-code-context';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const CopyButton = ({ value }: { value: string }) => {
    const { toast } = useToast();
    const handleCopy = () => {
      navigator.clipboard.writeText(value);
      toast({ title: 'Copied!', description: 'Code copied to clipboard.' });
    };
    return (
      <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
        <Copy className="h-3 w-3" />
      </Button>
    );
  };


const columns: ColumnDef<RedeemCode>[] = [
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
      header: 'Amount (KES)',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
        }).format(amount);
      },
    },
    {
      accessorKey: 'used',
      header: 'Status',
      cell: ({ row }) => {
        const used = row.getValue('used');
        return used ? (
          <Badge variant="destructive" className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />Used</Badge>
        ) : (
          <Badge variant="default" className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />Available</Badge>
        );
      },
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleString(),
    },
    {
        accessorKey: 'usedBy',
        header: 'Used By (UID)',
    },
    {
        accessorKey: 'usedAt',
        header: 'Used At',
        cell: ({ row }) => {
            const usedAt = row.getValue('usedAt');
            return usedAt ? new Date(usedAt as string).toLocaleString() : 'N/A';
        }
    },
  ];

export default function AdminRedeemCodesPage() {
  const [amount, setAmount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateCode, codes } = useRedeemCodes();
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
  
  const sortedCodes = useMemo(() => {
    return [...codes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [codes]);


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

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Redeem Codes</CardTitle>
          <CardDescription>
            A log of all generated redeem codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={sortedCodes} filterColumn='code' filterPlaceholder='Filter by code...' />
        </CardContent>
      </Card>
    </div>
  );
}
