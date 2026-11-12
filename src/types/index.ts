export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Abs & Core'
  | 'Forearms'
  | 'Full Body'
  | 'Cardio';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Smith Machine'
  | 'Bodyweight'
  | 'Weighted'
  | 'Kettlebell';

export type FitnessSection = 'Beginner' | 'Intermediate' | 'Pro' | 'Elite';
export type SectionLevel = 1 | 2 | 3;

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced Pro' | 'Pro' | 'Elite';

export type FitnessGoal =
  | 'Hypertrophy (Pure Muscle Mass)'
  | 'Strength & Size (Powerbuilding)'
  | 'Fat Loss & Shred (Caloric Deficit Conditioning)'
  | 'Lean Cut & Muscle Definition'
  | 'Aesthetic V-Taper';

export type SetType = 'warmup' | 'normal' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weightKg: number;
  weightLbs: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion (6-10)
  completed: boolean;
  previousBest?: string; // e.g. "100 kg x 8"
  isSuggested?: boolean;
  suggestedWeightKg?: number;
  suggestedWeightLbs?: number;
  suggestedReps?: number;
  suggestedReason?: string;
}

export interface WorkoutExercise {
  id?: string;
  exerciseId: string;
  name: string;
  targetMuscle: MuscleGroup;
  primary_muscle?: string;
  rawPrimaryMuscle?: string;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  sets: WorkoutSet[];
  notes?: string;
  restSeconds?: number;
  cdnUrl?: string;
  cdn_url?: string;
}

export interface ActiveWorkout {
  id: string;
  title: string;
  routineId?: string;
  startTime: number;
  exercises: WorkoutExercise[];
  isCompleted: boolean;
  durationSeconds: number;
  totalVolumeKg: number;
  prCount?: number;
  date: string;
  wearableAdaptation?: {
    deviceName: string;
    summary: string;
    volumeReductionPercent: number;
    targetMuscle?: string;
    acceptedAt: number;
  };
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  primary_muscle?: string;
  rawPrimaryMuscle?: string;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  tier: 'Compound' | 'Isolation';
  description: string;
  cues: string[];
  svgIconType: 'bench' | 'squat' | 'deadlift' | 'overhead' | 'pull' | 'curl' | 'dip' | 'cable';
  imageUrl?: string;
  images?: string[];
  cdnUrl?: string;
  cdn_url?: string;
  mediaFile?: string;
  category?: string;
  isCustomAllowed?: boolean;
  isCustom?: boolean;
  createdAt?: number;
  createdBy?: string;
  creatorBadge?: string;
}

export interface DailyWorkoutRoutine {
  dayName: string; // e.g. "Push A (Chest, Delts, Triceps)"
  focus: string;
  exercises: {
    id?: string;
    exerciseId: string;
    name?: string;
    primary_muscle?: string;
    cdn_url?: string;
    defaultSets: number;
    targetReps: string; // e.g. "8-10"
    targetRpe: number;
  }[];
  wearableRecommendation?: WearableWorkoutRecommendation;
  wearableDecision?: 'accepted' | 'discarded';
}

export interface CustomWorkoutProgram {
  id: string;
  name: string;
  daysCount: number;
  routines: DailyWorkoutRoutine[];
  createdAt: number;
  updatedAt?: number;
}

export type PlanCategory =
  | 'full_body'
  | 'weight_loss'
  | 'strength_power'
  | 'easy_foundations';

export type EquipmentPlanCategory =
  | 'commercial_gym'
  | 'cable_machine'
  | 'home_gym'
  | 'free_weights_only'
  | 'dumbbells_only'
  | 'bodyweight_only'
  | 'kettlebell_only';

export interface WorkoutPlan {
  id: string;
  title: string;
  subtitle: string;
  level: ExperienceLevel;
  daysPerWeek: number;
  goal: FitnessGoal;
  description: string;
  howToUse?: string;
  isPersonalized?: boolean;
  category?: PlanCategory;
  targetMuscleGroup?: MuscleGroup;
  targetEquipmentCategory?: EquipmentPlanCategory;
  isPro?: boolean;
  badge?: string;
  price?: number; // Standalone one-time purchase price (USD), or included in Pro
  thumbnail_url?: string;
  routines: DailyWorkoutRoutine[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxWeightLbs: number;
  reps: number;
  estimatedOneRepMaxKg: number;
  date: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  bodyweightKg: number;
  bodyweightLbs: number;
  // Core legacy & standard aggregates
  chestCm?: number;
  armsCm?: number;
  waistCm?: number;
  thighsCm?: number;
  shouldersCm?: number;
  notes?: string;

  // Granular Relaxed vs. Tensed / Pumped measurements
  armsRelaxedCm?: number;
  armsPumpedCm?: number;
  forearmsRelaxedCm?: number;
  forearmsPumpedCm?: number;
  chestRelaxedCm?: number;
  chestPumpedCm?: number;
  shouldersRelaxedCm?: number;
  shouldersPumpedCm?: number;
  waistRelaxedCm?: number;
  waistTensedCm?: number;
  thighsRelaxedCm?: number;
  thighsPumpedCm?: number;
  calvesRelaxedCm?: number;
  calvesPumpedCm?: number;
  hipsRelaxedCm?: number;
  hipsTensedCm?: number;
  neckCm?: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  label: string; // "Week 1", "Week 8", etc.
  pose: 'Front Relaxed' | 'Front Double Bicep' | 'Side Chest' | 'Back Lat Spread';
  imageDataUrl: string;
  weightKg: number;
}

export interface SocialCheer {
  id: string;
  userId: string;
  userName: string;
  emoji: '💪' | '🔥' | '⚡' | '🏆' | '🦍';
  label: string;
}

export interface SocialComment {
  id: string;
  userId: string;
  userName: string;
  avatarSeed: string;
  text: string;
  timestamp: number;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatarSeed: string;
  userBadge: 'PRO' | 'LIFTER' | 'BEAST';
  workoutTitle: string;
  durationMinutes: number;
  volumeKg: number;
  volumeLbs: number;
  topSet: string; // e.g. "140 kg x 5 Bench Press"
  prBroken?: string;
  timestamp: number;
  likes: number;
  cheers: SocialCheer[];
  comments: SocialComment[];
  isLikedByMe?: boolean;
  streakDays?: number;
  activeBadges?: string[];
  userRank?: string;
  postType?: 'workout' | 'custom_exercise' | 'photo_showcase' | 'before_after' | 'custom_plan' | 'progress_stage';
  sharedExercise?: ExerciseDefinition;
  sharedPlan?: WorkoutPlan;
  sharedPlanAudience?: string[];
  progressStageData?: ProgressStageShareData;
  photoUrl?: string;
  attachedPhotoUrl?: string;
  photoTag?: PhotoTagType;
  photoCaption?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  transformationDetails?: {
    beforeLabel?: string;
    afterLabel?: string;
    weeksProgress?: number;
    weightDeltaKg?: number;
    notes?: string;
  };
  workoutSession?: ActiveWorkout;
}

export interface ProgressStageShareData {
  stageId: string;
  stageType:
    | 'athlete_rank'
    | 'volume_tonnage'
    | 'workouts_logged'
    | 'iron_streak'
    | 'personal_records_summary'
    | 'single_pr'
    | 'body_measurements'
    | 'exercise_progression'
    | 'muscle_distribution';
  badgeLabel: string;
  title: string;
  highlightValue: string;
  highlightSubtext?: string;
  summaryBullets?: string[];
  defaultMessage?: string;
}

export type PhotoTagType = 'before' | 'after' | 'physique';

export type PhotoVisibility = 'community' | 'private';

export interface UserCommunityPhoto {
  id: string;
  url: string;
  uploadedAt: number;
  tag: PhotoTagType;
  caption?: string;
  weightKg?: number;
  dateLabel?: string;
  visibility?: PhotoVisibility; // 'community' = visible to community & feed, 'private' = personal vault only
  shareToFeed?: boolean;
}

export type ConnectionStatus = 'none' | 'pending' | 'connected' | 'incoming_request';

export interface NearbyAthlete {
  id: string;
  uniqueId?: string; // Unique Lifter ID e.g. "SOMA-1084"
  name: string;
  avatarSeed: string;
  avatarType?: 'upload' | 'animated';
  avatarUrl?: string;
  avatarId?: string;
  badge: 'PRO' | 'LIFTER' | 'BEAST' | 'ELITE';
  level: ExperienceLevel;
  gender?: 'male' | 'female' | 'other' | string;
  area: string;
  city: string;
  cityOrTown?: string;
  stateOrProvince?: string;
  country?: string;
  zipOrPostalCode?: string;
  latitude?: number;
  longitude?: number;
  gymName: string;
  gymAddress?: string;
  distanceMiles: number;
  distanceKm?: number;
  primaryGoal: string;
  favoriteLifts: string;
  trainingDaysPerWeek: number;
  streakDays: number;
  lastActive: string;
  workoutSplit: string;
  bio: string;
  connectionStatus: ConnectionStatus;
  inviteMessage?: string;
  invitedAt?: string;
  joinedDate?: string;
  whatsappNumber?: string;
  prs?: { exercise: string; weight: string }[];
  photos?: UserCommunityPhoto[];
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
}

export interface WorldwideGym {
  id: string;
  name: string;
  type: 'Powerlifting / Strongman' | 'Commercial Bodybuilding' | 'CrossFit / Functional' | 'Hardcore Iron Dungeon' | 'Luxury Health Club';
  cityOrTown: string;
  stateOrProvince: string;
  country: string;
  zipOrPostalCode: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceMiles?: number;
  distanceKm?: number;
  memberLiftersCount: number;
  verifiedBadge: boolean;
  equipmentHighlights: string[];
  dayPassAvailable: boolean;
  rating: number;
  phone?: string;
}

export interface UserSubscription {
  isPro: boolean;
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
  renewsAt?: string;
  cancelAtPeriodEnd?: boolean;
  downgradeEffectiveDate?: string;
  cycleStartedAt?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncedAt: number; // timestamp
}

export type EquipmentEnvironment =
  | 'commercial_gym'
  | 'home_gym'
  | 'free_weights_only'
  | 'dumbbell_only'
  | 'bodyweight_travel'
  | 'kettlebell_only';

export type EquipmentAccessType =
  | 'Full Commercial Gym'
  | 'Home Gym'
  | 'Free Weights Only'
  | 'Dumbbell Only'
  | 'Bodyweight Only'
  | 'Kettlebell Only'
  | 'No Weights (Travelling)'
  // backwards compatibility
  | 'Barbell & Dumbbells'
  | 'Cables & Machines';

export type UserGender = 'man' | 'woman' | 'skip' | 'male' | 'female' | 'other';

export interface UserProfile {
  name: string;
  email?: string;
  age: number;
  gender: UserGender;
  heightCm: number;
  weightKg: number;
  experienceLevel: ExperienceLevel;
  primaryGoal: FitnessGoal;
  daysPerWeek: number;
  equipmentAccess: EquipmentAccessType;
  equipmentEnvironment?: EquipmentEnvironment;
  focusWeakpoint: string;
  injuriesOrLimitations?: string;
  targetWeightKg?: number;
  gymName?: string;
  gymAddress?: string;
  bio?: string; // Short bio written by the user
  // Worldwide Address Sequence: City or town, state, province, country, zip code
  cityOrTown?: string;
  stateOrProvince?: string;
  country?: string;
  zipOrPostalCode?: string;
  homeTownAddress?: string; // Formatted full address sequence
  latitude?: number;
  longitude?: number;
  locationAccuracyMeters?: number;
  locationTrackerEnabled?: boolean;
  shareLocationForSocialSearch?: boolean;
  trackerPermissionGranted?: boolean;
  trackerPermissionSkipped?: boolean;
  athleteId?: string; // Unique Lifter ID e.g. "SOMA-8821"
  fitnessSection?: FitnessSection; // 'Beginner' | 'Intermediate' | 'Pro' | 'Elite'
  fitnessLevel?: SectionLevel; // 1 | 2 | 3
  photos?: UserCommunityPhoto[];
  avatarType?: 'upload' | 'animated';
  avatarUrl?: string; // Data URL for uploaded personal photo
  avatarId?: string; // ID of chosen animated gym character (gym_m1..gym_m5, gym_w1..gym_w5)
  weightUnit?: 'kg' | 'lbs';
  distanceUnit?: 'km' | 'mi';
  onboardingCompleted: boolean;
}

export interface ConnectedDevice {
  id: string;
  name: string; // 'Apple Health' | 'WHOOP 4.0' | 'Garmin Connect' | 'Fitbit' | 'Google Health Connect' | 'Polar H10' | 'BLE Heart Rate Strap'
  brand: 'apple' | 'whoop' | 'garmin' | 'fitbit' | 'google' | 'polar' | 'bluetooth';
  type: 'smartwatch' | 'strap' | 'platform';
  isConnected: boolean;
  batteryLevel?: number;
  lastSyncedAt?: number;
  currentHeartRateBpm?: number;
  dailyActiveCalories?: number;
  dailySteps?: number;
  recoveryScore?: number; // 0-100%
  sleepScore?: number; // 0-100%
  // Biometric Wearable Metrics
  sleepDebtHours?: number; // e.g. 1.9 hours
  sleepDurationHours?: number; // e.g. 5.4 hours
  restingHeartRateBpm?: number; // e.g. 63 bpm
  rhrBaselineBpm?: number; // e.g. 52 bpm
  hrvMs?: number; // Heart Rate Variability (rMSSD / SDNN in ms), e.g. 34 ms
  hrvBaselineMs?: number; // e.g. 68 ms
  bodyBatteryScore?: number; // e.g. 38/100 for Garmin Body Battery
  readinessStatus?: 'optimal' | 'moderate' | 'fatigued' | 'strained';
}

export interface WearableWorkoutRecommendation {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceBrand: 'apple' | 'whoop' | 'garmin' | 'fitbit' | 'google' | 'polar' | 'bluetooth';
  status: 'optimal' | 'moderate' | 'fatigued' | 'strained';
  headline: string; // e.g. "Garmin tracked poor sleep, so we are reducing leg volume by 20% today to prioritize recovery"
  summary: string;
  actionTitle: string; // e.g. "Reduce Leg Volume by 20%"
  volumeAdjustmentPercent: number; // e.g. -20 for 20% reduction, or 0, or +5
  targetMuscleGroup?: string; // e.g. "Legs / Quads"
  recommendedRpeCap?: number; // e.g. 7.5
  restTimerBonusSeconds?: number; // e.g. +30s
  biometrics: {
    sleepDebtHours: number;
    sleepDurationHours: number;
    sleepScore: number;
    restingHeartRateBpm: number;
    rhrDelta: number; // e.g. +11 bpm
    hrvMs: number;
    hrvDeltaPercent: number; // e.g. -38%
    recoveryScore: number;
    bodyBatteryScore?: number;
  };
  rationales: {
    title: string;
    description: string;
    severity: 'warning' | 'alert' | 'positive' | 'neutral';
  }[];
}

export interface AiProgramRecommendation {
  id: string;
  programTitle: string;
  splitType: string;
  targetFocus: string;
  matchScorePercentage: number;
  rationale: string;
  weeklyScheduleDescription: string;
  estimatedWeeklyTonnageKg: number;
  recommendedDailyProteinG: number;
  recommendedCaloricIntake: number;
  plan: WorkoutPlan;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: 'flame' | 'shield' | 'trophy' | 'target' | 'zap' | 'award';
  unlockedAt?: number;
  requirementDescription: string;
}

export interface RewardsLog {
  id: string;
  description: string;
  pointsDelta: number;
  timestamp: number;
  type: 'workout' | 'streak_multiplier' | 'social_action' | 'freeze_purchase' | 'streak_penalty' | 'badge_bonus' | 'referral' | 'share' | 'metric_logged' | 'warmup' | 'pr_milestone' | 'hydration' | 'course_quiz' | 'routine_saved' | 'streak_milestone' | 'challenge_completed';
}

export interface RewardsProfile {
  points: number; // Current points (5 points per completed workout)
  lifetimePoints: number; // Lifetime total points earned
  section: FitnessSection; // 'Beginner' | 'Intermediate' | 'Pro' | 'Elite'
  level: SectionLevel; // 1 | 2 | 3
  sectionPoints: number; // Points earned in current section (0-999; 1000 to advance section)
  rankTitle: string; // e.g. "Beginner - Level 1", "Beginner - Level 3", "Pro - Level 2", "Elite - Level 1"
  nextRankTitle: string; // e.g. "Beginner - Level 2", "Intermediate - Level 1", "Elite - Level 1"
  pointsToNextLevel: number; // Points needed to reach next level (e.g. 333 - (sectionPoints % 333))
  pointsToNextSection: number; // Points needed to reach next section (1000 - sectionPoints)
  levelProgressPercent: number; // 0 to 100%
  sectionProgressPercent: number; // 0 to 100%
  currentStreakDays: number;
  longestStreakDays: number;
  streakFreezeCount: number; // Available rest-day shields (1 per 2-month period for free, unlimited for Pro)
  streakFreezeUsedCount: number;
  streakFreezePeriodStartAt?: number; // Start timestamp of current 2-month (60-day) freeze period
  streakFreezeUsedInPeriod?: number; // Number of freezes used in the current 2-month period
  isFreezeActive?: boolean; // Whether a freeze shield is currently active
  lastPenaltyDate?: string; // Last date (YYYY-MM-DD) inactivity penalty (-2 pts/day) was evaluated
  lastWorkoutDate?: string;
  badges: string[]; // Badge IDs unlocked
  weeklyTrainDaysCount: number;
  monthlyTrainDaysCount: number;
  yearlyTrainDaysCount: number;
  historyLogs: RewardsLog[];
  // Backwards compatibility aliases
  gritBalance: number;
  lifetimeGrit: number;
  levelTitle: string;
  nextLevelGritRequirement: number;
}

export interface MemberAccount {
  id: string;
  email: string;
  isLoggedIn: boolean;
  name: string;
  joinedAt: string;
  lastLoginAt: string;
  isEmailVerified?: boolean;
  isGuest?: boolean;
  verificationCode?: string;
  passwordHash?: string;
  welcomeMessageSentAt?: string;
  emailPreferences: {
    weeklyDigestEnabled: boolean;
    deliveryDay: 'sunday' | 'monday' | 'friday';
    deliveryHour: number; // e.g. 8 for 8:00 AM
    includeProgressCharts: boolean;
    includeWorldwideMembers: boolean;
    includeLocalMembers: boolean;
    includeEncouragement: boolean;
  };
  lastWeeklyEmailSentAt?: string;
  sentEmailsHistory: SentWeeklyEmailRecord[];
}

export interface SentWeeklyEmailRecord {
  id: string;
  sentAt: string;
  recipientEmail: string;
  subject: string;
  encouragementMessage: string;
  stats: {
    workoutsCompleted: number;
    totalSets: number;
    totalVolumeKg: number;
    streakDays: number;
    topLiftPR: string;
  };
  worldwideMembersCount: number;
  localMembersCount: number;
}

export interface WeeklyProgressEmailDigest {
  id: string;
  recipientEmail: string;
  recipientName: string;
  dateRange: string;
  encouragementMessage: string;
  stats: {
    workoutsCompleted: number;
    totalSets: number;
    totalVolumeKg: number;
    streakDays: number;
    topLiftPR: string;
    consistencyScorePercent: number;
  };
  dailyVolumeChart: {
    day: string; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
    fullDay: string;
    sets: number;
    volumeKg: number;
    isWorkoutDay: boolean;
    routineName?: string;
  }[];
  muscleGroupDistribution: {
    muscle: string;
    percentage: number;
    sets: number;
    color: string;
  }[];
  strengthProgression: {
    exercise: string;
    previousWeightKg: number;
    currentWeightKg: number;
    deltaKg: number;
    trend: 'up' | 'steady' | 'new';
  }[];
  worldwideSuggestedMembers: NearbyAthlete[]; // Max 5 members on the same level
  localAreaMembers: NearbyAthlete[]; // Max 5 members in the user's area
  generatedAt: string;
}

