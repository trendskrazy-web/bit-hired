
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy } from "lucide-react";
import { useEffect, useState } from "react";

interface InviteCardProps {
    referralCode?: string;
}

export function InviteCard({ referralCode }: InviteCardProps) {
    const { toast } = useToast();
    const [inviteLink, setInviteLink] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && referralCode) {
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            setInviteLink(`${baseUrl}/register?ref=${referralCode}`);
        }
    }, [referralCode]);


    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        toast({
            title: 'Copied!',
            description: 'Invitation link copied to clipboard.',
        });
    };

    const handleWhatsAppShare = () => {
        const message = encodeURIComponent(`Join me on BitHired and start earning! Use my link to sign up: ${inviteLink}`);
        const whatsappUrl = `https://wa.me/?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    if (!referralCode) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Invite & Earn
                </CardTitle>
                <CardDescription>
                    Share your unique link with friends to invite them to BitHired.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <p className="text-sm font-medium">Your Invite Link</p>
                    <div className="flex gap-2">
                        <Input value={inviteLink} readOnly />
                        <Button variant="outline" size="icon" onClick={handleCopy}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleWhatsAppShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share on WhatsApp
                </Button>
            </CardFooter>
        </Card>
    );
}

    