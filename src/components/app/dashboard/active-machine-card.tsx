
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Cpu,
  TrendingUp,
  Wallet,
  DollarSign,
  Info
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { Transaction, Machine } from '@/lib/data';
import { useAccount } from '@/contexts/account-context';
import { getMachines } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActiveMachineCardProps {
  transaction: Transaction;
}

export function ActiveMachineCard({ transaction }: ActiveMachineCardProps) {
  const { updateTransactionStatus, cashOutFromMachine } = useAccount();
  const [machines, setMachines] = useState<Machine[]>([]);
  const { toast } = useToast();
  const [isCashingOut, setIsCashingOut] = useState(false);

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

  const purchaseDate = useMemo(() => new Date(transaction.date), [transaction.date]);
  const totalDurationSeconds = 45 * 24 * 60 * 60; // 45 days in seconds

  const { dailyEarning } = useMemo(() => {
    if (!machine) return { dailyEarning: 0 };
    const totalEarnings = machine.durations[0].totalEarnings;
    const daily = totalEarnings / 45;
    return { dailyEarning: daily };
  }, [machine]);
  
  const [timeRemaining, setTimeRemaining] = useState(() => {
     const elapsed = (new Date().getTime() - purchaseDate.getTime()) / 1000;
     return Math.max(0, totalDurationSeconds - elapsed);
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = (new Date().getTime() - purchaseDate.getTime()) / 1000;
      const remaining = totalDurationSeconds - elapsed;
      
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
  }, [transaction.id, transaction.status, updateTransactionStatus, purchaseDate, totalDurationSeconds]);

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '0d 0h 0m 0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const progressPercentage = ((totalDurationSeconds - timeRemaining) / totalDurationSeconds) * 100;

  // --- New, Robust Cash Out Logic ---
  const todayStr = new Date().toISOString().split('T')[0];
  const hireDate = new Date(transaction.date);
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
  const hasBeenActiveFor24h = new Date().getTime() - hireDate.getTime() >= twentyFourHoursInMs;
  const canCashOutToday = hasBeenActiveFor24h && transaction.lastCashedOutDate !== todayStr;
  
  const handleCashOut = () => {
    setIsCashingOut(true);
    try {
        cashOutFromMachine(transaction.id, dailyEarning);
        toast({
            title: 'Cash Out Successful!',
            description: `KES ${dailyEarning.toFixed(2)} has been added to your main balance.`
        });
    } catch(error) {
        toast({
            title: 'Cash Out Failed',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive'
        });
    } finally {
        setIsCashingOut(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-muted-foreground" />
            {transaction.machineName}
          </span>
          {timeRemaining > 0 ? (
            <span className="text-sm font-medium text-green-500 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Active
            </span>
          ) : (
            <span className="text-sm font-medium text-red-500">Expired</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
                <div>
                <p className="text-sm text-muted-foreground">Daily Earning</p>
                <p className="font-semibold">KES {dailyEarning.toFixed(2)}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-muted-foreground" />
                <div>
                <p className="text-sm text-muted-foreground">Total Cashed Out</p>
                <p className="font-semibold">KES {(transaction.totalCashedOut || 0).toFixed(2)}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-muted-foreground" />
                <div>
                <p className="text-sm text-muted-foreground">Available to Cash Out</p>
                <p className="font-semibold text-primary">KES {canCashOutToday ? dailyEarning.toFixed(2) : '0.00'}</p>
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
        </div>
        
        <div>
          <Progress value={progressPercentage} className="w-full h-2 mt-4" />
          <p className="text-xs text-right text-muted-foreground mt-1">
            {progressPercentage.toFixed(2)}% Complete
          </p>
        </div>

        <div className="flex justify-end items-center gap-2 pt-4">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">You can cash out your daily earnings once per day after the first 24 hours of hiring.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Button
                onClick={handleCashOut}
                disabled={!canCashOutToday || isCashingOut}
            >
                {isCashingOut ? 'Processing...' : 'Cash Out'}
            </Button>
        </div>

      </CardContent>
    </Card>
  );
}
