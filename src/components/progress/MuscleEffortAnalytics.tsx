import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  ArrowRight,
  TrendingUp,
  Sliders,
  Check,
  RotateCcw,
  Share2
} from 'lucide-react';
import { ActiveWorkout, WorkoutPlan, ProgressStageShareData, UserProfile } from '../../types';
import {
  calculateMuscleEffort,
  adjustPlanForMultipleMuscles,
  MuscleArea,
  MuscleEffortData
} from '../../utils/muscleAnalytics';
import { TermHelpTooltip } from '../common/TermHelpTooltip';
import { ShareProgressStageModal } from './ShareProgressStageModal';

interface MuscleEffortAnalyticsProps {
  workoutHistory: ActiveWorkout[];
  activePlan?: WorkoutPlan;
  unit: 'kg' | 'lbs';
  onUpdatePlan?: (plan: WorkoutPlan) => void;
  className?: string;
  userProfile?: UserProfile | null;
  onShareProgress?: (stage: ProgressStageShareData) => void;
  onlyAdviceCard?: boolean;
}

const ALL_MUSCLE_AREAS: MuscleArea[] = ['Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core'];

export const MuscleEffortAnalytics: React.FC<MuscleEffortAnalyticsProps> = ({
  workoutHistory,
  activePlan,
  unit,
  onUpdatePlan,
  className = '',
  userProfile,
  onShareProgress,
  onlyAdviceCard = false
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [adjustedMessage, setAdjustedMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Memoize calculation to prevent recalculations & reference changes on every render
  const { distribution, totalVolume, totalSets, totalExercises, suggestions } = useMemo(() => {
    return calculateMuscleEffort(workoutHistory, timeframe, unit);
  }, [workoutHistory, timeframe, unit]);

  // Identify all muscles that need focus based on calculated training deficits
  const musclesNeedingFocus: MuscleArea[] = useMemo(() => {
    if (suggestions.length === 0) return ['Legs', 'Back'];
    return suggestions.map(s => s.area);
  }, [suggestions]);

  // Track if user has manually altered the muscle selection
  const [userModified, setUserModified] = useState(false);

  // Selected muscles for program adjustment - initialized with muscles needing focus
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleArea[]>(() => {
    return musclesNeedingFocus.length > 0 ? musclesNeedingFocus : ['Legs', 'Back'];
  });

  // When timeframe changes, reset manual override and re-default to newly calculated lagging muscles
  useEffect(() => {
    setUserModified(false);
    if (musclesNeedingFocus.length > 0) {
      setSelectedMuscles(musclesNeedingFocus);
    }
  }, [timeframe]);

  // Only synchronize suggestions if the user has NOT manually modified the tick boxes
  useEffect(() => {
    if (!userModified && musclesNeedingFocus.length > 0) {
      setSelectedMuscles(musclesNeedingFocus);
    }
  }, [musclesNeedingFocus, userModified]);

  const handleToggleMuscle = (area: MuscleArea) => {
    setUserModified(true);
    setSelectedMuscles(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleResetToRecommended = () => {
    setUserModified(false);
    setSelectedMuscles(musclesNeedingFocus);
  };

  const handleClearAll = () => {
    setUserModified(true);
    setSelectedMuscles([]);
  };

  const handleApplyAdjustment = () => {
    if (!activePlan || !onUpdatePlan || selectedMuscles.length === 0) return;
    const { updatedPlan, exercisesAdded } = adjustPlanForMultipleMuscles(activePlan, selectedMuscles);
    onUpdatePlan(updatedPlan);
    const addedSummary = exercisesAdded.slice(0, 3).join(', ');
    setAdjustedMessage(
      `Updated "${updatedPlan.title}" with targeted ${selectedMuscles.join(' & ')} exercises (${addedSummary})!`
    );
    setTimeout(() => {
      setAdjustedMessage(null);
    }, 6000);
  };

  const overallMuscleShareData: ProgressStageShareData = useMemo(() => {
    const timeframeLabel = timeframe === 'week' ? 'Past Week' : timeframe === 'month' ? 'Past Month' : 'Past Year';
    const musclesSummary = distribution
      .filter(m => m.percentage > 0)
      .map(m => `${m.label} ${m.percentage}%`)
      .join(', ') || 'All muscles active';

    return {
      stageId: `overall-muscle-progress-${timeframe}`,
      stageType: 'muscle_distribution',
      badgeLabel: 'Overall Muscle Progress',
      title: 'All Muscles Combined',
      highlightValue: `${totalVolume.toLocaleString()} ${unit} Total Effort`,
      highlightSubtext: `${totalSets} Working Sets · ${totalExercises} Exercises Logged`,
      summaryBullets: [
        `Timeframe: ${timeframeLabel}`,
        `Total Effort: ${totalVolume.toLocaleString()} ${unit}`,
        `Working Sets: ${totalSets} sets`,
        `Exercises Logged: ${totalExercises}`,
        `Breakdown: ${musclesSummary}`
      ],
      defaultMessage: `Overall muscle progress: ${musclesSummary}. Total effort: ${totalVolume.toLocaleString()} ${unit}, ${totalSets} working sets, ${totalExercises} exercises logged for all muscles combined.`
    };
  }, [distribution, totalVolume, totalSets, totalExercises, timeframe, unit]);

  const handleShareOverallMuscles = () => {
    if (onShareProgress) {
      onShareProgress(overallMuscleShareData);
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className={`${onlyAdviceCard ? '' : 'space-y-4'} font-sans text-zinc-100 ${className}`}>
      {!onlyAdviceCard && (
        <>
          {/* Header & Minimalist Timeframe Switcher with Minimized Share Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-850">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold tracking-tight text-zinc-100">
              Muscle Effort Distribution
            </h3>
            <TermHelpTooltip
              customTitle="Muscle Effort Distribution"
              customShort="Tracks working sets and mechanical volume load across major muscle groups."
              customExplanation="Analyzes your logged workouts over time to evaluate kinetic balance across pushing, pulling, leg, and core musculature. Balanced training prevents postural distortion and promotes symmetrical hypertrophy."
              customWhyItMatters="Identifies lagging muscle groups before plateaus or muscular imbalances develop."
              size="xs"
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            Volume & working sets across major anatomical regions
          </p>
        </div>

        {/* Minimalist Segmented Timeframe Control & Minimized Share Icon */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
            {(['week', 'month', 'year'] as const).map(tf => {
              const label = tf === 'week' ? 'Past Week' : tf === 'month' ? 'Past Month' : 'Past Year';
              const isActive = timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleShareOverallMuscles}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-amber-400 border border-zinc-700/80 transition-colors cursor-pointer shrink-0"
            title="Share overall muscle progress with connections"
            aria-label="Share overall muscle progress with connections"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Micro Stats Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-850 text-center">
        <div>
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Effort</span>
          <span className="text-xs sm:text-sm font-bold text-zinc-200 font-mono">
            {totalVolume.toLocaleString()} {unit}
          </span>
        </div>
        <div className="border-x border-zinc-800/80">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Working Sets</span>
          <span className="text-xs sm:text-sm font-bold text-zinc-200 font-mono">
            {totalSets} sets
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Exercises</span>
          <span className="text-xs sm:text-sm font-bold text-zinc-200 font-mono">
            {totalExercises} logged
          </span>
        </div>
      </div>

      {totalVolume === 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="leading-relaxed">
            No workouts logged in this timeframe yet. As you log workouts, real-time volume load across each muscle group will populate. You can still select muscle groups below to adjust your active workout program!
          </span>
        </div>
      )}

      {/* Composite Segmented Visual Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full rounded-full bg-zinc-850 overflow-hidden flex">
          {distribution.map(d => {
            if (d.percentage === 0) return null;
            return (
              <div
                key={d.area}
                style={{ width: `${d.percentage}%`, backgroundColor: d.color }}
                title={`${d.label}: ${d.percentage}%`}
                className="h-full transition-all duration-300"
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono px-0.5">
          <span>0%</span>
          <span>Effort Distribution ({timeframe})</span>
          <span>100%</span>
        </div>
      </div>

      {/* Clean Muscle Areas Data List */}
      <div className="space-y-2">
        {distribution.map(m => {
          const isLagging = m.status === 'lagging';
          return (
            <div
              key={m.area}
              className={`p-3 rounded-xl border transition-all ${
                isLagging
                  ? 'border-amber-400/40 bg-amber-400/5'
                  : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-200 block truncate">
                      {m.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 block truncate">
                      {m.subMuscles}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2.5">
                  <div>
                    <span className="text-xs font-bold font-mono text-zinc-100 block">
                      {m.percentage}%
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      {m.sets} sets · {m.volumeUnit.toLocaleString()} {unit}
                    </span>
                  </div>

                  {isLagging ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                      Needs Focus
                    </span>
                  ) : m.status === 'optimal' ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Optimal
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Progress bar per muscle area */}
              <div className="mt-2 h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(3, m.percentage))}%`,
                    backgroundColor: m.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* Smart Balancing Suggestion & Custom Muscle Focus Section */}
      <div className={onlyAdviceCard ? 'space-y-3' : 'pt-1 space-y-3'}>
        {adjustedMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{adjustedMessage}</span>
          </div>
        )}

        <div
          className={`p-3.5 rounded-xl bg-zinc-950/70 border ${
            onlyAdviceCard ? 'border-[#F6721D]' : 'border-zinc-800/80'
          } space-y-3`}
        >
          {/* Advice Header */}
          {suggestions.length > 0 ? (
            <div className="space-y-1.5 pb-2.5 border-b border-zinc-850">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <h4 className="text-xs font-bold text-zinc-100">
                    Balanced Approach Advice: {suggestions.slice(0, 2).map(s => s.area).join(' & ')} Focus Needed
                  </h4>
                </div>
                <div className="flex items-center gap-1 flex-wrap justify-end">
                  {suggestions.slice(0, 2).map(s => (
                    <span
                      key={s.area}
                      className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20"
                    >
                      {s.area}: –{s.deficit}%
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                {suggestions.slice(0, 2).map(s => (
                  <p key={s.area} className="text-[11px] text-zinc-400 leading-relaxed">
                    {s.advice}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-400 pb-2.5 border-b border-zinc-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                All kinetic chains are currently balanced. You can customize your training focus below to add specialized volume.
              </span>
            </div>
          )}

          {/* User Multi-Muscle Choice Section */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
              <div>
                <span className="text-[11px] font-mono uppercase text-zinc-300 font-semibold flex items-center gap-1.5">
                  <span>Choose Muscles to Add ({selectedMuscles.length} selected)</span>
                </span>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Lagging muscles are ticked by default. You can untick any muscle and select other muscle groups before accepting adjustments.
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                {userModified && (
                  <button
                    type="button"
                    onClick={handleResetToRecommended}
                    className="text-[10px] px-2 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 transition-all cursor-pointer font-medium"
                    title="Restore default recommended lagging muscle selections"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset Recommended</span>
                  </button>
                )}
                {selectedMuscles.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[10px] px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
                  >
                    Untick All
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetToRecommended}
                    className="text-[10px] px-2 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 transition-colors cursor-pointer"
                  >
                    Tick Recommended
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Multi-Select Muscle Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_MUSCLE_AREAS.map(area => {
                const isSelected = selectedMuscles.includes(area);
                const areaData = distribution.find(d => d.area === area);
                const isLagging = areaData?.status === 'lagging';

                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleToggleMuscle(area)}
                    aria-pressed={isSelected}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between select-none ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold shadow-xs ring-1 ring-amber-400/30'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Checkbox Square */}
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-zinc-950 border-amber-400 font-black shadow-xs'
                            : 'bg-zinc-900 border-zinc-700 text-transparent hover:border-zinc-500'
                        }`}
                      >
                        ✓
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs block truncate leading-tight font-medium text-zinc-100">
                          {area}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {areaData ? `${areaData.percentage}% volume` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5 shrink-0 ml-1">
                      {isLagging ? (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isSelected
                              ? 'bg-amber-400/25 text-amber-300 border border-amber-400/40'
                              : 'bg-zinc-800/80 text-amber-400/70 border border-zinc-700'
                          }`}
                        >
                          {isSelected ? 'Lagging ✓' : 'Lagging (Unticked)'}
                        </span>
                      ) : isSelected ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono text-zinc-400 bg-zinc-800/70 border border-zinc-700">
                          Selected
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            {activePlan && onUpdatePlan && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[10px] text-zinc-400">
                  {selectedMuscles.length === 0
                    ? 'Select at least 1 muscle group to calibrate your program'
                    : `Will inject targeted exercises for ${selectedMuscles.join(', ')}.`}
                </span>

                <button
                  type="button"
                  disabled={selectedMuscles.length === 0}
                  onClick={handleApplyAdjustment}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    selectedMuscles.length > 0
                      ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 active:scale-95 cursor-pointer'
                      : 'bg-zinc-850 text-zinc-500 cursor-not-allowed border border-zinc-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {selectedMuscles.length === 0
                      ? 'Select Muscles to Add'
                      : `Adjust Program: Add ${selectedMuscles.join(' & ')} Exercises`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Progress Stage Fallback Modal */}
      <ShareProgressStageModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        stageData={overallMuscleShareData}
        userProfile={userProfile}
      />
    </div>
  );
};
