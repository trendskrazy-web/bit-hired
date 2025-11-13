"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bitcoin, Clock, Cpu, Wallet } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, Machine } from "@/lib/data";
import { useAccount } from "@/contexts/account-context";
import { getMachines } from "@/lib/data";

interface ActiveMachineCardProps {
  transaction: Transaction;
}

export function ActiveMachineCard({ transaction }: ActiveMachineCardProps) {
  const { toast } = useToast();
  const { addBalance, updateTransactionStatus } = useAccount();
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    const fetchMachines = async () => {
      const allMachines = await getMachines();
      setMachines(allMachines);
    };
    fetchMachines();
  }, []);

  const machine = useMemo(
    () => machines.find((m) => m.name === transaction.machineName),
    [machines, transaction.machineName]
  );
  
  const dailyEarning = useMemo(() => {
    if (!machine) return 0;
    const days = 45;
    return machine.durations[0].totalEarnings / days;
  }, [machine]);

  const totalDuration = 45 * 24 * 60 * 60; // 45 days in seconds
  
  const getElapsedTime = () => {
     const purchaseDate = new Date(transaction.date);
     const now = new Date();
     return Math.floor((now.getTime() - purchaseDate.getTime()) / 1000);
  }

  const [timeRemaining, setTimeRemaining] = useState(totalDuration - getElapsedTime());
  const [earnings, setEarnings] = useState(0);
  const [cashedOutAmount, setCashedOutAmount] = useState(0);
  const [lastCashOutDate, setLastCashOutDate] = useState<Date | null>(null);
  const [canCashOut, setCanCashOut] = useState(false);
  
  const purchaseDate = new Date(transaction.date);
  const twentyFourHoursAfterPurchase = new Date(purchaseDate.getTime() + 24 * 60 * 60 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // Time is up, update status
          if (transaction.status === "Active") {
            updateTransactionStatus(transaction.id, "Expired");
          }
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [transaction.id, transaction.status, updateTransactionStatus]);
  
  useEffect(() => {
    if (dailyEarning > 0) {
      const earningsTimer = setInterval(() => {
        const elapsedSeconds = totalDuration - timeRemaining;
        const currentEarnings = (elapsedSeconds / (24 * 3600)) * dailyEarning;
        setEarnings(currentEarnings);
      }, 1000);
      return () => clearInterval(earningsTimer);
    }
  }, [timeRemaining, dailyEarning, totalDuration]);


  useEffect(() => {
    const checkCashOutStatus = () => {
      const today = new Date();
      const isAfter24Hours = today > twentyFourHoursAfterPurchase;
      const hasNotCashedOutToday = !lastCashOutDate || lastCashOutDate.toDateString() !== today.toDateString();
      
      setCanCashOut(isAfter24Hours && hasNotCashedOutToday && timeRemaining > 0);
    };

    checkCashOutStatus();
    const interval = setInterval(checkCashOutStatus, 60000);
    return () => clearInterval(interval);
  }, [lastCashOutDate, twentyFourHoursAfterPurchase, timeRemaining]);

  const handleCashOut = () => {
    const availableToCashOut = earnings - cashedOutAmount;

    if (availableToCashOut > 0 && canCashOut) {
      const cashOutAmount = availableToCashOut; 
      addBalance(cashOutAmount);
      setCashedOutAmount(prev => prev + cashOutAmount);
      setLastCashOutDate(new Date());
      setCanCashOut(false);
      
      toast({
        title: "Cash Out Successful!",
        description: `You've cashed out KES ${cashOutAmount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. It has been added to your main account balance.`,
      });
    } else if (!canCashOut) {
         toast({
            title: "Cash Out Unavailable",
            description: "You can only cash out once per day, 24 hours after hiring the machine, and only while it's active.",
            variant: "destructive",
        });
    } else {
      toast({
        title: "No Earnings to Cash Out",
        description: "Not enough earnings have accumulated to cash out.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 0) seconds = 0;
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
           {timeRemaining > 0 ? (
            <span className="text-sm font-medium text-green-500 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Mining
            </span>
          ) : (
             <span className="text-sm font-medium text-red-500">Expired</span>
          )}
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
              <p className="font-semibold font-mono">KES {earnings.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
                 <Wallet className="w-6 h-6 text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Available Earnings</p>
                    <p className="font-semibold font-mono">KES {availableToCashOut.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
