import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Sparkles,
  TrendingUp,
  BarChart2,
  Users,
  MapPin,
  Globe,
  Award,
  Check,
  UserPlus,
  ExternalLink,
  Flame,
  Dumbbell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { WeeklyProgressEmailDigest, NearbyAthlete } from '../../types';
import { GymAvatar } from '../common/GymAvatar';
import { ConnectInviteModal } from '../social/ConnectInviteModal';

interface WeeklyEmailPreviewModalProps {
  digest: WeeklyProgressEmailDigest;
  onClose: () => void;
  onSendTestEmail: () => Promise<void>;
  onSelectAthleteProfile: (athlete: NearbyAthlete) => void;
  onToggleConnection: (athleteId: string, customMessage?: string) => void;
  connectedAthleteIds: string[];
}

export const WeeklyEmailPreviewModal: React.FC<WeeklyEmailPreviewModalProps> = ({
  digest,
  onClose,
  onSendTestEmail,
  onSelectAthleteProfile,
  onToggleConnection,
  connectedAthleteIds
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [connectModalAthlete, setConnectModalAthlete] = useState<NearbyAthlete | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [expandedAthleteIds, setExpandedAthleteIds] = useState<Record<string, boolean>>({});

  const handleConnectClick = (athlete: NearbyAthlete) => {
    const isConnected = connectedAthleteIds.includes(athlete.id) || athlete.connectionStatus === 'connected';
    const isPending = athlete.connectionStatus === 'pending';

    if (isConnected) {
      onToggleConnection(athlete.id);
      setToastNotification(`Disconnected from ${athlete.name}.`);
      setTimeout(() => setToastNotification(null), 3500);
      return;
    }

    if (isPending) {
      onToggleConnection(athlete.id);
      setToastNotification(`Cancelled connection request to ${athlete.name}.`);
      setTimeout(() => setToastNotification(null), 3500);
      return;
    }

    // Open custom message modal before connecting (same as community section)
    setConnectModalAthlete(athlete);
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSendTestEmail();
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const maxVolume = Math.max(...digest.dailyVolumeChart.map(d => d.volumeKg), 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] text-zinc-100 relative overflow-hidden font-sans">
        {/* Pinned Window Topbar (Email Client Mockup) */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Weekly Email Preview
                </span>
                <span className="text-zinc-600 hidden sm:inline">·</span>
                <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline truncate">
                  Sent every Sunday 8:00 AM
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                Your GymPax Weekly Progress Report & Community Connections 📊
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              title="Dispatch this email to your address"
            >
              {sendSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send Test Email</span>
                  <span className="sm:hidden">Send</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer transition-colors"
              aria-label="Close email preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Metadata Strip */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 bg-zinc-900 border-b border-zinc-850 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-zinc-500">From: </span>
              <span className="text-zinc-200 font-semibold">GymPax Coach &lt;coach@gympax.com&gt;</span>
            </div>
            <span className="text-zinc-700">·</span>
            <div>
              <span className="text-zinc-500">To: </span>
              <span className="text-amber-400 font-semibold">{digest.recipientEmail}</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-500">
            Cycle: {digest.dateRange}
          </div>
        </div>

        {/* Scrollable Email Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 bg-zinc-950 text-zinc-100 scrollbar-thin">
          {/* Email Container Card */}
          <div className="max-w-2xl mx-auto space-y-6 bg-zinc-900 border border-zinc-800/90 rounded-3xl p-5 sm:p-7 shadow-xl">
            {/* Brand Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-zinc-950 font-black font-display text-sm tracking-wider">
                  GP
                </div>
                <div>
                  <span className="font-extrabold font-display tracking-wider text-base text-zinc-100">
                    GYMPAX
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block -mt-1">
                    WEEKLY ATHLETE DIGEST
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {digest.stats.streakDays}d Streak Active 🔥
              </span>
            </div>

            {/* Section 1: Short Encouragement Message */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-400/10 via-zinc-900 to-zinc-950 border border-amber-400/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Coach Weekly Encouragement</span>
              </div>
              <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed italic">
                "{digest.encouragementMessage}"
              </p>
              <div className="text-right text-[11px] font-mono text-zinc-400">
                — Head Strength Coach, GymPax Platform
              </div>
            </div>

            {/* Section 2: Weekly Progress Overview Stats */}
            <div>
              <div className="flex items-center gap-2 pb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Weekly Training Performance Snapshot
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Workouts</span>
                  <span className="font-mono text-2xl font-black text-amber-400">
                    {digest.stats.workoutsCompleted}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">sessions</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Volume Load</span>
                  <span className="font-mono text-2xl font-black text-zinc-100">
                    {Math.round(digest.stats.totalVolumeKg / 1000)}k
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">kg lifted</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Working Sets</span>
                  <span className="font-mono text-2xl font-black text-zinc-100">
                    {digest.stats.totalSets}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">completed</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Consistency</span>
                  <span className="font-mono text-2xl font-black text-emerald-400">
                    {digest.stats.consistencyScorePercent}%
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">discipline</span>
                </div>
              </div>
            </div>

            {/* Section 3: Progress Charts & Graphs */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Weekly Volume Progression (Daily Breakdown)
                </h4>
              </div>

              {/* Bar Chart */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2">
                  {digest.dailyVolumeChart.map((d, idx) => {
                    const heightPercent = d.volumeKg > 0 ? Math.max(18, Math.round((d.volumeKg / maxVolume) * 100)) : 6;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[10px] font-mono text-zinc-400 mb-1 opacity-80 group-hover:opacity-100">
                          {d.sets > 0 ? `${d.sets}s` : '—'}
                        </span>
                        <div className="w-full max-w-[32px] bg-zinc-850 rounded-t-lg overflow-hidden flex items-end h-full">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              d.isWorkoutDay
                                ? 'bg-gradient-to-t from-amber-500 to-amber-300 group-hover:from-amber-400 group-hover:to-amber-200'
                                : 'bg-zinc-800'
                            }`}
                          />
                        </div>
                        <span className={`text-[11px] font-mono mt-2 ${
                          d.isWorkoutDay ? 'text-zinc-200 font-bold' : 'text-zinc-600'
                        }`}>
                          {d.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-850">
                  <span>Legend: Amber bars indicate completed training sessions</span>
                  <span className="font-mono text-zinc-400">Total: {digest.stats.totalVolumeKg.toLocaleString()} kg</span>
                </div>
              </div>

              {/* Muscle Group Hypertrophy Distribution Meters */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300">
                  <span>Muscle Group Focus</span>
                  <span>Hypertrophy Distribution</span>
                </div>
                <div className="space-y-2.5">
                  {digest.muscleGroupDistribution.map((m, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-300">{m.muscle}</span>
                        <span className="font-mono text-zinc-400 text-[11px]">
                          {m.sets} sets · {m.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
                        <div
                          style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compound Lift Strength Progression */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <span className="text-xs font-mono font-bold text-zinc-300 block">
                  Compound Lifts 1RM Estimates & Progression
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {digest.strengthProgression.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 truncate block font-medium">
                        {s.exercise.replace('Barbell ', '')}
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-mono text-base font-bold text-zinc-100">
                          {s.currentWeightKg}kg
                        </span>
                        {s.deltaKg > 0 && (
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">
                            +{s.deltaKg}kg
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Worldwide Suggested Members on Your Level (Max 5 Members) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                    Worldwide Athletes on Your Level (Max 5 Suggested)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {digest.worldwideSuggestedMembers.length} Connections Suggested
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect and share PR milestones with lifters around the world training at your exact experience level:
              </p>

              <div className="space-y-3.5">
                {digest.worldwideSuggestedMembers.map(athlete => {
                  const isConnected = connectedAthleteIds.includes(athlete.id) || athlete.connectionStatus === 'connected';
                  const isPending = athlete.connectionStatus === 'pending';
                  const cardKey = `em_ww_${athlete.id}`;
                  const isExpanded = !!expandedAthleteIds[cardKey];
                  const toggleExpand = () =>
                    setExpandedAthleteIds(prev => ({ ...prev, [cardKey]: !isExpanded }));

                  return (
                    <article
                      key={athlete.id}
                      className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-3.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => onSelectAthleteProfile(athlete)}
                          className="flex items-center gap-3 cursor-pointer group min-w-0"
                        >
                          <GymAvatar
                            avatarType={athlete.avatarType}
                            avatarUrl={athlete.avatarUrl}
                            avatarId={athlete.avatarId || athlete.id || athlete.avatarSeed}
                            name={athlete.name}
                            size="md"
                            fallbackInitials={athlete.name.substring(0, 2).toUpperCase()}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                                {athlete.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 flex-wrap">
                              <span>{athlete.cityOrTown || athlete.city}, {athlete.country}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-zinc-300">{athlete.badge || athlete.level}</span>
                              {athlete.streakDays > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-amber-400 font-mono tabular-nums">
                                    {athlete.streakDays}d streak
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConnectClick(athlete)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                              isConnected
                                ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 border-amber-400 shadow-xs'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <UserCheck className="w-3 h-3 stroke-[2.5]" />
                                <span>Connected</span>
                              </>
                            ) : isPending ? (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3 stroke-[2.5]" />
                                <span>Connect</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={toggleExpand}
                            aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                            title={isExpanded ? 'Collapse card' : 'Expand card'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {!isExpanded && (
                        <div
                          onClick={toggleExpand}
                          className="pt-1 text-xs text-zinc-300 cursor-pointer group truncate"
                        >
                          <span className="font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                            {athlete.workoutSplit ? athlete.workoutSplit.split('(')[0].trim() : athlete.level}
                          </span>
                          <span className="text-zinc-500 text-[11px] truncate ml-2">
                            · {athlete.favoriteLifts || athlete.primaryGoal}
                          </span>
                        </div>
                      )}

                      {isExpanded && (
                        <>
                          <div className="grid grid-cols-3 gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                            <div>
                              <span className="text-[11px] text-zinc-500 block">Experience</span>
                              <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                                {athlete.level}
                              </span>
                            </div>
                            <div className="border-x border-zinc-800/80 px-3">
                              <span className="text-[11px] text-zinc-500 block">Frequency</span>
                              <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                                {athlete.trainingDaysPerWeek || 5}d / week
                              </span>
                            </div>
                            <div className="pl-1">
                              <span className="text-[11px] text-zinc-500 block">Streak</span>
                              <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1 truncate">
                                <Trophy className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{athlete.streakDays}d streak</span>
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                            <button
                              type="button"
                              onClick={() => onSelectAthleteProfile(athlete)}
                              className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Athlete Profile</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={toggleExpand}
                              aria-label="Collapse card"
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                              title="Collapse card"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Section 5: New Members in Your Area (Max 5 Members) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                    New Members in Your Area (Max 5 Members)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {digest.localAreaMembers.length} Nearby Lifters
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Meet and train with local athletes active in your gym community:
              </p>

              <div className="space-y-3.5">
                {digest.localAreaMembers.map(athlete => {
                  const isConnected = connectedAthleteIds.includes(athlete.id) || athlete.connectionStatus === 'connected';
                  const isPending = athlete.connectionStatus === 'pending';
                  const cardKey = `em_loc_${athlete.id}`;
                  const isExpanded = !!expandedAthleteIds[cardKey];
                  const toggleExpand = () =>
                    setExpandedAthleteIds(prev => ({ ...prev, [cardKey]: !isExpanded }));

                  return (
                    <article
                      key={athlete.id}
                      className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-3.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => onSelectAthleteProfile(athlete)}
                          className="flex items-center gap-3 cursor-pointer group min-w-0"
                        >
                          <GymAvatar
                            avatarType={athlete.avatarType}
                            avatarUrl={athlete.avatarUrl}
                            avatarId={athlete.avatarId || athlete.id || athlete.avatarSeed}
                            name={athlete.name}
                            size="md"
                            fallbackInitials={athlete.name.substring(0, 2).toUpperCase()}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                                {athlete.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 flex-wrap">
                              <span>{athlete.distanceMiles ? `${athlete.distanceMiles} mi` : 'Nearby'} · {athlete.gymName || 'Local Gym'}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-zinc-300">{athlete.badge || athlete.level}</span>
                              {athlete.streakDays > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-amber-400 font-mono tabular-nums">
                                    {athlete.streakDays}d streak
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConnectClick(athlete)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                              isConnected
                                ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 border-amber-400 shadow-xs'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <UserCheck className="w-3 h-3 stroke-[2.5]" />
                                <span>Connected</span>
                              </>
                            ) : isPending ? (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3 stroke-[2.5]" />
                                <span>Connect</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={toggleExpand}
                            aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                            title={isExpanded ? 'Collapse card' : 'Expand card'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {!isExpanded && (
                        <div
                          onClick={toggleExpand}
                          className="pt-1 text-xs text-zinc-300 cursor-pointer group truncate"
                        >
                          <span className="font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                            {athlete.workoutSplit ? athlete.workoutSplit.split('(')[0].trim() : 'Push / Pull / Legs'}
                          </span>
                          <span className="text-zinc-500 text-[11px] truncate ml-2">
                            · {athlete.favoriteLifts || athlete.gymName || 'Local Gym'}
                          </span>
                        </div>
                      )}

                      {isExpanded && (
                        <>
                          <div className="grid grid-cols-3 gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                            <div>
                              <span className="text-[11px] text-zinc-500 block">Experience</span>
                              <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                                {athlete.level}
                              </span>
                            </div>
                            <div className="border-x border-zinc-800/80 px-3">
                              <span className="text-[11px] text-zinc-500 block">Distance</span>
                              <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                                {athlete.distanceMiles ? `${athlete.distanceMiles} mi` : 'Nearby'}
                              </span>
                            </div>
                            <div className="pl-1">
                              <span className="text-[11px] text-zinc-500 block">Streak</span>
                              <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1 truncate">
                                <Trophy className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{athlete.streakDays}d streak</span>
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                            <button
                              type="button"
                              onClick={() => onSelectAthleteProfile(athlete)}
                              className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Athlete Profile</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={toggleExpand}
                              aria-label="Collapse card"
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                              title="Collapse card"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Email Footer */}
            <div className="pt-5 border-t border-zinc-850 text-center text-[11px] text-zinc-500 space-y-1 font-mono">
              <p>You received this automated progress digest because you are an active member of GymPax.</p>
              <p>Delivered weekly every Sunday at 8:00 AM · Manage notification frequency in your Membership Portal.</p>
              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 pt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>GymPax Automated Weekly Progress Engine · Encrypted Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Window Bottom Actions */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Preview
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Weekly Progress Email Now</span>
          </button>
        </div>
      </div>

      {/* Connect with Custom Message Modal */}
      {connectModalAthlete && (
        <ConnectInviteModal
          isOpen={Boolean(connectModalAthlete)}
          athlete={connectModalAthlete}
          onClose={() => setConnectModalAthlete(null)}
          onSendInvite={(athleteId, customMessage) => {
            onToggleConnection(athleteId, customMessage);
            const targetName = connectModalAthlete.name;
            setConnectModalAthlete(null);
            if (customMessage && customMessage.trim()) {
              setToastNotification(`Invitation sent to ${targetName} with your personalized message! ✉️`);
            } else {
              setToastNotification(`Connection request sent to ${targetName}! ⏳`);
            }
            setTimeout(() => setToastNotification(null), 4000);
          }}
        />
      )}

      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-zinc-900 border border-amber-400/40 text-amber-300 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}
    </div>
  );
};
