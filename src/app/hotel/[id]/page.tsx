
"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { getHotelById, type Hotel } from '@/lib/types';
import StarRating from '@/components/star-rating';
import BookingSection from '@/components/booking-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, CheckCircle, Wifi, Utensils, ParkingCircle, Droplet, Wind, Tv, Info, BedDouble, ImageOff, Users, Bed, DollarSign, Sparkles } from 'lucide-react';
import HotelDetailsLoading from './loading'; 

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
    case 'gym': return <Sparkles className={className} />; 
    case 'pet friendly': return <Sparkles className={className} />; 
    case 'spa': return <Sparkles className={className} />; 
    case 'beach access': return <Sparkles className={className} />; 
    case 'fireplace': return <Sparkles className={className} />;
    case 'bar': return <Sparkles className={className} />; 
    case 'lake view': return <Sparkles className={className} />; 
    case 'boat tours': return <Sparkles className={className} />; 
    case 'desert safari': return <Sparkles className={className} />; 
    case 'tv': return <Tv className={className} />;
    case 'kitchen': return <Utensils className={className} />;
    case 'washer': return <Sparkles className={className} />;
    case 'dryer': return <Sparkles className={className} />;
    case 'heating': return <Sparkles className={className} />;
    default: return <CheckCircle className={className} />;
  }
}

function HotelDetailsContent() {
  const params = useParams();
  const id = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    const foundHotel = getHotelById(id);
    setHotel(foundHotel || null);
  }, [id]);

  if (hotel === undefined) { 
    return <HotelDetailsLoading />;
  }

  if (!hotel) {
    notFound(); 
  }

  // Ensure hotel.images is an array and has at least 3 elements (can be placeholders)
  const displayImages = [...hotel.images]; // Assumes register-hotel ensures 3 images

  return (
    <div className="py-8 md:py-12 bg-muted/40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden shadow-xl">
            <div className="md:col-span-2 h-[300px] md:h-[500px] relative bg-muted">
              <Image
                src={displayImages[0]}
                alt={`Main image of ${hotel.name}`}
                layout="fill"
                objectFit="cover"
                priority
                className="transition-transform duration-300 hover:scale-105"
                data-ai-hint="hotel building exterior"
                onError={(e) => e.currentTarget.src = "https://placehold.co/800x600.png"}
              />
            </div>
            {displayImages.slice(1, 3).map((imgSrc, index) => (
              <div key={index} className="h-[200px] md:h-[246px] relative bg-muted">
                <Image
                  src={imgSrc}
                  alt={`Image ${index + 2} of ${hotel.name}`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                  data-ai-hint="hotel room interior"
                  onError={(e) => e.currentTarget.src = "https://placehold.co/600x400.png"}
                />
              </div>
            ))}
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
                  <div key={room.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-card">
                    <div className="relative w-full sm:w-48 h-40 sm:h-32 md:h-36 flex-shrink-0 bg-muted rounded-md">
                        <Image 
                          src={room.image || "https://placehold.co/600x400.png"} 
                          alt={room.name} 
                          layout="fill"
                          objectFit="cover" 
                          className="rounded-md"
                          data-ai-hint="hotel bedroom"
                          onError={(e) => e.currentTarget.src = "https://placehold.co/600x400.png"}
                        />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-primary">{room.name}</h3>
                      <div className="text-sm text-muted-foreground mb-1.5 space-x-3">
                        <span className="inline-flex items-center"><Users size={14} className="mr-1"/>Max: {room.maxGuests}</span>
                        <span className="inline-flex items-center"><Bed size={14} className="mr-1"/>Beds: {room.beds}</span>
                      </div>
                      {room.description && <p className="text-sm text-foreground/80 mb-2 line-clamp-2 leading-relaxed">{room.description}</p>}
                      <p className="text-lg font-semibold">
                        <DollarSign size={18} className="inline mr-0.5 text-primary"/>{room.price} 
                        <span className="text-xs text-muted-foreground"> / night</span>
                      </p>
                    </div>
                  </div>
                )) : (
                    <p className="text-muted-foreground">No specific room types available for this hotel. Base price may apply.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><MapPin size={22} className="mr-2 text-primary" />Location on Map</CardTitle>
              </CardHeader>
              <CardContent>
                {hotel.location.lat && hotel.location.lng ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden border">
                    <iframe
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${hotel.location.lat},${hotel.location.lng}&z=15&output=embed`}
                      title={`Map of ${hotel.name}`}
                      style={{ border: 0 }}
                    ></iframe>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Map location not provided by the owner.</p>
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

    
