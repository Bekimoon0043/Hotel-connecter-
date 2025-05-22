import HotelSearchForm from '@/components/hotel-search-form';
import HotelCard from '@/components/hotel-card';
import { getAllHotels, type Hotel } from '@/lib/types';
import Image from 'next/image';

export default async function HomePage() {
  // Fetch popular hotels from the API
  const allHotels = await getAllHotels();
  // You might want a specific API endpoint for "popular" hotels
  // For now, slicing the first 6 as before
  const popularHotels = allHotels.slice(0, 6); 

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/30 via-background to-background">
        <div className="absolute inset-0 opacity-30">
          <Image 
            src="https://placehold.co/1920x1080.png" // Replace with a relevant, high-quality hero image
            alt="Beautiful travel destination"
            layout="fill"
            objectFit="cover"
            quality={80}
            priority
            data-ai-hint="travel landscape"
          />
           <div className="absolute inset-0 bg-black/10"></div> {/* Subtle overlay */}
        </div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              Find Your <span className="text-primary">Perfect Stay</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
              Discover and book unique accommodations anywhere in the world. Your next adventure starts here.
            </p>
          </div>
          <HotelSearchForm />
        </div>
      </section>

      {/* Popular Hotels Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Popular Destinations</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Explore top-rated hotels in the most sought-after locations. Unforgettable experiences await.
          </p>
          {popularHotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No popular hotels to display at the moment. Check back later!</p>
          )}
        </div>
      </section>
    </>
  );
}
