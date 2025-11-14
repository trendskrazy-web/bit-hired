
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/contexts/account-context";
import { useToast } from "@/hooks/use-toast";
import { Settings, Trash2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { mpesaNumbers, setMpesaNumbers } = useAccount();
  const [newNumber, setNewNumber] = useState("");
  const { toast } = useToast();

  const addNumber = () => {
    if (newNumber && !mpesaNumbers.includes(newNumber)) {
        const updatedNumbers = [...mpesaNumbers, newNumber];
        setMpesaNumbers(updatedNumbers);
        setNewNumber("");
        toast({
            title: "Number Added",
            description: `${newNumber} has been added to the list.`,
        });
    } else {
         toast({
            title: "Invalid or Duplicate Number",
            description: "Please enter a valid, unique phone number.",
            variant: "destructive",
        });
    }
  };

  const removeNumber = (numberToRemove: string) => {
    if (mpesaNumbers.length <= 1) {
        toast({
            title: "Action Not Allowed",
            description: "You must have at least one M-PESA number.",
            variant: "destructive",
        });
        return;
    }
    const updatedNumbers = mpesaNumbers.filter(num => num !== numberToRemove);
    setMpesaNumbers(updatedNumbers);
    toast({
        title: "Number Removed",
        description: `${numberToRemove} has been removed.`,
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-muted-foreground" />
            <div>
                 <h1 className="text-2xl font-headline font-bold">Admin Settings</h1>
                <p className="text-muted-foreground">
                Manage application settings.
                </p>
            </div>
        </div>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>M-PESA Deposit Numbers</CardTitle>
          <CardDescription>
            These are the phone numbers users will send deposits to. The app will randomly pick one for each deposit request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                {mpesaNumbers.map((num) => (
                    <div key={num} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                        <span className="font-mono">{num}</span>
                         <Button variant="ghost" size="icon" onClick={() => removeNumber(num)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
             <div className="flex items-center gap-2">
                <Input
                    type="tel"
                    placeholder="Enter new number"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                />
                <Button onClick={addNumber}>Add Number</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

