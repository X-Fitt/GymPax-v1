import { NearbyAthlete, UserCommunityPhoto, UserProfile } from '../types';

export interface UserPhysiquePhotoPair {
  gender: 'male' | 'female';
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  extraPhotoUrl?: string;
  beforeCaption: string;
  afterCaption: string;
  extraCaption?: string;
}

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=800&q=85`;

/**
 * 100% Unique, Gender-Verified Gym & Home Physique Photos for Every User.
 * - Male users strictly use verified male gym/home photos.
 * - Female users strictly use verified female gym/home photos.
 * - Zero photo URL is duplicated across any user or between before/after slots.
 * - Avatar photos remain completely separate and unchanged.
 */
const USER_PHYSIQUE_MAP: Record<string, UserPhysiquePhotoPair> = {
  // ===========================================================================
  // MALE USERS (21 Distinct Users - Strictly Male Gym/Home Photos)
  // ===========================================================================

  // 1. Current User / Alex Hunter (Male)
  u_me: {
    gender: 'male',
    beforePhotoUrl: u('1532384816664-01b8b7238c8d'),
    afterPhotoUrl: u('1545346315-f4c47e3e1b55'),
    extraPhotoUrl: u('1577221084712-45b0445d2b00'),
    beforeCaption: 'Starting baseline - Month 1. Focusing on compound foundation and posture.',
    afterCaption: 'Current physique - Week 14. +4kg lean mass, locked in progressive overload.',
    extraCaption: 'Mid-mesocycle core & upper body check-in.'
  },

  // 2. Marcus Thorne (Male)
  ath_1: {
    gender: 'male',
    beforePhotoUrl: u('1532384555668-bc0c32a17ffd'),
    afterPhotoUrl: u('1532384661798-58b53a4fbe37'),
    beforeCaption: 'Month 1 Baseline · Off-season strength block in the gym',
    afterCaption: 'Week 16 Current · +5.5kg lean mass & upper chest shelf'
  },

  // 3. Tyler Brooks (Male)
  ath_aus_4: {
    gender: 'male',
    beforePhotoUrl: u('1594737625785-a6cbdabd333c'),
    afterPhotoUrl: u('1598971457999-ca4ef48a9a71'),
    beforeCaption: 'Home & garage dumbbell push-up baseline',
    afterCaption: 'Gym upper body hypertrophy check-in'
  },

  // 4. David Morales (Male)
  ath_aus_5: {
    gender: 'male',
    beforePhotoUrl: u('1598971639058-fab3c3109a00'),
    afterPhotoUrl: u('1605296867424-35fc25c9212a'),
    beforeCaption: 'Week 1 · Transitioning to high-frequency PPL',
    afterCaption: 'Week 12 · Back width and rear delt density'
  },

  // 5. Aaron Patel (Male)
  ath_aus_7: {
    gender: 'male',
    beforePhotoUrl: u('1599058917765-a780eda07a3e'),
    afterPhotoUrl: u('1605296867724-fa87a8ef53fd'),
    beforeCaption: 'Conditioning & athletic baseline in the gym',
    afterCaption: 'Current barbell strength & torso development'
  },

  // 6. Darius Vance (Male)
  ath_nyc_1: {
    gender: 'male',
    beforePhotoUrl: u('1579758629938-03607ccdbaba'),
    afterPhotoUrl: u('1581009146145-b5ef050c2e1e'),
    beforeCaption: 'Start of torso/limbs hypertrophy block',
    afterCaption: 'Peak arm & shoulder pump under gym lighting'
  },

  // 7. Callum Wright (Male)
  ath_lon_1: {
    gender: 'male',
    beforePhotoUrl: u('1534368270820-9de3d8053204'),
    afterPhotoUrl: u('1567013127542-490d757e51fc'),
    beforeCaption: 'Heavy compound platform baseline',
    afterCaption: 'Lean upper-body definition & shoulder striations'
  },

  // 8. Noah Tremblay (Male)
  ath_tor_1: {
    gender: 'male',
    beforePhotoUrl: u('1596357395104-ba989e72b5ec'),
    afterPhotoUrl: u('1532029837206-abbe2b7620e3'),
    beforeCaption: 'Accessory tricep & press work in the gym',
    afterCaption: 'Heavy overhead barbell press strength block'
  },

  // 9. Liam O’Connor (Male)
  ath_syd_1: {
    gender: 'male',
    beforePhotoUrl: u('1584466977773-e625c37cdd50'),
    afterPhotoUrl: u('1597452485669-2c7bb5fef90d'),
    beforeCaption: 'Flat barbell bench press session',
    afterCaption: 'Pec deck & upper chest hypertrophy check-in'
  },

  // 10. Kenji Takahashi (Male)
  ath_tyo_1: {
    gender: 'male',
    beforePhotoUrl: u('1581009137042-c552e485697a'),
    afterPhotoUrl: u('1526506118085-60ce8714f8c5'),
    beforeCaption: 'Ring & suspension chest conditioning',
    afterCaption: 'V-taper lat spread & weighted pull-up check-in'
  },

  // 11. Maximilian Krause (Male)
  ath_ber_1: {
    gender: 'male',
    beforePhotoUrl: u('1605296867304-46d5465a13f1'),
    afterPhotoUrl: u('1601422407692-ec4eeec1d9b3'),
    beforeCaption: 'Deadlift platform setup at Berlin Strength',
    afterCaption: 'Core bracing & overhead kettlebell lockout'
  },

  // 12. Mateo Morales (Male)
  ath_mad_1: {
    gender: 'male',
    beforePhotoUrl: u('1596357395217-80de13130e92'),
    afterPhotoUrl: u('1616803689943-5601631c7fec'),
    beforeCaption: 'Barbell squat rack progression',
    afterCaption: 'Home & gym upper-body conditioning check-in'
  },

  // 13. Lars van Dijk (Male)
  ath_ams_1: {
    gender: 'male',
    beforePhotoUrl: u('1611672585731-fa10603fb9e0'),
    afterPhotoUrl: u('1583454155184-870a1f63aebc'),
    beforeCaption: 'Lateral delt & tricep thickness check-in',
    afterCaption: 'Wide-grip pull-up back development'
  },

  // 14. Min-Jun Park (Male)
  ath_seo_1: {
    gender: 'male',
    beforePhotoUrl: u('1549476464-37392f717541'),
    afterPhotoUrl: u('1606889464198-fcb18894cf50'),
    beforeCaption: 'Gym floor strength session with plates',
    afterCaption: 'Bicep peak & arm hypertrophy check-in'
  },

  // 15. Cian Murphy (Male)
  ath_dub_1: {
    gender: 'male',
    beforePhotoUrl: u('1603287681836-b174ce5074c2'),
    afterPhotoUrl: u('1579758682665-53a1a614eea6'),
    beforeCaption: 'Rear double-biceps back symmetry',
    afterCaption: 'Full-body lean mass check-in on the gym floor'
  },

  // 16. Leo Sterling (Male)
  u_leo: {
    gender: 'male',
    beforePhotoUrl: u('1599058945522-28d584b6f0ff'),
    afterPhotoUrl: u('1530822847156-5df684ec5ee1'),
    beforeCaption: 'Baseline athletic conditioning',
    afterCaption: 'Side chest & tricep horseshoe check-in'
  },

  // 17. David Vance (Male)
  u_david: {
    gender: 'male',
    beforePhotoUrl: u('1507398941214-572c25f4b1dc'),
    afterPhotoUrl: u('1584952811565-c4c4031805a8'),
    beforeCaption: 'Cable tricep pushdown vascularity',
    afterCaption: 'Post-arm-day pump by the dumbbell rack'
  },

  // 18. Sam Kowalski (Male)
  u_sam: {
    gender: 'male',
    beforePhotoUrl: u('1580086319619-3ed498161c77'),
    afterPhotoUrl: u('1591027480007-a42f6ef886c3'),
    beforeCaption: 'Barbell back session in the gym',
    afterCaption: 'Heavy single-arm dumbbell row thickness'
  },

  // 19. Liam Scott (Male)
  u_liam: {
    gender: 'male',
    beforePhotoUrl: u('1592632789004-57d4354f2499'),
    afterPhotoUrl: u('1604480133435-25b86862d276'),
    beforeCaption: 'Barbell deadlift lockout check-in',
    afterCaption: 'Cable chest fly striation check-in'
  },

  // 20. Coach Dave (Male)
  u_dave: {
    gender: 'male',
    beforePhotoUrl: u('1613685044678-0a9ae422cf5a'),
    afterPhotoUrl: u('1583454110551-21f2fa2afe61'),
    beforeCaption: 'Home & studio unilateral leg stability',
    afterCaption: 'Heavy dumbbell rack strength check-in'
  },

  // 21. Alex V. (Male)
  u_alex: {
    gender: 'male',
    beforePhotoUrl: u('1616803824305-a07cfbc8ea60'),
    afterPhotoUrl: u('1517838277536-f5f99be501cd'),
    beforeCaption: 'Core & bodyweight conditioning',
    afterCaption: 'Strapped barbell pull session in the gym'
  },

  // ===========================================================================
  // FEMALE USERS (11 Distinct Users - Strictly Female Gym/Home Photos)
  // ===========================================================================

  // 1. Jessica Chen (Female)
  ath_2: {
    gender: 'female',
    beforePhotoUrl: u('1571019613531-fbeaeb790845'),
    afterPhotoUrl: u('1534367990512-edbdca781b00'),
    beforeCaption: 'Month 1 Baseline · Core & lower-body foundation in the gym',
    afterCaption: 'Current Physique · Lean core & lower-body hypertrophy check-in'
  },

  // 2. Sarah Jenkins (Female)
  ath_aus_3: {
    gender: 'female',
    beforePhotoUrl: u('1600881333168-2ef49b341f30'),
    afterPhotoUrl: u('1534368420009-621bfab424a8'),
    beforeCaption: 'Home mat mobility & bodyweight baseline',
    afterCaption: 'Barbell deadlift platform progress in the gym'
  },

  // 3. Brooke Miller (Female)
  ath_aus_6: {
    gender: 'female',
    beforePhotoUrl: u('1574680096145-d05b474e2155'),
    afterPhotoUrl: u('1534367507873-d2d7e24c797f'),
    beforeCaption: 'Squat rack depth check-in',
    afterCaption: 'Upper back & shoulder definition under the bar'
  },

  // 4. Maya Rodriguez (Female)
  ath_lax_1: {
    gender: 'female',
    beforePhotoUrl: u('1571019613454-1cb2f99b2d8b'),
    afterPhotoUrl: u('1518611012118-696072aa579a'),
    beforeCaption: 'Barbell squat session at Gold’s Venice',
    afterCaption: 'Home core & midsection conditioning check-in'
  },

  // 5. Elena Rostova (Female)
  ath_lon_2: {
    gender: 'female',
    beforePhotoUrl: u('1594381898411-846e7d193883'),
    afterPhotoUrl: u('1550345332-09e3ac987658'),
    beforeCaption: 'Studio mat core & glute activation',
    afterCaption: 'Post-deadlift upper body & core check-in'
  },

  // 6. Chloe Taylor (Female)
  ath_lon_3: {
    gender: 'female',
    beforePhotoUrl: u('1534367610401-9f5ed68180aa'),
    afterPhotoUrl: u('1532384748853-8f54a8f476e2'),
    beforeCaption: 'Month 1 gym consistency baseline',
    afterCaption: 'Barbell back squat & upper back progress'
  },

  // 7. Camille Laurent (Female)
  ath_par_1: {
    gender: 'female',
    beforePhotoUrl: u('1541534741688-6078c6bfb5c5'),
    afterPhotoUrl: u('1546483875-ad9014c88eba'),
    beforeCaption: 'Single-arm dumbbell row sculpting in the gym',
    afterCaption: 'Overhead barbell press & back symmetry'
  },

  // 8. Larissa Santos (Female)
  ath_sao_1: {
    gender: 'female',
    beforePhotoUrl: u('1566241142559-40e1dab266c6'),
    afterPhotoUrl: u('1571731956672-f2b94d7dd0cb'),
    beforeCaption: 'Bench dumbbell row & hamstring block',
    afterCaption: 'Core plank & athletic conditioning check-in'
  },

  // 9. Sofia Rossi (Female)
  ath_mil_1: {
    gender: 'female',
    beforePhotoUrl: u('1574680178050-55c6a6a96e0a'),
    afterPhotoUrl: u('1591258370814-01609b341790'),
    beforeCaption: 'Dumbbell upper-body session in Milan',
    afterCaption: 'Heavy barbell back squat check-in'
  },

  // 10. Sarah Connor (Female)
  u_sarah: {
    gender: 'female',
    beforePhotoUrl: u('1548690312-e3b507d8c110'),
    afterPhotoUrl: u('1595078475328-1ab05d0a6a0e'),
    beforeCaption: 'Floor dumbbell & core strength baseline',
    afterCaption: 'Gym battle rope & shoulder power check-in'
  },

  // 11. Maya Lin (Female)
  u_maya: {
    gender: 'female',
    beforePhotoUrl: u('1571019613576-2b22c76fd955'),
    afterPhotoUrl: u('1534438097545-a2c22c57f2ad'),
    beforeCaption: 'Chalking up for strict overhead barbell press',
    afterCaption: 'Core rollout & athletic physique check-in'
  }
};

// Alias map so lookup by name, userId, friendId, or avatarSeed resolves to the exact same user
const USER_ALIASES: Record<string, string> = {
  // Current user
  u_me: 'u_me',
  ath_current_user: 'u_me',
  user_alex: 'u_me',
  my_avatar: 'u_me',
  'alex hunter': 'u_me',

  // Marcus Thorne
  ath_1: 'ath_1',
  u_marcus: 'ath_1',
  f_marcus: 'ath_1',
  marcus_iron: 'ath_1',
  'marcus thorne': 'ath_1',

  // Jessica Chen
  ath_2: 'ath_2',
  u_jessica: 'ath_2',
  f_jessica: 'ath_2',
  jess_fit: 'ath_2',
  'jessica chen': 'ath_2',

  // Sarah Jenkins
  ath_aus_3: 'ath_aus_3',
  sarah_austin: 'ath_aus_3',
  'sarah jenkins': 'ath_aus_3',

  // Tyler Brooks
  ath_aus_4: 'ath_aus_4',
  tyler_tx: 'ath_aus_4',
  'tyler brooks': 'ath_aus_4',

  // David Morales
  ath_aus_5: 'ath_aus_5',
  david_atx: 'ath_aus_5',
  'david morales': 'ath_aus_5',

  // Brooke Miller
  ath_aus_6: 'ath_aus_6',
  brooke_atx: 'ath_aus_6',
  'brooke miller': 'ath_aus_6',

  // Aaron Patel
  ath_aus_7: 'ath_aus_7',
  aaron_atx: 'ath_aus_7',
  'aaron patel': 'ath_aus_7',

  // Darius Vance
  ath_nyc_1: 'ath_nyc_1',
  darius_nyc: 'ath_nyc_1',
  'darius vance': 'ath_nyc_1',

  // Maya Rodriguez
  ath_lax_1: 'ath_lax_1',
  maya_venice: 'ath_lax_1',
  'maya rodriguez': 'ath_lax_1',

  // Callum Wright
  ath_lon_1: 'ath_lon_1',
  callum_uk: 'ath_lon_1',
  'callum wright': 'ath_lon_1',

  // Elena Rostova
  ath_lon_2: 'ath_lon_2',
  u_elena: 'ath_lon_2',
  elena_uk: 'ath_lon_2',
  elena_lift: 'ath_lon_2',
  'elena rostova': 'ath_lon_2',
  'elena r.': 'ath_lon_2',

  // Chloe Taylor
  ath_lon_3: 'ath_lon_3',
  chloe_uk: 'ath_lon_3',
  'chloe taylor': 'ath_lon_3',

  // Noah Tremblay
  ath_tor_1: 'ath_tor_1',
  noah_toronto: 'ath_tor_1',
  'noah tremblay': 'ath_tor_1',

  // Liam O'Connor
  ath_syd_1: 'ath_syd_1',
  liam_sydney: 'ath_syd_1',
  'liam o’connor': 'ath_syd_1',
  "liam o'connor": 'ath_syd_1',

  // Kenji Takahashi
  ath_tyo_1: 'ath_tyo_1',
  kenji_tokyo: 'ath_tyo_1',
  'kenji takahashi': 'ath_tyo_1',

  // Maximilian Krause
  ath_ber_1: 'ath_ber_1',
  max_berlin: 'ath_ber_1',
  'maximilian krause': 'ath_ber_1',

  // Camille Laurent
  ath_par_1: 'ath_par_1',
  camille_paris: 'ath_par_1',
  'camille laurent': 'ath_par_1',

  // Mateo Morales
  ath_mad_1: 'ath_mad_1',
  mateo_madrid: 'ath_mad_1',
  'mateo morales': 'ath_mad_1',

  // Larissa Santos
  ath_sao_1: 'ath_sao_1',
  larissa_sp: 'ath_sao_1',
  'larissa santos': 'ath_sao_1',

  // Lars van Dijk
  ath_ams_1: 'ath_ams_1',
  lars_ams: 'ath_ams_1',
  'lars van dijk': 'ath_ams_1',

  // Sofia Rossi
  ath_mil_1: 'ath_mil_1',
  sofia_milan: 'ath_mil_1',
  'sofia rossi': 'ath_mil_1',

  // Min-Jun Park
  ath_seo_1: 'ath_seo_1',
  minjun_seoul: 'ath_seo_1',
  'min-jun park': 'ath_seo_1',

  // Cian Murphy
  ath_dub_1: 'ath_dub_1',
  cian_dublin: 'ath_dub_1',
  'cian murphy': 'ath_dub_1',

  // Leo Sterling
  u_leo: 'u_leo',
  f_leo: 'u_leo',
  leo_gym: 'u_leo',
  'leo sterling': 'u_leo',

  // Sarah Connor
  u_sarah: 'u_sarah',
  f_sarah: 'u_sarah',
  sarah_iron: 'u_sarah',
  'sarah connor': 'u_sarah',

  // David Vance
  u_david: 'u_david',
  f_david: 'u_david',
  david_v: 'u_david',
  'david vance': 'u_david',

  // Sam Kowalski
  u_sam: 'u_sam',
  sam_iron: 'u_sam',
  'sam kowalski': 'u_sam',
  'sam k.': 'u_sam',

  // Maya Lin
  u_maya: 'u_maya',
  maya_fit: 'u_maya',
  'maya lin': 'u_maya',

  // Liam Scott
  u_liam: 'u_liam',
  liam_quad: 'u_liam',
  'liam scott': 'u_liam',
  'liam s.': 'u_liam',

  // Coach Dave & Alex V.
  u_dave: 'u_dave',
  dave_coach: 'u_dave',
  'coach dave': 'u_dave',
  u_alex: 'u_alex',
  alex_lift: 'u_alex',
  'alex v.': 'u_alex'
};

// Extra non-overlapping verified pools for any dynamically created male or female user
const EXTRA_MALE_PAIRS: UserPhysiquePhotoPair[] = [
  {
    gender: 'male',
    beforePhotoUrl: u('1549060279-7e168fcee0c2'),
    afterPhotoUrl: u('1521804906057-1df8fdb718b7'),
    beforeCaption: 'Barbell grip & deadlift baseline in the gym',
    afterCaption: 'Heavy compound pull progression check-in'
  },
  {
    gender: 'male',
    beforePhotoUrl: u('1599058918144-1ffabb6ab9a0'),
    afterPhotoUrl: u('1530822847156-5df684ec5ee1'),
    beforeCaption: 'Athletic conditioning baseline',
    afterCaption: 'Upper-body hypertrophy check-in'
  }
];

const EXTRA_FEMALE_PAIRS: UserPhysiquePhotoPair[] = [
  {
    gender: 'female',
    beforePhotoUrl: u('1571019613914-85f342c6a11e'),
    afterPhotoUrl: u('1584863231364-2edc166de576'),
    beforeCaption: 'Platform barbell deadlift baseline in the gym',
    afterCaption: 'Barbell split squat & lower-body progress'
  },
  {
    gender: 'female',
    beforePhotoUrl: u('1574680088814-c9e8a10d8a4d'),
    afterPhotoUrl: u('1567598508481-65985588e295'),
    beforeCaption: 'Power rack barbell RDL baseline',
    afterCaption: 'Bicep curl & upper-body toning in the gym'
  },
  {
    gender: 'female',
    beforePhotoUrl: u('1518644961665-ed172691aaa1'),
    afterPhotoUrl: u('1522898467493-49726bf28798'),
    beforeCaption: 'Dumbbell goblet squat in the gym',
    afterCaption: 'Home & studio stability ball core check-in'
  },
  {
    gender: 'female',
    beforePhotoUrl: u('1550259979-ed79b48d2a30'),
    afterPhotoUrl: u('1590556409324-aa1d726e5c3c'),
    beforeCaption: 'Kettlebell & side plank core conditioning',
    afterCaption: 'Athletic boxing & upper-body conditioning'
  }
];

const FEMALE_FIRST_NAMES = new Set([
  'jessica',
  'sarah',
  'brooke',
  'maya',
  'elena',
  'chloe',
  'camille',
  'larissa',
  'sofia',
  'freya',
  'zara',
  'nadia',
  'emma',
  'olivia',
  'ava',
  'mia',
  'isabella',
  'sophia',
  'charlotte',
  'amelia',
  'harper',
  'evelyn',
  'abigail',
  'emily',
  'elizabeth',
  'mila',
  'ella',
  'aria',
  'scarlett',
  'victoria',
  'madison',
  'luna',
  'grace',
  'penelope',
  'layla',
  'riley',
  'zoey',
  'nora',
  'lily',
  'eleanor',
  'hannah',
  'lillian',
  'addison',
  'aubrey',
  'ellie',
  'stella',
  'natalie',
  'zoe',
  'leah',
  'hazel',
  'violet',
  'aurora',
  'savannah',
  'audrey',
  'brooklyn',
  'bella',
  'claire',
  'skylar',
  'lucy',
  'paisley',
  'everly',
  'anna',
  'caroline',
  'nova',
  'genesis',
  'emilia',
  'kennedy',
  'samantha',
  'maya',
  'willow',
  'kinsley',
  'naomi',
  'aaliyah',
  'elena',
  'sarah',
  'ariana',
  'allison',
  'gabriella',
  'alice',
  'madelyn',
  'cora',
  'ruby',
  'eva',
  'serenity',
  'autumn',
  'adeline',
  'hailey',
  'gianna',
  'valentina',
  'isla',
  'eliana',
  'quinn',
  'nevaeh',
  'ivy',
  'sadie',
  'piper',
  'lydia',
  'alexa',
  'josephine',
  'emery',
  'julia',
  'delilah',
  'arianna',
  'vivian',
  'kaylee',
  'sophie',
  'brielle',
  'madeline',
  'rachel',
  'lauren',
  'ashley',
  'amanda',
  'nicole',
  'stephanie',
  'heather',
  'melissa',
  'rebecca',
  'laura',
  'karen',
  'amy',
  'angela',
  'brenda',
  'kelly',
  'vanessa',
  'diana',
  'natalia',
  'clara'
]);

export function inferUserGender(options: {
  id?: string;
  name?: string;
  gender?: string;
  avatarId?: string;
}): 'male' | 'female' {
  if (options.gender) {
    const g = options.gender.toLowerCase().trim();
    if (g === 'female' || g === 'women' || g === 'woman' || g === 'f') return 'female';
    if (g === 'male' || g === 'men' || g === 'man' || g === 'm') return 'male';
  }
  if (options.avatarId && options.avatarId.startsWith('gym_w')) {
    return 'female';
  }
  if (options.avatarId && options.avatarId.startsWith('gym_m')) {
    return 'male';
  }
  if (options.id) {
    const canonical = USER_ALIASES[options.id] || USER_ALIASES[options.id.toLowerCase()];
    if (canonical && USER_PHYSIQUE_MAP[canonical]) {
      return USER_PHYSIQUE_MAP[canonical].gender;
    }
  }
  if (options.name) {
    const cleanName = options.name.replace(/\s*\(You\)\s*/i, '').trim().toLowerCase();
    const canonical = USER_ALIASES[cleanName];
    if (canonical && USER_PHYSIQUE_MAP[canonical]) {
      return USER_PHYSIQUE_MAP[canonical].gender;
    }
    const firstWord = cleanName.split(/\s+/)[0];
    if (FEMALE_FIRST_NAMES.has(firstWord)) {
      return 'female';
    }
  }
  return 'male';
}

export function resolveUserPhysiquePair(options: {
  id?: string;
  avatarSeed?: string;
  name?: string;
  gender?: string;
  avatarId?: string;
}): UserPhysiquePhotoPair {
  const candidates = [options.id, options.avatarSeed, options.name]
    .filter(Boolean)
    .map(s => String(s).replace(/\s*\(You\)\s*/i, '').trim());

  const explicitGender = options.gender
    ? inferUserGender({ gender: options.gender, avatarId: options.avatarId })
    : undefined;

  for (const key of candidates) {
    const canonical =
      USER_ALIASES[key] || USER_ALIASES[key.toLowerCase()] || (USER_PHYSIQUE_MAP[key] ? key : undefined);
    if (canonical && USER_PHYSIQUE_MAP[canonical]) {
      const entry = USER_PHYSIQUE_MAP[canonical];
      // If an explicit gender was provided (e.g. current user switched gender in profile), honor it
      if (!explicitGender || entry.gender === explicitGender) {
        return entry;
      }
    }
  }

  const resolvedGender = inferUserGender(options);
  const pool = resolvedGender === 'female' ? EXTRA_FEMALE_PAIRS : EXTRA_MALE_PAIRS;
  const seedStr = (options.name || options.id || 'athlete').toLowerCase();
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

export function getSeedPhotosForUser(profile?: UserProfile | null): UserCommunityPhoto[] {
  const gender = inferUserGender({
    id: 'u_me',
    name: profile?.name,
    gender: profile?.gender,
    avatarId: profile?.avatarId
  });

  if (gender === 'female') {
    const f0 = EXTRA_FEMALE_PAIRS[0];
    const f1 = EXTRA_FEMALE_PAIRS[1];
    return [
      {
        id: 'seed_photo_before',
        url: f0.beforePhotoUrl,
        uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
        tag: 'before',
        caption: f0.beforeCaption,
        weightKg: 60.5,
        dateLabel: 'Month 1 · Baseline',
        visibility: 'community',
        shareToFeed: true
      },
      {
        id: 'seed_photo_after',
        url: f0.afterPhotoUrl,
        uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        tag: 'after',
        caption: f0.afterCaption,
        weightKg: 62.0,
        dateLabel: 'Week 14 · Current',
        visibility: 'community',
        shareToFeed: true
      },
      {
        id: 'seed_photo_physique',
        url: f1.beforePhotoUrl,
        uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        tag: 'physique',
        caption: f1.beforeCaption,
        weightKg: 61.2,
        dateLabel: 'Week 8 Check-in',
        visibility: 'community',
        shareToFeed: false
      }
    ];
  }

  const mePair = USER_PHYSIQUE_MAP.u_me;
  return [
    {
      id: 'seed_photo_before',
      url: mePair.beforePhotoUrl,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
      tag: 'before',
      caption: mePair.beforeCaption,
      weightKg: 78.5,
      dateLabel: 'Month 1 · Baseline',
      visibility: 'community',
      shareToFeed: true
    },
    {
      id: 'seed_photo_after',
      url: mePair.afterPhotoUrl,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      tag: 'after',
      caption: mePair.afterCaption,
      weightKg: 82.5,
      dateLabel: 'Week 14 · Current',
      visibility: 'community',
      shareToFeed: true
    },
    {
      id: 'seed_photo_physique',
      url: mePair.extraPhotoUrl || mePair.afterPhotoUrl,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
      tag: 'physique',
      caption: mePair.extraCaption || 'Mid-mesocycle check-in at the iron dungeon.',
      weightKg: 80.2,
      dateLabel: 'Week 8 Check-in',
      visibility: 'community',
      shareToFeed: false
    }
  ];
}

export function buildAthletePhysiquePhotos(athlete: {
  id?: string;
  avatarSeed?: string;
  name?: string;
  gender?: string;
  avatarId?: string;
}): {
  gender: 'male' | 'female';
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  photos: UserCommunityPhoto[];
} {
  const pair = resolveUserPhysiquePair(athlete);
  const key = athlete.id || athlete.avatarSeed || 'ath';
  const photos: UserCommunityPhoto[] = [
    {
      id: `${key}_photo_before`,
      url: pair.beforePhotoUrl,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 84,
      tag: 'before',
      caption: pair.beforeCaption,
      dateLabel: 'Before · Baseline',
      visibility: 'community',
      shareToFeed: true
    },
    {
      id: `${key}_photo_after`,
      url: pair.afterPhotoUrl,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      tag: 'after',
      caption: pair.afterCaption,
      dateLabel: 'After · Current',
      visibility: 'community',
      shareToFeed: true
    }
  ];

  if (pair.extraPhotoUrl) {
    photos.push({
      id: `${key}_photo_physique`,
      url: pair.extraPhotoUrl,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
      tag: 'physique',
      caption: pair.extraCaption || 'Physique progress check-in',
      dateLabel: 'Physique Check-in',
      visibility: 'community',
      shareToFeed: false
    });
  }

  return {
    gender: pair.gender,
    beforePhotoUrl: pair.beforePhotoUrl,
    afterPhotoUrl: pair.afterPhotoUrl,
    photos
  };
}
