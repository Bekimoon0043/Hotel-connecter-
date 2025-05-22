
"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { UserPlus, User, Mail, Lock } from 'lucide-react';
import type { StoredUser, CurrentUser } from '@/lib/types'; // Import consolidated types

const ADMIN_EMAIL = "admin@hotelconnector.com"; // Hardcoded admin email

function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const roleParam = searchParams.get('role') as CurrentUser['role'] | null;
  const redirectParam = searchParams.get('redirect');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      toast({
        title: "Registration Failed",
        description: "This email address is reserved for administrative use.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 8) {
         toast({
            title: "Password Too Short",
            description: "Password must be at least 8 characters long.",
            variant: "destructive",
        });
        return;
    }

    // Determine role: default to 'booker', or use roleParam if provided (but not 'admin')
    const determinedRole: CurrentUser['role'] = (roleParam && roleParam !== 'admin') ? roleParam : 'booker';
    
    const newUser: StoredUser = {
      id: Date.now().toString(), 
      fullName,
      email,
      passwordHash: password, // Storing password directly for local demo ONLY. DO NOT DO THIS IN PRODUCTION.
    };

    try {
      const existingUsersString = localStorage.getItem('registeredUsers');
      const existingUsers: StoredUser[] = existingUsersString ? JSON.parse(existingUsersString) : [];
      
      if (existingUsers.some(user => user.email === email)) {
        toast({
          title: "Registration Failed",
          description: "An account with this email already exists.",
          variant: "destructive",
        });
        return;
      }

      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      // Also set as current user for immediate sign-in effect
      const currentUserData: CurrentUser = {
        email: newUser.email,
        fullName: newUser.fullName,
        role: determinedRole,
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUserData));

      console.log('New User Registered & Signed In (Locally):', currentUserData);
      toast({
        title: "Sign Up Successful!",
        description: `Your account as ${determinedRole} has been created and you are now signed in.`,
      });

      if (redirectParam) {
        router.push(redirectParam);
      } else if (determinedRole === 'owner') {
        router.push('/dashboard/owner'); // Or /register-hotel
      } else {
        router.push('/explore');
      }

    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast({
        title: "Registration Error",
        description: "Could not save your registration locally. Please try again.",
        variant: "destructive",
      });
    }
  };

  const signinLinkHref = `/signin${roleParam ? `?role=${roleParam}` : ''}${redirectParam ? `${roleParam ? '&' : '?'}redirect=${encodeURIComponent(redirectParam)}` : ''}`;


  return (
    <div className="py-12 md:py-16 bg-muted/20">
      <div className="container max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
             <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                <UserPlus size={32} />
            </div>
            <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join Hotel Connector.
              {roleParam && roleParam !== 'admin' && ` You are signing up as ${roleParam === 'owner' ? 'a Hotel Owner' : 'a Guest'}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-base font-semibold flex items-center">
                    <User size={18} className="mr-2 text-primary" /> Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., John Doe"
                  required
                  className="mt-1 h-11"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-base font-semibold flex items-center">
                    <Mail size={18} className="mr-2 text-primary" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., you@example.com"
                  required
                  className="mt-1 h-11"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-base font-semibold flex items-center">
                    <Lock size={18} className="mr-2 text-primary" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password (min. 8 characters)"
                  required
                  minLength={8}
                  className="mt-1 h-11"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-base font-semibold flex items-center">
                    <Lock size={18} className="mr-2 text-primary" /> Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="mt-1 h-11"
                />
              </div>
              <CardFooter className="p-0 pt-4 flex flex-col gap-4">
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6">
                  Sign Up
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href={signinLinkHref} className="font-medium text-primary hover:underline">
                    Sign In
                  </Link>
                </p>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
