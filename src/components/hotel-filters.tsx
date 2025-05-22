"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Filter, Star, DollarSign, Wifi, ParkingCircle, Utensils } from 'lucide-react';

// This is a mock component. Actual filtering would require state management and API calls.
export default function HotelFilters() {
  const [priceRange, setPriceRange] = useState([50, 500]);
  
  const amenities = [
    { id: "wifi", label: "Wi-Fi", icon: <Wifi size={18} className="mr-2 text-primary" /> },
    { id: "parking", label: "Parking", icon: <ParkingCircle size={18} className="mr-2 text-primary" /> },
    { id: "kitchen", label: "Kitchen", icon: <Utensils size={18} className="mr-2 text-primary" /> },
    { id: "pool", label: "Pool", icon: <Filter size={18} className="mr-2 text-primary"/> /* Placeholder icon */},
  ];

  const ratings = [5, 4, 3];

  return (
    <Card className="shadow-lg sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Filter size={22} className="mr-2 text-primary" />
          Filter Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range Filter */}
        <div>
          <Label htmlFor="price-range" className="text-base font-semibold mb-2 block">Price Range</Label>
          <Slider
            id="price-range"
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="my-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Ratings Filter */}
        <div>
          <Label className="text-base font-semibold mb-2 block">Rating</Label>
          <div className="space-y-2">
            {ratings.map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="flex items-center font-normal">
                  {[...Array(rating)].map((_, i) => <Star key={i} size={16} className="text-accent fill-accent mr-0.5" />)}
                  {[...Array(5-rating)].map((_, i) => <Star key={i} size={16} className="text-muted mr-0.5" />)}
                  <span className="ml-1"> & Up</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Filter */}
        <div>
          <Label className="text-base font-semibold mb-2 block">Amenities</Label>
          <div className="space-y-2">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox id={`amenity-${amenity.id}`} />
                <Label htmlFor={`amenity-${amenity.id}`} className="flex items-center font-normal">
                  {amenity.icon}
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Apply Filters</Button>
      </CardContent>
    </Card>
  );
}
