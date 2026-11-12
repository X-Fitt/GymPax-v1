import { NearbyAthlete, UserProfile } from '../types';
import { INITIAL_ATHLETES, PRESET_AREAS } from '../data/mockAthletes';
import { resolvePersonAvatarUrl } from '../data/gymAvatars';
import { buildAthletePhysiquePhotos } from '../data/userPhysiquePhotos';

const STORAGE_KEYS = {
  ATHLETES: 'aesthetix_nearby_athletes',
  USER_AREA: 'aesthetix_user_area',
  USER_LIFTER_ID: 'soma_my_lifter_id',
  INVITES_SEEDED: 'gympax_invites_seeded_v4'
};

export function getUserLifterId(profile?: UserProfile | null): string {
  if (profile?.athleteId && profile.athleteId.trim()) {
    return profile.athleteId.trim().replace(/\D/g, '') || profile.athleteId.trim();
  }
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.USER_LIFTER_ID);
    if (existing && existing.trim()) {
      const clean = existing.trim().replace(/\D/g, '');
      if (clean) return clean;
    }
    const newId = '8821';
    localStorage.setItem(STORAGE_KEYS.USER_LIFTER_ID, newId);
    return newId;
  } catch {
    return '8821';
  }
}

export function getRegisteredAthletes(): NearbyAthlete[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATHLETES);
    const invitesSeeded = localStorage.getItem(STORAGE_KEYS.INVITES_SEEDED);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with initial athlete defaults in case whatsappNumber, uniqueId, prs, gender, or invites were added
        const initialMap = new Map(INITIAL_ATHLETES.map(a => [a.id, a]));
        const existingIds = new Set(parsed.map((a: NearbyAthlete) => a.id));
        const updatedParsed = parsed.map((a: NearbyAthlete, index: number) => {
          const initial = initialMap.get(a.id);
          const needsInviteSeeding =
            !invitesSeeded &&
            (a.id === 'ath_aus_4' ||
              a.id === 'ath_lon_2' ||
              a.id === 'ath_aus_7' ||
              a.id === 'ath_lax_1' ||
              a.id === 'ath_lon_3' ||
              a.id === 'ath_tor_1');
          const needsConnectedSeeding =
            !invitesSeeded &&
            (a.id === 'ath_aus_3' || a.id === 'ath_aus_5' || a.id === 'ath_aus_6' || a.id === 'ath_nyc_1');
          const rawId = a.uniqueId || initial?.uniqueId || String(1000 + index * 137);
          const numericUniqueId = String(rawId).replace(/\D/g, '') || String(1000 + index * 137);
          const resolvedGender = a.gender || initial?.gender;
          const physique = buildAthletePhysiquePhotos({
            id: a.id,
            avatarSeed: a.avatarSeed,
            name: a.name,
            gender: resolvedGender,
            avatarId: a.avatarId
          });

          return {
            ...a,
            avatarUrl:
              a.avatarUrl ||
              initial?.avatarUrl ||
              resolvePersonAvatarUrl({ avatarId: a.id || a.avatarSeed, name: a.name }),
            level: a.badge === 'ELITE' || initial?.level === 'Elite' ? 'Elite' : a.level,
            gender: physique.gender,
            country: a.country || initial?.country,
            primaryGoal: a.primaryGoal || initial?.primaryGoal || 'Strength & Hypertrophy',
            uniqueId: numericUniqueId,
            whatsappNumber: a.whatsappNumber || initial?.whatsappNumber || '+15125550192',
            prs: a.prs || initial?.prs || [],
            beforePhotoUrl: physique.beforePhotoUrl,
            afterPhotoUrl: physique.afterPhotoUrl,
            photos: physique.photos,
            inviteMessage: needsInviteSeeding ? (initial?.inviteMessage || a.inviteMessage) : (a.inviteMessage || initial?.inviteMessage),
            invitedAt: needsInviteSeeding ? (initial?.invitedAt || a.invitedAt) : (a.invitedAt || initial?.invitedAt),
            connectionStatus: needsInviteSeeding
              ? 'incoming_request'
              : needsConnectedSeeding
              ? 'connected'
              : (a.connectionStatus || initial?.connectionStatus || 'none')
          };
        });

        if (!invitesSeeded) {
          localStorage.setItem(STORAGE_KEYS.INVITES_SEEDED, 'true');
          saveRegisteredAthletes(updatedParsed);
        }

        const missingInitial = INITIAL_ATHLETES.filter(a => !existingIds.has(a.id));
        return [...updatedParsed, ...missingInitial];
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.INVITES_SEEDED, 'true');
      saveRegisteredAthletes(INITIAL_ATHLETES);
      return INITIAL_ATHLETES;
    }
  } catch (e) {
    console.error('Failed to parse athletes from storage:', e);
  }
  return INITIAL_ATHLETES;
}

export function saveRegisteredAthletes(athletes: NearbyAthlete[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));
  } catch (e) {
    console.error('Failed to save athletes to storage:', e);
  }
}

export function updateAthleteConnection(
  athleteId: string,
  status: 'none' | 'pending' | 'connected' | 'incoming_request',
  customMessage?: string
): NearbyAthlete[] {
  const current = getRegisteredAthletes();
  const updated = current.map(a => {
    if (a.id === athleteId) {
      return {
        ...a,
        connectionStatus: status,
        inviteMessage:
          status === 'none'
            ? undefined
            : customMessage !== undefined
            ? customMessage
            : a.inviteMessage,
        invitedAt:
          status === 'none'
            ? undefined
            : status === 'pending' || status === 'incoming_request'
            ? 'Just now'
            : a.invitedAt
      };
    }
    return a;
  });
  saveRegisteredAthletes(updated);
  return updated;
}

export function acceptAthleteInvite(athleteId: string): NearbyAthlete[] {
  return updateAthleteConnection(athleteId, 'connected');
}

export function rejectAthleteInvite(athleteId: string): NearbyAthlete[] {
  return updateAthleteConnection(athleteId, 'none');
}

export function simulateIncomingInvite(targetId?: string): { athletes: NearbyAthlete[]; athlete: NearbyAthlete | null } {
  const current = getRegisteredAthletes();
  // Find an athlete who is currently 'none'
  const candidate = targetId
    ? current.find(a => a.id === targetId)
    : current.find(a => a.connectionStatus === 'none' && a.id !== 'ath_1' && a.id !== 'ath_2');

  if (!candidate) {
    return { athletes: current, athlete: null };
  }

  const sampleMessages = [
    'Hey! Saw your workout stats and love your consistency. Want to connect and be gym buddies?',
    'Awesome progress on your compound lifts! Looking for a reliable training partner to exchange tips and form checks.',
    'Hey there! Train at the same gym split as you. Let us connect and keep each other accountable on heavy days!',
    'Hi! Love seeing other dedicated lifters in the community. Let us link up on GymPax!'
  ];
  const randomMsg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

  const updatedCandidate: NearbyAthlete = {
    ...candidate,
    connectionStatus: 'incoming_request',
    inviteMessage: randomMsg,
    invitedAt: 'Just now'
  };

  const updatedList = current.map(a => (a.id === candidate.id ? updatedCandidate : a));
  saveRegisteredAthletes(updatedList);
  return { athletes: updatedList, athlete: updatedCandidate };
}

export function updateAthleteWhatsappNumber(
  athleteId: string,
  newPhone: string
): NearbyAthlete[] {
  const current = getRegisteredAthletes();
  const updated = current.map(a =>
    a.id === athleteId ? { ...a, whatsappNumber: newPhone.trim() } : a
  );
  saveRegisteredAthletes(updated);
  return updated;
}

export function getUserArea(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_AREA);
    if (raw && raw.trim().length > 0) {
      return raw.trim();
    }
  } catch (e) {
    console.error('Failed to read user area:', e);
  }
  return PRESET_AREAS[0] || 'Downtown Metro';
}

export function setUserArea(area: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_AREA, area.trim());
  } catch (e) {
    console.error('Failed to save user area:', e);
  }
}

export function addFriendByQuery(query: string): {
  success: boolean;
  athlete?: NearbyAthlete;
  message: string;
} {
  const cleanQ = query.trim().toUpperCase().replace(/^#/, '');
  if (!cleanQ) {
    return { success: false, message: 'Please enter a name or Lifter ID.' };
  }

  const athletes = getRegisteredAthletes();

  // Try exact or partial match on uniqueId or name
  let target = athletes.find(a => {
    const uid = (a.uniqueId || '').toUpperCase();
    const cleanUid = uid.replace(/^SOMA-/, '');
    return (
      uid === cleanQ ||
      cleanUid === cleanQ ||
      uid.includes(cleanQ) ||
      a.name.toLowerCase() === query.trim().toLowerCase()
    );
  });

  if (!target) {
    // Also try case-insensitive substring on name
    target = athletes.find(a =>
      a.name.toLowerCase().includes(query.trim().toLowerCase())
    );
  }

  if (target) {
    const updated = updateAthleteConnection(target.id, 'connected');
    const connectedAthlete = updated.find(a => a.id === target.id) || {
      ...target,
      connectionStatus: 'connected'
    };
    return {
      success: true,
      athlete: connectedAthlete,
      message: `Added ${target.name} (${target.uniqueId || 'Friend'}) to your gym buddies list!`
    };
  }

  // If the query looks like an ID number provided by a friend (e.g. SOMA-XXXX or 4 digits)
  // that isn't in mock data, create a friend profile dynamically so they can be added!
  const isLikelyId = /^[A-Z0-9-]{3,12}$/i.test(cleanQ);
  if (isLikelyId) {
    const formattedId = cleanQ.startsWith('SOMA-') ? cleanQ : `SOMA-${cleanQ}`;
    const newFriend: NearbyAthlete = {
      id: `ath_custom_${Date.now()}`,
      uniqueId: formattedId,
      name: `Lifter ${formattedId.replace('SOMA-', '#')}`,
      avatarSeed: `friend_${Date.now()}`,
      badge: 'LIFTER',
      level: 'Intermediate',
      area: getUserArea(),
      city: 'Local Area',
      gymName: 'Community Gym',
      distanceMiles: 1.0,
      primaryGoal: 'Hypertrophy & Strength',
      favoriteLifts: 'Compound Training & Overload',
      trainingDaysPerWeek: 4,
      streakDays: 7,
      lastActive: 'Active recently',
      workoutSplit: 'Upper / Lower Split',
      bio: `Connected via unique Lifter ID ${formattedId}. Gym buddy on GymPax.`,
      connectionStatus: 'connected',
      joinedDate: 'Added by ID',
      whatsappNumber: '+15125550000',
      prs: []
    };

    const newAthletes = [newFriend, ...athletes];
    saveRegisteredAthletes(newAthletes);
    return {
      success: true,
      athlete: newFriend,
      message: `Successfully added friend with Lifter ID ${formattedId}!`
    };
  }

  return {
    success: false,
    message: `No lifter found matching "${query}". Check the ID or name and try again.`
  };
}

export function syncUserProfileToNearbyAthletes(profile: UserProfile): void {
  try {
    const athletes = getRegisteredAthletes();
    const USER_ATHLETE_ID = 'ath_current_user';
    const myLifterId = getUserLifterId(profile);
    
    if (profile.shareLocationForSocialSearch && profile.homeTownAddress?.trim()) {
      const existingIdx = athletes.findIndex(a => a.id === USER_ATHLETE_ID);
      const userAthlete: NearbyAthlete = {
        id: USER_ATHLETE_ID,
        uniqueId: myLifterId,
        name: profile.name || 'You',
        avatarSeed: 'user_alex',
        badge: 'PRO',
        level: profile.experienceLevel || 'Intermediate',
        area: profile.homeTownAddress || 'Local Area',
        city: profile.cityOrTown || profile.homeTownAddress?.split(',')[0]?.trim() || 'Local Area',
        cityOrTown: profile.cityOrTown,
        stateOrProvince: profile.stateOrProvince,
        country: profile.country,
        zipOrPostalCode: profile.zipOrPostalCode,
        latitude: profile.latitude,
        longitude: profile.longitude,
        gymName: profile.gymName?.trim() || 'Gym Lifter',
        gymAddress: profile.homeTownAddress,
        distanceMiles: 0.1,
        primaryGoal: profile.primaryGoal ? profile.primaryGoal.split('(')[0].trim() : 'Hypertrophy & Aesthetics',
        favoriteLifts: `Focus: ${profile.focusWeakpoint || 'Compound Training'}`,
        trainingDaysPerWeek: profile.daysPerWeek || 5,
        streakDays: 1,
        lastActive: 'Active Now',
        workoutSplit: `${profile.daysPerWeek || 5}-Day Biomechanical Protocol`,
        bio: profile.bio?.trim() || `Local athlete based in ${profile.homeTownAddress || 'area'}. Discoverable for spotters and training partners.`,
        connectionStatus: 'connected',
        joinedDate: 'Joined Today',
        whatsappNumber: '+15125550199',
        prs: []
      };

      if (existingIdx >= 0) {
        athletes[existingIdx] = userAthlete;
      } else {
        athletes.unshift(userAthlete);
      }
      saveRegisteredAthletes(athletes);
      if (profile.homeTownAddress?.trim()) {
        setUserArea(profile.homeTownAddress.split(',')[0].trim());
      }
    } else {
      // If user revoked permission or skipped, remove their discoverable entry
      const filtered = athletes.filter(a => a.id !== USER_ATHLETE_ID);
      saveRegisteredAthletes(filtered);
    }
  } catch (e) {
    console.error('Failed to sync user athlete to storage:', e);
  }
}

/**
 * Retrieve 5 new members to the app in the user's area to connect to.
 * Prioritizes recent join dates (e.g. "Joined yesterday", "Joined 3 days ago", "Joined this week", "NEW LIFTER")
 * and matches the user's city/area or closest distance.
 */
export function getNewMembersInArea(
  athletes: NearbyAthlete[],
  userArea: string = 'Austin',
  userProfile?: UserProfile | null,
  count: number = 5
): NearbyAthlete[] {
  // Exclude current user
  const pool = athletes.filter(a => a.id !== 'ath_current_user');
  if (pool.length === 0) return [];

  const rawCity = (userProfile?.cityOrTown || userProfile?.homeTownAddress?.split(',')[0] || userArea || 'Austin')
    .toLowerCase()
    .trim();

  // Score candidates by locality and newness
  const scored = pool.map(a => {
    const aArea = (a.area || '').toLowerCase();
    const aCity = (a.city || a.cityOrTown || '').toLowerCase();
    const dist = a.distanceMiles !== undefined ? a.distanceMiles : 999;

    let localityScore = 0;
    if (aCity.includes(rawCity) || rawCity.includes(aCity) || aArea.includes(rawCity) || rawCity.includes(aArea.split(',')[0].trim())) {
      localityScore += 100;
    } else if (dist <= 15) {
      localityScore += 80;
    } else if (dist <= 35) {
      localityScore += 50;
    }

    // Distance proximity bonus
    localityScore += Math.max(0, 30 - dist);

    // Newness score based on badge or join date
    let newnessScore = 0;
    const joined = (a.joinedDate || '').toLowerCase();
    const badge = (a.badge || '').toLowerCase();

    if (badge.includes('new') || joined.includes('week') || joined.includes('yesterday') || joined.includes('days ago') || joined.includes('today')) {
      newnessScore += 50;
    } else if (joined.includes('2025') || joined.includes('march') || joined.includes('april') || joined.includes('february')) {
      newnessScore += 25;
    }

    return {
      athlete: a,
      score: localityScore + newnessScore,
      dist
    };
  });

  // Sort descending by score, then distance
  scored.sort((a, b) => b.score - a.score || a.dist - b.dist);

  return scored.slice(0, Math.min(5, count)).map(s => s.athlete);
}

