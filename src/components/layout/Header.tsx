import React, { useState, useRef, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Zap,
  Moon,
  Sun,
  Watch,
  Heart,
  User,
  BookOpen,
  Check,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Flame,
  Scale,
  Camera,
  Sparkles,
  Mail,
  UserPlus,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { SyncStatus, UserSubscription, UserProfile, EquipmentEnvironment, RewardsProfile, MemberAccount } from '../../types';
import { AppSettings, AppTheme } from '../../utils/storage';
import { GymAvatar } from '../common/GymAvatar';
import { AvatarSelectorModal } from '../common/AvatarSelectorModal';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  syncStatus: SyncStatus;
  onOpenSyncModal: () => void;
  subscription: UserSubscription;
  onOpenProModal: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenTrackerModal: () => void;
  onOpenProfileModal: () => void;
  connectedHeartRate?: number;
  userProfile?: UserProfile | null;
  currentEnvironment?: EquipmentEnvironment;
  onOpenEquipmentModal?: () => void;
  onOpenGlossary?: () => void;
  onOpenTermsModal?: () => void;
  rewardsProfile?: RewardsProfile;
  onOpenRewardsModal?: () => void;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  onOpenFrontPage?: () => void;
  memberAccount?: MemberAccount;
  onOpenRegister?: (initialTab?: 'register' | 'login') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  syncStatus,
  onOpenSyncModal,
  subscription,
  onOpenProModal,
  settings,
  onUpdateSettings,
  onOpenTrackerModal,
  onOpenProfileModal,
  connectedHeartRate,
  userProfile,
  currentEnvironment = 'commercial_gym',
  onOpenEquipmentModal,
  onOpenGlossary,
  onOpenTermsModal,
  rewardsProfile,
  onOpenRewardsModal,
  onUpdateUserProfile,
  onOpenFrontPage,
  memberAccount,
  onOpenRegister
}) => {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showUserMenu]);

  const handleSelectTheme = (theme: AppTheme) => {
    onUpdateSettings({ ...settings, theme });
  };

  // Real-time avatar synchronization across the app
  const [, setAvatarUpdateTick] = useState<number>(0);

  useEffect(() => {
    const handleAvatarChange = () => {
      setAvatarUpdateTick(prev => prev + 1);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('gympax:avatar-changed', handleAvatarChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('gympax:avatar-changed', handleAvatarChange);
      }
    };
  }, []);

  const storedAvatarId = typeof window !== 'undefined' ? localStorage.getItem('gympax_user_avatar_id') : null;
  const storedAvatarUrl = typeof window !== 'undefined' ? localStorage.getItem('gympax_user_avatar_url') : null;
  const storedAvatarType = typeof window !== 'undefined' ? (localStorage.getItem('gympax_user_avatar_type') as 'upload' | 'animated' | null) : null;

  const currentAvatarType: 'upload' | 'animated' =
    userProfile?.avatarType || storedAvatarType || (userProfile?.avatarUrl || storedAvatarUrl ? 'upload' : 'animated');
  const currentAvatarUrl = userProfile?.avatarUrl || storedAvatarUrl || undefined;
  const currentAvatarId =
    userProfile?.avatarId ||
    storedAvatarId ||
    (userProfile?.gender === 'female' || userProfile?.gender === 'woman' ? 'gym_w1' : 'gym_m1');

  const athleteInitials = userProfile?.name
    ? userProfile.name.trim().substring(0, 2).toUpperCase()
    : 'AH';

  const formatEnvironmentLabel = (env: string) => {
    switch (env) {
      case 'commercial_gym':
        return 'Commercial Gym';
      case 'home_gym':
        return 'Home Gym';
      case 'free_weights_only':
        return 'Free Weights';
      case 'dumbbell_only':
        return 'Dumbbells Only';
      case 'kettlebell_only':
        return 'Kettlebell Only';
      case 'bodyweight_travel':
        return 'Bodyweight / Travel';
      default:
        return 'Gym';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Clean Minimal Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => {
              onTabChange('dashboard');
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="text-left group cursor-pointer focus-visible:outline-none flex items-center gap-1.5 sm:gap-2"
            title="GymPax - Home"
            aria-label="GymPax - Home"
          >
            <img
              src="/assets/aistudio/5_eca6fdc9.webp"
              alt="GymPax Logo"
              className="h-9 sm:h-10.5 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md shrink-0"
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-400">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`cursor-pointer transition-colors py-1 ${
              currentTab === 'dashboard'
                ? 'text-zinc-100 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-zinc-200'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('workout')}
            className={`cursor-pointer transition-colors py-1 ${
              currentTab === 'workout'
                ? 'text-zinc-100 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-zinc-200'
            }`}
          >
            Workout
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={`cursor-pointer transition-colors py-1 ${
              currentTab === 'calendar'
                ? 'text-zinc-100 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-zinc-200'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => onTabChange('plans')}
            className={`cursor-pointer transition-colors py-1 ${
              currentTab === 'plans'
                ? 'text-zinc-100 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-zinc-200'
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => onTabChange('progress')}
            className={`cursor-pointer transition-colors py-1 ${
              currentTab === 'progress'
                ? 'text-zinc-100 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-zinc-200'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => onTabChange('community')}
            className={`cursor-pointer transition-colors py-1 ${
              currentTab === 'community'
                ? 'text-zinc-100 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-zinc-200'
            }`}
          >
            Community
          </button>
        </nav>

        {/* Zone 3: Minimalist Actions & Unified Athlete Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 max-w-full">
          {/* Heart Rate (Quiet, only if active) */}
          {connectedHeartRate ? (
            <button
              onClick={onOpenTrackerModal}
              title="Connected Wearable Heart Rate"
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-red-400" />
              <span className="font-bold tabular-nums text-[11px] sm:text-xs">{connectedHeartRate}</span>
            </button>
          ) : null}

          {/* Offline Mode Indicator (Only if offline) */}
          {!syncStatus.isOnline && (
            <button
              onClick={onOpenSyncModal}
              title="Offline Mode - Changes saved locally"
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-xs font-mono text-amber-400 cursor-pointer shrink-0"
            >
              <WifiOff className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Equipment Location Switcher Toggle */}
          {onOpenEquipmentModal && (
            <button
              type="button"
              onClick={onOpenEquipmentModal}
              title={`Active Equipment: ${formatEnvironmentLabel(currentEnvironment)} — Tap to switch equipment setup`}
              aria-label={`Active Equipment: ${formatEnvironmentLabel(currentEnvironment)}`}
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-zinc-900/90 hover:bg-zinc-850 text-zinc-300 hover:text-amber-400 border border-zinc-800 hover:border-amber-400/40 transition-all cursor-pointer text-xs shrink-0"
            >
              <span className="text-xs sm:text-sm leading-none">
                {currentEnvironment === 'home_gym'
                  ? '🏠'
                  : currentEnvironment === 'free_weights_only'
                  ? '⚖️'
                  : currentEnvironment === 'dumbbell_only'
                  ? '🦾'
                  : currentEnvironment === 'bodyweight_travel'
                  ? '✈️'
                  : '🏋️'}
              </span>
              <span className="font-semibold text-[11px] hidden md:inline truncate max-w-[100px]">
                {formatEnvironmentLabel(currentEnvironment)}
              </span>
            </button>
          )}

          {/* Single Unified Athlete & App Control (Pristine minimalism) */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Athlete Profile and App Settings Menu"
              className="flex items-center gap-1 sm:gap-2 p-0.5 sm:py-1 sm:pl-1 sm:pr-2.5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer group shrink-0 select-none"
            >
              <div className="shrink-0 rounded-full">
                <GymAvatar
                  avatarType={currentAvatarType}
                  avatarUrl={currentAvatarUrl}
                  avatarId={currentAvatarId}
                  size="sm"
                  fallbackInitials={athleteInitials}
                  name={userProfile?.name || 'Alex Hunter'}
                />
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-left">
                <span className="font-semibold text-zinc-200 group-hover:text-zinc-100 truncate max-w-[80px]">
                  {userProfile?.name ? userProfile.name.split(' ')[0] : 'Athlete'}
                </span>
                {rewardsProfile && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="font-mono text-amber-400/90 text-[11px] font-bold">
                      {rewardsProfile.rankTitle.replace(' - Level ', ' L')}
                    </span>
                  </>
                )}
              </div>
              <ChevronDown
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400 transition-transform shrink-0 ${
                  showUserMenu ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Modal / Sheet */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1.25rem)] sm:w-80 max-w-[320px] sm:max-w-none max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain bg-zinc-900/95 backdrop-blur-xl border border-amber-400/80 rounded-2xl sm:rounded-3xl shadow-2xl p-2.5 pb-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-zinc-100 font-sans space-y-2 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.25)]">
                {/* Appearance Theme (Dark / Gray / Light) - Top of User Settings */}
                <div className="px-2.5 py-1.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/70">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div>
                      <span className="text-zinc-200 font-semibold text-[11px] block">
                        Theme
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        {settings.theme === 'gray'
                          ? 'Dark Slate'
                          : settings.theme === 'light'
                          ? 'Crisp Daylight'
                          : 'OLED Black'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] bg-zinc-900 p-0.5 rounded-lg border border-zinc-800/80">
                      {[
                        { id: 'dark', label: 'Dark', title: 'Dark (OLED Black — Pure Pitch Black)' },
                        { id: 'gray', label: 'Gray', title: 'Gray (Dark Slate Gray)' },
                        { id: 'light', label: 'Light', title: 'Light (Crisp Daylight Off-White)' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTheme(t.id as AppTheme)}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer font-bold ${
                            settings.theme === t.id || (t.id === 'dark' && settings.theme === 'amoled')
                              ? 'bg-amber-400 text-zinc-950 shadow-xs'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                          }`}
                          title={t.title}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* User Card Summary */}
                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="relative group shrink-0">
                      <GymAvatar
                        avatarType={currentAvatarType}
                        avatarUrl={currentAvatarUrl}
                        avatarId={currentAvatarId}
                        size="md"
                        fallbackInitials={athleteInitials}
                        name={userProfile?.name || 'Alex Hunter'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowAvatarModal(true);
                        }}
                        className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Change Avatar or Photo"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-zinc-100 truncate block">
                          {userProfile?.name || 'Alex Hunter'}
                        </span>
                        {subscription.isPro ? (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            PRO
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[11px] text-zinc-400 truncate block">
                        {userProfile?.experienceLevel || 'Intermediate'} ·{' '}
                        {userProfile?.primaryGoal
                          ? userProfile.primaryGoal.split('(')[0].trim()
                          : 'Hypertrophy'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-zinc-800/60 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfileModal();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:bg-zinc-850 hover:text-zinc-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                        <span>Edit Profile</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowAvatarModal(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:bg-zinc-850 hover:text-zinc-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                        <span>Avatar / Photo</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        try {
                          sessionStorage.setItem('gympax_initial_social_tab', 'photos');
                        } catch {}
                        onTabChange('community');
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('gympax:open-my-photos'));
                        }
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:bg-zinc-850 hover:text-zinc-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                        <span>Profile and Photos</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Rewards & Discipline Status Card */}
                {rewardsProfile && onOpenRewardsModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenRewardsModal();
                    }}
                    className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-400/10 via-zinc-950 to-zinc-950 border border-amber-400/30 text-left hover:border-amber-400/50 transition-colors cursor-pointer space-y-1 block"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{rewardsProfile.points} Points</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400 fill-current" />
                        <span>{rewardsProfile.currentStreakDays}d streak</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-200">{rewardsProfile.rankTitle}</span>
                      <span className="text-amber-400 font-semibold underline text-[10px]">Rewards Hub →</span>
                    </div>
                  </button>
                )}


                {/* Register / Athlete Email direct envelope entry */}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenRegister) onOpenRegister('register');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Account</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </button>

                {/* Social Community */}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('community');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Social & Community</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </button>

                {/* Hardware & Setup */}
                <div className="space-y-0.5 pt-1 border-t border-zinc-800/60">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                    Hardware & Setup
                  </div>

                  {onOpenEquipmentModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenEquipmentModal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                        <span>Equipment Setup</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {formatEnvironmentLabel(currentEnvironment)}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenTrackerModal();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Watch className="w-3.5 h-3.5 text-sky-400" />
                      <span>Trackers & Heart Rate</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {connectedHeartRate ? `${connectedHeartRate} BPM` : 'Configure'}
                    </span>
                  </button>
                </div>


                {/* Unit Preferences (Minimalistic & Sleek) */}
                <div className="pt-2 pb-1.5 border-t border-zinc-800/60 px-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium text-[11px]">
                      Unit Preferences
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      {/* Pounds / Kilograms */}
                      <div className="flex items-center gap-0.5 text-zinc-500">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSettings({ ...settings, weightUnit: 'lbs' });
                            if (userProfile && onUpdateUserProfile) {
                              onUpdateUserProfile({ ...userProfile, weightUnit: 'lbs' });
                            }
                          }}
                          className={`px-1 py-0.5 rounded transition-colors cursor-pointer ${
                            settings.weightUnit === 'lbs'
                              ? 'text-amber-400 font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Pounds (lbs)"
                        >
                          lbs
                        </button>
                        <span className="text-zinc-600">/</span>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSettings({ ...settings, weightUnit: 'kg' });
                            if (userProfile && onUpdateUserProfile) {
                              onUpdateUserProfile({ ...userProfile, weightUnit: 'kg' });
                            }
                          }}
                          className={`px-1 py-0.5 rounded transition-colors cursor-pointer ${
                            settings.weightUnit === 'kg'
                              ? 'text-amber-400 font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Kilograms (kg)"
                        >
                          kg
                        </button>
                      </div>

                      <span className="text-zinc-700">·</span>

                      {/* Miles / Kilometers */}
                      <div className="flex items-center gap-0.5 text-zinc-500">
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              localStorage.setItem('soma_distance_unit', 'mi');
                            } catch {}
                            if (userProfile && onUpdateUserProfile) {
                              onUpdateUserProfile({ ...userProfile, distanceUnit: 'mi' });
                            }
                          }}
                          className={`px-1 py-0.5 rounded transition-colors cursor-pointer ${
                            ((typeof window !== 'undefined' && localStorage.getItem('soma_distance_unit')) || userProfile?.distanceUnit) === 'mi'
                              ? 'text-amber-400 font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Miles (mi)"
                        >
                          mi
                        </button>
                        <span className="text-zinc-600">/</span>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              localStorage.setItem('soma_distance_unit', 'km');
                            } catch {}
                            if (userProfile && onUpdateUserProfile) {
                              onUpdateUserProfile({ ...userProfile, distanceUnit: 'km' });
                            }
                          }}
                          className={`px-1 py-0.5 rounded transition-colors cursor-pointer ${
                            ((typeof window !== 'undefined' && localStorage.getItem('soma_distance_unit')) || userProfile?.distanceUnit || 'km') === 'km'
                              ? 'text-amber-400 font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Kilometers (km)"
                        >
                          km
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Knowledge & Health Rules */}
                <div className="space-y-0.5 pt-1 border-t border-zinc-800/60">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                    Knowledge & Legal
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenGlossary) onOpenGlossary();
                      else if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('soma:open-glossary', { detail: { termId: 'bmi' } })
                        );
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bodybuilding Glossary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenTermsModal) onOpenTermsModal();
                      else if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('soma:open-terms'));
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Terms of Use & Medical Notice</span>
                  </button>

                  {onOpenFrontPage && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenFrontPage();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Front Page / Welcome Screen</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSyncModal();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Offline Data & Sync</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {syncStatus.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </button>
                </div>

                {/* Pro Upgrade if not pro */}
                {!subscription.isPro && (
                  <div className="pt-1 border-t border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Upgrade to Pro</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Athlete Avatar Selector Modal */}
      {showAvatarModal && (
        <AvatarSelectorModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          currentAvatarType={currentAvatarType}
          currentAvatarUrl={currentAvatarUrl}
          currentAvatarId={currentAvatarId}
          athleteName={userProfile?.name}
          onSelectAvatar={data => {
            try {
              if (data.avatarType === 'upload' && data.avatarUrl) {
                localStorage.setItem('gympax_user_avatar_type', 'upload');
                localStorage.setItem('gympax_user_avatar_url', data.avatarUrl);
              } else if (data.avatarId) {
                localStorage.setItem('gympax_user_avatar_type', 'animated');
                localStorage.setItem('gympax_user_avatar_id', data.avatarId);
              }
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('gympax:avatar-changed', { detail: data }));
              }
            } catch {}

            const baseProfile: UserProfile = userProfile || {
              name: 'Alex Hunter',
              age: 26,
              gender: 'man',
              primaryGoal: 'Hypertrophy (Pure Muscle Mass)',
              experienceLevel: 'Intermediate',
              equipmentAccess: 'Full Commercial Gym',
              equipmentEnvironment: currentEnvironment || 'commercial_gym',
              daysPerWeek: 4,
              focusWeakpoint: 'Chest',
              heightCm: 180,
              weightKg: 82,
              targetWeightKg: 85,
              onboardingCompleted: true,
              avatarType: data.avatarType,
              avatarUrl: data.avatarUrl,
              avatarId: data.avatarId
            };

            const updatedProfile: UserProfile = {
              ...baseProfile,
              avatarType: data.avatarType,
              avatarUrl: data.avatarUrl,
              avatarId: data.avatarId
            };

            if (onUpdateUserProfile) {
              onUpdateUserProfile(updatedProfile);
            }
          }}
        />
      )}
    </header>
  );
};
