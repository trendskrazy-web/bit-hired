import { TopUpCard } from "@/components/app/account/top-up-card";
import { WithdrawCard } from "@/components/app/account/withdraw-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Account</h1>
        <p className="text-muted-foreground">
          Manage your account settings and fund your wallet.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mobile Number</span>
                <span className="font-medium">+254 712 345 678</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Balance</span>
                <span className="font-medium text-primary">KES 1,234.56</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">Jan 1, 2024</span>
              </div>
            </CardContent>
          </Card>
          <WithdrawCard />
        </div>
        <div className="lg:col-span-1">
          <TopUpCard />
        </div>
      </div>
    </div>
  );
}