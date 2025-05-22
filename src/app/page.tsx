
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CurrentUser {
  email: string;
  fullName: string;
  role: 'owner' | 'booker';
}

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure localStorage is accessed only on the client side
    setIsLoading(true);
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing currentUser from localStorage", e);
        localStorage.removeItem('currentUser'); // Clear corrupted data
      }
    }
    setIsLoading(false);
  }, []);

  const handleOwnerClick = () => {
    if (currentUser && currentUser.role === 'owner') {
      router.push('/register-hotel');
    } else {
      router.push('/signin?role=owner&redirect=/register-hotel');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-64 bg-muted rounded-md"></div>
          <div className="flex flex-col md:flex-row gap-8 mt-12">
            <div className="bg-card p-8 rounded-lg shadow-xl w-80 h-60">
              <div className="h-10 w-3/4 bg-muted rounded mb-3"></div>
              <div className="h-5 w-full bg-muted rounded mb-2"></div>
              <div className="h-5 w-5/6 bg-muted rounded mb-4"></div>
              <div className="h-10 w-1/2 bg-muted rounded"></div>
            </div>
            <div className="bg-card p-8 rounded-lg shadow-xl w-80 h-60">
              <div className="h-10 w-3/4 bg-muted rounded mb-3"></div>
              <div className="h-5 w-full bg-muted rounded mb-2"></div>
              <div className="h-5 w-5/6 bg-muted rounded mb-4"></div>
              <div className="h-10 w-1/2 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem)-var(--footer-height,4rem))] py-12 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="text-center mb-12 px-4">
        <Image 
            src="https://placehold.co/300x150.png" 
            alt="Hotel Connector Logo" 
            width={240} 
            height={120} 
            className="mx-auto mb-6 rounded-lg shadow-md"
            data-ai-hint="logo brand"
        />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Welcome to <span className="text-primary">Hotel Connector</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Your seamless connection to listing properties and finding perfect stays.
          Choose your path below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-4xl w-full">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
          <CardHeader className="items-center text-center">
            <div className="p-3 bg-accent text-accent-foreground rounded-full mb-3">
              <Building size={32} />
            </div>
            <CardTitle className="text-2xl font-semibold">For Hotel Owners</CardTitle>
            <CardDescription className="text-center">
              List your property, manage bookings, and connect with travelers worldwide.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button onClick={handleOwnerClick} size="lg" className="w-full max-w-xs text-base py-6">
              <LogIn size={20} className="mr-2" />
              Owner Portal
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Sign in or sign up to manage your properties.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
          <CardHeader className="items-center text-center">
            <div className="p-3 bg-secondary text-secondary-foreground rounded-full mb-3">
              <Users size={32} />
            </div>
            <CardTitle className="text-2xl font-semibold">For Guests</CardTitle>
            <CardDescription className="text-center">
              Discover unique accommodations, book your next adventure, and explore the world.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button asChild size="lg" className="w-full max-w-xs text-base py-6">
              <Link href="/explore">
                Explore Hotels
              </Link>
            </Button>
             <p className="text-xs text-muted-foreground mt-2">
              Start your journey now. Sign-in optional for browsing.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
