"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/contexts/account-context";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export function TopUpCard() {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const { addDeposit } = useAccount();

  const generateRandomNumber = () => {
    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    setPhoneNumber(`+254 7${randomSuffix}`);
  };

  useEffect(() => {
    generateRandomNumber();
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode) {
        toast({
            title: "Error",
            description: "Please enter the redeem code.",
            variant: "destructive",
        });
        return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const topUpAmount = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
      
      addDeposit({
        amount: topUpAmount,
        date: new Date().toISOString().split("T")[0],
        redeemCode: redeemCode,
        status: "Completed"
      });

      setIsVerifying(false);
      setRedeemCode("");
      toast({
        title: "Success!",
        description: `KES ${topUpAmount.toLocaleString()} has been credited to your account.`,
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redeem a Code</CardTitle>
        <CardDescription>Enter a code to add funds to your wallet.</CardDescription>
      </CardHeader>
      <form onSubmit={handleVerify}>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              To get a redeem code, send money to the following number using M-PESA Paybill or Send Money:
            </p>
            <div className="flex items-center justify-between p-3 my-2 bg-secondary rounded-md">
              <p className="font-mono text-lg font-semibold">{phoneNumber}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={generateRandomNumber}
                aria-label="Generate new number"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="redeem-code">Redeem Code</Label>
            <Input
              id="redeem-code"
              placeholder="e.g. SFD345KMNL"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Redeem & Top Up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
