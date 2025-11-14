
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useAccount } from '@/contexts/account-context';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NotificationMenu() {
  const { notifications, markNotificationAsRead } = useAccount();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel>Admin Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem key={notification.id} asChild onClick={() => handleNotificationClick(notification.id)}>
                <Link
                  href="/admin/notifications"
                  className={`flex flex-col items-start gap-1 whitespace-normal ${!notification.read ? 'font-bold' : ''}`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              <p className="text-sm text-center text-muted-foreground w-full">
                No notifications
              </p>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/admin/notifications"
            className="w-full justify-center"
          >
            View All Notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
