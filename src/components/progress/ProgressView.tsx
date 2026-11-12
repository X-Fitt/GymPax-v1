import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  Calendar,
  Scale,
  Plus,
  Trophy,
  Flame,
  Dumbbell,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  LineChart as ChartIcon,
  Crown,
  Check,
  Lock,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Ruler,
  Share2,
  List,
  BarChart3,
  Activity,
  ArrowRight,
  Search,
  Clock
} from 'lucide-react';
import {
  PersonalRecord,
  BodyMeasurement,
  ActiveWorkout,
  RewardsProfile,
  WorkoutPlan,
  UserProfile,
  ProgressStageShareData
} from '../../types';
import { AddMeasurementModal } from './AddMeasurementModal';
import { MeasurementGuideModal } from './MeasurementGuideModal';
import { MuscleMeasurementExplanationModal } from './MuscleMeasurementExplanationModal';
import { ShareProgressStageModal } from './ShareProgressStageModal';
import { WorkoutCalendarView } from '../calendar/WorkoutCalendarView';
import { WorkoutHistoryAnalyticsView } from '../workout/WorkoutHistoryAnalyticsView';
import { ExerciseProgressionChart } from './ExerciseProgressionChart';
import { MuscleEffortAnalytics } from './MuscleEffortAnalytics';
import { calculateMuscleEffort } from '../../utils/muscleAnalytics';
import { TermHelpTooltip } from '../common/TermHelpTooltip';
import { AppTheme, getActivePlan, setActivePlan } from '../../utils/storage';

interface ProgressViewProps {
  personalRecords: PersonalRecord[];
  measurements: BodyMeasurement[];
  workoutHistory: ActiveWorkout[];
  unit: 'kg' | 'lbs';
  onAddMeasurement: (m: BodyMeasurement) => void;
  onOpen1RMCalc: () => void;
  onStartRoutineFromPast?: (workout: ActiveWorkout) => void;
  onOpenShareModal?: (workout: ActiveWorkout) => void;
  onStartQuickWorkout?: () => void;
  onViewHistoryItem?: (workout: ActiveWorkout) => void;
  onNavigateToWorkout?: () => void;
  initialTab?: 'progress' | 'history';
  currentTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  rewardsProfile?: RewardsProfile;
  onOpenRewardsModal?: () => void;
  activePlan?: WorkoutPlan;
  onUpdatePlan?: (plan: WorkoutPlan) => void;
  userProfile?: UserProfile | null;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  personalRecords,
  measurements,
  workoutHistory,
  unit,
  onAddMeasurement,
  onOpen1RMCalc,
  onStartRoutineFromPast,
  onOpenShareModal,
  onStartQuickWorkout,
  onViewHistoryItem,
  onNavigateToWorkout,
  initialTab = 'progress',
  currentTheme = 'dark',
  onSelectTheme,
  rewardsProfile,
  onOpenRewardsModal,
  activePlan,
  onUpdatePlan,
  userProfile
}) => {
  const [mainTab, setMainTab] = useState<'progress' | 'history'>('progress');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [visibleSessionsCount, setVisibleSessionsCount] = useState<number>(5);
  const [activeSubTab, setActiveSubTab] = useState<'progress' | 'progression' | 'graphs' | 'muscles' | 'prs' | 'measurements' | 'calendar' | 'sessions'>(() => initialTab === 'history' ? 'sessions' : 'progress');
  const [chartExerciseId, setChartExerciseId] = useState<string>('barbell_bench_press');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [explainingMuscleKey, setExplainingMuscleKey] = useState<string | null>(null);
  const [measurementFilter, setMeasurementFilter] = useState<'all' | 'relaxed' | 'pumped'>('all');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan>(() => activePlan || getActivePlan());
  const [stageToShare, setStageToShare] = useState<ProgressStageShareData | null>(null);
  const [shareSuccessBanner, setShareSuccessBanner] = useState<string | null>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const handleScrollBar = (direction: 'left' | 'right') => {
    if (!scrollerRef.current) return;
    const container = scrollerRef.current;
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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!scrollerRef.current) return;
      const activeBtn = scrollerRef.current.querySelector<HTMLButtonElement>('button[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeSubTab]);

  const renderShareIconButton = (stage: ProgressStageShareData, ariaLabel?: string) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setStageToShare(stage);
      }}
      className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
      title={ariaLabel || `Share ${stage.title}`}
      aria-label={ariaLabel || `Share ${stage.title}`}
    >
      <Share2 className="w-3.5 h-3.5" />
    </button>
  );

  useEffect(() => {
    if (activePlan) {
      setCurrentPlan(activePlan);
    }
  }, [activePlan]);

  const handleUpdatePlan = (updated: WorkoutPlan) => {
    setCurrentPlan(updated);
    setActivePlan(updated);
    if (onUpdatePlan) {
      onUpdatePlan(updated);
    }
  };

  // Calculate aggregates
  const overallMuscleData = React.useMemo(() => {
    return calculateMuscleEffort(workoutHistory, 'month', unit);
  }, [workoutHistory, unit]);

  const totalVolumeLifted = workoutHistory.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
  const totalSets = workoutHistory.reduce(
    (sum, w) => sum + w.exercises.reduce((es, e) => es + e.sets.filter(s => s.completed).length, 0),
    0
  );

  const displayVolume = unit === 'kg'
    ? Math.round(totalVolumeLifted).toLocaleString()
    : Math.round(totalVolumeLifted * 2.20462).toLocaleString();

  // Latest measurements deltas
  const latestM = measurements[0];
  const previousM = measurements[1];

  const weightDelta = latestM && previousM
    ? unit === 'kg'
      ? Math.round((latestM.bodyweightKg - previousM.bodyweightKg) * 10) / 10
      : Math.round((latestM.bodyweightLbs - previousM.bodyweightLbs) * 10) / 10
    : 0;

  const armDelta = latestM?.armsCm && previousM?.armsCm
    ? Math.round((latestM.armsCm - previousM.armsCm) * 10) / 10
    : 0;

  const chestDelta = latestM?.chestCm && previousM?.chestCm
    ? Math.round((latestM.chestCm - previousM.chestCm) * 10) / 10
    : 0;

  useEffect(() => {
    setMainTab('progress');
    if (initialTab === 'history') {
      setActiveSubTab('sessions');
    }
  }, [initialTab]);

  const filteredHistory = React.useMemo(() => {
    if (!historySearchQuery.trim()) return workoutHistory;
    const q = historySearchQuery.toLowerCase();
    return workoutHistory.filter(w => {
      const matchTitle = w.title?.toLowerCase().includes(q);
      const matchDate = w.date?.toLowerCase().includes(q);
      const matchEx = w.exercises?.some(ex => ex.name?.toLowerCase().includes(q));
      return matchTitle || matchDate || matchEx;
    });
  }, [workoutHistory, historySearchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 space-y-5 text-zinc-100 font-sans">
      {mainTab === 'progress' && (
        <div className="space-y-5 min-w-0 w-full">
          {/* Clean Minimal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
                Physique & Strength Analytics
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Progressive overload tonnage, PR milestones, and body measurements
              </p>
            </div>
          </div>

          {/* Combined Single Scroller Bar (Scrollable Left & Right in Mobile View) */}
          <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-full min-w-0 p-1">
            <button
              type="button"
              onClick={() => handleScrollBar('left')}
              aria-label="Scroll left"
              className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-amber-400 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollerRef}
              className="flex items-center gap-1.5 px-8 sm:px-1 py-0.5 flex-1 min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth scrollbar-none touch-pan-x snap-x snap-mandatory scroll-px-8 sm:scroll-px-1"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
            >
              <button
                type="button"
                data-active={activeSubTab === 'progress'}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setActiveSubTab('progress');
                }}
                style={{ touchAction: 'pan-x' }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] snap-center snap-always ${
                  activeSubTab === 'progress'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Progress</span>
              </button>
              <button
                type="button"
                data-active={activeSubTab === 'progression'}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setActiveSubTab('progression');
                }}
                style={{ touchAction: 'pan-x' }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] snap-center snap-always ${
                  activeSubTab === 'progression'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>RPE & Trends</span>
              </button>
              <button
                type="button"
                data-active={activeSubTab === 'graphs'}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setActiveSubTab('graphs');
                }}
                style={{ touchAction: 'pan-x' }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] snap-center snap-always ${
                  activeSubTab === 'graphs'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span>Graphs & Analytics</span>
              </button>
              <button
                type="button"
                data-active={activeSubTab === 'muscles'}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setActiveSubTab('muscles');
                }}
                style={{ touchAction: 'pan-x' }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] snap-center snap-always ${
                  activeSubTab === 'muscles'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                <span>Muscle Progress</span>
              </button>
              <button
                type="button"
                data-active={activeSubTab === 'prs'}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setActiveSubTab('prs');
                }}
                style={{ touchAction: 'pan-x' }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] snap-center snap-always ${
                  activeSubTab === 'prs'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span>PR Records</span>
              </button>
              <button
                type="button"
                data-active={activeSubTab === 'measurements'}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setActiveSubTab('measurements');
                }}
                style={{ touchAction: 'pan-x' }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] snap-center snap-always ${
                  activeSubTab === 'measurements'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span>Body Measurements</span>
              </button>
              <button
                type="button"
                data-active={activeSubTab === 'calendar'}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setActiveSubTab('calendar');
                }}
                style={{ touchAction: 'pan-x' }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] snap-center snap-always ${
                  activeSubTab === 'calendar'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                data-active={activeSubTab === 'sessions'}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  setActiveSubTab('sessions');
                }}
                style={{ touchAction: 'pan-x' }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] snap-center snap-always ${
                  activeSubTab === 'sessions'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <List className="w-3.5 h-3.5 shrink-0" />
                <span>Sessions</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleScrollBar('right')}
              aria-label="Scroll right"
              className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-amber-400 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

      {/* SUB-TAB: PROGRESS (Athlete Rank & Metric Summaries) */}
      {activeSubTab === 'progress' && (
        <div className="space-y-4">
          {/* Fitness Section & Level Progression Tracker */}
          {rewardsProfile && (
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-[#F6721D] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                    Athlete Rank
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                    {rewardsProfile.section === 'Elite' && <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />}
                    <span>{rewardsProfile.rankTitle}</span>
                  </h2>
                  <span className="text-xs font-mono text-amber-400">
                    {rewardsProfile.points} Total Points
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {renderShareIconButton({
                stageId: 'athlete-rank',
                stageType: 'athlete_rank',
                badgeLabel: 'Athlete Rank',
                title: `${rewardsProfile.rankTitle} (Level ${rewardsProfile.level})`,
                highlightValue: `${rewardsProfile.points.toLocaleString()} Points`,
                highlightSubtext: `${rewardsProfile.section} Tier Athlete`,
                summaryBullets: [
                  `Section progress: ${rewardsProfile.sectionPoints}/1,000 pts`,
                  rewardsProfile.pointsToNextLevel > 0
                    ? `${rewardsProfile.pointsToNextLevel} pts to next rank`
                    : 'Max Tier Unlocked',
                  `Level completion: ${rewardsProfile.levelProgressPercent}%`
                ],
                defaultMessage: `Achieved ${rewardsProfile.rankTitle} (Level ${rewardsProfile.level}) on GymPax with ${rewardsProfile.points} points in the ${rewardsProfile.section} bracket! 🏆`
              }, 'Share Athlete Rank Milestone')}

              {onOpenRewardsModal && (
                <button
                  type="button"
                  onClick={onOpenRewardsModal}
                  className="text-xs text-zinc-400 hover:text-amber-400 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Minimal 4-Tier Stepper Line */}
          <div
            style={{ WebkitOverflowScrolling: 'touch' }}
            className="pt-1 w-full max-w-full overflow-x-auto touch-pan-x scroll-smooth overscroll-x-contain scrollbar-none pb-1.5"
          >
            <div className="grid grid-cols-4 gap-3 text-center text-xs min-w-[520px] sm:min-w-0">
              {(['Beginner', 'Intermediate', 'Pro', 'Elite'] as const).map((sec, idx) => {
                const order = ['Beginner', 'Intermediate', 'Pro', 'Elite'];
                const currentIdx = order.indexOf(rewardsProfile.section);
                const isCurrent = rewardsProfile.section === sec;
                const isPassed = idx < currentIdx;

                return (
                  <div key={sec} className="space-y-1.5">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-full h-1 rounded-full ${
                          isPassed || isCurrent ? 'bg-amber-400' : 'bg-zinc-800'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {sec === 'Elite' && <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                      <span
                        className={`font-semibold text-xs block ${
                          isCurrent
                            ? 'text-amber-400'
                            : isPassed
                            ? 'text-zinc-300'
                            : 'text-zinc-600'
                        }`}
                      >
                        {sec}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 block">
                      {isCurrent ? `Level ${rewardsProfile.level}` : sec === 'Elite' ? 'Earned' : '1000 pts'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Progress Bars & Forecast */}
          <div className="pt-2 border-t border-zinc-850 space-y-3">
            {/* Level Goal */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-200">
                  {rewardsProfile.pointsToNextLevel > 0
                    ? `${rewardsProfile.pointsToNextLevel} pts needed to reach ${rewardsProfile.nextRankTitle}`
                    : 'Max Level Reached'}
                </span>
                <span className="font-mono text-zinc-400 text-xs">
                  {rewardsProfile.levelProgressPercent}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-zinc-850 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${rewardsProfile.levelProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Workouts Forecast */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
              <span>
                ~<strong className="text-zinc-200 font-mono">{Math.ceil(rewardsProfile.pointsToNextLevel / 5)} workouts</strong> to next level
              </span>
              <span>
                Section: <strong className="text-zinc-200 font-mono">{rewardsProfile.sectionPoints}/1000 pts</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 Metric Summaries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-[#F6721D] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Total Tonnage Lifted
              </span>
              <TermHelpTooltip termId="volume" size="xs" />
            </div>
            {renderShareIconButton({
              stageId: 'volume-tonnage',
              stageType: 'volume_tonnage',
              badgeLabel: 'Volume Milestone',
              title: 'Total Tonnage Moved',
              highlightValue: `${displayVolume} ${unit}`,
              highlightSubtext: 'All-time volume lifted across all workouts',
              summaryBullets: [
                `${workoutHistory.length} recorded workouts`,
                `${totalSets} completed working sets`,
                `Measured in ${unit}`
              ],
              defaultMessage: `Crossed a major milestone: ${displayVolume} ${unit} total volume lifted on GymPax! The work pays off. 🏋️‍♂️`
            }, 'Share Volume Milestone')}
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-mono text-2xl font-extrabold text-zinc-100 tabular-nums">
              {displayVolume}
            </span>
            <span className="text-xs text-amber-400 font-semibold">{unit}</span>
          </div>
          <span className="text-[11px] text-zinc-400">All-time volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-[#F6721D] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Workouts Logged
            </span>
            {renderShareIconButton({
              stageId: 'workouts-logged',
              stageType: 'workouts_logged',
              badgeLabel: 'Consistency Milestone',
              title: 'Training Sessions Logged',
              highlightValue: `${workoutHistory.length} Sessions`,
              highlightSubtext: `${totalSets} total completed sets`,
              summaryBullets: [
                `${workoutHistory.length} training sessions logged`,
                `${totalSets} completed working sets`,
                `${displayVolume} ${unit} cumulative volume`
              ],
              defaultMessage: `Just hit ${workoutHistory.length} logged workout sessions (${totalSets} working sets) on GymPax! Keep showing up! 💥`
            }, 'Share Workouts Milestone')}
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-mono text-2xl font-extrabold text-zinc-100 tabular-nums">
              {workoutHistory.length}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">sessions</span>
          </div>
          <span className="text-[11px] text-zinc-400">{totalSets} total completed sets</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-[#F6721D] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Current Iron Streak
            </span>
            {renderShareIconButton({
              stageId: 'iron-streak',
              stageType: 'iron_streak',
              badgeLabel: 'Iron Streak',
              title: 'Current Workout Streak',
              highlightValue: `${rewardsProfile?.currentStreakDays || 12} Days`,
              highlightSubtext: 'Consistency unlocked',
              summaryBullets: [
                `${rewardsProfile?.currentStreakDays || 12}-day active streak in the gym`,
                'Building steady momentum and recovery discipline',
                'Next streak target: 14 days'
              ],
              defaultMessage: `On a ${rewardsProfile?.currentStreakDays || 12}-day streak in the gym! Discipline over motivation every single day. 🔥`
            }, 'Share Streak Milestone')}
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-mono text-2xl font-extrabold text-zinc-100 tabular-nums">
              {rewardsProfile?.currentStreakDays || 12}
            </span>
            <span className="text-xs text-amber-400 font-semibold">days</span>
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <Flame className="w-3 h-3 fill-current" />
            <span>Consistency unlocked</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-[#F6721D] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Personal Records
              </span>
              <TermHelpTooltip termId="pr" size="xs" />
            </div>
            {renderShareIconButton({
              stageId: 'prs-summary',
              stageType: 'personal_records_summary',
              badgeLabel: 'Strength Benchmarks',
              title: 'Personal Records Portfolio',
              highlightValue: `${personalRecords.length} PR Records`,
              highlightSubtext: 'Tracked compound lifts',
              summaryBullets: [
                `${personalRecords.length} verified personal records on file`,
                'Progressive overload tracked via 1RM calculations',
                'Continuous strength curve improvements'
              ],
              defaultMessage: `Currently holding ${personalRecords.length} personal records in my strength tracker on GymPax! Chasing new PRs each cycle. 💪`
            }, 'Share PRs Milestone')}
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-mono text-2xl font-extrabold text-zinc-100 tabular-nums">
              {personalRecords.length}
            </span>
            <span className="text-xs text-amber-400 font-semibold">benchmarks</span>
          </div>
          <span className="text-[11px] text-zinc-400">Tracked compound lifts</span>
        </div>
      </div>

          {/* Balanced Approach Advice Card */}
          <MuscleEffortAnalytics
            workoutHistory={workoutHistory}
            activePlan={currentPlan}
            unit={unit}
            userProfile={userProfile}
            onUpdatePlan={handleUpdatePlan}
            onlyAdviceCard
          />

          {/* Recent Workout Sessions Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <List className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                    <span>Recent Workout Sessions</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">
                      {workoutHistory.length} Total
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Logged training sessions, volume, and performance milestones
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('sessions')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Full Sessions View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* The 5 sessions list */}
            {workoutHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No workout sessions logged yet.</p>
            ) : (
              <div className="space-y-2">
                {workoutHistory.slice(0, visibleSessionsCount).map(w => {
                  const displayVol =
                    unit === 'kg'
                      ? Math.round(w.totalVolumeKg).toLocaleString()
                      : Math.round(w.totalVolumeKg * 2.20462).toLocaleString();
                  const completedSets = w.exercises.reduce(
                    (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
                    0
                  );
                  return (
                    <div
                      key={w.id}
                      onClick={() => onViewHistoryItem ? onViewHistoryItem(w) : undefined}
                      className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-400/50 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                            {w.title}
                          </h4>
                          {w.prCount ? (
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.2 rounded flex items-center gap-1 font-mono">
                              <Trophy className="w-2.5 h-2.5" />
                              <span>{w.prCount} PR{w.prCount > 1 ? 's' : ''}</span>
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <span>{w.date}</span>
                          <span className="text-zinc-600">·</span>
                          <span>{Math.floor(w.durationSeconds / 60)} mins</span>
                          <span className="text-zinc-600">·</span>
                          <span>{completedSets} sets</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span className="font-mono text-xs sm:text-sm font-bold text-zinc-100">
                            {displayVol}
                          </span>
                          <span className="text-[9px] text-zinc-400 block uppercase font-mono">{unit}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls: Load 5 More / Collapse to 5 */}
            {workoutHistory.length > 5 && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-zinc-800/80">
                <span className="text-[11px] font-mono text-zinc-400">
                  Showing <strong className="text-zinc-200">{Math.min(visibleSessionsCount, workoutHistory.length)}</strong> of{' '}
                  <strong className="text-zinc-200">{workoutHistory.length}</strong> sessions
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  {visibleSessionsCount > 5 && (
                    <button
                      type="button"
                      onClick={() => setVisibleSessionsCount(5)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Collapse to 5</span>
                    </button>
                  )}

                  {visibleSessionsCount < workoutHistory.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleSessionsCount(prev => prev + 5)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Load 5 More Sessions</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* SUB-TAB: RPE & WEIGHT PROGRESSION (RECHARTS) */}
      {activeSubTab === 'progression' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                RPE & Load Progression
              </h2>
              <p className="text-xs text-zinc-400">
                Overload curves, estimated 1RM trajectory, and exertion analytics.
              </p>
            </div>
            {renderShareIconButton({
              stageId: 'progression-trend',
              stageType: 'exercise_progression',
              badgeLabel: 'Strength Progress',
              title: 'RPE & Strength Progress',
              highlightValue: 'Progressive Overload',
              highlightSubtext: 'Overload progress tracking',
              summaryBullets: [
                'Overload trajectory tracked across multiple sessions',
                'Exertion calibration for injury prevention',
                `Workouts analyzed: ${workoutHistory.length}`
              ],
              defaultMessage: `Tracking progressive overload and strength progress on GymPax! Consistent load increases every cycle. 📈`
            }, 'Share Progress Milestone')}
          </div>
          <ExerciseProgressionChart
            workoutHistory={workoutHistory}
            unit={unit}
            initialExerciseId={chartExerciseId}
            userProfile={userProfile}
            onShareChart={stage => setStageToShare(stage)}
          />
        </div>
      )}

      {/* SUB-TAB: GRAPHS & ANALYTICS */}
      {activeSubTab === 'graphs' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xs">
          <WorkoutHistoryAnalyticsView
            workoutHistory={workoutHistory}
            unit={unit}
          />
        </div>
      )}

      {/* SUB-TAB: MUSCLE PROGRESS & SHORTFALLS */}
      {activeSubTab === 'muscles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                Muscle Progress & Shortfalls
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                View muscle volume distribution and identify shortfalls. You can adjust your routine below to automatically target lagging muscles.
              </p>
            </div>
            {renderShareIconButton({
              stageId: 'overall-muscle-progress',
              stageType: 'muscle_distribution',
              badgeLabel: 'Overall Muscle Progress',
              title: 'All Muscles Combined',
              highlightValue: `${overallMuscleData.totalVolume.toLocaleString()} ${unit} Total Effort`,
              highlightSubtext: `${overallMuscleData.totalSets} Working Sets · ${overallMuscleData.totalExercises} Exercises Logged`,
              summaryBullets: [
                `Breakdown: ${overallMuscleData.distribution.filter(m => m.percentage > 0).map(m => `${m.label} ${m.percentage}%`).join(', ') || 'All muscles active'}`,
                `Total Effort: ${overallMuscleData.totalVolume.toLocaleString()} ${unit}`,
                `Working Sets: ${overallMuscleData.totalSets} sets`,
                `Exercises Logged: ${overallMuscleData.totalExercises}`
              ],
              defaultMessage: `Overall muscle progress: ${overallMuscleData.distribution.filter(m => m.percentage > 0).map(m => `${m.label} ${m.percentage}%`).join(', ') || 'All muscles active'}. Total effort: ${overallMuscleData.totalVolume.toLocaleString()} ${unit}, ${overallMuscleData.totalSets} working sets, ${overallMuscleData.totalExercises} exercises logged for all muscles combined.`
            }, 'Share Overall Muscle Progress')}
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-sm">
            <MuscleEffortAnalytics
              workoutHistory={workoutHistory}
              activePlan={currentPlan}
              unit={unit}
              userProfile={userProfile}
              onUpdatePlan={handleUpdatePlan}
              onShareProgress={stage => setStageToShare(stage)}
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 1: PERSONAL RECORDS */}
      {activeSubTab === 'prs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                All-Time Compound Bests & Estimated 1RM
              </h2>
              <p className="text-xs text-zinc-400">
                Calculated using progressive overload formulas (Epley & Brzycki hybrid).
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderShareIconButton({
                stageId: 'prs-stage-overview',
                stageType: 'personal_records_summary',
                badgeLabel: 'Strength Benchmarks',
                title: 'All-Time Compound PRs',
                highlightValue: `${personalRecords.length} Benchmarks`,
                highlightSubtext: 'Personal Records Portfolio',
                summaryBullets: personalRecords.slice(0, 3).map(p => `${p.exerciseName}: ${unit === 'kg' ? p.maxWeightKg : p.maxWeightLbs} ${unit} × ${p.reps}`),
                defaultMessage: `Proud to share my personal records portfolio on GymPax! Logged ${personalRecords.length} lift milestones. 💪`
              }, 'Share PR Portfolio')}
              <button
                onClick={onOpen1RMCalc}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
              >
                1RM Estimator
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {personalRecords.map(pr => {
              const displayWeight = unit === 'kg' ? pr.maxWeightKg : pr.maxWeightLbs;
              const display1RM = unit === 'kg'
                ? pr.estimatedOneRepMaxKg
                : Math.round(pr.estimatedOneRepMaxKg * 2.20462);

              return (
                <div
                  key={pr.exerciseId}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-zinc-100">{pr.exerciseName}</h3>
                      {/* Zero-pill metadata text */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span>Achieved: {pr.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{pr.reps} Reps Set</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {renderShareIconButton({
                        stageId: `pr-${pr.exerciseId}`,
                        stageType: 'single_pr',
                        badgeLabel: 'Personal Record',
                        title: pr.exerciseName,
                        highlightValue: `${displayWeight} ${unit} × ${pr.reps} reps`,
                        highlightSubtext: `Est. 1RM: ${display1RM} ${unit}`,
                        summaryBullets: [
                          `Weight: ${displayWeight} ${unit}`,
                          `Reps: ${pr.reps}`,
                          `Est. 1-Rep Max: ${display1RM} ${unit}`,
                          `Date: ${pr.date}`
                        ],
                        defaultMessage: `Hit a new Personal Record on ${pr.exerciseName}: ${displayWeight} ${unit} for ${pr.reps} reps (Est. 1RM: ${display1RM} ${unit})! 🚀`
                      }, `Share ${pr.exerciseName} PR`)}
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                        <Trophy className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
                    <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Max Lifted Set</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-mono text-lg font-bold text-zinc-100 tabular-nums">
                          {displayWeight}
                        </span>
                        <span className="text-xs text-amber-400 font-semibold">{unit}</span>
                        <span className="text-[11px] text-zinc-500">× {pr.reps}</span>
                      </div>
                    </div>

                    <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                      <div className="flex items-center">
                        <span className="text-[10px] text-amber-400/90 uppercase font-semibold block">Est. 1RM</span>
                        <TermHelpTooltip termId="one_rm" size="xs" />
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-mono text-lg font-extrabold text-amber-400 tabular-nums">
                          {display1RM}
                        </span>
                        <span className="text-xs text-amber-400 font-semibold">{unit}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setChartExerciseId(pr.exerciseId);
                      setActiveSubTab('progression');
                    }}
                    className="mt-3 pt-2 border-t border-zinc-800/60 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center justify-between transition-colors cursor-pointer w-full text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Analyze RPE & Progression</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">View Chart →</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BODY MEASUREMENTS */}
      {activeSubTab === 'measurements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                Body Measurements
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Track hypertrophy across arms, forearms, chest, shoulders, waist, thighs, and calves in relaxed and pumped states.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {renderShareIconButton({
                stageId: 'body-measurements',
                stageType: 'body_measurements',
                badgeLabel: 'Physique Milestone',
                title: 'Body Measurements & Circumference',
                highlightValue: latestM ? `${unit === 'kg' ? latestM.bodyweightKg : latestM.bodyweightLbs} ${unit}` : 'Physique Checkpoint',
                highlightSubtext: latestM ? `Latest Log: ${latestM.date}` : 'Circumference & bodyweight',
                summaryBullets: latestM ? [
                  `Bodyweight: ${unit === 'kg' ? latestM.bodyweightKg : latestM.bodyweightLbs} ${unit}`,
                  latestM.armsPumpedCm || latestM.armsCm ? `Arms: ${latestM.armsPumpedCm || latestM.armsCm} cm` : 'Arms logged',
                  latestM.chestPumpedCm || latestM.chestCm ? `Chest: ${latestM.chestPumpedCm || latestM.chestCm} cm` : 'Chest logged',
                  `${measurements.length} logged checkpoints in vault`
                ] : ['Consistent hypertrophy tracking on GymPax'],
                defaultMessage: `Logged my latest physique measurements on GymPax! Current weight: ${latestM ? `${unit === 'kg' ? latestM.bodyweightKg : latestM.bodyweightLbs} ${unit}` : ''}. Accountability is key! 📏`
              }, 'Share Body Measurements Progress')}

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="px-3 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>How to Measure</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Log Measurements</span>
              </button>
            </div>
          </div>

          {/* Quick Delta Cards */}
          {latestM && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Bodyweight */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Bodyweight</span>
                    <button
                      type="button"
                      onClick={() => setExplainingMuscleKey('weight')}
                      className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 border border-zinc-750 flex items-center justify-center text-[9px] font-bold cursor-pointer transition-colors"
                      title="How to correctly measure bodyweight"
                    >
                      ?
                    </button>
                  </div>
                  <TermHelpTooltip termId="bmi" size="xs" />
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-mono text-xl font-bold text-zinc-100 tabular-nums">
                    {unit === 'kg' ? latestM.bodyweightKg : latestM.bodyweightLbs}
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">{unit}</span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                  {weightDelta >= 0 ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-red-400" />}
                  <span>{weightDelta >= 0 ? `+${weightDelta}` : weightDelta} {unit} vs prior</span>
                </div>
              </div>

              {/* Arms (Relaxed vs Pumped) */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Arms (Biceps)</span>
                    <button
                      type="button"
                      onClick={() => setExplainingMuscleKey('arms')}
                      className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 border border-zinc-750 flex items-center justify-center text-[9px] font-bold cursor-pointer transition-colors"
                      title="How to correctly measure arms"
                    >
                      ?
                    </button>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400 font-semibold">Rel · Pump</span>
                </div>
                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                    {latestM.armsPumpedCm || latestM.armsCm || '—'}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    / {latestM.armsRelaxedCm || '—'}
                  </span>
                  <span className="text-xs text-zinc-500">cm</span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>{armDelta >= 0 ? `+${armDelta}` : armDelta} cm trend</span>
                  {latestM.armsPumpedCm && latestM.armsRelaxedCm && (
                    <span className="text-[9px] font-mono text-emerald-400">
                      +{Math.round((latestM.armsPumpedCm - latestM.armsRelaxedCm) * 10) / 10}cm pump
                    </span>
                  )}
                </div>
              </div>

              {/* Chest (Relaxed vs Pumped) */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Chest Shelf</span>
                    <button
                      type="button"
                      onClick={() => setExplainingMuscleKey('chest')}
                      className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 border border-zinc-750 flex items-center justify-center text-[9px] font-bold cursor-pointer transition-colors"
                      title="How to correctly measure chest"
                    >
                      ?
                    </button>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400 font-semibold">Rel · Pump</span>
                </div>
                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                    {latestM.chestPumpedCm || latestM.chestCm || '—'}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    / {latestM.chestRelaxedCm || '—'}
                  </span>
                  <span className="text-xs text-zinc-500">cm</span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>{chestDelta >= 0 ? `+${chestDelta}` : chestDelta} cm trend</span>
                  {latestM.chestPumpedCm && latestM.chestRelaxedCm && (
                    <span className="text-[9px] font-mono text-emerald-400">
                      +{Math.round((latestM.chestPumpedCm - latestM.chestRelaxedCm) * 10) / 10}cm pump
                    </span>
                  )}
                </div>
              </div>

              {/* Thighs (Quads) */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Thighs (Quads)</span>
                    <button
                      type="button"
                      onClick={() => setExplainingMuscleKey('thighs')}
                      className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 border border-zinc-750 flex items-center justify-center text-[9px] font-bold cursor-pointer transition-colors"
                      title="How to correctly measure thighs"
                    >
                      ?
                    </button>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400 font-semibold">Rel · Pump</span>
                </div>
                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                    {latestM.thighsPumpedCm || latestM.thighsCm || '—'}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    / {latestM.thighsRelaxedCm || '—'}
                  </span>
                  <span className="text-xs text-zinc-500">cm</span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>Waist: {latestM.waistRelaxedCm || latestM.waistCm || '—'}cm</span>
                  {latestM.thighsPumpedCm && latestM.thighsRelaxedCm && (
                    <span className="text-[9px] font-mono text-emerald-400">
                      +{Math.round((latestM.thighsPumpedCm - latestM.thighsRelaxedCm) * 10) / 10}cm pump
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* History Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-zinc-850">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
              Circumference History ({measurements.length} sessions logged)
            </span>

            {/* State filter: Both States / Relaxed Only / Pumped Only */}
            <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMeasurementFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  measurementFilter === 'all'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Both States
              </button>
              <button
                type="button"
                onClick={() => setMeasurementFilter('relaxed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  measurementFilter === 'relaxed'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Relaxed
              </button>
              <button
                type="button"
                onClick={() => setMeasurementFilter('pumped')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  measurementFilter === 'pumped'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Pumped / Tensed
              </button>
            </div>
          </div>

          {/* Mobile Card List (Multi-muscle Relaxed & Pumped) */}
          <div className="sm:hidden space-y-3">
            {measurements.map(m => (
              <div key={m.id} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-zinc-800/80">
                  <span className="font-mono text-zinc-400 font-medium">{m.date}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {unit === 'kg' ? m.bodyweightKg : m.bodyweightLbs} {unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  {/* Arms */}
                  <div className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase block font-sans font-bold">Arms</span>
                      <button
                        type="button"
                        onClick={() => setExplainingMuscleKey('arms')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                        title="How to correctly measure arms"
                      >
                        ?
                      </button>
                    </div>
                    <span className="text-zinc-200 block mt-0.5">
                      {measurementFilter === 'relaxed'
                        ? `${m.armsRelaxedCm || '—'} cm`
                        : measurementFilter === 'pumped'
                        ? `${m.armsPumpedCm || m.armsCm || '—'} cm`
                        : `${m.armsRelaxedCm || '—'} rel · ${m.armsPumpedCm || m.armsCm || '—'} pmp`}
                    </span>
                  </div>

                  {/* Forearms */}
                  <div className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase block font-sans font-bold">Forearms</span>
                      <button
                        type="button"
                        onClick={() => setExplainingMuscleKey('forearms')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                        title="How to correctly measure forearms"
                      >
                        ?
                      </button>
                    </div>
                    <span className="text-zinc-200 block mt-0.5">
                      {measurementFilter === 'relaxed'
                        ? `${m.forearmsRelaxedCm || '—'} cm`
                        : measurementFilter === 'pumped'
                        ? `${m.forearmsPumpedCm || '—'} cm`
                        : `${m.forearmsRelaxedCm || '—'} rel · ${m.forearmsPumpedCm || '—'} pmp`}
                    </span>
                  </div>

                  {/* Chest */}
                  <div className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase block font-sans font-bold">Chest</span>
                      <button
                        type="button"
                        onClick={() => setExplainingMuscleKey('chest')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                        title="How to correctly measure chest"
                      >
                        ?
                      </button>
                    </div>
                    <span className="text-zinc-200 block mt-0.5">
                      {measurementFilter === 'relaxed'
                        ? `${m.chestRelaxedCm || '—'} cm`
                        : measurementFilter === 'pumped'
                        ? `${m.chestPumpedCm || m.chestCm || '—'} cm`
                        : `${m.chestRelaxedCm || '—'} rel · ${m.chestPumpedCm || m.chestCm || '—'} pmp`}
                    </span>
                  </div>

                  {/* Shoulders */}
                  <div className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase block font-sans font-bold">Shoulders</span>
                      <button
                        type="button"
                        onClick={() => setExplainingMuscleKey('shoulders')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                        title="How to correctly measure shoulders"
                      >
                        ?
                      </button>
                    </div>
                    <span className="text-zinc-200 block mt-0.5">
                      {measurementFilter === 'relaxed'
                        ? `${m.shouldersRelaxedCm || '—'} cm`
                        : measurementFilter === 'pumped'
                        ? `${m.shouldersPumpedCm || m.shouldersCm || '—'} cm`
                        : `${m.shouldersRelaxedCm || '—'} rel · ${m.shouldersPumpedCm || m.shouldersCm || '—'} pmp`}
                    </span>
                  </div>

                  {/* Waist */}
                  <div className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase block font-sans font-bold">Waist</span>
                      <button
                        type="button"
                        onClick={() => setExplainingMuscleKey('waist')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                        title="How to correctly measure waist"
                      >
                        ?
                      </button>
                    </div>
                    <span className="text-zinc-200 block mt-0.5">
                      {measurementFilter === 'relaxed'
                        ? `${m.waistRelaxedCm || m.waistCm || '—'} cm`
                        : measurementFilter === 'pumped'
                        ? `${m.waistTensedCm || '—'} cm`
                        : `${m.waistRelaxedCm || m.waistCm || '—'} rel · ${m.waistTensedCm || '—'} vac`}
                    </span>
                  </div>

                  {/* Thighs */}
                  <div className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase block font-sans font-bold">Thighs</span>
                      <button
                        type="button"
                        onClick={() => setExplainingMuscleKey('thighs')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                        title="How to correctly measure thighs"
                      >
                        ?
                      </button>
                    </div>
                    <span className="text-zinc-200 block mt-0.5">
                      {measurementFilter === 'relaxed'
                        ? `${m.thighsRelaxedCm || '—'} cm`
                        : measurementFilter === 'pumped'
                        ? `${m.thighsPumpedCm || m.thighsCm || '—'} cm`
                        : `${m.thighsRelaxedCm || '—'} rel · ${m.thighsPumpedCm || m.thighsCm || '—'} pmp`}
                    </span>
                  </div>

                  {/* Calves */}
                  <div className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-850 col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase block font-sans font-bold">Calves</span>
                      <button
                        type="button"
                        onClick={() => setExplainingMuscleKey('calves')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                        title="How to correctly measure calves"
                      >
                        ?
                      </button>
                    </div>
                    <span className="text-zinc-200 block mt-0.5">
                      {measurementFilter === 'relaxed'
                        ? `${m.calvesRelaxedCm || '—'} cm`
                        : measurementFilter === 'pumped'
                        ? `${m.calvesPumpedCm || '—'} cm`
                        : `${m.calvesRelaxedCm || '—'} rel · ${m.calvesPumpedCm || '—'} pmp`}
                    </span>
                  </div>
                </div>

                {m.notes && <p className="text-[11px] text-zinc-400 italic font-sans">{m.notes}</p>}
              </div>
            ))}
          </div>

          {/* Desktop Measurements History Table */}
          <div className="hidden sm:block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800 bg-zinc-950/60 text-[11px]">
                    <th className="py-3 px-3 font-semibold">DATE</th>
                    <th className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>WEIGHT</span>
                        <button
                          type="button"
                          onClick={() => setExplainingMuscleKey('weight')}
                          className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                          title="How to correctly measure weight"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>ARMS</span>
                        <button
                          type="button"
                          onClick={() => setExplainingMuscleKey('arms')}
                          className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                          title="How to correctly measure arms"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>FOREARMS</span>
                        <button
                          type="button"
                          onClick={() => setExplainingMuscleKey('forearms')}
                          className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                          title="How to correctly measure forearms"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>CHEST</span>
                        <button
                          type="button"
                          onClick={() => setExplainingMuscleKey('chest')}
                          className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                          title="How to correctly measure chest"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>SHOULDERS</span>
                        <button
                          type="button"
                          onClick={() => setExplainingMuscleKey('shoulders')}
                          className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                          title="How to correctly measure shoulders"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>WAIST</span>
                        <button
                          type="button"
                          onClick={() => setExplainingMuscleKey('waist')}
                          className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                          title="How to correctly measure waist"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>THIGHS</span>
                        <button
                          type="button"
                          onClick={() => setExplainingMuscleKey('thighs')}
                          className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                          title="How to correctly measure thighs"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>CALVES</span>
                        <button
                          type="button"
                          onClick={() => setExplainingMuscleKey('calves')}
                          className="w-3.5 h-3.5 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-colors"
                          title="How to correctly measure calves"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold">NOTES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {measurements.map(m => (
                    <tr key={m.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-zinc-400 whitespace-nowrap">{m.date}</td>
                      <td className="py-3 px-3 font-bold text-zinc-100 whitespace-nowrap">
                        {unit === 'kg' ? m.bodyweightKg : m.bodyweightLbs} {unit}
                      </td>
                      {/* Arms */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {measurementFilter === 'relaxed'
                          ? m.armsRelaxedCm ? `${m.armsRelaxedCm} cm` : '—'
                          : measurementFilter === 'pumped'
                          ? (m.armsPumpedCm || m.armsCm) ? `${m.armsPumpedCm || m.armsCm} cm` : '—'
                          : (
                            <div>
                              <span>{m.armsRelaxedCm || '—'}r</span>
                              <span className="text-zinc-500"> / </span>
                              <span className="text-amber-300 font-bold">{m.armsPumpedCm || m.armsCm || '—'}p</span>
                            </div>
                          )}
                      </td>
                      {/* Forearms */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {measurementFilter === 'relaxed'
                          ? m.forearmsRelaxedCm ? `${m.forearmsRelaxedCm} cm` : '—'
                          : measurementFilter === 'pumped'
                          ? m.forearmsPumpedCm ? `${m.forearmsPumpedCm} cm` : '—'
                          : (
                            <div>
                              <span>{m.forearmsRelaxedCm || '—'}r</span>
                              <span className="text-zinc-500"> / </span>
                              <span className="text-amber-300 font-bold">{m.forearmsPumpedCm || '—'}p</span>
                            </div>
                          )}
                      </td>
                      {/* Chest */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {measurementFilter === 'relaxed'
                          ? m.chestRelaxedCm ? `${m.chestRelaxedCm} cm` : '—'
                          : measurementFilter === 'pumped'
                          ? (m.chestPumpedCm || m.chestCm) ? `${m.chestPumpedCm || m.chestCm} cm` : '—'
                          : (
                            <div>
                              <span>{m.chestRelaxedCm || '—'}r</span>
                              <span className="text-zinc-500"> / </span>
                              <span className="text-amber-300 font-bold">{m.chestPumpedCm || m.chestCm || '—'}p</span>
                            </div>
                          )}
                      </td>
                      {/* Shoulders */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {measurementFilter === 'relaxed'
                          ? m.shouldersRelaxedCm ? `${m.shouldersRelaxedCm} cm` : '—'
                          : measurementFilter === 'pumped'
                          ? (m.shouldersPumpedCm || m.shouldersCm) ? `${m.shouldersPumpedCm || m.shouldersCm} cm` : '—'
                          : (
                            <div>
                              <span>{m.shouldersRelaxedCm || '—'}r</span>
                              <span className="text-zinc-500"> / </span>
                              <span className="text-amber-300 font-bold">{m.shouldersPumpedCm || m.shouldersCm || '—'}p</span>
                            </div>
                          )}
                      </td>
                      {/* Waist */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {measurementFilter === 'relaxed'
                          ? (m.waistRelaxedCm || m.waistCm) ? `${m.waistRelaxedCm || m.waistCm} cm` : '—'
                          : measurementFilter === 'pumped'
                          ? m.waistTensedCm ? `${m.waistTensedCm} cm` : '—'
                          : (
                            <div>
                              <span>{m.waistRelaxedCm || m.waistCm || '—'}r</span>
                              <span className="text-zinc-500"> / </span>
                              <span className="text-emerald-400 font-bold">{m.waistTensedCm || '—'}v</span>
                            </div>
                          )}
                      </td>
                      {/* Thighs */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {measurementFilter === 'relaxed'
                          ? m.thighsRelaxedCm ? `${m.thighsRelaxedCm} cm` : '—'
                          : measurementFilter === 'pumped'
                          ? (m.thighsPumpedCm || m.thighsCm) ? `${m.thighsPumpedCm || m.thighsCm} cm` : '—'
                          : (
                            <div>
                              <span>{m.thighsRelaxedCm || '—'}r</span>
                              <span className="text-zinc-500"> / </span>
                              <span className="text-amber-300 font-bold">{m.thighsPumpedCm || m.thighsCm || '—'}p</span>
                            </div>
                          )}
                      </td>
                      {/* Calves */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {measurementFilter === 'relaxed'
                          ? m.calvesRelaxedCm ? `${m.calvesRelaxedCm} cm` : '—'
                          : measurementFilter === 'pumped'
                          ? m.calvesPumpedCm ? `${m.calvesPumpedCm} cm` : '—'
                          : (
                            <div>
                              <span>{m.calvesRelaxedCm || '—'}r</span>
                              <span className="text-zinc-500"> / </span>
                              <span className="text-amber-300 font-bold">{m.calvesPumpedCm || '—'}p</span>
                            </div>
                          )}
                      </td>
                      {/* Notes */}
                      <td className="py-3 px-3 text-zinc-400 font-sans text-xs truncate max-w-[140px]">
                        {m.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: CALENDAR */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          <WorkoutCalendarView
            workoutHistory={workoutHistory}
            unit={unit}
            onStartRoutineFromPast={onStartRoutineFromPast}
            onOpenShareModal={onOpenShareModal}
            onStartQuickWorkout={onStartQuickWorkout}
          />

          {/* Muscle Group Volume Distribution */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Direct Weekly Working Sets by Muscle</h3>
              <p className="text-xs text-zinc-400">Target: 12-20 sets per muscle for peak hypertrophy</p>
            </div>

            <div className="space-y-3">
              {[
                { muscle: 'Chest (Pectorals)', sets: 18, target: 20, pct: 90 },
                { muscle: 'Back (Lats & Rhomboids)', sets: 19, target: 20, pct: 95 },
                { muscle: 'Quads & Hamstrings', sets: 16, target: 20, pct: 80 },
                { muscle: 'Deltoids (Shoulders)', sets: 15, target: 18, pct: 83 },
                { muscle: 'Arms (Biceps & Triceps)', sets: 14, target: 16, pct: 87 }
              ].map(item => (
                <div key={item.muscle} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">{item.muscle}</span>
                    <span className="font-mono text-zinc-400">
                      <strong className="text-zinc-100">{item.sets}</strong> / {item.target} sets
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: SESSIONS (TRAINING HISTORY) */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-5">
          {/* History Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Training History & Sessions</span>
                <span className="text-xs font-mono font-normal text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  {workoutHistory.length} Sessions
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review completed workout sessions, total volume, progressive load, and training consistency.
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip for History */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                Total Sessions
              </span>
              <span className="font-mono text-xl font-extrabold text-zinc-100 tabular-nums">
                {workoutHistory.length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                Total Volume Lifted
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl font-extrabold text-zinc-100 tabular-nums">
                  {displayVolume}
                </span>
                <span className="text-xs text-amber-400 font-semibold">{unit}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                Total Sets Logged
              </span>
              <span className="font-mono text-xl font-extrabold text-zinc-100 tabular-nums">
                {totalSets}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                PRs Achieved
              </span>
              <span className="font-mono text-xl font-extrabold text-amber-400 tabular-nums">
                {personalRecords.length}
              </span>
            </div>
          </div>

          {/* Workout History Sessions List */}
          <div className="space-y-3">
            {/* Search filter input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search past sessions by workout name, date, or exercise..."
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {historySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Shortcut to Graphs & Analytics */}
              <button
                type="button"
                onClick={() => setActiveSubTab('graphs')}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 flex items-center gap-2 text-xs text-amber-400 font-medium cursor-pointer transition-colors shrink-0"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>View Detailed Graphs</span>
              </button>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-10 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
                <p className="text-xs text-zinc-400">
                  {historySearchQuery ? 'No workout sessions matched your search.' : 'No workout sessions logged yet.'}
                </p>
                {onNavigateToWorkout && (
                  <button
                    type="button"
                    onClick={onNavigateToWorkout}
                    className="px-4 py-2 rounded-xl bg-[#F6721D] text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md hover:brightness-110 transition-all"
                  >
                    Start Your First Workout
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredHistory.slice(0, visibleSessionsCount).map(w => {
                  const displayVol =
                    unit === 'kg'
                      ? Math.round(w.totalVolumeKg).toLocaleString()
                      : Math.round(w.totalVolumeKg * 2.20462).toLocaleString();

                  const completedSets = w.exercises.reduce(
                    (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
                    0
                  );

                  return (
                    <div
                      key={w.id}
                      onClick={() => onViewHistoryItem ? onViewHistoryItem(w) : undefined}
                      className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-sm group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                            {w.title}
                          </h4>
                          {w.prCount ? (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-mono">
                              <Trophy className="w-3 h-3" />
                              <span>{w.prCount} PR{w.prCount > 1 ? 's' : ''}</span>
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
                          <span>{w.date}</span>
                          <span aria-hidden="true" className="text-zinc-600">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{Math.floor(w.durationSeconds / 60)} mins</span>
                          </span>
                          <span aria-hidden="true" className="text-zinc-600">·</span>
                          <span>{completedSets} sets</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-mono text-sm sm:text-base font-bold text-zinc-100">
                            {displayVol}
                          </span>
                          <span className="text-[10px] text-zinc-400 block font-medium uppercase">{unit}</span>
                        </div>

                        {/* Quick repeat or share buttons */}
                        <div className="flex items-center gap-1">
                          {onStartRoutineFromPast && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartRoutineFromPast(w);
                              }}
                              title="Repeat this workout"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <Dumbbell className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onOpenShareModal && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenShareModal(w);
                              }}
                              title="Share workout"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="p-1.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredHistory.length > 5 && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-850">
                <span className="text-xs font-mono text-zinc-400">
                  Showing <strong className="text-zinc-200">{Math.min(visibleSessionsCount, filteredHistory.length)}</strong> of{' '}
                  <strong className="text-zinc-200">{filteredHistory.length}</strong> sessions
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  {visibleSessionsCount > 5 && (
                    <button
                      type="button"
                      onClick={() => setVisibleSessionsCount(5)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Collapse to 5</span>
                    </button>
                  )}

                  {visibleSessionsCount < filteredHistory.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleSessionsCount(prev => prev + 5)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Load 5 More Sessions</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

        </div>
      )}

      {/* Add Measurement Modal */}
      {showAddModal && (
        <AddMeasurementModal
          unit={unit}
          onClose={() => setShowAddModal(false)}
          onSave={m => onAddMeasurement(m)}
        />
      )}

      {/* Measurement Protocol Guide Modal */}
      <MeasurementGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Specific Muscle Measurement Explanation Popup */}
      <MuscleMeasurementExplanationModal
        isOpen={!!explainingMuscleKey}
        muscleKey={explainingMuscleKey}
        onClose={() => setExplainingMuscleKey(null)}
      />

      {/* Share Progress Stage Popup Modal */}
      <ShareProgressStageModal
        isOpen={!!stageToShare}
        onClose={() => setStageToShare(null)}
        stageData={stageToShare}
        userProfile={userProfile}
        onShared={(stage, targetNames) => {
          const targets = targetNames.includes('All Connections') ? 'all connections' : targetNames.join(', ');
          setShareSuccessBanner(`"${stage.title}" milestone shared with ${targets}!`);
          setTimeout(() => setShareSuccessBanner(null), 4000);
        }}
      />

      {/* Floating Share Toast Notification */}
      {shareSuccessBanner && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareSuccessBanner}</span>
        </div>
      )}
    </div>
  );
};
