const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

interface PlacePrediction {
  placeId: string;
  name: string;
  address: string;
}

interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  types: string[];
  photoReferences: string[];
}

export async function searchPlaces(
  query: string,
  countryCode: string = 'pa',
): Promise<PlacePrediction[]> {
  if (!API_KEY) {
    console.warn('[GooglePlaces] No API key found. Check EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in .env');
    return [];
  }
  if (!query.trim()) return [];

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=establishment&components=country:${countryCode}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK') {
    console.warn('[GooglePlaces] Autocomplete error:', data.status, data.error_message);
    return [];
  }

  return data.predictions.map((p: { place_id: string; structured_formatting: { main_text: string }; description: string }) => ({
    placeId: p.place_id,
    name: p.structured_formatting.main_text,
    address: p.description,
  }));
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!API_KEY) {
    console.warn('[GooglePlaces] No API key found. Check EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in .env');
    return null;
  }

  const fields = 'place_id,name,formatted_address,formatted_phone_number,geometry,rating,types,photos';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.result) {
    console.warn('[GooglePlaces] Details error:', data.status, data.error_message);
    return null;
  }

  const result = data.result;
  return {
    placeId: result.place_id,
    name: result.name,
    address: result.formatted_address || '',
    phone: result.formatted_phone_number || null,
    latitude: result.geometry?.location?.lat || 0,
    longitude: result.geometry?.location?.lng || 0,
    rating: result.rating || null,
    types: result.types || [],
    photoReferences: (result.photos || [])
      .slice(0, 8)
      .map((p: { photo_reference: string }) => p.photo_reference),
  };
}

export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
}
