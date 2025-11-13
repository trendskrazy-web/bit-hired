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

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Bitcoin className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">
            Welcome to BitHired
          </CardTitle>
          <CardDescription>
            Enter your mobile number to sign in to your account
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/dashboard">Sign In</Link>
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
