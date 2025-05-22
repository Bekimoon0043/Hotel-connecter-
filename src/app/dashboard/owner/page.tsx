
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking, Hotel } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldAlert, Home, ListChecks, UserCircle, DollarSign, CalendarDays, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CurrentUser {
  email: string;
  fullName: string;
  role: 'owner' | 'booker';
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user: CurrentUser = JSON.parse(userStr);
        setCurrentUser(user);
        if (user.role !== 'owner') {
          toast({
            title: "Access Denied",
            description: "You must be a hotel owner to view this dashboard.",
            variant: "destructive",
          });
          router.push('/explore');
        } else {
          // Fetch bookings and hotels for this owner
          const allBookingsStr = localStorage.getItem('hotelBookings');
          const allBookings: Booking[] = allBookingsStr ? JSON.parse(allBookingsStr) : [];
          const ownerBookings = allBookings.filter(b => b.hotelOwnerEmail === user.email);
          setBookings(ownerBookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())); // Sort by most recent

          const allHotelsStr = localStorage.getItem('registeredHotels');
          const allHotels: Hotel[] = allHotelsStr ? JSON.parse(allHotelsStr) : [];
          const ownerHotels = allHotels.filter(h => h.ownerEmail === user.email);
          setHotels(ownerHotels);
        }
      } catch (e) {
        console.error("Error processing owner dashboard data:", e);
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
        localStorage.removeItem('currentUser');
        router.push('/signin?role=owner&redirect=/dashboard/owner');
      }
    } else {
      router.push('/signin?role=owner&redirect=/dashboard/owner');
    }
    setIsLoadingAuth(false);
    setIsLoadingData(false);
  }, [router, toast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12 md:py-16 bg-muted/20">
        <Card className="shadow-xl w-full max-w-4xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4 animate-pulse">
                <ListChecks size={32} />
            </div>
            <div className="h-8 bg-muted rounded w-1/2 mx-auto animate-pulse mb-2"></div>
            <div className="h-5 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-40 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-1/3 animate-pulse ml-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-muted/20">
        <Card className="shadow-xl p-8 text-center">
          <ShieldAlert size={48} className="mx-auto mb-4 text-destructive" />
          <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
          <CardDescription className="mb-4">You do not have permission to view this page.</CardDescription>
          <Button onClick={() => router.push('/explore')}>Go to Explore</Button>
        </Card>
      </div>
    );
  }

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);


  return (
    <div className="py-8 md:py-12 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Owner Dashboard</h1>
          <p className="text-xl text-muted-foreground">Welcome back, {currentUser.fullName}! Manage your properties and bookings.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <ListChecks className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                        Across all your properties
                    </p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue (Pending)</CardTitle>
                    <DollarSign className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                     <p className="text-xs text-muted-foreground">
                        Based on current bookings
                    </p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Listed Properties</CardTitle>
                    <Home className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{hotels.length}</div>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => router.push('/register-hotel')}>
                        + List a new property
                    </Button>
                </CardContent>
            </Card>
        </section>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Bookings</CardTitle>
            <CardDescription>
              Here are the latest bookings for your properties.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-center">Guests</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.hotelName}</TableCell>
                        <TableCell>{booking.roomName}</TableCell>
                        <TableCell>
                            <div>{booking.bookedByGuestName}</div>
                            <div className="text-xs text-muted-foreground">{booking.bookedByGuestEmail}</div>
                        </TableCell>
                        <TableCell>
                            {format(new Date(booking.checkIn), "MMM dd, yyyy")} - <br/>
                            {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-center">{booking.guests}</TableCell>
                        <TableCell className="text-right">${booking.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'}`}>
                                {booking.status}
                            </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <ListChecks size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You have no bookings for your properties yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Once guests book your hotels, their reservations will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
