import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Calculator, ChevronLeft, Heart, Watch, Flame, Timer, Sparkles, ArrowRightLeft, CheckCircle2, Trash2, X, AlertTriangle, Trophy, Dumbbell, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { ActiveWorkout, WorkoutExercise, ExerciseDefinition, EquipmentEnvironment } from '../../types';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { OneRepMaxCalculatorModal } from './OneRepMaxCalculatorModal';
import { BuiltInRestTimerHUD } from './BuiltInRestTimerHUD';
import { WarmupCoach } from './WarmupCoach';
import { BetweenExercisesTimerModal, STORAGE_KEY_HIDE_BETWEEN_TIMER_POPUP } from './BetweenExercisesTimerModal';
import { saveDraftWorkout, getWorkoutHistory, AppSettings } from '../../utils/storage';
import { getSuggestedNextSet } from '../../utils/exerciseSuggestions';
import { EQUIPMENT_ENVIRONMENTS, getSubstituteExercise, isExerciseAllowed } from '../../data/equipmentEnvironments';
import { findExerciseDefinition, resolveCatalogExercise } from '../../data/exercises';

interface ActiveWorkoutModalProps {
  workout: ActiveWorkout;
  onUpdateWorkout: (workout: ActiveWorkout) => void;
  onFinishWorkout: (workout: ActiveWorkout) => void;
  onCancelWorkout: () => void;
  settings: AppSettings;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  connectedHeartRate?: number;
  onOpenTracker?: () => void;
  currentEnvironment?: EquipmentEnvironment;
  onOpenEquipmentModal?: () => void;
  onAdaptToEnvironment?: (newEnv: EquipmentEnvironment) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  onUpdateWorkout,
  onFinishWorkout,
  onCancelWorkout,
  settings,
  onUpdateSettings,
  connectedHeartRate,
  onOpenTracker,
  currentEnvironment = 'commercial_gym',
  onOpenEquipmentModal,
  onAdaptToEnvironment
}) => {
  const [elapsed, setElapsed] = useState<number>(workout.durationSeconds || 0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState<number | null>(null);
  const [oneRmCalcState, setOneRmCalcState] = useState<{ weight: number; reps: number } | null>(null);
  const [restTimerState, setRestTimerState] = useState<{ name: string; seconds: number; key: number; isBetweenExercises?: boolean } | null>(null);
  const [autoRestTimerEnabled, setAutoRestTimerEnabled] = useState<boolean>(true);
  const [showBetweenTimerModal, setShowBetweenTimerModal] = useState<boolean>(false);
  const [workoutHistory] = useState<ActiveWorkout[]>(() => getWorkoutHistory());
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

  // Warmup is optional: program starts directly if user already logged sets or once warmup is ended/skipped
  const hasCompletedSets = workout.exercises.some(ex => ex.sets.some(s => s.completed));
  const [workoutProgramStarted, setWorkoutProgramStarted] = useState<boolean>(() => hasCompletedSets);
  const [isWarmupActive, setIsWarmupActive] = useState<boolean>(false);
  const [isWarmupEnded, setIsWarmupEnded] = useState<boolean>(false);

  // Active exercise tracking: thin orange border on current exercise, moves to next when complete
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(() => {
    const idx = workout.exercises.findIndex(
      ex => !(ex.sets.length > 0 && ex.sets.every(s => s.completed))
    );
    return idx !== -1 ? idx : 0;
  });

  // Whenever workout exercises update, if the current active exercise is now complete,
  // automatically advance active status to the next incomplete exercise
  useEffect(() => {
    const currentActive = workout.exercises[activeExerciseIndex];
    const isCurrentActiveDone =
      currentActive &&
      currentActive.sets.length > 0 &&
      currentActive.sets.every(s => s.completed);

    if (isCurrentActiveDone || activeExerciseIndex >= workout.exercises.length) {
      const nextIncomplete = workout.exercises.findIndex(
        ex => !(ex.sets.length > 0 && ex.sets.every(s => s.completed))
      );
      if (nextIncomplete !== -1) {
        setActiveExerciseIndex(nextIncomplete);
      }
    }
  }, [workout.exercises, activeExerciseIndex]);

  const handleStartWarmup = () => {
    setIsWarmupActive(true);
    setIsWarmupEnded(false);
  };

  const handleEndWarmup = () => {
    setIsWarmupActive(false);
    setIsWarmupEnded(true);
    setWorkoutProgramStarted(true); // After warmup the gym workout program will start!
  };

  const handleStartGymWorkoutDirectly = () => {
    setIsWarmupActive(false);
    setWorkoutProgramStarted(true); // Direct start without warmup (warmup is optional)
  };

  // Auto-enrich any uncompleted sets with suggestions based on past performance & ground to gympax_exercises.json
  useEffect(() => {
    let changed = false;
    const history = getWorkoutHistory();
    const enriched = workout.exercises.map(ex => {
      let exChanged = false;
      const catalogDef = resolveCatalogExercise(ex.exerciseId || ex.id || ex.name, ex.targetMuscle, ex.equipment);
      if (
        ex.exerciseId !== catalogDef.id ||
        ex.name !== catalogDef.name ||
        ex.cdn_url !== catalogDef.cdn_url ||
        ex.cdnUrl !== catalogDef.cdnUrl ||
        ex.primary_muscle !== catalogDef.primary_muscle
      ) {
        exChanged = true;
        changed = true;
      }

      const groundedEx: WorkoutExercise = {
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

      const sets = groundedEx.sets.map((s, idx) => {
        if (!s.completed && (!s.isSuggested || !s.suggestedWeightKg)) {
          exChanged = true;
          changed = true;
          const sug = getSuggestedNextSet(groundedEx, s.setNumber || idx + 1, history, settings.weightUnit);
          return {
            ...s,
            isSuggested: true,
            suggestedWeightKg: sug.weightKg,
            suggestedWeightLbs: sug.weightLbs,
            suggestedReps: sug.reps,
            suggestedReason: sug.reason,
            previousBest: s.previousBest || sug.previousBestDisplay
          };
        }
        return s;
      });
      return exChanged ? { ...groundedEx, sets } : ex;
    });

    if (changed) {
      const updated = { ...workout, exercises: enriched };
      onUpdateWorkout(updated);
      saveDraftWorkout(updated);
    }
  }, []);

  const handleTriggerRestTimer = (name: string, secs?: number, isBetweenExercises?: boolean) => {
    if (!autoRestTimerEnabled) return;
    const duration = secs || settings.defaultRestSeconds || 90;
    setRestTimerState({
      name,
      seconds: duration,
      key: Date.now(),
      isBetweenExercises: !!isBetweenExercises
    });

    // When transitioning between exercises, show the short popup description if not marked never show again
    if (isBetweenExercises) {
      try {
        const isHidden = localStorage.getItem(STORAGE_KEY_HIDE_BETWEEN_TIMER_POPUP) === 'true';
        if (!isHidden) {
          setShowBetweenTimerModal(true);
        }
      } catch {
        // ignore
      }
    }
  };

  // Timer interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        // Autosave draft every 5 seconds
        if (next % 5 === 0) {
          saveDraftWorkout({ ...workout, durationSeconds: next });
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, workout]);

  const formatElapsed = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}:${remainingMins < 10 ? '0' : ''}${remainingMins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleUpdateExercise = (index: number, updated: WorkoutExercise) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[index] = updated;

    if (updated.sets.some(s => s.completed)) {
      setWorkoutProgramStarted(true);
    }

    // Calculate total volume
    const totalVolume = updatedExercises.reduce((sum, ex) => {
      return (
        sum +
        ex.sets.reduce((sSum, s) => {
          return s.completed ? sSum + (s.weightKg * s.reps) : sSum;
        }, 0)
      );
    }, 0);

    const updatedWorkout: ActiveWorkout = {
      ...workout,
      exercises: updatedExercises,
      durationSeconds: elapsed,
      totalVolumeKg: totalVolume
    };

    onUpdateWorkout(updatedWorkout);
    saveDraftWorkout(updatedWorkout);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = workout.exercises.filter((_, i) => i !== index);
    const updatedWorkout: ActiveWorkout = {
      ...workout,
      exercises: updatedExercises,
      durationSeconds: elapsed
    };
    onUpdateWorkout(updatedWorkout);
    saveDraftWorkout(updatedWorkout);
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= workout.exercises.length) return;
    const reordered = [...workout.exercises];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const updatedWorkout: ActiveWorkout = {
      ...workout,
      exercises: reordered,
      durationSeconds: elapsed
    };
    onUpdateWorkout(updatedWorkout);
    saveDraftWorkout(updatedWorkout);
  };

  const handleAddExerciseFromLibrary = (def: ExerciseDefinition) => {
    const history = getWorkoutHistory();
    const tempEx: WorkoutExercise = {
      id: def.id,
      exerciseId: def.id,
      name: def.name,
      targetMuscle: def.primaryMuscle,
      primary_muscle: def.primary_muscle,
      rawPrimaryMuscle: def.rawPrimaryMuscle,
      equipment: def.equipment,
      cdn_url: def.cdn_url,
      cdnUrl: def.cdnUrl,
      notes: '',
      restSeconds: 90,
      sets: []
    };

    const initialSets = [1, 2, 3].map(setNum => {
      const sug = getSuggestedNextSet(tempEx, setNum, history, settings.weightUnit);
      return {
        id: `s_${Date.now()}_${setNum}`,
        setNumber: setNum,
        type: sug.type,
        weightKg: sug.weightKg,
        weightLbs: sug.weightLbs,
        reps: sug.reps,
        rpe: sug.rpe,
        completed: false,
        isSuggested: true,
        suggestedWeightKg: sug.weightKg,
        suggestedWeightLbs: sug.weightLbs,
        suggestedReps: sug.reps,
        suggestedReason: sug.reason,
        previousBest: sug.previousBestDisplay
      };
    });

    const newExercise: WorkoutExercise = {
      id: def.id,
      exerciseId: def.id,
      name: def.name,
      targetMuscle: def.primaryMuscle,
      primary_muscle: def.primary_muscle,
      rawPrimaryMuscle: def.rawPrimaryMuscle,
      secondaryMuscles: def.secondaryMuscles,
      equipment: def.equipment,
      cdn_url: def.cdn_url,
      cdnUrl: def.cdnUrl,
      notes: '',
      restSeconds: 90,
      sets: initialSets
    };

    const updatedExercises = [...workout.exercises, newExercise];
    const updatedWorkout = { ...workout, exercises: updatedExercises, durationSeconds: elapsed };
    onUpdateWorkout(updatedWorkout);
    saveDraftWorkout(updatedWorkout);
  };

  const handleFinish = () => {
    // Calculate total volume
    const totalVolume = workout.exercises.reduce((sum, ex) => {
      return (
        sum +
        ex.sets.reduce((sSum, s) => {
          return s.completed ? sSum + (s.weightKg * s.reps) : sSum;
        }, 0)
      );
    }, 0);

    const finishedWorkout: ActiveWorkout = {
      ...workout,
      durationSeconds: elapsed,
      totalVolumeKg: totalVolume,
      isCompleted: true
    };

    onFinishWorkout(finishedWorkout);
  };

  const warmupCoachRef = useRef<HTMLDivElement>(null);

  const handleScrollToWarmup = () => {
    warmupCoachRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddWarmupSetToFirstExercise = () => {
    if (workout.exercises.length === 0) return;
    const firstEx = workout.exercises[0];
    const baseKg = firstEx.sets[0]?.weightKg || 40;
    const baseLbs = firstEx.sets[0]?.weightLbs || 88;
    const warmupWeightKg = Math.max(20, Math.round((baseKg * 0.5) / 2.5) * 2.5);
    const warmupWeightLbs = Math.max(45, Math.round((baseLbs * 0.5) / 5) * 5);

    const newWarmupSet = {
      id: `s_${Date.now()}_warmup`,
      setNumber: 1,
      type: 'warmup' as const,
      weightKg: warmupWeightKg,
      weightLbs: warmupWeightLbs,
      reps: 12,
      completed: false
    };

    const updatedSets = [
      newWarmupSet,
      ...firstEx.sets.map((s, idx) => ({ ...s, setNumber: idx + 2 }))
    ];

    handleUpdateExercise(0, { ...firstEx, sets: updatedSets });
  };

  const handleAdaptRemainingExercises = (targetEnv: EquipmentEnvironment = currentEnvironment) => {
    const isTravel = targetEnv === 'bodyweight_travel';
    const isDumbbell = targetEnv === 'dumbbell_only';

    const adaptedExercises = workout.exercises.map(ex => {
      const hasCompletedSets = ex.sets.some(s => s.completed);
      const def = findExerciseDefinition(ex.exerciseId);
      if (hasCompletedSets || (def && isExerciseAllowed(def, targetEnv))) {
        return ex;
      }

      const replacement = getSubstituteExercise(ex.exerciseId, targetEnv);
      const wasBarbell = ex.equipment === 'Barbell';

      const adaptedSets = ex.sets.map(s => {
        if (s.completed) return s;
        let weightKg = s.weightKg;
        let weightLbs = s.weightLbs;
        let reps = s.reps;

        if (isTravel) {
          weightKg = 0;
          weightLbs = 0;
          if (reps < 12) reps = 15;
        } else if (isDumbbell && wasBarbell) {
          weightKg = Math.max(8, Math.round((weightKg * 0.45) / 2) * 2);
          weightLbs = Math.round(weightKg * 2.20462);
          if (reps < 10) reps = 10;
        }

        return {
          ...s,
          weightKg,
          weightLbs,
          reps,
          suggestedWeightKg: weightKg,
          suggestedWeightLbs: weightLbs,
          suggestedReps: reps
        };
      });

      return {
        ...ex,
        id: replacement.id,
        exerciseId: replacement.id,
        name: replacement.name,
        targetMuscle: replacement.primaryMuscle,
        primary_muscle: replacement.primary_muscle || replacement.rawPrimaryMuscle || replacement.primaryMuscle,
        rawPrimaryMuscle: replacement.rawPrimaryMuscle,
        secondaryMuscles: replacement.secondaryMuscles,
        equipment: replacement.equipment,
        cdnUrl: replacement.cdnUrl || replacement.cdn_url,
        cdn_url: replacement.cdn_url || replacement.cdnUrl,
        sets: adaptedSets
      };
    });

    const updated: ActiveWorkout = {
      ...workout,
      exercises: adaptedExercises
    };

    onUpdateWorkout(updated);
    saveDraftWorkout(updated);
    if (onAdaptToEnvironment) {
      onAdaptToEnvironment(targetEnv);
    }
  };

  const incompatibleCount = workout.exercises.filter(ex => {
    const hasCompletedSets = ex.sets.some(s => s.completed);
    if (hasCompletedSets) return false;
    const def = findExerciseDefinition(ex.exerciseId);
    return def && !isExerciseAllowed(def, currentEnvironment);
  }).length;

  // Compute stats on the fly
  const completedSetsCount = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );
  const totalSetsCount = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const totalVolumeKg = workout.exercises.reduce((sum, ex) => {
    return (
      sum +
      ex.sets.reduce((sSum, s) => {
        return s.completed ? sSum + (s.weightKg * s.reps) : sSum;
      }, 0)
    );
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col overflow-hidden text-zinc-100">
      {/* Sticky Active Workout Top Bar */}
      <div className="h-14 px-2.5 sm:px-4 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="p-1.5 -ml-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Cancel / Exit Workout"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-xs sm:text-base text-zinc-100 truncate max-w-[120px] xs:max-w-[170px] sm:max-w-md whitespace-nowrap">
              {workout.title}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 whitespace-nowrap">
              <span className="font-mono tabular-nums">{completedSetsCount}/{totalSetsCount} Sets</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>{workout.exercises.length} Exercises</span>
            </div>
          </div>
        </div>

        {/* Stopwatch & Finish CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Equipment Mode Switcher Pill */}
          {onOpenEquipmentModal && (
            <button
              onClick={onOpenEquipmentModal}
              title={`Training Setup: ${EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.title}. Tap to change.`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 rounded-lg text-xs font-semibold text-zinc-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.emoji}</span>
              <span>{EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.shortTitle}</span>
            </button>
          )}

          {/* Between-Exercises & Auto-Rest Timer Pill */}
          <div className="hidden md:flex items-center bg-zinc-850 border border-zinc-700/60 rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setAutoRestTimerEnabled(!autoRestTimerEnabled)}
              title={autoRestTimerEnabled ? "Between-Exercises Timer: ON (Tap to turn OFF)" : "Between-Exercises Timer: OFF (Tap to turn ON)"}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                autoRestTimerEnabled
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Auto-Timer: {autoRestTimerEnabled ? `${settings.defaultRestSeconds || 90}s` : 'Off'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBetweenTimerModal(true)}
              title="Between Exercises Timer Info & Settings"
              className="p-1 rounded-md text-zinc-400 hover:text-amber-400 hover:bg-zinc-750 transition-colors cursor-pointer shrink-0"
              aria-label="Between exercises timer info and settings"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick jump to Warmup and Stretch (only shown before workout starts) */}
          {!workoutProgramStarted && (
            <button
              onClick={handleScrollToWarmup}
              title="Warmup and Stretch (Optional)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400/40 text-amber-400" />
              <span>Warmup & Stretch</span>
            </button>
          )}

          {/* Live Heart Rate from connected fitness tracker */}
          {connectedHeartRate ? (
            <button
              onClick={onOpenTracker}
              title="Connected Tracker Stream - Tap to inspect"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-red-950/40 border border-red-800/60 rounded-lg text-red-400 font-mono text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-red-500" />
              <span>{connectedHeartRate} BPM</span>
            </button>
          ) : null}

          {/* Active timer badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg shrink-0 whitespace-nowrap">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-amber-400 hover:text-amber-300 cursor-pointer p-0.5"
              title={isPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <span className="font-mono text-xs font-bold text-zinc-200 tabular-nums">
              {formatElapsed(elapsed)}
            </span>
          </div>

          {/* Option to cancel workout during session */}
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/80 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[34px] flex items-center justify-center"
            title="End and cancel this workout session"
          >
            Cancel
          </button>

          {/* Option to finish workout session */}
          <button
            onClick={() => setShowFinishConfirm(true)}
            className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-sm whitespace-nowrap shrink-0 min-h-[34px] flex items-center justify-center"
          >
            Finish
          </button>
        </div>
      </div>

      {/* BUILT-IN REST TIMER HUD & VISUAL COUNTDOWN INDICATOR */}
      {restTimerState !== null && (
        <BuiltInRestTimerHUD
          key={restTimerState.key}
          exerciseName={restTimerState.name}
          totalSeconds={restTimerState.seconds}
          soundEnabled={settings.soundEnabled}
          onDismiss={() => setRestTimerState(null)}
          isBetweenExercises={restTimerState.isBetweenExercises}
          onOpenBetweenTimerModal={() => setShowBetweenTimerModal(true)}
          autoTimerEnabled={autoRestTimerEnabled}
          onToggleAutoTimer={() => {
            const next = !autoRestTimerEnabled;
            setAutoRestTimerEnabled(next);
            if (!next) {
              setRestTimerState(null);
            }
          }}
        />
      )}

      {/* Main Exercise Logger Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 max-w-3xl w-full mx-auto space-y-4 pb-32">
        {/* Adaptive Equipment Warning / Action Banner */}
        {incompatibleCount > 0 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-zinc-100 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 text-lg">
                {EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.emoji || '⚡'}
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Setup: {EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.title}</span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  {incompatibleCount} {incompatibleCount === 1 ? 'exercise requires' : 'exercises require'} unavailable equipment. Convert them to {EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.shortTitle} alternatives?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              {onOpenEquipmentModal && (
                <button
                  type="button"
                  onClick={onOpenEquipmentModal}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Change Setup
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAdaptRemainingExercises(currentEnvironment)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Adapt All</span>
              </button>
            </div>
          </div>
        )}

        {/* Wearable Biometric Recovery Adaptation Notice */}
        {workout.wearableAdaptation && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-zinc-100 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <Watch className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 flex-wrap">
                  <span>{workout.wearableAdaptation.deviceName} Recovery Adaptation</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                    -{workout.wearableAdaptation.volumeReductionPercent}% Volume
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  &ldquo;{workout.wearableAdaptation.summary}&rdquo;
                </p>
              </div>
            </div>
            {onOpenTracker && (
              <button
                type="button"
                onClick={onOpenTracker}
                className="text-xs text-amber-400 hover:text-amber-300 underline shrink-0 cursor-pointer hidden sm:inline"
              >
                Tracker
              </button>
            )}
          </div>
        )}

        {/* Dedicated Warmup and Stretch Section (shown before starting, removed once user starts workout) */}
        {!workoutProgramStarted && (
          <div ref={warmupCoachRef}>
            <WarmupCoach
              exercises={workout.exercises}
              soundEnabled={settings.soundEnabled}
              onAddWarmupSetToFirstExercise={workout.exercises.length > 0 ? handleAddWarmupSetToFirstExercise : undefined}
              isWarmupActive={isWarmupActive}
              isWarmupEnded={isWarmupEnded}
              onStartWarmup={handleStartWarmup}
              onEndWarmup={handleEndWarmup}
              onStartGymWorkout={handleStartGymWorkoutDirectly}
              programStarted={workoutProgramStarted}
            />
          </div>
        )}

        {/* If gym workout program has not started yet (user is in optional warmup mode or preparing) */}
        {!workoutProgramStarted ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 shadow-md animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Dumbbell className="w-4 h-4 text-amber-400 shrink-0" />
                  <h3 className="font-bold text-sm sm:text-base text-zinc-100 break-words line-clamp-2 sm:line-clamp-none leading-snug">
                    {workout.title || 'Gym Workout Program'}
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold border border-zinc-700/60 shrink-0">
                    {workout.exercises.length} Exercises
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartGymWorkoutDirectly}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-center shrink-0 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Gym Workout</span>
              </button>
            </div>

            {/* Exercise preview cards with minimalistic up/down queue reordering */}
            <div className="space-y-1.5 pt-1">
              {workout.exercises.map((exercise, idx) => (
                <div
                  key={`${exercise.exerciseId}_${idx}`}
                  className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-950/70 border border-zinc-850/80 text-xs gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Minimalistic short up/down arrows */}
                    <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 gap-0.5 shrink-0 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(idx, idx - 1)}
                        disabled={idx === 0}
                        aria-label={`Move ${exercise.name} up in queue`}
                        title={idx === 0 ? 'First in queue' : `Move ${exercise.name} up`}
                        className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:text-zinc-400 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(idx, idx + 1)}
                        disabled={idx === workout.exercises.length - 1}
                        aria-label={`Move ${exercise.name} down in queue`}
                        title={idx === workout.exercises.length - 1 ? 'Last in queue' : `Move ${exercise.name} down`}
                        className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:text-zinc-400 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono text-zinc-500 font-bold text-[11px] w-4 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-zinc-200 truncate">
                      {exercise.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                      ({exercise.equipment})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px] shrink-0">
                    <span>{exercise.sets.length} sets</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-amber-400/80">{exercise.targetMuscle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : workout.exercises.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
            <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="font-bold text-zinc-200">No exercises in this workout</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              All exercises have been removed from this session. You can add new exercises from the library or end and cancel this workout session.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase cursor-pointer"
              >
                + Add Exercise
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs cursor-pointer"
              >
                Cancel Workout
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Minimalistic Enable / Disable Timer Control on top of exercises */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  const next = !autoRestTimerEnabled;
                  setAutoRestTimerEnabled(next);
                  if (!next) {
                    setRestTimerState(null);
                  }
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                  !autoRestTimerEnabled
                    ? 'border-orange-500 hover:border-orange-400 ring-1 ring-orange-500/30 bg-zinc-900/90 hover:bg-zinc-850 text-orange-400 hover:text-orange-300 shadow-xs'
                    : 'border-red-500 hover:border-red-400 ring-1 ring-red-500/30 bg-zinc-900/90 hover:bg-zinc-850 text-red-400 hover:text-red-300 shadow-xs'
                }`}
                title={
                  autoRestTimerEnabled
                    ? 'Disable rest timer between exercises'
                    : 'Enable rest timer between exercises'
                }
              >
                <Timer className={`w-3.5 h-3.5 ${!autoRestTimerEnabled ? 'text-orange-400' : 'text-red-400'}`} />
                <span>{!autoRestTimerEnabled ? 'Enable Timer' : 'Disable Timer'}</span>
              </button>
            </div>

            {workout.exercises.map((exercise, index) => (
              <ExerciseCard
                key={`${exercise.exerciseId}_${index}`}
                exercise={exercise}
                exerciseIndex={index}
                unit={settings.weightUnit}
                workoutHistory={workoutHistory}
                onUpdateExercise={updated => handleUpdateExercise(index, updated)}
                onRemoveExercise={() => handleRemoveExercise(index)}
                onOpenPlateCalc={w => setPlateCalcWeight(w)}
                onOpen1RMCalc={(w, r) => setOneRmCalcState({ weight: w, reps: r })}
                onTriggerRestTimer={(name, secs, isBetween) => handleTriggerRestTimer(name, secs, isBetween)}
                soundEnabled={settings.soundEnabled}
                isResting={restTimerState !== null && restTimerState.name === exercise.name}
                currentEnvironment={currentEnvironment}
                onMoveUp={() => handleMoveExercise(index, index - 1)}
                onMoveDown={() => handleMoveExercise(index, index + 1)}
                canMoveUp={index > 0}
                canMoveDown={index < workout.exercises.length - 1}
                isActive={index === activeExerciseIndex}
                onSelectActive={() => setActiveExerciseIndex(index)}
              />
            ))}

            {/* Add Exercise Button */}
            <button
              onClick={() => setShowLibrary(true)}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-400/60 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300 hover:text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exercise to Workout</span>
            </button>
          </>
        )}

        {/* Completion & Session Control Section */}
        <div className="pt-3 space-y-3">
          {workoutProgramStarted && (
            <button
              type="button"
              onClick={() => setShowFinishConfirm(true)}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer shadow-lg shadow-amber-500/20 whitespace-nowrap"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Workout Complete</span>
            </button>
          )}

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>End & Cancel Workout Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Library Modal */}
      {showLibrary && (
        <ExerciseLibraryModal
          onClose={() => setShowLibrary(false)}
          onSelectExercise={handleAddExerciseFromLibrary}
          selectedExerciseIds={workout.exercises.map(e => e.exerciseId)}
          currentEnvironment={currentEnvironment}
        />
      )}

      {/* Plate Loading Calculator Modal */}
      {plateCalcWeight !== null && (
        <PlateCalculatorModal
          initialWeight={plateCalcWeight}
          unit={settings.weightUnit}
          onClose={() => setPlateCalcWeight(null)}
        />
      )}

      {/* 1RM Estimator Modal */}
      {oneRmCalcState !== null && (
        <OneRepMaxCalculatorModal
          initialWeight={oneRmCalcState.weight}
          initialReps={oneRmCalcState.reps}
          unit={settings.weightUnit}
          onClose={() => setOneRmCalcState(null)}
        />
      )}

      {/* WORKOUT COMPLETION CONFIRMATION MODAL */}
      {showFinishConfirm && (
        <div
          onClick={() => setShowFinishConfirm(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 text-zinc-100"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-100">Finish Workout Session</h3>
                  <p className="text-xs text-zinc-400 truncate max-w-[220px]">{workout.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-2.5 py-1">
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Duration</div>
                <div className="font-mono text-base font-bold text-zinc-100">{formatElapsed(elapsed)}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Sets Completed</div>
                <div className="font-mono text-base font-bold text-amber-400">{completedSetsCount} / {totalSetsCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Total Volume</div>
                <div className="font-mono text-base font-bold text-zinc-100">
                  {settings.weightUnit === 'kg'
                    ? `${Math.round(totalVolumeKg)} kg`
                    : `${Math.round(totalVolumeKg * 2.20462)} lbs`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="text-[11px] text-zinc-400">Exercises</div>
                <div className="font-mono text-base font-bold text-zinc-100">{workout.exercises.length}</div>
              </div>
            </div>

            {/* Uncompleted Sets Notice if any */}
            {totalSetsCount > completedSetsCount && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  You have <strong>{totalSetsCount - completedSetsCount} uncompleted sets</strong>. Finishing now will save only completed sets to your history.
                </span>
              </div>
            )}

            {/* Action Choices */}
            <div className="space-y-2 pt-2">
              {/* Option 1: Add to Completed (Done confirmation) */}
              <button
                type="button"
                onClick={() => {
                  setShowFinishConfirm(false);
                  handleFinish();
                }}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Add to Completed</span>
              </button>

              {/* Option 2: Discard Workout */}
              <button
                type="button"
                onClick={() => {
                  setShowFinishConfirm(false);
                  setShowCancelConfirm(true);
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Discard Workout (Do Not Save)</span>
              </button>

              {/* Option 3: Continue Workout */}
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="w-full py-2 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Keep Working Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* END & CANCEL WORKOUT CONFIRMATION MODAL */}
      {showCancelConfirm && (
        <div
          onClick={() => setShowCancelConfirm(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-5 space-y-4 text-zinc-100"
          >
            <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-zinc-100">End & Cancel Workout?</h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to end and cancel this workout? The session will be discarded and your progress will not be added to your history or completed cards.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs font-mono text-zinc-400">
              Elapsed Time: <strong className="text-zinc-200">{formatElapsed(elapsed)}</strong> · {completedSetsCount} sets done
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  onCancelWorkout();
                }}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-red-600/20"
              >
                Yes, Cancel & Discard
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Resume Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Between Exercises Timer Popup & Settings Modal */}
      <BetweenExercisesTimerModal
        isOpen={showBetweenTimerModal}
        onClose={() => setShowBetweenTimerModal(false)}
        timerEnabled={autoRestTimerEnabled}
        onToggleTimer={enabled => setAutoRestTimerEnabled(enabled)}
        defaultRestSeconds={settings.defaultRestSeconds || 90}
        onChangeDefaultRestSeconds={secs => {
          if (onUpdateSettings) {
            onUpdateSettings({ ...settings, defaultRestSeconds: secs });
          }
        }}
      />
    </div>
  );
};
