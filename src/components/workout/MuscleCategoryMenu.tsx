import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MUSCLE_MONSTER_CATEGORIES,
  MuscleMonsterCategory,
  MuscleDivision,
  MODEL_PICTURES
} from '../../data/fitnessModelPictures';
import { EXERCISE_DATABASE } from '../../data/exercises';
import {
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Dumbbell,
  Award,
  Trash2,
  Plus,
  Lock,
  Share2,
  CheckCircle2,
  Search,
  Filter,
  Maximize2,
  Layers,
  Activity
} from 'lucide-react';
import {
  WorkoutExercise,
  MuscleGroup,
  Equipment,
  EquipmentEnvironment,
  ExerciseDefinition,
  UserSubscription
} from '../../types';
import { FitnessModelPicture } from '../common/FitnessModelPicture';
import { ExerciseInfoTooltip } from '../common/ExerciseInfoTooltip';
import { getSubstituteExercise, isExerciseAllowed, EQUIPMENT_ENVIRONMENTS } from '../../data/equipmentEnvironments';
import { getCustomExercises, deleteCustomExercise, MAX_FREE_CUSTOM_EXERCISES } from '../../utils/storage';
import { CreateCustomExerciseModal } from './CreateCustomExerciseModal';
import { ShareCustomExerciseModal } from './ShareCustomExerciseModal';

interface MuscleCategoryMenuProps {
  onStartCustomWithExercises: (title: string, exercises: WorkoutExercise[]) => void;
  onFilterLibraryByMuscle?: (muscle: string) => void;
  currentEnvironment?: EquipmentEnvironment;
  subscription?: UserSubscription;
  onOpenUpgradeModal?: () => void;
}

export function doesExerciseMatchCategory(ex: ExerciseDefinition, categoryMuscle: string): boolean {
  if (categoryMuscle === 'Custom') {
    return !!ex.isCustom;
  }
  const normCat = categoryMuscle.toLowerCase().trim();
  const normPrim = (ex.primaryMuscle || '').toLowerCase().trim();
  const normRaw = (ex.rawPrimaryMuscle || '').toLowerCase().trim();
  const normPm = (ex.primary_muscle || '').toLowerCase().trim();

  if (normCat === normPrim || normCat === normRaw || normCat === normPm) {
    return true;
  }
  // Core / Abs variations
  if (
    (normCat === 'core' || normCat === 'abs & core' || normCat === 'abs') &&
    (normPrim === 'abs & core' || normRaw.includes('waist') || normRaw.includes('abs') || normPm.includes('core'))
  ) {
    return true;
  }
  // Full Body
  if (
    normCat === 'full body' &&
    (normPrim === 'full body' || normRaw.includes('full body') || normPm.includes('full body'))
  ) {
    return true;
  }
  // Cardio
  if (
    normCat === 'cardio' &&
    (normPrim === 'cardio' || normRaw.includes('cardio') || normPm.includes('cardio'))
  ) {
    return true;
  }
  return false;
}

const DIVISION_CONFIG: {
  id: MuscleDivision | 'all';
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: 'all',
    label: 'All Muscles',
    shortLabel: 'All',
    description: '13 Muscle Groups & 1,607 Core Catalog Exercises'
  },
  {
    id: 'upper_push',
    label: 'Upper Body — Push',
    shortLabel: 'Upper Push',
    description: 'Chest, Shoulders & Triceps'
  },
  {
    id: 'upper_pull',
    label: 'Upper Body — Pull',
    shortLabel: 'Upper Pull',
    description: 'Back, Biceps & Forearms'
  },
  {
    id: 'lower_body',
    label: 'Lower Body',
    shortLabel: 'Lower Body',
    description: 'Quads, Hamstrings, Glutes & Calves'
  },
  {
    id: 'core_conditioning',
    label: 'Core & Conditioning',
    shortLabel: 'Core / Full',
    description: 'Abs & Core, Full Body & Cardio'
  },
  {
    id: 'custom',
    label: 'Personal Protocols',
    shortLabel: 'Custom',
    description: 'Your Handcrafted Exercises'
  }
];

export const MuscleCategoryMenu: React.FC<MuscleCategoryMenuProps> = ({
  onStartCustomWithExercises,
  onFilterLibraryByMuscle,
  currentEnvironment = 'commercial_gym',
  subscription,
  onOpenUpgradeModal
}) => {
  const isPro = !!subscription?.isPro;
  const [selectedDivision, setSelectedDivision] = useState<MuscleDivision | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<MuscleMonsterCategory | null>(null);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>(() => getCustomExercises());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [sharingExercise, setSharingExercise] = useState<ExerciseDefinition | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [modalEquipmentFilter, setModalEquipmentFilter] = useState<string>('All');
  const [inspectVideoItem, setInspectVideoItem] = useState<{ name: string; videoSrc: string; muscle: string } | null>(null);

  const isAtCustomLimit = !isPro && customExercises.length >= MAX_FREE_CUSTOM_EXERCISES;
  const muscleCardsScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollMuscleCards = (direction: 'left' | 'right') => {
    if (!muscleCardsScrollRef.current) return;
    muscleCardsScrollRef.current.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleSync = () => {
      setCustomExercises(getCustomExercises());
    };
    window.addEventListener('gympax:exercises-updated', handleSync);
    return () => window.removeEventListener('gympax:exercises-updated', handleSync);
  }, []);

  const getCategoryCustomExercises = (categoryMuscle: string): ExerciseDefinition[] => {
    if (categoryMuscle === 'Custom') {
      return customExercises;
    }
    return customExercises.filter(ex => doesExerciseMatchCategory(ex, categoryMuscle));
  };

  // Computes the comprehensive list of exercises for a category from EXERCISE_DATABASE
  const categoryExerciseMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cat of MUSCLE_MONSTER_CATEGORIES) {
      if (cat.muscle === 'Custom' || cat.id === 'category_custom') {
        map.set(cat.id, customExercises.map(e => e.id));
        continue;
      }
      const customForCat = customExercises.filter(ex => doesExerciseMatchCategory(ex, cat.muscle)).map(e => e.id);
      const featuredIds = cat.exerciseIds.filter(id => !customForCat.includes(id));
      const seen = new Set<string>([...customForCat, ...featuredIds]);
      const gympaxMatches = EXERCISE_DATABASE.filter(
        ex => !seen.has(ex.id) && doesExerciseMatchCategory(ex, cat.muscle)
      ).map(ex => ex.id);

      map.set(cat.id, [...customForCat, ...featuredIds, ...gympaxMatches]);
    }
    return map;
  }, [customExercises]);

  const getCategoryExerciseIds = (category: MuscleMonsterCategory): string[] => {
    return categoryExerciseMap.get(category.id) || [];
  };

  const getAdaptedExercise = (exId: string): ExerciseDefinition => {
    const customMatch = customExercises.find(e => e.id === exId);
    if (customMatch) return customMatch;
    const directMatch = EXERCISE_DATABASE.find(e => e.id === exId);
    if (directMatch && isExerciseAllowed(directMatch, currentEnvironment)) {
      return directMatch;
    }
    return getSubstituteExercise(exId, currentEnvironment);
  };

  const handleOpenCategory = (cat: MuscleMonsterCategory) => {
    setSelectedCategory(cat);
    setSelectedExerciseIds([]);
    setModalSearchQuery('');
    setModalEquipmentFilter('All');
  };

  const handleToggleExerciseSelection = (exId: string) => {
    setSelectedExerciseIds(prev =>
      prev.includes(exId) ? prev.filter(id => id !== exId) : [...prev, exId]
    );
  };

  const handleLaunchCategoryWorkout = (category: MuscleMonsterCategory, overrideExIds?: string[]) => {
    const isTravel = currentEnvironment === 'bodyweight_travel';
    const isDumbbell = currentEnvironment === 'dumbbell_only';
    const categoryIds = getCategoryExerciseIds(category);
    const chosenIds =
      overrideExIds && overrideExIds.length > 0
        ? overrideExIds
        : selectedExerciseIds.length > 0
        ? categoryIds.filter(id => selectedExerciseIds.includes(id))
        : categoryIds.slice(0, 5);
    const allIds = chosenIds.length > 0 ? chosenIds : categoryIds.slice(0, 5);

    const routineExercises: WorkoutExercise[] = allIds.map((origExId, idx) => {
      const def = getAdaptedExercise(origExId);
      const targetMuscle: MuscleGroup =
        (def?.primaryMuscle as MuscleGroup) ||
        (category.muscle === 'Abs & Core' ? 'Abs & Core' : (category.muscle as MuscleGroup)) ||
        'Chest';
      const equipment: Equipment = (def?.equipment as Equipment) || (isTravel ? 'Bodyweight' : 'Dumbbell');

      const defaultWeightKg = isTravel || equipment === 'Bodyweight' ? 0 : isDumbbell ? 16 : 50;
      const defaultWeightLbs = isTravel || equipment === 'Bodyweight' ? 0 : isDumbbell ? 35 : 110;
      const reps = isTravel || equipment === 'Bodyweight' ? 16 : isDumbbell ? 10 : 8;

      return {
        id: `we_${Date.now()}_${idx}`,
        exerciseId: def.id,
        name: def?.name || def.id,
        targetMuscle,
        rawPrimaryMuscle: def?.rawPrimaryMuscle,
        secondaryMuscles: def?.secondaryMuscles,
        equipment,
        cdnUrl: def?.cdnUrl,
        cdn_url: def?.cdnUrl,
        notes: def?.description || '',
        sets: [
          {
            id: `s_${Date.now()}_${idx}_1`,
            setNumber: 1,
            type: isTravel || equipment === 'Bodyweight' ? 'normal' : 'warmup',
            weightKg: defaultWeightKg,
            weightLbs: defaultWeightLbs,
            reps: reps + 2,
            completed: false
          },
          {
            id: `s_${Date.now()}_${idx}_2`,
            setNumber: 2,
            type: 'normal',
            weightKg: isTravel || equipment === 'Bodyweight' ? 0 : defaultWeightKg + 5,
            weightLbs: isTravel || equipment === 'Bodyweight' ? 0 : defaultWeightLbs + 10,
            reps: reps,
            completed: false
          },
          {
            id: `s_${Date.now()}_${idx}_3`,
            setNumber: 3,
            type: 'normal',
            weightKg: isTravel || equipment === 'Bodyweight' ? 0 : defaultWeightKg + 10,
            weightLbs: isTravel || equipment === 'Bodyweight' ? 0 : defaultWeightLbs + 20,
            reps: Math.max(reps - 2, 6),
            completed: false
          }
        ],
        restSeconds: isTravel ? 60 : 90
      };
    });

    const isCustomCat = category.muscle === 'Custom' || category.id === 'category_custom';
    const envName = EQUIPMENT_ENVIRONMENTS[currentEnvironment]?.shortTitle || '';
    const sessionTitle =
      routineExercises.length === 1
        ? `${routineExercises[0].name} (${isCustomCat ? 'Custom' : category.muscle} Session)`
        : isCustomCat
        ? `Custom Exercises${envName ? ` [${envName}]` : ''} Session`
        : `${category.title}${envName ? ` [${envName}]` : ''} Session`;

    onStartCustomWithExercises(sessionTitle, routineExercises);
    setSelectedCategory(null);
    setSelectedExerciseIds([]);
  };

  const activeCategoryIds = selectedCategory ? getCategoryExerciseIds(selectedCategory) : [];
  const effectiveSelectedIds =
    selectedExerciseIds.length > 0
      ? activeCategoryIds.filter(id => selectedExerciseIds.includes(id))
      : activeCategoryIds;
  const singleSelectedDef =
    effectiveSelectedIds.length === 1 ? getAdaptedExercise(effectiveSelectedIds[0]) : null;

  // Filtered exercises within the active category modal
  const modalFilteredExerciseIds = useMemo(() => {
    if (!selectedCategory) return [];
    const q = modalSearchQuery.toLowerCase().trim();
    return activeCategoryIds.filter(exId => {
      const def = getAdaptedExercise(exId);
      if (!def) return false;
      const matchesSearch =
        !q ||
        def.name.toLowerCase().includes(q) ||
        def.primaryMuscle.toLowerCase().includes(q) ||
        (def.rawPrimaryMuscle && def.rawPrimaryMuscle.toLowerCase().includes(q)) ||
        def.equipment.toLowerCase().includes(q);
      const matchesEquipment =
        modalEquipmentFilter === 'All' || def.equipment === modalEquipmentFilter;
      return matchesSearch && matchesEquipment;
    });
  }, [selectedCategory, activeCategoryIds, modalSearchQuery, modalEquipmentFilter]);

  // Total exercises count across all catalog categories
  const totalCatalogExercises = useMemo(() => {
    return MUSCLE_MONSTER_CATEGORIES.reduce((acc, cat) => {
      if (cat.id === 'category_custom') return acc;
      return acc + (categoryExerciseMap.get(cat.id)?.length || cat.countHint || 0);
    }, 0);
  }, [categoryExerciseMap]);

  // Group categories by division for clear layout
  const displayedCategories = useMemo(() => {
    if (selectedDivision === 'all') return MUSCLE_MONSTER_CATEGORIES;
    return MUSCLE_MONSTER_CATEGORIES.filter(cat => cat.division === selectedDivision);
  }, [selectedDivision]);

  // Calculate division subtotals
  const divisionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: totalCatalogExercises };
    for (const cat of MUSCLE_MONSTER_CATEGORIES) {
      const count = categoryExerciseMap.get(cat.id)?.length || cat.countHint || 0;
      counts[cat.division] = (counts[cat.division] || 0) + count;
    }
    counts['custom'] = customExercises.length;
    return counts;
  }, [categoryExerciseMap, totalCatalogExercises, customExercises]);

  return (
    <div className="space-y-3.5 w-full min-w-0">
      {/* 1. Header with Stats & Anatomical Breakdown summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="space-y-0.5 min-w-0">
          <h2 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight flex items-center gap-2">
            <span>Explore Workouts by Muscle Group</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700/80 font-bold">
              {totalCatalogExercises.toLocaleString()} Core Lifts
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex sm:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => scrollMuscleCards('left')}
              aria-label="Scroll muscle groups left"
              className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollMuscleCards('right')}
              aria-label="Scroll muscle groups right"
              className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            13 Muscles · 5 Divisions
          </span>
        </div>
      </div>

      {/* 2. Focused Target Element: Muscle Group Selector & Comprehensive Grouped Cards Container */}
      <div className="space-y-3.5">
        {/* Anatomical Division Filter Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 touch-pan-x snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1 scroll-smooth">
          {DIVISION_CONFIG.map(div => {
            const count = divisionCounts[div.id] ?? 0;
            const isActive = selectedDivision === div.id;
            return (
              <button
                key={div.id}
                type="button"
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setSelectedDivision(div.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 snap-center snap-always ${
                  isActive
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm shadow-amber-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-850'
                }`}
                title={div.description}
              >
                <span>{div.shortLabel}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-zinc-950/20 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Muscle Group Visual Cards Grid Container (Horizontally scrollable on mobile, structured grid on desktop) */}
        <div
          ref={muscleCardsScrollRef}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex flex-nowrap sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 touch-pan-x scroll-smooth overscroll-x-contain scrollbar-none w-full max-w-full snap-x snap-mandatory px-8 sm:px-0 scroll-px-8 sm:scroll-px-0"
        >
          {displayedCategories.map(cat => {
            const svgMarkup = MODEL_PICTURES[cat.pictureKey];
            const hasImgError = failedImages[cat.id];
            const catCustomCount = getCategoryCustomExercises(cat.muscle).length;
            const totalLiftCount = categoryExerciseMap.get(cat.id)?.length || cat.countHint || 0;
            const isCustomCard = cat.id === 'category_custom' || cat.muscle === 'Custom';
            return (
              <div
                key={cat.id}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  handleOpenCategory(cat);
                }}
                className="group relative min-w-[170px] w-[170px] sm:w-auto sm:min-w-0 shrink-0 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 snap-center snap-always"
              >
                {/* Top Fitness Model Workout Visual */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 mb-2">
                  {!hasImgError ? (
                    <img
                      src={cat.photoUrl}
                      alt={`${cat.title} real human model workout`}
                      referrerPolicy="no-referrer"
                      onError={() => setFailedImages(prev => ({ ...prev, [cat.id]: true }))}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                      dangerouslySetInnerHTML={{ __html: svgMarkup }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Muscle Tag Badge */}
                  <span
                    className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[9.5px] font-black uppercase font-mono tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: `${cat.accentColor}dd` }}
                  >
                    {cat.muscle}
                  </span>

                  {/* Division Badge (Top Left) */}
                  {cat.divisionLabel && !isCustomCard && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8px] font-mono text-zinc-300 uppercase tracking-tight border border-white/10">
                      {cat.division === 'upper_push' ? 'Push' : cat.division === 'upper_pull' ? 'Pull' : cat.division === 'lower_body' ? 'Lower' : 'Core'}
                    </span>
                  )}

                  {/* Custom Badges (Top Right) */}
                  {isCustomCard ? (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 text-[8.5px] font-black uppercase font-mono shadow-sm">
                      {customExercises.length} Custom
                    </span>
                  ) : catCustomCount > 0 ? (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 text-[8.5px] font-black uppercase font-mono shadow-sm">
                      +{catCustomCount} Custom
                    </span>
                  ) : null}
                </div>

                {/* Title & Exercise count */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-xs text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                      {cat.title}
                    </h3>
                  </div>

                  {cat.subtitle && (
                    <p className="text-[10px] text-zinc-400 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  )}

                  <p className="text-[10.5px] text-amber-400 font-mono font-bold">
                    {isCustomCard
                      ? `${customExercises.length} Custom ${customExercises.length === 1 ? 'Exercise' : 'Exercises'}`
                      : `${totalLiftCount.toLocaleString()} Core Lifts${catCustomCount > 0 ? ` (+${catCustomCount} Custom)` : ''}`}
                  </p>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-amber-400 transition-colors">
                  <span className="font-semibold">Quick View & Videos</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Category Inspector & Video Launcher Modal */}
      {selectedCategory && (
        <div
          onClick={() => {
            setSelectedCategory(null);
            setSelectedExerciseIds([]);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] flex flex-col"
          >
            {/* Header with Athlete Picture Artwork */}
            <div className="relative -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 h-40 sm:h-44 bg-zinc-950 overflow-hidden border-b border-zinc-800 shrink-0">
              {!failedImages[selectedCategory.id] ? (
                <img
                  src={selectedCategory.photoUrl}
                  alt={`${selectedCategory.title} real athlete`}
                  referrerPolicy="no-referrer"
                  onError={() => setFailedImages(prev => ({ ...prev, [selectedCategory.id]: true }))}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: MODEL_PICTURES[selectedCategory.pictureKey] }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />

              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedExerciseIds([]);
                }}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-zinc-400 hover:text-zinc-100 backdrop-blur-sm border border-zinc-700/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-black font-mono shadow-sm"
                      style={{ backgroundColor: selectedCategory.accentColor }}
                    >
                      {selectedCategory.badge}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-950/70 border border-zinc-700 text-zinc-300">
                      {selectedCategory.divisionLabel}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-100 mt-1">
                    {selectedCategory.title}
                  </h3>
                  {selectedCategory.subtitle && (
                    <p className="text-xs text-zinc-300 font-medium">
                      {selectedCategory.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick search and filter bar inside category modal */}
            <div className="space-y-2 shrink-0">
              <div className="flex items-center justify-between gap-2 text-xs">
                <p className="text-zinc-300 text-xs line-clamp-1">
                  {selectedCategory.tagline}
                </p>
                <span className="text-amber-400 font-mono font-bold shrink-0">
                  {activeCategoryIds.length} Movements
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search within ${selectedCategory.muscle} exercises...`}
                    value={modalSearchQuery}
                    onChange={e => setModalSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={modalEquipmentFilter}
                  onChange={e => setModalEquipmentFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-400"
                >
                  <option value="All">All Gear</option>
                  <option value="Barbell">Barbell</option>
                  <option value="Dumbbell">Dumbbell</option>
                  <option value="Cable">Cable</option>
                  <option value="Machine">Machine</option>
                  <option value="Bodyweight">Bodyweight</option>
                  <option value="Smith Machine">Smith Machine</option>
                </select>
              </div>
            </div>

            {/* Exercises List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                  Available Exercises ({modalFilteredExerciseIds.length}):
                </span>
                {selectedExerciseIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedExerciseIds([])}
                    className="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Clear Selection ({selectedExerciseIds.length})
                  </button>
                )}
              </div>

              {modalFilteredExerciseIds.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 space-y-3">
                  <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    No movements match "{modalSearchQuery}" under this gear filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {modalFilteredExerciseIds.map(exId => {
                    const def = getAdaptedExercise(exId);
                    if (!def) return null;
                    const isSpecificallySelected = selectedExerciseIds.includes(exId);
                    const videoSrc = def.cdnUrl || def.cdn_url || '';

                    return (
                      <div
                        key={exId}
                        onClick={() => handleToggleExerciseSelection(exId)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSpecificallySelected
                            ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400/30'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {/* Video / Fitness Model Visual */}
                        <div
                          onClick={e => {
                            if (videoSrc) {
                              e.stopPropagation();
                              setInspectVideoItem({
                                name: def.name,
                                videoSrc,
                                muscle: def.primaryMuscle
                              });
                            }
                          }}
                          className="relative w-14 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 group/thumb cursor-pointer"
                          title={videoSrc ? 'Click to preview exercise video' : ''}
                        >
                          {videoSrc ? (
                            <>
                              <video
                                src={videoSrc}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                                <Maximize2 className="w-3 h-3 text-white/90 drop-shadow-md" />
                              </div>
                            </>
                          ) : (
                            <FitnessModelPicture
                              exerciseId={def.id}
                              exerciseName={def.name}
                              primaryMuscle={def.primaryMuscle}
                              cdnUrl={def.cdnUrl}
                              aspect="wide"
                              showZoom={false}
                              imageUrl={def.imageUrl || (def.images && def.images[0])}
                            />
                          )}
                        </div>

                        {/* Title & Specs */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-xs text-zinc-100 truncate">{def.name}</h4>
                            {def.isCustom && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                                Custom
                              </span>
                            )}
                            {isSpecificallySelected && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400 text-zinc-950 uppercase">
                                Selected
                              </span>
                            )}
                            <ExerciseInfoTooltip
                              exerciseId={def.id}
                              exerciseName={def.name}
                              size="xs"
                            />
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                            <span className="text-amber-300/90 font-medium">
                              {def.rawPrimaryMuscle && def.rawPrimaryMuscle !== def.primaryMuscle
                                ? `${def.rawPrimaryMuscle} (${def.primaryMuscle})`
                                : def.primaryMuscle}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{def.equipment}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-400">{def.tier}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {def.isCustom && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setSharingExercise(def);
                              }}
                              title={`Share custom exercise "${def.name}" with friends in community`}
                              aria-label={`Share ${def.name}`}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-850 transition-colors cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {def.isCustom && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                const updated = deleteCustomExercise(def.id);
                                setCustomExercises(updated);
                                setSelectedExerciseIds(prev => prev.filter(id => id !== exId));
                              }}
                              title="Delete custom exercise"
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom CTA Controls */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-800 shrink-0">
              <button
                disabled={activeCategoryIds.length === 0}
                onClick={() => handleLaunchCategoryWorkout(selectedCategory)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md ${
                  activeCategoryIds.length === 0
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                    : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer shadow-amber-500/20'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {singleSelectedDef
                    ? `Launch ${singleSelectedDef.name}`
                    : selectedExerciseIds.length > 1
                    ? `Launch Selected (${selectedExerciseIds.length} Movements)`
                    : `Launch ${selectedCategory.muscle} Session (5 Movements)`}
                </span>
              </button>

              {onFilterLibraryByMuscle && (
                <button
                  onClick={() => {
                    onFilterLibraryByMuscle(selectedCategory.muscle);
                    setSelectedCategory(null);
                    setSelectedExerciseIds([]);
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                >
                  View All in Library
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Inspect Full-Screen Modal */}
      {inspectVideoItem && (
        <div
          onClick={() => setInspectVideoItem(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">{inspectVideoItem.name}</h3>
                <span className="text-[10px] font-mono text-amber-400">{inspectVideoItem.muscle} Target</span>
              </div>
              <button
                onClick={() => setInspectVideoItem(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
              <video
                src={inspectVideoItem.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Exercise Modal */}
      {showCreateModal && (
        <CreateCustomExerciseModal
          onClose={() => setShowCreateModal(false)}
          onExerciseCreated={() => {
            const updated = getCustomExercises();
            setCustomExercises(updated);
            setShowCreateModal(false);
          }}
          currentEnvironment={currentEnvironment}
          subscription={subscription}
          onOpenUpgradeModal={onOpenUpgradeModal}
        />
      )}

      {/* Share Custom Exercise with Community Friends Modal */}
      {sharingExercise && (
        <ShareCustomExerciseModal
          isOpen={!!sharingExercise}
          exercise={sharingExercise}
          onClose={() => setSharingExercise(null)}
          subscription={subscription}
          onExerciseShared={(ex, friends) => {
            setToastNotice(`Shared "${ex.name}" with ${friends.join(', ')}!`);
            setTimeout(() => setToastNotice(null), 3500);
          }}
        />
      )}

      {/* Floating Feedback Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-60 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-amber-400/60 text-zinc-100 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}
    </div>
  );
};
