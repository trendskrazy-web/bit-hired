'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bitcoin } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, `${email}@bithired.com`, password);
    toast({
      title: 'Signing In',
      description: 'Please wait...',
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
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
              <Input
                id="mobile"
                type="tel"
                placeholder="+254700000000"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit">
              Sign In
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
