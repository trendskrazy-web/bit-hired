"use client";

import { ActiveMachineCard } from "@/components/app/dashboard/active-machine-card";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/contexts/account-context";
import { CollectEarningsCard } from "@/components/app/dashboard/collect-earnings-card";
import { getMachines } from "@/lib/data";
import { useState, useEffect, useMemo } from 'react';
import type { Machine } from '@/lib/data';


export default function DashboardPage() {
  const { transactions, collectDailyEarnings, lastCollectedAt } = useAccount();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState(true);

   useEffect(() => {
    const fetchMachines = async () => {
      setIsLoadingMachines(true);
      const allMachines = await getMachines();
      setMachines(allMachines);
      setIsLoadingMachines(false);
    };
    fetchMachines();
  }, []);


  const activeTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.status === "Active"
    );
  }, [transactions]);

  const totalDailyEarnings = useMemo(() => {
     // Ensure machines are loaded and there are active transactions before calculating
     if (isLoadingMachines || !machines.length || !activeTransactions.length) {
       return 0;
     }
     
     return activeTransactions.reduce((total, transaction) => {
        const machine = machines.find(m => m.name === transaction.machineName);
        if (machine && machine.durations.length > 0) {
            const totalEarnings = machine.durations[0].totalEarnings;
            const daily = totalEarnings / 45; // All cycles are 45 days
            return total + daily;
        }
        return total;
     }, 0);
  }, [activeTransactions, machines, isLoadingMachines]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Hire a Miner. Earn Like a Pro.
        </p>
      </div>
      <Separator />

      <CollectEarningsCard 
        totalDailyEarnings={totalDailyEarnings}
        onCollect={() => collectDailyEarnings(totalDailyEarnings)}
        lastCollectedAt={lastCollectedAt}
        isLoading={isLoadingMachines}
      />

      <div className="grid gap-6 md:grid-cols-1">
        <h2 className="text-xl font-headline font-bold">Active Machines</h2>
        {activeTransactions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1">
            {activeTransactions.map((transaction) => (
              <ActiveMachineCard
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            You have no active mining machines. Go to the 'Hire Machines' page to get started.
          </p>
        )}
      </div>
    </div>
  );
}
