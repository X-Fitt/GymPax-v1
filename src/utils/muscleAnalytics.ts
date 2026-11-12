import { ActiveWorkout, WorkoutPlan, DailyWorkoutRoutine } from '../types';
import { findExerciseDefinition, resolveCatalogExercise, groundWorkoutPlan } from '../data/exercises';

export type MuscleArea = 'Legs' | 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Core';

export interface MuscleEffortData {
  area: MuscleArea;
  label: string;
  subMuscles: string;
  volumeUnit: number; // in current user unit
  sets: number;
  exerciseCount: number;
  percentage: number; // 0 - 100
  targetPercentage: number;
  status: 'optimal' | 'balanced' | 'high' | 'lagging';
  color: string;
}

export interface BalanceSuggestion {
  area: MuscleArea;
  currentPercentage: number;
  targetPercentage: number;
  deficit: number;
  summary: string;
  advice: string;
  recommendedExercises: { id: string; name: string }[];
}

const MUSCLE_TARGET_PERCENTAGES: Record<MuscleArea, number> = {
  Legs: 26,
  Back: 22,
  Chest: 18,
  Shoulders: 14,
  Arms: 12,
  Core: 8
};

const MUSCLE_COLORS: Record<MuscleArea, string> = {
  Legs: '#3b82f6', // blue
  Chest: '#F6721D', // amber
  Back: '#10b981', // emerald
  Shoulders: '#8b5cf6', // purple
  Arms: '#ec4899', // pink
  Core: '#06b6d4' // cyan
};

const MUSCLE_SUB_LABELS: Record<MuscleArea, string> = {
  Legs: 'Quads, Hamstrings, Glutes, Calves',
  Chest: 'Pectoralis Major & Clavicular Head',
  Back: 'Latissimus Dorsi, Rhomboids, Traps',
  Shoulders: 'Lateral, Anterior & Posterior Delts',
  Arms: 'Biceps Brachii, Triceps Horseshoe',
  Core: 'Rectus Abdominis, Obliques & TVA'
};

export function mapMuscleToArea(muscle?: string): MuscleArea {
  if (!muscle) return 'Chest';
  const m = muscle.toLowerCase();
  if (m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('calf') || m.includes('calves') || m.includes('leg')) {
    return 'Legs';
  }
  if (m.includes('back') || m.includes('lat') || m.includes('rhomboid') || m.includes('trap')) {
    return 'Back';
  }
  if (m.includes('chest') || m.includes('pec')) {
    return 'Chest';
  }
  if (m.includes('shoulder') || m.includes('delt')) {
    return 'Shoulders';
  }
  if (m.includes('bicep') || m.includes('tricep') || m.includes('arm') || m.includes('forearm')) {
    return 'Arms';
  }
  if (m.includes('abs') || m.includes('core') || m.includes('abdom')) {
    return 'Core';
  }
  return 'Chest';
}

export function filterWorkoutsByTimeframe(
  workouts: ActiveWorkout[],
  timeframe: 'week' | 'month' | 'year'
): ActiveWorkout[] {
  if (!workouts || workouts.length === 0) return [];

  const now = Date.now();
  const cutoffDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
  const cutoffMs = now - cutoffDays * 24 * 60 * 60 * 1000;

  const filtered = workouts.filter(w => {
    if (w.startTime && w.startTime > 0) {
      return w.startTime >= cutoffMs;
    }
    return true;
  });

  // If filtered is empty but workouts exist, fallback to all available workouts
  // so the user still gets meaningful distribution analytics
  if (filtered.length === 0 && workouts.length > 0) {
    return timeframe === 'week' ? workouts.slice(0, 3) : timeframe === 'month' ? workouts.slice(0, 10) : workouts;
  }

  return filtered;
}

export function calculateMuscleEffort(
  workouts: ActiveWorkout[],
  timeframe: 'week' | 'month' | 'year',
  unit: 'kg' | 'lbs' = 'kg'
): {
  distribution: MuscleEffortData[];
  totalVolume: number;
  totalSets: number;
  totalExercises: number;
  suggestions: BalanceSuggestion[];
} {
  const filteredWorkouts = filterWorkoutsByTimeframe(workouts, timeframe);

  const areaVolumes: Record<MuscleArea, number> = {
    Legs: 0,
    Chest: 0,
    Back: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0
  };

  const areaSets: Record<MuscleArea, number> = {
    Legs: 0,
    Chest: 0,
    Back: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0
  };

  const areaExercises: Record<MuscleArea, Set<string>> = {
    Legs: new Set(),
    Chest: new Set(),
    Back: new Set(),
    Shoulders: new Set(),
    Arms: new Set(),
    Core: new Set()
  };

  let grandTotalVolumeKg = 0;
  let grandTotalSets = 0;

  filteredWorkouts.forEach(workout => {
    workout.exercises.forEach(ex => {
      // Find muscle group from exercise or database
      const dbEx = findExerciseDefinition(ex.exerciseId);
      const muscle = ex.targetMuscle || dbEx?.primaryMuscle || 'Chest';
      const area = mapMuscleToArea(muscle);

      areaExercises[area].add(ex.exerciseId || ex.name);

      ex.sets.forEach(set => {
        if (set.completed) {
          const setVolKg = (set.weightKg || 0) * (set.reps || 0);
          areaVolumes[area] += setVolKg;
          areaSets[area] += 1;
          grandTotalVolumeKg += setVolKg;
          grandTotalSets += 1;
        }
      });
    });
  });

  const conversionMultiplier = unit === 'lbs' ? 2.20462 : 1;
  const grandTotalVolumeUnit = Math.round(grandTotalVolumeKg * conversionMultiplier);

  const areas: MuscleArea[] = ['Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core'];

  const distribution: MuscleEffortData[] = areas.map(area => {
    const volKg = areaVolumes[area];
    const volUnit = Math.round(volKg * conversionMultiplier);
    const sets = areaSets[area];
    const exerciseCount = areaExercises[area].size;

    // Weight percentage by volume (or sets if total volume is 0)
    let percentage = 0;
    if (grandTotalVolumeKg > 0) {
      percentage = Math.round((volKg / grandTotalVolumeKg) * 100);
    } else if (grandTotalSets > 0) {
      percentage = Math.round((sets / grandTotalSets) * 100);
    }

    const targetPct = MUSCLE_TARGET_PERCENTAGES[area];

    let status: MuscleEffortData['status'] = 'balanced';
    if (percentage < targetPct * 0.6) {
      status = 'lagging';
    } else if (percentage >= targetPct * 1.4) {
      status = 'high';
    } else if (Math.abs(percentage - targetPct) <= 4) {
      status = 'optimal';
    }

    return {
      area,
      label: area,
      subMuscles: MUSCLE_SUB_LABELS[area],
      volumeUnit: volUnit,
      sets,
      exerciseCount,
      percentage,
      targetPercentage: targetPct,
      status,
      color: MUSCLE_COLORS[area]
    };
  });

  // Sort by volume descending for display
  distribution.sort((a, b) => b.percentage - a.percentage);

  // Generate suggestions for lagging muscle groups
  const suggestions: BalanceSuggestion[] = [];

  distribution.forEach(item => {
    if (item.status === 'lagging' || item.percentage < item.targetPercentage * 0.7) {
      const deficit = item.targetPercentage - item.percentage;

      let advice = '';
      let recommendedExercises: { id: string; name: string }[] = [];

      switch (item.area) {
        case 'Legs':
          advice = `Your lower body received only ${item.percentage}% of your effort (target: ${item.targetPercentage}%). Leg musculature drives systemic testosterone/GH release and prevents structural imbalances.`;
          recommendedExercises = [
            { id: 'barbell_back_squat', name: 'Barbell Back Squat' },
            { id: 'hack_squat_machine', name: 'Hack Squat Machine' },
            { id: 'romanian_deadlift_barbell', name: 'Romanian Deadlift' },
            { id: 'leg_extension_machine', name: 'Leg Extension Machine' }
          ];
          break;
        case 'Back':
          advice = `Back training accounted for only ${item.percentage}% of volume (target: ${item.targetPercentage}%). Strengthening lats and rhomboids improves shoulder posture and V-taper aesthetics.`;
          recommendedExercises = [
            { id: 'lat_pulldown_wide', name: 'Wide Lat Pulldown' },
            { id: 'barbell_bent_row', name: 'Barbell Bent-Over Row' },
            { id: 'seated_cable_row', name: 'Seated Cable Row' }
          ];
          break;
        case 'Chest':
          advice = `Pectoral effort is lower than optimal at ${item.percentage}% (target: ${item.targetPercentage}%). Adding horizontal pressing and cable flyes will bring upper chest fullness up.`;
          recommendedExercises = [
            { id: 'incline_dumbbell_press', name: 'Incline Dumbbell Press' },
            { id: 'cable_pec_flye', name: 'Cable Pec Flye' }
          ];
          break;
        case 'Shoulders':
          advice = `Deltoid work is at ${item.percentage}% (target: ${item.targetPercentage}%). Prioritize lateral raises and overhead presses for round shoulder caps.`;
          recommendedExercises = [
            { id: 'dumbbell_lateral_raise', name: 'Dumbbell Lateral Raise' },
            { id: 'face_pull_rope', name: 'Rope Face Pull' }
          ];
          break;
        case 'Arms':
          advice = `Arm volume is currently low (${item.percentage}% vs ${item.targetPercentage}% target). Adding focused isolation curls and triceps extensions will improve arm symmetry.`;
          recommendedExercises = [
            { id: 'standing_barbell_curl', name: 'Barbell Biceps Curl' },
            { id: 'triceps_rope_pushdown', name: 'Cable Rope Pushdown' }
          ];
          break;
        case 'Core':
          advice = `Abdominal training accounted for only ${item.percentage}% of workload. Strengthening core stability protects the lumbar spine on heavy compound lifts.`;
          recommendedExercises = [
            { id: 'hanging_leg_raise', name: 'Hanging Leg Raise' }
          ];
          break;
      }

      suggestions.push({
        area: item.area,
        currentPercentage: item.percentage,
        targetPercentage: item.targetPercentage,
        deficit,
        summary: `${item.area} is currently lagging (${item.percentage}% of total effort vs ${item.targetPercentage}% target).`,
        advice,
        recommendedExercises
      });
    }
  });

  // Sort suggestions by greatest deficit (urgency of focus), prioritizing major kinetic chains over shoulders
  suggestions.sort((a, b) => {
    if (b.deficit !== a.deficit) {
      return b.deficit - a.deficit;
    }
    const priority: Record<MuscleArea, number> = {
      Legs: 6,
      Back: 5,
      Chest: 4,
      Arms: 3,
      Core: 2,
      Shoulders: 1
    };
    return (priority[b.area] || 0) - (priority[a.area] || 0);
  });

  return {
    distribution,
    totalVolume: grandTotalVolumeUnit,
    totalSets: grandTotalSets,
    totalExercises: Object.values(areaExercises).reduce((acc, set) => acc + set.size, 0),
    suggestions
  };
}

export function adjustPlanForMultipleMuscles(
  currentPlan: WorkoutPlan,
  targetAreas: MuscleArea[]
): { updatedPlan: WorkoutPlan; exercisesAdded: string[] } {
  if (!targetAreas || targetAreas.length === 0) {
    return { updatedPlan: currentPlan, exercisesAdded: [] };
  }

  const updatedRoutines: DailyWorkoutRoutine[] = currentPlan.routines.map(routine => ({
    ...routine,
    exercises: [...routine.exercises]
  }));

  const exercisesToAdd: Record<MuscleArea, { exerciseId: string; defaultSets: number; targetReps: string; targetRpe: number }[]> = {
    Legs: [
      { exerciseId: 'sled_hack_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
      { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
    ],
    Back: [
      { exerciseId: 'cable_wide_grip_lat_pulldown_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
      { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
    ],
    Chest: [
      { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
      { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
    ],
    Shoulders: [
      { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
      { exerciseId: 'band_face_pull', defaultSets: 3, targetReps: '15', targetRpe: 8.5 }
    ],
    Arms: [
      { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
      { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
    ],
    Core: [
      { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '15', targetRpe: 8.5 }
    ]
  };

  const allAddedNames: string[] = [];

  targetAreas.forEach(area => {
    const toAdd = exercisesToAdd[area] || exercisesToAdd.Legs;

    // Find the most suitable routine to insert the exercises into
    let targetRoutineIndex = -1;

    if (area === 'Legs') {
      targetRoutineIndex = updatedRoutines.findIndex(
        r => r.focus.toLowerCase().includes('leg') || r.dayName.toLowerCase().includes('leg') || r.dayName.toLowerCase().includes('lower')
      );
    } else if (area === 'Back') {
      targetRoutineIndex = updatedRoutines.findIndex(
        r => r.focus.toLowerCase().includes('pull') || r.dayName.toLowerCase().includes('pull') || r.focus.toLowerCase().includes('back')
      );
    } else if (area === 'Chest') {
      targetRoutineIndex = updatedRoutines.findIndex(
        r => r.focus.toLowerCase().includes('push') || r.dayName.toLowerCase().includes('push') || r.focus.toLowerCase().includes('chest')
      );
    } else if (area === 'Shoulders') {
      targetRoutineIndex = updatedRoutines.findIndex(
        r => r.focus.toLowerCase().includes('shoulder') || r.focus.toLowerCase().includes('delt') || r.focus.toLowerCase().includes('push')
      );
    } else if (area === 'Arms') {
      targetRoutineIndex = updatedRoutines.findIndex(
        r => r.focus.toLowerCase().includes('arm') || r.focus.toLowerCase().includes('gun') || r.focus.toLowerCase().includes('pull') || r.focus.toLowerCase().includes('push')
      );
    } else if (area === 'Core') {
      targetRoutineIndex = updatedRoutines.findIndex(
        r => r.focus.toLowerCase().includes('core') || r.focus.toLowerCase().includes('abs') || r.focus.toLowerCase().includes('leg')
      );
    }

    // Fallback: day with fewest exercises
    if (targetRoutineIndex === -1 && updatedRoutines.length > 0) {
      let minExercises = 999;
      updatedRoutines.forEach((r, idx) => {
        if (r.exercises.length < minExercises) {
          minExercises = r.exercises.length;
          targetRoutineIndex = idx;
        }
      });
    }

    if (targetRoutineIndex >= 0 && updatedRoutines[targetRoutineIndex]) {
      const routine = updatedRoutines[targetRoutineIndex];
      toAdd.forEach(item => {
        const resolved = resolveCatalogExercise(item.exerciseId);
        const alreadyHas = routine.exercises.some(e => e.exerciseId === resolved.id);
        if (!alreadyHas) {
          routine.exercises.push({
            ...item,
            id: resolved.id,
            exerciseId: resolved.id,
            name: resolved.name,
            primary_muscle: resolved.primary_muscle || resolved.rawPrimaryMuscle || resolved.primaryMuscle,
            cdn_url: resolved.cdn_url || resolved.cdnUrl || ''
          });
          allAddedNames.push(resolved.name);
        }
      });
    }
  });

  const cleanBaseTitle = currentPlan.title.split('(')[0].trim();
  const focusLabel = targetAreas.join(' + ');

  const updatedPlan: WorkoutPlan = groundWorkoutPlan({
    ...currentPlan,
    title: `${cleanBaseTitle} (${focusLabel} Focus)`,
    subtitle: `Customized with extra ${focusLabel} specialization to eliminate muscular deficits`,
    routines: updatedRoutines
  });

  return {
    updatedPlan,
    exercisesAdded: allAddedNames.length > 0 ? allAddedNames : ['Custom exercises added']
  };
}

export function adjustPlanForLaggingMuscle(
  currentPlan: WorkoutPlan,
  laggingArea: MuscleArea
): { updatedPlan: WorkoutPlan; exercisesAdded: string[] } {
  return adjustPlanForMultipleMuscles(currentPlan, [laggingArea]);
}
