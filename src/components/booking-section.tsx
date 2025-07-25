
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import type { Hotel, RoomType, Booking, CurrentUser } from '@/lib/types';
import { format, differenceInDays, addDays, eachDayOfInterval } from 'date-fns';
import { CalendarDays, Users, BedDouble, DollarSign, ShoppingCart, ShieldAlert, CreditCard, Loader2, Phone } from 'lucide-react';
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface BookingSectionProps {
  hotel: Hotel;
}

export default function BookingSection({ hotel }: BookingSectionProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | undefined>(undefined);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [guestPhoneNumber, setGuestPhoneNumber] = useState('');

  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setIsClient(true);
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing currentUser for booking:", e);
      }
    }
    
    // Load all bookings for availability check
    const bookingsStr = localStorage.getItem('hotelBookings');
    if(bookingsStr) {
      setAllBookings(JSON.parse(bookingsStr));
    }
    
    const today = new Date();
    const tomorrow = addDays(today, 1);
    setDateRange({ from: today, to: tomorrow });

    if (hotel.roomTypes && hotel.roomTypes.length > 0) {
      setSelectedRoom(hotel.roomTypes[0]);
    } else if (hotel.pricePerNight > 0) {
        setSelectedRoom({
            id: `default-room-${hotel.id}`,
            name: "Standard Accommodation",
            price: hotel.pricePerNight,
            beds: 1,
            maxGuests: 2,
            quantity: 1,
            image: hotel.images[0] || "https://placehold.co/600x400.png",
            description: "Standard room offering."
        });
    }

  }, [hotel.roomTypes, hotel.id, hotel.pricePerNight, hotel.images]);

  const availableRooms = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return hotel.roomTypes || [];

    const bookingInterval = eachDayOfInterval({
        start: dateRange.from,
        end: addDays(dateRange.to, -1) // Don't include checkout day for counting nights
    });

    return (hotel.roomTypes || []).map(room => {
        const confirmedBookingsForRoom = allBookings.filter(
            b => b.roomId === room.id && (b.status === 'confirmed' || b.status === 'pending')
        );

        let maxBookedOnAnyDay = 0;
        bookingInterval.forEach(day => {
            const bookingsOnThisDay = confirmedBookingsForRoom.filter(b => {
                const checkInDate = new Date(b.checkIn);
                const checkOutDate = new Date(b.checkOut);
                return day >= checkInDate && day < checkOutDate;
            }).length;
            if (bookingsOnThisDay > maxBookedOnAnyDay) {
                maxBookedOnAnyDay = bookingsOnThisDay;
            }
        });
        
        const availableCount = room.quantity - maxBookedOnAnyDay;
        return { ...room, availableCount: availableCount > 0 ? availableCount : 0 };
    });
  }, [dateRange, allBookings, hotel.roomTypes]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && selectedRoom) {
      const nights = differenceInDays(dateRange.to, dateRange.from);
      if (nights > 0) {
        setTotalPrice(nights * selectedRoom.price);
      } else {
        setTotalPrice(selectedRoom.price);
      }
    } else if (selectedRoom) {
      setTotalPrice(selectedRoom.price); 
    } else {
      setTotalPrice(0);
    }
  }, [dateRange, selectedRoom]);

  const handleInitiateBooking = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please sign in to book a hotel.",
        variant: "destructive",
        action: ( <Button variant="outline" size="sm" onClick={() => router.push(`/signin?redirect=/hotel/${hotel.id}`)}> Sign In </Button> )
      });
      return;
    }
    if (currentUser.role === 'owner' || currentUser.role === 'admin') {
      toast({
        title: "Booking Restricted",
        description: "Owners and admins cannot book hotels through this interface.",
        variant: "destructive",
      });
      return;
    }

    if (!dateRange?.from || !dateRange?.to || !selectedRoom) {
      toast({
        title: "Incomplete Information",
        description: "Please select dates and a room type.",
        variant: "destructive",
      });
      return;
    }
    const nights = differenceInDays(dateRange.to, dateRange.from);
    if (nights <= 0) {
      toast({
        title: "Invalid Date Range",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }

    if (guests > selectedRoom.maxGuests) {
        toast({
            title: "Too Many Guests",
            description: `The selected room (${selectedRoom.name}) can accommodate a maximum of ${selectedRoom.maxGuests} guests.`,
            variant: "destructive",
        });
        return;
    }

    const roomAvailability = availableRooms.find(r => r.id === selectedRoom.id);
    if (!roomAvailability || roomAvailability.availableCount <= 0) {
        toast({
            title: "Room Not Available",
            description: "The selected room type is fully booked for the chosen dates. Please select another room or different dates.",
            variant: "destructive",
        });
        return;
    }
    
    setShowPaymentDialog(true);
  };
  
  const handleBookingRequest = () => {
    if (!currentUser || !dateRange?.from || !dateRange?.to || !selectedRoom || !guestPhoneNumber) {
        toast({ title: "Missing Information", description: "Please provide a phone number.", variant: "destructive"});
        return;
    }

    const newBooking: Booking = {
        id: `booking-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelOwnerEmail: hotel.ownerEmail || "unknown@example.com", 
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkIn: dateRange.from.toISOString(),
        checkOut: dateRange.to.toISOString(),
        guests: guests,
        totalPrice: totalPrice,
        bookedByGuestName: currentUser.fullName,
        bookedByGuestEmail: currentUser.email,
        guestPhoneNumber: guestPhoneNumber,
        bookingDate: new Date().toISOString(),
        status: 'pending', 
    };
    
    try {
        const existingBookingsString = localStorage.getItem('hotelBookings');
        const existingBookings: Booking[] = existingBookingsString ? JSON.parse(existingBookingsString) : [];
        existingBookings.push(newBooking);
        localStorage.setItem('hotelBookings', JSON.stringify(existingBookings));
        
        toast({
            title: "Booking Request Sent!",
            description: `Your request for ${hotel.name} has been sent to the owner for confirmation.`,
            variant: "default"
        });

        // Update local state to reflect new booking for availability checks
        setAllBookings(existingBookings);

    } catch (error) {
         console.error("Error saving booking to localStorage:", error);
        toast({
          title: "Booking Request Error",
          description: "Could not save your booking request. Please try again.",
          variant: "destructive",
        });
    }

    setShowPaymentDialog(false);
    setGuestPhoneNumber('');
  }
  
  if (!isClient) {
    return (
      <Card className="shadow-xl animate-pulse">
        <CardHeader><div className="h-8 bg-muted rounded w-3/4"></div></CardHeader>
        <CardContent className="space-y-6">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <div className="h-8 bg-muted rounded w-1/2 self-center"></div>
          <div className="h-12 bg-primary/50 rounded"></div>
        </CardFooter>
      </Card>
    );
  }

  const nights = (dateRange?.from && dateRange?.to) ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const selectedRoomAvailability = availableRooms.find(r => r.id === selectedRoom?.id);

  return (
    <>
      <Card className="shadow-xl sticky top-24">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <DollarSign size={26} className="mr-2 text-primary" />
            Book Your Stay
          </CardTitle>
          {hotel.roomTypes && hotel.roomTypes.length > 0 && selectedRoom ? (
               <p className="text-muted-foreground text-sm">
                  Room: <span className="font-semibold text-primary">{selectedRoom.name}</span> (${selectedRoom.price}/night)
              </p>
          ): hotel.pricePerNight > 0 && selectedRoom ? (
               <p className="text-muted-foreground text-sm">
                  Base Price: <span className="font-semibold text-primary">${selectedRoom.price}</span> / night
              </p>
          ) : (
               <p className="text-muted-foreground text-sm">
                  Select options to see total.
              </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="check-in-out-details" className="text-base font-semibold">Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="check-in-out-details"
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1 h-11"
                >
                  <CalendarDays className="mr-2 h-5 w-5 text-muted-foreground" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="guests-details" className="text-base font-semibold">Guests</Label>
            <div className="relative mt-1">
               <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="guests-details"
                type="number"
                min="1"
                max={selectedRoom?.maxGuests || 99} 
                value={guests}
                onChange={(e) => {
                  const numGuests = parseInt(e.target.value, 10) || 1;
                  const max = selectedRoom?.maxGuests || 99;
                  setGuests(Math.min(Math.max(1, numGuests), max));
                }}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="room-type-details" className="text-base font-semibold">Room Type</Label>
            {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
              <Select
                  value={selectedRoom?.id}
                  onValueChange={(roomId) => {
                  const room = hotel.roomTypes.find(r => r.id === roomId);
                  setSelectedRoom(room);
                  if (room && guests > room.maxGuests) {
                      setGuests(room.maxGuests);
                  } else if (room && guests < 1) {
                      setGuests(1);
                  }
                  }}
              >
                  <SelectTrigger id="room-type-details" className="mt-1 h-11">
                  <BedDouble className="mr-2 h-5 w-5 text-muted-foreground inline-block" />
                  <SelectValue placeholder="Select a room type" />
                  </SelectTrigger>
                  <SelectContent>
                  {availableRooms.map(room => (
                      <SelectItem key={room.id} value={room.id} disabled={room.availableCount <= 0}>
                         {room.name} (${room.price}/night) - {room.availableCount > 0 ? `${room.availableCount} available` : 'Not available'}
                      </SelectItem>
                  ))}
                  </SelectContent>
              </Select>
            ) : (
              selectedRoom ? (
                 <Input 
                    value={`${selectedRoom.name} ($${selectedRoom.price}/night)`} 
                    className="mt-1 h-11 bg-muted" 
                    readOnly 
                    />
              ) : (
                 <p className="text-sm text-muted-foreground mt-1">No specific room types defined for this hotel.</p>
              )
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 pt-6 border-t">
          {selectedRoom && (nights > 0) && (
            <div className="text-center">
              <p className="text-muted-foreground">Total Price for {nights} night{nights > 1 ? 's' : ''}:</p>
              <p className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</p>
            </div>
          )}
          {!currentUser && (
            <div className="text-sm text-destructive flex items-center justify-center gap-2 p-2 border border-destructive/50 rounded-md bg-destructive/5">
               <ShieldAlert size={18} /> Please sign in to complete your booking.
            </div>
          )}
          {(currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin')) && (
               <div className="text-sm text-yellow-700 flex items-center justify-center gap-2 p-2 border border-yellow-500/50 rounded-md bg-yellow-50">
                  <ShieldAlert size={18} /> Owners/Admins cannot make bookings.
              </div>
          )}
          <Button 
            onClick={handleInitiateBooking} 
            size="lg" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
            disabled={
              !dateRange?.from || 
              !dateRange?.to || 
              !selectedRoom || 
              (nights <=0) || 
              !currentUser ||
              currentUser.role === 'owner' ||
              currentUser.role === 'admin' ||
              (selectedRoomAvailability?.availableCount ?? 0) <= 0
            }
          >
            <ShoppingCart className="mr-2 h-5 w-5"/>
            {(selectedRoomAvailability?.availableCount ?? 0) <= 0 ? 'Not Available' : 'Request to Book'}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <CreditCard className="mr-2 text-primary" /> Confirm Booking Request
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are requesting to book the <strong>{selectedRoom?.name}</strong> at <strong>{hotel.name}</strong>
                from <strong>{dateRange?.from ? format(dateRange.from, "PP") : ''}</strong> to <strong>{dateRange?.to ? format(dateRange.to, "PP") : ''}</strong> ({nights} night{nights !== 1 ? 's' : ''})
                for <strong>{guests} guest{guests !== 1 ? 's' : ''}</strong>.
                <br />
                Total amount: <strong className="text-lg text-primary">${totalPrice.toFixed(2)}</strong>
                <br /><br />
                The hotel owner will confirm your booking. Please provide your phone number for contact.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="phone-number" type="tel" placeholder="e.g. 0912345678" value={guestPhoneNumber} onChange={(e) => setGuestPhoneNumber(e.target.value)} required className="pl-10" />
                </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBookingRequest}
                disabled={!guestPhoneNumber}
              >
                Send Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
