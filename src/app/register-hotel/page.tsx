
"use client";

import { useState } from 'react';
import type { Hotel } from '@/lib/types'; // Import Hotel
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Building, MapPin, FileText, Mail, Globe, Home, DollarSign, Image as ImageIcon } from 'lucide-react';

export default function RegisterHotelPage() {
  const { toast } = useToast();
  const [hotelName, setHotelName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [hotelImageFile, setHotelImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHotelImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Create a temporary URL for preview
    } else {
      setHotelImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    let hotelMainImage = "https://placehold.co/800x600.png"; // Default image
    if (hotelImageFile) {
      try {
        hotelMainImage = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to read file as Data URL.'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(hotelImageFile);
        });
      } catch (error) {
        console.error("Error converting image to Data URL:", error);
        toast({
          title: "Image Upload Error",
          description: "Could not process the uploaded image. Using default image.",
          variant: "destructive",
        });
        // Proceed with default image if conversion fails
      }
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
        hotelMainImage,
        "https://placehold.co/600x400.png",
        "https://placehold.co/600x400.png"
      ],
      rating: Math.floor(Math.random() * 3) + 3, 
      pricePerNight: parsedPrice,
      description: description,
      amenities: ['Wifi', 'Parking', 'Air Conditioning', 'Restaurant', 'TV'], 
      roomTypes: [
        {
          id: `rt-${Date.now()}`,
          name: 'Standard Room',
          price: parsedPrice,
          beds: 1,
          maxGuests: 2,
          image: hotelMainImage === "https://placehold.co/800x600.png" ? "https://placehold.co/600x400.png" : hotelMainImage, // Use uploaded image for room too if provided
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
      setHotelImageFile(null);
      setImagePreviewUrl(null);
      const fileInput = document.getElementById('hotelImage') as HTMLInputElement;
      if (fileInput) fileInput.value = '';


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
                <Label htmlFor="hotelImage" className="text-base font-semibold flex items-center">
                  <ImageIcon size={18} className="mr-2 text-primary" /> Hotel Image (Optional)
                </Label>
                <Input
                  id="hotelImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {imagePreviewUrl && (
                  <div className="mt-4">
                    <img src={imagePreviewUrl} alt="Hotel preview" className="max-h-48 rounded-md shadow-md" />
                  </div>
                )}
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

    