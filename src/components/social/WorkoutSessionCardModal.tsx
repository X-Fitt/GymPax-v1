import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Dumbbell,
  Trophy,
  Clock,
  Flame,
  Share2,
  Camera,
  Check,
  CheckCircle2,
  Award,
  Sparkles,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { SocialPost, ActiveWorkout, WorkoutExercise } from '../../types';
import { GymAvatar } from '../common/GymAvatar';
import { getWorkoutHistory } from '../../utils/storage';

interface WorkoutSessionCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: SocialPost;
  unit: 'kg' | 'lbs';
  onOpenStoryCard?: (workout: ActiveWorkout) => void;
  onCheer?: (postId: string, emoji: '💪' | '🔥' | '⚡' | '🏆' | '🦍', label: string) => void;
}

export const WorkoutSessionCardModal: React.FC<WorkoutSessionCardModalProps> = ({
  isOpen,
  onClose,
  post,
  unit,
  onOpenStoryCard,
  onCheer
}) => {
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);
  const [hasCheered, setHasCheered] = useState<boolean>(false);

  if (!isOpen || !post) return null;

  const isOwnPost = post.userId === 'u_me' || post.userId === 'ath_current_user';

  // Resolve or synthesize the ActiveWorkout session representation
  const resolveWorkoutSession = (): ActiveWorkout => {
    if (post.workoutSession) {
      return post.workoutSession;
    }

    // Try finding in local workout history matching title or time
    const history = getWorkoutHistory();
    const matched = history.find(
      h =>
        h.title === post.workoutTitle ||
        (post.workoutTitle.includes(h.title) || h.title.includes(post.workoutTitle)) ||
        Math.abs(new Date(h.date).getTime() - post.timestamp) < 1000 * 60 * 60 * 24
    );

    if (matched) {
      return matched;
    }

    // High fidelity realistic session breakdown synthesized from post metadata
    const title = post.workoutTitle.toLowerCase();
    let exercises: WorkoutExercise[] = [];

    if (title.includes('bench') || title.includes('push') || title.includes('chest')) {
      exercises = [
        {
          exerciseId: 'ex_bench',
          name: 'Barbell Flat Bench Press',
          targetMuscle: 'Chest',
          equipment: 'Barbell',
          sets: [
            { id: 's1', setNumber: 1, type: 'normal', reps: 10, weightKg: 100, weightLbs: 220, completed: true, rpe: 7 },
            { id: 's2', setNumber: 2, type: 'normal', reps: 8, weightKg: 120, weightLbs: 265, completed: true, rpe: 8 },
            { id: 's3', setNumber: 3, type: 'normal', reps: 5, weightKg: 142.5, weightLbs: 314, completed: true, rpe: 9.5 },
            { id: 's4', setNumber: 4, type: 'normal', reps: 6, weightKg: 130, weightLbs: 287, completed: true, rpe: 8.5 }
          ]
        },
        {
          exerciseId: 'ex_incline_db',
          name: 'Incline Dumbbell Chest Press',
          targetMuscle: 'Chest',
          equipment: 'Dumbbell',
          sets: [
            { id: 's5', setNumber: 1, type: 'normal', reps: 10, weightKg: 38, weightLbs: 84, completed: true, rpe: 8 },
            { id: 's6', setNumber: 2, type: 'normal', reps: 8, weightKg: 42, weightLbs: 93, completed: true, rpe: 8.5 },
            { id: 's7', setNumber: 3, type: 'normal', reps: 7, weightKg: 42, weightLbs: 93, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex_cable_fly',
          name: 'Low-to-High Cable Chest Flyes',
          targetMuscle: 'Chest',
          equipment: 'Cable',
          sets: [
            { id: 's8', setNumber: 1, type: 'normal', reps: 12, weightKg: 17.5, weightLbs: 39, completed: true, rpe: 8 },
            { id: 's9', setNumber: 2, type: 'normal', reps: 12, weightKg: 17.5, weightLbs: 39, completed: true, rpe: 8.5 },
            { id: 's10', setNumber: 3, type: 'normal', reps: 10, weightKg: 20, weightLbs: 44, completed: true, rpe: 9.5 }
          ]
        },
        {
          exerciseId: 'ex_overhead_tri',
          name: 'Overhead Cable Triceps Rope Extension',
          targetMuscle: 'Triceps',
          equipment: 'Cable',
          sets: [
            { id: 's11', setNumber: 1, type: 'normal', reps: 12, weightKg: 35, weightLbs: 77, completed: true, rpe: 8 },
            { id: 's12', setNumber: 2, type: 'normal', reps: 10, weightKg: 40, weightLbs: 88, completed: true, rpe: 8.5 },
            { id: 's13', setNumber: 3, type: 'normal', reps: 10, weightKg: 40, weightLbs: 88, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex_lateral_raise',
          name: 'DB Standing Lateral Raise',
          targetMuscle: 'Shoulders',
          equipment: 'Dumbbell',
          sets: [
            { id: 's14', setNumber: 1, type: 'normal', reps: 15, weightKg: 14, weightLbs: 31, completed: true, rpe: 8 },
            { id: 's15', setNumber: 2, type: 'normal', reps: 15, weightKg: 14, weightLbs: 31, completed: true, rpe: 8.5 },
            { id: 's16', setNumber: 3, type: 'normal', reps: 12, weightKg: 16, weightLbs: 35, completed: true, rpe: 9 }
          ]
        }
      ];
    } else if (title.includes('leg') || title.includes('squat') || title.includes('hack')) {
      exercises = [
        {
          exerciseId: 'ex_hack',
          name: 'Machine Hack Squat (Full Depth)',
          targetMuscle: 'Quads',
          equipment: 'Machine',
          sets: [
            { id: 's1', setNumber: 1, type: 'normal', reps: 10, weightKg: 140, weightLbs: 309, completed: true, rpe: 7.5 },
            { id: 's2', setNumber: 2, type: 'normal', reps: 8, weightKg: 160, weightLbs: 353, completed: true, rpe: 8 },
            { id: 's3', setNumber: 3, type: 'normal', reps: 8, weightKg: 180, weightLbs: 397, completed: true, rpe: 9.5 },
            { id: 's4', setNumber: 4, type: 'normal', reps: 8, weightKg: 170, weightLbs: 375, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex_rdl',
          name: 'Barbell Romanian Deadlift (RDL)',
          targetMuscle: 'Hamstrings',
          equipment: 'Barbell',
          sets: [
            { id: 's5', setNumber: 1, type: 'normal', reps: 10, weightKg: 120, weightLbs: 265, completed: true, rpe: 7.5 },
            { id: 's6', setNumber: 2, type: 'normal', reps: 8, weightKg: 140, weightLbs: 309, completed: true, rpe: 8.5 },
            { id: 's7', setNumber: 3, type: 'normal', reps: 8, weightKg: 140, weightLbs: 309, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex_leg_ext',
          name: 'Leg Extension (Strict Peak Squeeze)',
          targetMuscle: 'Quads',
          equipment: 'Machine',
          sets: [
            { id: 's8', setNumber: 1, type: 'normal', reps: 12, weightKg: 75, weightLbs: 165, completed: true, rpe: 8 },
            { id: 's9', setNumber: 2, type: 'normal', reps: 12, weightKg: 85, weightLbs: 187, completed: true, rpe: 8.5 },
            { id: 's10', setNumber: 3, type: 'normal', reps: 10, weightKg: 90, weightLbs: 198, completed: true, rpe: 9.5 }
          ]
        },
        {
          exerciseId: 'ex_ham_curl',
          name: 'Seated Hamstring Leg Curl',
          targetMuscle: 'Hamstrings',
          equipment: 'Machine',
          sets: [
            { id: 's11', setNumber: 1, type: 'normal', reps: 12, weightKg: 65, weightLbs: 143, completed: true, rpe: 8 },
            { id: 's12', setNumber: 2, type: 'normal', reps: 10, weightKg: 70, weightLbs: 154, completed: true, rpe: 9 }
          ]
        }
      ];
    } else {
      exercises = [
        {
          exerciseId: 'ex_primary',
          name: post.topSet ? post.topSet.split('(')[0].trim() : 'Primary Compound Movement',
          targetMuscle: 'Chest',
          equipment: 'Barbell',
          sets: [
            { id: 's1', setNumber: 1, type: 'normal', reps: 10, weightKg: Math.round(post.volumeKg * 0.012), weightLbs: Math.round(post.volumeKg * 0.012 * 2.20462), completed: true, rpe: 7.5 },
            { id: 's2', setNumber: 2, type: 'normal', reps: 8, weightKg: Math.round(post.volumeKg * 0.014), weightLbs: Math.round(post.volumeKg * 0.014 * 2.20462), completed: true, rpe: 8.5 },
            { id: 's3', setNumber: 3, type: 'normal', reps: 6, weightKg: Math.round(post.volumeKg * 0.016), weightLbs: Math.round(post.volumeKg * 0.016 * 2.20462), completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex_accessory_1',
          name: 'Hypertrophy Accessory Movement',
          targetMuscle: 'Back',
          equipment: 'Dumbbell',
          sets: [
            { id: 's4', setNumber: 1, type: 'normal', reps: 10, weightKg: Math.round(post.volumeKg * 0.007), weightLbs: Math.round(post.volumeKg * 0.007 * 2.20462), completed: true, rpe: 8 },
            { id: 's5', setNumber: 2, type: 'normal', reps: 10, weightKg: Math.round(post.volumeKg * 0.007), weightLbs: Math.round(post.volumeKg * 0.007 * 2.20462), completed: true, rpe: 8.5 }
          ]
        },
        {
          exerciseId: 'ex_accessory_2',
          name: 'Isolation Finisher',
          targetMuscle: 'Biceps',
          equipment: 'Cable',
          sets: [
            { id: 's6', setNumber: 1, type: 'normal', reps: 12, weightKg: Math.round(post.volumeKg * 0.004), weightLbs: Math.round(post.volumeKg * 0.004 * 2.20462), completed: true, rpe: 8.5 },
            { id: 's7', setNumber: 2, type: 'normal', reps: 12, weightKg: Math.round(post.volumeKg * 0.004), weightLbs: Math.round(post.volumeKg * 0.004 * 2.20462), completed: true, rpe: 9 }
          ]
        }
      ];
    }

    return {
      id: `session_${post.id}`,
      title: post.workoutTitle,
      date: new Date(post.timestamp).toISOString().split('T')[0],
      startTime: post.timestamp - post.durationMinutes * 60 * 1000,
      durationSeconds: post.durationMinutes * 60,
      totalVolumeKg: post.volumeKg,
      prCount: post.prBroken ? 1 : 0,
      isCompleted: true,
      exercises
    };
  };

  const workoutSession = resolveWorkoutSession();

  const totalCompletedSets = workoutSession.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );

  const displayVolume =
    unit === 'kg'
      ? Math.round(post.volumeKg || workoutSession.totalVolumeKg).toLocaleString()
      : Math.round((post.volumeKg || workoutSession.totalVolumeKg) * 2.20462).toLocaleString();

  const handleCheerWorkout = (emoji: '💪' | '🔥' | '⚡' | '🏆' | '🦍', label: string) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#ffffff', '#10b981']
      });
    } catch {
      // ignore
    }
    setHasCheered(true);
    if (onCheer) {
      onCheer(post.id, emoji, label);
    }
  };

  const selectedExercise = workoutSession.exercises[selectedExerciseIndex] || workoutSession.exercises[0];

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100 max-h-[92vh]">
        {/* Top Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-850 flex items-center justify-between shrink-0 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950">
                  SESSION WORKOUT CARD
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {new Date(post.timestamp).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight mt-0.5">
                {post.workoutTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors cursor-pointer"
            title="Close card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Athlete Info Bar */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GymAvatar
                avatarType="animated"
                avatarId={post.userId || post.userAvatarSeed}
                name={post.userName}
                fallbackInitials={post.userName.substring(0, 2)}
                size="md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-zinc-100">{post.userName}</span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                    {post.userRank || post.userBadge}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Completed in {post.durationMinutes} minutes · Community Feed Card
                </span>
              </div>
            </div>

            {post.streakDays && post.streakDays > 0 && (
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{post.streakDays}d Streak</span>
              </div>
            )}
          </div>

          {/* Key Workout Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] uppercase font-mono font-bold">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Duration</span>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-zinc-100">
                {post.durationMinutes} <span className="text-xs font-normal text-zinc-400">min</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] uppercase font-mono font-bold">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Volume</span>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-zinc-100">
                {displayVolume} <span className="text-xs font-normal text-zinc-400">{unit}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] uppercase font-mono font-bold">
                <Dumbbell className="w-3 h-3 text-sky-400" />
                <span>Exercises</span>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-zinc-100">
                {workoutSession.exercises.length} <span className="text-xs font-normal text-zinc-400">lifts</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] uppercase font-mono font-bold">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                <span>Sets Done</span>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-zinc-100">
                {totalCompletedSets} <span className="text-xs font-normal text-zinc-400">sets</span>
              </div>
            </div>
          </div>

          {/* PR Broken Trophy Highlight */}
          {post.prBroken && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-400/40 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400 text-zinc-950 font-black">
                  <Trophy className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-wider block">
                    Personal Record Beaten
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-100">
                    {post.prBroken}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                +10 Grit
              </span>
            </div>
          )}

          {/* Attached Post-Workout Photo Section */}
          {post.photoUrl && (
            <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 space-y-2 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-200">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Attached Post-Workout Photo</span>
                </div>
                {post.photoTag && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-amber-400 text-zinc-950">
                    {post.photoTag}
                  </span>
                )}
              </div>

              <div className="relative aspect-[16/10] sm:aspect-[2/1] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-inner">
                <img
                  src={post.photoUrl}
                  alt={post.photoCaption || 'Post-workout pump photo'}
                  className="w-full h-full object-cover"
                />
              </div>

              {post.photoCaption && (
                <p className="text-xs text-zinc-300 italic pt-1 text-center">
                  &ldquo;{post.photoCaption}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Exercise Breakdown & Sets Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-zinc-300 tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Exercise Breakdown & Set Log</span>
              </h4>
              <span className="text-[11px] text-zinc-500 font-mono">
                {workoutSession.exercises.length} exercises logged
              </span>
            </div>

            {/* Exercise Tabs Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1 scroll-smooth">
              {workoutSession.exercises.map((ex, idx) => (
                <button
                  key={ex.exerciseId || idx}
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    setSelectedExerciseIndex(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 snap-center snap-always ${
                    selectedExerciseIndex === idx
                      ? 'bg-amber-400 text-zinc-950 font-black shadow-sm'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850'
                  }`}
                >
                  <span>{idx + 1}.</span>
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{ex.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Exercise Set Log Table */}
            {selectedExercise && (
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h5 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                      <span>{selectedExercise.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 font-semibold uppercase">
                        {selectedExercise.targetMuscle}
                      </span>
                    </h5>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Equipment: {selectedExercise.equipment}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-zinc-300">
                    {selectedExercise.sets.filter(s => s.completed).length} of {selectedExercise.sets.length} completed
                  </span>
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                        <th className="py-2 px-2">Set</th>
                        <th className="py-2 px-2">Weight ({unit})</th>
                        <th className="py-2 px-2">Reps</th>
                        <th className="py-2 px-2">Volume</th>
                        <th className="py-2 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {selectedExercise.sets.map((set, sIdx) => {
                        const setVolume = unit === 'kg'
                          ? Math.round(set.weightKg * set.reps)
                          : Math.round(set.weightKg * 2.20462 * set.reps);

                        const displayWeight = unit === 'kg'
                          ? set.weightKg
                          : Math.round(set.weightKg * 2.20462);

                        return (
                          <tr key={set.id || sIdx} className="hover:bg-zinc-850/40">
                            <td className="py-2 px-2 font-bold text-zinc-400">
                              #{set.setNumber || sIdx + 1}
                            </td>
                            <td className="py-2 px-2 font-bold text-zinc-100">
                              {displayWeight} {unit}
                            </td>
                            <td className="py-2 px-2 font-bold text-zinc-200">
                              {set.reps} reps
                            </td>
                            <td className="py-2 px-2 text-zinc-400 font-mono">
                              {setVolume.toLocaleString()} {unit}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {set.completed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Done</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-500">Skipped</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Quick Cheer Station */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-400 font-bold uppercase text-[10px]">
                Cheer Athlete for this Session:
              </span>
              {hasCheered && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Cheer Sent!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleCheerWorkout('💪', 'Beast Mode')}
                className="py-2 px-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-200 hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-750"
              >
                <span>💪</span>
                <span className="hidden sm:inline">Beast</span>
              </button>

              <button
                type="button"
                onClick={() => handleCheerWorkout('🔥', 'Crushed It')}
                className="py-2 px-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-200 hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-750"
              >
                <span>🔥</span>
                <span className="hidden sm:inline">Pump</span>
              </button>

              <button
                type="button"
                onClick={() => handleCheerWorkout('⚡', 'Light Weight')}
                className="py-2 px-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-200 hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-750"
              >
                <span>⚡</span>
                <span className="hidden sm:inline">Light</span>
              </button>

              <button
                type="button"
                onClick={() => handleCheerWorkout('🏆', 'New PR!')}
                className="py-2 px-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-200 hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-750"
              >
                <span>🏆</span>
                <span className="hidden sm:inline">PR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0 flex items-center justify-between gap-3">
          {onOpenStoryCard && isOwnPost ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStoryCard(workoutSession);
              }}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Generate Story Card</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-transform active:scale-95 shadow-md shadow-amber-500/20"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
};
