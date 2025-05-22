
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { Hotel, RoomType, Booking, CurrentUser } from '@/lib/types';
import { format, differenceInDays, addDays } from 'date-fns';
import { CalendarDays, Users, BedDouble, DollarSign, ShoppingCart, ShieldAlert } from 'lucide-react';
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";

interface BookingSectionProps {
  hotel: Hotel;
}

export default function BookingSection({ hotel }: BookingSectionProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | undefined>(undefined);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    setDateRange({ from: today, to: tomorrow });

    // Set default selected room if available
    if (hotel.roomTypes && hotel.roomTypes.length > 0) {
      setSelectedRoom(hotel.roomTypes[0]);
    }


    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing currentUser for booking:", e);
      }
    }
  }, [hotel.roomTypes]); // Add hotel.roomTypes to dependency array

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && selectedRoom) {
      const nights = differenceInDays(dateRange.to, dateRange.from);
      if (nights > 0) {
        setTotalPrice(nights * selectedRoom.price); // Price is per room, guests handled by room max capacity
      } else {
         // For single day or invalid range, perhaps show price for 1 night or 0
        setTotalPrice(selectedRoom.price);
      }
    } else if (selectedRoom) {
      setTotalPrice(selectedRoom.price); 
    } else {
      setTotalPrice(0);
    }
  }, [dateRange, guests, selectedRoom]);

  const handleBooking = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please sign in to book a hotel.",
        variant: "destructive",
      });
      // Optionally, redirect to sign-in page: router.push('/signin?redirect=/hotel/' + hotel.id);
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
      bookingDate: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const existingBookingsString = localStorage.getItem('hotelBookings');
      const existingBookings: Booking[] = existingBookingsString ? JSON.parse(existingBookingsString) : [];
      existingBookings.push(newBooking);
      localStorage.setItem('hotelBookings', JSON.stringify(existingBookings));

      toast({
        title: "Booking Requested!",
        description: `Your request for ${selectedRoom.name} at ${hotel.name} has been submitted. The hotel owner will be notified.`,
      });
      console.log("New Booking Stored (Local):", newBooking);

    } catch (error) {
      console.error("Error saving booking to localStorage:", error);
      toast({
        title: "Booking Error",
        description: "Could not save your booking locally. Please try again.",
        variant: "destructive",
      });
    }
  };
  
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

  return (
    <Card className="shadow-xl sticky top-24">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <DollarSign size={26} className="mr-2 text-primary" />
          Book Your Stay
        </CardTitle>
        {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
             <p className="text-muted-foreground text-sm">
                Starting from <span className="font-semibold text-lg text-primary">${hotel.pricePerNight}</span> / night
            </p>
        ): (
             <p className="text-muted-foreground text-sm">
                Room prices vary. Select options to see total.
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
                {hotel.roomTypes.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                    {room.name} (${room.price}/night, Max: {room.maxGuests} guests)
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">No specific room types available for this hotel.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 pt-6 border-t">
        {selectedRoom && (dateRange?.from && dateRange?.to && differenceInDays(dateRange.to, dateRange.from) > 0) && (
          <div className="text-center">
            <p className="text-muted-foreground">Total Price for {differenceInDays(dateRange.to, dateRange.from)} nights:</p>
            <p className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</p>
          </div>
        )}
        {!currentUser && (
          <div className="text-sm text-destructive flex items-center gap-2 p-2 border border-destructive/50 rounded-md">
             <ShieldAlert size={18} /> Please sign in to complete your booking.
          </div>
        )}
        {(currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin')) && (
             <div className="text-sm text-yellow-600 flex items-center gap-2 p-2 border border-yellow-500/50 rounded-md bg-yellow-50">
                <ShieldAlert size={18} /> Owners/Admins cannot make bookings.
            </div>
        )}
        <Button 
          onClick={handleBooking} 
          size="lg" 
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
          disabled={
            !dateRange?.from || 
            !dateRange?.to || 
            !selectedRoom || 
            (differenceInDays(dateRange.to, dateRange.from) <=0) || 
            !currentUser ||
            currentUser.role === 'owner' ||
            currentUser.role === 'admin'
          }
        >
          <ShoppingCart className="mr-2 h-5 w-5"/>
          {currentUser ? (currentUser.role === 'owner' || currentUser.role === 'admin' ? 'Booking N/A' : 'Book Now') : 'Sign In to Book'}
        </Button>
      </CardFooter>
    </Card>
  );
}
