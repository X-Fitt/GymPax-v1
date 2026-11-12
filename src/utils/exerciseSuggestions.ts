import { ActiveWorkout, WorkoutExercise, WorkoutSet, SetType } from '../types';

export interface LastExercisePerformance {
  workoutId: string;
  workoutTitle: string;
  date: string;
  daysAgo: number;
  exerciseName: string;
  sets: WorkoutSet[];
  maxWeightKg: number;
  maxWeightLbs: number;
  bestSet: WorkoutSet;
  lastCompletedSet: WorkoutSet;
}

export interface SetSuggestion {
  setNumber: number;
  type: SetType;
  weightKg: number;
  weightLbs: number;
  reps: number;
  rpe?: number;
  reason: string;
  previousBestDisplay: string;
  isOverloadProgression: boolean;
  historicalReference?: {
    date: string;
    workoutTitle: string;
    setWeightKg: number;
    setWeightLbs: number;
    setReps: number;
    setRpe?: number;
  };
}

/**
 * Normalizes an exercise name or ID for fuzzy matching across history
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds the most recent completed performance of a specific exercise in workout history
 */
export function getLastExercisePerformance(
  exerciseId: string,
  exerciseName: string,
  workoutHistory: ActiveWorkout[]
): LastExercisePerformance | null {
  if (!workoutHistory || workoutHistory.length === 0) return null;

  const targetId = normalizeKey(exerciseId);
  const targetName = normalizeKey(exerciseName);

  // Sort history chronologically descending (most recent first)
  const sorted = [...workoutHistory].sort((a, b) => {
    const timeA = a.startTime || (a.date ? new Date(a.date).getTime() : 0);
    const timeB = b.startTime || (b.date ? new Date(b.date).getTime() : 0);
    return timeB - timeA;
  });

  for (const session of sorted) {
    if (!session.exercises || session.exercises.length === 0) continue;

    const matchedExercise = session.exercises.find(ex => {
      const exId = normalizeKey(ex.exerciseId);
      const exName = normalizeKey(ex.name);
      return exId === targetId || exName === targetName || exId.includes(targetId) || targetId.includes(exId);
    });

    if (matchedExercise && matchedExercise.sets && matchedExercise.sets.length > 0) {
      // Find completed sets with valid weight and reps
      const completedSets = matchedExercise.sets.filter(
        s => (s.completed || s.weightKg > 0) && s.reps > 0
      );

      if (completedSets.length > 0) {
        let maxKg = 0;
        let bestSet = completedSets[0];

        completedSets.forEach(s => {
          if (s.weightKg > maxKg) {
            maxKg = s.weightKg;
            bestSet = s;
          }
        });

        const sessionTime = session.startTime || (session.date ? new Date(session.date).getTime() : Date.now());
        const daysAgo = Math.max(1, Math.round((Date.now() - sessionTime) / (1000 * 60 * 60 * 24)));

        return {
          workoutId: session.id,
          workoutTitle: session.title,
          date: session.date || 'Recent Session',
          daysAgo,
          exerciseName: matchedExercise.name,
          sets: matchedExercise.sets,
          maxWeightKg: maxKg,
          maxWeightLbs: Math.round(maxKg * 2.20462 * 10) / 10,
          bestSet,
          lastCompletedSet: completedSets[completedSets.length - 1]
        };
      }
    }
  }

  return null;
}

/**
 * Computes suggested weight and reps for the next set based on the user's last performance of that specific exercise
 */
export function getSuggestedNextSet(
  exercise: WorkoutExercise,
  targetSetNumber: number, // 1-indexed (e.g. 1, 2, 3, 4)
  workoutHistory: ActiveWorkout[],
  unit: 'kg' | 'lbs' = 'kg'
): SetSuggestion {
  const lastPerf = getLastExercisePerformance(exercise.exerciseId, exercise.name, workoutHistory);

  // Case 1: We found a past performance session for this exercise!
  if (lastPerf) {
    // Try to find the exact set number from the past session
    const pastMatchingSet = lastPerf.sets.find(s => s.setNumber === targetSetNumber);

    if (pastMatchingSet) {
      const isWarmup = pastMatchingSet.type === 'warmup' || (targetSetNumber === 1 && pastMatchingSet.reps >= 10 && pastMatchingSet.weightKg < lastPerf.maxWeightKg * 0.7);
      
      // Check if user crushed this set with high ease (RPE <= 7.5 or failure = false) to suggest smart progressive overload
      let overload = false;
      let targetWeightKg = pastMatchingSet.weightKg;
      let targetWeightLbs = pastMatchingSet.weightLbs || Math.round(pastMatchingSet.weightKg * 2.20462 * 10) / 10;
      let targetReps = pastMatchingSet.reps;

      // If they logged an easy RPE in the past, offer a micro-load bump
      if (pastMatchingSet.rpe && pastMatchingSet.rpe <= 7.5 && !isWarmup) {
        overload = true;
        targetWeightKg = Math.round((pastMatchingSet.weightKg + 2.5) * 10) / 10;
        targetWeightLbs = Math.round((targetWeightKg * 2.20462) * 10) / 10;
      }

      const displayWeight = unit === 'kg' ? `${pastMatchingSet.weightKg} kg` : `${pastMatchingSet.weightLbs || Math.round(pastMatchingSet.weightKg * 2.20462 * 10) / 10} lbs`;
      const prevDisplay = `${displayWeight} × ${pastMatchingSet.reps}`;

      return {
        setNumber: targetSetNumber,
        type: pastMatchingSet.type || (isWarmup ? 'warmup' : 'normal'),
        weightKg: targetWeightKg,
        weightLbs: targetWeightLbs,
        reps: targetReps,
        rpe: pastMatchingSet.rpe || (isWarmup ? 6 : 8),
        reason: overload
          ? `+2.5kg Progressive target (Hit ${prevDisplay} @ RPE ${pastMatchingSet.rpe} last time)`
          : `Matched to your Set ${targetSetNumber} from ${lastPerf.date} (${prevDisplay})`,
        previousBestDisplay: prevDisplay,
        isOverloadProgression: overload,
        historicalReference: {
          date: lastPerf.date,
          workoutTitle: lastPerf.workoutTitle,
          setWeightKg: pastMatchingSet.weightKg,
          setWeightLbs: pastMatchingSet.weightLbs || Math.round(pastMatchingSet.weightKg * 2.20462 * 10) / 10,
          setReps: pastMatchingSet.reps,
          setRpe: pastMatchingSet.rpe
        }
      };
    }

    // Set number exceeds past session's set count (e.g. adding 4th or 5th set)
    // Suggest based on the last working set
    const lastWorkingSet = lastPerf.bestSet || lastPerf.lastCompletedSet;
    const displayWeight = unit === 'kg' ? `${lastWorkingSet.weightKg} kg` : `${lastWorkingSet.weightLbs || Math.round(lastWorkingSet.weightKg * 2.20462 * 10) / 10} lbs`;
    const prevDisplay = `${displayWeight} × ${lastWorkingSet.reps}`;

    return {
      setNumber: targetSetNumber,
      type: 'normal',
      weightKg: lastWorkingSet.weightKg,
      weightLbs: lastWorkingSet.weightLbs || Math.round(lastWorkingSet.weightKg * 2.20462 * 10) / 10,
      reps: lastWorkingSet.reps,
      rpe: lastWorkingSet.rpe || 8.5,
      reason: `Calibrated from last session's peak working set (${prevDisplay})`,
      previousBestDisplay: prevDisplay,
      isOverloadProgression: false,
      historicalReference: {
        date: lastPerf.date,
        workoutTitle: lastPerf.workoutTitle,
        setWeightKg: lastWorkingSet.weightKg,
        setWeightLbs: lastWorkingSet.weightLbs || Math.round(lastWorkingSet.weightKg * 2.20462 * 10) / 10,
        setReps: lastWorkingSet.reps,
        setRpe: lastWorkingSet.rpe
      }
    };
  }

  // Case 2: No past performance in history - calibrate from previous sets in CURRENT workout
  if (exercise.sets && exercise.sets.length > 0) {
    const priorCompleted = [...exercise.sets]
      .filter(s => s.completed && s.weightKg > 0)
      .pop();

    if (priorCompleted) {
      const displayWeight = unit === 'kg' ? `${priorCompleted.weightKg} kg` : `${priorCompleted.weightLbs} lbs`;
      return {
        setNumber: targetSetNumber,
        type: 'normal',
        weightKg: priorCompleted.weightKg,
        weightLbs: priorCompleted.weightLbs,
        reps: priorCompleted.reps,
        rpe: priorCompleted.rpe || 8,
        reason: `Based on your Set ${priorCompleted.setNumber} logged today (${displayWeight} × ${priorCompleted.reps})`,
        previousBestDisplay: `${displayWeight} × ${priorCompleted.reps}`,
        isOverloadProgression: false
      };
    }

    const firstSet = exercise.sets[0];
    if (firstSet && firstSet.weightKg > 0) {
      return {
        setNumber: targetSetNumber,
        type: targetSetNumber === 1 ? 'warmup' : 'normal',
        weightKg: firstSet.weightKg,
        weightLbs: firstSet.weightLbs,
        reps: firstSet.reps || 8,
        rpe: 8,
        reason: 'Recommended working load based on planned starting set',
        previousBestDisplay: `${unit === 'kg' ? firstSet.weightKg : firstSet.weightLbs} ${unit} × ${firstSet.reps || 8}`,
        isOverloadProgression: false
      };
    }
  }

  // Case 3: Fresh exercise baseline fallback
  return {
    setNumber: targetSetNumber,
    type: targetSetNumber === 1 ? 'warmup' : 'normal',
    weightKg: 60,
    weightLbs: 132.3,
    reps: 8,
    rpe: 8,
    reason: 'Standard baseline suggestion',
    previousBestDisplay: '—',
    isOverloadProgression: false
  };
}
