import { ActiveWorkout, MuscleGroup } from '../types';
import { EXERCISE_DATABASE } from '../data/exercises';
import { mapMuscleToArea, MuscleArea } from './muscleAnalytics';

export type HistoryTimeframe = 'all' | '30d' | '90d' | 'year';

export type MovementPattern =
  | 'Horizontal Push'
  | 'Horizontal Pull'
  | 'Vertical Push'
  | 'Vertical Pull'
  | 'Squat (Knee-Dominant)'
  | 'Hinge (Posterior Chain)'
  | 'Arms & Isolation'
  | 'Core & Trunk';

export interface MuscleVolumeStat {
  name: string;
  area: MuscleArea;
  sets: number;
  volume: number;
  percentage: number;
  color: string;
}

export interface ExerciseUsageStat {
  exerciseId: string;
  name: string;
  primaryMuscle: string;
  tier: 'Compound' | 'Isolation';
  equipment: string;
  sessionsCount: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  maxWeight: number;
  avgWeight: number;
  pctOfTotalVolume: number;
}

export interface TypeDistributionStat {
  type: string;
  sets: number;
  volume: number;
  pctSets: number;
  pctVolume: number;
  color: string;
}

export interface SessionTimelineStat {
  id: string;
  date: string;
  rawDate: number;
  title: string;
  volume: number;
  sets: number;
  durationMinutes: number;
  prCount: number;
  avgRpe: number;
  density: number; // volume per minute
}

export interface RepBracketStat {
  bracket: string;
  label: string;
  description: string;
  sets: number;
  percentage: number;
  color: string;
}

export interface RpeBracketStat {
  range: string;
  label: string;
  sets: number;
  percentage: number;
  color: string;
}

export interface WorkoutHistoryAnalyticsResult {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  totalDurationMinutes: number;
  avgSessionDurationMinutes: number;
  avgWorkoutVolume: number;
  totalPrs: number;

  // 1. Muscles Graph Data
  muscleAreaData: MuscleVolumeStat[];
  specificMuscleData: MuscleVolumeStat[];

  // 2. Exercised Movements Graph Data
  topExercisesBySets: ExerciseUsageStat[];
  topExercisesByVolume: ExerciseUsageStat[];

  // 3. Type of Exercises Graph Data
  compoundVsIsolation: TypeDistributionStat[];
  movementPatterns: TypeDistributionStat[];
  equipmentModality: TypeDistributionStat[];

  // 4. Interesting Related Graphs Data
  sessionTimeline: SessionTimelineStat[];
  repBrackets: RepBracketStat[];
  rpeBrackets: RpeBracketStat[];
}

const MUSCLE_AREA_COLORS: Record<MuscleArea, string> = {
  Legs: '#3b82f6', // blue
  Chest: '#F6721D', // amber
  Back: '#10b981', // emerald
  Shoulders: '#8b5cf6', // purple
  Arms: '#ec4899', // pink
  Core: '#06b6d4' // cyan
};

const SPECIFIC_MUSCLE_COLORS: Record<string, string> = {
  Chest: '#F6721D',
  Back: '#10b981',
  Quads: '#3b82f6',
  Hamstrings: '#6366f1',
  Shoulders: '#8b5cf6',
  Biceps: '#ec4899',
  Triceps: '#d946ef',
  'Abs & Core': '#06b6d4',
  Glutes: '#14b8a6',
  Calves: '#0ea5e9',
  Forearms: '#f43f5e'
};

export function classifyMovementPattern(exerciseName: string, primaryMuscle?: string, equipment?: string): MovementPattern {
  const name = exerciseName.toLowerCase();
  const muscle = (primaryMuscle || '').toLowerCase();

  if (name.includes('deadlift') || name.includes('rdl') || name.includes('romanian') || name.includes('hip thrust') || name.includes('good morning') || muscle.includes('hamstring') || muscle.includes('glute')) {
    return 'Hinge (Posterior Chain)';
  }
  if (name.includes('squat') || name.includes('leg press') || name.includes('hack squat') || name.includes('lunge') || name.includes('split squat') || muscle.includes('quad')) {
    return 'Squat (Knee-Dominant)';
  }
  if (name.includes('overhead') || name.includes('military press') || name.includes('shoulder press') || name.includes('push press') || (muscle.includes('shoulder') && name.includes('press'))) {
    return 'Vertical Push';
  }
  if (name.includes('pull-up') || name.includes('chin-up') || name.includes('pulldown') || name.includes('lat pull')) {
    return 'Vertical Pull';
  }
  if (name.includes('bench') || name.includes('push-up') || name.includes('incline press') || name.includes('chest press') || name.includes('dip') || (muscle.includes('chest') && name.includes('press'))) {
    return 'Horizontal Push';
  }
  if (name.includes('row') || name.includes('t-bar') || name.includes('face pull')) {
    return 'Horizontal Pull';
  }
  if (muscle.includes('abs') || muscle.includes('core') || name.includes('crunch') || name.includes('plank') || name.includes('leg raise')) {
    return 'Core & Trunk';
  }

  return 'Arms & Isolation';
}

export function calculateWorkoutHistoryAnalytics(
  workouts: ActiveWorkout[],
  timeframe: HistoryTimeframe = 'all',
  unit: 'kg' | 'lbs' = 'kg'
): WorkoutHistoryAnalyticsResult {
  const unitMultiplier = unit === 'lbs' ? 2.20462 : 1;
  const now = Date.now();

  // Filter workouts by timeframe
  const filteredWorkouts = workouts.filter(w => {
    if (timeframe === 'all') return true;
    const diffDays = (now - w.startTime) / (1000 * 60 * 60 * 24);
    if (timeframe === '30d') return diffDays <= 30;
    if (timeframe === '90d') return diffDays <= 90;
    if (timeframe === 'year') return diffDays <= 365;
    return true;
  });

  // Sort chronological for timeline
  const chronologicalWorkouts = [...filteredWorkouts].sort((a, b) => a.startTime - b.startTime);

  let grandTotalVolumeUnit = 0;
  let grandTotalSets = 0;
  let grandTotalReps = 0;
  let grandTotalDurationMinutes = 0;
  let grandTotalPrs = 0;

  // Trackers
  const areaSets: Record<MuscleArea, number> = {
    Legs: 0,
    Chest: 0,
    Back: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0
  };
  const areaVolumes: Record<MuscleArea, number> = {
    Legs: 0,
    Chest: 0,
    Back: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0
  };

  const specificMuscleSets: Record<string, number> = {};
  const specificMuscleVolumes: Record<string, number> = {};

  const exerciseStatsMap = new Map<
    string,
    {
      id: string;
      name: string;
      primaryMuscle: string;
      tier: 'Compound' | 'Isolation';
      equipment: string;
      sessionDates: Set<number>;
      sets: number;
      reps: number;
      volumeKg: number;
      maxWeightKg: number;
    }
  >();

  let compoundSets = 0;
  let compoundVolume = 0;
  let isolationSets = 0;
  let isolationVolume = 0;

  const movementPatternSets: Record<MovementPattern, number> = {
    'Horizontal Push': 0,
    'Horizontal Pull': 0,
    'Vertical Push': 0,
    'Vertical Pull': 0,
    'Squat (Knee-Dominant)': 0,
    'Hinge (Posterior Chain)': 0,
    'Arms & Isolation': 0,
    'Core & Trunk': 0
  };
  const movementPatternVolumes: Record<MovementPattern, number> = {
    'Horizontal Push': 0,
    'Horizontal Pull': 0,
    'Vertical Push': 0,
    'Vertical Pull': 0,
    'Squat (Knee-Dominant)': 0,
    'Hinge (Posterior Chain)': 0,
    'Arms & Isolation': 0,
    'Core & Trunk': 0
  };

  const equipmentSets: Record<string, number> = {};
  const equipmentVolumes: Record<string, number> = {};

  let repBracketStrength = 0; // 1-5 reps
  let repBracketHypertrophy = 0; // 6-12 reps
  let repBracketEndurance = 0; // 13+ reps

  let rpeLight = 0; // RPE < 7
  let rpeModerate = 0; // RPE 7-8
  let rpeTarget = 0; // RPE 8.5-9
  let rpeMax = 0; // RPE 9.5-10

  const sessionTimeline: SessionTimelineStat[] = [];

  chronologicalWorkouts.forEach(w => {
    const sessionDurationMin = Math.max(1, Math.round(w.durationSeconds / 60));
    grandTotalDurationMinutes += sessionDurationMin;
    grandTotalPrs += w.prCount || 0;

    let sessionVolumeKg = 0;
    let sessionSetsCount = 0;
    let sessionRpeSum = 0;
    let sessionRpeCount = 0;

    w.exercises.forEach(ex => {
      const dbEx = EXERCISE_DATABASE.find(e => e.id === ex.exerciseId);
      const primaryMuscle = ex.targetMuscle || dbEx?.primaryMuscle || 'Chest';
      const area = mapMuscleToArea(primaryMuscle);
      const tier: 'Compound' | 'Isolation' = dbEx?.tier || (ex.name.toLowerCase().includes('press') || ex.name.toLowerCase().includes('squat') || ex.name.toLowerCase().includes('deadlift') || ex.name.toLowerCase().includes('row') ? 'Compound' : 'Isolation');
      const equipment = ex.equipment || dbEx?.equipment || 'Barbell';
      const pattern = classifyMovementPattern(ex.name, primaryMuscle, equipment);

      const exKey = ex.exerciseId || ex.name;
      let exStat = exerciseStatsMap.get(exKey);
      if (!exStat) {
        exStat = {
          id: exKey,
          name: ex.name,
          primaryMuscle,
          tier,
          equipment,
          sessionDates: new Set(),
          sets: 0,
          reps: 0,
          volumeKg: 0,
          maxWeightKg: 0
        };
        exerciseStatsMap.set(exKey, exStat);
      }
      exStat.sessionDates.add(w.startTime);

      ex.sets.forEach(set => {
        if (set.completed) {
          const reps = set.reps || 0;
          const weightKg = set.weightKg || (set.weightLbs ? set.weightLbs / 2.20462 : 0);
          const setVolKg = weightKg * reps;

          sessionVolumeKg += setVolKg;
          sessionSetsCount += 1;
          grandTotalSets += 1;
          grandTotalReps += reps;

          if (set.rpe && set.rpe > 0) {
            sessionRpeSum += set.rpe;
            sessionRpeCount += 1;

            if (set.rpe < 7) rpeLight++;
            else if (set.rpe <= 8) rpeModerate++;
            else if (set.rpe <= 9) rpeTarget++;
            else rpeMax++;
          }

          // Rep brackets
          if (reps > 0) {
            if (reps <= 5) repBracketStrength++;
            else if (reps <= 12) repBracketHypertrophy++;
            else repBracketEndurance++;
          }

          // Muscle area
          areaSets[area] += 1;
          areaVolumes[area] += setVolKg;

          // Specific muscle
          specificMuscleSets[primaryMuscle] = (specificMuscleSets[primaryMuscle] || 0) + 1;
          specificMuscleVolumes[primaryMuscle] = (specificMuscleVolumes[primaryMuscle] || 0) + setVolKg;

          // Tier
          if (tier === 'Compound') {
            compoundSets += 1;
            compoundVolume += setVolKg;
          } else {
            isolationSets += 1;
            isolationVolume += setVolKg;
          }

          // Movement pattern
          movementPatternSets[pattern] += 1;
          movementPatternVolumes[pattern] += setVolKg;

          // Equipment
          equipmentSets[equipment] = (equipmentSets[equipment] || 0) + 1;
          equipmentVolumes[equipment] = (equipmentVolumes[equipment] || 0) + setVolKg;

          // Exercise stats
          exStat.sets += 1;
          exStat.reps += reps;
          exStat.volumeKg += setVolKg;
          if (weightKg > exStat.maxWeightKg) {
            exStat.maxWeightKg = weightKg;
          }
        }
      });
    });

    const sessionVolUnit = Math.round(sessionVolumeKg * unitMultiplier);
    grandTotalVolumeUnit += sessionVolUnit;

    const avgRpe = sessionRpeCount > 0 ? Math.round((sessionRpeSum / sessionRpeCount) * 10) / 10 : 8.0;
    const density = sessionDurationMin > 0 ? Math.round(sessionVolUnit / sessionDurationMin) : 0;

    sessionTimeline.push({
      id: w.id,
      date: w.date || new Date(w.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      rawDate: w.startTime,
      title: w.title,
      volume: sessionVolUnit,
      sets: sessionSetsCount,
      durationMinutes: sessionDurationMin,
      prCount: w.prCount || 0,
      avgRpe,
      density
    });
  });

  // Calculate Muscle Area Breakdown
  const muscleAreas: MuscleArea[] = ['Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core'];
  const muscleAreaData: MuscleVolumeStat[] = muscleAreas.map(area => {
    const vol = Math.round(areaVolumes[area] * unitMultiplier);
    const pct = grandTotalVolumeUnit > 0 ? Math.round((vol / grandTotalVolumeUnit) * 100) : 0;
    return {
      name: area,
      area,
      sets: areaSets[area],
      volume: vol,
      percentage: pct,
      color: MUSCLE_AREA_COLORS[area]
    };
  }).sort((a, b) => b.volume - a.volume);

  // Specific Muscle Breakdown
  const specificMuscleData: MuscleVolumeStat[] = Object.keys(specificMuscleVolumes).map(m => {
    const vol = Math.round(specificMuscleVolumes[m] * unitMultiplier);
    const pct = grandTotalVolumeUnit > 0 ? Math.round((vol / grandTotalVolumeUnit) * 100) : 0;
    return {
      name: m,
      area: mapMuscleToArea(m),
      sets: specificMuscleSets[m] || 0,
      volume: vol,
      percentage: pct,
      color: SPECIFIC_MUSCLE_COLORS[m] || '#a1a1aa'
    };
  }).sort((a, b) => b.volume - a.volume);

  // Exercise Usage Ranking
  const allExerciseStats: ExerciseUsageStat[] = Array.from(exerciseStatsMap.values()).map(ex => {
    const volUnit = Math.round(ex.volumeKg * unitMultiplier);
    const maxWeightUnit = Math.round(ex.maxWeightKg * unitMultiplier);
    const avgWeightUnit = ex.sets > 0 && ex.reps > 0 ? Math.round((volUnit / ex.reps) * 10) / 10 : 0;
    const pctVol = grandTotalVolumeUnit > 0 ? Math.round((volUnit / grandTotalVolumeUnit) * 100) : 0;

    return {
      exerciseId: ex.id,
      name: ex.name,
      primaryMuscle: ex.primaryMuscle,
      tier: ex.tier,
      equipment: ex.equipment,
      sessionsCount: ex.sessionDates.size,
      totalSets: ex.sets,
      totalReps: ex.reps,
      totalVolume: volUnit,
      maxWeight: maxWeightUnit,
      avgWeight: avgWeightUnit,
      pctOfTotalVolume: pctVol
    };
  });

  const topExercisesBySets = [...allExerciseStats].sort((a, b) => b.totalSets - a.totalSets).slice(0, 10);
  const topExercisesByVolume = [...allExerciseStats].sort((a, b) => b.totalVolume - a.totalVolume).slice(0, 10);

  // Compound vs Isolation
  const totalTierSets = compoundSets + isolationSets;
  const totalTierVol = (compoundVolume + isolationVolume) * unitMultiplier;
  const compoundVsIsolation: TypeDistributionStat[] = [
    {
      type: 'Compound Movements',
      sets: compoundSets,
      volume: Math.round(compoundVolume * unitMultiplier),
      pctSets: totalTierSets > 0 ? Math.round((compoundSets / totalTierSets) * 100) : 0,
      pctVolume: totalTierVol > 0 ? Math.round(((compoundVolume * unitMultiplier) / totalTierVol) * 100) : 0,
      color: '#F6721D' // amber
    },
    {
      type: 'Isolation Movements',
      sets: isolationSets,
      volume: Math.round(isolationVolume * unitMultiplier),
      pctSets: totalTierSets > 0 ? Math.round((isolationSets / totalTierSets) * 100) : 0,
      pctVolume: totalTierVol > 0 ? Math.round(((isolationVolume * unitMultiplier) / totalTierVol) * 100) : 0,
      color: '#8b5cf6' // purple
    }
  ];

  // Movement Patterns
  const patternColors: Record<MovementPattern, string> = {
    'Horizontal Push': '#F6721D',
    'Horizontal Pull': '#10b981',
    'Vertical Push': '#a855f7',
    'Vertical Pull': '#06b6d4',
    'Squat (Knee-Dominant)': '#3b82f6',
    'Hinge (Posterior Chain)': '#ec4899',
    'Arms & Isolation': '#f43f5e',
    'Core & Trunk': '#14b8a6'
  };

  const movementPatterns: TypeDistributionStat[] = (Object.keys(movementPatternSets) as MovementPattern[])
    .map(pattern => {
      const vol = Math.round(movementPatternVolumes[pattern] * unitMultiplier);
      const sets = movementPatternSets[pattern];
      const pctSets = grandTotalSets > 0 ? Math.round((sets / grandTotalSets) * 100) : 0;
      const pctVol = grandTotalVolumeUnit > 0 ? Math.round((vol / grandTotalVolumeUnit) * 100) : 0;
      return {
        type: pattern,
        sets,
        volume: vol,
        pctSets,
        pctVolume: pctVol,
        color: patternColors[pattern]
      };
    })
    .filter(p => p.sets > 0)
    .sort((a, b) => b.sets - a.sets);

  // Equipment Modality
  const equipmentColors: Record<string, string> = {
    Barbell: '#F6721D',
    Dumbbell: '#3b82f6',
    Cable: '#10b981',
    Machine: '#8b5cf6',
    Bodyweight: '#06b6d4',
    Other: '#71717a'
  };

  const equipmentModality: TypeDistributionStat[] = Object.keys(equipmentSets)
    .map(eq => {
      const vol = Math.round(equipmentVolumes[eq] * unitMultiplier);
      const sets = equipmentSets[eq];
      const pctSets = grandTotalSets > 0 ? Math.round((sets / grandTotalSets) * 100) : 0;
      const pctVol = grandTotalVolumeUnit > 0 ? Math.round((vol / grandTotalVolumeUnit) * 100) : 0;
      return {
        type: eq,
        sets,
        volume: vol,
        pctSets,
        pctVolume: pctVol,
        color: equipmentColors[eq] || '#a1a1aa'
      };
    })
    .filter(e => e.sets > 0)
    .sort((a, b) => b.sets - a.sets);

  // Rep Brackets
  const totalRepBracketSets = repBracketStrength + repBracketHypertrophy + repBracketEndurance;
  const repBrackets: RepBracketStat[] = [
    {
      bracket: 'Strength (1–5 reps)',
      label: '1–5 Reps',
      description: 'Heavy CNS motor-unit recruitment & mechanical tension',
      sets: repBracketStrength,
      percentage: totalRepBracketSets > 0 ? Math.round((repBracketStrength / totalRepBracketSets) * 100) : 0,
      color: '#3b82f6'
    },
    {
      bracket: 'Hypertrophy (6–12 reps)',
      label: '6–12 Reps',
      description: 'Gold standard bodybuilding muscular hypertrophy sweet spot',
      sets: repBracketHypertrophy,
      percentage: totalRepBracketSets > 0 ? Math.round((repBracketHypertrophy / totalRepBracketSets) * 100) : 0,
      color: '#F6721D'
    },
    {
      bracket: 'Metabolic & Pump (13+ reps)',
      label: '13+ Reps',
      description: 'Sarcoplasmic conditioning, blood flow & endurance pump',
      sets: repBracketEndurance,
      percentage: totalRepBracketSets > 0 ? Math.round((repBracketEndurance / totalRepBracketSets) * 100) : 0,
      color: '#ec4899'
    }
  ];

  // RPE Brackets
  const totalRpeLogged = rpeLight + rpeModerate + rpeTarget + rpeMax;
  const rpeBrackets: RpeBracketStat[] = [
    {
      range: 'RPE < 7',
      label: 'Warmup & Submaximal',
      sets: rpeLight,
      percentage: totalRpeLogged > 0 ? Math.round((rpeLight / totalRpeLogged) * 100) : 0,
      color: '#71717a'
    },
    {
      range: 'RPE 7 – 8',
      label: 'Controlled Growth (2-3 RIR)',
      sets: rpeModerate,
      percentage: totalRpeLogged > 0 ? Math.round((rpeModerate / totalRpeLogged) * 100) : 0,
      color: '#10b981'
    },
    {
      range: 'RPE 8.5 – 9',
      label: 'Hypertrophy Effective Reps (1 RIR)',
      sets: rpeTarget,
      percentage: totalRpeLogged > 0 ? Math.round((rpeTarget / totalRpeLogged) * 100) : 0,
      color: '#F6721D'
    },
    {
      range: 'RPE 9.5 – 10',
      label: 'Max Effort / Near Failure (0 RIR)',
      sets: rpeMax,
      percentage: totalRpeLogged > 0 ? Math.round((rpeMax / totalRpeLogged) * 100) : 0,
      color: '#ef4444'
    }
  ];

  const avgSessionDurationMinutes =
    filteredWorkouts.length > 0 ? Math.round(grandTotalDurationMinutes / filteredWorkouts.length) : 0;
  const avgWorkoutVolume =
    filteredWorkouts.length > 0 ? Math.round(grandTotalVolumeUnit / filteredWorkouts.length) : 0;

  return {
    totalWorkouts: filteredWorkouts.length,
    totalVolume: grandTotalVolumeUnit,
    totalSets: grandTotalSets,
    totalReps: grandTotalReps,
    totalDurationMinutes: grandTotalDurationMinutes,
    avgSessionDurationMinutes,
    avgWorkoutVolume,
    totalPrs: grandTotalPrs,
    muscleAreaData,
    specificMuscleData,
    topExercisesBySets,
    topExercisesByVolume,
    compoundVsIsolation,
    movementPatterns,
    equipmentModality,
    sessionTimeline,
    repBrackets,
    rpeBrackets
  };
}
