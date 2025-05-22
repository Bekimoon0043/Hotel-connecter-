
"use client";

import { useState, useEffect } from 'react';
import type { Amenity } from '@/lib/types';
import { ALL_AMENITIES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Filter, Star, DollarSign, Wifi, ParkingCircle, Utensils, Droplet, Sparkles } from 'lucide-react';

// Map amenity names to icons
const amenityIconMap: Record<Amenity, React.ReactNode> = {
    'Wifi': <Wifi size={18} className="mr-2 text-primary" />,
    'Pool': <Droplet size={18} className="mr-2 text-primary" />,
    'Parking': <ParkingCircle size={18} className="mr-2 text-primary" />,
    'Air Conditioning': <Sparkles size={18} className="mr-2 text-primary" />, // Using Sparkles as a generic AC icon
    'Restaurant': <Utensils size={18} className="mr-2 text-primary" />,
    'Gym': <Sparkles size={18} className="mr-2 text-primary" />, // Placeholder
    'Spa': <Sparkles size={18} className="mr-2 text-primary" />, // Placeholder
    'Pet Friendly': <Sparkles size={18} className="mr-2 text-primary" />, // Placeholder
    'Bar': <Sparkles size={18} className="mr-2 text-primary" />, // Placeholder
    'TV': <Sparkles size={18} className="mr-2 text-primary" />, // Placeholder for TV
    'Kitchen': <Utensils size={18} className="mr-2 text-primary" />,
    'Washer': <Sparkles size={18} className="mr-2 text-primary" />, // Placeholder
    'Dryer': <Sparkles size={18} className="mr-2 text-primary" />, // Placeholder
    'Heating': <Sparkles size={18} className="mr-2 text-primary" />, // Placeholder
    'Beach Access': <Sparkles size={18} className="mr-2 text-primary" />,
    'Fireplace': <Sparkles size={18} className="mr-2 text-primary" />,
    'Lake View': <Sparkles size={18} className="mr-2 text-primary" />,
    'Boat Tours': <Sparkles size={18} className="mr-2 text-primary" />,
    'Desert Safari': <Sparkles size={18} className="mr-2 text-primary" />,
};


export interface Filters {
  priceRange: [number, number];
  ratings: number[];
  amenities: Amenity[];
}

interface HotelFiltersProps {
  activeFilters: Filters;
  onFilterChange: (newFilters: Filters) => void;
}

export default function HotelFilters({ activeFilters, onFilterChange }: HotelFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(activeFilters.priceRange);

  // Sync local price range when activeFilters.priceRange prop changes
  useEffect(() => {
    setLocalPriceRange(activeFilters.priceRange);
  }, [activeFilters.priceRange]);

  const handlePriceChange = (newRange: [number, number]) => {
    setLocalPriceRange(newRange); // Update local state immediately for slider responsiveness
  };
  
  // This function is called when the slider interaction ends (onCommit or similar)
  // or can be triggered by a button if preferred.
  const commitPriceChange = (finalRange: [number, number]) => {
     onFilterChange({ ...activeFilters, priceRange: finalRange });
  };

  const handleRatingChange = (rating: number, checked: boolean | string) => {
    const newRatings = checked === true
      ? [...activeFilters.ratings, rating]
      : activeFilters.ratings.filter(r => r !== rating);
    onFilterChange({ ...activeFilters, ratings: newRatings });
  };

  const handleAmenityChange = (amenity: Amenity, checked: boolean | string) => {
    const newAmenities = checked === true
      ? [...activeFilters.amenities, amenity]
      : activeFilters.amenities.filter(a => a !== amenity);
    onFilterChange({ ...activeFilters, amenities: newAmenities });
  };

  const ratingsOptions = [5, 4, 3, 2, 1];

  return (
    <Card className="shadow-lg sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Filter size={22} className="mr-2 text-primary" />
          Filter Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="price-range" className="text-base font-semibold mb-2 block">Price Range ($)</Label>
          <Slider
            id="price-range"
            min={0}
            max={1000}
            step={10}
            value={localPriceRange}
            onValueChange={handlePriceChange} // Updates local state for smooth sliding
            onValueCommit={commitPriceChange} // Updates parent state on slider release
            className="my-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${localPriceRange[0]}</span>
            <span>${localPriceRange[1]}</span>
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-2 block">Rating</Label>
          <div className="space-y-2">
            {ratingsOptions.map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox 
                  id={`rating-${rating}`} 
                  checked={activeFilters.ratings.includes(rating)}
                  onCheckedChange={(checked) => handleRatingChange(rating, checked)}
                />
                <Label htmlFor={`rating-${rating}`} className="flex items-center font-normal cursor-pointer">
                  {[...Array(rating)].map((_, i) => <Star key={`f-${i}`} size={16} className="text-accent fill-accent mr-0.5" />)}
                  {[...Array(5 - rating)].map((_, i) => <Star key={`e-${i}`} size={16} className="text-muted mr-0.5" />)}
                  <span className="ml-1 text-sm">{rating} Star{rating > 1 ? 's' : ''} {rating < 5 ? '& Up' : ''}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-2 block">Amenities</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {ALL_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox 
                  id={`amenity-${amenity}`} 
                  checked={activeFilters.amenities.includes(amenity)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                />
                <Label htmlFor={`amenity-${amenity}`} className="flex items-center font-normal cursor-pointer text-sm">
                  {amenityIconMap[amenity] || <Sparkles size={18} className="mr-2 text-primary" />}
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* 
          The "Apply Filters" button is less necessary if filters apply on change. 
          If you want explicit application, you'd uncomment this and remove onFilterChange calls from individual handlers,
          then call onFilterChange with all local states inside an onApplyFilters function.
        */}
        {/* <Button 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => onFilterChange({ priceRange: localPriceRange, ratings: activeFilters.ratings, amenities: activeFilters.amenities })}
        >
          Apply Filters
        </Button> */}
      </CardContent>
    </Card>
  );
}
