/**
 * Geolocation & Distance Utilities for Worldwide Gyms & Athletes
 */

export interface WorldwideLocationAnchor {
  cityOrTown: string;
  stateOrProvince: string;
  country: string;
  zipOrPostalCode: string;
  latitude: number;
  longitude: number;
}

// Major global city hubs for fallback reverse-geocoding and discovery matching
export const WORLDWIDE_CITY_HUBS: WorldwideLocationAnchor[] = [
  // United States
  { cityOrTown: 'Austin', stateOrProvince: 'Texas', country: 'United States', zipOrPostalCode: '78701', latitude: 30.2672, longitude: -97.7431 },
  { cityOrTown: 'New York', stateOrProvince: 'New York', country: 'United States', zipOrPostalCode: '10001', latitude: 40.7128, longitude: -74.006 },
  { cityOrTown: 'Los Angeles', stateOrProvince: 'California', country: 'United States', zipOrPostalCode: '90028', latitude: 34.0522, longitude: -118.2437 },
  { cityOrTown: 'Miami', stateOrProvince: 'Florida', country: 'United States', zipOrPostalCode: '33139', latitude: 25.7617, longitude: -80.1918 },
  { cityOrTown: 'Chicago', stateOrProvince: 'Illinois', country: 'United States', zipOrPostalCode: '60601', latitude: 41.8781, longitude: -87.6298 },
  { cityOrTown: 'Seattle', stateOrProvince: 'Washington', country: 'United States', zipOrPostalCode: '98101', latitude: 47.6062, longitude: -122.3321 },
  
  // United Kingdom & Europe
  { cityOrTown: 'London', stateOrProvince: 'Greater London', country: 'United Kingdom', zipOrPostalCode: 'SW1A 1AA', latitude: 51.5074, longitude: -0.1278 },
  { cityOrTown: 'Manchester', stateOrProvince: 'Greater Manchester', country: 'United Kingdom', zipOrPostalCode: 'M1 1AE', latitude: 53.4808, longitude: -2.2426 },
  { cityOrTown: 'Berlin', stateOrProvince: 'Berlin', country: 'Germany', zipOrPostalCode: '10115', latitude: 52.52, longitude: 13.405 },
  { cityOrTown: 'Paris', stateOrProvince: 'Île-de-France', country: 'France', zipOrPostalCode: '75001', latitude: 48.8566, longitude: 2.3522 },
  { cityOrTown: 'Amsterdam', stateOrProvince: 'North Holland', country: 'Netherlands', zipOrPostalCode: '1012 JS', latitude: 52.3676, longitude: 4.9041 },
  { cityOrTown: 'Stockholm', stateOrProvince: 'Stockholm County', country: 'Sweden', zipOrPostalCode: '111 20', latitude: 59.3293, longitude: 18.0686 },
  
  // Canada
  { cityOrTown: 'Toronto', stateOrProvince: 'Ontario', country: 'Canada', zipOrPostalCode: 'M5V 2T6', latitude: 43.6532, longitude: -79.3832 },
  { cityOrTown: 'Vancouver', stateOrProvince: 'British Columbia', country: 'Canada', zipOrPostalCode: 'V6B 1A1', latitude: 49.2827, longitude: -123.1207 },
  { cityOrTown: 'Montreal', stateOrProvince: 'Quebec', country: 'Canada', zipOrPostalCode: 'H2Y 1C6', latitude: 45.5017, longitude: -73.5673 },
  
  // Australia & New Zealand
  { cityOrTown: 'Sydney', stateOrProvince: 'New South Wales', country: 'Australia', zipOrPostalCode: '2000', latitude: -33.8688, longitude: 151.2093 },
  { cityOrTown: 'Melbourne', stateOrProvince: 'Victoria', country: 'Australia', zipOrPostalCode: '3000', latitude: -37.8136, longitude: 144.9631 },
  { cityOrTown: 'Auckland', stateOrProvince: 'Auckland', country: 'New Zealand', zipOrPostalCode: '1010', latitude: -36.8485, longitude: 174.7633 },
  
  // Asia
  { cityOrTown: 'Tokyo', stateOrProvince: 'Tokyo Prefecture', country: 'Japan', zipOrPostalCode: '150-0002', latitude: 35.6762, longitude: 139.6503 },
  { cityOrTown: 'Singapore', stateOrProvince: 'Central Region', country: 'Singapore', zipOrPostalCode: '018989', latitude: 1.3521, longitude: 103.8198 },
  { cityOrTown: 'Seoul', stateOrProvince: 'Seoul Special City', country: 'South Korea', zipOrPostalCode: '04524', latitude: 37.5665, longitude: 126.978 },
  
  // Latin America & Middle East
  { cityOrTown: 'São Paulo', stateOrProvince: 'São Paulo', country: 'Brazil', zipOrPostalCode: '01310-100', latitude: -23.5505, longitude: -46.6333 },
  { cityOrTown: 'Dubai', stateOrProvince: 'Dubai', country: 'United Arab Emirates', zipOrPostalCode: '00000', latitude: 25.2048, longitude: 55.2708 }
];

/**
 * Format address in the exact requested sequence:
 * "City or town, state, province, country, zip code"
 */
export function formatAddressSequence(
  cityOrTown?: string,
  stateOrProvince?: string,
  country?: string,
  zipOrPostalCode?: string
): string {
  const parts: string[] = [];
  if (cityOrTown && cityOrTown.trim()) parts.push(cityOrTown.trim());
  if (stateOrProvince && stateOrProvince.trim()) parts.push(stateOrProvince.trim());
  if (country && country.trim()) parts.push(country.trim());
  
  let base = parts.join(', ');
  if (zipOrPostalCode && zipOrPostalCode.trim()) {
    base = base ? `${base} ${zipOrPostalCode.trim()}` : zipOrPostalCode.trim();
  }
  return base || 'Worldwide Area';
}

/**
 * Calculate Great Circle Distance (Haversine formula) in statute miles
 */
export function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Calculate Great Circle Distance in kilometers
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const miles = calculateDistanceMiles(lat1, lon1, lat2, lon2);
  return Math.round(miles * 1.60934 * 10) / 10;
}

/**
 * Find closest city hub from a set of coordinates
 */
export function findClosestCityHub(lat: number, lon: number): WorldwideLocationAnchor {
  let closest = WORLDWIDE_CITY_HUBS[0];
  let minDistance = calculateDistanceMiles(lat, lon, closest.latitude, closest.longitude);

  for (const hub of WORLDWIDE_CITY_HUBS) {
    const dist = calculateDistanceMiles(lat, lon, hub.latitude, hub.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = hub;
    }
  }

  return closest;
}

/**
 * Reverse Geocode coordinates to the exact address sequence
 * Uses free OpenStreetMap Nominatim with graceful instant fallback
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{
  cityOrTown: string;
  stateOrProvince: string;
  country: string;
  zipOrPostalCode: string;
  formatted: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.municipality ||
        addr.county ||
        '';

      const state = addr.state || addr.province || addr.region || '';
      const country = addr.country || '';
      const zip = addr.postcode || '';

      if (city || country) {
        return {
          cityOrTown: city || 'Local Area',
          stateOrProvince: state,
          country: country || 'Worldwide',
          zipOrPostalCode: zip,
          formatted: formatAddressSequence(city, state, country, zip)
        };
      }
    }
  } catch {
    // Timeout or network error - use nearest city hub anchor
  }

  const closest = findClosestCityHub(lat, lon);
  return {
    cityOrTown: closest.cityOrTown,
    stateOrProvince: closest.stateOrProvince,
    country: closest.country,
    zipOrPostalCode: closest.zipOrPostalCode,
    formatted: formatAddressSequence(
      closest.cityOrTown,
      closest.stateOrProvince,
      closest.country,
      closest.zipOrPostalCode
    )
  };
}
