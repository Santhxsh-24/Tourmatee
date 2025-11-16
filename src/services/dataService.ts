import { PlaceData } from '../data/mockData';
import { loadCSVFile, loadCSVFromURL, PlaceData as CSVPlaceData } from '../utils/csvParser';
import { loadAllCSVFiles, checkCSVFilesAvailable } from '../utils/csvLoader';
import { fetchDenodoData, testDenodoConnection } from './denodoService';
import { enrichPlaceWithGoogle, searchNearbyPlaces, googlePhotoUrl, searchTextPlaces } from './googlePlacesService';

export class DataService {
  private static instance: DataService;
  private placesData: PlaceData[] = [];
  private csvData: CSVPlaceData[] = [];
  private denodoData: PlaceData[] = [];
  private googleData: PlaceData[] = [];
  private useCSVData: boolean = false;
  private useDenodoData: boolean = false;
  private useGoogleData: boolean = false;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Load CSV data from file
  public async loadCSVFromFile(file: File): Promise<void> {
    try {
      this.csvData = await loadCSVFile(file);
      this.useCSVData = true;
      console.log(`Loaded ${this.csvData.length} places from CSV file`);
    } catch (error) {
      console.error('Error loading CSV file:', error);
      throw error;
    }
  }

  // Load CSV data from URL
  public async loadCSVFromURL(url: string): Promise<void> {
    try {
      this.csvData = await loadCSVFromURL(url);
      this.useCSVData = true;
      console.log(`Loaded ${this.csvData.length} places from CSV URL`);
    } catch (error) {
      console.error('Error loading CSV from URL:', error);
      throw error;
    }
  }

  // Load CSV data from csv_data folder automatically
  public async loadCSVFromFolder(): Promise<void> {
    try {
      const csvPlaces = await loadAllCSVFiles();
      this.csvData = csvPlaces;
      this.useCSVData = true;
      console.log(`Auto-loaded ${this.csvData.length} places from csv_data folder`);
    } catch (error) {
      console.error('Error loading CSV from folder:', error);
      throw error;
    }
  }

  // Check if CSV files are available in the csv_data folder
  public async isCSVFolderAvailable(): Promise<boolean> {
    return await checkCSVFilesAvailable();
  }

  // Load data from Denodo API
  public async loadDenodoData(): Promise<void> {
    try {
      const rawPlaces = await fetchDenodoData();

      // Enrich with Google Places: photos and opening hours
      const enriched = await Promise.all(
        rawPlaces.map(async (p) => {
          const details = await enrichPlaceWithGoogle(p.PlaceName, p.Location);
          if (!details) return p;
          return {
            ...p,
            Rating: typeof details.rating === 'number' ? details.rating : p.Rating,
            Reviews: typeof details.userRatingsTotal === 'number' ? details.userRatingsTotal : p.Reviews,
            ImageURL: (details.photoUrls && details.photoUrls[0]) ? details.photoUrls[0] : p.ImageURL,
            Details: {
              ...(p.Details || {}),
              OpeningHours: details.openingHoursText || (p.Details && (p.Details as any).OpeningHours),
            },
            PlaceName: details.name || p.PlaceName,
            Location: details.formattedAddress || p.Location,
            Latitude: typeof details.lat === 'number' ? details.lat : p.Latitude,
            Longitude: typeof details.lng === 'number' ? details.lng : p.Longitude,
          };
        })
      );

      this.denodoData = enriched;
      this.useDenodoData = true;
      this.useCSVData = false; // Override CSV data
      this.useGoogleData = false;
      console.log(`Loaded ${this.denodoData.length} places from Denodo API`);
    } catch (error) {
      console.error('Error loading Denodo data:', error);
      throw error;
    }
  }

  private getMoodKeyword(category: 'tourist' | 'food' | 'emergency', mood?: string): string | undefined {
    if (!mood) return undefined;
    const m = mood.toLowerCase();
    if (category === 'food') {
      if (m.includes('happy')) return 'dessert OR cafe OR lively OR family friendly OR vegetarian';
      if (m.includes('romantic')) return 'romantic OR candlelight OR date night OR rooftop';
      if (m.includes('energetic')) return 'live music OR bar OR pub OR nightlife';
      if (m.includes('tired')) return 'breakfast OR coffee OR cozy';
      if (m.includes('sad')) return 'comfort food OR homestyle OR soup';
    }
    if (category === 'tourist') {
      if (m.includes('happy')) return 'park OR garden OR viewpoint';
      if (m.includes('romantic')) return 'sunset point OR beach OR lake';
      if (m.includes('energetic')) return 'trek OR adventure OR amusement';
      if (m.includes('tired')) return 'spa OR relaxing';
    }
    if (category === 'emergency') {
      // Treat as Hotels/lodging; keep keywords generic so Google can infer good stays
      if (m.includes('romantic')) return 'romantic hotel OR resort OR honeymoon';
      if (m.includes('happy')) return 'family hotel OR resort OR pool';
      if (m.includes('tired')) return 'spa resort OR relaxing stay';
    }
    return undefined;
  }

  // Load live data using Text Search scoped by user-entered location, fallback to Nearby
  public async loadGooglePlaces(lat: number, lng: number, category: 'tourist' | 'food' | 'emergency', mood?: string, userPlaceText?: string): Promise<void> {
    const categoryToType: Record<string, string> = {
      tourist: 'tourist_attraction',
      food: 'restaurant',
      emergency: 'lodging',
    };
    const googleType = categoryToType[category] || 'tourist_attraction';
    const keyword = this.getMoodKeyword(category, mood);

    // Text Search prioritizes the city typed by the user
    const textQueryParts = [userPlaceText || '', googleType.replace('_', ' ')];
    if (keyword) textQueryParts.push(keyword);
    const textQuery = textQueryParts.filter(Boolean).join(' ');

    let results = textQuery ? await searchTextPlaces(textQuery, undefined) : [];
    if (!results || results.length === 0) {
      // Fallback to Nearby centered on geocoded coords
      results = await searchNearbyPlaces(lat, lng, googleType, 8000, keyword);
    }

    this.googleData = results.map(r => {
      const photoRef = r.photos && r.photos[0] ? r.photos[0].photo_reference : undefined;
      const imageUrl = googlePhotoUrl(photoRef) || 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg';
      return {
        PlaceName: r.name,
        Location: r.formatted_address || r.vicinity || '',
        State: '',
        Category: category,
        Type: googleType,
        Rating: typeof r.rating === 'number' ? r.rating : 0,
        Reviews: typeof r.user_ratings_total === 'number' ? r.user_ratings_total : 0,
        Emotion: mood || '',
        Latitude: r.geometry?.location?.lat || 0,
        Longitude: r.geometry?.location?.lng || 0,
        ImageURL: imageUrl,
        Details: {}
      } as PlaceData;
    });
    this.useGoogleData = true;
    this.useDenodoData = false;
    this.useCSVData = false;
  }

  // Test connection to Denodo API
  public async testDenodoConnection(): Promise<boolean> {
    return await testDenodoConnection();
  }

  // Set mock data (existing functionality)
  public setMockData(data: PlaceData[]): void {
    this.placesData = data;
    this.useCSVData = false;
    this.useDenodoData = false;
  }

  // Get all places data
  public getAllPlaces(): PlaceData[] {
    if (this.useGoogleData) {
      return this.googleData;
    }
    if (this.useDenodoData) {
      return this.denodoData;
    }
    
    if (this.useCSVData) {
      // Convert CSV data to match PlaceData interface
      return this.csvData.map(csvPlace => ({
        ...csvPlace,
        // Ensure all required fields are present
        PlaceName: csvPlace.PlaceName || 'Unknown Place',
        Location: csvPlace.Location || 'Unknown Location',
        State: csvPlace.State || 'Unknown State',
        Category: csvPlace.Category || 'tourist',
        Type: csvPlace.Type || 'General',
        Rating: csvPlace.Rating || 0,
        Reviews: csvPlace.Reviews || 0,
        Emotion: csvPlace.Emotion || 'Neutral',
        Latitude: csvPlace.Latitude || 0,
        Longitude: csvPlace.Longitude || 0,
        ImageURL: csvPlace.ImageURL || 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
        Details: csvPlace.Details || {}
      }));
    }
    return this.placesData;
  }

  // Get places by category
  public getPlacesByCategory(category: 'tourist' | 'food' | 'emergency'): PlaceData[] {
    return this.getAllPlaces().filter(place => place.Category === category);
  }

  // Get places by location
  public getPlacesByLocation(location: string): PlaceData[] {
    return this.getAllPlaces().filter(place => 
      place.Location.toLowerCase().includes(location.toLowerCase()) ||
      place.State.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Get unique locations
  public getUniqueLocations(): string[] {
    const locations = new Set<string>();
    this.getAllPlaces().forEach(place => {
      locations.add(place.Location);
    });
    return Array.from(locations).sort();
  }

  // Get unique states
  public getUniqueStates(): string[] {
    const states = new Set<string>();
    this.getAllPlaces().forEach(place => {
      states.add(place.State);
    });
    return Array.from(states).sort();
  }

  // Check if using CSV data
  public isUsingCSVData(): boolean {
    return this.useCSVData;
  }

  // Check if using Denodo data
  public isUsingDenodoData(): boolean {
    return this.useDenodoData;
  }

  public isUsingGoogleData(): boolean {
    return this.useGoogleData;
  }

  // Get data source info
  public getDataSourceInfo(): { source: string; count: number } {
    if (this.useGoogleData) {
      return { source: 'Google Places (live)', count: this.googleData.length };
    }
    if (this.useDenodoData) {
      return { source: 'Denodo API', count: this.denodoData.length };
    }
    if (this.useCSVData) {
      return { source: 'CSV Data Folder', count: this.csvData.length };
    }
    return { source: 'Mock Data', count: this.placesData.length };
  }

  // Clear CSV data and revert to mock data
  public clearCSVData(): void {
    this.csvData = [];
    this.useCSVData = false;
  }

  // Clear Denodo data and revert to mock data
  public clearDenodoData(): void {
    this.denodoData = [];
    this.useDenodoData = false;
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();
