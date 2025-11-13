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
import { Bitcoin } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Bitcoin className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">
            Create an Account
          </CardTitle>
          <CardDescription>
            Start your virtual mining journey with BitHired today.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input id="mobile" type="tel" placeholder="+254700000000" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" required />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="invitation-code">Invitation Code (Optional)</Label>
            <Input id="invitation-code" type="text" placeholder="Enter your code" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/dashboard">Sign Up</Link>
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
