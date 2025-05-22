
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { Hotel, RoomType } from '@/lib/types';
import { format, differenceInDays, addDays } from 'date-fns';
import { CalendarDays, Users, BedDouble, DollarSign, ShoppingCart } from 'lucide-react';
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";

interface BookingSectionProps {
  hotel: Hotel;
}

export default function BookingSection({ hotel }: BookingSectionProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | undefined>(hotel.roomTypes[0]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize dateRange here to ensure new Date() is called client-side
    const today = new Date();
    const tomorrow = addDays(today, 1);
    setDateRange({ from: today, to: tomorrow });
  }, []);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && selectedRoom) {
      const nights = differenceInDays(dateRange.to, dateRange.from);
      if (nights > 0) {
        setTotalPrice(nights * selectedRoom.price * guests);
      } else {
        // If dates are the same or checkout is before checkin, but a room is selected
        setTotalPrice(selectedRoom.price * guests); 
      }
    } else if (selectedRoom) {
      setTotalPrice(selectedRoom.price * guests); // Price for 1 night if no range
    } else {
      setTotalPrice(0);
    }
  }, [dateRange, guests, selectedRoom]);

  const handleBooking = () => {
    if (!dateRange?.from || !dateRange?.to || !selectedRoom) {
      toast({
        title: "Incomplete Information",
        description: "Please select dates and a room type.",
        variant: "destructive",
      });
      return;
    }
    if (differenceInDays(dateRange.to, dateRange.from) <= 0) {
      toast({
        title: "Invalid Date Range",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }
    // Mock booking action
    console.log({
      hotelId: hotel.id,
      roomId: selectedRoom.id,
      checkIn: dateRange.from,
      checkOut: dateRange.to,
      guests,
      totalPrice,
    });
    toast({
      title: "Booking Requested!",
      description: `Your request for ${selectedRoom.name} at ${hotel.name} has been submitted.`,
    });
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
        <p className="text-muted-foreground text-sm">
            Starting from <span className="font-semibold text-lg text-primary">${hotel.pricePerNight}</span> / night
        </p>
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
              value={guests}
              onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="room-type-details" className="text-base font-semibold">Room Type</Label>
          <Select
            value={selectedRoom?.id}
            onValueChange={(roomId) => {
              setSelectedRoom(hotel.roomTypes.find(r => r.id === roomId));
            }}
          >
            <SelectTrigger id="room-type-details" className="mt-1 h-11">
              <BedDouble className="mr-2 h-5 w-5 text-muted-foreground inline-block" />
              <SelectValue placeholder="Select a room type" />
            </SelectTrigger>
            <SelectContent>
              {hotel.roomTypes.map(room => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} (${room.price}/night)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 pt-6 border-t">
        {selectedRoom && (dateRange?.from && dateRange?.to && differenceInDays(dateRange.to, dateRange.from) > 0) && (
          <div className="text-center">
            <p className="text-muted-foreground">Total Price for {differenceInDays(dateRange.to, dateRange.from)} nights:</p>
            <p className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</p>
          </div>
        )}
        <Button 
          onClick={handleBooking} 
          size="lg" 
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
          disabled={!dateRange?.from || !dateRange?.to || !selectedRoom || (differenceInDays(dateRange.to, dateRange.from) <=0)}
        >
          <ShoppingCart className="mr-2 h-5 w-5"/>
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}
