import React, { useState } from 'react';
import {
  X,
  Zap,
  Flame,
  Shield,
  Trophy,
  Award,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Lock,
  Crown,
  Check,
  Share2,
  Users,
  MessageSquare,
  Scale,
  Dumbbell,
  Activity,
  Droplets,
  Bookmark,
  Copy,
  Plus
} from 'lucide-react';
import { RewardsProfile, UserBadge, UserSubscription } from '../../types';
import { getUserSubscription } from '../../utils/storage';
import {
  AVAILABLE_BADGES,
  purchaseStreakFreeze,
  getRewardsProfile,
  awardAppShare,
  awardReferralJoined,
  awardWaterHydrationLogged
} from '../../utils/rewardsEngine';

interface RewardsModalProps {
  onClose: () => void;
  initialProfile?: RewardsProfile;
  onProfileUpdated?: (updated: RewardsProfile) => void;
  subscription?: UserSubscription;
  onOpenProModal?: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  onClose,
  initialProfile,
  onProfileUpdated,
  subscription,
  onOpenProModal
}) => {
  const [profile, setProfile] = useState<RewardsProfile>(
    () => initialProfile || getRewardsProfile()
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const currentSubscription = subscription || getUserSubscription();
  const isProMember = Boolean(currentSubscription?.isPro);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBuyShield = () => {
    const res = purchaseStreakFreeze(isProMember);
    showToast(res.message);
    if (res.success) {
      setProfile(res.updatedProfile);
      if (onProfileUpdated) onProfileUpdated(res.updatedProfile);
    } else if (res.requiresProUpgrade && onOpenProModal) {
      onOpenProModal();
    }
  };

  const handleShareApp = async () => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gympax.app';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'GymPax Workout Tracker',
          text: 'Track progressive overload, log sets, and build fitness points on GymPax!',
          url: appUrl
        });
        const res = awardAppShare('Web Share');
        showToast(res.message);
        if (res.success) {
          setProfile(res.profile);
          if (onProfileUpdated) onProfileUpdated(res.profile);
        }
      } catch {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${appUrl}?ref=GYM-SQUAD`);
        const res = awardAppShare('Link Copied');
        showToast(res.message);
        if (res.success) {
          setProfile(res.profile);
          if (onProfileUpdated) onProfileUpdated(res.profile);
        }
      } catch {
        showToast('Invite link ready to share!');
      }
    }
  };

  const handleSimulateReferralJoin = () => {
    const buddies = ['Marcus V.', 'David Chen', 'Sarah Miller', 'Alex R.', 'Coach Mike'];
    const randomBuddy = buddies[Math.floor(Math.random() * buddies.length)];
    const res = awardReferralJoined(randomBuddy);
    showToast(res.message);
    if (res.success) {
      setProfile(res.profile);
      if (onProfileUpdated) onProfileUpdated(res.profile);
    }
  };

  const handleLogWaterHydration = () => {
    const res = awardWaterHydrationLogged(2.5);
    showToast(res.message);
    if (res.success) {
      setProfile(res.profile);
      if (onProfileUpdated) onProfileUpdated(res.profile);
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-sky-400" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-300" />;
      case 'target':
        return <Target className="w-5 h-5 text-emerald-400" />;
      default:
        return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  const isElite = profile.section === 'Elite';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-800 border border-amber-400 text-xs text-zinc-100 font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-950/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>4-Section Fitness Rewards System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight mt-0.5 flex items-center gap-2">
              {isElite && <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />}
              <span>{profile.rankTitle}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              5 points per completed workout · 333 pts per level · 1000 pts per section
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-zinc-100">
          {/* Top Points Balance & Streak Hero */}
          <div className="grid grid-cols-2 gap-3">
            {/* Points Balance */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block">
                Total Earned Points
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-mono text-amber-400">
                  {profile.points}
                </span>
                <span className="text-xs text-zinc-400 font-bold">pts</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono block">
                5 points per daily workout
              </span>
            </div>

            {/* Streak & Consistency */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold flex items-center justify-between">
                <span>Active Streak</span>
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-mono text-zinc-100">
                  {profile.currentStreakDays}
                </span>
                <span className="text-xs text-zinc-400 font-bold">Days</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono block">
                Best: {profile.longestStreakDays}d · Shields: {isProMember ? 'Unlimited (Pro)' : `${profile.streakFreezeCount}/1 (2-Mo)`}
              </span>
            </div>
          </div>

          {/* 4-Section Stepper Overview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Fitness Sections (1000 Pts Each)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Beginner', 'Intermediate', 'Pro', 'Elite'] as const).map((sec, idx) => {
                const order = ['Beginner', 'Intermediate', 'Pro', 'Elite'];
                const currentIdx = order.indexOf(profile.section);
                const secIdx = order.indexOf(sec);
                const isCurrent = profile.section === sec;
                const isPassed = secIdx < currentIdx;

                return (
                  <div
                    key={sec}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 ring-1 ring-amber-400/30'
                        : isPassed
                        ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                        : 'bg-zinc-950/30 border-zinc-850 opacity-60 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {sec === 'Elite' && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      <span className="font-bold text-xs">{sec}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                      {isCurrent ? `Level ${profile.level}` : isPassed ? 'Completed' : '1000 pts'}
                    </span>
                    <span className="text-[9px] text-zinc-500 block">
                      {sec === 'Elite' ? 'Earned Only' : `Tier ${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Progression & Points Needed */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">
                  {profile.pointsToNextLevel > 0
                    ? `${profile.pointsToNextLevel} points to reach ${profile.nextRankTitle}`
                    : 'Max Section Level!'}
                </span>
                <span className="font-mono text-zinc-400 text-[11px]">
                  {333 - profile.pointsToNextLevel} / 333 pts
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${profile.levelProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1.5 border-t border-zinc-850">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {profile.section === 'Elite'
                    ? 'Pinnacle Elite Tier'
                    : `${profile.pointsToNextSection} points to reach ${
                        profile.section === 'Beginner'
                          ? 'Intermediate'
                          : profile.section === 'Intermediate'
                          ? 'Pro'
                          : 'Elite'
                      }`}
                </span>
                <span className="font-mono text-amber-400 font-bold text-[11px]">
                  {profile.sectionPoints} / 1000 pts
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${profile.sectionProgressPercent}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 pt-0.5">
              Each completed workout awards exactly <strong>5 points</strong>. Complete approx{' '}
              <strong className="text-amber-300">
                {Math.ceil(profile.pointsToNextLevel / 5)} more workouts
              </strong>{' '}
              to level up.
            </p>
          </div>

          {/* How to Build Points Section (< 5 pts per activity, 5 pts workout remains king) */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  How to Build Points
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                WORKOUTS ARE 5 PTS · OTHERS &lt; 5 PTS
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Completed workouts remain the quickest and best way to earn points (<strong>+5 points/day</strong>). Build additional points through active consistency and community spotter feedback:
            </p>

            <div className="space-y-2 text-xs">
              {/* 1. Daily Completed Workout (The Primary Driver: 5 Points) */}
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
                    <Dumbbell className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-100 truncate block">Complete Daily Workout Session</span>
                    <span className="text-[10px] text-amber-300/90 truncate block">Best & quickest way to earn points (Daily Primary)</span>
                  </div>
                </div>
                <span className="font-mono font-black text-amber-400 text-xs px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 shrink-0">
                  +5 pts
                </span>
              </div>

              {/* Quick Interactive Actions Strip */}
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Quick Point Actions</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Tap to earn instantly</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleShareApp}
                    className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-sky-500/50 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full">
                      <Share2 className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-mono font-bold text-sky-400">+2 pts</span>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-300 mt-1 truncate">Share App</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateReferralJoin}
                    className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full">
                      <Users className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-mono font-bold text-emerald-400">+3 pts</span>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-300 mt-1 truncate">Buddy Join</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogWaterHydration}
                    className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-mono font-bold text-cyan-400">+1 pt</span>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-300 mt-1 truncate">Log Water</span>
                  </button>
                </div>
              </div>

              {/* 2. Referral Sign-Up */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">New Lifter Joins with Your Link</span>
                    <span className="text-[10px] text-zinc-400 truncate block">When a gym buddy registers using your invite link</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 shrink-0">
                  +3 pts
                </span>
              </div>

              {/* 3. 7-Day Consistency Streak */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">7-Day Consistency Streak Milestone</span>
                    <span className="text-[10px] text-zinc-400 truncate block">Weekly workout consistency discipline bonus</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-orange-400 text-xs px-2 py-0.5 rounded bg-orange-500/10 shrink-0">
                  +3 pts
                </span>
              </div>

              {/* 4. Share App */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">Share GymPax App & Link</span>
                    <span className="text-[10px] text-zinc-400 truncate block">Share via WhatsApp, SMS, or copy link (max 2/day)</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sky-400 text-xs px-2 py-0.5 rounded bg-sky-500/10 shrink-0">
                  +2 pts
                </span>
              </div>

              {/* 5. Set New Personal Record */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">Hit a New Personal Record (PR)</span>
                    <span className="text-[10px] text-zinc-400 truncate block">Overload mechanical tension & break past previous weight/reps</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 shrink-0">
                  +2 pts
                </span>
              </div>


              {/* 7. Regular Commenting on Other Lifters */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">Regular Commenting on Other Lifters</span>
                    <span className="text-[10px] text-zinc-400 truncate block">Constructive feedback on IronFeed (up to 3x/day)</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-indigo-400 text-xs px-2 py-0.5 rounded bg-indigo-500/10 shrink-0">
                  +1 pt
                </span>
              </div>

              {/* 8. Cheer Training Partners */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">Cheer Training Partners</span>
                    <span className="text-[10px] text-zinc-400 truncate block">High-five fellow lifters on IronFeed (max 2/day)</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-purple-400 text-xs px-2 py-0.5 rounded bg-purple-500/10 shrink-0">
                  +1 pt
                </span>
              </div>

              {/* 9. Log Body Measurements */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">Log Body Measurements / Weigh-in</span>
                    <span className="text-[10px] text-zinc-400 truncate block">Keep physique records up-to-date on Progress tab</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-teal-400 text-xs px-2 py-0.5 rounded bg-teal-500/10 shrink-0">
                  +1 pt
                </span>
              </div>

              {/* 10. Dynamic Warmup Coach */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">Dynamic Joint Warm-Up</span>
                    <span className="text-[10px] text-zinc-400 truncate block">Complete pre-workout mobility coach protocol</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-rose-400 text-xs px-2 py-0.5 rounded bg-rose-500/10 shrink-0">
                  +1 pt
                </span>
              </div>

              {/* 11. Daily Water Hydration */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">Log Daily Water Target</span>
                    <span className="text-[10px] text-zinc-400 truncate block">Hit your 2.5L+ hydration target for intra-muscular pump</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-cyan-400 text-xs px-2 py-0.5 rounded bg-cyan-500/10 shrink-0">
                  +1 pt
                </span>
              </div>

              {/* 12. Save Community Routine */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Bookmark className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 truncate block">Bookmark Community Workout</span>
                    <span className="text-[10px] text-zinc-400 truncate block">Adopt routines shared by fellow community lifters</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 shrink-0">
                  +1 pt
                </span>
              </div>
            </div>
          </div>

          {/* Training Frequency Audit (Week, Month, Year) */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex items-center justify-between text-xs">
            <div className="text-center flex-1 border-r border-zinc-850">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">This Week</span>
              <span className="text-sm font-bold font-mono text-zinc-200">
                {profile.weeklyTrainDaysCount} Days
              </span>
            </div>
            <div className="text-center flex-1 border-r border-zinc-850">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">This Month</span>
              <span className="text-sm font-bold font-mono text-zinc-200">
                {profile.monthlyTrainDaysCount} Days
              </span>
            </div>
            <div className="text-center flex-1">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">This Year</span>
              <span className="text-sm font-bold font-mono text-zinc-200">
                {profile.yearlyTrainDaysCount} Days
              </span>
            </div>
          </div>

          {/* Status & Utility Store: Streak Freeze Shield (Pro Member Benefit) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/30 via-zinc-950 to-zinc-950 border border-sky-500/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
                      Streak Freeze Shield
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-400/15 px-1.5 py-0.5 rounded border border-amber-400/30">
                      <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>PRO BENEFIT</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20">
                      {isProMember
                        ? 'Unlimited / 2 Months'
                        : `${profile.streakFreezeCount} / 1 Available (2-Mo Period)`}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Safeguards your active habit streak and points during rest or recovery periods.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-zinc-300 block">
                        Free Members
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-snug">
                        <strong className="text-sky-400">1 freeze shield</strong> available per <strong className="text-zinc-200">2-month period</strong>. After that, you lose <strong className="text-red-400">-2 points per day</strong> until resuming exercises again.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-300 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Pro Members</span>
                      </span>
                      <p className="text-[10px] text-zinc-300 leading-snug">
                        <strong className="text-amber-300">Unlimited freezes</strong> for a <strong className="text-zinc-100">2-month period</strong> with zero daily point loss while away.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isProMember ? (
              <button
                type="button"
                onClick={handleBuyShield}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-zinc-950 shadow-md"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>
                  {profile.isFreezeActive
                    ? 'Pro Unlimited Freeze Active (2-Month Protection)'
                    : 'Activate Pro Unlimited Freeze Shield (2-Month Period)'}
                </span>
              </button>
            ) : profile.streakFreezeCount > 0 ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleBuyShield}
                  className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer bg-sky-400 hover:bg-sky-300 text-zinc-950 shadow-md"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Use Free Freeze Shield (1/1 for 2 Months)</span>
                </button>
                {onOpenProModal && (
                  <button
                    type="button"
                    onClick={onOpenProModal}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Unlock Unlimited (Pro)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 flex items-center justify-between gap-2">
                  <span>
                    Free 2-month shield used ({profile.streakFreezeUsedInPeriod || 1}/1). Inactive days deduct <strong>-2 pts/day</strong> until you resume exercises.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenProModal) {
                      onOpenProModal();
                    } else {
                      handleBuyShield();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-zinc-950 shadow-md"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>Upgrade to Pro for Unlimited Freezes (2-Month Period)</span>
                </button>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Section & Discipline Badges
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_BADGES.map(b => {
                const isUnlocked = profile.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      isUnlocked
                        ? 'bg-zinc-950/80 border-amber-400/30 text-zinc-100 shadow-sm'
                        : 'bg-zinc-950/30 border-zinc-850/80 opacity-60 text-zinc-400'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-400/10 border border-amber-400/30'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                      }`}
                    >
                      {isUnlocked ? getBadgeIcon(b.icon) : <Lock className="w-4 h-4 text-zinc-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate block">{b.name}</span>
                        {isUnlocked && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{b.description}</p>
                      <span className="text-[10px] font-mono text-zinc-500 block pt-0.5">
                        {b.requirementDescription}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Points Log */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Recent Points Ledger
            </span>
            <div className="space-y-1.5">
              {profile.historyLogs.slice(0, 5).map(log => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-850 flex items-start sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5 sm:mt-0" />
                    <span className="text-zinc-300 break-words whitespace-normal leading-snug">{log.description}</span>
                  </div>
                  <span
                    className={`font-mono font-bold shrink-0 ml-2 ${
                      log.pointsDelta > 0 ? 'text-amber-400' : 'text-red-400'
                    }`}
                  >
                    {log.pointsDelta > 0 ? `+${log.pointsDelta}` : log.pointsDelta} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
