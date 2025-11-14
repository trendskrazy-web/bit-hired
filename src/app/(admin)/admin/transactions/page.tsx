
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-headline font-bold">Manage Transactions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            The transaction management functionality has been temporarily
            disabled due to an issue with data fetching.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
