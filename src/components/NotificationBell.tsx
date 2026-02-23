'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, limit } from 'firebase/firestore';
import type { AppNotification } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/notifications`),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [user, firestore]);

  const { data: notifications } = useCollection<AppNotification>(notificationsQuery);

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const markAsRead = async (notif: AppNotification) => {
    if (!notif.id || !user || notif.read || !firestore) return;
    const notifRef = doc(firestore, `users/${user.uid}/notifications`, notif.id);
    await updateDoc(notifRef, { read: true });
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto divide-y">
          {!notifications || notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No notifications yet
            </p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif)}
                className={cn(
                  'flex flex-col gap-1 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  !notif.read && 'bg-primary/5'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-medium leading-tight', !notif.read && 'text-primary')}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{notif.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
                {notif.link && (
                  <Link
                    href={notif.link}
                    className="text-xs text-primary hover:underline mt-0.5"
                    onClick={() => setIsOpen(false)}
                  >
                    View →
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
