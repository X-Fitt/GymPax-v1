import React, { useState, useRef, useEffect } from 'react';
import { Check, CheckCircle2, Trash2, Disc, Calculator, Timer, History, ArrowRightLeft, X, ChevronUp, ChevronDown, MoreVertical, Maximize2, Film, Dumbbell } from 'lucide-react';
import { WorkoutExercise, WorkoutSet, SetType, ActiveWorkout, ExerciseDefinition, EquipmentEnvironment } from '../../types';
import { playSetCompleteSound } from '../../utils/audio';
import { AnimatedExerciseFigure } from '../common/AnimatedExerciseFigure';
import { FitnessModelPicture } from '../common/FitnessModelPicture';
import { getSuggestedNextSet, getLastExercisePerformance } from '../../utils/exerciseSuggestions';
import { getWorkoutHistory } from '../../utils/storage';
import { getAvailableSubstitutes, isExerciseAllowed, EQUIPMENT_ENVIRONMENTS } from '../../data/equipmentEnvironments';
import { findExerciseDefinition } from '../../data/exercises';
import { TermHelpTooltip } from '../common/TermHelpTooltip';
import { ExerciseInfoTooltip } from '../common/ExerciseInfoTooltip';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  unit: 'kg' | 'lbs';
  workoutHistory?: ActiveWorkout[];
  onUpdateExercise: (updated: WorkoutExercise) => void;
  onRemoveExercise: () => void;
  onOpenPlateCalc: (weight: number) => void;
  onOpen1RMCalc: (weight: number, reps: number) => void;
  onTriggerRestTimer: (exerciseName: string, durationSecs?: number, isBetweenExercises?: boolean) => void;
  soundEnabled?: boolean;
  isResting?: boolean;
  currentEnvironment?: EquipmentEnvironment;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isActive?: boolean;
  onSelectActive?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  unit,
  workoutHistory,
  onUpdateExercise,
  onRemoveExercise,
  onOpenPlateCalc,
  onOpen1RMCalc,
  onTriggerRestTimer,
  soundEnabled = true,
  isResting = false,
  currentEnvironment = 'commercial_gym',
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isActive = false,
  onSelectActive
}) => {
  const [userExpandedOverride, setUserExpandedOverride] = useState<boolean | null>(null);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [visualMode, setVisualMode] = useState<'picture' | 'motion'>('picture');
  const [isFullScreenVideoOpen, setIsFullScreenVideoOpen] = useState<boolean>(false);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [showDeleteExerciseConfirm, setShowDeleteExerciseConfirm] = useState<boolean>(false);
  const [setToDelete, setSetToDelete] = useState<{ id: string; setNumber: number } | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showActionsDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowActionsDropdown(false);
        setShowDeleteExerciseConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionsDropdown]);

  const history = workoutHistory && workoutHistory.length > 0 ? workoutHistory : getWorkoutHistory();
  const lastPerformance = getLastExercisePerformance(exercise.exerciseId, exercise.name, history);

  const currentDef =
    findExerciseDefinition(exercise.exerciseId) || findExerciseDefinition(exercise.name);
  const isAllowedInCurrentEnv = currentDef ? isExerciseAllowed(currentDef, currentEnvironment) : true;
  const resolvedRawMuscle =
    exercise.primary_muscle ||
    exercise.rawPrimaryMuscle ||
    currentDef?.primary_muscle ||
    currentDef?.rawPrimaryMuscle;
  const resolvedCdnUrl =
    exercise.cdn_url ||
    exercise.cdnUrl ||
    currentDef?.cdn_url ||
    currentDef?.cdnUrl;

  const handleSelectSubstitute = (newDef: ExerciseDefinition) => {
    const isTravel = newDef.equipment === 'Bodyweight';
    const isDumbbell = newDef.equipment === 'Dumbbell';
    const wasBarbell = exercise.equipment === 'Barbell';

    const updatedSets = exercise.sets.map(s => {
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

    const updated: WorkoutExercise = {
      ...exercise,
      id: newDef.id,
      exerciseId: newDef.id,
      name: newDef.name,
      targetMuscle: newDef.primaryMuscle,
      primary_muscle: newDef.primary_muscle,
      rawPrimaryMuscle: newDef.rawPrimaryMuscle,
      secondaryMuscles: newDef.secondaryMuscles,
      equipment: newDef.equipment,
      cdn_url: newDef.cdn_url,
      cdnUrl: newDef.cdnUrl,
      sets: updatedSets
    };

    onUpdateExercise(updated);
    setShowSwapModal(false);
  };

  const handleToggleSetComplete = (setId: string) => {
    let willComplete = false;
    const targetSet = exercise.sets.find(s => s.id === setId);
    if (targetSet) {
      willComplete = !targetSet.completed;
    }

    const updatedSets = exercise.sets.map(s => {
      if (s.id === setId) {
        return { ...s, completed: willComplete };
      }
      return s;
    });

    const isAllSetsCompletedNow = updatedSets.length > 0 && updatedSets.every(s => s.completed);

    if (willComplete) {
      if (soundEnabled) {
        playSetCompleteSound();
      }
      // Trigger rest timer, indicating if this is between exercises
      onTriggerRestTimer(exercise.name, exercise.restSeconds || 90, isAllSetsCompletedNow);
      if (isAllSetsCompletedNow) {
        setUserExpandedOverride(false);
      }
    }

    onUpdateExercise({ ...exercise, sets: updatedSets });
  };

  const handleUpdateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    const updatedSets = exercise.sets.map(s => {
      if (s.id === setId) {
        return { ...s, ...updates };
      }
      return s;
    });
    onUpdateExercise({ ...exercise, sets: updatedSets });
  };

  const handleAddSet = () => {
    const nextSetNumber = exercise.sets.length + 1;
    const suggestion = getSuggestedNextSet(exercise, nextSetNumber, history, unit);

    const newSet: WorkoutSet = {
      id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      setNumber: nextSetNumber,
      type: suggestion.type,
      weightKg: suggestion.weightKg,
      weightLbs: suggestion.weightLbs,
      reps: suggestion.reps,
      rpe: suggestion.rpe,
      completed: false,
      isSuggested: true,
      suggestedWeightKg: suggestion.weightKg,
      suggestedWeightLbs: suggestion.weightLbs,
      suggestedReps: suggestion.reps,
      suggestedReason: suggestion.reason,
      previousBest: suggestion.previousBestDisplay
    };

    onUpdateExercise({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const handleRemoveSet = (setId: string) => {
    if (exercise.sets.length <= 1) return;
    const filtered = exercise.sets
      .filter(s => s.id !== setId)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    onUpdateExercise({ ...exercise, sets: filtered });
  };

  const handleAddWarmupSet = () => {
    const topWeight = exercise.sets.find(s => s.weightKg > 0)?.weightKg || 60;
    const warmupWeight = Math.max(20, Math.round((topWeight * 0.5) / 2.5) * 2.5);
    const warmupWeightLbs = Math.round(warmupWeight * 2.20462);

    const newWarmupSet: WorkoutSet = {
      id: `wup_${Date.now()}`,
      setNumber: 1,
      type: 'warmup',
      weightKg: warmupWeight,
      weightLbs: warmupWeightLbs,
      reps: 12,
      rpe: 5,
      completed: false,
      isSuggested: true,
      suggestedWeightKg: warmupWeight,
      suggestedWeightLbs: warmupWeightLbs,
      suggestedReps: 12,
      suggestedReason: `Dynamic joint warm-up & motor pattern primer (50% working weight for ${exercise.name})`
    };

    onUpdateExercise({
      ...exercise,
      sets: [
        newWarmupSet,
        ...exercise.sets.map((s, idx) => ({ ...s, setNumber: idx + 2 }))
      ]
    });
  };

  // Find latest active weight for quick calculation triggers
  const activeSetWeight = exercise.sets.find(s => s.weightKg > 0)?.weightKg || 80;
  const activeSetReps = exercise.sets.find(s => s.reps > 0)?.reps || 8;

  // Index of the first uncompleted set (next upcoming set)
  const nextUncompletedIdx = exercise.sets.findIndex(s => !s.completed);
  const isAllSetsDone = exercise.sets.length > 0 && exercise.sets.every(s => s.completed);
  const isCollapsed = userExpandedOverride !== null ? !userExpandedOverride : isAllSetsDone;

  if (isCollapsed) {
    const totalVolume = exercise.sets.reduce((sum, s) => sum + (s.completed ? s.weightKg * s.reps : 0), 0);
    const displayVolume = unit === 'kg' ? `${Math.round(totalVolume)} kg` : `${Math.round(totalVolume * 2.20462)} lbs`;
    const completedSetsCount = exercise.sets.filter(s => s.completed).length;

    return (
      <div
        className={`bg-zinc-900 border rounded-2xl p-3 sm:p-3.5 shadow-md transition-all hover:bg-zinc-850/80 cursor-pointer ${
          isAllSetsDone
            ? 'border-emerald-500 ring-1 ring-emerald-500/30 shadow-emerald-500/10'
            : isActive
            ? 'border-orange-500 ring-1 ring-orange-500/30 shadow-orange-500/10'
            : 'border-zinc-800'
        }`}
        onClick={() => {
          setUserExpandedOverride(true);
          onSelectActive?.();
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Badge */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isAllSetsDone
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-800 border border-zinc-700/60 text-amber-400'
            }`}>
              {isAllSetsDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Dumbbell className="w-4 h-4 text-amber-400" />
              )}
            </div>

            {resolvedCdnUrl && (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-750 shrink-0 hidden xs:block">
                <video
                  src={resolvedCdnUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover filter brightness-90"
                />
              </div>
            )}

            <div className="min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-zinc-500">
                  #{exerciseIndex + 1}
                </span>
                <h3 className="font-bold text-sm text-zinc-100 break-words leading-snug mt-0.5">
                  {exercise.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300 mt-1">
                <span className={`${isAllSetsDone ? 'text-emerald-400' : 'text-zinc-300'} font-medium font-mono text-[11px]`}>
                  {completedSetsCount} / {exercise.sets.length} sets completed
                </span>
                {totalVolume > 0 && (
                  <>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="text-zinc-400 font-mono text-[11px]">{displayVolume} vol</span>
                  </>
                )}
                <span aria-hidden="true" className="text-zinc-600 hidden sm:inline">·</span>
                <span className="text-zinc-500 text-[11px] hidden sm:inline">{exercise.targetMuscle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAllSetsDone && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Completed
              </span>
            )}

            {/* Option button to expand card once collapsed */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUserExpandedOverride(true);
                onSelectActive?.();
              }}
              title="Expand exercise card"
              aria-label="Expand exercise card"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
            >
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelectActive}
      className={`bg-zinc-900 border rounded-2xl p-3 sm:p-4 shadow-md transition-all ${
        isAllSetsDone
          ? 'border-emerald-500 ring-1 ring-emerald-500/30 shadow-emerald-500/10'
          : isActive
          ? 'border-orange-500 ring-1 ring-orange-500/30 shadow-orange-500/10'
          : 'border-zinc-800'
      }`}
    >
      {/* Exercise Header */}
      <div className="flex items-start justify-between gap-2.5 pb-3 border-b border-zinc-800/80">
        {resolvedCdnUrl && (
          <div className="relative shrink-0 group/thumb">
            <button
              type="button"
              onClick={() => setShowAnimation(prev => !prev)}
              title={showAnimation ? 'Hide video player' : 'Expand exercise video'}
              className="w-14 h-12 sm:w-16 sm:h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-750/90 hover:border-amber-400/70 block relative cursor-pointer transition-all shadow-xs"
            >
              <video
                key={resolvedCdnUrl}
                src={resolvedCdnUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center filter brightness-[0.90] contrast-[1.08] transition-transform duration-300 group-hover/thumb:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </button>
            {/* Simplified Video Expansion Button (Bottom Right) */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsFullScreenVideoOpen(true);
              }}
              title="Expand video to full screen"
              aria-label="Expand video to full screen"
              className="absolute bottom-1 right-1 p-1 rounded-md bg-black/85 hover:bg-black text-amber-400 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-400/80 shadow-sm cursor-pointer z-10 transition-all active:scale-95 flex items-center gap-0.5"
            >
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
        <div className="min-w-0 flex-1 pr-1 pt-1 sm:pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Minimalistic short up/down arrows to move exercise in queue */}
            {(onMoveUp || onMoveDown) && (
              <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 gap-0.5 shrink-0 shadow-xs mr-0.5">
                <button
                  type="button"
                  onClick={onMoveUp}
                  disabled={!canMoveUp}
                  aria-label={`Move ${exercise.name} up in queue`}
                  title={canMoveUp ? `Move ${exercise.name} up in session queue` : 'First exercise in queue'}
                  className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:text-zinc-400 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onMoveDown}
                  disabled={!canMoveDown}
                  aria-label={`Move ${exercise.name} down in queue`}
                  title={canMoveDown ? `Move ${exercise.name} down in session queue` : 'Last exercise in queue'}
                  className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:text-zinc-400 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <span className="font-mono text-xs font-bold text-zinc-400 shrink-0">
              #{exerciseIndex + 1}
            </span>
            <ExerciseInfoTooltip
              exerciseId={exercise.exerciseId}
              exerciseName={exercise.name}
              size="xs"
            />
            {isActive && !isAllSetsDone && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span>Active</span>
              </span>
            )}
            {isResting && (
              <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1 animate-pulse shrink-0">
                <Timer className="w-3 h-3 animate-spin-slow" />
                <span>Rest Active</span>
              </span>
            )}
            <h3 className="basis-full w-full font-bold text-sm sm:text-base text-zinc-100 break-words leading-snug mt-1.5 sm:mt-1">
              {exercise.name}
            </h3>
          </div>
          {/* Zero-pill metadata text */}
          <div className="flex items-center gap-2 text-xs text-zinc-300 mt-1 flex-wrap">
            <span className="text-amber-300 font-semibold">
              {resolvedRawMuscle && resolvedRawMuscle !== exercise.targetMuscle
                ? `${resolvedRawMuscle} (${exercise.targetMuscle})`
                : exercise.targetMuscle}
            </span>
            <span aria-hidden="true">·</span>
            <span>{exercise.equipment}</span>
          </div>

          {/* Environmental Incompatibility Warning & One-Tap Swap */}
          {!isAllowedInCurrentEnv && (
            <button
              type="button"
              onClick={() => setShowSwapModal(true)}
              className="mt-1 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer text-left font-medium"
            >
              <span>⚠️ Incompatible with {EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.shortTitle}</span>
              <span className="text-amber-400 underline">Swap</span>
            </button>
          )}

          {/* Last Performance Reference (Clean unboxed) */}
          {lastPerformance && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mt-1">
              <History className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="truncate">
                Last: <strong className="text-zinc-200">
                  {unit === 'kg' ? `${lastPerformance.maxWeightKg} kg` : `${lastPerformance.maxWeightLbs} lbs`} ×{' '}
                  {lastPerformance.bestSet.reps}
                </strong>{' '}
                <span className="text-zinc-600 hidden sm:inline">({lastPerformance.date})</span>
              </span>
            </div>
          )}
        </div>

        {/* Header Actions: Collapse Button & Quick Tools Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUserExpandedOverride(false);
            }}
            title="Collapse exercise card"
            aria-label="Collapse exercise card"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
          >
            <ChevronDown className="w-4 h-4 transition-transform duration-200 rotate-180" />
          </button>

          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                setShowActionsDropdown(prev => !prev);
                if (showActionsDropdown) setShowDeleteExerciseConfirm(false);
              }}
              aria-label="Exercise tools and actions"
              aria-expanded={showActionsDropdown}
              title="Exercise tools & options"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center gap-0.5 ${
                showActionsDropdown || showAnimation
                  ? 'bg-zinc-800 border-amber-400/40 text-amber-400'
                  : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

          {showActionsDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setShowActionsDropdown(false);
                  setShowSwapModal(true);
                }}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-900 hover:text-amber-400 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Swap / Substitute Exercise</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowActionsDropdown(false);
                  onOpenPlateCalc(activeSetWeight);
                }}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-900 hover:text-amber-400 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Disc className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Plate Loading Calculator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowActionsDropdown(false);
                  onOpen1RMCalc(activeSetWeight, activeSetReps);
                }}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-900 hover:text-amber-400 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>1RM Estimator</span>
              </button>

              <div className="my-1 border-t border-zinc-800/80" />

              {showDeleteExerciseConfirm ? (
                <div className="px-3 py-2 flex items-center justify-between gap-2 bg-red-500/5">
                  <span className="text-[11px] text-zinc-300 font-medium">Delete exercise?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteExerciseConfirm(false);
                        setShowActionsDropdown(false);
                        onRemoveExercise();
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteExerciseConfirm(false)}
                      className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteExerciseConfirm(true)}
                  className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Delete Exercise</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Visual Exercise Demonstration: MP4 Video Stream & Motion */}
      {showAnimation && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-zinc-400 font-mono uppercase font-bold text-[10px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {visualMode === 'picture' ? 'Video Demonstration Player' : 'Interactive Speed Player'}
            </span>
            <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setVisualMode('picture')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  visualMode === 'picture' ? 'bg-zinc-800 text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Video View
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('motion')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  visualMode === 'motion' ? 'bg-zinc-800 text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Speed Control
              </button>
            </div>
          </div>

          {visualMode === 'picture' ? (
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 w-full min-h-[240px] sm:min-h-[280px] h-60 sm:h-72">
              <FitnessModelPicture
                exerciseId={exercise.exerciseId}
                exerciseName={exercise.name}
                primaryMuscle={exercise.targetMuscle}
                cdnUrl={resolvedCdnUrl}
                cdn_url={resolvedCdnUrl}
                preferMotionGif={true}
                aspect="wide"
                showZoom={true}
              />
            </div>
          ) : (
            <AnimatedExerciseFigure
              exerciseId={exercise.exerciseId}
              exerciseName={exercise.name}
              primaryMuscle={exercise.targetMuscle}
              cdnUrl={resolvedCdnUrl}
              cdn_url={resolvedCdnUrl}
              compact={true}
            />
          )}
        </div>
      )}

      {/* Sets Table - Mobile Ergonomic Fit */}
      <div className="mt-3 w-full overflow-hidden">
        <table className="w-full text-left text-xs border-collapse table-fixed">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-800/60 pb-1 whitespace-nowrap">
              <th className="py-1 px-0.5 sm:px-1 font-semibold w-8 sm:w-10 text-center whitespace-nowrap">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  SET
                  <TermHelpTooltip
                    termId="warmup_set"
                    customTitle="Warmup & Working Sets"
                    customShort="W = Warmup Set. Graduated lighter sets to prime synovial fluid and neural pathways."
                    customExplanation={`How to do your warmup sets for ${exercise.name}:\n1. Perform mobility stretches for ${exercise.targetMuscle}.\n2. Warmup set 1: 50% working weight for 10-12 smooth reps.\n3. Warmup set 2 (for heavy lifts): 75% for 3-4 reps.\n4. Working sets (1, 2, 3...): Your prescribed target weight taken near failure.`}
                    customWhyItMatters="Prepares joint capsules, eliminates cold tendon strain, and elevates motor unit recruitment."
                    customExample="Warmup sets should never reach muscular failure. Save your maximum intensity for numbered working sets."
                    size="xs"
                  />
                </span>
              </th>
              <th className="py-1 px-1 sm:px-2 font-semibold text-center whitespace-nowrap">{unit.toUpperCase()}</th>
              <th className="py-1 px-1 sm:px-2 font-semibold text-center whitespace-nowrap">REPS</th>
              <th className="py-1 px-0.5 sm:px-1 font-semibold text-center w-14 sm:w-16 whitespace-nowrap">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  RPE
                  <TermHelpTooltip termId="rpe" size="xs" />
                </span>
              </th>
              <th className="py-1 px-1 font-semibold w-12 sm:w-14 text-center whitespace-nowrap">DONE</th>
              <th className="py-1 px-1 w-10 sm:w-12 text-center font-semibold text-zinc-500 whitespace-nowrap" title="Delete set">DEL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40 font-mono">
            {exercise.sets.map((set, sIdx) => {
              const isNextTarget = sIdx === nextUncompletedIdx;

              return (
                <tr
                  key={set.id}
                  className={`transition-colors ${
                    set.completed
                      ? 'bg-amber-400/5 text-zinc-400'
                      : isNextTarget
                      ? 'bg-amber-400/[0.06] text-zinc-100 border-l-2 border-l-amber-400'
                      : 'hover:bg-zinc-850/40 text-zinc-200'
                  }`}
                >
                  {/* Set number / Type */}
                  <td className="py-2 px-0.5 sm:px-1 text-center">
                    <div className="inline-flex items-center justify-center">
                      <select
                        value={set.type === 'warmup' ? 'warmup' : 'normal'}
                        onChange={e => handleUpdateSet(set.id, { type: e.target.value as SetType })}
                        className={`rounded-lg py-1 px-0.5 text-xs sm:text-sm font-mono font-bold uppercase focus:outline-none cursor-pointer w-9 sm:w-10 h-8 sm:h-9 text-center transition-colors mx-auto block ${
                          set.type === 'warmup'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-extrabold shadow-xs'
                            : 'bg-zinc-950 text-zinc-100 border border-zinc-700/80 hover:border-zinc-500 shadow-xs'
                        }`}
                        title="Set Number or Warmup (W: Warmup)"
                      >
                        <option value="normal" className="bg-zinc-900 text-zinc-100 font-bold">{sIdx + 1}</option>
                        <option value="warmup" className="bg-zinc-900 text-amber-300 font-bold">W</option>
                      </select>
                    </div>
                  </td>

                  {/* Weight Input (KG / LBS) */}
                  <td className="py-2 px-1 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={unit === 'kg' ? set.weightKg || '' : set.weightLbs || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        if (unit === 'kg') {
                          handleUpdateSet(set.id, {
                            weightKg: val,
                            weightLbs: Math.round(val * 2.20462 * 10) / 10
                          });
                        } else {
                          handleUpdateSet(set.id, {
                            weightLbs: val,
                            weightKg: Math.round((val / 2.20462) * 10) / 10
                          });
                        }
                      }}
                      placeholder="0"
                      className={`w-full max-w-[64px] sm:max-w-[80px] bg-zinc-950/80 border rounded-lg py-1 px-1 text-center font-bold text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-amber-400 transition-colors mx-auto block ${
                        isNextTarget ? 'border-amber-500/50' : 'border-zinc-700/80'
                      }`}
                    />
                  </td>

                  {/* Reps Input */}
                  <td className="py-2 px-1 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={set.reps || ''}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10) || 0;
                        handleUpdateSet(set.id, { reps: val });
                      }}
                      placeholder="0"
                      className={`w-full max-w-[50px] sm:max-w-[64px] bg-zinc-950/80 border rounded-lg py-1 px-1 text-center font-bold text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-amber-400 transition-colors mx-auto block ${
                        isNextTarget ? 'border-amber-500/50' : 'border-zinc-700/80'
                      }`}
                    />
                  </td>

                  {/* RPE Selector - Clearly visible in mobile view with full decimal increments */}
                  <td className="py-2 px-0.5 sm:px-1 text-center">
                    <select
                      value={set.rpe !== undefined ? set.rpe : ''}
                      onChange={e => handleUpdateSet(set.id, { rpe: e.target.value ? parseFloat(e.target.value) : undefined })}
                      title="Rate of Perceived Exertion (RPE 5.0 - 10.0)"
                      className={`w-full max-w-[52px] sm:max-w-[60px] h-8 sm:h-9 bg-zinc-950 border rounded-lg py-1 px-0.5 text-center font-mono font-bold text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors cursor-pointer mx-auto block shadow-xs ${
                        set.rpe !== undefined
                          ? 'text-amber-400 border-amber-500/40 bg-amber-500/10 font-extrabold'
                          : 'text-zinc-400 border-zinc-700/80 hover:text-zinc-200'
                      }`}
                    >
                      <option value="" className="bg-zinc-900 text-zinc-400">—</option>
                      <option value="5" className="bg-zinc-900 text-zinc-100 font-mono">5.0</option>
                      <option value="5.5" className="bg-zinc-900 text-zinc-100 font-mono">5.5</option>
                      <option value="6" className="bg-zinc-900 text-zinc-100 font-mono">6.0</option>
                      <option value="6.5" className="bg-zinc-900 text-zinc-100 font-mono">6.5</option>
                      <option value="7" className="bg-zinc-900 text-zinc-100 font-mono">7.0</option>
                      <option value="7.5" className="bg-zinc-900 text-zinc-100 font-mono">7.5</option>
                      <option value="8" className="bg-zinc-900 text-zinc-100 font-mono">8.0</option>
                      <option value="8.5" className="bg-zinc-900 text-zinc-100 font-mono">8.5</option>
                      <option value="9" className="bg-zinc-900 text-zinc-100 font-mono">9.0</option>
                      <option value="9.5" className="bg-zinc-900 text-zinc-100 font-mono">9.5</option>
                      <option value="10" className="bg-zinc-900 text-zinc-100 font-mono">10.0</option>
                    </select>
                  </td>

                  {/* Done Checkbox */}
                  <td className="py-2 px-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleSetComplete(set.id)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer mx-auto ${
                        set.completed
                          ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-500/30'
                          : 'bg-zinc-900/80 hover:bg-zinc-850 border border-emerald-600/40 hover:border-emerald-400 text-emerald-500/40 hover:text-emerald-400'
                      }`}
                      aria-label={`Mark set ${sIdx + 1} as completed`}
                    >
                      <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] text-emerald-400 ${set.completed ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-80'}`} />
                    </button>
                  </td>

                  {/* Set Delete Action - Clearly visible in mobile view */}
                  <td className="py-2 px-1 text-center">
                    <button
                      type="button"
                      onClick={() => setSetToDelete({ id: set.id, setNumber: sIdx + 1 })}
                      title={exercise.sets.length <= 1 ? 'At least 1 set required' : `Delete set ${set.setNumber || sIdx + 1}`}
                      disabled={exercise.sets.length <= 1}
                      aria-label={`Delete set ${sIdx + 1}`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all mx-auto cursor-pointer ${
                        exercise.sets.length <= 1
                          ? 'opacity-20 cursor-not-allowed pointer-events-none text-zinc-600'
                          : 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 active:scale-95 shadow-xs'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer controls: Add Set & Notes */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAddSet}
            className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <span>Add Set</span>
          </button>

          <div className="inline-flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleAddWarmupSet}
              className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
              title="Add a 50% load progressive warm-up set"
            >
              <span>Add Warmup Set</span>
            </button>
            <TermHelpTooltip
              customTitle={`Warmup Set: ${exercise.name}`}
              customShort={`How to do your warmup set for ${exercise.name}: 40-50% working weight × 10-12 reps.`}
              customExplanation={`How to perform your warmup:\n1. Dynamic stretch for ${exercise.targetMuscle} (30s hold or 10 dynamic rotations).\n2. Load 40-50% of your target working weight.\n3. Execute 10-12 reps with controlled tempo (3s eccentric) to circulate synovial fluid and groove the neural pathway.\n4. Keep reps smooth and rhythmic without reaching muscular fatigue (RPE ~5-6).\n5. Rest 60-90s before heavy working sets.`}
              customWhyItMatters={`Primes joint stability and neuromuscular firing for ${exercise.name} so you can produce maximum power on heavy working sets safely.`}
              customExample={`Target: ${exercise.targetMuscle}. Keep form identical to your heavy sets.`}
              size="xs"
            />
          </div>
        </div>

        <input
          type="text"
          placeholder="Exercise notes (e.g. seat height 4, pin 8)..."
          value={exercise.notes || ''}
          onChange={e => onUpdateExercise({ ...exercise, notes: e.target.value })}
          className="w-full sm:flex-1 bg-zinc-950/60 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      {/* Exercise Bottom Controls Bar */}
      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
        {/* Minimalistic collapse icon button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setUserExpandedOverride(false);
          }}
          title="Collapse exercise card"
          aria-label="Collapse exercise card"
          className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
        >
          <ChevronDown className="w-4 h-4 rotate-180 transition-transform duration-200" />
        </button>
      </div>

      {/* Swap / Substitute Modal */}
      {showSwapModal && (
        <div
          onClick={() => setShowSwapModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-5 space-y-3 text-zinc-100 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm sm:text-base">Swap / Substitute Exercise</h4>
              </div>
              <button
                onClick={() => setShowSwapModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Replacing <strong className="text-zinc-200">{exercise.name}</strong> for{' '}
              <strong className="text-amber-400">{exercise.targetMuscle}</strong>. Select an alternative adapted for your{' '}
              <span className="text-amber-300 font-semibold">{EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.title}</span> setup:
            </p>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {getAvailableSubstitutes(exercise.exerciseId, currentEnvironment).slice(0, 35).map(subDef => {
                const isCurrent = subDef.id === exercise.exerciseId;
                return (
                  <div
                    key={subDef.id}
                    onClick={() => handleSelectSubstitute(subDef)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? 'border-amber-400/50 bg-amber-400/10'
                        : 'border-zinc-800 bg-zinc-950/80 hover:border-amber-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900">
                        <FitnessModelPicture
                          exerciseId={subDef.id}
                          exerciseName={subDef.name}
                          primaryMuscle={subDef.primaryMuscle}
                          cdnUrl={subDef.cdnUrl}
                          aspect="wide"
                          showZoom={false}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-zinc-100 truncate block">
                            {subDef.name}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400 text-zinc-950">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 flex-wrap">
                          <span className="text-amber-300/90 font-medium">
                            {subDef.rawPrimaryMuscle || subDef.primaryMuscle}
                          </span>
                          <span>·</span>
                          <span className="text-amber-400/90 font-mono font-semibold">{subDef.equipment}</span>
                          <span>·</span>
                          <span>{subDef.tier}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 text-xs font-semibold shrink-0 transition-colors"
                    >
                      Select
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Video Popup */}
      {isFullScreenVideoOpen && (
        <div
          onClick={() => setIsFullScreenVideoOpen(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 sm:bg-black/90 backdrop-blur-md p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-4xl bg-zinc-950 sm:bg-zinc-900 sm:border sm:border-zinc-750 sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950/90 backdrop-blur-sm z-10">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <h4 className="font-bold text-zinc-100 text-sm sm:text-base truncate">
                    {exercise.name}
                  </h4>
                </div>
                {resolvedRawMuscle && (
                  <p className="text-[11px] text-amber-400 font-mono uppercase tracking-wider truncate mt-0.5">
                    Target: {resolvedRawMuscle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFullScreenVideoOpen(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                  aria-label="Close full screen"
                  title="Close full screen"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            {/* Video Stage */}
            <div className="flex-1 w-full min-h-0 relative flex items-center justify-center bg-black overflow-hidden p-2 sm:p-4">
              {resolvedCdnUrl ? (
                <video
                  src={resolvedCdnUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full max-h-full max-w-full object-contain object-center filter brightness-[0.94] contrast-[1.06]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <Film className="w-10 h-10 text-amber-400 animate-pulse mb-2" />
                  <span className="text-sm font-mono text-zinc-200">{exercise.name}</span>
                </div>
              )}
            </div>

            {/* Minimalistic Footer */}
            <div className="shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="truncate">Full Screen Video · {resolvedRawMuscle || 'Form Demonstration'}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsFullScreenVideoOpen(false)}
                className="px-3 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick & Short Delete Set Confirmation Popup */}
      {setToDelete && (
        <div
          onClick={() => setSetToDelete(null)}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xs bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl space-y-3 text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-100">
                Delete Set {setToDelete.setNumber}?
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Remove this set from {exercise.name}?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSetToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRemoveSet(setToDelete.id);
                  setSetToDelete(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
