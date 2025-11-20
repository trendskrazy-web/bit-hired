
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/admin/transactions/data-table';
import { columns } from '@/components/admin/users/columns';
import { useAdminAccounts } from '@/contexts/admin-account-context';


export default function AdminUsersPage() {
    const { allUsers, isLoading } = useAdminAccounts();

    if (isLoading) {
        return <div>Loading all users...</div>
    }

    return (
        <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
                View and manage all user accounts in the system.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <DataTable
                columns={columns}
                data={allUsers}
                filterColumn="email"
                filterPlaceholder="Filter by user email..."
            />
            </CardContent>
        </Card>
        </div>
    );
}
