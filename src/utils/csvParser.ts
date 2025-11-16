// CSV Parser utility for Denodo data integration
export interface CSVRow {
  [key: string]: string;
}

export interface PlaceData {
  PlaceName: string;
  Location: string;
  State: string;
  Category: 'tourist' | 'food' | 'emergency';
  Type: string;
  Rating: number;
  Reviews: number;
  Emotion: string;
  Latitude: number;
  Longitude: number;
  ImageURL: string;
  Score?: number;
  Color?: string;
  Explanation?: string;
  Details?: {
    BestPlaceInState?: string;
    SuggestedInvestment?: string;
    UserNeed?: string;
  };
}

// Parse CSV content into array of objects
export function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
    const row: CSVRow = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }

  return rows;
}

// Map CSV columns to PlaceData interface
export function mapCSVToPlaceData(csvRow: CSVRow): PlaceData {
  // Default mapping - you can customize this based on your CSV structure
  const placeData: PlaceData = {
    PlaceName: csvRow.PlaceName || csvRow.place_name || csvRow.name || 'Unknown Place',
    Location: csvRow.Location || csvRow.location || csvRow.city || 'Unknown Location',
    State: csvRow.State || csvRow.state || csvRow.province || 'Unknown State',
    Category: mapCategory(csvRow.Category || csvRow.category || csvRow.type),
    Type: csvRow.Type || csvRow.place_type || csvRow.subcategory || 'General',
    Rating: parseFloat(csvRow.Rating || csvRow.rating || csvRow.score || '0'),
    Reviews: parseInt(csvRow.Reviews || csvRow.reviews || csvRow.review_count || '0'),
    Emotion: csvRow.Emotion || csvRow.emotion || csvRow.mood || 'Neutral',
    Latitude: parseFloat(csvRow.Latitude || csvRow.latitude || csvRow.lat || '0'),
    Longitude: parseFloat(csvRow.Longitude || csvRow.longitude || csvRow.lng || '0'),
    ImageURL: csvRow.ImageURL || csvRow.image_url || csvRow.image || 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
    Details: {
      BestPlaceInState: csvRow.BestPlaceInState || csvRow.best_place || csvRow.feature,
      SuggestedInvestment: csvRow.SuggestedInvestment || csvRow.investment || csvRow.budget,
      UserNeed: csvRow.UserNeed || csvRow.user_need || csvRow.service_type
    }
  };

  return placeData;
}

// Helper function to map category strings
function mapCategory(category: string): 'tourist' | 'food' | 'emergency' {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('tourist') || lowerCategory.includes('attraction') || lowerCategory.includes('sightseeing')) {
    return 'tourist';
  } else if (lowerCategory.includes('food') || lowerCategory.includes('restaurant') || lowerCategory.includes('dining') || lowerCategory.includes('cafe')) {
    return 'food';
  } else if (lowerCategory.includes('emergency') || lowerCategory.includes('hospital') || lowerCategory.includes('police') || lowerCategory.includes('medical')) {
    return 'emergency';
  }
  
  return 'tourist'; // default
}

// Load and parse CSV file
export async function loadCSVFile(file: File): Promise<PlaceData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const csvRows = parseCSV(csvContent);
        const placeData = csvRows.map(mapCSVToPlaceData);
        resolve(placeData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Load CSV from URL
export async function loadCSVFromURL(url: string): Promise<PlaceData[]> {
  try {
    const response = await fetch(url);
    const csvContent = await response.text();
    const csvRows = parseCSV(csvContent);
    return csvRows.map(mapCSVToPlaceData);
  } catch (error) {
    throw new Error(`Failed to load CSV from URL: ${error}`);
  }
}

