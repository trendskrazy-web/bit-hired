
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/contexts/notification-context';
import { DataTable } from '@/components/admin/transactions/data-table';
import { columns } from '@/components/admin/history/columns';

export default function AdminHistoryPage() {
    const { notifications } = useNotifications();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Action History</CardTitle>
                    <CardDescription>
                        A log of all administrative actions taken, such as approvals and cancellations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={columns}
                        data={notifications}
                        filterColumn="message"
                        filterPlaceholder="Filter by action..."
                    />
                </CardContent>
            </Card>
        </div>
    )
}
