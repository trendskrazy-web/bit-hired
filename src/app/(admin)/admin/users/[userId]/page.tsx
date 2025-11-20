
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { UserAccount } from '@/contexts/account-context';
import { useMessages } from '@/contexts/message-context';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUserDetailsPage() {
  const { userId } = useParams();
  const firestore = useFirestore();
  const { sendMessage } = useMessages();
  const { toast } = useToast();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (firestore && userId) {
      const userDocRef = doc(firestore, 'users', userId as string);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as UserAccount);
          } else {
            console.log('No such user!');
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [firestore, userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTitle || !messageContent || !userId) {
        toast({ title: 'Error', description: 'Title and content are required.', variant: 'destructive'});
        return;
    };
    setIsSending(true);
    try {
        await sendMessage(userId as string, messageTitle, messageContent);
        toast({ title: 'Message Sent!', description: `Message sent to ${user?.name}.`});
        setMessageTitle('');
        setMessageContent('');
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive'});
    }
    setIsSending(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-24 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="space-y-6">
       <Button asChild variant="outline" size="sm">
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Users
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>User ID: {user.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Mobile:</strong> {user.mobileNumber}</p>
            <p><strong>Balance:</strong> KES {user.virtualBalance.toLocaleString()}</p>
            <p><strong>Referral Code:</strong> {user.referralCode || 'N/A'}</p>
            <p><strong>Invited By:</strong> {user.invitedBy || 'N/A'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Send Message</CardTitle>
            <CardDescription>Send a direct message to this user's inbox. Can be used for sending redeem codes.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSendMessage}>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="message-title">Title</Label>
                    <Input id="message-title" value={messageTitle} onChange={(e) => setMessageTitle(e.target.value)} placeholder="e.g., Your Weekly Bonus!" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message-content">Content</Label>
                    <Textarea id="message-content" value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Enter your message here. You can include a redeem code..." required />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isSending}>
                    {isSending ? 'Sending...' : 'Send Message'}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
