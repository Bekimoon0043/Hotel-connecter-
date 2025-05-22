
import Image from 'next/image';
import Link from 'next/link';
import type { Hotel } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/star-rating';
import { MapPin, DollarSign } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const primaryImage = (hotel.images && hotel.images.length > 0 && hotel.images[0]) 
    ? hotel.images[0] 
    : "https://placehold.co/400x250.png";

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Link href={`/hotel/${hotel.id}`} className="block">
          <Image
            src={primaryImage}
            alt={`Image of ${hotel.name}`}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
            data-ai-hint="hotel exterior building"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/hotel/${hotel.id}`}>
           <CardTitle className="text-xl font-semibold mb-1 hover:text-primary transition-colors">{hotel.name}</CardTitle>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <MapPin size={16} className="mr-1.5 flex-shrink-0" />
          <span>{hotel.location.city}, {hotel.location.country}</span>
        </div>
        <div className="mb-2">
          <StarRating rating={hotel.rating} size={18} />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {hotel.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <div className="flex items-center">
           <DollarSign size={18} className="text-primary mr-1" />
           <span className="text-lg font-semibold text-primary">{hotel.pricePerNight}</span>
           <span className="text-xs text-muted-foreground ml-1">/night</span>
        </div>
        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/hotel/${hotel.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
