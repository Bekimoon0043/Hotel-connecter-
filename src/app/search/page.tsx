"use client"; // This page uses hooks like useSearchParams

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HotelCard from '@/components/hotel-card';
import HotelFilters from '@/components/hotel-filters';
import { mockHotels, type Hotel } from '@/lib/types'; // Assuming mockHotels is an array of all hotels
import { AlertCircle, SearchX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HotelSearchForm from '@/components/hotel-search-form'; // For a compact search bar on results page

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination');
  // const checkIn = searchParams.get('checkIn');
  // const checkOut = searchParams.get('checkOut');
  // const guests = searchParams.get('guests');

  // Mock filtering logic:
  // In a real app, you'd fetch data based on these params.
  // For now, filter mockHotels if a destination is provided.
  const filteredHotels = destination
    ? mockHotels.filter(hotel => 
        hotel.location.city.toLowerCase().includes(destination.toLowerCase()) ||
        hotel.location.country.toLowerCase().includes(destination.toLowerCase()) ||
        hotel.name.toLowerCase().includes(destination.toLowerCase())
      )
    : mockHotels; // Show all if no destination (or handle as an error/prompt)

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          {/* Optional: A compact search bar to modify search */}
          {/* <HotelSearchForm />  */}
          <h1 className="text-3xl font-bold mt-8">
            {destination ? `Hotels in "${destination}"` : "Explore All Hotels"}
          </h1>
          <p className="text-muted-foreground mt-1">{filteredHotels.length} properties found.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
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
                <AlertTitle>No Hotels Found</AlertTitle>
                <AlertDescription>
                  We couldn't find any hotels matching your criteria for "{destination}". Try adjusting your search or filters.
                </AlertDescription>
              </Alert>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


export default function SearchPage() {
  return (
    // Suspense is crucial for useSearchParams to work correctly in child components
    <Suspense fallback={<SearchPageLoading />}>
      <SearchResultsContent />
    </Suspense>
  );
}

// Basic loading component for the search page
function SearchPageLoading() {
  return (
     <div className="py-8 md:py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-10 bg-muted rounded w-3/4 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-1/4 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-card p-6 rounded-lg shadow-lg animate-pulse">
              <div className="h-8 bg-muted rounded mb-6"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-6">
                  <div className="h-6 bg-muted rounded mb-3 w-1/2"></div>
                  <div className="h-10 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
              <div className="h-12 bg-primary/50 rounded mt-4"></div>
            </div>
          </aside>
          <main className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-4">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
                    <div className="h-10 bg-primary/50 rounded w-1/2 ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
