
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
import { doc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

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
  const [invitationCode, setInvitationCode] = useState('');

  // UI flow state
  const [isRegistering, setIsRegistering] = useState(false);
  
  const getInviterId = async (code: string): Promise<string | null> => {
      if (!firestore || !code) return null;
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('referralCode', '==', code), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
        return null;
      } catch (error) {
        console.error("Error finding inviter:", error);
        return null;
      }
  }


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters long.', variant: 'destructive' });
      return;
    }

    setIsRegistering(true);

    try {
      // Find the user who invited the new user
      const inviterId = await getInviterId(invitationCode);
      if (invitationCode && !inviterId) {
          toast({ title: 'Invalid Invitation Code', description: 'The invitation code you entered is not valid.', variant: 'destructive'});
          setIsRegistering(false);
          return;
      }

      // The user's auth email is their mobile number + @bithired.com
      const sanitizedMobile = mobileNumber.startsWith('+') ? mobileNumber.substring(1) : mobileNumber;
      const authEmail = `${sanitizedMobile}@bithired.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      const newUser = userCredential.user;

      // Now create the user document in Firestore
      if (newUser && firestore) {
         const userDocRef = doc(firestore, 'users', newUser.uid);
         const userData: any = {
            id: newUser.uid,
            name: name,
            email: email,
            mobileNumber: mobileNumber,
            virtualBalance: 0,
            referralCode: generateReferralCode(),
         };

         if (inviterId) {
             userData.invitedBy = inviterId;
         }

         setDocumentNonBlocking(userDocRef, userData, { merge: true });
      }
      
      toast({
        title: `Welcome, ${name}!`,
        description: 'Your account has been created successfully.',
      });
      router.push('/dashboard');

    } catch (error: any) {
      console.error('Registration Error:', error);
       if (error.code === 'auth/email-already-in-use') {
         toast({
          title: 'Registration Failed',
          description: 'An account with this mobile number already exists.',
          variant: 'destructive',
        });
       } else if (error.code === 'auth/invalid-email') {
         toast({
          title: 'Registration Failed',
          description: 'The mobile number format is invalid. Please include the country code.',
          variant: 'destructive',
        });
       }
       else {
        toast({
            title: 'Registration Failed',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive',
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleRegister}>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Bitcoin className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">
              Create an Account
            </CardTitle>
            <CardDescription>
              Start your virtual mining journey with BitHired.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isRegistering}
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
                disabled={isRegistering}
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
                disabled={isRegistering}
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
                    disabled={isRegistering}
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
                    disabled={isRegistering}
                />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="invitation-code">Invitation Code (Optional)</Label>
              <Input 
                id="invitation-code" 
                type="text" 
                placeholder="Enter your code" 
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                disabled={isRegistering}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isRegistering}>
              {isRegistering ? 'Registering...' : 'Create Account'}
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

    