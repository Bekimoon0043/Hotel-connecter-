

export const ALL_AMENITIES = [
  'Wifi', 'Pool', 'Parking', 'Air Conditioning', 'Restaurant', 'Gym', 'Spa', 
  'Pet Friendly', 'Bar', 'TV', 'Kitchen', 'Washer', 'Dryer', 'Heating', 
  'Beach Access', 'Fireplace', 'Lake View', 'Boat Tours', 'Desert Safari'
] as const;

export type Amenity = typeof ALL_AMENITIES[number];

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  price: number;
  beds: number;
  maxGuests: number;
  image: string; // Image URL from API or placeholder
  quantity: number; // Number of rooms of this type available in total
}

export interface Hotel {
  id: string;
  name: string;
  ownerEmail?: string; 
  location: {
    city: string;
    country: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  images: string[]; 
  rating: number; 
  pricePerNight: number; 
  description: string;
  amenities: Amenity[];
  roomTypes: RoomType[];
}

export interface Booking {
  id: string; 
  hotelId: string;
  hotelName: string;
  hotelOwnerEmail: string;
  roomId: string;
  roomName: string;
  checkIn: string; 
  checkOut: string; 
  guests: number;
  totalPrice: number;
  bookedByGuestName: string;
  bookedByGuestEmail: string;
  guestPhoneNumber: string;
  bookingDate: string; 
  status: 'pending' | 'confirmed' | 'cancelled'; 
}

// Stored user in localStorage (for sign-up/sign-in)
export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string; // In a real app, this would be securely hashed.
}

// Current logged-in user session data
export interface CurrentUser {
  email: string;
  fullName: string;
  role: 'owner' | 'booker' | 'admin'; // Added 'admin' role
}


// These functions now read from localStorage on the client-side.
export function getAllHotels(): Hotel[] {
  if (typeof window === 'undefined') {
    return []; // Return empty array during server-side rendering
  }
  try {
    const storedHotels = localStorage.getItem('registeredHotels');
    return storedHotels ? JSON.parse(storedHotels) : [];
  } catch (error) {
    console.error("Error reading hotels from localStorage:", error);
    return [];
  }
}

export function getHotelById(id: string): Hotel | undefined {
  if (typeof window === 'undefined') {
    return undefined; // Return undefined during server-side rendering
  }
  try {
    const allHotels = getAllHotels();
    return allHotels.find(hotel => hotel.id === id);
  } catch (error) {
    console.error("Error reading hotel by ID from localStorage:", error);
    return undefined;
  }
}
