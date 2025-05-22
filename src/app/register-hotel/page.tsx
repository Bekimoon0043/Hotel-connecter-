
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Hotel, Amenity, RoomType } from '@/lib/types'; 
import { ALL_AMENITIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Building, MapPin, FileText, Mail, Globe, Home, DollarSign, Image as ImageIcon, ShieldAlert, CheckCircle, Sparkles, BedDouble, PlusCircle, MinusCircle, Users as UsersIcon, Bed } from 'lucide-react';

interface CurrentUser {
  email: string;
  fullName: string;
  role: 'owner' | 'booker';
}

interface RoomTypeFormData extends Partial<Omit<RoomType, 'id' | 'image'>> {
  id?: string; // Keep original ID if editing, generate if new
  imageFile?: File | null;
  imagePreview?: string | null;
  key: string; // For React list key
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
  const [pricePerNight, setPricePerNight] = useState(''); // Indicative starting price
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);

  const [hotelImageFile1, setHotelImageFile1] = useState<File | null>(null);
  const [imagePreviewUrl1, setImagePreviewUrl1] = useState<string | null>(null);
  const [hotelImageFile2, setHotelImageFile2] = useState<File | null>(null);
  const [imagePreviewUrl2, setImagePreviewUrl2] = useState<string | null>(null);
  const [hotelImageFile3, setHotelImageFile3] = useState<File | null>(null);
  const [imagePreviewUrl3, setImagePreviewUrl3] = useState<string | null>(null);

  const [roomTypesData, setRoomTypesData] = useState<RoomTypeFormData[]>([
    { key: `room-${Date.now()}`, name: '', price: undefined, beds: 1, maxGuests: 2, description: '', imageFile: null, imagePreview: null }
  ]);

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

  const handleHotelImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2 | 3) => {
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

  const addRoomTypeField = () => {
    setRoomTypesData(prev => [...prev, { key: `room-${Date.now()}`, name: '', price: undefined, beds: 1, maxGuests: 2, description: '', imageFile: null, imagePreview: null }]);
  };

  const removeRoomTypeField = (index: number) => {
    setRoomTypesData(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoomTypeChange = (index: number, field: keyof RoomTypeFormData, value: any) => {
    setRoomTypesData(prev => 
      prev.map((room, i) => 
        i === index ? { ...room, [field]: field === 'price' || field === 'beds' || field === 'maxGuests' ? (value ? parseFloat(value) : undefined) : value } : room
      )
    );
  };

  const handleRoomImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setRoomTypesData(prev => 
        prev.map((room, i) => 
          i === index ? { ...room, imageFile: file, imagePreview: previewUrl } : room
        )
      );
    } else {
       setRoomTypesData(prev => 
        prev.map((room, i) => 
          i === index ? { ...room, imageFile: null, imagePreview: null } : room
        )
      );
    }
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
      toast({ title: "Authentication Error", description: "You are not authorized to perform this action.", variant: "destructive" });
      return;
    }

    let hotelMainPrice = parseFloat(pricePerNight);
    if (isNaN(hotelMainPrice) || hotelMainPrice <=0) {
        hotelMainPrice = 0; // Default if not specified or invalid, will be overridden by room prices
    }

    const hotelImages: string[] = [];
    try {
      hotelImages.push(hotelImageFile1 ? await convertFileToDataURL(hotelImageFile1) : "https://placehold.co/800x600.png");
      hotelImages.push(hotelImageFile2 ? await convertFileToDataURL(hotelImageFile2) : "https://placehold.co/600x400.png");
      hotelImages.push(hotelImageFile3 ? await convertFileToDataURL(hotelImageFile3) : "https://placehold.co/600x400.png");
    } catch (error) {
      console.error("Error converting hotel image(s) to Data URL:", error);
      toast({ title: "Image Upload Error", description: "Could not process one or more hotel images. Using default images.", variant: "warning" });
      while(hotelImages.length < 3) hotelImages.push(hotelImages.length === 0 ? "https://placehold.co/800x600.png" : "https://placehold.co/600x400.png");
    }

    const finalRoomTypes: RoomType[] = [];
    let minRoomPrice = Infinity;

    for (const roomData of roomTypesData) {
      if (!roomData.name || roomData.price === undefined || roomData.price <= 0) {
        // Skip incomplete or invalid room entries, or handle as error
        toast({ title: "Incomplete Room Data", description: `Room "${roomData.name || 'Unnamed'}" is missing required fields (name, valid price). It will not be saved.`, variant: "warning" });
        continue;
      }
      let roomImage = "https://placehold.co/600x400.png";
      if (roomData.imageFile) {
        try {
          roomImage = await convertFileToDataURL(roomData.imageFile);
        } catch (error) {
          console.error("Error converting room image to Data URL:", error);
          toast({ title: "Room Image Error", description: `Could not process image for room "${roomData.name}". Using default.`, variant: "warning" });
        }
      }
      finalRoomTypes.push({
        id: roomData.id || `rt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: roomData.name,
        price: roomData.price,
        beds: roomData.beds || 1,
        maxGuests: roomData.maxGuests || 2,
        image: roomImage,
        description: roomData.description || `A comfortable ${roomData.name}.`
      });
      if (roomData.price < minRoomPrice) {
        minRoomPrice = roomData.price;
      }
    }

    if (finalRoomTypes.length === 0) {
      // If no valid room types were added, create a default one if a main price was given
      if (hotelMainPrice > 0) {
        finalRoomTypes.push({
            id: `rt-default-${Date.now()}`,
            name: 'Standard Room',
            price: hotelMainPrice,
            beds: 1,
            maxGuests: 2,
            image: hotelImages[0] || "https://placehold.co/600x400.png",
            description: 'A comfortable standard room equipped with essential amenities.'
        });
        minRoomPrice = hotelMainPrice;
      } else {
         toast({ title: "No Rooms Defined", description: "Please add at least one room type with a valid price or set a general price per night.", variant: "destructive" });
         return;
      }
    }
    
    // Update hotel's main pricePerNight to the minimum room price if rooms are defined
    const displayPrice = minRoomPrice !== Infinity ? minRoomPrice : hotelMainPrice > 0 ? hotelMainPrice : 0;


    const newHotel: Hotel = {
      id: hotelName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: hotelName,
      ownerEmail: currentUser.email,
      location: { city, country, address },
      images: hotelImages,
      rating: Math.floor(Math.random() * 3 + 20) / 10, // Random rating between 2.0 and 4.9
      pricePerNight: displayPrice, // This is now the "starting from" price
      description: description,
      amenities: selectedAmenities, 
      roomTypes: finalRoomTypes,
    };

    try {
      const existingHotelsString = localStorage.getItem('registeredHotels');
      const existingHotels: Hotel[] = existingHotelsString ? JSON.parse(existingHotelsString) : [];
      existingHotels.push(newHotel);
      localStorage.setItem('registeredHotels', JSON.stringify(existingHotels));

      toast({
        title: "Property Submitted!",
        description: `${hotelName} has been registered locally.`,
        action: ( <Button variant="outline" size="sm" onClick={() => router.push(`/hotel/${newHotel.id}`)}> View Property </Button> )
      });

      // Reset form
      setHotelName(''); setCity(''); setCountry(''); setAddress(''); setDescription('');
      setContactEmail(''); setWebsite(''); setPricePerNight(''); setSelectedAmenities([]);
      setHotelImageFile1(null); setImagePreviewUrl1(null);
      setHotelImageFile2(null); setImagePreviewUrl2(null);
      setHotelImageFile3(null); setImagePreviewUrl3(null);
      setRoomTypesData([{ key: `room-${Date.now()}`, name: '', price: undefined, beds: 1, maxGuests: 2, description: '', imageFile: null, imagePreview: null }]);
      
      (document.getElementById('hotelImage1') as HTMLInputElement).value = '';
      (document.getElementById('hotelImage2') as HTMLInputElement).value = '';
      (document.getElementById('hotelImage3') as HTMLInputElement).value = '';
      // Need to reset room file inputs too if they are part of the DOM directly, or rely on state change clearing them.

    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast({ title: "Registration Error", description: "Could not save your hotel registration. Please try again.", variant: "destructive" });
    }
  };
  
  const hotelImageInputFields = [
    { file: hotelImageFile1, preview: imagePreviewUrl1, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleHotelImageChange(e, 1), id: "hotelImage1", label: "Main Image (e.g., Exterior)" },
    { file: hotelImageFile2, preview: imagePreviewUrl2, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleHotelImageChange(e, 2), id: "hotelImage2", label: "Secondary Image (e.g., Lobby/Room)" },
    { file: hotelImageFile3, preview: imagePreviewUrl3, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleHotelImageChange(e, 3), id: "hotelImage3", label: "Tertiary Image (e.g., Amenity/View)" },
  ];

  if (isLoadingAuth) { /* ... loading skeleton ... */ }
  if (!currentUser || currentUser.role !== 'owner') { /* ... access denied ... */ }

  return (
    <div className="py-12 md:py-16 bg-muted/20">
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4"> <Home size={32} /> </div>
            <CardTitle className="text-3xl font-bold">List Your Property</CardTitle>
            <CardDescription className="text-muted-foreground"> Fill in the details below to register your hotel. </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Hotel Name */}
              <div>
                <Label htmlFor="hotelName" className="text-base font-semibold flex items-center"> <Building size={18} className="mr-2 text-primary" /> Hotel Name </Label>
                <Input id="hotelName" type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="e.g., The Grand Plaza" required className="mt-1 h-11" />
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city" className="text-base font-semibold flex items-center"> <MapPin size={18} className="mr-2 text-primary" /> City </Label>
                  <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., New York" required className="mt-1 h-11" />
                </div>
                <div>
                  <Label htmlFor="country" className="text-base font-semibold flex items-center"> <Globe size={18} className="mr-2 text-primary" /> Country </Label>
                  <Input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., USA" required className="mt-1 h-11" />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <Label htmlFor="address" className="text-base font-semibold flex items-center"> <MapPin size={18} className="mr-2 text-primary" /> Full Address </Label>
                <Input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main Street, Suite 4B" required className="mt-1 h-11" />
              </div>
              
              {/* Indicative Price Per Night */}
              <div>
                <Label htmlFor="pricePerNight" className="text-base font-semibold flex items-center"> <DollarSign size={18} className="mr-2 text-primary" /> Indicative Starting Price Per Night (USD) </Label>
                <Input id="pricePerNight" type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} placeholder="e.g., 150 (lowest room price will be used)" min="0" step="1" className="mt-1 h-11" />
                <p className="text-xs text-muted-foreground mt-1">This is an indicative price. Actual prices are set per room type below. The lowest room price will be displayed as the hotel's starting price.</p>
              </div>

              {/* Hotel Images */}
              <Card className="p-4 border-dashed border-primary/50">
                <CardTitle className="text-lg mb-3 font-semibold flex items-center"> <ImageIcon size={20} className="mr-2 text-primary" /> Hotel Images (Up to 3) </CardTitle>
                <div className="space-y-4">
                  {hotelImageInputFields.map((field, index) => (
                    <div key={field.id}>
                      <Label htmlFor={field.id} className="text-sm font-medium text-muted-foreground"> {field.label} </Label>
                      <Input id={field.id} type="file" accept="image/*" onChange={field.handler} className="mt-1 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                      {field.preview && ( <div className="mt-3"> <img src={field.preview} alt={`Preview ${index + 1}`} className="max-h-36 rounded-md shadow-md object-contain" /> </div> )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Amenities */}
              <Card className="p-4 border-dashed border-primary/50">
                <CardTitle className="text-lg mb-3 font-semibold flex items-center"> <Sparkles size={20} className="mr-2 text-primary" /> Hotel Amenities </CardTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                  {ALL_AMENITIES.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox id={`amenity-${amenity}`} checked={selectedAmenities.includes(amenity)} onCheckedChange={(checked) => handleAmenityChange(amenity, checked)} />
                      <Label htmlFor={`amenity-${amenity}`} className="font-normal text-sm"> {amenity} </Label>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Room Options */}
              <Card className="p-4 border-dashed border-primary/50">
                <CardTitle className="text-lg mb-3 font-semibold flex items-center"> <BedDouble size={20} className="mr-2 text-primary" /> Room Options </CardTitle>
                {roomTypesData.map((room, index) => (
                  <Card key={room.key} className="mb-4 p-4 relative border border-border/70 shadow-sm">
                     {roomTypesData.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeRoomTypeField(index)}>
                            <MinusCircle size={18} />
                        </Button>
                     )}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`roomName-${index}`} className="text-sm font-semibold flex items-center"> <BedDouble size={16} className="mr-1 text-primary/80" /> Room Name </Label>
                        <Input id={`roomName-${index}`} type="text" value={room.name || ''} onChange={(e) => handleRoomTypeChange(index, 'name', e.target.value)} placeholder="e.g., Deluxe King, Twin Suite" required className="mt-1 h-10" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor={`roomPrice-${index}`} className="text-sm font-semibold flex items-center"> <DollarSign size={16} className="mr-1 text-primary/80" /> Price/Night </Label>
                            <Input id={`roomPrice-${index}`} type="number" value={room.price === undefined ? '' : room.price} onChange={(e) => handleRoomTypeChange(index, 'price', e.target.value)} placeholder="e.g., 200" required min="0" step="1" className="mt-1 h-10" />
                        </div>
                        <div>
                            <Label htmlFor={`roomBeds-${index}`} className="text-sm font-semibold flex items-center"> <Bed size={16} className="mr-1 text-primary/80" /> Beds </Label>
                            <Input id={`roomBeds-${index}`} type="number" value={room.beds || 1} onChange={(e) => handleRoomTypeChange(index, 'beds', e.target.value)} placeholder="e.g., 1" required min="1" className="mt-1 h-10" />
                        </div>
                        <div>
                            <Label htmlFor={`roomMaxGuests-${index}`} className="text-sm font-semibold flex items-center"> <UsersIcon size={16} className="mr-1 text-primary/80" /> Max Guests </Label>
                            <Input id={`roomMaxGuests-${index}`} type="number" value={room.maxGuests || 2} onChange={(e) => handleRoomTypeChange(index, 'maxGuests', e.target.value)} placeholder="e.g., 2" required min="1" className="mt-1 h-10" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`roomImage-${index}`} className="text-sm font-semibold flex items-center"> <ImageIcon size={16} className="mr-1 text-primary/80" /> Room Image (Optional) </Label>
                        <Input id={`roomImage-${index}`} type="file" accept="image/*" onChange={(e) => handleRoomImageChange(index, e)} className="mt-1 h-10 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                        {room.imagePreview && <div className="mt-2"><img src={room.imagePreview} alt={`Room ${index+1} Preview`} className="max-h-28 rounded shadow-sm object-contain" /></div>}
                      </div>
                      <div>
                        <Label htmlFor={`roomDescription-${index}`} className="text-sm font-semibold flex items-center"> <FileText size={16} className="mr-1 text-primary/80" /> Room Description (Optional) </Label>
                        <Textarea id={`roomDescription-${index}`} value={room.description || ''} onChange={(e) => handleRoomTypeChange(index, 'description', e.target.value)} placeholder="Briefly describe this room type..." className="mt-1 min-h-[80px]" />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={addRoomTypeField} className="mt-4 w-full border-dashed hover:border-primary hover:text-primary">
                  <PlusCircle size={18} className="mr-2" /> Add Another Room Type
                </Button>
              </Card>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold flex items-center"> <FileText size={18} className="mr-2 text-primary" /> Hotel Description </Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your wonderful hotel..." required className="mt-1 min-h-[120px]" />
              </div>
              
              {/* Contact & Website (Optional) */}
              <div>
                <Label htmlFor="contactEmail" className="text-base font-semibold flex items-center"> <Mail size={18} className="mr-2 text-primary" /> Contact Email (Optional) </Label>
                <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="e.g., contact@yourhotel.com" className="mt-1 h-11" />
              </div>
              <div>
                <Label htmlFor="website" className="text-base font-semibold flex items-center"> <Globe size={18} className="mr-2 text-primary" /> Hotel Website (Optional) </Label>
                <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g., https://www.yourhotel.com" className="mt-1 h-11" />
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

    