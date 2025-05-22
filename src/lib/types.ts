export interface RoomType {
  id: string;
  name: string;
  description?: string;
  price: number;
  beds: number;
  maxGuests: number;
  image: string; // Placeholder image URL
}

export interface Hotel {
  id: string;
  name: string;
  location: {
    city: string;
    country: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  images: string[]; // Placeholder image URLs
  rating: number; // 1-5
  pricePerNight: number; // indicative starting price
  description: string;
  amenities: string[];
  roomTypes: RoomType[];
}

const placeholderAmenities = ["Wifi", "Pool", "Parking", "Air Conditioning", "Restaurant", "Gym", "Pet Friendly", "Spa"];
const placeholderRoomTypes: RoomType[] = [
  { id: "room1", name: "Standard Queen Room", description: "A comfortable room with a queen-sized bed.", price: 120, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png" },
  { id: "room2", name: "Deluxe King Suite", description: "Spacious suite with a king-sized bed and a city view.", price: 250, beds: 1, maxGuests: 2, image: "https://placehold.co/600x400.png" },
  { id: "room3", name: "Family Room", description: "Room with two double beds, perfect for families.", price: 180, beds: 2, maxGuests: 4, image: "https://placehold.co/600x400.png" },
];

export const mockHotels: Hotel[] = [
  {
    id: "1",
    name: "The Grand Plaza Hotel",
    location: { city: "New York", country: "USA", address: "123 Main St, New York, NY" },
    images: ["https://placehold.co/800x600.png", "https://placehold.co/600x400.png", "https://placehold.co/600x400.png"],
    rating: 4.5,
    pricePerNight: 250,
    description: "Experience luxury and comfort at The Grand Plaza, located in the heart of the city. Enjoy world-class amenities and breathtaking views.",
    amenities: ["Wifi", "Pool", "Restaurant", "Gym", "Spa"],
    roomTypes: placeholderRoomTypes,
  },
  {
    id: "2",
    name: "Sunset Beach Resort",
    location: { city: "Malibu", country: "USA", address: "456 Ocean Dr, Malibu, CA" },
    images: ["https://placehold.co/800x600.png", "https://placehold.co/600x400.png"],
    rating: 4.8,
    pricePerNight: 350,
    description: "Your perfect beach getaway awaits. Stunning ocean views, private beach access, and exceptional service.",
    amenities: ["Wifi", "Pool", "Pet Friendly", "Restaurant", "Beach Access"],
    roomTypes: placeholderRoomTypes,
  },
  {
    id: "3",
    name: "Mountain View Lodge",
    location: { city: "Aspen", country: "USA", address: "789 Mountain Rd, Aspen, CO" },
    images: ["https://placehold.co/800x600.png"],
    rating: 4.2,
    pricePerNight: 200,
    description: "Cozy lodge nestled in the mountains, ideal for ski trips and nature lovers. Warm fireplaces and scenic trails.",
    amenities: ["Wifi", "Parking", "Pet Friendly", "Fireplace"],
    roomTypes: placeholderRoomTypes,
  },
  {
    id: "4",
    name: "Urban Chic Boutique Hotel",
    location: { city: "London", country: "UK", address: "10 King's Road, London" },
    images: ["https://placehold.co/800x600.png", "https://placehold.co/600x400.png", "https://placehold.co/600x400.png"],
    rating: 4.6,
    pricePerNight: 180,
    description: "A stylish and modern hotel in a vibrant neighborhood, known for its unique design and personalized service.",
    amenities: ["Wifi", "Restaurant", "Bar", "Air Conditioning"],
    roomTypes: placeholderRoomTypes,
  },
  {
    id: "5",
    name: "Lakeside Serenity Inn",
    location: { city: "Lake Como", country: "Italy", address: "Via Lago 20, Como" },
    images: ["https://placehold.co/800x600.png", "https://placehold.co/600x400.png"],
    rating: 4.9,
    pricePerNight: 400,
    description: "Escape to tranquility at this beautiful inn on the shores of Lake Como. Breathtaking views and gourmet dining.",
    amenities: ["Wifi", "Restaurant", "Lake View", "Boat Tours"],
    roomTypes: placeholderRoomTypes,
  },
  {
    id: "6",
    name: "Desert Oasis Resort & Spa",
    location: { city: "Dubai", country: "UAE", address: "Sheikh Zayed Road, Dubai" },
    images: ["https://placehold.co/800x600.png", "https://placehold.co/600x400.png"],
    rating: 4.7,
    pricePerNight: 300,
    description: "An opulent resort in the desert, offering luxurious accommodations, a world-class spa, and fine dining.",
    amenities: ["Wifi", "Pool", "Spa", "Restaurant", "Gym", "Desert Safari"],
    roomTypes: placeholderRoomTypes,
  }
];

export function getHotelById(id: string): Hotel | undefined {
  return mockHotels.find(hotel => hotel.id === id);
}

// Ensure room images have AI hints
mockHotels.forEach(hotel => {
  hotel.images.forEach((img, index) => {
    if (img.startsWith("https://placehold.co/")) {
      // Add a generic hint for hotel images
      // No, this is not how it works. data-ai-hint is an HTML attribute.
    }
  });
  hotel.roomTypes.forEach(room => {
     if (room.image.startsWith("https://placehold.co/")) {
      // Add a generic hint for room images
     }
  });
});
