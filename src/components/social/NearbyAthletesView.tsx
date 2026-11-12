import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Filter,
  UserPlus,
  UserCheck,
  Clock,
  Sparkles,
  Dumbbell,
  Trophy,
  Flame,
  CheckCircle2,
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Send,
  Users,
  MessageCircle,
  Phone,
  PhoneCall,
  Building2,
  Copy,
  Crown,
  Globe,
  Compass,
  LocateFixed,
  Star,
  ShieldCheck,
  Info,
  Check,
  Flag,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import { NearbyAthlete, ExperienceLevel, UserProfile, RewardsProfile, WorkoutPlan, DailyWorkoutRoutine } from '../../types';
import { saveSharedPlanToMyCustomPlans } from '../../utils/storage';
import { AthleteDetailModal } from './AthleteDetailModal';
import { InviteShareModal } from './InviteShareModal';
import { WhatsAppConnectModal } from './WhatsAppConnectModal';
import { SuggestedUsersCard } from './SuggestedUsersCard';
import { NewAreaMembersCard } from './NewAreaMembersCard';
import { getSuggestedAthletes, SuggestedAthleteItem } from '../../utils/suggestedAthletes';
import {
  getUserLifterId,
  addFriendByQuery,
  getNewMembersInArea
} from '../../utils/nearbyAthletesStorage';
import { DeviceLocationGuideModal, DetectedLocationResult } from '../common/DeviceLocationGuideModal';
import {
  calculateDistanceMiles,
  calculateDistanceKm,
  formatAddressSequence
} from '../../utils/geoDistance';
import { GymAvatar } from '../common/GymAvatar';
import { ALL_WORLD_COUNTRIES } from '../../data/worldCountries';

interface NearbyAthletesViewProps {
  athletes: NearbyAthlete[];
  userArea: string;
  onUpdateUserArea: (area: string) => void;
  onToggleConnection: (athleteId: string) => void;
  onAcceptConnection?: (athleteId: string) => void;
  onRejectConnection?: (athleteId: string) => void;
  onUpdateAthletePhone?: (athleteId: string, phone: string) => void;
  userExperienceLevel?: ExperienceLevel;
  userName?: string;
  userProfile?: UserProfile | null;
  rewardsProfile?: RewardsProfile;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  mode?: 'all' | 'athletes_only' | 'discover_only' | 'gym_buddies_only';
}

export const NearbyAthletesView: React.FC<NearbyAthletesViewProps> = ({
  athletes,
  userArea,
  onUpdateUserArea,
  onToggleConnection,
  onAcceptConnection,
  onRejectConnection,
  onUpdateAthletePhone,
  userExperienceLevel = 'Intermediate',
  userName = 'Athlete',
  userProfile,
  rewardsProfile,
  onUpdateUserProfile,
  mode = 'all'
}) => {
  // Device Location Tracker State
  const [userLat, setUserLat] = useState<number | undefined>(userProfile?.latitude);
  const [userLng, setUserLng] = useState<number | undefined>(userProfile?.longitude);
  const [locationTrackerActive, setLocationTrackerActive] = useState<boolean>(
    Boolean(userProfile?.locationTrackerEnabled && userProfile.latitude && userProfile.longitude)
  );
  const [showLocationGuideModal, setShowLocationGuideModal] = useState<boolean>(false);
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>(() => {
    try {
      const saved = localStorage.getItem('soma_distance_unit');
      if (saved === 'km' || saved === 'mi') return saved;
    } catch {}
    return 'km';
  });

  const handleSelectUnit = (unit: 'mi' | 'km') => {
    setDistanceUnit(unit);
    try {
      localStorage.setItem('soma_distance_unit', unit);
    } catch {}
  };

  // Search & Filter State (Discover cards matching Leaderboards)
  const [searchQuery, setSearchQuery] = useState('');
  const [discoverScope, setDiscoverScope] = useState<'worldwide' | 'country' | 'city'>('worldwide');
  const [localRadius, setLocalRadius] = useState<5 | 10 | 25 | 50>(25);

  const [selectedCountry, setSelectedCountry] = useState<string>(() => userProfile?.country || 'United States');
  const [countrySearchInput, setCountrySearchInput] = useState<string>('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);
  const countryInputContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [onlyMyLevel, setOnlyMyLevel] = useState<boolean>(false);
  // Radius Search Options: 5, 10, 25, 50, or unlimited (99999)
  const [searchRadiusMiles, setSearchRadiusMiles] = useState<number>(99999);
  const [statusTab, setStatusTab] = useState<'all' | 'mylevel' | 'pending' | 'connected'>('all');

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        countryInputContainerRef.current &&
        !countryInputContainerRef.current.contains(e.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCountryDropdownOpen]);

  const filteredWorldCountries = useMemo(() => {
    const q = countrySearchInput.trim().toLowerCase();
    if (!q) return ALL_WORLD_COUNTRIES;
    return ALL_WORLD_COUNTRIES.filter(c => c.toLowerCase().includes(q));
  }, [countrySearchInput]);

  // Suggested athletes state (5 users from area & international goal/level matches)
  const [suggestedAthletes, setSuggestedAthletes] = useState<SuggestedAthleteItem[]>([]);

  const handleRefreshSuggestions = () => {
    const fresh = getSuggestedAthletes(athletes, userArea, userProfile, userExperienceLevel);
    setSuggestedAthletes(fresh);
  };

  React.useEffect(() => {
    handleRefreshSuggestions();
  }, [athletes, userArea, userExperienceLevel, userProfile]);

  const locationScrollRef = React.useRef<HTMLDivElement>(null);
  const handleScrollLocation = (direction: 'left' | 'right') => {
    if (!locationScrollRef.current) return;
    locationScrollRef.current.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth'
    });
  };

  const myLifterId = getUserLifterId(userProfile);

  // 5 New members to the app in your area to connect to
  const newAreaMembers = useMemo(() => {
    return getNewMembersInArea(athletes, userArea, userProfile, 3);
  }, [athletes, userArea, userProfile]);

  const handleCopyMyId = async () => {
    try {
      await navigator.clipboard.writeText(myLifterId);
      showToast(`Copied your Lifter ID (${myLifterId})! Send to friends.`);
    } catch {
      showToast(`Your Lifter ID is ${myLifterId}`);
    }
  };

  const handleAddFriendDirect = () => {
    if (!searchQuery.trim()) return;
    const res = addFriendByQuery(searchQuery.trim());
    showToast(res.message);
    if (res.success && res.athlete) {
      onToggleConnection(res.athlete.id);
      setSearchQuery('');
    }
  };

  // Modals state
  const [inspectAthlete, setInspectAthlete] = useState<NearbyAthlete | null>(null);
  const [expandedAthleteIds, setExpandedAthleteIds] = useState<Record<string, boolean>>({});
  const [visibleBuddiesCount, setVisibleBuddiesCount] = useState<number>(5);
  const [visibleOtherCount, setVisibleOtherCount] = useState<number>(5);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [whatsAppAthlete, setWhatsAppAthlete] = useState<NearbyAthlete | null>(null);
  const [whatsAppInitialTab, setWhatsAppInitialTab] = useState<'message' | 'call'>('message');
  const [isEditingArea, setIsEditingArea] = useState<boolean>(false);
  const [tempAreaInput, setTempAreaInput] = useState<string>(userArea);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [showNearbyVisibilityInfoModal, setShowNearbyVisibilityInfoModal] = useState<boolean>(false);
  const [copyingAthleteId, setCopyingAthleteId] = useState<string | null>(null);
  const [previewWorkoutAthleteId, setPreviewWorkoutAthleteId] = useState<string | null>(null);
  const [customWorkoutTitleInput, setCustomWorkoutTitleInput] = useState<string>('');
  const [copiedWorkoutByAthleteId, setCopiedWorkoutByAthleteId] = useState<Record<string, string>>({});
  const renameInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (copyingAthleteId && renameInputRef.current) {
      const el = renameInputRef.current;
      el.focus();
      el.setSelectionRange(0, 0);
      el.scrollLeft = 0;
      requestAnimationFrame(() => {
        if (renameInputRef.current === el) {
          el.setSelectionRange(0, 0);
          el.scrollLeft = 0;
        }
      });
    }
  }, [copyingAthleteId]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const getDefaultAthleteWorkoutName = (athlete: NearbyAthlete) => {
    const firstName = athlete.name.split(' ')[0] || athlete.name;
    const splitName = athlete.workoutSplit || 'Strength & Hypertrophy Split';
    return `${firstName}'s ${splitName}`;
  };

  const buildAthleteWorkoutPlan = (athlete: NearbyAthlete, customTitle: string): WorkoutPlan => {
    const splitLower = (athlete.workoutSplit || '').toLowerCase();
    let routines: DailyWorkoutRoutine[];

    if (splitLower.includes('push') || splitLower.includes('ppl')) {
      routines = [
        {
          dayName: 'Day 1: Push (Chest, Shoulders & Triceps)',
          focus: 'Chest, Shoulders, Triceps',
          exercises: [
            { exerciseId: 'barbell_bench_press', name: 'Barbell Bench Press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_incline_bench_press', name: 'Incline Dumbbell Bench Press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_lateral_raise', name: 'Dumbbell Lateral Raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'cable_pushdown_with_rope_attachment', name: 'Cable Rope Triceps Pushdown', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 2: Pull (Back, Lats & Biceps)',
          focus: 'Back, Shoulders, Biceps',
          exercises: [
            { exerciseId: 'cable_wide_grip_lat_pulldown', name: 'Wide-Grip Lat Pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'barbell_bent_over_row', name: 'Barbell Bent-Over Row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'cable_rope_rear_delt_row', name: 'Cable Rope Rear Delt Row', defaultSets: 3, targetReps: '15', targetRpe: 9 },
            { exerciseId: 'barbell_curl', name: 'Barbell Biceps Curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 3: Legs (Quads, Hamstrings & Glutes)',
          focus: 'Quads, Hamstrings, Glutes, Calves',
          exercises: [
            { exerciseId: 'barbell_full_squat', name: 'Barbell Full Squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_romanian_deadlift', name: 'Barbell Romanian Deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'lever_leg_extension', name: 'Seated Leg Extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'lever_seated_leg_curl', name: 'Seated Leg Curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
            { exerciseId: 'barbell_standing_calf_raise', name: 'Standing Calf Raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
          ]
        }
      ];
    } else if (splitLower.includes('upper') || splitLower.includes('lower') || splitLower.includes('torso')) {
      routines = [
        {
          dayName: 'Day 1: Upper Body A (Heavy Compounds)',
          focus: 'Chest, Back, Shoulders, Arms',
          exercises: [
            { exerciseId: 'barbell_bench_press', name: 'Barbell Bench Press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_bent_over_row', name: 'Barbell Bent-Over Row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_standing_military_press', name: 'Standing Overhead Military Press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'cable_wide_grip_lat_pulldown', name: 'Wide-Grip Lat Pulldown', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
            { exerciseId: 'barbell_curl', name: 'Barbell Biceps Curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 2: Lower Body A (Quad & Glute Focus)',
          focus: 'Quads, Hamstrings, Glutes, Calves',
          exercises: [
            { exerciseId: 'barbell_full_squat', name: 'Barbell Full Squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_romanian_deadlift', name: 'Barbell Romanian Deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'lever_leg_extension', name: 'Seated Leg Extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'barbell_standing_calf_raise', name: 'Standing Calf Raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 3: Upper Body B (Hypertrophy & Arms)',
          focus: 'Chest, Back, Delts, Triceps, Biceps',
          exercises: [
            { exerciseId: 'dumbbell_incline_bench_press', name: 'Incline Dumbbell Bench Press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'cable_seated_row', name: 'Seated Cable Row', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_lateral_raise', name: 'Dumbbell Lateral Raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'cable_pushdown_with_rope_attachment', name: 'Cable Rope Triceps Pushdown', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'dumbbell_incline_curl', name: 'Incline Dumbbell Curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 4: Lower Body B (Posterior Chain & Hamstrings)',
          focus: 'Hamstrings, Glutes, Quads, Core',
          exercises: [
            { exerciseId: 'barbell_deadlift', name: 'Conventional Barbell Deadlift', defaultSets: 3, targetReps: '5', targetRpe: 9 },
            { exerciseId: 'sled_hack_squat', name: 'Machine Hack Squat', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'lever_seated_leg_curl', name: 'Seated Leg Curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
            { exerciseId: 'hanging_leg_raise', name: 'Hanging Leg Raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
          ]
        }
      ];
    } else if (splitLower.includes('arnold')) {
      routines = [
        {
          dayName: 'Day 1: Chest & Back Antagonist',
          focus: 'Chest, Back, Lats',
          exercises: [
            { exerciseId: 'barbell_bench_press', name: 'Barbell Bench Press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'cable_wide_grip_lat_pulldown', name: 'Wide-Grip Lat Pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_incline_bench_press', name: 'Incline Dumbbell Bench Press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'barbell_bent_over_row', name: 'Barbell Bent-Over Row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'cable_standing_fly', name: 'Standing Cable Chest Fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 2: Shoulders & Arms',
          focus: 'Shoulders, Biceps, Triceps',
          exercises: [
            { exerciseId: 'barbell_standing_military_press', name: 'Standing Overhead Military Press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_lateral_raise', name: 'Dumbbell Lateral Raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'barbell_curl', name: 'Barbell Biceps Curl', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'ez_barbell_lying_triceps_extension_skull_crusher', name: 'EZ-Bar Skull Crusher', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'cable_hammer_curl_with_rope', name: 'Cable Rope Hammer Curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 3: Legs & Lower Body',
          focus: 'Quads, Hamstrings, Glutes, Calves',
          exercises: [
            { exerciseId: 'barbell_full_squat', name: 'Barbell Full Squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_romanian_deadlift', name: 'Barbell Romanian Deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'lever_leg_extension', name: 'Seated Leg Extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'lever_seated_leg_curl', name: 'Seated Leg Curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
            { exerciseId: 'barbell_standing_calf_raise', name: 'Standing Calf Raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
          ]
        }
      ];
    } else {
      routines = [
        {
          dayName: 'Day 1: Full Body A (Squat & Press Focus)',
          focus: 'Quads, Chest, Back, Shoulders',
          exercises: [
            { exerciseId: 'barbell_full_squat', name: 'Barbell Full Squat', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_bench_press', name: 'Barbell Bench Press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_bent_over_row', name: 'Barbell Bent-Over Row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_lateral_raise', name: 'Dumbbell Lateral Raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'cable_pushdown_with_rope_attachment', name: 'Cable Rope Triceps Pushdown', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 2: Full Body B (Deadlift & Pull Focus)',
          focus: 'Hamstrings, Back, Shoulders, Arms',
          exercises: [
            { exerciseId: 'barbell_deadlift', name: 'Conventional Barbell Deadlift', defaultSets: 3, targetReps: '5', targetRpe: 9 },
            { exerciseId: 'barbell_standing_military_press', name: 'Standing Overhead Military Press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'cable_wide_grip_lat_pulldown', name: 'Wide-Grip Lat Pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_incline_bench_press', name: 'Incline Dumbbell Bench Press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'barbell_curl', name: 'Barbell Biceps Curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 3: Full Body C (Hypertrophy & Overload)',
          focus: 'Glutes, Quads, Chest, Back, Core',
          exercises: [
            { exerciseId: 'barbell_romanian_deadlift', name: 'Barbell Romanian Deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'sled_hack_squat', name: 'Machine Hack Squat', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
            { exerciseId: 'cable_seated_row', name: 'Seated Cable Row', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
            { exerciseId: 'cable_standing_fly', name: 'Standing Cable Chest Fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'hanging_leg_raise', name: 'Hanging Leg Raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
          ]
        }
      ];
    }

    return {
      id: `copied_athlete_plan_${athlete.id}_${Date.now()}`,
      title: customTitle.trim() || getDefaultAthleteWorkoutName(athlete),
      subtitle: `Copied from ${athlete.name} (${athlete.workoutSplit || 'Strength & Hypertrophy'})`,
      level: athlete.level || 'Intermediate',
      daysPerWeek: athlete.trainingDaysPerWeek || routines.length,
      goal: 'Strength & Size (Powerbuilding)',
      description: athlete.bio || `${athlete.name}'s ${athlete.workoutSplit || 'training split'} featuring ${athlete.favoriteLifts || 'compound progressive overload'}.`,
      badge: 'BUDDY WORKOUT',
      isPersonalized: true,
      routines
    };
  };

  const handleOpenCopyWorkout = (athlete: NearbyAthlete, openFullPreview = false) => {
    const existingSavedName = copiedWorkoutByAthleteId[athlete.id];
    setCopyingAthleteId(athlete.id);
    setCustomWorkoutTitleInput(existingSavedName || getDefaultAthleteWorkoutName(athlete));
    if (openFullPreview) {
      setPreviewWorkoutAthleteId(athlete.id);
    }
  };

  const handleCancelCopyWorkout = () => {
    setCopyingAthleteId(null);
    setPreviewWorkoutAthleteId(null);
  };

  const handleSaveAthleteWorkout = (athlete: NearbyAthlete) => {
    const finalName = customWorkoutTitleInput.trim() || getDefaultAthleteWorkoutName(athlete);
    const planToSave = buildAthleteWorkoutPlan(athlete, finalName);
    saveSharedPlanToMyCustomPlans(planToSave, true);
    setCopiedWorkoutByAthleteId(prev => ({ ...prev, [athlete.id]: finalName }));
    setCopyingAthleteId(null);
    setPreviewWorkoutAthleteId(null);
    showToast(`✅ Copied "${finalName}" straight to My Workouts!`);
  };

  const handleLocationDetected = (res: DetectedLocationResult) => {
    setUserLat(res.latitude);
    setUserLng(res.longitude);
    setLocationTrackerActive(true);
    onUpdateUserArea(res.formatted);
    showToast(`📍 Phone location tracker active: ${res.cityOrTown}, ${res.country}`);

    if (userProfile && onUpdateUserProfile) {
      onUpdateUserProfile({
        ...userProfile,
        cityOrTown: res.cityOrTown,
        stateOrProvince: res.stateOrProvince,
        country: res.country,
        zipOrPostalCode: res.zipOrPostalCode,
        homeTownAddress: res.formatted,
        latitude: res.latitude,
        longitude: res.longitude,
        locationTrackerEnabled: true
      });
    }
  };

  const handleOpenWhatsApp = (
    athlete: NearbyAthlete,
    tab: 'message' | 'call' = 'message',
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setWhatsAppAthlete(athlete);
    setWhatsAppInitialTab(tab);
  };

  const handleConnectionClick = (athlete: NearbyAthlete, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleConnection(athlete.id);
    if (athlete.connectionStatus === 'none') {
      showToast(`Connection request sent to ${athlete.name}! ⏳`);
    } else if (athlete.connectionStatus === 'pending') {
      showToast(`Cancelled request to ${athlete.name}.`);
    } else {
      showToast(`Removed ${athlete.name} from gym buddies.`);
    }
  };

  const handleSaveArea = () => {
    if (tempAreaInput.trim()) {
      onUpdateUserArea(tempAreaInput.trim());
      setIsEditingArea(false);
      showToast(`Your training area updated to ${tempAreaInput.trim()}`);
    }
  };

  // Compute dynamic distances based on device location tracker if available
  const athletesWithComputedDistances = useMemo(() => {
    return athletes.map(a => {
      let computedMiles = a.distanceMiles;
      if (userLat !== undefined && userLng !== undefined && a.latitude && a.longitude) {
        computedMiles = calculateDistanceMiles(userLat, userLng, a.latitude, a.longitude);
      }
      const computedKm = Math.round(computedMiles * 1.60934 * 10) / 10;
      return {
        ...a,
        computedMiles,
        computedKm
      };
    });
  }, [athletes, userLat, userLng]);

  // Helper to check own user profile
  const isOwnUser = (a: NearbyAthlete) =>
    a.id === 'ath_current_user' ||
    a.id === 'u_me' ||
    (userName && a.name?.trim().toLowerCase() === userName.trim().toLowerCase());

  const REMOVED_SEARCH_ATHLETE_IDS = new Set([
    'ath_aus_4',
    'ath_aus_7',
    'ath_lax_1',
    'ath_lon_2',
    'ath_lon_3',
    'ath_tor_1'
  ]);

  // Filtered athletes computation
  const filteredAthletes = useMemo(() => {
    const filtered = athletesWithComputedDistances.filter(a => {
      if (isOwnUser(a)) return false;
      if (a.connectionStatus === 'incoming_request' || REMOVED_SEARCH_ATHLETE_IDS.has(a.id)) {
        return false;
      }

      // 1. Text Search Filter (name, uniqueId, gym, area, city, state, country, zip)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim().replace(/^#/, '');
        const matchesQuery =
          a.name.toLowerCase().includes(q) ||
          (a.uniqueId && a.uniqueId.toLowerCase().includes(q)) ||
          (a.uniqueId && a.uniqueId.toLowerCase().replace('soma-', '').includes(q)) ||
          a.gymName.toLowerCase().includes(q) ||
          a.area.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          (a.cityOrTown && a.cityOrTown.toLowerCase().includes(q)) ||
          (a.stateOrProvince && a.stateOrProvince.toLowerCase().includes(q)) ||
          (a.country && a.country.toLowerCase().includes(q)) ||
          (a.zipOrPostalCode && a.zipOrPostalCode.toLowerCase().includes(q)) ||
          a.favoriteLifts.toLowerCase().includes(q) ||
          a.workoutSplit.toLowerCase().includes(q) ||
          a.bio.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Gender Filter
      if (selectedGender !== 'all') {
        if (!a.gender || a.gender.toLowerCase() !== selectedGender.toLowerCase()) {
          return false;
        }
      }

      // 2. Discover Scope Filter (Worldwide, Country, My location / Radius)
      if (discoverScope === 'country') {
        const target = selectedCountry.toLowerCase().trim();
        const c = `${a.country || ''} ${a.area || ''} ${a.city || ''} ${a.cityOrTown || ''}`.toLowerCase();
        const isUsaMatch =
          (target === 'united states' || target === 'usa' || target === 'us') &&
          (c.includes('united states') || c.includes('usa') || /\bus\b/.test(c));
        const isUkMatch =
          (target === 'united kingdom' || target === 'uk') &&
          (c.includes('united kingdom') || c.includes('uk') || c.includes('england') || c.includes('london'));
        if (!c.includes(target) && !isUsaMatch && !isUkMatch) return false;
      } else if (discoverScope === 'city') {
        const athleteDist = distanceUnit === 'km' ? a.computedKm : a.computedMiles;
        if (athleteDist > localRadius) {
          return false;
        }
      }

      // 3. Level Filter
      if (onlyMyLevel) {
        if (!a.level.toLowerCase().includes(userExperienceLevel.toLowerCase())) {
          return false;
        }
      } else if (selectedLevel !== 'all') {
        const lvlLower = selectedLevel.toLowerCase();
        const matchesLevel =
          a.level.toLowerCase().includes(lvlLower) ||
          (a.badge && a.badge.toLowerCase().includes(lvlLower));
        if (!matchesLevel) {
          return false;
        }
      }

      // 4. Status Tab
      if (statusTab === 'mylevel') {
        if (!a.level.toLowerCase().includes(userExperienceLevel.toLowerCase())) return false;
      } else if (statusTab === 'pending') {
        if (a.connectionStatus !== 'pending') return false;
      } else if (statusTab === 'connected') {
        if (a.connectionStatus !== 'connected') return false;
      }

      return true;
    });

    if (discoverScope === 'country' && filtered.length === 0) {
      const seed = selectedCountry.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const fallbackAthletes: Array<NearbyAthlete & { computedMiles: number; computedKm: number }> = [
        {
          id: `nat_disc_${seed}_1`,
          uniqueId: `SOMA-${1000 + (seed % 8999)}`,
          name: `${selectedCountry} Pro Lifter`,
          avatarSeed: `${selectedCountry}Pro`,
          gymName: `${selectedCountry} Iron Club`,
          area: `Capital District, ${selectedCountry}`,
          city: selectedCountry,
          country: selectedCountry,
          distanceMiles: 4.2,
          computedMiles: 4.2,
          computedKm: 6.8,
          level: 'Elite',
          streakDays: 24 + (seed % 40),
          badge: 'ELITE',
          favoriteLifts: 'Squat · Bench · Deadlift',
          workoutSplit: 'Push / Pull / Legs',
          primaryGoal: 'Strength & Power',
          trainingDaysPerWeek: 5,
          bio: `Dedicated strength athlete training in ${selectedCountry}.`,
          lastActive: 'Active today',
          connectionStatus: 'none'
        },
        {
          id: `nat_disc_${seed}_2`,
          uniqueId: `SOMA-${2000 + (seed % 7999)}`,
          name: `Alex ${selectedCountry.slice(0, 3).toUpperCase()}`,
          avatarSeed: `Alex${selectedCountry}`,
          gymName: `Metro Barbell ${selectedCountry}`,
          area: `Central, ${selectedCountry}`,
          city: selectedCountry,
          country: selectedCountry,
          distanceMiles: 7.5,
          computedMiles: 7.5,
          computedKm: 12.1,
          level: 'Intermediate',
          streakDays: 14 + (seed % 25),
          badge: 'PRO',
          favoriteLifts: 'Incline Press · Pull-Ups',
          workoutSplit: 'Upper / Lower Split',
          primaryGoal: 'Hypertrophy',
          trainingDaysPerWeek: 4,
          bio: `Consistent hypertrophy & compound lifting in ${selectedCountry}.`,
          lastActive: 'Active 2h ago',
          connectionStatus: 'none'
        },
        {
          id: `nat_disc_${seed}_3`,
          uniqueId: `SOMA-${3000 + (seed % 6999)}`,
          name: `Jordan V. (${selectedCountry})`,
          avatarSeed: `Jordan${selectedCountry}`,
          gymName: `Performance Center ${selectedCountry}`,
          area: `North, ${selectedCountry}`,
          city: selectedCountry,
          country: selectedCountry,
          distanceMiles: 11.0,
          computedMiles: 11.0,
          computedKm: 17.7,
          level: 'Intermediate',
          streakDays: 9 + (seed % 20),
          badge: 'LIFTER',
          favoriteLifts: 'Deadlift · Overhead Press',
          workoutSplit: 'Full Body Strength',
          primaryGoal: 'Strength & Conditioning',
          trainingDaysPerWeek: 4,
          bio: `Chasing new PRs every week in ${selectedCountry}.`,
          lastActive: 'Active today',
          connectionStatus: 'none'
        }
      ];
      return fallbackAthletes;
    }

    // Group connected gym buddies together, incoming requests, and sort by proximity
    const getStatusPriority = (status: NearbyAthlete['connectionStatus']) => {
      if (status === 'connected') return 0;
      if (status === 'incoming_request') return 1;
      if (status === 'pending') return 2;
      return 3;
    };

    return [...filtered].sort((a, b) => {
      const priorityDiff = getStatusPriority(a.connectionStatus) - getStatusPriority(b.connectionStatus);
      if (priorityDiff !== 0) return priorityDiff;

      const distA = distanceUnit === 'km' ? a.computedKm : a.computedMiles;
      const distB = distanceUnit === 'km' ? b.computedKm : b.computedMiles;
      return distA - distB;
    });
  }, [
    athletesWithComputedDistances,
    searchQuery,
    selectedGender,
    discoverScope,
    selectedCountry,
    localRadius,
    selectedLevel,
    onlyMyLevel,
    distanceUnit,
    statusTab,
    userExperienceLevel,
    userName
  ]);

  const incomingCount = athletes.filter(a => a.connectionStatus === 'incoming_request' && !isOwnUser(a)).length;
  const pendingCount = athletes.filter(a => a.connectionStatus === 'pending' && !isOwnUser(a)).length;
  const connectedCount = athletes.filter(a => a.connectionStatus === 'connected' && !isOwnUser(a)).length;

  // Active filter indicator & reset
  const isAnyFilterActive =
    Boolean(searchQuery.trim()) ||
    discoverScope !== 'worldwide' ||
    selectedLevel !== 'all' ||
    selectedGender !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setDiscoverScope('worldwide');
    setSelectedCountry(userProfile?.country || 'United States');
    setCountrySearchInput('');
    setIsCountryDropdownOpen(false);
    setSelectedLevel('all');
    setSelectedGender('all');
    setLocalRadius(25);
    setSearchRadiusMiles(99999);
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-20 right-6 z-50 p-3.5 rounded-2xl bg-zinc-900 border border-amber-400 text-zinc-100 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {mode !== 'discover_only' && mode !== 'gym_buddies_only' && (
        <>
          {/* 5 New Members in Your Area (Minimalistic) */}
          <NewAreaMembersCard
            athletes={newAreaMembers}
            userArea={userArea}
            onToggleConnection={onToggleConnection}
            onOpenProfile={ath => setInspectAthlete(ath)}
            distanceUnit={distanceUnit}
          />

          {/* Suggested Users Section (Random 5 users matching Area & International Goal/Level with Refresh) */}
          <SuggestedUsersCard
            suggestions={suggestedAthletes}
            onRefresh={handleRefreshSuggestions}
            onToggleConnection={onToggleConnection}
            onOpenProfile={ath => setInspectAthlete(ath)}
            allAthletes={athletes}
            userProfile={userProfile}
            userArea={userArea}
            distanceUnit={distanceUnit}
          />
        </>
      )}



      {/* ===================================================================== */}
      {/* DISCOVER CONTROLS (EXACT SAME AS LEADERBOARDS: SCOPE, METRICS, SEARCH) */}
      {/* ===================================================================== */}
      {mode !== 'gym_buddies_only' && (
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 space-y-4 shadow-xs">
        <div className="flex flex-col gap-3 pb-3 border-b border-zinc-800">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-zinc-100">Discover Lifters & Athletes</h2>
            <p className="text-xs text-zinc-400">
              Find gym buddies, search by location radius or country, and connect with lifters
            </p>
          </div>

          {/* Scope Selector Tabs: Worldwide, Country, My location */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1">
              {[
                { id: 'worldwide', label: 'Worldwide' },
                { id: 'country', label: 'Country' },
                { id: 'city', label: 'My location' }
              ].map(tab => {
                const isActive = discoverScope === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      setDiscoverScope(tab.id as 'worldwide' | 'country' | 'city');
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
        </div>

        {/* Country Sub-Control Card */}
        {discoverScope === 'country' && (
          <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Flag className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Country Search:</span>
                <span className="text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                  {selectedCountry}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {filteredAthletes.length} lifters in {selectedCountry}
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
                        setSelectedCountry(found);
                        setVisibleOtherCount(5);
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
                        const isSelected = selectedCountry.toLowerCase() === c.toLowerCase();
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setCountrySearchInput('');
                              setIsCountryDropdownOpen(false);
                              setVisibleOtherCount(5);
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
                    value={selectedCountry}
                    onChange={e => {
                      setSelectedCountry(e.target.value);
                      setCountrySearchInput('');
                      setIsCountryDropdownOpen(false);
                      setVisibleOtherCount(5);
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

        {/* My Location / Radius Sub-Control Card */}
        {discoverScope === 'city' && (
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
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      localRadius === r
                        ? 'bg-amber-400 text-zinc-950 shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {r}{distanceUnit === 'km' ? 'km' : 'mi'}
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
                    onClick={() => handleSelectUnit('km')}
                    className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                      distanceUnit === 'km'
                        ? 'bg-amber-400 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    km
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectUnit('mi')}
                    className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                      distanceUnit === 'mi'
                        ? 'bg-amber-400 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    mile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Users Input (name, unique ID, gym, city, or bio) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search athletes by name, @LifterID, gym, city, or bio..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleAddFriendDirect();
                }
              }}
              className="w-full pl-9 pr-8 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/80 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={handleAddFriendDirect}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
              title="Add lifter directly by ID or name"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Lifter</span>
            </button>
          )}
        </div>
      </div>
      )}

      {/* NEARBY ATHLETES / LIFTERS LIST */}
      <div className="space-y-4">
        {/* Athletes Feed / Cards List (Default User Card Design matching article:nth-of-type(2)) */}
          {filteredAthletes.length === 0 && mode !== 'gym_buddies_only' ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 text-center space-y-3 shadow-xs">
              <MapPin className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="font-bold text-sm text-zinc-200">No lifters found within selected scope</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Try expanding your search to Worldwide, or search by a major city/country.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDiscoverScope('worldwide');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase cursor-pointer"
                >
                  Set to Worldwide
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            (() => {
              const connectedBuddies = discoverScope === 'country' && mode !== 'gym_buddies_only'
                ? []
                : filteredAthletes.filter(
                    a => a.connectionStatus === 'connected' && !isOwnUser(a)
                  );
              const otherAthletes = mode === 'gym_buddies_only'
                ? []
                : discoverScope === 'country'
                ? filteredAthletes.filter(
                    a => a.connectionStatus !== 'incoming_request' && !REMOVED_SEARCH_ATHLETE_IDS.has(a.id) && !isOwnUser(a)
                  )
                : filteredAthletes.filter(
                    a => a.connectionStatus !== 'connected' && a.connectionStatus !== 'incoming_request' && !REMOVED_SEARCH_ATHLETE_IDS.has(a.id) && !isOwnUser(a)
                  );
              const displayedBuddies = connectedBuddies.slice(0, visibleBuddiesCount);
              const hasMoreBuddies = visibleBuddiesCount < connectedBuddies.length;
              const canCollapseBuddies = visibleBuddiesCount > 5;

              const displayedOtherAthletes = otherAthletes.slice(0, visibleOtherCount);
              const hasMoreOtherAthletes = visibleOtherCount < otherAthletes.length;
              const canShowLessOtherAthletes = visibleOtherCount > 5;

              const renderAthleteCard = (
                athlete: NearbyAthlete & { computedMiles: number; computedKm: number }
              ) => {
                if ((statusTab === 'pending' || athlete.connectionStatus === 'incoming_request' || athlete.connectionStatus === 'pending') && isOwnUser(athlete)) {
                  return null;
                }

                const isLevelMatch = athlete.level
                  .toLowerCase()
                  .includes(userExperienceLevel.toLowerCase());
                const isExpanded = !!expandedAthleteIds[athlete.id];
                const toggleExpand = () => {
                  setExpandedAthleteIds(prev => ({ ...prev, [athlete.id]: !isExpanded }));
                };

                const displayDist =
                  distanceUnit === 'mi'
                    ? `${athlete.computedMiles} mi`
                    : `${athlete.computedKm} km`;

                const formattedAddress = formatAddressSequence(
                  athlete.cityOrTown || athlete.city,
                  athlete.stateOrProvince,
                  athlete.country,
                  athlete.zipOrPostalCode
                );

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
                          fallbackInitials={athlete.name.substring(0, 2).toUpperCase()}
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                            <span className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                              {athlete.name}
                            </span>
                            {athlete.id === 'ath_current_user' && (
                              <span className="text-[10px] text-amber-400 font-medium">· You</span>
                            )}
                            {athlete.uniqueId && (
                              <span className="text-[10px] font-mono text-zinc-500">
                                #{athlete.uniqueId}
                              </span>
                            )}
                          </div>

                          {/* Unboxed clean metadata line */}
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 leading-tight flex-wrap mt-0.5">
                            <span className="text-zinc-300 font-medium">{athlete.badge || athlete.level}</span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-400 text-[10px] font-mono">{displayDist}</span>
                          </div>
                        </div>
                      </div>

                      {/* Top Right Utility Actions & Small Expand/Collapse Button */}
                      <div className="flex items-center gap-1 shrink-0">
                        {athlete.connectionStatus === 'incoming_request' ? (
                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                if (onAcceptConnection) {
                                  onAcceptConnection(athlete.id);
                                } else {
                                  onToggleConnection(athlete.id);
                                }
                                showToast(`Accepted ${athlete.name}'s request! You are now gym buddies 🎉`);
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                              title="Accept connection request"
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onRejectConnection) {
                                  onRejectConnection(athlete.id);
                                } else {
                                  onToggleConnection(athlete.id);
                                }
                                showToast(`Declined request from ${athlete.name}.`);
                              }}
                              className="p-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                              title="Decline connection request"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : athlete.connectionStatus === 'connected' && mode !== 'discover_only' ? (
                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={e => handleOpenWhatsApp(athlete, 'message', e)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Send WhatsApp Message"
                            >
                              <MessageCircle className="w-3 h-3 fill-current" />
                              <span>Chat</span>
                            </button>
                            <button
                              type="button"
                              onClick={e => handleOpenWhatsApp(athlete, 'call', e)}
                              className="p-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 cursor-pointer"
                              title="Call on WhatsApp"
                            >
                              <Phone className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={e => handleConnectionClick(athlete, e)}
                              className="p-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 cursor-pointer"
                              title="Connected Gym Buddy - Click to disconnect"
                            >
                              <UserCheck className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={e => handleConnectionClick(athlete, e)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                              athlete.connectionStatus === 'pending'
                                ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 border-amber-400 font-bold'
                            }`}
                            title={athlete.connectionStatus === 'pending' ? 'Request Pending' : 'Connect with lifter'}
                          >
                            {athlete.connectionStatus === 'pending' ? (
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
                        )}

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
                            <span className="text-[11px] text-zinc-500 block">Experience</span>
                            <span className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${isLevelMatch ? 'text-amber-400' : 'text-zinc-100'}`}>
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
                            <span className="text-[11px] text-zinc-500 block">Active Streak</span>
                            <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1 truncate">
                              <Trophy className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{athlete.streakDays}d streak</span>
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
                                  {formattedAddress || athlete.area}
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
                                    Key Compounds · {athlete.primaryGoal || 'Hypertrophy & Strength'}
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

                          {/* Copy Workout to My Workouts Section (with Rename & View Full Workout Options) */}
                          <div className="p-3.5 sm:px-4 sm:py-3 bg-zinc-950/90 space-y-2.5">
                            {copyingAthleteId === athlete.id ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <label className="text-xs sm:text-[13px] font-bold text-amber-400 flex items-center gap-1.5">
                                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Rename Workout Before Saving</span>
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {customWorkoutTitleInput && (
                                      <button
                                        type="button"
                                        onClick={() => setCustomWorkoutTitleInput('')}
                                        className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-white cursor-pointer"
                                      >
                                        Clear Text
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <input
                                    ref={renameInputRef}
                                    type="text"
                                    value={customWorkoutTitleInput}
                                    onChange={e => setCustomWorkoutTitleInput(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveAthleteWorkout(athlete);
                                      } else if (e.key === 'Escape') {
                                        handleCancelCopyWorkout();
                                      }
                                    }}
                                    placeholder={getDefaultAthleteWorkoutName(athlete)}
                                    className="w-full min-w-0 px-3.5 py-3 sm:py-2.5 min-h-[46px] rounded-xl bg-zinc-900 border-2 border-amber-400/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 text-sm font-semibold text-zinc-100 placeholder:text-zinc-500 focus:outline-none shadow-inner"
                                  />

                                  {/* Action Buttons: View Full Workout, Save to My Workouts, Cancel */}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewWorkoutAthleteId(prev =>
                                          prev === athlete.id ? null : athlete.id
                                        )
                                      }
                                      className="flex-1 sm:flex-initial min-h-[42px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-400/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                    >
                                      {previewWorkoutAthleteId === athlete.id ? (
                                        <>
                                          <EyeOff className="w-3.5 h-3.5 shrink-0" />
                                          <span>Hide Full Workout</span>
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="w-3.5 h-3.5 shrink-0" />
                                          <span>View Full Workout</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSaveAthleteWorkout(athlete)}
                                      className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-sm"
                                    >
                                      <Check className="w-4 h-4 stroke-[2.5]" />
                                      <span>Save to My Workouts</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={handleCancelCopyWorkout}
                                      className="min-h-[42px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Cancel</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Full Workout Preview Breakdown Before Saving */}
                                {previewWorkoutAthleteId === athlete.id && (() => {
                                  const previewPlan = buildAthleteWorkoutPlan(
                                    athlete,
                                    customWorkoutTitleInput || getDefaultAthleteWorkoutName(athlete)
                                  );
                                  return (
                                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-400/30 space-y-2.5">
                                      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                                        <div>
                                          <span className="text-xs font-bold text-zinc-100 block">
                                            {previewPlan.title}
                                          </span>
                                          <span className="text-[10px] font-mono text-amber-400">
                                            {previewPlan.routines.length} Workout Sessions · {previewPlan.daysPerWeek}d / week
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => setPreviewWorkoutAthleteId(null)}
                                          className="text-[11px] text-zinc-400 hover:text-zinc-200 font-medium cursor-pointer"
                                        >
                                          Collapse Preview
                                        </button>
                                      </div>

                                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                        {previewPlan.routines.map((rt, rIdx) => (
                                          <div
                                            key={rIdx}
                                            className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800/80 space-y-1.5"
                                          >
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="text-xs font-bold text-amber-400">
                                                {rt.dayName}
                                              </span>
                                              <span className="text-[10px] font-mono text-zinc-400">
                                                {rt.exercises.length} exercises
                                              </span>
                                            </div>
                                            <div className="divide-y divide-zinc-900">
                                              {rt.exercises.map((ex, exIdx) => (
                                                <div
                                                  key={exIdx}
                                                  className="py-1 flex items-center justify-between gap-2 text-[11px]"
                                                >
                                                  <span className="text-zinc-200 font-medium truncate">
                                                    {exIdx + 1}. {ex.name || ex.exerciseId.replace(/_/g, ' ')}
                                                  </span>
                                                  <span className="font-mono text-zinc-400 shrink-0">
                                                    {ex.defaultSets} × {ex.targetReps} · RPE {ex.targetRpe}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/35 text-amber-400 flex items-center justify-center shrink-0">
                                    <Copy className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-xs sm:text-sm font-bold text-zinc-100 block truncate">
                                      {copiedWorkoutByAthleteId[athlete.id] || getDefaultAthleteWorkoutName(athlete)}
                                    </span>
                                    <span className="text-[11px] text-zinc-400 block truncate">
                                      {copiedWorkoutByAthleteId[athlete.id]
                                        ? 'Saved in My Workouts · Tap Rename to edit workout name'
                                        : `${athlete.trainingDaysPerWeek || 4}d/wk split · View, rename & copy straight to My Workouts`}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                                  {copiedWorkoutByAthleteId[athlete.id] && (
                                    <span className="px-2.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[11px] flex items-center justify-center gap-1 shrink-0">
                                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                      <span>Copied</span>
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCopyWorkout(athlete, true)}
                                    className="flex-1 sm:flex-initial min-h-[40px] px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                    title="View full workout before saving"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                                    <span>View Full Workout</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCopyWorkout(athlete, false)}
                                    className="flex-1 sm:flex-initial min-h-[40px] px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-400/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                    title="Rename workout before saving"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCopyWorkout(athlete, false)}
                                    className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                                    title="Copy this workout to My Workouts"
                                  >
                                    <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>
                                      {copiedWorkoutByAthleteId[athlete.id] ? 'Copy Again' : 'Copy to My Workouts'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Incoming Request Message Quote (if present) */}
                        {athlete.connectionStatus === 'incoming_request' && athlete.inviteMessage && (
                          <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/25 text-xs text-amber-200/90 italic flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>"{athlete.inviteMessage}"</span>
                          </div>
                        )}

                        {/* 5. BOTTOM COLLAPSE ICON BUTTON */}
                        <div className="pt-2 flex items-center justify-center border-t border-zinc-800/60">
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
              };

              return (
                <div className="max-w-3xl mx-auto space-y-2.5">
                  {/* Gym Buddies Section Card (Hidden on Search / discover_only page) */}
                  {connectedBuddies.length > 0 && mode !== 'discover_only' && (
                    <div className="p-3 sm:p-4 rounded-2xl bg-zinc-900/80 border border-[#F6721D]/80 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
                            Gym Buddies
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {connectedBuddies.length}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {displayedBuddies.map(athlete => renderAthleteCard(athlete))}
                      </div>

                      {connectedBuddies.length > 5 && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {canCollapseBuddies && (
                            <button
                              type="button"
                              onClick={() => setVisibleBuddiesCount(5)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
                            >
                              Collapse
                            </button>
                          )}
                          {hasMoreBuddies && (
                            <button
                              type="button"
                              onClick={() => setVisibleBuddiesCount(prev => prev + 5)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer transition-colors"
                            >
                              Load 5 More
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discover Athletes Section Card */}
                  {otherAthletes.length > 0 && (
                    <div className="p-3 sm:p-4 rounded-2xl bg-zinc-900/80 border border-[#F6721D]/80 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Users className="w-4 h-4 text-amber-400 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
                            Discover Athletes
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                            {otherAthletes.length}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {displayedOtherAthletes.map(athlete => renderAthleteCard(athlete))}
                      </div>

                      {otherAthletes.length > 5 && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {canShowLessOtherAthletes && (
                            <button
                              type="button"
                              onClick={() => setVisibleOtherCount(5)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
                            >
                              Collapse
                            </button>
                          )}
                          {hasMoreOtherAthletes && (
                            <button
                              type="button"
                              onClick={() => setVisibleOtherCount(prev => prev + 5)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer transition-colors"
                            >
                              Load 5 More
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>

      {/* Athlete Detail Modal */}
      {inspectAthlete && (
        <AthleteDetailModal
          athlete={inspectAthlete}
          onClose={() => setInspectAthlete(null)}
          onToggleConnection={onToggleConnection}
          onAcceptRequest={onAcceptConnection}
          onRejectRequest={onRejectConnection}
          onOpenWhatsApp={handleOpenWhatsApp}
          distanceUnit={distanceUnit}
          isOwnProfile={inspectAthlete.id === 'ath_current_user'}
          userProfile={userProfile}
          onUpdateBio={(newBio) => {
            if (userProfile && onUpdateUserProfile) {
              const updated = { ...userProfile, bio: newBio };
              onUpdateUserProfile(updated);
            }
          }}
          rewardsProfile={rewardsProfile}
        />
      )}

      {/* Invite Share Modal */}
      {showInviteModal && (
        <InviteShareModal
          userArea={userArea}
          myLifterId={myLifterId}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* WhatsApp Connect Modal */}
      {whatsAppAthlete && (
        <WhatsAppConnectModal
          athlete={whatsAppAthlete}
          initialTab={whatsAppInitialTab}
          onClose={() => setWhatsAppAthlete(null)}
          onUpdatePhone={onUpdateAthletePhone}
        />
      )}

      {/* Nearby Lifters Search Permission Info Modal */}
      {showNearbyVisibilityInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 text-zinc-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Nearby Lifters Visibility
                  </h3>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                    Privacy & Community Discovery
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNearbyVisibilityInfoModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850">
              <div className="space-y-1">
                <span className="font-bold text-zinc-200 block text-xs">
                  Why is this needed?
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Enabling nearby visibility allows local gym athletes and lifters in your town, city, or fitness center to discover your profile when looking for workout partners, spotters, or friendly PR motivation.
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 space-y-1">
                <span className="font-bold text-zinc-200 block text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Your Privacy Is Protected</span>
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Your exact home address, street number, and coordinates are <strong className="text-zinc-200">never published</strong>. Only your general city/town area and gym name are used for approximate distance calculations.
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 space-y-1">
                <span className="font-bold text-amber-400 block text-xs">
                  Updated Here in the Community Section
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  You can toggle this permission anytime here in the Community section. Switching it off instantly removes you from nearby lifter discovery.
                </p>
              </div>
            </div>

            {/* Permission Option Buttons */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">
                Give Permission For Nearby Search:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateUserProfile && userProfile) {
                      onUpdateUserProfile({
                        ...userProfile,
                        shareLocationForSocialSearch: true
                      });
                      showToast('✅ You are now visible in nearby lifter search.');
                    }
                    setShowNearbyVisibilityInfoModal(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                    userProfile?.shareLocationForSocialSearch !== false
                      ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Allow & Be Visible</span>
                  <span className="text-[9px] font-normal opacity-80">Lifters can find you</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateUserProfile && userProfile) {
                      onUpdateUserProfile({
                        ...userProfile,
                        shareLocationForSocialSearch: false
                      });
                      showToast('🔒 You are now hidden from nearby lifter search.');
                    }
                    setShowNearbyVisibilityInfoModal(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                    userProfile?.shareLocationForSocialSearch === false
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>Keep Hidden</span>
                  <span className="text-[9px] font-normal opacity-80">Do not show in search</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowNearbyVisibilityInfoModal(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone & Device Location Tracker Permission & Guidance Modal */}
      {showLocationGuideModal && (
        <DeviceLocationGuideModal
          onLocationDetected={handleLocationDetected}
          onClose={() => setShowLocationGuideModal(false)}
        />
      )}
    </div>
  );
};
