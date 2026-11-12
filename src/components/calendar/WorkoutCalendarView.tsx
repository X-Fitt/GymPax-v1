import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  Trophy,
  Clock,
  Dumbbell,
  CheckCircle2,
  Share2,
  Play,
  Plus,
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';
import { ActiveWorkout, UserProfile } from '../../types';
import { AppTheme } from '../../utils/storage';
import { GymAvatar } from '../common/GymAvatar';

interface WorkoutCalendarViewProps {
  workoutHistory: ActiveWorkout[];
  unit: 'kg' | 'lbs';
  onStartRoutineFromPast?: (workout: ActiveWorkout) => void;
  onOpenShareModal?: (workout: ActiveWorkout) => void;
  onStartQuickWorkout?: () => void;
  selectedDateProp?: string;
  currentTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  userProfile?: UserProfile | null;
}

export const WorkoutCalendarView: React.FC<WorkoutCalendarViewProps> = ({
  workoutHistory,
  unit,
  onStartRoutineFromPast,
  onOpenShareModal,
  onStartQuickWorkout,
  selectedDateProp,
  currentTheme = 'dark',
  onSelectTheme,
  userProfile
}) => {
  // Calendar navigation state (defaults to current date or September 2026)
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth()); // 0-indexed (8 = September)

  // Selected date formatted as YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(today);
  const [selectedDate, setSelectedDate] = useState<string>(selectedDateProp || todayStr);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Month name formatter
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate calendar grid days
  // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Convert to Monday-first (0 = Mon, ..., 6 = Sun)
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

  // Days from previous month to fill first row
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const prevMonthCells = Array.from({ length: startingDayIndex }).map((_, i) => {
    const dayNum = daysInPrevMonth - startingDayIndex + i + 1;
    const prevMonthDate = new Date(viewYear, viewMonth - 1, dayNum);
    return {
      dateString: formatYMD(prevMonthDate),
      dayNumber: dayNum,
      isCurrentMonth: false
    };
  });

  // Current month days
  const currentMonthCells = Array.from({ length: daysInMonth }).map((_, i) => {
    const dayNum = i + 1;
    const cellDate = new Date(viewYear, viewMonth, dayNum);
    return {
      dateString: formatYMD(cellDate),
      dayNumber: dayNum,
      isCurrentMonth: true
    };
  });

  // Next month days to pad final week
  const totalCellsSoFar = prevMonthCells.length + currentMonthCells.length;
  const trailingCount = (7 - (totalCellsSoFar % 7)) % 7;
  const nextMonthCells = Array.from({ length: trailingCount }).map((_, i) => {
    const dayNum = i + 1;
    const nextMonthDate = new Date(viewYear, viewMonth + 1, dayNum);
    return {
      dateString: formatYMD(nextMonthDate),
      dayNumber: dayNum,
      isCurrentMonth: false
    };
  });

  const allCalendarCells = [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];

  // Map workouts to date string
  const workoutsByDate: Record<string, ActiveWorkout[]> = {};
  workoutHistory.forEach(w => {
    const d = w.date;
    if (!workoutsByDate[d]) {
      workoutsByDate[d] = [];
    }
    workoutsByDate[d].push(w);
  });

  // Compute month aggregates
  const workoutsThisMonth = workoutHistory.filter(w => {
    const [y, m] = w.date.split('-');
    return parseInt(y, 10) === viewYear && parseInt(m, 10) === viewMonth + 1;
  });

  const monthTotalVolume = workoutsThisMonth.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
  const displayMonthVolume = unit === 'kg'
    ? Math.round(monthTotalVolume).toLocaleString()
    : Math.round(monthTotalVolume * 2.20462).toLocaleString();

  // Selected date workouts
  const selectedDayWorkouts = workoutsByDate[selectedDate] || [];

  // Formatted date string for selected day
  const formattedSelectedDate = (() => {
    try {
      const [y, m, d] = selectedDate.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  })();

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Calendar Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Athlete Context Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
          <div className="flex items-center gap-2.5">
            <GymAvatar
              avatarType={userProfile?.avatarType}
              avatarUrl={userProfile?.avatarUrl}
              avatarId={userProfile?.avatarId}
              size="sm"
              fallbackInitials={userProfile?.name ? userProfile.name.slice(0, 2) : 'AH'}
            />
            <div>
              <span className="font-bold text-xs text-zinc-200">
                {userProfile?.name || 'Athlete'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block">
                Personal Training Calendar & Consistency Heatmap
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-850 text-amber-400 border border-zinc-800 font-bold">
            GymPax Log
          </span>
        </div>

        {/* Month Navigation Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-zinc-100">
                  {monthName}
                </h2>
                <button
                  onClick={handleJumpToToday}
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tap on any day to inspect completed exercises, sets, weights, and PRs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Aggregate Stats Bar */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl text-center text-xs">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Sessions</span>
            <span className="font-mono text-base font-bold text-zinc-100">
              {workoutsThisMonth.length}
            </span>
            <span className="text-[10px] text-emerald-400 block">completed</span>
          </div>

          <div className="border-x border-zinc-850">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Tonnage Moved</span>
            <span className="font-mono text-base font-bold text-amber-400">
              {displayMonthVolume}
            </span>
            <span className="text-[10px] text-zinc-400 block">{unit}</span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Frequency</span>
            <span className="font-mono text-base font-bold text-zinc-100">
              {workoutsThisMonth.length > 0
                ? (workoutsThisMonth.length / 4.2).toFixed(1)
                : '0'}
            </span>
            <span className="text-[10px] text-zinc-400 block">days / wk</span>
          </div>
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="space-y-2">
          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 text-center">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
              <span key={day} className="text-[11px] font-bold text-zinc-500 py-1 font-mono">
                {day}
              </span>
            ))}
          </div>

          {/* Date Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {allCalendarCells.map((cell, idx) => {
              const dayWorkouts = workoutsByDate[cell.dateString] || [];
              const hasWorkouts = dayWorkouts.length > 0;
              const isSelected = selectedDate === cell.dateString;
              const isToday = todayStr === cell.dateString;

              const hasPr = dayWorkouts.some(w => (w.prCount || 0) > 0);
              const dayVolume = dayWorkouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
              const volK = Math.round(dayVolume / 1000);

              return (
                <button
                  key={`${cell.dateString}_${idx}`}
                  onClick={() => setSelectedDate(cell.dateString)}
                  className={`relative min-h-[58px] sm:min-h-[72px] p-1.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'opacity-30 border-transparent bg-zinc-950/20 text-zinc-600'
                      : hasWorkouts
                      ? 'border-amber-400/60 bg-gradient-to-br from-amber-400/15 via-zinc-900 to-zinc-900 text-zinc-100 shadow-sm'
                      : 'border-zinc-800/80 bg-zinc-950/50 hover:bg-zinc-800/50 text-zinc-400'
                  } ${
                    isSelected
                      ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 z-10'
                      : ''
                  } ${isToday && !isSelected ? 'border-zinc-500' : ''}`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? 'text-amber-400 underline underline-offset-2'
                          : hasWorkouts
                          ? 'text-zinc-100'
                          : 'text-zinc-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* PR Medal Indicator */}
                    {hasPr && (
                      <Trophy className="w-3 h-3 text-amber-400 shrink-0 fill-amber-400/20" />
                    )}
                  </div>

                  {/* Workout Badge / Dot */}
                  <div className="w-full">
                    {hasWorkouts ? (
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="text-[10px] font-mono text-amber-300 font-bold truncate">
                          {volK > 0 ? `${volK}k` : 'Done'}
                        </span>
                      </div>
                    ) : cell.isCurrentMonth ? (
                      <span className="text-[9px] text-zinc-600 font-mono hidden sm:inline">
                        Rest
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Workout Details Breakdown */}
      <div id="selected-workout-details" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3.5 sm:p-6 shadow-xl space-y-4 sm:space-y-5 animate-in fade-in">
        {/* Selected Date Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-400">
                Session Inspector
              </span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">
                {selectedDate === todayStr ? 'Today' : 'Historical Date'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 mt-0.5">
              {formattedSelectedDate}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {selectedDayWorkouts.length > 0 ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{selectedDayWorkouts.length} Session Logged</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-400">
                Rest & Recovery Day
              </span>
            )}
          </div>
        </div>

        {/* If Workouts exist on this date */}
        {selectedDayWorkouts.length > 0 ? (
          <div className="space-y-4 sm:space-y-5">
            {selectedDayWorkouts.map((workout, wIdx) => {
              const displayVol = unit === 'kg'
                ? Math.round(workout.totalVolumeKg).toLocaleString()
                : Math.round(workout.totalVolumeKg * 2.20462).toLocaleString();

              const totalCompletedSets = workout.exercises.reduce(
                (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
                0
              );

              return (
                <div
                  key={workout.id || wIdx}
                  className="p-3.5 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-700/80 shadow-lg shadow-black/40 space-y-4 ring-1 ring-zinc-800/60"
                >
                  {/* Workout Title & High-Level Metrics */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base sm:text-lg text-zinc-100 tracking-tight">{workout.title}</h4>
                        {(workout.prCount || 0) > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 text-[10px] font-bold font-mono flex items-center gap-1 shrink-0">
                            <Trophy className="w-3 h-3 fill-amber-400" />
                            <span>{workout.prCount} PR</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>Completed at {new Date(workout.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>

                    {/* Prominent, readable 3-column stats bar on mobile */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 text-center font-mono text-xs shrink-0">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-sans font-semibold">Volume</span>
                        <span className="font-bold text-zinc-100 text-xs sm:text-sm">{displayVol} {unit}</span>
                      </div>
                      <div className="border-x border-zinc-800 px-1">
                        <span className="text-[10px] text-zinc-500 uppercase block font-sans font-semibold">Duration</span>
                        <span className="font-bold text-zinc-100 text-xs sm:text-sm">{Math.floor(workout.durationSeconds / 60)} min</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-sans font-semibold">Sets</span>
                        <span className="font-bold text-emerald-400 text-xs sm:text-sm">{totalCompletedSets} Done</span>
                      </div>
                    </div>
                  </div>

                  {/* Exercises and Detailed Sets Table */}
                  <div className="space-y-3 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                        Exercise Logs ({workout.exercises.length})
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {totalCompletedSets} total sets
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {workout.exercises.map((ex, eIdx) => (
                        <div
                          key={`${ex.exerciseId}_${eIdx}`}
                          className="p-3 sm:p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80 space-y-2.5"
                        >
                          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                            <span className="font-bold text-xs sm:text-sm text-zinc-100">
                              {eIdx + 1}. {ex.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-750 text-zinc-300 font-medium">{ex.targetMuscle}</span>
                              <span aria-hidden="true" className="text-zinc-600">·</span>
                              <span className="text-zinc-400">{ex.equipment}</span>
                            </div>
                          </div>

                          {/* Sets detail */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                            {ex.sets.map((set, sIdx) => {
                              const setWeight = unit === 'kg' ? set.weightKg : set.weightLbs;
                              return (
                                <div
                                  key={set.id || sIdx}
                                  className={`p-2 rounded-lg border font-mono flex items-center justify-between gap-1 ${
                                    set.completed
                                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
                                      : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
                                  }`}
                                >
                                  <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold shrink-0">
                                    Set {set.setNumber}
                                  </span>
                                  <span className="font-bold text-amber-400/95 text-xs truncate">
                                    {setWeight} {unit} × {set.reps}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {ex.notes && (
                            <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800/50">
                              Notes: "{ex.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions for this past session */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                    {onStartRoutineFromPast && (
                      <button
                        onClick={() => onStartRoutineFromPast(workout)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-98"
                      >
                        <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span className="hidden xs:inline sm:inline">Repeat / Re-run This Session</span>
                        <span className="xs:hidden sm:hidden">Repeat Session</span>
                      </button>
                    )}

                    {onOpenShareModal && (
                      <button
                        onClick={() => onOpenShareModal(workout)}
                        className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        title="Generate Shareable Story Graphic"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="hidden sm:inline">Share Recap</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty / Rest Day state for selected date */
          <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-850 flex items-center justify-center text-zinc-400 mx-auto">
              <Dumbbell className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-sm text-zinc-200">
                No Gym Session Logged on this Day
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
                This date was dedicated to muscular recovery, myofibrillar protein synthesis, or was a scheduled rest interval.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onStartQuickWorkout}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Log a Workout Session Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
