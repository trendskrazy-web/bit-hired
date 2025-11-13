import { DashboardClient } from "@/components/app/dashboard/dashboard-client";
import { ProfitProjectionCard } from "@/components/app/dashboard/profit-projection-card";
import { Separator } from "@/components/ui/separator";
import { getMachines } from "@/lib/data";

export default async function DashboardPage() {
  const machines = await getMachines();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your mining operations.
        </p>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardClient />
      </div>
      <div className="pt-6">
        <ProfitProjectionCard machines={machines} />
      </div>
    </div>
  );
}
