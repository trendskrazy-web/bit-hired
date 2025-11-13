"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRedeemCodes } from "@/contexts/redeem-code-context";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Gift } from "lucide-react";

export default function RedeemCodesPage() {
  const [count, setCount] = useState(10);
  const [amount, setAmount] = useState(100);
  const { generateCodes } = useRedeemCodes();
  const { toast } = useToast();
  const [lastGenerated, setLastGenerated] = useState<string[]>([]);

  const handleGenerate = () => {
    const newCodes = generateCodes(count, amount);
    setLastGenerated(newCodes.map(c => c.code));
    toast({
      title: "Codes Generated",
      description: `${count} new redeem codes for KES ${amount} have been created.`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Codes copied to clipboard.",
    });
  };

  const downloadCodes = () => {
    const text = lastGenerated.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `redeem-codes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-muted-foreground" />
            <div>
                 <h1 className="text-2xl font-headline font-bold">Redeem Codes</h1>
                <p className="text-muted-foreground">
                Generate batches of redeem codes for promotional use.
                </p>
            </div>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of Codes</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  min="1"
                  max="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="1"
                />
              </div>
              <Button onClick={handleGenerate} className="w-full">
                Generate Codes
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Last Generated Codes</CardTitle>
              <CardDescription>
                {lastGenerated.length > 0 ? "Copy or download the codes below." : "Generate codes to see them here."}
              </CardDescription>
            </CardHeader>
            <CardContent>
                {lastGenerated.length > 0 && (
                    <div className="space-y-4">
                         <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={() => copyToClipboard(lastGenerated.join("\n"))}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy All
                            </Button>
                            <Button variant="outline" size="sm" onClick={downloadCodes}>
                                <Download className="mr-2 h-4 w-4" />
                                Download .txt
                            </Button>
                        </div>
                        <div className="p-4 bg-secondary rounded-md max-h-96 overflow-y-auto">
                            <pre className="text-sm font-mono whitespace-pre-wrap">
                                {lastGenerated.join("\n")}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
