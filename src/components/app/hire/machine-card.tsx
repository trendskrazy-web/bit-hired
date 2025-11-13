"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Machine, DurationOption } from "@/lib/data";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { Bitcoin, Cpu, Zap, Wallet } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";

interface MachineCardProps {
  machine: Machine;
  image?: ImagePlaceholder;
}

export function MachineCard({ machine, image }: MachineCardProps) {
  const { toast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(
    machine.durations[0]
  );
  const [isHiring, setIsHiring] = useState(false);

  const potentialEarnings = useMemo(() => {
    let days = 0;
    if (selectedDuration.label === "3 Days") {
      days = 3;
    } else if (selectedDuration.label === "1 Week") {
      days = 7;
    } else if (selectedDuration.label === "1 Month") {
      days = 30;
    }
    // Simplified earnings calculation: (hashrate * days * magic_number)
    const earnings = (machine.miningRate / 100) * days * 0.00001;
    return earnings.toFixed(8);
  }, [selectedDuration, machine.miningRate]);


  const handleHire = (e: React.FormEvent) => {
    e.preventDefault();
    setIsHiring(true);
    setTimeout(() => {
      setIsHiring(false);
      toast({
        title: "Machine Hired!",
        description: `You have successfully hired the ${machine.name} for ${selectedDuration.label}.`,
      });
    }, 1500);
  };

  const handleDurationChange = (label: string) => {
    const newDuration = machine.durations.find((d) => d.label === label);
    if (newDuration) {
      setSelectedDuration(newDuration);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        {image && (
          <div className="overflow-hidden rounded-lg mb-4">
            <Image
              src={image.imageUrl}
              alt={machine.name}
              width={600}
              height={400}
              className="object-cover aspect-[3/2] hover:scale-105 transition-transform duration-300"
              data-ai-hint={image.imageHint}
            />
          </div>
        )}
        <CardTitle className="font-headline">{machine.name}</CardTitle>
        <CardDescription>{machine.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="w-4 h-4" /> Mining Rate
          </span>
          <span className="font-semibold">{machine.miningRate} TH/s</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-4 h-4" /> Power
          </span>
          <span className="font-semibold">{machine.power} W</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="w-4 h-4" /> Potential Earnings
          </span>
          <span className="font-semibold font-mono flex items-center gap-1">
             <Bitcoin className="w-3 h-3" /> {potentialEarnings}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleHire} className="w-full space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor={`duration-${machine.id}`}>Select Duration</Label>
            <Select
              value={selectedDuration.label}
              onValueChange={handleDurationChange}
            >
              <SelectTrigger id={`duration-${machine.id}`}>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {machine.durations.map((d) => (
                  <SelectItem key={d.label} value={d.label}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="text-xl font-bold text-primary">
              KES {selectedDuration.cost.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <Button type="submit" disabled={isHiring}>
              {isHiring ? "Processing..." : "Hire Now"}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
