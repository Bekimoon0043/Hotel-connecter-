
"use client"; 

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import HotelCard from '@/components/hotel-card';
import HotelFilters from '@/components/hotel-filters';
import type { Hotel } from '@/lib/types'; // Keep Hotel type
import { SearchX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SearchPageLoading from './loading'; 

// This component handles fetching from localStorage and rendering results.
function Results({ currentDestination }: { currentDestination: string | null }) {
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let hotelsFromStorage: Hotel[] = [];
    try {
      const storedHotels = localStorage.getItem('registeredHotels');
      if (storedHotels) {
        hotelsFromStorage = JSON.parse(storedHotels) as Hotel[];
      }
    } catch (error) {
      console.error("Error parsing registered hotels from localStorage:", error);
      // Potentially show a toast or error message to the user
    }
    
    if (!currentDestination || currentDestination.trim() === "") {
      setFilteredHotels(hotelsFromStorage); // Show all registered hotels if no destination
    } else {
      const searchTerm = currentDestination.toLowerCase();
      const results = hotelsFromStorage.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm) ||
        hotel.location.city.toLowerCase().includes(searchTerm) ||
        hotel.location.country.toLowerCase().includes(searchTerm)
      );
      setFilteredHotels(results);
    }
    setIsLoading(false);
  }, [currentDestination]);

  if (isLoading) {
    return <SearchPageLoading />;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-8">
          {currentDestination ? `Hotels in "${currentDestination}"` : "Explore Registered Hotels"}
        </h1>
        <p className="text-muted-foreground mt-1">{filteredHotels.length} registered properties found.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          {/* HotelFilters would need to be adapted to filter client-side data if made functional */}
          <HotelFilters /> 
        </aside>
        <main className="lg:col-span-9">
          {filteredHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <Alert variant="default" className="shadow-md">
              <SearchX className="h-5 w-5" />
              <AlertTitle>No Registered Hotels Found</AlertTitle>
              <AlertDescription>
                {currentDestination 
                  ? `We couldn't find any registered hotels matching your criteria for "${currentDestination}". Try adjusting your search or register a new hotel.`
                  : "No hotels have been registered locally yet. Go to 'List Your Property' to add one!"}
              </AlertDescription>
            </Alert>
          )}
        </main>
      </div>
    </>
  );
}

// Main component for the search page, handles Suspense for search params.
function SearchResultsPageContent() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination');
  
  // Keying the Results component to ensure it re-renders/re-runs useEffect when destination changes.
  return <Results key={destination} currentDestination={destination} />;
}

export default function SearchPage() {
  // Suspense at this top level ensures useSearchParams can be read by SearchResultsPageContent
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <div className="py-8 md:py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchResultsPageContent />
        </div>
      </div>
    </Suspense>
  );
}
