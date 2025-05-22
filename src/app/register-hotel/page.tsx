
"use client";

import { useState } from 'react';
import type { Hotel, RoomType } from '@/lib/types'; // Import Hotel and RoomType
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Building, MapPin, FileText, Mail, Globe, Home, DollarSign } from 'lucide-react';

export default function RegisterHotelPage() {
  const { toast } = useToast();
  const [hotelName, setHotelName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(''); // Kept for potential future use
  const [website, setWebsite] = useState(''); // Kept for potential future use
  const [pricePerNight, setPricePerNight] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newHotelId = hotelName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const parsedPrice = parseFloat(pricePerNight);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price per night.",
        variant: "destructive",
      });
      return;
    }

    const newHotel: Hotel = {
      id: newHotelId,
      name: hotelName,
      location: {
        city: city,
        country: country,
        address: address,
      },
      images: [
        "https://placehold.co/800x600.png",
        "https://placehold.co/600x400.png",
        "https://placehold.co/600x400.png"
      ], // Default images
      rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3 and 5 for variety
      pricePerNight: parsedPrice,
      description: description,
      amenities: ['Wifi', 'Parking', 'Air Conditioning', 'Restaurant', 'TV'], // Default amenities
      roomTypes: [
        {
          id: `rt-${Date.now()}`,
          name: 'Standard Room',
          price: parsedPrice, // Room price matches hotel's base price
          beds: 1,
          maxGuests: 2,
          image: 'https://placehold.co/600x400.png',
          description: 'A comfortable standard room equipped with essential amenities.'
        }
      ]
    };

    try {
      const existingHotelsString = localStorage.getItem('registeredHotels');
      const existingHotels: Hotel[] = existingHotelsString ? JSON.parse(existingHotelsString) : [];
      existingHotels.push(newHotel);
      localStorage.setItem('registeredHotels', JSON.stringify(existingHotels));

      toast({
        title: "Property Submitted!",
        description: `${hotelName} has been registered locally.`,
      });

      // Reset form fields
      setHotelName('');
      setCity('');
      setCountry('');
      setAddress('');
      setDescription('');
      setContactEmail('');
      setWebsite('');
      setPricePerNight('');
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast({
        title: "Registration Error",
        description: "Could not save your hotel registration locally. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-12 md:py-16 bg-muted/20">
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                <Home size={32} />
            </div>
            <CardTitle className="text-3xl font-bold">List Your Property</CardTitle>
            <CardDescription className="text-muted-foreground">
              Fill in the details below to register your hotel with Hotel Connector.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="hotelName" className="text-base font-semibold flex items-center">
                  <Building size={18} className="mr-2 text-primary" /> Hotel Name
                </Label>
                <Input
                  id="hotelName"
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="e.g., The Grand Plaza"
                  required
                  className="mt-1 h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city" className="text-base font-semibold flex items-center">
                    <MapPin size={18} className="mr-2 text-primary" /> City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., New York"
                    required
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-base font-semibold flex items-center">
                    <Globe size={18} className="mr-2 text-primary" /> Country
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., USA"
                    required
                    className="mt-1 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-base font-semibold flex items-center">
                  <MapPin size={18} className="mr-2 text-primary" /> Full Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Main Street, Suite 4B"
                  required
                  className="mt-1 h-11"
                />
              </div>
              
              <div>
                <Label htmlFor="pricePerNight" className="text-base font-semibold flex items-center">
                  <DollarSign size={18} className="mr-2 text-primary" /> Price Per Night (USD)
                </Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="e.g., 150"
                  required
                  min="0"
                  step="1"
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold flex items-center">
                  <FileText size={18} className="mr-2 text-primary" /> Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your wonderful hotel..."
                  required
                  className="mt-1 min-h-[120px]"
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail" className="text-base font-semibold flex items-center">
                  <Mail size={18} className="mr-2 text-primary" /> Contact Email (Optional)
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g., contact@yourhotel.com"
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <Label htmlFor="website" className="text-base font-semibold flex items-center">
                  <Globe size={18} className="mr-2 text-primary" /> Hotel Website (Optional)
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g., https://www.yourhotel.com"
                  className="mt-1 h-11"
                />
              </div>

              <CardFooter className="p-0 pt-4">
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6">
                  Register My Hotel
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
