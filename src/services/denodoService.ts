// Denodo OData API Service
import { PlaceData } from '../data/mockData';

// Denodo API Configuration
const DENODO_CONFIG = {
  // Prefer env override; fallback to provided URL
  baseUrl:
    (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_DENODO_BASE_URL) ||
    (typeof process !== 'undefined' && (process as any).env && (process as any).env.VITE_DENODO_BASE_URL) ||
    '/api/denodo/server/tourmate_api/v_all_places/views/v_all_places',
  username:
    (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_DENODO_USERNAME) ||
    (typeof process !== 'undefined' && (process as any).env && (process as any).env.VITE_DENODO_USERNAME) ||
    'admin',
  password:
    (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_DENODO_PASSWORD) ||
    (typeof process !== 'undefined' && (process as any).env && (process as any).env.VITE_DENODO_PASSWORD) ||
    'admin'
};

// OData response interface
interface ODataResponse {
  value: DenodoPlaceData[];
  '@odata.context': string;
  '@odata.count'?: number;
}

// Denodo data structure (adjust based on your actual API response)
interface DenodoPlaceData {
  PlaceName?: string;
  place_name?: string;
  name?: string;
  Location?: string;
  location?: string;
  city?: string;
  State?: string;
  state?: string;
  province?: string;
  Category?: string;
  category?: string;
  type?: string;
  Type?: string;
  place_type?: string;
  subcategory?: string;
  Rating?: number;
  rating?: number;
  score?: number;
  Reviews?: number;
  reviews?: number;
  review_count?: number;
  Emotion?: string;
  emotion?: string;
  mood?: string;
  Latitude?: number;
  latitude?: number;
  lat?: number;
  Longitude?: number;
  longitude?: number;
  lng?: number;
  ImageURL?: string;
  image_url?: string;
  image?: string;
  opening_hours?: string;
  openinghours?: string;
  user_need?: string;
  userneed?: string;
  BestPlaceInState?: string;
  best_place?: string;
  feature?: string;
  SuggestedInvestment?: string;
  investment?: string;
  budget?: string;
  UserNeed?: string;
  service_type?: string;
}

// Convert Denodo data to PlaceData format
function mapDenodoToPlaceData(denodoData: DenodoPlaceData): PlaceData {
  // Default values for missing fields
  const defaults = {
    State: 'Tamil Nadu',
    Latitude: 11.4064, // Ooty coordinates as default
    Longitude: 76.6932,
    ImageURL: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg'
  };

  // Category mapping
  const categoryMap: { [key: string]: 'tourist' | 'food' | 'emergency' } = {
    'Tourist': 'tourist',
    'tourist': 'tourist',
    'Food': 'food',
    'food': 'food',
    'Emergency': 'emergency',
    'emergency': 'emergency'
  };

  // Your Denodo fields (per screenshot): placename, location, rating, reviews, emotion, type, category
  const placeData: PlaceData = {
    PlaceName: (denodoData as any).placename || (denodoData as any).place_name || (denodoData as any).name || 'Unknown Place',
    Location: (denodoData as any).location || (denodoData as any).city || 'Unknown Location',
    State: (denodoData as any).state || (denodoData as any).province || defaults.State,
    Category: categoryMap[(denodoData as any).category || (denodoData as any).place_type || 'tourist'] || 'tourist',
    Type: (denodoData as any).type || (denodoData as any).subcategory || 'General',
    Rating: Number((denodoData as any).rating ?? (denodoData as any).score ?? 0),
    Reviews: Number((denodoData as any).reviews ?? (denodoData as any).review_count ?? 0),
    Emotion: normalizeEmotion((denodoData as any).emotion) || 'Neutral',
    Latitude: Number((denodoData as any).latitude ?? (denodoData as any).lat ?? defaults.Latitude),
    Longitude: Number((denodoData as any).longitude ?? (denodoData as any).lng ?? defaults.Longitude),
    ImageURL: (denodoData as any).image_url || (denodoData as any).image || defaults.ImageURL,
    Details: {
      UserNeed: (denodoData as any).UserNeed || (denodoData as any).user_need || (denodoData as any).userneed || (denodoData as any).service_type || undefined,
    }
  };

  return placeData;
}

function normalizeEmotion(value?: string): string {
  if (!value) return '';
  const v = value.trim().toLowerCase();
  const map: Record<string, string> = {
    'happy': 'Happy',
    'sad': 'Sad',
    'romantic': 'Romantic',
    'energetic': 'Energetic',
    'tired': 'Tired',
    'lost': 'Lost',
    'alone': 'Alone',
    'critical condition': 'Critical Condition',
    'medical emergency': 'Medical Emergency',
    'high stress': 'High Stress',
    'safety concern': 'Safety Concern'
  };
  return map[v] || value.charAt(0).toUpperCase() + value.slice(1);
}

// Create basic auth header
function createAuthHeader(): string {
  const credentials = btoa(`${DENODO_CONFIG.username}:${DENODO_CONFIG.password}`);
  return `Basic ${credentials}`;
}

// Fetch data from Denodo OData API
export async function fetchDenodoData(): Promise<PlaceData[]> {
  try {
    console.log('🔄 Fetching data from Denodo API...');
    
    const response = await fetch(DENODO_CONFIG.baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data: ODataResponse = await response.json();
    console.log(`📊 Received ${data.value?.length || 0} records from Denodo API`);

    if (!data.value || !Array.isArray(data.value)) {
      throw new Error('Invalid response format from Denodo API');
    }

    // Convert Denodo data to PlaceData format
    const placeData = data.value.map(mapDenodoToPlaceData);
    
    console.log(`✅ Successfully converted ${placeData.length} records to PlaceData format`);
    return placeData;

  } catch (error) {
    console.error('❌ Error fetching data from Denodo API:', error);
    throw new Error(`Failed to fetch data from Denodo API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Test connection to Denodo API
export async function testDenodoConnection(): Promise<boolean> {
  try {
    const response = await fetch(DENODO_CONFIG.baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(),
        'Accept': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Denodo connection test failed:', error);
    return false;
  }
}

// Get API configuration info
export function getDenodoConfig() {
  return {
    baseUrl: DENODO_CONFIG.baseUrl,
    username: DENODO_CONFIG.username,
    // Don't expose password in logs
    hasCredentials: !!(DENODO_CONFIG.username && DENODO_CONFIG.password)
  };
}

// Fetch raw JSON from Denodo for debugging/inspection
export async function fetchDenodoRaw(): Promise<any> {
  const response = await fetch(DENODO_CONFIG.baseUrl, {
    method: 'GET',
    headers: {
      'Authorization': createAuthHeader(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
