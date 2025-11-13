"use client";

import { useAccount } from "@/contexts/account-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DepositTransaction } from "@/lib/data";

export default function AdminDepositsPage() {
  const { pendingDeposits, approveDeposit, declineDeposit, allDeposits } = useAccount();
  const { toast } = useToast();

  const handleApprove = (deposit: DepositTransaction) => {
    try {
      approveDeposit(deposit.id, deposit.userAccountId, deposit.amount);
      toast({
        title: "Deposit Approved",
        description: `KES ${deposit.amount.toLocaleString()} has been credited to user ${deposit.mobileNumber}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve deposit.",
        variant: "destructive",
      });
    }
  };
  
  const handleDecline = (deposit: DepositTransaction) => {
    try {
      declineDeposit(deposit.id);
      toast({
        title: "Deposit Declined",
        description: `Deposit from user ${deposit.mobileNumber} for KES ${deposit.amount.toLocaleString()} has been declined.`,
        variant: "destructive",
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to decline deposit.",
        variant: "destructive",
      });
    }
  };


  const completedDeposits = allDeposits.filter(d => d.status === 'completed');
  const cancelledDeposits = allDeposits.filter(d => d.status === 'cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Confirm Deposits</h1>
        <p className="text-muted-foreground">
          Review and approve pending M-PESA deposits.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Deposits
          </CardTitle>
          <CardDescription>
            These are deposits that users have initiated but are awaiting your manual confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User Mobile</TableHead>
                <TableHead>Transaction Code</TableHead>
                <TableHead className="text-right">Amount (KES)</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDeposits.length > 0 ? (
                pendingDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{deposit.mobileNumber}</TableCell>
                    <TableCell className="font-mono">{deposit.transactionCode}</TableCell>
                    <TableCell className="text-right font-medium">{deposit.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center space-x-2">
                       <Button
                        size="sm"
                        onClick={() => handleApprove(deposit)}
                      >
                        Approve
                      </Button>
                       <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDecline(deposit)}
                      >
                        Decline
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No pending deposits.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Completed Deposits
          </CardTitle>
          <CardDescription>
            A history of all previously confirmed deposits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User Mobile</TableHead>
                <TableHead>Transaction Code</TableHead>
                <TableHead className="text-right">Amount (KES)</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedDeposits.length > 0 ? (
                completedDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{deposit.mobileNumber}</TableCell>
                    <TableCell className="font-mono">{deposit.transactionCode}</TableCell>
                    <TableCell className="text-right font-medium">{deposit.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                       <Badge variant="default" className="capitalize bg-green-500/20 text-green-700 hover:bg-green-500/30">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No completed deposits yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Declined Deposits
          </CardTitle>
          <CardDescription>
            A history of all previously declined deposits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User Mobile</TableHead>
                <TableHead>Transaction Code</TableHead>
                <TableHead className="text-right">Amount (KES)</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cancelledDeposits.length > 0 ? (
                cancelledDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{deposit.mobileNumber}</TableCell>
                    <TableCell className="font-mono">{deposit.transactionCode}</TableCell>
                    <TableCell className="text-right font-medium">{deposit.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                       <Badge variant="destructive" className="capitalize">
                          <XCircle className="mr-2 h-4 w-4" />
                          Declined
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No declined deposits yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
