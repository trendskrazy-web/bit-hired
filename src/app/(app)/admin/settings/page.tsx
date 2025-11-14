
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/contexts/account-context";
import { useToast } from "@/hooks/use-toast";
import { List, Trash2, Settings } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const { mpesaNumbers, addMpesaNumber, removeMpesaNumber } = useAccount();
  const [newNumber, setNewNumber] = useState("");
  const { toast } = useToast();

  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNumber.trim()) {
      addMpesaNumber(newNumber.trim());
      toast({
        title: "Number Added",
        description: `The number ${newNumber.trim()} has been added to the list.`,
      });
      setNewNumber("");
    }
  };

  const handleRemoveNumber = (numberToRemove: string) => {
    removeMpesaNumber(numberToRemove);
    toast({
      title: "Number Removed",
      description: `The number ${numberToRemove} has been removed.`,
      variant: "destructive"
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
                Manage application-wide settings.
                </p>
            </div>
        </div>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Manage M-PESA Numbers</CardTitle>
          <CardDescription>
            Add or remove the M-PESA phone numbers that users will send deposits to.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
            <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Current Numbers
                </h3>
                <div className="space-y-2">
                    {mpesaNumbers.length > 0 ? (
                        mpesaNumbers.map((num) => (
                            <div key={num} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                                <span className="font-mono text-sm">{num}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveNumber(num)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No numbers configured.</p>
                    )}
                </div>
            </div>
            <div>
                <form onSubmit={handleAddNumber} className="space-y-4">
                     <h3 className="font-semibold mb-4">Add a New Number</h3>
                    <div className="space-y-2">
                        <Label htmlFor="new-number">Phone Number</Label>
                        <Input 
                            id="new-number"
                            placeholder="+254712345678"
                            value={newNumber}
                            onChange={(e) => setNewNumber(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full">Add Number</Button>
                </form>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
