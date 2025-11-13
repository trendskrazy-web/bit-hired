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
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export function TopUpCard() {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [mpesaCode, setMpesaCode] = useState("");

  const generateRandomNumber = () => {
    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    setPhoneNumber(`+254 7${randomSuffix}`);
  };

  useEffect(() => {
    generateRandomNumber();
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaCode) {
        toast({
            title: "Error",
            description: "Please enter the MPESA confirmation code.",
            variant: "destructive",
        });
        return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setMpesaCode("");
      toast({
        title: "Success",
        description: "Your account has been credited successfully!",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Up with M-PESA</CardTitle>
        <CardDescription>Add funds to your virtual wallet.</CardDescription>
      </CardHeader>
      <form onSubmit={handleVerify}>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Send money to the following number using M-PESA Paybill or Send
              Money:
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
            <Label htmlFor="mpesa-code">M-PESA Confirmation Code</Label>
            <Input
              id="mpesa-code"
              placeholder="e.g. SFD345KMNL"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify & Top Up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
