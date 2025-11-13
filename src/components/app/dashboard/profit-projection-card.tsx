"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
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
import { Button } from "@/components/ui/button";
import { type Machine, type DurationOption } from "@/lib/data";
import { projectProfit } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrainCircuit, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const initialState = {
  projectedProfit: null,
  analysis: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get AI Projection
        </>
      )}
    </Button>
  );
}

export function ProfitProjectionCard({ machines }: { machines: Machine[] }) {
  const [state, formAction] = useActionState(projectProfit, initialState);
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0].id);
  const [selectedDuration, setSelectedDuration] = useState(
    machines[0].durations[0].label
  );
  const [selectedMachine, setSelectedMachine] = useState<Machine>(machines[0]);
  const [durationOptions, setDurationOptions] = useState<DurationOption[]>(
    machines[0].durations
  );

  useEffect(() => {
    const machine = machines.find((m) => m.id === selectedMachineId);
    if (machine) {
      setSelectedMachine(machine);
      setDurationOptions(machine.durations);
      if (!machine.durations.find((d) => d.label === selectedDuration)) {
        setSelectedDuration(machine.durations[0].label);
      }
    }
  }, [selectedMachineId, machines, selectedDuration]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          AI Profit Projection
        </CardTitle>
        <CardDescription>
          Use our AI tool to project potential profits based on your selection and market data.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="machineType">Mining Machine</Label>
              <Select
                name="machineType"
                value={selectedMachineId}
                onValueChange={setSelectedMachineId}
              >
                <SelectTrigger id="machineType">
                  <SelectValue placeholder="Select a machine" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Hiring Duration</Label>
              <Select
                name="duration"
                value={selectedDuration}
                onValueChange={setSelectedDuration}
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.label} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <input type="hidden" name="machineId" value={selectedMachineId} />
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>

      {useFormStatus().pending && (
        <div className="p-6 pt-0 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      )}

      {state?.error && (
        <div className="p-6 pt-0">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        </div>
      )}

      {state?.projectedProfit !== null && state?.analysis && (
        <div className="p-6 pt-0 space-y-4">
            <h3 className="text-lg font-semibold font-headline">AI Analysis Result</h3>
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projected Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            KES {state.projectedProfit.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            After hiring costs for {selectedDuration}
                        </p>
                    </CardContent>
                </Card>
                <div>
                     <p className="text-sm text-muted-foreground leading-relaxed">{state.analysis}</p>
                </div>
            </div>
        </div>
      )}
    </Card>
  );
}
