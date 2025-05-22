
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Hotel, StoredUser, Booking, CurrentUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Trash2, Users, Building, ListChecks, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const ADMIN_EMAIL = "admin@hotelconnector.com";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'hotel' | 'user' | 'booking' } | null>(null);


  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user: CurrentUser = JSON.parse(userStr);
        setCurrentUser(user);
        if (user.role !== 'admin' || user.email !== ADMIN_EMAIL) {
          toast({
            title: "Access Denied",
            description: "You do not have permission to view this page.",
            variant: "destructive",
          });
          router.push('/explore');
        } else {
          loadAdminData();
        }
      } catch (e) {
        toast({ title: "Error", description: "Failed to verify admin status.", variant: "destructive" });
        localStorage.removeItem('currentUser');
        router.push('/signin?role=admin&redirect=/admin/dashboard');
      }
    } else {
      router.push('/signin?role=admin&redirect=/admin/dashboard');
    }
    setIsLoadingAuth(false);
  }, [router, toast]);

  const loadAdminData = () => {
    setIsLoadingData(true);
    try {
      const hotelsStr = localStorage.getItem('registeredHotels');
      setHotels(hotelsStr ? JSON.parse(hotelsStr) : []);

      const usersStr = localStorage.getItem('registeredUsers');
      setUsers(usersStr ? JSON.parse(usersStr) : []);

      const bookingsStr = localStorage.getItem('hotelBookings');
      setBookings(bookingsStr ? JSON.parse(bookingsStr) : []);
    } catch (e) {
      console.error("Error loading admin data from localStorage:", e);
      toast({ title: "Data Load Error", description: "Could not load all admin data.", variant: "destructive" });
    }
    setIsLoadingData(false);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;

    const { id, type } = itemToDelete;
    let success = false;

    try {
      if (type === 'hotel') {
        const updatedHotels = hotels.filter(h => h.id !== id);
        localStorage.setItem('registeredHotels', JSON.stringify(updatedHotels));
        setHotels(updatedHotels);
        // Optional: Delete bookings associated with this hotel
        const updatedBookings = bookings.filter(b => b.hotelId !== id);
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        setBookings(updatedBookings);
        success = true;
      } else if (type === 'user') {
        if (currentUser && id === currentUser.email) { // Prevent admin from deleting themselves easily
             toast({ title: "Action Restricted", description: "Admin account cannot be deleted this way.", variant: "warning" });
             setItemToDelete(null);
             return;
        }
        const updatedUsers = users.filter(u => u.email !== id); // Assuming user ID is email for StoredUser
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        // Optional: Handle user's hotels or bookings (e.g., reassign/delete)
        // For simplicity, we'll just delete the user for now.
        success = true;
      } else if (type === 'booking') {
        const updatedBookings = bookings.filter(b => b.id !== id);
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        setBookings(updatedBookings);
        success = true;
      }

      if (success) {
        toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.` });
      }
    } catch (e) {
      console.error(`Error deleting ${type}:`, e);
      toast({ title: "Deletion Error", description: `Could not delete ${type}.`, variant: "destructive" });
    }
    setItemToDelete(null); // Close dialog
  };

  if (isLoadingAuth || (!currentUser && !isLoadingAuth)) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12 bg-muted/20">
        <Card className="shadow-xl w-full max-w-md text-center p-8">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4 animate-pulse">
                <Briefcase size={32} />
            </div>
            <div className="h-8 bg-muted rounded w-1/2 mx-auto animate-pulse mb-2"></div>
            <div className="h-5 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
        </Card>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    // This case should ideally be caught by useEffect redirect, but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-muted/20">
        <Card className="shadow-xl p-8 text-center">
          <ShieldAlert size={48} className="mx-auto mb-4 text-destructive" />
          <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
          <CardDescription className="mb-4">You do not have permission to view this page.</CardDescription>
          <Button onClick={() => router.push('/')}>Go to Home</Button>
        </Card>
      </div>
    );
  }
  
  const stats = [
    { title: "Total Registered Hotels", value: hotels.length, icon: <Building className="h-5 w-5 text-primary" /> },
    { title: "Total Registered Users", value: users.length, icon: <Users className="h-5 w-5 text-primary" /> },
    { title: "Total Bookings Made", value: bookings.length, icon: <ListChecks className="h-5 w-5 text-primary" /> },
  ];

  return (
    <div className="py-8 md:py-12 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">Manage all aspects of Hotel Connector.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map(stat => (
                <Card key={stat.title} className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        {stat.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </section>

        {isLoadingData ? (
          <div className="text-center py-10">Loading data...</div>
        ) : (
          <div className="space-y-12">
            {/* Hotels Management */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Manage Hotels</CardTitle>
                <CardDescription>View and remove registered hotel properties.</CardDescription>
              </CardHeader>
              <CardContent>
                {hotels.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Owner Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hotels.map(hotel => (
                        <TableRow key={hotel.id}>
                          <TableCell className="font-medium">{hotel.name}</TableCell>
                          <TableCell>{hotel.location.city}, {hotel.location.country}</TableCell>
                          <TableCell>{hotel.ownerEmail || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setItemToDelete({ id: hotel.id, type: 'hotel' })}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No hotels registered yet.</p>}
              </CardContent>
            </Card>

            {/* Users Management */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Manage Users</CardTitle>
                <CardDescription>View and remove registered user accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        {/* <TableHead>Role (Inferred)</TableHead> */}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          {/* <TableCell>{user.email === ADMIN_EMAIL ? 'Admin' : 'User'}</TableCell> */}
                          <TableCell className="text-right">
                             {user.email !== ADMIN_EMAIL && (
                                <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => setItemToDelete({ id: user.email, type: 'user' })}>
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                                </AlertDialogTrigger>
                             )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No users registered yet.</p>}
              </CardContent>
            </Card>

            {/* Bookings Management */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Manage Bookings</CardTitle>
                <CardDescription>View and remove all hotel bookings.</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hotel</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()).map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.hotelName}</TableCell>
                          <TableCell>{booking.bookedByGuestName} ({booking.bookedByGuestEmail})</TableCell>
                          <TableCell>{format(new Date(booking.checkIn), "PP")} - {format(new Date(booking.checkOut), "PP")}</TableCell>
                          <TableCell>{booking.status}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setItemToDelete({ id: booking.id, type: 'booking' })}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No bookings made yet.</p>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Universal Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected {itemToDelete?.type}
              {itemToDelete?.type === 'hotel' && ' and all its associated bookings'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
