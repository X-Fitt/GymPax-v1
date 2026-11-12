import { NearbyAthlete, UserProfile } from '../types';

export interface SuggestedAthleteItem {
  athlete: NearbyAthlete;
  reason: string;
  isArea: boolean;
  isInternational: boolean;
  matchType: 'area' | 'goal_and_level' | 'goal' | 'level' | 'general';
}

export interface AthleteSearchFilters {
  name: string;
  location: string;
  level: string; // 'all' | 'Beginner' | 'Intermediate' | 'Advanced'
  gender: string; // 'all' | 'male' | 'female'
}

/**
 * Returns a randomized set of 5 suggested athletes to connect with based on:
 * 1. The user's area / location
 * 2. International athletes sharing the user's primary goal and experience level
 */
export function getSuggestedAthletes(
  athletes: NearbyAthlete[],
  userArea: string,
  userProfile?: UserProfile | null,
  userLevel: string = 'Intermediate'
): SuggestedAthleteItem[] {
  // Exclude the current user and any already connected users
  const pool = athletes.filter(
    a => a.id !== 'ath_current_user' && a.id !== 'u_me' && a.connectionStatus !== 'connected'
  );
  if (pool.length === 0) return [];

  const cleanUserArea = (userArea || userProfile?.homeTownAddress || userProfile?.cityOrTown || '').toLowerCase().trim();
  const userCountry = (userProfile?.country || '').toLowerCase().trim();
  const myGoal = (userProfile?.primaryGoal || 'hypertrophy').toLowerCase().trim();
  const myLevel = (userLevel || userProfile?.experienceLevel || 'intermediate').toLowerCase().trim();

  const areaCandidates: SuggestedAthleteItem[] = [];
  const internationalCandidates: SuggestedAthleteItem[] = [];
  const otherCandidates: SuggestedAthleteItem[] = [];

  for (const a of pool) {
    const aArea = (a.area || a.city || a.cityOrTown || '').toLowerCase();
    const aCountry = (a.country || '').toLowerCase();
    const aGoal = (a.primaryGoal || '').toLowerCase();
    const aLevel = (a.level || '').toLowerCase();

    // Determine if athlete is in user's area
    const isLocal =
      Boolean(cleanUserArea && (aArea.includes(cleanUserArea) || cleanUserArea.includes(aArea.split(',')[0].trim()))) ||
      Boolean(userCountry && aCountry && aCountry === userCountry) ||
      (a.distanceMiles !== undefined && a.distanceMiles <= 35);

    if (isLocal) {
      areaCandidates.push({
        athlete: a,
        reason: `In your area (${a.cityOrTown || a.city || 'Nearby'})`,
        isArea: true,
        isInternational: false,
        matchType: 'area'
      });
    } else {
      // International candidate check: goal and level match
      const goalMatch =
        (myGoal.includes('hypertrophy') && aGoal.includes('hypertrophy')) ||
        (myGoal.includes('strength') && aGoal.includes('strength')) ||
        (myGoal.includes('power') && aGoal.includes('power')) ||
        (myGoal.includes('fat loss') && (aGoal.includes('conditioning') || aGoal.includes('fat loss'))) ||
        (myGoal.includes('lean') && aGoal.includes('definition')) ||
        (myGoal.includes('aesthetic') && aGoal.includes('aesthetic'));

      const levelMatch =
        (myLevel.includes('beginner') && aLevel.includes('beginner')) ||
        (myLevel.includes('intermediate') && aLevel.includes('intermediate')) ||
        ((myLevel.includes('advanced') || myLevel.includes('pro') || myLevel.includes('elite')) &&
          (aLevel.includes('advanced') || aLevel.includes('pro') || aLevel.includes('elite')));

      if (goalMatch && levelMatch) {
        internationalCandidates.push({
          athlete: a,
          reason: `International · Same Goal & Level (${a.country || 'Global'})`,
          isArea: false,
          isInternational: true,
          matchType: 'goal_and_level'
        });
      } else if (goalMatch) {
        internationalCandidates.push({
          athlete: a,
          reason: `International · Same Goal (${a.country || 'Global'})`,
          isArea: false,
          isInternational: true,
          matchType: 'goal'
        });
      } else if (levelMatch) {
        internationalCandidates.push({
          athlete: a,
          reason: `International · Level Match (${a.country || 'Global'})`,
          isArea: false,
          isInternational: true,
          matchType: 'level'
        });
      } else {
        otherCandidates.push({
          athlete: a,
          reason: `International Lifter (${a.country || 'Global'})`,
          isArea: false,
          isInternational: true,
          matchType: 'general'
        });
      }
    }
  }

  // Fisher-Yates shuffle
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const shuffledArea = shuffle(areaCandidates);
  const shuffledIntl = shuffle(internationalCandidates);
  const shuffledOther = shuffle(otherCandidates);

  const picked: SuggestedAthleteItem[] = [];
  const pickedIds = new Set<string>();

  // Aim for a balanced blend: 2-3 from area and 2-3 from international
  for (const item of shuffledArea) {
    if (picked.length < 3 && !pickedIds.has(item.athlete.id)) {
      picked.push(item);
      pickedIds.add(item.athlete.id);
    }
  }

  for (const item of shuffledIntl) {
    if (picked.length < 5 && !pickedIds.has(item.athlete.id)) {
      picked.push(item);
      pickedIds.add(item.athlete.id);
    }
  }

  // If still under 5, fill from remaining area, international, or other
  const remaining = [...shuffledArea, ...shuffledIntl, ...shuffledOther];
  for (const item of remaining) {
    if (picked.length < 5 && !pickedIds.has(item.athlete.id)) {
      picked.push(item);
      pickedIds.add(item.athlete.id);
    }
  }

  return picked.slice(0, 5);
}

/**
 * Filter athletes pool by name, location, level, and gender
 */
export function searchAthletes(
  athletes: NearbyAthlete[],
  filters: AthleteSearchFilters
): NearbyAthlete[] {
  const nameQuery = filters.name.trim().toLowerCase();
  const locationQuery = filters.location.trim().toLowerCase();
  const levelFilter = filters.level.trim().toLowerCase();
  const genderFilter = filters.gender.trim().toLowerCase();

  return athletes.filter(a => {
    if (a.id === 'ath_current_user') return false;

    // Filter by name or unique ID
    if (nameQuery) {
      const matchName = a.name.toLowerCase().includes(nameQuery);
      const matchId = (a.uniqueId || '').toLowerCase().includes(nameQuery);
      if (!matchName && !matchId) return false;
    }

    // Filter by location (city, town, area, state, country, or gym address)
    if (locationQuery) {
      const locFields = [
        a.cityOrTown,
        a.city,
        a.area,
        a.stateOrProvince,
        a.country,
        a.gymAddress,
        a.zipOrPostalCode
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!locFields.includes(locationQuery)) return false;
    }

    // Filter by level
    if (levelFilter && levelFilter !== 'all') {
      const aLevel = (a.level || '').toLowerCase();
      if (!aLevel.includes(levelFilter)) return false;
    }

    // Filter by gender
    if (genderFilter && genderFilter !== 'all') {
      const aGender = (a.gender || '').toLowerCase();
      if (aGender !== genderFilter) return false;
    }

    return true;
  });
}
