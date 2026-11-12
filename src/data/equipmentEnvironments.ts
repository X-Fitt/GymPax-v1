import { EquipmentEnvironment, EquipmentAccessType, Equipment, ExerciseDefinition, DailyWorkoutRoutine, WorkoutPlan } from '../types';
import { EXERCISE_DATABASE, resolveCatalogExercise, groundRoutineExercises, groundWorkoutPlan } from './exercises';

export interface EquipmentEnvironmentConfig {
  id: EquipmentEnvironment;
  title: EquipmentAccessType;
  shortTitle: string;
  emoji: string;
  badge: string;
  tagline: string;
  description: string;
  allowedEquipment: Equipment[];
  idealFor: string;
  highlights: string[];
}

export const EQUIPMENT_ENVIRONMENTS: Record<EquipmentEnvironment, EquipmentEnvironmentConfig> = {
  commercial_gym: {
    id: 'commercial_gym',
    title: 'Full Commercial Gym',
    shortTitle: 'Commercial Gym',
    emoji: '🏋️',
    badge: 'UNLIMITED GEAR',
    tagline: 'All machines, cables, barbells, dumbbells, bodyweight',
    description: 'Gold’s Gym, Equinox, or commercial club setup with Olympic platforms, selectorized pin machines, and cable towers.',
    allowedEquipment: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith Machine', 'Bodyweight', 'Weighted'],
    idealFor: 'Full commercial gyms & fitness clubs',
    highlights: ['All cable towers & lat pulldowns', 'Specialized machines (hack squat, leg curl)', 'Heavy barbells & dumbbells']
  },
  home_gym: {
    id: 'home_gym',
    title: 'Home Gym',
    shortTitle: 'Home Gym',
    emoji: '🏠',
    badge: 'GARAGE IRON',
    tagline: 'Barbell, dumbbells, bench, rack; exclude specialized cable machines & pin-loaded commercial stack machines',
    description: 'Barbell, dumbbells, bench, rack; excludes specialized cable machines and pin-loaded commercial stack machines.',
    allowedEquipment: ['Barbell', 'Dumbbell', 'Bodyweight', 'Weighted'],
    idealFor: 'Garage gym, basement iron rack & home lifters',
    highlights: ['Barbell squats, deadlifts & bench', 'Dumbbell presses & rows', 'Pull-up bar & dips']
  },
  free_weights_only: {
    id: 'free_weights_only',
    title: 'Free Weights Only',
    shortTitle: 'Free Weights',
    emoji: '⚖️',
    badge: 'BARBELL & BELLS',
    tagline: 'Barbell, dumbbells, kettlebells, bench; exclude all machines and cables',
    description: 'Barbell, dumbbells, kettlebells, and bench. Excludes all machines and cables for pure free-weight progressive overload.',
    allowedEquipment: ['Barbell', 'Dumbbell', 'Bodyweight', 'Weighted', 'Kettlebell'],
    idealFor: 'Old-school iron clubs or lifters who prefer pure compound free weights',
    highlights: ['Pure free-weight compound lifts', 'Zero reliance on machines or cables', 'Deep stabilizer recruitment']
  },
  dumbbell_only: {
    id: 'dumbbell_only',
    title: 'Dumbbell Only',
    shortTitle: 'Dumbbell Only',
    emoji: '🦾',
    badge: 'DUMBBELL MASTERY',
    tagline: 'Dumbbells and bodyweight exercises only',
    description: 'Dumbbells and bodyweight exercises only — apartment fitness rooms, hotel dumbbell racks, or minimalist home setups.',
    allowedEquipment: ['Dumbbell', 'Bodyweight'],
    idealFor: 'Apartment fitness rooms, hotel dumbbell racks, or minimalist home setups',
    highlights: ['Independent arm stabilization & symmetry', 'Goblet squats & dumbbell RDLs', 'Floor / bench dumbbell presses & rows']
  },
  kettlebell_only: {
    id: 'kettlebell_only',
    title: 'Kettlebell Only',
    shortTitle: 'Kettlebells Only',
    emoji: '🔔',
    badge: 'KETTLEBELL MASTERY',
    tagline: '100% Kettlebell exercises only for explosive power & athletic conditioning',
    description: 'Kettlebells only — swings, cleans, presses, snatches, and loaded carries for full-body strength, grip, and conditioning.',
    allowedEquipment: ['Kettlebell'],
    idealFor: 'Hardstyle lifters, garage athletes, Pavel/Dan John protocols, minimalists',
    highlights: ['Explosive hip hinge swings & snatches', 'Turkish get-ups & windmills for 360° stability', 'Double kettlebell cleans, presses & front squats']
  },
  bodyweight_travel: {
    id: 'bodyweight_travel',
    title: 'Bodyweight Only',
    shortTitle: 'Bodyweight Only',
    emoji: '🤸',
    badge: 'CALISTHENICS',
    tagline: 'Bodyweight, calisthenics, and band exercises only',
    description: 'Bodyweight, calisthenics, and band exercises only — on vacation, in transit, hotel rooms, home, or outdoor parks.',
    allowedEquipment: ['Bodyweight'],
    idealFor: 'Zero equipment, bodyweight calisthenics, travelling, hotel rooms, outdoors',
    highlights: ['Zero equipment required', 'High-tension decline push-ups & pike presses', 'Bulgarian split squats & single-leg hinges']
  }
};

export const ENVIRONMENT_LIST: EquipmentEnvironmentConfig[] = Object.values(EQUIPMENT_ENVIRONMENTS);

export function accessTypeToEnvironment(access?: string): EquipmentEnvironment {
  if (!access) return 'commercial_gym';
  const norm = access.toLowerCase();
  if (norm.includes('kettlebell')) {
    return 'kettlebell_only';
  }
  if (norm.includes('travel') || norm.includes('no weight') || norm.includes('bodyweight')) {
    return 'bodyweight_travel';
  }
  if (norm.includes('dumbbell only') || norm.includes('dumbell only')) {
    return 'dumbbell_only';
  }
  if (norm.includes('free weight') || norm.includes('barbell & dumbbell')) {
    return 'free_weights_only';
  }
  if (norm.includes('home gym')) {
    return 'home_gym';
  }
  return 'commercial_gym';
}

export function environmentToAccessType(env: EquipmentEnvironment): EquipmentAccessType {
  return EQUIPMENT_ENVIRONMENTS[env]?.title || 'Full Commercial Gym';
}

export function isExerciseAllowed(exercise: ExerciseDefinition, env: EquipmentEnvironment): boolean {
  if (exercise.isCustom) return true;
  const allowed = EQUIPMENT_ENVIRONMENTS[env]?.allowedEquipment;
  if (!allowed) return true;
  return allowed.includes(exercise.equipment);
}

// Intelligent fallback substitution mapping per muscle group & environment (using exact gympax_exercises.json IDs)
const SUBSTITUTION_MAP: Record<string, Partial<Record<EquipmentEnvironment, string>>> = {
  // Chest
  barbell_bench_press: {
    dumbbell_only: 'dumbbell_bench_press',
    bodyweight_travel: 'decline_push_up' // Example 1: Barbell Bench Press -> Decline Push-up / Push-up
  },
  'Barbell Flat Bench Press': {
    dumbbell_only: 'dumbbell_bench_press',
    bodyweight_travel: 'decline_push_up'
  },
  'Barbell Bench Press': {
    dumbbell_only: 'dumbbell_bench_press',
    bodyweight_travel: 'decline_push_up'
  },
  dumbbell_incline_bench_press: {
    bodyweight_travel: 'decline_push_up'
  },
  cable_standing_fly: {
    free_weights_only: 'dumbbell_fly',
    home_gym: 'dumbbell_fly',
    dumbbell_only: 'dumbbell_fly',
    bodyweight_travel: 'decline_push_up'
  },
  chest_dip: {
    dumbbell_only: 'dumbbell_bench_press',
    bodyweight_travel: 'bench_dip_on_floor'
  },

  // Back
  barbell_deadlift: {
    dumbbell_only: 'dumbbell_romanian_deadlift',
    bodyweight_travel: 'single_leg_deadlift_with_knee_lift'
  },
  barbell_bent_over_row: {
    dumbbell_only: 'dumbbell_bent_over_row',
    bodyweight_travel: 'inverted_row_between_chairs'
  },
  'cable_wide_grip_lat_pulldown_(female)': {
    free_weights_only: 'pull_up',
    home_gym: 'pull_up',
    dumbbell_only: 'dumbbell_bent_over_row',
    bodyweight_travel: 'pull_up'
  },
  cable_seated_row_with_v_bar: {
    free_weights_only: 'barbell_bent_over_row',
    home_gym: 'barbell_bent_over_row',
    dumbbell_only: 'dumbbell_bent_over_row',
    bodyweight_travel: 'inverted_row_between_chairs'
  },
  'lever_t_bar_row_(plate_loaded)': {
    free_weights_only: 'barbell_bent_over_row',
    home_gym: 'barbell_bent_over_row',
    dumbbell_only: 'dumbbell_bent_over_row',
    bodyweight_travel: 'seated_row_with_towel'
  },

  // Shoulders
  barbell_seated_overhead_press: {
    dumbbell_only: 'dumbbell_standing_overhead_press',
    bodyweight_travel: 'pike_push_up'
  },
  dumbbell_seated_shoulder_press: {
    bodyweight_travel: 'pike_push_up'
  },
  dumbbell_lateral_raise: {
    bodyweight_travel: 'pike_push_up'
  },
  band_face_pull: {
    free_weights_only: 'dumbbell_rear_delt_raise',
    home_gym: 'dumbbell_rear_delt_raise',
    dumbbell_only: 'dumbbell_rear_delt_raise',
    bodyweight_travel: 'inverted_row_between_chairs'
  },

  // Quads & Legs
  'barbell_full_squat_(back_pov)': {
    dumbbell_only: 'dumbbell_goblet_squat',
    bodyweight_travel: 'bodyweight_squat_(male)'
  },
  sled_hack_squat: {
    free_weights_only: 'barbell_full_squat_(back_pov)',
    home_gym: 'barbell_full_squat_(back_pov)',
    dumbbell_only: 'dumbbell_bulgarian_split_squat_(female)',
    bodyweight_travel: 'bulgarian_split_squat'
  },
  lever_leg_extension: {
    free_weights_only: 'dumbbell_goblet_squat',
    home_gym: 'dumbbell_goblet_squat',
    dumbbell_only: 'dumbbell_walking_lunges',
    bodyweight_travel: 'sissy_squat_bodyweight'
  },
  barbell_romanian_deadlift: {
    dumbbell_only: 'dumbbell_romanian_deadlift',
    bodyweight_travel: 'single_leg_deadlift_with_knee_lift'
  },
  lever_lying_leg_curl: {
    free_weights_only: 'barbell_romanian_deadlift',
    home_gym: 'barbell_romanian_deadlift',
    dumbbell_only: 'dumbbell_romanian_deadlift',
    bodyweight_travel: 'single_leg_glute_bridge_with_knee_to_chest'
  },
  barbell_standing_calf_raise: {
    free_weights_only: 'dumbbell_standing_calf_raise',
    home_gym: 'dumbbell_standing_calf_raise',
    dumbbell_only: 'dumbbell_standing_calf_raise',
    bodyweight_travel: 'dumbbell_standing_single_leg_calf_raise'
  },

  // Arms - Biceps & Triceps
  barbell_curl: {
    dumbbell_only: 'dumbbell_alternate_biceps_curl',
    bodyweight_travel: 'chin_up'
  },
  dumbbell_incline_biceps_curl: {
    bodyweight_travel: 'chin_up'
  },
  'cable_hammer_curl_(with_rope)_(male)': {
    free_weights_only: 'dumbbell_hammer_curl',
    home_gym: 'dumbbell_hammer_curl',
    dumbbell_only: 'dumbbell_hammer_curl',
    bodyweight_travel: 'chin_up'
  },
  'cable_pushdown_(with_rope_attachment)': {
    free_weights_only: 'dumbbell_seated_triceps_extension',
    home_gym: 'dumbbell_seated_triceps_extension', // Example 2: Triceps Cable Pushdown -> Dumbbell Overhead Extension / Dips
    dumbbell_only: 'dumbbell_seated_triceps_extension',
    bodyweight_travel: 'triceps_dip'
  },
  triceps_rope_pushdown: {
    free_weights_only: 'dumbbell_seated_triceps_extension',
    home_gym: 'dumbbell_seated_triceps_extension',
    dumbbell_only: 'dumbbell_seated_triceps_extension',
    bodyweight_travel: 'triceps_dip'
  },
  'Triceps Cable Pushdown': {
    free_weights_only: 'dumbbell_seated_triceps_extension',
    home_gym: 'dumbbell_seated_triceps_extension',
    dumbbell_only: 'dumbbell_seated_triceps_extension',
    bodyweight_travel: 'triceps_dip'
  },
  'Cable Triceps Rope Pushdown': {
    free_weights_only: 'dumbbell_seated_triceps_extension',
    home_gym: 'dumbbell_seated_triceps_extension',
    dumbbell_only: 'dumbbell_seated_triceps_extension',
    bodyweight_travel: 'triceps_dip'
  },
  barbell_lying_triceps_extension_skull_crusher: {
    dumbbell_only: 'dumbbell_lying_floor_skullcrusher',
    bodyweight_travel: 'diamond_push_up'
  },
  cable_high_pulley_overhead_tricep_extension: {
    free_weights_only: 'dumbbell_seated_triceps_extension',
    home_gym: 'dumbbell_seated_triceps_extension',
    dumbbell_only: 'dumbbell_seated_triceps_extension',
    bodyweight_travel: 'triceps_dip'
  },

  // Abs & Core
  hanging_straight_leg_raise: {
    dumbbell_only: 'dumbbell_straight_arm_crunch',
    bodyweight_travel: 'front_plank_toe_tap_(male)'
  },
  'cable_twist_(down_up)': {
    free_weights_only: '45_degree_bycicle_twisting_crunch',
    home_gym: '45_degree_bycicle_twisting_crunch',
    dumbbell_only: '45_degree_bycicle_twisting_crunch',
    bodyweight_travel: '45_degree_bycicle_twisting_crunch'
  },
  cable_tuck_reverse_crunch: {
    free_weights_only: 'front_plank_toe_tap_(male)',
    home_gym: 'front_plank_toe_tap_(male)',
    dumbbell_only: 'dumbbell_straight_arm_crunch',
    bodyweight_travel: 'front_plank_toe_tap_(male)'
  },
  // Bodyweight to gym reverse mappings
  push_up_m: {
    commercial_gym: 'barbell_bench_press',
    home_gym: 'barbell_bench_press',
    free_weights_only: 'barbell_bench_press',
    dumbbell_only: 'dumbbell_bench_press'
  },
  'bodyweight_squat_(male)': {
    commercial_gym: 'barbell_full_squat_(back_pov)',
    home_gym: 'barbell_full_squat_(back_pov)',
    free_weights_only: 'barbell_full_squat_(back_pov)',
    dumbbell_only: 'dumbbell_goblet_squat'
  },
  seated_row_with_towel: {
    commercial_gym: 'cable_wide_grip_lat_pulldown_(female)',
    home_gym: 'barbell_bent_over_row',
    free_weights_only: 'barbell_bent_over_row',
    dumbbell_only: 'dumbbell_bent_over_row'
  },
  pike_push_up: {
    commercial_gym: 'barbell_seated_overhead_press',
    home_gym: 'barbell_seated_overhead_press',
    free_weights_only: 'barbell_seated_overhead_press',
    dumbbell_only: 'dumbbell_standing_overhead_press'
  }
};

export function getAvailableSubstitutes(
  originalExerciseId: string,
  targetEnv: EquipmentEnvironment
): ExerciseDefinition[] {
  const orig = resolveCatalogExercise(originalExerciseId);
  const targetMuscle = orig?.primaryMuscle || 'Chest';

  // 1. Direct mapped substitute
  const directSubId = SUBSTITUTION_MAP[orig.id]?.[targetEnv] || SUBSTITUTION_MAP[originalExerciseId]?.[targetEnv];
  const directSub = directSubId ? resolveCatalogExercise(directSubId, targetMuscle) : undefined;

  // 2. All exercises for same primary muscle allowed in targetEnv
  const allowedForMuscle = EXERCISE_DATABASE.filter(
    e => e.primaryMuscle === targetMuscle && isExerciseAllowed(e, targetEnv) && e.id !== orig.id
  );

  const results: ExerciseDefinition[] = [];
  if (directSub && isExerciseAllowed(directSub, targetEnv)) {
    results.push(directSub);
  }
  for (const ex of allowedForMuscle) {
    if (!results.some(r => r.id === ex.id)) {
      results.push(ex);
    }
  }

  // Fallback if none found
  if (results.length === 0) {
    const anyAllowed = EXERCISE_DATABASE.filter(e => isExerciseAllowed(e, targetEnv));
    results.push(...anyAllowed.slice(0, 4));
  }

  return results;
}

export function getSubstituteExercise(originalExerciseId: string, targetEnv: EquipmentEnvironment): ExerciseDefinition {
  const orig = resolveCatalogExercise(originalExerciseId);
  if (!orig) {
    return EXERCISE_DATABASE[0];
  }

  // If already allowed in target environment, return it
  if (isExerciseAllowed(orig, targetEnv)) {
    return orig;
  }

  const origId = orig.id.toLowerCase();
  const origName = orig.name.toLowerCase();

  // 1. Direct substitution map by ID or Name
  const mappedSubId =
    SUBSTITUTION_MAP[orig.id]?.[targetEnv] ||
    SUBSTITUTION_MAP[originalExerciseId]?.[targetEnv] ||
    SUBSTITUTION_MAP[origId]?.[targetEnv] ||
    SUBSTITUTION_MAP[origName]?.[targetEnv];

  if (mappedSubId) {
    const subDef = resolveCatalogExercise(mappedSubId, orig.primaryMuscle);
    if (subDef && isExerciseAllowed(subDef, targetEnv)) return subDef;
  }

  // 2. Intelligent pattern matching based on exercise type & movement pattern:
  // Example 1: Barbell Bench Press -> No Weights (Travelling) => Decline Push-up or Push-up
  if (targetEnv === 'bodyweight_travel') {
    if (orig.primaryMuscle === 'Chest' || origName.includes('bench press') || origName.includes('chest press')) {
      const declinePushUp = resolveCatalogExercise('decline_push_up') || resolveCatalogExercise('push_up_m');
      if (declinePushUp && isExerciseAllowed(declinePushUp, targetEnv)) return declinePushUp;
    }
    if (orig.primaryMuscle === 'Triceps' || origName.includes('pushdown') || origName.includes('tricep')) {
      const dips = resolveCatalogExercise('triceps_dip') || resolveCatalogExercise('bench_dip_on_floor') || resolveCatalogExercise('diamond_push_up');
      if (dips && isExerciseAllowed(dips, targetEnv)) return dips;
    }
  }

  // Example 2: Triceps Cable Pushdown -> Home Gym / Free Weights => Dumbbell Overhead Triceps Extension or Dips
  if (targetEnv === 'home_gym' || targetEnv === 'free_weights_only') {
    if (origName.includes('pushdown') || (orig.primaryMuscle === 'Triceps' && (orig.equipment === 'Cable' || orig.equipment === 'Machine'))) {
      const dbExt = resolveCatalogExercise('dumbbell_seated_triceps_extension') || resolveCatalogExercise('triceps_dip');
      if (dbExt && isExerciseAllowed(dbExt, targetEnv)) return dbExt;
    }
  }

  // 3. Find another exercise targeting the same primary muscle allowed in this environment
  const sameMuscle = EXERCISE_DATABASE.filter(
    e => e.primaryMuscle === orig.primaryMuscle && isExerciseAllowed(e, targetEnv) && e.id !== orig.id
  );
  if (sameMuscle.length > 0) {
    // Prefer same tier (Compound vs Isolation)
    const preferred = sameMuscle.find(e => e.tier === orig.tier) || sameMuscle[0];
    return preferred;
  }

  // 4. Absolute fallback: any allowed exercise in target environment
  const anyAllowed = EXERCISE_DATABASE.filter(e => isExerciseAllowed(e, targetEnv));
  return anyAllowed[0] || orig;
}

export function adaptRoutineForEnvironment(
  routine: DailyWorkoutRoutine,
  env: EquipmentEnvironment
): DailyWorkoutRoutine {
  const config = EQUIPMENT_ENVIRONMENTS[env];
  const isTravel = env === 'bodyweight_travel';
  const isDumbbell = env === 'dumbbell_only';

  const adaptedExercises = routine.exercises.map(item => {
    const def = resolveCatalogExercise(item.id || item.exerciseId || item.name, item.primary_muscle);
    if (def && isExerciseAllowed(def, env)) {
      return {
        ...item,
        id: def.id,
        exerciseId: def.id,
        name: def.name,
        primary_muscle: def.primary_muscle || def.rawPrimaryMuscle || def.primaryMuscle,
        cdn_url: def.cdn_url || def.cdnUrl || ''
      };
    }

    const replacement = getSubstituteExercise(def.id, env);

    // Adjust target reps for bodyweight or dumbbell fatigue curve
    let adaptedReps = item.targetReps;
    if (isTravel) {
      if (replacement.tier === 'Compound') {
        adaptedReps = '12-20';
      } else {
        adaptedReps = '15-25';
      }
    } else if (isDumbbell) {
      adaptedReps = '10-12';
    }

    return {
      id: replacement.id,
      exerciseId: replacement.id,
      name: replacement.name,
      primary_muscle: replacement.primary_muscle || replacement.rawPrimaryMuscle || replacement.primaryMuscle,
      cdn_url: replacement.cdn_url || replacement.cdnUrl || '',
      defaultSets: item.defaultSets,
      targetReps: adaptedReps,
      targetRpe: item.targetRpe
    };
  });

  // Remove duplicate exercises in the routine if any occurred from substitutions
  const uniqueExerciseIds = new Set<string>();
  const filtered = adaptedExercises.filter(ex => {
    if (uniqueExerciseIds.has(ex.exerciseId)) {
      return false;
    }
    uniqueExerciseIds.add(ex.exerciseId);
    return true;
  });

  // Strip any existing environment tags like " · [Commercial Gym]" or " · [Dumbbells Only]"
  const baseDayName = routine.dayName.replace(/\s*·\s*\[.*?\]\s*$/, '').trim();

  return groundRoutineExercises({
    dayName: `${baseDayName} · [${config.shortTitle}]`,
    focus: routine.focus,
    exercises: filtered
  });
}

export function adaptPlanForEnvironment(
  plan: WorkoutPlan,
  env: EquipmentEnvironment
): WorkoutPlan {
  if (plan.targetMuscleGroup || plan.targetEquipmentCategory) {
    return groundWorkoutPlan(plan);
  }
  return groundWorkoutPlan({
    ...plan,
    routines: plan.routines.map(r => adaptRoutineForEnvironment(r, env))
  });
}

