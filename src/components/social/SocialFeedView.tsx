import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  MessageSquare,
  Heart,
  Share2,
  Trophy,
  Flame,
  Plus,
  Users,
  Send,
  MapPin,
  Sparkles,
  Search,
  UserPlus,
  UserCheck,
  Clock,
  ArrowRight,
  Copy,
  Check,
  MessageCircle,
  Crown,
  Dumbbell,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Layers,
  X,
  Trash2,
  Upload,
  History,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Award,
  TrendingUp,
  Target,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Globe,
  Flag,
  Compass,
  LocateFixed
} from 'lucide-react';
import {
  SocialPost,
  UserProfile,
  NearbyAthlete,
  RewardsProfile,
  ExerciseDefinition,
  UserCommunityPhoto,
  PhotoTagType,
  PhotoVisibility,
  UserSubscription,
  ActiveWorkout,
  WorkoutPlan,
  WorkoutExercise
} from '../../types';
import {
  getRegisteredAthletes,
  updateAthleteConnection,
  acceptAthleteInvite,
  rejectAthleteInvite,
  updateAthleteWhatsappNumber,
  getUserArea,
  setUserArea,
  getUserLifterId,
  syncUserProfileToNearbyAthletes,
  getNewMembersInArea
} from '../../utils/nearbyAthletesStorage';
import {
  getUserPhotos,
  addUserPhoto,
  deleteUserPhoto,
  updatePhotoTag,
  updatePhotoVisibility,
  getUserPhotoLimit,
  compressImageFile
} from '../../utils/userPhotosStorage';
import { NearbyAthletesView } from './NearbyAthletesView';
import { AthleteDetailModal } from './AthleteDetailModal';
import { WhatsAppConnectModal } from './WhatsAppConnectModal';
import { ConnectInviteModal } from './ConnectInviteModal';
import { getSuggestedAthletes, SuggestedAthleteItem } from '../../utils/suggestedAthletes';
import { BeforeAfterShowcase } from './BeforeAfterShowcase';
import { PhotoUploadModal } from './PhotoUploadModal';
import { AthletePhotosGallery } from './AthletePhotosGallery';
import { WorkoutSessionCardModal } from './WorkoutSessionCardModal';
import { HistoricalPostsModal } from './HistoricalPostsModal';
import { SocialShareModal } from './SocialShareModal';
import { WorkoutSelfieCameraModal } from '../workout/WorkoutSelfieCameraModal';
import { SavedAppPhotosPickerModal } from '../workout/SavedAppPhotosPickerModal';
import { checkImageSafetyWithAi, ImageModerationResult } from '../../utils/imageModeration';
import { ImageModerationBanner } from '../common/ImageModerationBanner';
import { GymAvatar } from '../common/GymAvatar';
import { buildAthletePhysiquePhotos } from '../../data/userPhysiquePhotos';
import {
  ChallengeDetailModal,
  CommunityChallengeItem
} from './ChallengeDetailModal';
import { awardChallengeCompleted } from '../../utils/rewardsEngine';
import {
  AppTheme,
  saveCustomExercise,
  getCustomExercises,
  addSocialPost,
  getWorkoutHistory,
  saveUserProfile,
  saveSharedPlanToMyCustomPlans,
  getCustomWorkoutPrograms,
  getPersonalProgramsTotalCount,
  MAX_FREE_PERSONALIZED_PLANS
} from '../../utils/storage';
import { FitnessModelPicture } from '../common/FitnessModelPicture';
import { calculateDistanceMiles } from '../../utils/geoDistance';
import { ALL_WORLD_COUNTRIES } from '../../data/worldCountries';

export const QUICK_RESPONSE_MESSAGES = [
  'Crushed it! 🔥',
  'Beast mode! 💪',
  'Light weight baby! ⚡',
  'Clean bar path! 👏',
  'New PR! 🏆',
  'Huge volume! 🦍'
];

export type LeaderboardScope = 'worldwide' | 'country' | 'city' | 'local' | 'current_location';

interface SocialFeedViewProps {
  posts: SocialPost[];
  onCheerPost: (postId: string, emoji: '💪' | '🔥' | '⚡' | '🏆' | '🦍', label: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onNewPost: (title: string, topSet: string, volumeKg: number) => void;
  onPublishPost?: (post: SocialPost) => void;
  unit: 'kg' | 'lbs';
  userProfile?: UserProfile | null;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  currentTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  rewardsProfile?: RewardsProfile;
  onUpdateRewardsProfile?: (profile: RewardsProfile) => void;
  onOpenRewardsModal?: () => void;
  subscription?: UserSubscription;
  onOpenProModal?: () => void;
  pendingWorkoutToShare?: {
    workout: ActiveWorkout;
    initialPhotoUrl?: string;
    initialPhotoTag?: PhotoTagType;
    initialPhotoCaption?: string;
  } | null;
  onClearPendingWorkoutToShare?: () => void;
}

// Synthesize Hevy-style exercise breakdown for feed cards
function getFeedPostExercises(post: SocialPost): WorkoutExercise[] {
  if (post.workoutSession && post.workoutSession.exercises.length > 0) {
    return post.workoutSession.exercises;
  }
  const title = post.workoutTitle.toLowerCase();
  if (title.includes('bench') || title.includes('push') || title.includes('chest')) {
    return [
      {
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        equipment: 'Barbell',
        sets: [
          { id: 's1', setNumber: 1, type: 'normal', reps: 10, weightKg: 100, weightLbs: 220, completed: true },
          { id: 's2', setNumber: 2, type: 'normal', reps: 8, weightKg: 120, weightLbs: 265, completed: true },
          { id: 's3', setNumber: 3, type: 'normal', reps: 5, weightKg: 142.5, weightLbs: 314, completed: true },
          { id: 's4', setNumber: 4, type: 'normal', reps: 6, weightKg: 130, weightLbs: 287, completed: true }
        ]
      },
      {
        exerciseId: 'incline_dumbbell_press',
        name: 'Incline Dumbbell Press',
        targetMuscle: 'Chest',
        equipment: 'Dumbbell',
        sets: [
          { id: 's5', setNumber: 1, type: 'normal', reps: 10, weightKg: 38, weightLbs: 84, completed: true },
          { id: 's6', setNumber: 2, type: 'normal', reps: 8, weightKg: 42, weightLbs: 93, completed: true },
          { id: 's7', setNumber: 3, type: 'normal', reps: 8, weightKg: 42, weightLbs: 93, completed: true }
        ]
      },
      {
        exerciseId: 'cable_crossover',
        name: 'Low-to-High Cable Flyes',
        targetMuscle: 'Chest',
        equipment: 'Cable',
        sets: [
          { id: 's8', setNumber: 1, type: 'normal', reps: 12, weightKg: 17.5, weightLbs: 39, completed: true },
          { id: 's9', setNumber: 2, type: 'normal', reps: 12, weightKg: 20, weightLbs: 44, completed: true },
          { id: 's10', setNumber: 3, type: 'normal', reps: 10, weightKg: 20, weightLbs: 44, completed: true }
        ]
      },
      {
        exerciseId: 'dumbbell_lateral_raise',
        name: 'Dumbbell Lateral Raise',
        targetMuscle: 'Shoulders',
        equipment: 'Dumbbell',
        sets: [
          { id: 's11', setNumber: 1, type: 'normal', reps: 15, weightKg: 14, weightLbs: 31, completed: true },
          { id: 's12', setNumber: 2, type: 'normal', reps: 15, weightKg: 16, weightLbs: 35, completed: true },
          { id: 's13', setNumber: 3, type: 'normal', reps: 12, weightKg: 16, weightLbs: 35, completed: true }
        ]
      },
      {
        exerciseId: 'tricep_rope_pushdown',
        name: 'Rope Triceps Pushdown',
        targetMuscle: 'Triceps',
        equipment: 'Cable',
        sets: [
          { id: 's14', setNumber: 1, type: 'normal', reps: 12, weightKg: 35, weightLbs: 77, completed: true },
          { id: 's15', setNumber: 2, type: 'normal', reps: 10, weightKg: 40, weightLbs: 88, completed: true },
          { id: 's16', setNumber: 3, type: 'normal', reps: 10, weightKg: 40, weightLbs: 88, completed: true }
        ]
      }
    ];
  }
  if (title.includes('leg') || title.includes('squat') || title.includes('hack') || title.includes('posterior')) {
    return [
      {
        exerciseId: 'hack_squat',
        name: 'Machine Hack Squat (Full Depth)',
        targetMuscle: 'Quads',
        equipment: 'Machine',
        sets: [
          { id: 's1', setNumber: 1, type: 'normal', reps: 10, weightKg: 140, weightLbs: 309, completed: true },
          { id: 's2', setNumber: 2, type: 'normal', reps: 8, weightKg: 160, weightLbs: 353, completed: true },
          { id: 's3', setNumber: 3, type: 'normal', reps: 8, weightKg: 180, weightLbs: 397, completed: true },
          { id: 's4', setNumber: 4, type: 'normal', reps: 8, weightKg: 170, weightLbs: 375, completed: true }
        ]
      },
      {
        exerciseId: 'romanian_deadlift',
        name: 'Barbell Romanian Deadlift',
        targetMuscle: 'Hamstrings',
        equipment: 'Barbell',
        sets: [
          { id: 's5', setNumber: 1, type: 'normal', reps: 10, weightKg: 130, weightLbs: 287, completed: true },
          { id: 's6', setNumber: 2, type: 'normal', reps: 8, weightKg: 150, weightLbs: 331, completed: true },
          { id: 's7', setNumber: 3, type: 'normal', reps: 6, weightKg: 165, weightLbs: 364, completed: true }
        ]
      },
      {
        exerciseId: 'leg_extension',
        name: 'Seated Leg Extension',
        targetMuscle: 'Quads',
        equipment: 'Machine',
        sets: [
          { id: 's8', setNumber: 1, type: 'normal', reps: 15, weightKg: 75, weightLbs: 165, completed: true },
          { id: 's9', setNumber: 2, type: 'normal', reps: 12, weightKg: 85, weightLbs: 187, completed: true },
          { id: 's10', setNumber: 3, type: 'normal', reps: 12, weightKg: 85, weightLbs: 187, completed: true }
        ]
      },
      {
        exerciseId: 'seated_leg_curl',
        name: 'Seated Hamstring Curl',
        targetMuscle: 'Hamstrings',
        equipment: 'Machine',
        sets: [
          { id: 's11', setNumber: 1, type: 'normal', reps: 12, weightKg: 65, weightLbs: 143, completed: true },
          { id: 's12', setNumber: 2, type: 'normal', reps: 12, weightKg: 70, weightLbs: 154, completed: true },
          { id: 's13', setNumber: 3, type: 'normal', reps: 10, weightKg: 75, weightLbs: 165, completed: true }
        ]
      }
    ];
  }
  if (title.includes('pull') || title.includes('back') || title.includes('deadlift')) {
    return [
      {
        exerciseId: 'barbell_deadlift',
        name: 'Conventional Barbell Deadlift',
        targetMuscle: 'Back',
        equipment: 'Barbell',
        sets: [
          { id: 's1', setNumber: 1, type: 'normal', reps: 5, weightKg: 160, weightLbs: 353, completed: true },
          { id: 's2', setNumber: 2, type: 'normal', reps: 5, weightKg: 185, weightLbs: 408, completed: true },
          { id: 's3', setNumber: 3, type: 'normal', reps: 3, weightKg: 210, weightLbs: 463, completed: true }
        ]
      },
      {
        exerciseId: 'lat_pulldown',
        name: 'Wide-Grip Lat Pulldown',
        targetMuscle: 'Back',
        equipment: 'Cable',
        sets: [
          { id: 's4', setNumber: 1, type: 'normal', reps: 12, weightKg: 75, weightLbs: 165, completed: true },
          { id: 's5', setNumber: 2, type: 'normal', reps: 10, weightKg: 85, weightLbs: 187, completed: true },
          { id: 's6', setNumber: 3, type: 'normal', reps: 8, weightKg: 92.5, weightLbs: 204, completed: true }
        ]
      },
      {
        exerciseId: 'chest_supported_row',
        name: 'Chest-Supported T-Bar Row',
        targetMuscle: 'Back',
        equipment: 'Machine',
        sets: [
          { id: 's7', setNumber: 1, type: 'normal', reps: 10, weightKg: 80, weightLbs: 176, completed: true },
          { id: 's8', setNumber: 2, type: 'normal', reps: 10, weightKg: 90, weightLbs: 198, completed: true },
          { id: 's9', setNumber: 3, type: 'normal', reps: 8, weightKg: 100, weightLbs: 220, completed: true }
        ]
      },
      {
        exerciseId: 'incline_dumbbell_curl',
        name: 'Incline Dumbbell Bicep Curl',
        targetMuscle: 'Biceps',
        equipment: 'Dumbbell',
        sets: [
          { id: 's10', setNumber: 1, type: 'normal', reps: 12, weightKg: 16, weightLbs: 35, completed: true },
          { id: 's11', setNumber: 2, type: 'normal', reps: 10, weightKg: 18, weightLbs: 40, completed: true },
          { id: 's12', setNumber: 3, type: 'normal', reps: 10, weightKg: 18, weightLbs: 40, completed: true }
        ]
      }
    ];
  }
  return [
    {
      exerciseId: 'overhead_press',
      name: post.topSet.includes('(') ? post.topSet.split('(')[1].replace(')', '') : 'Primary Compound Lift',
      targetMuscle: 'Full Body',
      equipment: 'Barbell',
      sets: [
        { id: 's1', setNumber: 1, type: 'normal', reps: 8, weightKg: 70, weightLbs: 154, completed: true },
        { id: 's2', setNumber: 2, type: 'normal', reps: 6, weightKg: 80, weightLbs: 176, completed: true },
        { id: 's3', setNumber: 3, type: 'normal', reps: 5, weightKg: 85, weightLbs: 187, completed: true }
      ]
    },
    {
      exerciseId: 'dumbbell_shoulder_press',
      name: 'Seated Dumbbell Shoulder Press',
      targetMuscle: 'Shoulders',
      equipment: 'Dumbbell',
      sets: [
        { id: 's4', setNumber: 1, type: 'normal', reps: 10, weightKg: 32, weightLbs: 71, completed: true },
        { id: 's5', setNumber: 2, type: 'normal', reps: 10, weightKg: 34, weightLbs: 75, completed: true },
        { id: 's6', setNumber: 3, type: 'normal', reps: 8, weightKg: 36, weightLbs: 79, completed: true }
      ]
    },
    {
      exerciseId: 'ez_bar_curl',
      name: 'EZ-Bar Preacher Curl',
      targetMuscle: 'Biceps',
      equipment: 'Barbell',
      sets: [
        { id: 's7', setNumber: 1, type: 'normal', reps: 12, weightKg: 42.5, weightLbs: 94, completed: true },
        { id: 's8', setNumber: 2, type: 'normal', reps: 10, weightKg: 47.5, weightLbs: 105, completed: true },
        { id: 's9', setNumber: 3, type: 'normal', reps: 8, weightKg: 52.5, weightLbs: 116, completed: true }
      ]
    }
  ];
}

function formatTimeAgo(timestamp: number): string {
  const diffMins = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({
  posts,
  onCheerPost,
  onLikePost,
  onAddComment,
  onDeleteComment,
  onNewPost,
  onPublishPost,
  unit,
  userProfile,
  onUpdateUserProfile,
  rewardsProfile,
  onUpdateRewardsProfile,
  subscription,
  onOpenProModal,
  pendingWorkoutToShare,
  onClearPendingWorkoutToShare
}) => {
  // Primary Community Pillar: 'feed' | 'discover' | 'challenges' | 'leaderboards' | 'photos'
  const [socialTab, setSocialTab] = useState<'feed' | 'discover' | 'challenges' | 'leaderboards' | 'photos'>(() => {
    try {
      const requested = sessionStorage.getItem('gympax_initial_social_tab');
      if (requested === 'photos') {
        sessionStorage.removeItem('gympax_initial_social_tab');
        return 'photos';
      }
    } catch {}
    return 'feed';
  });

  useEffect(() => {
    const handleOpenMyPhotos = () => {
      setSocialTab('photos');
    };
    window.addEventListener('gympax:open-my-photos', handleOpenMyPhotos);
    return () => window.removeEventListener('gympax:open-my-photos', handleOpenMyPhotos);
  }, []);
  const topNavScrollRef = useRef<HTMLDivElement>(null);
  const challengesScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollTopNav = (direction: 'left' | 'right') => {
    if (!topNavScrollRef.current) return;
    topNavScrollRef.current.scrollBy({
      left: direction === 'left' ? -180 : 180,
      behavior: 'smooth'
    });
  };

  const handleScrollChallenges = (direction: 'left' | 'right') => {
    if (!challengesScrollRef.current) return;
    challengesScrollRef.current.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth'
    });
  };


  // Sub-filter for Feed: 'all' | 'following' | 'prs' | 'transformations'
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'prs' | 'transformations'>('all');
  const [feedSearchQuery, setFeedSearchQuery] = useState<string>('');
  // Leaderboard metric & scope switchers (Worldwide, Country, Town/City, Local with 5/10/25/50km radius)
  const [leaderboardMetric, setLeaderboardMetric] = useState<
    'prs' | 'volume' | 'streak' | 'workouts' | 'sets' | 'reps' | 'time'
  >('prs');
  const metricScrollRef = useRef<HTMLDivElement>(null);
  const handleScrollMetrics = (direction: 'left' | 'right') => {
    if (!metricScrollRef.current) return;
    const container = metricScrollRef.current;
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'));
    if (!buttons.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;
    buttons.forEach((btn, idx) => {
      const rect = btn.getBoundingClientRect();
      const btnCenter = rect.left + rect.width / 2;
      const dist = Math.abs(btnCenter - containerCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const targetIndex = direction === 'left'
      ? Math.max(0, closestIndex - 1)
      : Math.min(buttons.length - 1, closestIndex + 1);

    buttons[targetIndex].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('worldwide');
  const [localRadius, setLocalRadius] = useState<5 | 10 | 25 | 50>(10);
  const [localDistanceUnit, setLocalDistanceUnit] = useState<'km' | 'mi'>('km');
  const [selectedLeaderboardCountry, setSelectedLeaderboardCountry] = useState<string>(() => userProfile?.country || 'United States');
  const [countrySearchInput, setCountrySearchInput] = useState<string>('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);
  const countryInputContainerRef = useRef<HTMLDivElement>(null);

  // Nearby Athletes section Scope & Filter states (matching Community Leaderboards)
  const [nearbyScope, setNearbyScope] = useState<'worldwide' | 'country' | 'city'>('worldwide');
  const [nearbyRadius, setNearbyRadius] = useState<5 | 10 | 25 | 50>(25);
  const [nearbyDistanceUnit, setNearbyDistanceUnit] = useState<'km' | 'mi'>('km');
  const [selectedNearbyCountry, setSelectedNearbyCountry] = useState<string>(() => userProfile?.country || 'United States');
  const [nearbyCountrySearchInput, setNearbyCountrySearchInput] = useState<string>('');
  const [isNearbyCountryDropdownOpen, setIsNearbyCountryDropdownOpen] = useState<boolean>(false);
  const nearbyCountryInputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryInputContainerRef.current && !countryInputContainerRef.current.contains(e.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (nearbyCountryInputContainerRef.current && !nearbyCountryInputContainerRef.current.contains(e.target as Node)) {
        setIsNearbyCountryDropdownOpen(false);
      }
    };
    if (isCountryDropdownOpen || isNearbyCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen, isNearbyCountryDropdownOpen]);

  const [selectedLeaderboardCity, setSelectedLeaderboardCity] = useState<string>(() => userProfile?.cityOrTown || 'Austin');
  const [leaderboardLocationSearch, setLeaderboardLocationSearch] = useState<string>('');
  // Joined challenges state (3 joined by default for the Joined Challenges card)
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<string[]>([
    'chal_monthly_vol',
    'chal_consistency_20',
    'chal_zero_skip_weeks'
  ]);
  const [visibleJoinedChallengesCount, setVisibleJoinedChallengesCount] = useState<number>(3);
  const [visiblePopularChallengesCount, setVisiblePopularChallengesCount] = useState<number>(3);
  const [visibleOtherChallengesCount, setVisibleOtherChallengesCount] = useState<number>(3);
  const [visibleLeaderboardCount, setVisibleLeaderboardCount] = useState<number>(5);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('gympax_completed_challenges_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [selectedChallengeModal, setSelectedChallengeModal] = useState<CommunityChallengeItem | null>(null);
  // Track which feed cards have all exercises expanded
  const [expandedExercisesPostIds, setExpandedExercisesPostIds] = useState<Record<string, boolean>>({});
  // Track which feed post cards are expanded (collapsible by default)
  const [expandedFeedPostIds, setExpandedFeedPostIds] = useState<Record<string, boolean>>({});
  // Track saved workout routines from feed cards
  const [savedWorkoutPostIds, setSavedWorkoutPostIds] = useState<string[]>([]);
  // Track Requests Received toggle in Feed (false by default so Feed stream is primary)
  const [showFeedRequests, setShowFeedRequests] = useState<boolean>(false);
  const [visibleRequestsCount, setVisibleRequestsCount] = useState<number>(3);
  const [expandedRequestIds, setExpandedRequestIds] = useState<Record<string, boolean>>({});

  // Social Hub Options bar state - defaults to null so "Feed" button is active by default
  const [activeSocialOption, setActiveSocialOption] = useState<
    'requests' | 'nearby' | 'suggested' | 'challenges' | 'leaderboards' | 'prs' | 'photos' | null
  >(null);
  const socialOptionsScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammaticallyRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const centerSocialButton = (target: HTMLElement | React.MouseEvent<HTMLElement>) => {
    const el = (target && 'currentTarget' in target) ? (target.currentTarget as HTMLElement) : (target as HTMLElement);
    const container = socialOptionsScrollRef.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const elCenter = elRect.left + elRect.width / 2;
    const delta = elCenter - containerCenter;

    // Only scroll if there is a noticeable offset (> 2px) to prevent jitter
    if (Math.abs(delta) > 2) {
      isScrollingProgrammaticallyRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      container.scrollTo({
        left: Math.round(container.scrollLeft + delta),
        behavior: 'smooth'
      });

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingProgrammaticallyRef.current = false;
      }, 350);
    }
  };

  const handleScrollSocialOptions = (direction: 'left' | 'right') => {
    if (!socialOptionsScrollRef.current) return;
    const container = socialOptionsScrollRef.current;
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'));
    if (!buttons.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;
    buttons.forEach((btn, idx) => {
      const rect = btn.getBoundingClientRect();
      const btnCenter = rect.left + rect.width / 2;
      const dist = Math.abs(btnCenter - containerCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const targetIndex = direction === 'left'
      ? Math.max(0, closestIndex - 1)
      : Math.min(buttons.length - 1, closestIndex + 1);

    const targetBtn = buttons[targetIndex];
    if (targetBtn) {
      centerSocialButton(targetBtn);
    }
  };

  // Automatically center the active button in the scroller whenever selection changes externally
  useEffect(() => {
    if (isScrollingProgrammaticallyRef.current) return;
    const timer = setTimeout(() => {
      if (!socialOptionsScrollRef.current || isScrollingProgrammaticallyRef.current) return;
      const activeButton = socialOptionsScrollRef.current.querySelector<HTMLButtonElement>('button[data-active="true"]');
      if (activeButton) {
        centerSocialButton(activeButton);
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [activeSocialOption, socialTab]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };


  // Photo management state
  const [userPhotos, setUserPhotos] = useState<UserCommunityPhoto[]>(getUserPhotos);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState<boolean>(false);
  const [uploadInitialTag, setUploadInitialTag] = useState<PhotoTagType>('physique');

  // Workout post composer state
  const [activeWorkoutToPost, setActiveWorkoutToPost] = useState<ActiveWorkout | null>(null);
  const [workoutPostCaption, setWorkoutPostCaption] = useState<string>('');
  const [workoutPostPhoto, setWorkoutPostPhoto] = useState<string | null>(null);
  const [workoutPostPhotoTag, setWorkoutPostPhotoTag] = useState<PhotoTagType>('after');
  const [isProcessingWorkoutPhoto, setIsProcessingWorkoutPhoto] = useState<boolean>(false);
  const [workoutPhotoError, setWorkoutPhotoError] = useState<string | null>(null);
  const [workoutPostPhotoModeration, setWorkoutPostPhotoModeration] = useState<ImageModerationResult | null>(null);
  const [isCheckingWorkoutPhotoAi, setIsCheckingWorkoutPhotoAi] = useState<boolean>(false);
  const [saveWorkoutPhotoToVault, setSaveWorkoutPhotoToVault] = useState<boolean>(true);
  const [showWorkoutSelfieCamera, setShowWorkoutSelfieCamera] = useState<boolean>(false);
  const [showWorkoutSavedPhotosPicker, setShowWorkoutSavedPhotosPicker] = useState<boolean>(false);
  const [reviewingWorkoutPost, setReviewingWorkoutPost] = useState<SocialPost | null>(null);
  const [viewingFullRoutinePost, setViewingFullRoutinePost] = useState<SocialPost | null>(null);
  const [selectedRoutineDayIdx, setSelectedRoutineDayIdx] = useState<number>(0);
  const [renamingRoutineToSave, setRenamingRoutineToSave] = useState<{
    post: SocialPost;
    defaultTitle: string;
  } | null>(null);
  const [customRoutineNameInput, setCustomRoutineNameInput] = useState<string>('');
  const [showProgramLimitModal, setShowProgramLimitModal] = useState<boolean>(false);
  const [sharingWorkoutFromFeed, setSharingWorkoutFromFeed] = useState<ActiveWorkout | null>(null);
  const workoutPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleCaptureWorkoutSelfie = async (imageDataUrl: string) => {
    setWorkoutPhotoError(null);
    setWorkoutPostPhotoModeration(null);
    setWorkoutPostPhoto(imageDataUrl);
    setWorkoutPostPhotoTag('after');
    setIsCheckingWorkoutPhotoAi(true);
    try {
      const modResult = await checkImageSafetyWithAi(imageDataUrl);
      setWorkoutPostPhotoModeration(modResult);
      if (modResult.flaggedAsNotAllowed) {
        setWorkoutPhotoError(modResult.reason || 'This selfie was flagged by AI moderation.');
      }
    } catch {
      // ignore
    } finally {
      setIsCheckingWorkoutPhotoAi(false);
    }
  };

  const handleSelectWorkoutSavedPhoto = (savedPhoto: UserCommunityPhoto) => {
    setWorkoutPhotoError(null);
    setWorkoutPostPhotoModeration({
      isAllowed: true,
      flaggedAsNotAllowed: false,
      flagCategory: 'none',
      reason: '',
      checkedByAi: false
    });
    setWorkoutPostPhoto(savedPhoto.url);
    setWorkoutPostPhotoTag(savedPhoto.tag || 'after');
    if (savedPhoto.caption && !workoutPostCaption) {
      setWorkoutPostCaption(savedPhoto.caption);
    }
  };

  useEffect(() => {
    if (pendingWorkoutToShare?.workout) {
      setSocialTab('feed');
      setActiveWorkoutToPost(pendingWorkoutToShare.workout);
      setWorkoutPostPhoto(pendingWorkoutToShare.initialPhotoUrl || null);
      setWorkoutPostPhotoTag(pendingWorkoutToShare.initialPhotoTag || 'after');
      setWorkoutPostCaption(pendingWorkoutToShare.initialPhotoCaption || '');
      setWorkoutPhotoError(null);
      setWorkoutPostPhotoModeration(null);
    }
  }, [pendingWorkoutToShare]);

  // Feed interaction states
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [customExerciseNotice, setCustomExerciseNotice] = useState<string | null>(null);
  const [savedCustomExerciseIds, setSavedCustomExerciseIds] = useState<string[]>(() => {
    return getCustomExercises().map(e => e.id);
  });
  const [savedCustomPlanIds, setSavedCustomPlanIds] = useState<string[]>(() => {
    return getCustomWorkoutPrograms().map(p => p.id);
  });

  // Historical posts popup modal state
  const [historicalModalData, setHistoricalModalData] = useState<{
    owner: {
      userId: string;
      userName: string;
      userBadge?: string;
      userRank?: string;
      userAvatarSeed?: string;
      streakDays?: number;
      avatarType?: 'upload' | 'animated';
      avatarUrl?: string;
      avatarId?: string;
    };
    posts: SocialPost[];
  } | null>(null);

  // Feed pagination state (starts at 5 lifters, load 5 more or collapse)
  const [visibleOtherUsersCount, setVisibleOtherUsersCount] = useState<number>(5);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState<boolean>(false);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState<boolean>(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState<number>(0);

  // Connect with custom message modal state
  const [connectModalAthlete, setConnectModalAthlete] = useState<NearbyAthlete | null>(null);

  // Nearby athletes state
  const [athletes, setAthletes] = useState<NearbyAthlete[]>(getRegisteredAthletes);
  const [userArea, setUserAreaState] = useState<string>(getUserArea);
  const [distanceUnit] = useState<'mi' | 'km'>(() => {
    try {
      const saved = localStorage.getItem('soma_distance_unit');
      if (saved === 'km' || saved === 'mi') return saved;
    } catch {}
    return 'mi';
  });
  const [quickCopied, setQuickCopied] = useState<boolean>(false);
  const [sidebarWhatsAppAthlete, setSidebarWhatsAppAthlete] = useState<NearbyAthlete | null>(null);
  const [ valueUnusedWhatsAppTab, setSidebarWhatsAppTab ] = useState<'message' | 'call'>('message');

  const userLevel = userProfile?.experienceLevel || 'Intermediate';
  const [suggestedConnections, setSuggestedConnections] = useState<SuggestedAthleteItem[]>([]);

  const handleRefreshSuggested = () => {
    const currentAthletes = getRegisteredAthletes();
    const fresh = getSuggestedAthletes(currentAthletes, userArea, userProfile, userLevel);
    setSuggestedConnections(fresh);
  };

  useEffect(() => {
    setAthletes(getRegisteredAthletes());
    setUserAreaState(getUserArea());
    handleRefreshSuggested();
  }, [userProfile]);

  useEffect(() => {
    setUserPhotos(getUserPhotos());
  }, []);

  // Compute feed posts & historical archive
  const { displayPosts, allOtherUsersLatestPosts, historicalPostsByUserId } = useMemo(() => {
    const history = getWorkoutHistory();
    const historicalMap: Record<string, SocialPost[]> = {};

    const postsByUserId: Record<string, SocialPost[]> = {};
    for (const p of posts) {
      if (!postsByUserId[p.userId]) {
        postsByUserId[p.userId] = [];
      }
      postsByUserId[p.userId].push(p);
    }

    let userLatestPost: SocialPost | null = null;
    const userPosts = postsByUserId['u_me'] || [];

    if (userPosts.length > 0) {
      const sortedUserPosts = [...userPosts].sort((a, b) => b.timestamp - a.timestamp);
      userLatestPost = sortedUserPosts[0];
      historicalMap['u_me'] = sortedUserPosts.slice(1);
    } else if (history.length > 0) {
      const latestWorkout = history[0];
      const durationMin = Math.max(1, Math.floor(latestWorkout.durationSeconds / 60));
      const topExercise = latestWorkout.exercises[0];
      const topSetDesc = topExercise?.sets[0]
        ? `${topExercise.name} (${topExercise.sets[0].weightKg}kg × ${topExercise.sets[0].reps})`
        : 'Top Compound Lift';

      userLatestPost = {
        id: `post_user_latest_session_${latestWorkout.id}`,
        userId: 'u_me',
        userName: userProfile?.name || 'Alex Hunter',
        userAvatarSeed: 'my_avatar',
        userBadge: subscription?.isPro ? 'PRO' : 'LIFTER',
        workoutTitle: latestWorkout.title,
        durationMinutes: durationMin,
        volumeKg: latestWorkout.totalVolumeKg,
        volumeLbs: Math.round(latestWorkout.totalVolumeKg * 2.20462),
        topSet: topSetDesc,
        prBroken: latestWorkout.prCount ? `${latestWorkout.prCount} PRs hit in this session` : undefined,
        timestamp: latestWorkout.startTime || Date.now() - 1000 * 60 * 45,
        likes: 16,
        cheers: [
          { id: 'c_u1', userId: 'u_marcus', userName: 'Marcus Thorne', emoji: '🔥', label: 'Crushed it' },
          { id: 'c_u2', userId: 'u_jessica', userName: 'Jessica Chen', emoji: '💪', label: 'Beast Mode' }
        ],
        comments: [],
        isLikedByMe: false,
        streakDays: rewardsProfile?.currentStreakDays || 12,
        activeBadges: rewardsProfile?.badges,
        userRank: rewardsProfile?.rankTitle || 'Elite Lifter',
        workoutSession: latestWorkout,
        postType: 'workout'
      };
      historicalMap['u_me'] = [];
    }

    if (history.length > 1) {
      const olderWorkouts = history.slice(1);
      const synthHistoryPosts: SocialPost[] = olderWorkouts.map((w, idx) => ({
        id: `hist_workout_${w.id}_${idx}`,
        userId: 'u_me',
        userName: userProfile?.name || 'Alex Hunter',
        userAvatarSeed: 'my_avatar',
        userBadge: subscription?.isPro ? 'PRO' : 'LIFTER',
        workoutTitle: w.title,
        durationMinutes: Math.max(1, Math.floor(w.durationSeconds / 60)),
        volumeKg: w.totalVolumeKg,
        volumeLbs: Math.round(w.totalVolumeKg * 2.20462),
        topSet: w.exercises[0]?.sets[0]
          ? `${w.exercises[0].name} (${w.exercises[0].sets[0].weightKg}kg × ${w.exercises[0].sets[0].reps})`
          : 'Top Compound Set',
        prBroken: w.prCount ? `${w.prCount} PRs Broken` : undefined,
        timestamp: w.startTime || Date.now() - 1000 * 60 * 60 * 24 * (idx + 1),
        likes: 6 + idx * 2,
        cheers: [{ id: `c_u_hist_${idx}`, userId: 'u_marcus', userName: 'Marcus Thorne', emoji: '⚡', label: 'Solid' }],
        comments: [],
        isLikedByMe: true,
        workoutSession: w,
        postType: 'workout'
      }));

      historicalMap['u_me'] = [...(historicalMap['u_me'] || []), ...synthHistoryPosts];
    }

    const isOwnAthlete = (a: { id?: string; name?: string }) =>
      a.id === 'u_me' ||
      a.id === 'ath_current_user' ||
      (Boolean(userProfile?.name) &&
        (a.name || '').trim().toLowerCase() === userProfile!.name.trim().toLowerCase());

    const connectedAthletes = athletes.filter(
      a => a.connectionStatus === 'connected' && !isOwnAthlete(a)
    );
    const connectedNamesSet = new Set(connectedAthletes.map(a => a.name.trim().toLowerCase()));
    const connectedIdsSet = new Set(connectedAthletes.map(a => a.id.trim().toLowerCase()));

    const otherUsersLatestPosts: SocialPost[] = [];
    const matchedConnectedNames = new Set<string>();

    for (const [uid, userPostList] of Object.entries(postsByUserId)) {
      if (uid === 'u_me' || uid === 'ath_current_user') continue;
      const sorted = [...userPostList].sort((a, b) => b.timestamp - a.timestamp);
      const latestPost = sorted[0];
      if (!latestPost || isOwnAthlete({ id: latestPost.userId, name: latestPost.userName })) continue;

      const normalizedName = (latestPost.userName || '').trim().toLowerCase();
      const normalizedUid = uid.trim().toLowerCase();
      const isConnectedUser =
        connectedNamesSet.has(normalizedName) || connectedIdsSet.has(normalizedUid);

      if (!isConnectedUser) continue;

      matchedConnectedNames.add(normalizedName);
      otherUsersLatestPosts.push(latestPost);
      if (sorted.length > 1) {
        historicalMap[uid] = sorted.slice(1);
      }
    }

    // Ensure every connected athlete has a feed activity card in Latest Feed
    connectedAthletes.forEach((athlete, idx) => {
      const normalizedName = athlete.name.trim().toLowerCase();
      if (matchedConnectedNames.has(normalizedName)) return;

      const topPr = athlete.prs?.[0];
      const topSetStr = topPr
        ? `${topPr.weight} × 5 (${topPr.exercise})`
        : athlete.favoriteLifts?.split('·')[0]?.trim() || '120 kg × 6 (Compound Top Set)';

      const synthPost: SocialPost = {
        id: `post_conn_${athlete.id}`,
        userId: athlete.id,
        userName: athlete.name,
        userAvatarSeed: athlete.avatarSeed,
        userBadge: athlete.badge === 'ELITE' ? 'PRO' : athlete.badge,
        workoutTitle: `${athlete.workoutSplit || 'Strength & Hypertrophy'} Session`,
        durationMinutes: 60 + (idx % 4) * 5,
        volumeKg: 10800 + idx * 650,
        volumeLbs: Math.round((10800 + idx * 650) * 2.20462),
        topSet: topSetStr,
        prBroken: topPr ? `${topPr.exercise}: ${topPr.weight} Top Set` : undefined,
        timestamp: Date.now() - 1000 * 60 * (95 + idx * 70),
        likes: 24 + idx * 5,
        cheers: [
          { id: `c_conn_${athlete.id}`, userId: 'u_marcus', userName: 'Marcus Thorne', emoji: '🔥', label: 'Crushed it' }
        ],
        comments: [],
        isLikedByMe: false,
        streakDays: athlete.streakDays || 14,
        activeBadges: ['flame_7d'],
        userRank: `${athlete.level} Lifter`,
        postType: 'workout'
      };

      otherUsersLatestPosts.push(synthPost);
    });

    otherUsersLatestPosts.sort((a, b) => b.timestamp - a.timestamp);
    const displayedOtherUsers = otherUsersLatestPosts.slice(0, visibleOtherUsersCount);

    const finalDisplay: SocialPost[] = [...displayedOtherUsers];

    return {
      displayPosts: finalDisplay,
      allOtherUsersLatestPosts: otherUsersLatestPosts,
      historicalPostsByUserId: historicalMap
    };
  }, [posts, athletes, userProfile, subscription, rewardsProfile, visibleOtherUsersCount, feedRefreshKey]);

  // Apply feed filter & search query
  const filteredFeedPosts = useMemo(() => {
    const isOwnPost = (post: SocialPost) =>
      post.userId === 'u_me' ||
      post.userId === 'ath_current_user' ||
      (Boolean(userProfile?.name) &&
        post.userName.trim().toLowerCase() === userProfile!.name.trim().toLowerCase());

    const connectedNames = new Set(
      athletes
        .filter(a => a.connectionStatus === 'connected' && a.id !== 'ath_current_user' && a.id !== 'u_me')
        .map(a => a.name.trim().toLowerCase())
    );
    const connectedIds = new Set(
      athletes
        .filter(a => a.connectionStatus === 'connected' && a.id !== 'ath_current_user' && a.id !== 'u_me')
        .map(a => a.id.trim().toLowerCase())
    );

    return displayPosts.filter(post => {
      if (isOwnPost(post)) {
        return false;
      }

      if (
        !connectedNames.has(post.userName.trim().toLowerCase()) &&
        !connectedIds.has(post.userId.trim().toLowerCase())
      ) {
        return false;
      }

      if (feedFilter === 'prs') {
        if (!post.prBroken) return false;
      } else if (feedFilter === 'transformations') {
        if (post.postType !== 'before_after' && !post.photoUrl && !post.attachedPhotoUrl) return false;
      }

      if (feedSearchQuery.trim()) {
        const q = feedSearchQuery.toLowerCase();
        const matchUser = post.userName.toLowerCase().includes(q);
        const matchTitle = post.workoutTitle.toLowerCase().includes(q);
        const matchTopSet = post.topSet.toLowerCase().includes(q);
        return matchUser || matchTitle || matchTopSet;
      }

      return true;
    });
  }, [displayPosts, feedFilter, feedSearchQuery, athletes, userProfile]);

  const totalOtherUsersCount = allOtherUsersLatestPosts.length;
  const currentVisibleOtherCount = Math.min(visibleOtherUsersCount, totalOtherUsersCount);
  const hasMoreOtherUsers = visibleOtherUsersCount < totalOtherUsersCount;

  const handleLoadMoreUsers = () => {
    if (isLoadingMorePosts || !hasMoreOtherUsers) return;
    setIsLoadingMorePosts(true);
    setTimeout(() => {
      setVisibleOtherUsersCount(prev => Math.min(prev + 5, totalOtherUsersCount));
      setIsLoadingMorePosts(false);
    }, 250);
  };

  const handleShowLessUsers = () => {
    setVisibleOtherUsersCount(5);
  };

  const handleRefreshFeed = () => {
    if (isRefreshingFeed) return;
    setIsRefreshingFeed(true);
    setTimeout(() => {
      setFeedRefreshKey(k => k + 1);
      setIsRefreshingFeed(false);
      showToast('Feed updated with latest sessions');
    }, 300);
  };

  const handleOpenHistoricalPosts = (targetPost: SocialPost) => {
    const userHistoryPosts = historicalPostsByUserId[targetPost.userId] || [];
    setHistoricalModalData({
      owner: {
        userId: targetPost.userId,
        userName: targetPost.userName,
        userBadge: targetPost.userBadge,
        userRank: targetPost.userRank,
        userAvatarSeed: targetPost.userAvatarSeed,
        streakDays: targetPost.streakDays,
        avatarType: targetPost.userId === 'u_me' ? userProfile?.avatarType : undefined,
        avatarUrl: targetPost.userId === 'u_me' ? userProfile?.avatarUrl : undefined,
        avatarId: targetPost.userId === 'u_me' ? userProfile?.avatarId : undefined
      },
      posts: userHistoryPosts
    });
  };

  // Build a complete multi-day workout routine program for any feed post
  const buildFullRoutineProgramForPost = (post: SocialPost): WorkoutPlan => {
    if (post.sharedPlan && post.sharedPlan.routines && post.sharedPlan.routines.length > 0) {
      return post.sharedPlan;
    }

    const exercises = getFeedPostExercises(post);
    const titleLower = post.workoutTitle.toLowerCase();
    const isPushFocus = titleLower.includes('push') || titleLower.includes('bench') || titleLower.includes('chest');
    const isLegFocus = titleLower.includes('leg') || titleLower.includes('squat') || titleLower.includes('hack') || titleLower.includes('posterior');

    const day1Routine = {
      dayName: `Day 1: ${post.workoutTitle}`,
      focus: exercises.map(e => e.targetMuscle || 'Compound').slice(0, 3).join(' · '),
      exercises: exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        primary_muscle: ex.targetMuscle,
        defaultSets: ex.sets.length || 3,
        targetReps: `${ex.sets[0]?.reps || 8}-${(ex.sets[0]?.reps || 8) + 2}`,
        targetRpe: 8.5
      }))
    };

    const day2Routine = isPushFocus
      ? {
          dayName: 'Day 2: Heavy Pull & Back Width',
          focus: 'Back · Hamstrings · Biceps',
          exercises: [
            { exerciseId: 'barbell_deadlift', name: 'Conventional Barbell Deadlift', primary_muscle: 'Back', defaultSets: 3, targetReps: '5-6', targetRpe: 8.5 },
            { exerciseId: 'lat_pulldown', name: 'Wide-Grip Lat Pulldown', primary_muscle: 'Back', defaultSets: 3, targetReps: '8-12', targetRpe: 8 },
            { exerciseId: 'chest_supported_row', name: 'Chest-Supported T-Bar Row', primary_muscle: 'Back', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
            { exerciseId: 'incline_dumbbell_curl', name: 'Incline Dumbbell Bicep Curl', primary_muscle: 'Biceps', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
          ]
        }
      : {
          dayName: 'Day 2: Upper Push & Chest Hypertrophy',
          focus: 'Chest · Shoulders · Triceps',
          exercises: [
            { exerciseId: 'barbell_bench_press', name: 'Barbell Flat Bench Press', primary_muscle: 'Chest', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'incline_dumbbell_press', name: 'Incline Dumbbell Press', primary_muscle: 'Chest', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
            { exerciseId: 'dumbbell_lateral_raise', name: 'Dumbbell Lateral Raise', primary_muscle: 'Shoulders', defaultSets: 3, targetReps: '12-15', targetRpe: 8 },
            { exerciseId: 'tricep_rope_pushdown', name: 'Rope Triceps Pushdown', primary_muscle: 'Triceps', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
          ]
        };

    const day3Routine = isLegFocus
      ? {
          dayName: 'Day 3: Upper Pull & Posterior Thickness',
          focus: 'Back · Rear Delts · Biceps',
          exercises: [
            { exerciseId: 'lat_pulldown', name: 'Wide-Grip Lat Pulldown', primary_muscle: 'Back', defaultSets: 4, targetReps: '8-12', targetRpe: 8 },
            { exerciseId: 'chest_supported_row', name: 'Chest-Supported T-Bar Row', primary_muscle: 'Back', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_shoulder_press', name: 'Seated Dumbbell Shoulder Press', primary_muscle: 'Shoulders', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
            { exerciseId: 'ez_bar_curl', name: 'EZ-Bar Preacher Curl', primary_muscle: 'Biceps', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
          ]
        }
      : {
          dayName: 'Day 3: Lower Body Quads & Hamstrings',
          focus: 'Quads · Hamstrings · Glutes',
          exercises: [
            { exerciseId: 'hack_squat', name: 'Machine Hack Squat (Full Depth)', primary_muscle: 'Quads', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'romanian_deadlift', name: 'Barbell Romanian Deadlift', primary_muscle: 'Hamstrings', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
            { exerciseId: 'leg_extension', name: 'Seated Leg Extension', primary_muscle: 'Quads', defaultSets: 3, targetReps: '12-15', targetRpe: 8 },
            { exerciseId: 'seated_leg_curl', name: 'Seated Hamstring Curl', primary_muscle: 'Hamstrings', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
          ]
        };

    return {
      id: `hevy_routine_${post.id}`,
      title: `${post.userName.split(' ')[0]}'s ${post.workoutTitle.split('-')[0].trim()} Program`,
      subtitle: `Saved from ${post.userName} on Community Feed`,
      description: `Full 3-day workout routine program built around ${post.userName}'s logged session (${post.durationMinutes} mins · ${Math.round(post.volumeKg).toLocaleString()} kg volume).`,
      level: 'Intermediate',
      daysPerWeek: 3,
      goal: 'Hypertrophy (Pure Muscle Mass)',
      isPro: false,
      routines: [day1Routine, day2Routine, day3Routine]
    };
  };

  // Save a workout post's routine to user's Custom Plans / Workout Programs page
  const handleSaveWorkoutPostRoutine = (post: SocialPost, customTitle?: string) => {
    if (savedWorkoutPostIds.includes(post.id)) {
      showToast('Routine is already saved in your Workout Programs');
      return;
    }
    const isPro = !!subscription?.isPro;
    if (!isPro && getPersonalProgramsTotalCount() >= MAX_FREE_PERSONALIZED_PLANS) {
      setShowProgramLimitModal(true);
      return;
    }

    const basePlan = buildFullRoutineProgramForPost(post);
    const finalTitle = customTitle?.trim() || basePlan.title;
    const synthesizedPlan: WorkoutPlan = {
      ...basePlan,
      title: finalTitle
    };

    const saveResult = saveSharedPlanToMyCustomPlans(synthesizedPlan, isPro);
    if (!saveResult.success) {
      setShowProgramLimitModal(true);
      return;
    }

    setSavedWorkoutPostIds(prev => [...prev, post.id]);
    showToast(`Saved "${finalTitle}" to your Workout Programs page!`);
  };

  const handleSaveSharedExercise = (ex: ExerciseDefinition) => {
    const isPro = !!subscription?.isPro;
    const saveResult = saveCustomExercise(ex, isPro);
    if (!saveResult.success) {
      setCustomExerciseNotice(
        saveResult.error || 'Free plan limit reached. Upgrade to Pro to save unlimited custom exercises!'
      );
      if (onOpenProModal) onOpenProModal();
      setTimeout(() => setCustomExerciseNotice(null), 5000);
      return;
    }
    setSavedCustomExerciseIds(prev => (prev.includes(ex.id) ? prev : [...prev, ex.id]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gympax:exercises-updated'));
    }
    showToast(`Saved "${ex.name}" to your Custom Exercises!`);
  };

  const handleSaveSharedPlan = (sharedPlan: WorkoutPlan) => {
    const isPro = !!subscription?.isPro;
    if (!isPro && getPersonalProgramsTotalCount() >= MAX_FREE_PERSONALIZED_PLANS) {
      setShowProgramLimitModal(true);
      return;
    }
    const saveResult = saveSharedPlanToMyCustomPlans(sharedPlan, isPro);
    if (!saveResult.success) {
      setShowProgramLimitModal(true);
      return;
    }
    setSavedCustomPlanIds(prev =>
      prev.includes(sharedPlan.id) ? prev : [...prev, sharedPlan.id, saveResult.program.id]
    );
    showToast(`Saved "${sharedPlan.title}" to your Custom Plans!`);
  };

  const handleWorkoutPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWorkoutPhotoError(null);
    setWorkoutPostPhotoModeration(null);
    setIsProcessingWorkoutPhoto(true);
    setIsCheckingWorkoutPhotoAi(true);
    try {
      const compressed = await compressImageFile(file);
      setWorkoutPostPhoto(compressed);

      const modResult = await checkImageSafetyWithAi(compressed);
      setWorkoutPostPhotoModeration(modResult);
      if (modResult.flaggedAsNotAllowed) {
        setWorkoutPhotoError(
          modResult.reason || 'This photo was flagged by AI as inappropriate and cannot be shared.'
        );
      }
    } catch {
      setWorkoutPhotoError('Failed to process image. Please try standard JPEG/PNG.');
    } finally {
      setIsProcessingWorkoutPhoto(false);
      setIsCheckingWorkoutPhotoAi(false);
    }
  };

  const handlePublishWorkoutPost = () => {
    if (!activeWorkoutToPost) return;

    if (workoutPostPhoto && workoutPostPhotoModeration?.flaggedAsNotAllowed) {
      setWorkoutPhotoError(
        workoutPostPhotoModeration.reason || 'Cannot publish post: photo was flagged by AI.'
      );
      return;
    }

    if (isCheckingWorkoutPhotoAi) {
      setWorkoutPhotoError('Please wait for safety inspection to complete.');
      return;
    }

    if (workoutPostPhoto && saveWorkoutPhotoToVault) {
      addUserPhoto({
        url: workoutPostPhoto,
        tag: workoutPostPhotoTag,
        caption: workoutPostCaption.trim() || undefined,
        weightKg: userProfile?.weightKg,
        dateLabel:
          workoutPostPhotoTag === 'after'
            ? 'Post-Workout Pump'
            : workoutPostPhotoTag === 'before'
            ? 'Pre-Workout Baseline'
            : 'Session Check-in',
        visibility: 'community',
        shareToFeed: true,
        isPro: subscription?.isPro ?? false
      });
      setUserPhotos(getUserPhotos());
    }

    const durationMin = Math.max(1, Math.floor(activeWorkoutToPost.durationSeconds / 60));
    const volumeKg = activeWorkoutToPost.totalVolumeKg;
    const topExerciseName = activeWorkoutToPost.exercises[0]?.name || 'Top Compound Lift';

    const newPost: SocialPost = {
      id: `post_workout_${Date.now()}`,
      userId: 'u_me',
      userName: userProfile?.name || 'Alex Hunter',
      userAvatarSeed: 'my_avatar',
      userBadge: subscription?.isPro ? 'PRO' : 'BEAST',
      workoutTitle: workoutPostCaption
        ? `${activeWorkoutToPost.title} · ${workoutPostCaption}`
        : activeWorkoutToPost.title,
      durationMinutes: durationMin,
      volumeKg: volumeKg,
      volumeLbs: Math.round(volumeKg * 2.20462),
      topSet: topExerciseName,
      prBroken: activeWorkoutToPost.prCount ? `${activeWorkoutToPost.prCount} New PRs hit today!` : undefined,
      timestamp: Date.now(),
      likes: 1,
      cheers: [{ id: `c_${Date.now()}`, userId: 'u_me', userName: 'You', emoji: '💪', label: 'Beast Mode' }],
      comments: [],
      isLikedByMe: true,
      streakDays: rewardsProfile?.currentStreakDays || 12,
      activeBadges: rewardsProfile?.badges,
      userRank: rewardsProfile?.rankTitle,
      photoUrl: workoutPostPhoto || undefined,
      attachedPhotoUrl: workoutPostPhoto || undefined,
      photoTag: workoutPostPhoto ? workoutPostPhotoTag : undefined,
      photoCaption: workoutPostCaption || undefined,
      postType: workoutPostPhoto ? 'photo_showcase' : 'workout',
      workoutSession: activeWorkoutToPost
    };

    if (onPublishPost) {
      onPublishPost(newPost);
    } else {
      addSocialPost(newPost);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 }
      });
    } catch {}

    setActiveWorkoutToPost(null);
    setWorkoutPostPhoto(null);
    setWorkoutPostCaption('');
    if (onClearPendingWorkoutToShare) {
      onClearPendingWorkoutToShare();
    }
    showToast('Workout session published to Community Feed!');
  };

  const handleCancelWorkoutPost = () => {
    setActiveWorkoutToPost(null);
    setWorkoutPostPhoto(null);
    setWorkoutPostCaption('');
    if (onClearPendingWorkoutToShare) {
      onClearPendingWorkoutToShare();
    }
  };

  const handleSharePhotoToFeed = (photo: UserCommunityPhoto) => {
    const newPost: SocialPost = {
      id: `post_photo_${Date.now()}`,
      userId: 'u_me',
      userName: userProfile?.name || 'Alex Hunter',
      userAvatarSeed: 'my_avatar',
      userBadge: subscription?.isPro ? 'PRO' : 'LIFTER',
      workoutTitle: `${photo.dateLabel || 'Physique Check-in'} · Community Milestone`,
      durationMinutes: 45,
      volumeKg: 8500,
      volumeLbs: 18739,
      topSet: `${photo.tag.toUpperCase()} Milestone`,
      timestamp: Date.now(),
      likes: 1,
      cheers: [{ id: `c_${Date.now()}`, userId: 'u_me', userName: 'You', emoji: '🔥', label: 'Crushed it' }],
      comments: [],
      isLikedByMe: true,
      attachedPhotoUrl: photo.url,
      photoTag: photo.tag,
      photoCaption: photo.caption || 'Consistent daily work and progressive overload.'
    };

    if (onPublishPost) {
      onPublishPost(newPost);
    } else {
      addSocialPost(newPost);
    }
    setSocialTab('feed');
  };

  const handleAddPhoto = (data: {
    url: string;
    tag: PhotoTagType;
    caption?: string;
    weightKg?: number;
    dateLabel?: string;
    visibility?: PhotoVisibility;
    shareToFeed?: boolean;
    isPro?: boolean;
  }) => {
    const res = addUserPhoto({ ...data, isPro: subscription?.isPro });
    if (res.success && res.photos) {
      setUserPhotos(res.photos);
      if (userProfile && onUpdateUserProfile) {
        onUpdateUserProfile({ ...userProfile, photos: res.photos });
      }
      if (data.visibility === 'community' && data.shareToFeed && res.photo) {
        handleSharePhotoToFeed(res.photo);
      }
    }
    return res;
  };

  const handleDeletePhoto = (photoId: string) => {
    const updated = deleteUserPhoto(photoId, subscription?.isPro);
    setUserPhotos(updated);
    if (userProfile && onUpdateUserProfile) {
      onUpdateUserProfile({ ...userProfile, photos: updated });
    }
  };

  const handleSetPhotoTag = (photoId: string, tag: PhotoTagType) => {
    const updated = updatePhotoTag(photoId, tag, subscription?.isPro);
    setUserPhotos(updated);
    if (userProfile && onUpdateUserProfile) {
      onUpdateUserProfile({ ...userProfile, photos: updated });
    }
  };

  const handleTogglePhotoVisibility = (photoId: string, nextVisibility: PhotoVisibility) => {
    const updated = updatePhotoVisibility(photoId, nextVisibility, subscription?.isPro);
    setUserPhotos(updated);
    if (userProfile && onUpdateUserProfile) {
      onUpdateUserProfile({ ...userProfile, photos: updated });
    }
  };

  const handleShareTransformationToFeed = (
    before: UserCommunityPhoto,
    after: UserCommunityPhoto,
    notes: string
  ) => {
    const newPost: SocialPost = {
      id: `post_trans_${Date.now()}`,
      userId: 'u_me',
      userName: userProfile?.name || 'Alex Hunter',
      userAvatarSeed: 'my_avatar',
      userBadge: 'PRO',
      workoutTitle: 'Physique Transformation Milestone',
      durationMinutes: 60,
      volumeKg: 10000,
      volumeLbs: 22046,
      topSet: `${before.dateLabel || 'Baseline'} → ${after.dateLabel || 'Current'}`,
      timestamp: Date.now(),
      likes: 1,
      cheers: [{ id: `c_${Date.now()}`, userId: 'u_me', userName: 'You', emoji: '🔥', label: 'Crushed it' }],
      comments: [],
      isLikedByMe: true,
      postType: 'before_after',
      beforePhotoUrl: before.url,
      afterPhotoUrl: after.url,
      transformationDetails: {
        beforeLabel: before.dateLabel || 'Baseline',
        afterLabel: after.dateLabel || 'Current',
        notes: notes || 'Consistency with progressive overload and dialed recovery.'
      }
    };

    if (onPublishPost) {
      onPublishPost(newPost);
    } else {
      addSocialPost(newPost);
    }
    setSocialTab('feed');
  };

  const handleOpenSidebarWhatsApp = (
    athlete: NearbyAthlete,
    tab: 'message' | 'call' = 'message'
  ) => {
    setSidebarWhatsAppAthlete(athlete);
    setSidebarWhatsAppTab(tab);
  };

  const handleUpdateAthletePhone = (athleteId: string, phone: string) => {
    const updated = updateAthleteWhatsappNumber(athleteId, phone);
    setAthletes(updated);
  };

  // User profile modal & bio editor state
  const [inspectAthlete, setInspectAthlete] = useState<NearbyAthlete | null>(null);
  const [isInspectingOwnProfile, setIsInspectingOwnProfile] = useState<boolean>(false);
  const [myBioInput, setMyBioInput] = useState<string>(userProfile?.bio || '');

  useEffect(() => {
    if (userProfile?.bio !== undefined) {
      setMyBioInput(userProfile.bio || '');
    }
  }, [userProfile?.bio]);

  const handleOpenUserProfile = (
    userId: string,
    userName: string,
    extra?: Partial<NearbyAthlete> & {
      photoUrl?: string;
      attachedPhotoUrl?: string;
    }
  ) => {
    if (userId === 'u_me' || userId === 'ath_current_user' || userName === userProfile?.name) {
      const myPhotos = getUserPhotos();
      const ownAthlete: NearbyAthlete = {
        id: 'ath_current_user',
        uniqueId: getUserLifterId(userProfile),
        name: userProfile?.name || 'Alex Hunter',
        avatarSeed: 'user_alex',
        badge: (rewardsProfile?.section as any) || 'PRO',
        level: userProfile?.experienceLevel || 'Intermediate',
        area: userArea || userProfile?.homeTownAddress || 'Local Area',
        city: userProfile?.cityOrTown || 'Austin, TX',
        gymName: userProfile?.gymName || 'Local Gym',
        distanceMiles: 0,
        primaryGoal: userProfile?.primaryGoal || 'Hypertrophy & Aesthetics',
        favoriteLifts: `Focus: ${userProfile?.focusWeakpoint || 'Compound Progression'}`,
        trainingDaysPerWeek: userProfile?.daysPerWeek || 5,
        streakDays: rewardsProfile?.currentStreakDays || 14,
        lastActive: 'Active Now',
        workoutSplit: `${userProfile?.daysPerWeek || 5}-Day Periodized Split`,
        bio: userProfile?.bio || '',
        connectionStatus: 'connected',
        joinedDate: 'Joined GymPax',
        prs: [
          { exercise: 'Barbell Flat Bench', weight: '120 kg' },
          { exercise: 'Barbell Squat', weight: '160 kg' },
          { exercise: 'Conventional Deadlift', weight: '200 kg' }
        ],
        photos: myPhotos,
        beforePhotoUrl: myPhotos.find(p => p.tag === 'before')?.url,
        afterPhotoUrl: myPhotos.find(p => p.tag === 'after' || p.tag === 'physique')?.url
      };
      setInspectAthlete(ownAthlete);
      setIsInspectingOwnProfile(true);
      return;
    }

    let found = athletes.find(
      a =>
        a.id === userId ||
        a.name.toLowerCase() === userName.toLowerCase() ||
        (a.uniqueId && userId.includes(a.uniqueId))
    );

    if (!found) {
      const seed = userName.toLowerCase().replace(/\s+/g, '_');
      const physique = buildAthletePhysiquePhotos({
        id: userId,
        avatarSeed: seed,
        name: userName,
        gender: extra?.gender
      });
      found = {
        id: userId || `ath_${Date.now()}`,
        uniqueId: `SOMA-${Math.floor(1000 + Math.random() * 9000)}`,
        name: userName,
        avatarSeed: seed,
        gender: physique.gender,
        badge: (extra?.badge as any) || 'LIFTER',
        level: extra?.level || 'Intermediate',
        area: extra?.area || userArea || 'Austin, Texas',
        city: extra?.city || 'Austin, TX',
        gymName: extra?.gymName || 'MetroFlex Gym',
        distanceMiles: extra?.distanceMiles ?? Math.floor(Math.random() * 20) / 10 + 0.5,
        primaryGoal: extra?.primaryGoal || 'Progressive Overload & Hypertrophy',
        favoriteLifts: extra?.favoriteLifts || 'Barbell Bench · Squat · Lat Pulldowns',
        trainingDaysPerWeek: extra?.trainingDaysPerWeek || 4,
        streakDays: extra?.streakDays || 7,
        lastActive: extra?.lastActive || 'Active today',
        workoutSplit: extra?.workoutSplit || 'Push / Pull / Legs Split',
        bio:
          extra?.bio ||
          `Dedicated lifter training for progressive overload, technique consistency, and clean hypertrophy in ${userArea || 'the area'}.`,
        connectionStatus: extra?.connectionStatus || 'none',
        joinedDate: extra?.joinedDate || 'Joined GymPax',
        prs: extra?.prs || [
          { exercise: 'Bench Press', weight: '125 kg' },
          { exercise: 'Squat', weight: '170 kg' },
          { exercise: 'Barbell Row', weight: '110 kg' }
        ],
        beforePhotoUrl: extra?.beforePhotoUrl || physique.beforePhotoUrl,
        afterPhotoUrl:
          extra?.afterPhotoUrl || extra?.photoUrl || extra?.attachedPhotoUrl || physique.afterPhotoUrl,
        photos: extra?.photos || physique.photos
      };
    } else {
      const physique = buildAthletePhysiquePhotos({
        id: found.id,
        avatarSeed: found.avatarSeed,
        name: found.name,
        gender: found.gender
      });
      found = {
        ...found,
        gender: physique.gender,
        beforePhotoUrl: extra?.beforePhotoUrl || found.beforePhotoUrl || physique.beforePhotoUrl,
        afterPhotoUrl:
          extra?.afterPhotoUrl ||
          extra?.attachedPhotoUrl ||
          extra?.photoUrl ||
          found.afterPhotoUrl ||
          physique.afterPhotoUrl,
        photos: found.photos && found.photos.length > 0 ? found.photos : physique.photos
      };
    }

    setInspectAthlete(found);
    setIsInspectingOwnProfile(false);
  };

  const handleSaveMyBio = (bioText?: string) => {
    const nextBio = (bioText !== undefined ? bioText : myBioInput).trim();
    if (userProfile && onUpdateUserProfile) {
      const updated = { ...userProfile, bio: nextBio };
      onUpdateUserProfile(updated);
      saveUserProfile(updated);
      syncUserProfileToNearbyAthletes(updated);
    }
    showToast('Athlete bio updated');
  };

  const cheerOptions: { emoji: '💪' | '🔥' | '⚡' | '🏆' | '🦍'; label: string }[] = [
    { emoji: '💪', label: 'Beast Mode' },
    { emoji: '🔥', label: 'Crushed it' },
    { emoji: '⚡', label: 'Light weight' },
    { emoji: '🏆', label: 'New PR' },
    { emoji: '🦍', label: 'Silverback' }
  ];

  // One response / one click rule per button
  const handleSendQuickMessage = (postId: string, message: string) => {
    const post = displayPosts.find(p => p.id === postId);
    if (post && post.comments.some(c => c.userId === 'u_me')) {
      showToast('You have already responded to this post');
      return;
    }
    onAddComment(postId, message);
    showToast('Comment posted');
  };

  const handleSendComment = (postId: string) => {
    const post = displayPosts.find(p => p.id === postId);
    if (post && post.comments.some(c => c.userId === 'u_me')) {
      showToast('You have already responded to this post');
      return;
    }
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    showToast('Comment posted');
  };

  const handleAcceptRequest = (athleteId: string) => {
    const target = athletes.find(a => a.id === athleteId);
    const updated = acceptAthleteInvite(athleteId);
    setAthletes(updated);

    setSuggestedConnections(prev =>
      prev.map(item =>
        item.athlete.id === athleteId
          ? { ...item, athlete: { ...item.athlete, connectionStatus: 'connected' } }
          : item
      )
    );

    if (inspectAthlete && inspectAthlete.id === athleteId) {
      setInspectAthlete(prev => (prev ? { ...prev, connectionStatus: 'connected' } : null));
    }

    try {
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.6 } });
    } catch {}

    showToast(`Connected with ${target?.name || 'Athlete'}!`);
  };

  const handleRejectRequest = (athleteId: string) => {
    const target = athletes.find(a => a.id === athleteId);
    const updated = rejectAthleteInvite(athleteId);
    setAthletes(updated);

    setSuggestedConnections(prev =>
      prev.map(item =>
        item.athlete.id === athleteId
          ? { ...item, athlete: { ...item.athlete, connectionStatus: 'none' } }
          : item
      )
    );

    if (inspectAthlete && inspectAthlete.id === athleteId) {
      setInspectAthlete(prev => (prev ? { ...prev, connectionStatus: 'none' } : null));
    }

    showToast(`Declined request from ${target?.name || 'Athlete'}.`);
  };

  const handleToggleConnection = (athleteId: string, customMessage?: string) => {
    const target = athletes.find(a => a.id === athleteId);
    if (!target) return;

    if (target.connectionStatus === 'incoming_request') {
      handleAcceptRequest(athleteId);
      return;
    }

    if (target.connectionStatus === 'pending' || target.connectionStatus === 'connected') {
      const updated = updateAthleteConnection(athleteId, 'none');
      setAthletes(updated);
      setSuggestedConnections(prev =>
        prev.map(item =>
          item.athlete.id === athleteId
            ? {
                ...item,
                athlete: {
                  ...item.athlete,
                  connectionStatus: 'none',
                  inviteMessage: undefined,
                  invitedAt: undefined
                }
              }
            : item
        )
      );
      if (inspectAthlete && inspectAthlete.id === athleteId) {
        setInspectAthlete(prev =>
          prev
            ? { ...prev, connectionStatus: 'none', inviteMessage: undefined, invitedAt: undefined }
            : null
        );
      }
      showToast(
        target.connectionStatus === 'pending'
          ? `Cancelled request to ${target.name}.`
          : `Unfollowed ${target.name}.`
      );
      return;
    }

    if (customMessage !== undefined) {
      applySendConnection(target, customMessage);
    } else {
      setConnectModalAthlete(target);
    }
  };

  const applySendConnection = (target: NearbyAthlete, customMessage?: string) => {
    const trimmedMessage = customMessage && customMessage.trim() ? customMessage.trim() : undefined;
    const updated = updateAthleteConnection(target.id, 'pending', trimmedMessage);
    setAthletes(updated);

    setSuggestedConnections(prev =>
      prev.map(item =>
        item.athlete.id === target.id
          ? {
              ...item,
              athlete: {
                ...item.athlete,
                connectionStatus: 'pending',
                inviteMessage: trimmedMessage,
                invitedAt: 'Just now'
              }
            }
          : item
      )
    );

    if (inspectAthlete && inspectAthlete.id === target.id) {
      setInspectAthlete(prev =>
        prev
          ? {
              ...prev,
              connectionStatus: 'pending',
              inviteMessage: trimmedMessage,
              invitedAt: 'Just now'
            }
          : null
      );
    }

    showToast(`Follow invite sent to ${target.name}!`);
  };

  const handleUpdateArea = (newArea: string) => {
    setUserArea(newArea);
    setUserAreaState(newArea);
  };

  const handleQuickCopyLink = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gympax.fit';
    const link = `${origin}?ref=GYM-AREA&area=${encodeURIComponent(userArea)}`;
    try {
      await navigator.clipboard.writeText(link);
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 2000);
      showToast('Invite link copied to clipboard!');
    } catch {}
  };

  const newAreaMembers = useMemo(() => {
    return getNewMembersInArea(athletes, userArea, userProfile, 3);
  }, [athletes, userArea, userProfile]);

  // Distinct countries available for Country Leaderboard
  const availableCountries = useMemo(() => {
    const list = [
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'Germany',
      'France',
      'Japan',
      'Spain',
      'Brazil',
      'Italy',
      'Netherlands',
      'South Korea',
      'Ireland'
    ];
    if (userProfile?.country && !list.includes(userProfile.country)) {
      list.unshift(userProfile.country);
    }
    return list;
  }, [userProfile?.country]);

  // Filtered world countries based on typing in the country input
  const filteredWorldCountries = useMemo(() => {
    const q = countrySearchInput.toLowerCase().trim();
    if (!q) return ALL_WORLD_COUNTRIES;
    return ALL_WORLD_COUNTRIES.filter(c => c.toLowerCase().includes(q));
  }, [countrySearchInput]);

  // Filtered world countries for Nearby Athletes country input
  const filteredNearbyWorldCountries = useMemo(() => {
    const q = nearbyCountrySearchInput.toLowerCase().trim();
    if (!q) return ALL_WORLD_COUNTRIES;
    return ALL_WORLD_COUNTRIES.filter(c => c.toLowerCase().includes(q));
  }, [nearbyCountrySearchInput]);

  // Filtered athletes for Nearby Athletes panel (Worldwide, Country, My location)
  const filteredNearbyPanelAthletes = useMemo<Array<NearbyAthlete & { computedKm: number; country: string }>>(() => {
    const myLat = userProfile?.latitude ?? 30.2672;
    const myLng = userProfile?.longitude ?? -97.7431;
    const isOwn = (a: NearbyAthlete) =>
      a.id === 'ath_current_user' ||
      a.id === 'u_me' ||
      (Boolean(userProfile?.name) && a.name?.trim().toLowerCase() === userProfile!.name.trim().toLowerCase());

    const enriched = athletes
      .filter(a => !isOwn(a))
      .map(a => {
        let distMiles = a.distanceMiles ?? 2.0;
        if (a.latitude && a.longitude) {
          distMiles = calculateDistanceMiles(myLat, myLng, a.latitude, a.longitude);
        }
        const distKm = Math.round(distMiles * 1.60934 * 10) / 10;
        return {
          ...a,
          distanceMiles: distMiles,
          computedKm: distKm,
          country: a.country || 'United States'
        };
      });

    if (nearbyScope === 'worldwide') {
      return enriched;
    }

    if (nearbyScope === 'country') {
      const matchCountry = selectedNearbyCountry.trim().toLowerCase();
      const matched = enriched.filter(
        a => a.country.toLowerCase() === matchCountry || a.country.toLowerCase().includes(matchCountry)
      );
      if (matched.length > 0) return matched;
      // Fallback national lifters if a country has no pre-seeded entry
      const slug = matchCountry.replace(/\s+/g, '_');
      return [
        {
          id: `ath_nearby_nat_1_${slug}`,
          name: `National Champion · ${selectedNearbyCountry}`,
          avatarSeed: `nat1_${slug}`,
          badge: 'ELITE',
          level: 'Advanced Pro',
          area: selectedNearbyCountry,
          city: selectedNearbyCountry,
          country: selectedNearbyCountry,
          gymName: `Power Gym ${selectedNearbyCountry}`,
          distanceMiles: 4500,
          computedKm: 7200,
          primaryGoal: 'Strength & Hypertrophy',
          workoutSplit: 'Push / Pull / Legs',
          favoriteLifts: 'Squat · Bench · Deadlift',
          trainingDaysPerWeek: 5,
          streakDays: 31,
          lastActive: 'Active today',
          bio: `Competitive strength athlete representing ${selectedNearbyCountry}.`,
          connectionStatus: 'none'
        },
        {
          id: `ath_nearby_nat_2_${slug}`,
          name: `Pro Athlete · ${selectedNearbyCountry}`,
          avatarSeed: `nat2_${slug}`,
          badge: 'PRO',
          level: 'Intermediate',
          area: selectedNearbyCountry,
          city: selectedNearbyCountry,
          country: selectedNearbyCountry,
          gymName: `Metro Barbell ${selectedNearbyCountry}`,
          distanceMiles: 4500,
          computedKm: 7200,
          primaryGoal: 'Hypertrophy & Aesthetics',
          workoutSplit: 'Upper / Lower',
          favoriteLifts: 'Incline Press · Pull-Ups',
          trainingDaysPerWeek: 5,
          streakDays: 22,
          lastActive: 'Active 2h ago',
          bio: `Dedicated hypertrophy lifter training in ${selectedNearbyCountry}.`,
          connectionStatus: 'none'
        },
        {
          id: `ath_nearby_nat_3_${slug}`,
          name: `Rising Lifter · ${selectedNearbyCountry}`,
          avatarSeed: `nat3_${slug}`,
          badge: 'PRO',
          level: 'Intermediate',
          area: selectedNearbyCountry,
          city: selectedNearbyCountry,
          country: selectedNearbyCountry,
          gymName: `Iron Club ${selectedNearbyCountry}`,
          distanceMiles: 4500,
          computedKm: 7200,
          primaryGoal: 'Strength & Conditioning',
          workoutSplit: 'Full Body 4-Day',
          favoriteLifts: 'Deadlift · Overhead Press',
          trainingDaysPerWeek: 4,
          streakDays: 14,
          lastActive: 'Active today',
          bio: `Focused on progressive overload and community training in ${selectedNearbyCountry}.`,
          connectionStatus: 'none'
        }
      ];
    }

    // nearbyScope === 'city' (My location)
    return enriched.filter(a => {
      if (nearbyDistanceUnit === 'km') {
        return a.computedKm <= nearbyRadius;
      }
      return a.distanceMiles <= nearbyRadius;
    });
  }, [athletes, userProfile, nearbyScope, selectedNearbyCountry, nearbyRadius, nearbyDistanceUnit]);

  // Distinct cities available for Town or City Leaderboard
  const availableCities = useMemo(() => {
    const list = [
      'Austin',
      'New York',
      'Los Angeles',
      'London',
      'Toronto',
      'Sydney',
      'Berlin',
      'Paris',
      'Tokyo',
      'Madrid',
      'São Paulo',
      'Milan',
      'Dublin'
    ];
    if (userProfile?.cityOrTown && !list.includes(userProfile.cityOrTown)) {
      list.unshift(userProfile.cityOrTown);
    }
    return list;
  }, [userProfile?.cityOrTown]);

  // Hevy / Strava-style Community Leaderboards Data with Worldwide, Country, Town/City & Local Scopes
  const leaderboardEntries = useMemo(() => {
    const history = getWorkoutHistory();
    const myWeeklyVolKg = history.slice(0, 4).reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0) || 34200;
    const myStreak = rewardsProfile?.currentStreakDays || 12;
    const myCountry = userProfile?.country || 'United States';
    const myCity = userProfile?.cityOrTown || 'Austin';
    const myLat = userProfile?.latitude ?? 30.2672;
    const myLng = userProfile?.longitude ?? -97.7431;

    const myWorkoutsCount = history.length || 4;
    const mySetsCount = history.reduce((sum, w) => sum + (w.exercises?.reduce((s, ex) => s + (ex.sets?.length || 0), 0) || 0), 0) || 48;
    const myRepsCount = history.reduce((sum, w) => sum + (w.exercises?.reduce((s, ex) => s + (ex.sets?.reduce((r, st) => r + (st.reps || 0), 0) || 0), 0) || 0), 0) || 492;
    const myWorkoutMinutes = Math.round(history.reduce((sum, w) => sum + (w.durationSeconds || 3600), 0) / 60) || 280;

    const myEntry = {
      id: 'u_me',
      name: `${userProfile?.name || 'Alex Hunter'} (You)`,
      isMe: true,
      gym: userProfile?.gymName || 'Local Gym',
      rankBadge: rewardsProfile?.rankTitle || 'Pro - Level 2',
      weeklyVolumeKg: myWeeklyVolKg,
      streakDays: myStreak,
      monthlyPrs: 6,
      workoutsCount: myWorkoutsCount,
      setsCount: mySetsCount,
      repsCount: myRepsCount,
      workoutMinutes: myWorkoutMinutes,
      country: myCountry,
      city: myCity,
      distanceMiles: 0,
      distanceKm: 0,
      avatarUrl: userProfile?.avatarUrl
    };

    const athleteBaselineMap: Record<string, { vol: number; prs: number }> = {
      ath_1: { vol: 48600, prs: 9 },
      ath_2: { vol: 46200, prs: 8 },
      ath_aus_3: { vol: 26100, prs: 4 },
      ath_aus_4: { vol: 39400, prs: 6 },
      ath_aus_5: { vol: 42900, prs: 7 },
      ath_aus_6: { vol: 31800, prs: 5 },
      ath_aus_7: { vol: 28500, prs: 5 },
      ath_nyc_1: { vol: 45100, prs: 8 },
      ath_lax_1: { vol: 34800, prs: 6 },
      ath_lon_1: { vol: 44200, prs: 7 },
      ath_lon_2: { vol: 41600, prs: 7 },
      ath_lon_3: { vol: 30200, prs: 4 },
      ath_tor_1: { vol: 38900, prs: 6 },
      ath_syd_1: { vol: 47500, prs: 8 },
      ath_tyo_1: { vol: 36400, prs: 5 },
      ath_ber_1: { vol: 43800, prs: 7 },
      ath_par_1: { vol: 33500, prs: 5 },
      ath_mad_1: { vol: 37200, prs: 6 },
      ath_sao_1: { vol: 40900, prs: 7 },
      ath_ams_1: { vol: 35100, prs: 5 },
      ath_mil_1: { vol: 36700, prs: 6 },
      ath_sel_1: { vol: 41200, prs: 7 },
      ath_dub_1: { vol: 32600, prs: 5 },
    };

    const otherEntries = athletes.map(a => {
      const city = a.cityOrTown || a.city || 'Austin';
      const country = a.country || 'United States';
      let distMiles = a.distanceMiles ?? 2.0;
      if (a.latitude && a.longitude) {
        distMiles = calculateDistanceMiles(myLat, myLng, a.latitude, a.longitude);
      }
      const distKm = Math.round(distMiles * 1.60934 * 10) / 10;
      const baseline = athleteBaselineMap[a.id] || {
        vol: 25000 + ((a.streakDays * 980) % 25000),
        prs: Math.max(2, Math.round(a.streakDays / 4) + 2)
      };

      const rankBadge =
        a.badge === 'ELITE'
          ? 'Elite - Level 3'
          : a.badge === 'BEAST'
          ? 'Beast - Level 2'
          : a.badge === 'PRO'
          ? 'Pro - Level 2'
          : 'Lifter - Level 1';

      const streak = a.streakDays || 7;
      const workouts = Math.max(2, Math.round(streak / 2) + 1);
      const sets = workouts * 14 + (streak % 5);
      const reps = sets * 10 + ((streak * 7) % 50);
      const minutes = workouts * 55 + ((streak * 3) % 20);

      return {
        id: a.id,
        name: a.name,
        isMe: false,
        gym: a.gymName || 'Community Gym',
        rankBadge,
        weeklyVolumeKg: baseline.vol,
        streakDays: streak,
        monthlyPrs: baseline.prs,
        workoutsCount: workouts,
        setsCount: sets,
        repsCount: reps,
        workoutMinutes: minutes,
        country,
        city,
        distanceMiles: distMiles,
        distanceKm: distKm,
        avatarUrl: a.avatarUrl
      };
    });

    const supplementaryLocal = [
      {
        id: 'ath_suburb_rr',
        name: 'Caleb Vance',
        isMe: false,
        gym: 'Round Rock Barbell Club',
        rankBadge: 'Pro - Level 1',
        weeklyVolumeKg: 37800,
        streakDays: 19,
        monthlyPrs: 5,
        workoutsCount: 6,
        setsCount: 78,
        repsCount: 820,
        workoutMinutes: 340,
        country: 'United States',
        city: 'Austin',
        distanceMiles: 11.2,
        distanceKm: 18.0,
        avatarUrl: undefined
      },
      {
        id: 'ath_suburb_sm',
        name: 'Morgan Reed',
        isMe: false,
        gym: 'Hill Country Powerhouse',
        rankBadge: 'Beast - Level 2',
        weeklyVolumeKg: 35400,
        streakDays: 16,
        monthlyPrs: 6,
        workoutsCount: 5,
        setsCount: 72,
        repsCount: 750,
        workoutMinutes: 310,
        country: 'United States',
        city: 'Austin',
        distanceMiles: 22.5,
        distanceKm: 36.2,
        avatarUrl: undefined
      }
    ];

    const allPool = [myEntry, ...otherEntries, ...supplementaryLocal];

    let filtered = allPool;
    if (leaderboardLocationSearch.trim()) {
      const q = leaderboardLocationSearch.trim().toLowerCase();
      filtered = allPool.filter(e =>
        e.city.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        e.gym.toLowerCase().includes(q)
      );
      if (
        (myCity.toLowerCase().includes(q) || myCountry.toLowerCase().includes(q) || myEntry.gym.toLowerCase().includes(q)) &&
        !filtered.some(e => e.isMe)
      ) {
        filtered.push(myEntry);
      }
    } else if (leaderboardScope === 'current_location') {
      // Leaders near the user's current physical location (within 15km / 10 miles or in user's city/area)
      filtered = allPool.filter(e => {
        if (e.isMe) return true;
        return (
          e.distanceMiles <= 15 ||
          e.city.toLowerCase() === myCity.toLowerCase() ||
          myCity.toLowerCase().includes(e.city.toLowerCase())
        );
      });
    } else if (leaderboardScope === 'worldwide') {
      filtered = allPool;
    } else if (leaderboardScope === 'country') {
      const matchCountry = selectedLeaderboardCountry.trim().toLowerCase();
      filtered = allPool.filter(
        e => e.country.toLowerCase() === matchCountry || e.country.toLowerCase().includes(matchCountry)
      );
      if (myCountry.toLowerCase() === matchCountry && !filtered.some(e => e.isMe)) {
        filtered.push(myEntry);
      }
      if (filtered.length === 0) {
        filtered = [
          {
            id: `ath_nat_1_${matchCountry.replace(/\s+/g, '_')}`,
            name: `National Champion · ${selectedLeaderboardCountry}`,
            isMe: false,
            gym: `Power Gym ${selectedLeaderboardCountry}`,
            rankBadge: 'Elite - Level 3',
            weeklyVolumeKg: 46800,
            streakDays: 31,
            monthlyPrs: 8,
            workoutsCount: 7,
            setsCount: 96,
            repsCount: 990,
            workoutMinutes: 440,
            country: selectedLeaderboardCountry,
            city: selectedLeaderboardCountry,
            distanceMiles: 4500,
            distanceKm: 7200,
            avatarUrl: undefined
          },
          {
            id: `ath_nat_2_${matchCountry.replace(/\s+/g, '_')}`,
            name: `Pro Athlete · ${selectedLeaderboardCountry}`,
            isMe: false,
            gym: `Metro Barbell ${selectedLeaderboardCountry}`,
            rankBadge: 'Pro - Level 2',
            weeklyVolumeKg: 39500,
            streakDays: 22,
            monthlyPrs: 6,
            workoutsCount: 6,
            setsCount: 82,
            repsCount: 840,
            workoutMinutes: 360,
            country: selectedLeaderboardCountry,
            city: selectedLeaderboardCountry,
            distanceMiles: 4500,
            distanceKm: 7200,
            avatarUrl: undefined
          },
          {
            id: `ath_nat_3_${matchCountry.replace(/\s+/g, '_')}`,
            name: `Rising Lifter · ${selectedLeaderboardCountry}`,
            isMe: false,
            gym: `Iron Club ${selectedLeaderboardCountry}`,
            rankBadge: 'Lifter - Level 1',
            weeklyVolumeKg: 28400,
            streakDays: 14,
            monthlyPrs: 4,
            workoutsCount: 4,
            setsCount: 56,
            repsCount: 590,
            workoutMinutes: 240,
            country: selectedLeaderboardCountry,
            city: selectedLeaderboardCountry,
            distanceMiles: 4500,
            distanceKm: 7200,
            avatarUrl: undefined
          }
        ];
        if (myCountry.toLowerCase() === matchCountry) {
          filtered.push(myEntry);
        }
      }
    } else if (leaderboardScope === 'city' || leaderboardScope === 'local') {
      filtered = allPool.filter(e => {
        if (e.isMe) return true;
        if (localDistanceUnit === 'km') {
          return e.distanceKm <= localRadius;
        } else {
          return e.distanceMiles <= localRadius;
        }
      });
    }

    return filtered.sort((a, b) => {
      if (leaderboardMetric === 'volume') return b.weeklyVolumeKg - a.weeklyVolumeKg;
      if (leaderboardMetric === 'streak') return b.streakDays - a.streakDays;
      if (leaderboardMetric === 'prs') return b.monthlyPrs - a.monthlyPrs;
      if (leaderboardMetric === 'workouts') return (b.workoutsCount || 0) - (a.workoutsCount || 0);
      if (leaderboardMetric === 'sets') return (b.setsCount || 0) - (a.setsCount || 0);
      if (leaderboardMetric === 'reps') return (b.repsCount || 0) - (a.repsCount || 0);
      if (leaderboardMetric === 'time') return (b.workoutMinutes || 0) - (a.workoutMinutes || 0);
      return b.weeklyVolumeKg - a.weeklyVolumeKg;
    });
  }, [
    userProfile,
    rewardsProfile,
    athletes,
    leaderboardMetric,
    leaderboardScope,
    localRadius,
    localDistanceUnit,
    selectedLeaderboardCountry,
    selectedLeaderboardCity,
    leaderboardLocationSearch
  ]);

  // Active Monthly Challenges (Strava / Peloton / Gymshark Lifting Club / Hevy style)
  const monthlyChallenges: CommunityChallengeItem[] = useMemo(() => {
    const history = getWorkoutHistory();
    const totalVol = history.reduce((s, w) => s + (w.totalVolumeKg || 0), 0);
    const displayTargetVol = unit === 'kg' ? 100000 : 220000;
    const displayCurrentVol = unit === 'kg' ? Math.round(totalVol) : Math.round(totalVol * 2.20462);

    return [
      {
        id: 'chal_monthly_vol',
        title: `100K ${unit.toUpperCase()} Monthly Tonnage Club`,
        subtitle: 'Accumulate 100,000+ total volume across compound & accessory sets this month.',
        targetLabel: `${displayCurrentVol.toLocaleString()} / ${displayTargetVol.toLocaleString()} ${unit}`,
        currentValue: displayCurrentVol,
        targetValue: displayTargetVol,
        unitLabel: unit,
        participantsCount: 1420,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'GLOBAL TONNAGE QUEST · STRAVA & HEVY STYLE',
        heroTagline: 'Move the weight of a commercial airliner in 30 days of pure mechanical tension!',
        energeticPitch:
          'Inspired by Strava’s legendary global volume clubs and Hevy’s monthly tonnage leaderboards, the 100K Monthly Tonnage Club is the ultimate test of work capacity! Every single working set you crush—from heavy barbell squats and deadlifts to high-rep cable finishers—stacks onto your cumulative monthly iron meter. Step up to the platform, stack the plates, and prove your work ethic alongside 1,400+ relentless lifters!',
        whyJoinBullets: [
          'Builds dense myofibrillar & sarcoplasmic hypertrophy through sustained weekly volume',
          'Every compound and isolation exercise automatically counts toward your 100K total',
          'Unlocks the Challenge Conqueror badge + 10 Rank Points upon completion',
          'Compete side-by-side with top volume lifters on the Community Leaderboard'
        ],
        officialRules: [
          'All completed working sets logged in the Workout Logger count automatically (weight × reps).',
          'Warm-up sets at RPE < 5 are excluded from competitive tonnage totals.',
          'Hit 100% of the monthly tonnage target before the 30-day clock expires to claim +10 Rank Points.'
        ],
        proTips: [
          'Prioritize multi-joint compound lifts (Squats, RDLs, Leg Press, Incline Presses) for massive tonnage surges.',
          'Add 1–2 back-off sets at 10–12 reps after your top heavy sets to skyrocket total volume safely.',
          'Stay consistent with 4–5 sessions per week so volume compounds effortlessly.'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '25K Iron Ignition', rewardText: 'First quarter of total monthly volume locked in' },
          { tier: 'Silver', thresholdPct: 60, title: '60K Tonnage Engine', rewardText: 'Passed the halfway mark with unstoppable momentum' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '100K Tonnage Club Finisher', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_consistency_20',
        title: '20-Session Iron Consistency',
        subtitle: 'Complete 20 verified workouts in 30 days without breaking your weekly split.',
        targetLabel: `${Math.min(20, history.length)} / 20 Sessions`,
        currentValue: Math.min(20, history.length),
        targetValue: 20,
        unitLabel: 'sessions',
        participantsCount: 2185,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'HABIT STREAK QUEST · PELOTON & GYMSHARK STYLE',
        heroTagline: '20 sessions. 30 days. Zero excuses. Forge an unbreakable gym habit!',
        energeticPitch:
          'Modeled after Peloton’s most popular Monthly Gold Streak challenges and Gymshark’s "66 Days to Change Your Life" habit campaigns, the 20-Session Iron Consistency challenge rewards pure, gritty discipline! Talent means nothing without showing up. Clock in 5 sessions a week across four weeks, lock in your routine, and transform training from a chore into an automatic lifestyle!',
        whyJoinBullets: [
          'Cements automatic neuro-habit pathways by hitting 5 workouts per week',
          'Dramatically accelerates progressive overload and recovery rhythm',
          'Our #1 most-joined community challenge with over 2,100 active lifters',
          'Instant +10 Rank Points boost the moment your 20th session is logged'
        ],
        officialRules: [
          'Each logged workout must last at least 25 minutes or include 8+ completed working sets.',
          'Maximum of 1 qualifying workout session credited per calendar day.',
          'Complete all 20 sessions within the 30-day window to earn +10 Rank Points.'
        ],
        proTips: [
          'Lock in your training time the night before—pack your gym bag and pre-workout in advance.',
          'On low-energy days, never skip entirely: run a focused 35-minute compound session to keep the chain alive.',
          'Use a 4-day Upper/Lower or 5-day Push/Pull/Legs split for optimal recovery between sessions.'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '5-Session Spark', rewardText: 'Week 1 habit locked in—momentum is building' },
          { tier: 'Silver', thresholdPct: 60, title: '12-Session Iron Habit', rewardText: 'Over halfway to an unbreakable monthly routine' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '20-Session Immortal', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_pr_hunter',
        title: 'Progressive Overload PR Hunter',
        subtitle: 'Log at least 5 new Personal Records (weight or rep PRs) on compound lifts.',
        targetLabel: `4 / 5 PRs Hit`,
        currentValue: 4,
        targetValue: 5,
        unitLabel: 'PRs',
        participantsCount: 940,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'STRENGTH BREAKTHROUGH · HEVY PR ARENA',
        heroTagline: 'Shatter your ceilings! Hunt down 5 all-time Personal Records this month!',
        energeticPitch:
          'Built for lifters who refuse to plateau! Inspired by Hevy’s live PR celebration badges and powerbuilding peaking blocks, the Progressive Overload PR Hunter challenge dares you to beat your logbook 5 times in a single month. Whether you add +2.5kg to the bar on Bench Press or squeeze out 1 extra rep on Romanian Deadlifts, every breakthrough counts toward your +10 Rank Points!',
        whyJoinBullets: [
          'Forces intentional progressive overload instead of going through the motions',
          'Both 1RM load increases and rep-max PRs (e.g. 8RM or 10RM) qualify',
          'Triggers automatic PR celebration banners in the Community Feed',
          'Awards +10 Rank Points when you smash your 5th Personal Record'
        ],
        officialRules: [
          'Qualifying PRs include heaviest weight lifted, highest estimated 1RM, or rep PR at a given weight.',
          'Must be logged on compound barbell, dumbbell, or machine movements with strict execution.',
          'Hit 5 verified PRs within the monthly challenge window to claim +10 Rank Points.'
        ],
        proTips: [
          'Use micro-loading (+1.25kg or +2.5kg) on overhead press and bench press for steady weekly PRs.',
          'Track your top set in the 5–8 rep range and aim to beat your previous session by just 1 rep.',
          'Eat a high-carb pre-workout meal 90 minutes before your heavy compound sessions.'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 20, title: 'First Blood PR (1/5)', rewardText: 'First personal record shattered this month' },
          { tier: 'Silver', thresholdPct: 60, title: 'Triple Threat Breaker (3/5)', rewardText: '3 PRs crushed—strength is climbing fast' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '5x PR Apex Predator', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_hypertrophy_10k',
        title: '10,000 Rep Hypertrophy Marathon',
        subtitle: 'Complete 10,000 controlled working reps across all muscle groups this month.',
        targetLabel: `6,450 / 10,000 Reps`,
        currentValue: 6450,
        targetValue: 10000,
        unitLabel: 'reps',
        participantsCount: 1680,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'HIGH-VOLUME PUMP · GYMSHARK LIFTING CLUB DROP',
        heroTagline: 'Chase the ultimate skin-splitting pump across 10,000 mind-muscle reps!',
        energeticPitch:
          'Channeling Golden-Era bodybuilding marathons and Gymshark Lifting Club hypertrophy drops, the 10,000 Rep Hypertrophy Marathon is all about time under tension, deep stretch under load, and skin-splitting pumps! High-rep lateral raises, deep hack squats, cable flyes, and controlled bicep curls all feed the counter as you sculpt 3D muscle bellies and race to 10,000 reps!',
        whyJoinBullets: [
          'Maximizes metabolic stress, cellular swelling, and mind-muscle connection',
          'Perfect for lifters running Push/Pull/Legs, Arnold Split, or Upper/Lower hypertrophy blocks',
          'Rewards high-rep accessory work on delts, arms, calves, and abs',
          'Earn +10 Rank Points and permanent finisher recognition at 10,000 reps'
        ],
        officialRules: [
          'Every completed rep across barbell, dumbbell, cable, machine, and bodyweight sets counts.',
          'Maintain controlled eccentric tempo (2–3 seconds down) with full range of motion.',
          'Reach 10,000 cumulative reps before the challenge timer ends to unlock +10 Rank Points.'
        ],
        proTips: [
          'Superset antagonist muscle groups (e.g., Biceps + Triceps or Chest + Back) to double rep density.',
          'Finish every workout with 3–4 high-rep pump sets (15–20 reps) on lateral delts, calves, or core.',
          'Averaging ~500 reps per workout across 20 sessions gets you across the 10,000-rep finish line!'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '2,500 Rep Pump Igniter', rewardText: 'Hypertrophy engine warmed up and firing' },
          { tier: 'Silver', thresholdPct: 60, title: '6,000 Rep Volume Titan', rewardText: 'Deep into hypertrophy territory—pumps are unreal' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '10,000 Rep Sculpted Legend', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_big3_specialist',
        title: 'Big-3 Compound Specialist',
        subtitle: 'Log 12+ heavy working sets each of Squat, Bench Press, and Deadlift variations.',
        targetLabel: `28 / 36 Compound Sets`,
        currentValue: 28,
        targetValue: 36,
        unitLabel: 'sets',
        participantsCount: 1120,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'POWERBUILDING TRIAL · BARBELL CLUB SERIES',
        heroTagline: 'Respect the iron! Master the Squat, Bench, and Deadlift with 36 heavy sets!',
        energeticPitch:
          'Inspired by classic barbell club showdowns and powerbuilding strength challenges on Hevy and Strong, the Big-3 Compound Specialist challenge brings you back to raw, foundational strength. Log 12 working sets of Squat variations, 12 working sets of Bench Press variations, and 12 working sets of Hinges/Deadlifts this month to build thick, dense power from head to toe!',
        whyJoinBullets: [
          'Builds raw systemic strength across the three king compound movement patterns',
          'Includes variations like Front Squat, Hack Squat, Incline Bench, and Romanian Deadlifts',
          'Sharpens barbell technique, bracing mechanics, and neuromuscular drive',
          'Claim +10 Rank Points when you complete your 36th heavy compound set'
        ],
        officialRules: [
          'Log 36 total heavy working sets across Squat, Bench Press, and Deadlift movement families.',
          'Working sets must be performed at RPE 7.5 or higher (5–10 rep range recommended).',
          'Complete all 36 compound sets within the month to earn +10 Rank Points.'
        ],
        proTips: [
          'Hit 3 working sets of each Big-3 lift once per week (3 sets × 3 lifts × 4 weeks = 36 sets!).',
          'Alternate heavy barbell days with joint-friendly variations like Romanian Deadlifts and Incline DB Press.',
          'Use the built-in Rest Timer (2–3 minutes between heavy compound sets) to maintain peak bar speed.'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '9 Compound Sets Logged', rewardText: 'Week 1 platform foundation complete' },
          { tier: 'Silver', thresholdPct: 60, title: '22 Compound Sets Crushed', rewardText: 'Bar path and bracing locked in' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '36-Set Big-3 Master', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_zero_skip_weeks',
        title: '4-Week Unbroken Split Streak',
        subtitle: 'Hit every scheduled training day in your weekly split for 4 consecutive weeks.',
        targetLabel: `3 / 4 Weeks Completed`,
        currentValue: 3,
        targetValue: 4,
        unitLabel: 'weeks',
        participantsCount: 2540,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'ELITE DISCIPLINE · UNBROKEN CHAIN EVENT',
        heroTagline: 'Four weeks. Zero missed split days. Prove your iron willpower!',
        energeticPitch:
          'Inspired by Strava’s 4-Week Streak badges and Peloton’s Perfect Month accolades, the 4-Week Unbroken Split Streak is where true athletes separate themselves from the pack. Whether your personalized plan is a 3-day Full Body split or a 5-day PPL routine, hit every single scheduled workout for 4 straight weeks without breaking the chain and claim +10 Rank Points!',
        whyJoinBullets: [
          'Adapts fairly to your personal split (3-day, 4-day, 5-day, or 6-day program)',
          'Streak Freeze shields protect your chain if an unexpected recovery day is needed',
          'Over 2,500 community athletes are fighting to keep their 4-week streak alive',
          'Rewards +10 Rank Points and elite bragging rights on the Iron Streak leaderboard'
        ],
        officialRules: [
          'Complete all scheduled workouts in your active weekly split for 4 consecutive weeks.',
          'Planned rest days do not break your streak—only skipped training days count against you.',
          'Finish Week 4 unbroken to unlock +10 Rank Points and the Challenge Conqueror badge.'
        ],
        proTips: [
          'Keep a Streak Freeze Shield in reserve from the Rewards Vault just in case travel or life happens.',
          'Never miss a Monday—starting Week 1–4 with an early Monday session sets the tone for the entire week.',
          'Share your weekly check-in to the Community Feed so your gym buddies hold you accountable!'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: 'Week 1 Unbroken', rewardText: '7 days of 100% split adherence complete' },
          { tier: 'Silver', thresholdPct: 50, title: 'Week 2 Halfway Lock', rewardText: 'Two full microcycles conquered with zero skips' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '4-Week Iron Will Champion', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_upper_body_pump',
        title: 'Upper Body Armor — 150 Working Sets',
        subtitle: 'Complete 150 total working sets across Chest, Back, Shoulders, and Arms this month.',
        targetLabel: `95 / 150 Upper Sets`,
        currentValue: 95,
        targetValue: 150,
        unitLabel: 'sets',
        participantsCount: 860,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'HYPERTROPHY SPECIALIZATION · TORSO BUILDER',
        heroTagline: 'Build a thick, wide V-taper with 150 high-intensity upper body working sets!',
        energeticPitch:
          'Inspired by classic bodybuilding torso specialization blocks on Gymshark Lifting Club and Hevy, Upper Body Armor challenges you to log 150 quality working sets across your pressing, pulling, delt, and arm movements in 30 days. Pack on upper-body density, widen your lats and capped delts, and claim +10 Rank Points when you hit set #150!',
        whyJoinBullets: [
          'Balances horizontal/vertical pressing with heavy rows and vertical pulls',
          'Counts all barbell, dumbbell, cable, and machine upper-body sets',
          'Ideal for Push/Pull/Legs, Arnold Split, or Upper/Lower lifters',
          'Awards +10 Rank Points and Challenge Conqueror recognition at 150 sets'
        ],
        officialRules: [
          'All logged working sets targeting Chest, Back, Shoulders, Biceps, and Triceps count.',
          'Sets must be taken within 1–3 reps of muscular failure (RPE 7–10).',
          'Complete 150 upper-body sets before the monthly timer ends to claim +10 Rank Points.'
        ],
        proTips: [
          'Pair heavy compound presses with high-rep cable rows and face pulls for shoulder health.',
          'Add 3–4 sets of lateral raises twice a week to rapidly accumulate high-value delt volume.',
          'Around 35–40 upper-body sets per week puts you right on pace to finish strong!'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '38 Upper Sets Logged', rewardText: 'Week 1 upper-body pump locked in' },
          { tier: 'Silver', thresholdPct: 60, title: '90 Upper Sets Crushed', rewardText: 'Torso volume compounding fast' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '150-Set Upper Armor Finisher', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_leg_day_warrior',
        title: 'Never Skip Leg Day — 8 Heavy Lower Sessions',
        subtitle: 'Complete 8 dedicated lower-body workouts featuring Squats, Leg Press, or Hinges.',
        targetLabel: `5 / 8 Leg Sessions`,
        currentValue: 5,
        targetValue: 8,
        unitLabel: 'sessions',
        participantsCount: 790,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'LOWER BODY GRIT · IRON WHEELS CHALLENGE',
        heroTagline: 'Separating contenders from champions—8 brutal leg days in 30 days!',
        energeticPitch:
          'Anyone can train chest and biceps on a Friday night, but real athletes build their foundation from the ground up! Modeled after viral "Never Skip Leg Day" community gauntlets on Strava and Hevy, this challenge demands 8 full lower-body sessions in a single month. Step into the squat rack, embrace the burn across quads, hamstrings, and glutes, and earn your +10 Rank Points!',
        whyJoinBullets: [
          'Locks in 2 dedicated lower-body sessions per week for 4 straight weeks',
          'Drives massive systemic hormone and strength carryover to all lifts',
          'Covers Quads, Hamstrings, Glutes, and Calves across compounds & machines',
          'Unlock +10 Rank Points upon logging your 8th verified leg session'
        ],
        officialRules: [
          'Each qualifying leg workout must include at least 10 working sets for lower-body muscles.',
          'Must include at least one primary knee-flexion or hip-hinge compound lift per session.',
          'Complete all 8 lower-body sessions this month to earn +10 Rank Points.'
        ],
        proTips: [
          'Split your 2 weekly leg days into one Quad-focused day and one Hamstring/Glute-focused day.',
          'Log your walking lunges, hack squats, and seated leg curls right after your main barbell lift.',
          'Prioritize 8+ hours of sleep after heavy lower-body sessions for maximal leg growth.'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '2 Leg Days Survived', rewardText: 'First week of lower-body grit complete' },
          { tier: 'Silver', thresholdPct: 60, title: '5 Leg Days Conquered', rewardText: 'Past the halfway mark—wheels are growing' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '8-Session Leg Day Warrior', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_core_conditioning',
        title: 'Iron Core & Conditioning — 12 Finisher Circuits',
        subtitle: 'Tack on 12 core & metabolic conditioning finishers at the end of your lifting sessions.',
        targetLabel: `7 / 12 Finishers`,
        currentValue: 7,
        targetValue: 12,
        unitLabel: 'finishers',
        participantsCount: 640,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'ATHLETIC ENGINE · PELOTON & FUNCTIONAL STYLE',
        heroTagline: 'Bulletproof your midsection and gas tank with 12 post-workout finishers!',
        energeticPitch:
          'Inspired by Peloton Strength+ core blocks and functional conditioning challenges, the Iron Core & Conditioning challenge turns the final 10 minutes of your workout into a furnace! Add a 3-times-a-week ab and conditioning finisher—hanging leg raises, cable crunches, planks, or sled pushes—to forge rock-solid trunk stability that boosts your Squat and Deadlift while earning +10 Rank Points!',
        whyJoinBullets: [
          'Strengthens intra-abdominal bracing for heavier, safer compound lifts',
          'Takes just 8–10 focused minutes at the end of 3 workouts per week',
          'Improves work capacity and inter-set recovery speed',
          'Claim +10 Rank Points when you complete your 12th finisher session'
        ],
        officialRules: [
          'Log at least 3 working sets of direct Core/Abdominal or Conditioning work in a workout.',
          'Up to 3 qualifying finisher sessions per week count toward the 12-session goal.',
          'Complete all 12 finishers within the month to unlock +10 Rank Points.'
        ],
        proTips: [
          'Treat abs like any other muscle group: use progressive overload on Cable Crunches and Hanging Leg Raises.',
          'Superset an upper-ab movement with a lower-ab movement to finish in under 8 minutes.',
          'Exhale fully at peak contraction on every rep for maximum rectus abdominis recruitment.'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '3 Finishers Logged', rewardText: 'Week 1 core stability ignited' },
          { tier: 'Silver', thresholdPct: 60, title: '7 Finishers Crushed', rewardText: 'Midsection bracing noticeably stronger' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '12-Finisher Iron Core Master', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_calisthenics_mastery',
        title: 'Calisthenics & Bodyweight Control — 300 Pull-Ups & Dips',
        subtitle: 'Accumulate 300 total reps of Pull-Ups, Chin-Ups, and Parallel Bar Dips this month.',
        targetLabel: `185 / 300 Bodyweight Reps`,
        currentValue: 185,
        targetValue: 300,
        unitLabel: 'reps',
        participantsCount: 580,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'RELATIVE STRENGTH · NIKE TRAINING CLUB & CALISTHENICS STYLE',
        heroTagline: 'Master your own bodyweight with 300 strict Pull-Ups, Chin-Ups, and Dips!',
        energeticPitch:
          'Inspired by Nike Training Club (NTC) bodyweight mastery collections and global street-workout calisthenics showdowns, this challenge tests your true pound-for-pound relative strength! Whether you perform weighted pull-ups, strict bodyweight chin-ups, or deep chest dips on parallel bars, stack up 300 total reps in 30 days and claim +10 Rank Points!',
        whyJoinBullets: [
          'Builds elite pound-for-pound upper-body pulling and pushing mastery',
          'Counts strict bodyweight, weighted, and band-assisted Pull-Ups, Chin-Ups, and Dips',
          'Decompresses the spine while sculpting wide lats and horseshoe triceps',
          'Awards +10 Rank Points upon hitting your 300th cumulative rep'
        ],
        officialRules: [
          'All logged reps of Pull-Ups, Chin-Ups, Neutral-Grip Pull-Ups, and Parallel Bar Dips count.',
          'Full range of motion required: dead hang to chin-over-bar on pulls, 90° elbow flexion on dips.',
          'Reach 300 cumulative reps within the monthly window to claim +10 Rank Points.'
        ],
        proTips: [
          'Do "Grease the Groove" sets of 5–8 strict pull-ups between warm-up sets on every upper-body day.',
          'Superset Pull-Ups and Parallel Bar Dips at the end of your workout for a massive upper-body pump.',
          'Just 15 total reps across 20 workouts (or 25 reps across 12 workouts) gets you to 300!'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '75 Bodyweight Reps', rewardText: 'Grip strength and scapular control locked in' },
          { tier: 'Silver', thresholdPct: 60, title: '180 Rep Bar Specialist', rewardText: 'Relative strength climbing rapidly' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '300-Rep Calisthenics Master', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_early_bird_grind',
        title: '5 AM Dawn Patrol — 10 Morning Sessions',
        subtitle: 'Complete 10 focused gym workouts before 9:00 AM to win the morning.',
        targetLabel: `6 / 10 Morning Workouts`,
        currentValue: 6,
        targetValue: 10,
        unitLabel: 'sessions',
        participantsCount: 520,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'MORNING DISCIPLINE · GARMIN & PELOTON DAWN PATROL',
        heroTagline: 'Beat the sunrise! Crush 10 early-morning lifting sessions before the world wakes up!',
        energeticPitch:
          'Modeled after Garmin Connect’s coveted "Early Riser" badges and Peloton’s legendary Dawn Patrol crew, the 5 AM Dawn Patrol challenge is for lifters who get their iron work done before most people hit snooze! Eliminate evening schedule excuses, flood your brain with morning endorphins, log 10 morning sessions this month, and earn +10 Rank Points!',
        whyJoinBullets: [
          'Zero evening distractions or crowded squat racks during early morning hours',
          'Spikes morning dopamine, mental clarity, and metabolic rate for the entire day',
          'Requires just 2–3 morning workouts per week across the month',
          'Unlocks +10 Rank Points and Dawn Patrol finisher status at 10 sessions'
        ],
        officialRules: [
          'Qualifying workouts must be started and logged before 9:00 AM local time.',
          'Minimum session duration of 25 minutes or 8+ completed working sets.',
          'Complete 10 morning sessions within the month to claim +10 Rank Points.'
        ],
        proTips: [
          'Lay out your training clothes, lifting belt, and shaker bottle the night before.',
          'Drink 500ml of water with electrolytes immediately upon waking before touching the barbell.',
          'Add 2 extra minutes of dynamic warm-up sets to lubricate joints for early-morning heavy lifts.'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 30, title: '3 Sunrise Sessions', rewardText: 'Early-bird circadian rhythm activated' },
          { tier: 'Silver', thresholdPct: 60, title: '6 Dawn Patrol Check-Ins', rewardText: 'Morning training is now second nature' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '10x Dawn Patrol Commander', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_posterior_chain',
        title: 'Posterior Chain Powerhouse — 80 Back & Hamstring Sets',
        subtitle: 'Complete 80 working sets targeting Back, Traps, Glutes, and Hamstrings this month.',
        targetLabel: `52 / 80 Posterior Sets`,
        currentValue: 52,
        targetValue: 80,
        unitLabel: 'sets',
        participantsCount: 490,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'STRUCTURAL BALANCE · HEVY & STRONG PULL SERIES',
        heroTagline: 'Build a thick back, powerful glutes, and steel hamstrings with 80 posterior sets!',
        energeticPitch:
          'Most lifters over-train the "mirror muscles" in front and neglect the engine in the back! Inspired by structural-balance challenges on Hevy and Strong, Posterior Chain Powerhouse dares you to log 80 high-effort working sets across Barbell Rows, Lat Pulldowns, Romanian Deadlifts, Hip Thrusts, and Leg Curls. Bulletproof your spine and posture while earning +10 Rank Points!',
        whyJoinBullets: [
          'Corrects rounded shoulders and anterior dominance from desk work and heavy pressing',
          'Builds 3D back thickness, lower-back resilience, and explosive hip extension',
          'Includes all Back, Rear Delt, Glute, and Hamstring compound and machine sets',
          'Awards +10 Rank Points when you complete your 80th posterior-chain working set'
        ],
        officialRules: [
          'All working sets targeting Back, Lats, Traps, Rear Delts, Glutes, and Hamstrings qualify.',
          'Maintain strict torso control without excessive momentum on rows and hinges.',
          'Complete 80 posterior-chain sets this month to unlock +10 Rank Points.'
        ],
        proTips: [
          'Aim for a 1.5-to-1 pulling-to-pressing ratio in your weekly upper-body programming.',
          'Pause for 1 full second at peak contraction on seated cable rows, face pulls, and leg curls.',
          '20 posterior sets per week (e.g., 12 Back sets + 8 Hamstring/Glute sets) hits 80 right on schedule!'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '20 Posterior Sets', rewardText: 'Pulling and hinge mechanics locked in' },
          { tier: 'Silver', thresholdPct: 60, title: '48 Posterior Sets', rewardText: 'Noticeably thicker upper back and stronger hinges' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '80-Set Posterior Powerhouse', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_time_under_tension',
        title: '1,000 Active Training Minutes Club',
        subtitle: 'Accumulate 1,000 total minutes of logged gym training time across the month.',
        targetLabel: `680 / 1,000 Minutes`,
        currentValue: 680,
        targetValue: 1000,
        unitLabel: 'mins',
        participantsCount: 450,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'ENDURANCE & GRIT · PELOTON ACTIVE MINUTES STYLE',
        heroTagline: 'Clock in 1,000 focused minutes under the iron this month!',
        energeticPitch:
          'Directly inspired by Peloton’s flagship Active Minutes challenges and Garmin’s Monthly Intensity Minutes badges, the 1,000 Active Training Minutes Club rewards total time invested in your craft! Every minute you spend warming up, lifting heavy, resting with intent, and stretching in the Workout Logger adds to your monthly clock. Cross the 1,000-minute mark and claim +10 Rank Points!',
        whyJoinBullets: [
          'Rewards complete, unhurried workouts including proper warm-ups and accessory work',
          'Works seamlessly across strength, hypertrophy, and conditioning sessions',
          'Just ~250 minutes per week (e.g., five 50-minute sessions) completes the challenge',
          'Earn +10 Rank Points and the 1,000-Minute Club finisher accolade'
        ],
        officialRules: [
          'All active workout durations logged in the app count toward your 1,000-minute goal.',
          'Individual sessions are capped at 120 credited minutes to prevent idle timer inflation.',
          'Reach 1,000 total minutes before month-end to earn +10 Rank Points.'
        ],
        proTips: [
          'Five 50-minute workouts per week (or four 65-minute workouts) puts you over 1,000 minutes easily.',
          'Include a 5-minute dynamic warm-up and a 5-minute post-lift mobility cooldown on every session.',
          'Keep rest periods structured with the Rest Timer so every minute in the gym is productive.'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '250 Minutes Logged', rewardText: 'Over 4 hours of focused iron work complete' },
          { tier: 'Silver', thresholdPct: 60, title: '600 Minutes Crushed', rewardText: '10 full hours of training in the bank' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '1,000-Minute Iron Clock Finisher', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_unilateral_symmetry',
        title: 'Unilateral Symmetry & Stabilizer — 60 Single-Limb Sets',
        subtitle: 'Log 60 working sets of single-arm or single-leg exercises to erase imbalances.',
        targetLabel: `36 / 60 Unilateral Sets`,
        currentValue: 36,
        targetValue: 60,
        unitLabel: 'sets',
        participantsCount: 410,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'SYMMETRY & PREHAB · ATHLETIC PERFORMANCE SERIES',
        heroTagline: 'Fix left-to-right imbalances with 60 brutal unilateral working sets!',
        energeticPitch:
          'Inspired by pro athletic prehab protocols on Nike Training Club and bodybuilding symmetry blocks, this challenge shines a spotlight on single-limb mastery! Bulgarian Split Squats, Single-Arm Dumbbell Rows, Walking Lunges, Single-Arm Cable Lateral Raises, and Concentration Curls expose weak links, fire up hip and shoulder stabilizers, and earn you +10 Rank Points!',
        whyJoinBullets: [
          'Eliminates left-vs-right strength asymmetries that stall barbell PRs',
          'Recruits deep hip, core, and rotator-cuff stabilizer muscles',
          'Includes all dumbbell, cable, and machine single-arm or single-leg exercises',
          'Claim +10 Rank Points upon completing your 60th unilateral set'
        ],
        officialRules: [
          'Qualifying sets must be unilateral (each limb works independently via dumbbells, cables, or split stances).',
          'Always start each set with your weaker side and match the exact reps on your stronger side.',
          'Complete 60 unilateral sets this month to earn +10 Rank Points.'
        ],
        proTips: [
          'Swap one bilateral accessory movement per workout for a unilateral variation (e.g., Bulgarian Split Squats).',
          'Use straps on heavy Single-Arm Dumbbell Rows so grip never limits your lat contraction.',
          'Logging just 3–4 unilateral sets across 16 workouts gets you to 60 sets!'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '15 Unilateral Sets', rewardText: 'Left-to-right stabilizer activation underway' },
          { tier: 'Silver', thresholdPct: 60, title: '36 Unilateral Sets', rewardText: 'Noticeable balance and bilateral carryover' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '60-Set Symmetry Specialist', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      },
      {
        id: 'chal_mobility_recovery',
        title: 'Active Recovery & Mobility Flow — 12 Post-Lift Sessions',
        subtitle: 'Complete 12 dedicated warm-up mobility or post-workout decompression flows.',
        targetLabel: `8 / 12 Mobility Flows`,
        currentValue: 8,
        targetValue: 12,
        unitLabel: 'flows',
        participantsCount: 375,
        daysLeft: 12,
        rewardPts: 10,
        categoryBadge: 'LONGEVITY & RECOVERY · GARMIN & NTC MOBILITY',
        heroTagline: 'Train hard, recover smarter! Log 12 mobility & joint-longevity flows!',
        energeticPitch:
          'Inspired by Garmin Connect’s Body Battery recovery challenges and Peloton & Nike Training Club restorative mobility series, this challenge proves that recovery is where growth actually happens! Dedicate 10 minutes three times a week to thoracic spine openers, hip 90/90 stretches, ankle dorsiflexion work, and shoulder dislocations to unlock deeper squat depth and pain-free pressing—plus +10 Rank Points!',
        whyJoinBullets: [
          'Unlocks deeper squat depth, smoother overhead mobility, and healthier joints',
          'Reduces Delayed Onset Muscle Soreness (DOMS) between heavy training days',
          'Takes just 3 mobility check-ins per week alongside your regular split',
          'Awards +10 Rank Points when you complete your 12th recovery flow'
        ],
        officialRules: [
          'Complete at least 8–10 minutes of targeted mobility, foam rolling, or static decompression stretching.',
          'Can be logged as a post-workout cooldown or a standalone active recovery day session.',
          'Finish all 12 flows within the month to claim +10 Rank Points.'
        ],
        proTips: [
          'Pair thoracic extensions and band pull-aparts before Bench/Overhead days, and 90/90 hip openers before Squat days.',
          'Hold post-workout static stretches for 45–60 seconds with slow nasal breathing to shift into parasympathetic recovery.',
          'Dead hangs from a pull-up bar for 60 seconds after deadlifts feel amazing for spinal decompression!'
        ],
        milestones: [
          { tier: 'Bronze', thresholdPct: 25, title: '3 Mobility Flows', rewardText: 'Joint range of motion opening up' },
          { tier: 'Silver', thresholdPct: 60, title: '7 Mobility Flows', rewardText: 'Faster recovery between heavy compound days' },
          { tier: 'Gold Finisher', thresholdPct: 100, title: '12-Flow Longevity Athlete', rewardText: '+10 Rank Points & Challenge Conqueror Badge' }
        ]
      }
    ];
  }, [unit]);

  const isProMember = Boolean(subscription?.isPro || (subscription?.plan && subscription.plan !== 'free'));
  const FREE_CHALLENGE_LIMIT = 3;

  const handleToggleChallenge = (challengeId: string, title: string) => {
    setJoinedChallengeIds(prev => {
      const exists = prev.includes(challengeId);
      if (exists) {
        showToast(`Left "${title}"`);
        return prev.filter(id => id !== challengeId);
      } else {
        if (!isProMember && prev.length >= FREE_CHALLENGE_LIMIT) {
          showToast(`Free members can join up to 3 challenges. Upgrade to Pro for unlimited challenges! 👑`);
          if (onOpenProModal) {
            onOpenProModal();
          }
          return prev;
        }
        showToast(`Joined "${title}"! Complete the challenge to earn +10 Rank Points!`);
        return [...prev, challengeId];
      }
    });
  };

  const handleCompleteChallenge = (challenge: CommunityChallengeItem) => {
    if (!joinedChallengeIds.includes(challenge.id)) {
      setJoinedChallengeIds(prev => [...prev, challenge.id]);
    }
    if (!completedChallengeIds.includes(challenge.id)) {
      const nextCompleted = [...completedChallengeIds, challenge.id];
      setCompletedChallengeIds(nextCompleted);
      try {
        localStorage.setItem('gympax_completed_challenges_v1', JSON.stringify(nextCompleted));
      } catch {
        // ignore
      }
    }
    const rewardRes = awardChallengeCompleted(challenge.id, challenge.title);
    if (onUpdateRewardsProfile) {
      onUpdateRewardsProfile(rewardRes.profile);
    }
    showToast(rewardRes.message);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-3 text-zinc-100 font-sans">
      {/* ===================================================================== */}
      {/* SOCIAL OPTIONS SCROLLER BAR (Visible on all social pages under Social) */}
      {/* ===================================================================== */}
      <div className="max-w-3xl mx-auto w-full">
        {(() => {
          const isOwnUser = (a: NearbyAthlete) =>
            a.id === 'ath_current_user' ||
            a.id === 'u_me' ||
            (userProfile?.name && a.name?.trim().toLowerCase() === userProfile.name.trim().toLowerCase());

          const incomingRequests = athletes.filter(
            a => a.connectionStatus === 'incoming_request' && !isOwnUser(a)
          );
          const incomingCount = incomingRequests.length;
          const visibleRequests = incomingRequests.slice(0, visibleRequestsCount);
          const hasMoreRequests = incomingCount > visibleRequestsCount;
          const canShowLessRequests = visibleRequestsCount > 3;
          return (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-[#F6721D]/80 space-y-3 shadow-xs">
              {/* Social Options Scrollable Bar with Left & Right Scroll Controls */}
              <div className="flex items-center gap-1.5 w-full">
                {/* Left Scroll Chevron */}
                <button
                  type="button"
                  onClick={() => handleScrollSocialOptions('left')}
                  title="Scroll social options left"
                  aria-label="Scroll social options left"
                  className="p-1.5 rounded-xl bg-zinc-950/90 hover:bg-zinc-800 text-zinc-400 hover:text-[#F6721D] border border-zinc-800 transition-colors cursor-pointer shrink-0 shadow-xs active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Horizontal Scrollable Bar Track with center snapping */}
                <div
                  ref={socialOptionsScrollRef}
                  className="flex-1 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-1 px-[28%] sm:px-[35%] text-xs select-none snap-x snap-proximity scroll-px-[28%] sm:scroll-px-[35%]"
                >
                  {/* 0. Feed / All Workouts */}
                  <button
                    type="button"
                    data-option="feed"
                    data-active={socialTab === 'feed' && feedFilter === 'all' && activeSocialOption === null}
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      centerSocialButton(btn);
                      setSocialTab('feed');
                      setFeedFilter('all');
                      setActiveSocialOption(null);
                      setShowFeedRequests(false);
                      showToast('Viewing community workouts');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap snap-center active:opacity-85 ${
                      socialTab === 'feed' && feedFilter === 'all' && activeSocialOption === null
                        ? 'bg-[#F6721D]/20 text-[#F6721D] border border-[#F6721D]/70 shadow-xs ring-1 ring-[#F6721D]/40'
                        : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>Workouts</span>
                  </button>

                  {/* 1. Requests Received */}
                  <button
                    type="button"
                    data-option="requests"
                    data-active={activeSocialOption === 'requests'}
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      centerSocialButton(btn);
                      const isCurrentlyActive = activeSocialOption === 'requests';
                      if (isCurrentlyActive) {
                        setActiveSocialOption(null);
                        setShowFeedRequests(false);
                      } else {
                        setSocialTab('feed');
                        setActiveSocialOption('requests');
                        setShowFeedRequests(true);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap snap-center active:opacity-85 ${
                      activeSocialOption === 'requests'
                        ? 'bg-[#F6721D]/20 text-[#F6721D] border border-[#F6721D]/70 shadow-xs ring-1 ring-[#F6721D]/40'
                        : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>Requests</span>
                  </button>

                  {/* 2. Search / Nearby Athletes */}
                  <button
                    type="button"
                    data-option="nearby"
                    data-active={socialTab === 'discover' || activeSocialOption === 'nearby'}
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      centerSocialButton(btn);
                      setSocialTab('discover');
                      setActiveSocialOption(null);
                      setShowFeedRequests(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap snap-center active:opacity-85 ${
                      socialTab === 'discover' || activeSocialOption === 'nearby'
                        ? 'bg-[#F6721D]/20 text-[#F6721D] border border-[#F6721D]/70 shadow-xs ring-1 ring-[#F6721D]/40'
                        : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>Search</span>
                  </button>

                  {/* 3. Suggested Matches */}
                  <button
                    type="button"
                    data-option="suggested"
                    data-active={activeSocialOption === 'suggested'}
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      centerSocialButton(btn);
                      setSocialTab('feed');
                      setShowFeedRequests(false);
                      setActiveSocialOption(prev => prev === 'suggested' ? null : 'suggested');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap snap-center active:opacity-85 ${
                      activeSocialOption === 'suggested'
                        ? 'bg-[#F6721D]/20 text-[#F6721D] border border-[#F6721D]/70 shadow-xs ring-1 ring-[#F6721D]/40'
                        : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>Suggested Matches</span>
                  </button>

                  {/* 4. Challenges & Streaks */}
                  <button
                    type="button"
                    data-option="challenges"
                    data-active={socialTab === 'challenges' || activeSocialOption === 'challenges'}
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      centerSocialButton(btn);
                      setSocialTab('challenges');
                      setActiveSocialOption(null);
                      setShowFeedRequests(false);
                      showToast('Viewing monthly challenges');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap snap-center active:opacity-85 ${
                      socialTab === 'challenges' || activeSocialOption === 'challenges'
                        ? 'bg-[#F6721D]/20 text-[#F6721D] border border-[#F6721D]/70 shadow-xs ring-1 ring-[#F6721D]/40'
                        : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>Challenges & Streaks</span>
                  </button>

                  {/* 5. Leaderboards & Ranks */}
                  <button
                    type="button"
                    data-option="leaderboards"
                    data-active={socialTab === 'leaderboards' || activeSocialOption === 'leaderboards'}
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      centerSocialButton(btn);
                      setSocialTab('leaderboards');
                      setActiveSocialOption(null);
                      setShowFeedRequests(false);
                      showToast('Viewing community rankings & leaderboards');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap snap-center active:opacity-85 ${
                      socialTab === 'leaderboards' || activeSocialOption === 'leaderboards'
                        ? 'bg-[#F6721D]/20 text-[#F6721D] border border-[#F6721D]/70 shadow-xs ring-1 ring-[#F6721D]/40'
                        : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>Leaderboards</span>
                  </button>

                  {/* 8. Physique Photos */}
                  <button
                    type="button"
                    data-option="photos"
                    data-active={socialTab === 'photos'}
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      centerSocialButton(btn);
                      setSocialTab('photos');
                      setActiveSocialOption(null);
                      setShowFeedRequests(false);
                      showToast('Opened Community Physique & Gym Photos');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap snap-center active:opacity-85 ${
                      socialTab === 'photos'
                        ? 'bg-[#F6721D]/20 text-[#F6721D] border border-[#F6721D]/70 shadow-xs ring-1 ring-[#F6721D]/40'
                        : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>Physique Photos</span>
                  </button>
                </div>

                {/* Right Scroll Chevron */}
                <button
                  type="button"
                  onClick={() => handleScrollSocialOptions('right')}
                  title="Scroll social options right"
                  aria-label="Scroll social options right"
                  className="p-1.5 rounded-xl bg-zinc-950/90 hover:bg-zinc-800 text-zinc-400 hover:text-[#F6721D] border border-zinc-800 transition-colors cursor-pointer shrink-0 shadow-xs active:scale-95"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ===================================================================== */}
              {/* ACTIVE SOCIAL OPTION CARDS (Moved UP, on top of Requests received)    */}
              {/* ===================================================================== */}

              {/* Panel: Suggested Matches */}
              {activeSocialOption === 'suggested' && (
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-[#F6721D]/50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#F6721D]" />
                      <h4 className="text-xs font-bold text-zinc-100">AI Suggested Matches for Your Level</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRefreshSuggested}
                        title="Refresh suggestions"
                        className="text-[11px] font-bold text-[#F6721D] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSocialOption(null)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        title="Close Suggested Matches"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {suggestedConnections
                      .filter(item => item.athlete.connectionStatus !== 'connected' && !isOwnUser(item.athlete))
                      .slice(0, 6)
                      .map(item => {
                        const athlete = item.athlete;
                        const isPending = athlete.connectionStatus === 'pending';
                        return (
                          <div
                            key={athlete.id}
                            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-1.5 hover:border-[#F6721D]/60 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div
                                onClick={() => setInspectAthlete(athlete)}
                                className="flex items-center gap-2 min-w-0 cursor-pointer group"
                              >
                                <GymAvatar
                                  avatarType={athlete.avatarType}
                                  avatarUrl={athlete.avatarUrl}
                                  avatarId={athlete.avatarId || athlete.id}
                                  name={athlete.name}
                                  size="sm"
                                  fallbackInitials={athlete.name.substring(0, 2).toUpperCase()}
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-zinc-100 group-hover:text-[#F6721D] transition-colors truncate block">
                                    {athlete.name}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 block font-mono truncate">
                                    {athlete.level} · {athlete.streakDays}d streak
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleConnection(athlete.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                                  isPending
                                    ? 'bg-zinc-800 text-zinc-400'
                                    : 'bg-[#F6721D] hover:bg-[#F6721D]/90 text-zinc-950'
                                }`}
                              >
                                {isPending ? 'Pending' : 'Connect'}
                              </button>
                            </div>
                            <div className="text-[10px] text-orange-200/90 bg-orange-950/40 border border-orange-500/20 px-2 py-0.5 rounded-md truncate">
                              {item.reason || 'Matches your training split'}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Panel: Nearby Athletes Quick Connect */}
              {activeSocialOption === 'nearby' && (
                <div className="p-3 sm:p-4 rounded-xl bg-zinc-950/80 border border-[#F6721D]/50 space-y-3.5 animate-in fade-in">
                  <div className="flex flex-col gap-3 pb-3 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#F6721D]" />
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-100">Nearby Gym Lifters & Athletes</h4>
                        <span className="text-[10px] font-mono text-zinc-500">({filteredNearbyPanelAthletes.length} found)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSocialTab('discover');
                            setActiveSocialOption(null);
                          }}
                          className="text-[11px] font-bold text-[#F6721D] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Full Map</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSocialOption(null)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer"
                          title="Close Nearby Athletes"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Nearby Athletes Scope Tabs (Worldwide, Country, My location) */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1">
                        {(
                          [
                            { id: 'worldwide', label: 'Worldwide' },
                            { id: 'country', label: 'Country' },
                            { id: 'city', label: 'My location' }
                          ] as const
                        ).map(tab => {
                          const isActive = nearbyScope === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={e => {
                                e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                setNearbyScope(tab.id);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-xs snap-center snap-always ${
                                isActive
                                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                              }`}
                            >
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Country Controls (Matching Community Leaderboards) */}
                    {nearbyScope === 'country' && (
                      <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 animate-in fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                            <Flag className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Country Athletes:</span>
                            <span className="text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                              {selectedNearbyCountry}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {filteredNearbyPanelAthletes.length} lifters in {selectedNearbyCountry}
                          </span>
                        </div>

                        {/* Type in Country & Select from Dropdown of All World Countries */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          {/* 1. Type in the country (Search input with live autocomplete dropdown) */}
                          <div className="relative flex-1" ref={nearbyCountryInputContainerRef}>
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                placeholder="Type country name (e.g. United States, Japan, France, Brazil)..."
                                value={nearbyCountrySearchInput}
                                onChange={e => {
                                  setNearbyCountrySearchInput(e.target.value);
                                  setIsNearbyCountryDropdownOpen(true);
                                  const found = ALL_WORLD_COUNTRIES.find(
                                    c => c.toLowerCase() === e.target.value.toLowerCase().trim()
                                  );
                                  if (found) {
                                    setSelectedNearbyCountry(found);
                                  }
                                }}
                                onFocus={() => setIsNearbyCountryDropdownOpen(true)}
                                className="w-full pl-9 pr-8 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/80 transition-colors"
                              />
                              {nearbyCountrySearchInput && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNearbyCountrySearchInput('');
                                    setIsNearbyCountryDropdownOpen(false);
                                  }}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Autocomplete popup listing matching countries */}
                            {isNearbyCountryDropdownOpen && (
                              <div className="absolute left-0 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1 z-50 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95">
                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 mb-1 flex items-center justify-between">
                                  <span>Countries in the World ({filteredNearbyWorldCountries.length})</span>
                                  <span className="text-[9px] text-zinc-500 font-normal">Click to select</span>
                                </div>
                                {filteredNearbyWorldCountries.length === 0 ? (
                                  <div className="px-3 py-3 text-center text-xs text-zinc-500">
                                    No country matched &ldquo;{nearbyCountrySearchInput}&rdquo;
                                  </div>
                                ) : (
                                  filteredNearbyWorldCountries.map(c => {
                                    const isSelected = selectedNearbyCountry.toLowerCase() === c.toLowerCase();
                                    return (
                                      <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                          setSelectedNearbyCountry(c);
                                          setNearbyCountrySearchInput('');
                                          setIsNearbyCountryDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                                          isSelected
                                            ? 'bg-amber-400 text-zinc-950 font-bold'
                                            : 'text-zinc-200 hover:bg-zinc-800'
                                        }`}
                                      >
                                        <span>{c}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>

                          {/* 2. Select from dropdown list, listing all countries in the world */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-zinc-400 whitespace-nowrap">or choose:</span>
                            <div className="relative">
                              <select
                                value={selectedNearbyCountry}
                                onChange={e => {
                                  setSelectedNearbyCountry(e.target.value);
                                  setNearbyCountrySearchInput('');
                                  setIsNearbyCountryDropdownOpen(false);
                                }}
                                className="appearance-none pl-3 pr-8 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 font-medium cursor-pointer focus:outline-none focus:border-amber-400/80 transition-colors"
                                title="Select from dropdown list of all countries in the world"
                              >
                                {ALL_WORLD_COUNTRIES.map(country => (
                                  <option key={country} value={country} className="bg-zinc-900 text-zinc-100">
                                    {country}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* My Location / Radius Controls (Matching Community Leaderboards) */}
                    {nearbyScope === 'city' && (
                      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-amber-500/30 animate-in fade-in">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-amber-400" />
                            <span>Distance Radius:</span>
                          </span>
                          <div className="flex items-center gap-1">
                            {([5, 10, 25, 50] as const).map(r => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setNearbyRadius(r)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                                  nearbyRadius === r
                                    ? 'bg-amber-400 text-zinc-950 shadow-xs'
                                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                                }`}
                              >
                                {r}{nearbyDistanceUnit === 'km' ? 'km' : 'mi'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-zinc-400">Unit:</span>
                            <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
                              <button
                                type="button"
                                onClick={() => setNearbyDistanceUnit('km')}
                                className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                                  nearbyDistanceUnit === 'km'
                                    ? 'bg-amber-400 text-zinc-950 font-bold'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                km
                              </button>
                              <button
                                type="button"
                                onClick={() => setNearbyDistanceUnit('mi')}
                                className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                                  nearbyDistanceUnit === 'mi'
                                    ? 'bg-amber-400 text-zinc-950 font-bold'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                mile
                              </button>
                            </div>
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {filteredNearbyPanelAthletes.length} lifters
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {filteredNearbyPanelAthletes.length === 0 ? (
                    <div className="py-6 text-center text-zinc-500 text-xs bg-zinc-900/50 rounded-xl border border-zinc-800/80 p-4">
                      <MapPin className="w-6 h-6 text-zinc-600 mx-auto mb-1.5 opacity-60" />
                      <p className="font-semibold text-zinc-300">No lifters found in this range</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Try expanding the distance radius or switching to Worldwide / Country.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {filteredNearbyPanelAthletes.slice(0, 6).map(athlete => {
                        const displayDist = nearbyDistanceUnit === 'mi'
                          ? `${athlete.distanceMiles} mi`
                          : `${Math.round(athlete.distanceMiles * 1.60934 * 10) / 10} km`;
                        const isConnected = athlete.connectionStatus === 'connected';
                        const isPending = athlete.connectionStatus === 'pending';
                        return (
                          <div
                            key={athlete.id}
                            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between gap-2 hover:border-[#F6721D]/60 transition-colors"
                          >
                            <div
                              onClick={() => setInspectAthlete(athlete)}
                              className="flex items-center gap-2 min-w-0 cursor-pointer group"
                            >
                              <GymAvatar
                                avatarType={athlete.avatarType}
                                avatarUrl={athlete.avatarUrl}
                                avatarId={athlete.avatarId || athlete.id}
                                name={athlete.name}
                                size="sm"
                                fallbackInitials={athlete.name.substring(0, 2).toUpperCase()}
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-zinc-100 group-hover:text-[#F6721D] transition-colors truncate block">
                                  {athlete.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 block truncate font-mono">
                                  {nearbyScope === 'country' ? `${athlete.country} · ${athlete.level}` : `${displayDist} · ${athlete.level}`}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleConnection(athlete.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                                isConnected
                                  ? 'bg-zinc-800 text-[#F6721D] border border-[#F6721D]/40'
                                  : isPending
                                  ? 'bg-zinc-800 text-zinc-400'
                                  : 'bg-[#F6721D] hover:bg-[#F6721D]/90 text-zinc-950'
                              }`}
                            >
                              {isConnected ? 'Connected' : isPending ? 'Pending' : 'Connect'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Panel: Active Community Challenges */}
              {activeSocialOption === 'challenges' && (
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-amber-500/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-zinc-100">Active Community Challenges</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSocialTab('challenges')}
                        className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Challenges Hub</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSocialOption(null)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        title="Close Challenges"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {monthlyChallenges.slice(0, 3).map(challenge => {
                      const isJoined = joinedChallengeIds.includes(challenge.id);
                      const pct = Math.min(100, Math.round((challenge.currentValue / Math.max(1, challenge.targetValue)) * 100));
                      return (
                        <div
                          key={challenge.id}
                          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-2 hover:border-amber-400/50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-amber-400 font-mono">
                              +{challenge.rewardPts} PTS
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {challenge.daysLeft}d left
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-zinc-100 line-clamp-1">
                            {challenge.title}
                          </h5>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                              <span>Progress</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 transition-all rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleChallenge(challenge.id, challenge.title)}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isJoined
                                ? 'bg-zinc-800 text-amber-300 border border-amber-400/40'
                                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                            }`}
                          >
                            {isJoined ? 'Joined ✓' : 'Join Challenge'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Panel: Top Ranks / Leaderboard preview */}
              {activeSocialOption === 'leaderboards' && (
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-yellow-500/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-xs font-bold text-zinc-100">Top Community Lifters & Ranks</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSocialTab('leaderboards')}
                        className="text-[11px] font-bold text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Full Rankings</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSocialOption(null)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        title="Close Leaderboards"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {leaderboardEntries.slice(0, 3).map((item, idx: number) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2.5"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-zinc-950' : idx === 1 ? 'bg-zinc-300 text-zinc-950' : 'bg-amber-700 text-zinc-100'
                        }`}>
                          #{idx + 1}
                        </div>
                        <GymAvatar
                          avatarUrl={item.avatarUrl}
                          avatarId={item.id}
                          name={item.name}
                          size="sm"
                          fallbackInitials={item.name.substring(0, 2).toUpperCase()}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-zinc-100 truncate block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono truncate block">
                            {item.city}, {item.country}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* REQUESTS RECEIVED CARD (Below the active option card)                  */}
              {/* ===================================================================== */}
              {showFeedRequests && incomingRequests.length > 0 && (
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                      <span>Requests Received</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                        {incomingCount}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeedRequests(false);
                        setActiveSocialOption(null);
                      }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer"
                      title="Hide requests"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {visibleRequests.map(athlete => {
                    const isLevelMatch = athlete.level
                      .toLowerCase()
                      .includes(userLevel.toLowerCase());
                    const isExpanded = !!expandedRequestIds[athlete.id];
                    const toggleExpand = () => {
                      setExpandedRequestIds(prev => ({
                        ...prev,
                        [athlete.id]: !isExpanded
                      }));
                    };

                    const displayDist =
                      distanceUnit === 'mi'
                        ? `${athlete.distanceMiles} mi`
                        : `${Math.round(athlete.distanceMiles * 1.60934 * 10) / 10} km`;

                    return (
                      <article
                        key={athlete.id}
                        className="px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-2 shadow-xs"
                      >
                        {/* 1. CARD HEADER: Avatar, Name, Metadata, Connect Actions & Expand/Collapse */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            onClick={() => setInspectAthlete(athlete)}
                            className="flex items-center gap-2.5 cursor-pointer group min-w-0"
                            title={`View ${athlete.name}'s profile`}
                          >
                            <GymAvatar
                              avatarType={athlete.avatarType}
                              avatarUrl={athlete.avatarUrl}
                              avatarId={athlete.avatarId || athlete.id || athlete.avatarSeed}
                              name={athlete.name}
                              size="sm"
                              fallbackInitials={athlete.name
                                .substring(0, 2)
                                .toUpperCase()}
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 leading-tight whitespace-nowrap truncate">
                                <span className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                                  {athlete.name}
                                </span>
                                {athlete.uniqueId && (
                                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                                    #{athlete.uniqueId}
                                  </span>
                                )}
                              </div>

                              {/* Single line of text for country */}
                              <div className="flex items-center text-[11px] text-zinc-400 leading-tight whitespace-nowrap truncate">
                                <span className="truncate">{athlete.country || 'United States'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Top Right Utility Actions & Small Expand/Collapse Button */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div
                              className="flex items-center gap-1 shrink-0"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleAcceptRequest(athlete.id)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                title="Accept connection request"
                              >
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectRequest(athlete.id)}
                                className="p-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                                title="Decline connection request"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Small Expand/Collapse Button Icon */}
                            <button
                              type="button"
                              onClick={toggleExpand}
                              aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
                              className="p-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                              title={isExpanded ? 'Collapse card' : 'Expand card'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* FULL EXPANDED DETAILS */}
                        {isExpanded && (
                          <>
                            {/* 2. TITLE & BIO */}
                            <div>
                              <h3
                                onClick={() => setInspectAthlete(athlete)}
                                className="font-bold text-base text-zinc-100 hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                {athlete.workoutSplit || 'Strength & Hypertrophy Split'}
                              </h3>
                              {athlete.bio && (
                                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                                  {athlete.bio}
                                </p>
                              )}
                            </div>

                            {/* 3. HEVY 3-COLUMN AT-A-GLANCE METRICS BAR */}
                            <div className="grid grid-cols-3 gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                              <div>
                                <span className="text-[11px] text-zinc-500 block">
                                  Experience
                                </span>
                                <span
                                  className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
                                    isLevelMatch ? 'text-amber-400' : 'text-zinc-100'
                                  }`}
                                >
                                  {athlete.level}
                                </span>
                              </div>
                              <div className="border-x border-zinc-800/80 px-3">
                                <span className="text-[11px] text-zinc-500 block">
                                  Frequency
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                                  {athlete.trainingDaysPerWeek || 5}d / week
                                </span>
                              </div>
                              <div className="pl-1">
                                <span className="text-[11px] text-zinc-500 block">
                                  Active Streak
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1 truncate">
                                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">
                                    {athlete.streakDays}d streak
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* 4. GYM & LIFTS BREAKDOWN */}
                            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 divide-y divide-zinc-800/60">
                              <div
                                onClick={() => setInspectAthlete(athlete)}
                                className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-zinc-900/60 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 font-mono text-[11px] font-bold text-amber-400 flex items-center justify-center shrink-0">
                                    <Building2 className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-xs sm:text-sm font-semibold text-zinc-200 block truncate">
                                      {athlete.gymName || 'Local Gym'}
                                    </span>
                                    <span className="text-[11px] text-zinc-500 block truncate">
                                      {athlete.area}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-mono font-bold text-zinc-200 tabular-nums block">
                                    {displayDist}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-mono block">
                                    Distance
                                  </span>
                                </div>
                              </div>

                              {athlete.favoriteLifts && (
                                <div
                                  onClick={() => setInspectAthlete(athlete)}
                                  className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-zinc-900/60 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 font-mono text-[11px] font-bold text-amber-400 flex items-center justify-center shrink-0">
                                      <Dumbbell className="w-3.5 h-3.5" />
                                    </span>
                                    <div className="min-w-0">
                                      <span className="text-xs sm:text-sm font-semibold text-zinc-200 block truncate">
                                        {athlete.favoriteLifts}
                                      </span>
                                      <span className="text-[11px] text-zinc-500 block truncate">
                                        Key Compounds ·{' '}
                                        {athlete.primaryGoal ||
                                          'Hypertrophy & Strength'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-mono font-bold text-amber-400 tabular-nums block">
                                      {athlete.badge}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono block">
                                      Tier
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="px-3.5 py-2 flex items-center justify-between text-xs bg-zinc-900/40">
                                <span className="text-[11px] text-zinc-500">
                                  {athlete.lastActive}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setInspectAthlete(athlete)}
                                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Full Athlete Profile</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Incoming Request Message Quote (if present) */}
                            {athlete.inviteMessage && (
                              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/25 text-xs text-amber-200/90 italic flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>"{athlete.inviteMessage}"</span>
                              </div>
                            )}

                            {/* Bottom Collapse Icon */}
                            <div className="pt-2 flex items-center justify-end border-t border-zinc-800/60">
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

                  {incomingCount > 3 && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {canShowLessRequests && (
                        <button
                          type="button"
                          onClick={() => setVisibleRequestsCount(3)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
                        >
                          Show Less
                        </button>
                      )}
                      {hasMoreRequests && (
                        <button
                          type="button"
                          onClick={() => setVisibleRequestsCount(prev => prev + 3)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer transition-colors"
                        >
                          Show More
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Panel 1: Empty state for Requests Received if 0 requests */}
              {activeSocialOption === 'requests' && incomingRequests.length === 0 && (
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center space-y-2 animate-in fade-in">
                  <p className="text-xs text-zinc-400">
                    No pending connection requests right now.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSocialTab('discover');
                        setActiveSocialOption(null);
                        setShowFeedRequests(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#F6721D] font-bold text-[11px] cursor-pointer transition-colors"
                    >
                      Find Nearby Athletes
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSocialOption('suggested')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#F6721D] font-bold text-[11px] cursor-pointer transition-colors"
                    >
                      View Suggested Lifters
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })()}
      </div>

      {/* ===================================================================== */}
      {/* PILLAR 1: HEVY-STYLE WORKOUT FEED                                     */}
      {/* ===================================================================== */}
      {socialTab === 'feed' && activeSocialOption !== 'suggested' && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Gym Buddies Section (Copied from Search page) */}
          <NearbyAthletesView
            athletes={athletes}
            userArea={userArea}
            onUpdateUserArea={handleUpdateArea}
            onToggleConnection={handleToggleConnection}
            onAcceptConnection={handleAcceptRequest}
            onRejectConnection={handleRejectRequest}
            onUpdateAthletePhone={handleUpdateAthletePhone}
            userExperienceLevel={userLevel}
            userName={userProfile?.name}
            userProfile={userProfile}
            rewardsProfile={rewardsProfile}
            onUpdateUserProfile={onUpdateUserProfile}
            mode="gym_buddies_only"
          />

        </div>
      )}

      {/* ===================================================================== */}
      {/* PILLAR 2: DISCOVER (NEARBY LIFTERS & DISCOVERY CARD)                  */}
      {/* ===================================================================== */}
      {socialTab === 'discover' && (
        <NearbyAthletesView
          athletes={athletes}
          userArea={userArea}
          onUpdateUserArea={handleUpdateArea}
          onToggleConnection={handleToggleConnection}
          onAcceptConnection={handleAcceptRequest}
          onRejectConnection={handleRejectRequest}
          onUpdateAthletePhone={handleUpdateAthletePhone}
          userExperienceLevel={userLevel}
          userName={userProfile?.name}
          userProfile={userProfile}
          rewardsProfile={rewardsProfile}
          onUpdateUserProfile={onUpdateUserProfile}
          mode="discover_only"
        />
      )}

      {/* ===================================================================== */}
      {/* PILLAR 3: DEDICATED MONTHLY CHALLENGES (SEPARATE JOINED & POPULAR)    */}
      {/* ===================================================================== */}
      {socialTab === 'challenges' && (() => {
        const joinedChals = monthlyChallenges.filter(c => joinedChallengeIds.includes(c.id));
        const unjoinedByPopularity = monthlyChallenges
          .filter(c => !joinedChallengeIds.includes(c.id))
          .sort((a, b) => b.participantsCount - a.participantsCount);

        // Split unjoined challenges into Most Popular (top 6) and Other Challenges (remaining 6+)
        const popularChalsPool = unjoinedByPopularity.slice(0, 6);
        const otherChalsPool = unjoinedByPopularity.slice(6);

        const visibleJoined = joinedChals.slice(0, visibleJoinedChallengesCount);
        const hasMoreJoined = visibleJoinedChallengesCount < joinedChals.length;
        const canCollapseJoined = visibleJoinedChallengesCount > 3;

        const visiblePopular = popularChalsPool.slice(0, visiblePopularChallengesCount);
        const hasMorePopular = visiblePopularChallengesCount < popularChalsPool.length;
        const canCollapsePopular = visiblePopularChallengesCount > 3;

        const visibleOther = otherChalsPool.slice(0, visibleOtherChallengesCount);
        const hasMoreOther = visibleOtherChallengesCount < otherChalsPool.length;
        const canCollapseOther = visibleOtherChallengesCount > 3;

        const renderChallengeArticle = (chal: CommunityChallengeItem, isJoinedCard: boolean) => {
          const isJoined = joinedChallengeIds.includes(chal.id);
          const isCompleted = completedChallengeIds.includes(chal.id);
          const pct = isCompleted
            ? 100
            : Math.min(100, Math.round((chal.currentValue / chal.targetValue) * 100));

          return (
            <article
              key={chal.id}
              onClick={() => setSelectedChallengeModal(chal)}
              className="w-full p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] flex flex-col justify-between gap-3.5 transition-all shadow-xs cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-400 font-mono font-bold text-[11px]">
                      +{chal.rewardPts} PTS
                    </span>
                    {isJoined && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[10px]">
                        JOINED
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[10px]">
                        COMPLETED ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                    {chal.daysLeft}d remaining
                  </span>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-zinc-100 group-hover:text-amber-400 transition-colors leading-snug">
                  {chal.title}
                </h4>

                {!isJoined && !isJoinedCard && (
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {chal.subtitle}
                  </p>
                )}

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedChallengeModal(chal);
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-0.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>View Challenge Details & Rules →</span>
                </button>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800/80" onClick={e => e.stopPropagation()}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-300">
                      {isCompleted
                        ? `${chal.targetValue.toLocaleString()} / ${chal.targetValue.toLocaleString()} ${chal.unitLabel}`
                        : chal.targetLabel}
                    </span>
                    <span className="text-amber-400 font-bold tabular-nums">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-400'
                          : isJoined
                          ? 'bg-amber-400'
                          : 'bg-zinc-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] text-zinc-400 font-mono truncate">
                    {(chal.participantsCount + (isJoined ? 1 : 0)).toLocaleString()} lifters participating
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleCompleteChallenge(chal)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-amber-300 border border-amber-400/30 text-[11px] font-bold cursor-pointer transition-colors"
                        title="Mark challenge complete and claim +10 points"
                      >
                        Complete (+10 PTS)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleChallenge(chal.id, chal.title)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-colors ${
                        isJoined
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                      }`}
                    >
                      {isJoined ? 'Joined ✓' : 'Join'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        };

        return (
          <div className="space-y-5">
            {/* =============================================================== */}
            {/* SEPARATE SECTION CARD 1: JOINED CHALLENGES                      */}
            {/* =============================================================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-base font-bold text-zinc-100">
                      Joined Challenges
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Your active monthly challenges. Complete any challenge to earn +10 Rank Points.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg font-bold">
                    {joinedChals.length} Joined
                  </span>
                </div>
              </div>

              {/* Minimalistic Membership Tier Challenge Allowance Section */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Crown className={`w-4 h-4 shrink-0 ${isProMember ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-zinc-200">
                      {isProMember ? 'Pro Member' : 'Free Member'}:
                    </span>
                    <span className="text-zinc-400">
                      {isProMember
                        ? 'Unlimited monthly challenges unlocked'
                        : `${joinedChals.length} of ${FREE_CHALLENGE_LIMIT} challenges used`}
                    </span>
                  </div>
                </div>

                {isProMember ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold shrink-0">
                    UNLIMITED
                  </span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono font-bold">
                      {joinedChals.length}/{FREE_CHALLENGE_LIMIT} FREE
                    </span>
                    {onOpenProModal && (
                      <button
                        type="button"
                        onClick={onOpenProModal}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer transition-colors"
                      >
                        Get Pro
                      </button>
                    )}
                  </div>
                )}
              </div>

              {joinedChals.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1.5">
                  <p className="text-xs font-bold text-zinc-200">No joined challenges yet</p>
                  <p className="text-[11px] text-zinc-400">
                    Join any challenge from the Most Popular or Other Challenges sections below to track your progress here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleJoined.map(chal => renderChallengeArticle(chal, true))}

                  {joinedChals.length > 3 && (
                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <span className="text-xs text-zinc-400 font-mono">
                        Showing {visibleJoined.length} of {joinedChals.length} joined challenges
                      </span>
                      <div className="flex items-center gap-2">
                        {canCollapseJoined && (
                          <button
                            type="button"
                            onClick={() => setVisibleJoinedChallengesCount(3)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Collapse to Default (3)</span>
                          </button>
                        )}
                        {hasMoreJoined && (
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleJoinedChallengesCount(prev => Math.min(joinedChals.length, prev + 3))
                            }
                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Load 3 More Challenges</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =============================================================== */}
            {/* SEPARATE SECTION CARD 2: MOST POPULAR CHALLENGES                */}
            {/* =============================================================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#F6721D]" />
                    <h2 className="text-base font-bold text-zinc-100">
                      Most Popular Challenges
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Explore the most popular community challenges ranked by athlete participation.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-amber-400 bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 rounded-lg">
                    Showing {visiblePopular.length} of {popularChalsPool.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {visiblePopular.map(chal => renderChallengeArticle(chal, false))}

                {popularChalsPool.length > 3 && (
                  <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <span className="text-xs text-zinc-400 font-mono">
                      Showing {visiblePopular.length} of {popularChalsPool.length} popular challenges
                    </span>
                    <div className="flex items-center gap-2">
                      {canCollapsePopular && (
                        <button
                          type="button"
                          onClick={() => setVisiblePopularChallengesCount(3)}
                          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Collapse to Default (3)</span>
                        </button>
                      )}
                      {hasMorePopular && (
                        <button
                          type="button"
                          onClick={() =>
                            setVisiblePopularChallengesCount(prev =>
                              Math.min(popularChalsPool.length, prev + 3)
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Load 3 More Challenges</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* =============================================================== */}
            {/* SEPARATE SECTION CARD 3: OTHER CHALLENGES                       */}
            {/* =============================================================== */}
            {otherChalsPool.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h2 className="text-base font-bold text-zinc-100">
                        Other Challenges
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Specialized calisthenics, morning discipline, posterior chain, symmetry, and recovery challenges.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-amber-400 bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 rounded-lg">
                      Showing {visibleOther.length} of {otherChalsPool.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {visibleOther.map(chal => renderChallengeArticle(chal, false))}

                  {otherChalsPool.length > 3 && (
                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <span className="text-xs text-zinc-400 font-mono">
                        Showing {visibleOther.length} of {otherChalsPool.length} other challenges
                      </span>
                      <div className="flex items-center gap-2">
                        {canCollapseOther && (
                          <button
                            type="button"
                            onClick={() => setVisibleOtherChallengesCount(3)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Collapse to Default (3)</span>
                          </button>
                        )}
                        {hasMoreOther && (
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleOtherChallengesCount(prev =>
                                Math.min(otherChalsPool.length, prev + 3)
                              )
                            }
                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Load 3 More Challenges</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ===================================================================== */}
      {/* PILLAR 4: HEVY / STRAVA LEADERBOARDS & MONTHLY CHALLENGES             */}
      {/* ===================================================================== */}
      {socialTab === 'leaderboards' && (
        <div className="space-y-6">
          {/* Leaderboard User Cards */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 space-y-4 shadow-xs">
            <div className="flex flex-col gap-3 pb-3 border-b border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-100">Community Leaderboards</h2>
                  <p className="text-xs text-zinc-400">
                    Compare weekly training volume, active streaks, and monthly PRs
                  </p>
                </div>

                <div className="flex items-center gap-1 min-w-0 max-w-full sm:max-w-md">
                  <button
                    type="button"
                    onClick={() => handleScrollMetrics('left')}
                    aria-label="Scroll metrics left"
                    className="p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800/80 shrink-0 cursor-pointer transition-colors"
                    title="Scroll Left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div
                    ref={metricScrollRef}
                    className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1"
                  >
                    {(
                      [
                        { id: 'prs', label: 'Monthly PRs' },
                        { id: 'volume', label: 'Weekly Volume' },
                        { id: 'streak', label: 'Iron Streak' },
                        { id: 'workouts', label: 'Workouts Completed' },
                        { id: 'sets', label: 'Total Sets' },
                        { id: 'reps', label: 'Total Reps' },
                        { id: 'time', label: 'Time Trained' }
                      ] as const
                    ).map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={(e) => {
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                          setLeaderboardMetric(m.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-xs snap-center snap-always ${
                          leaderboardMetric === m.id
                            ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleScrollMetrics('right')}
                    aria-label="Scroll metrics right"
                    className="p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800/80 shrink-0 cursor-pointer transition-colors"
                    title="Scroll Right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Leaderboard Scope Tabs & Location Search Options */}
              <div className="flex flex-col gap-2.5">
                {/* 5 Leaderboard Scope Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1">
                  {[
                    { id: 'worldwide', label: 'Worldwide' },
                    { id: 'country', label: 'Country' },
                    { id: 'city', label: 'My location' }
                  ].map(tab => {
                    const isActive = leaderboardScope === tab.id && !leaderboardLocationSearch.trim();
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={(e) => {
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                          setLeaderboardScope(tab.id as LeaderboardScope);
                          setLeaderboardLocationSearch('');
                          setVisibleLeaderboardCount(5);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-xs snap-center snap-always ${
                          isActive
                            ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.id === 'current_location' && (
                          <span
                            className={`text-[9px] px-1 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                              isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-amber-400/20 text-amber-400'
                            }`}
                          >
                            Live
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>


              </div>



              {/* Country Leaderboard Controls */}
              {leaderboardScope === 'country' && (
                <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                      <Flag className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Country Leaderboard:</span>
                      <span className="text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                        {selectedLeaderboardCountry}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {leaderboardEntries.length} lifters in {selectedLeaderboardCountry}
                    </span>
                  </div>

                  {/* Type in Country & Select from Dropdown of All World Countries */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* 1. Type in the country (Search input with live autocomplete dropdown) */}
                    <div className="relative flex-1" ref={countryInputContainerRef}>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Type country name (e.g. United States, Japan, France, Brazil)..."
                          value={countrySearchInput}
                          onChange={e => {
                            setCountrySearchInput(e.target.value);
                            setIsCountryDropdownOpen(true);
                            const found = ALL_WORLD_COUNTRIES.find(
                              c => c.toLowerCase() === e.target.value.toLowerCase().trim()
                            );
                            if (found) {
                              setSelectedLeaderboardCountry(found);
                              setVisibleLeaderboardCount(5);
                            }
                          }}
                          onFocus={() => setIsCountryDropdownOpen(true)}
                          className="w-full pl-9 pr-8 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/80 transition-colors"
                        />
                        {countrySearchInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setCountrySearchInput('');
                              setIsCountryDropdownOpen(false);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete popup listing matching countries */}
                      {isCountryDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1 z-50 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95">
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 mb-1 flex items-center justify-between">
                            <span>Countries in the World ({filteredWorldCountries.length})</span>
                            <span className="text-[9px] text-zinc-500 font-normal">Click to select</span>
                          </div>
                          {filteredWorldCountries.length === 0 ? (
                            <div className="px-3 py-3 text-center text-xs text-zinc-500">
                              No country matched &ldquo;{countrySearchInput}&rdquo;
                            </div>
                          ) : (
                            filteredWorldCountries.map(c => {
                              const isSelected = selectedLeaderboardCountry.toLowerCase() === c.toLowerCase();
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => {
                                    setSelectedLeaderboardCountry(c);
                                    setCountrySearchInput('');
                                    setIsCountryDropdownOpen(false);
                                    setVisibleLeaderboardCount(5);
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-400 text-zinc-950 font-bold'
                                      : 'text-zinc-200 hover:bg-zinc-800'
                                  }`}
                                >
                                  <span>{c}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Select from dropdown list, listing all countries in the world */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-zinc-400 whitespace-nowrap">or choose:</span>
                      <div className="relative">
                        <select
                          value={selectedLeaderboardCountry}
                          onChange={e => {
                            setSelectedLeaderboardCountry(e.target.value);
                            setCountrySearchInput('');
                            setIsCountryDropdownOpen(false);
                            setVisibleLeaderboardCount(5);
                          }}
                          className="appearance-none pl-3 pr-8 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 font-medium cursor-pointer focus:outline-none focus:border-amber-400/80 transition-colors"
                          title="Select from dropdown list of all countries in the world"
                        >
                          {ALL_WORLD_COUNTRIES.map(country => (
                            <option key={country} value={country} className="bg-zinc-900 text-zinc-100">
                              {country}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* My Location / Radius Leaderboard Controls */}
              {leaderboardScope === 'city' && (
                <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-amber-500/30 animate-in fade-in">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Distance Radius:</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {([5, 10, 25, 50] as const).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setLocalRadius(r);
                            setVisibleLeaderboardCount(5);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                            localRadius === r
                              ? 'bg-amber-400 text-zinc-950 shadow-xs'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {r}{localDistanceUnit === 'km' ? 'km' : 'mi'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-zinc-400">Unit:</span>
                      <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setLocalDistanceUnit('km')}
                          className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                            localDistanceUnit === 'km'
                              ? 'bg-amber-400 text-zinc-950 font-bold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          km
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocalDistanceUnit('mi')}
                          className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                            localDistanceUnit === 'mi'
                              ? 'bg-amber-400 text-zinc-950 font-bold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          mile
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {leaderboardEntries.length} lifters
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3.5">
              {leaderboardEntries.length === 0 ? (
                <div className="py-10 text-center text-zinc-500 text-sm bg-zinc-950/40 rounded-xl border border-zinc-800/80 p-4">
                  <MapPin className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-zinc-300">No lifters found in this range</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Try expanding the distance radius or switching to Worldwide / Country leaderboard.
                  </p>
                </div>
              ) : (
                leaderboardEntries.slice(0, visibleLeaderboardCount).map((entry, idx) => {
                  const cleanName = entry.name.replace(' (You)', '');
                  const cardKey = `lb_${entry.id}`;
                  const isCardExpanded = !!expandedFeedPostIds[cardKey];
                  const toggleLbExpand = () => {
                    setExpandedFeedPostIds(prev => ({ ...prev, [cardKey]: !isCardExpanded }));
                  };
                  const displayVolStr = `${(unit === 'kg'
                    ? entry.weeklyVolumeKg
                    : Math.round(entry.weeklyVolumeKg * 2.20462)
                  ).toLocaleString()} ${unit}`;

                  const displayVal =
                    leaderboardMetric === 'volume'
                      ? displayVolStr
                      : leaderboardMetric === 'streak'
                      ? `${entry.streakDays} days`
                      : leaderboardMetric === 'prs'
                      ? `${entry.monthlyPrs} PRs`
                      : leaderboardMetric === 'workouts'
                      ? `${entry.workoutsCount || 4} workouts`
                      : leaderboardMetric === 'sets'
                      ? `${(entry.setsCount || 48).toLocaleString()} sets`
                      : leaderboardMetric === 'reps'
                      ? `${(entry.repsCount || 492).toLocaleString()} reps`
                      : `${Math.floor((entry.workoutMinutes || 240) / 60)}h ${(entry.workoutMinutes || 240) % 60}m`;

                  const metricSubtitle =
                    leaderboardMetric === 'volume'
                      ? 'Last 7 days'
                      : leaderboardMetric === 'streak'
                      ? 'Active streak'
                      : leaderboardMetric === 'prs'
                      ? 'This month'
                      : leaderboardMetric === 'workouts'
                      ? 'Completed workouts'
                      : leaderboardMetric === 'sets'
                      ? 'Volume sets'
                      : leaderboardMetric === 'reps'
                      ? 'Total repetitions'
                      : 'Training time';

                  return (
                    <article
                      key={entry.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-2.5 shadow-xs"
                    >
                      {/* 1. HEADER: Avatar, Name, Metadata, Metric & Expand/Collapse */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => handleOpenUserProfile(entry.id, cleanName)}
                          className="flex items-center gap-3 cursor-pointer group min-w-0"
                        >
                          <GymAvatar
                            avatarType={entry.isMe ? userProfile?.avatarType : undefined}
                            avatarUrl={entry.isMe ? userProfile?.avatarUrl : entry.avatarUrl}
                            avatarId={entry.isMe ? (userProfile?.avatarId || 'u_me') : entry.id}
                            name={cleanName}
                            size="md"
                            fallbackInitials={cleanName.substring(0, 2)}
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                                #{idx + 1}
                              </span>
                              <span className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                                {cleanName}
                              </span>
                              {entry.isMe && (
                                <span className="text-[11px] text-amber-400 font-medium">· You</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 flex-wrap">
                              <span>{entry.gym}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-zinc-300">{entry.rankBadge}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-400/90 font-medium flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {entry.isMe
                                  ? 'You'
                                  : leaderboardScope === 'local' || leaderboardScope === 'current_location'
                                  ? `${localDistanceUnit === 'km' ? `${entry.distanceKm} km` : `${entry.distanceMiles} mi`} away (${entry.city})`
                                  : leaderboardScope === 'city'
                                  ? `${entry.city}`
                                  : `${entry.city}, ${entry.country}`}
                              </span>
                            </div>
                          </div>
                        </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-mono text-xs sm:text-sm font-bold text-amber-400 tabular-nums block">
                            {displayVal}
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            {metricSubtitle}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={toggleLbExpand}
                          aria-label={isCardExpanded ? 'Collapse card' : 'Expand card'}
                          className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                          title={isCardExpanded ? 'Collapse card' : 'Expand card'}
                        >
                          {isCardExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isCardExpanded && (
                      <>
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                          <div>
                            <span className="text-[11px] text-zinc-500 block">Weekly Volume</span>
                            <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                              {displayVolStr}
                            </span>
                          </div>
                          <div className="border-x border-zinc-800/80 px-3">
                            <span className="text-[11px] text-zinc-500 block">Iron Streak</span>
                            <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                              {entry.streakDays} days
                            </span>
                          </div>
                          <div className="pl-1">
                            <span className="text-[11px] text-zinc-500 block">Monthly PRs</span>
                            <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5 shrink-0" />
                              <span>{entry.monthlyPrs} PRs</span>
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                          <button
                            type="button"
                            onClick={() => handleOpenUserProfile(entry.id, cleanName)}
                            className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Athlete Profile</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={toggleLbExpand}
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
              }))}

              {/* Load 5 More / Collapse to Default (5) Footer Controls */}
              {leaderboardEntries.length > 5 && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-zinc-800/80">
                  <span className="text-xs text-zinc-400 font-mono">
                    Showing {Math.min(visibleLeaderboardCount, leaderboardEntries.length)} of {leaderboardEntries.length} leaderboard athletes
                  </span>
                  <div className="flex items-center gap-2">
                    {visibleLeaderboardCount > 5 && (
                      <button
                        type="button"
                        onClick={() => setVisibleLeaderboardCount(5)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Collapse to Default (5)</span>
                      </button>
                    )}
                    {visibleLeaderboardCount < leaderboardEntries.length && (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleLeaderboardCount(prev =>
                            Math.min(leaderboardEntries.length, prev + 5)
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Load 5 More Users</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PILLAR 4: PHYSIQUE VAULT & TRANSFORMATIONS                            */}
      {/* ===================================================================== */}
      {socialTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-100">Physique & Transformation Vault</h2>
              <p className="text-xs text-zinc-400">
                Compare side-by-side progress photos and manage your community gallery
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUploadInitialTag('physique');
                setShowPhotoUploadModal(true);
              }}
              disabled={userPhotos.length >= getUserPhotoLimit(subscription?.isPro)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold text-xs cursor-pointer transition-colors"
            >
              Upload Photo
            </button>
          </div>

          <BeforeAfterShowcase
            beforePhoto={userPhotos.find(p => p.tag === 'before')}
            afterPhoto={userPhotos.find(p => p.tag === 'after')}
            allPhotos={userPhotos}
            unit={unit}
            onOpenUpload={(tag?: 'before' | 'after') => {
              setUploadInitialTag(tag || 'physique');
              setShowPhotoUploadModal(true);
            }}
            onSetTag={handleSetPhotoTag}
            onShareToFeed={handleShareTransformationToFeed}
          />

          <AthletePhotosGallery
            photos={userPhotos}
            unit={unit}
            onOpenUpload={() => {
              setUploadInitialTag('physique');
              setShowPhotoUploadModal(true);
            }}
            onDeletePhoto={handleDeletePhoto}
            onSetTag={handleSetPhotoTag}
            onToggleVisibility={handleTogglePhotoVisibility}
            onSharePhotoToFeed={handleSharePhotoToFeed}
            subscription={subscription}
            onOpenProModal={onOpenProModal}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS & OVERLAYS                                                     */}
      {/* ===================================================================== */}
      <ChallengeDetailModal
        challenge={selectedChallengeModal}
        isJoined={selectedChallengeModal ? joinedChallengeIds.includes(selectedChallengeModal.id) : false}
        isCompleted={selectedChallengeModal ? completedChallengeIds.includes(selectedChallengeModal.id) : false}
        onClose={() => setSelectedChallengeModal(null)}
        onToggleJoin={handleToggleChallenge}
        onCompleteChallenge={handleCompleteChallenge}
      />

      {sidebarWhatsAppAthlete && (
        <WhatsAppConnectModal
          athlete={sidebarWhatsAppAthlete}
          isOpen={!!sidebarWhatsAppAthlete}
          onClose={() => setSidebarWhatsAppAthlete(null)}
          onUpdatePhone={handleUpdateAthletePhone}
        />
      )}

      <PhotoUploadModal
        isOpen={showPhotoUploadModal}
        onClose={() => setShowPhotoUploadModal(false)}
        onAddPhoto={handleAddPhoto}
        currentPhotosCount={userPhotos.length}
        initialTag={uploadInitialTag}
        unit={unit}
        existingPhotos={userPhotos}
        onDeletePhoto={handleDeletePhoto}
        subscription={subscription}
        onOpenProModal={onOpenProModal}
      />

      {/* Share Workout to Community Modal */}
      {activeWorkoutToPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                  Share Workout Session
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Post your completed session and optional progress photo to the feed
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelWorkoutPost}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-100">{activeWorkoutToPost.title}</h3>
                <span className="text-xs font-mono text-amber-400">
                  {Math.floor(activeWorkoutToPost.durationSeconds / 60)} min
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Volume</span>
                  <span className="font-bold text-zinc-100 tabular-nums">
                    {unit === 'kg'
                      ? Math.round(activeWorkoutToPost.totalVolumeKg).toLocaleString()
                      : Math.round(activeWorkoutToPost.totalVolumeKg * 2.20462).toLocaleString()}{' '}
                    {unit}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Exercises</span>
                  <span className="font-bold text-zinc-100 tabular-nums">
                    {activeWorkoutToPost.exercises.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">PRs</span>
                  <span className="font-bold text-amber-400 tabular-nums">
                    {activeWorkoutToPost.prCount || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Session Notes / Caption</label>
              <textarea
                value={workoutPostCaption}
                onChange={e => setWorkoutPostCaption(e.target.value)}
                rows={2}
                placeholder="How did the session feel? Any cues or PR notes..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Photo Attachment */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Attach Workout Photo</span>
                {workoutPostPhoto && (
                  <span className="text-xs text-emerald-400 font-medium">Photo attached ✓</span>
                )}
              </div>

              <input
                type="file"
                ref={workoutPhotoInputRef}
                onChange={handleWorkoutPhotoSelect}
                accept="image/*"
                className="hidden"
              />

              {!workoutPostPhoto ? (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowWorkoutSelfieCamera(true)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-medium flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Take Selfie</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWorkoutSavedPhotosPicker(true)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-medium flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Saved ({userPhotos.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => workoutPhotoInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-medium flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload File</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <ImageModerationBanner
                    result={workoutPostPhotoModeration}
                    isChecking={isCheckingWorkoutPhotoAi}
                    onClear={() => {
                      setWorkoutPostPhoto(null);
                      setWorkoutPostPhotoModeration(null);
                      setWorkoutPhotoError(null);
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <img
                      src={workoutPostPhoto}
                      alt="Workout preview"
                      className="w-20 h-24 rounded-lg object-cover border border-zinc-800 shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-1.5">
                        {(['after', 'before', 'physique'] as const).map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setWorkoutPostPhotoTag(tag)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase cursor-pointer ${
                              workoutPostPhotoTag === tag
                                ? 'bg-amber-400 text-zinc-950 font-bold'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveWorkoutPhotoToVault}
                            onChange={e => setSaveWorkoutPhotoToVault(e.target.checked)}
                            className="rounded border-zinc-700 bg-zinc-900 text-amber-400"
                          />
                          <span>Save to Physique Vault</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setWorkoutPostPhoto(null);
                            setWorkoutPostPhotoModeration(null);
                            setWorkoutPhotoError(null);
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {workoutPhotoError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2 rounded-lg">
                  {workoutPhotoError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleCancelWorkoutPost}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishWorkoutPost}
                disabled={
                  isCheckingWorkoutPhotoAi ||
                  Boolean(workoutPostPhoto && workoutPostPhotoModeration?.flaggedAsNotAllowed)
                }
                className="flex-2 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold text-xs cursor-pointer"
              >
                {isCheckingWorkoutPhotoAi ? 'Checking Photo...' : 'Publish Workout to Feed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {inspectAthlete && (
        <AthleteDetailModal
          athlete={inspectAthlete}
          onClose={() => setInspectAthlete(null)}
          onToggleConnection={handleToggleConnection}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          userLevel={userLevel}
          onOpenWhatsApp={handleOpenSidebarWhatsApp}
          distanceUnit={distanceUnit}
          isOwnProfile={isInspectingOwnProfile}
          userProfile={userProfile}
          onUpdateBio={handleSaveMyBio}
          rewardsProfile={rewardsProfile}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 border border-amber-400 text-zinc-100 text-xs font-semibold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {customExerciseNotice && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-zinc-900 border border-amber-400 text-zinc-100 shadow-2xl flex items-center gap-2 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{customExerciseNotice}</span>
        </div>
      )}

      {showWorkoutSelfieCamera && (
        <WorkoutSelfieCameraModal
          isOpen={showWorkoutSelfieCamera}
          onClose={() => setShowWorkoutSelfieCamera(false)}
          onCaptureSelfie={handleCaptureWorkoutSelfie}
          onSwitchToDeviceUpload={() => workoutPhotoInputRef.current?.click()}
        />
      )}

      {showWorkoutSavedPhotosPicker && (
        <SavedAppPhotosPickerModal
          isOpen={showWorkoutSavedPhotosPicker}
          onClose={() => setShowWorkoutSavedPhotosPicker(false)}
          savedPhotos={userPhotos}
          onSelectPhoto={handleSelectWorkoutSavedPhoto}
          onDeletePhoto={photoId => {
            const updated = deleteUserPhoto(photoId, subscription?.isPro ?? false);
            setUserPhotos(updated);
          }}
          onOpenSelfie={() => setShowWorkoutSelfieCamera(true)}
          onOpenDeviceUpload={() => workoutPhotoInputRef.current?.click()}
        />
      )}

      {reviewingWorkoutPost && (
        <WorkoutSessionCardModal
          isOpen={Boolean(reviewingWorkoutPost)}
          onClose={() => setReviewingWorkoutPost(null)}
          post={reviewingWorkoutPost}
          unit={unit}
          onOpenStoryCard={
            reviewingWorkoutPost.userId === 'u_me' || reviewingWorkoutPost.userId === 'ath_current_user'
              ? (w => setSharingWorkoutFromFeed(w))
              : undefined
          }
          onCheer={onCheerPost}
        />
      )}

      {historicalModalData && (
        <HistoricalPostsModal
          isOpen={Boolean(historicalModalData)}
          onClose={() => setHistoricalModalData(null)}
          postOwner={historicalModalData.owner}
          posts={historicalModalData.posts}
          unit={unit}
          onReviewCard={post => {
            setReviewingWorkoutPost(post);
          }}
        />
      )}

      {sharingWorkoutFromFeed && (
        <SocialShareModal
          workout={sharingWorkoutFromFeed}
          unit={unit}
          onClose={() => setSharingWorkoutFromFeed(null)}
        />
      )}

      {connectModalAthlete && (
        <ConnectInviteModal
          isOpen={Boolean(connectModalAthlete)}
          athlete={connectModalAthlete}
          onClose={() => setConnectModalAthlete(null)}
          onSendInvite={(athId, msg) => {
            const target =
              athletes.find(a => a.id === athId) ||
              newAreaMembers.find(a => a.id === athId) ||
              suggestedConnections.map(s => s.athlete).find(a => a.id === athId) ||
              connectModalAthlete;
            if (target) {
              applySendConnection(target, msg);
            }
          }}
        />
      )}

      {/* FULL WORKOUT ROUTINE PROGRAM POPUP MODAL */}
      {viewingFullRoutinePost && (() => {
        const fullProgram = buildFullRoutineProgramForPost(viewingFullRoutinePost);
        const isAlreadySaved = savedWorkoutPostIds.includes(viewingFullRoutinePost.id);
        const loggedExercises = getFeedPostExercises(viewingFullRoutinePost);

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={e => {
              if (e.target === e.currentTarget) setViewingFullRoutinePost(null);
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Full Workout Routine Program"
          >
            <div className="w-full max-w-2xl bg-zinc-900 border border-[#F6721D]/80 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-zinc-950/90 border-b border-zinc-800 flex items-start justify-between gap-3 shrink-0">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-sm uppercase shrink-0">
                    {viewingFullRoutinePost.userName.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                        Full Workout Program
                      </span>
                      <span className="text-xs text-zinc-400">
                        by <strong className="text-zinc-200">{viewingFullRoutinePost.userName}</strong>
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-zinc-100 mt-1 truncate">
                      {fullProgram.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                      {fullProgram.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingFullRoutinePost(null)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors cursor-pointer shrink-0"
                  title="Close routine popup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Program Summary Strip */}
              <div className="px-4 sm:px-5 py-3 bg-zinc-900/90 border-b border-zinc-800/80 grid grid-cols-3 gap-2 shrink-0 text-center font-mono">
                <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase block">Split Schedule</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-400">
                    {fullProgram.routines.length} Days / Week
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase block">Primary Goal</span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-100 truncate block">
                    {fullProgram.goal.split('(')[0].trim()}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase block">Experience</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400">
                    {fullProgram.level}
                  </span>
                </div>
              </div>

              {/* Day Tabs Selector */}
              <div className="px-8 sm:px-5 pt-3 pb-2 bg-zinc-900 border-b border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 scroll-smooth snap-x snap-mandatory scroll-px-8 sm:scroll-px-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    setSelectedRoutineDayIdx(-1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 border snap-center snap-always ${
                    selectedRoutineDayIdx === -1
                      ? 'bg-amber-400 text-zinc-950 border-amber-400'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  All Days ({fullProgram.routines.length})
                </button>
                {fullProgram.routines.map((routine, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      setSelectedRoutineDayIdx(idx);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 border snap-center snap-always ${
                      selectedRoutineDayIdx === idx
                        ? 'bg-amber-400 text-zinc-950 border-amber-400'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {routine.dayName.split(':')[0]}
                    {idx === 0 ? ' (Featured Session)' : ''}
                  </button>
                ))}
              </div>

              {/* Scrollable Routine Days & Exercises Breakdown */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                {fullProgram.routines.map((routine, rIdx) => {
                  if (selectedRoutineDayIdx !== -1 && selectedRoutineDayIdx !== rIdx) {
                    return null;
                  }
                  const isFeaturedDay = rIdx === 0;

                  return (
                    <div
                      key={rIdx}
                      className={`rounded-2xl border overflow-hidden ${
                        isFeaturedDay
                          ? 'bg-zinc-950/90 border-amber-400/40'
                          : 'bg-zinc-950/60 border-zinc-800/90'
                      }`}
                    >
                      <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-bold text-zinc-100">
                              {routine.dayName}
                            </h3>
                            {isFeaturedDay && (
                              <span className="px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 font-mono text-[10px] font-bold">
                                Posted Session
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            Target Focus: <strong className="text-zinc-300">{routine.focus}</strong>
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                          {routine.exercises.length} Exercises
                        </span>
                      </div>

                      <div className="divide-y divide-zinc-800/60">
                        {routine.exercises.map((ex, exIdx) => {
                          const matchingLogged = isFeaturedDay ? loggedExercises[exIdx] : undefined;

                          return (
                            <div key={`${ex.exerciseId}_${exIdx}`} className="p-3.5 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs font-bold text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                    {exIdx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
                                      {ex.name || ex.exerciseId}
                                    </h4>
                                    <span className="text-[11px] text-zinc-400">
                                      Primary Muscle: <strong className="text-zinc-300">{ex.primary_muscle || 'Compound'}</strong>
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0 font-mono">
                                  <span className="text-xs font-bold text-amber-400 block">
                                    {ex.defaultSets} Sets × {ex.targetReps} reps
                                  </span>
                                  <span className="text-[10px] text-zinc-500 block">
                                    Target RPE {ex.targetRpe}
                                  </span>
                                </div>
                              </div>

                              {/* If featured session has logged sets, show the exact sets performed */}
                              {matchingLogged && matchingLogged.sets && matchingLogged.sets.length > 0 && (
                                <div className="pl-8 pt-1 flex items-center gap-1.5 flex-wrap">
                                  {matchingLogged.sets.map((s, sIdx) => {
                                    const w = unit === 'kg' ? s.weightKg : s.weightLbs;
                                    return (
                                      <span
                                        key={s.id || sIdx}
                                        className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 tabular-nums"
                                      >
                                        S{s.setNumber || sIdx + 1}: {w} {unit} × {s.reps}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {isAlreadySaved && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Saved to your <strong>Workout Programs</strong> page under Personalized & Custom Plans.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with Save Routine to Workout Programs Button */}
              <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewingFullRoutinePost(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={isAlreadySaved}
                  onClick={() => {
                    if (!isAlreadySaved) {
                      if (!subscription?.isPro && getPersonalProgramsTotalCount() >= MAX_FREE_PERSONALIZED_PLANS) {
                        setShowProgramLimitModal(true);
                        return;
                      }
                      setCustomRoutineNameInput(fullProgram.title);
                      setRenamingRoutineToSave({
                        post: viewingFullRoutinePost,
                        defaultTitle: fullProgram.title
                      });
                    }
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isAlreadySaved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95'
                  }`}
                  title={
                    isAlreadySaved
                      ? 'Already saved to your Workout Programs (1 click allowed)'
                      : 'Save this full routine program to your Workout Programs page'
                  }
                >
                  {isAlreadySaved ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Saved to Workout Programs</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Save Routine to Workout Programs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RENAME WORKOUT PROGRAM BEFORE SAVING POPUP MODAL */}
      {renamingRoutineToSave && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setRenamingRoutineToSave(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Rename Workout Program"
        >
          <div className="w-full max-w-md bg-zinc-900 border border-[#F6721D]/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-zinc-100">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-zinc-100">
                    Name Your Workout Program
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Customize the program name before saving to your Workout Programs
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRenamingRoutineToSave(null)}
                className="p-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors cursor-pointer shrink-0"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="custom-routine-program-name"
                className="text-xs font-bold text-zinc-300 block"
              >
                Program Name
              </label>
              <input
                id="custom-routine-program-name"
                type="text"
                autoFocus
                value={customRoutineNameInput}
                onChange={e => setCustomRoutineNameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const finalName =
                      customRoutineNameInput.trim() || renamingRoutineToSave.defaultTitle;
                    handleSaveWorkoutPostRoutine(renamingRoutineToSave.post, finalName);
                    setRenamingRoutineToSave(null);
                  } else if (e.key === 'Escape') {
                    setRenamingRoutineToSave(null);
                  }
                }}
                placeholder={renamingRoutineToSave.defaultTitle}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors font-medium"
              />
              <p className="text-[11px] text-zinc-500">
                Original creator: <span className="text-zinc-300 font-medium">{renamingRoutineToSave.post.userName}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRenamingRoutineToSave(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-zinc-100 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalName =
                    customRoutineNameInput.trim() || renamingRoutineToSave.defaultTitle;
                  handleSaveWorkoutPostRoutine(renamingRoutineToSave.post, finalName);
                  setRenamingRoutineToSave(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5 PERSONAL PROGRAMS LIMIT REACHED -> UPGRADE TO PRO MEMBER POPUP MODAL */}
      {showProgramLimitModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setShowProgramLimitModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Upgrade to Pro Member to Save Unlimited Programs"
        >
          <div className="w-full max-w-lg bg-zinc-900 border border-amber-400/60 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 relative">
            <button
              type="button"
              onClick={() => setShowProgramLimitModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Crown className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  5 Personal Programs Limit Reached ({MAX_FREE_PERSONALIZED_PLANS}/{MAX_FREE_PERSONALIZED_PLANS} Programs)
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 leading-tight mt-0.5">
                  Upgrade to Pro Member to Save Unlimited Programs
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  A user is only allowed to have <strong>{MAX_FREE_PERSONALIZED_PLANS} personal programs</strong>, developed by yourself or downloaded from other users.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="font-bold text-amber-400 text-xs">
                  Personal Program Storage Full ({MAX_FREE_PERSONALIZED_PLANS} of {MAX_FREE_PERSONALIZED_PLANS} Programs Used)
                </p>
              </div>
              <p className="text-[12px] text-zinc-300 leading-relaxed">
                You have reached the maximum of <strong>{MAX_FREE_PERSONALIZED_PLANS} personal workout programs</strong>. Upgrade to <strong>Pro Member</strong> to download and create unlimited workout programs without restrictions:
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-100 text-xs">Save Unlimited Personal & Downloaded Programs</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Download routines from any athlete on the Community Feed and build unlimited personal programs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-100 text-xs">Full Pro Workout Splits & Exercise Library</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Unlock all 15+ Pro workout programs, custom exercise builder, and advanced progression tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowProgramLimitModal(false);
                  setViewingFullRoutinePost(null);
                  if (onOpenProModal) {
                    onOpenProModal();
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-current shrink-0" />
                <span>Upgrade to Pro Member — Save Unlimited Programs</span>
              </button>
              <button
                type="button"
                onClick={() => setShowProgramLimitModal(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
