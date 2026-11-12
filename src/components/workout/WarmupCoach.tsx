import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  CheckCircle2,
  Check,
  Trash2,
  ChevronDown,
  Play,
  Maximize2,
  X,
  Film,
  Plus,
  Search
} from 'lucide-react';
import { WorkoutExercise, MuscleGroup } from '../../types';
import {
  MobilityExercise,
  getRecommendedWarmup,
  MOBILITY_DATABASE,
  WARMUP_VIDEOS
} from '../../data/warmupData';
import { playSetCompleteSound } from '../../utils/audio';
import { ExerciseInfoTooltip } from '../common/ExerciseInfoTooltip';

const STRETCH_CATEGORIES = ['All', 'Upper Body', 'Lower Body', 'Spine & Hips'] as const;
type StretchCategory = (typeof STRETCH_CATEGORIES)[number];

const matchesCategory = (drill: MobilityExercise, cat: StretchCategory) => {
  if (cat === 'All') return true;
  const upper: MuscleGroup[] = ['Chest', 'Shoulders', 'Back', 'Triceps', 'Biceps', 'Forearms'];
  const lower: MuscleGroup[] = ['Quads', 'Hamstrings', 'Glutes', 'Calves'];
  if (cat === 'Upper Body') {
    return drill.targetMuscles.some(m => upper.includes(m));
  }
  if (cat === 'Lower Body') {
    return drill.targetMuscles.some(m => lower.includes(m));
  }
  if (cat === 'Spine & Hips') {
    return (
      drill.targetMuscles.some(m => ['Abs & Core', 'Back', 'Glutes'].includes(m)) ||
      drill.focusJoint.toLowerCase().includes('spine') ||
      drill.focusJoint.toLowerCase().includes('hip') ||
      drill.focusJoint.toLowerCase().includes('thoracic') ||
      drill.focusJoint.toLowerCase().includes('groin')
    );
  }
  return true;
};

export interface WarmupCoachProps {
  exercises: WorkoutExercise[];
  soundEnabled?: boolean;
  onAddWarmupSetToFirstExercise?: () => void;
  isWarmupActive?: boolean;
  isWarmupEnded?: boolean;
  onStartWarmup?: () => void;
  onEndWarmup?: () => void;
  onStartGymWorkout?: () => void;
  programStarted?: boolean;
}

export const WarmupCoach: React.FC<WarmupCoachProps> = ({
  exercises,
  soundEnabled = true,
  onAddWarmupSetToFirstExercise,
  isWarmupActive = false,
  isWarmupEnded = false,
  onStartWarmup,
  onEndWarmup,
  onStartGymWorkout,
  programStarted = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [completedDrillIds, setCompletedDrillIds] = useState<Record<string, boolean>>({});
  const [deletedDrillIds, setDeletedDrillIds] = useState<string[]>([]);
  const [customAddedDrills, setCustomAddedDrills] = useState<MobilityExercise[]>([]);
  const [warmupElapsed, setWarmupElapsed] = useState<number>(0);
  const [expandedVideoDrill, setExpandedVideoDrill] = useState<MobilityExercise | null>(null);

  // Modal state for adding another warmup stretch exercise
  const [showAddStretchModal, setShowAddStretchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<StretchCategory>('All');

  // Auto-expand when warmup is started
  useEffect(() => {
    if (isWarmupActive) {
      setIsExpanded(true);
    }
  }, [isWarmupActive]);

  // Track warmup elapsed time while warmup is active
  useEffect(() => {
    if (!isWarmupActive) return;
    const interval = setInterval(() => {
      setWarmupElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWarmupActive]);

  const formatWarmupTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Compute recommended warmup drills based on workout exercises
  const { recommendedDrills, estimatedMinutes } = React.useMemo(
    () => getRecommendedWarmup(exercises),
    [exercises]
  );

  // Combine recommended drills and user custom-added stretch drills
  const allDrills = React.useMemo(() => {
    const list = [...recommendedDrills];
    customAddedDrills.forEach(custom => {
      if (!list.some(d => d.id === custom.id)) {
        list.push(custom);
      }
    });
    return list;
  }, [recommendedDrills, customAddedDrills]);

  const visibleDrills = React.useMemo(
    () => allDrills.filter(d => !deletedDrillIds.includes(d.id)),
    [allDrills, deletedDrillIds]
  );

  const completedCount = visibleDrills.filter(d => completedDrillIds[d.id]).length;
  const totalCount = visibleDrills.length;
  const isAllDrillsChecked = totalCount > 0 && completedCount === totalCount;
  // Only mark as completed (green border) when all warmup & stretch exercises are marked completed
  const isSequenceDone = isAllDrillsChecked;

  const toggleDrillCompletion = (id: string) => {
    setCompletedDrillIds(prev => {
      const willBeCompleted = !prev[id];
      if (willBeCompleted && soundEnabled) {
        playSetCompleteSound();
      }
      const next = {
        ...prev,
        [id]: willBeCompleted
      };
      const allNowChecked =
        visibleDrills.length > 0 && visibleDrills.every(d => !!next[d.id]);
      if (allNowChecked) {
        setIsExpanded(false);
        if (onEndWarmup) {
          onEndWarmup();
        }
      }
      return next;
    });
  };

  const handleDeleteDrill = (id: string) => {
    setDeletedDrillIds(prev => [...prev, id]);
  };

  // Toggle complete sequence: if all are completed, uncheck all (back to orange); otherwise mark all completed (green)
  const handleToggleCompleteSequence = () => {
    if (isAllDrillsChecked) {
      setCompletedDrillIds({});
      return;
    }
    const allDone: Record<string, boolean> = {};
    visibleDrills.forEach(d => {
      allDone[d.id] = true;
    });
    setCompletedDrillIds(allDone);
    setIsExpanded(false);
    if (soundEnabled) {
      playSetCompleteSound();
    }
    if (onEndWarmup) {
      onEndWarmup();
    }
  };

  // Add stretch drill from modal
  const handleAddStretchDrill = (drill: MobilityExercise) => {
    const enriched: MobilityExercise = {
      ...drill,
      cdnUrl: WARMUP_VIDEOS[drill.id] || drill.cdnUrl,
      cdn_url: WARMUP_VIDEOS[drill.id] || drill.cdn_url
    };

    // If it was previously deleted, un-delete it
    if (deletedDrillIds.includes(drill.id)) {
      setDeletedDrillIds(prev => prev.filter(id => id !== drill.id));
    }

    // Add to customAddedDrills if not already in recommendedDrills
    setCustomAddedDrills(prev => {
      if (prev.some(d => d.id === drill.id) || recommendedDrills.some(d => d.id === drill.id)) {
        return prev;
      }
      return [...prev, enriched];
    });

    // Reset completion for newly added exercise
    setCompletedDrillIds(prev => ({
      ...prev,
      [drill.id]: false
    }));
    setShowAddStretchModal(false);
  };

  // Filter available stretch exercises for the popup modal
  const filteredStretchExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return MOBILITY_DATABASE.map(drill => ({
      ...drill,
      cdnUrl: WARMUP_VIDEOS[drill.id] || drill.cdnUrl,
      cdn_url: WARMUP_VIDEOS[drill.id] || drill.cdn_url
    })).filter(drill => {
      const matchesCat = matchesCategory(drill, selectedCategory);
      if (!matchesCat) return false;
      if (!query) return true;
      const matchName = drill.name.toLowerCase().includes(query);
      const matchJoint = drill.focusJoint.toLowerCase().includes(query);
      const matchMuscles = drill.targetMuscles.some(m => m.toLowerCase().includes(query));
      return matchName || matchJoint || matchMuscles;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div
      className={`rounded-2xl border bg-zinc-900 shadow-md transition-all ${
        isSequenceDone
          ? 'border-emerald-500 ring-1 ring-emerald-500/30 shadow-emerald-500/10'
          : 'border-orange-500 ring-1 ring-orange-500/30 shadow-orange-500/10'
      } ${!isExpanded ? 'hover:bg-zinc-850/80 cursor-pointer' : ''}`}
      onClick={() => {
        if (!isExpanded) {
          setIsExpanded(true);
        }
      }}
    >
      {/* Minimized Header Row - Same size as collapsed ExerciseCard */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Completion Check Mark Button - same as exercise complete checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCompleteSequence();
            }}
            title={isSequenceDone ? 'Completed (click to undo)' : 'Mark all Warmup & Stretch exercises as completed'}
            aria-label={isSequenceDone ? 'Mark Warmup incomplete' : 'Mark Warmup completed'}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isSequenceDone
                ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-500/30'
                : 'bg-zinc-900/80 hover:bg-zinc-850 border border-orange-500/60 hover:border-orange-400 text-orange-400/50 hover:text-orange-400'
            }`}
          >
            <Check
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] ${
                isSequenceDone ? 'text-emerald-400 scale-110 opacity-100' : 'text-orange-400 opacity-40 hover:opacity-80'
              }`}
            />
          </button>

          <div
            className="min-w-0 flex-1 cursor-pointer select-none"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-zinc-100 truncate">
                Warmup & Stretch
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span className={`${isSequenceDone ? 'text-emerald-400' : 'text-zinc-400'} font-medium font-mono text-[11px]`}>
                {completedCount} / {totalCount} stretches completed
              </span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-zinc-500 text-[11px] font-mono">~{estimatedMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Right Side Action Controls & Collapse Icon */}
        <div className="flex items-center gap-2 shrink-0">
          {isWarmupActive ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold flex items-center gap-1 animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Active {formatWarmupTime(warmupElapsed)}</span>
            </span>
          ) : isSequenceDone ? (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Completed
            </span>
          ) : null}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
            aria-label={isExpanded ? 'Collapse Warmup and Stretch' : 'Expand Warmup and Stretch'}
            title={isExpanded ? 'Collapse Warmup and Stretch' : 'Expand Warmup and Stretch'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Required Stretches & Exercises List (Formatted like workout exercises with right-side done checkbox and delete option) */}
      {isExpanded && (
        <div
          className={`px-3 pb-3 space-y-2 border-t pt-2.5 animate-in fade-in duration-150 ${
            isSequenceDone ? 'border-emerald-500/30' : 'border-orange-500/30'
          }`}
        >
          {/* Action Bar inside Expanded View */}
          <div className="flex items-center justify-between gap-2 pb-1.5 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {!isWarmupActive && !isSequenceDone && onStartWarmup && (
                <button
                  type="button"
                  onClick={onStartWarmup}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Warmup</span>
                </button>
              )}

              {isWarmupActive && onEndWarmup && (
                <button
                  type="button"
                  onClick={onEndWarmup}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                >
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  <span>End Warmup</span>
                </button>
              )}

              {!programStarted && !isWarmupActive && onStartGymWorkout && (
                <button
                  type="button"
                  onClick={onStartGymWorkout}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer border border-zinc-700 whitespace-nowrap shrink-0"
                >
                  Skip Warmup
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAddStretchModal(true)}
              className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <span>Add Stretch</span>
            </button>
          </div>
          {visibleDrills.map((drill, idx) => {
            const isCompleted = !!completedDrillIds[drill.id];

            return (
              <div
                key={drill.id}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-zinc-950/40 border-emerald-500/50 opacity-75'
                    : 'bg-zinc-950/70 border-orange-500/40 hover:border-orange-500/70'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Video GIF Thumbnail with expand button (Same as workout section) */}
                  <div className="relative group/thumb shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedVideoDrill(drill)}
                      title="Expand video preview"
                      className="w-14 h-12 sm:w-16 sm:h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-750/90 hover:border-amber-400/70 block relative cursor-pointer transition-all shadow-xs"
                    >
                      {drill.cdnUrl ? (
                        <video
                          key={drill.cdnUrl}
                          src={drill.cdnUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover object-center filter brightness-[0.90] contrast-[1.08] transition-transform duration-300 group-hover/thumb:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-850 text-amber-400">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                    </button>

                    {/* Simplified Video Expansion Button */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setExpandedVideoDrill(drill);
                      }}
                      title="Expand video to full screen"
                      aria-label="Expand video to full screen"
                      className="absolute bottom-1 right-1 p-1 rounded-md bg-black/85 hover:bg-black text-amber-400 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-400/80 shadow-sm cursor-pointer z-10 transition-all active:scale-95 flex items-center gap-0.5"
                    >
                      <Maximize2 className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Details Area */}
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-zinc-500 shrink-0">
                        #{idx + 1}
                      </span>

                      <h4
                        onClick={() => toggleDrillCompletion(drill.id)}
                        className={`font-bold text-xs sm:text-sm truncate cursor-pointer ${
                          isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100 hover:text-emerald-300'
                        }`}
                      >
                        {drill.name}
                      </h4>

                      {/* Information Icon Tooltip with Exercise / Stretch Guide */}
                      <ExerciseInfoTooltip
                        exerciseId={drill.id}
                        exerciseName={drill.name}
                        size="xs"
                      />
                    </div>

                    {/* Metadata zero-pill styling */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 flex-wrap font-mono">
                      <span className="text-amber-300/90 font-medium">{drill.repsOrHold}</span>
                    </div>
                  </div>

                  {/* Right Side: Done Checkbox & Delete Option Icon (exact layout as workout exercises) */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Done Checkbox - Default orange border, turns green when completed */}
                    <button
                      type="button"
                      onClick={() => toggleDrillCompletion(drill.id)}
                      aria-label={isCompleted ? `Mark ${drill.name} incomplete` : `Mark ${drill.name} done`}
                      title={isCompleted ? 'Completed (click to undo)' : 'Mark as done'}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-500/30'
                          : 'bg-zinc-900/80 hover:bg-zinc-850 border border-orange-500/60 hover:border-orange-400 text-orange-400/50 hover:text-orange-400'
                      }`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] ${
                          isCompleted ? 'text-emerald-400 scale-110 opacity-100' : 'text-orange-400 opacity-40 hover:opacity-80'
                        }`}
                      />
                    </button>

                    {/* Delete Option Icon */}
                    <button
                      type="button"
                      onClick={() => handleDeleteDrill(drill.id)}
                      title={`Delete ${drill.name}`}
                      aria-label={`Delete ${drill.name}`}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 active:scale-95 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {visibleDrills.length === 0 && (
            <div className="py-6 text-center text-xs text-zinc-500 font-mono">
              All warmup stretches completed or removed.
            </div>
          )}

          {deletedDrillIds.length > 0 && (
            <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-850 px-1">
              <span className="text-zinc-500 text-[11px] font-mono">
                {deletedDrillIds.length} stretch{deletedDrillIds.length > 1 ? 'es' : ''} deleted
              </span>
              <button
                type="button"
                onClick={() => setDeletedDrillIds([])}
                className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer text-xs font-semibold"
              >
                Restore stretches
              </button>
            </div>
          )}

          {/* Bottom Actions: Add Warmup Stretch Icon & Collapse Icon */}
          <div className="pt-2.5 pb-0.5 flex items-center justify-between gap-2 border-t border-zinc-800/70 mt-2">
            {/* Add Stretch button - exactly same styling as Exercise Add Set button */}
            <button
              type="button"
              onClick={() => setShowAddStretchModal(true)}
              title="Add another warmup stretch exercise"
              aria-label="Add another warmup stretch exercise"
              className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <span>Add Stretch</span>
            </button>

            {/* Minimalistic collapse icon button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
              title="Collapse Warmup and Stretch"
              aria-label="Collapse Warmup and Stretch"
            >
              <ChevronDown className="w-4 h-4 rotate-180 transition-transform duration-200" />
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Video Expansion Popup */}
      {expandedVideoDrill && (
        <div
          onClick={() => setExpandedVideoDrill(null)}
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
                    {expandedVideoDrill.name}
                  </h4>
                </div>
                <p className="text-[11px] text-amber-400 font-mono uppercase tracking-wider truncate mt-0.5">
                  Target: {expandedVideoDrill.focusJoint} · {expandedVideoDrill.targetMuscles.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setExpandedVideoDrill(null)}
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
              {expandedVideoDrill.cdnUrl ? (
                <video
                  src={expandedVideoDrill.cdnUrl}
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
                  <span className="text-sm font-mono text-zinc-200">{expandedVideoDrill.name}</span>
                </div>
              )}
            </div>

            {/* Minimalistic Footer */}
            <div className="shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="truncate">Warmup & Stretch Demonstration · {expandedVideoDrill.repsOrHold}</span>
              </span>
              <button
                type="button"
                onClick={() => setExpandedVideoDrill(null)}
                className="px-3 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choose Warmup Stretch Modal (Strictly stretch & bodyweight mobility exercises only) */}
      {showAddStretchModal && (
        <div
          onClick={() => setShowAddStretchModal(false)}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="shrink-0 px-4 py-3 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-900/90 backdrop-blur-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                    Add Warmup Stretch
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold hidden sm:inline">
                    Stretches Only
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                  Select a stretch or mobility drill to add to your sequence
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddStretchModal(false)}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close stretch selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Category Filter Toolbar */}
            <div className="shrink-0 p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-950/60 space-y-2.5">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search stretches or muscles (e.g. Pec, Hamstring, Spine, Quad)..."
                  className="w-full bg-zinc-900 border border-zinc-750 focus:border-amber-400 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar snap-x snap-mandatory px-6 sm:px-0 scroll-px-6 sm:scroll-px-0 scroll-smooth">
                {STRETCH_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      setSelectedCategory(cat);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border snap-center snap-always ${
                      selectedCategory === cat
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Stretches List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 min-h-[220px]">
              {filteredStretchExercises.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs font-mono">
                  No stretches found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredStretchExercises.map(drill => {
                  const isAlreadyAdded = visibleDrills.some(d => d.id === drill.id);

                  return (
                    <div
                      key={drill.id}
                      className="p-2 sm:p-2.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-2.5 sm:gap-3"
                    >
                      {/* Video GIF Thumbnail */}
                      <div className="w-13 h-11 sm:w-16 sm:h-13 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-750 shrink-0 relative">
                        {drill.cdnUrl ? (
                          <video
                            src={drill.cdnUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.08]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-850 text-amber-400">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                            {drill.name}
                          </h4>
                          {/* Info Tooltip explaining how to do the stretch */}
                          <ExerciseInfoTooltip
                            exerciseId={drill.id}
                            exerciseName={drill.name}
                            size="xs"
                          />
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 flex-wrap font-mono">
                          <span className="text-amber-300 font-medium">{drill.repsOrHold}</span>
                          <span className="text-zinc-600 hidden sm:inline">·</span>
                          <span className="text-zinc-500 truncate hidden sm:inline">{drill.focusJoint}</span>
                        </div>
                      </div>

                      {/* Add Button / Added Indicator */}
                      <div className="shrink-0">
                        {isAlreadyAdded ? (
                          <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Added</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddStretchDrill(drill)}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
              <span>{filteredStretchExercises.length} stretches available</span>
              <button
                type="button"
                onClick={() => setShowAddStretchModal(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
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
