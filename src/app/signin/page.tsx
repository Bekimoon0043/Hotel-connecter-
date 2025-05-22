
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock } from 'lucide-react';

// This interface should match the one in signup/page.tsx
interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string; // In a real app, this would be a securely hashed password.
}

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const existingUsersString = localStorage.getItem('registeredUsers');
      if (!existingUsersString) {
        toast({
          title: "Sign In Failed",
          description: "No registered users found. Please sign up first.",
          variant: "destructive",
        });
        return;
      }

      const existingUsers: StoredUser[] = JSON.parse(existingUsersString);
      const user = existingUsers.find(u => u.email === email);

      if (!user) {
        toast({
          title: "Sign In Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return;
      }

      // **VERY IMPORTANT SECURITY NOTE:**
      // Comparing plain text passwords is extremely insecure.
      // This is a simplified approach for local demonstration ONLY.
      // In a real application, use a secure password comparison method (e.g., bcrypt.compare) on the server.
      if (user.passwordHash === password) {
        toast({
          title: "Sign In Successful!",
          description: `Welcome back, ${user.fullName}! (Locally signed in)`,
        });
        // For local demo, we can store a simple flag or user email
        localStorage.setItem('loggedInUserEmail', user.email); 
        console.log('User Signed In (Locally):', user.email);
        // Redirect to home page or dashboard after successful sign-in
        router.push('/'); 
      } else {
        toast({
          title: "Sign In Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-12 md:py-16 bg-muted/20">
      <div className="container max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
              <LogIn size={32} />
            </div>
            <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your Hotel Connector account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
                  required
                  className="mt-1 h-11"
                />
              </div>
              <CardFooter className="p-0 pt-4 flex flex-col gap-4">
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6">
                  Sign In
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href="/signup" className="font-medium text-primary hover:underline">
                    Sign Up
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
