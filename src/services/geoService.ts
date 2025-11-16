export interface GeocodeResult {
  formattedAddress: string;
  lat: number;
  lng: number;
}

const GOOGLE_API_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY) ||
  (typeof process !== 'undefined' && (process as any).env && (process as any).env.VITE_GOOGLE_MAPS_API_KEY);

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.results || data.results.length === 0) return null;
    const first = data.results[0];
    return {
      formattedAddress: first.formatted_address,
      lat: first.geometry.location.lat,
      lng: first.geometry.location.lng
    };
  } catch {
    return null;
  }
}

export async function autocompleteLocations(query: string): Promise<string[]> {
  // Lightweight fallback: use geocode results as suggestions to avoid Places SDK
  const result = await geocodeLocation(query);
  return result ? [result.formattedAddress] : [];
}












