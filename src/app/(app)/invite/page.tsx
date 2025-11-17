'use client';

import { InviteCard } from '@/components/app/account/invite-card';
import { Separator } from '@/components/ui/separator';

export default function InvitePage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-headline font-bold">Invite & Earn</h1>
        <p className="text-muted-foreground">
          Share your unique link with friends to invite them to BitHired.
        </p>
      </div>
      <Separator />
      <InviteCard />
    </div>
  );
}
