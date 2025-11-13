import { ActiveMachineCard } from "@/components/app/dashboard/active-machine-card";
import { ProfitProjectionCard } from "@/components/app/dashboard/profit-projection-card";
import { Separator } from "@/components/ui/separator";
import { getMachines, getTransactions } from "@/lib/data";

export default async function DashboardPage() {
  const machines = await getMachines();
  const transactions = await getTransactions();
  const activeTransactions = transactions.filter(
    (t) => t.status === "Active"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your mining operations.
        </p>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-1">
        <h2 className="text-xl font-headline font-bold">Active Machines</h2>
        {activeTransactions.length > 0 ? (
          activeTransactions.map((transaction) => (
            <ActiveMachineCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <p className="text-muted-foreground">
            You have no active mining machines.
          </p>
        )}
      </div>
      <div className="pt-6">
        <ProfitProjectionCard machines={machines} />
      </div>
    </div>
  );
}
