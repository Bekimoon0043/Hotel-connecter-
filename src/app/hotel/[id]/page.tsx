
"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { getHotelById as getMockHotelById, type Hotel, type RoomType } from '@/lib/types';
import StarRating from '@/components/star-rating';
import BookingSection from '@/components/booking-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, CheckCircle, Wifi, Utensils, ParkingCircle, Droplet, Wind, Tv, Info, BedDouble } from 'lucide-react';
import HotelDetailsLoading from './loading'; // Use the existing loading component

interface AmenityIconProps {
  amenity: string;
  className?: string;
}

function AmenityIcon({ amenity, className = "h-5 w-5 text-primary" }: AmenityIconProps) {
  switch (amenity.toLowerCase()) {
    case 'wifi': return <Wifi className={className} />;
    case 'pool': return <Droplet className={className} />;
    case 'parking': return <ParkingCircle className={className} />;
    case 'air conditioning': return <Wind className={className} />;
    case 'restaurant': return <Utensils className={className} />;
    case 'gym': return <CheckCircle className={className} />; // Placeholder, consider a more specific icon like Dumbbell
    case 'pet friendly': return <CheckCircle className={className} />; // Placeholder, consider PawPrint
    case 'spa': return <CheckCircle className={className} />; // Placeholder, consider Sparkles or similar
    case 'beach access': return <CheckCircle className={className} />; // Placeholder
    case 'fireplace': return <CheckCircle className={className} />; // Placeholder, consider Flame
    case 'bar': return <CheckCircle className={className} />; // Placeholder, consider GlassWater or Wine
    case 'lake view': return <CheckCircle className={className} />; // Placeholder
    case 'boat tours': return <CheckCircle className={className} />; // Placeholder
    case 'desert safari': return <CheckCircle className={className} />; // Placeholder
    case 'tv': return <Tv className={className} />;
    default: return <CheckCircle className={className} />;
  }
}

function HotelDetailsContent() {
  const params = useParams();
  const id = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined); // undefined for loading, null for not found

  useEffect(() => {
    if (!id) return;

    let foundHotel: Hotel | undefined = undefined;

    // 1. Try to load from localStorage
    try {
      const storedHotelsString = localStorage.getItem('registeredHotels');
      if (storedHotelsString) {
        const registeredHotels: Hotel[] = JSON.parse(storedHotelsString);
        foundHotel = registeredHotels.find(h => h.id === id);
      }
    } catch (error) {
      console.error("Error reading registered hotels from localStorage:", error);
    }

    // 2. If not found in localStorage, try to load from mock data (async)
    if (!foundHotel) {
      getMockHotelById(id).then(mockHotel => {
        if (mockHotel) {
          setHotel(mockHotel);
        } else {
          setHotel(null); // Mark as not found
        }
      }).catch(() => {
        setHotel(null); // Error fetching, mark as not found
      });
    } else {
      setHotel(foundHotel);
    }
  }, [id]);

  if (hotel === undefined) { // Still loading
    return <HotelDetailsLoading />;
  }

  if (!hotel) {
    notFound(); // Triggers the not-found UI
  }

  return (
    <div className="py-8 md:py-12 bg-muted/40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden shadow-xl">
            <div className="md:col-span-2 h-[300px] md:h-[500px] relative">
              <Image
                src={hotel.images[0] || "https://placehold.co/800x600.png"}
                alt={`Main image of ${hotel.name}`}
                layout="fill"
                objectFit="cover"
                priority
                className="transition-transform duration-300 hover:scale-105"
                data-ai-hint="hotel building exterior"
              />
            </div>
            {hotel.images.slice(1, 3).map((img, index) => (
              <div key={index} className="h-[200px] md:h-[246px] relative">
                <Image
                  src={img || "https://placehold.co/600x400.png"}
                  alt={`Image ${index + 2} of ${hotel.name}`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                  data-ai-hint="hotel room interior"
                />
              </div>
            ))}
             {hotel.images.length < 3 && hotel.images.length === 2 && ( 
              <div className="h-[200px] md:h-[246px] bg-muted flex items-center justify-center rounded-lg">
                <BedDouble className="h-12 w-12 text-muted-foreground" data-ai-hint="bedroom interior" />
              </div>
            )}
             {hotel.images.length === 1 && ( 
              <>
                <div className="h-[200px] md:h-[246px] bg-muted flex items-center justify-center rounded-lg">
                  <BedDouble className="h-12 w-12 text-muted-foreground" data-ai-hint="bedroom furniture" />
                </div>
                <div className="h-[200px] md:h-[246px] bg-muted flex items-center justify-center rounded-lg">
                  <BedDouble className="h-12 w-12 text-muted-foreground" data-ai-hint="bed hotel" />
                </div>
              </>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{hotel.name}</h1>
                <div className="flex items-center text-muted-foreground mb-1">
                  <MapPin size={18} className="mr-1.5 flex-shrink-0 text-primary" />
                  <span>{hotel.location.address || `${hotel.location.city}, ${hotel.location.country}`}</span>
                </div>
                <StarRating rating={hotel.rating} size={22} showText />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Info size={22} className="mr-2 text-primary" />About this hotel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{hotel.description}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
               <CardHeader>
                <CardTitle className="text-xl">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                 {hotel.amenities && hotel.amenities.length > 0 ? (
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                    {hotel.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-center text-foreground/90">
                        <AmenityIcon amenity={amenity} className="h-5 w-5 mr-2.5 text-primary flex-shrink-0" />
                        <span>{amenity}</span>
                        </li>
                    ))}
                    </ul>
                 ) : (
                    <p className="text-muted-foreground">No amenities listed for this hotel.</p>
                 )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Room Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {hotel.roomTypes && hotel.roomTypes.length > 0 ? hotel.roomTypes.map((room) => (
                  <div key={room.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <Image 
                      src={room.image || "https://placehold.co/600x400.png"} 
                      alt={room.name} 
                      width={200} 
                      height={150} 
                      className="rounded-md object-cover w-full sm:w-48 h-40 sm:h-auto flex-shrink-0"
                      data-ai-hint="hotel bedroom"
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-primary">{room.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">Max guests: {room.maxGuests} · Beds: {room.beds}</p>
                      {room.description && <p className="text-sm text-foreground/80 mb-2 line-clamp-2">{room.description}</p>}
                      <p className="text-lg font-semibold">${room.price} <span className="text-xs text-muted-foreground">/ night</span></p>
                    </div>
                  </div>
                )) : (
                    <p className="text-muted-foreground">No room types available for this hotel.</p>
                )}
              </CardContent>
            </Card>

          </main>

          {/* Booking Section Sidebar */}
          <aside className="lg:col-span-1">
            <BookingSection hotel={hotel} />
          </aside>
        </div>
      </div>
    </div>
  );
}


export default function HotelDetailsPage() {
  return (
    <Suspense fallback={<HotelDetailsLoading />}>
      <HotelDetailsContent />
    </Suspense>
  );
}
