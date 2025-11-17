
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase";

interface InviteCardProps {
    referralCode?: string;
}

// Simple component for the WhatsApp icon
const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);


export function InviteCard({ referralCode }: InviteCardProps) {
    const { toast } = useToast();
    const [inviteLink, setInviteLink] = useState('');
    const { user } = useUser();

    useEffect(() => {
        if (typeof window !== 'undefined' && referralCode) {
            const currentUrl = window.location.origin;
            setInviteLink(`${currentUrl}/register?ref=${referralCode}`);
        }
    }, [referralCode]);

    const handleCopy = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        toast({
            title: "Link Copied!",
            description: "Your invite link has been copied to the clipboard.",
        });
    };

    const handleShare = () => {
        if (!inviteLink) return;
        const message = `Join me on BitHired and start earning! Use my link to register: ${inviteLink}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Invite & Earn
                </CardTitle>
                <CardDescription>
                    Share your unique link with friends. When they sign up, you get rewarded!
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Your unique invitation link:
                </p>
                <div className="flex w-full items-center space-x-2">
                    <Input
                        id="invite-link"
                        value={inviteLink || "Generating link..."}
                        readOnly
                    />
                    <Button type="button" size="icon" onClick={handleCopy} disabled={!inviteLink}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy Link</span>
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground">
                    Your friend will have the invitation code automatically applied during registration.
                </p>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleShare} disabled={!inviteLink}>
                    <WhatsAppIcon />
                    Share on WhatsApp
                </Button>
            </CardFooter>
        </Card>
    );
}

