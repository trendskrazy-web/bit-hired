
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift } from "lucide-react";

interface InviteCardProps {
    referralCode?: string;
}

export function InviteCard({ referralCode }: InviteCardProps) {
    const { toast } = useToast();

    const handleCopy = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            toast({
                title: "Copied!",
                description: "Your referral code has been copied to your clipboard.",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Your Invitation Code
                </CardTitle>
                <CardDescription>
                    Share this code with your friends. They can enter it when they sign up.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <Input 
                        value={referralCode || "Generating..."} 
                        readOnly 
                        className="pr-12 text-lg font-mono tracking-widest"
                        aria-label="Your referral code"
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={handleCopy}
                        disabled={!referralCode}
                    >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy code</span>
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">
                    Rewards are applied after their first successful machine hire.
                </p>
            </CardFooter>
        </Card>
    );
}
