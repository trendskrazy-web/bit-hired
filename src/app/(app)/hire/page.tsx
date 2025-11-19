
import { MachineCard } from "@/components/app/hire/machine-card";
import { Separator } from "@/components/ui/separator";
import { getMachines } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default async function HirePage() {
  const machines = await getMachines();

  const getImage = (id: string) => {
    return PlaceHolderImages.find((img) => img.id === id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Hire a Mining Machine</h1>
        <p className="text-muted-foreground">
          Choose a machine to start your virtual mining journey.
        </p>
      </div>
      <Separator />
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            image={getImage(machine.id)}
          />
        ))}
      </div>
    </div>
  );
}
