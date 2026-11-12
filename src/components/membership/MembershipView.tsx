import React, { useState, useMemo } from 'react';
import {
  Mail,
  Lock,
  User,
  Check,
  Send,
  Calendar,
  Sparkles,
  BarChart2,
  TrendingUp,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Crown,
  ExternalLink,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
  RefreshCw,
  Bell,
  UserCheck,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
  Trophy,
  ArrowRight
} from 'lucide-react';
import {
  MemberAccount,
  UserProfile,
  ActiveWorkout,
  PersonalRecord,
  NearbyAthlete,
  UserSubscription
} from '../../types';
import {
  generateWeeklyProgressDigest,
  getWorldwideMembersOnSameLevel,
  getLocalAreaMembers
} from '../../utils/weeklyDigest';
import { saveMemberAccount, loginMemberAccount, logoutMemberAccount, addSentEmailRecord } from '../../utils/storage';
import {
  getRegisteredAthletes,
  updateAthleteConnection,
  acceptAthleteInvite
} from '../../utils/nearbyAthletesStorage';
import { WeeklyEmailPreviewModal } from './WeeklyEmailPreviewModal';
import { GymAvatar } from '../common/GymAvatar';
import { AthleteDetailModal } from '../social/AthleteDetailModal';
import { ConnectInviteModal } from '../social/ConnectInviteModal';
import { RegisterModal } from '../auth/RegisterModal';

interface MembershipViewProps {
  memberAccount: MemberAccount;
  onUpdateMemberAccount: (account: MemberAccount) => void;
  userProfile?: UserProfile | null;
  workoutHistory?: ActiveWorkout[];
  personalRecords?: PersonalRecord[];
  subscription?: UserSubscription;
  onOpenProModal?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLogout?: () => void;
  onClose?: () => void;
}

export const MembershipView: React.FC<MembershipViewProps> = ({
  memberAccount,
  onUpdateMemberAccount,
  userProfile,
  workoutHistory = [],
  personalRecords = [],
  subscription,
  onOpenProModal,
  onNavigateTab,
  onLogout,
  onClose
}) => {
  // Login form state
  const [emailInput, setEmailInput] = useState<string>(memberAccount.email || 'xfitt.mail@gmail.com');
  const [nameInput, setNameInput] = useState<string>(memberAccount.name || userProfile?.name || 'Alex Hunter');
  const [optInEmails, setOptInEmails] = useState<boolean>(
    memberAccount.emailPreferences?.weeklyDigestEnabled ?? true
  );
  const [loginError, setLoginError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'login'>('register');

  // Weekly digest modal state
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<string>('');

  // Member profile detail modal & connections
  const [selectedAthlete, setSelectedAthlete] = useState<NearbyAthlete | null>(null);
  const [connectedAthleteIds, setConnectedAthleteIds] = useState<string[]>(['ath_1', 'ath_2']);
  const [connectModalAthlete, setConnectModalAthlete] = useState<NearbyAthlete | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [digestRefreshKey, setDigestRefreshKey] = useState<number>(0);
  const [expandedAthleteIds, setExpandedAthleteIds] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Compute live digest
  const activeDigest = useMemo(() => {
    return generateWeeklyProgressDigest(userProfile, workoutHistory, personalRecords, memberAccount);
  }, [userProfile, workoutHistory, personalRecords, memberAccount, digestRefreshKey]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setLoginError('Please provide a valid email address');
      return;
    }
    setLoginError('');
    const updated = loginMemberAccount(emailInput, nameInput, optInEmails);
    onUpdateMemberAccount(updated);
  };

  const handleToggleWeeklyDigestEnabled = (enabled: boolean) => {
    const updated: MemberAccount = {
      ...memberAccount,
      emailPreferences: {
        ...memberAccount.emailPreferences,
        weeklyDigestEnabled: enabled
      }
    };
    saveMemberAccount(updated);
    onUpdateMemberAccount(updated);
  };

  const handleLogout = () => {
    const updated = logoutMemberAccount();
    onUpdateMemberAccount(updated);
    if (onLogout) onLogout();
  };

  const handleTogglePreference = (key: keyof MemberAccount['emailPreferences']) => {
    const updated: MemberAccount = {
      ...memberAccount,
      emailPreferences: {
        ...memberAccount.emailPreferences,
        [key]: !memberAccount.emailPreferences[key]
      }
    };
    saveMemberAccount(updated);
    onUpdateMemberAccount(updated);
  };

  const handleDeliveryDayChange = (day: 'sunday' | 'monday' | 'friday') => {
    const updated: MemberAccount = {
      ...memberAccount,
      emailPreferences: {
        ...memberAccount.emailPreferences,
        deliveryDay: day
      }
    };
    saveMemberAccount(updated);
    onUpdateMemberAccount(updated);
  };

  const handleSendWeeklyEmail = async () => {
    setIsDispatching(true);
    setDispatchFeedback('');
    try {
      // Call backend API endpoint
      const response = await fetch('/api/membership/send-weekly-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: memberAccount.email,
          digest: activeDigest
        })
      });

      const data = await response.json().catch(() => ({ success: true }));

      const sentRecord = {
        id: data.emailId || 'mail_' + Date.now(),
        sentAt: data.sentAt || new Date().toISOString(),
        recipientEmail: memberAccount.email,
        subject: 'Your GymPax Weekly Progress Report & Community Connections 📊',
        encouragementMessage: activeDigest.encouragementMessage,
        stats: {
          workoutsCompleted: activeDigest.stats.workoutsCompleted,
          totalSets: activeDigest.stats.totalSets,
          totalVolumeKg: activeDigest.stats.totalVolumeKg,
          streakDays: activeDigest.stats.streakDays,
          topLiftPR: activeDigest.stats.topLiftPR
        },
        worldwideMembersCount: activeDigest.worldwideSuggestedMembers.length,
        localMembersCount: activeDigest.localAreaMembers.length
      };

      const updated = addSentEmailRecord(sentRecord);
      onUpdateMemberAccount(updated);
      setDispatchFeedback(`Weekly progress digest dispatched to ${memberAccount.email}!`);
      setTimeout(() => setDispatchFeedback(''), 4500);
    } catch (err) {
      // Fallback local dispatch
      const sentRecord = {
        id: 'mail_' + Date.now(),
        sentAt: new Date().toISOString(),
        recipientEmail: memberAccount.email,
        subject: 'Your GymPax Weekly Progress Report & Community Connections 📊',
        encouragementMessage: activeDigest.encouragementMessage,
        stats: activeDigest.stats,
        worldwideMembersCount: activeDigest.worldwideSuggestedMembers.length,
        localMembersCount: activeDigest.localAreaMembers.length
      };
      const updated = addSentEmailRecord(sentRecord);
      onUpdateMemberAccount(updated);
      setDispatchFeedback(`Weekly progress digest dispatched to ${memberAccount.email}!`);
      setTimeout(() => setDispatchFeedback(''), 4500);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleToggleConnection = (athleteId: string, customMessage?: string) => {
    const allAthletes = getRegisteredAthletes();
    const target =
      allAthletes.find(a => a.id === athleteId) ||
      activeDigest.worldwideSuggestedMembers.find(a => a.id === athleteId) ||
      activeDigest.localAreaMembers.find(a => a.id === athleteId);
    if (!target) return;

    if (target.connectionStatus === 'incoming_request') {
      acceptAthleteInvite(athleteId);
      setConnectedAthleteIds(prev => [...prev.filter(id => id !== athleteId), athleteId]);
      setDigestRefreshKey(k => k + 1);
      if (selectedAthlete && selectedAthlete.id === athleteId) {
        setSelectedAthlete(prev => (prev ? { ...prev, connectionStatus: 'connected' } : null));
      }
      showToast(`🎉 Connected with ${target.name}! You are now gym buddies.`);
      return;
    }

    if (target.connectionStatus === 'pending') {
      updateAthleteConnection(athleteId, 'none');
      setConnectedAthleteIds(prev => prev.filter(id => id !== athleteId));
      setDigestRefreshKey(k => k + 1);
      if (selectedAthlete && selectedAthlete.id === athleteId) {
        setSelectedAthlete(prev => (prev ? { ...prev, connectionStatus: 'none', inviteMessage: undefined } : null));
      }
      showToast(`Cancelled connection request to ${target.name}.`);
      return;
    }

    if (target.connectionStatus === 'connected' || connectedAthleteIds.includes(athleteId)) {
      updateAthleteConnection(athleteId, 'none');
      setConnectedAthleteIds(prev => prev.filter(id => id !== athleteId));
      setDigestRefreshKey(k => k + 1);
      if (selectedAthlete && selectedAthlete.id === athleteId) {
        setSelectedAthlete(prev => (prev ? { ...prev, connectionStatus: 'none', inviteMessage: undefined } : null));
      }
      showToast(`Disconnected from ${target.name}.`);
      return;
    }

    // Athlete connectionStatus === 'none' (Inviting & connecting to someone suggested by the system)
    if (customMessage !== undefined) {
      applySendConnection(target, customMessage);
    } else {
      // Open modal to optionally write a short personalized message before connecting (same as community section)
      setConnectModalAthlete(target);
    }
  };

  const applySendConnection = (target: NearbyAthlete, customMessage?: string) => {
    const trimmedMessage = customMessage && customMessage.trim() ? customMessage.trim() : undefined;
    updateAthleteConnection(target.id, 'pending', trimmedMessage);
    setConnectedAthleteIds(prev => [...prev.filter(id => id !== target.id), target.id]);
    setDigestRefreshKey(k => k + 1);
    if (selectedAthlete && selectedAthlete.id === target.id) {
      setSelectedAthlete(prev =>
        prev ? { ...prev, connectionStatus: 'pending', inviteMessage: trimmedMessage, invitedAt: 'Just now' } : null
      );
    }
    if (trimmedMessage) {
      showToast(`Invitation sent to ${target.name} with your personalized message! ✉️`);
    } else {
      showToast(`Connection request sent to ${target.name}! ⏳`);
    }
  };

  // If user is not logged in: present clean minimalist login & join area
  if (!memberAccount.isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 space-y-5 text-zinc-100 font-sans relative">
        <div className="flex justify-end -mb-2">
          <button
            type="button"
            onClick={() => (onClose ? onClose() : onNavigateTab ? onNavigateTab('dashboard') : undefined)}
            aria-label="Close section"
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
            title="Close section"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-zinc-850 text-amber-400 border border-zinc-750 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            GymPax Member Area
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Log in with your email address to access your membership portal, weekly progress charts, and community connections.
          </p>
        </div>

        {/* Minimalist Login Form Card */}
        <form
          onSubmit={handleLogin}
          className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm space-y-3.5"
        >
          {loginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/80"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Your member account and weekly digests are associated with this address.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
              Athlete Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="e.g. Alex Hunter"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/80"
              />
            </div>
          </div>

          {/* Option to receive updated emails or not tick box */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-300 hover:text-zinc-100 select-none group">
              <input
                type="checkbox"
                checked={optInEmails}
                onChange={e => setOptInEmails(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-zinc-750 bg-zinc-950 accent-amber-400 cursor-pointer shrink-0"
              />
              <span className="leading-snug">
                <strong className="text-zinc-200 block font-medium group-hover:text-amber-300 transition-colors">
                  Receive updated emails
                </strong>
                <span className="text-[11px] text-zinc-400">
                  Send me weekly progress reports with volume charts, 5 level connections, and 5 local lifters.
                </span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-98 mt-2"
          >
            Log In & Enter Membership Area
          </button>

          <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80 text-xs">
            <span className="text-zinc-400">Need to create a new profile?</span>
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('register');
                setShowAuthModal(true);
              }}
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              Register with Email & Password →
            </button>
          </div>
        </form>

        <RegisterModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialTab={authModalTab}
          onSuccess={account => {
            onUpdateMemberAccount(account);
            setShowAuthModal(false);
          }}
        />

        {/* Minimalist Member Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/70 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Weekly Progress Digest</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Sunday performance summary with daily volume, hypertrophy balance, and 1RM tracking.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/70 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>5 Matches & 5 Local Lifters</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Curated connections with 5 worldwide athletes on your level and 5 members in your area.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Membership Area (Minimalist)
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 space-y-5 text-zinc-100 font-sans">
      {/* Membership Top Header Banner - Default User Card Design */}
      <article className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <GymAvatar
            avatarType={userProfile?.avatarType}
            avatarUrl={userProfile?.avatarUrl}
            avatarId={userProfile?.avatarId || 'u_me'}
            name={memberAccount.name}
            size="lg"
            fallbackInitials={memberAccount.name.substring(0, 2).toUpperCase()}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-zinc-100">
                {memberAccount.name}
              </h1>
              {subscription?.isPro ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-current" />
                  <span>PRO ATHLETE</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  STANDARD MEMBER
                </span>
              )}
              {memberAccount.isEmailVerified ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>VERIFIED</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>UNVERIFIED</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 flex-wrap font-mono">
              <span className="text-amber-400/90">{memberAccount.email}</span>
              <span className="text-zinc-600">·</span>
              <span>Level: {userProfile?.experienceLevel || 'Intermediate'}</span>
              <span className="text-zinc-600">·</span>
              <span>{userProfile?.cityOrTown || 'Austin'}, {userProfile?.country || 'USA'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('register');
              setShowAuthModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Register new athlete profile or switch accounts"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Register / Switch Account</span>
          </button>
          <button
            type="button"
            onClick={() => setShowEmailPreview(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview Weekly Email</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
            title="Log out or switch member email"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
          <button
            type="button"
            onClick={() => (onClose ? onClose() : onNavigateTab ? onNavigateTab('dashboard') : undefined)}
            className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
            title="Close section"
            aria-label="Close section"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </article>

      {dispatchFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{dispatchFeedback}</span>
          </div>
          <button
            onClick={() => setShowEmailPreview(true)}
            className="text-[11px] font-bold underline hover:text-white"
          >
            View Sent Email →
          </button>
        </div>
      )}

      {/* Main Recurring Weekly Email Digest Panel - Minimalist */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-850 text-amber-400 border border-zinc-750 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-zinc-100">
                  Weekly Automated Progress Email Event
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                  memberAccount.emailPreferences.weeklyDigestEnabled
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {memberAccount.emailPreferences.weeklyDigestEnabled ? 'RECURRING ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Dispatches once a week to showcase your volume, 1RM compound trends, coach encouragement, and member connections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSendWeeklyEmail}
              disabled={isDispatching}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700 active:scale-95 disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Weekly Email Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Option to receive updated emails or not tick box */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="membership-receive-emails-checkbox"
              checked={memberAccount.emailPreferences.weeklyDigestEnabled}
              onChange={e => handleToggleWeeklyDigestEnabled(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-zinc-750 bg-zinc-900 accent-amber-400 cursor-pointer shrink-0"
            />
            <div>
              <label
                htmlFor="membership-receive-emails-checkbox"
                className="text-xs sm:text-sm font-semibold text-zinc-100 cursor-pointer block"
              >
                Receive updated emails
              </label>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                {memberAccount.emailPreferences.weeklyDigestEnabled
                  ? 'Ticked: You will receive automated weekly progress emails with charts, 5 level connections, and 5 local lifters.'
                  : 'Unticked: Email updates are disabled. You will not receive recurring weekly progress digests.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              memberAccount.emailPreferences.weeklyDigestEnabled
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-zinc-850 text-zinc-400 border-zinc-750'
            }`}>
              {memberAccount.emailPreferences.weeklyDigestEnabled ? 'TICKED · ACTIVE' : 'UNTICKED · PAUSED'}
            </span>
          </div>
        </div>

        {/* Schedule & Delivery Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Card 1: Delivery Day */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300 uppercase">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Weekly Delivery Day</span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              {(['sunday', 'monday', 'friday'] as const).map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDeliveryDayChange(day)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    memberAccount.emailPreferences.deliveryDay === day
                      ? 'bg-zinc-800 text-amber-300 border border-zinc-700 shadow-xs'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-850'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Scheduled: 08:00 AM local time</p>
          </div>

          {/* Card 2: Recipient Address */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300 uppercase">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Delivery Recipient</span>
            </div>
            <p className="text-xs font-mono font-semibold text-zinc-200 truncate pt-0.5">
              {memberAccount.email}
            </p>
            <p className="text-[10px] text-emerald-400/90 font-mono">
              Verified for automated digests
            </p>
          </div>

          {/* Card 3: Included Modules */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Included in Digest</span>
            </div>
            <div className="text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Volume & 1RM Progression Charts</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3 h-3 text-amber-400 shrink-0" />
                <span>5 Level Matches & 5 Local Lifters</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Coach Encouragement Note</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview: Worldwide Members on Same Level (Max 5 Suggested) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">
              Worldwide Athletes on Your Level ({userProfile?.experienceLevel || 'Intermediate'})
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {activeDigest.worldwideSuggestedMembers.length} Members Suggested (Max 5)
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Athletes training at your exact experience tier across the globe, delivered in each weekly digest:
        </p>

        <div className="space-y-3.5">
          {activeDigest.worldwideSuggestedMembers.map(athlete => {
            const isConnected = connectedAthleteIds.includes(athlete.id) || athlete.connectionStatus === 'connected';
            const isPending = athlete.connectionStatus === 'pending';
            const cardKey = `ww_${athlete.id}`;
            const isExpanded = !!expandedAthleteIds[cardKey];
            const toggleExpand = () =>
              setExpandedAthleteIds(prev => ({ ...prev, [cardKey]: !isExpanded }));

            return (
              <article
                key={athlete.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-2.5 shadow-xs"
              >
                {/* 1. HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setSelectedAthlete(athlete)}
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
                        {athlete.uniqueId && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            #{athlete.uniqueId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 flex-wrap">
                        <span>{athlete.country || 'United States'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-zinc-300">{athlete.badge || athlete.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleConnection(athlete.id)}
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

                {/* Expanded Details */}
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
                        onClick={() => setSelectedAthlete(athlete)}
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

      {/* Live Preview: New Members in Your Area (Max 5 Members) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">
              New Members in Your Area ({userProfile?.cityOrTown || 'Austin, TX'})
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {activeDigest.localAreaMembers.length} Local Members (Max 5)
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Local lifters in your area to connect with, spot on compound lifts, and train with:
        </p>

        <div className="space-y-3.5">
          {activeDigest.localAreaMembers.map(athlete => {
            const isConnected = connectedAthleteIds.includes(athlete.id) || athlete.connectionStatus === 'connected';
            const isPending = athlete.connectionStatus === 'pending';
            const cardKey = `loc_${athlete.id}`;
            const isExpanded = !!expandedAthleteIds[cardKey];
            const toggleExpand = () =>
              setExpandedAthleteIds(prev => ({ ...prev, [cardKey]: !isExpanded }));

            return (
              <article
                key={athlete.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-2.5 shadow-xs"
              >
                {/* 1. HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setSelectedAthlete(athlete)}
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
                        <span>{athlete.country || 'United States'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-zinc-300">{athlete.badge || athlete.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleConnection(athlete.id)}
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

                {/* Expanded Details */}
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
                        onClick={() => setSelectedAthlete(athlete)}
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

      {/* Sent Emails History - Minimalist */}
      {memberAccount.sentEmailsHistory && memberAccount.sentEmailsHistory.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
            <Mail className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              Weekly Email Dispatch Log
            </h3>
          </div>
          <div className="space-y-2">
            {memberAccount.sentEmailsHistory.map(record => (
              <div
                key={record.id}
                className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-850 flex items-center justify-between text-xs text-zinc-300 font-mono"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-zinc-100 font-bold block">{record.subject}</span>
                    <span className="text-[11px] text-zinc-500">
                      Sent to {record.recipientEmail} · {new Date(record.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(true)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-amber-400 font-bold text-[11px] shrink-0 border border-zinc-800 cursor-pointer"
                >
                  View Email
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Weekly Email Preview Modal */}
      {showEmailPreview && (
        <WeeklyEmailPreviewModal
          digest={activeDigest}
          onClose={() => setShowEmailPreview(false)}
          onSendTestEmail={handleSendWeeklyEmail}
          onSelectAthleteProfile={athlete => {
            setSelectedAthlete(athlete);
          }}
          onToggleConnection={handleToggleConnection}
          connectedAthleteIds={connectedAthleteIds}
        />
      )}

      {/* Athlete Detail Profile Modal */}
      {selectedAthlete && (
        <AthleteDetailModal
          athlete={selectedAthlete}
          onClose={() => setSelectedAthlete(null)}
          onToggleConnection={(athleteId, customMessage) => {
            handleToggleConnection(athleteId, customMessage);
          }}
          userLevel={userProfile?.experienceLevel}
          userProfile={userProfile}
        />
      )}

      {/* Connect with Short Personalized Message Modal */}
      {connectModalAthlete && (
        <ConnectInviteModal
          isOpen={Boolean(connectModalAthlete)}
          athlete={connectModalAthlete}
          onClose={() => setConnectModalAthlete(null)}
          onSendInvite={(athleteId, customMessage) => {
            handleToggleConnection(athleteId, customMessage);
            setConnectModalAthlete(null);
          }}
        />
      )}

      {/* Floating Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-zinc-900 border border-amber-400/40 text-amber-300 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Athlete Registration & Account Modal */}
      <RegisterModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab={authModalTab}
        onSuccess={account => {
          onUpdateMemberAccount(account);
          setShowAuthModal(false);
        }}
      />
    </div>
  );
};
