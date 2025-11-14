
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRedeemCodes } from "@/contexts/redeem-code-context";
import { DataTable } from "@/components/admin/redeem-codes/data-table";
import { columns } from "@/components/admin/redeem-codes/columns";
import type { RedeemCode } from "@/lib/redeem-codes";

export default function RedeemCodesPage() {
  const [count, setCount] = useState(1);
  const [amount, setAmount] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { codes, generateCodes } = useRedeemCodes();
  const [generatedCodes, setGeneratedCodes] = useState<RedeemCode[]>([]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0 || amount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid numbers for count and amount.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const newCodes = generateCodes(count, amount);
      setGeneratedCodes(newCodes);
      toast({
        title: "Codes Generated!",
        description: `${count} new redeem codes have been created.`,
      });
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Redeem Codes</h1>
        <p className="text-muted-foreground">
          Generate and manage redeem codes for users.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Codes</CardTitle>
              <CardDescription>
                Create new codes that users can redeem for balance.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleGenerate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code-count">Number of Codes</Label>
                  <Input
                    id="code-count"
                    type="number"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value, 10))}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code-amount">Amount (KES)</Label>
                  <Input
                    id="code-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                    min="1"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Codes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2">
          {generatedCodes.length > 0 && (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Newly Generated Codes</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={generatedCodes} />
                </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>All Redeem Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={codes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
