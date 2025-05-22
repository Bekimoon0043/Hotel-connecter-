"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { MapPin, CalendarDays, Users, Search } from 'lucide-react';
import type { DateRange } from "react-day-picker";

export default function HotelSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set default dates for better UX, e.g., today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDateRange({ from: today, to: tomorrow });
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      // Basic validation: alert or use a toast
      alert("Please enter a destination.");
      return;
    }
    const queryParams = new URLSearchParams();
    queryParams.append('destination', destination);
    if (dateRange?.from) {
      queryParams.append('checkIn', format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to) {
      queryParams.append('checkOut', format(dateRange.to, 'yyyy-MM-dd'));
    }
    queryParams.append('guests', guests.toString());
    router.push(`/search?${queryParams.toString()}`);
  };

  if (!isClient) {
    // Render a simplified version or skeleton during SSR/SSG to avoid hydration issues
    return (
      <div className="p-6 bg-card rounded-xl shadow-2xl w-full max-w-3xl mx-auto animate-pulse">
        <div className="h-10 bg-muted rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
        <div className="h-12 bg-primary/50 rounded"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-card rounded-xl shadow-2xl w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-4">
          <Label htmlFor="destination" className="block text-sm font-medium mb-1.5">Destination</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="destination"
              type="text"
              placeholder="e.g. Paris, New York"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 h-12 text-base"
              required
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <Label htmlFor="check-in-out" className="block text-sm font-medium mb-1.5">Check-in / Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="check-in-out"
                variant="outline"
                className="w-full justify-start text-left font-normal h-12 text-base"
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
                numberOfMonths={2}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="lg:col-span-2">
          <Label htmlFor="guests" className="block text-sm font-medium mb-1.5">Guests</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="guests"
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <Button type="submit" className="w-full h-12 text-base bg-accent text-accent-foreground hover:bg-accent/90">
            <Search className="mr-2 h-5 w-5" />
            Search Hotels
          </Button>
        </div>
      </div>
    </form>
  );
}
