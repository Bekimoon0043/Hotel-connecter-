
"use client"; 

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import HotelCard from '@/components/hotel-card';
import HotelFilters, { type Filters as ActiveFiltersType } from '@/components/hotel-filters';
import type { Hotel, Amenity } from '@/lib/types'; 
import { SearchX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SearchPageLoading from './loading'; 

const defaultFilters: ActiveFiltersType = {
  priceRange: [0, 1000], // Default full range
  ratings: [],           // No ratings selected by default
  amenities: [],         // No amenities selected by default
};

function Results({ currentDestination }: { currentDestination: string | null }) {
  const [allRegisteredHotels, setAllRegisteredHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<ActiveFiltersType>(defaultFilters);

  useEffect(() => {
    setIsLoading(true);
    let hotelsFromStorage: Hotel[] = [];
    try {
      const storedHotels = localStorage.getItem('registeredHotels');
      if (storedHotels) {
        hotelsFromStorage = JSON.parse(storedHotels) as Hotel[];
      }
      setAllRegisteredHotels(hotelsFromStorage);
    } catch (error) {
      console.error("Error parsing registered hotels from localStorage:", error);
    }
    // Initial load is done, filtering will happen in the next effect
  }, []); // Runs once on mount to load all hotels

  useEffect(() => {
    setIsLoading(true);
    let results = [...allRegisteredHotels];

    // Filter by destination
    if (currentDestination && currentDestination.trim() !== "") {
      const searchTerm = currentDestination.toLowerCase();
      results = results.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm) ||
        hotel.location.city.toLowerCase().includes(searchTerm) ||
        hotel.location.country.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by price range
    results = results.filter(hotel => 
      hotel.pricePerNight >= activeFilters.priceRange[0] && 
      hotel.pricePerNight <= activeFilters.priceRange[1]
    );

    // Filter by ratings (if any are selected)
    if (activeFilters.ratings.length > 0) {
      results = results.filter(hotel => 
        activeFilters.ratings.some(filterRating => Math.floor(hotel.rating) >= filterRating)
      );
    }
    
    // Filter by amenities (hotel must have ALL selected amenities)
    if (activeFilters.amenities.length > 0) {
      results = results.filter(hotel => 
        activeFilters.amenities.every(filterAmenity => 
          hotel.amenities.includes(filterAmenity)
        )
      );
    }

    setFilteredHotels(results);
    setIsLoading(false);
  }, [currentDestination, allRegisteredHotels, activeFilters]);


  const handleFilterChange = (newFilters: ActiveFiltersType) => {
    setActiveFilters(newFilters);
  };


  if (isLoading && filteredHotels.length === 0 && allRegisteredHotels.length === 0) { // Show loading only on initial data fetch
    return <SearchPageLoading />;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-8">
          {currentDestination ? `Hotels in "${currentDestination}"` : "Explore Registered Hotels"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isLoading ? 'Filtering...' : `${filteredHotels.length} registered properties found.`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <HotelFilters activeFilters={activeFilters} onFilterChange={handleFilterChange} /> 
        </aside>
        <main className="lg:col-span-9">
          {isLoading && filteredHotels.length > 0 && ( // Show a subtle loading for filtering when results are already present
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-50">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
          {!isLoading && filteredHotels.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
          {!isLoading && filteredHotels.length === 0 && (
            <Alert variant="default" className="shadow-md">
              <SearchX className="h-5 w-5" />
              <AlertTitle>No Registered Hotels Found</AlertTitle>
              <AlertDescription>
                {currentDestination || activeFilters.amenities.length > 0 || activeFilters.ratings.length > 0
                  ? `We couldn't find any registered hotels matching your current criteria. Try adjusting your search or filters.`
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
  
  return <Results key={destination} currentDestination={destination} />;
}

export default function SearchPage() {
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
