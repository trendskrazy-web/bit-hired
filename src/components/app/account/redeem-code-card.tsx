
"use client";

import { useState } from "react";
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
import { useRedeemCodes } from "@/contexts/redeem-code-context";
import { useAccount } from "@/contexts/account-context";
import { Gift } from "lucide-react";

export function RedeemCodeCard() {
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { redeemCode, markCodeAsUsed } = useRedeemCodes();
  const { addBalance } = useAccount();

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast({
        title: "Invalid Code",
        description: "Please enter a redeem code.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate network delay
    setTimeout(() => {
      const result = redeemCode(code);

      if (result.success) {
        addBalance(result.amount);
        markCodeAsUsed(code);
        toast({
          title: "Success!",
          description: `KES ${result.amount.toLocaleString()} has been added to your account.`,
        });
        setCode("");
      } else {
        toast({
          title: "Redemption Failed",
          description: result.message,
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Redeem a Code
        </CardTitle>
        <CardDescription>
          Have a redeem code? Enter it below to top up your balance.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRedeem}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="redeem-code">Redeem Code</Label>
            <Input
              id="redeem-code"
              placeholder="Enter your code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Redeeming..." : "Redeem Now"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
