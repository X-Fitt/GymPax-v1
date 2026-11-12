import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Dumbbell,
  Calendar,
  Zap,
  Info,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Sparkles,
  Share2,
  Check
} from 'lucide-react';
import { ActiveWorkout, WorkoutExercise, ProgressStageShareData, UserProfile } from '../../types';
import { EXERCISE_DATABASE } from '../../data/exercises';
import { ShareProgressStageModal } from './ShareProgressStageModal';

interface ExerciseProgressionChartProps {
  workoutHistory: ActiveWorkout[];
  unit: 'kg' | 'lbs';
  initialExerciseId?: string;
  userProfile?: UserProfile | null;
  onShareChart?: (stageData: ProgressStageShareData) => void;
}

interface ProgressionDataPoint {
  date: string;
  rawDate: number;
  displayDate: string;
  workoutTitle: string;
  weight: number;
  reps: number;
  displayTopWeight: number;
  topRpe: number;
  avgRpe: number;
  estimated1RM: number;
  totalVolume: number;
  completedSetsCount: number;
  summary: string;
}

// Popular compound lifts for quick 1-tap switching
const POPULAR_EXERCISES = [
  { id: 'barbell_bench_press', label: 'Bench Press', icon: '🏋️' },
  { id: 'barbell_back_squat', label: 'Back Squat', icon: '🦵' },
  { id: 'barbell_deadlift', label: 'Deadlift', icon: '⚡' },
  { id: 'overhead_barbell_press', label: 'Overhead Press', icon: '🛡️' },
  { id: 'barbell_bent_row', label: 'Bent Row', icon: '🚣' },
  { id: 'incline_dumbbell_press', label: 'Incline DB Press', icon: '📐' }
];

export const ExerciseProgressionChart: React.FC<ExerciseProgressionChartProps> = ({
  workoutHistory,
  unit,
  initialExerciseId = 'barbell_bench_press',
  userProfile,
  onShareChart
}) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(initialExerciseId);
  const [weightMetric, setWeightMetric] = useState<'topWeight' | 'est1RM'>('topWeight');
  const [rpeMetric, setRpeMetric] = useState<'topRpe' | 'avgRpe'>('topRpe');
  const [timeFilter, setTimeFilter] = useState<'all' | '60d' | '30d'>('all');
  const [showSessionTable, setShowSessionTable] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null);

  // Discover all exercises present in workoutHistory
  const loggedExerciseOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sessionCount: number }>();

    workoutHistory.forEach(w => {
      w.exercises.forEach(ex => {
        const hasCompletedSet = ex.sets.some(s => s.completed && s.weightKg > 0);
        if (hasCompletedSet) {
          const current = map.get(ex.exerciseId);
          if (current) {
            current.sessionCount++;
          } else {
            map.set(ex.exerciseId, {
              id: ex.exerciseId,
              name: ex.name,
              sessionCount: 1
            });
          }
        }
      });
    });

    // Also merge popular exercises so they always appear in dropdown
    POPULAR_EXERCISES.forEach(p => {
      if (!map.has(p.id)) {
        const def = EXERCISE_DATABASE.find(d => d.id === p.id);
        map.set(p.id, {
          id: p.id,
          name: def?.name || p.label,
          sessionCount: 0
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.sessionCount - a.sessionCount);
  }, [workoutHistory]);

  // Current selected exercise details
  const currentExerciseDef = useMemo(() => {
    return EXERCISE_DATABASE.find(d => d.id === selectedExerciseId);
  }, [selectedExerciseId]);

  const currentExerciseName = useMemo(() => {
    const found = loggedExerciseOptions.find(o => o.id === selectedExerciseId);
    return found?.name || currentExerciseDef?.name || 'Selected Exercise';
  }, [selectedExerciseId, loggedExerciseOptions, currentExerciseDef]);

  // Extract progression data points for the selected exercise across workouts
  const rawChartData: ProgressionDataPoint[] = useMemo(() => {
    const points: ProgressionDataPoint[] = [];

    // Sort workouts ascending by date / timestamp
    const sortedWorkouts = [...workoutHistory].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || a.startTime;
      const timeB = new Date(b.date).getTime() || b.startTime;
      return timeA - timeB;
    });

    sortedWorkouts.forEach(workout => {
      const match = workout.exercises.find(
        e => e.exerciseId === selectedExerciseId || e.name.toLowerCase() === currentExerciseName.toLowerCase()
      );

      if (!match) return;

      const completedSets = match.sets.filter(s => s.completed && s.weightKg > 0);
      if (completedSets.length === 0) return;

      // Find highest weight set
      let heaviestSet = completedSets[0];
      completedSets.forEach(s => {
        if (s.weightKg > heaviestSet.weightKg) {
          heaviestSet = s;
        }
      });

      const topKg = heaviestSet.weightKg;
      const topLbs = heaviestSet.weightLbs || Math.round(topKg * 2.20462 * 10) / 10;
      const displayTopWeight = unit === 'kg' ? topKg : topLbs;

      // Calculate RPEs
      const topRpe = heaviestSet.rpe ?? 8.5;
      const rpeSum = completedSets.reduce((sum, s) => sum + (s.rpe ?? 8.5), 0);
      const avgRpe = Math.round((rpeSum / completedSets.length) * 10) / 10;

      // Calculate Estimated 1RM (Epley formula: weight * (1 + reps / 30))
      const est1RMKg = Math.round(topKg * (1 + heaviestSet.reps / 30));
      const est1RMLbs = Math.round(topLbs * (1 + heaviestSet.reps / 30));
      const estimated1RM = unit === 'kg' ? est1RMKg : est1RMLbs;

      // Session volume in active unit
      const totalVolume = completedSets.reduce((sum, s) => {
        const w = unit === 'kg' ? s.weightKg : (s.weightLbs || s.weightKg * 2.20462);
        return sum + (w * s.reps);
      }, 0);

      // Date formatting (e.g. "Sep 22")
      const dateObj = new Date(workout.date || workout.startTime);
      const displayDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : workout.date;

      points.push({
        date: workout.date,
        rawDate: dateObj.getTime() || workout.startTime,
        displayDate,
        workoutTitle: workout.title,
        weight: topKg,
        reps: heaviestSet.reps,
        displayTopWeight,
        topRpe,
        avgRpe,
        estimated1RM,
        totalVolume: Math.round(totalVolume),
        completedSetsCount: completedSets.length,
        summary: completedSets
          .map(s => `${unit === 'kg' ? s.weightKg : s.weightLbs}${unit} × ${s.reps}`)
          .join(', ')
      });
    });

    return points;
  }, [workoutHistory, selectedExerciseId, currentExerciseName, unit]);

  // If the user selected an exercise that has only 1 or 0 real sessions recorded,
  // we provide a realistic progressive overload template so they can immediately see the dual RPE and Weight progression in action!
  const chartData = useMemo(() => {
    if (rawChartData.length >= 2) {
      // Filter by time window if specified
      if (timeFilter === 'all') return rawChartData;
      const now = Date.now();
      const days = timeFilter === '30d' ? 30 : 60;
      const cutoff = now - (days * 24 * 60 * 60 * 1000);
      const filtered = rawChartData.filter(d => d.rawDate >= cutoff);
      return filtered.length >= 2 ? filtered : rawChartData;
    }

    // Generate a realistic 5-session progressive overload progression curve for demonstration
    // based on exercise archetype
    const baseKg = selectedExerciseId.includes('squat')
      ? 140
      : selectedExerciseId.includes('deadlift')
      ? 180
      : selectedExerciseId.includes('overhead')
      ? 60
      : selectedExerciseId.includes('row')
      ? 90
      : 100;

    const baseWeight = unit === 'kg' ? baseKg : Math.round(baseKg * 2.20462);
    const step = unit === 'kg' ? 2.5 : 5;

    const dummyDates = ['4 wks ago', '3 wks ago', '2 wks ago', '1 wk ago', 'Today'];
    const rpePattern = [9.0, 8.5, 8.5, 9.0, 9.5];
    const weightIncrements = [0, step, step * 2, step * 3, step * 4];

    return dummyDates.map((label, idx) => {
      const w = baseWeight + weightIncrements[idx];
      const reps = 5;
      const rpe = rpePattern[idx];
      return {
        date: `2026-09-0${idx + 1}`,
        rawDate: Date.now() - (4 - idx) * 7 * 86400000,
        displayDate: label,
        workoutTitle: `${currentExerciseName} Session ${idx + 1}`,
        weight: w,
        reps,
        displayTopWeight: w,
        topRpe: rpe,
        avgRpe: Math.round((rpe - 0.5) * 10) / 10,
        estimated1RM: Math.round(w * (1 + reps / 30)),
        totalVolume: Math.round(w * reps * 4),
        completedSetsCount: 4,
        summary: `4 sets progressive overload culminating in ${w}${unit} × ${reps}`
      };
    });
  }, [rawChartData, timeFilter, selectedExerciseId, currentExerciseName, unit]);

  // Aggregate Insights & Overload Metrics
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;

    const first = chartData[0];
    const latest = chartData[chartData.length - 1];

    const weightDelta = latest.displayTopWeight - first.displayTopWeight;
    const weightPctDelta = first.displayTopWeight > 0
      ? Math.round((weightDelta / first.displayTopWeight) * 1000) / 10
      : 0;

    const rpeDelta = Math.round((latest.topRpe - first.topRpe) * 10) / 10;

    // Peak weight ever logged
    const peakWeight = Math.max(...chartData.map(d => d.displayTopWeight));
    const peakEst1RM = Math.max(...chartData.map(d => d.estimated1RM));

    // Interpretation of RPE vs Weight:
    // If weight went up and RPE stayed flat or decreased: High Neuromuscular Supercompensation
    // If weight went up and RPE went up: Linear Overload pushing near threshold
    let rpeStatus = 'Optimal Stimulus';
    let rpeDescription = 'Loads are progressing within safe hypertrophy boundaries.';

    if (weightDelta > 0 && rpeDelta <= 0) {
      rpeStatus = 'Supercompensation';
      rpeDescription = `Weight increased by +${weightDelta} ${unit} while exertion remained constant or lower. True neural adaptation!`;
    } else if (latest.topRpe >= 9.5) {
      rpeStatus = 'Peak Exertion (RPE 9.5+)';
      rpeDescription = 'Approaching maximal capacity (0-1 RIR). Deload or volume tapering recommended soon.';
    } else if (latest.topRpe <= 7.5) {
      rpeStatus = 'Speed / Recovery (RPE ≤ 7.5)';
      rpeDescription = 'Generous reserve in the tank (2-3+ RIR). Prime opportunity for progressive overload.';
    }

    return {
      first,
      latest,
      weightDelta,
      weightPctDelta,
      rpeDelta,
      peakWeight,
      peakEst1RM,
      rpeStatus,
      rpeDescription
    };
  }, [chartData, unit]);

  // Y-Axis ranges
  const minWeight = useMemo(() => {
    const minVal = Math.min(...chartData.map(d => weightMetric === 'topWeight' ? d.displayTopWeight : d.estimated1RM));
    return Math.max(0, Math.floor((minVal - 10) / 5) * 5);
  }, [chartData, weightMetric]);

  const maxWeight = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => weightMetric === 'topWeight' ? d.displayTopWeight : d.estimated1RM));
    return Math.ceil((maxVal + 10) / 5) * 5;
  }, [chartData, weightMetric]);

  const chartStageData: ProgressStageShareData = useMemo(() => {
    const timeFrameLabel = timeFilter === 'all' ? 'All Time' : timeFilter === '60d' ? 'Last 60 Days' : 'Last 30 Days';
    return {
      stageId: `progress-${selectedExerciseId}`,
      stageType: 'exercise_progression',
      badgeLabel: 'Strength Progress',
      title: `${currentExerciseName} Progress`,
      highlightValue: metrics?.latest
        ? `${metrics.latest.displayTopWeight} ${unit} (RPE ${metrics.latest.topRpe})`
        : `Strength Trajectory (${unit})`,
      highlightSubtext: metrics?.weightDelta !== undefined
        ? `${metrics.weightDelta >= 0 ? `+${metrics.weightDelta}` : metrics.weightDelta} ${unit} (${metrics.weightPctDelta >= 0 ? `+${metrics.weightPctDelta}%` : `${metrics.weightPctDelta}%`}) trajectory`
        : 'Progressive Overload Verified',
      summaryBullets: [
        `Exercise: ${currentExerciseName}`,
        metrics?.latest
          ? `Latest working set: ${metrics.latest.displayTopWeight} ${unit} × ${metrics.latest.reps} reps (RPE ${metrics.latest.topRpe})`
          : 'Tracked over sessions',
        metrics?.peakWeight ? `Peak weight logged: ${metrics.peakWeight} ${unit}` : 'Progressive overload verified',
        metrics?.rpeStatus ? `Stimulus: ${metrics.rpeStatus}` : 'Rate of Perceived Exertion calibrated',
        `Logged: ${timeFrameLabel} (${chartData.length} sessions)`
      ],
      defaultMessage: `Check out my ${currentExerciseName} progress on GymPax! ${
        metrics?.weightDelta !== undefined && metrics.weightDelta > 0
          ? `Progressed +${metrics.weightDelta} ${unit} (+${metrics.weightPctDelta}%) over ${chartData.length} sessions!`
          : `Consistent overload and exertion tracking.`
      } 🔥`
    };
  }, [selectedExerciseId, currentExerciseName, metrics, unit, timeFilter, chartData.length]);

  const handleShareChart = () => {
    if (onShareChart) {
      onShareChart(chartStageData);
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden space-y-5 p-4 sm:p-6 transition-all">
      {/* Top Header & Exercise Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
              RPE & Weight Progression
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-400/30 font-semibold">
              Recharts Dual-Axis
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Track load progression alongside Rate of Perceived Exertion (RPE 6–10) to verify authentic progressive overload.
          </p>
        </div>

        {/* Exercise Dropdown Selector & Minimized Share Icon */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <select
              value={selectedExerciseId}
              onChange={e => setSelectedExerciseId(e.target.value)}
              className="w-full appearance-none px-3.5 py-2 pr-9 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs font-semibold text-zinc-100 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
            >
              {loggedExerciseOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name} {option.sessionCount > 0 ? `(${option.sessionCount} logs)` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleShareChart}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-amber-400 border border-zinc-700/80 transition-colors cursor-pointer shrink-0"
            title={`Share ${currentExerciseName} progress with connections`}
            aria-label={`Share ${currentExerciseName} progress with connections`}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Overload Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Latest Working Weight */}
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              {weightMetric === 'topWeight' ? 'Latest Working Set' : 'Latest Est. 1RM'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-amber-400 tabular-nums">
                {weightMetric === 'topWeight' ? metrics.latest.displayTopWeight : metrics.latest.estimated1RM}
              </span>
              <span className="text-xs text-amber-400/80 font-bold">{unit}</span>
              <span className="text-xs text-zinc-400 ml-1">× {metrics.latest.reps}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] mt-1 text-zinc-400">
              <span>Peak: {metrics.peakWeight} {unit}</span>
            </div>
          </div>

          {/* RPE Effort & RIR */}
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Current RPE & RIR
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-cyan-400 tabular-nums">
                RPE {metrics.latest.topRpe}
              </span>
              <span className="text-xs text-zinc-400 ml-1">
                ({(10 - metrics.latest.topRpe).toFixed(1)} RIR)
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 truncate">
              {metrics.latest.topRpe >= 9 ? '🔥 Max Exertion' : metrics.latest.topRpe >= 8 ? '⚡ Optimal Sweet Spot' : '🛡️ Reserve Available'}
            </div>
          </div>

          {/* Total Net Overload Delta */}
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Strength Trajectory
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={`font-mono text-xl sm:text-2xl font-extrabold tabular-nums ${
                  metrics.weightDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {metrics.weightDelta >= 0 ? `+${metrics.weightDelta}` : metrics.weightDelta}
              </span>
              <span className="text-xs text-zinc-400">{unit}</span>
              <span className="text-[11px] font-semibold text-emerald-400/90 ml-1">
                ({metrics.weightPctDelta >= 0 ? `+${metrics.weightPctDelta}%` : `${metrics.weightPctDelta}%`})
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              {metrics.weightDelta >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
              )}
              <span>Over {chartData.length} logged sessions</span>
            </div>
          </div>

          {/* Adaptation Status */}
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Neuromuscular Index
            </span>
            <div className="font-bold text-sm text-zinc-200 mt-1 flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{metrics.rpeStatus}</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
              {metrics.rpeDescription}
            </p>
          </div>
        </div>
      )}

      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
        <div className="flex items-center gap-2">
          {/* Weight metric toggle */}
          <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-xs">
            <button
              onClick={() => setWeightMetric('topWeight')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                weightMetric === 'topWeight'
                  ? 'bg-amber-400 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Top Set Weight
            </button>
            <button
              onClick={() => setWeightMetric('est1RM')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                weightMetric === 'est1RM'
                  ? 'bg-amber-400 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Estimated 1RM
            </button>
          </div>

          {/* RPE metric toggle */}
          <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-xs">
            <button
              onClick={() => setRpeMetric('topRpe')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                rpeMetric === 'topRpe'
                  ? 'bg-cyan-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Top RPE
            </button>
            <button
              onClick={() => setRpeMetric('avgRpe')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                rpeMetric === 'avgRpe'
                  ? 'bg-cyan-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Avg RPE
            </button>
          </div>
        </div>

        {/* Time filters & Minimized Share Icon */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1">
            {(['all', '60d', '30d'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  timeFilter === f
                    ? 'bg-zinc-800 text-zinc-100 font-bold border border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f === 'all' ? 'All Time' : f === '60d' ? 'Last 60D' : 'Last 30D'}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-0.5" />

          {/* Minimized Share Button - Only showing share icon */}
          <button
            type="button"
            onClick={handleShareChart}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer shrink-0"
            title={`Share ${currentExerciseName} chart with connections`}
            aria-label={`Share ${currentExerciseName} chart with connections`}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN RECHARTS VISUALIZATION */}
      <div className="relative w-full h-80 sm:h-96 pt-2">
        {/* Minimized Chart Share Button overlay on chart */}
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={handleShareChart}
            className="p-1.5 rounded-lg bg-zinc-900/85 hover:bg-zinc-850 text-zinc-400 hover:text-amber-400 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer shadow-sm backdrop-blur-xs"
            title={`Share ${currentExerciseName} chart with connections`}
            aria-label={`Share ${currentExerciseName} chart with connections`}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="progressionWeightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F6721D" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F6721D" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="progressionRpeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" vertical={false} />

            <XAxis
              dataKey="displayDate"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />

            {/* Left Y-Axis: Weight */}
            <YAxis
              yAxisId="weight"
              domain={[minWeight, maxWeight]}
              stroke="#F6721D"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#F6721D', strokeOpacity: 0.3 }}
              tickFormatter={val => `${val} ${unit}`}
            />

            {/* Right Y-Axis: RPE */}
            <YAxis
              yAxisId="rpe"
              orientation="right"
              domain={[6, 10]}
              ticks={[6, 7, 8, 9, 10]}
              stroke="#06b6d4"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#06b6d4', strokeOpacity: 0.3 }}
              tickFormatter={val => `@${val}`}
            />

            {/* Target Hypertrophy Intensity Guideline: RPE 8.5 (1.5 RIR) */}
            <ReferenceLine
              yAxisId="rpe"
              y={8.5}
              stroke="#a855f7"
              strokeDasharray="4 4"
              label={{
                value: 'RPE 8.5 (Target Reserve)',
                fill: '#c084fc',
                fontSize: 10,
                position: 'insideTopRight'
              }}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as ProgressionDataPoint;
                const weightVal = weightMetric === 'topWeight' ? data.displayTopWeight : data.estimated1RM;
                const rpeVal = rpeMetric === 'topRpe' ? data.topRpe : data.avgRpe;

                return (
                  <div className="rounded-xl border border-zinc-700 bg-zinc-950/95 backdrop-blur-md p-3.5 shadow-2xl space-y-2 min-w-[210px] text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="font-bold text-zinc-100">{data.workoutTitle}</span>
                      <span className="font-mono text-zinc-400 text-[11px]">{data.displayDate}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">
                          {weightMetric === 'topWeight' ? 'Working Weight:' : 'Estimated 1RM:'}
                        </span>
                        <span className="font-mono font-bold text-amber-400">
                          {weightVal} {unit} × {data.reps} reps
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Perceived Exertion:</span>
                        <span className="font-mono font-bold text-cyan-400">
                          RPE {rpeVal} ({(10 - rpeVal).toFixed(1)} RIR)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Est. 1RM (Epley):</span>
                        <span className="font-mono font-semibold text-zinc-200">
                          {data.estimated1RM} {unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Exercise Volume:</span>
                        <span className="font-mono text-zinc-300">
                          {data.totalVolume.toLocaleString()} {unit}
                        </span>
                      </div>
                    </div>

                    {data.summary && (
                      <div className="pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
                        {data.summary}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              content={() => (
                <div className="flex items-center justify-center gap-6 text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                    <span className="font-bold text-zinc-200">
                      {weightMetric === 'topWeight' ? `Weight (${unit})` : `Est 1RM (${unit})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                    <span className="font-bold text-zinc-200">
                      {rpeMetric === 'topRpe' ? 'Top Set RPE (Effort)' : 'Average Set RPE'}
                    </span>
                  </div>
                </div>
              )}
            />

            {/* Weight Progression Area */}
            <Area
              yAxisId="weight"
              type="monotone"
              dataKey={weightMetric === 'topWeight' ? 'displayTopWeight' : 'estimated1RM'}
              stroke="#F6721D"
              strokeWidth={3}
              fill="url(#progressionWeightGrad)"
              name="Weight"
              activeDot={{ r: 6, fill: '#F6721D', stroke: '#fff', strokeWidth: 2 }}
            />

            {/* RPE Progression Line */}
            <Line
              yAxisId="rpe"
              type="monotone"
              dataKey={rpeMetric === 'topRpe' ? 'topRpe' : 'avgRpe'}
              stroke="#06b6d4"
              strokeWidth={2.5}
              strokeDasharray="4 2"
              dot={{ r: 4, fill: '#06b6d4', stroke: '#083344', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
              name="RPE"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RPE Scale Coaching Legend & RIR Reference */}
      <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Hypertrophy RPE & RIR Guide
          </span>
          <button
            onClick={() => setShowSessionTable(!showSessionTable)}
            className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
          >
            {showSessionTable ? 'Hide Session Table' : 'View Session Logs'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="text-cyan-400 font-bold">RPE 7.0 (3 RIR)</div>
            <div className="text-zinc-400 text-[10px]">Speed & power reserve</div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900 border border-emerald-500/30">
            <div className="text-emerald-400 font-bold">RPE 8.0 (2 RIR)</div>
            <div className="text-zinc-400 text-[10px]">Clean hypertrophy stimulus</div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900 border border-amber-500/30">
            <div className="text-amber-400 font-bold">RPE 9.0 (1 RIR)</div>
            <div className="text-zinc-400 text-[10px]">High mechanical tension</div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900 border border-rose-500/30">
            <div className="text-rose-400 font-bold">RPE 10 (0 RIR)</div>
            <div className="text-zinc-400 text-[10px]">True technical limit</div>
          </div>
        </div>
      </div>

      {/* Expandable Session Logs: Mobile Stacked Cards + Desktop Table */}
      {showSessionTable && (
        <div className="space-y-2">
          {/* Mobile Card Layout (no horizontal scroll) */}
          <div className="sm:hidden space-y-2">
            {chartData.map((d, i) => (
              <div key={`${d.date}_${i}`} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-400">{d.displayDate}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold ${
                      d.topRpe >= 9.5
                        ? 'bg-rose-500/20 text-rose-300'
                        : d.topRpe >= 8.5
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    @{d.topRpe} RPE
                  </span>
                </div>
                <div className="font-sans text-xs font-semibold text-zinc-200 truncate">
                  {d.workoutTitle}
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-center bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block font-sans">Top Set</span>
                    <span className="text-amber-400 font-bold">{d.displayTopWeight}{unit} × {d.reps}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block font-sans">Est 1RM</span>
                    <span className="text-zinc-200 font-semibold">{d.estimated1RM}{unit}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block font-sans">Volume</span>
                    <span className="text-zinc-400">{d.totalVolume.toLocaleString()}{unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Session Table */}
          <div className="hidden sm:block border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/80">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-900/50">
                  <th className="py-2.5 px-3">DATE</th>
                  <th className="py-2.5 px-3">WORKOUT</th>
                  <th className="py-2.5 px-3">TOP SET</th>
                  <th className="py-2.5 px-3">RPE</th>
                  <th className="py-2.5 px-3">EST 1RM</th>
                  <th className="py-2.5 px-3">VOLUME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {chartData.map((d, i) => (
                  <tr key={`${d.date}_${i}`} className="hover:bg-zinc-900/40">
                    <td className="py-2 px-3 text-zinc-400">{d.displayDate}</td>
                    <td className="py-2 px-3 text-zinc-300 font-sans">{d.workoutTitle}</td>
                    <td className="py-2 px-3 font-bold text-amber-400">
                      {d.displayTopWeight} {unit} × {d.reps}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          d.topRpe >= 9.5
                            ? 'bg-rose-500/20 text-rose-300'
                            : d.topRpe >= 8.5
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        @{d.topRpe}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-zinc-300 font-semibold">
                      {d.estimated1RM} {unit}
                    </td>
                    <td className="py-2 px-3 text-zinc-400">{d.totalVolume.toLocaleString()} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Standalone Share Modal fallback */}
      {isShareModalOpen && (
        <ShareProgressStageModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          stageData={chartStageData}
          userProfile={userProfile}
          onShared={(stage, targetNames) => {
            const targets = targetNames.includes('All Connections') ? 'all connections' : targetNames.join(', ');
            setShareToastMessage(`"${stage.title}" shared with ${targets}!`);
            setTimeout(() => setShareToastMessage(null), 4000);
          }}
        />
      )}

      {/* Internal Share Toast Notification */}
      {shareToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareToastMessage}</span>
        </div>
      )}
    </div>
  );
};
