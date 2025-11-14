
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/contexts/notification-context";
import { DataTable } from "@/components/admin/transactions/data-table";
import { columns } from "@/components/admin/history/columns";

export default function AdminHistoryPage() {
    const { notifications } = useNotifications();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Action History</CardTitle>
                <CardDescription>A log of all administrative actions performed in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={notifications}
                    filterColumn="message"
                    filterPlaceholder="Filter by action message..."
                />
            </CardContent>
        </Card>
    );
}
