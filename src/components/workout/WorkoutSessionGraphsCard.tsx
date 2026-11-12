import React, { useState } from 'react';
import {
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Zap,
  Target,
  ChevronDown
} from 'lucide-react';
import { ActiveWorkout } from '../../types';
import { EXERCISE_DATABASE } from '../../data/exercises';
import { mapMuscleToArea } from '../../utils/muscleAnalytics';
import { classifyMovementPattern } from '../../utils/workoutHistoryAnalytics';

interface WorkoutSessionGraphsCardProps {
  workout: ActiveWorkout;
  unit: 'kg' | 'lbs';
  defaultExpanded?: boolean;
}

export const WorkoutSessionGraphsCard: React.FC<WorkoutSessionGraphsCardProps> = ({
  workout,
  unit,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'muscles' | 'exercises' | 'types'>('muscles');

  const unitMultiplier = unit === 'lbs' ? 2.20462 : 1;

  // Process data for this specific workout session
  const muscleMap = new Map<string, { sets: number; volume: number; area: string }>();
  let compoundSets = 0;
  let compoundVolume = 0;
  let isolationSets = 0;
  let isolationVolume = 0;
  let totalSessionSets = 0;
  let totalSessionVolume = 0;

  let strengthReps = 0; // 1-5
  let hypertrophyReps = 0; // 6-12
  let enduranceReps = 0; // 13+

  const exerciseBreakdown: {
    name: string;
    primaryMuscle: string;
    tier: 'Compound' | 'Isolation';
    sets: number;
    volume: number;
    maxWeight: number;
    pctOfTotal: number;
  }[] = [];

  workout.exercises.forEach(ex => {
    const dbEx = EXERCISE_DATABASE.find(e => e.id === ex.exerciseId);
    const muscle = ex.targetMuscle || dbEx?.primaryMuscle || 'Chest';
    const area = mapMuscleToArea(muscle);
    const tier = dbEx?.tier || (ex.name.toLowerCase().includes('press') || ex.name.toLowerCase().includes('squat') || ex.name.toLowerCase().includes('deadlift') || ex.name.toLowerCase().includes('row') ? 'Compound' : 'Isolation');

    let exSets = 0;
    let exVol = 0;
    let exMaxWeight = 0;

    ex.sets.forEach(set => {
      if (set.completed) {
        const reps = set.reps || 0;
        const weightKg = set.weightKg || (set.weightLbs ? set.weightLbs / 2.20462 : 0);
        const setVol = weightKg * reps * unitMultiplier;
        const weightUnit = Math.round(weightKg * unitMultiplier);

        exSets++;
        exVol += setVol;
        totalSessionSets++;
        totalSessionVolume += setVol;

        if (weightUnit > exMaxWeight) {
          exMaxWeight = weightUnit;
        }

        if (reps <= 5) strengthReps++;
        else if (reps <= 12) hypertrophyReps++;
        else enduranceReps++;

        if (tier === 'Compound') {
          compoundSets++;
          compoundVolume += setVol;
        } else {
          isolationSets++;
          isolationVolume += setVol;
        }

        const curr = muscleMap.get(muscle) || { sets: 0, volume: 0, area };
        curr.sets++;
        curr.volume += setVol;
        muscleMap.set(muscle, curr);
      }
    });

    if (exSets > 0) {
      exerciseBreakdown.push({
        name: ex.name,
        primaryMuscle: muscle,
        tier,
        sets: exSets,
        volume: Math.round(exVol),
        maxWeight: exMaxWeight,
        pctOfTotal: 0
      });
    }
  });

  // Calculate percentages
  exerciseBreakdown.forEach(e => {
    e.pctOfTotal = totalSessionVolume > 0 ? Math.round((e.volume / totalSessionVolume) * 100) : 0;
  });
  exerciseBreakdown.sort((a, b) => b.volume - a.volume);

  const muscleList = Array.from(muscleMap.entries()).map(([name, stat]) => ({
    name,
    sets: stat.sets,
    volume: Math.round(stat.volume),
    pct: totalSessionVolume > 0 ? Math.round((stat.volume / totalSessionVolume) * 100) : 0
  })).sort((a, b) => b.volume - a.volume);

  const totalTierSets = compoundSets + isolationSets;
  const compoundPct = totalTierSets > 0 ? Math.round((compoundSets / totalTierSets) * 100) : 0;
  const isolationPct = totalTierSets > 0 ? Math.round((isolationSets / totalTierSets) * 100) : 0;

  return (
    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5 font-sans text-left">
      {/* Header with expand toggle */}
      <div className={`flex items-center justify-between ${isExpanded ? 'pb-2 border-b border-zinc-850' : ''}`}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-zinc-200">
                  Session Distribution Graphs
                </h4>
                <span className="text-[9px] font-mono text-zinc-500">
                  {workout.exercises.length} movements
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 whitespace-normal break-words leading-snug">
                Muscles targeted, top exercises & compound split
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 group-hover:text-amber-400 transition-colors font-mono shrink-0 ml-2">
            <span>{isExpanded ? 'Hide' : 'View'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-0.5 animate-in fade-in">
          {/* Minimalist Segmented Tab Switcher */}
          <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('muscles')}
              className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
                activeTab === 'muscles'
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Muscles ({muscleList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exercises')}
              className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
                activeTab === 'exercises'
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Exercises ({exerciseBreakdown.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('types')}
              className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
                activeTab === 'types'
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Types
            </button>
          </div>

          {/* TAB 1: MUSCLES IN THIS SESSION */}
          {activeTab === 'muscles' && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                Muscles Stimulated in This Session:
              </span>
              <div className="space-y-1.5">
                {muscleList.map((m, idx) => (
                  <div key={m.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-200">{m.name}</span>
                      <span className="font-mono text-zinc-400 text-[11px]">
                        <strong className="text-amber-400">{m.volume.toLocaleString()} {unit}</strong> ({m.sets} sets · {m.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(6, m.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EXERCISES IN THIS SESSION */}
          {activeTab === 'exercises' && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                Exercise Volume Contribution:
              </span>
              <div className="space-y-2">
                {exerciseBreakdown.map(ex => (
                  <div key={ex.name} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <span className="font-bold text-zinc-200 block whitespace-normal break-words">{ex.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                          <span>{ex.primaryMuscle}</span>
                          <span>·</span>
                          <span className={ex.tier === 'Compound' ? 'text-amber-400 font-bold' : 'text-purple-400 font-bold'}>
                            {ex.tier}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-emerald-400 text-xs block">
                          {ex.volume.toLocaleString()} {unit}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {ex.sets} sets · Max {ex.maxWeight} {unit}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.max(5, ex.pctOfTotal)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TYPE OF EXERCISES (Compound vs Isolation & Reps) */}
          {activeTab === 'types' && (
            <div className="space-y-3">
              {/* Compound vs Isolation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="text-amber-400">Compound: {compoundPct}% ({compoundSets} sets)</span>
                  <span className="text-purple-400">Isolation: {isolationPct}% ({isolationSets} sets)</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden flex border border-zinc-800">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${compoundPct}%` }}
                  />
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${isolationPct}%` }}
                  />
                </div>
              </div>

              {/* Rep Range Split */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono pt-1 text-[10px]">
                <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-850">
                  <span className="text-blue-400 font-bold block">1–5 Reps</span>
                  <span className="text-zinc-200 font-bold text-xs">{strengthReps} sets</span>
                  <span className="text-zinc-500 block">Heavy Power</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-850">
                  <span className="text-amber-400 font-bold block">6–12 Reps</span>
                  <span className="text-zinc-200 font-bold text-xs">{hypertrophyReps} sets</span>
                  <span className="text-zinc-500 block">Hypertrophy</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-850">
                  <span className="text-pink-400 font-bold block">13+ Reps</span>
                  <span className="text-zinc-200 font-bold text-xs">{enduranceReps} sets</span>
                  <span className="text-zinc-500 block">Pump & Burn</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
