// CSV Loader utility to automatically load CSV files from the csv_data folder
import { PlaceData } from '../data/mockData';
import { parseCSV, mapCSVToPlaceData } from './csvParser';

// Default values for missing fields
const DEFAULT_VALUES = {
  State: 'Tamil Nadu', // Default state since most data is from Ooty
  Latitude: 11.4064,   // Ooty coordinates as default
  Longitude: 76.6932,
  ImageURL: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg'
};

// Category mapping for the CSV files
const CATEGORY_MAPPING: { [key: string]: 'tourist' | 'food' | 'emergency' } = {
  'Tourist': 'tourist',
  'Food': 'food',
  'Emergency': 'emergency'
};

// Enhanced CSV to PlaceData mapping for your specific format
export function mapYourCSVToPlaceData(csvRow: any): PlaceData {
  const placeData: PlaceData = {
    PlaceName: csvRow.PlaceName || 'Unknown Place',
    Location: csvRow.Location || 'Unknown Location',
    State: DEFAULT_VALUES.State, // Default to Tamil Nadu
    Category: CATEGORY_MAPPING[csvRow.Category] || 'tourist',
    Type: csvRow.Type || 'General',
    Rating: parseFloat(csvRow.Rating || '0'),
    Reviews: parseInt(csvRow.Reviews || '0'),
    Emotion: csvRow.Emotion || 'Neutral',
    Latitude: DEFAULT_VALUES.Latitude, // Default coordinates
    Longitude: DEFAULT_VALUES.Longitude,
    ImageURL: DEFAULT_VALUES.ImageURL, // Default image
    Details: {
      BestPlaceInState: getBestPlaceDescription(csvRow.Category, csvRow.Type),
      SuggestedInvestment: getSuggestedInvestment(csvRow.Category),
      UserNeed: getUserNeed(csvRow.Category, csvRow.Type)
    }
  };

  return placeData;
}

// Helper function to generate best place descriptions
function getBestPlaceDescription(category: string, type: string): string {
  if (category === 'Tourist') {
    switch (type) {
      case 'Garden': return 'Beautiful Garden Destination';
      case 'Lake': return 'Scenic Lake View';
      case 'Mountain': return 'Mountain Peak Experience';
      case 'Waterfall': return 'Natural Waterfall';
      case 'Forest': return 'Pine Forest Adventure';
      default: return 'Popular Tourist Attraction';
    }
  }
  return '';
}

// Helper function to generate suggested investments
function getSuggestedInvestment(category: string): string {
  switch (category) {
    case 'Tourist': return '₹2,000 - ₹5,000';
    case 'Food': return '₹500 - ₹2,000';
    case 'Emergency': return 'Free Service';
    default: return '₹1,000';
  }
}

// Helper function to generate user needs for emergency services
function getUserNeed(category: string, type: string): string {
  if (category === 'Emergency') {
    switch (type) {
      case 'Hospital': return 'Medical Emergency Care';
      case 'Police Station': return 'Law Enforcement & Safety';
      case 'Fire Station': return 'Fire Emergency Response';
      default: return 'Emergency Service';
    }
  }
  return '';
}

// Load all CSV files from the csv_data folder
export async function loadAllCSVFiles(): Promise<PlaceData[]> {
  const allPlaces: PlaceData[] = [];
  
  try {
    // Load tourist places
    const touristResponse = await fetch('/csv_data/tourist_places.csv');
    if (touristResponse.ok) {
      const touristCSV = await touristResponse.text();
      const touristRows = parseCSV(touristCSV);
      const touristPlaces = touristRows.map(mapYourCSVToPlaceData);
      allPlaces.push(...touristPlaces);
      console.log(`Loaded ${touristPlaces.length} tourist places`);
    }

    // Load food spots
    const foodResponse = await fetch('/csv_data/food_spots.csv');
    if (foodResponse.ok) {
      const foodCSV = await foodResponse.text();
      const foodRows = parseCSV(foodCSV);
      const foodPlaces = foodRows.map(mapYourCSVToPlaceData);
      allPlaces.push(...foodPlaces);
      console.log(`Loaded ${foodPlaces.length} food spots`);
    }

    // Load emergency services
    const emergencyResponse = await fetch('/csv_data/emergency_services.csv');
    if (emergencyResponse.ok) {
      const emergencyCSV = await emergencyResponse.text();
      const emergencyRows = parseCSV(emergencyCSV);
      const emergencyPlaces = emergencyRows.map(mapYourCSVToPlaceData);
      allPlaces.push(...emergencyPlaces);
      console.log(`Loaded ${emergencyPlaces.length} emergency services`);
    }

    console.log(`Total places loaded: ${allPlaces.length}`);
    return allPlaces;
    
  } catch (error) {
    console.error('Error loading CSV files:', error);
    throw new Error('Failed to load CSV data files');
  }
}

// Check if CSV files are available
export async function checkCSVFilesAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/csv_data/tourist_places.csv');
    return response.ok;
  } catch {
    return false;
  }
}

