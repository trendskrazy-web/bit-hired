
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/admin/transactions/data-table";
import { columns } from "@/components/admin/users/columns";
import { useAdminAccount } from "@/contexts/admin-account-context";

export default function AdminUsersPage() {
    const { allUsers } = useAdminAccount();

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>A list of all registered users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={allUsers}
                    filterColumn="name"
                    filterPlaceholder="Filter by name..."
                />
            </CardContent>
        </Card>
    );
}
