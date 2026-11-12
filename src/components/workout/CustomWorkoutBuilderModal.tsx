import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Dumbbell,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight,
  Flame,
  CheckCircle2,
  Edit2,
  Lock,
  Info,
  AlertTriangle,
  Wind,
  Clock,
  Maximize2,
  Film
} from 'lucide-react';
import {
  CustomWorkoutProgram,
  DailyWorkoutRoutine,
  ExerciseDefinition,
  MuscleGroup,
  Equipment,
  UserSubscription
} from '../../types';
import { EXERCISE_DATABASE, resolveCatalogExercise, groundRoutineExercises } from '../../data/exercises';
import { getCustomExercises, MAX_FREE_CUSTOM_WORKOUTS } from '../../utils/storage';
import { FitnessModelPicture } from '../common/FitnessModelPicture';
import { getExerciseHowTo } from '../../data/exerciseHowTo';

interface CustomWorkoutBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProgram: (program: CustomWorkoutProgram) => void;
  initialProgram?: CustomWorkoutProgram | null;
  onDeleteProgram?: (programId: string) => void;
  subscription?: UserSubscription;
  currentWorkoutsCount?: number;
  onOpenUpgradeModal?: () => void;
}

const MUSCLE_FILTER_CHIPS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Custom', value: 'custom' },
  { label: 'Chest', value: 'Chest' },
  { label: 'Back', value: 'Back' },
  { label: 'Shoulders', value: 'Shoulders' },
  { label: 'Biceps', value: 'Biceps' },
  { label: 'Triceps', value: 'Triceps' },
  { label: 'Quads', value: 'Quads' },
  { label: 'Hamstrings', value: 'Hamstrings' },
  { label: 'Glutes', value: 'Glutes' },
  { label: 'Calves', value: 'Calves' },
  { label: 'Abs & Core', value: 'Abs & Core' },
  { label: 'Forearms', value: 'Forearms' }
];

export const CustomWorkoutBuilderModal: React.FC<CustomWorkoutBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveProgram,
  initialProgram,
  onDeleteProgram,
  subscription,
  currentWorkoutsCount = 0,
  onOpenUpgradeModal
}) => {
  const isPro = !!subscription?.isPro;
  const isCreatingNew = !initialProgram;
  const isAtLimit = isCreatingNew && !isPro && currentWorkoutsCount >= MAX_FREE_CUSTOM_WORKOUTS;
  const remainingSlots = isPro ? Infinity : Math.max(0, MAX_FREE_CUSTOM_WORKOUTS - currentWorkoutsCount);
  // Workout Name (can be renamed by user)
  const [workoutName, setWorkoutName] = useState<string>(
    initialProgram?.name || 'Personal Custom Workout'
  );

  // How many days for the workout program (1 to 7 days)
  const [daysCount, setDaysCount] = useState<number>(
    initialProgram?.daysCount || initialProgram?.routines.length || 3
  );

  // Active day index being edited
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [selectedInspectVideo, setSelectedInspectVideo] = useState<{ name: string; videoSrc: string; muscle?: string } | null>(null);

  // Routines configuration for each day
  const [routines, setRoutines] = useState<DailyWorkoutRoutine[]>(() => {
    if (initialProgram && initialProgram.routines.length > 0) {
      return (JSON.parse(JSON.stringify(initialProgram.routines)) as DailyWorkoutRoutine[]).map(r => groundRoutineExercises(r));
    }
    return [
      groundRoutineExercises({
        dayName: 'Day 1: Upper Body Focus',
        focus: 'Chest, Shoulders',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8 }
        ]
      }),
      groundRoutineExercises({
        dayName: 'Day 2: Lower Body & Core',
        focus: 'Quads, Hamstrings',
        exercises: [
          { exerciseId: 'barbell_full_squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8-10', targetRpe: 8 }
        ]
      }),
      groundRoutineExercises({
        dayName: 'Day 3: Back & Pull',
        focus: 'Back, Biceps',
        exercises: [
          { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
        ]
      })
    ];
  });

  // Keep state synchronized whenever modal is opened with new/edit program
  useEffect(() => {
    if (isOpen) {
      if (initialProgram) {
        setWorkoutName(initialProgram.name);
        setDaysCount(initialProgram.daysCount || initialProgram.routines.length || 3);
        setRoutines((JSON.parse(JSON.stringify(initialProgram.routines)) as DailyWorkoutRoutine[]).map(r => groundRoutineExercises(r)));
      } else {
        setWorkoutName('Personal Custom Workout');
        setDaysCount(3);
        setRoutines([
          groundRoutineExercises({
            dayName: 'Day 1: Upper Body Focus',
            focus: 'Chest, Shoulders',
            exercises: [
              { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8 },
              { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8 }
            ]
          }),
          groundRoutineExercises({
            dayName: 'Day 2: Lower Body & Core',
            focus: 'Quads, Hamstrings',
            exercises: [
              { exerciseId: 'barbell_full_squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8 },
              { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8-10', targetRpe: 8 }
            ]
          }),
          groundRoutineExercises({
            dayName: 'Day 3: Back & Pull',
            focus: 'Back, Biceps',
            exercises: [
              { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 8 },
              { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
            ]
          })
        ]);
      }
      setActiveDayIdx(0);
      setShowExercisePicker(false);
      setSearchQuery('');
      setInspectedExercise(null);
    }
  }, [isOpen, initialProgram]);

  // Search & Muscle Category Filter for exercise picker
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [showExercisePicker, setShowExercisePicker] = useState<boolean>(false);
  const [customList, setCustomList] = useState<ExerciseDefinition[]>(() => getCustomExercises());

  // Exercise movement explanation popup state
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDefinition | null>(null);
  const [inspectActiveTab, setInspectActiveTab] = useState<'technique' | 'cues' | 'mistakes'>('technique');

  useEffect(() => {
    setCustomList(getCustomExercises());
    const handleSync = () => setCustomList(getCustomExercises());
    window.addEventListener('gympax:exercises-updated', handleSync);
    return () => window.removeEventListener('gympax:exercises-updated', handleSync);
  }, [isOpen, showExercisePicker]);

  // Merge user custom exercises first + standard database
  const allAvailableExercises = useMemo(() => {
    const customIds = new Set(customList.map(e => e.id));
    return [
      ...customList,
      ...EXERCISE_DATABASE.filter(e => !customIds.has(e.id))
    ];
  }, [customList]);

  // Filtered exercises for the picker
  const filteredPickerExercises = useMemo(() => {
    return allAvailableExercises.filter(ex => {
      if (selectedMuscle === 'custom') {
        if (!ex.isCustom) return false;
      } else if (selectedMuscle !== 'all' && ex.primaryMuscle !== selectedMuscle) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          ex.name.toLowerCase().includes(q) ||
          ex.primaryMuscle.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allAvailableExercises, selectedMuscle, searchQuery]);

  // Adjust routines array when daysCount changes
  const handleDaysCountChange = (count: number) => {
    setDaysCount(count);
    setRoutines(prev => {
      const next: DailyWorkoutRoutine[] = [...prev];
      if (count > next.length) {
        // Add additional days
        for (let i = next.length; i < count; i++) {
          next.push({
            dayName: `Day ${i + 1}: Custom Training`,
            focus: 'Full Body',
            exercises: []
          });
        }
      } else if (count < next.length) {
        // Trim to count
        return next.slice(0, count);
      }
      return next;
    });

    if (activeDayIdx >= count) {
      setActiveDayIdx(count - 1);
    }
  };

  if (!isOpen) return null;

  const currentRoutine = routines[activeDayIdx] || {
    dayName: `Day ${activeDayIdx + 1}`,
    focus: 'Full Body',
    exercises: []
  };

  const handleUpdateRoutineName = (newName: string) => {
    setRoutines(prev => {
      const next = [...prev];
      if (next[activeDayIdx]) {
        next[activeDayIdx] = { ...next[activeDayIdx], dayName: newName };
      }
      return next;
    });
  };

  const handleAddExerciseToCurrentDay = (exDef: ExerciseDefinition) => {
    setRoutines(prev => {
      const next = [...prev];
      const routine = next[activeDayIdx];
      if (!routine) return prev;

      // Don't add duplicate if already present in this day
      if (routine.exercises.some(e => e.exerciseId === exDef.id)) {
        return prev;
      }

      const updatedExercises = [
        ...routine.exercises,
        {
          id: exDef.id,
          exerciseId: exDef.id,
          name: exDef.name,
          primary_muscle: exDef.primary_muscle || exDef.rawPrimaryMuscle || exDef.primaryMuscle,
          cdn_url: exDef.cdn_url || exDef.cdnUrl || '',
          defaultSets: 3, // Default 3 sets
          targetReps: '8-10',
          targetRpe: 8
        }
      ];

      // Recompute focus muscles from exercises
      const muscleSet = new Set<string>();
      updatedExercises.forEach(item => {
        const d = allAvailableExercises.find(e => e.id === item.exerciseId) || resolveCatalogExercise(item.exerciseId);
        if (d) muscleSet.add(d.primaryMuscle);
      });
      const focus = Array.from(muscleSet).join(', ') || 'Custom Focus';

      const isGenericDayName = /^Day \d+:\s*(Upper Body Focus|Lower Body & Core|Back & Pull|Custom Training|.*Focus)$/i.test(routine.dayName);
      const updatedDayName = isGenericDayName ? `Day ${activeDayIdx + 1}: ${focus} Focus` : routine.dayName;

      next[activeDayIdx] = {
        ...routine,
        dayName: updatedDayName,
        focus,
        exercises: updatedExercises
      };
      return next;
    });
  };

  const handleRemoveExerciseFromCurrentDay = (exerciseId: string) => {
    setRoutines(prev => {
      const next = [...prev];
      const routine = next[activeDayIdx];
      if (!routine) return prev;

      const updatedExercises = routine.exercises.filter(e => e.exerciseId !== exerciseId);
      const muscleSet = new Set<string>();
      updatedExercises.forEach(item => {
        const d = allAvailableExercises.find(e => e.id === item.exerciseId);
        if (d) muscleSet.add(d.primaryMuscle);
      });
      const focus = Array.from(muscleSet).join(', ') || 'Custom Focus';

      const isGenericDayName = /^Day \d+:\s*(Upper Body Focus|Lower Body & Core|Back & Pull|Custom Training|.*Focus)$/i.test(routine.dayName);
      const updatedDayName = isGenericDayName ? `Day ${activeDayIdx + 1}: ${focus} Focus` : routine.dayName;

      next[activeDayIdx] = {
        ...routine,
        dayName: updatedDayName,
        focus,
        exercises: updatedExercises
      };
      return next;
    });
  };

  const handleUpdateExerciseSets = (exerciseId: string, delta: number) => {
    setRoutines(prev => {
      const next = [...prev];
      const routine = next[activeDayIdx];
      if (!routine) return prev;

      const updatedExercises = routine.exercises.map(e => {
        if (e.exerciseId === exerciseId) {
          const newSets = Math.max(1, Math.min(8, e.defaultSets + delta));
          return { ...e, defaultSets: newSets };
        }
        return e;
      });

      next[activeDayIdx] = { ...routine, exercises: updatedExercises };
      return next;
    });
  };

  const handleUpdateExerciseReps = (exerciseId: string, reps: string) => {
    setRoutines(prev => {
      const next = [...prev];
      const routine = next[activeDayIdx];
      if (!routine) return prev;

      const updatedExercises = routine.exercises.map(e => {
        if (e.exerciseId === exerciseId) {
          return { ...e, targetReps: reps };
        }
        return e;
      });

      next[activeDayIdx] = { ...routine, exercises: updatedExercises };
      return next;
    });
  };

  const handleMoveExerciseInRoutine = (fromIdx: number, toIdx: number) => {
    setRoutines(prev => {
      const next = [...prev];
      const routine = next[activeDayIdx];
      if (!routine || toIdx < 0 || toIdx >= routine.exercises.length) return prev;
      const reordered = [...routine.exercises];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      next[activeDayIdx] = { ...routine, exercises: reordered };
      return next;
    });
  };

  const handleSave = () => {
    if (isAtLimit) {
      if (onOpenUpgradeModal) {
        onClose();
        onOpenUpgradeModal();
      }
      return;
    }
    const trimmedName = workoutName.trim() || 'My Custom Workout';
    const activeRoutines = routines.slice(0, daysCount);
    const programToSave: CustomWorkoutProgram = {
      id: initialProgram?.id || `cwp_${Date.now()}`,
      name: trimmedName,
      daysCount,
      routines: activeRoutines,
      createdAt: initialProgram?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    onSaveProgram(programToSave);
    onClose();
  };

  const getExerciseName = (id: string) => {
    return allAvailableExercises.find(e => e.id === id)?.name || id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-7 text-zinc-100 space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-850 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2 flex-wrap">
                <span>Custom Build Personal Workout</span>
                {isPro ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>PRO UNLIMITED</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1 ${
                    isAtLimit
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  }`}>
                    {isAtLimit && <Lock className="w-3 h-3" />}
                    <span>{currentWorkoutsCount} / {MAX_FREE_CUSTOM_WORKOUTS} FREE</span>
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Customize exercises, program days, and sets per movement.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Free Plan Quota / Pro Unlimited Notice */}
          {isAtLimit ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-950/20 border border-amber-500/40 text-zinc-100 space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-zinc-100">
                      Free Custom Workouts Limit Reached ({MAX_FREE_CUSTOM_WORKOUTS} of {MAX_FREE_CUSTOM_WORKOUTS})
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 uppercase">
                      Pro Member Required
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Users are allowed to create up to {MAX_FREE_CUSTOM_WORKOUTS} custom workouts in the Free plan. Upgrade to GymPax Pro for unlimited custom workout creations!
                  </p>
                  {onOpenUpgradeModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenUpgradeModal();
                      }}
                      className="mt-2.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Upgrade to Pro for Unlimited Creations</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : !isPro ? (
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Free Plan: <strong className="text-zinc-200">{currentWorkoutsCount} of {MAX_FREE_CUSTOM_WORKOUTS}</strong> custom workouts created ({remainingSlots} remaining)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                {MAX_FREE_CUSTOM_WORKOUTS} Free Workouts
              </span>
            </div>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-between text-xs text-amber-300 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                GymPax Pro: Unlimited Custom Workout Creations Active
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">{currentWorkoutsCount} saved</span>
            </div>
          )}
          {/* 1. Workout Name Input (User can rename anytime) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
              Workout Program Name (Rename anytime):
            </label>
            <div className="relative">
              <input
                type="text"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                placeholder="e.g. Upper/Lower Power Split, Arm Blitz, Full Body Hypertrophy"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-semibold focus:outline-none focus:border-amber-400 transition-colors pr-10"
              />
              <Edit2 className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. How many days for the workout program */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
                Program Duration / Split Days:
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {daysCount} {daysCount === 1 ? 'Day' : 'Days'} in Program
              </span>
            </div>

            {/* Minimalist Day Count Pills (1 to 7) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory px-4 sm:px-0 scroll-px-4 sm:scroll-px-0 scroll-smooth">
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    handleDaysCountChange(num);
                  }}
                  className={`flex-1 min-w-[42px] py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer snap-center snap-always ${
                    daysCount === num
                      ? 'bg-amber-400 text-zinc-950 shadow-sm scale-102'
                      : 'bg-zinc-850 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {num}d
                </button>
              ))}
            </div>
          </div>

          {/* 3. Day Selector Tab Bar & Day Rename */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory px-6 sm:px-0 scroll-px-6 sm:scroll-px-0 scroll-smooth">
              {routines.slice(0, daysCount).map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    setActiveDayIdx(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 snap-center snap-always ${
                    activeDayIdx === idx
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <span>Day {idx + 1}</span>
                  <span className="text-[10px] opacity-80">({r.exercises.length})</span>
                </button>
              ))}
            </div>

            {/* Editable Day Title */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentRoutine.dayName}
                onChange={e => handleUpdateRoutineName(e.target.value)}
                placeholder={`Day ${activeDayIdx + 1} Routine Title`}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 4. Current Day Exercises List & Sets Configuration */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-200 block">
                  Exercises in Day {activeDayIdx + 1}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {currentRoutine.exercises.length} movements selected
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowExercisePicker(!showExercisePicker)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Choose Exercises</span>
              </button>
            </div>

            {/* List of included exercises with set count stepper */}
            {currentRoutine.exercises.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl space-y-1">
                <Dumbbell className="w-6 h-6 mx-auto text-zinc-600" />
                <p className="text-xs text-zinc-400">No exercises added to this day yet.</p>
                <p className="text-[11px] text-zinc-500">Tap &ldquo;Choose Exercises&rdquo; to add movements.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-850">
                {currentRoutine.exercises.map((exItem, idx) => {
                  const def = allAvailableExercises.find(e => e.id === exItem.exerciseId);

                  return (
                    <div
                      key={exItem.exerciseId}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Minimalistic short up/down arrows to move exercise in routine queue */}
                        <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 gap-0.5 shrink-0 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleMoveExerciseInRoutine(idx, idx - 1)}
                            disabled={idx === 0}
                            aria-label={`Move ${getExerciseName(exItem.exerciseId)} up`}
                            title={idx === 0 ? 'First in routine' : 'Move up in routine'}
                            className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-850 disabled:opacity-20 disabled:hover:text-zinc-500 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExerciseInRoutine(idx, idx + 1)}
                            disabled={idx === currentRoutine.exercises.length - 1}
                            aria-label={`Move ${getExerciseName(exItem.exerciseId)} down`}
                            title={idx === currentRoutine.exercises.length - 1 ? 'Last in routine' : 'Move down in routine'}
                            className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-850 disabled:opacity-20 disabled:hover:text-zinc-500 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-mono text-zinc-500 text-xs w-4 shrink-0 font-bold">
                          {idx + 1}.
                        </span>
                        {(exItem.cdn_url || def?.cdn_url || def?.cdnUrl) && (
                          <div
                            onClick={() => setSelectedInspectVideo({
                              name: getExerciseName(exItem.exerciseId),
                              videoSrc: exItem.cdn_url || def?.cdn_url || def?.cdnUrl || '',
                              muscle: def?.primary_muscle || def?.primaryMuscle || ''
                            })}
                            className="relative w-12 h-10 sm:w-14 sm:h-11 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-750/90 shrink-0 shadow-xs flex items-center justify-center group/vid cursor-pointer"
                            title="Click to view full screen video"
                          >
                            <video
                              src={exItem.cdn_url || def?.cdn_url || def?.cdnUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover object-center filter brightness-[0.90] contrast-[1.08] transition-transform duration-300 group-hover/vid:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                            {/* Simplified Video Expansion Button (Bottom Right) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInspectVideo({
                                  name: getExerciseName(exItem.exerciseId),
                                  videoSrc: exItem.cdn_url || def?.cdn_url || def?.cdnUrl || '',
                                  muscle: def?.primary_muscle || def?.primaryMuscle || ''
                                });
                              }}
                              title="Expand video to full screen"
                              aria-label="Expand video to full screen"
                              className="absolute bottom-1 right-1 p-0.5 rounded bg-black/85 hover:bg-black text-amber-400 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-400/80 shadow-xs cursor-pointer z-10 transition-all active:scale-95 flex items-center gap-0.5"
                            >
                              <Maximize2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-200 block truncate">
                              {getExerciseName(exItem.exerciseId)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const found = allAvailableExercises.find(e => e.id === exItem.exerciseId) || resolveCatalogExercise(exItem.exerciseId);
                                if (found) {
                                  setInspectedExercise(found);
                                  setInspectActiveTab('technique');
                                }
                              }}
                              className="p-1 rounded-md text-zinc-400 hover:text-amber-400 hover:bg-zinc-850 transition-colors cursor-pointer shrink-0"
                              title={`View movement guide and cues for ${getExerciseName(exItem.exerciseId)}`}
                              aria-label={`View movement guide and cues for ${getExerciseName(exItem.exerciseId)}`}
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {def?.primaryMuscle || exItem.primary_muscle} · {def?.equipment}
                          </span>
                        </div>
                      </div>

                      {/* Sets Per Exercise Stepper & Rep Targets */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        {/* Sets Stepper */}
                        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateExerciseSets(exItem.exerciseId, -1)}
                            className="w-6 h-6 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                            title="Decrease sets"
                          >
                            -
                          </button>
                          <span className="w-14 text-center font-mono font-bold text-amber-400 text-xs">
                            {exItem.defaultSets} {exItem.defaultSets === 1 ? 'set' : 'sets'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateExerciseSets(exItem.exerciseId, 1)}
                            className="w-6 h-6 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                            title="Increase sets"
                          >
                            +
                          </button>
                        </div>

                        {/* Rep Range Selector */}
                        <select
                          value={exItem.targetReps}
                          onChange={e => handleUpdateExerciseReps(exItem.exerciseId, e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="6-8">6-8 reps</option>
                          <option value="8-10">8-10 reps</option>
                          <option value="10-12">10-12 reps</option>
                          <option value="12-15">12-15 reps</option>
                          <option value="15-20">15-20 reps</option>
                        </select>

                        {/* Remove Exercise */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseFromCurrentDay(exItem.exerciseId)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-850 transition-colors cursor-pointer"
                          title="Remove from this day"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Collapsible Exercise Picker Panel */}
          {showExercisePicker && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Exercises to Include:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowExercisePicker(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  Done Selecting
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by exercise name or equipment..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Muscle Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs snap-x snap-mandatory px-6 sm:px-0 scroll-px-6 sm:scroll-px-0 scroll-smooth">
                {MUSCLE_FILTER_CHIPS.map(chip => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      setSelectedMuscle(chip.value);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer snap-center snap-always ${
                      selectedMuscle === chip.value
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Filtered Exercise Results List */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-850">
                {filteredPickerExercises.map(ex => {
                  const isAlreadyAdded = currentRoutine.exercises.some(e => e.exerciseId === ex.id);

                  return (
                    <div
                      key={ex.id}
                      className="pt-1.5 first:pt-0 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-zinc-200 block truncate">
                            {ex.name}
                          </span>
                          {ex.isCustom && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase shrink-0">
                              Custom
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedExercise(ex);
                              setInspectActiveTab('technique');
                            }}
                            className="p-1 rounded-md text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                            title={`Explain movement guide for ${ex.name}`}
                            aria-label={`Explain movement guide for ${ex.name}`}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {ex.primaryMuscle} · {ex.equipment}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isAlreadyAdded}
                        onClick={() => handleAddExerciseToCurrentDay(ex)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                          isAlreadyAdded
                            ? 'bg-zinc-800 text-zinc-500 cursor-default'
                            : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold shadow-sm'
                        }`}
                      >
                        {isAlreadyAdded ? 'Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {initialProgram && onDeleteProgram && (
              <button
                type="button"
                onClick={() => onDeleteProgram(initialProgram.id)}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-850 hover:bg-red-500/15 text-zinc-400 hover:text-red-400 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Delete this custom workout plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Plan</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-98 flex items-center gap-1.5 ml-auto"
          >
            {isAtLimit ? (
              <>
                <Lock className="w-4 h-4 stroke-[2.5]" />
                <span>Upgrade to Pro ({MAX_FREE_CUSTOM_WORKOUTS}/{MAX_FREE_CUSTOM_WORKOUTS} Limit)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Save Custom Workout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Exercise Movement Explanation Popup Modal */}
      {inspectedExercise && (() => {
        const guide = getExerciseHowTo(inspectedExercise.id || inspectedExercise.name);
        const isAlreadyAdded = currentRoutine.exercises.some(e => e.exerciseId === inspectedExercise.id);

        return (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
            onClick={() => setInspectedExercise(null)}
          >
            <div
              className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] bg-zinc-950 border border-zinc-750 rounded-3xl p-4 sm:p-5 shadow-2xl text-zinc-100 flex flex-col gap-2.5 animate-in zoom-in-95 duration-150 overflow-hidden text-left my-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header - Pinned at top */}
              <div className="flex items-start justify-between gap-3 border-b border-zinc-850 pb-2.5 shrink-0">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center mt-0.5 shrink-0 shadow-inner">
                    <Dumbbell className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight leading-snug">
                      {inspectedExercise.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-zinc-400">
                      <span className="font-semibold text-amber-300">
                        {inspectedExercise.primaryMuscle}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{inspectedExercise.equipment}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-zinc-300 font-mono text-[11px] uppercase">{inspectedExercise.tier}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectedExercise(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Visual Motion GIF Demonstration - Pinned visible the whole time for each button */}
              <div className="shrink-0 w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md">
                <FitnessModelPicture
                  exerciseId={inspectedExercise.id}
                  exerciseName={inspectedExercise.name}
                  primaryMuscle={inspectedExercise.primaryMuscle}
                  aspect="wide"
                  showZoom={true}
                  preferMotionGif={true}
                  className="h-44 sm:h-52 w-full"
                  imageUrl={inspectedExercise.imageUrl || (inspectedExercise.images && inspectedExercise.images[0])}
                  cdn_url={inspectedExercise.cdn_url || inspectedExercise.cdnUrl}
                  cdnUrl={inspectedExercise.cdn_url || inspectedExercise.cdnUrl}
                />
              </div>

              {/* Movement Overview Description - Pinned */}
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed shrink-0 line-clamp-2">
                {inspectedExercise.description || guide.description}
              </p>

              {/* Tabs for Detailed Movement Breakdown - Pinned above scrollable body */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectActiveTab('technique')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                    inspectActiveTab === 'technique'
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Movement Steps
                </button>
                <button
                  type="button"
                  onClick={() => setInspectActiveTab('cues')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                    inspectActiveTab === 'cues'
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Execution Cues
                </button>
                <button
                  type="button"
                  onClick={() => setInspectActiveTab('mistakes')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                    inspectActiveTab === 'mistakes'
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Mistakes
                </button>
              </div>

              {/* Scrollable Tab Content Body */}
              <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-3">

              {/* TAB 1: Step-by-Step Movement Steps */}
              {inspectActiveTab === 'technique' && (
                <div className="space-y-3 pt-1 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Phase 1: Setup & Starting Stance
                    </span>
                    {guide.setupSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-300">
                        <span className="text-zinc-500 font-mono text-[11px] shrink-0 font-bold">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                    <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Phase 2: Concentric & Eccentric Execution
                    </span>
                    {guide.executionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-300">
                        <span className="text-emerald-400 font-mono text-[11px] shrink-0 font-bold">
                          •
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {guide.peakAndLockout && guide.peakAndLockout.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                      <span className="font-mono text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        Phase 3: Peak Contraction & Lockout
                      </span>
                      {guide.peakAndLockout.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-300">
                          <span className="text-amber-400 font-mono text-[11px] shrink-0 font-bold">
                            ✓
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Execution Cues */}
              {inspectActiveTab === 'cues' && (
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block font-mono">
                      Key Form & Biomechanical Cues:
                    </span>
                    <ul className="space-y-2">
                      {(inspectedExercise.cues || guide.formCues).map((cue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-zinc-200">
                          <span className="text-amber-400 font-mono font-bold shrink-0">{idx + 1}.</span>
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {guide.proTip && (
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                      <strong className="text-amber-400 block font-semibold text-[11px] mb-0.5 font-mono">
                        Pro Coach Secret:
                      </strong>
                      <span className="text-zinc-300">{guide.proTip}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Common Mistakes */}
              {inspectActiveTab === 'mistakes' && (
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block font-mono">
                      Critical Form Mistakes to Avoid:
                    </span>
                    <ul className="space-y-2">
                      {guide.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-zinc-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Breathing & Cadence Specs */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-850 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1 font-semibold">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    <span>Breathing</span>
                  </span>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
                    {guide.breathingPattern}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Tempo Cadence</span>
                  </span>
                  <p className="text-[11px] text-amber-400 font-mono font-bold mt-1">
                    {guide.tempo}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions: ADD and CLOSE - Pinned at bottom */}
            <div className="pt-2 border-t border-zinc-850 flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={isAlreadyAdded}
                  onClick={() => {
                    handleAddExerciseToCurrentDay(inspectedExercise);
                    setInspectedExercise(null);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                    isAlreadyAdded
                      ? 'bg-zinc-850 text-zinc-500 cursor-not-allowed border border-zinc-800'
                      : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 active:scale-98'
                  }`}
                >
                  {isAlreadyAdded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Already Added to Day {activeDayIdx + 1}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add to Day {activeDayIdx + 1}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setInspectedExercise(null)}
                  className="py-2.5 px-5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Full Screen Video Popup */}
      {selectedInspectVideo && (
        <div
          onClick={() => setSelectedInspectVideo(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 sm:bg-black/90 backdrop-blur-md p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-4xl bg-zinc-950 sm:bg-zinc-900 sm:border sm:border-zinc-750 sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden text-zinc-100"
          >
            <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950/90 backdrop-blur-sm z-10">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <h4 className="font-bold text-zinc-100 text-sm sm:text-base truncate">{selectedInspectVideo.name}</h4>
                </div>
                {selectedInspectVideo.muscle && (
                  <p className="text-[11px] text-amber-400 font-mono uppercase tracking-wider truncate mt-0.5">
                    Target: {selectedInspectVideo.muscle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedInspectVideo(null)}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                  aria-label="Close full screen"
                  title="Close full screen"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative flex items-center justify-center bg-black overflow-hidden p-2 sm:p-4">
              <video
                src={selectedInspectVideo.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full max-h-full max-w-full object-contain object-center filter brightness-[0.94] contrast-[1.06]"
              />
            </div>

            <div className="shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="truncate">Full Screen Video · {selectedInspectVideo.muscle || 'Exercise Movement'}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedInspectVideo(null)}
                className="px-3 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
