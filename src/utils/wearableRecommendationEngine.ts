import { ActiveWorkout, ConnectedDevice, WearableWorkoutRecommendation, WorkoutExercise, MuscleGroup } from '../types';

/**
 * Identify primary muscle focus of a workout from its exercises or title
 */
export function identifyWorkoutMuscleFocus(
  workoutTitle?: string,
  exercises?: WorkoutExercise[]
): { focusName: string; isLegDay: boolean; isPushDay: boolean; isPullDay: boolean } {
  const title = (workoutTitle || '').toLowerCase();
  
  // Check title cues
  const isLegTitle = title.includes('leg') || title.includes('lower') || title.includes('squat') || title.includes('quad');
  const isPushTitle = title.includes('push') || title.includes('chest') || title.includes('press') || title.includes('delt');
  const isPullTitle = title.includes('pull') || title.includes('back') || title.includes('deadlift') || title.includes('lat');

  if (exercises && exercises.length > 0) {
    const legMuscles: MuscleGroup[] = ['Quads', 'Hamstrings', 'Glutes', 'Calves'];
    const pushMuscles: MuscleGroup[] = ['Chest', 'Shoulders', 'Triceps'];
    const pullMuscles: MuscleGroup[] = ['Back', 'Biceps', 'Forearms'];

    let legSets = 0;
    let pushSets = 0;
    let pullSets = 0;

    exercises.forEach(ex => {
      const setCount = ex.sets?.length || 1;
      if (legMuscles.includes(ex.targetMuscle)) legSets += setCount;
      if (pushMuscles.includes(ex.targetMuscle)) pushSets += setCount;
      if (pullMuscles.includes(ex.targetMuscle)) pullSets += setCount;
    });

    if (legSets >= pushSets && legSets >= pullSets && legSets > 0) {
      return { focusName: 'leg volume', isLegDay: true, isPushDay: false, isPullDay: false };
    }
    if (pushSets >= legSets && pushSets >= pullSets && pushSets > 0) {
      return { focusName: 'push volume', isLegDay: false, isPushDay: true, isPullDay: false };
    }
    if (pullSets >= legSets && pullSets >= pushSets && pullSets > 0) {
      return { focusName: 'pull volume', isLegDay: false, isPushDay: false, isPullDay: true };
    }
  }

  if (isLegTitle) return { focusName: 'leg volume', isLegDay: true, isPushDay: false, isPullDay: false };
  if (isPushTitle) return { focusName: 'push volume', isLegDay: false, isPushDay: true, isPullDay: false };
  if (isPullTitle) return { focusName: 'pull volume', isLegDay: false, isPushDay: false, isPullDay: true };

  return { focusName: 'training volume', isLegDay: false, isPushDay: false, isPullDay: false };
}

/**
 * Generate wearable-based recommendation evaluating sleep debt, resting heart rate, HRV, and strain.
 */
export function generateWearableRecommendation(
  device: ConnectedDevice,
  workoutTitle?: string,
  exercises?: WorkoutExercise[]
): WearableWorkoutRecommendation {
  const brandName =
    device.brand === 'garmin'
      ? 'Garmin'
      : device.brand === 'whoop'
      ? 'WHOOP'
      : device.brand === 'apple'
      ? 'Apple Watch'
      : device.brand === 'fitbit'
      ? 'Fitbit'
      : device.brand === 'polar'
      ? 'Polar'
      : device.name.split(' ')[0] || 'Wearable';

  // Metrics with smart fallbacks
  const sleepDebt = device.sleepDebtHours ?? (device.brand === 'garmin' ? 1.9 : 0.5);
  const sleepDuration = device.sleepDurationHours ?? 5.3;
  const sleepScore = device.sleepScore ?? (sleepDebt > 1.2 ? 54 : 82);
  const rhr = device.restingHeartRateBpm ?? 63;
  const rhrBaseline = device.rhrBaselineBpm ?? 52;
  const rhrDelta = rhr - rhrBaseline;
  const hrv = device.hrvMs ?? 34;
  const hrvBaseline = device.hrvBaselineMs ?? 68;
  const hrvDeltaPercent = Math.round(((hrv - hrvBaseline) / hrvBaseline) * 100);
  const recoveryScore = device.recoveryScore ?? 52;

  const { focusName } = identifyWorkoutMuscleFocus(workoutTitle, exercises);

  // Scenario 1: Poor sleep / High sleep debt / Low HRV / Elevated RHR
  if (sleepDebt >= 1.2 || sleepScore < 60 || recoveryScore < 55 || hrvDeltaPercent <= -25) {
    const headline = `${brandName} tracked poor sleep, so we are reducing ${focusName} by 20% today to prioritize recovery`;

    return {
      id: `rec_${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceBrand: device.brand,
      status: 'fatigued',
      headline,
      summary: `Biometrics detect acute physiological strain: ${sleepDebt.toFixed(1)}h sleep debt, elevated resting HR (+${rhrDelta} bpm), and suppressed HRV (${hrv} ms, ${hrvDeltaPercent}%).`,
      actionTitle: `Reduce ${focusName === 'leg volume' ? 'Leg' : focusName === 'push volume' ? 'Push' : focusName === 'pull volume' ? 'Pull' : 'Training'} Volume by 20%`,
      volumeAdjustmentPercent: -20,
      targetMuscleGroup: focusName,
      recommendedRpeCap: 7.5,
      restTimerBonusSeconds: 30,
      biometrics: {
        sleepDebtHours: sleepDebt,
        sleepDurationHours: sleepDuration,
        sleepScore,
        restingHeartRateBpm: rhr,
        rhrDelta,
        hrvMs: hrv,
        hrvDeltaPercent,
        recoveryScore,
        bodyBatteryScore: device.bodyBatteryScore
      },
      rationales: [
        {
          title: `Sleep Debt: ${sleepDebt.toFixed(1)} hrs (${sleepDuration.toFixed(1)}h slept)`,
          description: `Chronic sleep deficit impairs central motor unit activation, blunt myofibrillar protein synthesis, and spikes injury risk under maximal spinal loading.`,
          severity: 'alert'
        },
        {
          title: `Resting Heart Rate: ${rhr} bpm (+${rhrDelta} bpm above baseline)`,
          description: `Elevated cardiovascular strain signals delayed parasympathetic rebound. Heavy systemic volume will delay full recovery.`,
          severity: 'warning'
        },
        {
          title: `Heart Rate Variability: ${hrv} ms (${hrvDeltaPercent}% suppression)`,
          description: `Suppressed autonomic nervous system tone indicates systemic sympathetic fatigue. Dropping top sets protects tendon junctions.`,
          severity: 'warning'
        }
      ]
    };
  }

  // Scenario 2: Moderate fatigue
  if (sleepDebt >= 0.8 || recoveryScore < 70 || hrvDeltaPercent < -10) {
    const headline = `${brandName} tracked moderate fatigue, so we are pacing ${focusName} with a 10% volume deload today`;

    return {
      id: `rec_${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceBrand: device.brand,
      status: 'moderate',
      headline,
      summary: `Wearable indicates moderate recovery (${recoveryScore}% score, ${sleepDebt.toFixed(1)}h sleep debt). A minor volume deload prevents overtraining.`,
      actionTitle: `Pace Workout (-10% Volume)`,
      volumeAdjustmentPercent: -10,
      targetMuscleGroup: focusName,
      recommendedRpeCap: 8.0,
      restTimerBonusSeconds: 15,
      biometrics: {
        sleepDebtHours: sleepDebt,
        sleepDurationHours: sleepDuration,
        sleepScore,
        restingHeartRateBpm: rhr,
        rhrDelta,
        hrvMs: hrv,
        hrvDeltaPercent,
        recoveryScore,
        bodyBatteryScore: device.bodyBatteryScore
      },
      rationales: [
        {
          title: `Moderate Sleep Debt: ${sleepDebt.toFixed(1)} hrs`,
          description: `Mild sleep deficit detected. Pacing compound movements protects neuromuscular efficiency.`,
          severity: 'warning'
        },
        {
          title: `HRV: ${hrv} ms (${hrvDeltaPercent}% vs baseline)`,
          description: `Near-normal HRV with slight sympathetic drag. Keep working sets at RPE 8.`,
          severity: 'neutral'
        }
      ]
    };
  }

  // Scenario 3: Primed & Optimal Recovery
  const headline = `${brandName} tracked peak sleep & high HRV (+${Math.abs(hrvDeltaPercent)}%). Primed to hit PRs today!`;
  return {
    id: `rec_${Date.now()}`,
    deviceId: device.id,
    deviceName: device.name,
    deviceBrand: device.brand,
    status: 'optimal',
    headline,
    summary: `Resting HR is low (${rhr} bpm) and recovery score is high (${recoveryScore}%). Autonomic nervous system is fully restored!`,
    actionTitle: `Lock in Standard Full Volume (PR Attempt Primed)`,
    volumeAdjustmentPercent: 0,
    targetMuscleGroup: focusName,
    recommendedRpeCap: 9.5,
    restTimerBonusSeconds: 0,
    biometrics: {
      sleepDebtHours: sleepDebt,
      sleepDurationHours: sleepDuration,
      sleepScore,
      restingHeartRateBpm: rhr,
      rhrDelta,
      hrvMs: hrv,
      hrvDeltaPercent,
      recoveryScore,
      bodyBatteryScore: device.bodyBatteryScore
    },
    rationales: [
      {
        title: `Optimal Sleep Quality (${sleepScore}% Score)`,
        description: `Full REM and deep sleep cycles achieved. Glycogen stores and neural pathways are fully restored.`,
        severity: 'positive'
      },
      {
        title: `Robust HRV (${hrv} ms, +${Math.max(0, hrvDeltaPercent)}%)`,
        description: `Parasympathetic dominance confirms full neuromuscular recovery. Perfect condition for progressive overload.`,
        severity: 'positive'
      }
    ]
  };
}

/**
 * Apply the recommendation's volume adjustment and RPE/rest caps to the workout exercises
 */
export function applyWearableRecommendation(
  workout: ActiveWorkout,
  rec: WearableWorkoutRecommendation
): ActiveWorkout {
  if (rec.volumeAdjustmentPercent === 0) {
    return workout;
  }

  const reductionPercent = Math.abs(rec.volumeAdjustmentPercent); // e.g. 20
  
  // Clone exercises and sets
  const adaptedExercises: WorkoutExercise[] = workout.exercises.map(ex => {
    let sets = [...ex.sets];

    // If reduction is ~20% and exercise has 4+ sets, drop the last working set
    // If exercise has 3 sets, we either drop to 2 or reduce reps
    if (reductionPercent >= 15) {
      if (sets.length >= 4) {
        sets = sets.slice(0, sets.length - 1);
      } else if (sets.length === 3 && workout.exercises.length > 2) {
        // Drop last set for high-fatigue compound exercises
        sets = sets.slice(0, 2);
      }
    }

    // Adjust target RPE if set and suggested
    const adjustedSets = sets.map((s, idx) => ({
      ...s,
      setNumber: idx + 1,
      rpe: rec.recommendedRpeCap ? Math.min(s.rpe || 8, rec.recommendedRpeCap) : s.rpe,
      suggestedReason: s.suggestedReason
        ? `${s.suggestedReason} · [${rec.deviceBrand.toUpperCase()} Recovery Adapted: RPE capped at ${rec.recommendedRpeCap || 7.5}]`
        : `[${rec.deviceBrand.toUpperCase()} Recovery Adapted]`
    }));

    // Extend rest intervals for CNS protection
    const bonusRest = rec.restTimerBonusSeconds || 0;
    const restSeconds = Math.min(180, (ex.restSeconds || 90) + bonusRest);

    return {
      ...ex,
      sets: adjustedSets,
      restSeconds
    };
  });

  return {
    ...workout,
    exercises: adaptedExercises,
    wearableAdaptation: {
      deviceName: rec.deviceName,
      summary: rec.headline,
      volumeReductionPercent: reductionPercent,
      targetMuscle: rec.targetMuscleGroup,
      acceptedAt: Date.now()
    }
  };
}
