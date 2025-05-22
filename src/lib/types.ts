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
  location: {
    city: string;
    country: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  images: string[]; // Image URLs from API or placeholders
  rating: number; // 1-5
  pricePerNight: number; // indicative starting price
  description: string;
  amenities: string[];
  roomTypes: RoomType[];
}

// IMPORTANT: Replace this with your actual API base URL
const API_BASE_URL = 'https://your-lite-api.com/api'; 

export async function getAllHotels(): Promise<Hotel[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/hotels`);
    if (!response.ok) {
      throw new Error(`Failed to fetch hotels: ${response.statusText}`);
    }
    const hotels: Hotel[] = await response.json();
    return hotels;
  } catch (error) {
    console.error("Error fetching all hotels:", error);
    return []; // Return empty array on error or handle appropriately
  }
}

export async function getHotelById(id: string): Promise<Hotel | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/hotels/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`Failed to fetch hotel ${id}: ${response.statusText}`);
    }
    const hotel: Hotel = await response.json();
    return hotel;
  } catch (error) {
    console.error(`Error fetching hotel by ID ${id}:`, error);
    return undefined; // Return undefined on error or handle appropriately
  }
}

export async function searchHotels(params: { destination?: string | null }): Promise<Hotel[]> {
  const { destination } = params;
  if (!destination) {
    return getAllHotels(); // Or handle as an empty search returning no results
  }

  try {
    const queryParams = new URLSearchParams();
    queryParams.append('destination', destination);
    // Add other search/filter params here if your API supports them
    // e.g., queryParams.append('checkIn', checkIn);

    const response = await fetch(`${API_BASE_URL}/hotels?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to search hotels: ${response.statusText}`);
    }
    const hotels: Hotel[] = await response.json();
    return hotels;
  } catch (error) {
    console.error("Error searching hotels:", error);
    return []; // Return empty array on error
  }
}
