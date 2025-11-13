"use client";

import { useAccount } from "@/contexts/account-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AdminNotificationsPage() {
  const { notifications } = useAccount();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          A log of all administrative actions.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Admin Action Log
          </CardTitle>
          <CardDescription>
            This inbox shows a history of all deposit approvals and declines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Admin ID</TableHead>
                <TableHead>Action Message</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{new Date(notification.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{notification.adminId}</TableCell>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={notification.read ? "secondary" : "default"}>
                        {notification.read ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No notifications yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
