
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Deposit, type Withdrawal } from '@/contexts/transaction-context';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RecentTransactionsCardProps {
  title: string;
  transactions: (Deposit | Withdrawal)[];
  type: 'deposit' | 'withdrawal';
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
  completed: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
};

const statusVariants: Record<string, 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
};

export function RecentTransactionsCard({ title, transactions, type }: RecentTransactionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    KES {tx.amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <Badge variant={statusVariants[tx.status]} className="capitalize">
                  {statusIcons[tx.status]}
                  {tx.status}
                </Badge>
              </div>
            ))}
             <div className="pt-4 flex justify-end">
                <Button variant="link" asChild>
                    <Link href="/transactions">View All</Link>
                </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No recent {type} transactions found.</p>
        )}
      </CardContent>
    </Card>
  );
}
