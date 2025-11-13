"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bitcoin, Clock, Cpu, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function DashboardClient() {
  const { toast } = useToast();
  const totalDuration = 3 * 24 * 60 * 60; // 3 days in seconds
  const [timeRemaining, setTimeRemaining] = useState(totalDuration - 3600 * 5); // 5 hours passed
  const [earnings, setEarnings] = useState(0.0012);
  const [cashedOutAmount, setCashedOutAmount] = useState(0);
  const [lastCashOutDate, setLastCashOutDate] = useState<Date | null>(null);
  const [canCashOut, setCanCashOut] = useState(true);

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
      if (lastCashOutDate && lastCashOutDate.toDateString() === today.toDateString()) {
        setCanCashOut(false);
      } else {
        setCanCashOut(true);
      }
    };

    checkCashOutStatus();
    // Check every minute to see if it's a new day
    const interval = setInterval(checkCashOutStatus, 60000);
    return () => clearInterval(interval);
  }, [lastCashOutDate]);

  const handleCashOut = () => {
    const cashOutable = earnings - cashedOutAmount;
    if (cashOutable > 0) {
      setCashedOutAmount(earnings);
      setLastCashOutDate(new Date());
      setCanCashOut(false);
      toast({
        title: "Cash Out Successful!",
        description: `You've cashed out ${cashOutable.toFixed(8)} BTC. You can cash out again tomorrow.`,
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

  return (
    <Card className="md:col-span-2 lg:col-span-3">
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
              <p className="font-semibold">Antminer S19 Pro</p>
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
              <p className="text-sm text-muted-foreground">Potential Earnings</p>
              <p className="font-semibold font-mono">{earnings.toFixed(8)} BTC</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
                 <Wallet className="w-6 h-6 text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Available to Cash Out</p>
                    <p className="font-semibold font-mono">{(earnings - cashedOutAmount).toFixed(8)} BTC</p>
                </div>
            </div>
            <Button onClick={handleCashOut} size="sm" disabled={!canCashOut}>Cash Out</Button>
        </div>
        <div>
          <Progress value={progressPercentage} className="w-full h-2 mt-4" />
           <p className="text-xs text-right text-muted-foreground mt-1">{progressPercentage.toFixed(2)}% Complete</p>
        </div>
      </CardContent>
    </Card>
  );
}
