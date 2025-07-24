
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


// Mock Data
const mockHotels: Hotel[] = [
  {
    id: "grand-hyatt-tokyo",
    name: "Grand Hyatt Tokyo",
    ownerEmail: "owner1@example.com",
    location: { city: "Tokyo", country: "Japan", address: "6-10-3 Roppongi, Minato-Ku", lat: 35.6604, lng: 139.7292 },
    images: [
      "https://placehold.co/800x600.png", 
      "https://placehold.co/600x400.png", 
      "https://placehold.co/600x400.png"
    ],
    rating: 4.8,
    pricePerNight: 550,
    description: "Luxurious hotel in the heart of Roppongi Hills, offering sophisticated rooms, 10 restaurants and bars, a spa, and an indoor pool. Perfect for business and leisure travelers seeking elegance and convenience.",
    amenities: ["Wifi", "Pool", "Parking", "Air Conditioning", "Restaurant", "Gym", "Spa"],
    roomTypes: [
      { id: "gh-std", name: "Standard King", price: 550, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "A spacious room with a king bed and city views." },
      { id: "gh-sui", name: "Executive Suite", price: 900, beds: 1, maxGuests: 3, image: "https://placehold.co/600x400.png", description: "Luxurious suite with a separate living area and premium amenities." }
    ]
  },
  {
    id: "the-plaza-new-york",
    name: "The Plaza New York",
    ownerEmail: "owner2@example.com",
    location: { city: "New York", country: "USA", address: "Fifth Avenue at Central Park South", lat: 40.7644, lng: -73.9745 },
    images: [
      "https://placehold.co/800x500.png", 
      "https://placehold.co/600x350.png",
      "https://placehold.co/600x350.png"
    ],
    rating: 4.9,
    pricePerNight: 800,
    description: "An iconic luxury hotel with a rich history, offering opulent rooms and suites, fine dining, the Palm Court for afternoon tea, and a Guerlain Spa. Experience timeless elegance at a landmark address.",
    amenities: ["Wifi", "Restaurant", "Spa", "Pet Friendly", "Bar"],
    roomTypes: [
      { id: "tp-dlx", name: "Deluxe King", price: 800, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Elegantly appointed room with luxurious furnishings." },
      { id: "tp-cps", name: "Central Park Suite", price: 1500, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Spacious suite offering breathtaking views of Central Park." }
    ]
  },
  {
    id: "desert-mirage-resort",
    name: "Desert Mirage Resort",
    ownerEmail: "owner1@example.com",
    location: { city: "Dubai", country: "UAE", address: "1 Sheikh Mohammed bin Rashid Blvd", lat: 25.1972, lng: 55.2744 },
    images: [
      "https://placehold.co/800x550.png", 
      "https://placehold.co/600x400.png", 
      "https://placehold.co/600x400.png"
    ],
    rating: 4.7,
    pricePerNight: 450,
    description: "A stunning oasis in the desert, this resort features lavish accommodations, multiple swimming pools, world-class dining, and activities like desert safaris and spa treatments. Your Arabian adventure awaits.",
    amenities: ["Wifi", "Pool", "Parking", "Air Conditioning", "Restaurant", "Gym", "Spa", "Desert Safari"],
    roomTypes: [
      { id: "dm-arb", name: "Arabian Deluxe", price: 450, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Room with traditional Arabian decor and modern comforts." },
      { id: "dm-vil", name: "Pool Villa", price: 1200, beds: 2, maxGuests: 4, image: "https://placehold.co/600x400.png", description: "Private villa with its own plunge pool and expansive views." }
    ]
  },
  {
    id: "lakeview-mountain-lodge",
    name: "Lakeview Mountain Lodge",
    ownerEmail: "owner3@example.com",
    location: { city: "Banff", country: "Canada", address: "123 Mountain View Road", lat: 51.1784, lng: -115.5708 },
    images: ["https://placehold.co/700x500.png", "https://placehold.co/600x400.png", "https://placehold.co/600x400.png"],
    rating: 4.5,
    pricePerNight: 300,
    description: "Cozy lodge nestled in the Canadian Rockies, offering stunning lake and mountain views. Features comfortable rooms, a rustic restaurant with a fireplace, and access to hiking trails and boat tours.",
    amenities: ["Wifi", "Parking", "Restaurant", "Fireplace", "Lake View", "Boat Tours"],
    roomTypes: [
      { id: "lm-coz", name: "Cozy Queen", price: 300, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Comfortable room with a queen bed and forest views." },
      { id: "lm-lak", name: "Lakeside King", price: 450, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Spacious room with a king bed and direct lake views." }
    ]
  },
  {
    id: "coastal-charm-inn",
    name: "Coastal Charm Inn",
    ownerEmail: "owner2@example.com",
    location: { city: "Santorini", country: "Greece", address: "Oia Main Street", lat: 36.4612, lng: 25.3756 },
    images: [
      "https://placehold.co/800x600.png",
      "https://placehold.co/600x400.png",
      "https://placehold.co/600x400.png"
    ],
    rating: 4.6,
    pricePerNight: 280,
    description: "Boutique inn with breathtaking caldera views, traditional Cycladic architecture, and personalized service. Enjoy stunning sunsets from your private balcony.",
    amenities: ["Wifi", "Air Conditioning", "Beach Access"],
    roomTypes: [
      { id: "cc-std", name: "Standard Double with Sea View", price: 280, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Charming room with a double bed and spectacular sea views." },
      { id: "cc-sup", name: "Superior Suite with Plunge Pool", price: 500, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Luxurious suite featuring a private plunge pool and panoramic views." }
    ]
  },
  {
    id: "urban-oasis-hotel",
    name: "Urban Oasis Hotel",
    ownerEmail: "owner3@example.com",
    location: { city: "Singapore", country: "Singapore", address: "10 Bayfront Avenue", lat: 1.2831, lng: 103.8603 },
    images: [
      "https://placehold.co/750x550.png",
      "https://placehold.co/600x400.png",
      "https://placehold.co/600x400.png"
    ],
    rating: 4.9,
    pricePerNight: 600,
    description: "A modern marvel in the city skyline, this hotel boasts an iconic infinity pool, rooftop gardens, celebrity chef restaurants, and direct access to a world-class casino and shopping mall.",
    amenities: ["Wifi", "Pool", "Parking", "Air Conditioning", "Restaurant", "Gym", "Spa", "Bar"],
    roomTypes: [
      { id: "uo-del", name: "Deluxe City View", price: 600, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Stylish room with floor-to-ceiling windows offering stunning city views." },
      { id: "uo-clu", name: "Club Room with Bay View", price: 850, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png", description: "Exclusive Club Room access with magnificent bay views and personalized services." }
    ]
  }
];

// Simulate API delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 300));

export async function getAllHotels(): Promise<Hotel[]> {
  await simulateApiDelay();
  return JSON.parse(JSON.stringify(mockHotels)); // Return a deep copy
}

export async function getHotelById(id: string): Promise<Hotel | undefined> {
  await simulateApiDelay();
  const hotel = mockHotels.find(hotel => hotel.id === id);
  return hotel ? JSON.parse(JSON.stringify(hotel)) : undefined; // Return a deep copy
}

export async function searchHotels(params: { destination?: string | null }): Promise<Hotel[]> {
  await simulateApiDelay();
  const { destination } = params;
  
  if (!destination || destination.trim() === "") {
    return JSON.parse(JSON.stringify(mockHotels)); // Return all hotels if no destination
  }

  const searchTerm = destination.toLowerCase();
  const results = mockHotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm) ||
    hotel.location.city.toLowerCase().includes(searchTerm) ||
    hotel.location.country.toLowerCase().includes(searchTerm)
  );
  return JSON.parse(JSON.stringify(results)); // Return a deep copy
}
