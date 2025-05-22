
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { UserPlus, User, Mail, Lock } from 'lucide-react';

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string; // In a real app, this would be a securely hashed password.
}

export default function SignUpPage() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // **VERY IMPORTANT SECURITY NOTE:**
    // Storing plain text or easily reversible passwords in localStorage is extremely insecure
    // and should NEVER be done in a production application.
    // This is a simplified approach for local demonstration ONLY.
    // In a real application, passwords should be securely hashed on a server.
    const newUser: StoredUser = {
      id: Date.now().toString(), // Simple unique ID for local demo
      fullName,
      email,
      passwordHash: password, // Storing password directly for local demo ONLY. DO NOT DO THIS IN PRODUCTION.
    };

    try {
      const existingUsersString = localStorage.getItem('registeredUsers');
      const existingUsers: StoredUser[] = existingUsersString ? JSON.parse(existingUsersString) : [];
      
      // Check if email already exists
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

      console.log('New User Registered (Locally):', { fullName, email }); // Don't log password
      toast({
        title: "Sign Up Successful!",
        description: "Your account has been created locally. You can now sign in.",
      });

      // Reset form fields
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast({
        title: "Registration Error",
        description: "Could not save your registration locally. Please try again.",
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
                <UserPlus size={32} />
            </div>
            <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join Hotel Connector to find and book your perfect stay.
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
                  placeholder="Choose a strong password"
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
                  <Link href="/signin" className="font-medium text-primary hover:underline">
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
