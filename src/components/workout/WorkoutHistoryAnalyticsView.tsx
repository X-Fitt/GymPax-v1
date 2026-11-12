import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Activity,
  Dumbbell,
  Layers,
  TrendingUp,
  Clock,
  Trophy,
  Flame,
  Zap,
  BarChart3,
  PieChart as PieIcon,
  ChevronDown,
  Info,
  Calendar,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Target
} from 'lucide-react';
import { ActiveWorkout } from '../../types';
import {
  calculateWorkoutHistoryAnalytics,
  HistoryTimeframe,
  MovementPattern
} from '../../utils/workoutHistoryAnalytics';

interface WorkoutHistoryAnalyticsViewProps {
  workoutHistory: ActiveWorkout[];
  unit: 'kg' | 'lbs';
  className?: string;
  onSelectExercise?: (exerciseId: string) => void;
}

export const WorkoutHistoryAnalyticsView: React.FC<WorkoutHistoryAnalyticsViewProps> = ({
  workoutHistory,
  unit,
  className = '',
  onSelectExercise
}) => {
  const [timeframe, setTimeframe] = useState<HistoryTimeframe>('all');
  const [muscleViewMode, setMuscleViewMode] = useState<'areas' | 'specific'>('areas');
  const [exerciseRankMode, setExerciseRankMode] = useState<'sets' | 'volume'>('sets');
  const [activeTab, setActiveTab] = useState<'muscles' | 'exercises'>('muscles');

  const analytics = useMemo(() => {
    return calculateWorkoutHistoryAnalytics(workoutHistory, timeframe, unit);
  }, [workoutHistory, timeframe, unit]);

  if (workoutHistory.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-zinc-950/70 border border-zinc-850 text-center space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-zinc-200">No Workout History Logged Yet</h4>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Complete and log workout sessions to unlock comprehensive graphs for muscle volume, top exercises, movement types, and training density.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-5 font-sans text-zinc-100 ${className}`}>
      {/* Header with Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
                Workout History Analytics
              </h3>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {analytics.totalWorkouts} sessions
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Muscles targeted, top exercises, movement types & progressive overload
            </p>
          </div>
        </div>

        {/* Minimalist Timeframe Control */}
        <div className="flex items-center self-start sm:self-auto p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono font-medium">
          {(['all', '30d', '90d', 'year'] as HistoryTimeframe[]).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tf === 'all' ? 'All' : tf === '30d' ? '30d' : tf === '90d' ? '90d' : '1y'}
            </button>
          ))}
        </div>
      </div>

      {/* High-Level Stat HUD Grid (Minimalist & Crisp) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-0.5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="font-mono uppercase font-semibold text-zinc-500">Cumulative Volume</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black font-mono text-zinc-100">
              {analytics.totalVolume.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-amber-400">{unit}</span>
          </div>
          <span className="text-[10px] text-zinc-500 block truncate">
            Avg {analytics.avgWorkoutVolume.toLocaleString()} {unit}/session
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-0.5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="font-mono uppercase font-semibold text-zinc-500">Working Sets</span>
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black font-mono text-zinc-100">
              {analytics.totalSets.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">sets</span>
          </div>
          <span className="text-[10px] text-zinc-500 block truncate">
            {analytics.totalReps.toLocaleString()} total reps
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-0.5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="font-mono uppercase font-semibold text-zinc-500">Training Time</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black font-mono text-zinc-100">
              {Math.round(analytics.totalDurationMinutes / 60 * 10) / 10}
            </span>
            <span className="text-[10px] font-mono text-blue-400">hrs</span>
          </div>
          <span className="text-[10px] text-zinc-500 block truncate">
            Avg {analytics.avgSessionDurationMinutes}m/session
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-0.5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="font-mono uppercase font-semibold text-zinc-500">Records Broken</span>
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black font-mono text-zinc-100">
              {analytics.totalPrs}
            </span>
            <span className="text-[10px] font-mono text-yellow-400">PRs</span>
          </div>
          <span className="text-[10px] text-zinc-500 block truncate">
            All-time strength PRs
          </span>
        </div>
      </div>

      {/* Focus Category Segmented Bar */}
      <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto scrollbar-none text-xs font-semibold gap-0.5 snap-x snap-mandatory px-4 sm:px-0.5 scroll-px-4 sm:scroll-px-0.5 scroll-smooth">
        {[
          { id: 'muscles', label: 'Muscles' },
          { id: 'exercises', label: 'Exercised Movements' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              setActiveTab(tab.id as 'muscles' | 'exercises');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer snap-center snap-always ${
              activeTab === tab.id
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. MUSCLES GRAPH (Volume, Sets, Distribution) */}
      {/* ========================================================================= */}
      {activeTab === 'muscles' && (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-850">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  1. Muscle Volume & Working Sets Distribution
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Mechanical volume load and stimulus distribution across anatomy.
              </p>
            </div>

            {/* Toggle Area vs Specific Muscles */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMuscleViewMode('areas')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  muscleViewMode === 'areas'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Major Areas ({analytics.muscleAreaData.length})
              </button>
              <button
                type="button"
                onClick={() => setMuscleViewMode('specific')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  muscleViewMode === 'specific'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Muscles ({analytics.specificMuscleData.length})
              </button>
            </div>
          </div>

          {/* Recharts Bar Chart: Muscle Volume */}
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={muscleViewMode === 'areas' ? analytics.muscleAreaData : analytics.specificMuscleData.slice(0, 8)}
                margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={val => `${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-zinc-100 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                            <span>{data.name}</span>
                          </p>
                          <p className="text-zinc-300 font-mono">
                            Volume: <span className="text-amber-400 font-bold">{data.volume.toLocaleString()} {unit}</span>
                          </p>
                          <p className="text-zinc-400 font-mono text-[11px]">
                            Sets: <span className="text-zinc-200 font-bold">{data.sets} sets</span> ({data.percentage}% of total)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                  {(muscleViewMode === 'areas' ? analytics.muscleAreaData : analytics.specificMuscleData.slice(0, 8)).map(
                    (entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Muscle Detail Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {(muscleViewMode === 'areas' ? analytics.muscleAreaData : analytics.specificMuscleData).map(m => (
              <div
                key={m.name}
                className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 block truncate leading-tight">{m.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {m.sets} sets · {m.percentage}% volume
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="font-bold text-zinc-100 block">{m.volume.toLocaleString()}</span>
                  <span className="text-[9px] text-amber-400/80">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXERCISED MOVEMENTS GRAPH (Top Exercises, sets, volume) */}
      {/* ========================================================================= */}
      {activeTab === 'exercises' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-850">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  2. Most Exercised Movements & Volume Output
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Top logged exercises ranked by completed working sets and cumulative tonnage.
              </p>
            </div>

            {/* Switch Rank by Sets vs Volume */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setExerciseRankMode('sets')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  exerciseRankMode === 'sets'
                    ? 'bg-emerald-400 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Rank by Sets
              </button>
              <button
                type="button"
                onClick={() => setExerciseRankMode('volume')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  exerciseRankMode === 'volume'
                    ? 'bg-emerald-400 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Rank by Volume
              </button>
            </div>
          </div>

          {/* Top Exercises Horizontal Bar / List Graph */}
          <div className="space-y-2">
            {(exerciseRankMode === 'sets' ? analytics.topExercisesBySets : analytics.topExercisesByVolume)
              .slice(0, 8)
              .map((ex, index) => {
                const maxVal = exerciseRankMode === 'sets'
                  ? analytics.topExercisesBySets[0]?.totalSets || 1
                  : analytics.topExercisesByVolume[0]?.totalVolume || 1;
                const currentVal = exerciseRankMode === 'sets' ? ex.totalSets : ex.totalVolume;
                const barPct = Math.round((currentVal / maxVal) * 100);

                return (
                  <div
                    key={ex.exerciseId}
                    onClick={() => onSelectExercise && onSelectExercise(ex.exerciseId)}
                    className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 hover:border-zinc-750 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-zinc-200 truncate block">
                            {ex.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                            <span className="text-zinc-400">{ex.primaryMuscle}</span>
                            <span>·</span>
                            <span className={ex.tier === 'Compound' ? 'text-amber-400' : 'text-purple-400'}>
                              {ex.tier}
                            </span>
                            <span>·</span>
                            <span>{ex.sessionsCount} sessions</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-emerald-400 text-xs block">
                          {exerciseRankMode === 'sets' ? `${ex.totalSets} sets` : `${ex.totalVolume.toLocaleString()} ${unit}`}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Max: {ex.maxWeight} {unit}
                        </span>
                      </div>
                    </div>

                    {/* Proportional Overload Bar */}
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(6, barPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
