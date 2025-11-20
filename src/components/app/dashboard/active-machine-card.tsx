
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Cpu,
  Wallet,
  TrendingUp,
  Landmark,
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, Machine } from '@/lib/data';
import { useAccount } from '@/contexts/account-context';
import { getMachines } from '@/lib/data';

interface ActiveMachineCardProps {
  transaction: Transaction;
}

export function ActiveMachineCard({ transaction }: ActiveMachineCardProps) {
  const { toast } = useToast();
  const { addBalance, updateTransactionStatus } = useAccount();
  const [machines, setMachines] = useState<Machine[]>([]);

  // State to track earnings and cash-out history for this specific machine
  const [cashedOutAmount, setCashedOutAmount] = useState(0); 
  const [lastCashOutDate, setLastCashOutDate] = useState<Date | null>(null);

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

  const { dailyEarning, totalPotentialEarnings } = useMemo(() => {
    if (!machine) return { dailyEarning: 0, totalPotentialEarnings: 0 };
    const days = 45;
    const totalEarnings = machine.durations[0].totalEarnings;
    const daily = totalEarnings / days;
    return { dailyEarning: daily, totalPotentialEarnings: totalEarnings };
  }, [machine]);

  const totalDuration = 45 * 24 * 60 * 60; // 45 days in seconds
  const purchaseDate = useMemo(
    () => new Date(transaction.date),
    [transaction.date]
  );

  const getElapsedTime = useCallback(() => {
    const now = new Date();
    return Math.floor((now.getTime() - purchaseDate.getTime()) / 1000);
  }, [purchaseDate]);

  const [timeRemaining, setTimeRemaining] = useState(
    totalDuration - getElapsedTime()
  );
  
  // Timer for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = totalDuration - getElapsedTime();
      if (remaining > 0) {
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(0);
        if (transaction.status === 'Active') {
          updateTransactionStatus(transaction.id, 'Expired');
        }
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [transaction.id, transaction.status, updateTransactionStatus, totalDuration, getElapsedTime]);

  // Determine if a cash out is possible today
  const canCashOutToday = useMemo(() => {
    if (!lastCashOutDate) {
      return true; // Never cashed out before
    }
    const now = new Date();
    // Compare just the date part, ignoring time
    return now.toDateString() !== lastCashOutDate.toDateString();
  }, [lastCashOutDate]);

  // Determine if at least 24 hours have passed since purchase
  const hasBeenActiveFor24h = useMemo(() => {
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return new Date().getTime() - purchaseDate.getTime() >= oneDayInMs;
  }, [purchaseDate]);
  
  // Calculate the amount available to be cashed out
  const availableToCashOut = useMemo(() => {
    if (timeRemaining <= 0 || !canCashOutToday || !hasBeenActiveFor24h) {
      return 0;
    }
    // Capped at daily earning
    return dailyEarning;
  }, [dailyEarning, timeRemaining, canCashOutToday, hasBeenActiveFor24h]);

  const handleCashOut = () => {
    if (availableToCashOut > 0) {
      addBalance(availableToCashOut);
      setCashedOutAmount((prev) => prev + availableToCashOut);
      setLastCashOutDate(new Date());

      toast({
        title: 'Cash Out Successful!',
        description: `You've cashed out KES ${availableToCashOut.toLocaleString(
          'en-KE',
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}. It has been added to your main account balance.`,
      });
    } else {
      toast({
        title: 'Cash Out Unavailable',
        description:
          'You can cash out your daily earnings once per calendar day, after the first 24 hours of operation.',
        variant: 'destructive',
      });
    }
  };
  
  const remainingPotentialEarnings = useMemo(() => {
    if (!machine) return 0;
    const remaining = totalPotentialEarnings - cashedOutAmount;
    return remaining > 0 ? remaining : 0;
  }, [totalPotentialEarnings, cashedOutAmount, machine]);

  const formatDuration = (seconds: number) => {
    if (seconds < 0) seconds = 0;
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const progressPercentage =
    ((totalDuration - timeRemaining) / totalDuration) * 100;

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
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
              <p className="font-semibold font-mono">
                {formatDuration(timeRemaining)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Landmark className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Cashed Out</p>
              <p className="font-semibold font-mono">
                KES{' '}
                {cashedOutAmount.toLocaleString('en-KE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                Remaining Potential
              </p>
              <p className="font-semibold font-mono">
                KES{' '}
                {remainingPotentialEarnings.toLocaleString('en-KE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                Available to Cash Out
              </p>
              <p className="font-semibold font-mono">
                KES{' '}
                {availableToCashOut.toLocaleString('en-KE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <Button
            onClick={handleCashOut}
            size="sm"
            disabled={availableToCashOut <= 0}
          >
            Cash Out
          </Button>
        </div>
        <div>
          <Progress value={progressPercentage} className="w-full h-2 mt-4" />
          <p className="text-xs text-right text-muted-foreground mt-1">
            {progressPercentage.toFixed(2)}% Complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
