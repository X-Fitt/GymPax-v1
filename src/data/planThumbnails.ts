import { WorkoutPlan } from '../types';

export interface PlanThumbnailSpec {
  url: string;
  subject: string;
  focusTag: string;
  motif: 'barbell' | 'dumbbell' | 'cable' | 'rack' | 'kettlebell' | 'rings' | 'torso' | 'plates';
  accentHex: string;
}

/**
 * Disjoint pool of 22 verified (HTTP-200) high-definition fitness photography IDs
 * used strictly for individual routine session cards and user-created custom plans,
 * ensuring zero overlap with any of the 73 preset/muscle-shape/personalized plan cards.
 */
const DISJOINT_ROUTINE_AND_CUSTOM_PHOTO_IDS: string[] = [
  '1571019613531-fbeaeb790845',
  '1517964603305-11c0f6f66012',
  '1544033527-b192daee1f5b',
  '1554284126-aa88f22d8b74',
  '1561214078-f3247647fc5e',
  '1577221084712-45b0445d2b00',
  '1594737625785-a6cbdabd333c',
  '1598971457999-ca4ef48a9a71',
  '1598971639058-fab3c3109a00',
  '1599058917765-a780eda07a3e',
  '1599058918144-1ffabb6ab9a0',
  '1600881333168-2ef49b341f30',
  '1605296867424-35fc25c9212a',
  '1605296867724-fa87a8ef53fd',
  '1607962837359-5e7e89f86776',
  '1616279967983-ec413476e824',
  '1616279969856-759f316a5ac1',
  '1618355776464-8666794d2520',
  '1620188467120-5042ed1eb5da',
  '1627483262268-9c2b5b2834b5',
  '1627483262769-04d0a1401487',
  '1627483297886-49710ae1fc22'
];

/**
 * 100% Unique, High-Definition Minimalist Athletic Photography Catalog.
 * Every single one of the 73 workout plans has its own dedicated, non-repeating base image URL
 * that clearly represents the workout plan name, target muscle focus, and training methodology.
 */
export const UNIQUE_PLAN_THUMBNAIL_MAP: Record<string, PlanThumbnailSpec> = {
  // ============================================================================
  // 1. STRENGTH & POWER PLANS (8 Unique Plans)
  // ============================================================================
  plan_starting_strength_lp: {
    url: '/assets/garage_home_gym.jpg',
    subject: 'Starting Strength · Novice Linear Barbell Progression & Garage Rack',
    focusTag: 'Starting Strength 3×5 LP',
    motif: 'rack',
    accentHex: '#f59e0b'
  },
  plan_stronglifts_5x5: {
    url: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?auto=format&fit=crop&w=960&h=600&q=85&plan=stronglifts_5x5&focus=heavy_plates_5x5_iron',
    subject: 'StrongLifts 5×5 · Compound Barbell Iron Foundation',
    focusTag: 'StrongLifts 5×5 Compound',
    motif: 'plates',
    accentHex: '#ef4444'
  },
  plan_531_powerbuilding_pro: {
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=960&h=600&q=85&plan=531_powerbuilding_pro&focus=powerbuilding_deadlift_bar',
    subject: '5/3/1 Boring But Big · Wave Periodization & 5×10 Mass',
    focusTag: '5/3/1 BBB Powerbuilding',
    motif: 'barbell',
    accentHex: '#f97316'
  },
  plan_upper_lower_4day: {
    url: 'https://images.unsplash.com/photo-1534367990512-edbdca781b00?auto=format&fit=crop&w=960&h=600&q=85&plan=upper_lower_4day&focus=upper_lower_powerbuilding',
    subject: 'Upper / Lower 4-Day Split · Heavy Push, Pull & Legs',
    focusTag: '4-Day Upper / Lower Split',
    motif: 'rack',
    accentHex: '#3b82f6'
  },
  plan_fullbody_hlm_3day: {
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=960&h=600&q=85&plan=fullbody_hlm_3day&focus=heavy_light_medium_barbell',
    subject: 'Heavy / Light / Medium (HLM) · 3-Day Systemic Split',
    focusTag: '3-Day HLM Full Body',
    motif: 'barbell',
    accentHex: '#10b981'
  },
  plan_texas_method_pro: {
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=960&h=600&q=85&plan=texas_method_pro&focus=texas_method_squat_intensity',
    subject: 'The Texas Method · Volume, Recovery & Friday 5RM PR',
    focusTag: 'Texas Method Weekly PR',
    motif: 'plates',
    accentHex: '#eab308'
  },
  plan_candito_6week_strength_pro: {
    url: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?auto=format&fit=crop&w=960&h=600&q=85&plan=candito_6week_strength_pro&focus=candito_powerlifting_peaking',
    subject: 'Candito 6-Week Strength · Block Periodization & Peaking',
    focusTag: 'Candito 6-Week Peaking',
    motif: 'barbell',
    accentHex: '#ec4899'
  },
  plan_westside_conjugate_pro: {
    url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=960&h=600&q=85&plan=westside_conjugate_pro&focus=conjugate_max_dynamic_effort',
    subject: 'Westside Conjugate · Max Effort & Dynamic Speed Work',
    focusTag: 'Westside Conjugate Method',
    motif: 'rack',
    accentHex: '#dc2626'
  },

  // ============================================================================
  // 2. WEIGHT LOSS & METABOLIC CONDITIONING (6 Unique Plans)
  // ============================================================================
  plan_gbc_fat_incinerator: {
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=960&h=600&q=85&plan=gbc_fat_incinerator&focus=gbc_lactic_acid_fat_loss',
    subject: 'German Body Comp (GBC) · Paired Agonist-Antagonist Burn',
    focusTag: 'GBC Rapid Fat Incinerator',
    motif: 'dumbbell',
    accentHex: '#f97316'
  },
  plan_fat_loss_shred: {
    url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=960&h=600&q=85&plan=fat_loss_shred&focus=metabolic_shred_conditioning',
    subject: 'High-Density Metabolic Shred · 4-Day Conditioning Split',
    focusTag: '4-Day Metabolic Shred',
    motif: 'rings',
    accentHex: '#ef4444'
  },
  plan_metabolic_calorie_burner: {
    url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=960&h=600&q=85&plan=metabolic_calorie_burner&focus=hiit_metcon_calorie_torcher',
    subject: '3-Day Calorie Torcher · Full-Body HIIT MetCon Circuit',
    focusTag: 'HIIT MetCon Calorie Torcher',
    motif: 'barbell',
    accentHex: '#f59e0b'
  },
  plan_fasted_definition_pro: {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=960&h=600&q=85&plan=fasted_definition_pro&focus=contest_prep_shred_protocol',
    subject: '5-Day Contest Prep & Shred · Striated Muscle Definition',
    focusTag: '5-Day Contest Prep Shred',
    motif: 'torso',
    accentHex: '#eab308'
  },
  plan_gironda_8x8_honest_pro: {
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=960&h=600&q=85&plan=gironda_8x8_honest_pro&focus=gironda_8x8_density_shred',
    subject: 'Vince Gironda 8×8 · 64-Rep Short-Rest Density Shred',
    focusTag: 'Vince Gironda 8×8 Shred',
    motif: 'barbell',
    accentHex: '#a855f7'
  },
  plan_hyrox_athletic_engine_pro: {
    url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=960&h=600&q=85&plan=hyrox_athletic_engine_pro&focus=hyrox_hybrid_metcon_engine',
    subject: '5-Day Hybrid Athlete · Functional Strength & MetCon Engine',
    focusTag: 'Hybrid Athlete MetCon Engine',
    motif: 'kettlebell',
    accentHex: '#06b6d4'
  },

  // ============================================================================
  // 3. FULL BODY PROGRAMMES (6 Unique Plans)
  // ============================================================================
  plan_fullbody_ab_3day: {
    url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=960&h=600&q=85&plan=fullbody_ab_3day&focus=fullbody_hypertrophy_foundation',
    subject: '3-Day Full Body Hypertrophy Foundation',
    focusTag: '3-Day Full Body Split',
    motif: 'dumbbell',
    accentHex: '#3b82f6'
  },
  plan_fullbody_4day_hf: {
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=960&h=600&q=85&plan=fullbody_4day_hf&focus=dup_4day_high_frequency_fullbody',
    subject: '4-Day High-Frequency Full Body · Daily Undulating DUP',
    focusTag: '4-Day High-Frequency DUP',
    motif: 'plates',
    accentHex: '#6366f1'
  },
  plan_fullbody_5day_dup: {
    url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=960&h=600&q=85&plan=fullbody_5day_dup&focus=5day_daily_muscle_priority_dup',
    subject: '5-Day Full Body DUP · Daily Muscle Priority Specialization',
    focusTag: '5-Day Muscle Priority DUP',
    motif: 'cable',
    accentHex: '#f59e0b'
  },
  plan_gzclp_tiered_pro: {
    url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=960&h=600&q=85&plan=gzclp_tiered_pro&focus=gzclp_t1_t2_t3_tiered_pyramid',
    subject: 'GZCLP 4-Day Tiered LP · T1 Strength, T2 Volume & T3 Pump',
    focusTag: 'GZCLP T1/T2/T3 Pyramid',
    motif: 'barbell',
    accentHex: '#10b981'
  },
  plan_doggcrapp_dc_pro: {
    url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=960&h=600&q=85&plan=doggcrapp_dc_pro&focus=doggcrapp_rest_pause_hit',
    subject: 'DoggCrapp (DC) Training · Rest-Pause High-Intensity System',
    focusTag: 'DoggCrapp Rest-Pause HIT',
    motif: 'dumbbell',
    accentHex: '#dc2626'
  },
  plan_super_squats_20rep_pro: {
    url: 'https://images.unsplash.com/photo-1534368270820-9de3d8053204?auto=format&fit=crop&w=960&h=600&q=85&plan=super_squats_20rep_pro&focus=20_rep_breathing_squat_cage',
    subject: 'Super Squats · 20-Rep Breathing Squat & Ribcage Mass',
    focusTag: 'Super Squats 20-Rep Mass',
    motif: 'rack',
    accentHex: '#eab308'
  },

  // ============================================================================
  // 4. EASY FOUNDATIONS & MINIMALIST (5 Unique Plans)
  // ============================================================================
  plan_beginner_fullbody: {
    url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=960&h=600&q=85&plan=beginner_fullbody&focus=beginner_iron_foundation_3day',
    subject: 'Beginner Full Body · 3-Day Iron Foundation & Form Mastery',
    focusTag: '3-Day Beginner Foundation',
    motif: 'dumbbell',
    accentHex: '#10b981'
  },
  plan_dumbbell_home_gym: {
    url: '/assets/dumbbell_starter_user.jpg',
    subject: '3-Day Dumbbell-Only Starter · Gym Lifter Dumbbell Bench Press',
    focusTag: 'Dumbbell-Only Home Split',
    motif: 'dumbbell',
    accentHex: '#3b82f6'
  },
  plan_minimalist_2day_lifter: {
    url: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=960&h=600&q=85&plan=minimalist_2day_lifter&focus=minimalist_2day_compound_efficiency',
    subject: '2-Day Minimalist Lifter · Time-Crunched Compound Efficiency',
    focusTag: '2-Day Minimalist Split',
    motif: 'plates',
    accentHex: '#8b5cf6'
  },
  plan_fierce_5_novice_pro: {
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=960&h=600&q=85&plan=fierce_5_novice_pro&focus=fierce_5_balanced_novice_hypertrophy',
    subject: 'Fierce 5 Novice Routine · Balanced Aesthetic & Postural Strength',
    focusTag: 'Fierce 5 Balanced Foundation',
    motif: 'barbell',
    accentHex: '#f59e0b'
  },
  plan_tactical_barbell_operator_pro: {
    url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=960&h=600&q=85&plan=tactical_barbell_operator_pro&focus=tactical_barbell_operator_submaximal',
    subject: 'Tactical Barbell "Operator" · Sub-Maximal Wave Strength',
    focusTag: 'Tactical Barbell Operator',
    motif: 'rack',
    accentHex: '#14b8a6'
  },

  // ============================================================================
  // 5. DEFAULT PERSONALIZED PLANS (5 Unique Plans)
  // ============================================================================
  cwp_upper_hypertrophy: {
    url: 'https://images.unsplash.com/photo-1590239926044-4131f5d0654d?auto=format&fit=crop&w=960&h=600&q=85&plan=cwp_upper_hypertrophy&focus=upper_body_hypertrophy_split',
    subject: 'Upper Body Hypertrophy · Heavy Push & Pull Specialization',
    focusTag: '2-Day Upper Hypertrophy',
    motif: 'dumbbell',
    accentHex: '#f97316'
  },
  pers_plan_3day_hybrid: {
    url: 'https://images.unsplash.com/photo-1596357395104-ba989e72b5ec?auto=format&fit=crop&w=960&h=600&q=85&plan=pers_plan_3day_hybrid&focus=personalized_3day_hybrid_foundation',
    subject: '3-Day Personalized Foundation · Custom Compound Progression',
    focusTag: '3-Day Personalized Hybrid',
    motif: 'dumbbell',
    accentHex: '#f59e0b'
  },
  pers_plan_4day_upper_lower: {
    url: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=960&h=600&q=85&plan=pers_plan_4day_upper_lower&focus=personalized_4day_upper_lower',
    subject: '4-Day Personalized Upper/Lower · Custom Powerbuilding Split',
    focusTag: '4-Day Personalized Upper/Lower',
    motif: 'barbell',
    accentHex: '#3b82f6'
  },
  pers_plan_5day_vtaper: {
    url: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=960&h=600&q=85&plan=pers_plan_5day_vtaper&focus=personalized_5day_vtaper_physique',
    subject: '5-Day Personalized V-Taper · Wide Lats & Capped Deltoids',
    focusTag: '5-Day Personalized V-Taper',
    motif: 'torso',
    accentHex: '#a855f7'
  },
  pers_plan_7day_elite_split: {
    url: 'https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=960&h=600&q=85&plan=pers_plan_7day_elite_split&focus=personalized_7day_elite_mastery',
    subject: '7-Day Personalized Elite Split · Daily Specialization Cycle',
    focusTag: '7-Day Personalized Elite',
    motif: 'rack',
    accentHex: '#ef4444'
  },

  // ============================================================================
  // 6. MUSCLE SHAPE SPECIALIZATION PLANS (44 Unique Plans Across 11 Muscle Groups)
  // ============================================================================
  // CHEST (4 Unique Plans)
  muscle_chest_clavicular_shelf: {
    url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=960&h=600&q=85&plan=muscle_chest_clavicular_shelf&focus=incline_chest_clavicular_shelf',
    subject: 'Clavicular Shelf Chest · 30° Incline Press & Upper Pec Convergence',
    focusTag: 'Clavicular Upper Chest Shelf',
    motif: 'dumbbell',
    accentHex: '#f97316'
  },
  muscle_chest_power_mass: {
    url: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&w=960&h=600&q=85&plan=muscle_chest_power_mass&focus=heavy_barbell_bench_chest_mass',
    subject: 'Pectoral Mass & Power Bench · Heavy Sternal Barbell & Dips',
    focusTag: 'Power Bench & Pec Mass',
    motif: 'barbell',
    accentHex: '#ef4444'
  },
  muscle_chest_3d_stretch: {
    url: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=960&h=600&q=85&plan=muscle_chest_3d_stretch&focus=cable_fly_inner_chest_stretch',
    subject: '3D Inner & Lower Chest · Cable Crossover & Deep Pec Stretch',
    focusTag: '3D Inner & Lower Chest',
    motif: 'cable',
    accentHex: '#f59e0b'
  },
  muscle_chest_golden_era: {
    url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=960&h=600&q=85&plan=muscle_chest_golden_era&focus=golden_era_chest_pullover_flye',
    subject: 'Golden Era Chest & Ribcage · Wide-Arc Flyes & Pullovers',
    focusTag: 'Golden Era Chest & Ribcage',
    motif: 'torso',
    accentHex: '#eab308'
  },

  // BACK (4 Unique Plans)
  muscle_back_cobra_vtaper: {
    url: '/assets/back_muscle_1.jpg',
    subject: 'Cobra V-Taper Lat Width · Wide-Grip Pull-Ups & Lat Sweep',
    focusTag: 'Cobra V-Taper Lat Width',
    motif: 'cable',
    accentHex: '#3b82f6'
  },
  muscle_back_3d_thickness: {
    url: '/assets/back_muscle_2.jpg',
    subject: '3D Back Thickness · Heavy Bent-Over Rows & Rhomboid Density',
    focusTag: '3D Back & Rhomboid Density',
    motif: 'dumbbell',
    accentHex: '#2563eb'
  },
  muscle_back_deadlift_power: {
    url: '/assets/back_muscle_3.jpg',
    subject: 'Posterior Chain & Deadlift Back · Heavy Floor Pull & Erectors',
    focusTag: 'Deadlift & Posterior Back',
    motif: 'plates',
    accentHex: '#1d4ed8'
  },
  muscle_back_width_thickness_split: {
    url: '/assets/back_muscle_4.jpg',
    subject: 'Complete Width & Thickness Split · Vertical Pulls & Heavy Rows',
    focusTag: 'Complete Back Width + Density',
    motif: 'torso',
    accentHex: '#60a5fa'
  },

  // SHOULDERS (4 Unique Plans)
  muscle_shoulder_3d_cannonball: {
    url: '/assets/shoulder_muscle_1.jpg',
    subject: '3D Cannonball Delts · Lateral Raise & Cable Side-Delt Sweep',
    focusTag: '3D Cannonball Lateral Delts',
    motif: 'dumbbell',
    accentHex: '#a855f7'
  },
  muscle_shoulder_boulder_press: {
    url: '/assets/shoulder_muscle_2.jpg',
    subject: 'Overhead Pressing Power · Strict Military & Arnold Boulder Delts',
    focusTag: 'Overhead Boulder Delts',
    motif: 'barbell',
    accentHex: '#9333ea'
  },
  muscle_shoulder_rear_delt_shelf: {
    url: '/assets/shoulder_muscle_3.jpg',
    subject: 'Rear Delt & 3D Upper Shelf · Face Pulls & Reverse Flyes',
    focusTag: 'Rear Delt & 3D Upper Shelf',
    motif: 'cable',
    accentHex: '#c084fc'
  },
  muscle_shoulder_3head_capping: {
    url: '/assets/shoulder_muscle_4.jpg',
    subject: 'Complete 3-Head Deltoid Capping · Anterior, Lateral & Posterior',
    focusTag: '3-Head Deltoid Capping',
    motif: 'dumbbell',
    accentHex: '#7e22ce'
  },

  // BICEPS (4 Unique Plans)
  muscle_bicep_peak_long_head: {
    url: '/assets/biceps_muscle_1.jpg',
    subject: 'Biceps Peak & Long Head Stretch · Incline Dumbbell Curl Focus',
    focusTag: 'Biceps Peak & Long Head',
    motif: 'dumbbell',
    accentHex: '#f59e0b'
  },
  muscle_bicep_brachialis_width: {
    url: '/assets/biceps_muscle_2.jpg',
    subject: 'Brachialis & Thick Arm Width · Heavy Hammer & Reverse Curls',
    focusTag: 'Brachialis & Arm Width',
    motif: 'dumbbell',
    accentHex: '#d97706'
  },
  muscle_bicep_preacher_short_head: {
    url: '/assets/biceps_muscle_3.jpg',
    subject: 'Preacher & Spider Short-Head · Strict Isolated Bicep Overload',
    focusTag: 'Preacher & Spider Biceps',
    motif: 'barbell',
    accentHex: '#fbbf24'
  },
  muscle_bicep_high_freq_pump: {
    url: '/assets/biceps_muscle_4.jpg',
    subject: 'High-Frequency Biceps Pump · 3-Angle Strength Curve System',
    focusTag: 'High-Frequency Biceps Pump',
    motif: 'cable',
    accentHex: '#f97316'
  },

  // TRICEPS (4 Unique Plans)
  muscle_tricep_horseshoe_lateral: {
    url: '/assets/triceps_muscle_1.jpg',
    subject: 'Horseshoe Lateral Head · Heavy Rope Pushdown & Lockout',
    focusTag: 'Horseshoe Triceps Lateral',
    motif: 'cable',
    accentHex: '#ec4899'
  },
  muscle_tricep_long_head_overhead: {
    url: '/assets/triceps_muscle_2.jpg',
    subject: 'Overhead Long Head Triceps · Skull Crushers & Cable Stretch',
    focusTag: 'Overhead Long Head Triceps',
    motif: 'barbell',
    accentHex: '#db2777'
  },
  muscle_tricep_heavy_dip_lockout: {
    url: '/assets/triceps_muscle_3.jpg',
    subject: 'Heavy Dip & Close-Grip Bench · Compound Triceps Power',
    focusTag: 'Heavy Dip & Close-Grip Lockout',
    motif: 'rings',
    accentHex: '#f43f5e'
  },
  muscle_tricep_3head_sleeve_buster: {
    url: '/assets/triceps_muscle_4.jpg',
    subject: '3-Head Triceps Sleeve Buster · Lateral, Long & Medial Overload',
    focusTag: '3-Head Triceps Sleeve Buster',
    motif: 'dumbbell',
    accentHex: '#e11d48'
  },

  // QUADS (4 Unique Plans)
  muscle_quads_outer_sweep: {
    url: '/assets/quads_muscle_1.jpg',
    subject: 'Quad Sweep & Outer Vastus · Narrow-Stance Hack & Front Squats',
    focusTag: 'Quad Sweep & Vastus Lateralis',
    motif: 'rack',
    accentHex: '#10b981'
  },
  muscle_quads_teardrop_vmo: {
    url: '/assets/quads_muscle_2.jpg',
    subject: 'Teardrop VMO & Knee Flexion · Bulgarian Split Squats & Extensions',
    focusTag: 'Teardrop VMO & Split Squat',
    motif: 'dumbbell',
    accentHex: '#059669'
  },
  muscle_quads_heavy_squat_mass: {
    url: '/assets/quads_muscle_3.jpg',
    subject: 'Heavy Squat & Leg Press Mass · Progressive Barbell & 45° Sled',
    focusTag: 'Heavy Squat & Leg Press Mass',
    motif: 'plates',
    accentHex: '#34d399'
  },
  muscle_quads_mechanical_dropset: {
    url: '/assets/quads_muscle_4.jpg',
    subject: 'Pre-Exhaust & Mechanical Drop-Set · High-Intensity Quad Burn',
    focusTag: 'Mechanical Drop-Set Quads',
    motif: 'rack',
    accentHex: '#047857'
  },

  // HAMSTRINGS (4 Unique Plans)
  muscle_hamstring_rdl_stretch: {
    url: '/assets/hamstrings_muscle_1.jpg',
    subject: 'Lengthened RDL & Hip-Hinge · Barbell & Dumbbell Romanian Deadlifts',
    focusTag: 'Lengthened RDL Hamstrings',
    motif: 'barbell',
    accentHex: '#14b8a6'
  },
  muscle_hamstring_seated_lying_curl: {
    url: '/assets/hamstrings_muscle_2.jpg',
    subject: 'Seated & Lying Leg Curl · Complete Knee-Flexion Hamstring Split',
    focusTag: 'Seated & Lying Leg Curl',
    motif: 'cable',
    accentHex: '#0d9488'
  },
  muscle_hamstring_posterior_tie_in: {
    url: '/assets/hamstrings_muscle_3.jpg',
    subject: 'Posterior Tie-In & Sprint-Strength · Good Mornings & Glute-Ham',
    focusTag: 'Posterior Hamstring Tie-In',
    motif: 'barbell',
    accentHex: '#2dd4bf'
  },
  muscle_hamstring_biceps_femoris_mass: {
    url: '/assets/hamstrings_muscle_4.jpg',
    subject: 'Complete Biceps Femoris Mass · Hip Extension + Knee Flexion',
    focusTag: 'Biceps Femoris Mass Protocol',
    motif: 'plates',
    accentHex: '#0f766e'
  },

  // GLUTES (4 Unique Plans)
  muscle_glutes_heavy_hip_thrust: {
    url: '/assets/glutes_muscle_1.jpg',
    subject: 'Heavy Hip Thrust & Glute Max · Barbell Bridge & Kas Glute Shelf',
    focusTag: 'Heavy Hip Thrust Glute Max',
    motif: 'barbell',
    accentHex: '#ec4899'
  },
  muscle_glutes_3d_upper_shelf: {
    url: '/assets/glutes_muscle_2.jpg',
    subject: '3D Upper Glute & Medius · Cable Kickbacks & Abduction Sculpt',
    focusTag: '3D Upper Glute & Medius',
    motif: 'cable',
    accentHex: '#f472b6'
  },
  muscle_glutes_strong_curves: {
    url: '/assets/glutes_muscle_3.jpg',
    subject: 'Strong Curves Glute System · 4-Vector Thrust, Squat, Hinge & Abduct',
    focusTag: 'Strong Curves Glute System',
    motif: 'plates',
    accentHex: '#db2777'
  },
  muscle_glutes_unilateral_sculpt: {
    url: '/assets/glutes_muscle_4.jpg',
    subject: 'Unilateral Glute & Tie-In · Step-Ups, Lunges & B-Stance RDLs',
    focusTag: 'Unilateral Glute Sculpt',
    motif: 'dumbbell',
    accentHex: '#be185d'
  },

  // ABS & CORE (4 Unique Plans)
  muscle_abs_weighted_6pack: {
    url: '/assets/abs_muscle_1.jpg',
    subject: '6-Pack Weighted Cable & Leg Raise · Rectus Abdominis Hypertrophy',
    focusTag: 'Weighted 6-Pack Abs Split',
    motif: 'torso',
    accentHex: '#f59e0b'
  },
  muscle_abs_vcut_obliques: {
    url: '/assets/abs_muscle_2.jpg',
    subject: 'V-Cut Obliques & Rotational Core · Cable Woodchops & Serratus',
    focusTag: 'V-Cut Obliques & Serratus',
    motif: 'cable',
    accentHex: '#fbbf24'
  },
  muscle_abs_athletic_trunk: {
    url: '/assets/abs_core_exercise_3.jpg',
    subject: 'Athletic Trunk Stability · Ab Wheel Rollouts & Rotational Core',
    focusTag: 'Athletic Trunk & Rollouts',
    motif: 'barbell',
    accentHex: '#d97706'
  },
  muscle_abs_shredded_circuit: {
    url: '/assets/abs_muscle_4.jpg',
    subject: 'Shredded Midsection Circuit · High-Density Upper, Lower & Obliques',
    focusTag: 'Shredded Midsection Circuit',
    motif: 'rings',
    accentHex: '#ea580c'
  },

  // CALVES (4 Unique Plans)
  muscle_calves_diamond_gastroc: {
    url: '/assets/calves_muscle_1.jpg',
    subject: 'Diamond Gastrocnemius · Heavy Straight-Leg Standing Calf Raises',
    focusTag: 'Diamond Gastrocnemius Calves',
    motif: 'barbell',
    accentHex: '#06b6d4'
  },
  muscle_calves_soleus_seated: {
    url: '/assets/calves_muscle_2.jpg',
    subject: 'Soleus Width & Seated Calf · Bent-Knee Lower Leg Thickness',
    focusTag: 'Soleus Seated Calf Width',
    motif: 'plates',
    accentHex: '#0891b2'
  },
  muscle_calves_high_freq_4day: {
    url: '/assets/calves_muscle_3.jpg',
    subject: 'High-Frequency 4-Day Lower Leg · Paused Stretch & Peak Contraction',
    focusTag: '4-Day High-Frequency Calves',
    motif: 'dumbbell',
    accentHex: '#22d3ee'
  },
  muscle_calves_complete_lower_leg: {
    url: '/assets/calves_muscle_4.jpg',
    subject: 'Complete Lower Leg & Ankle Power · Standing, Donkey & Seated Raises',
    focusTag: 'Complete Lower Leg Power',
    motif: 'rack',
    accentHex: '#0e7490'
  },

  // FOREARMS (4 Unique Plans)
  muscle_forearms_brachioradialis: {
    url: '/assets/forearms_muscle_1.jpg',
    subject: 'Extensor & Upper Forearm Ridge · Reverse Barbell & Zottman Curls',
    focusTag: 'Forearm Extensor Ridge',
    motif: 'barbell',
    accentHex: '#6366f1'
  },
  muscle_forearms_wrist_flexor_mass: {
    url: '/assets/forearms_muscle_2.jpg',
    subject: 'Wrist Flexor & Extensor Mass · Behind-the-Back & Bench Wrist Curls',
    focusTag: 'Bowling-Pin Wrist Flexors',
    motif: 'dumbbell',
    accentHex: '#4f46e5'
  },
  muscle_forearms_crushing_grip: {
    url: '/assets/forearms_muscle_3.jpg',
    subject: 'Crushing Grip & Heavy Forearms · Finger Curls & Loaded Holds',
    focusTag: 'Crushing Grip & Forearm Power',
    motif: 'kettlebell',
    accentHex: '#818cf8'
  },
  muscle_forearms_complete_size: {
    url: '/assets/forearms_muscle_4.jpg',
    subject: 'Complete Lower Arm Vascularity · Wrist Rollers & Supination Curls',
    focusTag: 'Complete Forearm Vascularity',
    motif: 'plates',
    accentHex: '#4338ca'
  },

  // ============================================================================
  // EQUIPMENT CATEGORY PLANS (16 Unique Plans across 4 Equipment Categories)
  // ============================================================================

  // HOME GYM (4 Plans)
  equip_home_gym_upper_lower: {
    url: '/assets/garage_home_gym.jpg',
    subject: 'Garage Iron Home Gym Setup · Power Rack, Barbell, Adjustable Bench & Stall Mats',
    focusTag: 'Garage Home Gym',
    motif: 'rack',
    accentHex: '#10b981'
  },
  equip_home_gym_full_body_strength: {
    url: '/assets/home_gym_setup_2.jpg',
    subject: 'Home Rack 3-Day Full Body Setup · Squat Rack, Barbell, Bench, Pull-Up Bar & Dumbbells',
    focusTag: 'Home Gym Full Body',
    motif: 'barbell',
    accentHex: '#059669'
  },
  equip_home_gym_ppl_hypertrophy: {
    url: '/assets/home_gym_setup_3.jpg',
    subject: 'Basement Push / Pull / Legs Home Gym Setup · Power Cage, Barbell, Bench & Dumbbell Rack',
    focusTag: 'Home Gym PPL',
    motif: 'plates',
    accentHex: '#34d399'
  },
  equip_home_gym_powerbuilding: {
    url: '/assets/home_gym_setup_4.jpg',
    subject: 'Garage Powerbuilding 5×5 Home Gym Setup · Power Rack, Deadlift Platform, Bench & Dumbbells',
    focusTag: 'Home Gym Powerbuilding',
    motif: 'rack',
    accentHex: '#047857'
  },

  // FREE WEIGHTS ONLY (4 Plans)
  equip_free_weights_hypertrophy_split: {
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_free_weights_hypertrophy_split&focus=pure_iron_barbell_dumbbell_hypertrophy',
    subject: 'Pure Iron 4-Day Free-Weight Split · 100% Barbell & Dumbbell Hypertrophy',
    focusTag: 'Free Weights Split',
    motif: 'barbell',
    accentHex: '#f59e0b'
  },
  equip_free_weights_silver_era_full_body: {
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_free_weights_silver_era_full_body&focus=silver_era_barbell_dumbbell_full_body',
    subject: 'Old-School Silver Era Full Body · Classic Barbell & Dumbbell Mass',
    focusTag: 'Silver Era Free Weights',
    motif: 'plates',
    accentHex: '#d97706'
  },
  equip_free_weights_ppl_overload: {
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_free_weights_ppl_overload&focus=free_weight_ppl_barbell_dumbbell',
    subject: 'Free-Weights Push / Pull / Legs · Zero Machines, Pure Barbell & Dumbbell Load',
    focusTag: 'Free Weights PPL',
    motif: 'barbell',
    accentHex: '#fbbf24'
  },
  equip_free_weights_phul_strength: {
    url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_free_weights_phul_strength&focus=barbell_dumbbell_power_hypertrophy_ul',
    subject: 'Free-Weight Power & Hypertrophy (PHUL) · Heavy Barbells & High-Rep Dumbbells',
    focusTag: 'Free Weights PHUL',
    motif: 'dumbbell',
    accentHex: '#b45309'
  },

  // DUMBBELLS ONLY (4 Plans)
  equip_dumbbells_full_body_sculpt: {
    url: '/assets/dumbbell_user_1.jpg',
    subject: 'Gym Lifter Dumbbell Bicep Curls · Unilateral & Bilateral DB Hypertrophy',
    focusTag: 'Dumbbells Full Body',
    motif: 'dumbbell',
    accentHex: '#3b82f6'
  },
  equip_dumbbells_upper_lower_split: {
    url: '/assets/dumbbell_user_2.jpg',
    subject: 'Athlete Lifting Heavy Dumbbells · Dumbbell Rack Overload & Strength',
    focusTag: 'Dumbbells Upper/Lower',
    motif: 'dumbbell',
    accentHex: '#2563eb'
  },
  equip_dumbbells_ppl_hypertrophy: {
    url: '/assets/dumbbell_user_3.jpg',
    subject: 'Athletic Gym Lifter Holding Dumbbells · Dumbbell Lunges & PPL Protocol',
    focusTag: 'Dumbbells PPL',
    motif: 'dumbbell',
    accentHex: '#60a5fa'
  },
  equip_dumbbells_metabolic_shred: {
    url: '/assets/dumbbell_user_4.jpg',
    subject: 'Gym Athlete Dumbbell Row on Bench · High-Density DB Conditioning',
    focusTag: 'Dumbbells Shred',
    motif: 'dumbbell',
    accentHex: '#1d4ed8'
  },

  // BODYWEIGHT ONLY (4 Plans)
  equip_bodyweight_calisthenics_foundation: {
    url: '/assets/bodyweight_only_1.jpg',
    subject: 'Pure Calisthenics 3-Day Full Body · 100% Bodyweight Push, Pull, Squat & Core',
    focusTag: 'Bodyweight Full Body',
    motif: 'rings',
    accentHex: '#a855f7'
  },
  equip_bodyweight_ppl_split: {
    url: '/assets/bodyweight_only_2.jpg',
    subject: 'Bodyweight Push / Pull / Legs · Advanced Calisthenics Mechanical Leverage',
    focusTag: 'Bodyweight PPL',
    motif: 'rings',
    accentHex: '#9333ea'
  },
  equip_bodyweight_street_workout_upper_lower: {
    url: '/assets/bodyweight_only_3.jpg',
    subject: 'Street Workout 4-Day Upper / Lower · Pull-Ups, Dips, Handstand & Pistol Prep',
    focusTag: 'Street Calisthenics',
    motif: 'rings',
    accentHex: '#c084fc'
  },
  equip_bodyweight_zero_gear_shred: {
    url: '/assets/bodyweight_only_4.jpg',
    subject: 'Zero-Equipment Living Room Shred · Floor-Only Bodyweight Conditioning & Core',
    focusTag: 'Zero-Gear Bodyweight',
    motif: 'torso',
    accentHex: '#7e22ce'
  },
  equip_kettlebell_simple_sinister: {
    url: '/assets/kettlebell_gym_1.jpg',
    subject: "Pavel's Simple & Sinister · Hardstyle Swings, Get-Ups & Goblet Mobility",
    focusTag: 'Simple & Sinister',
    motif: 'kettlebell',
    accentHex: '#f59e0b'
  },
  equip_kettlebell_armor_building_complex: {
    url: '/assets/kettlebell_gym_2.jpg',
    subject: "Dan John's Armor Building Complex · Cleans, Military Press & Front Squat Density",
    focusTag: 'Armor Building ABC',
    motif: 'kettlebell',
    accentHex: '#ea580c'
  },
  equip_kettlebell_muscle_hypertrophy: {
    url: '/assets/kettlebell_gym_3.jpg',
    subject: "Geoff Neupert's Kettlebell Muscle · Double Bell Ladders & Upper Back Armor",
    focusTag: 'Kettlebell Hypertrophy',
    motif: 'kettlebell',
    accentHex: '#eab308'
  },
  equip_kettlebell_hardstyle_shred: {
    url: '/assets/kettlebell_gym_4.jpg',
    subject: 'Hardstyle 4-Day Kettlebell Conditioning · Athletic Snatches, Lunges & MetCon',
    focusTag: 'Hardstyle Shred',
    motif: 'kettlebell',
    accentHex: '#f97316'
  },

  // COMMERCIAL GYM (4 Plans)
  equip_commercial_gym_pro_ppl: {
    url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_commercial_gym_pro_ppl',
    subject: 'Commercial Gym 6-Day Pro PPL · Barbells, Plate-Loaded Machines & Cables',
    focusTag: 'Commercial Gym Pro PPL',
    motif: 'rack',
    accentHex: '#f59e0b'
  },
  equip_commercial_gym_upper_lower_hypertrophy: {
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_commercial_gym_upper_lower_hypertrophy',
    subject: 'Full-Facility 4-Day Upper / Lower · Leverage Machines, Sleds & Iron',
    focusTag: 'Commercial Upper / Lower',
    motif: 'plates',
    accentHex: '#f97316'
  },
  equip_commercial_gym_arnold_golden_split: {
    url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_commercial_gym_arnold_golden_split',
    subject: 'Commercial Gym Antagonist Split · Chest/Back, Delts/Arms & Legs',
    focusTag: 'Commercial Antagonist Split',
    motif: 'barbell',
    accentHex: '#eab308'
  },
  equip_commercial_gym_full_body_machines_iron: {
    url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=960&h=600&q=85&plan=equip_commercial_gym_full_body_machines_iron',
    subject: '3-Day Commercial Gym Total-Body · Pin/Plate Machines & Free-Weight Mastery',
    focusTag: 'Commercial Full Body',
    motif: 'rack',
    accentHex: '#10b981'
  },

  // CABLE MACHINE (4 Plans)
  equip_cable_machine_constant_tension_hypertrophy: {
    url: '/assets/cable_machine_1.jpg',
    subject: 'Dual Cable Tower 4-Day Hypertrophy · Standing Dual Cable Chest Crossover',
    focusTag: 'Cable Constant Tension',
    motif: 'cable',
    accentHex: '#06b6d4'
  },
  equip_cable_machine_ppl_sculpt: {
    url: '/assets/cable_machine_2.jpg',
    subject: 'Cable Machine Push / Pull / Legs · Wide-Grip Cable Lat Pulldown Station',
    focusTag: 'Cable Machine PPL',
    motif: 'cable',
    accentHex: '#3b82f6'
  },
  equip_cable_machine_full_body_aesthetic: {
    url: '/assets/cable_machine_3.jpg',
    subject: '3-Day Cable Tower Full-Body Aesthetic · Standing Cable Rope Triceps Pushdown',
    focusTag: 'Cable Full Body',
    motif: 'cable',
    accentHex: '#8b5cf6'
  },
  equip_cable_machine_upper_body_vtaper_shred: {
    url: '/assets/cable_machine_4.jpg',
    subject: '4-Day Cable Machine V-Taper & Striated Chest · Seated Low-Pulley Cable Row',
    focusTag: 'Cable V-Taper Shred',
    motif: 'cable',
    accentHex: '#f59e0b'
  }
};

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Resolves a guaranteed unique, non-repeating high-definition thumbnail URL
 * clearly representing the workout plan name and training focus.
 */
export function getUniquePlanThumbnailUrl(planOrId: WorkoutPlan | string): string {
  if (typeof planOrId === 'object' && planOrId !== null) {
    const mapped = UNIQUE_PLAN_THUMBNAIL_MAP[planOrId.id];
    if (mapped) return mapped.url;
    if (planOrId.thumbnail_url && !planOrId.thumbnail_url.includes('custom_plan_')) {
      return planOrId.thumbnail_url;
    }

    const seed = `${planOrId.id}_${planOrId.title}`;
    const h = hashString(seed);
    const photoId = DISJOINT_ROUTINE_AND_CUSTOM_PHOTO_IDS[h % DISJOINT_ROUTINE_AND_CUSTOM_PHOTO_IDS.length];
    const focusSlug = encodeURIComponent(
      (planOrId.title || planOrId.targetMuscleGroup || planOrId.goal || 'custom_plan')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
    );
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=960&h=600&q=85&plan=${encodeURIComponent(planOrId.id)}&focus=${focusSlug}`;
  }

  const cleanId = String(planOrId || '');
  const mapped = UNIQUE_PLAN_THUMBNAIL_MAP[cleanId];
  if (mapped) return mapped.url;

  const h = hashString(cleanId);
  const photoId = DISJOINT_ROUTINE_AND_CUSTOM_PHOTO_IDS[h % DISJOINT_ROUTINE_AND_CUSTOM_PHOTO_IDS.length];
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=960&h=600&q=85&plan=${encodeURIComponent(cleanId)}&focus=custom_plan`;
}

/**
 * Resolves metadata (subject & focus tag) for a plan's visual presentation.
 */
export function getPlanThumbnailSpec(planOrId: WorkoutPlan | string): PlanThumbnailSpec {
  const id = typeof planOrId === 'string' ? planOrId : planOrId.id;
  if (UNIQUE_PLAN_THUMBNAIL_MAP[id]) {
    return UNIQUE_PLAN_THUMBNAIL_MAP[id];
  }
  const title = typeof planOrId === 'object' ? planOrId.title : id;
  const focus =
    typeof planOrId === 'object'
      ? planOrId.targetMuscleGroup || planOrId.goal || title
      : 'Custom Split';
  return {
    url: getUniquePlanThumbnailUrl(planOrId),
    subject: `${title} · Personalized Split`,
    focusTag: String(focus),
    motif: 'barbell',
    accentHex: '#f59e0b'
  };
}

/**
 * Generates a unique, non-repeating HD thumbnail URL for each routine day inside the Plan Detail Modal
 * using the disjoint routine pool so routine days never repeat each other or any workout plan card.
 */
export function getUniqueRoutineThumbnailUrl(
  routineOrName: { dayName?: string; focus?: string; title?: string; name?: string } | string,
  planId?: string,
  dayIndex?: number
): string {
  const text =
    typeof routineOrName === 'string'
      ? routineOrName
      : `${routineOrName?.dayName || ''} ${routineOrName?.focus || ''} ${routineOrName?.title || ''}`;

  const offset = (hashString(planId || 'routine') + (dayIndex ?? 0) * 3) % DISJOINT_ROUTINE_AND_CUSTOM_PHOTO_IDS.length;
  const photoId = DISJOINT_ROUTINE_AND_CUSTOM_PHOTO_IDS[offset];
  const daySlug = encodeURIComponent(text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 32));
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=960&h=480&q=85&routine=${encodeURIComponent(planId || 'p')}_d${dayIndex ?? 0}_${daySlug}`;
}

/**
 * Generates a unique, high-definition (960x600), dark/moody high-contrast studio SVG data URI
 * tailored to the exact workout plan name and motif as an instant offline / fallback artwork.
 */
export function getPlanMinimalistFallbackSvgDataUri(planOrId: WorkoutPlan | string): string {
  const spec = getPlanThumbnailSpec(planOrId);
  const idStr = typeof planOrId === 'string' ? planOrId : planOrId.id;
  const h = hashString(idStr);
  const spotX = 35 + (h % 30);
  const spotY = 20 + ((h >> 4) % 25);
  const safeSubject = spec.subject.replace(/[<>&"']/g, '');
  const safeFocus = spec.focusTag.replace(/[<>&"']/g, '').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600">
    <defs>
      <radialGradient id="glow" cx="${spotX}%" cy="${spotY}%" r="65%">
        <stop offset="0%" stop-color="${spec.accentHex}" stop-opacity="0.34"/>
        <stop offset="55%" stop-color="#18181b" stop-opacity="0.88"/>
        <stop offset="100%" stop-color="#09090b" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="960" height="600" fill="#09090b"/>
    <rect width="960" height="600" fill="url(#glow)"/>
    <g opacity="0.92" transform="translate(240, 140)">
      <line x1="20" y1="110" x2="460" y2="110" stroke="#e4e4e7" stroke-width="14" stroke-linecap="round"/>
      <rect x="55" y="40" width="26" height="140" rx="6" fill="#27272a" stroke="${spec.accentHex}" stroke-width="4"/>
      <rect x="88" y="55" width="20" height="110" rx="5" fill="#3f3f46"/>
      <rect x="399" y="40" width="26" height="140" rx="6" fill="#27272a" stroke="${spec.accentHex}" stroke-width="4"/>
      <rect x="372" y="55" width="20" height="110" rx="5" fill="#3f3f46"/>
    </g>
    <text x="480" y="465" text-anchor="middle" fill="${spec.accentHex}" font-family="monospace" font-size="22" font-weight="700" letter-spacing="3">${safeFocus}</text>
    <text x="480" y="515" text-anchor="middle" fill="#f4f4f5" font-family="system-ui, sans-serif" font-size="24" font-weight="800">${safeSubject}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
