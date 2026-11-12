import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronDown,
  X,
  MapPin,
  Crown,
  Lock,
  Navigation,
  Globe,
  Building2,
  Scale,
  Compass,
  Camera,
  Info,
  ShieldCheck,
  Watch,
  Heart,
  Zap,
  Flame,
  Activity,
  Bluetooth,
  AlertTriangle,
  CheckCircle2,
  User,
  Search
} from 'lucide-react';
import {
  UserProfile,
  UserGender,
  ExperienceLevel,
  FitnessGoal,
  AiProgramRecommendation,
  WorkoutPlan,
  EquipmentAccessType,
  FitnessSection,
  ConnectedDevice
} from '../../types';
import { generateAiRecommendation } from '../../utils/aiProgramEngine';
import { ENVIRONMENT_LIST, accessTypeToEnvironment } from '../../data/equipmentEnvironments';
import { TermHelpTooltip } from '../common/TermHelpTooltip';
import { AppTheme, getConnectedDevices, saveConnectedDevices } from '../../utils/storage';
import { DeviceLocationGuideModal, DetectedLocationResult } from '../common/DeviceLocationGuideModal';
import { formatAddressSequence } from '../../utils/geoDistance';
import { GymAvatar } from '../common/GymAvatar';
import { AvatarSelectorModal } from '../common/AvatarSelectorModal';
import { FitnessTrackerModal } from '../devices/FitnessTrackerModal';
import { RestDaysInfoModal } from '../common/RestDaysInfoModal';
import { MetricExplanationModal, MetricType } from '../common/MetricExplanationModal';
import { WORLD_CITIES_DIRECTORY, WorldCityOption } from '../../data/worldCities';
import { ALL_WORLD_COUNTRIES } from '../../data/worldCountries';

interface OnboardingFlowModalProps {
  onComplete: (profile: UserProfile, aiPlan?: WorkoutPlan) => void;
  initialProfile?: UserProfile | null;
  initialStep?: number;
  onClose?: () => void;
  currentTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  onOpenTerms?: () => void;
  initialWeightUnit?: 'kg' | 'lbs';
  initialDistanceUnit?: 'mi' | 'km';
  connectedDevices?: ConnectedDevice[];
  onToggleDevice?: (deviceId: string) => void;
}

export const OnboardingFlowModal: React.FC<OnboardingFlowModalProps> = ({
  onComplete,
  initialProfile,
  initialStep = 1,
  onClose,
  currentTheme = 'dark',
  onSelectTheme,
  onOpenTerms,
  initialWeightUnit,
  initialDistanceUnit,
  connectedDevices: propConnectedDevices,
  onToggleDevice: propOnToggleDevice
}) => {
  const [step, setStep] = useState<number>(initialStep || 1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<AiProgramRecommendation | null>(null);

  // Preferred Units: Weight (lbs/kg) & Distance (mi/km)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(() => {
    if (initialProfile?.weightUnit) return initialProfile.weightUnit;
    if (initialWeightUnit) return initialWeightUnit;
    try {
      const raw = localStorage.getItem('aesthetix_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.weightUnit === 'lbs' || parsed.weightUnit === 'kg') return parsed.weightUnit;
      }
    } catch {}
    return 'kg';
  });

  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>(() => {
    if (initialProfile?.distanceUnit) return initialProfile.distanceUnit;
    if (initialDistanceUnit) return initialDistanceUnit;
    try {
      const saved = localStorage.getItem('soma_distance_unit');
      if (saved === 'km' || saved === 'mi') return saved;
    } catch {}
    return 'km';
  });

  // Form Fields
  const [name, setName] = useState<string>(initialProfile?.name || 'Alex Hunter');
  const [avatarType, setAvatarType] = useState<'upload' | 'animated'>(
    initialProfile?.avatarType || (initialProfile?.avatarUrl ? 'upload' : 'animated')
  );
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialProfile?.avatarUrl);
  const [avatarId, setAvatarId] = useState<string | undefined>(
    initialProfile?.avatarId ||
      (initialProfile?.gender === 'female' || initialProfile?.gender === 'woman' ? 'gym_w1' : 'gym_m1')
  );
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [age, setAge] = useState<number>(initialProfile?.age || 26);
  const [gender, setGender] = useState<UserGender>(() => {
    if (initialProfile?.gender) {
      if (initialProfile.gender === 'female' || initialProfile.gender === 'woman') return 'woman';
      if (initialProfile.gender === 'male' || initialProfile.gender === 'man') return 'man';
      return initialProfile.gender;
    }
    return 'man';
  });
  const [heightCm, setHeightCm] = useState<number>(initialProfile?.heightCm || 180);

  // Bodyweight input in the user's active weight unit (auto-converts when unit changes)
  const [weightDisplay, setWeightDisplay] = useState<number>(() => {
    const baseKg = initialProfile?.weightKg || 82.5;
    const currentUnit = initialProfile?.weightUnit || initialWeightUnit || 'kg';
    return currentUnit === 'lbs'
      ? Math.round(baseKg * 2.20462 * 10) / 10
      : baseKg;
  });

  const handleSelectWeightUnit = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === weightUnit) return;
    setWeightUnit(newUnit);
    if (newUnit === 'lbs') {
      const inLbs = Math.round(weightDisplay * 2.20462 * 10) / 10;
      setWeightDisplay(inLbs);
    } else {
      const inKg = Math.round((weightDisplay / 2.20462) * 10) / 10;
      setWeightDisplay(inKg);
    }
  };

  const handleSelectDistanceUnit = (newUnit: 'km' | 'mi') => {
    setDistanceUnit(newUnit);
    try {
      localStorage.setItem('soma_distance_unit', newUnit);
    } catch {}
  };

  const computedWeightKg = weightUnit === 'lbs'
    ? Math.round((weightDisplay / 2.20462) * 10) / 10
    : weightDisplay;
  const [fitnessSection, setFitnessSection] = useState<FitnessSection>(
    initialProfile?.fitnessSection ||
    (initialProfile?.experienceLevel === 'Advanced Pro' || initialProfile?.experienceLevel === 'Pro'
      ? 'Pro'
      : (initialProfile?.experienceLevel as FitnessSection) || 'Intermediate')
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(initialProfile?.experienceLevel || 'Intermediate');
  const [primaryGoal, setPrimaryGoal] = useState<FitnessGoal>(initialProfile?.primaryGoal || 'Hypertrophy (Pure Muscle Mass)');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(initialProfile?.daysPerWeek || 5);
  const [equipmentAccess, setEquipmentAccess] = useState<EquipmentAccessType>(initialProfile?.equipmentAccess || 'Full Commercial Gym');
  const [focusWeakpoint, setFocusWeakpoint] = useState<string>(() => {
    const init = initialProfile?.focusWeakpoint;
    if (!init || init === 'Upper Chest & Front Delts') {
      return 'All Muscles (Full Body Focus)';
    }
    return init;
  });
  const [injuries, setInjuries] = useState<string>(initialProfile?.injuriesOrLimitations || 'None');

  const FOCUS_MUSCLE_OPTIONS = [
    { id: 'chest', label: 'Upper Chest & Front Delts', desc: 'Clavicular & anterior delts' },
    { id: 'back', label: 'Lat Width & 3D Back Thickness', desc: 'Lats & mid-back density' },
    { id: 'delts', label: 'Lateral Deltoid Caps & Shoulders', desc: '3D delts & overhead stability' },
    { id: 'arms', label: 'Biceps Peak & Triceps Horseshoe', desc: 'Direct arm hypertrophy' },
    { id: 'legs', label: 'Quad Sweep & Hamstring Mass', desc: 'Complete lower body volume' },
    { id: 'glutes', label: 'Glutes & Hamstrings', desc: 'Posterior chain recruitment' },
    { id: 'core', label: 'Abs & Core Stability', desc: 'Midsection & bracing power' },
  ];

  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(() => {
    const init = initialProfile?.focusWeakpoint;
    if (!init || init === 'Upper Chest & Front Delts') return ['All Muscles'];
    if (init.toLowerCase().includes('all muscle') || init.toLowerCase().includes('full body') || init.toLowerCase().includes('balanced')) {
      return ['All Muscles'];
    }
    const parts = init.split(',').map(s => s.trim()).filter(Boolean);
    const matched = [
      'Upper Chest & Front Delts',
      'Lat Width & 3D Back Thickness',
      'Lateral Deltoid Caps & Shoulders',
      'Biceps Peak & Triceps Horseshoe',
      'Quad Sweep & Hamstring Mass',
      'Glutes & Hamstrings',
      'Abs & Core Stability'
    ].filter(lbl =>
      parts.some(p => p.toLowerCase() === lbl.toLowerCase() || lbl.toLowerCase().includes(p.toLowerCase()))
    );
    return matched.length > 0 ? matched : parts.length > 0 ? parts : ['All Muscles'];
  });

  const [isFocusMuscleOpen, setIsFocusMuscleOpen] = useState<boolean>(false);
  const focusMuscleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        isFocusMuscleOpen &&
        focusMuscleRef.current &&
        !focusMuscleRef.current.contains(e.target as Node)
      ) {
        setIsFocusMuscleOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMuscleOpen) {
        setIsFocusMuscleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocusMuscleOpen]);

  const isAllMusclesSelected =
    selectedMuscles.includes('All Muscles') ||
    selectedMuscles.length === FOCUS_MUSCLE_OPTIONS.length;

  const handleToggleAllMuscles = () => {
    if (isAllMusclesSelected) {
      setSelectedMuscles(['Upper Chest & Front Delts']);
      setFocusWeakpoint('Upper Chest & Front Delts');
    } else {
      setSelectedMuscles(['All Muscles']);
      setFocusWeakpoint('All Muscles (Full Body Focus)');
    }
  };

  const handleToggleMuscle = (label: string) => {
    let next: string[];
    if (selectedMuscles.includes('All Muscles')) {
      next = [label];
    } else if (selectedMuscles.includes(label)) {
      next = selectedMuscles.filter(m => m !== label);
      if (next.length === 0) {
        next = ['All Muscles'];
      }
    } else {
      next = [...selectedMuscles, label];
      if (next.length >= FOCUS_MUSCLE_OPTIONS.length) {
        next = ['All Muscles'];
      }
    }
    setSelectedMuscles(next);
    if (next.includes('All Muscles') || next.length >= FOCUS_MUSCLE_OPTIONS.length) {
      setFocusWeakpoint('All Muscles (Full Body Focus)');
    } else {
      setFocusWeakpoint(next.join(', '));
    }
  };

  const handleSelectAll = () => {
    setSelectedMuscles(['All Muscles']);
    setFocusWeakpoint('All Muscles (Full Body Focus)');
  };

  // Social Discovery Location & Permissions (Exact Address Sequence)
  // By default, collapsed during profile creation. User clicks dropdown arrow to expand.
  const [showLocationSection, setShowLocationSection] = useState<boolean>(false);
  const [showNearbyInfoModal, setShowNearbyInfoModal] = useState<boolean>(false);
  const [showRestDaysModal, setShowRestDaysModal] = useState<boolean>(false);
  const [activeMetricExplanation, setActiveMetricExplanation] = useState<MetricType | null>(null);
  const [gymName, setGymName] = useState<string>(initialProfile?.gymName || '');
  const [cityOrTown, setCityOrTown] = useState<string>(
    initialProfile?.cityOrTown ||
    (initialProfile?.homeTownAddress ? initialProfile.homeTownAddress.split(',')[0].trim() : 'Austin')
  );
  const [stateOrProvince, setStateOrProvince] = useState<string>(
    initialProfile?.stateOrProvince ||
    (initialProfile?.homeTownAddress?.split(',')[1]?.trim() || 'Texas')
  );
  const [country, setCountry] = useState<string>(initialProfile?.country || 'United States');
  const [zipOrPostalCode, setZipOrPostalCode] = useState<string>(initialProfile?.zipOrPostalCode || '78701');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState<boolean>(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideLocationDropdowns = (e: MouseEvent | TouchEvent) => {
      if (
        isCountryDropdownOpen &&
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
      if (
        isCityDropdownOpen &&
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCityDropdownOpen(false);
      }
      if (
        isStateDropdownOpen &&
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(e.target as Node)
      ) {
        setIsStateDropdownOpen(false);
      }
    };
    const handleKeyDownLocationDropdowns = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCountryDropdownOpen) setIsCountryDropdownOpen(false);
        if (isCityDropdownOpen) setIsCityDropdownOpen(false);
        if (isStateDropdownOpen) setIsStateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideLocationDropdowns);
    document.addEventListener('touchstart', handleClickOutsideLocationDropdowns);
    document.addEventListener('keydown', handleKeyDownLocationDropdowns);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideLocationDropdowns);
      document.removeEventListener('touchstart', handleClickOutsideLocationDropdowns);
      document.removeEventListener('keydown', handleKeyDownLocationDropdowns);
    };
  }, [isCountryDropdownOpen, isCityDropdownOpen, isStateDropdownOpen]);

  const filteredWorldCountries = React.useMemo(() => {
    const q = country.trim().toLowerCase();
    if (!q) return ALL_WORLD_COUNTRIES;
    const exactMatch = ALL_WORLD_COUNTRIES.some(c => c.toLowerCase() === q);
    if (exactMatch) {
      return [
        ...ALL_WORLD_COUNTRIES.filter(c => c.toLowerCase() === q),
        ...ALL_WORLD_COUNTRIES.filter(c => c.toLowerCase() !== q)
      ];
    }
    return ALL_WORLD_COUNTRIES.filter(c => c.toLowerCase().includes(q));
  }, [country]);

  const handleSelectWorldCountry = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setIsCountryDropdownOpen(false);
    // If current city does not belong to selectedCountry, optionally pick the top city in that country if available
    const citiesInCountry = WORLD_CITIES_DIRECTORY.filter(
      c => c.country.toLowerCase() === selectedCountry.toLowerCase()
    );
    if (citiesInCountry.length > 0) {
      const currentMatchesCountry = citiesInCountry.some(
        c => c.city.toLowerCase() === cityOrTown.trim().toLowerCase()
      );
      if (!currentMatchesCountry) {
        const firstCity = citiesInCountry[0];
        setCityOrTown(firstCity.city);
        setStateOrProvince(firstCity.stateOrProvince);
        if (firstCity.zipOrPostalCode && firstCity.zipOrPostalCode !== '00000') {
          setZipOrPostalCode(firstCity.zipOrPostalCode);
        }
      }
    }
  };

  const filteredWorldCities = React.useMemo(() => {
    const q = cityOrTown.trim().toLowerCase();
    const countryQuery = country.trim().toLowerCase();

    // Strictly restrict cities and towns to the country selected by the user
    const countryScopedDirectory = countryQuery
      ? WORLD_CITIES_DIRECTORY.filter(c => c.country.toLowerCase() === countryQuery)
      : WORLD_CITIES_DIRECTORY;

    if (!q) return countryScopedDirectory;
    const exactMatch = countryScopedDirectory.some(c => c.city.toLowerCase() === q);
    if (exactMatch) {
      return [
        ...countryScopedDirectory.filter(c => c.city.toLowerCase() === q),
        ...countryScopedDirectory.filter(c => c.city.toLowerCase() !== q)
      ];
    }
    return countryScopedDirectory.filter(
      c =>
        c.city.toLowerCase().includes(q) ||
        c.stateOrProvince.toLowerCase().includes(q)
    );
  }, [cityOrTown, country]);

  const handleSelectWorldCity = (option: WorldCityOption) => {
    setCityOrTown(option.city);
    setStateOrProvince(option.stateOrProvince);
    setCountry(option.country);
    if (option.zipOrPostalCode && option.zipOrPostalCode !== '00000') {
      setZipOrPostalCode(option.zipOrPostalCode);
    }
    setIsCityDropdownOpen(false);
  };

  // Filtered States / Provinces depending on the selected City/Town in the selected Country
  const filteredStatesOrProvinces = React.useMemo(() => {
    const countryQuery = country.trim().toLowerCase();
    const cityQuery = cityOrTown.trim().toLowerCase();
    const stateQuery = stateOrProvince.trim().toLowerCase();

    // All entries in the selected country
    const countryCities = countryQuery
      ? WORLD_CITIES_DIRECTORY.filter(c => c.country.toLowerCase() === countryQuery)
      : WORLD_CITIES_DIRECTORY;

    // Prioritize the state/province of the currently selected city/town first, followed by other states/provinces in that country
    const matchingCityEntries = cityQuery
      ? countryCities.filter(c => c.city.toLowerCase() === cityQuery)
      : [];

    const orderedStates: { stateOrProvince: string; matchedCity?: string; country: string }[] = [];
    const seen = new Set<string>();

    matchingCityEntries.forEach(entry => {
      const key = entry.stateOrProvince.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        orderedStates.push({
          stateOrProvince: entry.stateOrProvince,
          matchedCity: entry.city,
          country: entry.country
        });
      }
    });

    countryCities.forEach(entry => {
      const key = entry.stateOrProvince.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        orderedStates.push({
          stateOrProvince: entry.stateOrProvince,
          matchedCity: entry.city,
          country: entry.country
        });
      }
    });

    if (!stateQuery) return orderedStates;
    const exactMatch = orderedStates.some(s => s.stateOrProvince.toLowerCase() === stateQuery);
    if (exactMatch) {
      return [
        ...orderedStates.filter(s => s.stateOrProvince.toLowerCase() === stateQuery),
        ...orderedStates.filter(s => s.stateOrProvince.toLowerCase() !== stateQuery)
      ];
    }
    return orderedStates.filter(s => s.stateOrProvince.toLowerCase().includes(stateQuery));
  }, [country, cityOrTown, stateOrProvince]);

  const handleSelectStateOrProvince = (selectedState: string) => {
    setStateOrProvince(selectedState);
    setIsStateDropdownOpen(false);
    // If current city doesn't match the newly chosen state/province within the selected country, update to a matching city if one exists
    const countryQuery = country.trim().toLowerCase();
    const matchingCities = WORLD_CITIES_DIRECTORY.filter(
      c =>
        (!countryQuery || c.country.toLowerCase() === countryQuery) &&
        c.stateOrProvince.toLowerCase() === selectedState.toLowerCase()
    );
    if (matchingCities.length > 0) {
      const currentCityMatchesState = matchingCities.some(
        c => c.city.toLowerCase() === cityOrTown.trim().toLowerCase()
      );
      if (!currentCityMatchesState) {
        setCityOrTown(matchingCities[0].city);
        if (matchingCities[0].zipOrPostalCode && matchingCities[0].zipOrPostalCode !== '00000') {
          setZipOrPostalCode(matchingCities[0].zipOrPostalCode);
        }
      }
    }
  };

  const [latitude, setLatitude] = useState<number | undefined>(initialProfile?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialProfile?.longitude);
  const [locationTrackerEnabled, setLocationTrackerEnabled] = useState<boolean>(
    initialProfile?.locationTrackerEnabled ?? false
  );
  const [showLocationGuideModal, setShowLocationGuideModal] = useState<boolean>(false);
  const [shareLocationPermission, setShareLocationPermission] = useState<boolean>(
    initialProfile ? (initialProfile.shareLocationForSocialSearch ?? true) : true
  );

  const computedAddressSequence = formatAddressSequence(cityOrTown, stateOrProvince, country, zipOrPostalCode);

  // Fitness Tracker & Wearable Devices (Dropdown option, default closed)
  const [showTrackerSection, setShowTrackerSection] = useState<boolean>(false);
  const [trackerPermission, setTrackerPermission] = useState<boolean>(
    initialProfile?.trackerPermissionGranted ?? false
  );
  const [trackerSkipped, setTrackerSkipped] = useState<boolean>(
    initialProfile?.trackerPermissionSkipped ?? false
  );
  const [showTrackerInfoPopup, setShowTrackerInfoPopup] = useState<boolean>(false);
  const [showTrackerSetupPage, setShowTrackerSetupPage] = useState<boolean>(false);

  const [devicesState, setDevicesState] = useState<ConnectedDevice[]>(() => {
    if (propConnectedDevices && propConnectedDevices.length > 0) return propConnectedDevices;
    return getConnectedDevices();
  });

  useEffect(() => {
    if (propConnectedDevices && propConnectedDevices.length > 0) {
      setDevicesState(propConnectedDevices);
    }
  }, [propConnectedDevices]);

  const handleToggleDeviceLocal = (deviceId: string) => {
    if (propOnToggleDevice) {
      propOnToggleDevice(deviceId);
    }
    setDevicesState(prev => {
      const updated = prev.map(d => (d.id === deviceId ? { ...d, isConnected: !d.isConnected } : d));
      saveConnectedDevices(updated);
      return updated;
    });
    setTrackerPermission(true);
    setTrackerSkipped(false);
  };

  const activeConnectedDevices = devicesState.filter(d => d.isConnected);

  const goals: { label: FitnessGoal; desc: string; termId: string }[] = [
    {
      label: 'Hypertrophy (Pure Muscle Mass)',
      desc: 'Maximize muscle volume and cross-sectional area with progressive overload',
      termId: 'hypertrophy'
    },
    {
      label: 'Strength & Size (Powerbuilding)',
      desc: 'Heavy compound progressive overload with hypertrophy volume',
      termId: 'powerbuilding'
    },
    {
      label: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
      desc: 'Accelerate fat oxidation & metabolic output while protecting lean muscle mass',
      termId: 'fat_loss'
    },
    {
      label: 'Aesthetic V-Taper',
      desc: 'Focus on wide lat flare, 3D delts, and narrow waist',
      termId: 'v_taper'
    },
    {
      label: 'Lean Cut & Muscle Definition',
      desc: 'Preserve lean mass while increasing conditioning and striations',
      termId: 'lean_cut'
    }
  ];

  const injuryOptions = [
    'None (100% Healthy)',
    'Shoulder Impingement / Rotator Cuff',
    'Lower Back / Lumbar Sensitivity',
    'Patellar / Knee Discomfort'
  ];

  const handleSaveProfileDirect = () => {
    const profileData: UserProfile = {
      name: name.trim() || 'Athlete',
      avatarType,
      avatarUrl: avatarType === 'upload' ? avatarUrl : undefined,
      avatarId: avatarType === 'animated' ? avatarId : undefined,
      age,
      gender,
      heightCm,
      weightKg: computedWeightKg,
      weightUnit,
      distanceUnit,
      experienceLevel,
      fitnessSection,
      fitnessLevel: 1,
      primaryGoal,
      daysPerWeek,
      equipmentAccess,
      equipmentEnvironment: accessTypeToEnvironment(equipmentAccess),
      focusWeakpoint,
      injuriesOrLimitations: injuries === 'None (100% Healthy)' ? 'None' : injuries,
      gymName: gymName.trim(),
      gymAddress: computedAddressSequence,
      cityOrTown: cityOrTown.trim(),
      stateOrProvince: stateOrProvince.trim(),
      country: country.trim(),
      zipOrPostalCode: zipOrPostalCode.trim(),
      homeTownAddress: computedAddressSequence,
      latitude,
      longitude,
      locationTrackerEnabled,
      shareLocationForSocialSearch: shareLocationPermission,
      trackerPermissionGranted: trackerPermission,
      trackerPermissionSkipped: trackerSkipped,
      onboardingCompleted: true
    };
    onComplete(profileData);
  };

  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setStep(4);

    const tempProfile: UserProfile = {
      name: name.trim() || 'Athlete',
      avatarType,
      avatarUrl: avatarType === 'upload' ? avatarUrl : undefined,
      avatarId: avatarType === 'animated' ? avatarId : undefined,
      age,
      gender,
      heightCm,
      weightKg: computedWeightKg,
      weightUnit,
      distanceUnit,
      experienceLevel,
      fitnessSection,
      fitnessLevel: 1,
      primaryGoal,
      daysPerWeek,
      equipmentAccess,
      equipmentEnvironment: accessTypeToEnvironment(equipmentAccess),
      focusWeakpoint,
      injuriesOrLimitations: injuries === 'None (100% Healthy)' ? 'None' : injuries,
      gymName: gymName.trim(),
      gymAddress: computedAddressSequence,
      cityOrTown: cityOrTown.trim(),
      stateOrProvince: stateOrProvince.trim(),
      country: country.trim(),
      zipOrPostalCode: zipOrPostalCode.trim(),
      homeTownAddress: computedAddressSequence,
      latitude,
      longitude,
      locationTrackerEnabled,
      shareLocationForSocialSearch: shareLocationPermission,
      trackerPermissionGranted: trackerPermission,
      trackerPermissionSkipped: trackerSkipped,
      onboardingCompleted: true
    };

    setTimeout(() => {
      const rec = generateAiRecommendation(tempProfile);
      setAiRecommendation(rec);
      setIsAnalyzing(false);
    }, 700);
  };

  const handleAcceptPlan = () => {
    if (!aiRecommendation) return;
    const profileData: UserProfile = {
      name: name.trim() || 'Athlete',
      avatarType,
      avatarUrl: avatarType === 'upload' ? avatarUrl : undefined,
      avatarId: avatarType === 'animated' ? avatarId : undefined,
      age,
      gender,
      heightCm,
      weightKg: computedWeightKg,
      weightUnit,
      distanceUnit,
      experienceLevel,
      fitnessSection,
      fitnessLevel: 1,
      primaryGoal,
      daysPerWeek,
      equipmentAccess,
      equipmentEnvironment: accessTypeToEnvironment(equipmentAccess),
      focusWeakpoint,
      injuriesOrLimitations: injuries,
      gymName: gymName.trim(),
      gymAddress: computedAddressSequence,
      cityOrTown: cityOrTown.trim(),
      stateOrProvince: stateOrProvince.trim(),
      country: country.trim(),
      zipOrPostalCode: zipOrPostalCode.trim(),
      homeTownAddress: computedAddressSequence,
      latitude,
      longitude,
      locationTrackerEnabled,
      shareLocationForSocialSearch: shareLocationPermission,
      trackerPermissionGranted: trackerPermission,
      trackerPermissionSkipped: trackerSkipped,
      onboardingCompleted: true
    };
    onComplete(profileData, aiRecommendation.plan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-850 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 text-zinc-100 relative my-auto">
        {/* Minimalist Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-lg tracking-widest text-zinc-100 uppercase">
              GymPax
            </span>
            <span className="text-zinc-500 text-xs font-mono">
              {initialProfile ? 'Athlete Profile' : 'Setup'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`w-6 h-1 rounded-full transition-colors ${
                    step >= s ? 'bg-amber-400' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: Bio-Metrics & Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
                  {initialProfile ? 'Profile & Bio-Metrics' : 'Bio-Metrics & Profile'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Step 1 of 3: Baseline biological data used for caloric calibration and program customization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setName('');
                  setAvatarType('animated');
                  setAvatarUrl(undefined);
                  setAvatarId('gym_m1');
                  setAge(25);
                  setGender('male');
                  setHeightCm(178);
                  setWeightDisplay(weightUnit === 'lbs' ? 172 : 78);
                  setFitnessSection('Intermediate');
                  setExperienceLevel('Intermediate');
                  setPrimaryGoal('Hypertrophy (Pure Muscle Mass)');
                  setDaysPerWeek(4);
                  setEquipmentAccess('Full Commercial Gym');
                  setGymName('');
                  setCityOrTown('');
                  setStateOrProvince('');
                  setCountry('');
                  setZipOrPostalCode('');
                }}
                className="text-[11px] font-mono text-zinc-500 hover:text-amber-400 underline cursor-pointer shrink-0 transition-colors"
                title="Reset fields to blank defaults"
              >
                Start Fresh
              </button>
            </div>

            {/* Clean Inputs */}
            <div className="space-y-3 pt-1">
              {/* Athlete Name & Avatar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block">
                    Athlete Name & Avatar
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(true)}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Upload personal photo or choose from 10 gym animated characters"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{avatarType === 'upload' ? 'Personal Photo' : '10 Gym Avatars'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Interactive Avatar button next to Athlete Name */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAvatarModal(true)}
                      className="relative group rounded-full cursor-pointer focus:outline-none ring-2 ring-zinc-750 hover:ring-amber-400 transition-all shadow-md block"
                      title="Click to upload personal photo or choose gym animated character"
                    >
                      <GymAvatar
                        avatarType={avatarType}
                        avatarUrl={avatarUrl}
                        avatarId={avatarId}
                        size="md"
                        fallbackInitials={name ? name.slice(0, 2) : 'AL'}
                      />
                      <div className="absolute inset-0 rounded-full bg-black/50 group-hover:bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </button>
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Alex Hunter"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Minimalist Gender Selection (matches Unit Selection View, placed under name & on top of units) */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Gender
                  </span>
                </div>

                <div className="inline-flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setGender('man');
                      if (avatarType === 'animated' && (!avatarId || avatarId === 'gym_m1' || avatarId === 'gym_w1')) {
                        setAvatarId('gym_m1');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                      gender === 'man' || gender === 'male'
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Man (AI Calibrated for Heavy Mechanical Tension & Power)"
                  >
                    Man
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGender('woman');
                      if (avatarType === 'animated' && (!avatarId || avatarId === 'gym_m1' || avatarId === 'gym_w1')) {
                        setAvatarId('gym_w1');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                      gender === 'woman' || gender === 'female'
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Woman (AI Calibrated for High Volume & Rapid ATP Recovery)"
                  >
                    Woman
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('skip')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                      gender === 'skip' || gender === 'other'
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Skip (Unisex Athletic Baseline)"
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Minimalist Unit Preferences */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Units
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5">
                  {/* Weight Toggle */}
                  <div className="inline-flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => handleSelectWeightUnit('kg')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                        weightUnit === 'kg'
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Kilograms"
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectWeightUnit('lbs')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                        weightUnit === 'lbs'
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Pounds"
                    >
                      lbs
                    </button>
                  </div>

                  {/* Distance Toggle */}
                  <div className="inline-flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => handleSelectDistanceUnit('km')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                        distanceUnit === 'km'
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Kilometers"
                    >
                      km
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDistanceUnit('mi')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                        distanceUnit === 'mi'
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Miles"
                    >
                      mi
                    </button>
                  </div>
                </div>
              </div>

              {/* Minimalist Clean Numeric Metrics */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 text-center">
                  <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    Age
                  </label>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAge(prev => Math.max(14, prev - 1))}
                      className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(Number(e.target.value) || 20)}
                      className="w-12 text-center bg-transparent font-mono font-bold text-sm text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setAge(prev => Math.min(85, prev + 1))}
                      className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">years</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 text-center">
                  <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    Height
                  </label>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setHeightCm(prev => Math.max(120, prev - 1))}
                      className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={e => setHeightCm(Number(e.target.value) || 175)}
                      className="w-12 text-center bg-transparent font-mono font-bold text-sm text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setHeightCm(prev => Math.min(230, prev + 1))}
                      className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">cm</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 text-center">
                  <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    Weight ({weightUnit})
                  </label>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const step = weightUnit === 'lbs' ? 1 : 0.5;
                        const min = weightUnit === 'lbs' ? 88 : 40;
                        setWeightDisplay(prev => Math.max(min, Math.round((prev - step) * 10) / 10));
                      }}
                      className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step={weightUnit === 'lbs' ? '1' : '0.5'}
                      value={weightDisplay}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setWeightDisplay(val);
                      }}
                      className="w-14 text-center bg-transparent font-mono font-bold text-sm text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const step = weightUnit === 'lbs' ? 1 : 0.5;
                        const max = weightUnit === 'lbs' ? 395 : 180;
                        setWeightDisplay(prev => Math.min(max, Math.round((prev + step) * 10) / 10));
                      }}
                      className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold block mt-0.5">
                    {weightUnit}
                  </span>
                </div>
              </div>


              {/* Minimalist Notice: Location and Fitness Tracker can be skipped */}
              <div className="pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-900/40 border border-zinc-850/80 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                    <span>Personal location & fitness tracker are optional — you can skip this section and configure later.</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide shrink-0 hidden sm:inline-block">
                    Optional
                  </span>
                </div>
              </div>

              {/* Progressive Disclosure: Personal Location (Exact Address Sequence) */}
              <div className="pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowLocationSection(!showLocationSection)}
                  className="w-full flex items-center justify-between text-xs text-zinc-300 hover:text-white py-2 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Personal Location</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {cityOrTown ? `(${cityOrTown}, ${stateOrProvince})` : '(Optional)'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200">
                    <span>{showLocationSection ? 'Collapse' : 'Include Address'}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${
                        showLocationSection ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </button>

                {showLocationSection && (
                  <div className="space-y-3 pt-2 animate-in fade-in">
                    {/* Auto-detect button with permission & device guidance */}
                    <div className="flex items-center justify-between gap-2 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Navigation className={`w-4 h-4 ${locationTrackerEnabled ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-zinc-200 block">
                            {locationTrackerEnabled ? 'Device Location Tracker Connected' : 'Phone Location Tracker'}
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            {locationTrackerEnabled ? `GPS: ${latitude?.toFixed(3)}°, ${longitude?.toFixed(3)}°` : 'Ask permission & auto-fill personal address'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLocationGuideModal(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-[11px] uppercase tracking-wide cursor-pointer transition-colors shrink-0"
                      >
                        {locationTrackerEnabled ? 'Re-detect' : 'Switch On & Detect'}
                      </button>
                    </div>

                    {/* Exact Address Sequence */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider block">
                        Personal Address Sequence (Searchable in Community):
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* 1. Country (Searchable World Countries Dropdown - Moved in front of City/Town) */}
                        <div ref={countryDropdownRef} className="relative">
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            1. Country
                          </label>
                          <input
                            type="text"
                            value={country}
                            onFocus={() => {
                              setIsCountryDropdownOpen(true);
                              setIsCityDropdownOpen(false);
                            }}
                            onClick={() => {
                              setIsCountryDropdownOpen(true);
                              setIsCityDropdownOpen(false);
                            }}
                            onChange={e => {
                              setCountry(e.target.value);
                              setIsCountryDropdownOpen(true);
                            }}
                            placeholder="Search countries (e.g. United States, United Kingdom)..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-14 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                          />
                          {country && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setCountry('');
                                setIsCountryDropdownOpen(true);
                              }}
                              title="Clear country search"
                              className="absolute right-7 top-[23px] p-1 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCountryDropdownOpen(prev => !prev);
                              setIsCityDropdownOpen(false);
                            }}
                            title="Toggle world countries list"
                            className="absolute right-2 top-[23px] p-1 text-zinc-400 hover:text-amber-400 cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                                isCountryDropdownOpen ? 'rotate-180 text-amber-400' : ''
                              }`}
                            />
                          </button>

                          {isCountryDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl divide-y divide-zinc-900">
                              <div className="px-3 py-1.5 bg-zinc-900/90 text-[10px] font-mono text-zinc-400 flex items-center justify-between sticky top-0 z-10 border-b border-zinc-800">
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-amber-400" />
                                  <span>World Countries ({filteredWorldCountries.length})</span>
                                </span>
                                <span className="text-zinc-500">Tap to select</span>
                              </div>
                              {filteredWorldCountries.length > 0 ? (
                                filteredWorldCountries.map(countryOption => {
                                  const isSelected =
                                    country.trim().toLowerCase() === countryOption.toLowerCase();
                                  return (
                                    <button
                                      key={countryOption}
                                      type="button"
                                      onClick={() => handleSelectWorldCountry(countryOption)}
                                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                        isSelected
                                          ? 'bg-amber-400/15 text-amber-300 font-bold'
                                          : 'text-zinc-200 hover:bg-zinc-900'
                                      }`}
                                    >
                                      <div className="font-semibold truncate flex items-center gap-1.5">
                                        <Globe className="w-3 h-3 text-amber-400 shrink-0" />
                                        <span className="truncate">{countryOption}</span>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsCountryDropdownOpen(false)}
                                  className="w-full px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-900 cursor-pointer flex items-center justify-between"
                                >
                                  <span>
                                    Use custom country: <strong className="text-amber-400">"{country}"</strong>
                                  </span>
                                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 2. City or town (Scoped to Selected Country) */}
                        <div ref={cityDropdownRef} className="relative">
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            2. City or Town {country.trim() ? `(${country.trim()})` : ''}
                          </label>
                          <input
                            type="text"
                            value={cityOrTown}
                            onFocus={() => {
                              setIsCityDropdownOpen(true);
                              setIsCountryDropdownOpen(false);
                            }}
                            onClick={() => {
                              setIsCityDropdownOpen(true);
                              setIsCountryDropdownOpen(false);
                            }}
                            onChange={e => {
                              setCityOrTown(e.target.value);
                              setIsCityDropdownOpen(true);
                            }}
                            placeholder={
                              country.trim()
                                ? `Search cities & towns in ${country.trim()}...`
                                : 'Search cities or towns...'
                            }
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-14 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                          />
                          {cityOrTown && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setCityOrTown('');
                                setIsCityDropdownOpen(true);
                              }}
                              title="Clear city search"
                              className="absolute right-7 top-[23px] p-1 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCityDropdownOpen(prev => !prev);
                              setIsCountryDropdownOpen(false);
                            }}
                            title="Toggle country cities and towns list"
                            className="absolute right-2 top-[23px] p-1 text-zinc-400 hover:text-amber-400 cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                                isCityDropdownOpen ? 'rotate-180 text-amber-400' : ''
                              }`}
                            />
                          </button>

                          {isCityDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl divide-y divide-zinc-900">
                              <div className="px-3 py-1.5 bg-zinc-900/90 text-[10px] font-mono text-zinc-400 flex items-center justify-between sticky top-0 z-10 border-b border-zinc-800">
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="truncate">
                                    {country.trim()
                                      ? `Cities & Towns in ${country.trim()} (${filteredWorldCities.length})`
                                      : `Cities & Towns (${filteredWorldCities.length})`}
                                  </span>
                                </span>
                                <span className="text-zinc-500 shrink-0">Tap to select</span>
                              </div>
                              {filteredWorldCities.length > 0 ? (
                                filteredWorldCities.map(option => {
                                  const isSelected =
                                    cityOrTown.trim().toLowerCase() === option.city.toLowerCase() &&
                                    country.trim().toLowerCase() === option.country.toLowerCase();
                                  return (
                                    <button
                                      key={`${option.city}-${option.stateOrProvince}-${option.country}`}
                                      type="button"
                                      onClick={() => handleSelectWorldCity(option)}
                                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                        isSelected
                                          ? 'bg-amber-400/15 text-amber-300 font-bold'
                                          : 'text-zinc-200 hover:bg-zinc-900'
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="font-semibold truncate flex items-center gap-1.5">
                                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                                          <span className="truncate">{option.city}</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 font-mono truncate block pl-4">
                                          {option.stateOrProvince}, {option.country}
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsCityDropdownOpen(false)}
                                  className="w-full px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-900 cursor-pointer flex items-center justify-between"
                                >
                                  <span>
                                    Use custom city: <strong className="text-amber-400">"{cityOrTown}"</strong>
                                  </span>
                                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3. State or Province (Searchable Dropdown based on selected City/Town & Country) */}
                        <div ref={stateDropdownRef} className="relative">
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            3. State or Province {cityOrTown.trim() ? `(${cityOrTown.trim()})` : ''}
                          </label>
                          <input
                            type="text"
                            value={stateOrProvince}
                            onFocus={() => {
                              setIsStateDropdownOpen(true);
                              setIsCountryDropdownOpen(false);
                              setIsCityDropdownOpen(false);
                            }}
                            onClick={() => {
                              setIsStateDropdownOpen(true);
                              setIsCountryDropdownOpen(false);
                              setIsCityDropdownOpen(false);
                            }}
                            onChange={e => {
                              setStateOrProvince(e.target.value);
                              setIsStateDropdownOpen(true);
                            }}
                            placeholder={
                              country.trim()
                                ? `Select state/province in ${country.trim()}...`
                                : 'e.g. Texas, Greater London, Ontario'
                            }
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-14 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                          />
                          {stateOrProvince && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setStateOrProvince('');
                                setIsStateDropdownOpen(true);
                              }}
                              title="Clear state or province"
                              className="absolute right-7 top-[23px] p-1 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsStateDropdownOpen(prev => !prev);
                              setIsCountryDropdownOpen(false);
                              setIsCityDropdownOpen(false);
                            }}
                            title="Toggle state or province list"
                            className="absolute right-2 top-[23px] p-1 text-zinc-400 hover:text-amber-400 cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                                isStateDropdownOpen ? 'rotate-180 text-amber-400' : ''
                              }`}
                            />
                          </button>

                          {isStateDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl divide-y divide-zinc-900">
                              <div className="px-3 py-1.5 bg-zinc-900/90 text-[10px] font-mono text-zinc-400 flex items-center justify-between sticky top-0 z-10 border-b border-zinc-800">
                                <span className="flex items-center gap-1 truncate">
                                  <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="truncate">
                                    {country.trim()
                                      ? `State / Province (${country.trim()})`
                                      : 'State / Province'}
                                  </span>
                                </span>
                                <span className="text-zinc-500 shrink-0">Tap to select</span>
                              </div>
                              {filteredStatesOrProvinces.length > 0 ? (
                                filteredStatesOrProvinces.map(item => {
                                  const isSelected =
                                    stateOrProvince.trim().toLowerCase() ===
                                    item.stateOrProvince.toLowerCase();
                                  const isMatchedToCurrentCity =
                                    cityOrTown.trim() &&
                                    WORLD_CITIES_DIRECTORY.some(
                                      c =>
                                        c.country.toLowerCase() === country.trim().toLowerCase() &&
                                        c.city.toLowerCase() === cityOrTown.trim().toLowerCase() &&
                                        c.stateOrProvince.toLowerCase() ===
                                          item.stateOrProvince.toLowerCase()
                                    );
                                  return (
                                    <button
                                      key={`${item.stateOrProvince}-${item.country}`}
                                      type="button"
                                      onClick={() =>
                                        handleSelectStateOrProvince(item.stateOrProvince)
                                      }
                                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                        isSelected
                                          ? 'bg-amber-400/15 text-amber-300 font-bold'
                                          : 'text-zinc-200 hover:bg-zinc-900'
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="font-semibold truncate flex items-center gap-1.5">
                                          <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                                          <span className="truncate">{item.stateOrProvince}</span>
                                          {isMatchedToCurrentCity && (
                                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                                              {cityOrTown.trim()}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-zinc-400 font-mono truncate block pl-4">
                                          {item.country}
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsStateDropdownOpen(false)}
                                  className="w-full px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-900 cursor-pointer flex items-center justify-between"
                                >
                                  <span>
                                    Use custom state/province:{' '}
                                    <strong className="text-amber-400">"{stateOrProvince}"</strong>
                                  </span>
                                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 4. Zip code */}
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">
                            4. Zip or Postal Code
                          </label>
                          <input
                            type="text"
                            value={zipOrPostalCode}
                            onChange={e => setZipOrPostalCode(e.target.value)}
                            placeholder="e.g. 78701, SW1A 1AA, M5V 2T6"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Recognized sequence preview */}
                      <div className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-850 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">
                          Recognized Address: <strong className="text-zinc-200">{computedAddressSequence}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Nearby Lifters Search Permission with ? Info Icon */}
                    <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2.5 cursor-pointer text-[11px] text-zinc-300 flex-1 select-none">
                        <input
                          type="checkbox"
                          checked={shareLocationPermission}
                          onChange={e => setShareLocationPermission(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-950 text-amber-400 focus:ring-0 cursor-pointer w-4 h-4 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-200">
                            Visible to gym lifters in nearby search
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Can be updated anytime in the Community section
                          </span>
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setShowNearbyInfoModal(true);
                        }}
                        className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-center shrink-0 border border-zinc-700/60"
                        title="Why is this needed? Click for full details and permission options"
                        aria-label="Why is nearby visibility needed?"
                      >
                        <Info className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>

                    {/* Minimalist Skip Location Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-850/60 text-[11px] text-zinc-500">
                      <span className="text-[10px] font-mono">
                        Address is optional & can be entered later.
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowLocationSection(false)}
                        className="text-zinc-400 hover:text-amber-400 text-[11px] font-medium transition-colors cursor-pointer underline"
                      >
                        Skip for later
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Progressive Disclosure: Fitness Tracker & Wearables (Dropdown option, default closed) */}
              <div className="pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowTrackerSection(!showTrackerSection)}
                  className="w-full flex items-center justify-between text-xs text-zinc-300 hover:text-white py-2 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Watch className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Fitness Tracker & Devices</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {activeConnectedDevices.length > 0
                        ? `(${activeConnectedDevices[0].name} Connected)`
                        : trackerSkipped
                        ? '(Skipped for Later)'
                        : '(Optional)'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200">
                    <span>
                      {showTrackerSection
                        ? 'Collapse'
                        : activeConnectedDevices.length > 0
                        ? 'Manage Devices'
                        : 'Connect Device'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${
                        showTrackerSection ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </button>

                {showTrackerSection && (
                  <div className="space-y-3 pt-2 animate-in fade-in">
                    {/* Active paired device notification if any */}
                    {activeConnectedDevices.length > 0 ? (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <div>
                            <span className="text-xs font-bold text-emerald-300 block">
                              {activeConnectedDevices[0].name} Connected
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Live Heart Rate · Recovery Readiness · Caloric Burn Active
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTrackerSetupPage(true)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      /* Permission Prompt & Choice Card */
                      <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                              <span>Sync Live Biometrics</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                                Optional
                              </span>
                            </span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Give permission to connect Apple Watch, WHOOP, Garmin, Polar, Oura, or Bluetooth HR sensor to track live heart rate zones, recovery, and caloric burn.
                            </p>
                          </div>

                          {/* Info popup trigger */}
                          <button
                            type="button"
                            onClick={() => setShowTrackerInfoPopup(true)}
                            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer shrink-0 border border-zinc-700/60 flex items-center justify-center"
                            title="Why is this needed? Click for full details"
                            aria-label="Why connect a tracker device?"
                          >
                            <Info className="w-4 h-4 text-amber-400" />
                          </button>
                        </div>

                        {/* Permission Checkbox */}
                        <label className="flex items-center gap-2.5 cursor-pointer text-[11px] text-zinc-300 select-none pt-1 border-t border-zinc-850">
                          <input
                            type="checkbox"
                            checked={trackerPermission}
                            onChange={e => {
                              setTrackerPermission(e.target.checked);
                              if (e.target.checked) {
                                setTrackerSkipped(false);
                              }
                            }}
                            className="rounded border-zinc-700 bg-zinc-950 text-amber-400 focus:ring-0 cursor-pointer w-4 h-4 shrink-0"
                          />
                          <span>
                            I give permission to sync wearable metrics with GymPax workouts
                          </span>
                        </label>

                        {/* Actions: Connect Now vs Skip for Later */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setTrackerPermission(true);
                              setTrackerSkipped(false);
                              setShowTrackerSetupPage(true);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Bluetooth className="w-3.5 h-3.5" />
                            <span>Connect Tracker Device</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTrackerSkipped(true);
                              setTrackerPermission(false);
                              setShowTrackerSection(false);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer text-center border border-zinc-750"
                          >
                            Skip for Later
                          </button>
                        </div>

                        {trackerSkipped && (
                          <div className="text-[10px] text-zinc-400 font-mono text-center pt-0.5">
                            Skipped for later. You can pair anytime in Settings or during your first workout.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Legal Notice (Quiet 1-line text) */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenTerms) onOpenTerms();
                  else if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('soma:open-terms'));
                }}
                className="text-[11px] text-zinc-500 hover:text-amber-400 transition-colors underline cursor-pointer"
              >
                Terms of Use & Health Release
              </button>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2.5">
              {initialProfile && (
                <button
                  type="button"
                  onClick={handleSaveProfileDirect}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-semibold cursor-pointer transition-colors text-center"
                >
                  Save Profile
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 ${
                  initialProfile ? 'flex-1' : 'w-full'
                }`}
              >
                <span>Continue to Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Fitness Section & Hypertrophy Targets */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
                Section & Primary Goal
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Bodybuilders can start at Pro. Elite is earned through app workouts (1,000 pts/section).
              </p>
            </div>

            {/* Fitness Section Selection */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase text-zinc-400 block">
                  Fitness Section & Starting Level
                </span>
                <TermHelpTooltip
                  customTitle="Fitness Sections & Ranking"
                  customShort="Choose your starting tier: Beginner, Intermediate, or Pro."
                  customExplanation="Beginners (0-1 yrs) focus on compound mechanics. Intermediates (1-3 yrs) apply structured progressive overload. Advanced athletes can start directly at Pro. Elite is locked and earned exclusively in the app by logging 1,000 points in Pro."
                  customWhyItMatters="Each workout completed awards +5 points. 333 points are required to advance to the next level."
                  size="xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Beginner', 'Intermediate', 'Pro', 'Elite'] as const).map((sec, idx) => {
                  const isElite = sec === 'Elite';
                  const isSelected = fitnessSection === sec;
                  const termId =
                    sec === 'Beginner'
                      ? 'section_beginner'
                      : sec === 'Intermediate'
                      ? 'section_intermediate'
                      : sec === 'Pro'
                      ? 'section_pro'
                      : 'section_elite';

                  const alignPos: 'left' | 'center' | 'right' =
                    idx === 0 ? 'left' : idx === 3 ? 'right' : 'center';

                  if (isElite) {
                    return (
                      <div
                        key={sec}
                        title="Elite is earned through app workouts (1,000 Pro points)"
                        className="p-3 rounded-xl border border-zinc-900 bg-zinc-900/30 text-left opacity-60 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-zinc-500">{sec}</span>
                            <TermHelpTooltip termId={termId} size="xs" align={alignPos} />
                          </div>
                          <Lock className="w-3 h-3 text-zinc-600" />
                        </div>
                        <span className="text-[10px] text-zinc-600 block mt-1">Earned Only</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={sec}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setFitnessSection(sec);
                        setExperienceLevel(sec === 'Pro' ? 'Advanced Pro' : sec);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setFitnessSection(sec);
                          setExperienceLevel(sec === 'Pro' ? 'Advanced Pro' : sec);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold block">{sec}</span>
                          <TermHelpTooltip termId={termId} size="xs" align={alignPos} />
                        </div>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {sec} - Level 1
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Goal Options */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase text-zinc-400 block">
                  Primary Goal
                </span>
                <TermHelpTooltip
                  customTitle="Primary Fitness Goal"
                  customShort="Calibrates your program volume, rep ranges, rest periods, and caloric guidance."
                  customExplanation="Selecting your goal informs the AI engine and workout routines whether to prioritize muscle cross-sectional hypertrophy, compound strength, accelerated fat loss & conditioning, or aesthetic proportions."
                  customWhyItMatters="Aligns weekly tonnage, tempo, and nutrition targets to your desired physical adaptation."
                  size="xs"
                />
              </div>

              <div className="space-y-1.5">
                {goals.map(g => (
                  <div
                    key={g.label}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPrimaryGoal(g.label)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPrimaryGoal(g.label);
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between select-none ${
                      primaryGoal === g.label
                        ? 'border-amber-400 bg-amber-400/10 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-semibold text-xs text-zinc-200 block">{g.label}</span>
                        <TermHelpTooltip termId={g.termId} size="xs" align="right" />
                      </div>
                      <span className="text-[11px] text-zinc-400 mt-0.5 block">{g.desc}</span>
                    </div>
                    {primaryGoal === g.label && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <span>Continue to Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Equipment Setup & Frequency */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
                Equipment & Schedule
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                The program dynamically calibrates exercises for your setup.
              </p>
            </div>

            {/* Equipment Selection */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block">
                Available Equipment
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ENVIRONMENT_LIST.map(env => {
                  const isSelected = equipmentAccess === env.title;
                  return (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => setEquipmentAccess(env.title)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 text-zinc-100'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-lg shrink-0">{env.emoji}</span>
                      <div className="min-w-0">
                        <span className={`text-xs font-semibold block ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                          {env.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {env.shortTitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Segmented Weekly Training Frequency */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono uppercase text-zinc-400">
                    Weekly Training Frequency
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRestDaysModal(true)}
                    className="w-4 h-4 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 hover:border-amber-400 border border-zinc-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                    title="Why rest days are needed & recovery science — tap for info"
                    aria-label="Why rest days are needed and recovery science"
                  >
                    <Info className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-xs font-bold text-amber-400">
                    {daysPerWeek} days / week
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    ({Math.max(0, 7 - daysPerWeek)} {Math.max(0, 7 - daysPerWeek) === 1 ? 'rest day' : 'rest days'})
                  </span>
                </div>
              </div>

              {/* 6 Grid items: 2d, 3d, 4d, 5d, 6d, 7d to make total 7 days of the week selectable */}
              <div className="grid grid-cols-6 gap-1.5">
                {[2, 3, 4, 5, 6, 7].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysPerWeek(d)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                      daysPerWeek === d
                        ? 'bg-amber-400 text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>

              {/* Dynamic Rest Day Context & Direct Info Trigger */}
              <div className="flex items-center justify-between text-[10px] font-mono pt-0.5 px-0.5">
                {daysPerWeek === 7 ? (
                  <span className="text-amber-400/90 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>0 rest days · Include active recovery / mobility</span>
                  </span>
                ) : daysPerWeek === 6 ? (
                  <span className="text-zinc-400">
                    1 rest day / week · High-volume bodybuilding split
                  </span>
                ) : daysPerWeek >= 4 ? (
                  <span className="text-emerald-400/90 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{7 - daysPerWeek} rest days · Optimal hypertrophy & CNS recovery sweet spot</span>
                  </span>
                ) : (
                  <span className="text-zinc-400">
                    {7 - daysPerWeek} rest days · High systemic recovery & foundation building
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowRestDaysModal(true)}
                  className="text-amber-400/80 hover:text-amber-300 underline underline-offset-2 cursor-pointer transition-colors shrink-0 ml-2"
                >
                  Why rest days matter?
                </button>
              </div>
            </div>

            {/* Weakpoint & Injury Constraints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="relative" ref={focusMuscleRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block">
                    Focus Muscle
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {isAllMusclesSelected ? 'All Muscles' : `${selectedMuscles.length} selected`}
                  </span>
                </div>

                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsFocusMuscleOpen(prev => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={isFocusMuscleOpen}
                  className="w-full bg-zinc-900 hover:bg-zinc-850/80 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer flex items-center justify-between gap-2 transition-colors text-left"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                    {isAllMusclesSelected ? (
                      <span className="font-semibold text-amber-300 truncate">
                        All Muscles (Full Body)
                      </span>
                    ) : selectedMuscles.length === 1 ? (
                      <span className="font-medium text-zinc-200 truncate">
                        {selectedMuscles[0]}
                      </span>
                    ) : (
                      <span className="font-medium text-zinc-200 truncate">
                        {selectedMuscles.length} Muscles ({selectedMuscles.map(m => m.split('&')[0].trim()).join(', ')})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isAllMusclesSelected
                          ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {isAllMusclesSelected ? 'All' : selectedMuscles.length}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                        isFocusMuscleOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Multi-Select Dropdown Menu */}
                {isFocusMuscleOpen && (
                  <div
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 max-h-72 overflow-y-auto space-y-1 animate-in fade-in"
                  >
                    {/* Option 1: All Muscles */}
                    <div
                      role="option"
                      aria-selected={isAllMusclesSelected}
                      onClick={handleToggleAllMuscles}
                      className={`w-full p-2 rounded-xl text-left cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                        isAllMusclesSelected
                          ? 'bg-amber-400/10 border border-amber-400/30 text-amber-300'
                          : 'hover:bg-zinc-900 border border-transparent text-zinc-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
                          isAllMusclesSelected
                            ? 'bg-amber-400 border-amber-400 text-zinc-950'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}
                      >
                        {isAllMusclesSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold">All Muscles</span>
                          <span className="text-[9px] font-mono uppercase px-1 rounded bg-amber-400/15 text-amber-300 border border-amber-400/20">
                            Full Body
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Balanced development across all muscle groups
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-850 my-1 mx-1" />

                    {/* Individual Muscle Multi-Select List */}
                    <div className="space-y-0.5">
                      {FOCUS_MUSCLE_OPTIONS.map(opt => {
                        const isChecked = isAllMusclesSelected || selectedMuscles.includes(opt.label);
                        return (
                          <div
                            key={opt.id}
                            role="option"
                            aria-selected={isChecked}
                            onClick={() => handleToggleMuscle(opt.label)}
                            className={`w-full p-2 rounded-xl text-left cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                              isChecked && !isAllMusclesSelected
                                ? 'bg-zinc-900 border border-zinc-750 text-zinc-100'
                                : 'hover:bg-zinc-900/60 border border-transparent text-zinc-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-md mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
                                isChecked
                                  ? isAllMusclesSelected
                                    ? 'bg-amber-400/30 border-amber-400/40 text-amber-300'
                                    : 'bg-amber-400 border-amber-400 text-zinc-950'
                                  : 'border-zinc-700 bg-zinc-900'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium block truncate">{opt.label}</span>
                              <span className="text-[10px] text-zinc-500 block truncate">{opt.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-1.5 mt-1 border-t border-zinc-850 flex items-center justify-between text-[11px] px-1">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-amber-400 hover:text-amber-300 font-mono text-[10px] cursor-pointer"
                      >
                        All Muscles
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFocusMuscleOpen(false)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-[11px] cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                  Joint Sensitivity
                </label>
                <select
                  value={injuries}
                  onChange={e => setInjuries(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {injuryOptions.map(inj => (
                    <option key={inj} value={inj}>{inj}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save Setup & Generate Plan</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Minimal AI Plan Preview */}
        {step === 4 && (
          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
                <p className="text-xs text-zinc-400">Architecting your training plan...</p>
              </div>
            ) : aiRecommendation ? (
              <div className="space-y-3.5 animate-in fade-in">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer group"
                      title="Back to Equipment & Schedule setup"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                      <span>Back to Setup</span>
                    </button>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                      Recommended Plan · {aiRecommendation.matchScorePercentage}% Match
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100 mt-0.5">
                    {aiRecommendation.programTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {aiRecommendation.splitType} · {aiRecommendation.plan.routines.length} routines scheduled
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono text-amber-300 font-semibold">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>
                      {gender === 'woman' || gender === 'female'
                        ? 'Female Physiology Calibration: High-Volume Density & Rapid ATP Recovery'
                        : gender === 'man' || gender === 'male'
                        ? 'Male Physiology Calibration: Heavy Compound Mechanical Tension & Power'
                        : 'Unisex Athletic Calibration: Balanced Periodization'}
                    </span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-850 text-xs text-zinc-300 leading-relaxed">
                  {aiRecommendation.rationale}
                </div>

                {/* Minimalist Prescription Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Protein */}
                  <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">Protein</span>
                      <button
                        type="button"
                        onClick={() => setActiveMetricExplanation('protein')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-800/80 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Why this protein target? Tap for explanation"
                        aria-label="Explain protein target"
                      >
                        <Info className="w-2 h-2" />
                      </button>
                    </div>
                    <span className="font-mono font-bold text-amber-400 mt-0.5 block">
                      {aiRecommendation.recommendedDailyProteinG}g
                    </span>
                  </div>

                  {/* Calories */}
                  <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">Calories</span>
                      <button
                        type="button"
                        onClick={() => setActiveMetricExplanation('calories')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-800/80 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Why this calorie target? Tap for explanation"
                        aria-label="Explain calorie target"
                      >
                        <Info className="w-2 h-2" />
                      </button>
                    </div>
                    <span className="font-mono font-bold text-zinc-200 mt-0.5 block">
                      {aiRecommendation.recommendedCaloricIntake}
                    </span>
                  </div>

                  {/* Volume */}
                  <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">Volume</span>
                      <button
                        type="button"
                        onClick={() => setActiveMetricExplanation('volume')}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-800/80 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Why this weekly volume tonnage? Tap for explanation"
                        aria-label="Explain weekly volume tonnage"
                      >
                        <Info className="w-2 h-2" />
                      </button>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
                      {weightUnit === 'lbs'
                        ? `${Math.round(aiRecommendation.estimatedWeeklyTonnageKg * 2.20462).toLocaleString()} lbs`
                        : `${aiRecommendation.estimatedWeeklyTonnageKg.toLocaleString()} kg`}
                    </span>
                  </div>
                </div>

                {/* Routine List */}
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {aiRecommendation.plan.routines.map((routine, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-850 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-zinc-200">{routine.dayName}</span>
                      <span className="text-zinc-500 font-mono text-[11px]">{routine.exercises.length} Ex</span>
                    </div>
                  ))}
                </div>

                {/* Actions: Back Button and Activate Button */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptPlan}
                    className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 shadow-md"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Activate Plan & Enter App</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Nearby Lifters Search Permission Info Modal */}
        {showNearbyInfoModal && (
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
                  onClick={() => setShowNearbyInfoModal(false)}
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
                    Enabling nearby visibility allows local gym athletes and lifters in your town, city, or gym to discover your training profile when looking for workout partners, spotters, or friendly PR motivation.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  <span className="font-bold text-zinc-200 block text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your Privacy Is Protected</span>
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Your exact street number, private home address, and coordinates are <strong className="text-zinc-200">never published</strong>. Only your general city/town area and gym name are used for approximate distance calculations.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  <span className="font-bold text-amber-400 block text-xs">
                    Can Be Updated in Community Section
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    You have total freedom to change your mind! You can update, turn on, or switch off this permission at any time directly in the <strong className="text-zinc-200">Community</strong> tab under <strong className="text-zinc-200">Nearby Lifters</strong>.
                  </p>
                </div>
              </div>

              {/* Permission Options */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">
                  Give Permission For Nearby Search:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShareLocationPermission(true);
                      setShowNearbyInfoModal(false);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                      shareLocationPermission
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
                      setShareLocationPermission(false);
                      setShowNearbyInfoModal(false);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                      !shareLocationPermission
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
                  onClick={() => setShowNearbyInfoModal(false)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phone & Device Location Tracker Permission & Guide Modal */}
        {showLocationGuideModal && (
          <DeviceLocationGuideModal
            onLocationDetected={(res: DetectedLocationResult) => {
              setCityOrTown(res.cityOrTown);
              setStateOrProvince(res.stateOrProvince);
              setCountry(res.country);
              setZipOrPostalCode(res.zipOrPostalCode);
              setLatitude(res.latitude);
              setLongitude(res.longitude);
              setLocationTrackerEnabled(true);
            }}
            onClose={() => setShowLocationGuideModal(false)}
          />
        )}

        {/* Athlete Avatar Modal (Personal Photo Upload or 10 Gym Animated Characters) */}
        {showAvatarModal && (
          <AvatarSelectorModal
            isOpen={showAvatarModal}
            onClose={() => setShowAvatarModal(false)}
            currentAvatarType={avatarType}
            currentAvatarUrl={avatarUrl}
            currentAvatarId={avatarId}
            athleteName={name}
            onSelectAvatar={data => {
              setAvatarType(data.avatarType);
              setAvatarUrl(data.avatarUrl);
              setAvatarId(data.avatarId);
              try {
                if (data.avatarType === 'upload' && data.avatarUrl) {
                  localStorage.setItem('gympax_user_avatar_type', 'upload');
                  localStorage.setItem('gympax_user_avatar_url', data.avatarUrl);
                } else if (data.avatarId) {
                  localStorage.setItem('gympax_user_avatar_type', 'animated');
                  localStorage.setItem('gympax_user_avatar_id', data.avatarId);
                }
              } catch {}
            }}
          />
        )}

        {/* Tracker Devices ? Info Popup */}
        {showTrackerInfoPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 text-zinc-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Watch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">
                      Why Connect a Fitness Tracker?
                    </h3>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                      Live Biometrics & Training Optimization
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrackerInfoPopup(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-200 block text-xs flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Real-Time Heart Rate & Cardio Zones</span>
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Sync live BPM during heavy sets and rest intervals. GymPax tracks your cardiovascular recovery between sets so you know when your body is primed for your next heavy attempt.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  <span className="font-bold text-zinc-200 block text-xs flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recovery Readiness & Fatigue Adaptation</span>
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    AI programs automatically adapt weight suggestions and set volume based on HRV, resting heart rate, and sleep debt metrics from WHOOP, Apple Watch, Garmin, Oura, or Polar.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  <span className="font-bold text-zinc-200 block text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Accurate Calorie & Energy Expenditure</span>
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Calculates metabolic burn directly from wrist and chest strap optical sensors rather than generic weight multipliers.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  <span className="font-bold text-zinc-200 block text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>100% Optional & Stays Private</span>
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Device connection is optional. If you don't have a device or want to set it up later, you can select &quot;Skip for Later&quot; and pair anytime from Settings or Workout Hub.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowTrackerInfoPopup(false);
                    setTrackerPermission(true);
                    setTrackerSkipped(false);
                    setShowTrackerSetupPage(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>Proceed to Connection Setup</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowTrackerInfoPopup(false);
                    setTrackerSkipped(true);
                    setTrackerPermission(false);
                    setShowTrackerSection(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Skip for Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Connection Setup Page (FitnessTrackerModal) */}
        {showTrackerSetupPage && (
          <FitnessTrackerModal
            devices={devicesState}
            onToggleDevice={handleToggleDeviceLocal}
            onClose={() => setShowTrackerSetupPage(false)}
          />
        )}

        {/* Rest Days & Recovery Explanation Modal */}
        <RestDaysInfoModal
          isOpen={showRestDaysModal}
          onClose={() => setShowRestDaysModal(false)}
          selectedDays={daysPerWeek}
        />

        {/* Metric Explanation Modal for Protein, Calories, and Volume */}
        {aiRecommendation && (
          <MetricExplanationModal
            isOpen={activeMetricExplanation !== null}
            onClose={() => setActiveMetricExplanation(null)}
            initialMetric={activeMetricExplanation || 'protein'}
            recommendation={aiRecommendation}
            weightUnit={weightUnit}
            userWeightKg={computedWeightKg}
            userAge={age}
            userHeightCm={heightCm}
            primaryGoal={primaryGoal}
            daysPerWeek={daysPerWeek}
          />
        )}

      </div>
    </div>
  );
};
