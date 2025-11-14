
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
      <Card>
        <CardHeader>
          <CardTitle>Manage Transactions</CardTitle>
          <CardDescription>
            The transaction management functionality has been temporarily disabled due to an error.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">We are working on a fix. Please check back later.</p>
        </CardContent>
      </Card>
    </div>
  );
}
