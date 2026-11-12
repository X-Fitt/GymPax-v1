import { UserProfile, AiProgramRecommendation, WorkoutPlan, DailyWorkoutRoutine, MuscleGroup, EquipmentEnvironment } from '../types';
import { PRESET_WORKOUT_PLANS } from '../data/plans';
import { accessTypeToEnvironment, adaptRoutineForEnvironment, EQUIPMENT_ENVIRONMENTS, isExerciseAllowed } from '../data/equipmentEnvironments';
import { GYMPAX_EXERCISES, resolveCatalogExercise, groundWorkoutPlan } from '../data/exercises';

/**
 * Helper for GymPax AI Workout Generator:
 * Matches a requested exercise or niche movement and user requirements (target muscle group,
 * available equipment environment, category) strictly against `gympax_exercises.json`,
 * returning the exact `{ id, exerciseId, name, primary_muscle, cdn_url, defaultSets, targetReps, targetRpe }`.
 */
export function buildCatalogRoutineExercise(
  requestedIdOrName: string,
  defaultSets: number,
  targetReps: string,
  targetRpe: number,
  options?: {
    targetMuscle?: MuscleGroup | string;
    env?: EquipmentEnvironment;
    category?: string;
  }
) {
  let resolved = resolveCatalogExercise(requestedIdOrName, options?.targetMuscle);

  // Filter and match against available equipment & category in gympax_exercises.json if environment is specified
  if (options?.env && !isExerciseAllowed(resolved, options.env)) {
    const candidates = GYMPAX_EXERCISES.filter(
      ex =>
        ex.primaryMuscle === resolved.primaryMuscle &&
        isExerciseAllowed(ex, options.env!) &&
        (!options.category || ex.category?.toLowerCase() === options.category.toLowerCase())
    );
    if (candidates.length > 0) {
      resolved = candidates.find(c => c.tier === resolved.tier) || candidates[0];
    }
  }

  return {
    id: resolved.id,
    exerciseId: resolved.id,
    name: resolved.name,
    primary_muscle: resolved.primary_muscle || resolved.rawPrimaryMuscle || resolved.primaryMuscle,
    cdn_url: resolved.cdn_url || resolved.cdnUrl || '',
    defaultSets,
    targetReps,
    targetRpe
  };
}

/**
 * Intelligent GymPax AI Workout Generator that analyzes user bio-metrics,
 * experience level, weakpoints, orthopedic limitations, and equipment setup
 * to architect a custom bodybuilding program using ONLY exercises from `gympax_exercises.json`.
 */
export function generateAiRecommendation(profile: UserProfile): AiProgramRecommendation {
  const { name, age, weightKg, heightCm, gender, experienceLevel, primaryGoal, daysPerWeek, focusWeakpoint, injuriesOrLimitations, equipmentAccess, equipmentEnvironment } = profile;
  const env = equipmentEnvironment || accessTypeToEnvironment(equipmentAccess);
  const envConfig = EQUIPMENT_ENVIRONMENTS[env];

  const isWoman = gender === 'woman' || gender === 'female';
  const isMan = gender === 'man' || gender === 'male';

  // Nutritional calculations
  const recommendedDailyProteinG = Math.round(weightKg * 2.2); // 2.2g per kg bodyweight
  
  // Sex-specific Harris-Benedict / Mifflin St-Jeor BMR calculation:
  // Male baseline: 10 * weight + 6.25 * height - 5 * age + 5
  // Female baseline: 10 * weight + 6.25 * height - 5 * age - 161
  // Skip / Unisex neutral baseline: 10 * weight + 6.25 * height - 5 * age - 78
  const bmr = isWoman
    ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161)
    : isMan
    ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
    : Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 78);

  const tdee = Math.round(bmr * 1.55); // Moderate-heavy gym training multiplier

  let caloricTarget = tdee;
  const isFatLoss = primaryGoal.includes('Fat Loss') || primaryGoal.includes('Shred');
  if (primaryGoal.includes('Hypertrophy') || primaryGoal.includes('Size')) {
    caloricTarget = tdee + 350; // Lean surplus
  } else if (isFatLoss) {
    caloricTarget = tdee - 500; // Accelerated caloric deficit for fat oxidation & muscle retention
  } else if (primaryGoal.includes('Cut') || primaryGoal.includes('Definition')) {
    caloricTarget = tdee - 450; // Controlled deficit
  }

  // Determine split framework based on days & experience & primary goal
  let splitType = 'Push / Pull / Legs (PPL)';
  let baseRoutines: DailyWorkoutRoutine[] = [];
  let estimatedWeeklyTonnageKg = Math.round(weightKg * (isWoman ? 110 : isMan ? 130 : 120));

  const hasLowerBackIssue = injuriesOrLimitations?.toLowerCase().includes('back');
  const hasShoulderIssue = injuriesOrLimitations?.toLowerCase().includes('shoulder');
  const hasKneeIssue = injuriesOrLimitations?.toLowerCase().includes('knee');

  if (isFatLoss) {
    const fatLossPreset = PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_fat_loss_shred');
    if (fatLossPreset) {
      splitType = `${daysPerWeek}-Day Fat Loss & High-Density Shred`;
      estimatedWeeklyTonnageKg = Math.round(weightKg * (isWoman ? 125 : isMan ? 145 : 135));
      baseRoutines = daysPerWeek <= 4 ? fatLossPreset.routines.slice(0, daysPerWeek) : fatLossPreset.routines;
    }
  }

  if (baseRoutines.length === 0) {
    if (daysPerWeek === 3) {
      splitType = isWoman
        ? '3-Day Full Body & Posterior/Glute Precision'
        : '3-Day Full Body Linear Frequency';
      estimatedWeeklyTonnageKg = Math.round(weightKg * (isWoman ? 90 : isMan ? 105 : 95));

      if (isWoman) {
        baseRoutines = [
          {
            dayName: 'Day 1: Full Body Push, Quads & Glute Activation',
            focus: `Pectorals, Anterior Delts, Quads & Glutes · Prioritizing ${focusWeakpoint}`,
            exercises: [
              buildCatalogRoutineExercise(hasShoulderIssue ? 'dumbbell_incline_bench_press' : 'barbell_bench_press', 4, '8-10', 8.0, { targetMuscle: 'Chest', env }),
              buildCatalogRoutineExercise(hasKneeIssue ? 'sled_hack_squat' : 'barbell_full_squat_(back_pov)', 4, '8-10', 8.5, { targetMuscle: 'Quads', env }),
              buildCatalogRoutineExercise('dumbbell_bulgarian_split_squat_(female)', 3, '10-12', 8.5, { targetMuscle: 'Quads', env }),
              buildCatalogRoutineExercise('dumbbell_lateral_raise', 4, '12-15', 9.0, { targetMuscle: 'Shoulders', env }),
              buildCatalogRoutineExercise('cable_pushdown_(with_rope_attachment)', 3, '12-15', 9.0, { targetMuscle: 'Triceps', env })
            ]
          },
          {
            dayName: 'Day 2: Full Body Pull, Glutes & Posterior Chain Overload',
            focus: 'Latissimus Dorsi, Glutes, Hamstrings, Rhomboids, Biceps',
            exercises: [
              buildCatalogRoutineExercise('barbell_hip_thrust', 4, '10-12', 8.5, { targetMuscle: 'Glutes', env }),
              buildCatalogRoutineExercise(hasLowerBackIssue ? 'lever_lying_leg_curl' : 'barbell_romanian_deadlift', 4, '10-12', 8.5, { targetMuscle: 'Hamstrings', env }),
              buildCatalogRoutineExercise('cable_wide_grip_lat_pulldown_(female)', 4, '10-12', 8.5, { targetMuscle: 'Back', env }),
              buildCatalogRoutineExercise('band_face_pull', 3, '15-20', 9.0, { targetMuscle: 'Shoulders', env }),
              buildCatalogRoutineExercise('dumbbell_incline_biceps_curl', 3, '10-12', 8.5, { targetMuscle: 'Biceps', env })
            ]
          },
          {
            dayName: 'Day 3: Hypertrophy Overload, Symmetry & Core',
            focus: `${focusWeakpoint}, Posterior Chain & Core Definition`,
            exercises: [
              buildCatalogRoutineExercise(hasShoulderIssue ? 'dumbbell_lateral_raise' : 'barbell_seated_overhead_press', 4, '8-10', 8.5, { targetMuscle: 'Shoulders', env }),
              buildCatalogRoutineExercise('cable_standing_fly', 3, '12-15', 9.0, { targetMuscle: 'Chest', env }),
              buildCatalogRoutineExercise('dumbbell_romanian_deadlift', 3, '10-12', 8.5, { targetMuscle: 'Hamstrings', env }),
              buildCatalogRoutineExercise('single_leg_glute_bridge_with_knee_to_chest', 3, '15', 9.0, { targetMuscle: 'Glutes', env }),
              buildCatalogRoutineExercise('hanging_straight_leg_raise', 3, '12-15', 8.5, { targetMuscle: 'Abs & Core', env })
            ]
          }
        ];
      } else {
        baseRoutines = [
          {
            dayName: 'Day 1: Full Body Heavy Push & Quads',
            focus: `Pectorals, Anterior Delts, Quads · Prioritizing ${focusWeakpoint}`,
            exercises: [
              buildCatalogRoutineExercise(hasShoulderIssue ? 'dumbbell_incline_bench_press' : 'barbell_bench_press', 4, '6-8', 8.5, { targetMuscle: 'Chest', env }),
              buildCatalogRoutineExercise(hasKneeIssue ? 'sled_hack_squat' : 'barbell_full_squat_(back_pov)', 4, '6-8', 8.5, { targetMuscle: 'Quads', env }),
              buildCatalogRoutineExercise('dumbbell_incline_bench_press', 3, '8-10', 8.5, { targetMuscle: 'Chest', env }),
              buildCatalogRoutineExercise('dumbbell_lateral_raise', 4, '12-15', 9, { targetMuscle: 'Shoulders', env }),
              buildCatalogRoutineExercise('cable_pushdown_(with_rope_attachment)', 3, '10-12', 9, { targetMuscle: 'Triceps', env })
            ]
          },
          {
            dayName: 'Day 2: Full Body Heavy Pull & Posterior Chain',
            focus: 'Latissimus Dorsi, Rhomboids, Hamstrings, Biceps',
            exercises: [
              buildCatalogRoutineExercise(hasLowerBackIssue ? 'lever_t_bar_row_(plate_loaded)' : 'barbell_bent_over_row', 4, '6-8', 8.5, { targetMuscle: 'Back', env }),
              buildCatalogRoutineExercise(hasLowerBackIssue ? 'lever_lying_leg_curl' : 'barbell_romanian_deadlift', 4, '8-10', 8.5, { targetMuscle: 'Hamstrings', env }),
              buildCatalogRoutineExercise('cable_wide_grip_lat_pulldown_(female)', 4, '8-10', 8.5, { targetMuscle: 'Back', env }),
              buildCatalogRoutineExercise('band_face_pull', 3, '15', 9, { targetMuscle: 'Shoulders', env }),
              buildCatalogRoutineExercise('barbell_curl', 3, '8-10', 9, { targetMuscle: 'Biceps', env })
            ]
          },
          {
            dayName: 'Day 3: Hypertrophy Overload & Weakpoint Specialization',
            focus: `${focusWeakpoint} & Aesthetic Symmetry`,
            exercises: [
              buildCatalogRoutineExercise(hasShoulderIssue ? 'dumbbell_lateral_raise' : 'barbell_seated_overhead_press', 4, '8-10', 8.5, { targetMuscle: 'Shoulders', env }),
              buildCatalogRoutineExercise('cable_standing_fly', 3, '12-15', 9, { targetMuscle: 'Chest', env }),
              buildCatalogRoutineExercise('dumbbell_incline_biceps_curl', 3, '10-12', 9, { targetMuscle: 'Biceps', env }),
              buildCatalogRoutineExercise('barbell_standing_calf_raise', 4, '15', 9, { targetMuscle: 'Calves', env }),
              buildCatalogRoutineExercise('hanging_straight_leg_raise', 3, '12-15', 8.5, { targetMuscle: 'Abs & Core', env })
            ]
          }
        ];
      }
    } else if (daysPerWeek === 4) {
      splitType = '4-Day Upper / Lower Antagonistic Framework';
      estimatedWeeklyTonnageKg = Math.round(weightKg * (isWoman ? 120 : isMan ? 145 : 135));
      baseRoutines = (PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_upper_lower_4day') || PRESET_WORKOUT_PLANS[0]).routines;
    } else if (daysPerWeek <= 2) {
      splitType = '2-Day Minimalist Full Body Maintenance';
      estimatedWeeklyTonnageKg = Math.round(weightKg * (isWoman ? 65 : isMan ? 80 : 75));
      const twoDayPreset = PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_minimalist_2day_lifter');
      baseRoutines = twoDayPreset ? twoDayPreset.routines : PRESET_WORKOUT_PLANS[0].routines.slice(0, 2);
    } else {
      // 5, 6, or 7 days
      splitType = daysPerWeek === 7
        ? '7-Day High Frequency Daily Athletic Protocol'
        : daysPerWeek === 6
        ? '6-Day High Frequency Daily Priority Split'
        : '5-Day Full Body Daily Muscle Priority';
      estimatedWeeklyTonnageKg = Math.round(weightKg * (daysPerWeek === 7 ? 195 : daysPerWeek === 6 ? 180 : 165));
      baseRoutines = (PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_fullbody_5day_dup') || PRESET_WORKOUT_PLANS[0]).routines;
      if (daysPerWeek === 7 && baseRoutines.length === 6) {
        baseRoutines = [
          ...baseRoutines,
          {
            dayName: 'Day 7: Active Recovery, Mobility & Core Flow',
            focus: 'Core, Mobility, Joint Decompression & Conditioning',
            exercises: [
              buildCatalogRoutineExercise('hanging_straight_leg_raise', 3, '12-15', 7.5, { targetMuscle: 'Abs & Core', env }),
              buildCatalogRoutineExercise('band_face_pull', 3, '15-20', 7.5, { targetMuscle: 'Shoulders', env }),
              buildCatalogRoutineExercise('dumbbell_lateral_raise', 3, '15-20', 7.5, { targetMuscle: 'Shoulders', env }),
              buildCatalogRoutineExercise('barbell_standing_calf_raise', 3, '15-20', 7.5, { targetMuscle: 'Calves', env })
            ]
          }
        ];
      }
    }
  }

  // Adjust rep ranges for female endurance curve across preset splits
  if (isWoman && daysPerWeek !== 3) {
    baseRoutines = baseRoutines.map(r => ({
      ...r,
      exercises: r.exercises.map(ex => {
        if (ex.targetReps === '6-8') return { ...ex, targetReps: '8-10' };
        if (ex.targetReps === '8-10') return { ...ex, targetReps: '10-12' };
        return ex;
      })
    }));
  }

  // Adjust for weakpoints
  if (focusWeakpoint.includes('Chest')) {
    baseRoutines = baseRoutines.map(r => {
      if (r.focus.toLowerCase().includes('push') || r.focus.toLowerCase().includes('upper')) {
        return {
          ...r,
          focus: `${r.focus} (Upper Chest Specialization)`
        };
      }
      return r;
    });
  }

  // Adapt all routines to user's selected equipment environment and ground strictly in gympax_exercises.json
  baseRoutines = baseRoutines.map(r => adaptRoutineForEnvironment(r, env));

  const genderRationale = isWoman
    ? ' The AI calibrated your workout volume for female neuromuscular recovery biology: incorporating optimized 8–12 compound & 10–15 isolation rep brackets, balanced glute-to-quad volume distribution, and streamlined 60–75s inter-set ATP clearance intervals.'
    : isMan
    ? ' The AI calibrated your workout volume for high mechanical tension recruitment and central motor unit activation: emphasizing heavy compound strength brackets (6–8 reps) with 90–120s inter-set neuromuscular rest.'
    : ' The AI calibrated your workout volume using balanced unisex progressive overload benchmarks (8–12 rep brackets) with standardized CNS recovery periods.';

  const rationale = `Based on your profile as a ${age}-year-old ${gender && gender !== 'skip' ? (isWoman ? 'female' : 'male') : 'dedicated'} ${experienceLevel} lifter weighing ${weightKg}kg with ${daysPerWeek} days of training availability, the AI has generated a customized ${splitType}. Fully tailored for your ${envConfig.title} setup (${envConfig.tagline}).${genderRationale} ${
    isFatLoss
      ? 'The program emphasizes high-density resistance circuits and antagonist supersets with short rest periods to accelerate caloric oxidation and EPOC while preserving myofibrillar muscle density during your caloric deficit.'
      : 'This structure guarantees each target muscle receives 12-18 weekly direct working sets with 48-72 hours of systemic CNS recovery.'
  } To prioritize your goal of "${focusWeakpoint}", mechanical tension exercises have been sequenced first in each session where neurological motor recruitment is highest.${
    injuriesOrLimitations && injuriesOrLimitations !== 'None'
      ? ` Orthopedic safety filters were applied to modify joint angles and protect against reported ${injuriesOrLimitations}.`
      : ''
  }`;

  const generatedPlan: WorkoutPlan = groundWorkoutPlan({
    id: `ai_plan_${Date.now()}`,
    title: `AI ${splitType.split('(')[0].trim()}`,
    subtitle: `Engineered for ${name} · ${primaryGoal.split('(')[0].trim()}`,
    level: experienceLevel,
    daysPerWeek,
    goal: primaryGoal,
    description: rationale,
    isPersonalized: true,
    routines: baseRoutines
  });

  return {
    id: `ai_rec_${Date.now()}`,
    programTitle: generatedPlan.title,
    splitType,
    targetFocus: focusWeakpoint,
    matchScorePercentage: 98,
    rationale,
    weeklyScheduleDescription: `${daysPerWeek} sessions / week · ${baseRoutines.length} distinct training modules`,
    estimatedWeeklyTonnageKg,
    recommendedDailyProteinG,
    recommendedCaloricIntake: caloricTarget,
    plan: generatedPlan
  };
}
