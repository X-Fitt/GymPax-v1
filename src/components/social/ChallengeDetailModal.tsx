import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Trophy,
  Flame,
  Zap,
  Target,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  Dumbbell,
  Award,
  ArrowUpRight
} from 'lucide-react';

export interface ChallengeMilestone {
  tier: 'Bronze' | 'Silver' | 'Gold Finisher';
  thresholdPct: number;
  title: string;
  rewardText: string;
}

export interface CommunityChallengeItem {
  id: string;
  title: string;
  subtitle: string;
  targetLabel: string;
  currentValue: number;
  targetValue: number;
  unitLabel: string;
  participantsCount: number;
  daysLeft: number;
  rewardPts: number;
  categoryBadge: string;
  heroTagline: string;
  energeticPitch: string;
  whyJoinBullets: string[];
  officialRules: string[];
  proTips: string[];
  milestones: ChallengeMilestone[];
}

export interface ChallengeDetailModalProps {
  challenge: CommunityChallengeItem | null;
  isJoined: boolean;
  isCompleted: boolean;
  onClose: () => void;
  onToggleJoin: (challengeId: string, title: string) => void;
  onCompleteChallenge: (challenge: CommunityChallengeItem) => void;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  challenge,
  isJoined,
  isCompleted,
  onClose,
  onToggleJoin,
  onCompleteChallenge
}) => {
  if (!challenge) return null;

  const effectiveCurrent = isCompleted ? challenge.targetValue : challenge.currentValue;
  const pct = isCompleted
    ? 100
    : Math.min(100, Math.round((challenge.currentValue / challenge.targetValue) * 100));

  const modalContent = (
    <div
      className="fixed inset-0 z-[110] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-zinc-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-zinc-900 border-0 sm:border border-[#F6721D]/90 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] max-h-full sm:my-auto text-zinc-100 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* High-Energy Hero Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#F6721D]/25 via-amber-500/10 to-zinc-950 border-b border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Close challenge details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 pr-10">
            <span className="px-2.5 py-0.5 rounded-md bg-[#F6721D]/20 text-amber-300 border border-[#F6721D]/40 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-current" />
              <span>{challenge.categoryBadge}</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-mono font-black text-[11px] flex items-center gap-1 shadow-xs">
              <Trophy className="w-3 h-3 stroke-[2.5]" />
              <span>+{challenge.rewardPts} PTS REWARD</span>
            </span>

            {isCompleted ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>COMPLETED · +10 PTS EARNED</span>
              </span>
            ) : isJoined ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[10px]">
                ACTIVE PARTICIPANT ✓
              </span>
            ) : null}
          </div>

          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-zinc-100 mt-3 leading-tight">
            {challenge.title}
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-amber-300/95 mt-1.5 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#F6721D] fill-current shrink-0" />
            <span>{challenge.heroTagline}</span>
          </p>

          {/* Quick Stats Pill Bar */}
          <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-zinc-800/80 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-400 font-mono block">Community Squad</span>
                <span className="font-bold text-zinc-100 font-mono tabular-nums truncate block">
                  {(challenge.participantsCount + (isJoined ? 1 : 0)).toLocaleString()} Lifters
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-400 font-mono block">Time Remaining</span>
                <span className="font-bold text-zinc-100 font-mono tabular-nums truncate block">
                  {challenge.daysLeft} Days Left
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-amber-400/30 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-amber-300/80 font-mono block">Finisher Prize</span>
                <span className="font-black text-amber-400 font-mono tabular-nums truncate block">
                  +{challenge.rewardPts} Rank Pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 min-h-0">
          {/* 1. Live Progress & Target Tracker */}
          <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-200">
                  Your Challenge Progress
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                {effectiveCurrent.toLocaleString()} / {challenge.targetValue.toLocaleString()} {challenge.unitLabel} ({pct}%)
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-emerald-400'
                    : isJoined
                    ? 'bg-gradient-to-r from-[#F6721D] to-amber-400'
                    : 'bg-zinc-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>
                {isCompleted
                  ? 'Challenge conquered! Your +10 Rank Points have been credited to your profile.'
                  : isJoined
                  ? 'Every logged workout automatically updates your challenge meter.'
                  : 'Join this challenge to start tracking your progress toward +10 Rank Points!'}
              </span>
              <span className="font-mono text-amber-300 font-semibold shrink-0 ml-2">
                Goal: {challenge.targetValue.toLocaleString()} {challenge.unitLabel}
              </span>
            </div>
          </div>

          {/* 2. The Mission: High-Energy Challenge Breakdown */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>What This Challenge Is All About</span>
            </h3>
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/90 space-y-3">
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                {challenge.energeticPitch}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {challenge.whyJoinBullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-300"
                  >
                    <Flame className="w-3.5 h-3.5 text-[#F6721D] shrink-0 mt-0.5 fill-current" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Tiered Checkpoints (Peloton / Strava Style Bronze -> Silver -> Gold) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>3-Stage Finisher Checkpoints</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {challenge.milestones.map((ms, idx) => {
                const reached = pct >= ms.thresholdPct;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-colors space-y-1 ${
                      reached
                        ? 'bg-amber-400/10 border-amber-400/40'
                        : 'bg-zinc-950/60 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          ms.tier === 'Gold Finisher'
                            ? 'bg-amber-400 text-zinc-950'
                            : ms.tier === 'Silver'
                            ? 'bg-zinc-300 text-zinc-950'
                            : 'bg-amber-700/40 text-amber-300 border border-amber-600/40'
                        }`}
                      >
                        {ms.tier} · {ms.thresholdPct}%
                      </span>
                      {reached && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-xs font-bold text-zinc-100 pt-1">{ms.title}</p>
                    <p className="text-[11px] text-zinc-400 leading-snug">{ms.rewardText}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Official Rules & Pro Coach Blueprint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/90 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-mono text-zinc-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Official Challenge Rules</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {challenge.officialRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 font-mono font-bold">0{i + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/90 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-mono text-zinc-200">
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span>Pro Blueprint To Win</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {challenge.proTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-zinc-800 bg-zinc-950/95 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-zinc-300">
              Complete this challenge to earn{' '}
              <strong className="text-amber-400 font-mono">+10 Rank Points</strong> & the{' '}
              <strong className="text-zinc-100">Challenge Conqueror</strong> badge!
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            <button
              type="button"
              onClick={() => onToggleJoin(challenge.id, challenge.title)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                isJoined
                  ? 'bg-zinc-800 hover:bg-zinc-750 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700'
              }`}
            >
              {isJoined ? 'Joined ✓ (Leave)' : 'Join Challenge'}
            </button>

            {isCompleted ? (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>+10 PTS Claimed</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onCompleteChallenge(challenge)}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Complete Challenge (+10 PTS)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
