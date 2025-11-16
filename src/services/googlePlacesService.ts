export interface GooglePlaceDetails {
  placeId: string;
  name?: string;
  openingHoursText?: string[];
  photoUrls?: string[];
  rating?: number;
  userRatingsTotal?: number;
  formattedAddress?: string;
  lat?: number;
  lng?: number;
}

const GOOGLE_API_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY) ||
  (typeof process !== 'undefined' && (process as any).env && (process as any).env.VITE_GOOGLE_MAPS_API_KEY) || '';

function buildPhotoUrl(photoReference: string, maxWidth: number = 800): string {
  const params = new URLSearchParams({
    photoreference: photoReference,
    maxwidth: String(maxWidth),
    key: GOOGLE_API_KEY,
  });
  return `/api/google/maps/api/place/photo?${params.toString()}`;
}

export async function findPlaceIdByText(query: string): Promise<string | null> {
  try {
    const url = `/api/google/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) return null;
    return data.candidates[0].place_id || null;
  } catch {
    return null;
  }
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  try {
    const fields = [
      'name',
      'formatted_address',
      'geometry/location',
      'opening_hours/weekday_text',
      'photos',
      'rating',
      'user_ratings_total',
    ].join(',');
    const url = `/api/google/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.result) return null;
    const result = data.result;
    const photoRefs: string[] = Array.isArray(result.photos)
      ? result.photos.map((p: any) => p.photo_reference).filter(Boolean)
      : [];
    const details: GooglePlaceDetails = {
      placeId,
      name: result.name,
      formattedAddress: result.formatted_address,
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
      openingHoursText: result.opening_hours?.weekday_text || undefined,
      photoUrls: photoRefs.slice(0, 5).map((ref) => buildPhotoUrl(ref)),
      rating: typeof result.rating === 'number' ? result.rating : undefined,
      userRatingsTotal: typeof result.user_ratings_total === 'number' ? result.user_ratings_total : undefined,
    };
    return details;
  } catch {
    return null;
  }
}

export async function enrichPlaceWithGoogle(name: string, location: string): Promise<GooglePlaceDetails | null> {
  const textQuery = `${name}, ${location}`;
  const placeId = await findPlaceIdByText(textQuery);
  if (!placeId) return null;
  return await getPlaceDetails(placeId);
}

export interface NearbyPlaceResult {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location?: { lat: number; lng: number } };
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: { open_now?: boolean };
  types?: string[];
  vicinity?: string;
  formatted_address?: string;
}

export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  googleType: string,
  radiusMeters: number = 5000,
  keyword?: string
): Promise<NearbyPlaceResult[]> {
  try {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: String(radiusMeters),
      type: googleType,
      key: GOOGLE_API_KEY,
    });
    if (keyword) params.set('keyword', keyword);
    const url = `/api/google/maps/api/place/nearbysearch/json?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'OK' || !Array.isArray(data.results)) return [];
    return data.results as NearbyPlaceResult[];
  } catch {
    return [];
  }
}

export async function searchTextPlaces(query: string, googleType?: string): Promise<NearbyPlaceResult[]> {
  try {
    const params = new URLSearchParams({ query, key: GOOGLE_API_KEY });
    if (googleType) params.set('type', googleType);
    const url = `/api/google/maps/api/place/textsearch/json?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'OK' || !Array.isArray(data.results)) return [];
    return data.results as NearbyPlaceResult[];
  } catch {
    return [];
  }
}

export function googlePhotoUrl(photoReference?: string, maxWidth: number = 800): string | undefined {
  if (!photoReference) return undefined;
  return buildPhotoUrl(photoReference, maxWidth);
}


