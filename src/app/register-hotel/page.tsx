
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Hotel, Amenity } from '@/lib/types'; 
import { ALL_AMENITIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Building, MapPin, FileText, Mail, Globe, Home, DollarSign, Image as ImageIcon, ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';

interface CurrentUser {
  email: string;
  fullName: string;
  role: 'owner' | 'booker';
}

export default function RegisterHotelPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [hotelName, setHotelName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);

  const [hotelImageFile1, setHotelImageFile1] = useState<File | null>(null);
  const [imagePreviewUrl1, setImagePreviewUrl1] = useState<string | null>(null);
  const [hotelImageFile2, setHotelImageFile2] = useState<File | null>(null);
  const [imagePreviewUrl2, setImagePreviewUrl2] = useState<string | null>(null);
  const [hotelImageFile3, setHotelImageFile3] = useState<File | null>(null);
  const [imagePreviewUrl3, setImagePreviewUrl3] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user: CurrentUser = JSON.parse(userStr);
        setCurrentUser(user);
        if (user.role !== 'owner') {
          toast({
            title: "Access Denied",
            description: "You must be a hotel owner to list a property.",
            variant: "destructive",
          });
          router.push('/explore'); 
        }
      } catch (e) {
        console.error("Error parsing currentUser", e);
        localStorage.removeItem('currentUser');
        router.push('/signin?role=owner&redirect=/register-hotel');
      }
    } else {
      router.push('/signin?role=owner&redirect=/register-hotel');
    }
    setIsLoadingAuth(false);
  }, [router, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2 | 3) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const setFile = imageNumber === 1 ? setHotelImageFile1 : imageNumber === 2 ? setHotelImageFile2 : setHotelImageFile3;
      const setPreview = imageNumber === 1 ? setImagePreviewUrl1 : imageNumber === 2 ? setImagePreviewUrl2 : setImagePreviewUrl3;
      
      setFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      const setFile = imageNumber === 1 ? setHotelImageFile1 : imageNumber === 2 ? setHotelImageFile2 : setHotelImageFile3;
      const setPreview = imageNumber === 1 ? setImagePreviewUrl1 : imageNumber === 2 ? setImagePreviewUrl2 : setImagePreviewUrl3;
      setFile(null);
      setPreview(null);
    }
  };

  const handleAmenityChange = (amenity: Amenity, checked: boolean | string) => {
    setSelectedAmenities(prev => 
      checked === true ? [...prev, amenity] : prev.filter(a => a !== amenity)
    );
  };

  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as Data URL.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || currentUser.role !== 'owner') {
      toast({
        title: "Authentication Error",
        description: "You are not authorized to perform this action.",
        variant: "destructive",
      });
      return;
    }

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

    const hotelImages: string[] = [];
    try {
      hotelImages.push(hotelImageFile1 ? await convertFileToDataURL(hotelImageFile1) : "https://placehold.co/800x600.png");
      hotelImages.push(hotelImageFile2 ? await convertFileToDataURL(hotelImageFile2) : "https://placehold.co/600x400.png");
      hotelImages.push(hotelImageFile3 ? await convertFileToDataURL(hotelImageFile3) : "https://placehold.co/600x400.png");
    } catch (error) {
        console.error("Error converting image(s) to Data URL:", error);
        toast({
          title: "Image Upload Error",
          description: "Could not process one or more uploaded images. Using default images.",
          variant: "destructive",
        });
        while(hotelImages.length < 3) {
            if(hotelImages.length === 0) hotelImages.push("https://placehold.co/800x600.png");
            else hotelImages.push("https://placehold.co/600x400.png");
        }
    }

    const newHotel: Hotel = {
      id: newHotelId,
      name: hotelName,
      ownerEmail: currentUser.email,
      location: {
        city: city,
        country: country,
        address: address,
      },
      images: hotelImages,
      rating: Math.floor(Math.random() * 3 + 20) / 10, // Random rating between 2.0 and 4.9 
      pricePerNight: parsedPrice,
      description: description,
      amenities: selectedAmenities, 
      roomTypes: [ // Default room type
        {
          id: `rt-${Date.now()}`,
          name: 'Standard Room',
          price: parsedPrice,
          beds: 1,
          maxGuests: 2,
          image: hotelImages[0] || "https://placehold.co/600x400.png",
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
        action: (
            <Button variant="outline" size="sm" onClick={() => router.push(`/hotel/${newHotel.id}`)}>
                View Property
            </Button>
        )
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
      setSelectedAmenities([]);
      setHotelImageFile1(null); setImagePreviewUrl1(null);
      setHotelImageFile2(null); setImagePreviewUrl2(null);
      setHotelImageFile3(null); setImagePreviewUrl3(null);
      
      // Reset file input fields visually
      (document.getElementById('hotelImage1') as HTMLInputElement).value = '';
      (document.getElementById('hotelImage2') as HTMLInputElement).value = '';
      (document.getElementById('hotelImage3') as HTMLInputElement).value = '';

    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast({
        title: "Registration Error",
        description: "Could not save your hotel registration locally. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const imageInputFields = [
    { file: hotelImageFile1, preview: imagePreviewUrl1, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleImageChange(e, 1), id: "hotelImage1", label: "Main Image (e.g., Exterior)" },
    { file: hotelImageFile2, preview: imagePreviewUrl2, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleImageChange(e, 2), id: "hotelImage2", label: "Secondary Image (e.g., Lobby/Room)" },
    { file: hotelImageFile3, preview: imagePreviewUrl3, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleImageChange(e, 3), id: "hotelImage3", label: "Tertiary Image (e.g., Amenity/View)" },
  ];


  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12 md:py-16 bg-muted/20">
        <Card className="shadow-xl w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4 animate-pulse">
                <Home size={32} />
            </div>
            <div className="h-8 bg-muted rounded w-1/2 mx-auto animate-pulse mb-2"></div>
            <div className="h-5 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(8)].map((_, i) => ( // Increased for more fields
                 <div key={i} className="space-y-2">
                    <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
                    <div className="h-11 bg-muted rounded w-full animate-pulse"></div>
                </div>
            ))}
             <CardFooter className="p-0 pt-4">
                <div className="h-12 bg-muted rounded w-full animate-pulse"></div>
              </CardFooter>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'owner') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-muted/20">
            <Card className="shadow-xl p-8 text-center">
                <ShieldAlert size={48} className="mx-auto mb-4 text-destructive" />
                <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
                <CardDescription className="mb-4">You do not have permission to view this page.</CardDescription>
                <Button onClick={() => router.push('/explore')}>Go to Explore</Button>
            </Card>
        </div>
    );
  }

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
            <form onSubmit={handleSubmit} className="space-y-8">
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

              <Card className="p-4 border-dashed border-primary/50">
                <CardTitle className="text-lg mb-3 font-semibold flex items-center">
                  <ImageIcon size={20} className="mr-2 text-primary" /> Hotel Images (Up to 3)
                </CardTitle>
                <div className="space-y-4">
                  {imageInputFields.map((field, index) => (
                    <div key={field.id}>
                      <Label htmlFor={field.id} className="text-sm font-medium text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        id={field.id}
                        type="file"
                        accept="image/*"
                        onChange={field.handler}
                        className="mt-1 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      {field.preview && (
                        <div className="mt-3">
                          <img src={field.preview} alt={`Preview ${index + 1}`} className="max-h-36 rounded-md shadow-md object-contain" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 border-dashed border-primary/50">
                <CardTitle className="text-lg mb-3 font-semibold flex items-center">
                  <Sparkles size={20} className="mr-2 text-primary" /> Hotel Amenities
                </CardTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                  {ALL_AMENITIES.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="font-normal text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </Card>

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
                  <Mail size={18} className="mr-2 text-primary" /> Contact Email (Optional for Public Display)
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

              <CardFooter className="p-0 pt-6">
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6">
                  <CheckCircle size={20} className="mr-2" /> Register My Hotel
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
