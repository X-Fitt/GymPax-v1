import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Filter, Dumbbell, Info, Plus, Check, Trash2, Lock, Share2, CheckCircle2, Film, ChevronDown } from 'lucide-react';
import { EXERCISE_DATABASE, MUSCLE_GROUPS, resolveCatalogExercise } from '../../data/exercises';
import { ExerciseDefinition, MuscleGroup, Equipment, EquipmentEnvironment, UserSubscription } from '../../types';
import { EQUIPMENT_ENVIRONMENTS } from '../../data/equipmentEnvironments';
import { ExerciseInfoTooltip } from '../common/ExerciseInfoTooltip';
import { getCustomExercises, deleteCustomExercise, MAX_FREE_CUSTOM_EXERCISES } from '../../utils/storage';
import { CreateCustomExerciseModal } from './CreateCustomExerciseModal';
import { ShareCustomExerciseModal } from './ShareCustomExerciseModal';

export type GearFilterType =
  | 'commercial_gym'
  | 'home_gym'
  | 'barbell'
  | 'bodyweight'
  | 'kettlebell'
  | 'dumbbell'
  | 'free_weights'
  | 'cable_machine'
  | 'stretch';

export interface GearFilterOption {
  id: GearFilterType;
  label: string;
  emoji: string;
  description: string;
}

export const GEAR_FILTER_OPTIONS: GearFilterOption[] = [
  { id: 'commercial_gym', label: 'Commercial Gym', emoji: '🏋️', description: 'All commercial equipment & machines' },
  { id: 'home_gym', label: 'Home Gym', emoji: '🏠', description: 'Barbells, dumbbells, kettlebells & bodyweight' },
  { id: 'barbell', label: 'Barbell', emoji: '🏋️‍♂️', description: 'Olympic & standard barbell compound movements' },
  { id: 'bodyweight', label: 'Body Weight', emoji: '🤸', description: 'Calisthenics & bodyweight movements' },
  { id: 'kettlebell', label: 'Kettle Bells', emoji: '🔔', description: 'Kettlebell swings, snatches & presses' },
  { id: 'dumbbell', label: 'Dumbbell', emoji: '🦾', description: 'Dumbbell exercises & isolations' },
  { id: 'free_weights', label: 'Free Weights', emoji: '⚖️', description: 'Barbells, dumbbells & kettlebells' },
  { id: 'cable_machine', label: 'Cable machine', emoji: '🔌', description: 'Cable crossovers, pulldowns & attachments' },
  { id: 'stretch', label: 'Stretch', emoji: '🧘', description: 'Flexibility, mobility & stretching drills' },
];

export const matchesGearFilter = (ex: ExerciseDefinition, gear: GearFilterType): boolean => {
  if (gear === 'commercial_gym') return true;

  const nameLower = (ex.name || '').toLowerCase();
  const descLower = (ex.description || '').toLowerCase();
  const catLower = (ex.category || '').toLowerCase();
  const eq = ex.equipment;

  switch (gear) {
    case 'home_gym':
      return (
        ['Barbell', 'Dumbbell', 'Kettlebell', 'Bodyweight', 'Weighted'].includes(eq) &&
        !eq.includes('Machine') &&
        !eq.includes('Cable') &&
        !nameLower.includes('smith')
      );
    case 'barbell':
      return (
        eq === 'Barbell' ||
        nameLower.includes('barbell') ||
        nameLower.includes('olympic bar')
      );
    case 'bodyweight':
      return (
        eq === 'Bodyweight' ||
        nameLower.includes('bodyweight') ||
        catLower.includes('calisthenic')
      );
    case 'kettlebell':
      return (
        eq === 'Kettlebell' ||
        nameLower.includes('kettlebell') ||
        nameLower.includes('kettle bell')
      );
    case 'dumbbell':
      return (
        eq === 'Dumbbell' ||
        nameLower.includes('dumbbell') ||
        nameLower.includes('dumbell')
      );
    case 'free_weights':
      return (
        ['Barbell', 'Dumbbell', 'Kettlebell', 'Weighted'].includes(eq) &&
        eq !== 'Machine' &&
        eq !== 'Cable' &&
        eq !== 'Smith Machine'
      );
    case 'cable_machine':
      return (
        eq === 'Cable' ||
        nameLower.includes('cable') ||
        nameLower.includes('pulley') ||
        nameLower.includes('crossover')
      );
    case 'stretch':
      return (
        nameLower.includes('stretch') ||
        descLower.includes('stretch') ||
        catLower.includes('stretch') ||
        catLower.includes('mobility') ||
        catLower.includes('flexibility')
      );
    default:
      return true;
  }
};

interface ExerciseLibraryModalProps {
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDefinition) => void;
  selectedExerciseIds?: string[];
  currentEnvironment?: EquipmentEnvironment;
  subscription?: UserSubscription;
  onOpenUpgradeModal?: () => void;
  initialMuscle?: MuscleGroup | 'All' | 'Custom';
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  onClose,
  onSelectExercise,
  selectedExerciseIds = [],
  currentEnvironment = 'commercial_gym',
  subscription,
  onOpenUpgradeModal,
  initialMuscle = 'All'
}) => {
  const isPro = !!subscription?.isPro;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'All'>('All');
  const [selectedGear, setSelectedGear] = useState<GearFilterType>('commercial_gym');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [sharingExercise, setSharingExercise] = useState<ExerciseDefinition | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [customList, setCustomList] = useState<ExerciseDefinition[]>(() => getCustomExercises());
  const isAtCustomLimit = !isPro && customList.length >= MAX_FREE_CUSTOM_EXERCISES;
  const [onlyCustom, setOnlyCustom] = useState<boolean>(false);
  const [visibleLimit, setVisibleLimit] = useState<number>(60);
  const [failedVideoIds, setFailedVideoIds] = useState<Record<string, boolean>>({});

  // By default, when opening the Gym Exercise Database, show all muscles and Commercial Gym as default
  useEffect(() => {
    setSelectedMuscle('All');
    setSelectedGear('commercial_gym');
    setOnlyCustom(false);
  }, []);

  const getExerciseVideoUrl = (ex: ExerciseDefinition): string => {
    if (ex.cdnUrl) return ex.cdnUrl;
    if (ex.cdn_url) return ex.cdn_url;
    const resolved = resolveCatalogExercise(ex.id || ex.name, ex.primaryMuscle);
    return resolved?.cdnUrl || resolved?.cdn_url || '';
  };

  useEffect(() => {
    const handleSync = () => {
      setCustomList(getCustomExercises());
    };
    window.addEventListener('gympax:exercises-updated', handleSync);
    return () => window.removeEventListener('gympax:exercises-updated', handleSync);
  }, []);

  useEffect(() => {
    if (customList.length === 0 && onlyCustom) {
      setOnlyCustom(false);
    }
  }, [customList.length, onlyCustom]);

  useEffect(() => {
    setVisibleLimit(60);
  }, [searchQuery, selectedMuscle, selectedEquipment, selectedGear, onlyCustom]);

  const envConfig = EQUIPMENT_ENVIRONMENTS[currentEnvironment];
  const currentGearOption = GEAR_FILTER_OPTIONS.find(opt => opt.id === selectedGear) || GEAR_FILTER_OPTIONS[0];

  const isRealExercise = (ex: ExerciseDefinition) => {
    const n = (ex.name || '').toLowerCase();
    const id = (ex.id || '').toLowerCase();
    const pm = (ex.primaryMuscle || ex.rawPrimaryMuscle || '').toLowerCase();
    return (
      !n.includes('video') &&
      !n.includes('reel') &&
      !n.includes('enhance') &&
      !id.includes('video') &&
      !id.includes('reel') &&
      !id.includes('enhance') &&
      !pm.includes('reel') &&
      !pm.includes('video')
    );
  };

  const customIds = new Set(customList.map(c => c.id));
  const allAvailableExercises = [
    ...customList.filter(isRealExercise),
    ...EXERCISE_DATABASE.filter(e => !customIds.has(e.id) && isRealExercise(e))
  ];

  const filteredExercises = allAvailableExercises.filter(ex => {
    // Only show custom exercises when button gets pushed (onlyCustom active)
    if (onlyCustom && !ex.isCustom) return false;
    if (!onlyCustom && ex.isCustom) return false;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.primaryMuscle.toLowerCase().includes(q) ||
      (ex.rawPrimaryMuscle && ex.rawPrimaryMuscle.toLowerCase().includes(q)) ||
      (ex.category && ex.category.toLowerCase().includes(q)) ||
      ex.equipment.toLowerCase().includes(q);
    const matchesMuscle =
      selectedMuscle === 'All' ||
      ex.primaryMuscle === selectedMuscle ||
      (ex.rawPrimaryMuscle && ex.rawPrimaryMuscle.toLowerCase() === selectedMuscle.toLowerCase());
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
    const matchesGear = matchesGearFilter(ex, selectedGear);
    return matchesSearch && matchesMuscle && matchesEquipment && matchesGear;
  });

  const displayedExercises = filteredExercises.slice(0, visibleLimit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Header - Compact & Minimalistic */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-zinc-800 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-zinc-100 truncate">
                Gym Exercise Database
              </h3>
            </div>
            {/* Add Exercise button placed directly underneath Gym Exercise Database */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isAtCustomLimit && onOpenUpgradeModal) {
                    onOpenUpgradeModal();
                    return;
                  }
                  setShowCreateModal(true);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shadow-xs ${
                  isAtCustomLimit
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                }`}
                title="Add a custom exercise"
              >
                {isAtCustomLimit ? (
                  <>
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                    <span>Add Exercise (Pro)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Add Exercise</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center shrink-0">
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 pb-2 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercise, target muscle (e.g. Chest, Upper Arms, Thighs, Waist)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/80 transition-colors"
            />
          </div>

          {/* Quick Equipment Filter & Muscle Group Filter - Clean matching dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Gym Setup Dropdown (Commercial Gym default) */}
            <div className="relative inline-flex items-center">
              <label htmlFor="gear-filter-select" className="sr-only">Gym Setup Filter</label>
              <select
                id="gear-filter-select"
                value={selectedGear}
                onChange={e => setSelectedGear(e.target.value as GearFilterType)}
                className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg font-bold text-xs cursor-pointer border transition-all ${
                  selectedGear !== 'commercial_gym'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-xs'
                    : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-750 border-zinc-700/80'
                }`}
                title="Filter exercises by gym setup / equipment"
              >
                {GEAR_FILTER_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id} className="bg-zinc-900 text-zinc-100 py-1 font-semibold">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute right-2 pointer-events-none ${
                selectedGear !== 'commercial_gym' ? 'text-zinc-950' : 'text-zinc-400'
              }`} />
            </div>

            {/* Target Muscle Group Dropdown - Same styling and dropdown option as Gym Setup */}
            <div className="relative inline-flex items-center">
              <label htmlFor="muscle-filter-select" className="sr-only">Target Muscle Filter</label>
              <select
                id="muscle-filter-select"
                value={onlyCustom ? 'Custom' : selectedMuscle}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'Custom') {
                    setOnlyCustom(true);
                    setSelectedMuscle('All');
                  } else {
                    setOnlyCustom(false);
                    setSelectedMuscle(val as MuscleGroup | 'All');
                  }
                }}
                className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg font-bold text-xs cursor-pointer border transition-all ${
                  selectedMuscle !== 'All' && !onlyCustom
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-xs'
                    : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-750 border-zinc-700/80'
                }`}
                title="Filter exercises by target muscle group"
              >
                <option value="All" className="bg-zinc-900 text-zinc-100 py-1 font-semibold">
                  All Muscles
                </option>
                {MUSCLE_GROUPS.map(muscle => (
                  <option key={muscle} value={muscle} className="bg-zinc-900 text-zinc-100 py-1 font-semibold">
                    {muscle}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute right-2 pointer-events-none ${
                selectedMuscle !== 'All' && !onlyCustom ? 'text-zinc-950' : 'text-zinc-400'
              }`} />
            </div>

            {/* Custom Exercises Toggle: Only shown once custom exercises are made */}
            {customList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setOnlyCustom(!onlyCustom);
                  if (!onlyCustom) {
                    setSelectedMuscle('All');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all font-mono text-xs ${
                  onlyCustom
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-750 border border-zinc-700/80'
                }`}
                title="Show custom exercises"
              >
                Custom ({customList.length}{!isPro ? `/${MAX_FREE_CUSTOM_EXERCISES}` : ''})
              </button>
            )}
          </div>
        </div>

        {/* Exercises List */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 divide-y divide-zinc-800/60">
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No exercises match your search criteria.
            </div>
          ) : (
            <>
              {displayedExercises.map(ex => {
                const isAlreadyAdded = selectedExerciseIds.includes(ex.id);
                const targetMuscleLabel =
                  ex.rawPrimaryMuscle && ex.rawPrimaryMuscle !== ex.primaryMuscle
                    ? `${ex.rawPrimaryMuscle} (${ex.primaryMuscle})`
                    : ex.primaryMuscle;
                const videoUrl = getExerciseVideoUrl(ex);
                const hasVideoError = failedVideoIds[ex.id];

                return (
                  <div
                    key={ex.id}
                    className="py-2 sm:py-2.5 px-1 sm:px-2 flex items-center justify-between gap-2 sm:gap-3 hover:bg-zinc-850/50 rounded-xl transition-colors group/item"
                  >
                    {/* Video Thumbnail with autoplay loop */}
                    <div
                      title={`Video demonstration of ${ex.name}`}
                      className="relative w-12 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-zinc-750 bg-zinc-950 shadow-xs"
                    >
                      {videoUrl && !hasVideoError ? (
                        <video
                          key={videoUrl}
                          src={videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          onError={() => setFailedVideoIds(prev => ({ ...prev, [ex.id]: true }))}
                          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.06]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400">
                          <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                        </div>
                      )}
                    </div>

                    {/* Exercise Info: Clearly readable text with clean layout and no overlays */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className="font-bold text-xs sm:text-sm text-zinc-100 leading-snug break-words"
                          title={ex.name}
                        >
                          {ex.name}
                        </h4>
                        {ex.isCustom && (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase shrink-0">
                            Custom
                          </span>
                        )}
                        <ExerciseInfoTooltip
                          exerciseId={ex.id}
                          exerciseName={ex.name}
                          size="xs"
                        />
                      </div>
                      {/* Clean metadata line - high contrast and visible */}
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 mt-0.5 flex-wrap">
                        <span className="text-amber-400 font-semibold">{targetMuscleLabel}</span>
                        <span className="text-zinc-500" aria-hidden="true">·</span>
                        <span className="text-zinc-200 font-medium">{ex.equipment}</span>
                        {ex.tier && (
                          <>
                            <span className="text-zinc-600 hidden sm:inline" aria-hidden="true">·</span>
                            <span className="text-zinc-400 font-mono text-[10px] uppercase hidden sm:inline">{ex.tier}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Compact, minimal action buttons */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      {ex.isCustom && (
                        <button
                          type="button"
                          onClick={() => setSharingExercise(ex)}
                          className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Share custom exercise"
                          aria-label={`Share ${ex.name}`}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {ex.isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteCustomExercise(ex.id);
                            setCustomList(getCustomExercises());
                          }}
                          className="p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Delete custom exercise"
                          aria-label={`Delete ${ex.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectExercise(ex);
                          onClose();
                        }}
                        disabled={isAlreadyAdded}
                        className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                          isAlreadyAdded
                            ? 'bg-zinc-800/90 text-zinc-500 border border-zinc-750 cursor-not-allowed'
                            : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-xs'
                        }`}
                        title={isAlreadyAdded ? 'Already added' : `Add ${ex.name}`}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <Check className="w-3 h-3 text-zinc-400" />
                            <span className="hidden sm:inline">Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>Select</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredExercises.length > visibleLimit && (
                <div className="pt-3 pb-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleLimit(prev => prev + 80)}
                    className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider border border-zinc-700 cursor-pointer transition-colors"
                  >
                    Load More Exercises ({filteredExercises.length - visibleLimit} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Custom Exercise Modal */}
      {showCreateModal && (
        <CreateCustomExerciseModal
          onClose={() => setShowCreateModal(false)}
          onExerciseCreated={newEx => {
            setCustomList(getCustomExercises());
            if (selectedMuscle !== 'All' && selectedMuscle !== newEx.primaryMuscle) {
              setSelectedMuscle(newEx.primaryMuscle);
            }
            setSearchQuery('');
            setShowCreateModal(false);
          }}
          initialMuscle={selectedMuscle !== 'All' ? selectedMuscle : 'Chest'}
          currentEnvironment={currentEnvironment}
          subscription={subscription}
          onOpenUpgradeModal={onOpenUpgradeModal}
        />
      )}

      {/* Share Custom Exercise with Community Friends Modal */}
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
