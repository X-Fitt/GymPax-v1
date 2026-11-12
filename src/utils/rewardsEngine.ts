import {
  ActiveWorkout,
  RewardsProfile,
  UserBadge,
  FitnessSection,
  SectionLevel,
  RewardsLog
} from '../types';

const STORAGE_KEY = 'soma_rewards_profile';

export const AVAILABLE_BADGES: UserBadge[] = [
  {
    id: 'flame_3d',
    name: 'Streak Spark',
    description: 'Trained 3 consecutive days in a row.',
    icon: 'flame',
    requirementDescription: '3-Day Active Streak'
  },
  {
    id: 'flame_7d',
    name: 'Weekly Discipline',
    description: 'Maintained a 7-day consistency habit.',
    icon: 'zap',
    requirementDescription: '7-Day Streak Milestone'
  },
  {
    id: 'flame_30d',
    name: 'Monthly Iron Will',
    description: 'Achieved 30 days of consistent training habit.',
    icon: 'trophy',
    requirementDescription: '30-Day Streak Milestone'
  },
  {
    id: 'section_intermediate',
    name: 'Intermediate Lifter',
    description: 'Advanced to the Intermediate fitness section (1000 points earned).',
    icon: 'award',
    requirementDescription: 'Intermediate Section Unlocked'
  },
  {
    id: 'section_pro',
    name: 'Pro Bodybuilder',
    description: 'Reached or initiated the Pro bodybuilding section.',
    icon: 'target',
    requirementDescription: 'Pro Section Unlocked'
  },
  {
    id: 'section_elite',
    name: 'Elite Crown Pinnacle',
    description: 'Earned the pinnacle Elite rank through dedicated app workouts (1000 Pro points).',
    icon: 'trophy',
    requirementDescription: 'Earned Exclusively in App'
  },
  {
    id: 'shield_rest',
    name: 'Shield of Rest',
    description: 'Acquired a Streak Freeze shield to safeguard recovery days.',
    icon: 'shield',
    requirementDescription: '1 Streak Freeze Shield'
  },
  {
    id: 'app_ambassador',
    name: 'Community Ambassador',
    description: 'Shared GymPax app invite link with fellow athletes.',
    icon: 'target',
    requirementDescription: 'Shared GymPax App (+2 pts)'
  },
  {
    id: 'squad_recruiter',
    name: 'Squad Recruiter',
    description: 'Brought a gym buddy into GymPax with personal referral link.',
    icon: 'award',
    requirementDescription: 'Referral Sign Up (+3 pts)'
  },
  {
    id: 'active_commenter',
    name: 'Iron Mentor',
    description: 'Regularly comments and cheers on fellow athletes.',
    icon: 'flame',
    requirementDescription: 'Active Social Feedback (+1 pt)'
  },
  {
    id: 'pr_crusher',
    name: 'PR Crusher',
    description: 'Hit an all-time personal record on mechanical tension.',
    icon: 'trophy',
    requirementDescription: 'New PR Milestone (+2 pts)'
  },
  {
    id: 'challenge_conqueror',
    name: 'Challenge Conqueror',
    description: 'Conquered an official GymPax Monthly Community Challenge.',
    icon: 'trophy',
    requirementDescription: 'Completed Challenge (+10 pts)'
  }
];

export interface RankCalculation {
  section: FitnessSection;
  level: SectionLevel;
  sectionPoints: number;
  rankTitle: string;
  nextRankTitle: string;
  pointsToNextLevel: number;
  pointsToNextSection: number;
  levelProgressPercent: number;
  sectionProgressPercent: number;
  sectionPromoted: boolean;
}

/**
 * Calculates user rank across the 4 sections (Beginner, Intermediate, Pro, Elite)
 * with 3 levels per section (Level 1, Level 2, Level 3).
 * 1000 points per section to advance.
 * 333 points per level within each section.
 */
export function calculateRankDetails(
  initialSection: FitnessSection,
  rawSectionPoints: number
): RankCalculation {
  let section: FitnessSection = initialSection || 'Intermediate';
  let sectionPoints = Math.max(0, rawSectionPoints);
  let sectionPromoted = false;

  // Check section promotions (1000 points required to go to next section)
  if (sectionPoints >= 1000) {
    if (section === 'Beginner') {
      section = 'Intermediate';
      sectionPoints -= 1000;
      sectionPromoted = true;
    } else if (section === 'Intermediate') {
      section = 'Pro';
      sectionPoints -= 1000;
      sectionPromoted = true;
    } else if (section === 'Pro') {
      section = 'Elite';
      sectionPoints -= 1000;
      sectionPromoted = true;
    } else if (section === 'Elite') {
      // Elite is pinnacle
      sectionPoints = 1000;
    }
  }

  // Calculate Level within Section (333 points per level)
  let level: SectionLevel = 1;
  let pointsToNextLevel = 333;
  let levelProgressPercent = 0;
  let nextRankTitle = '';

  if (sectionPoints < 333) {
    level = 1;
    pointsToNextLevel = 333 - sectionPoints;
    nextRankTitle = `${section} - Level 2`;
    levelProgressPercent = Math.min(100, Math.round((sectionPoints / 333) * 100));
  } else if (sectionPoints < 666) {
    level = 2;
    pointsToNextLevel = 666 - sectionPoints;
    nextRankTitle = `${section} - Level 3`;
    levelProgressPercent = Math.min(100, Math.round(((sectionPoints - 333) / 333) * 100));
  } else {
    level = 3;
    pointsToNextLevel = Math.max(0, 1000 - sectionPoints);
    if (section === 'Beginner') {
      nextRankTitle = 'Intermediate - Level 1';
    } else if (section === 'Intermediate') {
      nextRankTitle = 'Pro - Level 1';
    } else if (section === 'Pro') {
      nextRankTitle = 'Elite - Level 1';
    } else {
      nextRankTitle = 'Elite - Pinnacle Master';
    }
    levelProgressPercent = Math.min(100, Math.round(((sectionPoints - 666) / 334) * 100));
  }

  const pointsToNextSection = Math.max(0, 1000 - sectionPoints);
  const sectionProgressPercent = Math.min(100, Math.round((sectionPoints / 1000) * 100));
  const rankTitle = `${section} - Level ${level}`;

  return {
    section,
    level,
    sectionPoints,
    rankTitle,
    nextRankTitle,
    pointsToNextLevel,
    pointsToNextSection,
    levelProgressPercent,
    sectionProgressPercent,
    sectionPromoted
  };
}

export function evaluateWorkoutHistory(
  workouts: ActiveWorkout[],
  selectedStartingSection: FitnessSection = 'Intermediate'
): RewardsProfile {
  const sorted = [...workouts].sort((a, b) => a.startTime - b.startTime);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Track unique training days
  const uniqueDays = new Set<string>();
  workouts.forEach(w => {
    if (w.date) {
      uniqueDays.add(w.date.trim());
    } else {
      uniqueDays.add(new Date(w.startTime).toISOString().split('T')[0]);
    }
  });

  const weeklyTrainDaysCount = workouts.filter(w => now - w.startTime <= 7 * dayMs).length;
  const monthlyTrainDaysCount = workouts.filter(w => now - w.startTime <= 30 * dayMs).length;
  const yearlyTrainDaysCount = workouts.filter(w => now - w.startTime <= 365 * dayMs).length;

  // Calculate streaks
  let currentStreak = 0;
  let maxStreak = 0;

  if (sorted.length > 0) {
    let tempStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diffDays = Math.round((sorted[i].startTime - sorted[i - 1].startTime) / dayMs);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    }
    maxStreak = Math.max(maxStreak, tempStreak, Math.min(uniqueDays.size, 14));
    currentStreak = Math.min(uniqueDays.size, maxStreak || 5);
  }

  // 5 points awarded per completed workout
  const totalCompletedWorkouts = Math.max(uniqueDays.size, workouts.length, 3);
  const earnedWorkoutPoints = totalCompletedWorkouts * 5;

  // Elite can only be earned through using the app; starting section is Beginner, Intermediate, or Pro
  const baseSection: FitnessSection =
    selectedStartingSection === 'Elite' ? 'Pro' : selectedStartingSection || 'Intermediate';

  const rank = calculateRankDetails(baseSection, earnedWorkoutPoints);

  const initialBadges: string[] = [];
  if (currentStreak >= 3 || uniqueDays.size >= 3) initialBadges.push('flame_3d');
  if (currentStreak >= 7 || maxStreak >= 7) initialBadges.push('flame_7d');
  if (rank.section === 'Pro' || baseSection === 'Pro') initialBadges.push('section_pro');
  if (rank.section === 'Intermediate') initialBadges.push('section_intermediate');
  if (rank.section === 'Elite') initialBadges.push('section_elite');

  return {
    points: earnedWorkoutPoints,
    lifetimePoints: earnedWorkoutPoints,
    section: rank.section,
    level: rank.level,
    sectionPoints: rank.sectionPoints,
    rankTitle: rank.rankTitle,
    nextRankTitle: rank.nextRankTitle,
    pointsToNextLevel: rank.pointsToNextLevel,
    pointsToNextSection: rank.pointsToNextSection,
    levelProgressPercent: rank.levelProgressPercent,
    sectionProgressPercent: rank.sectionProgressPercent,
    currentStreakDays: currentStreak || 5,
    longestStreakDays: Math.max(maxStreak, currentStreak, 5),
    streakFreezeCount: 1, // 1 freeze shield available for free members per 2-month period
    streakFreezeUsedCount: 0,
    streakFreezePeriodStartAt: now,
    streakFreezeUsedInPeriod: 0,
    isFreezeActive: false,
    lastWorkoutDate: sorted[sorted.length - 1]?.date,
    badges: initialBadges,
    weeklyTrainDaysCount: Math.max(weeklyTrainDaysCount, 3),
    monthlyTrainDaysCount: Math.max(monthlyTrainDaysCount, 8),
    yearlyTrainDaysCount: Math.max(yearlyTrainDaysCount, totalCompletedWorkouts),
    historyLogs: [
      {
        id: 'initial_history',
        description: `Initial fitness rank assigned: ${rank.rankTitle} (+${earnedWorkoutPoints} pts)`,
        pointsDelta: earnedWorkoutPoints,
        timestamp: Date.now() - 3600000,
        type: 'workout'
      }
    ],
    // Backwards compatibility aliases
    gritBalance: earnedWorkoutPoints,
    lifetimeGrit: earnedWorkoutPoints,
    levelTitle: rank.rankTitle,
    nextLevelGritRequirement: rank.pointsToNextLevel
  };
}

const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000; // 60 days (2 months period)
const DAY_MS = 24 * 60 * 60 * 1000;

function checkIsProFromStorage(): boolean {
  try {
    const raw = localStorage.getItem('soma_subscription');
    if (raw) {
      const sub = JSON.parse(raw);
      return Boolean(sub?.isPro);
    }
  } catch {}
  return false;
}

export function getRewardsProfile(
  workoutHistory?: ActiveWorkout[],
  startingSection?: FitnessSection
): RewardsProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.points === 'number' && parsed.section) {
        const now = Date.now();
        const isPro = checkIsProFromStorage();
        let periodStart = parsed.streakFreezePeriodStartAt || now;
        let usedInPeriod = parsed.streakFreezeUsedInPeriod ?? 0;
        let availableShields = parsed.streakFreezeCount ?? 1;
        let points = parsed.points;
        let sectionPoints = parsed.sectionPoints ?? 0;
        let historyLogs: RewardsLog[] = Array.isArray(parsed.historyLogs) ? [...parsed.historyLogs] : [];
        let lastPenaltyDate = parsed.lastPenaltyDate;
        let needsSave = false;

        // Reset 2-month (60-day) freeze period if 2 months have elapsed
        if (now - periodStart >= TWO_MONTHS_MS) {
          periodStart = now;
          usedInPeriod = 0;
          availableShields = 1;
          needsSave = true;
        }

        // For free members, once their 1 shield in the 2-month period is exhausted and they haven't resumed exercises,
        // they lose 2 points per missed day until resuming exercises again.
        if (!isPro && availableShields === 0 && usedInPeriod >= 1 && parsed.lastWorkoutDate) {
          const todayStr = new Date(now).toISOString().split('T')[0];
          const refDateStr = lastPenaltyDate || parsed.lastWorkoutDate;
          if (refDateStr && refDateStr < todayStr) {
            const refTime = new Date(refDateStr).getTime();
            const todayTime = new Date(todayStr).getTime();
            const missedDays = Math.floor((todayTime - refTime) / DAY_MS);
            if (missedDays > 0 && !parsed.isFreezeActive) {
              const penaltyPoints = missedDays * 2;
              points = Math.max(0, points - penaltyPoints);
              sectionPoints = Math.max(0, sectionPoints - penaltyPoints);
              lastPenaltyDate = todayStr;
              historyLogs = [
                {
                  id: `penalty_${now}`,
                  description: `Inactivity penalty after 2-month freeze shield limit (-2 pts/day × ${missedDays}d until resuming exercises)`,
                  pointsDelta: -penaltyPoints,
                  timestamp: now,
                  type: 'streak_penalty'
                },
                ...historyLogs.slice(0, 29)
              ];
              needsSave = true;
            }
          }
        }

        // Recalculate rank details dynamically to ensure accuracy
        const rank = calculateRankDetails(parsed.section, sectionPoints);
        const normalized: RewardsProfile = {
          ...parsed,
          points,
          section: rank.section,
          level: rank.level,
          sectionPoints: rank.sectionPoints,
          rankTitle: rank.rankTitle,
          nextRankTitle: rank.nextRankTitle,
          pointsToNextLevel: rank.pointsToNextLevel,
          pointsToNextSection: rank.pointsToNextSection,
          levelProgressPercent: rank.levelProgressPercent,
          sectionProgressPercent: rank.sectionProgressPercent,
          streakFreezeCount: availableShields,
          streakFreezePeriodStartAt: periodStart,
          streakFreezeUsedInPeriod: usedInPeriod,
          lastPenaltyDate,
          historyLogs,
          gritBalance: points,
          lifetimeGrit: parsed.lifetimePoints ?? points,
          levelTitle: rank.rankTitle,
          nextLevelGritRequirement: rank.pointsToNextLevel
        };

        if (needsSave) {
          saveRewardsProfile(normalized);
        }
        return normalized;
      }
    }
  } catch (e) {
    console.error('Failed to parse rewards profile from storage:', e);
  }

  // Fallback initial profile
  const initial = evaluateWorkoutHistory(workoutHistory || [], startingSection);
  saveRewardsProfile(initial);
  return initial;
}

export function saveRewardsProfile(profile: RewardsProfile): void {
  try {
    // Keep aliases synced
    profile.gritBalance = profile.points;
    profile.lifetimeGrit = profile.lifetimePoints;
    profile.levelTitle = profile.rankTitle;
    profile.nextLevelGritRequirement = profile.pointsToNextLevel;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('soma:rewards-updated', { detail: profile }));
    }
  } catch (e) {
    console.error('Failed to save rewards profile to storage:', e);
  }
}

/**
 * Updates the user's starting section from the profile modal or onboarding flow.
 * Note: Elite CANNOT be chosen initially; it can only be earned through using the app!
 */
export function setStartingFitnessSection(
  newSection: 'Beginner' | 'Intermediate' | 'Pro'
): RewardsProfile {
  const current = getRewardsProfile();
  // Elite is strictly unselectable at onboarding/start; targetSection is Beginner, Intermediate, or Pro
  const targetSection: FitnessSection = (newSection as FitnessSection) === 'Elite' ? 'Pro' : newSection;
  const rank = calculateRankDetails(targetSection, 0);

  const updated: RewardsProfile = {
    ...current,
    section: targetSection,
    level: 1,
    sectionPoints: 0,
    rankTitle: rank.rankTitle,
    nextRankTitle: rank.nextRankTitle,
    pointsToNextLevel: rank.pointsToNextLevel,
    pointsToNextSection: 1000,
    levelProgressPercent: 0,
    sectionProgressPercent: 0,
    historyLogs: [
      {
        id: `section_change_${Date.now()}`,
        description: `Starting section configured: ${rank.rankTitle}`,
        pointsDelta: 0,
        timestamp: Date.now(),
        type: 'badge_bonus'
      },
      ...current.historyLogs.slice(0, 29)
    ],
    gritBalance: current.points,
    lifetimeGrit: current.lifetimePoints,
    levelTitle: rank.rankTitle,
    nextLevelGritRequirement: rank.pointsToNextLevel
  };

  saveRewardsProfile(updated);
  return updated;
}

export interface WorkoutRewardResult {
  updatedProfile: RewardsProfile;
  awardedPoints: number;
  newBadgesUnlocked: UserBadge[];
  levelUpOccurred: boolean;
  sectionPromoted?: boolean;
  previousRankTitle?: string;
}

/**
 * Awards exactly 5 points for completing a workout.
 * Evaluates 333 points per level and 1000 points per section advancement.
 * Resuming exercises clears any active freeze state and stops the -2 pts/day penalty.
 */
export function awardWorkoutCompletion(
  workout: ActiveWorkout,
  currentHistory: ActiveWorkout[]
): WorkoutRewardResult {
  const profile = getRewardsProfile(currentHistory);
  const now = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  // Exactly 5 points per completed workout
  const awardedPoints = 5;
  const newPoints = profile.points + awardedPoints;
  const newLifetime = profile.lifetimePoints + awardedPoints;
  const prevRankTitle = profile.rankTitle;
  const prevLevel = profile.level;
  const prevSection = profile.section;

  // New section points
  const candidateSectionPoints = profile.sectionPoints + awardedPoints;
  const rankDetails = calculateRankDetails(profile.section, candidateSectionPoints);

  const levelUpOccurred = rankDetails.level !== prevLevel || rankDetails.section !== prevSection;
  const sectionPromoted = rankDetails.section !== prevSection;

  const newBadges: UserBadge[] = [];
  const updatedBadges = [...profile.badges];

  // Check section badges
  if (rankDetails.section === 'Intermediate' && !updatedBadges.includes('section_intermediate')) {
    updatedBadges.push('section_intermediate');
    const b = AVAILABLE_BADGES.find(item => item.id === 'section_intermediate');
    if (b) newBadges.push(b);
  }
  if (rankDetails.section === 'Pro' && !updatedBadges.includes('section_pro')) {
    updatedBadges.push('section_pro');
    const b = AVAILABLE_BADGES.find(item => item.id === 'section_pro');
    if (b) newBadges.push(b);
  }
  if (rankDetails.section === 'Elite' && !updatedBadges.includes('section_elite')) {
    updatedBadges.push('section_elite');
    const b = AVAILABLE_BADGES.find(item => item.id === 'section_elite');
    if (b) newBadges.push(b);
  }

  // Update streak
  const newStreak = profile.currentStreakDays + 1;
  const newLongest = Math.max(profile.longestStreakDays, newStreak);

  if (newStreak >= 7 && !updatedBadges.includes('flame_7d')) {
    updatedBadges.push('flame_7d');
    const b = AVAILABLE_BADGES.find(item => item.id === 'flame_7d');
    if (b) newBadges.push(b);
  }
  if (newStreak >= 30 && !updatedBadges.includes('flame_30d')) {
    updatedBadges.push('flame_30d');
    const b = AVAILABLE_BADGES.find(item => item.id === 'flame_30d');
    if (b) newBadges.push(b);
  }

  const logDescription = sectionPromoted
    ? `Completed workout: ${workout.title} (+5 pts) · PROMOTED to ${rankDetails.rankTitle}!`
    : levelUpOccurred
    ? `Completed workout: ${workout.title} (+5 pts) · LEVEL UP to ${rankDetails.rankTitle}!`
    : `Completed workout: ${workout.title} (+5 pts)`;

  const newLog: RewardsLog = {
    id: `log_${now}`,
    description: logDescription,
    pointsDelta: awardedPoints,
    timestamp: now,
    type: 'workout'
  };

  const updated: RewardsProfile = {
    ...profile,
    points: newPoints,
    lifetimePoints: newLifetime,
    section: rankDetails.section,
    level: rankDetails.level,
    sectionPoints: rankDetails.sectionPoints,
    rankTitle: rankDetails.rankTitle,
    nextRankTitle: rankDetails.nextRankTitle,
    pointsToNextLevel: rankDetails.pointsToNextLevel,
    pointsToNextSection: rankDetails.pointsToNextSection,
    levelProgressPercent: rankDetails.levelProgressPercent,
    sectionProgressPercent: rankDetails.sectionProgressPercent,
    currentStreakDays: newStreak,
    longestStreakDays: newLongest,
    lastWorkoutDate: todayStr,
    lastPenaltyDate: todayStr,
    isFreezeActive: false,
    weeklyTrainDaysCount: profile.weeklyTrainDaysCount + 1,
    monthlyTrainDaysCount: profile.monthlyTrainDaysCount + 1,
    yearlyTrainDaysCount: profile.yearlyTrainDaysCount + 1,
    badges: updatedBadges,
    historyLogs: [newLog, ...profile.historyLogs.slice(0, 29)],
    // Aliases
    gritBalance: newPoints,
    lifetimeGrit: newLifetime,
    levelTitle: rankDetails.rankTitle,
    nextLevelGritRequirement: rankDetails.pointsToNextLevel
  };

  saveRewardsProfile(updated);

  return {
    updatedProfile: updated,
    awardedPoints,
    newBadgesUnlocked: newBadges,
    levelUpOccurred,
    sectionPromoted,
    previousRankTitle: prevRankTitle
  };
}

/**
 * Activates a Streak Freeze Shield:
 * - Free members: 1 freeze shield available per 2-month (60-day) period. After using it, if inactive,
 *   the user loses 2 points per day until resuming exercises again.
 * - Pro members: Unlimited freeze shields during the 2-month period with zero point loss.
 */
export function purchaseStreakFreeze(isProMember?: boolean): {
  success: boolean;
  message: string;
  updatedProfile: RewardsProfile;
  requiresProUpgrade?: boolean;
} {
  const profile = getRewardsProfile();
  const isPro = isProMember ?? checkIsProFromStorage();
  const now = Date.now();
  const periodStart = profile.streakFreezePeriodStartAt || now;
  const usedInPeriod = profile.streakFreezeUsedInPeriod ?? 0;

  if (!isPro && (usedInPeriod >= 1 || profile.streakFreezeCount <= 0)) {
    return {
      success: false,
      requiresProUpgrade: true,
      message:
        'Free members get 1 Freeze Shield per 2-month period. After that, you lose 2 points/day until resuming exercises. Upgrade to Pro for unlimited freezes!',
      updatedProfile: profile
    };
  }

  const updatedBadges = [...profile.badges];
  if (!updatedBadges.includes('shield_rest')) {
    updatedBadges.push('shield_rest');
  }

  const newUsedInPeriod = usedInPeriod + 1;
  const newFreezeCount = isPro ? profile.streakFreezeCount : Math.max(0, 1 - newUsedInPeriod);

  const newLog: RewardsLog = {
    id: `freeze_${now}`,
    description: isPro
      ? 'Activated Pro Unlimited Streak Freeze Shield (2-Month Period Protected)'
      : 'Activated Free Streak Freeze Shield (1/1 used for 2-month period)',
    pointsDelta: 0,
    timestamp: now,
    type: 'freeze_purchase'
  };

  const updated: RewardsProfile = {
    ...profile,
    streakFreezeCount: newFreezeCount,
    streakFreezeUsedCount: (profile.streakFreezeUsedCount || 0) + 1,
    streakFreezePeriodStartAt: periodStart,
    streakFreezeUsedInPeriod: newUsedInPeriod,
    isFreezeActive: true,
    badges: updatedBadges,
    historyLogs: [newLog, ...profile.historyLogs.slice(0, 29)]
  };

  saveRewardsProfile(updated);

  return {
    success: true,
    message: isPro
      ? 'Pro Unlimited Freeze Shield activated! Your streak and points are 100% protected for this 2-month period.'
      : 'Free Freeze Shield activated (1/1 for this 2-month period)! Note: After this shield expires, missed days deduct 2 pts/day until you resume exercises.',
    updatedProfile: updated
  };
}

function applyPointsReward(
  points: number,
  type: RewardsLog['type'],
  description: string,
  badgeToUnlock?: string
): RewardsProfile {
  const profile = getRewardsProfile();
  const now = Date.now();
  const updatedBadges = [...profile.badges];
  if (badgeToUnlock && !updatedBadges.includes(badgeToUnlock)) {
    updatedBadges.push(badgeToUnlock);
  }

  const newLog: RewardsLog = {
    id: `log_${now}_${Math.random().toString(36).substring(2, 6)}`,
    description,
    pointsDelta: points,
    timestamp: now,
    type
  };

  const newPoints = profile.points + points;
  const newLifetime = profile.lifetimePoints + points;
  const rank = calculateRankDetails(profile.section, profile.sectionPoints + points);

  const updated: RewardsProfile = {
    ...profile,
    points: newPoints,
    lifetimePoints: newLifetime,
    section: rank.section,
    level: rank.level,
    sectionPoints: rank.sectionPoints,
    rankTitle: rank.rankTitle,
    nextRankTitle: rank.nextRankTitle,
    pointsToNextLevel: rank.pointsToNextLevel,
    pointsToNextSection: rank.pointsToNextSection,
    levelProgressPercent: rank.levelProgressPercent,
    sectionProgressPercent: rank.sectionProgressPercent,
    badges: updatedBadges,
    historyLogs: [newLog, ...profile.historyLogs.slice(0, 29)],
    gritBalance: newPoints,
    lifetimeGrit: newLifetime,
    levelTitle: rank.rankTitle,
    nextLevelGritRequirement: rank.pointsToNextLevel
  };

  saveRewardsProfile(updated);
  return updated;
}

/**
 * 1. SHARE APP: Lifters earn +2 points for sharing GymPax with training partners (max 2 times per day)
 */
export function awardAppShare(channel: string = 'GymPax Share'): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const sharesToday = profile.historyLogs.filter(
    log => log.type === 'share' && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  ).length;

  if (sharesToday >= 2) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Daily share point bonus reached (max 2 shares per day). Keep spreading the word!'
    };
  }

  const updated = applyPointsReward(
    2,
    'share',
    `Shared GymPax with lifters (${channel}) (+2 pts)`,
    'app_ambassador'
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 2,
    message: '+2 Points earned for sharing GymPax with your squad!'
  };
}

/**
 * 2. REFERRAL SIGN-UP: Lifters earn +3 points when a new gym buddy signs up using their link
 */
export function awardReferralJoined(referralName: string = 'Gym Buddy'): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const updated = applyPointsReward(
    3,
    'referral',
    `New athlete joined using your referral link (${referralName}) (+3 pts)`,
    'squad_recruiter'
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 3,
    message: `+3 Points earned! ${referralName} signed up with your referral link.`
  };
}

/**
 * 3. COMMENTING ON OTHER LIFTERS: +1 point per encouraging comment on IronFeed (max 3 comments per day)
 */
export function awardCommentEngagement(): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const commentsToday = profile.historyLogs.filter(
    log => log.description.includes('coaching feedback') && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  ).length;

  if (commentsToday >= 3) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Daily comment point cap reached (3 comments / day). Thanks for keeping the community pumped!'
    };
  }

  const updated = applyPointsReward(
    1,
    'social_action',
    `Constructive community coaching feedback (+1 pt) [${commentsToday + 1}/3 today]`,
    'active_commenter'
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 1,
    message: '+1 Point earned for supporting a fellow athlete on IronFeed!'
  };
}

/**
 * 4. CHEER TRAINING PARTNERS: +1 point for cheering fellow lifters on IronFeed (max 2 cheers per day)
 */
export function awardCheerEngagement(): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const cheersToday = profile.historyLogs.filter(
    log => log.description.includes('Cheered training partners') && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  ).length;

  if (cheersToday >= 2) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Daily cheer points reached (max 2/day).'
    };
  }

  const updated = applyPointsReward(
    1,
    'social_action',
    'Cheered training partners on IronFeed (+1 pt)',
    'social_spotter'
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 1,
    message: '+1 Point earned for cheering training partners!'
  };
}

/**
 * 5. LOG BODY MEASUREMENTS / WEIGH-IN: +1 point per day for consistent progress tracking
 */
export function awardBodyMetricLogged(metricName: string = 'Body Measurements'): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const metricToday = profile.historyLogs.some(
    log => log.type === 'metric_logged' && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  );

  if (metricToday) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Daily body metric point already logged today.'
    };
  }

  const updated = applyPointsReward(
    1,
    'metric_logged',
    `Logged physique progress metrics (${metricName}) (+1 pt)`
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 1,
    message: '+1 Point earned for logging body measurements!'
  };
}

/**
 * 6. WARMUP COACH PROTOCOL: +1 point for completing dynamic pre-workout mobility
 */
export function awardWarmupCompleted(): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const warmupToday = profile.historyLogs.some(
    log => log.type === 'warmup' && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  );

  if (warmupToday) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Dynamic warmup point already claimed today.'
    };
  }

  const updated = applyPointsReward(
    1,
    'warmup',
    'Completed pre-workout dynamic mobility & warm-up (+1 pt)'
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 1,
    message: '+1 Point earned for dynamic warmup preparation!'
  };
}

/**
 * 7. PERSONAL RECORD (PR): +2 points when hitting a new PR
 */
export function awardPersonalRecord(exerciseName: string): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const prsToday = profile.historyLogs.filter(
    log => log.type === 'pr_milestone' && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  ).length;

  if (prsToday >= 2) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Daily PR bonus points capped at 2 PRs per day.'
    };
  }

  const updated = applyPointsReward(
    2,
    'pr_milestone',
    `New PR milestone on ${exerciseName} (+2 pts)`,
    'pr_crusher'
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 2,
    message: `+2 Points earned for hitting a new PR on ${exerciseName}!`
  };
}

/**
 * Backwards compatible adapter
 */
export function awardSocialEngagement(actionType: 'cheer' | 'post' | 'comment'): RewardsProfile {
  if (actionType === 'comment') {
    return awardCommentEngagement().profile;
  }
  if (actionType === 'cheer') {
    return awardCheerEngagement().profile;
  }
  // actionType === 'post'
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const postToday = profile.historyLogs.some(
    log => log.description.includes('Shared verified workout to IronFeed') && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  );
  if (postToday) return profile;

  return applyPointsReward(1, 'social_action', 'Shared verified workout to IronFeed (+1 pt)', 'social_spotter');
}

/**
 * 8. DAILY WATER & HYDRATION GOAL: +1 point per day for tracking hydration (e.g. 2.5L+ target)
 */
export function awardWaterHydrationLogged(amountLiters: number = 2.5): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const loggedToday = profile.historyLogs.some(
    log => log.type === 'hydration' && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  );

  if (loggedToday) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Daily hydration milestone already claimed today (+1 pt earned).'
    };
  }

  const updated = applyPointsReward(
    1,
    'hydration',
    `Logged daily hydration target (${amountLiters}L water) (+1 pt)`
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 1,
    message: `+1 Point earned for hitting your ${amountLiters}L daily hydration target!`
  };
}

/**
 * 10. BOOKMARK / SAVE COMMUNITY ROUTINE: +1 point for adopting a community lifter workout
 */
export function awardCommunityRoutineSaved(routineName: string): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const savedToday = profile.historyLogs.filter(
    log => log.type === 'routine_saved' && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  ).length;

  if (savedToday >= 2) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Daily community routine points reached (max 2/day).'
    };
  }

  const updated = applyPointsReward(
    1,
    'routine_saved',
    `Saved community workout: ${routineName} (+1 pt)`
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 1,
    message: `+1 Point earned for adopting community routine "${routineName}"!`
  };
}

/**
 * 11. STREAK CONSISTENCY MILESTONE: +3 points for 7-day or 3-day consecutive training streak
 */
export function awardStreakMilestone(days: number): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const streakToday = profile.historyLogs.some(
    log => log.type === 'streak_milestone' && new Date(log.timestamp).toISOString().split('T')[0] === todayStr
  );

  if (streakToday) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: 'Daily streak milestone bonus already awarded.'
    };
  }

  const updated = applyPointsReward(
    3,
    'streak_milestone',
    `Achieved ${days}-day gym consistency streak milestone (+3 pts)`,
    'streak_master'
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 3,
    message: `+3 Points earned for your ${days}-day training consistency streak!`
  };
}

/**
 * 12. COMMUNITY CHALLENGE COMPLETED: +10 points when a user completes a community challenge
 */
export function awardChallengeCompleted(
  challengeId: string,
  challengeTitle: string
): {
  success: boolean;
  profile: RewardsProfile;
  pointsAwarded: number;
  message: string;
} {
  const profile = getRewardsProfile();
  const alreadyClaimed = profile.historyLogs.some(
    log =>
      log.type === 'challenge_completed' &&
      (log.description.includes(`[${challengeId}]`) || log.description.includes(challengeTitle))
  );

  if (alreadyClaimed) {
    return {
      success: false,
      profile,
      pointsAwarded: 0,
      message: `You already claimed the +10 points reward for "${challengeTitle}".`
    };
  }

  const updated = applyPointsReward(
    10,
    'challenge_completed',
    `Completed Community Challenge: ${challengeTitle} [${challengeId}] (+10 pts)`,
    'challenge_conqueror'
  );

  return {
    success: true,
    profile: updated,
    pointsAwarded: 10,
    message: `🏆 Challenge Completed! +10 Points earned for conquering "${challengeTitle}"!`
  };
}
