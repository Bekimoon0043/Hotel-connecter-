
"use client";

import { useState, useEffect } from 'react';
import type { Hotel } from '@/lib/types';
import { getAllHotels } from '@/lib/types';
import HotelCard from '@/components/hotel-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PopularHotelsSection() {
  const [displayedHotels, setDisplayedHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const allHotels = getAllHotels();
    
    // Sort by rating to get "popular" hotels
    const sortedHotels = allHotels.sort((a, b) => b.rating - a.rating);

    setDisplayedHotels(sortedHotels.slice(0, 6)); // Show top 6
    setIsLoading(false);
  }, []);

  if (isLoading && displayedHotels.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Popular Destinations</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Loading amazing stays...
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-1/3 mb-3" />
                  <Skeleton className="h-10 w-1/2 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">Popular Destinations</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Explore top-rated hotels in the most sought-after locations. Unforgettable experiences await.
        </p>
        {displayedHotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No popular hotels to display at the moment. Try registering a property or check back later!
          </p>
        )}
      </div>
    </section>
  );
}
