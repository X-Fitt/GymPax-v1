import { WorkoutPlan, MuscleGroup } from '../types';
import { groundWorkoutPlan } from './exercises';

export const MUSCLE_SHAPE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: 'Chest', label: 'Chest' },
  { id: 'Back', label: 'Back' },
  { id: 'Shoulders', label: 'Shoulders' },
  { id: 'Biceps', label: 'Biceps' },
  { id: 'Triceps', label: 'Triceps' },
  { id: 'Quads', label: 'Quads' },
  { id: 'Hamstrings', label: 'Hamstrings' },
  { id: 'Glutes', label: 'Glutes' },
  { id: 'Abs & Core', label: 'Abs & Core' },
  { id: 'Calves', label: 'Calves' },
  { id: 'Forearms', label: 'Forearms' }
];

const RAW_MUSCLE_SHAPE_PLANS: WorkoutPlan[] = [
  // ==========================================
  // 1. CHEST (4 Specialized Programs — ONLY Chest Exercises)
  // ==========================================
  {
    id: 'muscle_chest_clavicular_shelf',
    title: 'Clavicular Shelf & Upper Pec Specialization',
    subtitle: 'Incline-first 30° pressing & low-to-high cable convergence protocol',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Chest',
    isPro: false,
    badge: 'CHEST SHAPE',
    thumbnail_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=960&h=600&q=85&plan=muscle_chest_clavicular_shelf&focus=incline_chest_clavicular_shelf',
    description: 'Prioritizes the clavicular fibers of the upper chest with 30-degree incline pressing and stretch-mediated cable flyes before flat compound work.',
    routines: [
      {
        dayName: 'Day 1: Upper Chest Incline Overload',
        focus: 'Clavicular Pectorals, Upper Chest Shelf',
        exercises: [
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_incline_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_low_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Sternal Mass & Stretch Hypertrophy',
        focus: 'Mid-Pectorals, Outer Pec Sweep',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_incline_bench_press', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 3: Clavicular Pump & Convergence Finisher',
        focus: 'Upper & Inner Pectoral Striations',
        exercises: [
          { exerciseId: 'dumbbell_incline_fly', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_middle_fly', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_chest_power_mass',
    title: 'Pectoral Mass & Power Bench Protocol',
    subtitle: 'Heavy sternal barbell loading paired with weighted dip hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Chest',
    isPro: false,
    badge: 'CHEST SHAPE',
    thumbnail_url: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&w=960&h=600&q=85&plan=muscle_chest_power_mass&focus=heavy_barbell_bench_chest_mass',
    description: 'Combines heavy progressive barbell bench pressing with weighted chest dips and dumbbell volume to build dense, thick pectoral slabs.',
    routines: [
      {
        dayName: 'Day 1: Heavy Barbell Bench & Weighted Dip',
        focus: 'Sternal Pectorals, Pressing Power',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'cable_standing_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Pause Bench & Dumbbell Volume',
        focus: 'Chest Explosiveness & Hypertrophy',
        exercises: [
          { exerciseId: 'dumbbell_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_wide_bench_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_chest_3d_stretch',
    title: '3D Inner & Lower Chest Stretch Routine',
    subtitle: 'Pre-exhaustion cable crossovers & deep eccentric chest sculpting',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Chest',
    isPro: false,
    badge: 'CHEST SHAPE',
    thumbnail_url: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=960&h=600&q=85&plan=muscle_chest_3d_stretch&focus=cable_fly_inner_chest_stretch',
    description: 'Uses pre-exhaustion cable adduction and controlled 3-second eccentric stretches to carve out the lower-outer pec line and inner sternal separation.',
    routines: [
      {
        dayName: 'Day 1: Pre-Exhaust Cable Fly & Incline Press',
        focus: 'Inner Chest Separation & Upper Shelf',
        exercises: [
          { exerciseId: 'cable_standing_fly', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lower Pec Line & Deep Stretch',
        focus: 'Costal Pectoralis Major & Outer Sweep',
        exercises: [
          { exerciseId: 'barbell_decline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bench_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_decline_fly', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_middle_fly', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_chest_golden_era',
    title: 'Golden Era Chest & Ribcage Builder',
    subtitle: 'High-volume Venice Beach pressing, wide-arc flyes & pullovers',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Aesthetic V-Taper',
    category: 'strength_power',
    targetMuscleGroup: 'Chest',
    isPro: false,
    badge: 'CHEST SHAPE',
    thumbnail_url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=960&h=600&q=85&plan=muscle_chest_golden_era&focus=golden_era_chest_pullover_flye',
    description: 'Inspired by Golden Era bodybuilding: combines heavy barbell presses, deep-stretch dumbbell flyes, and ribcage-expanding straight-arm chest pullovers.',
    routines: [
      {
        dayName: 'Day 1: Venice Heavy Press & Flye Superset',
        focus: 'Full Pectoral Bellies & Ribcage Expansion',
        exercises: [
          { exerciseId: 'barbell_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_fly', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_straight_arm_pullover', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: High-Volume Dips & Cable Striations',
        focus: 'Lower Pecs & Inner Chest Peak Contraction',
        exercises: [
          { exerciseId: 'dumbbell_incline_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'chest_dip', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_standing_up_straight_crossovers', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_decline_pullover', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 2. BACK (4 Specialized Programs — Male & Female Back Models & Exercises)
  // ==========================================
  {
    id: 'muscle_back_cobra_vtaper',
    title: 'Cobra V-Taper Lat Width Specialization',
    subtitle: 'Stretch-mediated vertical pulls & straight-arm lat sweep (Male & Female)',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Aesthetic V-Taper',
    category: 'strength_power',
    targetMuscleGroup: 'Back',
    isPro: false,
    badge: 'BACK SHAPE',
    thumbnail_url: '/assets/back_muscle_1.jpg',
    description: 'Maximizes latissimus dorsi and teres major width using wide-grip pull-ups, lat pulldowns, dumbbell rows, and straight-arm cable pullovers.',
    routines: [
      {
        dayName: 'Day 1: Vertical Lat Sweep & Stretch',
        focus: 'Upper Lats, Teres Major, Iliac Lat Fibers',
        exercises: [
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_wide_grip_lat_pulldown_(female)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_bent_over_row_(female)', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_straight_arm_pulldown', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lower Lat Insertion & Pullover Focus',
        focus: 'Lower Lat Flare & Mid-Back',
        exercises: [
          { exerciseId: 'pull_up', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'wide_grip_pull_up_(female)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_pullover', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_back_3d_thickness',
    title: '3D Back Thickness & Rhomboid Density',
    subtitle: 'Heavy dumbbell & barbell rows, T-bar pulls & scapular retraction overload',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Back',
    isPro: false,
    badge: 'BACK SHAPE',
    thumbnail_url: '/assets/back_muscle_2.jpg',
    description: 'Built to carve deep mid-back valleys across the rhomboids, middle/lower traps, and spinal erectors through heavy horizontal rowing.',
    routines: [
      {
        dayName: 'Day 1: Heavy Barbell & T-Bar Row Density',
        focus: 'Rhomboids, Mid-Traps, Lat Thickness',
        exercises: [
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'lever_t_bar_row_(plate_loaded)_(female)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_seated_wide_grip_row_(female)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Unilateral Row & Upper Back Volume',
        focus: 'Mid-Back Detail & Scapular Control',
        exercises: [
          { exerciseId: 'dumbbell_bent_over_row_(female)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_incline_row', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_shrug_(female)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_back_deadlift_power',
    title: 'Posterior Chain & Deadlift Power Back',
    subtitle: 'Heavy deadlifts, Pendlay rows & spinal erector armor',
    level: 'Advanced Pro',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Back',
    isPro: false,
    badge: 'BACK SHAPE',
    thumbnail_url: '/assets/back_muscle_3.jpg',
    description: 'Constructs granite spinal erectors, upper traps, and thick lats with deadlift progression and explosive bent-over rows.',
    routines: [
      {
        dayName: 'Day 1: Heavy Deadlift & Barbell Row',
        focus: 'Erector Spinae, Lats, Upper Traps',
        exercises: [
          { exerciseId: 'barbell_deadlift', defaultSets: 4, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'barbell_pendlay_row', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_bent_over_row_(female)', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_shrug', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lat Pull & Seated Row Hypertrophy',
        focus: 'Latissimus Dorsi & Mid-Back',
        exercises: [
          { exerciseId: 'cable_close_grip_front_lat_pulldown_(female)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_back_extension_(female)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_back_width_thickness_split',
    title: 'Complete Width & Thickness Dual Split',
    subtitle: 'Dedicated vertical width day + horizontal thickness day (Male & Female)',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Back',
    isPro: false,
    badge: 'BACK SHAPE',
    thumbnail_url: '/assets/back_muscle_4.jpg',
    description: 'Separates back training into dedicated vertical-pull width sessions and horizontal-row thickness sessions for complete 360° back development.',
    routines: [
      {
        dayName: 'Day 1: Dedicated Lat Width Session',
        focus: 'Upper & Lower Lat Sweep',
        exercises: [
          { exerciseId: 'pull_up', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'wide_grip_pull_up_(female)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_bar_lateral_pulldown', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_straight_arm_pulldown_ii_(female)', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Dedicated Back Thickness Session',
        focus: 'Rhomboids, Traps & Mid-Back Density',
        exercises: [
          { exerciseId: 'barbell_bent_over_row', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_reverse_t_bar_row_(female)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_seated_row_with_v_bar', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_bent_over_row_(female)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 3. SHOULDERS (4 Specialized Programs — ONLY Shoulders Exercises)
  // ==========================================
  {
    id: 'muscle_shoulder_3d_cannonball',
    title: '3D Cannonball Lateral Delt Specialization',
    subtitle: 'High-frequency cable & dumbbell medial deltoid width protocol',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Aesthetic V-Taper',
    category: 'strength_power',
    targetMuscleGroup: 'Shoulders',
    isPro: false,
    badge: 'SHOULDER SHAPE',
    thumbnail_url: '/assets/shoulder_muscle_1.jpg',
    description: 'Focuses on constant-tension cable lateral raises, seated dumbbell lateral raises, and upright rows to dramatically widen your clavicular silhouette.',
    routines: [
      {
        dayName: 'Day 1: Medial Delt Width & Overhead Press',
        focus: 'Lateral Deltoids, Anterior Deltoids',
        exercises: [
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 5, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Constant-Tension Lateral & Rear Caps',
        focus: 'Side Delt Sweep & Posterior Delts',
        exercises: [
          { exerciseId: 'cable_lateral_raise', defaultSets: 5, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_upright_row', defaultSets: 3, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_rear_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_shoulder_boulder_press',
    title: 'Overhead Pressing Power & Boulder Delts',
    subtitle: 'Standing barbell military press & heavy seated dumbbell overload',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Shoulders',
    isPro: false,
    badge: 'SHOULDER SHAPE',
    thumbnail_url: '/assets/shoulder_muscle_2.jpg',
    description: 'Builds raw overhead pressing strength and dense anterior/medial deltoid mass with standing military presses and heavy dumbbell presses.',
    routines: [
      {
        dayName: 'Day 1: Heavy Military Press & Side Delts',
        focus: 'Anterior & Lateral Deltoid Mass',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Arnold Press & Deltoid Volume',
        focus: 'Full 3-Head Shoulder Hypertrophy',
        exercises: [
          { exerciseId: 'dumbbell_arnold_press_ii', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_front_raise', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_shoulder_rear_delt_shelf',
    title: 'Rear Delt & 3D Upper Shelf Protocol',
    subtitle: 'Posterior deltoid hypertrophy, face pulls & reverse flye sculpting',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Shoulders',
    isPro: false,
    badge: 'SHOULDER SHAPE',
    thumbnail_url: '/assets/shoulder_muscle_3.jpg',
    description: 'Eliminates flat-looking shoulders from the side profile by prioritizing the posterior deltoids, external rotators, and lateral delt tie-ins.',
    routines: [
      {
        dayName: 'Day 1: Posterior Delt & Scapular Plane Focus',
        focus: 'Posterior Deltoids, Side Delts',
        exercises: [
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 5, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_rear_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 }
        ]
      },
      {
        dayName: 'Day 2: Side & Rear Deltoid Density',
        focus: '3D Shoulder Roundness',
        exercises: [
          { exerciseId: 'cable_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_lying_rear_delt_row', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'band_face_pull', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 }
        ]
      }
    ]
  },
  {
    id: 'muscle_shoulder_3head_capping',
    title: 'Complete 3-Head Deltoid Capping System',
    subtitle: 'Balanced anterior, medial & posterior shoulder volume specialization',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Shoulders',
    isPro: false,
    badge: 'SHOULDER SHAPE',
    thumbnail_url: '/assets/shoulder_muscle_4.jpg',
    description: 'High-volume specialization hitting all three deltoid heads across compound vertical presses, lengthened cable raises, and rear delt isolation.',
    routines: [
      {
        dayName: 'Day 1: Complete 3-Head Deltoid Blast',
        focus: 'Front, Side & Rear Deltoids',
        exercises: [
          { exerciseId: 'dumbbell_seated_shoulder_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_lateral_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_kneeling_rear_delt_row_(with_rope)_(male)', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Metabolic Deltoid Capping Finisher',
        focus: 'Medial & Posterior Cap Striations',
        exercises: [
          { exerciseId: 'barbell_seated_overhead_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_arnold_press_ii', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_rear_lateral_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 4. BICEPS (4 Specialized Programs — ONLY Biceps Exercises)
  // ==========================================
  {
    id: 'muscle_bicep_peak_long_head',
    title: 'Biceps Peak & Long Head Stretch Protocol',
    subtitle: 'Behind-torso incline curls & strict supination for tall bicep peaks',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Biceps',
    isPro: false,
    badge: 'BICEPS SHAPE',
    thumbnail_url: '/assets/biceps_muscle_1.jpg',
    description: 'Targets the outer long head of the biceps brachii by placing the shoulder in extension (incline dumbbell curls) to build a taller, sharper bicep peak.',
    routines: [
      {
        dayName: 'Day 1: Long Head Stretch & Peak Overload',
        focus: 'Biceps Long Head, Supination Peak',
        exercises: [
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_concentration_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Supinated Peak Contraction Session',
        focus: 'Biceps Brachii Peak & Fullness',
        exercises: [
          { exerciseId: 'dumbbell_alternate_biceps_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_preacher_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_bicep_brachialis_width',
    title: 'Brachialis & Thick Arm Width Builder',
    subtitle: 'Incline hammer curls, neutral-grip loading & lower-bicep thickness',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Biceps',
    isPro: false,
    badge: 'BICEPS SHAPE',
    thumbnail_url: '/assets/biceps_muscle_2.jpg',
    description: 'Hypertrophies the underlying brachialis and outer biceps bellies to push the biceps outward and widen the arm from the front view.',
    routines: [
      {
        dayName: 'Day 1: Brachialis & Heavy Hammer Overload',
        focus: 'Brachialis, Biceps Short & Long Head',
        exercises: [
          { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_hammer_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_preacher_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Thick-Arm Flexion & Cable Tension',
        focus: 'Outer Arm Thickness & Elbow Flexors',
        exercises: [
          { exerciseId: 'ez_barbell_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_curl', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_bicep_preacher_short_head',
    title: 'Preacher & Spider Short-Head Overload',
    subtitle: 'Strict pad-supported curls for thick inner-bicep bellies',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Biceps',
    isPro: false,
    badge: 'BICEPS SHAPE',
    thumbnail_url: '/assets/biceps_muscle_3.jpg',
    description: 'Eliminates shoulder momentum by placing arms in front of the torso on a preacher pad to isolate the inner short head for dense front-double-bicep fullness.',
    routines: [
      {
        dayName: 'Day 1: Preacher Pad & Inner Short Head',
        focus: 'Biceps Short Head, Distal Bicep Tie-In',
        exercises: [
          { exerciseId: 'barbell_preacher_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'dumbbell_preacher_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'ez_barbell_spider_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_concentration_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Strict Isolation & Constant Cable Curl',
        focus: 'Zero-Momentum Bicep Hypertrophy',
        exercises: [
          { exerciseId: 'cable_preacher_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_alternate_biceps_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_bicep_high_freq_pump',
    title: 'High-Frequency Biceps Pump & Mass System',
    subtitle: '3x/week multi-angle flexion (stretched, mid-range & shortened)',
    level: 'Advanced Pro',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Biceps',
    isPro: false,
    badge: 'BICEPS SHAPE',
    thumbnail_url: '/assets/biceps_muscle_4.jpg',
    description: 'Hits the biceps across all three strength curves—lengthened (incline), mid-range (standing barbell), and shortened (preacher/concentration)—for maximum arm growth.',
    routines: [
      {
        dayName: 'Day 1: 3-Angle Bicep Strength Curve',
        focus: 'Full Biceps Brachii & Brachialis',
        exercises: [
          { exerciseId: 'barbell_curl', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_incline_biceps_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_preacher_curl', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_curl', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Metabolic Fascia Pump Session',
        focus: 'Bicep Cellular Swelling & Peak',
        exercises: [
          { exerciseId: 'dumbbell_alternate_biceps_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_incline_hammer_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_concentration_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 5. TRICEPS (4 Specialized Programs — ONLY Triceps Exercises)
  // ==========================================
  {
    id: 'muscle_tricep_horseshoe_lateral',
    title: 'Horseshoe Lateral Head & Pushdown Protocol',
    subtitle: 'Heavy rope/single-arm pushdowns & close-grip lockout specialization',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Triceps',
    isPro: false,
    badge: 'TRICEPS SHAPE',
    thumbnail_url: '/assets/triceps_muscle_1.jpg',
    description: 'Sculpts the outer lateral head ("horseshoe") of the triceps through heavy cable pushdowns, close-grip presses, and strict lockout contractions.',
    routines: [
      {
        dayName: 'Day 1: Lateral Horseshoe & Heavy Pushdown',
        focus: 'Triceps Lateral & Medial Heads',
        exercises: [
          { exerciseId: 'barbell_close_grip_bench_press', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_one_arm_tricep_pushdown', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'triceps_dip', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lockout Striations & Extension Volume',
        focus: 'Outer Tricep Sweep',
        exercises: [
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_kickback', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_tricep_long_head_overhead',
    title: 'Overhead Long Head Mass Specialization',
    subtitle: 'Lengthened overhead extensions & skull crushers for 2/3 arm size',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Triceps',
    isPro: false,
    badge: 'TRICEPS SHAPE',
    thumbnail_url: '/assets/triceps_muscle_2.jpg',
    description: 'The long head makes up the majority of triceps mass and only reaches full stretch when the arms are elevated overhead. Prioritizes skull crushers and overhead extensions.',
    routines: [
      {
        dayName: 'Day 1: Overhead Stretch & Skull Crusher Mass',
        focus: 'Triceps Long Head Hypertrophy',
        exercises: [
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_high_pulley_overhead_tricep_extension', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_seated_triceps_extension', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Long-Head Eccentric & Close-Grip Press',
        focus: 'Posterior Arm Thickness',
        exercises: [
          { exerciseId: 'barbell_close_grip_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'cable_overhead_triceps_extension_(rope_attachment)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_one_arm_tricep_pushdown', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_tricep_heavy_dip_lockout',
    title: 'Heavy Dip & Close-Grip Triceps Power',
    subtitle: 'Compound multi-joint pressing for dense triceps & lockout strength',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Triceps',
    isPro: false,
    badge: 'TRICEPS SHAPE',
    thumbnail_url: '/assets/triceps_muscle_3.jpg',
    description: 'Uses heavy close-grip bench presses and upright triceps dips to overload all three heads with maximal mechanical tension.',
    routines: [
      {
        dayName: 'Day 1: Heavy Close-Grip Bench & Dips',
        focus: 'Compound Triceps Power & Mass',
        exercises: [
          { exerciseId: 'barbell_close_grip_bench_press', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'triceps_dip', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Heavy Skull Crusher & Cable Pressdown',
        focus: 'Lockout Force & Medial Head',
        exercises: [
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'cable_one_arm_tricep_pushdown', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_high_pulley_overhead_tricep_extension', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_tricep_3head_sleeve_buster',
    title: '3-Head Complete Triceps Sleeve Buster',
    subtitle: 'High-volume long, lateral & medial head arm specialization',
    level: 'Advanced Pro',
    daysPerWeek: 4,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Triceps',
    isPro: false,
    badge: 'TRICEPS SHAPE',
    thumbnail_url: '/assets/triceps_muscle_4.jpg',
    description: 'Complete 3-head triceps blueprint combining compound pressing, overhead long-head stretch, and rope pushdown peak contractions.',
    routines: [
      {
        dayName: 'Day 1: Complete 3-Head Triceps Blast',
        focus: 'Long, Lateral & Medial Triceps Heads',
        exercises: [
          { exerciseId: 'barbell_close_grip_bench_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_lying_triceps_extension_skull_crusher', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_high_pulley_overhead_tricep_extension', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_pushdown_(with_rope_attachment)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: High-Rep Pump & Horseshoe Finisher',
        focus: 'Triceps Separation & Detail',
        exercises: [
          { exerciseId: 'triceps_dip', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'cable_one_arm_tricep_pushdown', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_seated_triceps_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 6. QUADS (4 Specialized Programs — ONLY Quads Exercises)
  // ==========================================
  {
    id: 'muscle_quads_outer_sweep',
    title: 'Quad Sweep & Outer Vastus Specialization',
    subtitle: 'High-bar squats, deep hack squats & narrow-stance leg press',
    level: 'Intermediate',
    daysPerWeek: 2,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Quads',
    isPro: false,
    badge: 'QUADS SHAPE',
    thumbnail_url: '/assets/quads_muscle_1.jpg',
    description: 'Targets the vastus lateralis (outer quad sweep) with deep knee-flexion squats, narrow-stance hack squats, and high-tension leg extensions.',
    routines: [
      {
        dayName: 'Day 1: Deep Squat & Hack Squat Sweep',
        focus: 'Vastus Lateralis, Rectus Femoris',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Front Squat & Unilateral Quad Volume',
        focus: 'Outer Quad Flare & Knee Flexion',
        exercises: [
          { exerciseId: 'barbell_front_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_walking_lunges', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_quads_teardrop_vmo',
    title: 'Teardrop VMO & Deep Knee Flexion Plan',
    subtitle: 'Pre-exhaust leg extensions, split squats & low-foot leg press',
    level: 'Intermediate',
    daysPerWeek: 2,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Quads',
    isPro: false,
    badge: 'QUADS SHAPE',
    thumbnail_url: '/assets/quads_muscle_2.jpg',
    description: 'Maximizes knee travel over the toes to thicken the vastus medialis (teardrop above the knee) and rectus femoris.',
    routines: [
      {
        dayName: 'Day 1: Pre-Exhaust Extension & Deep Hack Squat',
        focus: 'Vastus Medialis (VMO) & Rectus Femoris',
        exercises: [
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'bulgarian_split_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Unilateral Split Squat & Quad Burnout',
        focus: 'Teardrop Definition & Balance',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_lunge', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_quads_heavy_squat_mass',
    title: 'Heavy Squat & Leg Press Mass Builder',
    subtitle: 'Progressive overload compound lower-body quad powerhouse',
    level: 'Intermediate',
    daysPerWeek: 2,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Quads',
    isPro: false,
    badge: 'QUADS SHAPE',
    thumbnail_url: '/assets/quads_muscle_3.jpg',
    description: 'Built around heavy barbell back squats and 45-degree leg presses for raw anterior thigh mass and lower-body strength.',
    routines: [
      {
        dayName: 'Day 1: Heavy Barbell Squat & Leg Press',
        focus: 'Overall Quadriceps Mass & Force',
        exercises: [
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 5, targetReps: '5', targetRpe: 8.5 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Volume Squat & Machine Hypertrophy',
        focus: 'Quad Hypertrophy & Work Capacity',
        exercises: [
          { exerciseId: 'barbell_front_squat', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_quads_mechanical_dropset',
    title: 'Pre-Exhaust & Mechanical Drop-Set Quads',
    subtitle: 'High-intensity machine & free-weight quad hypertrophy',
    level: 'Advanced Pro',
    daysPerWeek: 2,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Quads',
    isPro: false,
    badge: 'QUADS SHAPE',
    thumbnail_url: '/assets/quads_muscle_4.jpg',
    description: 'Combines isolated rectus femoris contractions with deep stretched squats and high-rep leg press finishers for relentless quad tension.',
    routines: [
      {
        dayName: 'Day 1: High-Intensity Quad Overload',
        focus: 'All 4 Quadriceps Heads',
        exercises: [
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_full_squat_(back_pov)', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'sled_45_degrees_leg_press', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Constant-Tension Quad Sculpting',
        focus: 'Quad Separation & Sweep',
        exercises: [
          { exerciseId: 'sled_hack_squat', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_goblet_squat', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_leg_extension', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 7. HAMSTRINGS (4 Specialized Programs — ONLY Hamstrings Exercises)
  // ==========================================
  {
    id: 'muscle_hamstring_rdl_stretch',
    title: 'Lengthened RDL & Hip-Hinge Hamstrings',
    subtitle: 'Barbell & dumbbell Romanian deadlift stretch-mediated hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 2,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Hamstrings',
    isPro: false,
    badge: 'HAMSTRINGS SHAPE',
    thumbnail_url: '/assets/hamstrings_muscle_1.jpg',
    description: 'Overloads the hamstrings in their fully lengthened hip-hinged position using barbell RDLs, straight-leg deadlifts, and seated leg curls.',
    routines: [
      {
        dayName: 'Day 1: Heavy RDL & Lengthened Hamstrings',
        focus: 'Biceps Femoris, Semitendinosus, Semimembranosus',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'lever_seated_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Hip Hinge & Eccentric Curl Session',
        focus: 'Posterior Thigh Sweep & Tie-In',
        exercises: [
          { exerciseId: 'barbell_straight_leg_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_seated_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_hamstring_seated_lying_curl',
    title: 'Seated & Lying Leg Curl Flexion Split',
    subtitle: 'Dual-angle knee flexion for upper & lower hamstring bellies',
    level: 'Intermediate',
    daysPerWeek: 2,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Hamstrings',
    isPro: false,
    badge: 'HAMSTRINGS SHAPE',
    thumbnail_url: '/assets/hamstrings_muscle_2.jpg',
    description: 'Combines seated leg curls (hip flexed for superior stretch) with lying leg curls (hip extended) and RDLs for complete hamstring development.',
    routines: [
      {
        dayName: 'Day 1: Seated Curl First & RDL Combo',
        focus: 'Lengthened & Shortened Knee Flexion',
        exercises: [
          { exerciseId: 'lever_seated_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Lying Curl Overload & Unilateral Hinge',
        focus: 'Distal Hamstring Thickness',
        exercises: [
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'lever_seated_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_hamstring_posterior_tie_in',
    title: 'Posterior Tie-In & Sprint-Strength Hams',
    subtitle: 'Explosive hip extension & controlled 3-second eccentric curls',
    level: 'Intermediate',
    daysPerWeek: 2,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Hamstrings',
    isPro: false,
    badge: 'HAMSTRINGS SHAPE',
    thumbnail_url: '/assets/hamstrings_muscle_3.jpg',
    description: 'Strengthens the glute-hamstring tie-in and eccentric knee-flexion power for athletic speed and deep side-profile leg thickness.',
    routines: [
      {
        dayName: 'Day 1: Heavy Hinge & Eccentric Hamstrings',
        focus: 'Glute-Hamstring Tie-In & Power',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_good_morning', defaultSets: 3, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_seated_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: High-Tension Hamstring Volume',
        focus: 'Hamstring Belly Fullness',
        exercises: [
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'glute_ham_raise_(version_2)', defaultSets: 3, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_hamstring_biceps_femoris_mass',
    title: 'Complete Biceps Femoris Mass Protocol',
    subtitle: 'High-volume hip extension + knee flexion specialization',
    level: 'Advanced Pro',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Hamstrings',
    isPro: false,
    badge: 'HAMSTRINGS SHAPE',
    thumbnail_url: '/assets/hamstrings_muscle_4.jpg',
    description: 'Trains both biomechanical functions of the hamstrings—hip extension and knee flexion—across focused weekly sessions.',
    routines: [
      {
        dayName: 'Day 1: Dual-Function Hamstring Blast',
        focus: 'Biceps Femoris Long & Short Heads',
        exercises: [
          { exerciseId: 'barbell_romanian_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_seated_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'dumbbell_romanian_deadlift', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Strict Isolation & Stretch Finisher',
        focus: 'Hamstring Sweep & Hang',
        exercises: [
          { exerciseId: 'lever_seated_leg_curl', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_stiff_leg_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_lying_leg_curl', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 8. GLUTES (4 Specialized Programs — ONLY Glutes Exercises)
  // ==========================================
  {
    id: 'muscle_glutes_heavy_hip_thrust',
    title: 'Heavy Hip Thrust & Glute Max Shelf',
    subtitle: 'Barbell hip thrusts, paused bridges & pull-through overload',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Glutes',
    isPro: false,
    badge: 'GLUTES SHAPE',
    thumbnail_url: '/assets/glutes_muscle_1.jpg',
    description: 'Maximizes horizontal hip-extension torque at peak contraction with heavy barbell hip thrusts, glute bridges, and cable pull-throughs.',
    routines: [
      {
        dayName: 'Day 1: Heavy Barbell Hip Thrust & Hinge',
        focus: 'Gluteus Maximus Upper & Lower Fibers',
        exercises: [
          { exerciseId: 'barbell_hip_thrust', defaultSets: 5, targetReps: '6-8', targetRpe: 8.5 },
          { exerciseId: 'barbell_stiff_legged_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_single_leg_glute_bridge', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_pull_through', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Glute Bridge Volume & Hip Extension',
        focus: 'Peak Glute Contraction & Projection',
        exercises: [
          { exerciseId: 'barbell_glute_bridge_(hands_on_bar)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_hip_thrust', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_standing_hip_extension_(version_2)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_glutes_3d_upper_shelf',
    title: '3D Upper Glute & Medius Sculpting',
    subtitle: 'Hip thrusts, seated hip abduction & cable kickback shaping',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Aesthetic V-Taper',
    category: 'strength_power',
    targetMuscleGroup: 'Glutes',
    isPro: false,
    badge: 'GLUTES SHAPE',
    thumbnail_url: '/assets/glutes_muscle_2.jpg',
    description: 'Targets the gluteus medius and upper glute shelf using seated hip abduction, cable hip abduction, and standing hip extensions.',
    routines: [
      {
        dayName: 'Day 1: Upper Glute Shelf & Medius Focus',
        focus: 'Gluteus Medius, Upper Gluteus Maximus',
        exercises: [
          { exerciseId: 'barbell_hip_thrust', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_seated_hip_abduction', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_standing_hip_extension_(version_2)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_hip_abduction_(version_2)', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Abduction & Lengthened Glute Stretch',
        focus: 'Outer Hip Curve & Upper Shelf',
        exercises: [
          { exerciseId: 'barbell_sumo_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'lever_seated_hip_abduction', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'cable_pull_through', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_glutes_strong_curves',
    title: 'Strong Curves Glute Hypertrophy System',
    subtitle: '3x/week thrust, bridge, hinge & abduction blueprint',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Glutes',
    isPro: false,
    badge: 'GLUTES SHAPE',
    thumbnail_url: '/assets/glutes_muscle_3.jpg',
    description: 'Built on the 4-vector glute training model: combining horizontal thrusts, glute bridges, hip hinges, and lateral abduction in every session.',
    routines: [
      {
        dayName: 'Day 1: 4-Vector Glute Hypertrophy A',
        focus: 'Complete Glute Max, Medius & Minimus',
        exercises: [
          { exerciseId: 'barbell_hip_thrust', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'barbell_sumo_deadlift', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_glute_bridge', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_seated_hip_abduction', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: 4-Vector Glute Hypertrophy B',
        focus: 'Glute Shape, Lift & Density',
        exercises: [
          { exerciseId: 'barbell_glute_bridge_(hands_on_bar)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_stiff_legged_deadlift', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'cable_pull_through', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_standing_hip_extension_(version_2)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_glutes_unilateral_sculpt',
    title: 'Unilateral Glute & Posterior Tie-In Plan',
    subtitle: 'Single-leg hip thrusts, bridges & hip extension symmetry',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Glutes',
    isPro: false,
    badge: 'GLUTES SHAPE',
    thumbnail_url: '/assets/glutes_muscle_4.jpg',
    description: 'Eliminates left-to-right asymmetries and carves the lower glute tie-in with single-leg hip thrusts, unilateral bridges, and standing kickbacks.',
    routines: [
      {
        dayName: 'Day 1: Unilateral Hip Thrust & Bridge',
        focus: 'Glute Symmetry & Lower Tie-In',
        exercises: [
          { exerciseId: 'barbell_one_leg_hip_thrust', defaultSets: 4, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'barbell_hip_thrust', defaultSets: 4, targetReps: '8-10', targetRpe: 8.5 },
          { exerciseId: 'dumbbell_single_leg_glute_bridge', defaultSets: 3, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_standing_hip_extension', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Hinge & Single-Leg Glute Drive',
        focus: 'Glute Max & Lateral Abduction',
        exercises: [
          { exerciseId: 'barbell_stiff_legged_deadlift', defaultSets: 4, targetReps: '10-12', targetRpe: 8.5 },
          { exerciseId: 'lever_standing_rear_kick', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_seated_hip_abduction', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 9. ABS & CORE (4 Specialized Programs — ONLY Abs & Core Exercises)
  // ==========================================
  {
    id: 'muscle_abs_weighted_6pack',
    title: '6-Pack Weighted Cable & Leg Raise Split',
    subtitle: 'Progressive overload spinal flexion for deep abdominal blocks',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Abs & Core',
    isPro: false,
    badge: 'ABS SHAPE',
    thumbnail_url: '/assets/abs_muscle_1.jpg',
    description: 'Trains the rectus abdominis like any other hypertrophy muscle group using weighted crunches, seated machine crunches, and strict hanging leg raises.',
    routines: [
      {
        dayName: 'Day 1: Weighted Upper & Lower Ab Hypertrophy',
        focus: 'Upper & Lower Rectus Abdominis',
        exercises: [
          { exerciseId: 'lever_seated_crunch_(chest_pad)', defaultSets: 4, targetReps: '10-15', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '10-15', targetRpe: 9 },
          { exerciseId: 'incline_twisting_sit_up_(version_2)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'weighted_decline_sit_up', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Pelvic Tilt & Abdominal Density',
        focus: 'Lower Ab Sweep & Midsection Depth',
        exercises: [
          { exerciseId: 'cable_tuck_reverse_crunch', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_decline_overhead_sit_up', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_rollout', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_abs_vcut_obliques',
    title: 'V-Cut Obliques & Rotational Core Plan',
    subtitle: 'Hanging leg raises, cable twists & serratus/oblique sculpting',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Lean Cut & Muscle Definition',
    category: 'weight_loss',
    targetMuscleGroup: 'Abs & Core',
    isPro: false,
    badge: 'ABS SHAPE',
    thumbnail_url: '/assets/abs_muscle_2.jpg',
    description: 'Carves the external/internal obliques, serratus anterior, and lower iliac V-cut with rotational cable work and hanging leg raises.',
    routines: [
      {
        dayName: 'Day 1: V-Cut Lower Abs & Obliques',
        focus: 'External Obliques, Lower Rectus Abdominis',
        exercises: [
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_twist_(down_up)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'weighted_standing_twist', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: '45_degree_bycicle_twisting_crunch', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Rotational Core & Serratus Detail',
        focus: 'Oblique Taper & Midsection Tightness',
        exercises: [
          { exerciseId: 'incline_twisting_sit_up_(version_2)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_standing_lift', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'weighted_twisting_crunch_(on_bench)', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_abs_athletic_trunk',
    title: 'Athletic Trunk Stability & Anti-Rotation',
    subtitle: 'Barbell rollouts, heavy bracing & functional core armor',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Abs & Core',
    isPro: false,
    badge: 'ABS SHAPE',
    thumbnail_url: '/assets/abs_core_exercise_3.jpg',
    description: 'Builds bulletproof intra-abdominal bracing strength alongside rock-solid transverse and rectus abdominis walls.',
    routines: [
      {
        dayName: 'Day 1: Anti-Extension & Heavy Core Armor',
        focus: 'Transverse Abdominis, Rectus Abdominis',
        exercises: [
          { exerciseId: 'barbell_rollout', defaultSets: 4, targetReps: '8-12', targetRpe: 9 },
          { exerciseId: 'lever_seated_crunch_(chest_pad)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'front_plank_with_leg_lift_(male)', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Rotational Power & Trunk Stiffness',
        focus: 'Obliques & Core Bracing',
        exercises: [
          { exerciseId: 'cable_twist_(down_up)', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_lying_leg_raise_bent_knee', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_seated_twist', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_abs_shredded_circuit',
    title: 'Shredded Midsection High-Density Circuit',
    subtitle: '4x/week upper abs, lower abs & oblique metabolic conditioning',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    category: 'weight_loss',
    targetMuscleGroup: 'Abs & Core',
    isPro: false,
    badge: 'ABS SHAPE',
    thumbnail_url: '/assets/abs_muscle_4.jpg',
    description: 'High-density top-to-bottom abdominal circuit hitting lower abs first (when fatigue is lowest), followed by obliques and weighted upper-ab flexion.',
    routines: [
      {
        dayName: 'Day 1: Lower-First Complete Ab Circuit',
        focus: 'Lower Abs, Obliques, Upper Abs',
        exercises: [
          { exerciseId: 'hanging_straight_leg_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'cable_tuck_reverse_crunch', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'incline_twisting_sit_up_(version_2)', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'barbell_rollout', defaultSets: 3, targetReps: '10-12', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Midsection Striation & Tightener',
        focus: 'Full 6-Pack & Taper Control',
        exercises: [
          { exerciseId: 'criss_cross_leg_raises', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'cable_twist_(down_up)', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'lever_seated_crunch_(chest_pad)', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 10. CALVES (4 Specialized Programs — ONLY Calves Exercises)
  // ==========================================
  {
    id: 'muscle_calves_diamond_gastroc',
    title: 'Diamond Gastrocnemius Standing Overload',
    subtitle: 'Heavy straight-leg standing & leg-press calf raises with 2s pause',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Calves',
    isPro: false,
    badge: 'CALVES SHAPE',
    thumbnail_url: '/assets/calves_muscle_1.jpg',
    description: 'Targets the medial and lateral heads of the gastrocnemius with straight-knee standing calf raises and a strict 2-second bottom stretch pause to eliminate Achilles bounce.',
    routines: [
      {
        dayName: 'Day 1: Heavy Straight-Leg Gastrocnemius',
        focus: 'Gastrocnemius Medial & Lateral Heads',
        exercises: [
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 5, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'sled_45_calf_press', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_seated_calf_raise_(plate_loaded)_(version_2)', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Stretch-Pause Diamond Calf Session',
        focus: 'Upper Calf Peak & Stretch Hypertrophy',
        exercises: [
          { exerciseId: 'dumbbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'donkey_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'lever_seated_calf_raise_(plate_loaded)_(version_2)', defaultSets: 4, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_calves_soleus_seated',
    title: 'Soleus Width & Seated Calf Specialization',
    subtitle: 'Bent-knee seated calf raises & high-time-under-tension lower leg width',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Calves',
    isPro: false,
    badge: 'CALVES SHAPE',
    thumbnail_url: '/assets/calves_muscle_2.jpg',
    description: 'Focuses on the slow-twitch soleus muscle underneath the gastrocnemius using bent-knee seated calf raises in the 15-20 rep bracket to widen the entire lower leg.',
    routines: [
      {
        dayName: 'Day 1: Soleus Bent-Knee Width Overload',
        focus: 'Soleus & Lower Leg Thickness',
        exercises: [
          { exerciseId: 'lever_seated_calf_raise_(plate_loaded)_(version_2)', defaultSets: 5, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'barbell_seated_calf_raise', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: High-Rep Soleus & Gastroc Combo',
        focus: 'Endurance Fiber Hypertrophy',
        exercises: [
          { exerciseId: 'dumbbell_seated_calf_raise', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'sled_45_calf_press', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_single_leg_calf_raise', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_calves_high_freq_4day',
    title: 'High-Frequency 4-Day Lower Leg Builder',
    subtitle: '4x/week alternating heavy load & metabolic stretch calf training',
    level: 'Intermediate',
    daysPerWeek: 4,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Calves',
    isPro: false,
    badge: 'CALVES SHAPE',
    thumbnail_url: '/assets/calves_muscle_3.jpg',
    description: 'Calves recover rapidly due to high capillary density. This 4x/week protocol alternates heavy 8-10 rep standing loads with high-rep 15-20 seated stretch sessions.',
    routines: [
      {
        dayName: 'Day 1: Heavy Load Standing Calf Day',
        focus: 'Fast-Twitch Gastrocnemius Fibers',
        exercises: [
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 5, targetReps: '8-10', targetRpe: 9 },
          { exerciseId: 'sled_45_calf_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_rotary_calf', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Metabolic Seated & Unilateral Calf Day',
        focus: 'Slow-Twitch Soleus & Deep Stretch',
        exercises: [
          { exerciseId: 'lever_seated_calf_raise_(plate_loaded)_(version_2)', defaultSets: 5, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_standing_calf_raise', defaultSets: 4, targetReps: '15', targetRpe: 9 },
          { exerciseId: 'donkey_calf_raise', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_calves_complete_lower_leg',
    title: 'Complete Lower Leg & Ankle Power Plan',
    subtitle: 'Combined standing gastroc, seated soleus & unilateral calf mastery',
    level: 'Advanced Pro',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Calves',
    isPro: false,
    badge: 'CALVES SHAPE',
    thumbnail_url: '/assets/calves_muscle_4.jpg',
    description: 'Comprehensive lower-leg specialization combining straight-leg presses, bent-knee soleus work, and single-leg standing calf raises.',
    routines: [
      {
        dayName: 'Day 1: Complete 3-Angle Calf Hypertrophy',
        focus: 'Gastrocnemius, Soleus & Ankle Stability',
        exercises: [
          { exerciseId: 'barbell_standing_calf_raise', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'lever_seated_calf_raise_(plate_loaded)_(version_2)', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'sled_45_calf_press', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_single_leg_calf_raise', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Heavy Calf Press & Burnout',
        focus: 'Lower Leg Mass & Separation',
        exercises: [
          { exerciseId: 'lever_seated_calf_press', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_seated_calf_raise', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'barbell_standing_leg_calf_raise', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },

  // ==========================================
  // 11. FOREARMS (4 Specialized Programs — ONLY Forearms Exercises)
  // ==========================================
  {
    id: 'muscle_forearms_brachioradialis',
    title: 'Extensor & Upper Forearm Ridge Builder',
    subtitle: 'Reverse barbell wrist curls, bench extensors & wrist roller sweep',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Forearms',
    isPro: false,
    badge: 'FOREARMS SHAPE',
    thumbnail_url: '/assets/forearms_muscle_1.jpg',
    description: 'Targets the upper forearm extensor ridge and grip endurance using pronated barbell reverse wrist curls, bench wrist extensions, and wrist rollers.',
    routines: [
      {
        dayName: 'Day 1: Upper Forearm Extensor & Roller Mass',
        focus: 'Wrist Extensors, Upper Forearm Ridge',
        exercises: [
          { exerciseId: 'barbell_revers_wrist_curl_ii', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'dumbbell_over_bench_revers_wrist_curl', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'wrist_roller', defaultSets: 3, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_wrist_curl_(version_2)', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Pronated & Unilateral Extensor Overload',
        focus: 'Upper Forearm Thickness & Control',
        exercises: [
          { exerciseId: 'dumbbell_one_arm_revers_wrist_curl', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_palms_down_wrist_curl_over_a_bench', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'band_reverse_wrist_curl', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_forearms_wrist_flexor_mass',
    title: 'Wrist Flexor & Extensor Bowling-Pin Mass',
    subtitle: 'Seated palms-up & palms-down wrist curls for lower-arm size',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Forearms',
    isPro: false,
    badge: 'FOREARMS SHAPE',
    thumbnail_url: '/assets/forearms_muscle_2.jpg',
    description: 'Isolates the inner wrist flexors (letting the bar roll to the fingertips before curling) and outer wrist extensors for dense, bowling-pin forearms.',
    routines: [
      {
        dayName: 'Day 1: Flexor & Extensor Antagonist Superset',
        focus: 'Flexor Carpi Radialis, Extensor Digitorum',
        exercises: [
          { exerciseId: 'barbell_wrist_curl_(version_2)', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'barbell_palms_down_wrist_curl_over_a_bench', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_one_arm_wrist_curl', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'cable_wrist_curl', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: High-Rep Forearm Belly Pump',
        focus: 'Inner Forearm Belly & Vascularity',
        exercises: [
          { exerciseId: 'barbell_standing_back_wrist_curl', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_over_bench_wrist_curl', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_one_arm_revers_wrist_curl', defaultSets: 3, targetReps: '15-20', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_forearms_crushing_grip',
    title: 'Crushing Grip & Heavy Forearm Protocol',
    subtitle: 'Behind-the-back wrist curls, farmers carries & grip armor',
    level: 'Intermediate',
    daysPerWeek: 3,
    goal: 'Strength & Size (Powerbuilding)',
    category: 'strength_power',
    targetMuscleGroup: 'Forearms',
    isPro: false,
    badge: 'FOREARMS SHAPE',
    thumbnail_url: '/assets/forearms_muscle_3.jpg',
    description: 'Eliminates grip failure on heavy deadlifts and rows by strengthening finger flexors, loaded carries, and wrist stability under heavy loads.',
    routines: [
      {
        dayName: 'Day 1: Heavy Behind-Back Wrist Curl & Carries',
        focus: 'Crushing Grip & Finger Flexors',
        exercises: [
          { exerciseId: 'barbell_standing_back_wrist_curl', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'kettlebell_farmers_carry', defaultSets: 4, targetReps: '10-12', targetRpe: 9 },
          { exerciseId: 'barbell_wrist_curl_(version_2)', defaultSets: 4, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: Cable Flexion & Extensor Balance',
        focus: 'Wrist Stability & Tendon Strength',
        exercises: [
          { exerciseId: 'cable_wrist_curl', defaultSets: 4, targetReps: '12-15', targetRpe: 9 },
          { exerciseId: 'barbell_palms_down_wrist_curl_over_a_bench', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_one_arm_wrist_curl', defaultSets: 3, targetReps: '15', targetRpe: 9 }
        ]
      }
    ]
  },
  {
    id: 'muscle_forearms_complete_size',
    title: 'Complete Lower Arm Vascularity & Size',
    subtitle: '3x/week 360° flexor, extensor & wrist roller specialization',
    level: 'Advanced Pro',
    daysPerWeek: 3,
    goal: 'Hypertrophy (Pure Muscle Mass)',
    category: 'strength_power',
    targetMuscleGroup: 'Forearms',
    isPro: false,
    badge: 'FOREARMS SHAPE',
    thumbnail_url: '/assets/forearms_muscle_4.jpg',
    description: 'Trains all anatomical compartments of the forearm—wrist flexors, wrist extensors, and grip endurance—for balanced lower-arm mass.',
    routines: [
      {
        dayName: 'Day 1: Complete 3-Compartment Forearm Blast',
        focus: 'Wrist Flexors, Extensors & Carries',
        exercises: [
          { exerciseId: 'barbell_wrist_curl_(version_2)', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'barbell_revers_wrist_curl_ii', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'cable_wrist_curl', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'wrist_roller', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      },
      {
        dayName: 'Day 2: High-Volume Forearm Sculptor',
        focus: 'Forearm Density & Grip Endurance',
        exercises: [
          { exerciseId: 'barbell_standing_back_wrist_curl', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_over_bench_wrist_curl', defaultSets: 4, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'dumbbell_over_bench_revers_wrist_curl', defaultSets: 3, targetReps: '15-20', targetRpe: 9 },
          { exerciseId: 'kettlebell_farmers_carry', defaultSets: 3, targetReps: '12-15', targetRpe: 9 }
        ]
      }
    ]
  }
];

export const MUSCLE_SHAPE_PLANS: WorkoutPlan[] = RAW_MUSCLE_SHAPE_PLANS.map(groundWorkoutPlan);
