
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { Transaction, Machine } from '@/lib/data';
import { useAccount } from '@/contexts/account-context';
import { getMachines } from '@/lib/data';

interface ActiveMachineCardProps {
  transaction: Transaction;
}

export function ActiveMachineCard({ transaction }: ActiveMachineCardProps) {
  const { updateTransactionStatus } = useAccount();
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

  const purchaseDate = useMemo(() => new Date(transaction.date), [transaction.date]);
  const totalDurationSeconds = 45 * 24 * 60 * 60; // 45 days in seconds

  const { totalPotentialEarnings } = useMemo(() => {
    if (!machine) return { totalPotentialEarnings: 0 };
    return { totalPotentialEarnings: machine.durations[0].totalEarnings };
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
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
            <TrendingUp className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                Total Potential Earnings
              </p>
              <p className="font-semibold font-mono">
                KES{' '}
                {totalPotentialEarnings.toLocaleString('en-KE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
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
      </CardContent>
    </Card>
  );
}
