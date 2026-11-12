import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Dumbbell,
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Layers,
  Award,
  Info,
  X,
  Lock,
  Unlock,
  Crown,
  Flame,
  ShieldCheck,
  Search,
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  BarChart3,
  Check,
  Plus,
  AlertTriangle,
  HelpCircle,
  Trash2,
  Share2,
  Menu,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import {
  WorkoutPlan,
  DailyWorkoutRoutine,
  ExerciseDefinition,
  EquipmentEnvironment,
  UserSubscription,
  CustomWorkoutProgram,
  MuscleGroup,
  FitnessGoal,
  ExperienceLevel,
  ActiveWorkout,
  WorkoutExercise,
  WorkoutSet,
  EquipmentPlanCategory
} from '../../types';
import { PRESET_WORKOUT_PLANS, REMOVED_MUSCLE_BUILDING_PLAN_IDS } from '../../data/plans';
import { MUSCLE_SHAPE_PLANS, MUSCLE_SHAPE_GROUPS } from '../../data/muscleShapePlans';
import { EQUIPMENT_CATEGORY_PLANS, EQUIPMENT_PLAN_CATEGORIES } from '../../data/equipmentCategoryPlans';
import { EXERCISE_DATABASE, groundWorkoutPlan, resolveCatalogExercise } from '../../data/exercises';
import { ReplaceWorkoutPlanWarningModal } from './ReplaceWorkoutPlanWarningModal';
import { RedoWorkoutWarningModal } from './RedoWorkoutWarningModal';
import { CustomWorkoutBuilderModal } from '../workout/CustomWorkoutBuilderModal';
import { SharePersonalizedPlanModal } from './SharePersonalizedPlanModal';
import { CustomPlanBuilderView } from './CustomPlanBuilderView';
import { AnimatedExerciseFigure } from '../common/AnimatedExerciseFigure';
import { getPlanModelPhoto } from '../../data/fitnessModelPictures';
import {
  getUniquePlanThumbnailUrl,
  getPlanThumbnailSpec,
  getPlanMinimalistFallbackSvgDataUri
} from '../../data/planThumbnails';
import { adaptPlanForEnvironment } from '../../data/equipmentEnvironments';
import {
  AppTheme,
  saveCustomWorkoutProgram,
  getCustomWorkoutPrograms,
  getStoredPersonalizedPlans,
  saveStoredPersonalizedPlan,
  getDeletedPersonalizedPlanIds,
  deletePersonalizedPlanEverywhere,
  getWorkoutHistory,
  MAX_FREE_PERSONALIZED_PLANS
} from '../../utils/storage';

interface PlansViewProps {
  activePlan: WorkoutPlan;
  workoutHistory?: ActiveWorkout[];
  onSelectPlan: (plan: WorkoutPlan) => void;
  onStartRoutine: (routine: DailyWorkoutRoutine) => void;
  currentEnvironment?: EquipmentEnvironment;
  onOpenEquipmentModal?: () => void;
  currentTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  subscription?: UserSubscription;
  onOpenUpgradeModal?: () => void;
  onNavigateToWorkout?: () => void;
  onRedoWorkoutSession?: (plan: WorkoutPlan, routine?: DailyWorkoutRoutine) => void;
}

type TabCategory = 'all' | 'free' | 'pro' | 'personalized' | 'current' | 'full_body' | 'weight_loss' | 'strength_power' | 'easy_foundations';

const RAW_DEFAULT_PERSONALIZED_PLANS: WorkoutPlan[] = [
  {
    id: 'pers_plan_3day_hybrid',
    title: '3-Day Personalized Foundation Split',
    subtitle: 'Compound progression with customized recovery pacing',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'full_body',
    isPro: false,
    badge: 'PERSONALIZED',
    thumbnail_url: 'https://images.unsplash.com/photo-1596357395104-ba989e72b5ec?auto=format&fit=crop&w=960&h=600&q=85&plan=pers_plan_3day_hybrid&focus=personalized_3day_hybrid_foundation',
    description: 'Personalized 3-day frequency maximizing progressive overload and recovery with high mechanical tension.',
    isPersonalized: true,
    routines: [
      {
        dayName: 'Day 1: Full Body Heavy Push & Quads',
        focus: 'Chest, Delts, Quads',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_full_squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_with_rope_attachment', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Full Body Heavy Pull & Hamstrings',
        focus: 'Lats, Rhomboids, Hamstrings, Biceps',
        exercises: [
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'cable_rope_rear_delt_row', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Hypertrophy Overload & Weakpoint Specialization',
        focus: 'Upper Body & Arms',
        exercises: [
          { exerciseId: 'barbell_standing_military_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'pers_plan_4day_upper_lower',
    title: '4-Day Personalized Upper / Lower Split',
    subtitle: 'Optimized mechanical tension and upper body specialization',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: false,
    badge: 'PERSONALIZED',
    thumbnail_url: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=960&h=600&q=85&plan=pers_plan_4day_upper_lower&focus=personalized_4day_upper_lower',
    description: 'Personalized 4-day powerbuilding program isolating push-pull chains and leg volume with high density.',
    isPersonalized: true,
    routines: (PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_upper_lower_4day') || PRESET_WORKOUT_PLANS[0]).routines
  },
  {
    id: 'pers_plan_5day_vtaper',
    title: '5-Day Personalized V-Taper Protocol',
    subtitle: 'Customized aesthetic training targeting wide lats & round delts',
    level: 'Advanced Pro',
    daysPerWeek: 5,
    goal: 'Aesthetic V-Taper',
    category: 'full_body',
    isPro: false,
    badge: 'PERSONALIZED',
    thumbnail_url: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=960&h=600&q=85&plan=pers_plan_5day_vtaper&focus=personalized_5day_vtaper_physique',
    description: 'Personalized 5-day protocol with targeted volume for clavicle-broadening delts and lat flare.',
    isPersonalized: true,
    routines: (PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_fullbody_5day_dup') || PRESET_WORKOUT_PLANS[0]).routines
  },
  {
    id: 'pers_plan_7day_elite_split',
    title: '7-Day Personalized Elite Split',
    subtitle: 'Daily progressive overload with dedicated active recovery & weakpoints',
    level: 'Advanced Pro',
    daysPerWeek: 7,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: false,
    badge: 'PERSONALIZED',
    thumbnail_url: 'https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=960&h=600&q=85&plan=pers_plan_7day_elite_split&focus=personalized_7day_elite_mastery',
    description: 'Comprehensive 7-day split covering Push, Pull, Quads, Hamstrings, Shoulders, Arms, and Core Conditioning.',
    isPersonalized: true,
    routines: [
      {
        dayName: 'Day 1: Heavy Push & Pec Overload',
        focus: 'Chest, Triceps, Anterior Delts',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_with_rope_attachment', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Heavy Pull & Back Thickness',
        focus: 'Lats, Rhomboids, Biceps',
        exercises: [
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'cable_rope_rear_delt_row', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Quad Dominance & Calves',
        focus: 'Quads, Calves',
        exercises: [
          { exerciseId: 'barbell_full_squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'sled_45_leg_press', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Posterior Chain & Hamstrings',
        focus: 'Hamstrings, Glutes, Lower Back',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_seated_row', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'hyperextension', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 5: Shoulder Boulder & Clavicle Width',
        focus: 'Deltoids, Traps',
        exercises: [
          { exerciseId: 'barbell_standing_military_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_rear_delt_row', defaultSets: 3, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'dumbbell_shrug', defaultSets: 3, targetReps: '12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 6: Arm Specialization (Biceps & Triceps)',
        focus: 'Biceps, Triceps, Forearms',
        exercises: [
          { exerciseId: 'ez_barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_overhead_triceps_extension_rope_attachment', defaultSets: 3, targetReps: '12', targetRpe: 9 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 7: Core, Mobility & Active Recovery',
        focus: 'Abs, Core, Mobility',
        exercises: [
          { exerciseId: 'hanging_leg_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'cable_twist', defaultSets: 3, targetReps: '12-15', targetRpe: 8 },
          { exerciseId: 'front_plank_with_twist', defaultSets: 3, targetReps: '60s', targetRpe: 8 },
          { exerciseId: 'push_up', defaultSets: 3, targetReps: '15-20', targetRpe: 7.5 }
        ]
      }
    ]
  }
];

const DEFAULT_PERSONALIZED_PLANS: WorkoutPlan[] = RAW_DEFAULT_PERSONALIZED_PLANS.map(groundWorkoutPlan);

export const PlansView: React.FC<PlansViewProps> = ({
  activePlan,
  workoutHistory,
  onSelectPlan,
  onStartRoutine,
  currentEnvironment = 'commercial_gym',
  onOpenEquipmentModal,
  currentTheme = 'dark',
  onSelectTheme,
  subscription,
  onOpenUpgradeModal,
  onNavigateToWorkout,
  onRedoWorkoutSession
}) => {
  const isPlanSessionFinished = (plan: WorkoutPlan) => {
    if (!plan) return false;
    const history = workoutHistory || getWorkoutHistory();
    if (!history || history.length === 0) return false;

    const routineNames = (plan.routines || [])
      .map(r => (r.dayName || '').toLowerCase().trim())
      .filter(Boolean);
    const planTitleLower = (plan.title || '').toLowerCase().trim();

    return history.some(w => {
      // Must be marked as done (isCompleted === true)
      if (!w.isCompleted) return false;

      // Must have finished all exercises and all sets
      const allExercisesDone =
        w.exercises &&
        w.exercises.length > 0 &&
        w.exercises.every(
          (ex: WorkoutExercise) =>
            ex.sets && ex.sets.length > 0 && ex.sets.every((s: WorkoutSet) => s.completed)
        );

      if (!allExercisesDone) return false;

      const workoutTitleLower = (w.title || '').toLowerCase().trim();
      const matchesRoutine =
        routineNames.length > 0 &&
        routineNames.some(
          rName => workoutTitleLower.includes(rName) || rName.includes(workoutTitleLower)
        );
      const matchesPlan =
        Boolean(planTitleLower && (workoutTitleLower.includes(planTitleLower) || planTitleLower.includes(workoutTitleLower)));

      return Boolean(matchesRoutine || matchesPlan);
    });
  };

  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('all');
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<EquipmentPlanCategory | null>(null);
  const [selectedMuscleShape, setSelectedMuscleShape] = useState<MuscleGroup | null>(null);
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCustomBuilder, setShowCustomBuilder] = useState<boolean>(false);
  const [pendingPlanToConfirm, setPendingPlanToConfirm] = useState<WorkoutPlan | null>(null);
  const [redoPlanToConfirm, setRedoPlanToConfirm] = useState<WorkoutPlan | null>(null);
  const [previewPlan, setPreviewPlan] = useState<WorkoutPlan | null>(null);
  const [inspectExercise, setInspectExercise] = useState<ExerciseDefinition | null>(null);
  const [pricingExplainerPlan, setPricingExplainerPlan] = useState<WorkoutPlan | null>(null);
  const [storedPersonalizedPlans, setStoredPersonalizedPlans] = useState<WorkoutPlan[]>(() => getStoredPersonalizedPlans());
  const [deletedPlanIds, setDeletedPlanIds] = useState<string[]>(() => getDeletedPersonalizedPlanIds());
  const [planToDeleteConfirm, setPlanToDeleteConfirm] = useState<WorkoutPlan | null>(null);
  const [planToShare, setPlanToShare] = useState<WorkoutPlan | null>(null);
  const [openMenuPlanId, setOpenMenuPlanId] = useState<string | null>(null);
  const [showLimitExplanationModal, setShowLimitExplanationModal] = useState<boolean>(false);

  // Close hamburger menu on outside click
  useEffect(() => {
    if (!openMenuPlanId) return;
    const handleDocumentClick = () => {
      setOpenMenuPlanId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [openMenuPlanId]);

  // Create Plan Dropdown state
  const [showCreateDropdown, setShowCreateDropdown] = useState<boolean>(false);
  const [draftPlanName, setDraftPlanName] = useState<string>('My Custom Hypertrophy Split');
  const [draftPlanGoal, setDraftPlanGoal] = useState<FitnessGoal>('Hypertrophy (Pure Muscle Mass)');
  const [draftPlanLevel, setDraftPlanLevel] = useState<ExperienceLevel>('Intermediate');
  const [draftPlanPhotoUrl, setDraftPlanPhotoUrl] = useState<string>('');
  const [draftDaysCount, setDraftDaysCount] = useState<number>(3);
  const [activeDraftDayIdx, setActiveDraftDayIdx] = useState<number>(0);
  const [draftRoutines, setDraftRoutines] = useState<DailyWorkoutRoutine[]>(() =>
    [
      {
        dayName: 'Day 1: Chest & Triceps',
        focus: 'Chest, Triceps',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_pushdown_with_rope_attachment', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Back & Biceps',
        focus: 'Back, Biceps',
        exercises: [
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_wide_grip_lat_pulldown', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Legs & Shoulders',
        focus: 'Quads, Hamstrings, Shoulders',
        exercises: [
          { exerciseId: 'barbell_full_squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ].map(r => groundWorkoutPlan({ id: 'tmp', title: 'tmp', subtitle: '', level: 'Intermediate', daysPerWeek: 3, goal: 'Hypertrophy (Pure Muscle Mass)', category: 'full_body', isPro: false, description: '', routines: [r] }).routines[0])
  );

  // Exercise selector controls inside Create Plan dropdown
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'All'>('Chest');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('barbell_bench_press');
  const [customExerciseName, setCustomExerciseName] = useState<string>('');
  const [selectedSets, setSelectedSets] = useState<number>(3);
  const [selectedReps, setSelectedReps] = useState<string>('8-10');
  const [selectedRpe, setSelectedRpe] = useState<number>(8.5);
  const [selectedRestSec, setSelectedRestSec] = useState<number>(90);
  const [planCreatedBanner, setPlanCreatedBanner] = useState<string | null>(null);

  const MUSCLE_GROUPS_LIST: (MuscleGroup | 'All')[] = [
    'Chest',
    'Back',
    'Shoulders',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Biceps',
    'Triceps',
    'Abs & Core',
    'Calves',
    'Forearms',
    'All'
  ];

  const availableExercisesForMuscle = useMemo(() => {
    if (selectedMuscleGroup === 'All') {
      return EXERCISE_DATABASE;
    }
    return EXERCISE_DATABASE.filter(ex => ex.primaryMuscle === selectedMuscleGroup);
  }, [selectedMuscleGroup]);

  // Keep selectedExerciseId valid when muscle group changes
  useEffect(() => {
    if (selectedExerciseId === '__custom__') return;
    if (availableExercisesForMuscle.length > 0 && !availableExercisesForMuscle.some(e => e.id === selectedExerciseId)) {
      setSelectedExerciseId(availableExercisesForMuscle[0].id);
    }
  }, [availableExercisesForMuscle, selectedExerciseId]);

  const isUserPro = subscription?.isPro ?? false;

  // Build complete list of all personal programs (developed by the user or downloaded from other users)
  const personalizedPlans = useMemo(() => {
    const deletedSet = new Set(deletedPlanIds);
    const isPlanDeleted = (p: WorkoutPlan) =>
      deletedSet.has(p.id) || deletedSet.has((p.title || '').trim().toLowerCase());

    const customPrograms = getCustomWorkoutPrograms();
    const customAsPlans: WorkoutPlan[] = customPrograms.map(program => {
      const customId = program.id || `custom_plan_${program.name.replace(/\s+/g, '_')}`;
      return {
        id: customId,
        title: program.name,
        subtitle: `${program.daysCount || program.routines.length}-Day Personalized Program`,
        level: 'Intermediate',
        daysPerWeek: program.daysCount || Math.max(1, program.routines.length),
        goal: 'Hypertrophy (Pure Muscle Mass)',
        category: 'full_body',
        isPro: false,
        badge: 'PERSONALIZED',
        thumbnail_url: getUniquePlanThumbnailUrl(customId),
        description: `Custom ${program.daysCount || program.routines.length}-day split with customized exercise configurations.`,
        isPersonalized: true,
        routines: program.routines
      };
    });

    const list: WorkoutPlan[] = [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    const tryAddPlan = (p: WorkoutPlan) => {
      if (!p || isPlanDeleted(p)) return;
      const idKey = (p.id || '').trim().toLowerCase();
      const titleKey = (p.title || '').trim().toLowerCase();
      if ((idKey && seenIds.has(idKey)) || (titleKey && seenTitles.has(titleKey))) {
        return;
      }
      if (idKey) seenIds.add(idKey);
      if (titleKey) seenTitles.add(titleKey);
      list.push(p);
    };

    // 1. Add activePlan if it's personalized and not deleted
    if (activePlan.isPersonalized) {
      tryAddPlan(activePlan);
    }
    // 2. Add stored personalized plans (created or downloaded from other users)
    storedPersonalizedPlans.forEach(tryAddPlan);
    // 3. Add custom programs as plans
    customAsPlans.forEach(tryAddPlan);

    // If no personal programs exist yet and none were deleted, fall back to the 3 starter personal programs
    if (list.length === 0) {
      DEFAULT_PERSONALIZED_PLANS.slice(0, 3).forEach(tryAddPlan);
    }

    // A non-Pro user is only allowed to have at most 5 personal programs
    return isUserPro ? list : list.slice(0, MAX_FREE_PERSONALIZED_PLANS);
  }, [storedPersonalizedPlans, activePlan, deletedPlanIds, isUserPro]);

  // All personal programs (developed by user or downloaded from other users) count toward the 5-program limit
  const createdPersonalizedPlansCount = personalizedPlans.length;
  const isAtPersonalizedPlanLimit = !isUserPro && createdPersonalizedPlansCount >= MAX_FREE_PERSONALIZED_PLANS;
  const remainingPersonalizedSlots = isUserPro
    ? Infinity
    : Math.max(0, MAX_FREE_PERSONALIZED_PLANS - createdPersonalizedPlansCount);

  const handleChangeDraftDaysCount = (newCount: number) => {
    setDraftDaysCount(newCount);
    setDraftRoutines(prev => {
      const updated = [...prev];
      const defaultDayTemplates: Record<number, { dayName: string; focus: string; exerciseId: string }> = {
        4: { dayName: 'Day 4: Shoulders & Upper Chest', focus: 'Shoulders, Upper Chest', exerciseId: 'barbell_standing_military_press' },
        5: { dayName: 'Day 5: Upper Hypertrophy Overload', focus: 'Chest, Back, Arms', exerciseId: 'dumbbell_incline_bench_press' },
        6: { dayName: 'Day 6: Lower Body & Calves', focus: 'Quads, Hamstrings, Calves', exerciseId: 'sled_45_leg_press' },
        7: { dayName: 'Day 7: Arms, Abs & Active Recovery', focus: 'Biceps, Triceps, Abs', exerciseId: 'hanging_leg_raise' }
      };

      while (updated.length < newCount) {
        const dayNum = updated.length + 1;
        const template = defaultDayTemplates[dayNum];
        const def = resolveCatalogExercise(template ? template.exerciseId : 'barbell_bench_press');
        updated.push({
          dayName: template ? template.dayName : `Day ${dayNum}: Custom Focus`,
          focus: template ? template.focus : 'Full Body / Custom',
          exercises: [
            {
              id: def.id,
              exerciseId: def.id,
              name: def.name,
              primary_muscle: def.primary_muscle,
              cdn_url: def.cdn_url,
              defaultSets: 3,
              targetReps: '8-10',
              targetRpe: 8.5
            }
          ]
        });
      }
      return updated.slice(0, newCount);
    });
    if (activeDraftDayIdx >= newCount) {
      setActiveDraftDayIdx(Math.max(0, newCount - 1));
    }
  };

  const handleAddExerciseToDraftDay = () => {
    let exerciseIdToUse = selectedExerciseId;
    if (selectedExerciseId === '__custom__') {
      const trimmed = customExerciseName.trim();
      if (!trimmed) return;
      exerciseIdToUse = trimmed;
    }
    if (!exerciseIdToUse) return;

    setDraftRoutines(prev =>
      prev.map((routine, idx) => {
        if (idx !== activeDraftDayIdx) return routine;
        const matchedEx = resolveCatalogExercise(
          exerciseIdToUse,
          selectedMuscleGroup !== 'All' ? selectedMuscleGroup : undefined
        );
        const muscleName = matchedEx ? matchedEx.primaryMuscle : selectedMuscleGroup !== 'All' ? selectedMuscleGroup : 'Custom';
        const currentFocusParts = routine.focus
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        const nextFocus = currentFocusParts.includes(muscleName)
          ? routine.focus
          : [...currentFocusParts, muscleName].slice(0, 4).join(', ');
        return {
          ...routine,
          focus: nextFocus || muscleName,
          exercises: [
            ...routine.exercises,
            {
              id: matchedEx.id,
              exerciseId: matchedEx.id,
              name: matchedEx.name,
              primary_muscle: matchedEx.primary_muscle || matchedEx.rawPrimaryMuscle || matchedEx.primaryMuscle,
              cdn_url: matchedEx.cdn_url || matchedEx.cdnUrl || '',
              defaultSets: selectedSets,
              targetReps: selectedReps,
              targetRpe: selectedRpe
            }
          ]
        };
      })
    );
    if (selectedExerciseId === '__custom__') {
      setCustomExerciseName('');
    }
  };

  const handleRemoveExerciseFromDraftDay = (exIdx: number) => {
    setDraftRoutines(prev =>
      prev.map((routine, idx) => {
        if (idx !== activeDraftDayIdx) return routine;
        return {
          ...routine,
          exercises: routine.exercises.filter((_, i) => i !== exIdx)
        };
      })
    );
  };

  const handleUpdateDraftExerciseField = (
    exIdx: number,
    field: 'defaultSets' | 'targetReps' | 'targetRpe',
    value: number | string
  ) => {
    setDraftRoutines(prev =>
      prev.map((routine, idx) => {
        if (idx !== activeDraftDayIdx) return routine;
        return {
          ...routine,
          exercises: routine.exercises.map((ex, i) => (i === exIdx ? { ...ex, [field]: value } : ex))
        };
      })
    );
  };

  const handleSaveCreatedDropdownPlan = (activateImmediately: boolean) => {
    if (isAtPersonalizedPlanLimit) {
      setShowCreateDropdown(false);
      setShowLimitExplanationModal(true);
      return;
    }
    const cleanTitle = draftPlanName.trim() || 'Custom Personalized Plan';
    const validRoutines = draftRoutines.map((r, i) => ({
      dayName: r.dayName.trim() || `Day ${i + 1}`,
      focus: r.focus.trim() || 'Custom Split',
      exercises:
        r.exercises.length > 0
          ? r.exercises
          : [{ exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 }]
    }));

    const newPlanId = `custom_plan_${Date.now()}`;
    const customProgram: CustomWorkoutProgram = {
      id: newPlanId,
      name: cleanTitle,
      daysCount: validRoutines.length,
      routines: validRoutines,
      createdAt: Date.now()
    };
    saveCustomWorkoutProgram(customProgram, isUserPro);

    const newPlan: WorkoutPlan = {
      id: newPlanId,
      title: cleanTitle,
      subtitle: `${validRoutines.length}-Day Personalized Custom Split`,
      level: draftPlanLevel,
      daysPerWeek: validRoutines.length,
      goal: draftPlanGoal,
      category: 'full_body',
      isPro: false,
      badge: 'CUSTOM PLAN',
      thumbnail_url: draftPlanPhotoUrl.trim() || getUniquePlanThumbnailUrl(newPlanId),
      description: `Personalized ${validRoutines.length}-day workout plan (${draftPlanGoal}) with custom muscle groups, exercises, sets, and rep targets.`,
      isPersonalized: true,
      routines: validRoutines
    };

    saveStoredPersonalizedPlan(newPlan, true);
    setStoredPersonalizedPlans(getStoredPersonalizedPlans());
    setDeletedPlanIds(getDeletedPersonalizedPlanIds());
    setSelectedCategory('personalized');
    setShowCreateDropdown(false);
    setDraftPlanPhotoUrl('');
    setPlanCreatedBanner(`"${cleanTitle}" saved to your Personalized Plans!`);
    setTimeout(() => setPlanCreatedBanner(null), 5000);

    if (activateImmediately) {
      handleRequestPlanActivation(newPlan);
    }
  };

  const handleDeletePersonalizedPlan = (plan: WorkoutPlan) => {
    const { fallbackActivePlan } = deletePersonalizedPlanEverywhere(plan.id, plan.title);
    setStoredPersonalizedPlans(getStoredPersonalizedPlans());
    setDeletedPlanIds(getDeletedPersonalizedPlanIds());
    if (fallbackActivePlan) {
      onSelectPlan(fallbackActivePlan);
    }
    if (previewPlan?.id === plan.id) {
      setPreviewPlan(null);
    }
    setPlanToDeleteConfirm(null);
    setPlanCreatedBanner(`"${plan.title}" deleted from Personalized Plans and Custom Workouts.`);
    setTimeout(() => setPlanCreatedBanner(null), 4500);
  };

  // Listen to custom workout & personalized plan updates
  useEffect(() => {
    const handler = () => {
      setStoredPersonalizedPlans(getStoredPersonalizedPlans());
      setDeletedPlanIds(getDeletedPersonalizedPlanIds());
    };
    window.addEventListener('gympax:custom-workouts-updated', handler);
    window.addEventListener('gympax:personalized-plans-updated', handler);
    return () => {
      window.removeEventListener('gympax:custom-workouts-updated', handler);
      window.removeEventListener('gympax:personalized-plans-updated', handler);
    };
  }, []);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const equipmentScrollRef = useRef<HTMLDivElement>(null);
  const muscleScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainerToAdjacent = (
    container: HTMLDivElement | null,
    direction: 'left' | 'right'
  ) => {
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'));
    if (!buttons.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;
    buttons.forEach((btn, idx) => {
      const rect = btn.getBoundingClientRect();
      const btnCenter = rect.left + rect.width / 2;
      const dist = Math.abs(btnCenter - containerCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const targetIndex = direction === 'left'
      ? Math.max(0, closestIndex - 1)
      : Math.min(buttons.length - 1, closestIndex + 1);

    buttons[targetIndex].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  const scrollCategoryLeft = () => scrollContainerToAdjacent(categoryScrollRef.current, 'left');
  const scrollCategoryRight = () => scrollContainerToAdjacent(categoryScrollRef.current, 'right');
  const scrollEquipmentLeft = () => scrollContainerToAdjacent(equipmentScrollRef.current, 'left');
  const scrollEquipmentRight = () => scrollContainerToAdjacent(equipmentScrollRef.current, 'right');
  const scrollMuscleLeft = () => scrollContainerToAdjacent(muscleScrollRef.current, 'left');
  const scrollMuscleRight = () => scrollContainerToAdjacent(muscleScrollRef.current, 'right');

  const getExercise = (id: string): ExerciseDefinition => {
    return resolveCatalogExercise(id);
  };

  // Unified list of all Body Shape plans: active Body Shape plan first, followed by personalized and preset plans
  const allPlans = useMemo(() => {
    const planMap = new Map<string, WorkoutPlan>();
    if (
      activePlan &&
      !REMOVED_MUSCLE_BUILDING_PLAN_IDS.has(activePlan.id) &&
      !activePlan.targetMuscleGroup
    ) {
      planMap.set(activePlan.id, activePlan);
    }
    personalizedPlans.forEach(p => {
      if (!REMOVED_MUSCLE_BUILDING_PLAN_IDS.has(p.id) && !p.targetMuscleGroup) {
        planMap.set(p.id, p);
      }
    });
    PRESET_WORKOUT_PLANS.forEach(p => {
      if (!planMap.has(p.id)) {
        planMap.set(p.id, p);
      }
    });
    EQUIPMENT_CATEGORY_PLANS.forEach(p => {
      if (!planMap.has(p.id)) {
        planMap.set(p.id, p);
      }
    });
    return Array.from(planMap.values());
  }, [activePlan, personalizedPlans]);

  const categoriesConfig: {
    id: TabCategory;
    label: string;
    icon: typeof Layers;
    count: string | number;
  }[] = [
    { id: 'all', label: 'All Plans', icon: Layers, count: allPlans.length },
    { id: 'free', label: 'Free Plans', icon: Unlock, count: allPlans.filter(p => !p.isPro).length },
    { id: 'pro', label: 'Pro Plans', icon: Crown, count: allPlans.filter(p => p.isPro).length },
    {
      id: 'personalized',
      label: 'Personalized Plans',
      icon: Sparkles,
      count: personalizedPlans.length
    },
    { id: 'full_body', label: 'Full Body Plans', icon: Calendar, count: allPlans.filter(p => p.category === 'full_body' && !p.isPersonalized).length },
    { id: 'weight_loss', label: 'Weight Loss & Shred', icon: Flame, count: allPlans.filter(p => p.category === 'weight_loss' && !p.isPersonalized).length },
    { id: 'strength_power', label: 'Strength & Power', icon: Zap, count: allPlans.filter(p => p.category === 'strength_power' && !p.isPersonalized).length },
    { id: 'easy_foundations', label: 'Easy & Foundations', icon: ShieldCheck, count: allPlans.filter(p => p.category === 'easy_foundations' && !p.isPersonalized).length }
  ];

  // Filtered plans list including Body Shape, Equipment Setup, and Muscle Shape specialization plans
  const filteredPlans = useMemo(() => {
    // When a specific equipment setup is selected ("Home Gym", "Free Weights Only", "Dumbbells Only", "Bodyweight Only")
    if (selectedEquipmentCategory) {
      const equipPlans = EQUIPMENT_CATEGORY_PLANS.filter(plan => {
        if (plan.targetEquipmentCategory !== selectedEquipmentCategory) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesTitle = plan.title.toLowerCase().includes(query);
          const matchesSubtitle = plan.subtitle.toLowerCase().includes(query);
          const matchesGoal = plan.goal.toLowerCase().includes(query);
          const matchesDesc = plan.description.toLowerCase().includes(query);
          const matchesHowTo = (plan.howToUse || '').toLowerCase().includes(query);
          if (!matchesTitle && !matchesSubtitle && !matchesGoal && !matchesDesc && !matchesHowTo) {
            return false;
          }
        }
        return true;
      });
      return [...equipPlans].sort((a, b) => {
        if (a.id === activePlan.id && b.id !== activePlan.id) return -1;
        if (b.id === activePlan.id && a.id !== activePlan.id) return 1;
        return 0;
      });
    }

    // When a specific muscle group is selected in "Muscle Shape", show the 4 dedicated programs for that muscle group
    if (selectedMuscleShape) {
      const musclePlans = MUSCLE_SHAPE_PLANS.filter(
        plan => plan.targetMuscleGroup === selectedMuscleShape
      );
      return [...musclePlans].sort((a, b) => {
        if (a.id === activePlan.id && b.id !== activePlan.id) return -1;
        if (b.id === activePlan.id && a.id !== activePlan.id) return 1;
        return 0;
      });
    }

    return allPlans.filter(plan => {
      // Category filter (across Body Shape categories)
      if (selectedCategory !== 'all' && selectedCategory !== 'current') {
        if (selectedCategory === 'free') {
          if (plan.isPro) return false;
        } else if (selectedCategory === 'pro') {
          if (!plan.isPro) return false;
        } else if (selectedCategory === 'personalized') {
          if (!plan.isPersonalized) return false;
        } else {
          if (plan.isPersonalized) return false;
          if (plan.category !== selectedCategory) return false;
        }
      }

      // Tier filter
      if (tierFilter === 'free' && plan.isPro) return false;
      if (tierFilter === 'pro' && !plan.isPro) return false;
      if (tierFilter === 'custom' && !plan.isPersonalized && plan.badge !== 'CUSTOM PLAN' && !plan.id.startsWith('custom_')) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = plan.title.toLowerCase().includes(query);
        const matchesSubtitle = plan.subtitle.toLowerCase().includes(query);
        const matchesGoal = plan.goal.toLowerCase().includes(query);
        const matchesDesc = plan.description.toLowerCase().includes(query);
        const matchesHowTo = (plan.howToUse || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubtitle && !matchesGoal && !matchesDesc && !matchesHowTo) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (a.id === activePlan.id && b.id !== activePlan.id) return -1;
      if (b.id === activePlan.id && a.id !== activePlan.id) return 1;
      return 0;
    });
  }, [allPlans, selectedCategory, selectedEquipmentCategory, selectedMuscleShape, tierFilter, searchQuery, activePlan.id]);

  // User requests plan activation -> opens warning popup before adjusting workout
  const handleRequestPlanActivation = (plan: WorkoutPlan) => {
    // Check if pro plan and user is not pro
    if (plan.isPro && !isUserPro) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal();
      }
      return;
    }

    const adapted = adaptPlanForEnvironment(plan, currentEnvironment);
    setPendingPlanToConfirm(adapted);
  };

  // User accepts the warning popup -> actual program is adjusted to Workout
  const handleConfirmPlanActivation = () => {
    if (!pendingPlanToConfirm) return;
    onSelectPlan(pendingPlanToConfirm);
    setPendingPlanToConfirm(null);
    setPreviewPlan(null);
    setShowCustomBuilder(false);
    if (onNavigateToWorkout) {
      onNavigateToWorkout();
    }
  };

  // User declines the warning popup -> current workout is kept safe
  const handleDeclinePlanActivation = () => {
    setPendingPlanToConfirm(null);
  };

  // User requests redo workout session -> opens warning popup
  const handleRequestRedo = (plan: WorkoutPlan) => {
    setRedoPlanToConfirm(plan);
  };

  // User confirms redo workout session -> makes workout active again & replaces current workout plans
  const handleConfirmRedo = () => {
    if (!redoPlanToConfirm) return;
    const targetPlan = redoPlanToConfirm;
    setRedoPlanToConfirm(null);
    setPreviewPlan(null);
    if (onRedoWorkoutSession) {
      onRedoWorkoutSession(targetPlan);
    } else {
      onSelectPlan(targetPlan);
      if (onStartRoutine && targetPlan.routines && targetPlan.routines[0]) {
        onStartRoutine(targetPlan.routines[0]);
      }
      if (onNavigateToWorkout) {
        onNavigateToWorkout();
      }
    }
  };

  // User discards redo warning popup -> keeps workout as is
  const handleDiscardRedo = () => {
    setRedoPlanToConfirm(null);
  };

  // User creates a custom workout program -> save to custom programs & convert to plan
  const handleSaveCustomProgramAsPlan = (program: CustomWorkoutProgram) => {
    if (isAtPersonalizedPlanLimit) {
      setShowCustomBuilder(false);
      setShowLimitExplanationModal(true);
      return;
    }
    saveCustomWorkoutProgram(program, isUserPro);
    const customPlan: WorkoutPlan = {
      id: program.id || `custom_plan_${Date.now()}`,
      title: program.name,
      subtitle: `${program.daysCount || program.routines.length}-Day Custom Split Designed by Athlete`,
      level: 'Intermediate',
      daysPerWeek: program.daysCount || Math.max(1, program.routines.length),
      goal: 'Hypertrophy (Pure Muscle Mass)',
      category: 'full_body',
      isPro: false,
      badge: 'CUSTOM PLAN',
      description: `Custom ${program.daysCount || program.routines.length}-day workout program created by athlete with customized exercise configurations.`,
      isPersonalized: true,
      routines: program.routines
    };
    saveStoredPersonalizedPlan(customPlan, true);
    setStoredPersonalizedPlans(getStoredPersonalizedPlans());
    setShowCustomBuilder(false);
    handleRequestPlanActivation(customPlan);
  };

  const currentDraftRoutine = draftRoutines[activeDraftDayIdx] || draftRoutines[0];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 space-y-6 text-zinc-100 font-sans">
      {showCreateDropdown ? (
        <CustomPlanBuilderView
          draftPlanName={draftPlanName}
          setDraftPlanName={setDraftPlanName}
          draftPlanGoal={draftPlanGoal}
          setDraftPlanGoal={setDraftPlanGoal}
          draftDaysCount={draftDaysCount}
          handleChangeDraftDaysCount={handleChangeDraftDaysCount}
          draftPlanLevel={draftPlanLevel}
          setDraftPlanLevel={setDraftPlanLevel}
          draftPlanPhotoUrl={draftPlanPhotoUrl}
          setDraftPlanPhotoUrl={setDraftPlanPhotoUrl}
          draftRoutines={draftRoutines}
          setDraftRoutines={setDraftRoutines}
          activeDraftDayIdx={activeDraftDayIdx}
          setActiveDraftDayIdx={setActiveDraftDayIdx}
          selectedMuscleGroup={selectedMuscleGroup}
          setSelectedMuscleGroup={setSelectedMuscleGroup}
          availableExercisesForMuscle={availableExercisesForMuscle}
          selectedExerciseId={selectedExerciseId}
          setSelectedExerciseId={setSelectedExerciseId}
          customExerciseName={customExerciseName}
          setCustomExerciseName={setCustomExerciseName}
          selectedSets={selectedSets}
          setSelectedSets={setSelectedSets}
          selectedReps={selectedReps}
          setSelectedReps={setSelectedReps}
          selectedRpe={selectedRpe}
          setSelectedRpe={setSelectedRpe}
          selectedRestSec={selectedRestSec}
          setSelectedRestSec={setSelectedRestSec}
          onAddExercise={handleAddExerciseToDraftDay}
          onUpdateExerciseField={handleUpdateDraftExerciseField}
          onRemoveExercise={handleRemoveExerciseFromDraftDay}
          onSavePlan={handleSaveCreatedDropdownPlan}
          onClose={() => setShowCreateDropdown(false)}
          isAtPersonalizedPlanLimit={isAtPersonalizedPlanLimit}
          createdPersonalizedPlansCount={createdPersonalizedPlansCount}
          isUserPro={isUserPro}
          onOpenLimitModal={() => setShowLimitExplanationModal(true)}
          onInspectExercise={setInspectExercise}
        />
      ) : (
        <>
          {/* Header */}
      <div className="relative flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
          Workout Plans
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {!isUserPro ? (
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium ${
                isAtPersonalizedPlanLimit
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
              }`}
              title="In the free user account, a user can only create 5 free personalized plans. In the pro account the number is unlimited."
            >
              {isAtPersonalizedPlanLimit ? (
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>{createdPersonalizedPlansCount}/{MAX_FREE_PERSONALIZED_PLANS} Free Plans</span>
            </span>
          ) : (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-400/10 border border-amber-400/30 text-amber-400"
              title="Pro account: Unlimited personalized plans."
            >
              <Crown className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>Unlimited Pro Plans</span>
            </span>
          )}

          {!showCreateDropdown && !showCustomBuilder && (
            <button
              onClick={() => {
                if (isAtPersonalizedPlanLimit) {
                  setShowLimitExplanationModal(true);
                  return;
                }
                setShowCreateDropdown(true);
              }}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                isAtPersonalizedPlanLimit
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border-amber-500/40 shadow-xs'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
              title={
                isAtPersonalizedPlanLimit
                  ? `Free limit reached (5/5). Click to see why an upgrade is required.`
                  : 'Create your own personalized workout plan'
              }
            >
              {isAtPersonalizedPlanLimit ? (
                <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              ) : (
                <Plus className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              )}
              <span>Create Plan</span>
              {!isAtPersonalizedPlanLimit && (
                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
              )}
            </button>
          )}
        </div>

      </div>

      {/* Confirmation Banner when a custom plan is saved */}
      {planCreatedBanner && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{planCreatedBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setPlanCreatedBanner(null)}
            className="text-emerald-300 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Body Shape, Equipment Setup & Muscle Shape Selection Bars */}
      <div className="space-y-2.5 rounded-2xl border border-[#F6721D] p-2.5 sm:p-3 bg-zinc-950/40">
        {/* 1. Body Shape Scrolling Area */}
        <div className="rounded-2xl border border-amber-400/40 bg-zinc-900/40 p-2 sm:p-2.5 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Body Shape
            </span>
          </div>

          <div className="relative flex items-center gap-1.5 w-full">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={scrollCategoryLeft}
              aria-label="Scroll Body Shape left"
              title="Scroll Body Shape left"
              className="flex items-center justify-center w-7 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 shrink-0 transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Pills Track */}
            <div
              ref={categoryScrollRef}
              className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x scroll-smooth w-full snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {categoriesConfig.map(cat => {
                const isSelected =
                  selectedMuscleShape === null &&
                  selectedEquipmentCategory === null &&
                  selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      setSelectedMuscleShape(null);
                      setSelectedEquipmentCategory(null);
                      setSelectedCategory(cat.id as TabCategory);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer snap-center snap-always ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={scrollCategoryRight}
              aria-label="Scroll Body Shape right"
              title="Scroll Body Shape right"
              className="flex items-center justify-center w-7 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 shrink-0 transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Equipment & Training Setup Plans Scrolling Area (Home Gym, Free Weights Only, Dumbbells Only, Bodyweight Only) */}
        <div className="rounded-2xl border border-amber-400/40 bg-zinc-900/40 p-2 sm:p-2.5 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Equipment Workout Plans
            </span>
          </div>

          <div className="relative flex items-center gap-1.5 w-full">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={scrollEquipmentLeft}
              aria-label="Scroll Equipment Plans left"
              title="Scroll Equipment Plans left"
              className="flex items-center justify-center w-7 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 shrink-0 transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Equipment Category Pills Track */}
            <div
              ref={equipmentScrollRef}
              className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x scroll-smooth w-full snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {EQUIPMENT_PLAN_CATEGORIES.map(equip => {
                const isSelected = selectedEquipmentCategory === equip.id;
                return (
                  <button
                    key={equip.id}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      setSelectedMuscleShape(null);
                      setSelectedEquipmentCategory(equip.id);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer snap-center snap-always ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
                    }`}
                  >
                    <span>{equip.label}</span>
                  </button>
                );
              })}
            </div>
            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={scrollEquipmentRight}
              aria-label="Scroll Equipment Plans right"
              title="Scroll Equipment Plans right"
              className="flex items-center justify-center w-7 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 shrink-0 transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Muscle Shape Scrolling Area */}
        <div className="rounded-2xl border border-amber-400/40 bg-zinc-900/40 p-2 sm:p-2.5 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Muscle Shape
            </span>
          </div>

          <div className="relative flex items-center gap-1.5 w-full">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={scrollMuscleLeft}
              aria-label="Scroll Muscle Shape left"
              title="Scroll Muscle Shape left"
              className="flex items-center justify-center w-7 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 shrink-0 transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Muscle Group Pills Track */}
            <div
              ref={muscleScrollRef}
              className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x scroll-smooth w-full snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {MUSCLE_SHAPE_GROUPS.map(muscle => {
                const isSelected = selectedMuscleShape === muscle.id;
                return (
                  <button
                    key={muscle.id}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      setSelectedEquipmentCategory(null);
                      setSelectedMuscleShape(muscle.id);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer snap-center snap-always ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
                    }`}
                  >
                    <span>{muscle.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={scrollMuscleRight}
              aria-label="Scroll Muscle Shape right"
              title="Scroll Muscle Shape right"
              className="flex items-center justify-center w-7 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 shrink-0 transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      {selectedCategory !== 'current' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-zinc-900/60 border border-zinc-800/80 p-2 sm:p-2.5 rounded-2xl min-w-0 max-w-full">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search plans (e.g. PPL, German Volume, 5/3/1, Shred, Dumbbell)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: PLANS DIRECTORY (Categorized or Filtered) */}
      {/* ========================================================================= */}
      {selectedCategory !== 'current' && (
        <div className="space-y-4 pt-1">
          {/* Empty State */}
          {filteredPlans.length === 0 && (
            <div className="text-center py-10 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
              <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-300">No workout plans match your filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTierFilter('all');
                  setSelectedEquipmentCategory(null);
                  setSelectedMuscleShape(null);
                  setSelectedCategory('all');
                }}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Plans Grid: Minimalistic cards with more room between them */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {filteredPlans.map(plan => {
              const isCurrent = activePlan.id === plan.id;
              const isSelected = previewPlan?.id === plan.id;
              const planPhotoUrl = getUniquePlanThumbnailUrl(plan) || plan.thumbnail_url || getPlanModelPhoto(plan.id);
              const planThumbSpec = getPlanThumbnailSpec(plan);

              return (
                <div
                  key={plan.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreviewPlan(plan)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPreviewPlan(plan);
                    }
                  }}
                  className={`group relative rounded-2xl border transition-all duration-300 ease-out flex flex-col overflow-hidden cursor-pointer hover:scale-105 hover:-translate-y-1 hover:z-20 active:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isSelected ? 'scale-105 -translate-y-1 z-20 ' : ''
                  }${
                    isCurrent
                      ? 'border-emerald-500 bg-zinc-900/90 hover:border-emerald-400 shadow-md hover:shadow-xl hover:shadow-emerald-500/25'
                      : 'border-[#F6721D]/70 bg-zinc-900/60 hover:border-[#F6721D] hover:bg-zinc-900 shadow-sm hover:shadow-xl hover:shadow-[#F6721D]/25'
                  }`}
                  title={plan.title}
                >
                  {/* Minimalist High-Definition Athletic Visual Banner */}
                  <div className="relative h-24 sm:h-28 w-full bg-zinc-950 overflow-hidden shrink-0">
                    <img
                      src={planPhotoUrl}
                      alt={`${plan.title} — ${planThumbSpec.subject}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={e => {
                        const imgEl = e.currentTarget;
                        const fallbackUri = getPlanMinimalistFallbackSvgDataUri(plan);
                        if (imgEl.src !== fallbackUri) {
                          imgEl.src = fallbackUri;
                        }
                      }}
                      className="w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.1] saturate-[0.9] group-hover:scale-105 group-hover:brightness-100 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-transparent to-black/25 pointer-events-none" />

                    {/* Label: Active / Complete, Personal, Pro, or Plan */}
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      {isCurrent ? (
                        isPlanSessionFinished(plan) ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 font-bold font-mono text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                            <span>Complete</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-950/85 text-emerald-300 border border-emerald-400/40 font-bold font-mono text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>Active</span>
                          </span>
                        )
                      ) : plan.isPersonalized ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-bold font-mono text-[9px] uppercase tracking-wider shadow-xs">
                          Personal
                        </span>
                      ) : plan.isPro ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-bold font-mono text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 fill-current shrink-0" />
                          <span>Pro</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 text-amber-300 border border-amber-400/30 font-bold font-mono text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>Plan</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Minimalistic Card Body: Only the Plan Name */}
                  <div
                    className={`p-2.5 sm:p-3 border-t flex items-center min-h-[46px] sm:min-h-[50px] ${
                      isCurrent
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-zinc-900/60 border-[#F6721D]/25'
                    }`}
                  >
                    <h3
                      className={`font-semibold text-xs transition-colors line-clamp-2 leading-snug tracking-tight ${
                        isCurrent
                          ? 'text-emerald-300 group-hover:text-emerald-200'
                          : 'text-zinc-100 group-hover:text-amber-300'
                      }`}
                    >
                      {plan.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan Preview Modal */}
      {previewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in font-sans">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] overflow-hidden text-zinc-100">
            {/* Modal Pinned Header */}
            <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-5 border-b border-zinc-800 bg-zinc-900 flex items-start justify-between gap-2.5">
              <div className="min-w-0 flex-1 pr-1 sm:pr-2">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-mono shrink-0 whitespace-nowrap ${
                      previewPlan.isPersonalized
                        ? 'bg-amber-400 text-zinc-950'
                        : previewPlan.isPro
                        ? 'bg-amber-400 text-zinc-950'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {previewPlan.isPersonalized ? 'PERSONALIZED PLAN' : previewPlan.isPro ? 'PRO MEMBER PLAN' : '100% FREE PLAN'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-400 shrink-0">
                    {previewPlan.daysPerWeek} Days/Wk · {previewPlan.level}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-zinc-100 mt-1 whitespace-normal break-words leading-snug">
                  {previewPlan.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 whitespace-normal break-words leading-relaxed">
                  {previewPlan.subtitle || previewPlan.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPlanToShare(previewPlan)}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 hover:text-amber-200 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title="Share this plan with friends"
                  aria-label="Share Plan"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                {previewPlan.isPersonalized && (
                  <button
                    type="button"
                    onClick={() => setPlanToDeleteConfirm(previewPlan)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Delete this personalized plan"
                    aria-label="Delete Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
                <button
                  onClick={() => setPreviewPlan(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
              {/* Unique High-Definition Minimalist Plan Thumbnail Hero */}
              <div className="relative h-40 sm:h-52 w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-md">
                <img
                  src={(() => {
                    const rawUrl = getUniquePlanThumbnailUrl(previewPlan) || previewPlan.thumbnail_url;
                    if (!rawUrl) return '';
                    return rawUrl
                      .replace('w=960', 'w=1600')
                      .replace('h=600', 'h=900')
                      .replace('q=85', 'q=95');
                  })()}
                  alt={previewPlan.title}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                  onError={e => {
                    const imgEl = e.currentTarget;
                    const fallbackUri = getPlanMinimalistFallbackSvgDataUri(previewPlan);
                    if (imgEl.src !== fallbackUri) {
                      imgEl.src = fallbackUri;
                    }
                  }}
                  className="w-full h-full object-cover object-center brightness-100 contrast-100"
                />
              </div>

              {/* How to Use & Description */}
              <div className="p-4 bg-zinc-950/85 rounded-2xl border border-zinc-800 space-y-2.5 text-xs text-zinc-300 leading-relaxed">
                <p className="text-zinc-200 text-xs leading-relaxed space-y-2">
                  <span className="flex items-center gap-1.5 text-amber-400 font-mono font-bold uppercase tracking-wider text-[10px]">
                    <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    How to perform this program:
                  </span>
                  {previewPlan.howToUse && (
                    <span className="block text-zinc-100 font-medium bg-zinc-900/80 rounded-xl p-2.5 border border-zinc-800 text-[11px] leading-snug">
                      <strong className="text-amber-300/90 font-semibold font-mono text-[10px] block uppercase mb-0.5">Program Pacing Schedule:</strong>
                      {previewPlan.howToUse}
                    </span>
                  )}
                  <span className="block space-y-1.5 text-zinc-300 text-[11px] pt-0.5">
                    <span className="block">
                      <strong className="text-zinc-100 font-semibold">• Weekly Schedule: </strong>
                      Train {previewPlan.daysPerWeek} days per week across {previewPlan.routines.length} {previewPlan.routines.length === 1 ? 'routine session' : 'routine sessions'}, alternating with 1–2 rest or active recovery days.
                    </span>
                    <span className="block">
                      <strong className="text-zinc-100 font-semibold">• Session Execution: </strong>
                      Perform a short warm-up, then complete each exercise in order, matching the prescribed sets, target reps, and RPE effort.
                    </span>
                    <span className="block">
                      <strong className="text-zinc-100 font-semibold">• Logging & Completion: </strong>
                      Enter your weight and reps for each set and tick every set checkbox—the session is marked Complete once all sets are ticked.
                    </span>
                    <span className="block">
                      <strong className="text-zinc-100 font-semibold">• Progressive Overload & Rest: </strong>
                      Rest 2–3 minutes on heavy compound lifts and 60–90 seconds on isolation exercises. Add 2.5–5 lbs when you hit the top rep target with clean form.
                    </span>
                  </span>
                </p>
                <p className="text-zinc-400 text-[11px] border-t border-zinc-800/80 pt-2">{previewPlan.description}</p>
              </div>

              {/* Pro Pricing & Benefits Info Box */}
              {previewPlan.isPro && (
                <div className="p-3.5 bg-zinc-950/90 rounded-2xl border border-amber-400/30 flex items-center justify-between gap-3 flex-wrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-zinc-100 text-sm">
                        ${previewPlan.price ? previewPlan.price.toFixed(2) : '39.99'} Standalone Value
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-amber-400 font-semibold">Included in Pro Subscription</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Access all 15+ Pro workout splits, custom exercise builder, and masterclasses for just $14.99/mo (50% off yearly - 12 months × $14.99 = $179/year).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPricingExplainerPlan(previewPlan)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-750 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pricing & Benefits Info</span>
                  </button>
                </div>
              )}

              {/* Routines & Exercises Schedule Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  Included Routine Cycle ({previewPlan.routines.length} Sessions):
                </h4>

                <div className="space-y-3">
                  {previewPlan.routines.map((routine, rIdx) => {
                    return (
                      <div
                        key={rIdx}
                        className="rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden group shadow-sm"
                      >
                        {/* Routine Header Bar */}
                        <div className="p-3.5 bg-zinc-900/60 border-b border-zinc-850 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-zinc-100 block truncate">
                              {routine.dayName}
                            </span>
                            <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                              Focus: {routine.focus}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 shrink-0">
                            {routine.exercises.length} Exercises
                          </span>
                        </div>

                      <div className="px-3.5 py-3 space-y-1.5">
                        {routine.exercises.map((ex, exIdx) => {
                          const def = getExercise(ex.exerciseId || ex.id || ex.name || '');
                          const videoSrc = ex.cdn_url || def.cdn_url || def.cdnUrl;
                          return (
                            <div
                              key={exIdx}
                              onClick={() => setInspectExercise(def)}
                              className="flex items-center justify-between gap-2.5 text-xs text-zinc-300 p-1.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/70 hover:border-amber-400/40 cursor-pointer transition-colors"
                              title="Click to inspect exercise video & cues"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {videoSrc && (
                                  <div className="relative w-12 h-10 sm:w-14 sm:h-11 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-750/90 shrink-0 shadow-xs flex items-center justify-center group/vid">
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
                                        setInspectExercise(def);
                                      }}
                                      title="Expand video to full screen"
                                      aria-label="Expand video to full screen"
                                      className="absolute bottom-1 right-1 p-0.5 rounded bg-black/85 hover:bg-black text-amber-400 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-400/80 shadow-xs cursor-pointer z-10 transition-all active:scale-95 flex items-center gap-0.5"
                                    >
                                      <Maximize2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-zinc-100 truncate">
                                    {exIdx + 1}. {ex.name || def.name}
                                  </div>
                                  <div className="text-[10px] text-amber-400/90 font-mono truncate">
                                    {ex.primary_muscle || def.primary_muscle || def.primaryMuscle} · {def.equipment}
                                  </div>
                                </div>
                              </div>
                              <span className="font-mono text-zinc-400 text-[11px] shrink-0 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                                {ex.defaultSets} × {ex.targetReps}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>

            {/* Modal Pinned Bottom Actions */}
            <div className="shrink-0 px-3.5 py-2.5 sm:px-6 sm:py-4 border-t border-zinc-800 bg-zinc-900 flex items-center justify-end gap-2">

              {activePlan?.id === previewPlan.id && isPlanSessionFinished(previewPlan) ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-mono bg-emerald-500/20 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Complete</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRequestRedo(previewPlan)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
                    title="Redo this workout session"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Redo Workout Session</span>
                  </button>
                </div>
              ) : previewPlan.isPro && !isUserPro ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setPricingExplainerPlan(previewPlan)}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 text-[11px] sm:text-xs font-semibold border border-zinc-700 flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
                    title="Explain pricing & Pro member benefits"
                  >
                    <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                    <span>Pricing Info</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewPlan(null);
                      if (onOpenUpgradeModal) onOpenUpgradeModal();
                    }}
                    className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-zinc-950 font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-lg"
                  >
                    <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                    <span className="sm:hidden">Unlock Pro</span>
                    <span className="hidden sm:inline">Unlock with Pro · All Plans Included</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activePlan.id === previewPlan.id) {
                      setPreviewPlan(null);
                      if (onNavigateToWorkout) {
                        onNavigateToWorkout();
                      } else if (onStartRoutine && previewPlan.routines && previewPlan.routines.length > 0) {
                        onStartRoutine(previewPlan.routines[0]);
                      }
                    } else {
                      handleRequestPlanActivation(previewPlan);
                    }
                  }}
                  className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
                  title="Start Program"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Program</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Personalized Plan Confirmation Modal */}
      {planToDeleteConfirm && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-sans"
          onClick={() => setPlanToDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 text-zinc-100 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-zinc-100">
                  Delete Personalized Plan?
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <span className="text-zinc-100 font-semibold">"{planToDeleteConfirm.title}"</span>? Once deleted, it will be removed from Personalized Plans, Custom Workouts, and active schedules across the app.
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">{planToDeleteConfirm.daysPerWeek}-Day Split</span>
                  <span>·</span>
                  <span>{planToDeleteConfirm.routines.length} Routines</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setPlanToDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePersonalizedPlan(planToDeleteConfirm)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-colors cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

        </>
      )}

      {/* Minimalistic Pricing & Pro Member Benefits Dialog */}
      {pricingExplainerPlan && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPricingExplainerPlan(null)}
        >
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92dvh] text-zinc-100 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                    Pricing & Pro Benefits
                  </h3>
                  <p className="text-xs text-zinc-400 truncate">
                    {pricingExplainerPlan.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPricingExplainerPlan(null)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
                aria-label="Close explainer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs scrollbar-thin">
              {/* Market Research Context */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-850 space-y-1.5 text-zinc-300 leading-relaxed">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Market Research & Fair Pricing
                </span>
                <p>
                  Similar science-based hypertrophy and periodization programs from top industry fitness coaches retail between <strong>$29.99 and $44.99</strong> individually.
                </p>
                <p className="text-zinc-400">
                  Individual price for <strong>{pricingExplainerPlan.title}</strong> is <strong className="text-zinc-200 font-mono">${pricingExplainerPlan.price ? pricingExplainerPlan.price.toFixed(2) : '39.99'}</strong>.
                </p>
              </div>

              {/* 2 Clear Options Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Standalone Plan */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                      Option 1: Single Plan
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono text-xl font-black text-zinc-100">
                        ${pricingExplainerPlan.price ? pricingExplainerPlan.price.toFixed(2) : '39.99'}
                      </span>
                      <span className="text-[11px] text-zinc-500">one-time</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-[11px] text-zinc-400">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>Access to {pricingExplainerPlan.title} only</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>Lifetime routine updates</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Option 2: GYMPAX PRO All Plans Included */}
                <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/40 relative flex flex-col justify-between space-y-2">
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black font-mono text-[9px] uppercase tracking-wider shadow-sm">
                    BEST VALUE
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                      Option 2: Unlock with Pro
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono text-xl font-black text-amber-400">$14.99</span>
                      <span className="text-[11px] text-zinc-300">/ mo</span>
                    </div>
                    <p className="text-[10px] font-mono text-amber-300/80 mt-0.5">
                      50% off if billed yearly ($179/yr · 12 × $14.99)
                    </p>
                    <ul className="mt-2 space-y-1 text-[11px] text-zinc-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="font-semibold text-zinc-100">ALL 15+ Pro plans included ($380+ value)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>All gym video masterclasses</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Unlimited custom builder & movements</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>50 HD physique photos vault</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPricingExplainerPlan(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setPricingExplainerPlan(null);
                  if (onOpenUpgradeModal) onOpenUpgradeModal();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Unlock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Exercise Form & Animated Figure Modal */}
      {inspectExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-zinc-100">{inspectExercise.name}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  <span>{inspectExercise.primaryMuscle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{inspectExercise.equipment}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-semibold">{inspectExercise.tier}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectExercise(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Biomechanical MP4 Video Player */}
            <AnimatedExerciseFigure
              exerciseId={inspectExercise.id}
              exerciseName={inspectExercise.name}
              primaryMuscle={inspectExercise.primaryMuscle}
              category={inspectExercise.svgIconType}
              cdnUrl={inspectExercise.cdnUrl}
              cdn_url={inspectExercise.cdn_url}
              compact={false}
            />

            <p className="text-xs text-zinc-300 leading-relaxed">
              {inspectExercise.description}
            </p>

            <div className="bg-zinc-950/70 rounded-2xl p-4 border border-zinc-800/80">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2 font-mono">
                Bodybuilding Execution Cues:
              </span>
              <ul className="space-y-2 text-xs text-zinc-300">
                {inspectExercise.cues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono font-bold shrink-0">{idx + 1}.</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setInspectExercise(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs cursor-pointer transition-colors"
            >
              Close Form Guide
            </button>
          </div>
        </div>
      )}

      {/* Warning Confirmation Popup: Current workout will be lost and new plan will be added */}
      <ReplaceWorkoutPlanWarningModal
        isOpen={!!pendingPlanToConfirm}
        currentPlan={activePlan}
        newPlan={pendingPlanToConfirm}
        onAccept={handleConfirmPlanActivation}
        onDecline={handleDeclinePlanActivation}
      />

      {/* Redo Workout Warning Confirmation Popup */}
      <RedoWorkoutWarningModal
        isOpen={!!redoPlanToConfirm}
        plan={redoPlanToConfirm}
        onContinue={handleConfirmRedo}
        onDiscard={handleDiscardRedo}
      />

      {/* Custom Workout Program Builder */}
      {showCustomBuilder && (
        <CustomWorkoutBuilderModal
          isOpen={showCustomBuilder}
          onClose={() => setShowCustomBuilder(false)}
          onSaveProgram={handleSaveCustomProgramAsPlan}
          subscription={subscription}
          currentWorkoutsCount={createdPersonalizedPlansCount}
          onOpenUpgradeModal={() => {
            setShowCustomBuilder(false);
            setShowLimitExplanationModal(true);
          }}
        />
      )}

      {/* Share Personalized Plan Modal */}
      <SharePersonalizedPlanModal
        plan={planToShare}
        isOpen={!!planToShare}
        onClose={() => setPlanToShare(null)}
        subscription={subscription}
        onPlanShared={(sharedPlan, targetNames) => {
          setPlanCreatedBanner(`"${sharedPlan.title}" shared with ${targetNames.join(', ')}!`);
          setTimeout(() => setPlanCreatedBanner(null), 5000);
        }}
      />

      {/* Free Personal Programs Limit Explanation Popup Modal */}
      {showLimitExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border border-amber-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowLimitExplanationModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Icon */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Crown className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  5 Personal Programs Limit Reached ({createdPersonalizedPlansCount}/{MAX_FREE_PERSONALIZED_PLANS} Programs)
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 leading-tight mt-0.5">
                  Upgrade to Pro Member to Save Unlimited Programs
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  A user is only allowed to have <strong>{MAX_FREE_PERSONALIZED_PLANS} personal programs</strong>, developed by yourself or downloaded from other users. You currently have <strong>{createdPersonalizedPlansCount} of {MAX_FREE_PERSONALIZED_PLANS} personal programs</strong> saved.
                </p>
              </div>
            </div>

            {/* Explanation of why upgrade is needed */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="font-bold text-amber-400 text-xs">
                  Personal Program Limit Reached ({MAX_FREE_PERSONALIZED_PLANS} Programs Max)
                </p>
              </div>
              <p className="text-[12px] text-zinc-300 leading-relaxed">
                Free accounts can store up to <strong>{MAX_FREE_PERSONALIZED_PLANS} personal workout programs in total</strong>—combining programs you develop yourself and routines downloaded from other community athletes. Upgrade to <strong>Pro Member</strong> to create and download unlimited workout programs:
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-100 text-xs">Save Unlimited Personal & Downloaded Programs</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Develop your own splits or download unlimited routines from community lifters with zero storage limits.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-100 text-xs">Pro Hypertrophy Architect & Periodization</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Automated mechanical tension calibration, lagging weakpoint volume curves, and proactive deloads.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-100 text-xs">Full 1,600+ Exercise Library Access</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Explore 13 muscle groups, custom superset pairing, and equipment variations without restrictions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Take user to Upgrade page */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowLimitExplanationModal(false);
                  if (onOpenUpgradeModal) {
                    onOpenUpgradeModal();
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-current shrink-0" />
                <span>Upgrade to Pro Member — Save Unlimited Programs</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLimitExplanationModal(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
