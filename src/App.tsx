/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { WorkoutHubView } from './components/workout/WorkoutHubView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ActiveWorkoutModal } from './components/workout/ActiveWorkoutModal';
import { WorkoutSummaryModal } from './components/workout/WorkoutSummaryModal';
import { PlansView } from './components/plans/PlansView';
import { ProgressView } from './components/progress/ProgressView';
import { SocialFeedView } from './components/social/SocialFeedView';
import { PlateCalculatorModal } from './components/workout/PlateCalculatorModal';
import { OneRepMaxCalculatorModal } from './components/workout/OneRepMaxCalculatorModal';
import { ExerciseLibraryModal } from './components/workout/ExerciseLibraryModal';
import { MembershipView } from './components/membership/MembershipView';
import { FrontPageView } from './components/frontpage/FrontPageView';
import { RegisterModal } from './components/auth/RegisterModal';
import { ProUpgradeModal } from './components/subscription/ProUpgradeModal';
import { SyncStatusModal } from './components/offline/SyncStatusModal';
import { SocialShareModal } from './components/social/SocialShareModal';
import { OnboardingFlowModal } from './components/onboarding/OnboardingFlowModal';
import { FitnessTrackerModal } from './components/devices/FitnessTrackerModal';
import { WorkoutCalendarView } from './components/calendar/WorkoutCalendarView';
import { EquipmentEnvironmentModal } from './components/equipment/EquipmentEnvironmentModal';
import { GymGlossaryModal } from './components/common/GymGlossaryModal';
import { TermsOfUseModal } from './components/common/TermsOfUseModal';
import { RewardsModal } from './components/rewards/RewardsModal';
import { accessTypeToEnvironment, environmentToAccessType, getSubstituteExercise, isExerciseAllowed, adaptPlanForEnvironment, adaptRoutineForEnvironment } from './data/equipmentEnvironments';
import { syncUserProfileToNearbyAthletes } from './utils/nearbyAthletesStorage';
import { getRewardsProfile, awardWorkoutCompletion, awardSocialEngagement, WorkoutRewardResult, setStartingFitnessSection } from './utils/rewardsEngine';
import { applyWearableRecommendation } from './utils/wearableRecommendationEngine';

import {
  ActiveWorkout,
  WorkoutPlan,
  DailyWorkoutRoutine,
  PersonalRecord,
  BodyMeasurement,
  SocialPost,
  UserSubscription,
  SyncStatus,
  WorkoutExercise,
  UserProfile,
  ConnectedDevice,
  EquipmentEnvironment,
  EquipmentAccessType,
  RewardsProfile,
  PhotoTagType,
  MemberAccount
} from './types';

import {
  getActivePlan,
  setActivePlan,
  getWorkoutHistory,
  resetWorkoutSessionCompletion,
  saveCompletedWorkout,
  getDraftWorkout,
  saveDraftWorkout,
  getPersonalRecords,
  getBodyMeasurements,
  addBodyMeasurement,
  getSocialPosts,
  addSocialPost,
  saveSocialPosts,
  getUserSubscription,
  setUserSubscription,
  getAppSettings,
  saveAppSettings,
  AppSettings,
  getLastSyncedAt,
  getSyncQueue,
  getUserProfile,
  saveUserProfile,
  getConnectedDevices,
  saveConnectedDevices,
  getMemberAccount,
  saveMemberAccount,
  loginMemberAccount,
  addSentEmailRecord,
  getCustomExercises
} from './utils/storage';

import { EXERCISE_DATABASE, resolveCatalogExercise } from './data/exercises';
import { getSuggestedNextSet } from './utils/exerciseSuggestions';
import { generateWeeklyProgressDigest } from './utils/weeklyDigest';

export default function App() {
  // Navigation: All users who already registered and enter the site get taken to the Home page ('dashboard'), not workout page
  const [currentTab, setCurrentTab] = useState<string>(() => {
    try {
      const account = getMemberAccount();
      if (account && (account.isEmailVerified || account.isLoggedIn || (account.email && !account.isGuest))) {
        return 'dashboard';
      }
    } catch {}
    return 'dashboard';
  });

  // User Onboarding & Bio-profile
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(getUserProfile);
  // Front Page Landing (GymPax - "Your Gym Partner For Life")
  const [showFrontPage, setShowFrontPage] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [progressInitialTab, setProgressInitialTab] = useState<'progress' | 'history'>('progress');

  const handleGetStartedFromFrontPage = () => {
    setShowFrontPage(false);
    // Registered users are taken directly to the Home page (dashboard)
    const account = getMemberAccount();
    if (account.isEmailVerified || account.isLoggedIn || (account.email && !account.isGuest)) {
      setCurrentTab('dashboard');
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  };

  const handleLoginFromFrontPage = (email: string, name?: string) => {
    const updated = loginMemberAccount(email, name);
    handleUpdateMemberAccount(updated);
    setCurrentTab('dashboard'); // Takes user to Home page
    setShowFrontPage(false);
    setShowOnboarding(false);
  };

  const handleExploreGuestFromFrontPage = () => {
    setShowFrontPage(false);
    setCurrentTab('dashboard'); // Takes user to Home page
  };

  // Connected Devices & Trackers
  const [connectedDevices, setConnectedDevicesState] = useState<ConnectedDevice[]>(getConnectedDevices);
  const [showTrackerModal, setShowTrackerModal] = useState<boolean>(false);

  // Core State
  const [settings, setSettings] = useState<AppSettings>(getAppSettings);
  const [activePlan, setActivePlanState] = useState<WorkoutPlan>(getActivePlan);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [activeDraft, setActiveDraft] = useState<ActiveWorkout | null>(getDraftWorkout);
  const [workoutHistory, setWorkoutHistory] = useState<ActiveWorkout[]>(getWorkoutHistory);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(getPersonalRecords);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(getBodyMeasurements);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(getSocialPosts);
  const [subscription, setSubscriptionState] = useState<UserSubscription>(getUserSubscription);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingSyncCount: getSyncQueue().length,
    lastSyncedAt: getLastSyncedAt()
  });

  // Modals
  const [summaryWorkout, setSummaryWorkout] = useState<ActiveWorkout | null>(null);
  const [pendingWorkoutToShare, setPendingWorkoutToShare] = useState<{
    workout: ActiveWorkout;
    initialPhotoUrl?: string;
    initialPhotoTag?: PhotoTagType;
    initialPhotoCaption?: string;
  } | null>(null);
  const [shareWorkoutModal, setShareWorkoutModal] = useState<ActiveWorkout | null>(null);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [showPlateCalc, setShowPlateCalc] = useState<boolean>(false);
  const [show1RMCalc, setShow1RMCalc] = useState<boolean>(false);
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [libraryInitialMuscle, setLibraryInitialMuscle] = useState<import('./types').MuscleGroup | 'All' | 'Custom'>('All');
  const [showEquipmentModal, setShowEquipmentModal] = useState<boolean>(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState<boolean>(false);
  const [glossaryInitialTermId, setGlossaryInitialTermId] = useState<string | undefined>(undefined);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);
  const [rewardsProfile, setRewardsProfile] = useState<RewardsProfile>(() => getRewardsProfile());
  const [lastRewardResult, setLastRewardResult] = useState<WorkoutRewardResult | null>(null);

  // Membership & Weekly Progress Email State
  const [memberAccount, setMemberAccountState] = useState<MemberAccount>(getMemberAccount);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [registerModalTab, setRegisterModalTab] = useState<'register' | 'login'>('register');

  const handleUpdateMemberAccount = (updated: MemberAccount) => {
    setMemberAccountState(updated);
    saveMemberAccount(updated);
  };

  // Automated recurring weekly progress email digest check (dispatches once a week)
  useEffect(() => {
    if (!memberAccount.isLoggedIn || !memberAccount.emailPreferences.weeklyDigestEnabled) return;

    const lastSent = memberAccount.lastWeeklyEmailSentAt
      ? new Date(memberAccount.lastWeeklyEmailSentAt).getTime()
      : 0;
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    // If 7 days or more elapsed, dispatch automated recurring weekly digest
    if (now - lastSent >= oneWeekMs) {
      try {
        const digest = generateWeeklyProgressDigest(userProfile, workoutHistory, personalRecords, memberAccount);
        fetch('/api/membership/send-weekly-digest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: memberAccount.email, digest })
        }).catch(() => {});

        const sentRecord = {
          id: 'mail_rec_' + Date.now(),
          sentAt: new Date().toISOString(),
          recipientEmail: memberAccount.email,
          subject: 'Your GymPax Weekly Progress Report & Community Connections 📊',
          encouragementMessage: digest.encouragementMessage,
          stats: {
            workoutsCompleted: digest.stats.workoutsCompleted,
            totalSets: digest.stats.totalSets,
            totalVolumeKg: digest.stats.totalVolumeKg,
            streakDays: digest.stats.streakDays,
            topLiftPR: digest.stats.topLiftPR
          },
          worldwideMembersCount: digest.worldwideSuggestedMembers.length,
          localMembersCount: digest.localAreaMembers.length
        };
        const updated = addSentEmailRecord(sentRecord);
        setMemberAccountState(updated);
      } catch (err) {
        console.warn('[GymPax Membership] Recurring digest error:', err);
      }
    }
  }, [memberAccount.isLoggedIn, memberAccount.emailPreferences.weeklyDigestEnabled]);

  // Global listeners for soma:open-glossary, soma:open-terms, and soma:open-rewards
  useEffect(() => {
    const handleOpenGlossary = (e: Event) => {
      const customEvent = e as CustomEvent<{ termId?: string }>;
      if (customEvent.detail?.termId) {
        setGlossaryInitialTermId(customEvent.detail.termId);
      }
      setShowGlossaryModal(true);
    };
    const handleOpenTerms = () => {
      setShowTermsModal(true);
    };
    const handleOpenRewards = () => {
      setShowRewardsModal(true);
    };

    const handlePersonalizedPlansUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ deletedPlanId?: string; fallbackActivePlan?: WorkoutPlan }>;
      if (customEvent.detail?.fallbackActivePlan) {
        setActivePlanState(customEvent.detail.fallbackActivePlan);
      } else {
        setActivePlanState(getActivePlan());
      }
    };

    window.addEventListener('soma:open-glossary', handleOpenGlossary);
    window.addEventListener('soma:open-terms', handleOpenTerms);
    window.addEventListener('soma:open-rewards', handleOpenRewards);
    window.addEventListener('gympax:personalized-plans-updated', handlePersonalizedPlansUpdated);
    return () => {
      window.removeEventListener('soma:open-glossary', handleOpenGlossary);
      window.removeEventListener('soma:open-terms', handleOpenTerms);
      window.removeEventListener('soma:open-rewards', handleOpenRewards);
      window.removeEventListener('gympax:personalized-plans-updated', handlePersonalizedPlansUpdated);
    };
  }, []);

  // Dynamic Equipment Environment resolution
  const currentEnvironment: EquipmentEnvironment =
    settings.equipmentEnvironment ||
    (userProfile?.equipmentEnvironment as EquipmentEnvironment) ||
    accessTypeToEnvironment(userProfile?.equipmentAccess) ||
    'commercial_gym';

  // Live heart rate telemetry from primary tracker
  const primaryConnectedDevice = connectedDevices.find(d => d.isConnected);
  const [liveHeartRate, setLiveHeartRate] = useState<number>(
    primaryConnectedDevice?.currentHeartRateBpm || 128
  );

  useEffect(() => {
    if (!primaryConnectedDevice) return;
    const interval = setInterval(() => {
      setLiveHeartRate(prev => {
        const delta = (Math.random() - 0.5) * 3;
        const targetBase = activeWorkout ? 138 : 124;
        const next = Math.round(prev + (targetBase - prev) * 0.1 + delta);
        return Math.min(178, Math.max(98, next));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [primaryConnectedDevice, activeWorkout]);

  // Network offline/online listeners
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: true,
        pendingSyncCount: getSyncQueue().length
      }));
    };
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (userProfile) {
      syncUserProfileToNearbyAthletes(userProfile);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme application
  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-gray', 'theme-amoled', 'theme-light');
    if (settings.theme === 'gray') {
      document.documentElement.classList.add('theme-gray');
      document.body.style.backgroundColor = '#1A1A1E';
    } else if (settings.theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.body.style.backgroundColor = '#F8F9FA';
    } else if (settings.theme === 'amoled') {
      document.documentElement.classList.add('theme-amoled');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.add('theme-dark');
      document.body.style.backgroundColor = '#000000';
    }
  }, [settings.theme]);

  // Handlers
  const handleSelectEquipmentEnvironment = (env: EquipmentEnvironment, title: EquipmentAccessType) => {
    const updatedSettings: AppSettings = { ...settings, equipmentEnvironment: env };
    handleUpdateSettings(updatedSettings);

    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        equipmentAccess: title,
        equipmentEnvironment: env
      };
      setUserProfileState(updatedProfile);
      saveUserProfile(updatedProfile);
    }

    // Recalibrate current training program so all exercises, sets, and rep ranges match the environment
    if (activePlan) {
      const adaptedPlan = adaptPlanForEnvironment(activePlan, env);
      setActivePlanState(adaptedPlan);
      setActivePlan(adaptedPlan);
    }

    // When changing training environment during an active workout session:
    if (activeWorkout) {
      const isTravel = env === 'bodyweight_travel';
      const isDumbbell = env === 'dumbbell_only';

      const adaptedExercises = activeWorkout.exercises.map(ex => {
        const hasCompletedSets = ex.sets.some(s => s.completed);
        const def = resolveCatalogExercise(ex.exerciseId, ex.primary_muscle);
        if (hasCompletedSets || (def && isExerciseAllowed(def, env))) {
          return ex;
        }

        const replacement = getSubstituteExercise(ex.exerciseId, env);
        const wasBarbell = ex.equipment === 'Barbell';

        const adaptedSets = ex.sets.map(s => {
          if (s.completed) return s;
          let weightKg = s.weightKg;
          let weightLbs = s.weightLbs;
          let reps = s.reps;

          if (isTravel) {
            weightKg = 0;
            weightLbs = 0;
            if (reps < 12) reps = 15;
          } else if (isDumbbell && wasBarbell) {
            weightKg = Math.max(8, Math.round((weightKg * 0.45) / 2) * 2);
            weightLbs = Math.round(weightKg * 2.20462);
            if (reps < 10) reps = 10;
          }

          return {
            ...s,
            weightKg,
            weightLbs,
            reps,
            suggestedWeightKg: weightKg,
            suggestedWeightLbs: weightLbs,
            suggestedReps: reps
          };
        });

        return {
          ...ex,
          id: replacement.id,
          exerciseId: replacement.id,
          name: replacement.name,
          targetMuscle: replacement.primaryMuscle,
          primary_muscle: replacement.primary_muscle || replacement.rawPrimaryMuscle || replacement.primaryMuscle,
          rawPrimaryMuscle: replacement.rawPrimaryMuscle,
          secondaryMuscles: replacement.secondaryMuscles,
          equipment: replacement.equipment,
          cdnUrl: replacement.cdnUrl || replacement.cdn_url,
          cdn_url: replacement.cdn_url || replacement.cdnUrl,
          sets: adaptedSets
        };
      });

      const updatedActive: ActiveWorkout = {
        ...activeWorkout,
        exercises: adaptedExercises
      };
      setActiveWorkout(updatedActive);
      setActiveDraft(updatedActive);
      saveDraftWorkout(updatedActive);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gympax:equipment-environment-changed', {
          detail: { env, title }
        })
      );
    }
  };

  const handleCompleteOnboarding = (profile: UserProfile, aiPlan?: WorkoutPlan) => {
    setUserProfileState(profile);
    saveUserProfile(profile);
    syncUserProfileToNearbyAthletes(profile);
    const env = profile.equipmentEnvironment || accessTypeToEnvironment(profile.equipmentAccess);
    const updatedSettings: AppSettings = {
      ...settings,
      equipmentEnvironment: env,
      ...(profile.weightUnit ? { weightUnit: profile.weightUnit } : {})
    };
    handleUpdateSettings(updatedSettings);
    if (profile.distanceUnit) {
      try {
        localStorage.setItem('soma_distance_unit', profile.distanceUnit);
      } catch {}
    }
    if (aiPlan) {
      setActivePlanState(aiPlan);
      setActivePlan(aiPlan);
    }
    if (profile.fitnessSection && profile.fitnessSection !== 'Elite') {
      const updatedRewards = setStartingFitnessSection(profile.fitnessSection as 'Beginner' | 'Intermediate' | 'Pro');
      setRewardsProfile(updatedRewards);
    }
    setShowOnboarding(false);
    setCurrentTab('dashboard');
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
  };

  const handleUpdateUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
    saveUserProfile(profile);
    syncUserProfileToNearbyAthletes(profile);
    if (profile.weightUnit && profile.weightUnit !== settings.weightUnit) {
      handleUpdateSettings({ ...settings, weightUnit: profile.weightUnit });
    }
    if (profile.distanceUnit) {
      try {
        localStorage.setItem('soma_distance_unit', profile.distanceUnit);
      } catch {}
    }
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
  };

  useEffect(() => {
    const handleAvatarChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarType: 'upload' | 'animated'; avatarUrl?: string; avatarId?: string }>;
      if (customEvent.detail) {
        setUserProfileState(prev => {
          const base: UserProfile = prev || {
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
            onboardingCompleted: true
          };
          const updated: UserProfile = {
            ...base,
            avatarType: customEvent.detail.avatarType,
            avatarUrl: customEvent.detail.avatarUrl,
            avatarId: customEvent.detail.avatarId
          };
          saveUserProfile(updated);
          syncUserProfileToNearbyAthletes(updated);
          return updated;
        });
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('gympax:avatar-changed', handleAvatarChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('gympax:avatar-changed', handleAvatarChange);
      }
    };
  }, [currentEnvironment]);

  const handleToggleDevice = (deviceId: string) => {
    const updated = connectedDevices.map(d =>
      d.id === deviceId ? { ...d, isConnected: !d.isConnected } : d
    );
    setConnectedDevicesState(updated);
    saveConnectedDevices(updated);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const handleSelectPlan = (plan: WorkoutPlan) => {
    const adapted = adaptPlanForEnvironment(plan, currentEnvironment);
    setActivePlanState(adapted);
    setActivePlan(adapted);
    // Discard any active in-progress workout or saved draft as confirmed by user in the warning popup
    if (activeWorkout) {
      setActiveWorkout(null);
    }
    if (activeDraft) {
      setActiveDraft(null);
      saveDraftWorkout(null);
    }
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
  };

  const handleRedoWorkoutSession = (plan: WorkoutPlan, routine?: DailyWorkoutRoutine) => {
    // 1. Reset completion status in history so the session becomes active again
    const routineNames = (plan.routines || []).map(r => r.dayName);
    const updatedHistory = resetWorkoutSessionCompletion(plan.title, routineNames);
    setWorkoutHistory(updatedHistory);

    // 2. Set this plan as active (replacing current workout plans)
    const adapted = adaptPlanForEnvironment(plan, currentEnvironment);
    setActivePlanState(adapted);
    setActivePlan(adapted);

    // 3. Clear any existing active workout or saved drafts
    if (activeWorkout) setActiveWorkout(null);
    if (activeDraft) {
      setActiveDraft(null);
      saveDraftWorkout(null);
    }

    // 4. Start the routine fresh so it becomes active again
    const targetRoutine = routine || (adapted.routines && adapted.routines[0]);
    if (targetRoutine) {
      handleStartRoutine(targetRoutine);
    }

    // 5. Navigate to the workout tab
    setCurrentTab('workout');
  };

  const handleUpdateActivePlan = (plan: WorkoutPlan) => {
    setActivePlanState(plan);
    setActivePlan(plan);
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
  };

  const handleStartRoutine = (routine: DailyWorkoutRoutine) => {
    const customList = getCustomExercises();
    const allKnownExercises = [...customList, ...EXERCISE_DATABASE];
    const adaptedRoutine = adaptRoutineForEnvironment(routine, currentEnvironment);
    const sourceExercises =
      routine.exercises.every(item => allKnownExercises.some(e => e.id === item.exerciseId))
        ? routine.exercises
        : adaptedRoutine.exercises;
    const history = getWorkoutHistory();
    const isWoman = userProfile?.gender === 'woman' || userProfile?.gender === 'female';
    const isMan = userProfile?.gender === 'man' || userProfile?.gender === 'male';
    const calibratedRestSeconds = isWoman ? 60 : isMan ? 90 : 75;

    const exercises: WorkoutExercise[] = sourceExercises.map((item, idx) => {
      const def =
        customList.find(e => e.id === item.exerciseId) ||
        resolveCatalogExercise(item.id || item.exerciseId || item.name, item.primary_muscle);

      const tempEx: WorkoutExercise = {
        id: def.id,
        exerciseId: def.id,
        name: def.name,
        targetMuscle: def.primaryMuscle as WorkoutExercise['targetMuscle'],
        primary_muscle: def.primary_muscle || def.rawPrimaryMuscle || def.primaryMuscle,
        rawPrimaryMuscle: def.rawPrimaryMuscle,
        equipment: def.equipment as WorkoutExercise['equipment'],
        cdnUrl: def.cdnUrl || def.cdn_url,
        cdn_url: def.cdn_url || def.cdnUrl,
        sets: [],
        restSeconds: calibratedRestSeconds
      };

      const sets = Array.from({ length: item.defaultSets }).map((_, sIdx) => {
        const setNumber = sIdx + 1;
        const sug = getSuggestedNextSet(tempEx, setNumber, history, settings.weightUnit);
        const parsedTargetReps = parseInt(item.targetReps.split('-')[0], 10) || 8;
        const calibratedReps = isWoman ? Math.min(15, parsedTargetReps + 2) : parsedTargetReps;
        return {
          id: `s_${Date.now()}_${idx}_${sIdx}`,
          setNumber,
          type: (sIdx === 0 ? sug.type : 'normal') as WorkoutExercise['sets'][0]['type'],
          weightKg: sug.weightKg,
          weightLbs: sug.weightLbs,
          reps: sug.reps || calibratedReps,
          rpe: sug.rpe || (isWoman ? 8.0 : item.targetRpe),
          completed: false,
          isSuggested: true,
          suggestedWeightKg: sug.weightKg,
          suggestedWeightLbs: sug.weightLbs,
          suggestedReps: sug.reps || calibratedReps,
          suggestedReason: sug.reason || (isWoman ? 'AI calibrated: female volume curve' : isMan ? 'AI calibrated: mechanical tension power' : 'AI progressive overload'),
          previousBest: sug.previousBestDisplay
        };
      });

      return {
        id: def.id,
        exerciseId: def.id,
        name: def.name,
        targetMuscle: def.primaryMuscle as WorkoutExercise['targetMuscle'],
        primary_muscle: def.primary_muscle || def.rawPrimaryMuscle || def.primaryMuscle,
        rawPrimaryMuscle: def.rawPrimaryMuscle,
        secondaryMuscles: def.secondaryMuscles,
        equipment: def.equipment as WorkoutExercise['equipment'],
        cdnUrl: def.cdnUrl || def.cdn_url,
        cdn_url: def.cdn_url || def.cdnUrl,
        sets,
        restSeconds: calibratedRestSeconds
      };
    });

    let newWorkout: ActiveWorkout = {
      id: `w_${Date.now()}`,
      title: routine.dayName,
      startTime: Date.now(),
      exercises,
      isCompleted: false,
      durationSeconds: 0,
      totalVolumeKg: 0,
      date: new Date().toISOString().split('T')[0]
    };

    if (routine.wearableRecommendation && routine.wearableDecision === 'accepted') {
      newWorkout = applyWearableRecommendation(newWorkout, routine.wearableRecommendation);
    }

    initiateWorkoutWithPreCheck(newWorkout);
  };

  const initiateWorkoutWithPreCheck = (workout: ActiveWorkout) => {
    setActiveWorkout(workout);
    setActiveDraft(workout);
    saveDraftWorkout(workout);
  };

  const handleStartCustomWorkout = (title: string, exercises: WorkoutExercise[]) => {
    const newWorkout: ActiveWorkout = {
      id: `w_${Date.now()}`,
      title,
      startTime: Date.now(),
      exercises,
      isCompleted: false,
      durationSeconds: 0,
      totalVolumeKg: 0,
      date: new Date().toISOString().split('T')[0]
    };
    initiateWorkoutWithPreCheck(newWorkout);
  };

  const handleStartQuickWorkout = () => {
    const isWoman = userProfile?.gender === 'woman' || userProfile?.gender === 'female';
    const isMan = userProfile?.gender === 'man' || userProfile?.gender === 'male';
    const calibratedRestSeconds = isWoman ? 60 : isMan ? 90 : 75;

    const defaultEx = EXERCISE_DATABASE[0];
    const history = getWorkoutHistory();
    const tempEx: WorkoutExercise = {
      exerciseId: defaultEx.id,
      name: defaultEx.name,
      targetMuscle: defaultEx.primaryMuscle,
      equipment: defaultEx.equipment,
      sets: [],
      restSeconds: calibratedRestSeconds
    };

    const sets = [1, 2, 3].map(setNumber => {
      const sug = getSuggestedNextSet(tempEx, setNumber, history, settings.weightUnit);
      return {
        id: `s_${Date.now()}_${setNumber}`,
        setNumber,
        type: sug.type,
        weightKg: sug.weightKg,
        weightLbs: sug.weightLbs,
        reps: sug.reps,
        rpe: sug.rpe,
        completed: false,
        isSuggested: true,
        suggestedWeightKg: sug.weightKg,
        suggestedWeightLbs: sug.weightLbs,
        suggestedReps: sug.reps,
        suggestedReason: sug.reason,
        previousBest: sug.previousBestDisplay
      };
    });

    const newWorkout: ActiveWorkout = {
      id: `w_quick_${Date.now()}`,
      title: 'Custom Iron Session',
      startTime: Date.now(),
      exercises: [
        {
          exerciseId: defaultEx.id,
          name: defaultEx.name,
          targetMuscle: defaultEx.primaryMuscle,
          equipment: defaultEx.equipment,
          sets,
          restSeconds: 90
        }
      ],
      isCompleted: false,
      durationSeconds: 0,
      totalVolumeKg: 0,
      date: new Date().toISOString().split('T')[0]
    };

    initiateWorkoutWithPreCheck(newWorkout);
  };

  const handleStartRoutineFromPast = (pastWorkout: ActiveWorkout) => {
    const clonedExercises: WorkoutExercise[] = pastWorkout.exercises.map((ex, exIdx) => ({
      ...ex,
      sets: ex.sets.map((s, sIdx) => ({
        ...s,
        id: `s_repeat_${Date.now()}_${exIdx}_${sIdx}`,
        completed: false
      }))
    }));

    const newWorkout: ActiveWorkout = {
      id: `w_repeat_${Date.now()}`,
      title: `${pastWorkout.title} (Re-run)`,
      startTime: Date.now(),
      exercises: clonedExercises,
      isCompleted: false,
      durationSeconds: 0,
      totalVolumeKg: 0,
      date: new Date().toISOString().split('T')[0]
    };

    initiateWorkoutWithPreCheck(newWorkout);
  };

  const handleFinishWorkout = (finishedWorkout: ActiveWorkout) => {
    const { prCount } = saveCompletedWorkout(finishedWorkout);
    finishedWorkout.prCount = prCount;

    const updatedHistory = getWorkoutHistory();
    setWorkoutHistory(updatedHistory);
    setPersonalRecords(getPersonalRecords());
    setActiveWorkout(null);
    setActiveDraft(null);

    // Award exactly 1 Grit for completing the workout and evaluate streak multipliers!
    const rewardResult = awardWorkoutCompletion(finishedWorkout, updatedHistory);
    setRewardsProfile(rewardResult.updatedProfile);
    setLastRewardResult(rewardResult);

    setSummaryWorkout(finishedWorkout);
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
  };

  const handleShareToFeed = (
    workout: ActiveWorkout,
    attachedPhotoUrl?: string,
    photoTag?: PhotoTagType,
    photoCaption?: string
  ) => {
    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      userId: 'u_me',
      userName: userProfile?.name ? `${userProfile.name}` : 'You (Athlete)',
      userAvatarSeed: 'my_avatar',
      userBadge: subscription.isPro ? 'PRO' : 'BEAST',
      workoutTitle: photoCaption ? `${workout.title} · ${photoCaption}` : workout.title,
      durationMinutes: Math.floor(workout.durationSeconds / 60),
      volumeKg: workout.totalVolumeKg,
      volumeLbs: Math.round(workout.totalVolumeKg * 2.20462),
      topSet: workout.exercises[0]?.name ? `${workout.exercises[0].name}` : 'Compound PR',
      prBroken: workout.prCount ? `${workout.prCount} New PR hit today!` : undefined,
      timestamp: Date.now(),
      likes: 1,
      cheers: [{ id: 'ch_me', userId: 'u_me', userName: 'You', emoji: '💪', label: 'Beast Mode' }],
      comments: [],
      isLikedByMe: true,
      streakDays: rewardsProfile.currentStreakDays,
      activeBadges: rewardsProfile.badges,
      userRank: rewardsProfile.rankTitle,
      photoUrl: attachedPhotoUrl,
      postType: attachedPhotoUrl ? 'photo_showcase' : 'workout',
      workoutSession: workout
    };

    const updated = addSocialPost(newPost);
    setSocialPosts(updated);
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
    const updatedRewards = awardSocialEngagement('post');
    setRewardsProfile(updatedRewards);
  };

  const handleCheerPost = (postId: string, emoji: '💪' | '🔥' | '⚡' | '🏆' | '🦍', label: string) => {
    const targetPost = socialPosts.find(p => p.id === postId);
    // Only one click allowed per cheer emoji button
    if (targetPost && targetPost.cheers.some(c => c.userId === 'u_me' && c.emoji === emoji)) {
      return;
    }
    const updated = socialPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          cheers: [
            ...p.cheers,
            { id: `c_${Date.now()}`, userId: 'u_me', userName: 'You', emoji, label }
          ]
        };
      }
      return p;
    });
    setSocialPosts(updated);
    saveSocialPosts(updated);
    const updatedRewards = awardSocialEngagement('cheer');
    setRewardsProfile(updatedRewards);
  };

  const handleLikePost = (postId: string) => {
    const targetPost = socialPosts.find(p => p.id === postId);
    // Only one liked click allowed!
    if (targetPost?.isLikedByMe) {
      return;
    }
    const updated = socialPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.likes + 1,
          isLikedByMe: true
        };
      }
      return p;
    });
    setSocialPosts(updated);
    saveSocialPosts(updated);
  };

  const handleAddComment = (postId: string, text: string) => {
    const targetPost = socialPosts.find(p => p.id === postId);
    // In community comments section, user can only send one quick response message at the time
    if (targetPost && targetPost.comments.some(c => c.userId === 'u_me')) {
      return;
    }
    const updated = socialPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `cm_${Date.now()}`,
              userId: 'u_me',
              userName: userProfile?.name || 'You',
              avatarSeed: 'me',
              text,
              timestamp: Date.now()
            }
          ]
        };
      }
      return p;
    });
    setSocialPosts(updated);
    saveSocialPosts(updated);
    const updatedRewards = awardSocialEngagement('comment');
    setRewardsProfile(updatedRewards);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    const updated = socialPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    });
    setSocialPosts(updated);
    saveSocialPosts(updated);
  };

  const handleCreateFeedPost = (title: string, topSet: string, volumeKg: number) => {
    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      userId: 'u_me',
      userName: userProfile?.name ? `${userProfile.name}` : 'You (Athlete)',
      userAvatarSeed: 'my_avatar',
      userBadge: subscription.isPro ? 'PRO' : 'LIFTER',
      workoutTitle: title,
      durationMinutes: 55,
      volumeKg,
      volumeLbs: Math.round(volumeKg * 2.20462),
      topSet,
      timestamp: Date.now(),
      likes: 1,
      cheers: [{ id: `c_${Date.now()}`, userId: 'u_me', userName: 'You', emoji: '🔥', label: 'Crushed it' }],
      comments: [],
      isLikedByMe: true
    };
    const updated = addSocialPost(newPost);
    setSocialPosts(updated);
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
  };

  const handlePublishCustomPost = (post: SocialPost) => {
    const updated = addSocialPost(post);
    setSocialPosts(updated);
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
    const updatedRewards = awardSocialEngagement('post');
    setRewardsProfile(updatedRewards);
  };

  const handleAddMeasurement = (m: BodyMeasurement) => {
    const updated = addBodyMeasurement(m);
    setMeasurements(updated);
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
  };

  const handleUpdateSubscription = (sub: UserSubscription) => {
    setSubscriptionState(sub);
    setUserSubscription(sub);
    setSyncStatus(prev => ({ ...prev, pendingSyncCount: getSyncQueue().length }));
  };

  if (showFrontPage) {
    return (
      <FrontPageView
        onGetStarted={handleGetStartedFromFrontPage}
        onLogin={handleLoginFromFrontPage}
        onExploreGuest={handleExploreGuestFromFrontPage}
        onRegisterSuccess={account => {
          handleUpdateMemberAccount(account);
          setCurrentTab('dashboard');
          setShowFrontPage(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black relative">
      {/* Universal Top Bar adhering to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onTabChange={tab => {
          setShowFrontPage(false);
          setCurrentTab(tab);
        }}
        syncStatus={syncStatus}
        onOpenSyncModal={() => setShowSyncModal(true)}
        subscription={subscription}
        onOpenProModal={() => setShowProModal(true)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenTrackerModal={() => setShowTrackerModal(true)}
        onOpenProfileModal={() => setShowOnboarding(true)}
        connectedHeartRate={primaryConnectedDevice ? liveHeartRate : undefined}
        userProfile={userProfile}
        currentEnvironment={currentEnvironment}
        onOpenEquipmentModal={() => setShowEquipmentModal(true)}
        onOpenGlossary={() => {
          setGlossaryInitialTermId(undefined);
          setShowGlossaryModal(true);
        }}
        onOpenTermsModal={() => setShowTermsModal(true)}
        rewardsProfile={rewardsProfile}
        onOpenRewardsModal={() => setShowRewardsModal(true)}
        onUpdateUserProfile={handleUpdateUserProfile}
        onOpenFrontPage={() => setShowFrontPage(true)}
        memberAccount={memberAccount}
        onOpenRegister={tab => {
          setRegisterModalTab(tab || 'register');
          setShowRegisterModal(true);
        }}
      />

      {/* Main Content Hub */}
      <main className="flex-1 pb-28 md:pb-12 relative w-full max-w-full overflow-x-hidden">
        {currentTab === 'dashboard' && (
          <DashboardView
            userProfile={userProfile}
            subscription={subscription}
            onOpenProModal={() => setShowProModal(true)}
            onNavigate={tab => setCurrentTab(tab)}
            workoutHistory={workoutHistory}
            activePlan={activePlan}
            personalRecords={personalRecords}
            rewardsProfile={rewardsProfile}
            currentEnvironment={currentEnvironment}
            onOpenEquipmentModal={() => setShowEquipmentModal(true)}
            onOpenLibrary={() => {
              setLibraryInitialMuscle('All');
              setShowLibrary(true);
            }}
            onOpenProfileModal={() => setShowOnboarding(true)}
            onUpdateUserProfile={handleUpdateUserProfile}
            unit={settings.weightUnit}
            activeDraft={activeDraft}
            onStartRoutine={handleStartRoutine}
            onResumeDraft={() => {
              if (activeDraft) {
                setActiveWorkout(activeDraft);
              }
            }}
          />
        )}

        {currentTab === 'workout' && (
          <WorkoutHubView
            activePlan={activePlan}
            activeDraft={activeDraft}
            workoutHistory={workoutHistory}
            unit={settings.weightUnit}
            onStartRoutine={handleStartRoutine}
            onStartQuickWorkout={handleStartQuickWorkout}
            onResumeDraft={() => {
              if (activeDraft) {
                setActiveWorkout(activeDraft);
              }
            }}
            onOpenPlateCalc={() => setShowPlateCalc(true)}
            onOpen1RMCalc={() => setShow1RMCalc(true)}
            onOpenLibrary={() => {
              setLibraryInitialMuscle('All');
              setShowLibrary(true);
            }}
            onViewHistoryItem={w => setSummaryWorkout(w)}
            primaryDevice={primaryConnectedDevice}
            onOpenTrackerModal={() => setShowTrackerModal(true)}
            onOpenAiAdvisor={() => setShowOnboarding(true)}
            userProfile={userProfile}
            onStartRoutineFromPast={handleStartRoutineFromPast}
            onOpenShareModal={w => setShareWorkoutModal(w)}
            onOpenPlansTab={() => setCurrentTab('plans')}
            onStartCustomWithExercises={handleStartCustomWorkout}
            onFilterLibraryByMuscle={(muscle: string) => {
              if (muscle === 'Custom') {
                setLibraryInitialMuscle('Custom');
                setShowLibrary(true);
                return;
              }
              const mapped: import('./types').MuscleGroup | 'All' =
                muscle === 'Arms' ? 'Biceps' :
                muscle === 'Legs' ? 'Quads' :
                muscle === 'Core' ? 'Abs & Core' :
                (muscle as import('./types').MuscleGroup) || 'All';
              setLibraryInitialMuscle(mapped);
              setShowLibrary(true);
            }}
            currentEnvironment={currentEnvironment}
            onOpenEquipmentModal={() => setShowEquipmentModal(true)}
            onOpenGlossary={() => {
              setGlossaryInitialTermId(undefined);
              setShowGlossaryModal(true);
            }}
            currentTheme={settings.theme}
            onSelectTheme={(theme) => handleUpdateSettings({ ...settings, theme })}
            rewardsProfile={rewardsProfile}
            onOpenRewardsModal={() => setShowRewardsModal(true)}
            onUpdatePlan={handleSelectPlan}
            subscription={subscription}
            onOpenProModal={() => setShowProModal(true)}
            onOpenProfileModal={() => setShowOnboarding(true)}
            onOpenProgressTab={(tab) => {
              setProgressInitialTab(tab || 'progress');
              setCurrentTab('progress');
            }}
          />
        )}

        {currentTab === 'plans' && (
          <PlansView
            activePlan={activePlan}
            workoutHistory={workoutHistory}
            onSelectPlan={handleSelectPlan}
            onStartRoutine={handleStartRoutine}
            currentEnvironment={currentEnvironment}
            onOpenEquipmentModal={() => setShowEquipmentModal(true)}
            currentTheme={settings.theme}
            onSelectTheme={theme => handleUpdateSettings({ ...settings, theme })}
            subscription={subscription}
            onOpenUpgradeModal={() => setShowProModal(true)}
            onNavigateToWorkout={() => setCurrentTab('workout')}
            onRedoWorkoutSession={handleRedoWorkoutSession}
          />
        )}

        {currentTab === 'calendar' && (
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 text-zinc-100">
            <div className="flex justify-end -mb-2">
              <button
                type="button"
                onClick={() => setCurrentTab('dashboard')}
                aria-label="Close section"
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
                title="Close section"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <WorkoutCalendarView
              workoutHistory={workoutHistory}
              unit={settings.weightUnit}
              onStartRoutineFromPast={handleStartRoutineFromPast}
              onOpenShareModal={w => setShareWorkoutModal(w)}
              onStartQuickWorkout={handleStartQuickWorkout}
              currentTheme={settings.theme}
              onSelectTheme={theme => handleUpdateSettings({ ...settings, theme })}
              userProfile={userProfile}
            />
          </div>
        )}

        {currentTab === 'progress' && (
          <ProgressView
            personalRecords={personalRecords}
            measurements={measurements}
            workoutHistory={workoutHistory}
            unit={settings.weightUnit}
            onAddMeasurement={handleAddMeasurement}
            onOpen1RMCalc={() => setShow1RMCalc(true)}
            onStartRoutineFromPast={handleStartRoutineFromPast}
            onOpenShareModal={w => setShareWorkoutModal(w)}
            onStartQuickWorkout={handleStartQuickWorkout}
            onViewHistoryItem={w => setSummaryWorkout(w)}
            onNavigateToWorkout={() => setCurrentTab('workout')}
            initialTab={progressInitialTab}
            currentTheme={settings.theme}
            onSelectTheme={theme => handleUpdateSettings({ ...settings, theme })}
            rewardsProfile={rewardsProfile}
            onOpenRewardsModal={() => setShowRewardsModal(true)}
            activePlan={activePlan}
            onUpdatePlan={handleUpdateActivePlan}
            userProfile={userProfile}
          />
        )}

        {currentTab === 'community' && (
          <SocialFeedView
            posts={socialPosts}
            onCheerPost={handleCheerPost}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onNewPost={handleCreateFeedPost}
            onPublishPost={handlePublishCustomPost}
            unit={settings.weightUnit}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            currentTheme={settings.theme}
            onSelectTheme={theme => handleUpdateSettings({ ...settings, theme })}
            rewardsProfile={rewardsProfile}
            onUpdateRewardsProfile={setRewardsProfile}
            onOpenRewardsModal={() => setShowRewardsModal(true)}
            subscription={subscription}
            onOpenProModal={() => setShowProModal(true)}
            pendingWorkoutToShare={pendingWorkoutToShare}
            onClearPendingWorkoutToShare={() => setPendingWorkoutToShare(null)}
          />
        )}

        {currentTab === 'membership' && (
          <MembershipView
            memberAccount={memberAccount}
            onUpdateMemberAccount={handleUpdateMemberAccount}
            userProfile={userProfile}
            workoutHistory={workoutHistory}
            personalRecords={personalRecords}
            subscription={subscription}
            onOpenProModal={() => setShowProModal(true)}
            onNavigateTab={tab => setCurrentTab(tab)}
            onLogout={() => setShowFrontPage(true)}
            onClose={() => setCurrentTab('dashboard')}
          />
        )}
      </main>

      {/* Ergonomic Mobile Bottom Nav Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={tab => setCurrentTab(tab)}
      />


      {/* Global Athlete Register, Email Verification & Feature Showcase Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        initialTab={registerModalTab}
        onSuccess={account => {
          handleUpdateMemberAccount(account);
          setCurrentTab('dashboard');
          setShowRegisterModal(false);
          setShowFrontPage(false);
        }}
        onEnterGuestLater={() => {
          setCurrentTab('dashboard');
          setShowRegisterModal(false);
          setShowFrontPage(false);
        }}
      />

      {/* Onboarding Flow: Personal Info & AI Recommended Program */}
      {showOnboarding && (
        <OnboardingFlowModal
          initialProfile={userProfile}
          initialStep={1}
          onComplete={handleCompleteOnboarding}
          onClose={() => setShowOnboarding(false)}
          currentTheme={settings.theme}
          onSelectTheme={theme => handleUpdateSettings({ ...settings, theme })}
          onOpenTerms={() => setShowTermsModal(true)}
          initialWeightUnit={settings.weightUnit}
          initialDistanceUnit={(localStorage.getItem('soma_distance_unit') as 'mi' | 'km') || userProfile?.distanceUnit || 'km'}
          connectedDevices={connectedDevices}
          onToggleDevice={handleToggleDevice}
        />
      )}

      {/* Fitness Tracker & Wearables Modal */}
      {showTrackerModal && (
        <FitnessTrackerModal
          devices={connectedDevices}
          onToggleDevice={handleToggleDevice}
          onClose={() => setShowTrackerModal(false)}
        />
      )}

      {/* Active Workout Screen Modal */}
      {activeWorkout && (
        <ActiveWorkoutModal
          workout={activeWorkout}
          onUpdateWorkout={w => {
            setActiveWorkout(w);
            setActiveDraft(w);
          }}
          onFinishWorkout={handleFinishWorkout}
          onCancelWorkout={() => {
            setActiveWorkout(null);
            setActiveDraft(null);
            saveDraftWorkout(null);
          }}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          connectedHeartRate={primaryConnectedDevice ? liveHeartRate : undefined}
          onOpenTracker={() => setShowTrackerModal(true)}
          currentEnvironment={currentEnvironment}
          onOpenEquipmentModal={() => setShowEquipmentModal(true)}
          onAdaptToEnvironment={env => handleSelectEquipmentEnvironment(env, environmentToAccessType(env))}
        />
      )}

      {/* Workout Completion Summary Modal */}
      {summaryWorkout && (
        <WorkoutSummaryModal
          workout={summaryWorkout}
          unit={settings.weightUnit}
          onClose={() => setSummaryWorkout(null)}
          onShareToCommunity={(workout, attachedPhotoUrl, photoTag, photoCaption) => {
            setSummaryWorkout(null);
            setPendingWorkoutToShare({
              workout,
              initialPhotoUrl: attachedPhotoUrl,
              initialPhotoTag: photoTag,
              initialPhotoCaption: photoCaption
            });
            setCurrentTab('community');
          }}
          onShareToFeed={(attachedPhotoUrl, photoTag, photoCaption) =>
            handleShareToFeed(summaryWorkout, attachedPhotoUrl, photoTag, photoCaption)
          }
          onOpenSocialShareCard={() => setShareWorkoutModal(summaryWorkout)}
          rewardResult={lastRewardResult}
          userProfile={userProfile}
          onUpdateUserProfile={handleUpdateUserProfile}
          subscription={subscription}
        />
      )}

      {/* Social Story Card Generator Modal */}
      {shareWorkoutModal && (
        <SocialShareModal
          workout={shareWorkoutModal}
          unit={settings.weightUnit}
          onClose={() => setShareWorkoutModal(null)}
        />
      )}

      {/* Plate Loading Calculator Modal */}
      {showPlateCalc && (
        <PlateCalculatorModal
          unit={settings.weightUnit}
          onClose={() => setShowPlateCalc(false)}
        />
      )}

      {/* 1RM Estimator Modal */}
      {show1RMCalc && (
        <OneRepMaxCalculatorModal
          unit={settings.weightUnit}
          onClose={() => setShow1RMCalc(false)}
        />
      )}

      {/* Exercise Library Modal */}
      {showLibrary && (
        <ExerciseLibraryModal
          currentEnvironment={currentEnvironment}
          initialMuscle={libraryInitialMuscle}
          onClose={() => {
            setShowLibrary(false);
            setLibraryInitialMuscle('All');
          }}
          onSelectExercise={def => {
            const isBodyweight = def.equipment === 'Bodyweight';
            const defaultWeightKg = isBodyweight ? 0 : 40;
            const defaultWeightLbs = isBodyweight ? 0 : 90;
            const workoutExercise: WorkoutExercise = {
              exerciseId: def.id,
              name: def.name,
              targetMuscle: def.primaryMuscle,
              secondaryMuscles: def.secondaryMuscles,
              equipment: def.equipment,
              notes: def.description || '',
              restSeconds: 90,
              sets: [1, 2, 3].map(setNumber => ({
                id: `s_${Date.now()}_${setNumber}`,
                setNumber,
                type: setNumber === 1 && !isBodyweight ? 'warmup' : 'normal',
                weightKg: defaultWeightKg,
                weightLbs: defaultWeightLbs,
                reps: 10,
                rpe: 8,
                completed: false
              }))
            };
            handleStartCustomWorkout(`${def.name} Session`, [workoutExercise]);
            setShowLibrary(false);
            setLibraryInitialMuscle('All');
          }}
          subscription={subscription}
          onOpenUpgradeModal={() => setShowProModal(true)}
        />
      )}

      {/* Adaptive Equipment Environment Switcher Modal */}
      {showEquipmentModal && (
        <EquipmentEnvironmentModal
          currentEnvironment={currentEnvironment}
          onSelectEnvironment={handleSelectEquipmentEnvironment}
          onClose={() => setShowEquipmentModal(false)}
        />
      )}

      {/* Pro Paid Feature Modal */}
      {showProModal && (
        <ProUpgradeModal
          subscription={subscription}
          onUpdateSubscription={handleUpdateSubscription}
          onClose={() => setShowProModal(false)}
        />
      )}

      {/* Offline Sync Manager Modal */}
      {showSyncModal && (
        <SyncStatusModal
          syncStatus={syncStatus}
          onClose={() => setShowSyncModal(false)}
          onSyncComplete={ts =>
            setSyncStatus({
              isOnline: navigator.onLine,
              pendingSyncCount: 0,
              lastSyncedAt: ts
            })
          }
        />
      )}

      {/* Fitness & Bodybuilding Glossary Modal */}
      {showGlossaryModal && (
        <GymGlossaryModal
          isOpen={showGlossaryModal}
          initialTermId={glossaryInitialTermId}
          onClose={() => setShowGlossaryModal(false)}
        />
      )}

      {/* Terms of Use & Medical Disclaimer Modal */}
      {showTermsModal && (
        <TermsOfUseModal
          onClose={() => setShowTermsModal(false)}
          onAccept={() => setShowTermsModal(false)}
        />
      )}

      {/* Grit & Discipline Rewards Economy Modal */}
      {showRewardsModal && (
        <RewardsModal
          initialProfile={rewardsProfile}
          onClose={() => setShowRewardsModal(false)}
          onProfileUpdated={setRewardsProfile}
          subscription={subscription}
          onOpenProModal={() => {
            setShowRewardsModal(false);
            setShowProModal(true);
          }}
        />
      )}
    </div>
  );
}
