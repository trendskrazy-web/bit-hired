
'use client';

import { Bell, Check, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/contexts/notification-context';
import Link from 'next/link';

export function NotificationBell() {
  const { notifications, markNotificationsAsRead } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && unreadCount > 0) {
      const unreadIds = recentNotifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
        markNotificationsAsRead(unreadIds);
      }
    }
  };


  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentNotifications.length > 0 ? (
          recentNotifications.map((notification) => (
            <DropdownMenuItem key={notification.id} asChild>
                <Link href="/admin/history" className={`flex items-start gap-3 ${!notification.read ? 'font-bold' : ''}`}>
                    <div className='pt-1'>
                        <Check className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm leading-tight whitespace-normal">{notification.message}</p>
                        <p className={`text-xs ${!notification.read ? 'text-blue-400' : 'text-muted-foreground'}`}>{formatTimeAgo(notification.createdAt)}</p>
                    </div>
                </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-2 text-sm text-muted-foreground">No new notifications.</p>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/history">
            <History className="mr-2 h-4 w-4" />
            <span>View All History</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
