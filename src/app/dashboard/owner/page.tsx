
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking, Hotel, CurrentUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldAlert, Home, ListChecks, DollarSign, CalendarDays, Users, Check, X, Phone, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user: CurrentUser = JSON.parse(userStr);
        setCurrentUser(user);
        if (user.role !== 'owner' && user.role !== 'admin') { 
          toast({
            title: "Access Denied",
            description: "You must be a hotel owner or admin to view this dashboard.",
            variant: "destructive",
          });
          router.push('/explore');
        } else {
          loadData(user);
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
  }, [router, toast]);
  
  const loadData = (user: CurrentUser) => {
     setIsLoadingData(true);
     const allBookingsStr = localStorage.getItem('hotelBookings');
     const loadedBookings: Booking[] = allBookingsStr ? JSON.parse(allBookingsStr) : [];
     setAllBookings(loadedBookings);

     const allHotelsStr = localStorage.getItem('registeredHotels');
     const allHotels: Hotel[] = allHotelsStr ? JSON.parse(allHotelsStr) : [];

     if (user.role === 'admin') {
         setBookings(loadedBookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));
         setHotels(allHotels);
     } else { // Owner role
         const ownerBookings = loadedBookings.filter(b => b.hotelOwnerEmail === user.email);
         setBookings(ownerBookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));

         const ownerHotels = allHotels.filter(h => h.ownerEmail === user.email);
         setHotels(ownerHotels);
     }
     setIsLoadingData(false);
  }

  const handleBookingStatusChange = (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    const updatedBookings = allBookings.map(b => {
        if(b.id === bookingId) {
            return {...b, status: newStatus};
        }
        return b;
    });

    try {
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        setAllBookings(updatedBookings); // update the master list
        
        // now re-filter the displayed list based on the updated master list
        if(currentUser) {
           if(currentUser.role === 'admin') {
                setBookings(updatedBookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));
           } else {
                const ownerBookings = updatedBookings.filter(b => b.hotelOwnerEmail === currentUser.email);
                setBookings(ownerBookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));
           }
        }

        toast({
            title: `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            description: `The booking has been successfully ${newStatus}.`,
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        toast({ title: "Update Error", description: "Could not update the booking status.", variant: "destructive" });
    }
  };


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

  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin')) {
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
  // Calculate revenue only from confirmed bookings
  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, booking) => sum + booking.totalPrice, 0);


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
                        {bookings.filter(b => b.status === 'pending').length} pending confirmation
                    </p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Confirmed Revenue</CardTitle>
                    <DollarSign className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                     <p className="text-xs text-muted-foreground">
                        Based on confirmed bookings
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

        <Card className="shadow-xl mb-10">
            <CardHeader>
                <CardTitle className="text-2xl">My Properties</CardTitle>
                <CardDescription>View and manage your listed properties.</CardDescription>
            </CardHeader>
            <CardContent>
                {hotels.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Hotel Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Total Rooms</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hotels.map((hotel) => (
                        <TableRow key={hotel.id}>
                            <TableCell className="font-medium">{hotel.name}</TableCell>
                            <TableCell>{hotel.location.city}, {hotel.location.country}</TableCell>
                            <TableCell>{hotel.roomTypes.reduce((acc, room) => acc + room.quantity, 0)}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" onClick={() => router.push(`/edit-hotel/${hotel.id}`)}>
                                    <Pencil size={16} className="mr-2" /> Edit
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                ) : (
                <div className="text-center py-10">
                    <Home size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">You haven't listed any properties yet.</p>
                     <Button variant="link" onClick={() => router.push('/register-hotel')}>
                        List your first property now
                    </Button>
                </div>
                )}
            </CardContent>
        </Card>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Bookings</CardTitle>
            <CardDescription>
              Here are the latest bookings for {currentUser.role === 'admin' ? 'all properties' : 'your properties'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel / Room</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-center">Guests</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                            <div>{booking.hotelName}</div>
                            <div className="text-xs text-muted-foreground">{booking.roomName}</div>
                        </TableCell>
                        <TableCell>
                            <div>{booking.bookedByGuestName}</div>
                            <div className="text-xs text-muted-foreground">{booking.bookedByGuestEmail}</div>
                            <div className="text-xs text-muted-foreground flex items-center pt-1"><Phone size={12} className="mr-1" />{booking.guestPhoneNumber}</div>
                        </TableCell>
                        <TableCell>
                            {format(new Date(booking.checkIn), "MMM dd, yyyy")} - <br/>
                            {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-center">{booking.guests}</TableCell>
                        <TableCell className="text-right">${booking.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'}`}>
                                {booking.status}
                            </span>
                        </TableCell>
                        <TableCell className="text-center">
                            {booking.status === 'pending' ? (
                                <div className="flex gap-2 justify-center">
                                    <Button size="sm" variant="outline" className="h-8 px-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleBookingStatusChange(booking.id, 'confirmed')}>
                                        <Check size={16} />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 px-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleBookingStatusChange(booking.id, 'cancelled')}>
                                        <X size={16} />
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground">No actions</span>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <ListChecks size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bookings found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    