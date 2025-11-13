"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bitcoin, Clock, Cpu, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@/lib/data";
import { useAccount } from "@/contexts/account-context";

interface ActiveMachineCardProps {
    transaction: Transaction;
}

export function ActiveMachineCard({ transaction }: ActiveMachineCardProps) {
  const { toast } = useToast();
  const { addBalance } = useAccount();
  
  const getDays = (durationStr: string) => {
    if (durationStr.includes("Month")) {
        return 30;
    }
    const days = parseInt(durationStr.split(" ")[0]);
    return isNaN(days) ? 30 : days;
  }
  
  const totalDuration = getDays(transaction.duration) * 24 * 60 * 60; // duration in seconds
  const [timeRemaining, setTimeRemaining] = useState(totalDuration - 3600 * 5); // 5 hours passed
  const [earnings, setEarnings] = useState(0.0012);
  const [cashedOutAmount, setCashedOutAmount] = useState(0);
  const [lastCashOutDate, setLastCashOutDate] = useState<Date | null>(null);
  const [canCashOut, setCanCashOut] = useState(false);

  const purchaseDate = new Date(transaction.date);
  const twentyFourHoursAfterPurchase = new Date(purchaseDate.getTime() + 24 * 60 * 60 * 1000);


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      setEarnings((prev) => prev + 0.0000001);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkCashOutStatus = () => {
      const today = new Date();
      const isAfter24Hours = today > twentyFourHoursAfterPurchase;
      const hasNotCashedOutToday = !lastCashOutDate || lastCashOutDate.toDateString() !== today.toDateString();
      
      setCanCashOut(isAfter24Hours && hasNotCashedOutToday);
    };

    checkCashOutStatus();
    // Check every minute to see if it's a new day or if 24hr mark passed
    const interval = setInterval(checkCashOutStatus, 60000);
    return () => clearInterval(interval);
  }, [lastCashOutDate, twentyFourHoursAfterPurchase]);

  const handleCashOut = () => {
    const availableToCashOut = earnings - cashedOutAmount;
    if (availableToCashOut > 0 && canCashOut) {
      // For demonstration, let's say 1 BTC = 9,000,000 KES
      const amountInKES = availableToCashOut * 9000000;
      addBalance(amountInKES);
      
      setCashedOutAmount(earnings);
      setLastCashOutDate(new Date());
      setCanCashOut(false);
      
      toast({
        title: "Cash Out Successful!",
        description: `You've cashed out ${availableToCashOut.toFixed(8)} BTC (approx. KES ${amountInKES.toLocaleString()}). It has been added to your main account balance and is available for withdrawal.`,
      });
    } else if (!canCashOut) {
         toast({
            title: "Cash Out Unavailable",
            description: "You can only cash out once per day, 24 hours after hiring the machine.",
            variant: "destructive",
        });
    } else {
      toast({
        title: "No Earnings to Cash Out",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const progressPercentage = ((totalDuration - timeRemaining) / totalDuration) * 100;
  const availableToCashOut = earnings - cashedOutAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Mining Session</span>
          <span className="text-sm font-medium text-green-500 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Mining
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center space-x-3">
            <Cpu className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Machine</p>
              <p className="font-semibold">{transaction.machineName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <p className="font-semibold font-mono">{formatDuration(timeRemaining)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Bitcoin className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="font-semibold font-mono">{earnings.toFixed(8)} BTC</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
                 <Wallet className="w-6 h-6 text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Available Earnings</p>
                    <p className="font-semibold font-mono">{availableToCashOut.toFixed(8)} BTC</p>
                </div>
            </div>
            <Button onClick={handleCashOut} size="sm" disabled={!canCashOut || availableToCashOut <= 0}>Cash Out</Button>
        </div>
        <div>
          <Progress value={progressPercentage} className="w-full h-2 mt-4" />
           <p className="text-xs text-right text-muted-foreground mt-1">{progressPercentage.toFixed(2)}% Complete</p>
        </div>
      </CardContent>
    </Card>
  );
}
