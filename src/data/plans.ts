import { WorkoutPlan, ExperienceLevel, FitnessGoal } from '../types';
import { groundWorkoutPlan } from './exercises';

/**
 * ============================================================================
 * GYMPAX PROVEN GYM WORKOUT PROGRAMS DIRECTORY
 * ============================================================================
 * Thoroughly researched across the fitness industry, sports science literature,
 * top commercial gyms, and world-class strength & conditioning platforms
 * (Starting Strength, StrongLifts 5x5, Jim Wendler 5/3/1 BBB, Layne Norton PHAT,
 * Brandon Campbell PHUL, Arnold Golden Era Blueprint, Bret Contreras Strong Curves,
 * Charles Poliquin GVT & GBC, Athlean-X Metabolic Conditioning, and RP Hypertrophy).
 *
 * All routines are strictly aligned with and grounded to gympax_exercises.json,
 * ensuring 100% video coverage, accurate kinetic cues, and muscle targeting.
 */
export const REMOVED_MUSCLE_BUILDING_PLAN_IDS = new Set<string>([
  'plan_ppl_hypertrophy',
  'plan_arnold_split',
  'plan_phul_power_hypertrophy',
  'plan_phat_power_hypertrophy',
  'plan_classic_bro_split',
  'plan_gvt_german_volume',
  'plan_mentzer_heavy_duty_hit',
  'plan_strong_curves_glute'
]);

const RAW_PRESET_WORKOUT_PLANS: WorkoutPlan[] = [
  // ==========================================
  // 1. STRENGTH & POWER
  // ==========================================
  {
    id: 'plan_starting_strength_lp',
    title: 'Starting Strength: Novice Linear Progression',
    subtitle: 'Mark Rippetoe\'s foundational 3-day barbell strength building system',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: false,
    badge: 'NOVICE FOUNDATION',
    price: 0,
    thumbnail_url: '/assets/garage_home_gym.jpg',
    howToUse: 'Train 3 non-consecutive days per week (Mon/Wed/Fri). Add 2.5kg (or 1.25kg on press) progressively each week as strength develops.',
    description: 'Arguably the most famous novice strength system in history, created by Mark Rippetoe. Relies on strictly executed multi-joint barbell compound lifts with linear progression to build an unshakeable strength base in 12 weeks.',
    routines: [
      {
        dayName: 'Full Body Linear Progression Strength',
        focus: 'Compound Linear Progression across Squats, Bench Press, Overhead Press, Deadlift & Rows',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_deadlift', defaultSets: 1, targetReps: '5', targetRpe: 9 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 3, targetReps: '6-8', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_stronglifts_5x5',
    title: 'StrongLifts 5×5 Iron Foundation',
    subtitle: 'The globally revered 5-sets-of-5 compound barbell strength builder (Mehdi / Reg Park)',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: false,
    badge: 'POPULAR 5X5',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?auto=format&fit=crop&w=960&h=600&q=85&plan=stronglifts_5x5&focus=heavy_plates_5x5_iron',
    howToUse: 'Train 3 non-consecutive days per week with 5 sets of 5 reps on compound lifts. Rest 90s between sets and 3 min between heavy 5x5 sets.',
    description: 'Based on Reg Park\'s legendary 5x5 protocol and modernized by Mehdi into the world\'s most popular strength app framework. Simple, brutal, and guaranteed to double your squat and deadlift in months.',
    routines: [
      {
        dayName: '5×5 Compound Strength Overload',
        focus: 'Compound Overload featuring 5×5 Squat, Bench Press, Barbell Row, Overhead Press & Deadlift',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_deadlift', defaultSets: 1, targetReps: '5', targetRpe: 9 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_531_powerbuilding_pro',
    title: '5/3/1 Boring But Big (BBB) Powerbuilding',
    subtitle: 'Jim Wendler\'s submaximal wave periodization with 5×10 hypertrophy volume',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: true,
    badge: 'PRO STRENGTH',
    price: 34.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=960&h=600&q=85&plan=531_powerbuilding_pro&focus=powerbuilding_deadlift_bar',
    howToUse: 'Perform the 5/3/1 wave sets on the main lift, then immediately perform 5 sets of 10 reps at 50-60% of Training Max.',
    description: 'Created by competitive powerlifter Jim Wendler. Utilizes sub-maximal training percentages across 4-week waves to prevent plateaus, paired with the famous "Boring But Big" 5×10 assistance protocol for dense muscular hypertrophy.',
    routines: [
      {
        dayName: 'Day 1: Squat Focus + 5×10 BBB Volume',
        focus: 'Squat 5/3/1 + 5×10 Volume + Hamstrings & Abs',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '5/3/1 Peak', targetRpe: 9 },
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 5, targetReps: '10 (BBB Volume)', targetRpe: 8 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Bench Press Focus + 5×10 BBB Volume',
        focus: 'Bench 5/3/1 + 5×10 Volume + Heavy Rows & Triceps',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '5/3/1 Peak', targetRpe: 9 },
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '10 (BBB Volume)', targetRpe: 8 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '10', targetRpe: 8.5 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Deadlift Focus + 5×10 BBB Volume',
        focus: 'Deadlift 5/3/1 + 5×10 Volume + Leg Press & Calves',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 4, targetReps: '5/3/1 Peak', targetRpe: 9 },
          { exerciseId: 'barbell_deadlift', defaultSets: 5, targetReps: '10 (BBB Volume)', targetRpe: 8 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Overhead Press Focus + 5×10 BBB Volume',
        focus: 'Overhead Press 5/3/1 + 5×10 Volume + Lat Pulldown & Biceps',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '5/3/1 Peak', targetRpe: 9 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 5, targetReps: '10 (BBB Volume)', targetRpe: 8 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_upper_lower_4day',
    title: 'Upper / Lower Powerbuilding Split (4-Day)',
    subtitle: 'The premier evidence-based 4-day split recommended by coaches (3D Muscle Journey / Nuñez)',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: false,
    badge: 'HIGHLY RECOMMENDED',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1534367990512-edbdca781b00?auto=format&fit=crop&w=960&h=600&q=85&plan=upper_lower_4day&focus=upper_lower_powerbuilding',
    howToUse: 'Mon: Upper A, Tue: Lower A, Thu: Upper B, Fri: Lower B. Weekends completely off for maximum nervous system recovery.',
    description: 'Endorsed by top natural bodybuilding organizations like 3D Muscle Journey. Hits every muscle group with optimal 2x/week frequency while leaving 3 full recovery days per week for peak strength expression and life balance.',
    routines: [
      {
        dayName: 'Day 1: Upper Body Strength (Push & Pull)',
        focus: 'Chest, Mid-Back, Shoulders, Triceps',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lower Body Quad & Core Dominance',
        focus: 'Quads, Adductors, Calves, Core',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'lever_leg_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Upper Body Hypertrophy (Delts & Back)',
        focus: 'Deltoids, Upper Chest, Lat Width, Biceps',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Lower Body Posterior Chain & Hamstrings',
        focus: 'Hamstrings, Gluteus, Calves, Rectus Abdominis',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_seated_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_fullbody_hlm_3day',
    title: '3-Day Heavy / Light / Medium (HLM) Full Body',
    subtitle: 'Bill Starr\'s classic systemic stress-recovery-adaptation periodization',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: false,
    badge: 'CLASSIC PERIODIZATION',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=960&h=600&q=85&plan=fullbody_hlm_3day&focus=heavy_light_medium_barbell',
    howToUse: 'Monday is Heavy Day (100% load), Wednesday is Light Day (70-80% load), Friday is Medium Day (85-90% load).',
    description: 'Designed by legendary strength coach Bill Starr. By cycling intensity through Heavy, Light, and Medium days across a 3-day full body structure, lifters stimulate continuous neuromuscular adaptation without accumulating crippling central fatigue.',
    routines: [
      {
        dayName: 'Day 1: Heavy Full Body (100% Target Load)',
        focus: 'Heavy Squat, Bench Press, Conventional Deadlift',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 5, targetReps: '5', targetRpe: 9 },
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '5', targetRpe: 9 },
          { exerciseId: 'barbell_deadlift', defaultSets: 1, targetReps: '5', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 2: Light Full Body (Active Recovery Load)',
        focus: 'Front Squats, Strict Overhead Press, Chin-Ups',
        exercises: [
          { exerciseId: 'barbell_front_squat', defaultSets: 3, targetReps: '5', targetRpe: 7.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '5', targetRpe: 8 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 3, targetReps: '6-8', targetRpe: 8 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '12', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 3: Medium Full Body (Volume Density Load)',
        focus: 'Moderate Squats, Incline Dumbbell Bench, Barbell Row',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '5', targetRpe: 8 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_texas_method_pro',
    title: 'The Texas Method: Weekly Periodization (3-Day)',
    subtitle: 'Glenn Pendlay & Mark Rippetoe\'s Volume, Recovery & Intensity PR strength engine',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: true,
    badge: 'TEXAS METHOD PRO',
    price: 34.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=960&h=600&q=85&plan=texas_method_pro&focus=texas_method_squat_intensity',
    howToUse: 'Monday is Volume Day (5×5 at 90% of 5RM), Wednesday is Light Recovery (80% load), and Friday is Intensity Day (work up to a new 1×5 or 1×3 PR).',
    description: 'The gold-standard intermediate barbell program for lifters who have exhausted daily linear progression. Uses weekly undulating stress, recovery, and adaptation within a single training week to drive relentless personal records on the Squat, Bench, Overhead Press, and Deadlift.',
    routines: [
      {
        dayName: 'Monday: High-Volume Stress Day (5×5)',
        focus: 'High-Volume Squat, Bench Press & Bent-Over Barbell Row',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 5, targetReps: '5 (90% 5RM)', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '5 (90% 5RM)', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Wednesday: Active Neural Recovery Day',
        focus: 'Light Front Squats, Strict Overhead Press, Chin-Ups & Core',
        exercises: [
          { exerciseId: 'barbell_front_squat', defaultSets: 3, targetReps: '5 (Light)', targetRpe: 7 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '5', targetRpe: 8 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Friday: Max Intensity PR Day (1×5 Heavy)',
        focus: 'New 5-Rep Max on Squat, Bench Press & Heavy Deadlift',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 3, targetReps: '5 (Work to 1×5 PR)', targetRpe: 9.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '5 (Work to 1×5 PR)', targetRpe: 9.5 },
          { exerciseId: 'barbell_deadlift', defaultSets: 1, targetReps: '5 (Heavy PR)', targetRpe: 9.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_candito_6week_strength_pro',
    title: 'Candito 6-Week Strength & Peaking Protocol',
    subtitle: 'Jonnie Candito\'s natural powerlifting block periodization for raw 1RM breakthroughs',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: true,
    badge: 'PEAK STRENGTH PRO',
    price: 39.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?auto=format&fit=crop&w=960&h=600&q=85&plan=candito_6week_strength_pro&focus=candito_powerlifting_peaking',
    howToUse: 'Run as a 4-day Upper/Lower split. Weeks 1-2 build muscular conditioning and work capacity; Weeks 3-4 push heavy linear overload; Week 5 peaks for max testing.',
    description: 'Created by world-class natural powerlifter Jonnie Candito. Famous for breaking stubborn bench and squat plateaus by condensing hypertrophy, heavy acclimation, and neural peaking into a structured 4-day Upper/Lower cadence.',
    routines: [
      {
        dayName: 'Day 1: Heavy Lower Body Strength (Squat & Deadlift)',
        focus: 'Competition Squat, Conventional Deadlift, Hamstring & Calf Accessory',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6', targetRpe: 8.5 },
          { exerciseId: 'barbell_deadlift', defaultSets: 2, targetReps: '6', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Heavy Upper Body Strength (Bench Press & Rows)',
        focus: 'Competition Bench Press, Barbell Row, Overhead Press, Lat Width',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Control Lower Body & Posterior Chain',
        focus: 'Explosive Drive out of the Hole, Romanian Deadlift, Hack Squat',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '4 (Paused)', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8', targetRpe: 8.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 4: Hypertrophy Upper Body & Lockout',
        focus: 'Spoto/Control Bench, Incline Press, Upper Back Thickness, Triceps',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6 (Control)', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_westside_conjugate_pro',
    title: 'Westside Conjugate Method: Max & Dynamic Effort',
    subtitle: 'Louie Simmons\' legendary 4-day absolute strength & explosive speed-strength system',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    isPro: true,
    badge: 'CONJUGATE PRO',
    price: 39.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=960&h=600&q=85&plan=westside_conjugate_pro&focus=conjugate_max_dynamic_effort',
    howToUse: 'Pair two Max Effort (ME) days working up to heavy 3-5 rep topsets with two Dynamic Effort (DE) speed days moving 65-75% load with maximum bar velocity.',
    description: 'Adapted from Louie Simmons\' famed Westside Barbell system. Simultaneously trains limit strength (Max Effort), rate of force development (Dynamic Effort), and targeted weak-point hypertrophy (Repetition Method) to prevent accommodation and build unstoppable power.',
    routines: [
      {
        dayName: 'Day 1: Max Effort Upper (Heavy Press & Triceps Lockout)',
        focus: 'Heavy Barbell Bench Topsets, Triceps Lockout Power, Lats & Rear Delts',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '3-5 (Max Effort)', targetRpe: 9.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Max Effort Lower (Heavy Squat/Pull & Posterior Chain)',
        focus: 'Heavy Deadlift/Squat Topsets, Hamstrings, Glutes, Spinal Erectors & Abs',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 5, targetReps: '3-5 (Max Effort)', targetRpe: 9.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Dynamic Effort Upper (Speed Bench & Repetition Hypertrophy)',
        focus: 'Explosive Bar Speed Bench (8×3), Overhead Power, Lats, Arms',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 6, targetReps: '3 (Explosive Speed)', targetRpe: 7.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Dynamic Effort Lower (Speed Squat & Quad/Glute Builder)',
        focus: 'Explosive Box/Full Squats (8×2), Hack Squat, Posterior Chain',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 6, targetReps: '2-3 (Explosive Speed)', targetRpe: 7.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 3. WEIGHT LOSS & METABOLIC CONDITIONING
  // ==========================================
  {
    id: 'plan_gbc_fat_incinerator',
    title: 'German Body Comp (GBC) Rapid Fat Incinerator',
    subtitle: 'Charles Poliquin\'s lactic-acid agonist/antagonist superset fat burning system',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    category: 'weight_loss',
    isPro: true,
    badge: 'RAPID FAT LOSS',
    price: 29.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=960&h=600&q=85&plan=gbc_fat_incinerator&focus=german_body_comp_conditioning',
    howToUse: 'Perform exercise pairs as strict supersets (A1 then A2) with only 30-45s rest between movements. Keep heart rate elevated.',
    description: 'Devised by Olympic coach Charles Poliquin based on scientific studies showing that high lactic acid production stimulates growth hormone release by over 300%, triggering massive fat oxidation while retaining lean contractile tissue.',
    routines: [
      {
        dayName: 'Day 1: Upper Lactic Agonist/Antagonist Wave',
        focus: 'Chest/Back & Shoulder/Lat Strict Antagonist Supersets',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lower Body GH Surge & Core',
        focus: 'Squat/Hamstring & Leg Press/Curl Lactic Complexes',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 3, targetReps: '15-20', targetRpe: 9.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Deltoids & Arm High-Density Matrix',
        focus: 'Shoulder Press/Pull & Arm Supersets with 30s rest',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_close_grip_front_lat_pulldown', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '15', targetRpe: 9.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Total Body Conditioning Circuit',
        focus: 'Multi-joint compound density to maximize caloric burn',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'push_up_to_side_plank', defaultSets: 3, targetReps: '10 each', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_fat_loss_shred',
    title: 'High-Density Metabolic Shred & Conditioning (4-Day)',
    subtitle: 'High-volume compound tri-sets and core finishers for rapid body recomposition',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    category: 'weight_loss',
    isPro: false,
    badge: 'FAT BURNER',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=960&h=600&q=85&plan=fat_loss_shred&focus=metabolic_shred_recomposition',
    howToUse: 'Keep rest intervals capped at 45-60 seconds. Maintain weights high to signal body not to burn muscle tissue in a deficit.',
    description: 'Designed specifically for cutting phases. Pairs heavy compound multi-joint movements with metabolic density intervals, keeping caloric expenditure high during and up to 24 hours post-workout via EPOC (Excess Post-Exercise Oxygen Consumption).',
    routines: [
      {
        dayName: 'Day 1: Upper Body Caloric Annihilator',
        focus: 'Chest, Back, Arms Metabolic Flow',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'push_up_m', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lower Body Metabolic Overdrive',
        focus: 'Quads, Posterior Chain, Calves Caloric Surge',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 3, targetReps: '15-20', targetRpe: 9.5 },
          { exerciseId: 'lever_leg_extension', defaultSets: 3, targetReps: '15', targetRpe: 9.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Deltoids, Arms & Core Accelerator',
        focus: 'Overhead Power, Arm Supersets, Abdominal Wall',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Posterior Chain & Functional Pull Conditioning',
        focus: 'Deadlift, Lat Pulldown, Hamstrings, Core Density',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_close_grip_front_lat_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'reverse_plank', defaultSets: 3, targetReps: '45s hold', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_metabolic_calorie_burner',
    title: '3-Day Full Body Calorie Torcher (HIIT MetCon)',
    subtitle: 'Compound circuits designed for maximum energy expenditure and cardiovascular conditioning',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    category: 'weight_loss',
    isPro: false,
    badge: 'CALORIE BURN',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=960&h=600&q=85&plan=metabolic_calorie_burner&focus=hiit_metcon_calorie_torcher',
    howToUse: 'Perform each exercise in sequence with minimal rest (30s) between stations. Rest 2 minutes after completing each round.',
    description: 'A circuit-based full-body metabolic conditioning program engineered for lifters who want to shred fat, improve cardiovascular VO2 endurance, and maintain high athletic agility without living on a treadmill.',
    routines: [
      {
        dayName: 'Day 1: Full Body Tri-Set Alpha',
        focus: 'Squats, Bench, Lats in Rapid Succession',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Full Body Tri-Set Beta',
        focus: 'Deadlift, Overhead Press, Leg Press',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '8', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '10', targetRpe: 8.5 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 3, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'push_up_to_side_plank', defaultSets: 3, targetReps: '10 each', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Full Body Tri-Set Gamma',
        focus: 'Front Squat, Incline DB Bench, Rows, Arms',
        exercises: [
          { exerciseId: 'barbell_front_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_fasted_definition_pro',
    title: '5-Day Elite Contest Prep & Shred Protocol',
    subtitle: 'Competitive physique cutting split with peak contractions, striation detail, and vascularity',
    level: 'Advanced Pro',
    daysPerWeek: 5,
    goal: 'Lean Cut & Muscle Definition',
    category: 'weight_loss',
    isPro: true,
    badge: 'CONTEST PREP',
    price: 39.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=960&h=600&q=85&plan=fasted_definition_pro&focus=contest_prep_muscle_striations',
    howToUse: 'Perform strict 3-second negatives and 1-second peak squeezes on all isolation movements to maximize muscle fiber recruitment.',
    description: 'Designed for advanced competitors and photoshoot athletes seeking single-digit body fat. Isolates muscle groups across 5 distinct training days with high-density volume and peak contraction holds to showcase paper-thin skin and deep striations.',
    routines: [
      {
        dayName: 'Day 1: Pectoral Striations & Calves',
        focus: 'Clavicular Shelf, Lower Chest Line, Gastrocnemius',
        exercises: [
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_incline_fly', defaultSets: 4, targetReps: '12-15', targetRpe: 9.5 },
          { exerciseId: 'cable_decline_fly', defaultSets: 4, targetReps: '12-15', targetRpe: 9.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 5, targetReps: '15-20', targetRpe: 9.5 }
        ]
      },
      {
        dayName: 'Day 2: V-Taper Lat Detailing & Rhomboids',
        focus: 'Lat Width Flare, Mid-Back Separation, Lower Back',
        exercises: [
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_close_grip_front_lat_pulldown', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '12-15', targetRpe: 9.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Deltoid Capped Head Isolation',
        focus: 'Lateral Deltoids, Posterior Deltoid Heads',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 5, targetReps: '15-20', targetRpe: 9.5 },
          { exerciseId: 'cable_lateral_raise', defaultSets: 4, targetReps: '15-20', targetRpe: 9.5 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Hamstring / Glute Tie-In & Calves',
        focus: 'Glute-Ham Separation, Sternal Calves',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '12-15', targetRpe: 9.5 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_seated_calf_raise', defaultSets: 4, targetReps: '15-20', targetRpe: 9.5 }
        ]
      },
      {
        dayName: 'Day 5: Quad Tear-Drop & Arm Vascularity',
        focus: 'Vastus Medialis / Lateralis, Biceps Brachialis, Triceps',
        exercises: [
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '15-20', targetRpe: 9.5 },
          { exerciseId: 'barbell_preacher_curl', defaultSets: 4, targetReps: '12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 4, targetReps: '15', targetRpe: 9.5 },
          { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 3, targetReps: '12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_gironda_8x8_honest_pro',
    title: 'Vince Gironda 8×8 "Honest Workout" Density Shred',
    subtitle: 'The Iron Guru\'s legendary 8-sets-of-8 short-rest cosmetic conditioning protocol',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    category: 'weight_loss',
    isPro: true,
    badge: 'GIRONDA 8X8 PRO',
    price: 34.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=960&h=600&q=85&plan=gironda_8x8_honest_pro&focus=gironda_8x8_density_dumbbells',
    howToUse: 'Use 60-65% of your normal 8-rep weight. Perform 8 sets of 8 reps with strictly 20-30 seconds rest between sets. Do not drop the barbell or dumbbells until all 8 sets are complete.',
    description: 'Created by Golden Era Hollywood trainer Vince Gironda ("The Iron Guru"). Performing 64 reps per exercise in under 6 minutes creates extraordinary muscular pump, capillarization, and localized metabolic fat oxidation while sculpting deep cosmetic separation.',
    routines: [
      {
        dayName: 'Day 1: Chest & Back 8×8 Density Matrix',
        focus: 'Wide Pectoral Sweep & V-Taper Lat Width with 25s Rest',
        exercises: [
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 },
          { exerciseId: 'cable_standing_fly', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Quads, Hamstrings & Calves 8×8 Burn',
        focus: 'High-Density Lower Body Lactic Threshold & Separation',
        exercises: [
          { exerciseId: 'barbell_front_squat', defaultSets: 6, targetReps: '8 (30s Rest)', targetRpe: 9 },
          { exerciseId: 'sled_hack_squat', defaultSets: 6, targetReps: '8 (30s Rest)', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 6, targetReps: '12 (20s Rest)', targetRpe: 9.5 }
        ]
      },
      {
        dayName: 'Day 3: Deltoid Capping & Arm Super-Pump 8×8',
        focus: 'Lateral Delt Width, Biceps Peak & Triceps Sweep',
        exercises: [
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 6, targetReps: '8 (20s Rest)', targetRpe: 9.5 },
          { exerciseId: 'barbell_preacher_curl', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Posterior Chain, Glutes & Core Vacuum 8×8',
        focus: 'Romanian Deadlift, Rear Delts, Dips & Abdominal Wall',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 6, targetReps: '8 (30s Rest)', targetRpe: 9 },
          { exerciseId: 'chest_dip', defaultSets: 6, targetReps: '8 (25s Rest)', targetRpe: 9 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 6, targetReps: '10 (20s Rest)', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 6, targetReps: '10 (20s Rest)', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_hyrox_athletic_engine_pro',
    title: '5-Day Hybrid Athlete & Functional MetCon Engine',
    subtitle: 'Elite hybrid strength-endurance, leg drive, and lactic work capacity conditioning',
    level: 'Advanced Pro',
    daysPerWeek: 5,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    category: 'weight_loss',
    isPro: true,
    badge: 'HYBRID ATHLETE PRO',
    price: 39.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=960&h=600&q=85&plan=hyrox_athletic_engine_pro&focus=hyrox_hybrid_functional_engine',
    howToUse: 'Move briskly between pairings to sustain 75-85% max heart rate while maintaining crisp compound biomechanics under fatigue.',
    description: 'Inspired by modern hybrid fitness racing (Hyrox / Functional MetCon) and tactical conditioning. Combines heavy lower-body sled/leg drive, overhead stamina, pulling endurance, and high-output core conditioning to shred body fat while building an unstoppable engine.',
    routines: [
      {
        dayName: 'Day 1: Lower Body Thruster & Leg Drive Engine',
        focus: 'Front Squat Stamina, Sled Leg Press Drive, Lunges & Calves',
        exercises: [
          { exerciseId: 'barbell_front_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Upper Push/Pull Work Capacity & Grip Stamina',
        focus: 'Bench Press, Strict Pulls, Overhead Endurance, Core',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'push_up_to_side_plank', defaultSets: 3, targetReps: '10 each', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Posterior Chain Hinge & Lactic Clearance',
        focus: 'Deadlift Stamina, Romanian Deadlift, Hamstring Curl, Abs',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Upper Hypertrophy & Shoulder Stamina',
        focus: 'Incline Dumbbell Press, Lat Pulldown, Dips & Arms',
        exercises: [
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 3, targetReps: '12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 5: Total Body Hybrid Championship Simulation',
        focus: 'Full-Body Compound Stamina & Core Lockout',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '10', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'reverse_plank', defaultSets: 3, targetReps: '60s hold', targetRpe: 8.5 }
        ]
      }
    ]
  },

  // ==========================================
  // 4. FULL BODY PROGRAMMES
  // ==========================================
  {
    id: 'plan_fullbody_ab_3day',
    title: '3-Day Full Body Hypertrophy Foundation',
    subtitle: 'Balanced anterior/posterior chain frequency for optimal protein synthesis (Henselmans / Cavaliere)',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'full_body',
    isPro: false,
    badge: 'POPULAR FULL BODY',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=960&h=600&q=85&plan=fullbody_ab_3day&focus=fullbody_hypertrophy_foundation',
    howToUse: 'Train 3 non-consecutive days per week (Mon/Wed/Fri). Every muscle group is stimulated with optimal recovery time between sessions.',
    description: 'Based on muscle protein synthesis studies demonstrating that natural lifters benefit from training muscles every 48-72 hours. Combines compound push, pull, quad, and hinge movements with targeted arm and shoulder isolation.',
    routines: [
      {
        dayName: 'Full Body Compound Foundations',
        focus: 'Comprehensive full-body muscle stimulation across Squat, Bench, Row, Overhead Press and Romanian Deadlift',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_fullbody_4day_hf',
    title: '4-Day High-Frequency Full Body (DUP)',
    subtitle: 'Daily Undulating Periodization rotating Heavy, Hypertrophy, and Power stimulus (Dr. Mike Zourdos)',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'full_body',
    isPro: true,
    badge: 'DUP SCIENTIFIC',
    price: 34.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=960&h=600&q=85&plan=fullbody_4day_hf&focus=dup_high_frequency_fullbody',
    howToUse: 'Train Mon, Tue, Thu, Fri. Never train to failure on Day 1 or Day 2 to allow nervous system recovery for Days 3 & 4.',
    description: 'Developed from peer-reviewed sports science research on Daily Undulating Periodization (DUP). Stimulates the whole body 4 times weekly by varying load and rep schemes (Strength: 3-5 reps, Hypertrophy: 8-12 reps, Speed: 6x3) to maximize weekly volume without burnout.',
    routines: [
      {
        dayName: 'Day 1: Full Body Heavy Strength Wave (3-5 Reps)',
        focus: 'Heavy Squats, Heavy Bench, Deadlift Variation',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '4-6', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '4-6', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '4-6', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Full Body Hypertrophy Overload (8-12 Reps)',
        focus: 'Overhead Press, Lat Pulldown, Romanian Deadlift, Arms',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Full Body Dynamic Speed & Power (Explosive Wave)',
        focus: 'Speed Squats, Speed Bench, Weighted Chin-Ups, Dips',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 5, targetReps: '3 (Speed)', targetRpe: 7.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '3 (Speed)', targetRpe: 7.5 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 4: Full Body Metabolic Accessory Detailing (12-15 Reps)',
        focus: 'Leg Press, Incline DB Bench, Cable Rows, Skull Crushers',
        exercises: [
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_fullbody_5day_dup',
    title: '5-Day Full Body Daily Muscle Priority (DUP)',
    subtitle: 'Advanced systemic micro-dosing for maximum natural muscular protein synthesis',
    level: 'Advanced Pro',
    daysPerWeek: 5,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'full_body',
    isPro: true,
    badge: 'PRO FREQUENCY',
    price: 39.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=960&h=600&q=85&plan=fullbody_5day_dup&focus=5day_daily_muscle_priority_dup',
    howToUse: 'Each day opens with 1 primary muscle prioritized with heavy volume, followed by light maintenance sets for the remaining body.',
    description: 'An elite natural bodybuilding strategy where every session touches the entire physique, but emphasizes a specific focal group with 4 sets of heavy mechanical tension. Yields rapid hypertrophy while keeping overall session fatigue low.',
    routines: [
      {
        dayName: 'Day 1: Full Body (Chest Priority)',
        focus: 'Chest Primary Overload + Maintenance Squats & Pulls',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 3, targetReps: '8', targetRpe: 8 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 3, targetReps: '10', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 2: Full Body (Back Priority)',
        focus: 'Lats & Rhomboids Primary Overload + Hinge & Press Maintenance',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 9 },
          { exerciseId: 'cable_close_grip_front_lat_pulldown', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '8', targetRpe: 8 },
          { exerciseId: 'lever_leg_extension', defaultSets: 3, targetReps: '12', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 3: Full Body (Quads & Calves Priority)',
        focus: 'Quadriceps Primary Overload + Upper Push/Pull Maintenance',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 9 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9.5 },
          { exerciseId: 'dumbbell_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '10', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 4: Full Body (Shoulders & Hamstrings Priority)',
        focus: 'Deltoid 3D Head Overload + Romanian Deadlift',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '6-8', targetRpe: 9 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 5: Full Body (Arms & Core Peak Detailing)',
        focus: 'Biceps & Triceps Supersets + Functional Core',
        exercises: [
          { exerciseId: 'barbell_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '12-15', targetRpe: 9.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_gzclp_tiered_pro',
    title: 'GZCLP 4-Day Tiered Linear Progression (Cody Lefever)',
    subtitle: 'Tier 1 Heavy Strength, Tier 2 Volume Compound & Tier 3 Hypertrophy Pyramid',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'full_body',
    isPro: true,
    badge: 'GZCLP TIERED PRO',
    price: 34.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=960&h=600&q=85&plan=gzclp_tiered_pro&focus=gzclp_tiered_pyramid_progression',
    howToUse: 'Each day features 1 Tier-1 heavy lift (5 sets of 3, last set AMRAP), 1 Tier-2 moderate compound (3 sets of 10), and Tier-3 high-rep isolation accessories (3 sets of 15+).',
    description: 'Created by powerlifting coach Cody Lefever. Widely regarded as one of the smartest full-body progression systems ever built, organizing every session into a 3-Tier pyramid that builds limit strength, muscular base volume, and joint-strengthening hypertrophy simultaneously.',
    routines: [
      {
        dayName: 'Day 1: T1 Squat / T2 Bench Press / T3 Lat & Rear Delt',
        focus: 'Heavy Squat (5×3+), Volume Bench (3×10), Back & Rear Delts (3×15)',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 5, targetReps: '3 (T1 Heavy)', targetRpe: 9 },
          { exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '10 (T2 Volume)', targetRpe: 8 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 3, targetReps: '15 (T3 MRS)', targetRpe: 9 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 3, targetReps: '15 (T3 MRS)', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: T1 Overhead Press / T2 Deadlift / T3 Rows & Biceps',
        focus: 'Heavy Overhead Press (5×3+), Volume Deadlift (3×10), Rows & Curls',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 5, targetReps: '3 (T1 Heavy)', targetRpe: 9 },
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '8-10 (T2 Volume)', targetRpe: 8 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 3, targetReps: '12-15 (T3 MRS)', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '15 (T3 MRS)', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: T1 Bench Press / T2 Squat / T3 Chest & Triceps',
        focus: 'Heavy Bench Press (5×3+), Volume Squat (3×10), Flyes & Triceps',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '3 (T1 Heavy)', targetRpe: 9 },
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 3, targetReps: '10 (T2 Volume)', targetRpe: 8 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '15 (T3 MRS)', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '15 (T3 MRS)', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: T1 Deadlift / T2 Overhead Press / T3 Legs & Delts',
        focus: 'Heavy Deadlift (5×3+), Volume Press (3×10), Hamstrings & Side Delts',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 5, targetReps: '3 (T1 Heavy)', targetRpe: 9 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '10 (T2 Volume)', targetRpe: 8 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '15 (T3 MRS)', targetRpe: 9 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '15 (T3 MRS)', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_doggcrapp_dc_pro',
    title: 'DoggCrapp (DC) Rest-Pause High-Intensity System',
    subtitle: 'Dante Trudel\'s legendary high-frequency rest-pause & extreme stretching hypertrophy system',
    level: 'Advanced Pro',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'full_body',
    isPro: true,
    badge: 'DC TRAINING PRO',
    price: 39.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=960&h=600&q=85&plan=doggcrapp_dc_pro&focus=doggcrapp_rest_pause_intensity',
    howToUse: 'Train 3 non-consecutive days per week (Mon/Wed/Fri). Perform 1 all-out Rest-Pause set (e.g. 8 reps + 15 breaths + 4 reps + 15 breaths + 2 reps) after thorough warm-ups.',
    description: 'Created by Dante Trudel, DoggCrapp (DC) Training revolutionized advanced bodybuilding by combining high frequency, relentless logbook progressive overload, single rest-pause working sets beyond failure, and fascia-expanding loaded stretches.',
    routines: [
      {
        dayName: 'DoggCrapp Full Body Rest-Pause Overload',
        focus: 'Upper & Lower Body Rest-Pause Overload, Heavy Compounds & Extreme Fascia Stretching',
        exercises: [
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '11-15 Rest-Pause', targetRpe: 10 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '11-15 Rest-Pause', targetRpe: 10 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '11-15 Rest-Pause', targetRpe: 10 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 3, targetReps: '11-15 Rest-Pause', targetRpe: 10 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 3, targetReps: '8-10 Straight Heavy', targetRpe: 9.5 },
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 3, targetReps: '6-8 Heavy + 20 Widowmaker', targetRpe: 10 },
          { exerciseId: 'barbell_deadlift', defaultSets: 2, targetReps: '6-8 Heavy Straight', targetRpe: 9.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_super_squats_20rep_pro',
    title: 'Super Squats: 20-Rep Breathing Squat Mass Protocol',
    subtitle: 'Randall J. Strossen\'s iconic old-school full-body slab-of-muscle builder',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'full_body',
    isPro: true,
    badge: '20-REP SQUAT PRO',
    price: 29.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1534368270820-9de3d8053204?auto=format&fit=crop&w=960&h=600&q=85&plan=super_squats_20rep_pro&focus=20_rep_breathing_squat_cage',
    howToUse: 'Load the bar with your 10-rep max squat and perform 20 full reps by taking 3 deep ribcage-expanding breaths between every single rep from rep 10 to 20. Add 2.5kg every workout.',
    description: 'Immortalized by Peary Rader and Dr. Randall J. Strossen in "Super Squats". Centered around a single grueling 20-rep set of breathing squats paired with basic full-body multi-joint lifts to trigger systemic anabolic growth across the entire frame.',
    routines: [
      {
        dayName: 'Day 1: Breathing Squats & Full-Body Strength',
        focus: '20-Rep Breathing Squat, Overhead Press, Bench Press, Barbell Row',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 2, targetReps: '20 (Breathing Squat)', targetRpe: 10 },
          { exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '12', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 2, targetReps: '15', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '10', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 1, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Breathing Squats & Overhead Hypertrophy',
        focus: '20-Rep Breathing Squat +2.5kg, Dips, Chin-Ups, Biceps & Core',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 2, targetReps: '20 (Breathing Squat)', targetRpe: 10 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 2, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Breathing Squats & Heavy Posterior Chain Finish',
        focus: '20-Rep Breathing Squat +5kg Weekly Peak, Heavy Pulls & Arms',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 2, targetReps: '20 (Breathing Squat)', targetRpe: 10 },
          { exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 3, targetReps: '12', targetRpe: 9 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '10', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 2, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 5. EASY FOUNDATIONS & HOME/MINIMALIST
  // ==========================================
  {
    id: 'plan_beginner_fullbody',
    title: 'Beginner Full Body Iron Foundation (3-Day)',
    subtitle: 'The essential barbell, dumbbell, and cable introductory program for new lifters',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'easy_foundations',
    isPro: false,
    badge: 'START HERE',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=960&h=600&q=85&plan=beginner_fullbody&focus=beginner_iron_foundation_3day',
    howToUse: 'Train Mon/Wed/Fri. Focus on textbook execution and full range of motion. Rest 90-120s between sets.',
    description: 'Specially structured for beginners entering a commercial or home gym. Teaches the 5 fundamental human movement patterns (Squat, Hinge, Horizontal Push, Vertical Pull, and Core Anti-Extension) with progressive weekly loading.',
    routines: [
      {
        dayName: 'Day 1: Foundation Squat & Push',
        focus: 'Squats, Bench Press, Lat Pulldown, Core',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 3, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'push_up_to_side_plank', defaultSets: 3, targetReps: '8 each', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 2: Foundation Hinge & Row',
        focus: 'Deadlift, Overhead Press, Cable Rows, Biceps',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '6-8', targetRpe: 8 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 3: Foundation Leg Press & Incline Push',
        focus: 'Leg Press, Incline DB Bench, Hamstring Curl, Triceps',
        exercises: [
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_dumbbell_home_gym',
    title: '3-Day Dumbbell-Only Starter & Home Foundation',
    subtitle: 'Zero barbells or machines required — pure dumbbell hypertrophy for home or travel gyms',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'easy_foundations',
    isPro: false,
    badge: 'HOME FRIENDLY',
    price: 0,
    thumbnail_url: '/assets/dumbbell_starter_user.jpg',
    howToUse: 'Requires only a pair of dumbbells and an adjustable bench (or floor). Perfect for home setups or hotel gyms.',
    description: 'Designed for lifters without access to commercial cable towers or heavy barbells. Uses dumbbell unilateral stability and high mechanical tension to build impressive muscular size and functional athletic power.',
    routines: [
      {
        dayName: 'Day 1: Dumbbell Full Body Push Emphasis',
        focus: 'Chest, Shoulders, Triceps, Quads',
        exercises: [
          { exerciseId: 'dumbbell_bench_press', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'diamond_push_up', defaultSets: 3, targetReps: '10-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Dumbbell Full Body Pull Emphasis',
        focus: 'Lats, Posterior Chain, Biceps, Core',
        exercises: [
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_seated_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'reverse_plank', defaultSets: 3, targetReps: '45s hold', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Dumbbell Lower Body & Arm Overload',
        focus: 'Quads, Glutes, Hamstrings, Biceps, Triceps',
        exercises: [
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'push_up_to_side_plank', defaultSets: 3, targetReps: '10 each', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_minimalist_2day_lifter',
    title: '2-Day Minimalist Busy Lifestyle Split',
    subtitle: 'Time-crunched executive routine delivering 90% of gains in two 45-minute sessions',
    level: 'Beginner',
    daysPerWeek: 2,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'easy_foundations',
    isPro: false,
    badge: 'TIME-CRUNCHED',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=960&h=600&q=85&plan=minimalist_2day_lifter&focus=minimalist_2day_compound_efficiency',
    howToUse: 'Train 2 days per week (e.g. Wednesday and Saturday or Tuesday and Friday). Rest 48-72 hours between sessions.',
    description: 'Designed for busy professionals, parents, and executives who only have two days per week to train. Centers entirely on compound movements with the highest stimulus-to-fatigue ratio, hitting all major muscle groups twice weekly in 45 minutes.',
    routines: [
      {
        dayName: 'Day 1: Full Body Heavy Push & Knee Dominance',
        focus: 'Squats, Bench Press, Lats, Side Delts, Core',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Full Body Heavy Pull & Hip Hinge Dominance',
        focus: 'Deadlift, Overhead Press, Rows, Arms, Calves',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'plan_fierce_5_novice_pro',
    title: 'Fierce 5 Balanced Aesthetic & Strength Foundation',
    subtitle: 'The gold-standard 3-day novice routine engineered for structural balance, posture & aesthetics',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'easy_foundations',
    isPro: true,
    badge: 'FIERCE 5 PRO',
    price: 29.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=960&h=600&q=85&plan=fierce_5_novice_pro&focus=fierce_5_structural_balance',
    howToUse: 'Train 3 non-consecutive days per week (Mon/Wed/Fri). Add 2.5kg to lower body lifts and 1.25kg to upper body lifts each week as strength develops.',
    description: 'Unlike traditional novice barbell programs that over-develop the anterior chain at the expense of posture and arms, Fierce 5 strictly balances every press with a pull and rear-delt/hamstring stabilizer, building an aesthetic, injury-proof physique from day one.',
    routines: [
      {
        dayName: 'Fierce 5 Full Body Structural Balance',
        focus: 'Quad Drive, Horizontal Push/Pull Balance, Posterior Delts, and Anterior Core',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 3, targetReps: '8', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8', targetRpe: 8.5 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 2, targetReps: '10-12', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'plan_tactical_barbell_operator_pro',
    title: 'Tactical Barbell "Operator" Minimalist Strength',
    subtitle: 'K. Black\'s sub-maximal 3-day wave cluster for year-round operational strength without soreness',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'easy_foundations',
    isPro: true,
    badge: 'TACTICAL OPERATOR PRO',
    price: 29.99,
    thumbnail_url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=960&h=600&q=85&plan=tactical_barbell_operator_pro&focus=tactical_barbell_submax_operator',
    howToUse: 'Perform the same tight cluster of 3-4 foundational lifts 3x per week using 6-week sub-maximal percentage waves (Week 1: 70% 5×5, Week 2: 80% 5×5, Week 3: 90% 4×3). Never train to failure.',
    description: 'Designed by K. Black for tactical professionals, martial artists, and busy lifters who need elite barbell strength while staying fresh for sports, running, or demanding careers. Relies on high-frequency sub-maximal practice rather than muscle-destroying soreness.',
    routines: [
      {
        dayName: 'Session 1: Operator Cluster (70-85% Wave)',
        focus: 'Squat, Bench Press, Weighted Pull-Up / Chin-Up & Core',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '5 (Sub-Max Crisp)', targetRpe: 7.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '5 (Sub-Max Crisp)', targetRpe: 7.5 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 4, targetReps: '5-8', targetRpe: 8 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '12', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Session 2: Operator Cluster Mid-Week Practice',
        focus: 'Crisp Bar Speed on Squat, Bench Press & Vertical Pull',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '5 (Sub-Max Crisp)', targetRpe: 7.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '5 (Sub-Max Crisp)', targetRpe: 7.5 },
          { exerciseId: 'chin_ups_(narrow_parallel_grip)', defaultSets: 4, targetReps: '5-8', targetRpe: 8 },
          { exerciseId: 'push_up_to_side_plank', defaultSets: 3, targetReps: '10 each', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Session 3: Operator Cluster + Heavy Deadlift Finish',
        focus: 'Squat, Bench Press & 1-3 Working Sets of Conventional Deadlift',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 3, targetReps: '5 (Sub-Max Crisp)', targetRpe: 7.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 3, targetReps: '5 (Sub-Max Crisp)', targetRpe: 7.5 },
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '5', targetRpe: 8 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '10', targetRpe: 8 }
        ]
      }
    ]
  }
];

export const PRESET_WORKOUT_PLANS: WorkoutPlan[] = RAW_PRESET_WORKOUT_PLANS.map(groundWorkoutPlan);

export function generatePersonalizedPlan(params: {
  level: ExperienceLevel;
  goal: FitnessGoal;
  daysPerWeek: number;
  focusArea: string;
}): WorkoutPlan {
  const { level, goal, daysPerWeek, focusArea } = params;
  const isFatLoss = goal.includes('Fat Loss') || goal.includes('Shred');

  if (isFatLoss) {
    const fatLossPlan = PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_fat_loss_shred') || PRESET_WORKOUT_PLANS[0];
    return groundWorkoutPlan({
      id: `custom_fat_loss_${Date.now()}`,
      title: `${daysPerWeek}-Day Fat Loss & Shred Protocol`,
      subtitle: `Targeted metabolic conditioning for ${level} lifters prioritizing ${focusArea}`,
      level,
      daysPerWeek,
      goal,
      category: 'weight_loss',
      isPro: false,
      badge: 'CUSTOM CUT',
      description: `High-density metabolic resistance training engineered for accelerated body fat oxidation while preserving 100% of lean muscle mass. Features antagonist pairings, 10-15 rep brackets, and short rest intervals.`,
      isPersonalized: true,
      routines: daysPerWeek <= 4 ? fatLossPlan.routines.slice(0, daysPerWeek) : fatLossPlan.routines
    });
  }

  if (daysPerWeek === 3) {
    return groundWorkoutPlan({
      id: `custom_plan_3day_${Date.now()}`,
      title: `3-Day Customized ${goal.split(' ')[0]} Split`,
      subtitle: `Targeted for ${level} lifters prioritizing ${focusArea}`,
      level,
      daysPerWeek: 3,
      goal,
      category: 'full_body',
      isPro: false,
      badge: 'CUSTOM SPLIT',
      description: `Tailored 3-day frequency maximizing recovery and stimulating ${focusArea} with high mechanical tension.`,
      isPersonalized: true,
      routines: [
        {
          dayName: 'Day 1: Full Body Heavy Push & Quads',
          focus: 'Pecs, Delts, Quads',
          exercises: [
            { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 2: Full Body Heavy Pull & Hamstrings',
          focus: 'Lats, Rhomboids, Hamstrings, Biceps',
          exercises: [
            { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
            { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
            { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
            { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 3, targetReps: '15', targetRpe: 9 }
          ]
        },
        {
          dayName: 'Day 3: Hypertrophy Overload & Weakpoint Specialization',
          focus: `${focusArea} & Aesthetics`,
          exercises: [
            { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
            { exerciseId: 'sled_hack_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
            { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
            { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
            { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
          ]
        }
      ]
    });
  }

  if (daysPerWeek === 4) {
    return groundWorkoutPlan({
      id: `custom_plan_4day_${Date.now()}`,
      title: `4-Day Elite Upper/Lower Specialization`,
      subtitle: `Optimized for ${level} hypertrophy with emphasis on ${focusArea}`,
      level,
      daysPerWeek: 4,
      goal,
      category: 'strength_power',
      isPro: false,
      badge: 'CUSTOM SPLIT',
      description: `Hyper-focused 4-day bodybuilding program isolating push-pull chains and leg volume with high density.`,
      isPersonalized: true,
      routines: (PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_upper_lower_4day') || PRESET_WORKOUT_PLANS[0]).routines
    });
  }

  // 5 or 6 days
  return groundWorkoutPlan({
    id: `custom_plan_6day_${Date.now()}`,
    title: `Pro ${daysPerWeek}-Day Hypertrophy Blueprint`,
    subtitle: `Customized for ${level} lifters focusing on ${focusArea}`,
    level,
    daysPerWeek,
    goal,
    category: 'full_body',
    isPro: false,
    badge: 'CUSTOM SPLIT',
    description: `High-frequency training engineered for peak muscular hypertrophy, maximizing weekly volume benchmarks.`,
    isPersonalized: true,
    routines: (PRESET_WORKOUT_PLANS.find(p => p.id === 'plan_fullbody_5day_dup') || PRESET_WORKOUT_PLANS[0]).routines
  });
}
