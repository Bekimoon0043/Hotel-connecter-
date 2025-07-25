
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Hotel, Amenity, RoomType, CurrentUser } from '@/lib/types'; 
import { ALL_AMENITIES, getHotelById } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Building, MapPin, FileText, Mail, Globe, Home, DollarSign, Image as ImageIcon, ShieldAlert, CheckCircle, Sparkles, BedDouble, PlusCircle, MinusCircle, Users as UsersIcon, Bed, Package, Pencil } from 'lucide-react';

interface RoomTypeFormData extends Partial<Omit<RoomType, 'image'>> {
  imageFile?: File | null;
  imagePreview?: string | null;
  key: string; 
  quantity?: number;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


export default function EditHotelPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hotelToEdit, setHotelToEdit] = useState<Hotel | null>(null);

  const [hotelName, setHotelName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState(''); 
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);

  const [imagePreviewUrl1, setImagePreviewUrl1] = useState<string | null>(null);
  const [imagePreviewUrl2, setImagePreviewUrl2] = useState<string | null>(null);
  const [imagePreviewUrl3, setImagePreviewUrl3] = useState<string | null>(null);

  const [roomTypesData, setRoomTypesData] = useState<RoomTypeFormData[]>([]);


  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    const hotelData = getHotelById(hotelId);

    if (!userStr || !hotelData) {
      toast({ title: "Error", description: "Could not load required data.", variant: "destructive" });
      router.push('/explore');
      return;
    }
    
    try {
      const user: CurrentUser = JSON.parse(userStr);
      setCurrentUser(user);

      if (user.role !== 'admin' && user.email !== hotelData.ownerEmail) {
        toast({ title: "Access Denied", description: "You are not authorized to edit this property.", variant: "destructive" });
        router.push('/explore');
        return;
      }
      
      setHotelToEdit(hotelData);
      setHotelName(hotelData.name);
      setCity(hotelData.location.city);
      setCountry(hotelData.location.country);
      setAddress(hotelData.location.address || '');
      setLat(hotelData.location.lat?.toString() || '');
      setLng(hotelData.location.lng?.toString() || '');
      setDescription(hotelData.description);
      setSelectedAmenities(hotelData.amenities);
      setPricePerNight(hotelData.pricePerNight.toString());
      
      setImagePreviewUrl1(hotelData.images[0] || null);
      setImagePreviewUrl2(hotelData.images[1] || null);
      setImagePreviewUrl3(hotelData.images[2] || null);

      const loadedRooms = hotelData.roomTypes.map(rt => ({
        ...rt,
        key: rt.id,
        imagePreview: rt.image,
        imageFile: null
      }));
      setRoomTypesData(loadedRooms);

    } catch (e) {
      console.error("Error processing edit page data:", e);
      router.push('/explore');
    }

    setIsLoading(false);
  }, [hotelId, router, toast]);

  const handleHotelImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2 | 3) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const setPreview = imageNumber === 1 ? setImagePreviewUrl1 : imageNumber === 2 ? setImagePreviewUrl2 : imageNumber === 3 ? setImagePreviewUrl3 : null;
      if (setPreview) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };


  const handleAmenityChange = (amenity: Amenity, checked: boolean | string) => {
    setSelectedAmenities(prev => 
      checked === true ? [...prev, amenity] : prev.filter(a => a !== amenity)
    );
  };

  const addRoomTypeField = () => {
    setRoomTypesData(prev => [...prev, { key: `room-${Date.now()}`, name: '', price: undefined, beds: 1, maxGuests: 2, quantity: 1, description: '', imageFile: null, imagePreview: null }]);
  };

  const removeRoomTypeField = (index: number) => {
    setRoomTypesData(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoomTypeChange = (index: number, field: keyof RoomTypeFormData, value: any) => {
    setRoomTypesData(prev => 
      prev.map((room, i) => 
        i === index ? { ...room, [field]: (field === 'price' || field === 'beds' || field === 'maxGuests' || field === 'quantity') ? (value ? parseFloat(value) : undefined) : value } : room
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
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !hotelToEdit) {
      toast({ title: "Error", description: "Cannot save. Missing user or hotel data.", variant: "destructive" });
      return;
    }
    
    // For local dev, we don't re-upload images, just keep existing or placeholder ones.
    // Real app would handle file uploads if new files are selected.
    const hotelImages = [
      imagePreviewUrl1 || "https://placehold.co/600x400.png",
      imagePreviewUrl2 || "https://placehold.co/600x400.png",
      imagePreviewUrl3 || "https://placehold.co/600x400.png"
    ];


    let hotelMainPrice = parseFloat(pricePerNight);
    if (isNaN(hotelMainPrice) || hotelMainPrice <=0) hotelMainPrice = 0; 
    
    const finalRoomTypes: RoomType[] = [];
    let minRoomPrice = Infinity;

    for (const roomData of roomTypesData) {
      if (!roomData.name || roomData.price === undefined || roomData.price <= 0 || roomData.quantity === undefined || roomData.quantity <= 0) {
        toast({ title: "Incomplete Room Data", description: `Room "${roomData.name || 'Unnamed'}" is missing required fields and will not be saved.`, variant: "warning" });
        continue;
      }
      
      let roomImage = roomData.image || "https://placehold.co/600x400.png";
      if (roomData.imageFile) {
        // In a real app, you'd upload this file and get a URL.
        // For localStorage, to avoid quota errors, we will just use its preview URL.
        // If we were using fileToDataUrl, it would quickly hit storage limits.
        roomImage = await fileToDataUrl(roomData.imageFile);
      }

      finalRoomTypes.push({
        id: roomData.id || `rt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: roomData.name,
        price: roomData.price,
        beds: roomData.beds || 1,
        maxGuests: roomData.maxGuests || 2,
        quantity: roomData.quantity || 1,
        image: roomImage,
        description: roomData.description || `A comfortable ${roomData.name}.`
      });
      if (roomData.price < minRoomPrice) {
        minRoomPrice = roomData.price;
      }
    }
    
    const displayPrice = minRoomPrice !== Infinity ? minRoomPrice : hotelMainPrice > 0 ? hotelMainPrice : 0;

    const updatedHotel: Hotel = {
      ...hotelToEdit,
      name: hotelName,
      location: { 
          city, 
          country, 
          address, 
          lat: lat ? parseFloat(lat) : undefined, 
          lng: lng ? parseFloat(lng) : undefined 
      },
      images: hotelImages,
      pricePerNight: displayPrice, 
      description: description,
      amenities: selectedAmenities, 
      roomTypes: finalRoomTypes,
    };

    try {
      const existingHotelsString = localStorage.getItem('registeredHotels');
      let existingHotels: Hotel[] = existingHotelsString ? JSON.parse(existingHotelsString) : [];
      const hotelIndex = existingHotels.findIndex(h => h.id === hotelId);

      if (hotelIndex === -1) {
          toast({ title: "Update Error", description: "Hotel not found in storage. Cannot update.", variant: "destructive"});
          return;
      }

      existingHotels[hotelIndex] = updatedHotel;
      localStorage.setItem('registeredHotels', JSON.stringify(existingHotels));

      toast({
        title: "Property Updated!",
        description: `${hotelName} has been updated successfully.`,
        action: ( <Button variant="outline" size="sm" onClick={() => router.push(`/hotel/${updatedHotel.id}`)}> View Property </Button> )
      });
      router.push('/dashboard/owner');

    } catch (error: any) {
      console.error("Error saving to localStorage:", error);
      let errorMessage = "Could not save your hotel update. Please try again.";
      if (error.name === 'QuotaExceededError') {
          errorMessage = "Could not save. Storage quota exceeded.";
      }
      toast({ title: "Update Error", description: errorMessage, variant: "destructive" });
    }
  };
  
  const hotelImageInputFields = [
    { preview: imagePreviewUrl1, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleHotelImageChange(e, 1), id: "hotelImage1", label: "Main Image" },
    { preview: imagePreviewUrl2, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleHotelImageChange(e, 2), id: "hotelImage2", label: "Secondary Image" },
    { preview: imagePreviewUrl3, handler: (e: React.ChangeEvent<HTMLInputElement>) => handleHotelImageChange(e, 3), id: "hotelImage3", label: "Tertiary Image" },
  ];

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen py-12 bg-muted/20">
            <Card className="shadow-xl w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4 animate-pulse">
                        <Pencil size={32} />
                    </div>
                    <div className="h-8 bg-muted rounded w-1/2 mx-auto animate-pulse mb-2"></div>
                    <div className="h-5 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-5 bg-muted rounded w-1/4 animate-pulse"></div>
                            <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
                        </div>
                    ))}
                     <div className="h-12 bg-muted rounded w-full animate-pulse mt-8"></div>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  if (!currentUser || !hotelToEdit) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-muted/20">
        <Card className="shadow-xl p-8 text-center">
          <ShieldAlert size={48} className="mx-auto mb-4 text-destructive" />
          <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
          <CardDescription className="mb-4">You do not have permission to edit this property or it could not be found.</CardDescription>
          <Button onClick={() => router.push('/dashboard/owner')}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-muted/20">
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4"> <Pencil size={32} /> </div>
            <CardTitle className="text-3xl font-bold">Edit Your Property</CardTitle>
            <CardDescription className="text-muted-foreground">Update the details for {hotelToEdit.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <Label htmlFor="hotelName" className="text-base font-semibold flex items-center"> <Building size={18} className="mr-2 text-primary" /> Hotel Name </Label>
                <Input id="hotelName" type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="e.g., The Grand Plaza" required className="mt-1 h-11" />
              </div>

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

              <div>
                <Label htmlFor="address" className="text-base font-semibold flex items-center"> <MapPin size={18} className="mr-2 text-primary" /> Full Address </Label>
                <Input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main Street, Suite 4B" required className="mt-1 h-11" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="lat" className="text-base font-semibold flex items-center"> <MapPin size={18} className="mr-2 text-primary" /> Latitude (Optional) </Label>
                  <Input id="lat" type="number" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g., 40.7128" step="any" className="mt-1 h-11" />
                </div>
                <div>
                  <Label htmlFor="lng" className="text-base font-semibold flex items-center"> <MapPin size={18} className="mr-2 text-primary" /> Longitude (Optional) </Label>
                  <Input id="lng" type="number" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g., -74.0060" step="any" className="mt-1 h-11" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pricePerNight" className="text-base font-semibold flex items-center"> <DollarSign size={18} className="mr-2 text-primary" /> Indicative Starting Price Per Night (USD) </Label>
                <Input id="pricePerNight" type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} placeholder="e.g., 150 (used if no rooms defined)" min="0" step="1" className="mt-1 h-11" />
                <p className="text-xs text-muted-foreground mt-1">This is an indicative price. Actual prices are set per room type below. The lowest room price will be displayed as the hotel's starting price.</p>
              </div>

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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`roomPrice-${index}`} className="text-sm font-semibold flex items-center"> <DollarSign size={16} className="mr-1 text-primary/80" /> Price/Night </Label>
                            <Input id={`roomPrice-${index}`} type="number" value={room.price === undefined ? '' : room.price} onChange={(e) => handleRoomTypeChange(index, 'price', e.target.value)} placeholder="e.g., 200" required min="0" step="1" className="mt-1 h-10" />
                        </div>
                        <div>
                            <Label htmlFor={`roomQuantity-${index}`} className="text-sm font-semibold flex items-center"> <Package size={16} className="mr-1 text-primary/80" /> Quantity </Label>
                            <Input id={`roomQuantity-${index}`} type="number" value={room.quantity || 1} onChange={(e) => handleRoomTypeChange(index, 'quantity', e.target.value)} placeholder="e.g., 10" required min="1" className="mt-1 h-10" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="description" className="text-base font-semibold flex items-center"> <FileText size={18} className="mr-2 text-primary" /> Hotel Description </Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your wonderful hotel..." required className="mt-1 min-h-[120px]" />
              </div>

              <CardFooter className="p-0 pt-6">
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6">
                  <CheckCircle size={20} className="mr-2" /> Save Changes
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    