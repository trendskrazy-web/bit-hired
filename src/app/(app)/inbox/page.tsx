
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMessages } from '@/contexts/message-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useState } from 'react';
import type { UserMessage } from '@/contexts/message-context';
import { Button } from '@/components/ui/button';
import { Mail, MailOpen, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InboxPage() {
  const { messages, markMessageAsRead } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);
  const { toast } = useToast();

  const handleMessageClick = (message: UserMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
      markMessageAsRead(message.id);
    }
  };
  
  const handleCopy = () => {
    if (selectedMessage?.content) {
        navigator.clipboard.writeText(selectedMessage.content);
        toast({
            title: "Content Copied",
            description: "The message content has been copied to your clipboard.",
        })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " year(s) ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " month(s) ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " day(s) ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hour(s) ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minute(s) ago";
    return Math.floor(seconds) + " second(s) ago";
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-headline font-bold">Inbox</h1>
          <p className="text-muted-foreground">
            Messages from the admin team.
          </p>
        </div>
        <Separator />
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <li
                    key={message.id}
                    className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50 ${
                      !message.read ? 'font-bold bg-muted/20' : ''
                    }`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="pt-1">
                      {!message.read ? <Mail className="h-5 w-5 text-primary" /> : <MailOpen className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 grid gap-1">
                        <div className="flex items-center justify-between">
                            <p className="truncate">{message.title}</p>
                            <time className="text-xs text-muted-foreground font-normal">
                                {formatTimeAgo(message.createdAt)}
                            </time>
                        </div>
                         <p className="text-sm text-muted-foreground font-normal line-clamp-2">{message.content}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-6 text-center text-muted-foreground">
                  Your inbox is empty.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMessage?.title}</DialogTitle>
            <DialogDescription>
              Received: {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
            {selectedMessage?.content}
          </div>
          <DialogFooter className='sm:justify-start gap-2'>
            <Button type="button" variant="secondary" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Content
            </Button>
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
