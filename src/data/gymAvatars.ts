import maleGym1 from '../assets/images/male_gym_avatar_1_1794139251510.jpg';
import maleGym2 from '../assets/images/male_gym_avatar_2_1794139251212.jpg';
import maleGym3 from '../assets/images/male_gym_avatar_3_1794139253641.jpg';
import maleGym4 from '../assets/images/male_gym_avatar_4_1794139255504.jpg';
import maleGym5 from '../assets/images/male_gym_avatar_5_1794139256236.jpg';
import maleGym6 from '../assets/images/male_gym_avatar_6_1794139257363.jpg';
import maleGym7 from '../assets/images/male_gym_avatar_7_1794139257655.jpg';
import maleGym8 from '../assets/images/male_gym_avatar_8_1794139259076.jpg';

import femaleGym1 from '../assets/images/female_gym_avatar_1_1794139280818.jpg';
import femaleGym2 from '../assets/images/female_gym_avatar_2_1794139282202.jpg';
import femaleGym3 from '../assets/images/female_gym_avatar_3_1794139282627.jpg';
import femaleGym4 from '../assets/images/female_gym_avatar_4_1794139284162.jpg';
import femaleGym5 from '../assets/images/female_gym_avatar_5_1794139285665.jpg';
import femaleGym6 from '../assets/images/female_gym_avatar_6_1794139285899.jpg';
import femaleGym7 from '../assets/images/female_gym_avatar_7_1794139288890.jpg';

export interface GymAvatarCharacter {
  id: string;
  name: string;
  gender: 'men' | 'women';
  role: string;
  tagline: string;
  accentColor: string;
  badge: string;
  bgGradient: string;
  imageUrl: string;
}

export const GYM_AVATARS: GymAvatarCharacter[] = [
  // 5 Men Realistic AI-Generated Athletic Portraits
  {
    id: 'gym_m1',
    name: 'Marcus Titan',
    gender: 'men',
    role: 'Heavyweight Powerlifter',
    tagline: 'Iron Barbell Club heavyweight, bearded strength specialist',
    accentColor: '#F6721D',
    badge: 'Titan Lifter',
    bgGradient: 'from-amber-600 via-zinc-900 to-black',
    imageUrl: maleGym7
  },
  {
    id: 'gym_m2',
    name: 'Jax Beast',
    gender: 'men',
    role: 'Aesthetic Bodybuilder',
    tagline: 'Hypertrophy & conditioning, wireless audio, athletic build',
    accentColor: '#3b82f6',
    badge: 'Beast Pump',
    bgGradient: 'from-blue-600 via-zinc-900 to-black',
    imageUrl: maleGym2
  },
  {
    id: 'gym_m3',
    name: 'Leo Striker',
    gender: 'men',
    role: 'CrossFit & Garage Lifter',
    tagline: 'High-intensity power rack training, explosive endurance',
    accentColor: '#ef4444',
    badge: 'Metcon Champ',
    bgGradient: 'from-red-600 via-zinc-900 to-black',
    imageUrl: maleGym3
  },
  {
    id: 'gym_m4',
    name: 'Kai Shadow',
    gender: 'men',
    role: 'Functional Strength Pro',
    tagline: 'Cable & free-weight mastery, lean muscular definition',
    accentColor: '#10b981',
    badge: 'Gravity Defier',
    bgGradient: 'from-emerald-600 via-zinc-900 to-black',
    imageUrl: maleGym4
  },
  {
    id: 'gym_m5',
    name: 'Dorian Classic',
    gender: 'men',
    role: 'Strength & Conditioning',
    tagline: 'Dedicated dumbbell & functional strength athlete',
    accentColor: '#eab308',
    badge: 'Iron Vintage',
    bgGradient: 'from-yellow-600 via-zinc-900 to-black',
    imageUrl: maleGym5
  },

  // 5 Women Realistic AI-Generated Athletic Portraits
  {
    id: 'gym_w1',
    name: 'Freya Valkyrie',
    gender: 'women',
    role: 'Powerlifting Specialist',
    tagline: 'Barbell squat rack warrior, fierce strength & grit',
    accentColor: '#ec4899',
    badge: 'Valkyrie Power',
    bgGradient: 'from-pink-600 via-zinc-900 to-black',
    imageUrl: femaleGym2
  },
  {
    id: 'gym_w2',
    name: 'Zara Sculpt',
    gender: 'women',
    role: 'Hypertrophy Ace',
    tagline: 'Sculpted physique, studio focus, strength & symmetry',
    accentColor: '#8b5cf6',
    badge: 'Aesthetic Queen',
    bgGradient: 'from-purple-600 via-zinc-900 to-black',
    imageUrl: femaleGym3
  },
  {
    id: 'gym_w3',
    name: 'Maya Flash',
    gender: 'women',
    role: 'HIIT & Kettlebell Pro',
    tagline: 'Explosive conditioning, athletic speed & functional power',
    accentColor: '#06b6d4',
    badge: 'Speed Demon',
    bgGradient: 'from-cyan-600 via-zinc-900 to-black',
    imageUrl: femaleGym4
  },
  {
    id: 'gym_w4',
    name: 'Elena Snatch',
    gender: 'women',
    role: 'Iron Gym Athlete',
    tagline: 'Heavy free-weights, high-volume leg & upper body power',
    accentColor: '#f97316',
    badge: 'Olympic Ace',
    bgGradient: 'from-orange-600 via-zinc-900 to-black',
    imageUrl: femaleGym6
  },
  {
    id: 'gym_w5',
    name: 'Nadia Iron',
    gender: 'women',
    role: 'Garage Barbell Warrior',
    tagline: 'Rogue rack lifter, studio headphones, relentless discipline',
    accentColor: '#14b8a6',
    badge: 'Barbell Pro',
    bgGradient: 'from-teal-600 via-zinc-900 to-black',
    imageUrl: femaleGym7
  }
];

export const getGymAvatarById = (id?: string): GymAvatarCharacter | undefined => {
  if (!id) return undefined;
  return GYM_AVATARS.find(a => a.id === id);
};

/**
 * Randomly selected subset of users who display a unique, non-duplicated gym or home workout mockup photo.
 * Strictly gender-separated:
 * - Male users ONLY use maleGym1..8
 * - Female users ONLY use femaleGym1..7
 * - Users not in this map do NOT have a photo (they display their clean 2-letter initials circle).
 */
const SELECTED_MALE_GYM_PHOTOS: Record<string, string> = {
  // 1. Marcus Thorne (Male - Commercial weight room selfie)
  ath_1: maleGym1,
  u_marcus: maleGym1,
  f_marcus: maleGym1,
  marcus_iron: maleGym1,
  'marcus thorne': maleGym1,

  // 2. Callum Wright (Male - Modern UK gym with squat rack)
  ath_lon_1: maleGym2,
  callum_uk: maleGym2,
  'callum wright': maleGym2,

  // 3. Tyler Brooks (Male - Garage home gym with power rack)
  ath_aus_4: maleGym3,
  tyler_tx: maleGym3,
  'tyler brooks': maleGym3,

  // 4. Liam O'Connor (Male - Sydney fitness studio with dumbbells & cables)
  ath_syd_1: maleGym4,
  liam_sydney: maleGym4,
  'liam o’connor': maleGym4,
  "liam o'connor": maleGym4,

  // 5. Mateo Morales (Male - Home living room workout space with dumbbell & mat)
  ath_mad_1: maleGym5,
  mateo_madrid: maleGym5,
  'mateo morales': maleGym5,

  // 6. Min-Jun Park (Male - Modern gym with cable crossover machine)
  ath_seo_1: maleGym6,
  minjun_seoul: maleGym6,
  'min-jun park': maleGym6,

  // 7. Leo Sterling (Male - Iron barbell club with gym towel)
  u_leo: maleGym7,
  f_leo: maleGym7,
  leo_gym: maleGym7,
  'leo sterling': maleGym7,

  // 8. Sam Kowalski / Sam K. (Male - Basement home gym with kettlebells & pull-up rig)
  u_sam: maleGym8,
  sam_iron: maleGym8,
  'sam kowalski': maleGym8,
  'sam k.': maleGym8,

  // Current user identifiers
  u_me: maleGym7,
  me: maleGym7,
  ath_current_user: maleGym7,
  'alex hunter': maleGym7,
  alex: maleGym7,
  athlete: maleGym7
};

const SELECTED_FEMALE_GYM_PHOTOS: Record<string, string> = {
  // 1. Sarah Jenkins (Female - Sunlit living room home workout space with dumbbells & mat)
  ath_aus_3: femaleGym1,
  sarah_austin: femaleGym1,
  'sarah jenkins': femaleGym1,

  // 2. Brooke Miller (Female - Weight room with squat rack)
  ath_aus_6: femaleGym2,
  brooke_atx: femaleGym2,
  'brooke miller': femaleGym2,

  // 3. Maya Rodriguez (Female - Sunlit gym with dumbbell rack)
  ath_lax_1: femaleGym3,
  maya_venice: femaleGym3,
  'maya rodriguez': femaleGym3,

  // 4. Elena Rostova (Female - London boutique gym with kettlebells & rig)
  ath_lon_2: femaleGym4,
  u_elena: femaleGym4,
  elena_uk: femaleGym4,
  elena_lift: femaleGym4,
  'elena rostova': femaleGym4,
  'elena r.': femaleGym4,

  // 5. Camille Laurent (Female - Apartment home gym corner with adjustable dumbbells & bands)
  ath_par_1: femaleGym5,
  camille_paris: femaleGym5,
  'camille laurent': femaleGym5,

  // 6. Larissa Santos (Female - Hardcore iron gym with dumbbells & leg press)
  ath_sao_1: femaleGym6,
  larissa_sp: femaleGym6,
  'larissa santos': femaleGym6,

  // 7. Sarah Connor (Female - Garage home gym with barbell rack & headphones)
  u_sarah: femaleGym7,
  f_sarah: femaleGym7,
  sarah_iron: femaleGym7,
  'sarah connor': femaleGym7
};

export function resolvePersonAvatarUrl(options: {
  avatarUrl?: string;
  avatarId?: string;
  name?: string;
  fallbackInitials?: string;
}): string | undefined {
  const { avatarUrl, avatarId, name } = options;

  // Respect custom user-uploaded data URLs or bundled asset URLs (ignore any legacy randomuser.me URLs)
  if (
    avatarUrl &&
    avatarUrl.trim() &&
    !avatarUrl.includes('randomuser.me')
  ) {
    return avatarUrl.trim();
  }

  // Check stored user avatar from localStorage for the active user
  if (!avatarUrl && typeof window !== 'undefined') {
    try {
      const storedUrl = localStorage.getItem('gympax_user_avatar_url');
      if (storedUrl && storedUrl.trim() && !storedUrl.includes('randomuser.me')) {
        return storedUrl.trim();
      }
      const storedId = localStorage.getItem('gympax_user_avatar_id');
      if (storedId && (avatarId === storedId || !avatarId || avatarId === 'u_me' || avatarId === 'ath_current_user')) {
        const gymChar = getGymAvatarById(storedId) || getGymAvatarById(storedId.toLowerCase());
        if (gymChar?.imageUrl) return gymChar.imageUrl;
        if (SELECTED_MALE_GYM_PHOTOS[storedId]) return SELECTED_MALE_GYM_PHOTOS[storedId];
        if (SELECTED_FEMALE_GYM_PHOTOS[storedId]) return SELECTED_FEMALE_GYM_PHOTOS[storedId];
      }
    } catch {}
  }

  if (avatarId) {
    const cleanId = avatarId.trim();
    const cleanIdLower = cleanId.toLowerCase();

    // Resolve any GYM_AVATARS character ID (gym_m1..gym_m5, gym_w1..gym_w5) to its realistic AI-generated portrait
    const gymCharacter = getGymAvatarById(cleanId) || getGymAvatarById(cleanIdLower);
    if (gymCharacter?.imageUrl) {
      return gymCharacter.imageUrl;
    }

    if (SELECTED_MALE_GYM_PHOTOS[cleanId] || SELECTED_MALE_GYM_PHOTOS[cleanIdLower]) {
      return SELECTED_MALE_GYM_PHOTOS[cleanId] || SELECTED_MALE_GYM_PHOTOS[cleanIdLower];
    }
    if (SELECTED_FEMALE_GYM_PHOTOS[cleanId] || SELECTED_FEMALE_GYM_PHOTOS[cleanIdLower]) {
      return SELECTED_FEMALE_GYM_PHOTOS[cleanId] || SELECTED_FEMALE_GYM_PHOTOS[cleanIdLower];
    }
  }

  if (name) {
    const cleanName = name.replace(/\s*\(You\)\s*/i, '').trim().toLowerCase();
    const matchingChar = GYM_AVATARS.find(a => a.name.toLowerCase() === cleanName);
    if (matchingChar?.imageUrl) {
      return matchingChar.imageUrl;
    }
    if (SELECTED_MALE_GYM_PHOTOS[cleanName]) {
      return SELECTED_MALE_GYM_PHOTOS[cleanName];
    }
    if (SELECTED_FEMALE_GYM_PHOTOS[cleanName]) {
      return SELECTED_FEMALE_GYM_PHOTOS[cleanName];
    }
  }

  // Remaining users are intentionally not assigned a photo so only a subset of user cards have photos
  return undefined;
}

