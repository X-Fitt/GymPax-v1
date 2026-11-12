import { SocialPost } from '../types';

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post_1',
    userId: 'u_marcus',
    userName: 'Marcus Thorne',
    userAvatarSeed: 'marcus_iron',
    userBadge: 'PRO',
    workoutTitle: 'Push A - Heavy Bench & Upper Chest Shelf',
    durationMinutes: 62,
    volumeKg: 11480,
    volumeLbs: 25309,
    topSet: '142.5 kg × 5 (Barbell Flat Bench)',
    prBroken: 'Barbell Flat Bench: +2.5 kg PR',
    timestamp: Date.now() - 1000 * 60 * 45, // 45m ago
    likes: 38,
    cheers: [
      { id: 'c1', userId: 'u_alex', userName: 'Alex V.', emoji: '💪', label: 'Beast Mode' },
      { id: 'c2', userId: 'u_sam', userName: 'Sam K.', emoji: '⚡', label: 'Light weight baby!' },
      { id: 'c3', userId: 'u_elena', userName: 'Elena R.', emoji: '🏆', label: 'New PR!' }
    ],
    comments: [
      {
        id: 'cm1',
        userId: 'u_alex',
        userName: 'Alex V.',
        avatarSeed: 'alex_lift',
        text: 'That paused 142.5kg looked smooth off the chest! Scapular retraction looked locked in.',
        timestamp: Date.now() - 1000 * 60 * 30
      },
      {
        id: 'cm2',
        userId: 'u_dave',
        userName: 'Coach Dave',
        avatarSeed: 'dave_coach',
        text: 'Clean bar path. That 150kg is falling before end of this mesocycle.',
        timestamp: Date.now() - 1000 * 60 * 15
      }
    ],
    isLikedByMe: true,
    streakDays: 18,
    activeBadges: ['flame_7d', 'trophy_century'],
    userRank: 'Pro - Level 2'
  },
  {
    id: 'post_2',
    userId: 'u_jessica',
    userName: 'Jessica Chen',
    userAvatarSeed: 'jess_fit',
    userBadge: 'BEAST',
    workoutTitle: 'Legs A - Quad Sweep & Heavy Hack Squat',
    durationMinutes: 75,
    volumeKg: 14200,
    volumeLbs: 31305,
    topSet: '180 kg × 8 (Machine Hack Squat - Full Depth)',
    prBroken: 'Machine Hack Squat: 180 kg for 8 reps',
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hrs ago
    likes: 54,
    cheers: [
      { id: 'c4', userId: 'u_marcus', userName: 'Marcus Thorne', emoji: '🔥', label: 'Crushed it' },
      { id: 'c5', userId: 'u_liam', userName: 'Liam S.', emoji: '💪', label: 'Beast Mode' }
    ],
    comments: [
      {
        id: 'cm3',
        userId: 'u_liam',
        userName: 'Liam S.',
        avatarSeed: 'liam_quad',
        text: 'Hamstrings touching calves on every rep! Absolute quad demolition.',
        timestamp: Date.now() - 1000 * 60 * 120
      }
    ],
    isLikedByMe: false,
    streakDays: 32,
    activeBadges: ['flame_30d', 'shield_rest'],
    userRank: 'Elite - Level 1'
  },
  {
    id: 'post_3',
    userId: 'u_leo',
    userName: 'Leo Sterling',
    userAvatarSeed: 'leo_gym',
    userBadge: 'LIFTER',
    workoutTitle: 'Pull A - Lat Width & Conventional Deadlift',
    durationMinutes: 58,
    volumeKg: 9850,
    volumeLbs: 21715,
    topSet: '210 kg × 3 (Conventional Barbell Deadlift)',
    prBroken: 'Deadlift 210 kg Triple',
    timestamp: Date.now() - 1000 * 60 * 360, // 6 hrs ago
    likes: 42,
    cheers: [
      { id: 'c6', userId: 'u_jessica', userName: 'Jessica Chen', emoji: '⚡', label: 'Light weight baby!' },
      { id: 'c7', userId: 'u_sam', userName: 'Sam K.', emoji: '🦍', label: 'Silverback' }
    ],
    comments: [],
    isLikedByMe: true,
    streakDays: 9,
    activeBadges: ['flame_7d'],
    userRank: 'Intermediate - Level 3'
  },
  {
    id: 'post_4',
    userId: 'u_sarah',
    userName: 'Sarah Connor',
    userAvatarSeed: 'sarah_iron',
    userBadge: 'PRO',
    workoutTitle: 'Upper Power - Heavy Incline & Shoulder Overload',
    durationMinutes: 52,
    volumeKg: 9120,
    volumeLbs: 20106,
    topSet: '42.5 kg × 6 (Incline DB Press)',
    prBroken: 'Incline DB Press: 42.5 kg × 6 PR',
    timestamp: Date.now() - 1000 * 60 * 60 * 7,
    likes: 29,
    cheers: [
      { id: 'c_s1', userId: 'u_marcus', userName: 'Marcus Thorne', emoji: '💪', label: 'Beast Mode' },
      { id: 'c_s2', userId: 'u_jessica', userName: 'Jessica Chen', emoji: '⚡', label: 'Solid form' }
    ],
    comments: [
      {
        id: 'cm_s1',
        userId: 'u_jessica',
        userName: 'Jessica Chen',
        avatarSeed: 'jess_fit',
        text: 'Those 42.5kg dumbbells flew up! Great control on the eccentric.',
        timestamp: Date.now() - 1000 * 60 * 60 * 6
      }
    ],
    isLikedByMe: false,
    streakDays: 21,
    activeBadges: ['flame_30d', 'trophy_century'],
    userRank: 'Pro - Level 3'
  },
  {
    id: 'post_5',
    userId: 'u_david',
    userName: 'David Vance',
    userAvatarSeed: 'david_v',
    userBadge: 'LIFTER',
    workoutTitle: 'Arm Hypertrophy - Bicep Peak & Tricep Horseshoe',
    durationMinutes: 48,
    volumeKg: 6400,
    volumeLbs: 14110,
    topSet: '52.5 kg × 8 (EZ Bar Preacher Curl)',
    prBroken: 'EZ Bar Curl: 52.5 kg for 8 reps',
    timestamp: Date.now() - 1000 * 60 * 60 * 11,
    likes: 22,
    cheers: [
      { id: 'c_d1', userId: 'u_sam', userName: 'Sam K.', emoji: '🦍', label: 'Silverback' }
    ],
    comments: [],
    isLikedByMe: false,
    streakDays: 4,
    activeBadges: ['flame_7d'],
    userRank: 'Intermediate - Level 2'
  },
  {
    id: 'post_6',
    userId: 'u_elena',
    userName: 'Elena Rostova',
    userAvatarSeed: 'elena_lift',
    userBadge: 'BEAST',
    workoutTitle: 'Posterior Chain - Deficit Deadlifts & Heavy RDLs',
    durationMinutes: 68,
    volumeKg: 13200,
    volumeLbs: 29101,
    topSet: '165 kg × 6 (Romanian Deadlift)',
    prBroken: 'Romanian Deadlift: 165 kg 6RM PR',
    timestamp: Date.now() - 1000 * 60 * 60 * 15,
    likes: 51,
    cheers: [
      { id: 'c_e1', userId: 'u_jessica', userName: 'Jessica Chen', emoji: '🔥', label: 'Crushed it' },
      { id: 'c_e2', userId: 'u_marcus', userName: 'Marcus Thorne', emoji: '🏆', label: 'Heavyweight' }
    ],
    comments: [],
    isLikedByMe: false,
    streakDays: 28,
    activeBadges: ['flame_30d'],
    userRank: 'Elite - Level 2'
  },
  {
    id: 'post_7',
    userId: 'u_sam',
    userName: 'Sam Kowalski',
    userAvatarSeed: 'sam_iron',
    userBadge: 'LIFTER',
    workoutTitle: 'Back Thickness - Weighted Pull-ups & T-Bar Rows',
    durationMinutes: 55,
    volumeKg: 10400,
    volumeLbs: 22928,
    topSet: '+35 kg × 5 (Weighted Wide Grip Pull-ups)',
    prBroken: 'Weighted Pull-ups: +35 kg × 5 reps',
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
    likes: 34,
    cheers: [
      { id: 'c_sm1', userId: 'u_leo', userName: 'Leo Sterling', emoji: '💪', label: 'Light weight' }
    ],
    comments: [],
    isLikedByMe: false,
    streakDays: 14,
    activeBadges: ['flame_7d'],
    userRank: 'Intermediate - Level 4'
  },
  {
    id: 'post_8',
    userId: 'u_maya',
    userName: 'Maya Lin',
    userAvatarSeed: 'maya_fit',
    userBadge: 'PRO',
    workoutTitle: 'Overhead Power - Clean & Strict Military Press',
    durationMinutes: 58,
    volumeKg: 8300,
    volumeLbs: 18298,
    topSet: '75 kg × 4 (Strict Overhead Barbell Press)',
    prBroken: 'Strict Overhead Press: 75 kg × 4 PR',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    likes: 39,
    cheers: [
      { id: 'c_m1', userId: 'u_elena', userName: 'Elena Rostova', emoji: '⚡', label: 'Laser focus' }
    ],
    comments: [],
    isLikedByMe: false,
    streakDays: 19,
    activeBadges: ['flame_7d', 'trophy_century'],
    userRank: 'Pro - Level 1'
  },
  {
    id: 'post_9',
    userId: 'u_liam',
    userName: 'Liam Scott',
    userAvatarSeed: 'liam_quad',
    userBadge: 'BEAST',
    workoutTitle: 'Chest & Front Delts - Incline Press Heavy Paused',
    durationMinutes: 64,
    volumeKg: 13800,
    volumeLbs: 30424,
    topSet: '135 kg × 5 (Paused Incline Barbell Bench)',
    prBroken: 'Paused Incline Bench: 135 kg PR',
    timestamp: Date.now() - 1000 * 60 * 60 * 32,
    likes: 58,
    cheers: [
      { id: 'c_l1', userId: 'u_marcus', userName: 'Marcus Thorne', emoji: '🔥', label: 'Beast Mode' }
    ],
    comments: [],
    isLikedByMe: false,
    streakDays: 35,
    activeBadges: ['flame_30d', 'trophy_century'],
    userRank: 'Elite - Level 3'
  },
  {
    id: 'post_transformation_1',
    userId: 'u_marcus',
    userName: 'Marcus Thorne',
    userAvatarSeed: 'marcus_iron',
    userBadge: 'PRO',
    workoutTitle: '16-Week Hypertrophy Recomp Milestone',
    durationMinutes: 70,
    volumeKg: 12500,
    volumeLbs: 27557,
    topSet: '145 kg × 6 Bench Press',
    prBroken: '16 Weeks: +5.5 kg Lean Mass',
    timestamp: Date.now() - 1000 * 60 * 120,
    likes: 67,
    cheers: [
      { id: 'c_t1', userId: 'u_alex', userName: 'Alex V.', emoji: '🦍', label: 'Silverback' },
      { id: 'c_t2', userId: 'u_jessica', userName: 'Jessica Chen', emoji: '🔥', label: 'Insane Progress' }
    ],
    comments: [
      {
        id: 'cm_t1',
        userId: 'u_jessica',
        userName: 'Jessica Chen',
        avatarSeed: 'jess_fit',
        text: 'That shoulder-to-waist ratio difference is unreal! Huge lat width progress.',
        timestamp: Date.now() - 1000 * 60 * 90
      }
    ],
    isLikedByMe: true,
    streakDays: 45,
    activeBadges: ['flame_30d', 'trophy_century'],
    userRank: 'Pro - Level 2',
    postType: 'before_after',
    beforePhotoUrl: 'https://images.unsplash.com/photo-1532384555668-bc0c32a17ffd?auto=format&fit=crop&w=800&h=800&q=85',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1532384661798-58b53a4fbe37?auto=format&fit=crop&w=800&h=800&q=85',
    transformationDetails: {
      beforeLabel: 'Month 1 Baseline',
      afterLabel: 'Week 16 Current',
      weeksProgress: 16,
      weightDeltaKg: 5.5,
      notes: '16-week mesocycle focused on clavicular chest and back width progressive overload.'
    }
  }
];

export interface GymFriend {
  id: string;
  name: string;
  avatarSeed: string;
  badge: 'PRO' | 'LIFTER' | 'BEAST';
  streakDays: number;
  lastWorkout: string;
  isBuddy: boolean;
}

export const INITIAL_FRIENDS: GymFriend[] = [
  {
    id: 'f_marcus',
    name: 'Marcus Thorne',
    avatarSeed: 'marcus_iron',
    badge: 'PRO',
    streakDays: 14,
    lastWorkout: 'Push A - 11,480 kg (Today)',
    isBuddy: true
  },
  {
    id: 'f_jessica',
    name: 'Jessica Chen',
    avatarSeed: 'jess_fit',
    badge: 'BEAST',
    streakDays: 9,
    lastWorkout: 'Legs A - 14,200 kg (Today)',
    isBuddy: true
  },
  {
    id: 'f_leo',
    name: 'Leo Sterling',
    avatarSeed: 'leo_gym',
    badge: 'LIFTER',
    streakDays: 6,
    lastWorkout: 'Pull A - 9,850 kg (Today)',
    isBuddy: true
  },
  {
    id: 'f_sarah',
    name: 'Sarah Connor',
    avatarSeed: 'sarah_iron',
    badge: 'PRO',
    streakDays: 21,
    lastWorkout: 'Upper Power - 8,900 kg (Yesterday)',
    isBuddy: false
  },
  {
    id: 'f_david',
    name: 'David Vance',
    avatarSeed: 'david_v',
    badge: 'LIFTER',
    streakDays: 4,
    lastWorkout: 'Arm Hypertrophy - 6,400 kg (Yesterday)',
    isBuddy: false
  }
];
