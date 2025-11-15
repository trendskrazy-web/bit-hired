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
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  // UI flow state
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  
  const setupRecaptcha = () => {
    if (!auth) return;
    // Cleanup any existing verifier
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ title: 'Error', description: 'Authentication service not ready.', variant: 'destructive'});
        return;
    }
    
    setIsSendingOtp(true);
    
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, mobileNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'An OTP has been sent to your mobile number.',
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error Sending OTP',
        description: error.message || 'Could not send verification code. Please check the number and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationResult) {
      toast({ title: 'Error', description: 'Please request an OTP first.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters long.', variant: 'destructive' });
      return;
    }

    setIsVerifying(true);

    try {
      // First, confirm the OTP to prove ownership of the number
      await confirmationResult.confirm(otp);
      
      // Since phone auth is temporary for verification, sign out the temp user.
      // This allows us to create a new, permanent account with email/password,
      // which is how the rest of the app is structured.
      if (auth.currentUser) {
        await auth.signOut();
      }
       
       const sanitizedMobile = mobileNumber.startsWith('+') ? mobileNumber.substring(1) : mobileNumber;
       const authEmail = `${sanitizedMobile}@bithired.com`;
       const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
       const newUser = userCredential.user;

      // Now create the user document in Firestore
      if (newUser && firestore) {
         const userDocRef = doc(firestore, 'users', newUser.uid);
         setDocumentNonBlocking(
            userDocRef,
            {
              id: newUser.uid,
              name: name,
              email: email,
              mobileNumber: mobileNumber,
              virtualBalance: 0,
            },
            { merge: true }
          );
      }
      
      toast({
        title: `Welcome, ${name}!`,
        description: 'Your account has been created successfully.',
      });
      router.push('/dashboard');

    } catch (error: any) {
      console.error('Verification/Registration Error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Invalid OTP or another error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
       <div id="recaptcha-container"></div>
      <Card className="w-full max-w-sm">
        <form onSubmit={otpSent ? handleVerifyOtpAndRegister : handleSendOtp}>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Bitcoin className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">
              Create an Account
            </CardTitle>
            <CardDescription>
              {otpSent
                ? 'Enter the OTP sent to your phone.'
                : 'Start your virtual mining journey with BitHired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!otpSent ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+254700000000"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                   <p className="text-xs text-muted-foreground">Include country code (e.g., +254).</p>
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
                <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="otp">Verification Code (OTP)</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </>
            )}
             <div className="grid gap-2">
              <Label htmlFor="invitation-code">Invitation Code (Optional)</Label>
              <Input id="invitation-code" type="text" placeholder="Enter your code" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSendingOtp || isVerifying}>
              {otpSent
                ? isVerifying ? 'Verifying & Registering...' : 'Verify & Register'
                : isSendingOtp ? 'Sending OTP...' : 'Send OTP & Register'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
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

// Add a declaration for the recaptchaVerifier on the window object
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}
