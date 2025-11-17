'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "@/contexts/account-context";

// WhatsApp Icon Component
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.451-4.437-9.885-9.888-9.885-5.452 0-9.887 4.434-9.889 9.885-.001 2.225.651 4.315 1.731 6.086l.099.167-1.043 3.805 3.846-1.025.159.099zm.617-6.329c-.156-.078-.924-.46-1.068-.516-.144-.054-.247-.078-.35-.078-.102 0-.258.078-.393.195-.135.117-.504.621-.617.737-.113.117-.225.132-.42.054-.195-.078-.836-.31-1.59-1.002-.586-.549-.96-1.233-1.067-1.448-.108-.215-.011-.33.066-.408.066-.066.147-.175.225-.263.078-.087.102-.147.153-.247.051-.102.025-.175-.025-.252-.05-.078-.349-.84-.474-1.137-.125-.296-.25-.252-.349-.252-.099 0-.225.025-.349.054-.124.025-.299.117-.393.234-.094.117-.349.392-.349.961 0 .569.358 1.114.408 1.192.05.078.703 1.216 1.707 1.764.953.522 1.242.593 1.69.522.447-.072 1.252-.516 1.428-.994.175-.479.175-.888.124-.961-.051-.072-.156-.117-.312-.195z" />
  </svg>
);


export function InviteCard() {
    const { toast } = useToast();
    const { referralCode } = useAccount();
    const [inviteLink, setInviteLink] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && referralCode) {
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            setInviteLink(`${baseUrl}/register?ref=${referralCode}`);
        }
    }, [referralCode]);


    const handleCopy = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            toast({
                title: 'Copied!',
                description: 'Invitation link copied to clipboard.',
            });
        }
    };

    const handleWhatsAppShare = () => {
        if (inviteLink) {
            const message = encodeURIComponent(`Join me on BitHired and start earning! Use my link to sign up: ${inviteLink}`);
            const whatsappUrl = `https://wa.me/?text=${message}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    if (!referralCode) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Invite & Earn
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Your unique invitation link is being generated. Please wait a moment...</p>
                </CardContent>
            </Card>
        );
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
                        <Button variant="outline" size="icon" onClick={handleCopy} disabled={!inviteLink}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy link</span>
                        </Button>
                    </div>
                 </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                 <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={handleWhatsAppShare} disabled={!inviteLink}>
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    Share on WhatsApp
                </Button>
            </CardFooter>
        </Card>
    );
}
