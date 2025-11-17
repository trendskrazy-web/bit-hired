
'use client';

import { InviteCard } from "@/components/app/account/invite-card";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/contexts/account-context";

export default function InvitePage() {
  const { referralCode } = useAccount();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Invite a Friend</h1>
        <p className="text-muted-foreground">
          Share your code and earn rewards when your friends join.
        </p>
      </div>
      <Separator />
      <div className="max-w-md mx-auto">
        <InviteCard referralCode={referralCode} />
      </div>
    </div>
  );
}
