import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Plus,
  Disc,
  Calculator,
  BookOpen,
  Calendar,
  Flame,
  Trophy,
  Dumbbell,
  ArrowRight,
  Watch,
  Sparkles,
  List,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  Trash2,
  CheckCircle2,
  Edit2,
  Check,
  X,
  Lock,
  Info,
  AlertTriangle,
  Share2,
  Maximize2
} from 'lucide-react';
import {
  ActiveWorkout,
  WorkoutPlan,
  DailyWorkoutRoutine,
  ConnectedDevice,
  UserProfile,
  WorkoutExercise,
  EquipmentEnvironment,
  RewardsProfile,
  ExerciseDefinition,
  MuscleGroup,
  UserSubscription,
  CustomWorkoutProgram
} from '../../types';
import { MuscleCategoryMenu } from './MuscleCategoryMenu';
import { adaptRoutineForEnvironment } from '../../data/equipmentEnvironments';
import { findExerciseDefinition, resolveCatalogExercise } from '../../data/exercises';
import {
  AppTheme,
  getCustomExercises,
  getCustomWorkoutPrograms,
  saveCustomWorkoutProgram,
  deleteCustomWorkoutProgram,
  renameCustomWorkoutProgram,
  MAX_FREE_CUSTOM_EXERCISES,
  MAX_FREE_CUSTOM_WORKOUTS
} from '../../utils/storage';
import { ExerciseInfoTooltip } from '../common/ExerciseInfoTooltip';
import { CreateCustomExerciseModal } from './CreateCustomExerciseModal';
import { CustomWorkoutBuilderModal } from './CustomWorkoutBuilderModal';
import { SharePersonalizedPlanModal } from '../plans/SharePersonalizedPlanModal';
import { getWorkoutRoutinePhoto } from '../../data/fitnessModelPictures';
import { generateWearableRecommendation } from '../../utils/wearableRecommendationEngine';

interface WorkoutHubViewProps {
  activePlan: WorkoutPlan;
  activeDraft: ActiveWorkout | null;
  workoutHistory: ActiveWorkout[];
  unit: 'kg' | 'lbs';
  onStartRoutine: (routine: DailyWorkoutRoutine) => void;
  onStartQuickWorkout: () => void;
  onStartCustomWithExercises?: (title: string, exercises: WorkoutExercise[]) => void;
  onResumeDraft: () => void;
  onOpenPlateCalc: () => void;
  onOpen1RMCalc: () => void;
  onOpenLibrary: () => void;
  onViewHistoryItem: (workout: ActiveWorkout) => void;
  primaryDevice?: ConnectedDevice;
  onOpenTrackerModal: () => void;
  onOpenAiAdvisor: () => void;
  userProfile?: UserProfile | null;
  subscription?: UserSubscription;
  onOpenProModal?: () => void;
  onStartRoutineFromPast?: (workout: ActiveWorkout) => void;
  onOpenShareModal?: (workout: ActiveWorkout) => void;
  onOpenPlansTab: () => void;
  onFilterLibraryByMuscle?: (muscle: string) => void;
  currentEnvironment?: EquipmentEnvironment;
  onOpenEquipmentModal: () => void;
  onOpenGlossary?: () => void;
  currentTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  rewardsProfile?: RewardsProfile;
  onOpenRewardsModal?: () => void;
  onUpdatePlan?: (plan: WorkoutPlan) => void;
  onOpenProfileModal?: () => void;
  onOpenProgressTab?: (tab?: 'progress' | 'history') => void;
}

export const WorkoutHubView: React.FC<WorkoutHubViewProps> = ({
  activePlan,
  activeDraft,
  workoutHistory,
  unit,
  onStartRoutine,
  onStartQuickWorkout,
  onStartCustomWithExercises,
  onResumeDraft,
  onOpenPlateCalc,
  onOpen1RMCalc,
  onOpenLibrary,
  onViewHistoryItem,
  primaryDevice,
  onOpenTrackerModal,
  onOpenAiAdvisor,
  userProfile,
  onStartRoutineFromPast,
  onOpenShareModal,
  onOpenPlansTab,
  onFilterLibraryByMuscle,
  currentEnvironment = 'commercial_gym',
  onOpenEquipmentModal,
  onOpenGlossary,
  rewardsProfile,
  onOpenRewardsModal,
  onUpdatePlan,
  currentTheme = 'dark',
  onSelectTheme,
  subscription,
  onOpenProModal,
  onOpenProfileModal,
  onOpenProgressTab
}) => {
  const isPro = !!subscription?.isPro;
  const [activeTab, setActiveTab] = useState<'today' | 'custom' | 'library' | 'history'>('today');
  const [historyMode, setHistoryMode] = useState<'list' | 'graphs' | 'muscles' | 'calendar'>('list');
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);
  const [showCreateCustomModal, setShowCreateCustomModal] = useState<boolean>(false);
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>(() => getCustomExercises());
  const isAtCustomLimit = !isPro && customExercises.length >= MAX_FREE_CUSTOM_EXERCISES;
  const [selectedMuscleForNew, setSelectedMuscleForNew] = useState<MuscleGroup | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [excludedRoutineExerciseIds, setExcludedRoutineExerciseIds] = useState<string[]>([]);
  const [deletingRoutineExId, setDeletingRoutineExId] = useState<string | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const segmentedNavRef = useRef<HTMLDivElement>(null);

  const handleScrollNav = (direction: 'left' | 'right') => {
    if (segmentedNavRef.current) {
      const scrollAmount = direction === 'left' ? -140 : 140;
      segmentedNavRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (segmentedNavRef.current) {
      const activeEl = segmentedNavRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleCustomExercisesSync = () => {
      setCustomExercises(getCustomExercises());
    };
    window.addEventListener('gympax:exercises-updated', handleCustomExercisesSync);
    return () => window.removeEventListener('gympax:exercises-updated', handleCustomExercisesSync);
  }, []);

  // Custom Workout Sessions State (Multiple custom workout programs)
  const [customPrograms, setCustomPrograms] = useState<CustomWorkoutProgram[]>(() => getCustomWorkoutPrograms());
  const [selectedCustomProgramId, setSelectedCustomProgramId] = useState<string | null>(() => {
    const list = getCustomWorkoutPrograms();
    return list[0]?.id || null;
  });
  const [selectedCustomDayIdx, setSelectedCustomDayIdx] = useState<number>(0);
  const [showCustomBuilderModal, setShowCustomBuilderModal] = useState<boolean>(false);
  const [showCustomWorkoutsModal, setShowCustomWorkoutsModal] = useState<boolean>(false);
  const [highlightCustomCard, setHighlightCustomCard] = useState<boolean>(false);
  const customWorkoutCardRef = useRef<HTMLDivElement>(null);
  const customProgramsScrollRef = useRef<HTMLDivElement>(null);
  const [selectedLaunchedRoutine, setSelectedLaunchedRoutine] = useState<DailyWorkoutRoutine | null>(null);
  const [highlightTodayCard, setHighlightTodayCard] = useState<boolean>(false);
  const todayWorkoutCardRef = useRef<HTMLDivElement>(null);
  const [editingCustomProgram, setEditingCustomProgram] = useState<CustomWorkoutProgram | null>(null);
  const [renamingProgramId, setRenamingProgramId] = useState<string | null>(null);
  const [renamingProgramTitle, setRenamingProgramTitle] = useState<string>('');
  const [programToShare, setProgramToShare] = useState<WorkoutPlan | null>(null);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<CustomWorkoutProgram | null>(null);

  const handleScrollCustomPrograms = (direction: 'left' | 'right') => {
    if (customProgramsScrollRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      customProgramsScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setSelectedLaunchedRoutine(null);
    setExcludedRoutineExerciseIds([]);
    setOrderedTodayExerciseIds(null);
  }, [activePlan.id]);

  useEffect(() => {
    const handleCustomWorkoutsSync = () => {
      const updated = getCustomWorkoutPrograms();
      setCustomPrograms(updated);
      setSelectedCustomProgramId(prev =>
        prev && updated.some(p => p.id === prev) ? prev : updated[0]?.id || null
      );
    };
    window.addEventListener('gympax:custom-workouts-updated', handleCustomWorkoutsSync);
    window.addEventListener('gympax:personalized-plans-updated', handleCustomWorkoutsSync);
    return () => {
      window.removeEventListener('gympax:custom-workouts-updated', handleCustomWorkoutsSync);
      window.removeEventListener('gympax:personalized-plans-updated', handleCustomWorkoutsSync);
    };
  }, []);

  const activeCustomProgram = customPrograms.find(p => p.id === selectedCustomProgramId) || customPrograms[0] || null;
  const safeCustomDayIdx =
    activeCustomProgram && selectedCustomDayIdx < activeCustomProgram.routines.length
      ? selectedCustomDayIdx
      : 0;
  const activeCustomRoutine = activeCustomProgram?.routines[safeCustomDayIdx] || activeCustomProgram?.routines[0] || null;

  const isAtCustomWorkoutLimit = !isPro && customPrograms.length >= MAX_FREE_CUSTOM_WORKOUTS;

  const handleSaveCustomProgram = (prog: CustomWorkoutProgram) => {
    const isEditingExisting = customPrograms.some(p => p.id === prog.id);
    if (!isEditingExisting && isAtCustomWorkoutLimit) {
      if (onOpenProModal) onOpenProModal();
      return;
    }
    const updated = saveCustomWorkoutProgram(prog, isPro);
    setCustomPrograms(updated);
    setSelectedCustomProgramId(prog.id);
    setSelectedCustomDayIdx(0);
    setShowCustomBuilderModal(false);
    setEditingCustomProgram(null);
    setToastMessage(`Custom workout "${prog.name}" saved!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteCustomProgram = (id: string) => {
    const updated = deleteCustomWorkoutProgram(id);
    setCustomPrograms(updated);
    if (selectedCustomProgramId === id) {
      setSelectedCustomProgramId(updated[0]?.id || null);
      setSelectedCustomDayIdx(0);
    }
    setDeletingProgramId(null);
    setPlanToDelete(null);
    setToastMessage('Custom workout plan deleted');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRenameCustomProgram = (id: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = renameCustomWorkoutProgram(id, newName.trim());
    setCustomPrograms(updated);
    setRenamingProgramId(null);
    setToastMessage('Workout renamed');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectMuscleOrExerciseSession = (title: string, exercises: WorkoutExercise[]) => {
    const uniqueMuscles = Array.from(new Set(exercises.map(e => e.targetMuscle).filter(Boolean)));
    const focusLabel =
      uniqueMuscles.length > 0 ? `${uniqueMuscles.join(', ')} Focus` : 'Targeted Muscle Session';

    const newRoutine: DailyWorkoutRoutine = {
      dayName: title,
      focus: focusLabel,
      exercises: exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        defaultSets: ex.sets?.length || 3,
        targetReps: ex.sets?.[0]?.reps ? `${ex.sets[0].reps}` : '8-12',
        targetRpe: 8
      }))
    };

    setSelectedLaunchedRoutine(newRoutine);
    setExcludedRoutineExerciseIds([]);
    setOrderedTodayExerciseIds(null);
    setActiveTab('today');
    setHighlightTodayCard(true);
    setTimeout(() => setHighlightTodayCard(false), 1400);
    setTimeout(() => {
      todayWorkoutCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
    setToastMessage(`Workout session changed to "${title}" — ready to start!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLaunchWithCustomExercise = (exercise: ExerciseDefinition) => {
    const isBodyweight = exercise.equipment === 'Bodyweight';
    const defaultWeightKg = isBodyweight ? 0 : 40;
    const defaultWeightLbs = isBodyweight ? 0 : 90;
    const workoutExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      targetMuscle: exercise.primaryMuscle,
      secondaryMuscles: exercise.secondaryMuscles,
      equipment: exercise.equipment,
      notes: exercise.description || '',
      restSeconds: 90,
      sets: [1, 2, 3].map(setNumber => ({
        id: `s_${Date.now()}_${setNumber}`,
        setNumber,
        type: setNumber === 1 && !isBodyweight ? 'warmup' : 'normal',
        weightKg: defaultWeightKg,
        weightLbs: defaultWeightLbs,
        reps: 10,
        rpe: 8,
        completed: false
      }))
    };

    handleSelectMuscleOrExerciseSession(`${exercise.name} (${exercise.primaryMuscle} Session)`, [workoutExercise]);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setShowToolsMenu(false);
      }
    };
    if (showToolsMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showToolsMenu]);

  // Suggest next routine from active plan based on history and adapt to current equipment environment
  const routineIndex = workoutHistory.length % (activePlan.routines.length || 1);
  const rawRoutine = activePlan.routines[routineIndex] || activePlan.routines[0];
  const adaptedBaseRoutine = selectedLaunchedRoutine || adaptRoutineForEnvironment(rawRoutine, currentEnvironment);

  const [orderedTodayExerciseIds, setOrderedTodayExerciseIds] = useState<string[] | null>(null);
  const [wearableDecision, setWearableDecision] = useState<'pending' | 'accepted' | 'discarded'>('pending');
  const [showWearableInfoModal, setShowWearableInfoModal] = useState<boolean>(false);
  const [openedFromStartWorkout, setOpenedFromStartWorkout] = useState<boolean>(false);

  const wearableRec = React.useMemo(() => {
    if (!primaryDevice) return null;
    return generateWearableRecommendation(primaryDevice, rawRoutine.dayName);
  }, [primaryDevice, rawRoutine.dayName]);

  const baseTodayExercises = adaptedBaseRoutine.exercises.filter(
    ex => !excludedRoutineExerciseIds.includes(ex.exerciseId)
  );

  const orderedTodayExercises = React.useMemo(() => {
    if (!orderedTodayExerciseIds) return baseTodayExercises;
    const sorted = [...baseTodayExercises].sort((a, b) => {
      const idxA = orderedTodayExerciseIds.indexOf(a.exerciseId);
      const idxB = orderedTodayExerciseIds.indexOf(b.exerciseId);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    return sorted;
  }, [baseTodayExercises, orderedTodayExerciseIds]);

  // If user accepts wearable recommendation, dynamically modify routine sets & RPE cap
  const finalTodayExercises = React.useMemo(() => {
    if (wearableDecision !== 'accepted' || !wearableRec || wearableRec.volumeAdjustmentPercent === 0) {
      return orderedTodayExercises;
    }

    return orderedTodayExercises.map(ex => {
      const origSets = ex.defaultSets;
      const adaptedSets = origSets >= 4 ? origSets - 1 : origSets === 3 ? 2 : Math.max(1, origSets);
      return {
        ...ex,
        defaultSets: adaptedSets,
        targetRpe: wearableRec.recommendedRpeCap ? Math.min(ex.targetRpe || 8, wearableRec.recommendedRpeCap) : ex.targetRpe
      };
    });
  }, [orderedTodayExercises, wearableDecision, wearableRec]);

  const todaysRoutine: DailyWorkoutRoutine = {
    ...adaptedBaseRoutine,
    focus: wearableDecision === 'accepted'
      ? `${adaptedBaseRoutine.focus} (Recovery Paced -20%)`
      : adaptedBaseRoutine.focus,
    exercises: finalTodayExercises,
    wearableRecommendation: wearableRec || undefined,
    wearableDecision: wearableDecision !== 'pending' ? wearableDecision : undefined
  };

  const handleStartWorkoutClick = () => {
    if (wearableRec) {
      setOpenedFromStartWorkout(true);
      setShowWearableInfoModal(true);
    } else {
      onStartRoutine(todaysRoutine);
    }
  };

  const handleAcceptRecommendation = (shouldStartImmediately: boolean = false) => {
    setWearableDecision('accepted');
    setShowWearableInfoModal(false);

    const modifiedExercises = orderedTodayExercises.map(ex => {
      const origSets = ex.defaultSets;
      const adaptedSets = origSets >= 4 ? origSets - 1 : origSets === 3 ? 2 : Math.max(1, origSets);
      return {
        ...ex,
        defaultSets: adaptedSets,
        targetRpe: wearableRec?.recommendedRpeCap ? Math.min(ex.targetRpe || 8, wearableRec.recommendedRpeCap) : ex.targetRpe
      };
    });

    const adjustedRoutine: DailyWorkoutRoutine = {
      ...adaptedBaseRoutine,
      dayName: `${adaptedBaseRoutine.dayName} (Recovery Adapted)`,
      focus: `${adaptedBaseRoutine.focus} (Recovery Paced -20%)`,
      exercises: modifiedExercises,
      wearableRecommendation: wearableRec || undefined,
      wearableDecision: 'accepted'
    };

    setToastMessage('Recommendation accepted: complete workout adjusted (-20% volume & recovery pacing).');
    setTimeout(() => setToastMessage(null), 3500);

    if (shouldStartImmediately || openedFromStartWorkout) {
      setOpenedFromStartWorkout(false);
      onStartRoutine(adjustedRoutine);
    }
  };

  const handleDiscardRecommendation = (shouldStartImmediately: boolean = false) => {
    setWearableDecision('discarded');
    setShowWearableInfoModal(false);

    const originalRoutine: DailyWorkoutRoutine = {
      ...adaptedBaseRoutine,
      exercises: orderedTodayExercises,
      wearableDecision: 'discarded'
    };

    setToastMessage('Recommendation discarded — 100% full original volume preserved.');
    setTimeout(() => setToastMessage(null), 3500);

    if (shouldStartImmediately || openedFromStartWorkout) {
      setOpenedFromStartWorkout(false);
      onStartRoutine(originalRoutine);
    }
  };

  const [inspectingDayRoutine, setInspectingDayRoutine] = useState<DailyWorkoutRoutine | null>(null);
  const [selectedInspectVideo, setSelectedInspectVideo] = useState<{ name: string; videoSrc: string; muscle?: string } | null>(null);

  const remainingPlanRoutines = React.useMemo(() => {
    const routines = activePlan.routines || [];
    return routines
      .map((r, idx) => ({
        routine: adaptRoutineForEnvironment(r, currentEnvironment),
        originalIndex: idx
      }))
      .filter(({ routine, originalIndex }) =>
        selectedLaunchedRoutine
          ? routine.dayName !== todaysRoutine.dayName
          : originalIndex !== routineIndex
      );
  }, [activePlan.routines, currentEnvironment, selectedLaunchedRoutine, todaysRoutine.dayName, routineIndex]);

  const handleMoveTodayExercise = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= orderedTodayExercises.length) return;
    const reordered = [...orderedTodayExercises];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setOrderedTodayExerciseIds(reordered.map(e => e.exerciseId));
  };

  const handleMoveCustomRoutineExercise = (fromIdx: number, toIdx: number) => {
    if (!activeCustomProgram || !activeCustomRoutine) return;
    if (toIdx < 0 || toIdx >= activeCustomRoutine.exercises.length) return;
    const reordered = [...activeCustomRoutine.exercises];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updatedRoutines = activeCustomProgram.routines.map((r, rIdx) => {
      if (rIdx === safeCustomDayIdx) {
        return { ...r, exercises: reordered };
      }
      return r;
    });
    const updatedProgram = { ...activeCustomProgram, routines: updatedRoutines };
    handleSaveCustomProgram(updatedProgram);
  };

  const formatEnvironmentLabel = (env: string) => {
    switch (env) {
      case 'commercial_gym':
        return 'Commercial Gym';
      case 'home_gym':
        return 'Home Gym';
      case 'free_weights_only':
        return 'Free Weights';
      case 'dumbbell_only':
        return 'Dumbbells Only';
      case 'kettlebell_only':
        return 'Kettlebell Only';
      case 'bodyweight_travel':
        return 'Bodyweight';
      default:
        return 'Gym';
    }
  };

  const getExerciseName = (id: string) => {
    return (
      customExercises.find(e => e.id === id)?.name ||
      findExerciseDefinition(id)?.name ||
      resolveCatalogExercise(id).name
    );
  };

  const getExerciseCdnUrl = (ex: { exerciseId: string; id?: string; name?: string; cdn_url?: string }): string => {
    if (ex.cdn_url) return ex.cdn_url;
    const def = findExerciseDefinition(ex.exerciseId || ex.id || ex.name || '') || resolveCatalogExercise(ex.exerciseId || ex.id || ex.name || '');
    return def.cdn_url || def.cdnUrl || '';
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4 text-zinc-100 font-sans">
      {/* 1. TOP BAR: Utilities Action Bar */}
      <div className="flex items-center justify-end gap-3 pb-3 border-b border-zinc-850">
        {/* Right Action: Clean Tools Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Clean Tools Dropdown Button */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              type="button"
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              title="Gym Utilities & Calculators"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
            >
              <span>Utilities</span>
            </button>

            {/* Dropdown Sheet */}
            {showToolsMenu && (
              <div className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-2rem)] bg-zinc-900/95 backdrop-blur-xl border border-amber-400/80 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-zinc-100 font-sans space-y-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(245,158,11,0.2)]">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold border-b border-zinc-800">
                  Gym Utilities
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowToolsMenu(false);
                    setEditingCustomProgram(null);
                    setShowCustomBuilderModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Custom Workout</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowToolsMenu(false);
                    setSelectedMuscleForNew(undefined);
                    setShowCreateCustomModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Unique Exercise</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowToolsMenu(false);
                    onOpenPlateCalc();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <Disc className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plate Loading Calculator</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowToolsMenu(false);
                    onOpen1RMCalc();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>1-Rep Max (1RM) Estimator</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowToolsMenu(false);
                    onOpenLibrary();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exercise Cues & Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowToolsMenu(false);
                    onOpenTrackerModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <Watch className="w-3.5 h-3.5 text-sky-400" />
                  <span>Wearables & Heart Rate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* 3. TAB 1: TODAY'S WORKOUT (Ultra-clean, focused, distraction-free) */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Main Today's Routine Card */}
          <div
            ref={todayWorkoutCardRef}
            className={`rounded-2xl bg-zinc-900/60 border overflow-hidden space-y-4 shadow-md group transition-all duration-300 ${
              highlightTodayCard
                ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                : 'border-[#F6721D]'
            }`}
          >
            {/* Workout Image Banner */}
            <div className="relative h-28 sm:h-44 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/80">
              <img
                src={getWorkoutRoutinePhoto(todaysRoutine, activePlan.id)}
                alt={todaysRoutine.dayName}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
                <span className="font-mono text-zinc-300 text-[10px] sm:text-[11px] font-semibold drop-shadow-md truncate pr-2">
                  {todaysRoutine.focus}
                </span>
                <span className="font-mono text-amber-400 text-[10px] sm:text-[11px] font-bold drop-shadow-md shrink-0">
                  {todaysRoutine.exercises.length} Exercises · ~45–60m
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5 sm:gap-3">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider block">
                    {selectedLaunchedRoutine ? 'Selected Workout Session' : "Today's Protocol"}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-bold text-zinc-100 tracking-tight mt-0.5">
                    {todaysRoutine.dayName}
                  </h2>
                </div>

              {/* Start or Resume Workout Primary CTA */}
              <button
                type="button"
                onClick={activeDraft ? onResumeDraft : handleStartWorkoutClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 shrink-0 shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{activeDraft ? 'Resume Workout' : 'Start Workout'}</span>
              </button>
            </div>

            {/* Wearable Biometric Pre-Workout Evaluation Banner (Caution + View Alert and Suggestion) */}
            {primaryDevice && wearableRec && (
              <div className="px-3 py-2 rounded-xl bg-zinc-950/90 border border-amber-400/30 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 shrink-0">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Caution</span>
                  </span>
                  {wearableDecision === 'accepted' && (
                    <span className="text-[10px] font-mono font-semibold text-emerald-400 truncate">
                      (Suggestion Accepted)
                    </span>
                  )}
                  {wearableDecision === 'discarded' && (
                    <span className="text-[10px] font-mono text-zinc-500 truncate">
                      (Suggestion Discarded)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpenedFromStartWorkout(false);
                    setShowWearableInfoModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 border border-zinc-800 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                  title="View alert and suggestion"
                >
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>View alert and suggestion</span>
                </button>
              </div>
            )}

            {/* Clean Exercise Preview List in Routine (Minimalized for mobile view) */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between px-0.5 pb-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                  Programmed Movements ({todaysRoutine.exercises.length})
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {todaysRoutine.exercises.reduce((sum, e) => sum + e.defaultSets, 0)} total sets
                </span>
              </div>

              <div className="divide-y divide-zinc-850/80 max-h-56 sm:max-h-68 overflow-y-auto pr-0.5 overscroll-contain">
                {todaysRoutine.exercises.map((ex, idx) => {
                  const videoSrc = getExerciseCdnUrl(ex);
                  return (
                  <div
                    key={`${ex.exerciseId}_${idx}`}
                    className="py-1.5 sm:py-2 flex items-center justify-between text-xs gap-1.5"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      {/* Compact up/down arrows to move exercise in queue */}
                      <div className="inline-flex items-center bg-zinc-950 border border-zinc-850 rounded-md p-0.2 gap-0.5 shrink-0 shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleMoveTodayExercise(idx, idx - 1)}
                          disabled={idx === 0}
                          aria-label={`Move ${getExerciseName(ex.exerciseId)} up`}
                          title={idx === 0 ? 'First in routine' : 'Move up'}
                          className="p-0.5 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-850 disabled:opacity-20 disabled:hover:text-zinc-500 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTodayExercise(idx, idx + 1)}
                          disabled={idx === todaysRoutine.exercises.length - 1}
                          aria-label={`Move ${getExerciseName(ex.exerciseId)} down`}
                          title={idx === todaysRoutine.exercises.length - 1 ? 'Last in routine' : 'Move down'}
                          className="p-0.5 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-850 disabled:opacity-20 disabled:hover:text-zinc-500 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      {videoSrc && (
                        <div
                          onClick={() => setSelectedInspectVideo({
                            name: ex.name || getExerciseName(ex.exerciseId),
                            videoSrc,
                            muscle: ex.primary_muscle || ''
                          })}
                          className="relative w-12 h-10 sm:w-14 sm:h-11 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-750/90 shrink-0 shadow-xs flex items-center justify-center group/vid cursor-pointer"
                          title="Click to view full video"
                        >
                          <video
                            src={videoSrc}
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
                                name: ex.name || getExerciseName(ex.exerciseId),
                                videoSrc,
                                muscle: ex.primary_muscle || ''
                              });
                            }}
                            title="Click to expand video to full screen"
                            aria-label="Expand video to full screen"
                            className="absolute bottom-1 right-1 p-0.5 rounded bg-black/85 hover:bg-black text-amber-400 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-400/80 shadow-xs cursor-pointer z-10 transition-all active:scale-95 flex items-center gap-0.5"
                          >
                            <Maximize2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      <span className="font-mono text-zinc-500 text-[10px] sm:text-xs w-3.5 shrink-0 text-right">
                        {idx + 1}.
                      </span>
                      <span className="font-medium text-[11px] sm:text-xs text-zinc-200 truncate">
                        {ex.name || getExerciseName(ex.exerciseId)}
                      </span>
                      <ExerciseInfoTooltip
                        exerciseId={ex.exerciseId}
                        exerciseName={ex.name || getExerciseName(ex.exerciseId)}
                        size="xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {/* Simple and minimalistic delete option next to each exercise */}
                      {deletingRoutineExId === ex.exerciseId ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-zinc-300 animate-in fade-in">
                          <button
                            type="button"
                            onClick={() => {
                              setExcludedRoutineExerciseIds(prev => [...prev, ex.exerciseId]);
                              setDeletingRoutineExId(null);
                            }}
                            className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                          >
                            Delete
                          </button>
                          <span className="text-zinc-600">/</span>
                          <button
                            type="button"
                            onClick={() => setDeletingRoutineExId(null)}
                            className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingRoutineExId(ex.exerciseId)}
                          title={`Delete ${getExerciseName(ex.exerciseId)}`}
                          className="p-0.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              {excludedRoutineExerciseIds.length > 0 && (
                <div className="pt-1.5 flex items-center justify-between text-xs border-t border-zinc-850">
                  <span className="text-zinc-500 text-[11px]">
                    {excludedRoutineExerciseIds.length} exercise{excludedRoutineExerciseIds.length > 1 ? 's' : ''} removed
                  </span>
                  <button
                    type="button"
                    onClick={() => setExcludedRoutineExerciseIds([])}
                    className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer text-xs font-semibold"
                  >
                    Restore exercises
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      )}

      {/* TAB: CUSTOM WORKOUTS (Full Dedicated View) */}
      {activeTab === 'custom' && (
        <div className="space-y-4 w-full min-w-0">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>Personal Custom Workout Sessions</span>
                </h2>
                {isPro ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>{customPrograms.length} Saved · PRO UNLIMITED</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1 ${
                    isAtCustomWorkoutLimit
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  }`}>
                    {isAtCustomWorkoutLimit && <Lock className="w-3 h-3" />}
                    <span>{customPrograms.length} / {MAX_FREE_CUSTOM_WORKOUTS} Free Workouts</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
              {customPrograms.length > 0 && (
                <div className="flex sm:hidden items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleScrollCustomPrograms('left')}
                    aria-label="Scroll custom programs left"
                    title="Scroll programs left"
                    className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollCustomPrograms('right')}
                    aria-label="Scroll custom programs right"
                    title="Scroll programs right"
                    className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (isAtCustomWorkoutLimit && onOpenProModal) {
                    onOpenProModal();
                    return;
                  }
                  setEditingCustomProgram(null);
                  setShowCustomBuilderModal(true);
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 shrink-0 ${
                  isAtCustomWorkoutLimit
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                }`}
              >
                {isAtCustomWorkoutLimit ? (
                  <>
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                    <span>Build Custom (Pro Unlimited)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Build Personal Workout</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Multiple Custom Workout Sessions Horizontal Bar */}
          {customPrograms.length > 0 && (
            <div
              ref={customProgramsScrollRef}
              style={{ WebkitOverflowScrolling: 'touch' }}
              className="flex items-center gap-2 overflow-x-auto flex-nowrap w-full max-w-full pb-2 pt-0.5 scrollbar-none touch-pan-x scroll-smooth overscroll-x-contain snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1"
            >
              <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold shrink-0 whitespace-nowrap">
                Your Programs:
              </span>
              {customPrograms.map(p => {
                const isSelected = activeCustomProgram?.id === p.id;
                return (
                  <div
                    key={p.id}
                    className={`group/pill flex items-center rounded-xl shrink-0 whitespace-nowrap transition-all snap-center snap-always ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        setSelectedCustomProgramId(p.id);
                        setSelectedCustomDayIdx(0);
                        setHighlightCustomCard(true);
                        setTimeout(() => setHighlightCustomCard(false), 1200);
                        customWorkoutCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                      className="px-3 py-1.5 text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
                      title={`Select custom workout "${p.name}"`}
                    >
                      <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">{p.name}</span>
                      <span className="text-[10px] opacity-75 font-mono shrink-0">({p.daysCount || p.routines.length}d)</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlanToDelete(p);
                      }}
                      className={`pr-2.5 pl-1 py-1.5 transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'text-zinc-950/70 hover:text-red-700'
                          : 'text-zinc-500 hover:text-red-400'
                      }`}
                      title={`Delete plan "${p.name}"`}
                      aria-label={`Delete plan "${p.name}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setEditingCustomProgram(null);
                  setShowCustomBuilderModal(true);
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-colors cursor-pointer bg-zinc-900/60 border border-dashed border-zinc-800 text-amber-400 hover:text-amber-300 hover:border-amber-400/50 flex items-center gap-1"
                title="Create another custom workout program"
              >
                <Plus className="w-3 h-3 shrink-0" />
                <span>New</span>
              </button>
            </div>
          )}

          {/* Active Custom Workout Session Card (Same layout as current workout sessions) */}
          {activeCustomProgram && activeCustomRoutine ? (
            <div
              ref={customWorkoutCardRef}
              className={`p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border space-y-4 transition-all duration-300 ${
                highlightCustomCard
                  ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                  : 'border-zinc-800'
              }`}
            >
              {/* Session Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {renamingProgramId === activeCustomProgram.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={renamingProgramTitle}
                          onChange={e => setRenamingProgramTitle(e.target.value)}
                          className="bg-zinc-950 border border-amber-400 rounded-lg px-2.5 py-1 text-xs text-zinc-100 font-bold focus:outline-none"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleRenameCustomProgram(activeCustomProgram.id, renamingProgramTitle);
                            } else if (e.key === 'Escape') {
                              setRenamingProgramId(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameCustomProgram(activeCustomProgram.id, renamingProgramTitle)}
                          className="p-1 rounded bg-amber-400 text-zinc-950 hover:bg-amber-300 cursor-pointer"
                          title="Save Name"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingProgramId(null)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider block">
                          {activeCustomProgram.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingProgramId(activeCustomProgram.id);
                            setRenamingProgramTitle(activeCustomProgram.name);
                          }}
                          className="text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer p-0.5"
                          title="Rename workout"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlanToDelete(activeCustomProgram)}
                          className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                          title="Delete plan"
                          aria-label="Delete plan"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {activeCustomProgram.daysCount || activeCustomProgram.routines.length}-Day Program
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mt-0.5">
                    {activeCustomRoutine.dayName.toLowerCase().startsWith(activeCustomProgram.name.toLowerCase())
                      ? activeCustomRoutine.dayName
                      : `${activeCustomProgram.name} — ${activeCustomRoutine.dayName}`}
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    <span className="text-amber-400/90 font-medium">{activeCustomRoutine.focus}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeCustomRoutine.exercises.length} Movements</span>
                    <span aria-hidden="true">·</span>
                    <span>~45–60 min</span>
                  </div>
                </div>

                {/* Start Workout Primary CTA - Same layout as current workout sessions */}
                <button
                  type="button"
                  onClick={() => onStartRoutine(activeCustomRoutine)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 shrink-0 shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Workout</span>
                </button>
              </div>

              {/* Day Selector Tabs for Multi-Day Programs */}
              {activeCustomProgram.routines.length > 1 && (
                <div className="pt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-zinc-850">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold mr-1 shrink-0">
                    Program Days:
                  </span>
                  {activeCustomProgram.routines.map((rt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCustomDayIdx(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                        safeCustomDayIdx === idx
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                          : 'bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Day {idx + 1}: {rt.focus}
                    </button>
                  ))}
                </div>
              )}

              {/* Clean Exercise Preview List in Routine (Same layout as current workout sessions) */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="divide-y divide-zinc-850">
                  {activeCustomRoutine.exercises.map((ex, idx) => {
                    const videoSrc = getExerciseCdnUrl(ex);
                    return (
                    <div
                      key={`${ex.exerciseId}_${idx}`}
                      className="py-2.5 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {/* Minimalistic short up/down arrows to move exercise in queue */}
                        <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 gap-0.5 shrink-0 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleMoveCustomRoutineExercise(idx, idx - 1)}
                            disabled={idx === 0}
                            aria-label={`Move ${getExerciseName(ex.exerciseId)} up`}
                            title={idx === 0 ? 'First in routine' : 'Move up in routine'}
                            className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-850 disabled:opacity-20 disabled:hover:text-zinc-500 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveCustomRoutineExercise(idx, idx + 1)}
                            disabled={idx === activeCustomRoutine.exercises.length - 1}
                            aria-label={`Move ${getExerciseName(ex.exerciseId)} down`}
                            title={idx === activeCustomRoutine.exercises.length - 1 ? 'Last in routine' : 'Move down in routine'}
                            className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-850 disabled:opacity-20 disabled:hover:text-zinc-500 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {videoSrc && (
                          <div
                            onClick={() => setSelectedInspectVideo({
                              name: ex.name || getExerciseName(ex.exerciseId),
                              videoSrc,
                              muscle: ex.primary_muscle || ''
                            })}
                            className="relative w-12 h-10 sm:w-14 sm:h-11 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-750/90 shrink-0 shadow-xs flex items-center justify-center group/vid cursor-pointer"
                            title="Click to view full video"
                          >
                            <video
                              src={videoSrc}
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
                                  name: ex.name || getExerciseName(ex.exerciseId),
                                  videoSrc,
                                  muscle: ex.primary_muscle || ''
                                });
                              }}
                              title="Click to expand video to full screen"
                              aria-label="Expand video to full screen"
                              className="absolute bottom-1 right-1 p-0.5 rounded bg-black/85 hover:bg-black text-amber-400 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-400/80 shadow-xs cursor-pointer z-10 transition-all active:scale-95 flex items-center gap-0.5"
                            >
                              <Maximize2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        <span className="font-mono text-zinc-500 text-xs w-4 shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="font-medium text-zinc-200 truncate">
                          {ex.name || getExerciseName(ex.exerciseId)}
                        </span>
                        <ExerciseInfoTooltip
                          exerciseId={ex.exerciseId}
                          exerciseName={ex.name || getExerciseName(ex.exerciseId)}
                          size="xs"
                        />
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-mono text-xs text-zinc-400">
                          {ex.defaultSets} × {ex.targetReps}
                        </span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Session Management Options */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs text-zinc-400 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeCustomProgram) {
                        const planToShare: WorkoutPlan = {
                          id: activeCustomProgram.id,
                          title: activeCustomProgram.name,
                          subtitle: `${activeCustomProgram.daysCount || activeCustomProgram.routines.length}-Day Personalized Program`,
                          level: 'Intermediate',
                          daysPerWeek: activeCustomProgram.daysCount || activeCustomProgram.routines.length,
                          goal: 'Hypertrophy (Pure Muscle Mass)',
                          category: 'full_body',
                          badge: 'CUSTOM PLAN',
                          description: `Custom ${activeCustomProgram.daysCount || activeCustomProgram.routines.length}-day split created with custom movements and set configurations.`,
                          isPersonalized: true,
                          routines: activeCustomProgram.routines
                        };
                        setProgramToShare(planToShare);
                      }
                    }}
                    className="hover:text-amber-400 text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
                    title="Share this personalized plan with friends"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Share Plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomProgram(activeCustomProgram);
                      setShowCustomBuilderModal(true);
                    }}
                    className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Edit custom workout plan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Delete Plan option */}
                <button
                  type="button"
                  onClick={() => setPlanToDelete(activeCustomProgram)}
                  className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
                  title="Delete this workout plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Plan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
              <Dumbbell className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-xs text-zinc-400">No custom workout sessions created yet.</p>
              <button
                type="button"
                onClick={() => {
                  setEditingCustomProgram(null);
                  setShowCustomBuilderModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                + Build Your First Personal Workout
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: MUSCLES & EXERCISE DATABASE (Tucked into its own tab) */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          {/* Section Header with Add Unique Exercise CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Exercise Database by Muscle</span>
                {isPro ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>{customExercises.length} Custom · PRO UNLIMITED</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1 ${
                    isAtCustomLimit
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  }`}>
                    {isAtCustomLimit && <Lock className="w-3 h-3" />}
                    <span>{customExercises.length} / {MAX_FREE_CUSTOM_EXERCISES} Custom Free</span>
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                Browse muscle protocols or craft your own unique exercises with pictures, cues, and community sharing.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isAtCustomLimit && onOpenProModal) {
                    onOpenProModal();
                    return;
                  }
                  setSelectedMuscleForNew(undefined);
                  setShowCreateCustomModal(true);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 shrink-0 ${
                  isAtCustomLimit
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                }`}
              >
                {isAtCustomLimit ? (
                  <>
                    <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Custom (Pro Member)</span>
                  </>
                ) : (
                  <span>+ Add Unique Exercise</span>
                )}
              </button>
            </div>
          </div>

          {/* Muscle Categories Breakdown */}
          <MuscleCategoryMenu
            onStartCustomWithExercises={handleSelectMuscleOrExerciseSession}
            onFilterLibraryByMuscle={onFilterLibraryByMuscle}
            currentEnvironment={currentEnvironment}
            subscription={subscription}
            onOpenUpgradeModal={onOpenProModal}
          />
        </div>
      )}

      {/* 5. HISTORY REDIRECTION (Moved with all data to Progress page) */}
      {activeTab === 'history' && (
        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3.5 my-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F6721D]/10 border border-[#F6721D]/20 flex items-center justify-center mx-auto text-[#F6721D]">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-100">Workout History has moved to Progress</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            All your logged workout sessions, volume graphs, muscle effort breakdown, and calendar matrix have been consolidated into the Progress page.
          </p>
          {onOpenProgressTab ? (
            <button
              type="button"
              onClick={() => onOpenProgressTab('history')}
              className="px-5 py-2.5 rounded-xl bg-[#F6721D] hover:brightness-110 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md inline-flex items-center gap-2 transition-all"
            >
              <span>View History in Progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
            >
              Back to Today's Lift
            </button>
          )}
        </div>
      )}

      {/* 6. CLEAN MINIMAL LEGAL & MEDICAL DISCLAIMER FOOTER */}
      <footer className="pt-3 border-t border-zinc-850/80 flex items-center justify-center text-center text-zinc-500 text-[11px]">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('soma:open-terms'));
            }
          }}
          className="text-zinc-400 hover:text-amber-400 font-medium underline transition-colors cursor-pointer shrink-0"
        >
          Terms of Use & Medical Notice
        </button>
      </footer>

      {/* Floating Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-amber-400/60 text-zinc-100 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Create Custom Unique Exercise Modal */}
      {showCreateCustomModal && (
        <CreateCustomExerciseModal
          onClose={() => {
            setShowCreateCustomModal(false);
            setSelectedMuscleForNew(undefined);
          }}
          initialMuscle={selectedMuscleForNew || 'Chest'}
          userProfile={userProfile}
          subscription={subscription}
          onOpenUpgradeModal={onOpenProModal}
          onExerciseCreated={newEx => {
            const updated = getCustomExercises();
            setCustomExercises(updated);
            setToastMessage(`"${newEx.name}" saved under ${newEx.primaryMuscle}!`);
            setTimeout(() => setToastMessage(null), 3500);
          }}
          onLaunchWorkoutWithExercise={handleLaunchWithCustomExercise}
        />
      )}

      {/* Custom Build Personal Workout Program Modal */}
      <CustomWorkoutBuilderModal
        isOpen={showCustomBuilderModal}
        onClose={() => {
          setShowCustomBuilderModal(false);
          setEditingCustomProgram(null);
        }}
        onSaveProgram={handleSaveCustomProgram}
        initialProgram={editingCustomProgram}
        subscription={subscription}
        currentWorkoutsCount={customPrograms.length}
        onOpenUpgradeModal={onOpenProModal}
        onDeleteProgram={progId => {
          const prog = customPrograms.find(p => p.id === progId);
          if (prog) {
            setShowCustomBuilderModal(false);
            setEditingCustomProgram(null);
            setPlanToDelete(prog);
          }
        }}
      />

      {/* Delete Custom Workout Plan Confirmation Popup Modal */}
      {planToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-sans"
          onClick={() => setPlanToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-plan-modal-title"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="delete-plan-modal-title" className="text-base font-bold text-zinc-100">
                  Delete Workout Plan?
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <span className="text-zinc-100 font-semibold">"{planToDelete.name}"</span>? This will permanently remove this custom workout plan and its configured movements.
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">{planToDelete.daysCount || planToDelete.routines.length}-Day Split</span>
                  <span>·</span>
                  <span>{planToDelete.routines.reduce((acc, r) => acc + r.exercises.length, 0)} Movements</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = planToDelete.id;
                  handleDeleteCustomProgram(id);
                  setPlanToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-950/40 transition-colors cursor-pointer active:scale-98"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Your Custom Workouts Directory & Inspector Modal */}
      {showCustomWorkoutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-sans"
          onClick={() => setShowCustomWorkoutsModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="your-custom-workouts-title"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950/70">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 id="your-custom-workouts-title" className="text-base sm:text-lg font-bold text-zinc-100 truncate">
                      Your Custom Workouts
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase font-bold">
                      {customPrograms.length} Saved
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    Select, start, or customize any of your personal workout programs and training days.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomWorkoutsModal(false);
                    setEditingCustomProgram(null);
                    setShowCustomBuilderModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Workout</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomWorkoutsModal(false)}
                  className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* All Saved Custom Programs Switcher */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold block">
                  Saved Custom Workout Programs ({customPrograms.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {customPrograms.map(prog => {
                    const isCurrentProg = activeCustomProgram?.id === prog.id;
                    const totalExercises = prog.routines.reduce((sum, r) => sum + r.exercises.length, 0);
                    return (
                      <div
                        key={prog.id}
                        onClick={() => {
                          setSelectedCustomProgramId(prog.id);
                          setSelectedCustomDayIdx(0);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isCurrentProg
                            ? 'bg-amber-400/15 border-amber-400 text-zinc-100 shadow-sm'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Dumbbell className={`w-3.5 h-3.5 shrink-0 ${isCurrentProg ? 'text-amber-400' : 'text-zinc-500'}`} />
                            <span className="font-bold text-xs sm:text-sm truncate">{prog.name}</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono block mt-0.5">
                            {prog.daysCount || prog.routines.length} Days · {totalExercises} Exercises
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isCurrentProg && (
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-mono text-[10px] font-bold uppercase">
                              Selected
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setShowCustomWorkoutsModal(false);
                              setEditingCustomProgram(prog);
                              setShowCustomBuilderModal(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title={`Edit ${prog.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Custom Program Routines & Exercises */}
              {activeCustomProgram && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider block">
                        Active Custom Program Schedule
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-zinc-100">
                        {activeCustomProgram.name} ({activeCustomProgram.daysCount || activeCustomProgram.routines.length}-Day Split)
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomWorkoutsModal(false);
                        setEditingCustomProgram(activeCustomProgram);
                        setShowCustomBuilderModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Program & Exercises</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeCustomProgram.routines.map((rt, rIdx) => (
                      <div
                        key={rIdx}
                        className={`p-4 rounded-xl bg-zinc-950/80 border transition-all space-y-3 ${
                          selectedCustomDayIdx === rIdx
                            ? 'border-amber-400/50'
                            : 'border-zinc-800/90'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-850">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-400/15 text-amber-400 font-mono text-[10px] font-bold uppercase">
                                Day {rIdx + 1}
                              </span>
                              <h5 className="font-bold text-xs sm:text-sm text-zinc-100">
                                {rt.dayName}
                              </h5>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              Focus: {rt.focus} · {rt.exercises.length} Movements
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCustomDayIdx(rIdx);
                                setShowCustomWorkoutsModal(false);
                                setHighlightCustomCard(true);
                                setTimeout(() => setHighlightCustomCard(false), 1200);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
                            >
                              Select Day
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCustomDayIdx(rIdx);
                                setShowCustomWorkoutsModal(false);
                                onStartRoutine(rt);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Start Workout</span>
                            </button>
                          </div>
                        </div>

                        <div className="divide-y divide-zinc-900">
                          {rt.exercises.map((ex, exIdx) => (
                            <div
                              key={`${ex.exerciseId}_${exIdx}`}
                              className="py-1.5 flex items-center justify-between text-xs gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-zinc-500 text-[11px] w-4 shrink-0">
                                  {exIdx + 1}.
                                </span>
                                <span className="text-zinc-200 font-medium truncate">
                                  {getExerciseName(ex.exerciseId)}
                                </span>
                              </div>
                              <span className="font-mono text-zinc-400 text-[11px] shrink-0">
                                {ex.defaultSets} × {ex.targetReps}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remaining Day Workout Exercises Detail Popup Modal */}
      {inspectingDayRoutine && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-sans"
          onClick={() => setInspectingDayRoutine(null)}
        >
          <div
            className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 text-zinc-100"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-routine-detail-title"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-start justify-between gap-3 bg-zinc-950/70">
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider block">
                  {activePlan.title} · Day Breakdown
                </span>
                <h3 id="day-routine-detail-title" className="text-base sm:text-lg font-bold text-zinc-100 mt-0.5">
                  {inspectingDayRoutine.dayName}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Focus: {inspectingDayRoutine.focus} · {inspectingDayRoutine.exercises.length} Exercises
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDayRoutine(null)}
                className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detailed Exercises Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {inspectingDayRoutine.exercises.map((ex, idx) => {
                const def =
                  customExercises.find(e => e.id === ex.exerciseId) ||
                  findExerciseDefinition(ex.exerciseId) ||
                  resolveCatalogExercise(ex.exerciseId);
                const videoSrc = ex.cdn_url || def?.cdn_url || def?.cdnUrl;
                return (
                  <div
                    key={`${ex.exerciseId}_${idx}`}
                    className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                          {ex.name || def?.name || getExerciseName(ex.exerciseId)}
                        </h4>
                        <ExerciseInfoTooltip
                          exerciseId={ex.exerciseId}
                          exerciseName={ex.name || def?.name || getExerciseName(ex.exerciseId)}
                          size="xs"
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
                        {ex.defaultSets} sets × {ex.targetReps} reps
                      </span>
                    </div>

                    {videoSrc && (
                      <div
                        onClick={() => setSelectedInspectVideo({
                          name: ex.name || def?.name || getExerciseName(ex.exerciseId),
                          videoSrc,
                          muscle: ex.primary_muscle || def?.primary_muscle || def?.primaryMuscle || ''
                        })}
                        className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-750/90 w-full min-h-[250px] sm:min-h-[300px] h-60 sm:h-72 aspect-[4/3] sm:aspect-[16/10] shadow-md flex items-center justify-center group/card cursor-pointer"
                        title="Click to view full screen"
                      >
                        <video
                          src={videoSrc}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full max-h-full max-w-full object-contain object-center filter brightness-[0.92] contrast-[1.08] transition-transform duration-300 group-hover/card:scale-[1.01]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                        {/* Simplified Video Expansion Button (Bottom Right) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInspectVideo({
                              name: ex.name || def?.name || getExerciseName(ex.exerciseId),
                              videoSrc,
                              muscle: ex.primary_muscle || def?.primary_muscle || def?.primaryMuscle || ''
                            });
                          }}
                          title="Expand video to full screen"
                          aria-label="Expand video to full screen"
                          className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/80 hover:bg-black text-amber-400 hover:text-amber-300 backdrop-blur-md border border-zinc-700/80 hover:border-amber-400/80 shadow-md cursor-pointer z-20 transition-all active:scale-95 flex items-center gap-1 text-[11px] font-mono font-medium"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Expand</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-zinc-400">
                      {(ex.primary_muscle || def?.primary_muscle || def?.primaryMuscle) && (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          Target: {ex.primary_muscle || def?.primary_muscle || def?.primaryMuscle}
                        </span>
                      )}
                      {def?.equipment && (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {def.equipment}
                        </span>
                      )}
                      {def?.tier && (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {def.tier}
                        </span>
                      )}
                      {ex.targetRpe && (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          RPE {ex.targetRpe}
                        </span>
                      )}
                    </div>

                    {def?.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {def.description}
                      </p>
                    )}

                    {def?.cues && def.cues.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {def.cues.slice(0, 2).map((cue, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                            <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            <span>{cue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/70 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setInspectingDayRoutine(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const chosen = inspectingDayRoutine;
                    setInspectingDayRoutine(null);
                    setSelectedLaunchedRoutine(chosen);
                    setExcludedRoutineExerciseIds([]);
                    setOrderedTodayExerciseIds(null);
                    setHighlightTodayCard(true);
                    setTimeout(() => setHighlightTodayCard(false), 1200);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-400 border border-amber-400/30 font-bold text-xs transition-colors cursor-pointer"
                >
                  Select as Today's Protocol
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const chosen = inspectingDayRoutine;
                    setInspectingDayRoutine(null);
                    if (chosen) {
                      setSelectedLaunchedRoutine(chosen);
                      if (wearableRec) {
                        setOpenedFromStartWorkout(true);
                        setShowWearableInfoModal(true);
                      } else {
                        onStartRoutine(chosen);
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Workout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fitness Tracker Recommendation & Why Explanation Modal */}
      {showWearableInfoModal && wearableRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in font-sans">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] overflow-hidden text-zinc-100">
            {/* Modal Header */}
            <div className="shrink-0 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Watch className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                    Fitness Tracker Recommendation
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400 truncate">
                    {primaryDevice?.name} Biometric Recovery Analysis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowWearableInfoModal(false);
                  setOpenedFromStartWorkout(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 overscroll-contain text-xs">
              {/* Recommendation Headline Box */}
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  Prescribed Adjustment
                </span>
                <p className="text-xs sm:text-sm font-bold text-zinc-100">
                  {wearableRec.headline}
                </p>
                <p className="text-[11px] text-zinc-300">
                  {wearableRec.summary}
                </p>
              </div>

              {/* Biometrics Snapshot Matrix */}
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block mb-1.5">
                  Live Sensor Telemetry
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 font-mono block">Sleep Debt</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-red-400">
                      +{(wearableRec.biometrics.sleepDebtHours ?? 1.9).toFixed(1)}h
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                      {wearableRec.biometrics.sleepDurationHours?.toFixed(1) ?? '5.3'}h total
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 font-mono block">Resting HR</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                      {wearableRec.biometrics.restingHeartRateBpm} bpm
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                      +{wearableRec.biometrics.rhrDelta ?? 11} above base
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 font-mono block">HRV Score</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                      {wearableRec.biometrics.hrvMs} ms
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                      {wearableRec.biometrics.hrvDeltaPercent ?? -50}% ANS tone
                    </span>
                  </div>
                </div>
              </div>

              {/* Why This Recommendation? */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block">
                  Why We Recommend This
                </span>
                <div className="space-y-2">
                  {wearableRec.rationales.map((rat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px] font-bold text-zinc-200">{rat.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed pl-5">
                        {rat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What Happens If Accepted */}
              <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-[11px] text-zinc-300 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                  Workout Modification Plan
                </span>
                <ul className="space-y-0.5 pl-3 list-disc text-zinc-400">
                  <li>Working sets are trimmed by ~20% across today's movements to avoid overtraining</li>
                  <li>Target RPE is capped at {wearableRec.recommendedRpeCap || 7.5} to prevent central nervous system failure</li>
                  <li>Rest intervals are preserved with full hydration breaks</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions: Discard or Accept */}
            <div className="shrink-0 px-4 py-3 sm:px-5 sm:py-3.5 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => handleDiscardRecommendation(openedFromStartWorkout)}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-zinc-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
              >
                <X className="w-3.5 h-3.5 text-zinc-400" />
                <span>{openedFromStartWorkout ? 'Discard (Full Volume)' : 'Discard Recommendation'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleAcceptRecommendation(openedFromStartWorkout)}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{openedFromStartWorkout ? 'Accept & Start Workout' : 'Accept & Modify Workout'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Personalized Plan Modal */}
      <SharePersonalizedPlanModal
        plan={programToShare}
        isOpen={!!programToShare}
        onClose={() => setProgramToShare(null)}
        subscription={subscription}
        userProfile={userProfile}
        onPlanShared={(sharedPlan, targetNames) => {
          setToastMessage(`"${sharedPlan.title}" shared with ${targetNames.join(', ')}!`);
          setTimeout(() => setToastMessage(null), 4500);
        }}
      />

      {/* Exercise Video Fullscreen Inspection Lightbox */}
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
                <span className="truncate">Full Screen Video · {selectedInspectVideo.muscle || 'Exercise Demonstration'}</span>
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
