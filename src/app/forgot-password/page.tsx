
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
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
    const auth = useAuth();
    const { toast } = useToast();
    const [mobileNumber, setMobileNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobileNumber) {
            toast({
                title: 'Mobile Number Required',
                description: 'Please enter your mobile number.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        
        // The user's auth email is their mobile number + @bithired.com
        // We must remove the '+' from the mobile number for the email to be valid for the reset function.
        const sanitizedMobile = mobileNumber.startsWith('+') ? mobileNumber.substring(1) : mobileNumber;
        const emailForReset = `${sanitizedMobile}@bithired.com`;

        try {
            await sendPasswordResetEmail(auth, emailForReset);
            toast({
                title: 'Password Reset Email Sent',
                description: 'Please check your registered email inbox for a link to reset your password. The email associated with your account will be used.',
            });
        } catch (error: any) {
            console.error(error);
             if (error.code === 'auth/user-not-found') {
                 toast({
                    title: 'User Not Found',
                    description: 'No account found with this mobile number.',
                    variant: 'destructive',
                });
            } else if (error.code === 'auth/invalid-email') {
                 toast({
                    title: 'Invalid Mobile Number',
                    description: 'The mobile number format is incorrect. Please check and try again.',
                    variant: 'destructive',
                });
            }
            else {
                toast({
                    title: 'Error',
                    description: 'An error occurred. Please try again later.',
                    variant: 'destructive',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleResetPassword}>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Bitcoin className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">
              Forgot Password
            </CardTitle>
            <CardDescription>
              Enter your mobile number to receive a password reset link in your email.
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
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
             <p className="text-xs text-muted-foreground">A password reset link will be sent to the email address you registered with, not your mobile number.</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <div className="text-center text-sm">
              Remember your password?{' '}
              <Link href="/login" className="underline text-primary">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

