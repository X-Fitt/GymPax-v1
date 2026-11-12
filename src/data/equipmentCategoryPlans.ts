import { WorkoutPlan, EquipmentPlanCategory } from '../types';
import { groundWorkoutPlan } from './exercises';

export const EQUIPMENT_PLAN_CATEGORIES: {
  id: EquipmentPlanCategory;
  label: string;
}[] = [
  { id: 'commercial_gym', label: 'Commercial Gym' },
  { id: 'cable_machine', label: 'Cable Machine' },
  { id: 'kettlebell_only', label: 'Kettlebell Only' },
  { id: 'home_gym', label: 'Home Gym' },
  { id: 'free_weights_only', label: 'Free Weights Only' },
  { id: 'dumbbells_only', label: 'Dumbbells Only' },
  { id: 'bodyweight_only', label: 'Bodyweight Only' }
];

const RAW_EQUIPMENT_CATEGORY_PLANS: WorkoutPlan[] = [
  // ============================================================================
  // 0A. COMMERCIAL GYM (Full Commercial Arsenal: Barbells, Plate-Loaded, Cables & Selectorized Machines)
  // ============================================================================
  {
    id: 'equip_commercial_gym_pro_ppl',
    title: 'Commercial Gym 6-Day Pro Push / Pull / Legs',
    subtitle: 'Barbells, Plate-Loaded Leverage Machines, Dual Cable Towers & Dumbbells',
    level: 'Intermediate',
    daysPerWeek: 6,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'commercial_gym',
    badge: 'Commercial Gym',
    thumbnail_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_commercial_gym_pro_ppl',
    description:
      'Engineered to exploit the full equipment arsenal of a modern commercial gym. Pairs heavy free-weight barbell compounds with plate-loaded leverage presses, 45° leg presses, hack squats, pec decks, and dual adjustable cable stations for maximum mechanical tension and safest failure training.',
    howToUse:
      'Run on a 3-on / 1-off or 6-day Push / Pull / Legs rotation. Begin each session with the primary barbell lift while your central nervous system is fresh, then push plate-loaded machines and cable isolations to RPE 9–10.',
    routines: [
      {
        dayName: 'Day 1: Commercial Push (Barbell, Leverage Press & Cable Flyes)',
        focus: 'Pectoral Mass, Anterior/Lateral Delts & Triceps Lockout',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'lever_incline_chest_press_(plate_loaded)', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'lever_pec_deck_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_overhead_triceps_extension_(rope_attachment)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Commercial Pull (Pulldowns, Plate-Loaded Rows & Preacher Curls)',
        focus: 'Lat Sweep, Mid-Back Thickness, Rear Delts & Bicep Peak',
        exercises: [
          { exerciseId: 'cable_pulldown_(pro_lat_bar)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_t_bar_row_(plate_loaded)', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'lever_seated_row_(plate_loaded)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_straight_arm_pulldown_(with_rope)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_rear_delt_row_(with_rope)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_preacher_curl_(plate_loaded)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_hammer_curl_(with_rope)_(male)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Commercial Legs (Squat, Hack Sled, Leg Press & Curls)',
        focus: 'Quad Sweep, Hamstring Isolation, Glutes & Standing Calves',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_commercial_gym_upper_lower_hypertrophy',
    title: 'Full-Facility 4-Day Upper / Lower Machine & Iron Split',
    subtitle: 'High-Stability Leverage Machines, Sleds, Cables & Barbell Compounds',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    targetEquipmentCategory: 'commercial_gym',
    badge: 'Commercial Gym',
    thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_commercial_gym_upper_lower_hypertrophy',
    description:
      'Maximizes commercial gym machine stability alongside free-weight power. By pairing barbell compound lifts with fixed-path leverage machines and cables, you can train target muscles to deep muscular fatigue without lower-back or stabilizer bottlenecking.',
    howToUse:
      'Perform 4 days per week (Mon/Tue Upper A & Lower A, Thu/Fri Upper B & Lower B). Take 2–3 minutes of rest on barbell and plate-loaded compounds, and 60–90 seconds on selectorized machine and cable movements.',
    routines: [
      {
        dayName: 'Day 1: Upper A (Chest Thickness, Lat Width & Triceps)',
        focus: 'Flat Bench, Lat Pulldown, Plate-Loaded Chest & Arm Pump',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_pulldown_(pro_lat_bar)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_incline_hammer_chest_press', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_triceps_pushdown_(v_bar_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_biceps_curl_(sz_bar)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lower A (Hack Squat, RDL & Leg Extension Overload)',
        focus: 'Quad Hypertrophy, Posterior Chain & Calf Density',
        exercises: [
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_seated_calf_raise_(plate_loaded)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_seated_crunch_(chest_pad)', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Upper B (Overhead Press, Plate-Loaded High Row & Flyes)',
        focus: 'Deltoid Caps, Upper Back Density & Pectoral Stretch',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'lever_high_row_(plate_loaded)', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_pec_deck_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_one_arm_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_seated_dip', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_preacher_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Lower B (45° Leg Press, Hip Thrust Machine & Hamstrings)',
        focus: 'Glute Power, Leg Press Volume & Posterior Isolation',
        exercises: [
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '8-12', targetRpe: 9 },
          { exerciseId: 'lever_hip_thrust', defaultSets: 4, targetReps: '8-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'sled_45_calf_press', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_commercial_gym_arnold_golden_split',
    title: 'Commercial Gym Antagonist Split (Chest/Back, Delts/Arms, Legs)',
    subtitle: 'High-Volume Supersets Across Machines, Cables, Barbells & Dumbbells',
    level: 'Advanced Pro',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'commercial_gym',
    badge: 'Commercial Gym',
    thumbnail_url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_commercial_gym_arnold_golden_split',
    description:
      'Pairs opposing muscle groups (Chest & Back, Shoulders & Arms, Quads & Hamstrings) using the full suite of commercial gym machines, cables, and free weights for massive cell-swelling pumps and reciprocal inhibition recovery.',
    howToUse:
      'Perform 3 days per week or repeat twice across 6 days. Alternate between pushing and pulling movements with 60–75 seconds rest to keep blood volume concentrated in the target region.',
    routines: [
      {
        dayName: 'Day 1: Chest & Back Antagonist Overload',
        focus: 'Pectoral Shelf, Wide Lats & Rhomboid Density',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_pulldown_(pro_lat_bar)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_incline_chest_press_(plate_loaded)', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'lever_t_bar_row_(plate_loaded)', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_pullover_(plate_loaded)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Shoulders, Biceps & Triceps Super-Pump',
        focus: '3D Deltoids, Peak Biceps & Horseshoe Triceps',
        exercises: [
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_cross_over_revers_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_preacher_curl_(plate_loaded)', defaultSets: 4, targetReps: '8-12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_high_pulley_overhead_tricep_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Commercial Leg Day (Hack Squat, Leg Press & Isolation)',
        focus: 'Complete Lower Body Mass & Striations',
        exercises: [
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_rotary_calf', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_commercial_gym_full_body_machines_iron',
    title: '3-Day Commercial Gym Total-Body Machine & Free-Weight Mastery',
    subtitle: 'Time-Efficient Pin/Plate Machines, Cables & Barbell Foundations',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'commercial_gym',
    badge: 'Commercial Gym',
    thumbnail_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_commercial_gym_full_body_machines_iron',
    description:
      'Designed for lifters who want to hit every major muscle group 3 times per week using the safest, highest-yield machines and free weights in a commercial fitness center. Minimizes setup time while delivering consistent full-body hypertrophy.',
    howToUse:
      'Train Monday, Wednesday, and Friday. Adjust seat heights and pad positions on machines so the machine pivot axis aligns with your natural joint axis.',
    routines: [
      {
        dayName: 'Session A: Leg Press, Chest Press, Pulldown & Arms',
        focus: 'Quads, Pectorals, Lats & Arm Isolation',
        exercises: [
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_chest_press_(plate_loaded)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_pulldown_(pro_lat_bar)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Session B: Hack Squat, Incline Press, Seated Row & Biceps',
        focus: 'Upper Chest, Mid-Back Thickness, Quads & Biceps',
        exercises: [
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_seated_row_(plate_loaded)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_hip_thrust', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_biceps_curl_(sz_bar)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_seated_crunch_(chest_pad)', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Session C: Barbell Bench, T-Bar Row, Leg Extension & Delts',
        focus: 'Full-Body Symmetry, Deltoid Caps & Lower-Body Detail',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'lever_t_bar_row_(plate_loaded)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_leg_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_pec_deck_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ============================================================================
  // 0B. CABLE MACHINE (Strictly 100% Cable Tower & Pulley System Exercises)
  // ============================================================================
  {
    id: 'equip_cable_machine_constant_tension_hypertrophy',
    title: 'Dual Cable Tower 4-Day Constant-Tension Hypertrophy',
    subtitle: '100% Functional Trainer & Pulley System · Continuous Resistance Curve',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'cable_machine',
    badge: 'Cable Machine',
    thumbnail_url: '/assets/cable_machine_1.jpg',
    description:
      'Built 100% around adjustable dual cable towers and pulley stations. Unlike free weights where gravity creates dead-zones at the top or bottom of a rep, cables maintain unyielding horizontal and diagonal tension across every millimeter of the range of motion.',
    howToUse:
      'Perform 4 days per week. Pause for a full 1-second isometric squeeze at peak contraction on every rep and control the eccentric return for 3 seconds without letting the weight stack touch.',
    routines: [
      {
        dayName: 'Day 1: Cable Chest & Triceps (Multi-Angle Crossovers & Extensions)',
        focus: 'Upper/Mid/Lower Pectoral Fibers & Triceps Heads',
        exercises: [
          { exerciseId: 'cable_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_standing_up_straight_crossovers', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_low_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_high_pulley_overhead_tricep_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_one_arm_tricep_pushdown', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Cable Back & Biceps (Pulldowns, Seated Rows & Cable Curls)',
        focus: 'Lat Width, Mid-Back Rhomboids & Constant-Tension Biceps',
        exercises: [
          { exerciseId: 'cable_pulldown_(pro_lat_bar)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_close_grip_front_lat_pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_straight_arm_pulldown_(with_rope)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_biceps_curl_(sz_bar)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_preacher_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_hammer_curl_(with_rope)_(male)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Cable Shoulders & Core (3D Deltoid Pulley Isolation)',
        focus: 'Anterior, Lateral & Posterior Deltoid Caps + Rotational Core',
        exercises: [
          { exerciseId: 'cable_shoulder_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_one_arm_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_front_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'cable_rear_delt_row_(with_rope)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_upright_row', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_twist_(down_up)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Cable Lower Body & Glutes (Pull-Throughs, Squat Rows & Kickbacks)',
        focus: 'Glute Max/Medius, Hamstrings & Lower-Body Conditioning',
        exercises: [
          { exerciseId: 'cable_pull_through', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_stiff_leg_deadlift_from_stepbox_(female)', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_squat_row_(with_rope_attachment)', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'cable_standing_hip_extension_(version_2)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_hip_abduction_(version_2)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_tuck_reverse_crunch', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_cable_machine_ppl_sculpt',
    title: 'Cable Machine Push / Pull / Legs (PPL) Sculpt',
    subtitle: '3-Day All-Cable Push, Pull & Lower Body Pulley Protocol',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'cable_machine',
    badge: 'Cable Machine',
    thumbnail_url: '/assets/cable_machine_2.jpg',
    description:
      'A complete Push / Pull / Legs hypertrophy split executed exclusively on cable stations. Ideal for joint-friendly muscle sculpting, functional trainer setups, and lifters who thrive on smooth, uninterrupted cable resistance.',
    howToUse:
      'Run 3 days per week (Mon/Wed/Fri) or repeat twice across 6 days. Stand one step forward from the pulley stack so the cables stay under tension even at the fully stretched bottom position.',
    routines: [
      {
        dayName: 'Day 1: Cable Push (Pecs, Delts & Triceps Pulley Work)',
        focus: 'Standing & Bench Cable Presses, Flyes, Lateral Raises & Pushdowns',
        exercises: [
          { exerciseId: 'cable_standing_chest_press', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'cable_middle_fly', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_low_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_triceps_pushdown_(v_bar_attachment)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Cable Pull (Lats, Upper Back, Rear Delts & Biceps)',
        focus: 'Vertical & Horizontal Cable Pulling + Peak Bicep Contraction',
        exercises: [
          { exerciseId: 'cable_pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_seated_wide_grip_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_one_arm_lat_pulldown', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_standing_rear_delt_row_(with_rope)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_curl_(male)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_one_arm_inner_biceps_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Cable Legs, Glutes & Core',
        focus: 'Posterior Chain Pull-Throughs, Glute Cuffs & Cable Abs',
        exercises: [
          { exerciseId: 'cable_pull_through', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_squat_row_(with_rope_attachment)', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_stiff_leg_deadlift_from_stepbox_(female)', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_standing_hip_extension_(version_2)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_hip_abduction_(version_2)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_standing_crunch_(with_rope_attachment)_(female)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_cable_machine_full_body_aesthetic',
    title: '3-Day Cable Tower Full-Body Aesthetic & Joint-Friendly Mass',
    subtitle: 'Complete Functional Trainer Routine · Rope, V-Bar & D-Handle Mastery',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'cable_machine',
    badge: 'Cable Machine',
    thumbnail_url: '/assets/cable_machine_3.jpg',
    description:
      'Trains the entire physique 3 days per week using only a dual cable crossover or functional trainer tower. Quick pin-weight adjustments and ergonomic cable paths make this the ultimate joint-friendly full-body hypertrophy program.',
    howToUse:
      'Perform on Monday, Wednesday, and Friday. Transition smoothly between high pulley, mid pulley, and low pulley heights to keep your session fast, focused, and dense.',
    routines: [
      {
        dayName: 'Session A: Full-Body Cable Push, Pull & Hinge',
        focus: 'Chest Press, Lat Pulldown, Pull-Throughs & Arms',
        exercises: [
          { exerciseId: 'cable_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_pulldown_(pro_lat_bar)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_pull_through', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Session B: Incline Cable Fly, Seated Row, Squat Row & Delts',
        focus: 'Upper Chest, Mid-Back, Quads/Glutes & Rear Delts',
        exercises: [
          { exerciseId: 'cable_incline_fly', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_seated_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_squat_row_(with_rope_attachment)', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_rear_delt_row_(with_rope)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_twist_(down_up)', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Session C: Crossovers, Unilateral Pulldown, Hip Extension & Arms',
        focus: 'Striated Pecs, Unilateral Lats, Glutes & Arm Peak',
        exercises: [
          { exerciseId: 'cable_standing_fly', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_one_arm_lat_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_standing_hip_extension_(version_2)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_y_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_overhead_triceps_extension_(rope_attachment)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_hammer_curl_(with_rope)_(male)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_cable_machine_upper_body_vtaper_shred',
    title: '4-Day Cable Machine V-Taper, Striated Chest & Arm Pump',
    subtitle: 'High-Density Pulley Supersets for Wide Lats, 3D Delts & Inner Chest',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    targetEquipmentCategory: 'cable_machine',
    badge: 'Cable Machine',
    thumbnail_url: '/assets/cable_machine_4.jpg',
    description:
      'An elite 4-day high-density cable specialization program focused on carving deep pectoral striations, flaring V-taper lats, capped lateral deltoids, and skin-splitting arm pumps with minimal rest.',
    howToUse:
      'Keep rest intervals strictly to 45–60 seconds between sets. Because selectorized cable pins swap in 2 seconds, you can maintain a high heart rate and maximal metabolic stress throughout every session.',
    routines: [
      {
        dayName: 'Day 1: Multi-Angle Cable Pectoral Striation & Triceps',
        focus: 'High-to-Low, Mid & Low-to-High Crossovers + Rope Triceps',
        exercises: [
          { exerciseId: 'cable_standing_chest_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_standing_up_straight_crossovers', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_low_fly', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_decline_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_triceps_pushdown_(sz_bar)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_kickback', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: V-Taper Lat Flare & Bicep Peak',
        focus: 'Wide Pulldowns, Rope Pullovers, Rotational Rows & Curls',
        exercises: [
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_straight_arm_pulldown_(with_rope)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_palm_rotational_row', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_rope_seated_row', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_preacher_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_reverse_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: 3D Deltoid Ring & Rotational Core Shred',
        focus: 'Y-Raises, Behind-Back Lateral Raises, Rear Delt Flyes & Woodchops',
        exercises: [
          { exerciseId: 'cable_twisting_overhead_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_one_arm_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_y_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_cross_over_revers_fly', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_standing_lift', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_twist_(down_up)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Lower Body Cable Conditioning & Arm Finisher',
        focus: 'Pull-Throughs, Abductions, Rope Crunches & Arm Supersets',
        exercises: [
          { exerciseId: 'cable_pull_through', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_squat_row_(with_rope_attachment)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_hip_abduction_(version_2)', defaultSets: 3, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'cable_biceps_curl_(sz_bar)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_tuck_reverse_crunch', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ============================================================================
  // 1. HOME GYM (Power Rack, Barbell, Bench, Dumbbells & Pull-Up / Dip Station)
  // ============================================================================
  {
    id: 'equip_home_gym_upper_lower',
    title: 'Garage Iron 4-Day Upper / Lower Split',
    subtitle: 'Power Rack, Barbell, Adjustable Bench, Dumbbells & Pull-Up Bar',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'home_gym',
    badge: 'Home Gym',
    thumbnail_url: '/assets/garage_home_gym.jpg',
    description:
      'Engineered specifically for a garage or basement gym equipped with a power rack, Olympic barbell, adjustable bench, dumbbells, and a rack-mounted pull-up/dip bar. Zero commercial cable towers or selectorized machines required.',
    howToUse:
      'Train 4 days per week (e.g., Mon/Tue Upper A & Lower A, Thu/Fri Upper B & Lower B). Set safety pins inside your power rack 1 inch below your bottom range on squats and bench press so you can push safely to RPE 8–9 without a spotter.',
    routines: [
      {
        dayName: 'Day 1: Upper Body A (Horizontal Push & Pull Focus)',
        focus: 'Chest Thickness, Lat Width & Arm Mass',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'pull_up', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Lower Body A (Quad & Glute Rack Overload)',
        focus: 'Barbell Squat, Posterior Chain & Core',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '5-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '10-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Upper Body B (Vertical Press & Chin-Up Focus)',
        focus: 'Boulder Delts, Upper Chest, Lats & Peak Arms',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'chin_up', defaultSets: 4, targetReps: '6-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Lower Body B (Deadlift & Hip Hinge Power)',
        focus: 'Posterior Chain Density, Glutes & Unilateral Quads',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'front_plank_toe_tap_(male)', defaultSets: 3, targetReps: '12-16', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'equip_home_gym_full_body_strength',
    title: 'Home Rack 3-Day Full Body Strength & Mass',
    subtitle: 'High-Efficiency Squat Rack, Barbell, Dumbbells & Pull-Up Bar',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    targetEquipmentCategory: 'home_gym',
    badge: 'Home Gym',
    thumbnail_url: '/assets/home_gym_setup_2.jpg',
    description:
      'Built around the classic 3-day non-consecutive home gym format (Mon/Wed/Fri). Every session pairs a primary barbell rack compound with dumbbell hypertrophy work and rack calisthenics for complete full-body development.',
    howToUse:
      'Perform 3 days per week with at least one rest day between sessions. Focus on adding 2.5 kg (5 lbs) to your barbell lifts whenever you hit the top of the prescribed rep range across all sets.',
    routines: [
      {
        dayName: 'Session A: Squat, Bench & Pull-Up Foundation',
        focus: 'Quads, Pectorals, Lats & Biceps',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '5-8', targetRpe: 8 },
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8 },
          { exerciseId: 'pull_up', defaultSets: 3, targetReps: '6-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 3, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Session B: Deadlift, Overhead Press & Dip Power',
        focus: 'Posterior Chain, Deltoids, Upper Back & Triceps',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 3, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '10-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Session C: Barbell Row, Incline DB & Hip Thrust Hypertrophy',
        focus: 'Upper Chest, Back Density, Glutes & Arms',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'chin_up', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'equip_home_gym_ppl_hypertrophy',
    title: 'Basement Push / Pull / Legs (PPL) Home Blueprint',
    subtitle: 'Complete Rack, Barbell, Dumbbell & Bodyweight PPL System',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'home_gym',
    badge: 'Home Gym',
    thumbnail_url: '/assets/home_gym_setup_3.jpg',
    description:
      'Brings the gold-standard Push / Pull / Legs hypertrophy split into a home gym environment. Combines heavy barbell compounds with dumbbell isolation and rack calisthenics (pull-ups, chin-ups, dips, hanging leg raises).',
    howToUse:
      'Run 3 days per week (Push / Pull / Legs) or repeat twice across a 6-day cycle for higher weekly volume. Control every eccentric for 2–3 seconds and rest 2–3 minutes on barbell compounds.',
    routines: [
      {
        dayName: 'Day 1: Home Push (Chest, Shoulders & Triceps)',
        focus: 'Pectoral Mass, Deltoid Caps & Triceps Lockout',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Home Pull (Back, Rear Delts & Biceps)',
        focus: 'V-Taper Lats, Rhomboid Thickness & Bicep Peak',
        exercises: [
          { exerciseId: 'pull_up', defaultSets: 4, targetReps: '6-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Home Legs & Core (Quads, Hamstrings, Glutes & Abs)',
        focus: 'Squat Sweep, Posterior Chain & Hanging Core',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'equip_home_gym_powerbuilding',
    title: 'Home Gym Powerbuilding 5×5 & Accessory Protocol',
    subtitle: 'Heavy Rack 5×5 Lifts + Dumbbell & Bodyweight Finishers',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    targetEquipmentCategory: 'home_gym',
    badge: 'Home Gym',
    thumbnail_url: '/assets/home_gym_setup_4.jpg',
    description:
      'Combines raw 5×5 barbell strength progression on the Big 4 rack lifts (Squat, Bench, Deadlift, Overhead Press) with high-volume dumbbell and bodyweight hypertrophy accessories—100% tailored for a home power rack setup.',
    howToUse:
      'Start each workout with the primary 5×5 barbell lift, resting 3 full minutes between sets. Then transition to 60–90 second rests on your dumbbell and bodyweight accessories to maximize muscle pump and structural balance.',
    routines: [
      {
        dayName: 'Day 1: Heavy Bench Press 5×5 + Upper Chest & Triceps',
        focus: 'Maximal Pressing Strength & Anterior Upper Hypertrophy',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'push_up_m', defaultSets: 2, targetReps: '15-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Heavy Back Squat 5×5 + Quads, Calves & Abs',
        focus: 'Lower Body Squat Power & Unilateral Leg Mass',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '10-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Heavy Overhead Press 5×5 + Back & Biceps',
        focus: 'Overhead Lockout Power, Weighted/Strict Pull-Ups & Arm Size',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'pull_up', defaultSets: 4, targetReps: '6-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'chin_up', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 4: Heavy Deadlift + Posterior Chain & Hamstrings',
        focus: 'Deadlift Pulling Strength, Glutes & Hamstring Density',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      }
    ]
  },

  // ============================================================================
  // 2. FREE WEIGHTS ONLY (Strictly 100% Barbell & Dumbbell Exercises Only)
  // ============================================================================
  {
    id: 'equip_free_weights_hypertrophy_split',
    title: 'Pure Iron Barbell & Dumbbell Hypertrophy Split',
    subtitle: '100% Barbell & Dumbbell Overload · Zero Cables or Machines',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'free_weights_only',
    badge: 'Free Weights Only',
    description:
      'A purist 4-day bodybuilding split using strictly barbells and dumbbells—no cables, no selectorized weight stacks, and no machines. Every muscle group is loaded through full 3D stabilizer recruitment and high mechanical tension.',
    howToUse:
      'Perform across 4 days per week. Anchor each workout with the heavy barbell movement for 6–8 reps, then transition into controlled dumbbell movements for 8–15 reps to isolate target muscle fibers.',
    routines: [
      {
        dayName: 'Day 1: Chest & Triceps (Barbell & Dumbbell Press/Extension)',
        focus: 'Pectoral Depth & Horseshoe Triceps',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_lying_floor_skullcrusher', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Back & Biceps (Barbell & Dumbbell Row/Curl)',
        focus: 'Back Thickness, Lat Sweep & Bicep Peak',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Shoulders & Traps (Barbell & Dumbbell Delt Sculpt)',
        focus: '3D Anterior, Lateral & Posterior Deltoids',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_overhead_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 4: Legs (Barbell & Dumbbell Lower Body Mass)',
        focus: 'Quads, Hamstrings, Glutes & Calves',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_free_weights_silver_era_full_body',
    title: 'Old-School Silver Era Full Body Free-Weight Mass',
    subtitle: 'Classic 3-Day Barbell & Dumbbell Full-Body Architecture',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'free_weights_only',
    badge: 'Free Weights Only',
    description:
      'Inspired by the pre-machine Silver Era physique legends (Steve Reeves, Reg Park, Clancy Ross). Uses 100% free weights—barbells and dumbbells—three days a week to build dense, balanced full-body proportions.',
    howToUse:
      'Perform on Monday, Wednesday, and Friday. Every workout trains the entire body using strictly barbell and dumbbell movements. Focus on deep stretches and strict form without momentum.',
    routines: [
      {
        dayName: 'Day 1: Silver Era Full Body A (Squat & Bench Anchor)',
        focus: 'Full-Body Free-Weight Mass & Proportion',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Silver Era Full Body B (Deadlift & Overhead Anchor)',
        focus: 'Posterior Chain, Broad Shoulders & Arm Thickness',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Silver Era Full Body C (RDL, DB Press & Symmetry)',
        focus: 'Aesthetic Symmetry, Deltoid Cap & Lower Body Sweep',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_free_weights_ppl_overload',
    title: 'Free Weights Push / Pull / Legs (PPL) Overload',
    subtitle: 'Pure Barbell & Dumbbell PPL · Zero Cable or Machine Dependency',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'free_weights_only',
    badge: 'Free Weights Only',
    description:
      'A pure free-weight Push / Pull / Legs program where every single exercise uses either a barbell or dumbbells. Ideal for lifters who want to skip crowded cable stations and machines while maximizing free-weight hypertrophy.',
    howToUse:
      'Perform as a 3-day split (Mon/Wed/Fri) or a rotating 6-day split. Track barbell and dumbbell loads meticulously and aim for progressive rep or load increases every week.',
    routines: [
      {
        dayName: 'Day 1: Free-Weight Push (Barbell & Dumbbell Chest/Delts/Triceps)',
        focus: 'Pressing Power, Upper Pec Shelf & Triceps Mass',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Free-Weight Pull (Barbell & Dumbbell Back/Rear Delts/Biceps)',
        focus: 'Rowing Density, Posterior Delts & Bicep Peak',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Free-Weight Legs (Barbell & Dumbbell Lower Body)',
        focus: 'Quad Sweep, Hamstring Stretch, Glutes & Calves',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'equip_free_weights_phul_strength',
    title: 'Barbell & Dumbbell Power-Hypertrophy Upper/Lower (PHUL)',
    subtitle: '4-Day Free-Weight Strength & Volume Periodization',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    targetEquipmentCategory: 'free_weights_only',
    badge: 'Free Weights Only',
    description:
      'Adapts the renowned Power Hypertrophy Upper Lower (PHUL) methodology strictly to barbells and dumbbells. Days 1 & 2 build raw neural strength with heavy barbell loads; Days 3 & 4 trigger cellular hypertrophy with high-volume dumbbell and barbell work.',
    howToUse:
      'Schedule Upper Power (Day 1) and Lower Power (Day 2) early in the week, followed by a rest day, then Upper Hypertrophy (Day 3) and Lower Hypertrophy (Day 4).',
    routines: [
      {
        dayName: 'Day 1: Upper Power (Heavy Barbell & Dumbbell Compounds)',
        focus: 'Maximal Upper Body Free-Weight Strength',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '4-6', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '4-6', targetRpe: 8.5 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 3, targetReps: '5-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_curl', defaultSets: 3, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '6-8', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Lower Power (Heavy Squat, Deadlift & Hip Thrust)',
        focus: 'Maximal Lower Body Free-Weight Strength',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '4-6', targetRpe: 8.5 },
          { exerciseId: 'barbell_deadlift', defaultSets: 3, targetReps: '4-5', targetRpe: 8.5 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Upper Hypertrophy (High-Volume Dumbbell & Barbell Sculpt)',
        focus: 'Time-Under-Tension Upper Body Hypertrophy',
        exercises: [
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Lower Hypertrophy (RDL, Split Squat & Lunge Volume)',
        focus: 'Unilateral Quad Sweep, Hamstrings & Calves',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 3, targetReps: '12-14', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      }
    ]
  },

  // ============================================================================
  // 3. DUMBBELLS ONLY (Strictly 100% Dumbbell Exercises Only)
  // ============================================================================
  {
    id: 'equip_dumbbells_full_body_sculpt',
    title: 'Dumbbell-Only 3-Day Full Body Hypertrophy',
    subtitle: '100% Dumbbell Exercises · Complete Full-Body Mass & Symmetry',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'dumbbells_only',
    badge: 'Dumbbells Only',
    thumbnail_url: '/assets/dumbbell_user_1.jpg',
    description:
      'Designed for lifters training exclusively with a pair of adjustable or fixed dumbbells. Every single exercise in all 3 sessions uses dumbbells only—leveraging unilateral stability, deep range of motion, and natural wrist alignment.',
    howToUse:
      'Train 3 non-consecutive days per week (e.g., Mon/Wed/Fri). Use a controlled 3-second lowering phase on every dumbbell movement to maximize muscular tension even with moderate dumbbell weights.',
    routines: [
      {
        dayName: 'Day 1: Dumbbell Full Body A (Press, Row & Goblet Squat)',
        focus: 'Chest, Lats, Quads, Delts & Arms (100% Dumbbells)',
        exercises: [
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bench_press', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_alternate_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Dumbbell Full Body B (RDL, Incline Press & Split Squat)',
        focus: 'Hamstrings, Upper Chest, Shoulders & Arms (100% Dumbbells)',
        exercises: [
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Dumbbell Full Body C (Lunges, Flyes, Rows & Peak Arms)',
        focus: 'Unilateral Legs, Pectoral Stretch, Back & Calves (100% Dumbbells)',
        exercises: [
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_overhead_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_lying_floor_skullcrusher', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_dumbbells_upper_lower_split',
    title: 'Dumbbell-Only 4-Day Upper / Lower Split',
    subtitle: '100% Dumbbell Unilateral & Bilateral Hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'dumbbells_only',
    badge: 'Dumbbells Only',
    thumbnail_url: '/assets/dumbbell_user_2.jpg',
    description:
      'A high-volume 4-day Upper/Lower hypertrophy program using exclusively dumbbells. Eliminates left-to-right strength imbalances by forcing each limb to stabilize and move its own dumbbell load independently.',
    howToUse:
      'Perform Upper A & Lower A on Mon/Tue, rest Wednesday, and perform Upper B & Lower B on Thu/Fri. Keep rest periods to 60–90 seconds to maximize metabolic stress and muscle fiber recruitment.',
    routines: [
      {
        dayName: 'Day 1: Dumbbell Upper A (Chest & Back Thickness)',
        focus: 'Flat/Incline DB Presses, Heavy DB Rows & Arm Isolation',
        exercises: [
          { exerciseId: 'dumbbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_lying_floor_skullcrusher', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Dumbbell Lower A (Quad Sweep & Calves)',
        focus: 'Goblet Squats, Bulgarian Split Squats, RDLs & Calves',
        exercises: [
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Dumbbell Upper B (Shoulder Caps & V-Taper)',
        focus: 'Seated DB Shoulder Press, Chest Flyes, Rear Delts & Arms',
        exercises: [
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Dumbbell Lower B (Hamstring Stretch & Glute Drive)',
        focus: 'Dumbbell RDLs, Walking Lunges, Split Squats & Core',
        exercises: [
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_dumbbells_ppl_hypertrophy',
    title: 'Dumbbell-Only Push / Pull / Legs (PPL) Sculptor',
    subtitle: '100% Dumbbell PPL Split for Aesthetic Proportions',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'dumbbells_only',
    badge: 'Dumbbells Only',
    thumbnail_url: '/assets/dumbbell_user_3.jpg',
    description:
      'Splits your training into dedicated Push, Pull, and Legs workouts using strictly dumbbells. Allows high volume per muscle group and deep stretch-mediated hypertrophy with zero barbells or machines.',
    howToUse:
      'Run 3 days per week (Mon/Wed/Fri) or repeat twice over 6 days. Focus on a 1-second peak contraction at the top of every dumbbell fly, raise, row, and curl.',
    routines: [
      {
        dayName: 'Day 1: Dumbbell Push (Chest, Deltoids & Triceps)',
        focus: '100% Dumbbell Pressing, Flyes, Lateral Raises & Extensions',
        exercises: [
          { exerciseId: 'dumbbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_lying_floor_skullcrusher', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Dumbbell Pull (Back, Rear Delts & Biceps)',
        focus: '100% Dumbbell Rows, Rear Delt Flyes & Multi-Angle Bicep Curls',
        exercises: [
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 5, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_alternate_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Dumbbell Legs & Core (Quads, Hamstrings, Glutes & Calves)',
        focus: '100% Dumbbell Squats, Split Squats, RDLs, Lunges & Calves',
        exercises: [
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'equip_dumbbells_metabolic_shred',
    title: 'High-Density Dumbbell Metabolic Shred & Tone',
    subtitle: '4-Day Short-Rest Dumbbell Conditioning & Lean Muscle',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    targetEquipmentCategory: 'dumbbells_only',
    badge: 'Dumbbells Only',
    thumbnail_url: '/assets/dumbbell_user_4.jpg',
    description:
      'High-density, fat-torching program using 100% dumbbell exercises paired in agonist-antagonist sequences. Keeps heart rate elevated for maximum caloric burn while preserving and sculpting lean muscle.',
    howToUse:
      'Keep rest intervals strictly to 45–60 seconds between sets. Maintain crisp technique throughout higher rep ranges (12–15 reps) for maximum metabolic conditioning.',
    routines: [
      {
        dayName: 'Day 1: Dumbbell Upper Metabolic Density A',
        focus: 'High-Rep Chest, Back & Deltoid Conditioning (100% Dumbbells)',
        exercises: [
          { exerciseId: 'dumbbell_bench_press', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_overhead_press', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 3, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'dumbbell_alternate_biceps_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_triceps_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Dumbbell Lower Metabolic Density A',
        focus: 'High-Calorie Leg & Core Burn (100% Dumbbells)',
        exercises: [
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Dumbbell Upper Metabolic Density B',
        focus: 'Incline Press, Rear Delts & Arm Definition (100% Dumbbells)',
        exercises: [
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_rear_delt_raise', defaultSets: 3, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_lying_floor_skullcrusher', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Dumbbell Lower Metabolic Density B',
        focus: 'Unilateral Split Squat, Hamstring & Core Shred (100% Dumbbells)',
        exercises: [
          { exerciseId: 'dumbbell_bulgarian_split_squat_(female)', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '15', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_standing_single_leg_calf_raise', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_crunch', defaultSets: 4, targetReps: '15-20', targetRpe: 9 }
        ]
      }
    ]
  },

  // ============================================================================
  // 4. BODYWEIGHT ONLY (Strictly 100% Bodyweight Calisthenics Exercises Only)
  // ============================================================================
  {
    id: 'equip_bodyweight_calisthenics_foundation',
    title: 'Pure Calisthenics 3-Day Full Body Foundation',
    subtitle: '100% Bodyweight Exercises · Zero Weights or Machines',
    level: 'Beginner',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'bodyweight_only',
    badge: 'Bodyweight Only',
    thumbnail_url: '/assets/bodyweight_only_1.jpg',
    description:
      'A complete 3-day full-body calisthenics program using 100% bodyweight exercises only. Builds functional upper-body pushing and pulling strength, unilateral leg development, and rock-solid abdominal stability without a single weight.',
    howToUse:
      'Perform 3 days per week (Mon/Wed/Fri). Slow down your lowering phase to 3 seconds and pause 1 second at the bottom of every push-up, pull-up, row, and squat to maximize bodyweight hypertrophy.',
    routines: [
      {
        dayName: 'Day 1: Bodyweight Full Body A (Push, Pull, Squat & Plank)',
        focus: '100% Bodyweight Chest, Back, Quads & Core',
        exercises: [
          { exerciseId: 'pull_up', defaultSets: 4, targetReps: '6-12', targetRpe: 8.5 },
          { exerciseId: 'push_up_m', defaultSets: 4, targetReps: '12-20', targetRpe: 8.5 },
          { exerciseId: 'bodyweight_squat_(male)', defaultSets: 4, targetReps: '15-25', targetRpe: 8.5 },
          { exerciseId: 'inverted_row_between_chairs', defaultSets: 3, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'single_leg_glute_bridge_with_knee_to_chest', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'front_plank_toe_tap_(male)', defaultSets: 3, targetReps: '15-20', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Bodyweight Full Body B (Chin-Up, Dip, Split Squat & Abs)',
        focus: '100% Bodyweight Biceps, Triceps, Unilateral Legs & Abs',
        exercises: [
          { exerciseId: 'chin_up', defaultSets: 4, targetReps: '6-12', targetRpe: 8.5 },
          { exerciseId: 'decline_push_up', defaultSets: 4, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'bulgarian_split_squat', defaultSets: 4, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'pike_push_up', defaultSets: 3, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'single_leg_deadlift_with_knee_lift', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'bench_dip_on_floor', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '10-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Bodyweight Full Body C (Leverage & Calisthenics Control)',
        focus: '100% Bodyweight Upper Lockout, Quad Stretch & Rotational Core',
        exercises: [
          { exerciseId: 'chest_dip', defaultSets: 4, targetReps: '8-15', targetRpe: 8.5 },
          { exerciseId: 'inverted_row_between_chairs', defaultSets: 4, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'diamond_push_up', defaultSets: 3, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'sissy_squat_bodyweight', defaultSets: 3, targetReps: '10-15', targetRpe: 9 },
          { exerciseId: 'hyperextension', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: '45_degree_bycicle_twisting_crunch', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_bodyweight_ppl_split',
    title: 'Bodyweight Push / Pull / Legs (PPL) Calisthenics Split',
    subtitle: '100% Bodyweight Mechanical Leverage PPL Program',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'bodyweight_only',
    badge: 'Bodyweight Only',
    thumbnail_url: '/assets/bodyweight_only_2.jpg',
    description:
      'Applies strict Push / Pull / Legs hypertrophy organization to 100% bodyweight calisthenics. Uses progressive body-angle leverage—such as decline push-ups, diamond push-ups, pike/handstand push-ups, pull-ups, and sissy squats—to overload muscles without external weights.',
    howToUse:
      'Run as a 3-day split or repeat twice across 6 days. Focus on full range of motion and strict scapular control on every pull-up, dip, and push-up variation.',
    routines: [
      {
        dayName: 'Day 1: Bodyweight Push (Chest, Shoulders & Triceps)',
        focus: '100% Bodyweight Horizontal, Incline, Vertical & Tricep Pressing',
        exercises: [
          { exerciseId: 'chest_dip', defaultSets: 4, targetReps: '8-15', targetRpe: 8.5 },
          { exerciseId: 'decline_push_up', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'pike_push_up', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'diamond_push_up', defaultSets: 3, targetReps: '10-15', targetRpe: 9 },
          { exerciseId: 'push_up_m', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'bench_dip_on_floor', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Bodyweight Pull (Lats, Mid-Back & Biceps)',
        focus: '100% Bodyweight Vertical & Horizontal Pulling Variations',
        exercises: [
          { exerciseId: 'pull_up', defaultSets: 4, targetReps: '6-12', targetRpe: 8.5 },
          { exerciseId: 'chin_up', defaultSets: 4, targetReps: '6-12', targetRpe: 8.5 },
          { exerciseId: 'inverted_row_between_chairs', defaultSets: 4, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'seated_row_with_towel', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'hyperextension', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Bodyweight Legs & Core (Quads, Glutes, Hamstrings & Abs)',
        focus: '100% Bodyweight Unilateral Leg Overload & Hanging/Floor Core',
        exercises: [
          { exerciseId: 'bulgarian_split_squat', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'sissy_squat_bodyweight', defaultSets: 4, targetReps: '10-15', targetRpe: 9 },
          { exerciseId: 'single_leg_deadlift_with_knee_lift', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'single_leg_glute_bridge_with_knee_to_chest', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'bodyweight_squat_(male)', defaultSets: 3, targetReps: '20-25', targetRpe: 8.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 3, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: '45_degree_bycicle_twisting_crunch', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_bodyweight_street_workout_upper_lower',
    title: 'Street Workout 4-Day Upper / Lower Calisthenics Progression',
    subtitle: 'High-Skill Bodyweight Strength: Handstand, Pull-Ups, Dips & Split Squats',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    targetEquipmentCategory: 'bodyweight_only',
    badge: 'Bodyweight Only',
    thumbnail_url: '/assets/bodyweight_only_3.jpg',
    description:
      'An advanced 4-day calisthenics upper/lower split inspired by street workout athletes. Focuses on high-leverage bodyweight movements including handstand push-ups, strict pull-ups, chest dips, sissy squats, and hanging straight-leg raises.',
    howToUse:
      'Perform Upper A & Lower A on Mon/Tue, rest Wednesday, and perform Upper B & Lower B on Thu/Fri. Prioritize crisp body alignment and zero kipping on all bar and floor movements.',
    routines: [
      {
        dayName: 'Day 1: Calisthenics Upper A (Vertical Push & Pull Dominance)',
        focus: 'Handstand Push-Ups, Pull-Ups, Dips & Inverted Rows',
        exercises: [
          { exerciseId: 'handstand_push_up', defaultSets: 4, targetReps: '5-10', targetRpe: 8.5 },
          { exerciseId: 'pull_up', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 4, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'inverted_row_between_chairs', defaultSets: 4, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'diamond_push_up', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Calisthenics Lower A (Unilateral Quad & Core Power)',
        focus: 'Bulgarian Split Squats, Sissy Squats & Hanging Leg Raises',
        exercises: [
          { exerciseId: 'bulgarian_split_squat', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'sissy_squat_bodyweight', defaultSets: 4, targetReps: '10-15', targetRpe: 9 },
          { exerciseId: 'single_leg_glute_bridge_with_knee_to_chest', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'bodyweight_squat_(male)', defaultSets: 3, targetReps: '20-25', targetRpe: 8.5 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Calisthenics Upper B (Chin-Up & Horizontal Planche/Push)',
        focus: 'Chin-Ups, Decline Push-Ups, Pike Push-Ups & Towel Rows',
        exercises: [
          { exerciseId: 'chin_up', defaultSets: 4, targetReps: '8-12', targetRpe: 8.5 },
          { exerciseId: 'decline_push_up', defaultSets: 4, targetReps: '12-18', targetRpe: 8.5 },
          { exerciseId: 'pike_push_up', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'seated_row_with_towel', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'bench_dip_on_floor', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'push_up_m', defaultSets: 3, targetReps: '15-25', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Calisthenics Lower B (Posterior Chain & Core Lock)',
        focus: 'Single-Leg Deadlifts, Hyperextensions, Glute Bridges & Obliques',
        exercises: [
          { exerciseId: 'single_leg_deadlift_with_knee_lift', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'single_leg_glute_bridge_with_knee_to_chest', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'hyperextension', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'bulgarian_split_squat', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'front_plank_toe_tap_(male)', defaultSets: 3, targetReps: '16-20', targetRpe: 8.5 },
          { exerciseId: '45_degree_bycicle_twisting_crunch', defaultSets: 4, targetReps: '20', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'equip_bodyweight_zero_gear_shred',
    title: 'Zero-Equipment Living Room Calisthenics Shred',
    subtitle: '100% Floor & Household Bodyweight Fat-Loss & Toning (4-Day)',
    level: 'Beginner',
    daysPerWeek: 4,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    targetEquipmentCategory: 'bodyweight_only',
    badge: 'Bodyweight Only',
    thumbnail_url: '/assets/bodyweight_only_4.jpg',
    description:
      'Requires zero pull-up bars, zero dumbbells, and zero gym gear—just your body and the floor (plus a chair or bed edge). High-density bodyweight circuits designed to burn fat, build muscular endurance, and sculpt your core anywhere.',
    howToUse:
      'Perform 4 days per week with 45 seconds rest between exercises. Focus on continuous tension and smooth breathing throughout every bodyweight set.',
    routines: [
      {
        dayName: 'Day 1: Zero-Gear Upper Body Push & Pull Burn',
        focus: 'Push-Ups, Inverted/Towel Rows,Pike Presses & Floor Dips',
        exercises: [
          { exerciseId: 'push_up_m', defaultSets: 4, targetReps: '15-20', targetRpe: 8.5 },
          { exerciseId: 'inverted_row_between_chairs', defaultSets: 4, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'decline_push_up', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'seated_row_with_towel', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'pike_push_up', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'bench_dip_on_floor', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Zero-Gear Lower Body & Glute Sculpt',
        focus: 'Bodyweight Squats, Split Squats, Glute Bridges & Single-Leg RDLs',
        exercises: [
          { exerciseId: 'bodyweight_squat_(male)', defaultSets: 4, targetReps: '20-25', targetRpe: 8.5 },
          { exerciseId: 'bulgarian_split_squat', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'single_leg_glute_bridge_with_knee_to_chest', defaultSets: 4, targetReps: '15', targetRpe: 8.5 },
          { exerciseId: 'single_leg_deadlift_with_knee_lift', defaultSets: 3, targetReps: '12', targetRpe: 8.5 },
          { exerciseId: 'sissy_squat_bodyweight', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'front_plank_toe_tap_(male)', defaultSets: 3, targetReps: '16-20', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Zero-Gear Triceps, Shoulders & Core Shred',
        focus: 'Diamond Push-Ups, Pike Push-Ups, Towel Rows & Abdominal Circuit',
        exercises: [
          { exerciseId: 'diamond_push_up', defaultSets: 4, targetReps: '10-15', targetRpe: 8.5 },
          { exerciseId: 'pike_push_up', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'seated_row_with_towel', defaultSets: 4, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'bench_dip_on_floor', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: '45_degree_bycicle_twisting_crunch', defaultSets: 4, targetReps: '20', targetRpe: 9 },
          { exerciseId: 'front_plank_toe_tap_(male)', defaultSets: 3, targetReps: '16-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 4: Zero-Gear Full-Body Metabolic Conditioning',
        focus: 'Total-Body Calisthenics Stamina & Calorie Burn',
        exercises: [
          { exerciseId: 'bodyweight_squat_(male)', defaultSets: 4, targetReps: '20-25', targetRpe: 8.5 },
          { exerciseId: 'push_up_m', defaultSets: 4, targetReps: '15-20', targetRpe: 8.5 },
          { exerciseId: 'bulgarian_split_squat', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'inverted_row_between_chairs', defaultSets: 3, targetReps: '12-15', targetRpe: 8.5 },
          { exerciseId: 'single_leg_glute_bridge_with_knee_to_chest', defaultSets: 3, targetReps: '15', targetRpe: 8.5 },
          { exerciseId: '45_degree_bycicle_twisting_crunch', defaultSets: 3, targetReps: '20', targetRpe: 9 }
        ]
      }
    ]
  },

  // ============================================================================
  // 5. KETTLEBELL ONLY (Pavel Tsatsouline, Dan John & Geoff Neupert Protocols)
  // ============================================================================
  {
    id: 'equip_kettlebell_simple_sinister',
    title: "Pavel's Simple & Sinister Kettlebell Protocol",
    subtitle: 'Hardstyle Swings, Turkish Get-Up Progressions & Deep Goblet Mobility',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Strength & Size (Powerbuilding)',
    targetEquipmentCategory: 'kettlebell_only',
    badge: 'Kettlebell Only',
    thumbnail_url: '/assets/kettlebell_gym_1.jpg',
    description:
      'Grounded in Pavel Tsatsouline’s world-renowned StrongFirst / Hardstyle standard. Built around ballistic hip hinge swings paired with high-tension Turkish get-up progressions, windmills, and deep goblet squats. Develops explosive posterior chain power, iron grip, bulletproof shoulders, and cardiovascular work capacity with zero machines.',
    howToUse:
      'Train 4 days per week (e.g., Mon, Tue, Thu, Fri). Warm up with goblet squat mobility and head rotations (halos). Execute swings with a snappy hip hinge and crisp lat engagement at the top. On windmills and get-up progressions, keep your eyes locked on the bell and shoulders packed down away from your ears.',
    routines: [
      {
        dayName: 'Day 1: Ballistic Power Swings & Turkish Mobility',
        focus: 'Hardstyle Hip Snap, Glute Drive & Core Armor',
        exercises: [
          { exerciseId: 'kettlebell_goblet_squat_mobility', defaultSets: 3, targetReps: '8-10', targetRpe: 7.5 },
          { exerciseId: 'kettlebell_around_head_rotation', defaultSets: 3, targetReps: '10-12', targetRpe: 7.5 },
          { exerciseId: 'kettlebell_swing_(female)', defaultSets: 5, targetReps: '15-20', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_windmill', defaultSets: 4, targetReps: '5-8', targetRpe: 8 },
          { exerciseId: 'kettlebell_farmers_carry', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Hardstyle Grind Strength & Overhead Packing',
        focus: 'Strict Military Press, Goblet Squat & Anti-Rotation',
        exercises: [
          { exerciseId: 'kettlebell_standing_bottoms_up_one_arm_shoulder_pr', defaultSets: 3, targetReps: '6-8', targetRpe: 8 },
          { exerciseId: 'kettlebell_strict_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_goblet_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_one_arm_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_russian_twist', defaultSets: 3, targetReps: '15-20', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Explosive Single-Arm Hinge & Lat Tension',
        focus: 'High Pulls, Overhand Swings & Posterior Chain',
        exercises: [
          { exerciseId: 'kettlebell_sumo_high_pull', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_overhand_grip_swing_(female)', defaultSets: 5, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'kettlebell_bent_press_(female)', defaultSets: 3, targetReps: '6-8', targetRpe: 8 },
          { exerciseId: 'kettlebell_two_arm_row', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_straight_leg_deadlift', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 4: Total Body Tension & Work Capacity',
        focus: 'Floor Press, Front Squats & Suitcase Carries',
        exercises: [
          { exerciseId: 'kettlebell_one_arm_floor_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_front_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_swing_(female)', defaultSets: 5, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'kettlebell_advanced_windmill', defaultSets: 3, targetReps: '6-8', targetRpe: 8 },
          { exerciseId: 'kettlebell_suitcase_deadlift_(male)', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'equip_kettlebell_armor_building_complex',
    title: "Dan John's Armor Building Complex (ABC)",
    subtitle: 'Double Cleans, Military Press & Front Squat Density Splits',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'kettlebell_only',
    badge: 'Kettlebell Only',
    thumbnail_url: '/assets/kettlebell_gym_2.jpg',
    description:
      'Engineered by legendary track and strength coach Dan John, the Armor Building Complex is celebrated worldwide for forging dense upper-back muscle armor, massive core stiffness, and relentless work capacity. Utilizes double kettlebell clean, press, and front squat density complexes paired with heavy renegade rows and farmer’s walks.',
    howToUse:
      'Train 3 days per week (e.g. Mon, Wed, Fri) with at least 24–48 hours of recovery between sessions. Clean the bells smoothly into a vertical forearm rack position. Rest 60–90 seconds between complex rounds to build both muscular thickness and metabolic endurance.',
    routines: [
      {
        dayName: 'Day 1: Armor Building Density & Front Squat Overload',
        focus: 'Cleans, Double Military Press, Squat & Heavy Carries',
        exercises: [
          { exerciseId: 'kettlebell_one_arm_clean_and_jerk', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_two_arm_military_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_front_squat', defaultSets: 5, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_alternating_renegade_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_farmers_carry', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Hinge Power, High Pulls & Unilateral Upper Body',
        focus: 'Heavy Deadlifts, Sumo High Pulls & Floor Press Mass',
        exercises: [
          { exerciseId: 'kettlebell_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_sumo_deadlift_with_high_pull_(male)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_one_arm_floor_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_one_arm_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_lunge_pass_through', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 3: The ABC Full-Body Finisher & Overhead Pressing',
        focus: 'Push Press, Squat Ladders, Rows & Explosive Swings',
        exercises: [
          { exerciseId: 'kettlebell_double_push_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_front_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_two_arm_row', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_swing_(female)', defaultSets: 5, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'kettlebell_russian_twist', defaultSets: 3, targetReps: '15-20', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'equip_kettlebell_muscle_hypertrophy',
    title: "Geoff Neupert's Kettlebell Muscle Hypertrophy",
    subtitle: 'Double Kettlebell Rep Ladders, Clean & Press, Squat & Row Mass',
    level: 'Advanced Pro',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    targetEquipmentCategory: 'kettlebell_only',
    badge: 'Kettlebell Only',
    thumbnail_url: '/assets/kettlebell_gym_3.jpg',
    description:
      'Inspired by Master RKC Geoff Neupert’s acclaimed Kettlebell Muscle hypertrophy framework. Specifically structures double kettlebell clean & push presses, alternating floor presses, front squats, and snatch complexes with progressive density to trigger upper-body thickness, broad deltoids, and dense quads.',
    howToUse:
      'Train 3 non-consecutive days per week (e.g. Mon, Wed, Fri). Clean the bells cleanly to the chest without banging your forearms. Perform all overhead presses with strict vertical torso lockouts and brace your glutes and quads on every rep.',
    routines: [
      {
        dayName: 'Day 1: Double Push Press & Quad Hypertrophy',
        focus: 'Overhead Power, Front Squat Hypertrophy & Renegade Rows',
        exercises: [
          { exerciseId: 'kettlebell_double_push_press', defaultSets: 5, targetReps: '5-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_front_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_alternating_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_alternating_press_on_floor', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_farmers_carry', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Explosive Ballistic Pull & Posterior Chain',
        focus: 'One-Arm Snatch, Straight Leg Deadlift & Lunges',
        exercises: [
          { exerciseId: 'kettlebell_one_arm_snatch', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_straight_leg_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_two_arm_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_backward_lunge', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_upright_row', defaultSets: 3, targetReps: '10-12', targetRpe: 8 }
        ]
      },
      {
        dayName: 'Day 3: Clean, Strict Press & Rotational Core',
        focus: 'Strict Military Press, Goblet Squat & Core Stability',
        exercises: [
          { exerciseId: 'kettlebell_strict_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_goblet_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_one_arm_clean_and_jerk', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_alternating_renegade_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_windmill', defaultSets: 3, targetReps: '8-10', targetRpe: 8 }
        ]
      }
    ]
  },
  {
    id: 'equip_kettlebell_hardstyle_shred',
    title: 'Hardstyle 4-Day Kettlebell Conditioning & Shred',
    subtitle: 'High-Yield Functional Split · Upper Push/Pull, Lower Hinge & MetCon',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    targetEquipmentCategory: 'kettlebell_only',
    badge: 'Kettlebell Only',
    thumbnail_url: '/assets/kettlebell_gym_4.jpg',
    description:
      'An athletic 4-day kettlebell protocol engineered for maximum metabolic conditioning, athletic agility, and full-body leanness. Alternates heavy upper-body pressing and rowing with high-velocity ballistic hinges, lunges, snatches, thrusters, and rotational core drills.',
    howToUse:
      'Train on a 2-on / 1-off / 2-on / 2-off schedule (e.g. Mon/Tue Upper & Lower, Thu/Fri Athletic & MetCon). Maintain explosive hip drive on swings and snatches while keeping your core braced and ribs anchored down during all thrusters and presses.',
    routines: [
      {
        dayName: 'Day 1: Upper Torso Power & Core Rigidity',
        focus: 'Strict Press, Single-Arm Row, Floor Press & Russian Twist',
        exercises: [
          { exerciseId: 'kettlebell_strict_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_one_arm_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_one_arm_floor_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_seesaw_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'kettlebell_russian_twist', defaultSets: 4, targetReps: '15-20', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Lower Body Quad & Posterior Chain Overload',
        focus: 'Goblet Squats, Stiff-Leg Hinges, Reverse Lunges & Swings',
        exercises: [
          { exerciseId: 'kettlebell_goblet_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_straight_leg_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_backward_lunge', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_overhand_grip_swing_(female)', defaultSets: 5, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'kettlebell_farmers_carry', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 3: Athletic Power, Snatches & Windmills',
        focus: 'One-Arm Snatch, Sumo High Pulls, Thrusters & Suitcase Lifts',
        exercises: [
          { exerciseId: 'kettlebell_one_arm_snatch', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_sumo_high_pull', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_thruster', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_windmill', defaultSets: 3, targetReps: '6-8', targetRpe: 8 },
          { exerciseId: 'kettlebell_suitcase_deadlift_(male)', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 4: Total Body MetCon & Renegade Density',
        focus: 'Clean & Jerk, Front Squats, Renegade Rows & Swings',
        exercises: [
          { exerciseId: 'kettlebell_one_arm_clean_and_jerk', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_front_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_alternating_renegade_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'kettlebell_lunge_pass_through', defaultSets: 3, targetReps: '10-12', targetRpe: 8 },
          { exerciseId: 'kettlebell_swing_(female)', defaultSets: 5, targetReps: '20', targetRpe: 9 }
        ]
      }
    ]
  }
];

export const EQUIPMENT_CATEGORY_PLANS: WorkoutPlan[] =
  RAW_EQUIPMENT_CATEGORY_PLANS.map(groundWorkoutPlan);
