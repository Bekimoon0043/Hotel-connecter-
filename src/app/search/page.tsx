// This page uses hooks like useSearchParams, so it must be a client component at the top level.
// However, the data fetching part can be an async Server Component rendered via Suspense.
"use client"; 

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import HotelCard from '@/components/hotel-card';
import HotelFilters from '@/components/hotel-filters';
import { searchHotels, type Hotel } from '@/lib/types'; 
import { SearchX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SearchPageLoading from './loading'; // Use the existing loading component

// This component will handle the actual data fetching and rendering.
// It's marked async and will be wrapped in Suspense.
async function Results({ destination }: { destination: string | null }) {
  // Fetch hotels based on destination.
  // Your searchHotels function should handle API calls.
  const filteredHotels = await searchHotels({ destination });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-8">
          {destination ? `Hotels in "${destination}"` : "Explore All Hotels"}
        </h1>
        <p className="text-muted-foreground mt-1">{filteredHotels.length} properties found.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <HotelFilters /> {/* Filters might need to be adapted for API-based filtering */}
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
              <AlertTitle>No Hotels Found</AlertTitle>
              <AlertDescription>
                {destination 
                  ? `We couldn't find any hotels matching your criteria for "${destination}". Try adjusting your search or filters.`
                  : "No hotels available at the moment. Please try a different search."}
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
  
  // Keying the Suspense boundary by destination to ensure it refetches when destination changes.
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense key={destination} fallback={<SearchPageLoading />}>
          <Results destination={destination} />
        </Suspense>
      </div>
    </div>
  );
}

export default function SearchPage() {
  // Suspense at this top level ensures useSearchParams can be read by SearchResultsPageContent
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchResultsPageContent />
    </Suspense>
  );
}
