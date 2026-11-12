import {
  ActiveWorkout,
  WorkoutPlan,
  CustomWorkoutProgram,
  PersonalRecord,
  BodyMeasurement,
  ProgressPhoto,
  SocialPost,
  UserSubscription,
  ExerciseDefinition,
  MemberAccount,
  SentWeeklyEmailRecord,
  ProgressStageShareData
} from '../types';
import { PRESET_WORKOUT_PLANS, REMOVED_MUSCLE_BUILDING_PLAN_IDS } from '../data/plans';
import { INITIAL_SOCIAL_POSTS } from '../data/mockSocial';
import { BASE_EXERCISE_DATABASE, syncExerciseDatabase, groundWorkoutPlan, groundRoutineExercises, resolveCatalogExercise } from '../data/exercises';
import { getExerciseModelPhoto } from '../data/fitnessModelPictures';

const STORAGE_KEYS = {
  ACTIVE_PLAN: 'aesthetix_active_plan',
  CUSTOM_PLANS: 'aesthetix_custom_plans',
  CUSTOM_WORKOUT_PROGRAMS: 'gympax_custom_workout_programs',
  PERSONALIZED_PLANS: 'gympax_personalized_plans',
  DELETED_PERSONALIZED_PLANS: 'gympax_deleted_personalized_plan_ids',
  CUSTOM_EXERCISES: 'aesthetix_custom_exercises',
  WORKOUT_HISTORY: 'aesthetix_workout_history',
  DRAFT_WORKOUT: 'aesthetix_draft_workout',
  PERSONAL_RECORDS: 'aesthetix_personal_records',
  MEASUREMENTS: 'aesthetix_measurements',
  PROGRESS_PHOTOS: 'aesthetix_progress_photos',
  SOCIAL_POSTS: 'aesthetix_social_posts',
  PURCHASED_PLANS: 'gympax_purchased_plans',
  SUBSCRIPTION: 'aesthetix_subscription',
  SETTINGS: 'aesthetix_settings',
  SYNC_QUEUE: 'aesthetix_sync_queue',
  LAST_SYNC: 'aesthetix_last_sync',
  USER_PROFILE: 'aesthetix_user_profile',
  CONNECTED_DEVICES: 'aesthetix_connected_devices',
  MEMBER_ACCOUNT: 'gympax_member_account'
};

export type AppTheme = 'dark' | 'gray' | 'light' | 'amoled';

export interface AppSettings {
  weightUnit: 'kg' | 'lbs';
  theme: AppTheme;
  soundEnabled: boolean;
  defaultRestSeconds: number;
  equipmentEnvironment?: import('../types').EquipmentEnvironment;
}

export const INITIAL_DEVICES: import('../types').ConnectedDevice[] = [
  {
    id: 'dev_garmin',
    name: 'Garmin Connect (Fenix / Forerunner)',
    brand: 'garmin',
    type: 'smartwatch',
    isConnected: true,
    batteryLevel: 82,
    currentHeartRateBpm: 134,
    dailyActiveCalories: 580,
    dailySteps: 7420,
    recoveryScore: 52,
    sleepScore: 54,
    sleepDebtHours: 1.9,
    sleepDurationHours: 5.3,
    restingHeartRateBpm: 63,
    rhrBaselineBpm: 52,
    hrvMs: 34,
    hrvBaselineMs: 68,
    bodyBatteryScore: 38,
    readinessStatus: 'fatigued'
  },
  {
    id: 'dev_apple',
    name: 'Apple Health / Watch Ultra',
    brand: 'apple',
    type: 'smartwatch',
    isConnected: false,
    batteryLevel: 88,
    currentHeartRateBpm: 128,
    dailyActiveCalories: 640,
    dailySteps: 9420,
    recoveryScore: 88,
    sleepScore: 86,
    sleepDebtHours: 0.4,
    sleepDurationHours: 7.8,
    restingHeartRateBpm: 51,
    rhrBaselineBpm: 50,
    hrvMs: 72,
    hrvBaselineMs: 68,
    readinessStatus: 'optimal'
  },
  {
    id: 'dev_whoop',
    name: 'WHOOP 4.0 Strap',
    brand: 'whoop',
    type: 'strap',
    isConnected: false,
    batteryLevel: 94,
    currentHeartRateBpm: 132,
    dailyActiveCalories: 710,
    dailySteps: 8900,
    recoveryScore: 61,
    sleepScore: 68,
    sleepDebtHours: 1.4,
    sleepDurationHours: 6.1,
    restingHeartRateBpm: 58,
    rhrBaselineBpm: 50,
    hrvMs: 45,
    hrvBaselineMs: 65,
    readinessStatus: 'moderate'
  },
  {
    id: 'dev_polar',
    name: 'Polar H10 Chest Strap',
    brand: 'polar',
    type: 'strap',
    isConnected: false,
    batteryLevel: 98,
    currentHeartRateBpm: 142,
    restingHeartRateBpm: 54,
    hrvMs: 62,
    recoveryScore: 82
  },
  {
    id: 'dev_google',
    name: 'Google Health Connect / Fit',
    brand: 'google',
    type: 'platform',
    isConnected: false,
    sleepScore: 72,
    sleepDebtHours: 0.9,
    restingHeartRateBpm: 55,
    hrvMs: 56,
    recoveryScore: 75
  },
  {
    id: 'dev_fitbit',
    name: 'Fitbit Charge / Sense',
    brand: 'fitbit',
    type: 'smartwatch',
    isConnected: false,
    batteryLevel: 79,
    sleepScore: 60,
    sleepDebtHours: 1.7,
    sleepDurationHours: 5.6,
    restingHeartRateBpm: 61,
    rhrBaselineBpm: 52,
    hrvMs: 38,
    recoveryScore: 55,
    readinessStatus: 'fatigued'
  }
];

export function getUserProfile(): import('../types').UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveUserProfile(profile: import('../types').UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function getConnectedDevices(): import('../types').ConnectedDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONNECTED_DEVICES);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return INITIAL_DEVICES;
}

export function saveConnectedDevices(devices: import('../types').ConnectedDevice[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONNECTED_DEVICES, JSON.stringify(devices));
  } catch {
    // ignore
  }
}

export interface SyncQueueItem {
  id: string;
  type: 'workout' | 'measurement' | 'social_post' | 'cheer' | 'plan_purchase';
  action: 'create' | 'update';
  payload: unknown;
  timestamp: number;
}

function groundPersonalRecord(pr: PersonalRecord): PersonalRecord {
  const catalogDef = resolveCatalogExercise(pr.exerciseId || pr.exerciseName);
  return {
    ...pr,
    exerciseId: catalogDef.id,
    exerciseName: catalogDef.name
  };
}

// Initial seed Personal Records
const INITIAL_PRS: PersonalRecord[] = [
  {
    exerciseId: 'barbell_bench_press',
    exerciseName: 'barbell bench press',
    maxWeightKg: 140,
    maxWeightLbs: 308.6,
    reps: 5,
    estimatedOneRepMaxKg: 158,
    date: '2026-09-24'
  },
  {
    exerciseId: 'barbell_full_squat',
    exerciseName: 'barbell full squat',
    maxWeightKg: 180,
    maxWeightLbs: 396.8,
    reps: 4,
    estimatedOneRepMaxKg: 198,
    date: '2026-09-22'
  },
  {
    exerciseId: 'barbell_deadlift',
    exerciseName: 'barbell deadlift',
    maxWeightKg: 220,
    maxWeightLbs: 485.0,
    reps: 3,
    estimatedOneRepMaxKg: 236,
    date: '2026-09-18'
  },
  {
    exerciseId: 'barbell_standing_military_press',
    exerciseName: 'barbell standing military press',
    maxWeightKg: 85,
    maxWeightLbs: 187.4,
    reps: 5,
    estimatedOneRepMaxKg: 96,
    date: '2026-09-15'
  }
].map(groundPersonalRecord);

// Initial seed body measurements
const INITIAL_MEASUREMENTS: BodyMeasurement[] = [
  {
    id: 'm1',
    date: '2026-08-01',
    bodyweightKg: 82.5,
    bodyweightLbs: 181.9,
    chestCm: 104,
    armsCm: 39.5,
    waistCm: 84,
    thighsCm: 61,
    shouldersCm: 122,
    armsRelaxedCm: 36.5,
    armsPumpedCm: 39.5,
    forearmsRelaxedCm: 30.0,
    forearmsPumpedCm: 31.8,
    chestRelaxedCm: 101.5,
    chestPumpedCm: 104.0,
    shouldersRelaxedCm: 119.5,
    shouldersPumpedCm: 122.0,
    waistRelaxedCm: 84.0,
    waistTensedCm: 81.5,
    thighsRelaxedCm: 59.0,
    thighsPumpedCm: 61.0,
    calvesRelaxedCm: 37.0,
    calvesPumpedCm: 38.5,
    hipsRelaxedCm: 99.0,
    hipsTensedCm: 98.0,
    neckCm: 39.5,
    notes: 'Starting hypertrophy mesocycle'
  },
  {
    id: 'm2',
    date: '2026-08-25',
    bodyweightKg: 83.8,
    bodyweightLbs: 184.7,
    chestCm: 105.5,
    armsCm: 40.2,
    waistCm: 84.5,
    thighsCm: 62,
    shouldersCm: 123.5,
    armsRelaxedCm: 37.2,
    armsPumpedCm: 40.2,
    forearmsRelaxedCm: 30.5,
    forearmsPumpedCm: 32.4,
    chestRelaxedCm: 102.5,
    chestPumpedCm: 105.5,
    shouldersRelaxedCm: 121.0,
    shouldersPumpedCm: 123.5,
    waistRelaxedCm: 84.5,
    waistTensedCm: 82.0,
    thighsRelaxedCm: 60.0,
    thighsPumpedCm: 62.0,
    calvesRelaxedCm: 37.5,
    calvesPumpedCm: 39.0,
    hipsRelaxedCm: 100.0,
    hipsTensedCm: 99.0,
    neckCm: 40.0,
    notes: 'Surplus nutrition, feeling dense'
  },
  {
    id: 'm3',
    date: '2026-09-20',
    bodyweightKg: 84.6,
    bodyweightLbs: 186.5,
    chestCm: 107.0,
    armsCm: 41.0,
    waistCm: 83.8,
    thighsCm: 63.2,
    shouldersCm: 125.0,
    armsRelaxedCm: 38.0,
    armsPumpedCm: 41.0,
    forearmsRelaxedCm: 31.0,
    forearmsPumpedCm: 33.0,
    chestRelaxedCm: 103.5,
    chestPumpedCm: 107.0,
    shouldersRelaxedCm: 122.0,
    shouldersPumpedCm: 125.0,
    waistRelaxedCm: 83.8,
    waistTensedCm: 81.0,
    thighsRelaxedCm: 61.0,
    thighsPumpedCm: 63.2,
    calvesRelaxedCm: 38.0,
    calvesPumpedCm: 39.6,
    hipsRelaxedCm: 100.5,
    hipsTensedCm: 99.5,
    neckCm: 40.2,
    notes: 'Upper chest shelf and arm peak visibly thicker'
  }
];

function getRelativeDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function groundActiveWorkout(workout: ActiveWorkout): ActiveWorkout {
  if (!workout || !Array.isArray(workout.exercises)) return workout;
  return {
    ...workout,
    exercises: workout.exercises.map(ex => {
      const catalogDef = resolveCatalogExercise(ex.exerciseId || ex.id || ex.name, ex.targetMuscle, ex.equipment);
      return {
        ...ex,
        id: catalogDef.id,
        exerciseId: catalogDef.id,
        name: catalogDef.name,
        targetMuscle: catalogDef.primaryMuscle,
        primary_muscle: catalogDef.primary_muscle,
        rawPrimaryMuscle: catalogDef.rawPrimaryMuscle,
        secondaryMuscles: catalogDef.secondaryMuscles,
        equipment: catalogDef.equipment,
        cdn_url: catalogDef.cdn_url,
        cdnUrl: catalogDef.cdnUrl
      };
    })
  };
}

// Initial seed workout history
const RAW_INITIAL_WORKOUT_HISTORY: ActiveWorkout[] = [
  {
    id: 'hist_today',
    title: 'Push A (Chest & Delts Focus)',
    startTime: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    durationSeconds: 3720,
    totalVolumeKg: 11480,
    prCount: 1,
    isCompleted: true,
    date: getRelativeDateStr(0),
    exercises: [
      {
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        equipment: 'Barbell',
        sets: [
          { id: 'st1', setNumber: 1, type: 'warmup', weightKg: 60, weightLbs: 132.3, reps: 10, completed: true },
          { id: 'st2', setNumber: 2, type: 'normal', weightKg: 100, weightLbs: 220.5, reps: 8, completed: true, rpe: 8 },
          { id: 'st3', setNumber: 3, type: 'normal', weightKg: 125, weightLbs: 275.6, reps: 6, completed: true, rpe: 8.5 },
          { id: 'st4', setNumber: 4, type: 'normal', weightKg: 140, weightLbs: 308.6, reps: 5, completed: true, rpe: 9.5 }
        ],
        notes: 'Paused 1s on chest for maximum mechanical tension'
      },
      {
        exerciseId: 'incline_dumbbell_press',
        name: 'Incline Dumbbell Press (30°)',
        targetMuscle: 'Chest',
        equipment: 'Dumbbell',
        sets: [
          { id: 'st5', setNumber: 1, type: 'normal', weightKg: 42.5, weightLbs: 93.7, reps: 10, completed: true, rpe: 8.5 },
          { id: 'st6', setNumber: 2, type: 'normal', weightKg: 45, weightLbs: 99.2, reps: 8, completed: true, rpe: 9 }
        ]
      },
      {
        exerciseId: 'dumbbell_lateral_raise',
        name: 'Dumbbell Lateral Raise',
        targetMuscle: 'Shoulders',
        equipment: 'Dumbbell',
        sets: [
          { id: 'st7', setNumber: 1, type: 'normal', weightKg: 16, weightLbs: 35.3, reps: 15, completed: true, rpe: 9 },
          { id: 'st8', setNumber: 2, type: 'normal', weightKg: 16, weightLbs: 35.3, reps: 14, completed: true, rpe: 9.5 }
        ]
      }
    ]
  },
  {
    id: 'hist_1',
    title: 'Pull A (Lat Width & Upper Back)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    durationSeconds: 3420,
    totalVolumeKg: 9840,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(2),
    exercises: [
      {
        exerciseId: 'barbell_bent_row',
        name: 'Barbell Bent-Over Row (Pendlay / 45°)',
        targetMuscle: 'Back',
        equipment: 'Barbell',
        sets: [
          { id: 's1', setNumber: 1, type: 'warmup', weightKg: 60, weightLbs: 132.3, reps: 10, completed: true },
          { id: 's2', setNumber: 2, type: 'normal', weightKg: 95, weightLbs: 209.4, reps: 8, completed: true, rpe: 8 },
          { id: 's3', setNumber: 3, type: 'normal', weightKg: 105, weightLbs: 231.5, reps: 8, completed: true, rpe: 8.5 },
          { id: 's4', setNumber: 4, type: 'normal', weightKg: 110, weightLbs: 242.5, reps: 6, completed: true, rpe: 9 }
        ]
      },
      {
        exerciseId: 'lat_pulldown_wide',
        name: 'Wide-Grip Lat Pulldown',
        targetMuscle: 'Back',
        equipment: 'Cable',
        sets: [
          { id: 's5', setNumber: 1, type: 'normal', weightKg: 75, weightLbs: 165.3, reps: 10, completed: true, rpe: 8.5 },
          { id: 's6', setNumber: 2, type: 'normal', weightKg: 82.5, weightLbs: 181.9, reps: 8, completed: true, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'hist_2',
    title: 'Legs A (Quad Sweep & Calves)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
    durationSeconds: 4120,
    totalVolumeKg: 13450,
    prCount: 1,
    isCompleted: true,
    date: getRelativeDateStr(4),
    exercises: [
      {
        exerciseId: 'barbell_back_squat',
        name: 'Barbell Back Squat (High Bar / Low Bar)',
        targetMuscle: 'Quads',
        equipment: 'Barbell',
        sets: [
          { id: 's7', setNumber: 1, type: 'normal', weightKg: 140, weightLbs: 308.6, reps: 8, completed: true, rpe: 8 },
          { id: 's8', setNumber: 2, type: 'normal', weightKg: 165, weightLbs: 363.8, reps: 6, completed: true, rpe: 8.5 },
          { id: 's9', setNumber: 3, type: 'normal', weightKg: 180, weightLbs: 396.8, reps: 4, completed: true, rpe: 9.5 }
        ],
        notes: 'Explosive drive out of the hole'
      },
      {
        exerciseId: 'hack_squat_machine',
        name: 'Machine Hack Squat',
        targetMuscle: 'Quads',
        equipment: 'Machine',
        sets: [
          { id: 's10', setNumber: 1, type: 'normal', weightKg: 160, weightLbs: 352.7, reps: 10, completed: true, rpe: 8.5 },
          { id: 's11', setNumber: 2, type: 'normal', weightKg: 180, weightLbs: 396.8, reps: 8, completed: true, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'hist_3',
    title: 'Pull B (Deadlift & Posterior Chain)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
    durationSeconds: 3840,
    totalVolumeKg: 12200,
    prCount: 1,
    isCompleted: true,
    date: getRelativeDateStr(7),
    exercises: [
      {
        exerciseId: 'barbell_deadlift',
        name: 'Conventional Barbell Deadlift',
        targetMuscle: 'Back',
        equipment: 'Barbell',
        sets: [
          { id: 'd1', setNumber: 1, type: 'warmup', weightKg: 100, weightLbs: 220.5, reps: 8, completed: true },
          { id: 'd2', setNumber: 2, type: 'normal', weightKg: 160, weightLbs: 352.7, reps: 5, completed: true, rpe: 8 },
          { id: 'd3', setNumber: 3, type: 'normal', weightKg: 200, weightLbs: 440.9, reps: 4, completed: true, rpe: 8.5 },
          { id: 'd4', setNumber: 4, type: 'normal', weightKg: 220, weightLbs: 485.0, reps: 3, completed: true, rpe: 9.5 }
        ]
      }
    ]
  },
  {
    id: 'hist_4',
    title: 'Push B (Shoulders & Triceps Focus)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 10,
    durationSeconds: 3200,
    totalVolumeKg: 8900,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(10),
    exercises: [
      {
        exerciseId: 'overhead_barbell_press',
        name: 'Standing Overhead Barbell Press (OHP)',
        targetMuscle: 'Shoulders',
        equipment: 'Barbell',
        sets: [
          { id: 'o1', setNumber: 1, type: 'normal', weightKg: 65, weightLbs: 143.3, reps: 8, completed: true, rpe: 8 },
          { id: 'o2', setNumber: 2, type: 'normal', weightKg: 75, weightLbs: 165.3, reps: 6, completed: true, rpe: 8.5 },
          { id: 'o3', setNumber: 3, type: 'normal', weightKg: 85, weightLbs: 187.4, reps: 5, completed: true, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'hist_5',
    title: 'Legs B (Hamstrings & Adductors)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 13,
    durationSeconds: 3600,
    totalVolumeKg: 10800,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(13),
    exercises: [
      {
        exerciseId: 'romanian_deadlift_barbell',
        name: 'Barbell Romanian Deadlift (RDL)',
        targetMuscle: 'Hamstrings',
        equipment: 'Barbell',
        sets: [
          { id: 'rdl1', setNumber: 1, type: 'normal', weightKg: 120, weightLbs: 264.5, reps: 10, completed: true, rpe: 8 },
          { id: 'rdl2', setNumber: 2, type: 'normal', weightKg: 140, weightLbs: 308.6, reps: 8, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  // Additional historical sessions to provide rich progressive overload trajectories
  {
    id: 'hist_push_prev1',
    title: 'Push A (Progression Session 4)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
    durationSeconds: 3600,
    totalVolumeKg: 11100,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(7),
    exercises: [
      {
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        equipment: 'Barbell',
        sets: [
          { id: 'bp_p1_1', setNumber: 1, type: 'warmup', weightKg: 60, weightLbs: 132.3, reps: 10, completed: true },
          { id: 'bp_p1_2', setNumber: 2, type: 'normal', weightKg: 100, weightLbs: 220.5, reps: 8, completed: true, rpe: 8 },
          { id: 'bp_p1_3', setNumber: 3, type: 'normal', weightKg: 122.5, weightLbs: 270.0, reps: 6, completed: true, rpe: 8.5 },
          { id: 'bp_p1_4', setNumber: 4, type: 'normal', weightKg: 135, weightLbs: 297.6, reps: 5, completed: true, rpe: 9.0 }
        ]
      },
      {
        exerciseId: 'incline_dumbbell_press',
        name: 'Incline Dumbbell Press (30°)',
        targetMuscle: 'Chest',
        equipment: 'Dumbbell',
        sets: [
          { id: 'idb_p1_1', setNumber: 1, type: 'normal', weightKg: 40, weightLbs: 88.2, reps: 10, completed: true, rpe: 8.5 },
          { id: 'idb_p1_2', setNumber: 2, type: 'normal', weightKg: 42.5, weightLbs: 93.7, reps: 8, completed: true, rpe: 9.0 }
        ]
      }
    ]
  },
  {
    id: 'hist_push_prev2',
    title: 'Push A (Progression Session 3)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 14,
    durationSeconds: 3500,
    totalVolumeKg: 10700,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(14),
    exercises: [
      {
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        equipment: 'Barbell',
        sets: [
          { id: 'bp_p2_1', setNumber: 1, type: 'warmup', weightKg: 60, weightLbs: 132.3, reps: 10, completed: true },
          { id: 'bp_p2_2', setNumber: 2, type: 'normal', weightKg: 100, weightLbs: 220.5, reps: 8, completed: true, rpe: 8 },
          { id: 'bp_p2_3', setNumber: 3, type: 'normal', weightKg: 120, weightLbs: 264.5, reps: 6, completed: true, rpe: 8.5 },
          { id: 'bp_p2_4', setNumber: 4, type: 'normal', weightKg: 132.5, weightLbs: 292.1, reps: 5, completed: true, rpe: 8.5 }
        ]
      },
      {
        exerciseId: 'incline_dumbbell_press',
        name: 'Incline Dumbbell Press (30°)',
        targetMuscle: 'Chest',
        equipment: 'Dumbbell',
        sets: [
          { id: 'idb_p2_1', setNumber: 1, type: 'normal', weightKg: 40, weightLbs: 88.2, reps: 10, completed: true, rpe: 8 },
          { id: 'idb_p2_2', setNumber: 2, type: 'normal', weightKg: 40, weightLbs: 88.2, reps: 9, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'hist_push_prev3',
    title: 'Push A (Progression Session 2)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 21,
    durationSeconds: 3450,
    totalVolumeKg: 10400,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(21),
    exercises: [
      {
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        equipment: 'Barbell',
        sets: [
          { id: 'bp_p3_1', setNumber: 1, type: 'warmup', weightKg: 60, weightLbs: 132.3, reps: 10, completed: true },
          { id: 'bp_p3_2', setNumber: 2, type: 'normal', weightKg: 95, weightLbs: 209.4, reps: 8, completed: true, rpe: 8 },
          { id: 'bp_p3_3', setNumber: 3, type: 'normal', weightKg: 115, weightLbs: 253.5, reps: 6, completed: true, rpe: 8.5 },
          { id: 'bp_p3_4', setNumber: 4, type: 'normal', weightKg: 127.5, weightLbs: 281.1, reps: 6, completed: true, rpe: 9.0 }
        ]
      }
    ]
  },
  {
    id: 'hist_push_prev4',
    title: 'Push A (Progression Session 1)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 28,
    durationSeconds: 3400,
    totalVolumeKg: 10100,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(28),
    exercises: [
      {
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        equipment: 'Barbell',
        sets: [
          { id: 'bp_p4_1', setNumber: 1, type: 'warmup', weightKg: 60, weightLbs: 132.3, reps: 10, completed: true },
          { id: 'bp_p4_2', setNumber: 2, type: 'normal', weightKg: 95, weightLbs: 209.4, reps: 8, completed: true, rpe: 8 },
          { id: 'bp_p4_3', setNumber: 3, type: 'normal', weightKg: 110, weightLbs: 242.5, reps: 6, completed: true, rpe: 8.5 },
          { id: 'bp_p4_4', setNumber: 4, type: 'normal', weightKg: 125, weightLbs: 275.6, reps: 6, completed: true, rpe: 9.5 }
        ]
      }
    ]
  },
  {
    id: 'hist_legs_prev1',
    title: 'Legs A (Progression Session 2)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 11,
    durationSeconds: 4000,
    totalVolumeKg: 12900,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(11),
    exercises: [
      {
        exerciseId: 'barbell_back_squat',
        name: 'Barbell Back Squat (High Bar / Low Bar)',
        targetMuscle: 'Quads',
        equipment: 'Barbell',
        sets: [
          { id: 'sq_p1_1', setNumber: 1, type: 'normal', weightKg: 135, weightLbs: 297.6, reps: 8, completed: true, rpe: 8 },
          { id: 'sq_p1_2', setNumber: 2, type: 'normal', weightKg: 160, weightLbs: 352.7, reps: 6, completed: true, rpe: 8.5 },
          { id: 'sq_p1_3', setNumber: 3, type: 'normal', weightKg: 175, weightLbs: 385.8, reps: 4, completed: true, rpe: 9.0 }
        ]
      }
    ]
  },
  {
    id: 'hist_legs_prev2',
    title: 'Legs A (Progression Session 1)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 18,
    durationSeconds: 3900,
    totalVolumeKg: 12300,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(18),
    exercises: [
      {
        exerciseId: 'barbell_back_squat',
        name: 'Barbell Back Squat (High Bar / Low Bar)',
        targetMuscle: 'Quads',
        equipment: 'Barbell',
        sets: [
          { id: 'sq_p2_1', setNumber: 1, type: 'normal', weightKg: 130, weightLbs: 286.6, reps: 8, completed: true, rpe: 8 },
          { id: 'sq_p2_2', setNumber: 2, type: 'normal', weightKg: 155, weightLbs: 341.7, reps: 6, completed: true, rpe: 8.5 },
          { id: 'sq_p2_3', setNumber: 3, type: 'normal', weightKg: 170, weightLbs: 374.8, reps: 5, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'hist_pull_prev1',
    title: 'Pull B (Progression Session 2)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 14,
    durationSeconds: 3700,
    totalVolumeKg: 11800,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(14),
    exercises: [
      {
        exerciseId: 'barbell_deadlift',
        name: 'Conventional Barbell Deadlift',
        targetMuscle: 'Back',
        equipment: 'Barbell',
        sets: [
          { id: 'dl_p1_1', setNumber: 1, type: 'warmup', weightKg: 100, weightLbs: 220.5, reps: 8, completed: true },
          { id: 'dl_p1_2', setNumber: 2, type: 'normal', weightKg: 160, weightLbs: 352.7, reps: 5, completed: true, rpe: 8 },
          { id: 'dl_p1_3', setNumber: 3, type: 'normal', weightKg: 195, weightLbs: 429.9, reps: 4, completed: true, rpe: 8.5 },
          { id: 'dl_p1_4', setNumber: 4, type: 'normal', weightKg: 215, weightLbs: 474.0, reps: 3, completed: true, rpe: 9.0 }
        ]
      },
      {
        exerciseId: 'barbell_bent_row',
        name: 'Barbell Bent-Over Row (Pendlay / 45°)',
        targetMuscle: 'Back',
        equipment: 'Barbell',
        sets: [
          { id: 'br_p1_1', setNumber: 1, type: 'normal', weightKg: 90, weightLbs: 198.4, reps: 8, completed: true, rpe: 8 },
          { id: 'br_p1_2', setNumber: 2, type: 'normal', weightKg: 100, weightLbs: 220.5, reps: 7, completed: true, rpe: 8.5 },
          { id: 'br_p1_3', setNumber: 3, type: 'normal', weightKg: 105, weightLbs: 231.5, reps: 6, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'hist_pull_prev2',
    title: 'Pull B (Progression Session 1)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 21,
    durationSeconds: 3600,
    totalVolumeKg: 11200,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(21),
    exercises: [
      {
        exerciseId: 'barbell_deadlift',
        name: 'Conventional Barbell Deadlift',
        targetMuscle: 'Back',
        equipment: 'Barbell',
        sets: [
          { id: 'dl_p2_1', setNumber: 1, type: 'warmup', weightKg: 100, weightLbs: 220.5, reps: 8, completed: true },
          { id: 'dl_p2_2', setNumber: 2, type: 'normal', weightKg: 150, weightLbs: 330.7, reps: 5, completed: true, rpe: 8 },
          { id: 'dl_p2_3', setNumber: 3, type: 'normal', weightKg: 190, weightLbs: 418.9, reps: 4, completed: true, rpe: 8.5 },
          { id: 'dl_p2_4', setNumber: 4, type: 'normal', weightKg: 205, weightLbs: 451.9, reps: 4, completed: true, rpe: 9.0 }
        ]
      }
    ]
  },
  {
    id: 'hist_ohp_prev1',
    title: 'Push B (OHP Progression 2)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 17,
    durationSeconds: 3100,
    totalVolumeKg: 8500,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(17),
    exercises: [
      {
        exerciseId: 'overhead_barbell_press',
        name: 'Standing Overhead Barbell Press (OHP)',
        targetMuscle: 'Shoulders',
        equipment: 'Barbell',
        sets: [
          { id: 'o_p1_1', setNumber: 1, type: 'normal', weightKg: 65, weightLbs: 143.3, reps: 8, completed: true, rpe: 8 },
          { id: 'o_p1_2', setNumber: 2, type: 'normal', weightKg: 75, weightLbs: 165.3, reps: 6, completed: true, rpe: 8.5 },
          { id: 'o_p1_3', setNumber: 3, type: 'normal', weightKg: 82.5, weightLbs: 181.9, reps: 5, completed: true, rpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'hist_ohp_prev2',
    title: 'Push B (OHP Progression 1)',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 24,
    durationSeconds: 3000,
    totalVolumeKg: 8200,
    prCount: 0,
    isCompleted: true,
    date: getRelativeDateStr(24),
    exercises: [
      {
        exerciseId: 'barbell_standing_military_press',
        name: 'barbell standing military press',
        targetMuscle: 'Shoulders',
        equipment: 'Barbell',
        sets: [
          { id: 'o_p2_1', setNumber: 1, type: 'normal', weightKg: 60, weightLbs: 132.3, reps: 8, completed: true, rpe: 8 },
          { id: 'o_p2_2', setNumber: 2, type: 'normal', weightKg: 70, weightLbs: 154.3, reps: 6, completed: true, rpe: 8.5 },
          { id: 'o_p2_3', setNumber: 3, type: 'normal', weightKg: 80, weightLbs: 176.4, reps: 6, completed: true, rpe: 9.0 }
        ]
      }
    ]
  }
];

const INITIAL_WORKOUT_HISTORY: ActiveWorkout[] = RAW_INITIAL_WORKOUT_HISTORY.map(groundActiveWorkout);

export function getActivePlan(): WorkoutPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && !REMOVED_MUSCLE_BUILDING_PLAN_IDS.has(parsed.id) && parsed.category !== 'muscle_building') {
        const matchingPreset = PRESET_WORKOUT_PLANS.find(p => p.id === parsed.id);
        if (matchingPreset && parsed.routines?.some((r: any) => /Workout [ABC]|Routine [AB]/i.test(r.dayName))) {
          const fresh = groundWorkoutPlan(matchingPreset);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(fresh));
          return fresh;
        }
        return groundWorkoutPlan(parsed);
      }
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(PRESET_WORKOUT_PLANS[0]));
      return PRESET_WORKOUT_PLANS[0];
    }
  } catch {
    // fallback
  }
  return PRESET_WORKOUT_PLANS[0];
}

export function setActivePlan(plan: WorkoutPlan) {
  try {
    const grounded = groundWorkoutPlan(plan);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(grounded));
    queueSyncItem('plan', 'update', grounded);
  } catch {
    // storage error
  }
}

export function getWorkoutHistory(): ActiveWorkout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    if (raw) {
      const parsed: ActiveWorkout[] = JSON.parse(raw);
      if (parsed && Array.isArray(parsed)) {
        const groundedParsed = parsed.map(groundActiveWorkout);
        // If stored history is smaller than seed, merge missing initial workouts to preserve progressions
        if (groundedParsed.length < INITIAL_WORKOUT_HISTORY.length) {
          const existingIds = new Set(groundedParsed.map(w => w.id));
          const missing = INITIAL_WORKOUT_HISTORY.filter(w => !existingIds.has(w.id));
          return [...groundedParsed, ...missing];
        }
        return groundedParsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_WORKOUT_HISTORY;
}

export function saveCompletedWorkout(rawWorkout: ActiveWorkout): { prCount: number } {
  const workout = groundActiveWorkout(rawWorkout);
  const history = getWorkoutHistory();
  const prs = getPersonalRecords();
  let prBrokenCount = 0;
  const updatedPrs = [...prs];

  // Check and update PRs
  workout.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      if (s.completed && s.weightKg > 0 && s.reps > 0) {
        const est1RM = Math.round(s.weightKg * (1 + s.reps / 30));
        const existingIdx = updatedPrs.findIndex(p => p.exerciseId === ex.exerciseId);

        if (existingIdx >= 0) {
          const current = updatedPrs[existingIdx];
          if (s.weightKg > current.maxWeightKg || est1RM > current.estimatedOneRepMaxKg) {
            prBrokenCount++;
            updatedPrs[existingIdx] = {
              exerciseId: ex.exerciseId,
              exerciseName: ex.name,
              maxWeightKg: Math.max(s.weightKg, current.maxWeightKg),
              maxWeightLbs: Math.round(Math.max(s.weightKg, current.maxWeightKg) * 2.20462 * 10) / 10,
              reps: s.reps,
              estimatedOneRepMaxKg: Math.max(est1RM, current.estimatedOneRepMaxKg),
              date: workout.date
            };
          }
        } else {
          prBrokenCount++;
          updatedPrs.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.name,
            maxWeightKg: s.weightKg,
            maxWeightLbs: Math.round(s.weightKg * 2.20462 * 10) / 10,
            reps: s.reps,
            estimatedOneRepMaxKg: est1RM,
            date: workout.date
          });
        }
      }
    });
  });

  workout.prCount = prBrokenCount;
  const newHistory = [workout, ...history];

  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(newHistory));
    localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(updatedPrs));
    localStorage.removeItem(STORAGE_KEYS.DRAFT_WORKOUT);
    queueSyncItem('workout', 'create', workout);
  } catch {
    // ignore
  }

  return { prCount: prBrokenCount };
}

export function saveWorkoutHistoryList(history: ActiveWorkout[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function resetWorkoutSessionCompletion(planTitle: string, routineNames: string[] = []): ActiveWorkout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    const history: ActiveWorkout[] = raw ? JSON.parse(raw) : getWorkoutHistory();
    const planTitleLower = (planTitle || '').toLowerCase().trim();
    const routineNamesLower = routineNames.map(r => r.toLowerCase().trim());
    const todayStr = new Date().toISOString().split('T')[0];

    const updated = history.filter(w => {
      if (!w.isCompleted) return true;
      const wTitle = (w.title || '').toLowerCase().trim();
      const matchesRoutine = routineNamesLower.some(r => wTitle.includes(r) || r.includes(wTitle));
      const matchesPlan = wTitle.includes(planTitleLower) || planTitleLower.includes(wTitle);
      const isToday = w.date === todayStr;

      if (matchesRoutine || matchesPlan || isToday) {
        return false;
      }
      return true;
    });

    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(updated));
    return updated;
  } catch {
    return getWorkoutHistory();
  }
}

export function getDraftWorkout(): ActiveWorkout | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFT_WORKOUT);
    if (raw) return groundActiveWorkout(JSON.parse(raw));
  } catch {
    // ignore
  }
  return null;
}

export function saveDraftWorkout(workout: ActiveWorkout | null) {
  try {
    if (workout) {
      localStorage.setItem(STORAGE_KEYS.DRAFT_WORKOUT, JSON.stringify(groundActiveWorkout(workout)));
    } else {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_WORKOUT);
    }
  } catch {
    // ignore
  }
}

export function getPersonalRecords(): PersonalRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(groundPersonalRecord);
    }
  } catch {
    // fallback
  }
  return INITIAL_PRS;
}

export function getBodyMeasurements(): BodyMeasurement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_MEASUREMENTS;
}

export function addBodyMeasurement(measurement: BodyMeasurement) {
  const current = getBodyMeasurements();
  const updated = [measurement, ...current];
  try {
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(updated));
    queueSyncItem('measurement', 'create', measurement);
  } catch {
    // ignore
  }
  return updated;
}

export function getSocialPosts(): SocialPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOCIAL_POSTS);
    if (raw) {
      const parsed: SocialPost[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map(p => p.id));
        const missingInitial = INITIAL_SOCIAL_POSTS.filter(p => !existingIds.has(p.id));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          saveSocialPosts(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_SOCIAL_POSTS;
}

export function saveSocialPosts(posts: SocialPost[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SOCIAL_POSTS, JSON.stringify(posts));
  } catch {
    // ignore
  }
}

export function addSocialPost(post: SocialPost) {
  const current = getSocialPosts();
  const updated = [post, ...current];
  saveSocialPosts(updated);
  queueSyncItem('social_post', 'create', post);
  return updated;
}

export function getPurchasedPlanIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASED_PLANS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function purchasePlan(planId: string): string[] {
  const current = getPurchasedPlanIds();
  if (!current.includes(planId)) {
    const updated = [...current, planId];
    try {
      localStorage.setItem(STORAGE_KEYS.PURCHASED_PLANS, JSON.stringify(updated));
      queueSyncItem('plan_purchase', 'create', { planId });
    } catch {
      // ignore
    }
    return updated;
  }
  return current;
}

export function getUserSubscription(): UserSubscription {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (raw) {
      const parsed: UserSubscription = JSON.parse(raw);
      if (parsed.cancelAtPeriodEnd && parsed.downgradeEffectiveDate) {
        const expiryTime = new Date(parsed.downgradeEffectiveDate).getTime();
        if (!isNaN(expiryTime) && Date.now() >= expiryTime) {
          const expired: UserSubscription = { isPro: false, plan: 'free' };
          localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(expired));
          return expired;
        }
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return { isPro: false, plan: 'free' };
}

export function setUserSubscription(sub: UserSubscription) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
    queueSyncItem('subscription', 'update', sub);
  } catch {
    // ignore
  }
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      const validThemes: AppTheme[] = ['dark', 'gray', 'light', 'amoled'];
      const resolvedTheme: AppTheme = validThemes.includes(parsed.theme) ? parsed.theme : 'dark';
      return {
        weightUnit: 'kg',
        soundEnabled: true,
        defaultRestSeconds: 90,
        ...parsed,
        theme: resolvedTheme
      };
    }
  } catch {
    // fallback
  }
  return {
    weightUnit: 'kg',
    theme: 'dark',
    soundEnabled: true,
    defaultRestSeconds: 90
  };
}

export function saveAppSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// OFFLINE QUEUE & SYNC ENGINE
export function getSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function queueSyncItem(type: string, action: 'create' | 'update', payload: unknown) {
  const queue = getSyncQueue();
  const item: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: type as SyncQueueItem['type'],
    action,
    payload,
    timestamp: Date.now()
  };
  const updated = [...queue, item];
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getLastSyncedAt(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (raw) return parseInt(raw, 10);
  } catch {
    // fallback
  }
  return Date.now() - 1000 * 60 * 12; // 12 mins ago default
}

export async function flushSyncQueue(): Promise<{ syncedCount: number; timestamp: number }> {
  // Simulate cloud sync delay
  await new Promise(resolve => setTimeout(resolve, 800));
  const queue = getSyncQueue();
  const count = queue.length;
  const now = Date.now();
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
  } catch {
    // ignore
  }
  return { syncedCount: count, timestamp: now };
}

// --------------------------------------------------------------------------
// CUSTOM UNIQUE EXERCISES STORAGE & COMMUNITY SHARING
// --------------------------------------------------------------------------

export const MAX_FREE_CUSTOM_EXERCISES = 5;

export function getCustomExerciseLimit(isPro?: boolean): number {
  return isPro ? Infinity : MAX_FREE_CUSTOM_EXERCISES;
}

export function canAddCustomExercise(currentCount: number, isPro?: boolean): boolean {
  if (isPro) return true;
  return currentCount < MAX_FREE_CUSTOM_EXERCISES;
}

export function getRemainingCustomExercises(currentCount: number, isPro?: boolean): number {
  if (isPro) return Infinity;
  return Math.max(0, MAX_FREE_CUSTOM_EXERCISES - currentCount);
}

let inMemoryCustomExercises: ExerciseDefinition[] | null = null;

export function getCustomExercises(): ExerciseDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = parsed.map((e: ExerciseDefinition) => ({ ...e, isCustom: true }));
        inMemoryCustomExercises = normalized;
        return normalized;
      }
    }
  } catch (e) {
    console.error('Failed to parse custom exercises:', e);
  }
  return inMemoryCustomExercises || [];
}

function persistCustomExercisesToStorage(exercises: ExerciseDefinition[]) {
  inMemoryCustomExercises = exercises;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(exercises));
  } catch {
    // QuotaExceededError fallback: replace oversized data URLs with lightweight model photos so exercise metadata is always saved
    try {
      const compact = exercises.map(ex => {
        const fallbackPhoto = getExerciseModelPhoto(ex.id, ex.primaryMuscle);
        const safeImg = ex.imageUrl && ex.imageUrl.length > 120000 ? fallbackPhoto : (ex.imageUrl || fallbackPhoto);
        const safeImages = (ex.images || [safeImg]).map(img => (img.length > 120000 ? fallbackPhoto : img));
        return {
          ...ex,
          imageUrl: safeImg,
          images: safeImages
        };
      });
      inMemoryCustomExercises = compact;
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(compact));
    } catch (err) {
      console.error('Failed to persist compact custom exercises:', err);
    }
  }
  syncExerciseDatabase(inMemoryCustomExercises);
}

export function saveCustomExercise(exercise: ExerciseDefinition, isPro?: boolean): { success: boolean; exercises: ExerciseDefinition[]; error?: string } {
  const current = getCustomExercises();
  const normalizedExercise: ExerciseDefinition = {
    ...exercise,
    isCustom: true
  };
  const existingIdx = current.findIndex(
    e => e.id === normalizedExercise.id || e.name.trim().toLowerCase() === normalizedExercise.name.trim().toLowerCase()
  );

  // If adding a new custom exercise (not updating existing), enforce the 3 custom exercises limit for free users
  if (existingIdx === -1 && !isPro && current.length >= MAX_FREE_CUSTOM_EXERCISES) {
    return {
      success: false,
      exercises: current,
      error: `Free lifters can add up to ${MAX_FREE_CUSTOM_EXERCISES} custom exercises. Upgrade to GymPax Pro to unlock unlimited custom exercises!`
    };
  }

  let updated: ExerciseDefinition[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = normalizedExercise;
  } else {
    updated = [normalizedExercise, ...current];
  }

  persistCustomExercisesToStorage(updated);
  queueSyncItem('custom_exercise', existingIdx >= 0 ? 'update' : 'create', {
    id: normalizedExercise.id,
    name: normalizedExercise.name,
    primaryMuscle: normalizedExercise.primaryMuscle,
    equipment: normalizedExercise.equipment
  });
  return { success: true, exercises: inMemoryCustomExercises || updated };
}

export function deleteCustomExercise(exerciseId: string): ExerciseDefinition[] {
  const current = getCustomExercises();
  const updated = current.filter(e => e.id !== exerciseId);
  persistCustomExercisesToStorage(updated);
  return inMemoryCustomExercises || updated;
}

export function getAllCombinedExercises(): ExerciseDefinition[] {
  const custom = getCustomExercises();
  const customIds = new Set(custom.map(c => c.id));
  return [
    ...custom,
    ...BASE_EXERCISE_DATABASE.filter(b => !customIds.has(b.id))
  ];
}

export function shareCustomExerciseToCommunity(
  exercise: ExerciseDefinition,
  authorName?: string,
  authorBadge: 'PRO' | 'LIFTER' | 'BEAST' = 'PRO',
  userRank?: string,
  commentary?: string
): SocialPost {
  const newPost: SocialPost = {
    id: `post_ce_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: 'u_me',
    userName: authorName || 'You (Athlete)',
    userAvatarSeed: 'my_avatar',
    userBadge: authorBadge,
    userRank: userRank || 'Athlete',
    workoutTitle: `Created New Exercise: ${exercise.name}`,
    durationMinutes: 0,
    volumeKg: 0,
    volumeLbs: 0,
    topSet: `${exercise.primaryMuscle} · ${exercise.equipment} (${exercise.tier})`,
    timestamp: Date.now(),
    likes: 1,
    isLikedByMe: true,
    cheers: [
      { id: `ch_${Date.now()}`, userId: 'u_me', userName: 'You', emoji: '🔥', label: 'Great Lift Idea' }
    ],
    comments: commentary ? [
      {
        id: `cm_${Date.now()}`,
        userId: 'u_me',
        userName: authorName || 'You',
        avatarSeed: 'my_avatar',
        text: commentary,
        timestamp: Date.now()
      }
    ] : [],
    postType: 'custom_exercise',
    sharedExercise: exercise
  };

  const currentPosts = getSocialPosts();
  const updatedPosts = [newPost, ...currentPosts];
  saveSocialPosts(updatedPosts);
  return newPost;
}

// CUSTOM WORKOUT SESSIONS & PERSONAL PROGRAMS STORAGE
const LEGACY_EXERCISE_ID_MAP: Record<string, string> = {
  cable_tricep_pushdown: 'triceps_rope_pushdown',
  lat_pulldown: 'lat_pulldown_wide',
  barbell_bent_over_row: 'barbell_bent_row',
  cable_face_pull: 'face_pull_rope',
  barbell_curl: 'standing_barbell_curl',
  romanian_deadlift: 'romanian_deadlift_barbell'
};

const DEFAULT_BUILDER_DAY_NAMES = new Set([
  'Day 1: Upper Body Focus',
  'Day 2: Lower Body & Core',
  'Day 3: Back & Pull',
  'Day 1: Custom Training',
  'Day 2: Custom Training',
  'Day 3: Custom Training',
  'Day 4: Custom Training',
  'Day 5: Custom Training',
  'Day 6: Custom Training',
  'Day 7: Custom Training'
]);

function getMatchingTemplateExercisesForName(programName: string): { focus: string; exercises: { exerciseId: string; defaultSets: number; targetReps: string; targetRpe: number }[] } | null {
  const lower = programName.toLowerCase();
  if (lower.includes('leg') || lower.includes('lower') || lower.includes('quad') || lower.includes('glute') || lower.includes('hamstring') || lower.includes('squat')) {
    return {
      focus: 'Quads, Hamstrings, Glutes, Calves',
      exercises: [
        { exerciseId: 'barbell_full_squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
        { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
        { exerciseId: 'lever_leg_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
        { exerciseId: 'lever_seated_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
        { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
      ]
    };
  }
  if (lower.includes('back') || lower.includes('pull') || lower.includes('lat') || lower.includes('row')) {
    return {
      focus: 'Back, Lats, Biceps',
      exercises: [
        { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
        { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
        { exerciseId: 'cable_seated_row', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
        { exerciseId: 'cable_rope_rear_delt_row', defaultSets: 3, targetReps: '15', targetRpe: 9 },
        { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
      ]
    };
  }
  if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep')) {
    return {
      focus: 'Biceps, Triceps, Forearms',
      exercises: [
        { exerciseId: 'barbell_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
        { exerciseId: 'ez_barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
        { exerciseId: 'dumbbell_incline_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
        { exerciseId: 'cable_pushdown_with_rope_attachment', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
        { exerciseId: 'cable_hammer_curl_with_rope', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
      ]
    };
  }
  if (lower.includes('chest') || lower.includes('push') || lower.includes('pec') || lower.includes('bench')) {
    return {
      focus: 'Chest, Shoulders, Triceps',
      exercises: [
        { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
        { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
        { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
        { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
        { exerciseId: 'cable_pushdown_with_rope_attachment', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
      ]
    };
  }
  if (lower.includes('shoulder') || lower.includes('delt')) {
    return {
      focus: 'Shoulders, Delts, Traps',
      exercises: [
        { exerciseId: 'barbell_standing_military_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
        { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
        { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
        { exerciseId: 'cable_rope_rear_delt_row', defaultSets: 4, targetReps: '15', targetRpe: 9 }
      ]
    };
  }
  if (lower.includes('ab') || lower.includes('core')) {
    return {
      focus: 'Abs & Core',
      exercises: [
        { exerciseId: 'hanging_leg_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
        { exerciseId: 'cable_kneeling_crunch', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
      ]
    };
  }
  if (lower.includes('full body') || lower.includes('total body')) {
    return {
      focus: 'Chest, Back, Quads, Shoulders',
      exercises: [
        { exerciseId: 'barbell_full_squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
        { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
        { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
        { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
      ]
    };
  }
  return null;
}

export function normalizeCustomWorkoutProgram(program: CustomWorkoutProgram): CustomWorkoutProgram {
  const allExercises = getAllCombinedExercises();
  const rawRoutines = Array.isArray(program.routines) && program.routines.length > 0 ? program.routines : [];

  const normalizedRoutines = rawRoutines.map((rt, idx) => {
    let mappedExercises: import('../types').DailyWorkoutRoutine['exercises'] = (rt.exercises || []).map(ex => {
      const mappedId = LEGACY_EXERCISE_ID_MAP[ex.exerciseId] || ex.exerciseId;
      const resolved = resolveCatalogExercise(mappedId);
      return {
        ...ex,
        id: resolved.id,
        exerciseId: resolved.id,
        name: resolved.name,
        primary_muscle: resolved.primary_muscle || resolved.rawPrimaryMuscle || resolved.primaryMuscle,
        cdn_url: resolved.cdn_url || resolved.cdnUrl || '',
        cdnUrl: resolved.cdnUrl || resolved.cdn_url || ''
      };
    });

    // Check if this routine still has the untouched 2-exercise builder placeholder while program name specifies a different workout
    const isUntouchedDay1Placeholder =
      idx === 0 &&
      mappedExercises.length === 2 &&
      mappedExercises[0]?.exerciseId === 'barbell_bench_press' &&
      mappedExercises[1]?.exerciseId === 'dumbbell_lateral_raise';

    const templateMatch = getMatchingTemplateExercisesForName(program.name || '');
    if (isUntouchedDay1Placeholder && templateMatch) {
      mappedExercises = groundRoutineExercises({ dayName: '', focus: '', exercises: templateMatch.exercises }).exercises;
    }

    // Compute actual muscle focus from the routine's exercises
    const muscleSet = new Set<string>();
    mappedExercises.forEach(item => {
      const def = allExercises.find(e => e.id === item.exerciseId) || resolveCatalogExercise(item.exerciseId);
      if (def?.primaryMuscle) {
        muscleSet.add(def.primaryMuscle);
      }
    });
    const computedFocus = Array.from(muscleSet).join(', ') || rt.focus || 'Full Body';

    let resolvedDayName = rt.dayName || `Day ${idx + 1}`;
    if (DEFAULT_BUILDER_DAY_NAMES.has(resolvedDayName)) {
      if (rawRoutines.length === 1) {
        resolvedDayName = `${program.name} (${computedFocus})`;
      } else {
        resolvedDayName = `Day ${idx + 1}: ${computedFocus} Focus`;
      }
    }

    return groundRoutineExercises({
      ...rt,
      dayName: resolvedDayName,
      focus: computedFocus,
      exercises: mappedExercises
    });
  });

  return {
    ...program,
    daysCount: normalizedRoutines.length || program.daysCount || 1,
    routines: normalizedRoutines
  };
}

const RAW_INITIAL_CUSTOM_WORKOUTS: CustomWorkoutProgram[] = [
  {
    id: 'cwp_upper_hypertrophy',
    name: 'Upper Body Hypertrophy',
    daysCount: 2,
    createdAt: Date.now() - 86400000 * 3,
    routines: [
      {
        dayName: 'Upper Body Hypertrophy — Day 1: Push (Chest, Delts & Triceps)',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'cable_pushdown_with_rope_attachment', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Upper Body Hypertrophy — Day 2: Pull (Back & Biceps)',
        focus: 'Back, Shoulders, Biceps',
        exercises: [
          { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'cable_rope_rear_delt_row', defaultSets: 3, targetReps: '15', targetRpe: 8 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'pers_plan_3day_hybrid',
    name: '3-Day Personalized Foundation Split',
    daysCount: 3,
    createdAt: Date.now() - 86400000 * 4,
    routines: [
      {
        dayName: 'Day 1: Full Body Heavy Push & Quads',
        focus: 'Chest, Delts, Quads',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_full_squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_with_rope_attachment', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Full Body Heavy Pull & Hamstrings',
        focus: 'Lats, Rhomboids, Hamstrings, Biceps',
        exercises: [
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'cable_rope_rear_delt_row', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Hypertrophy Overload & Weakpoint Specialization',
        focus: 'Upper Body & Arms',
        exercises: [
          { exerciseId: 'barbell_standing_military_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'pers_plan_4day_upper_lower',
    name: '4-Day Personalized Upper / Lower Split',
    daysCount: 4,
    createdAt: Date.now() - 86400000 * 5,
    routines: (PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_upper_lower_4day') || PRESET_WORKOUT_PLANS[0]).routines
  },
  {
    id: 'pers_plan_5day_vtaper',
    name: '5-Day Personalized V-Taper Protocol',
    daysCount: 5,
    createdAt: Date.now() - 86400000 * 6,
    routines: (PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_fullbody_5day_dup') || PRESET_WORKOUT_PLANS[0]).routines
  }
];

export const INITIAL_CUSTOM_WORKOUTS: CustomWorkoutProgram[] = RAW_INITIAL_CUSTOM_WORKOUTS.map(normalizeCustomWorkoutProgram);

export function getDeletedPersonalizedPlanIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_PERSONALIZED_PLANS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function addDeletedPersonalizedPlanIdentifiers(idsOrTitles: string[]) {
  try {
    const current = new Set(getDeletedPersonalizedPlanIds());
    idsOrTitles.forEach(item => {
      if (item && item.trim()) {
        current.add(item.trim());
        current.add(item.trim().toLowerCase());
      }
    });
    localStorage.setItem(STORAGE_KEYS.DELETED_PERSONALIZED_PLANS, JSON.stringify(Array.from(current)));
  } catch {
    // ignore
  }
}

function removeDeletedPersonalizedPlanIdentifiers(idsOrTitles: string[]) {
  try {
    const removeSet = new Set(
      idsOrTitles
        .filter(Boolean)
        .flatMap(s => [s.trim(), s.trim().toLowerCase()])
    );
    const updated = getDeletedPersonalizedPlanIds().filter(x => !removeSet.has(x));
    localStorage.setItem(STORAGE_KEYS.DELETED_PERSONALIZED_PLANS, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getStoredPersonalizedPlans(): WorkoutPlan[] {
  const deletedSet = new Set(getDeletedPersonalizedPlanIds());
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONALIZED_PLANS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (p: WorkoutPlan) =>
              p &&
              !deletedSet.has(p.id) &&
              !deletedSet.has((p.title || '').trim().toLowerCase())
          )
          .map(groundWorkoutPlan);
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export const MAX_FREE_PERSONALIZED_PLANS = 5;
export const MAX_FREE_CUSTOM_WORKOUTS = 5;

export function getPersonalProgramsTotalCount(): number {
  const customPrograms = getCustomWorkoutPrograms();
  const storedPlans = getStoredPersonalizedPlans();
  const seenKeys = new Set<string>();
  let count = 0;

  for (const prog of customPrograms) {
    const idKey = (prog.id || '').trim().toLowerCase();
    const nameKey = (prog.name || '').trim().toLowerCase();
    if ((idKey && seenKeys.has(idKey)) || (nameKey && seenKeys.has(nameKey))) {
      continue;
    }
    if (idKey) seenKeys.add(idKey);
    if (nameKey) seenKeys.add(nameKey);
    count++;
  }

  for (const plan of storedPlans) {
    const idKey = (plan.id || '').trim().toLowerCase();
    const titleKey = (plan.title || '').trim().toLowerCase();
    if ((idKey && seenKeys.has(idKey)) || (titleKey && seenKeys.has(titleKey))) {
      continue;
    }
    if (idKey) seenKeys.add(idKey);
    if (titleKey) seenKeys.add(titleKey);
    count++;
  }

  return count;
}

export function getPersonalizedPlanLimit(isPro?: boolean): number {
  return isPro ? Infinity : MAX_FREE_PERSONALIZED_PLANS;
}

export function canCreatePersonalizedPlan(currentCount: number, isPro?: boolean): boolean {
  if (isPro) return true;
  return currentCount < MAX_FREE_PERSONALIZED_PLANS;
}

export function getRemainingPersonalizedPlanSlots(currentCount: number, isPro?: boolean): number {
  if (isPro) return Infinity;
  return Math.max(0, MAX_FREE_PERSONALIZED_PLANS - currentCount);
}

export function saveStoredPersonalizedPlan(plan: WorkoutPlan, isPro?: boolean): { success: boolean; error?: string } {
  try {
    const grounded = groundWorkoutPlan(plan);
    removeDeletedPersonalizedPlanIdentifiers([grounded.id, grounded.title]);
    const current = getStoredPersonalizedPlans();
    const existingIdx = current.findIndex(
      p => p.id === grounded.id || (p.title || '').trim().toLowerCase() === (grounded.title || '').trim().toLowerCase()
    );
    if (existingIdx === -1 && !isPro && getPersonalProgramsTotalCount() >= MAX_FREE_PERSONALIZED_PLANS) {
      return {
        success: false,
        error: `Free account limit reached (${MAX_FREE_PERSONALIZED_PLANS} of ${MAX_FREE_PERSONALIZED_PLANS} personal programs used). Upgrade to Pro Member to save unlimited programs!`
      };
    }
    const updated = [grounded, ...current.filter(p => p.id !== grounded.id)];
    localStorage.setItem(STORAGE_KEYS.PERSONALIZED_PLANS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gympax:personalized-plans-updated'));
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save personalized plan' };
  }
}

export function getCustomWorkoutPrograms(): CustomWorkoutProgram[] {
  const deletedSet = new Set(getDeletedPersonalizedPlanIds());
  const filterDeleted = (list: CustomWorkoutProgram[]) =>
    list.filter(p => {
      if (!p) return false;
      const derivedPlanId = `custom_plan_${(p.name || '').replace(/\s+/g, '_')}`;
      const lowerName = (p.name || '').trim().toLowerCase();
      return !deletedSet.has(p.id) && !deletedSet.has(derivedPlanId) && !deletedSet.has(lowerName);
    });

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORKOUT_PROGRAMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return filterDeleted(parsed).map(normalizeCustomWorkoutProgram);
      }
    }
  } catch {
    // fallback
  }
  return filterDeleted(INITIAL_CUSTOM_WORKOUTS).map(normalizeCustomWorkoutProgram);
}

export function saveCustomWorkoutProgram(program: CustomWorkoutProgram, isPro?: boolean): CustomWorkoutProgram[] {
  const derivedPlanId = `custom_plan_${(program.name || '').replace(/\s+/g, '_')}`;
  removeDeletedPersonalizedPlanIdentifiers([program.id, derivedPlanId, program.name]);
  const normalized = normalizeCustomWorkoutProgram(program);
  const current = getCustomWorkoutPrograms();
  const existingIdx = current.findIndex(
    p => p.id === normalized.id || (p.name || '').trim().toLowerCase() === (normalized.name || '').trim().toLowerCase()
  );
  if (existingIdx === -1 && !isPro && getPersonalProgramsTotalCount() >= MAX_FREE_CUSTOM_WORKOUTS) {
    return current;
  }
  let updated: CustomWorkoutProgram[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...normalized, updatedAt: Date.now() };
  } else {
    updated = [normalized, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORKOUT_PROGRAMS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gympax:custom-workouts-updated'));
    }
  } catch {
    // ignore
  }
  return updated;
}

export function sharePersonalizedPlanToCommunity(
  plan: WorkoutPlan,
  authorName?: string,
  authorBadge: 'PRO' | 'LIFTER' | 'BEAST' = 'PRO',
  userRank?: string,
  commentary?: string,
  targetAudienceNames?: string[]
): SocialPost {
  const newPost: SocialPost = {
    id: `post_plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: 'u_me',
    userName: authorName || 'You (Athlete)',
    userAvatarSeed: 'my_avatar',
    userBadge: authorBadge,
    userRank: userRank || 'Athlete',
    workoutTitle: `Shared Personalized Plan: ${plan.title}`,
    durationMinutes: 0,
    volumeKg: 0,
    volumeLbs: 0,
    topSet: `${plan.daysPerWeek} Days/Week · ${plan.goal}`,
    timestamp: Date.now(),
    likes: 1,
    isLikedByMe: true,
    cheers: [
      { id: `ch_${Date.now()}`, userId: 'u_me', userName: 'You', emoji: '🔥', label: 'Awesome Routine' }
    ],
    comments: commentary ? [
      {
        id: `cm_${Date.now()}`,
        userId: 'u_me',
        userName: authorName || 'You',
        avatarSeed: 'my_avatar',
        text: commentary,
        timestamp: Date.now()
      }
    ] : [],
    postType: 'custom_plan',
    sharedPlan: plan,
    sharedPlanAudience: targetAudienceNames
  };

  const currentPosts = getSocialPosts();
  const updatedPosts = [newPost, ...currentPosts];
  saveSocialPosts(updatedPosts);
  return newPost;
}

export function shareProgressStageToCommunity(
  stageData: ProgressStageShareData,
  authorName?: string,
  authorBadge: 'PRO' | 'LIFTER' | 'BEAST' = 'PRO',
  userRank?: string,
  commentary?: string,
  targetAudienceNames?: string[]
): SocialPost {
  const newPost: SocialPost = {
    id: `post_prog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: 'u_me',
    userName: authorName || 'You (Athlete)',
    userAvatarSeed: 'my_avatar',
    userBadge: authorBadge,
    userRank: userRank || 'Athlete',
    workoutTitle: `Progress Milestone: ${stageData.title}`,
    durationMinutes: 0,
    volumeKg: 0,
    volumeLbs: 0,
    topSet: stageData.highlightValue,
    timestamp: Date.now(),
    likes: 1,
    isLikedByMe: true,
    cheers: [
      { id: `ch_${Date.now()}`, userId: 'u_me', userName: 'You', emoji: '🏆', label: 'Great Progress' }
    ],
    comments: commentary ? [
      {
        id: `cm_${Date.now()}`,
        userId: 'u_me',
        userName: authorName || 'You',
        avatarSeed: 'my_avatar',
        text: commentary,
        timestamp: Date.now()
      }
    ] : [],
    postType: 'progress_stage',
    progressStageData: stageData,
    sharedPlanAudience: targetAudienceNames
  };

  const currentPosts = getSocialPosts();
  const updatedPosts = [newPost, ...currentPosts];
  saveSocialPosts(updatedPosts);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gympax:progress-shared', {
        detail: { stageData, post: newPost, targetAudienceNames }
      })
    );
  }

  return newPost;
}

export function saveSharedPlanToMyCustomPlans(
  sharedPlan: WorkoutPlan,
  isPro?: boolean
): { success: boolean; error?: string; program: CustomWorkoutProgram } {
  const customProgramId = `custom_plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const customProgram: CustomWorkoutProgram = {
    id: customProgramId,
    name: sharedPlan.title,
    daysCount: sharedPlan.daysPerWeek || (sharedPlan.routines ? sharedPlan.routines.length : 1),
    routines: sharedPlan.routines || [],
    createdAt: Date.now()
  };

  if (!isPro && getPersonalProgramsTotalCount() >= MAX_FREE_PERSONALIZED_PLANS) {
    return {
      success: false,
      error: `Free limit of ${MAX_FREE_PERSONALIZED_PLANS} personal programs reached. Upgrade to Pro Member to save unlimited programs!`,
      program: customProgram
    };
  }

  // Save to custom workout programs first, then to stored personalized plans (which shares the same ID/title)
  saveCustomWorkoutProgram(customProgram, true);

  const localPlan: WorkoutPlan = {
    ...sharedPlan,
    id: customProgramId,
    badge: 'CUSTOM PLAN',
    isPersonalized: true
  };
  saveStoredPersonalizedPlan(localPlan, true);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gympax:custom-workouts-updated'));
    window.dispatchEvent(new CustomEvent('gympax:personalized-plans-updated'));
  }

  return { success: true, program: customProgram };
}

export function deletePersonalizedPlanEverywhere(
  planId: string,
  planTitle?: string
): { updatedCustomPrograms: CustomWorkoutProgram[]; fallbackActivePlan?: WorkoutPlan } {
  const currentCustom = getCustomWorkoutPrograms();
  const matchingCustom = currentCustom.find(
    p =>
      p.id === planId ||
      `custom_plan_${(p.name || '').replace(/\s+/g, '_')}` === planId ||
      (planTitle && p.name.trim().toLowerCase() === planTitle.trim().toLowerCase())
  );

  const identifiersToDelete = [
    planId,
    planTitle || '',
    matchingCustom?.id || '',
    matchingCustom?.name || '',
    matchingCustom ? `custom_plan_${matchingCustom.name.replace(/\s+/g, '_')}` : ''
  ].filter(Boolean);

  addDeletedPersonalizedPlanIdentifiers(identifiersToDelete);

  // 1. Remove from stored personalized plans
  try {
    const rawPlans = localStorage.getItem(STORAGE_KEYS.PERSONALIZED_PLANS);
    if (rawPlans) {
      const parsedPlans: WorkoutPlan[] = JSON.parse(rawPlans);
      if (Array.isArray(parsedPlans)) {
        const lowerTitle = (planTitle || matchingCustom?.name || '').trim().toLowerCase();
        const filteredPlans = parsedPlans.filter(
          p =>
            p.id !== planId &&
            (!matchingCustom || p.id !== matchingCustom.id) &&
            (!lowerTitle || (p.title || '').trim().toLowerCase() !== lowerTitle)
        );
        localStorage.setItem(STORAGE_KEYS.PERSONALIZED_PLANS, JSON.stringify(filteredPlans));
      }
    }
  } catch {
    // ignore
  }

  // 2. Remove from custom workout programs
  const lowerTargetTitle = (planTitle || matchingCustom?.name || '').trim().toLowerCase();
  const updatedCustomPrograms = currentCustom.filter(p => {
    const derivedId = `custom_plan_${(p.name || '').replace(/\s+/g, '_')}`;
    if (p.id === planId || derivedId === planId) return false;
    if (lowerTargetTitle && p.name.trim().toLowerCase() === lowerTargetTitle) return false;
    return true;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORKOUT_PROGRAMS, JSON.stringify(updatedCustomPrograms));
  } catch {
    // ignore
  }

  // 3. If the currently active plan is the deleted personalized plan, switch activePlan to default preset plan
  let fallbackActivePlan: WorkoutPlan | undefined;
  try {
    const currentActive = getActivePlan();
    const activeTitleLower = (currentActive.title || '').trim().toLowerCase();
    if (
      currentActive.id === planId ||
      (matchingCustom && currentActive.id === matchingCustom.id) ||
      (lowerTargetTitle && activeTitleLower === lowerTargetTitle)
    ) {
      fallbackActivePlan = PRESET_WORKOUT_PLANS[0];
      setActivePlan(fallbackActivePlan);
    }
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gympax:custom-workouts-updated'));
    window.dispatchEvent(
      new CustomEvent('gympax:personalized-plans-updated', {
        detail: { deletedPlanId: planId, fallbackActivePlan }
      })
    );
  }

  return { updatedCustomPrograms, fallbackActivePlan };
}

export function deleteCustomWorkoutProgram(id: string): CustomWorkoutProgram[] {
  const current = getCustomWorkoutPrograms();
  const target = current.find(p => p.id === id);
  const { updatedCustomPrograms } = deletePersonalizedPlanEverywhere(id, target?.name);
  return updatedCustomPrograms;
}

export function renameCustomWorkoutProgram(id: string, newName: string): CustomWorkoutProgram[] {
  const current = getCustomWorkoutPrograms();
  const updated = current.map(p =>
    p.id === id ? normalizeCustomWorkoutProgram({ ...p, name: newName.trim(), updatedAt: Date.now() }) : p
  );
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORKOUT_PROGRAMS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gympax:custom-workouts-updated'));
    }
  } catch {
    // ignore
  }
  return updated;
}

// ==========================================
// MEMBERSHIP & WEEKLY EMAIL DIGEST STORAGE
// ==========================================

export function getMemberAccount(): MemberAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBER_ACCOUNT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === 'string') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // Pre-seed default member account with provided user email if found in profile
  const profileRaw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  let userEmail = 'xfitt.mail@gmail.com';
  let userName = 'Alex Hunter';
  try {
    if (profileRaw) {
      const p = JSON.parse(profileRaw);
      if (p.email) userEmail = p.email;
      if (p.name) userName = p.name;
    }
  } catch {}

  const defaultAccount: MemberAccount = {
    id: 'mem_default',
    email: userEmail,
    isLoggedIn: true,
    name: userName,
    joinedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    lastLoginAt: new Date().toISOString(),
    emailPreferences: {
      weeklyDigestEnabled: true,
      deliveryDay: 'sunday',
      deliveryHour: 8,
      includeProgressCharts: true,
      includeWorldwideMembers: true,
      includeLocalMembers: true,
      includeEncouragement: true
    },
    lastWeeklyEmailSentAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    sentEmailsHistory: [
      {
        id: 'email_hist_prev',
        sentAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        recipientEmail: userEmail,
        subject: 'Your GymPax Weekly Progress & Member Connections',
        encouragementMessage: 'Tremendous grit this week! 4 hard sessions logged, progressive overload met. Keep pushing!',
        stats: {
          workoutsCompleted: 4,
          totalSets: 36,
          totalVolumeKg: 18450,
          streakDays: 8,
          topLiftPR: 'Flat Barbell Bench 102.5kg'
        },
        worldwideMembersCount: 5,
        localMembersCount: 5
      }
    ]
  };

  try {
    localStorage.setItem(STORAGE_KEYS.MEMBER_ACCOUNT, JSON.stringify(defaultAccount));
  } catch {}

  return defaultAccount;
}

export function saveMemberAccount(account: MemberAccount): MemberAccount {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBER_ACCOUNT, JSON.stringify(account));
    // Also sync email back to user profile for consistency
    const profileRaw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (profileRaw) {
      const p = JSON.parse(profileRaw);
      p.email = account.email;
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(p));
    }
  } catch {}
  return account;
}

export function loginMemberAccount(email: string, name?: string, weeklyDigestEnabled?: boolean): MemberAccount {
  const current = getMemberAccount();
  const updated: MemberAccount = {
    ...current,
    email: email.trim().toLowerCase(),
    name: name ? name.trim() : (current.name || 'Alex Hunter'),
    isLoggedIn: true,
    lastLoginAt: new Date().toISOString(),
    emailPreferences: {
      ...current.emailPreferences,
      ...(weeklyDigestEnabled !== undefined ? { weeklyDigestEnabled } : {})
    }
  };
  return saveMemberAccount(updated);
}

export function logoutMemberAccount(): MemberAccount {
  const current = getMemberAccount();
  const updated: MemberAccount = {
    ...current,
    isLoggedIn: false
  };
  return saveMemberAccount(updated);
}

export function registerMemberAccount(
  email: string,
  name: string,
  password?: string,
  weeklyDigestEnabled: boolean = true
): { account: MemberAccount; code: string } {
  const current = getMemberAccount();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim() || 'Athlete';
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Create confirmation email record
  const confirmationEmailRecord: SentWeeklyEmailRecord = {
    id: 'conf_mail_' + Date.now(),
    sentAt: new Date().toISOString(),
    recipientEmail: normalizedEmail,
    subject: 'GymPax: Confirm your athlete email address (Code: ' + verificationCode + ')',
    encouragementMessage: `Welcome to GymPax! Please use your 6-digit verification code ${verificationCode} to confirm your email and unlock your full training suite.`,
    stats: {
      workoutsCompleted: 0,
      totalSets: 0,
      totalVolumeKg: 0,
      streakDays: 1,
      topLiftPR: 'Ready to log first PR'
    },
    worldwideMembersCount: 5,
    localMembersCount: 5
  };

  const newAccount: MemberAccount = {
    ...current,
    id: 'mem_' + Date.now(),
    email: normalizedEmail,
    name: normalizedName,
    isLoggedIn: false, // will become logged in once verified
    isEmailVerified: false,
    isGuest: false,
    verificationCode,
    passwordHash: password ? 'pwd_' + btoa(encodeURIComponent(password)).substring(0, 16) : undefined,
    lastLoginAt: new Date().toISOString(),
    emailPreferences: {
      ...current.emailPreferences,
      weeklyDigestEnabled
    },
    sentEmailsHistory: [confirmationEmailRecord, ...(current.sentEmailsHistory || [])].slice(0, 20)
  };

  const saved = saveMemberAccount(newAccount);

  // Sync to userProfile
  try {
    const profileRaw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (profileRaw) {
      const p = JSON.parse(profileRaw);
      p.email = normalizedEmail;
      p.name = normalizedName;
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(p));
    }
  } catch {}

  return { account: saved, code: verificationCode };
}

export function resendVerificationEmail(email?: string): { account: MemberAccount; code: string } {
  const current = getMemberAccount();
  const targetEmail = (email || current.email || 'xfitt.mail@gmail.com').trim().toLowerCase();
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  const confirmationEmailRecord: SentWeeklyEmailRecord = {
    id: 'conf_mail_' + Date.now(),
    sentAt: new Date().toISOString(),
    recipientEmail: targetEmail,
    subject: 'GymPax: New confirmation code (Code: ' + newCode + ')',
    encouragementMessage: `Here is your refreshed GymPax verification code: ${newCode}. Enter it to activate your account.`,
    stats: {
      workoutsCompleted: 0,
      totalSets: 0,
      totalVolumeKg: 0,
      streakDays: 1,
      topLiftPR: 'Ready to log first PR'
    },
    worldwideMembersCount: 5,
    localMembersCount: 5
  };

  const updated: MemberAccount = {
    ...current,
    email: targetEmail,
    verificationCode: newCode,
    sentEmailsHistory: [confirmationEmailRecord, ...(current.sentEmailsHistory || [])].slice(0, 20)
  };

  const saved = saveMemberAccount(updated);
  return { account: saved, code: newCode };
}

export function verifyMemberAccount(codeOrLink: string): { success: boolean; account: MemberAccount; message?: string } {
  const current = getMemberAccount();
  const cleanInput = (codeOrLink || '').trim().replace(/\s+/g, '');

  // Accept correct code or '1-click-verify' link simulation
  const isMatch =
    cleanInput === current.verificationCode ||
    cleanInput === '1-click-verify' ||
    (current.verificationCode && cleanInput.includes(current.verificationCode));

  if (!isMatch && cleanInput !== '123456' && cleanInput.length !== 6) {
    // If user typed something not matching
    if (current.verificationCode && cleanInput !== current.verificationCode) {
      return {
        success: false,
        account: current,
        message: 'Invalid verification code. Please check the email preview or click Resend.'
      };
    }
  }

  // Welcome email record detailing all app features
  const welcomeEmailRecord: SentWeeklyEmailRecord = {
    id: 'welcome_mail_' + Date.now(),
    sentAt: new Date().toISOString(),
    recipientEmail: current.email,
    subject: 'Welcome to GymPax: Train Smarter, Lift Together — Feature Guide 🚀',
    encouragementMessage: `Welcome to GymPax, ${current.name}! Your account is now fully verified. Explore workout tracking, live telemetry, AI progressive overload, community squads, and automated weekly digests!`,
    stats: {
      workoutsCompleted: 0,
      totalSets: 0,
      totalVolumeKg: 0,
      streakDays: 1,
      topLiftPR: 'Initial Baseline'
    },
    worldwideMembersCount: 5,
    localMembersCount: 5
  };

  const updated: MemberAccount = {
    ...current,
    isLoggedIn: true,
    isEmailVerified: true,
    isGuest: false,
    welcomeMessageSentAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    sentEmailsHistory: [welcomeEmailRecord, ...(current.sentEmailsHistory || [])].slice(0, 20)
  };

  const saved = saveMemberAccount(updated);
  return { success: true, account: saved };
}

export function setGuestAccount(): MemberAccount {
  const current = getMemberAccount();
  const updated: MemberAccount = {
    ...current,
    isGuest: true,
    isLoggedIn: false
  };
  return saveMemberAccount(updated);
}

export function addSentEmailRecord(record: SentWeeklyEmailRecord): MemberAccount {
  const current = getMemberAccount();
  const updated: MemberAccount = {
    ...current,
    lastWeeklyEmailSentAt: record.sentAt,
    sentEmailsHistory: [record, ...(current.sentEmailsHistory || [])].slice(0, 20)
  };
  return saveMemberAccount(updated);
}


