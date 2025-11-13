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
import { useToast } from "@/hooks/use-toast";
import type { Machine, DurationOption } from "@/lib/data";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { Cpu, Zap, Wallet, CalendarDays } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/contexts/account-context";

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
  const { balance, deductBalance } = useAccount();


  const { potentialEarnings, dailyEarnings } = useMemo(() => {
    const days = 45; // All durations are 45 days
    const earnings = selectedDuration.totalEarnings;
    const daily = days > 0 ? earnings / days : 0;

    return { potentialEarnings: earnings, dailyEarnings: daily };
  }, [selectedDuration]);


  const handleHire = (e: React.FormEvent) => {
    e.preventDefault();
    if (balance < selectedDuration.cost) {
      toast({
        title: "Insufficient Funds",
        description: "Your account balance is too low to hire this machine.",
        variant: "destructive",
      });
      return;
    }
    
    setIsHiring(true);
    setTimeout(() => {
      deductBalance(selectedDuration.cost);
      setIsHiring(false);
      toast({
        title: "Machine Hired!",
        description: `You have successfully hired the ${machine.name} for ${selectedDuration.label}.`,
      });
    }, 1500);
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
            <CalendarDays className="w-4 h-4" /> Potential Daily Earnings
          </span>
          <span className="font-semibold font-mono flex items-center gap-1">
             KES {dailyEarnings.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="w-4 h-4" /> Total Potential Earnings
          </span>
          <span className="font-semibold font-mono flex items-center gap-1">
             KES {potentialEarnings.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleHire} className="w-full space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor={`duration-${machine.id}`}>Duration</Label>
            <Input
              id={`duration-${machine.id}`}
              type="text"
              value="45 Days"
              readOnly
              className="font-semibold"
            />
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
