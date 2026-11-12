import { ExerciseDefinition, MuscleGroup, Equipment, DailyWorkoutRoutine, WorkoutPlan, EquipmentPlanCategory } from '../types';
import gympaxExercisesRaw from '../../gympax_exercises.json';
import { getUniquePlanThumbnailUrl } from './planThumbnails';

export interface GympaxRawExercise {
  id: string;
  name: string;
  primary_muscle: string;
  secondary_muscles?: string[];
  category: string;
  media_file: string;
  cdn_url: string;
  is_custom_allowed: boolean;
}

const LEGACY_CURATED_EXERCISES: ExerciseDefinition[] = [
  // CHEST
  {
    id: 'barbell_bench_press',
    name: 'Barbell Flat Bench Press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Barbell',
    tier: 'Compound',
    description: 'The golden staple for pectoral hypertrophy and upper body pushing power.',
    cues: [
      'Retract and depress scapulae into the bench',
      'Maintain slight natural arch in the lumbar spine with feet planted firmly',
      'Lower the bar with control to lower-mid sternum',
      'Drive feet into floor and press in a gentle J-curve towards shoulder line'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'incline_dumbbell_press',
    name: 'Incline Dumbbell Press (30°)',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Premier builder for the clavicular head (upper chest shelf) with deep stretch.',
    cues: [
      'Set bench to 30 degrees (avoid steep 45° to reduce front delt takeover)',
      'Tuck elbows at 45-60 degrees from torso',
      'Feel maximum stretch at bottom without allowing shoulders to roll forward',
      'Converge dumbbells slightly at peak contraction without clinking'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'cable_pec_flye',
    name: 'Standing Cable Chest Flye',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Cable',
    tier: 'Isolation',
    description: 'Provides constant continuous mechanical tension across the full horizontal adduction.',
    cues: [
      'Keep slight bend in elbows locked throughout the movement',
      'Initiate with pectoral squeeze, imagining hugging a thick tree',
      'Cross hands slightly at peak for extreme inner chest contraction',
      'Control eccentric phase for a 3-second loaded stretch'
    ],
    svgIconType: 'cable'
  },
  {
    id: 'weighted_chest_dips',
    name: 'Weighted Chest Dips',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Weighted',
    tier: 'Compound',
    description: 'Often called the upper-body squat for lower pectoral mass and thickness.',
    cues: [
      'Lean torso forward 30 degrees with elbows flared slightly outward',
      'Descend until shoulders are just below elbow crease',
      'Drive upward through heels of hands focusing on chest contraction'
    ],
    svgIconType: 'dip'
  },

  // BACK
  {
    id: 'barbell_deadlift',
    name: 'Conventional Barbell Deadlift',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Forearms'],
    equipment: 'Barbell',
    tier: 'Compound',
    description: 'Total posterior chain builder constructing spinal erector thickness and heavy density.',
    cues: [
      'Barbell over midfoot with shins 1 inch away',
      'Hinge hips back, grip bar outside legs, pull slack out until bar clinks',
      'Engage lats as if snapping the barbell in half across your shins',
      'Push the floor away through midfoot, extending hips and knees in unison'
    ],
    svgIconType: 'deadlift'
  },
  {
    id: 'barbell_bent_row',
    name: 'Barbell Bent-Over Row (Pendlay / 45°)',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'Barbell',
    tier: 'Compound',
    description: 'Builds dense rhomboid, middle trap, and lat mass for a 3D back profile.',
    cues: [
      'Hinge at hips with flat rigid spine and engaged core',
      'Pull elbows toward hips rather than straight up to ribs',
      'Hold a split-second pause at top, pinching scapulae together',
      'Resist momentum on eccentric return'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'lat_pulldown_wide',
    name: 'Wide-Grip Lat Pulldown',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps'],
    equipment: 'Cable',
    tier: 'Compound',
    description: 'Essential vertical pull targeting latissimus dorsi width for the classic V-taper.',
    cues: [
      'Slight backward torso lean (10-15 degrees)',
      'Lead with elbows pulling straight down towards back pockets',
      'Full stretch at the top allowing scapulae to protract and elevate safely',
      'Avoid swinging or yanking with lower back'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'seated_cable_row',
    name: 'Seated Cable Row (Close-Grip V-Bar)',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: 'Cable',
    tier: 'Compound',
    description: 'Constant tension horizontal pull for back thickness and mid-lat development.',
    cues: [
      'Sit tall with knees slightly unlocked and chest proud',
      'Initiate with scapular retraction before bending the elbows',
      'Drive elbows past torso and squeeze back hard',
      'Allow full loaded stretch forward on the eccentric return'
    ],
    svgIconType: 'cable'
  },
  {
    id: 'chest_supported_tbar_row',
    name: 'Chest-Supported T-Bar Row',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'Machine',
    tier: 'Compound',
    description: 'Eliminates lumbar fatigue allowing absolute failure on upper back and rear delts.',
    cues: [
      'Press sternum flat against pad',
      'Flare elbows at roughly 60 degrees to target upper traps and rhomboids',
      'Focus purely on shoulder blade retraction'
    ],
    svgIconType: 'pull'
  },

  // SHOULDERS
  {
    id: 'overhead_barbell_press',
    name: 'Standing Overhead Barbell Press (OHP)',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Abs & Core'],
    equipment: 'Barbell',
    tier: 'Compound',
    description: 'The definitive test of vertical pressing strength and anterior delt development.',
    cues: [
      'Grip just outside shoulder width with vertical forearms',
      'Squeeze glutes and brace core tightly to avoid lumbar hyper-extension',
      'Pull chin back slightly to clear path, press bar straight up',
      'Push head forward through the window at top lockout'
    ],
    svgIconType: 'overhead'
  },
  {
    id: 'dumbbell_lateral_raise',
    name: 'Dumbbell Lateral Raise',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Crucial for medial lateral delt development to create broad boulder shoulders.',
    cues: [
      'Lean forward 10 degrees at hips to align with lateral delt fibers in scapular plane',
      'Lead with elbows slightly higher than wrists',
      'Raise only to parallel (shoulder height) to maintain tension without trapezius shrug',
      'Control eccentric descent for 2 full seconds'
    ],
    svgIconType: 'overhead'
  },
  {
    id: 'face_pull_rope',
    name: 'Cable Rope Face Pull',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Back'],
    equipment: 'Cable',
    tier: 'Isolation',
    description: 'Vital for rear delts, external rotators, and bulletproofing shoulder joints.',
    cues: [
      'Set pulley at eye level with rope attachment',
      'Pull rope towards bridge of nose while actively pulling hands apart',
      'Rotate hands backwards so thumbs point behind you at end position',
      'Pause 1 second in full external rotation'
    ],
    svgIconType: 'cable'
  },
  {
    id: 'seated_dumbbell_shoulder_press',
    name: 'Seated Dumbbell Shoulder Press',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'High muscle recruitment on front and side delts with independent arm stabilization.',
    cues: [
      'Bench at 75-80 degrees',
      'Lower dumbbells under control until bells touch shoulder tops',
      'Press upward in a smooth arc without locking elbows aggressively at top'
    ],
    svgIconType: 'overhead'
  },

  // LEGS - QUADS, HAMSTRINGS, GLUTES, CALVES
  {
    id: 'barbell_back_squat',
    name: 'Barbell Back Squat (High Bar / Low Bar)',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Abs & Core'],
    equipment: 'Barbell',
    tier: 'Compound',
    description: 'The king of lower body mass builders for deep quad sweep and leg density.',
    cues: [
      'Rest bar securely across upper traps or rear delt shelf',
      'Take deep diaphragmatic breath and brace 360 degrees against lifting belt',
      'Break at knees and hips simultaneously, tracking knees over second toes',
      'Descend to parallel or below with upright chest, then explode up through midfoot'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'hack_squat_machine',
    name: 'Machine Hack Squat',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes'],
    equipment: 'Machine',
    tier: 'Compound',
    description: 'Stabilized quad isolation powerhouse enabling max loading to absolute failure.',
    cues: [
      'Place feet low-to-mid platform for maximum knee flexion and quad stretch',
      'Keep pelvis and lower back glued into the back pad throughout range',
      'Descend deep until hamstrings compress into calves',
      'Do not bounce at bottom; drive through whole foot'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'romanian_deadlift_barbell',
    name: 'Barbell Romanian Deadlift (RDL)',
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Back', 'Forearms'],
    equipment: 'Barbell',
    tier: 'Compound',
    description: 'Unmatched eccentric loaded stretch for hamstring hypertrophy and posterior chain power.',
    cues: [
      'Slight unlock at knees and keep that knee angle frozen throughout',
      'Push hips back as far as humanly possible, keeping bar scraping thighs',
      'Stop when hips cannot travel further back (usually just below knees)',
      'Drive hips forward forcefully to lockout, squeezing glutes'
    ],
    svgIconType: 'deadlift'
  },
  {
    id: 'barbell_hip_thrust',
    name: 'Barbell Hip Thrust',
    primaryMuscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Quads', 'Abs & Core'],
    equipment: 'Barbell',
    tier: 'Compound',
    description: 'The gold standard for direct glute hypertrophy and hip-extension power under heavy horizontal load.',
    cues: [
      'Upper back supported against stable gym bench just below shoulder blades',
      'Position padded barbell directly across hip crease; feet flat shoulder-width apart',
      'Drive forcefully through heels, extending hips fully until thighs and torso align',
      'Tuck chin slightly and squeeze glutes maximally for a 1-second peak contraction'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'seated_leg_curl',
    name: 'Seated Leg Curl Machine',
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Calves'],
    equipment: 'Machine',
    tier: 'Isolation',
    description: 'Trains hamstrings at hip-flexed position where they produce optimal tension.',
    cues: [
      'Lock thigh pad tightly to prevent hip lifting',
      'Flex toes towards shins (dorsiflexion) to focus load on hamstrings',
      'Pull heels under briskly and control 3-second return'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'leg_extension_machine',
    name: 'Seated Leg Extension Machine',
    primaryMuscle: 'Quads',
    secondaryMuscles: [],
    equipment: 'Machine',
    tier: 'Isolation',
    description: 'The only exercise loading the rectus femoris in its fully shortened peak contraction.',
    cues: [
      'Align knee joint pivot with machine axis of rotation',
      'Extend legs fully and pause 1 second at top contraction',
      'Lower slowly under strict control; avoid swinging the weight stack'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'standing_calf_raise',
    name: 'Standing Calf Raise (Smith / Machine)',
    primaryMuscle: 'Calves',
    secondaryMuscles: [],
    equipment: 'Machine',
    tier: 'Isolation',
    description: 'Direct gastrocnemius loading with straight knee for maximum calf stretch and peak.',
    cues: [
      'Balls of feet on edge of platform, heels free',
      'Drop heels deep below platform for full 2-second loaded stretch',
      'Explode onto big toes and hold peak squeeze for 1 second'
    ],
    svgIconType: 'squat'
  },

  // ARMS - BICEPS, TRICEPS, FOREARMS
  {
    id: 'standing_barbell_curl',
    name: 'Standing Barbell Biceps Curl',
    primaryMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    equipment: 'Barbell',
    tier: 'Isolation',
    description: 'Classic heavy mass builder for overall biceps brachii and forearm strength.',
    cues: [
      'Pin elbows firmly at sides without swinging hips',
      'Curl bar up in smooth semi-circle focusing on bicep contraction',
      'Squeeze hard at top without letting elbows drift forward',
      'Lower under control to complete extension'
    ],
    svgIconType: 'curl'
  },
  {
    id: 'incline_dumbbell_curl',
    name: 'Incline Dumbbell Biceps Curl (45°)',
    primaryMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Places long head of biceps under severe stretch behind the torso for high peak.',
    cues: [
      'Set bench to 45-60 degrees, let arms hang plumb vertical',
      'Curl dumbbells up while supinating wrists outward at midpoint',
      'Maintain arms behind torso line to preserve deep stretch'
    ],
    svgIconType: 'curl'
  },
  {
    id: 'hammer_curl_cable_rope',
    name: 'Cable Rope Hammer Curl',
    primaryMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    equipment: 'Cable',
    tier: 'Isolation',
    description: 'Targets brachialis and brachioradialis for arm thickness and forearm size.',
    cues: [
      'Neutral grip (palms facing each other)',
      'Spread rope ends outward at peak contraction',
      'Keep upper arms stationary throughout'
    ],
    svgIconType: 'curl'
  },
  {
    id: 'triceps_rope_pushdown',
    name: 'Cable Triceps Rope Pushdown',
    primaryMuscle: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Cable',
    tier: 'Isolation',
    description: 'Constant mechanical cable tension isolating the lateral and medial triceps heads.',
    cues: [
      'Lock elbows into sides of ribs',
      'Push downward and flare rope ends out at the bottom',
      'Lock triceps out forcefully for 1 second',
      'Allow forearm to travel up past 90 degrees for complete stretch'
    ],
    svgIconType: 'cable'
  },
  {
    id: 'skullcrushers_ez_bar',
    name: 'EZ-Bar Skullcrushers (Lying Triceps Ext)',
    primaryMuscle: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Barbell',
    tier: 'Isolation',
    description: 'Superior long-head triceps builder producing dense upper-arm horseshoe shape.',
    cues: [
      'Angle upper arms back 10-15 degrees towards your head rather than vertical',
      'Lower bar to crown of head or just behind bench for intense long-head stretch',
      'Extend elbows back to starting angled position'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'cable_overhead_triceps_ext',
    name: 'Cable Overhead Triceps Extension',
    primaryMuscle: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Cable',
    tier: 'Isolation',
    description: 'Deep stretch on long head with comfortable elbow angle without joint crunching.',
    cues: [
      'Step forward into split stance with cable behind head',
      'Allow elbows to flex deeply behind head',
      'Press forward and lock arms out straight'
    ],
    svgIconType: 'cable'
  },

  // ABS & CORE
  {
    id: 'hanging_leg_raise',
    name: 'Hanging Leg Raise (Captain’s Chair / Bar)',
    primaryMuscle: 'Abs & Core',
    secondaryMuscles: ['Forearms'],
    equipment: 'Bodyweight',
    tier: 'Isolation',
    description: 'Elite lower abdominal and hip flexor strengthening for deep six-pack definition.',
    cues: [
      'Hang from pullup bar with locked active shoulders',
      'Curl pelvis up towards sternum rather than merely swinging legs',
      'Raise toes to bar level with control',
      'Do not use swinging momentum on the descent'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'cable_woodchopper',
    name: 'High-to-Low Cable Woodchopper',
    primaryMuscle: 'Abs & Core',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Cable',
    tier: 'Isolation',
    description: 'Rotational core powerhouse carving oblique ridges and core stabilization.',
    cues: [
      'Grip handle with both hands, arms straight',
      'Rotate torso diagonally across body down towards opposite knee',
      'Pivot on rear foot and engage obliques throughout'
    ],
    svgIconType: 'cable'
  },
  {
    id: 'cable_crunch_kneeling',
    name: 'Kneeling Cable Rope Crunch',
    primaryMuscle: 'Abs & Core',
    secondaryMuscles: [],
    equipment: 'Cable',
    tier: 'Isolation',
    description: 'Allows progressive overload on rectus abdominis for deep muscular bricks.',
    cues: [
      'Hold rope ends next to ears with wrists locked',
      'Flex spine by pulling elbows into thighs, curling like a shrimp',
      'Do not hinge at hips; keep hips stationary and crunch purely with spine'
    ],
    svgIconType: 'cable'
  },

  // ==========================================
  // BODYWEIGHT & TRAVELLING EXERCISES (NO WEIGHTS)
  // ==========================================
  {
    id: 'push_ups_standard',
    name: 'Standard Bodyweight Push-Up',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders', 'Abs & Core'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Foundational horizontal push building chest thickness, tricep power, and core rigidity.',
    cues: [
      'Hands slightly wider than shoulder width, fingers spread',
      'Maintain rigid plank line from head to heels with glutes and abs squeezed',
      'Tuck elbows at 45 degrees, lowering chest until 1 inch from floor',
      'Press through full palms into lockout without sagging lower back'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'decline_push_ups',
    name: 'Decline Push-Up (Feet Elevated)',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Shifts body angle upward to directly overload the clavicular upper pectoral fibers.',
    cues: [
      'Place toes on hotel chair, bed, or bench (12-18 inches elevated)',
      'Hands under shoulders on the floor, bracing core tightly',
      'Lower collarbone towards floor feeling deep upper chest stretch',
      'Drive up through base of palms to full lockout'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'diamond_push_ups',
    name: 'Diamond Close-Grip Push-Up',
    primaryMuscle: 'Triceps',
    secondaryMuscles: ['Chest', 'Shoulders'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Forms a triangle with index fingers and thumbs for extreme mechanical tricep overload.',
    cues: [
      'Thumbs and index fingers touching directly under sternum',
      'Keep elbows pinned tight against ribs as you descend',
      'Lower chest until it touches back of thumbs',
      'Lock out triceps forcefully at top for 1 full second'
    ],
    svgIconType: 'dip'
  },
  {
    id: 'bench_chair_dips',
    name: 'Bench / Chair Bodyweight Dips',
    primaryMuscle: 'Triceps',
    secondaryMuscles: ['Chest', 'Shoulders'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Accessible travel dip using hotel chair or bed edge for deep triceps stretch.',
    cues: [
      'Grip edge of sturdy chair or bed, palms down beside hips',
      'Extend legs forward (bend knees slightly to decrease resistance if needed)',
      'Lower hips straight down by bending elbows to 90 degrees',
      'Press straight up through heels of hands focusing on triceps'
    ],
    svgIconType: 'dip'
  },
  {
    id: 'pike_push_ups',
    name: 'Pike Push-Up (Deltoids & OHP Pattern)',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Back'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'The bodyweight overhead press transferring load to anterior and lateral deltoids.',
    cues: [
      'Start in high push-up, walk feet towards hands forming an inverted V',
      'Keep hips high over shoulders, gaze between feet',
      'Lower head diagonally forward in front of hands forming a tripod',
      'Push back and up through shoulders returning to high pike'
    ],
    svgIconType: 'overhead'
  },
  {
    id: 'wall_handstand_hold',
    name: 'Wall Handstand Hold / Push-Up',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Abs & Core'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Maximum bodyweight vertical pressing overload building massive boulder shoulders.',
    cues: [
      'Kick up or walk feet up against sturdy wall into inverted vertical line',
      'Lock elbows, press shoulders up toward ears (active elevation)',
      'Brace core tightly to avoid lumbar banana arching',
      'Hold for 30-45s or perform controlled partial reps'
    ],
    svgIconType: 'overhead'
  },
  {
    id: 'inverted_bodyweight_row',
    name: 'Inverted Row (Table / Low Bar / Doorway)',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'The horizontal pulling equivalent to push-ups for dense rhomboids, mid-traps, and lats.',
    cues: [
      'Position under sturdy table edge or doorway bar with straight body',
      'Grip with overhand or neutral grip, heels on floor',
      'Pull chest up to touch underside of table edge, driving elbows back',
      'Squeeze shoulder blades together hard before lowering under control'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'pull_ups_bodyweight',
    name: 'Bodyweight Pull-Up (Overhand)',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'The gold standard bodyweight vertical pull carving a wide, flared V-taper.',
    cues: [
      'Grip bar just outside shoulder width with palms facing away',
      'Depress scapulae downward before pulling with arms',
      'Drive elbows down towards hips until chin clearly clears bar',
      'Lower under complete control to dead hang stretch'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'chin_ups_bodyweight',
    name: 'Underhand Chin-Up (Biceps & Lats)',
    primaryMuscle: 'Biceps',
    secondaryMuscles: ['Back', 'Forearms'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Supinated grip maximizing biceps mechanical leverage while building thick lower lats.',
    cues: [
      'Grip bar shoulder-width with palms facing you',
      'Pull elbows down and slightly back, squeezing biceps hard',
      'Chest reaches up toward bar, pause at top peak contraction',
      'Lower slowly for 3 seconds to full stretch'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'doorframe_towel_row',
    name: 'Doorframe Towel Row',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Hotel room friendly pulling exercise using a towel looped around door handle or frame.',
    cues: [
      'Wrap long bath towel around sturdy closed door handle or pillar',
      'Lean back with heels forward, holding towel ends firmly',
      'Row torso towards door by driving elbows back behind body',
      'Pinch shoulder blades hard at top for 2 full seconds'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'bodyweight_air_squat',
    name: 'Deep Bodyweight Air Squat (Tempo / Pause)',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'High-rep or slow-tempo quad burner driving metabolic fatigue without any external weights.',
    cues: [
      'Feet shoulder-width apart, toes flared slightly out',
      'Descend below parallel, keeping chest proud and knees tracking outward',
      'Pause 1-2 seconds in deep hole for maximum quad stretch',
      'Drive up through whole foot, keeping tension continuous'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'bulgarian_split_squat_bodyweight',
    name: 'Bulgarian Split Squat (Bodyweight / Hotel Bed)',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Unilateral leg destroyer delivering extreme hypertrophy stimulus without heavy barbells.',
    cues: [
      'Place rear foot on bed, chair, or couch behind you',
      'Step lead foot forward so shin stays relatively vertical at bottom',
      'Descend until back knee hovers 1 inch above floor',
      'Drive through front heel, keeping torso tall or slightly hinged forward'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'bodyweight_sissy_squat',
    name: 'Bodyweight Sissy Squat (Supported)',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Calves'],
    equipment: 'Bodyweight',
    tier: 'Isolation',
    description: 'Isolates the rectus femoris and vastus medialis with intense knee flexion stretch.',
    cues: [
      'Hold onto doorframe or table with one hand for balance',
      'Rise onto balls of feet, drive knees forward while leaning torso backward in straight line',
      'Lower until knees reach deep flexion and quads scream under stretch',
      'Contract quads to pull torso back to top'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'single_leg_glute_bridge',
    name: 'Single-Leg Glute Bridge',
    primaryMuscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Abs & Core'],
    equipment: 'Bodyweight',
    tier: 'Isolation',
    description: 'Unilateral hip extension locking in powerful glute contraction and hamstring strength.',
    cues: [
      'Lie on floor with one knee bent, foot flat; other leg extended straight',
      'Drive working heel into floor to lift pelvis until hip is fully locked out',
      'Squeeze working glute rock hard for 2 seconds at peak',
      'Lower hips slowly without completely resting on floor between reps'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'bodyweight_single_leg_rdl',
    name: 'Single-Leg Bodyweight Romanian Deadlift',
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Back'],
    equipment: 'Bodyweight',
    tier: 'Compound',
    description: 'Unilateral posterior chain hinge developing hamstring loaded stretch and stabilizer balance.',
    cues: [
      'Stand on one leg with soft knee bend',
      'Hinge forward at hip, reaching hands down while extending rear leg straight back',
      'Feel deep loaded stretch across hamstring of stance leg',
      'Contract glute and hamstring to pull torso back upright'
    ],
    svgIconType: 'deadlift'
  },
  {
    id: 'standing_single_leg_calf_raise',
    name: 'Single-Leg Calf Raise (Stair / Floor)',
    primaryMuscle: 'Calves',
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    tier: 'Isolation',
    description: 'Uses full bodyweight on one foot over a stair edge for deep stretch and maximum calf burn.',
    cues: [
      'Ball of one foot on stair edge, hand on wall for light balance',
      'Drop heel down for a 2-second deep eccentric stretch',
      'Press up high onto big toe, holding peak contraction for 1 second',
      'Perform sets of 15-25 controlled reps'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'plank_core',
    name: 'RKC Hardstyle Forearm Plank',
    primaryMuscle: 'Abs & Core',
    secondaryMuscles: ['Shoulders', 'Glutes'],
    equipment: 'Bodyweight',
    tier: 'Isolation',
    description: 'High-tension isometric core contraction creating deep abdominal wall density.',
    cues: [
      'Forearms on floor under shoulders, feet together',
      'Tuck pelvis into posterior tilt, clenching glutes and quads like steel',
      'Actively pull elbows towards toes as if trying to fold floor in half',
      'Breathe into stomach while maintaining maximum whole-body tension'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'floor_bicycle_crunches',
    name: 'Cross-Body Bicycle Crunch',
    primaryMuscle: 'Abs & Core',
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    tier: 'Isolation',
    description: 'Combines spinal flexion with reciprocal rotational torque for razor-sharp obliques and six-pack.',
    cues: [
      'Lie supine with lower back pressed flush against floor',
      'Alternate touching opposite elbow to knee in smooth, rhythmic tempo',
      'Fully extend non-working leg forward without arching lower back',
      'Pause 1 second in each cross-over rotation'
    ],
    svgIconType: 'pull'
  },

  // ==========================================
  // DUMBBELL-ONLY EXERCISES
  // ==========================================
  {
    id: 'dumbbell_flat_bench_press',
    name: 'Flat Dumbbell Bench Press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Freedom of wrist angle and deeper horizontal adduction than fixed barbell press.',
    cues: [
      'Kick dumbbells to chest as you lay back on flat bench',
      'Retract scapulae and keep elbows at roughly 45-60 degree angle',
      'Lower bells until they brush sides of chest with deep pectoral stretch',
      'Press upward in smooth convergent arc, stopping just short of clinking'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'dumbbell_chest_flye',
    name: 'Flat Dumbbell Chest Flye',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Pure horizontal adduction isolating pectoral muscle fibers across maximum stretch.',
    cues: [
      'Slight bend in elbows locked throughout movement',
      'Lower dumbbells wide until deep chest stretch is felt across pecs',
      'Squeeze pecs to bring dumbbells together over sternum',
      'Do not allow elbows to straighten or bend excessively during rep'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'single_arm_dumbbell_row',
    name: 'One-Arm Dumbbell Row (Bench Supported)',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Premier unilateral back builder allowing full lat stretch and heavy progressive overload.',
    cues: [
      'One knee and hand on flat bench, spine flat and parallel to floor',
      'Let dumbbell hang down with full lat stretch and scapular protraction',
      'Pull dumbbell towards hip crease rather than straight up to chest',
      'Squeeze lat and rhomboids hard at top of rep'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'two_arm_dumbbell_row',
    name: 'Two-Arm Bent-Over Dumbbell Row',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Hamstrings'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Builds upper back thickness and posterior chain isometric stability.',
    cues: [
      'Hinge at hips to 45 degrees with rigid spine',
      'Hold dumbbells with neutral or overhand grip',
      'Drive elbows up and back towards pockets',
      'Pause for 1 second at top pinching shoulder blades'
    ],
    svgIconType: 'pull'
  },
  {
    id: 'dumbbell_pullover',
    name: 'Dumbbell Cross-Bench Pullover',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Chest', 'Triceps'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Classic Arnold-era chest expander and lower lat stretch builder.',
    cues: [
      'Upper back perpendicular across bench, hips slightly dipped',
      'Diamond grip under inner plate of single dumbbell above chest',
      'Lower dumbbell back over head in arc with slight elbow bend',
      'Feel massive stretch across ribcage and lats, then pull back over face'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'standing_dumbbell_overhead_press',
    name: 'Standing Dumbbell Overhead Press',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Abs & Core'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Standing overhead press demanding active core stabilization and delt power.',
    cues: [
      'Stand tall, feet hip-width, bells at shoulder height with palms facing semi-forward',
      'Brace abs and glutes to lock spine into neutral posture',
      'Press dumbbells overhead together into full lockout',
      'Lower under control to top of delts'
    ],
    svgIconType: 'overhead'
  },
  {
    id: 'dumbbell_rear_delt_flye',
    name: 'Bent-Over Dumbbell Rear Delt Flye',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Back'],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Essential for capping the posterior shoulder and preventing forward posture slouch.',
    cues: [
      'Hinge forward until torso is nearly parallel to floor',
      'Slight bend in elbows, palms facing inward',
      'Raise arms wide out to sides leading with elbows and pinkies',
      'Avoid shrugging with upper traps; focus purely on rear deltoids'
    ],
    svgIconType: 'overhead'
  },
  {
    id: 'dumbbell_goblet_squat',
    name: 'Dumbbell Goblet Squat',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Abs & Core'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Front-loaded dumbbell squat encouraging upright posture and deep quad stretch.',
    cues: [
      'Hold heavy dumbbell vertically against sternum like a goblet',
      'Feet slightly wider than shoulder width with toes turned out',
      'Sit down between hips, letting elbows slide inside knees at bottom',
      'Drive through floor to return to standing lockout'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'dumbbell_romanian_deadlift',
    name: 'Dumbbell Romanian Deadlift (RDL)',
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Back', 'Forearms'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Provides independent dumbbell tracking along legs for maximum hamstring stretch.',
    cues: [
      'Hold dumbbells against front of thighs with slight knee unlock',
      'Push hips straight back as if touching wall behind you',
      'Keep dumbbells skimming down shins until deep hamstring stretch',
      'Drive hips forward forcefully to lockout'
    ],
    svgIconType: 'deadlift'
  },
  {
    id: 'dumbbell_bulgarian_split_squat',
    name: 'Dumbbell Bulgarian Split Squat',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'The premier single-leg hypertrophy exercise with dumbbells held at sides.',
    cues: [
      'Rear foot elevated on bench, holding dumbbells at sides',
      'Descend until front thigh is parallel to floor and back knee hovers',
      'Drive up through front heel; keep shoulders pulled back',
      'Maintain steady balance and slow eccentric cadence'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'dumbbell_walking_lunges',
    name: 'Dumbbell Walking Lunges',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves'],
    equipment: 'Dumbbell',
    tier: 'Compound',
    description: 'Dynamic lower body mass builder building functional quad and glute power.',
    cues: [
      'Take controlled forward stride, dropping rear knee to 1 inch above floor',
      'Keep front shin vertical and torso upright',
      'Push off front foot directly into next forward stride',
      'Hold dumbbells steady at sides without swinging'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'alternating_dumbbell_curl',
    name: 'Standing Alternating Dumbbell Curl',
    primaryMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Supinating dumbbell curl maximizing both elbow flexion and radioulnar supination.',
    cues: [
      'Start with dumbbells at sides with neutral grip',
      'As you curl up, rotate wrist outward so pinky is higher than thumb at top',
      'Squeeze bicep peak hard for 1 second',
      'Lower slowly while rotating back to neutral'
    ],
    svgIconType: 'curl'
  },
  {
    id: 'dumbbell_hammer_curl',
    name: 'Standing Dumbbell Hammer Curl',
    primaryMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Neutral grip isolating the brachialis under the bicep to push upper arm thickness.',
    cues: [
      'Palms face each other throughout entire repetition',
      'Pin elbows to sides of ribs without hip swinging',
      'Curl dumbbells to upper chest level and squeeze hard',
      'Lower under strict 2-3 second control'
    ],
    svgIconType: 'curl'
  },
  {
    id: 'dumbbell_overhead_triceps_ext',
    name: 'Dumbbell Overhead Triceps Extension (Two-Hand)',
    primaryMuscle: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Severe long-head triceps stretch with heavy single dumbbell held overhead.',
    cues: [
      'Hold single heavy dumbbell vertically behind head with hands cupped under plate',
      'Keep elbows pointing relatively forward and up',
      'Lower dumbbell behind neck until full tricep stretch',
      'Extend elbows back to overhead lockout'
    ],
    svgIconType: 'overhead'
  },
  {
    id: 'dumbbell_skullcrushers',
    name: 'Flat Bench Dumbbell Skullcrushers',
    primaryMuscle: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Neutral-grip lying tricep extension easy on elbows while delivering massive pump.',
    cues: [
      'Lie flat holding dumbbells with palms facing each other above shoulders',
      'Angle upper arms back 10 degrees toward head',
      'Hinge at elbows, lowering bells down to sides of ears',
      'Extend back to angled lockout without moving upper arms'
    ],
    svgIconType: 'bench'
  },
  {
    id: 'dumbbell_standing_calf_raise',
    name: 'Dumbbell Standing Single-Leg Calf Raise',
    primaryMuscle: 'Calves',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Loaded single-leg calf raise with dumbbell in working hand for progressive overload.',
    cues: [
      'Stand on ball of foot over ledge holding dumbbell on same side',
      'Drop heel down for full loaded 2-second stretch',
      'Drive high onto big toe for peak calf contraction',
      'Perform 12-15 reps per leg'
    ],
    svgIconType: 'squat'
  },
  {
    id: 'dumbbell_weighted_crunch',
    name: 'Dumbbell Weighted Floor Crunch',
    primaryMuscle: 'Abs & Core',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    tier: 'Isolation',
    description: 'Progressive overload on rectus abdominis holding dumbbell on upper chest.',
    cues: [
      'Lie supine with knees bent and feet flat on floor',
      'Hold dumbbell securely across upper chest',
      'Curl shoulders and upper back off floor, flexing spine into tight ball',
      'Exhale and squeeze abs at top before lowering slowly'
    ],
    svgIconType: 'pull'
  }
];

export function cleanGympaxMuscleName(rawMuscle?: string): string {
  if (!rawMuscle) return 'Full Body';
  const cleaned = rawMuscle
    .replace(/Fix_$/i, '')
    .replace(/[_\]\s]+$/g, '')
    .trim();
  if (!cleaned || cleaned === '.') return 'Full Body';
  if (cleaned.toLowerCase() === 'shoulder') return 'Shoulders';
  return cleaned;
}

export function mapGympaxMuscleToMuscleGroup(rawMuscle: string, name: string): MuscleGroup {
  const m = cleanGympaxMuscleName(rawMuscle).toLowerCase();
  const n = name.toLowerCase();

  if (m === 'chest') return 'Chest';
  if (m === 'back') return 'Back';
  if (m.includes('shoulder') || m === 'neck') return 'Shoulders';
  if (m === 'biceps') return 'Biceps';
  if (m === 'triceps') return 'Triceps';
  if (m === 'forearms') return 'Forearms';
  if (m === 'calves') return 'Calves';
  if (m === 'waist' || m === 'abs' || m === 'core' || m === 'abs & core') return 'Abs & Core';
  if (m === 'hips' || m === 'glutes') return 'Glutes';
  if (m === 'quads' || m === 'quadriceps') return 'Quads';
  if (m === 'hamstrings') return 'Hamstrings';
  if (m === 'full body' || m === 'fullbody') return 'Full Body';
  if (m === 'cardio') return 'Cardio';

  if (m === 'upper arms') {
    if (
      n.includes('tricep') ||
      n.includes('pushdown') ||
      n.includes('pressdown') ||
      n.includes('extension') ||
      n.includes('skull') ||
      n.includes('dip') ||
      n.includes('kickback') ||
      n.includes('close grip') ||
      n.includes('close-grip') ||
      n.includes('jm press') ||
      n.includes('french press')
    ) {
      return 'Triceps';
    }
    return 'Biceps';
  }

  if (m === 'thighs') {
    if (
      n.includes('hamstring') ||
      n.includes('leg curl') ||
      n.includes('romanian') ||
      n.includes('rdl') ||
      n.includes('stiff leg') ||
      n.includes('stiff-leg') ||
      n.includes('good morning') ||
      n.includes('glute-ham')
    ) {
      return 'Hamstrings';
    }
    if (n.includes('glute') || n.includes('hip thrust') || n.includes('bridge')) {
      return 'Glutes';
    }
    return 'Quads';
  }

  // Fallback inference from exercise name for Cardio / Plyometrics / Weightlifting / Reels
  if (n.includes('bench') || n.includes('chest') || n.includes('push-up') || n.includes('push up') || n.includes('fly')) return 'Chest';
  if (n.includes('row') || n.includes('pulldown') || n.includes('pull-up') || n.includes('pull up') || n.includes('chin-up') || n.includes('lat ')) return 'Back';
  if (n.includes('shoulder') || n.includes('delt') || n.includes('lateral raise') || n.includes('overhead') || n.includes('military')) return 'Shoulders';
  if (n.includes('tricep') || n.includes('pushdown') || n.includes('dip')) return 'Triceps';
  if (n.includes('curl') || n.includes('bicep')) return 'Biceps';
  if (n.includes('forearm') || n.includes('wrist')) return 'Forearms';
  if (n.includes('crunch') || n.includes('sit-up') || n.includes('plank') || n.includes('ab ') || n.includes('twist') || n.includes('core')) return 'Abs & Core';
  if (n.includes('calf') || n.includes('calves')) return 'Calves';
  if (n.includes('glute') || n.includes('hip')) return 'Glutes';
  if (n.includes('hamstring') || n.includes('deadlift')) return 'Hamstrings';
  return 'Quads';
}

function inferEquipmentFromGympax(name: string, id: string): Equipment {
  const text = `${name} ${id}`.toLowerCase();
  if (text.includes('smith')) return 'Smith Machine';
  if (
    text.includes('barbell') ||
    text.includes('ez bar') ||
    text.includes('ez-bar') ||
    text.includes('ez_bar') ||
    text.includes('olympic') ||
    text.includes('trap bar') ||
    text.includes('snatch') ||
    text.includes('clean and jerk')
  ) {
    return 'Barbell';
  }
  if (text.includes('kettlebell')) {
    return 'Kettlebell';
  }
  if (text.includes('dumbbell') || text.includes('db ')) {
    return 'Dumbbell';
  }
  if (text.includes('cable') || text.includes('band') || text.includes('rope') || text.includes('pulley')) {
    return 'Cable';
  }
  if (
    text.includes('lever') ||
    text.includes('machine') ||
    text.includes('sled') ||
    text.includes('assisted') ||
    text.includes('hack') ||
    text.includes('pec deck') ||
    text.includes('elliptical') ||
    text.includes('bike') ||
    text.includes('treadmill') ||
    text.includes('ergometer')
  ) {
    return 'Machine';
  }
  if (text.includes('weighted') || text.includes('medicine ball') || text.includes('plate') || text.includes('sandbag')) {
    return 'Weighted';
  }
  return 'Bodyweight';
}

function inferSecondaryMuscles(primary: MuscleGroup, name: string): MuscleGroup[] {
  const n = name.toLowerCase();
  switch (primary) {
    case 'Chest':
      return n.includes('fly') ? ['Shoulders'] : ['Triceps', 'Shoulders'];
    case 'Back':
      return n.includes('deadlift') ? ['Hamstrings', 'Glutes', 'Forearms'] : ['Biceps', 'Forearms'];
    case 'Shoulders':
      return n.includes('press') ? ['Triceps'] : ['Back'];
    case 'Biceps':
      return ['Forearms'];
    case 'Triceps':
      return n.includes('dip') || n.includes('press') ? ['Chest', 'Shoulders'] : [];
    case 'Quads':
      return ['Glutes', 'Hamstrings'];
    case 'Hamstrings':
      return ['Glutes', 'Back'];
    case 'Glutes':
      return ['Hamstrings', 'Quads'];
    case 'Calves':
      return [];
    case 'Abs & Core':
      return [];
    case 'Forearms':
      return ['Biceps'];
    default:
      return [];
  }
}

function inferTier(primary: MuscleGroup, name: string): 'Compound' | 'Isolation' {
  const n = name.toLowerCase();
  if (
    n.includes('press') ||
    n.includes('squat') ||
    n.includes('deadlift') ||
    n.includes('row') ||
    n.includes('pull-up') ||
    n.includes('pull up') ||
    n.includes('chin-up') ||
    n.includes('chin up') ||
    n.includes('pulldown') ||
    n.includes('dip') ||
    n.includes('lunge') ||
    n.includes('step-up') ||
    n.includes('thrust') ||
    n.includes('clean') ||
    n.includes('snatch') ||
    n.includes('push-up') ||
    n.includes('push up')
  ) {
    return 'Compound';
  }
  if (primary === 'Biceps' || primary === 'Triceps' || primary === 'Calves' || primary === 'Forearms') {
    return 'Isolation';
  }
  return 'Isolation';
}

function inferSvgIconType(
  primary: MuscleGroup,
  name: string
): 'bench' | 'squat' | 'deadlift' | 'overhead' | 'pull' | 'curl' | 'dip' | 'cable' {
  const n = name.toLowerCase();
  if (n.includes('dip')) return 'dip';
  if (n.includes('deadlift') || n.includes('rdl') || n.includes('good morning')) return 'deadlift';
  if (n.includes('squat') || n.includes('lunge') || n.includes('leg press') || primary === 'Quads' || primary === 'Calves' || primary === 'Glutes') return 'squat';
  if (n.includes('curl') || primary === 'Biceps' || primary === 'Forearms') return 'curl';
  if (n.includes('cable') || n.includes('pushdown') || n.includes('fly')) return 'cable';
  if (primary === 'Shoulders' || n.includes('overhead')) return 'overhead';
  if (primary === 'Chest' || n.includes('bench')) return 'bench';
  return 'pull';
}

function buildDefaultCues(name: string, targetMuscle: string, equipment: Equipment): string[] {
  return [
    `Set up securely with ${equipment.toLowerCase()} positioning and brace your core before initiating ${name}`,
    `Initiate the concentric phase by contracting the ${targetMuscle.toLowerCase()} smoothly without momentum`,
    `Hold peak contraction briefly while maintaining stable joint alignment`,
    `Control the eccentric return over 2-3 seconds for maximum ${targetMuscle.toLowerCase()} fiber recruitment`
  ];
}

// Canonical mapping of legacy or shorthand exercise IDs to their exact entry ID in gympax_exercises.json
export const LEGACY_ID_TO_GYMPAX_ID: Record<string, string> = {
  barbell_bench_press: 'barbell_bench_press',
  incline_dumbbell_press: 'dumbbell_incline_bench_press',
  cable_pec_flye: 'cable_standing_fly',
  weighted_chest_dips: 'chest_dip',
  barbell_deadlift: 'barbell_deadlift',
  barbell_bent_row: 'barbell_bent_over_row',
  lat_pulldown_wide: 'cable_wide_grip_lat_pulldown_(female)',
  seated_cable_row: 'cable_seated_row_with_v_bar',
  seated_cable_row_close: 'cable_seated_row_with_v_bar',
  chest_supported_tbar_row: 'lever_t_bar_row_(plate_loaded)',
  overhead_barbell_press: 'barbell_seated_overhead_press',
  dumbbell_lateral_raise: 'dumbbell_lateral_raise',
  face_pull_rope: 'band_face_pull',
  seated_dumbbell_shoulder_press: 'dumbbell_seated_shoulder_press',
  barbell_back_squat: 'barbell_full_squat_(back_pov)',
  hack_squat_machine: 'sled_hack_squat',
  romanian_deadlift_barbell: 'barbell_romanian_deadlift',
  seated_leg_curl: 'lever_lying_leg_curl',
  lying_leg_curl: 'lever_lying_leg_curl',
  leg_extension_machine: 'lever_leg_extension',
  leg_press_45: 'sled_45_degrees_leg_press_(side_pov)',
  standing_calf_raise: 'barbell_standing_calf_raise',
  standing_barbell_curl: 'barbell_curl',
  incline_dumbbell_curl: 'dumbbell_incline_biceps_curl',
  hammer_curl_cable_rope: 'cable_hammer_curl_(with_rope)_(male)',
  hammer_curl_dumbbell: 'dumbbell_hammer_curl',
  triceps_rope_pushdown: 'cable_pushdown_(with_rope_attachment)',
  skullcrushers_ez_bar: 'barbell_lying_triceps_extension_skull_crusher',
  skull_crusher_ez_bar: 'barbell_lying_triceps_extension_skull_crusher',
  cable_overhead_triceps_ext: 'cable_high_pulley_overhead_tricep_extension',
  cable_overhead_triceps_extension: 'cable_high_pulley_overhead_tricep_extension',
  hanging_leg_raise: 'hanging_straight_leg_raise',
  cable_woodchopper: 'cable_twist_(down_up)',
  cable_crunch_kneeling: 'cable_tuck_reverse_crunch',
  cable_rope_crunch: 'cable_standing_crunch_(with_rope_attachment)_(female)',
  push_ups_standard: 'push_up_m',
  bodyweight_pushup: 'push_up_m',
  decline_push_ups: 'decline_push_up',
  diamond_push_ups: 'diamond_push_up',
  bench_chair_dips: 'bench_dip_on_floor',
  pike_push_ups: 'pike_push_up',
  wall_handstand_hold: 'handstand_push_up',
  inverted_bodyweight_row: 'inverted_row_between_chairs',
  pull_ups_bodyweight: 'pull_up',
  chin_ups_bodyweight: 'chin_up',
  doorframe_towel_row: 'seated_row_with_towel',
  bodyweight_air_squat: 'bodyweight_squat_(male)',
  bulgarian_split_squat_bodyweight: 'bulgarian_split_squat',
  bodyweight_sissy_squat: 'sissy_squat_bodyweight',
  single_leg_glute_bridge: 'single_leg_glute_bridge_with_knee_to_chest',
  bodyweight_single_leg_rdl: 'single_leg_deadlift_with_knee_lift',
  standing_single_leg_calf_raise: 'dumbbell_standing_single_leg_calf_raise',
  plank_core: 'front_plank_toe_tap_(male)',
  plank_weighted: 'front_plank_toe_tap_(male)',
  floor_bicycle_crunches: '45_degree_bycicle_twisting_crunch',
  dumbbell_flat_bench_press: 'dumbbell_bench_press',
  dumbbell_chest_flye: 'dumbbell_fly',
  single_arm_dumbbell_row: 'dumbbell_bent_over_row',
  two_arm_dumbbell_row: 'dumbbell_bent_over_row',
  standing_dumbbell_overhead_press: 'dumbbell_standing_overhead_press',
  dumbbell_rear_delt_flye: 'dumbbell_rear_delt_raise',
  dumbbell_bulgarian_split_squat: 'dumbbell_bulgarian_split_squat_(female)',
  alternating_dumbbell_curl: 'dumbbell_alternate_biceps_curl',
  dumbbell_overhead_triceps_ext: 'dumbbell_standing_triceps_extension',
  dumbbell_skullcrushers: 'dumbbell_lying_floor_skullcrusher',
  dumbbell_weighted_crunch: 'dumbbell_straight_arm_crunch',
  hyperextension_bench: 'hyperextension',
  ex_bench: 'barbell_bench_press',
  ex_incline_db: 'dumbbell_incline_bench_press',
  ex_cable_fly: 'cable_standing_fly',
  ex_overhead_tri: 'cable_high_pulley_overhead_tricep_extension',
  ex_lateral_raise: 'dumbbell_lateral_raise',
  ex_hack: 'sled_hack_squat',
  ex_rdl: 'barbell_romanian_deadlift',
  ex_leg_ext: 'lever_leg_extension',
  ex_ham_curl: 'lever_lying_leg_curl',
  ex_primary: 'barbell_bench_press',
  ex_accessory_1: 'dumbbell_incline_bench_press',
  ex_accessory_2: 'cable_standing_fly'
};

const rawGympaxList = (gympaxExercisesRaw as GympaxRawExercise[]).filter(item => {
  if (!item || !item.id || !item.name) return false;
  const n = item.name.toLowerCase();
  const id = item.id.toLowerCase();
  const pm = (item.primary_muscle || '').toLowerCase();

  // Strictly filter out non-exercise videos, format templates, reels, and video processing files
  if (
    n.includes('video') ||
    n.includes('reel') ||
    n.includes('enhance') ||
    n.includes('format') ||
    id.includes('video') ||
    id.includes('reel') ||
    id.includes('enhance') ||
    id.includes('format') ||
    pm.includes('reel') ||
    pm.includes('video') ||
    pm.includes('format') ||
    pm === '.'
  ) {
    return false;
  }
  return true;
});

const curatedById = new Map<string, ExerciseDefinition>();
for (const ex of LEGACY_CURATED_EXERCISES) {
  curatedById.set(ex.id.toLowerCase(), ex);
  const mappedId = LEGACY_ID_TO_GYMPAX_ID[ex.id.toLowerCase()];
  if (mappedId) {
    curatedById.set(mappedId.toLowerCase(), ex);
  }
}

export const GYMPAX_EXERCISES: ExerciseDefinition[] = rawGympaxList.map(raw => {
  const existing = curatedById.get(raw.id.toLowerCase());
  const cleanedRawMuscle = cleanGympaxMuscleName(raw.primary_muscle);
  const mappedMuscle = existing?.primaryMuscle ?? mapGympaxMuscleToMuscleGroup(raw.primary_muscle, raw.name);
  const inferredEquipment = inferEquipmentFromGympax(raw.name, raw.id);
  const equipment = inferredEquipment !== 'Bodyweight' ? inferredEquipment : (existing?.equipment ?? inferredEquipment);
  const tier = existing?.tier ?? inferTier(mappedMuscle, raw.name);

  return {
    id: raw.id,
    name: raw.name,
    primaryMuscle: mappedMuscle,
    primary_muscle: raw.primary_muscle,
    rawPrimaryMuscle: cleanedRawMuscle,
    secondaryMuscles: existing?.secondaryMuscles ?? inferSecondaryMuscles(mappedMuscle, raw.name),
    equipment,
    tier,
    description:
      existing?.description ??
      `${raw.category || 'Resistance Training'} movement targeting the ${cleanedRawMuscle} (${mappedMuscle}) using ${equipment.toLowerCase()} mechanics.`,
    cues: existing?.cues ?? buildDefaultCues(raw.name, cleanedRawMuscle, equipment),
    svgIconType: existing?.svgIconType ?? inferSvgIconType(mappedMuscle, raw.name),
    cdnUrl: raw.cdn_url,
    cdn_url: raw.cdn_url,
    imageUrl: raw.cdn_url,
    mediaFile: raw.media_file,
    category: raw.category,
    isCustomAllowed: raw.is_custom_allowed
  };
});

const gympaxById = new Map<string, ExerciseDefinition>(
  GYMPAX_EXERCISES.map(ex => [ex.id.toLowerCase(), ex])
);

const gympaxByName = new Map<string, ExerciseDefinition>(
  GYMPAX_EXERCISES.map(ex => [ex.name.toLowerCase(), ex])
);

/**
 * STRICT CATALOG GROUNDING RESOLVER:
 * Resolves any requested exercise ID or movement name strictly to an exact entry in `gympax_exercises.json`.
 * If a niche or legacy movement is not directly in the catalog, substitutes it with the closest matching
 * exercise from `gympax_exercises.json` targeting the same muscle group. Never returns an unlisted exercise.
 */
export function resolveCatalogExercise(
  idOrName?: string,
  fallbackMuscle?: MuscleGroup | string,
  preferredEquipment?: Equipment
): ExerciseDefinition {
  if (idOrName) {
    const key = idOrName.toLowerCase().trim();

    // 1. Exact ID match in gympax_exercises.json
    const exactId = gympaxById.get(key);
    if (exactId) return exactId;

    // 2. Exact Name match in gympax_exercises.json
    const exactName = gympaxByName.get(key);
    if (exactName) return exactName;

    // 3. Direct canonical substitution map
    const mappedId = LEGACY_ID_TO_GYMPAX_ID[key];
    if (mappedId) {
      const mappedEx = gympaxById.get(mappedId.toLowerCase());
      if (mappedEx) return mappedEx;
    }
  }

  // 4. Fallback Rule: Find closest matching exercise from gympax_exercises.json targeting the same muscle group
  const legacyHint = idOrName ? LEGACY_CURATED_EXERCISES.find(l => l.id.toLowerCase() === idOrName.toLowerCase().trim()) : undefined;
  const targetMuscleGroup =
    legacyHint?.primaryMuscle ||
    (fallbackMuscle ? mapGympaxMuscleToMuscleGroup(String(fallbackMuscle), idOrName || '') : undefined) ||
    (idOrName ? mapGympaxMuscleToMuscleGroup('', idOrName) : 'Chest');
  const targetEquipment = preferredEquipment || legacyHint?.equipment;

  const stopWords = new Set(['the', 'and', 'with', 'for', 'version', 'male', 'female', 'exercise', 'guide']);
  const tokens = (idOrName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  let best: ExerciseDefinition | undefined;
  let bestScore = -1;

  for (const candidate of GYMPAX_EXERCISES) {
    let score = 0;
    if (candidate.primaryMuscle === targetMuscleGroup) {
      score += 20;
    } else if (
      fallbackMuscle &&
      (candidate.rawPrimaryMuscle?.toLowerCase().includes(String(fallbackMuscle).toLowerCase()) ||
        candidate.primary_muscle?.toLowerCase().includes(String(fallbackMuscle).toLowerCase()))
    ) {
      score += 18;
    }
    if (targetEquipment && candidate.equipment === targetEquipment) {
      score += 6;
    }
    const hay = `${candidate.id} ${candidate.name}`.toLowerCase();
    for (const tok of tokens) {
      if (hay.includes(tok)) {
        score += 8;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best || GYMPAX_EXERCISES[0];
}

function matchesEquipmentPlanCategory(
  ex: ExerciseDefinition,
  category: EquipmentPlanCategory
): boolean {
  const hay = `${ex.id} ${ex.name}`.toLowerCase();
  const hasCommercialMachineOrCable =
    hay.includes('cable') ||
    hay.includes('machine') ||
    hay.includes('lever') ||
    hay.includes('sled') ||
    hay.includes('smith') ||
    hay.includes('pulley');

  switch (category) {
    case 'commercial_gym':
      return true;
    case 'cable_machine':
      return (
        ex.equipment === 'Cable' ||
        hay.includes('cable') ||
        hay.includes('pulley') ||
        hay.includes('crossover') ||
        hay.includes('pushdown') ||
        hay.includes('pulldown')
      );
    case 'kettlebell_only':
      return (
        hay.includes('kettlebell') ||
        ex.equipment === 'Kettlebell'
      );
    case 'bodyweight_only':
      return (
        ex.equipment === 'Bodyweight' &&
        !hasCommercialMachineOrCable &&
        !hay.includes('barbell') &&
        !hay.includes('dumbbell') &&
        !hay.includes('kettlebell') &&
        !hay.includes('ez bar') &&
        !hay.includes('ez_bar')
      );
    case 'dumbbells_only':
      return (
        ex.equipment === 'Dumbbell' &&
        !hasCommercialMachineOrCable &&
        !hay.includes('barbell') &&
        !hay.includes('kettlebell')
      );
    case 'free_weights_only':
      return (
        (ex.equipment === 'Barbell' || ex.equipment === 'Dumbbell' || ex.equipment === 'Kettlebell') &&
        !hasCommercialMachineOrCable
      );
    case 'home_gym':
      return (
        (ex.equipment === 'Barbell' ||
          ex.equipment === 'Dumbbell' ||
          ex.equipment === 'Bodyweight' ||
          ex.equipment === 'Kettlebell') &&
        !hasCommercialMachineOrCable
      );
    default:
      return true;
  }
}

/**
 * Grounds every exercise in a DailyWorkoutRoutine strictly to `gympax_exercises.json`,
 * populating its exact `id`, `exerciseId`, `name`, `primary_muscle`, and `cdn_url`.
 */
export function groundRoutineExercises(
  routine: DailyWorkoutRoutine,
  strictMuscleGroup?: MuscleGroup,
  strictEquipmentCategory?: EquipmentPlanCategory
): DailyWorkoutRoutine {
  return {
    ...routine,
    exercises: routine.exercises.map(item => {
      let resolved = resolveCatalogExercise(
        item.id || item.exerciseId || item.name,
        strictMuscleGroup || item.primary_muscle
      );
      if (strictMuscleGroup && resolved.primaryMuscle !== strictMuscleGroup) {
        const sameMuscleCandidates = GYMPAX_EXERCISES.filter(
          ex => ex.primaryMuscle === strictMuscleGroup
        );
        if (sameMuscleCandidates.length > 0) {
          const query = (item.id || item.exerciseId || item.name || '').toLowerCase();
          const tokens = query.replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(t => t.length > 2);
          let bestMatch = sameMuscleCandidates[0];
          let bestScore = -1;
          for (const cand of sameMuscleCandidates) {
            let score = 0;
            const hay = `${cand.id} ${cand.name}`.toLowerCase();
            for (const tok of tokens) {
              if (hay.includes(tok)) score += 10;
            }
            if (!cand.name.toLowerCase().includes('stretch')) score += 3;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = cand;
            }
          }
          resolved = bestMatch;
        }
      }
      if (strictEquipmentCategory && !matchesEquipmentPlanCategory(resolved, strictEquipmentCategory)) {
        const validEquipmentCandidates = GYMPAX_EXERCISES.filter(ex =>
          matchesEquipmentPlanCategory(ex, strictEquipmentCategory)
        );
        if (validEquipmentCandidates.length > 0) {
          const targetMuscle = strictMuscleGroup || resolved.primaryMuscle;
          const query = (item.id || item.exerciseId || item.name || '').toLowerCase();
          const tokens = query.replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(t => t.length > 2);
          let bestMatch = validEquipmentCandidates[0];
          let bestScore = -1;
          for (const cand of validEquipmentCandidates) {
            let score = 0;
            if (cand.primaryMuscle === targetMuscle) score += 25;
            const hay = `${cand.id} ${cand.name}`.toLowerCase();
            for (const tok of tokens) {
              if (hay.includes(tok)) score += 10;
            }
            if (!cand.name.toLowerCase().includes('stretch')) score += 3;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = cand;
            }
          }
          resolved = bestMatch;
        }
      }
      return {
        ...item,
        id: resolved.id,
        exerciseId: resolved.id,
        name: resolved.name,
        primary_muscle: resolved.primary_muscle || resolved.rawPrimaryMuscle || resolved.primaryMuscle,
        cdn_url: resolved.cdn_url || resolved.cdnUrl || ''
      };
    })
  };
}

/**
 * Grounds all routines and exercises in a WorkoutPlan strictly to `gympax_exercises.json`.
 */
export function groundWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  return {
    ...plan,
    thumbnail_url: getUniquePlanThumbnailUrl(plan),
    routines: plan.routines.map(r =>
      groundRoutineExercises(r, plan.targetMuscleGroup, plan.targetEquipmentCategory)
    )
  };
}

// Strict Catalog Constraint: BASE_EXERCISE_DATABASE contains ONLY exercises from gympax_exercises.json
export const BASE_EXERCISE_DATABASE: ExerciseDefinition[] = [...GYMPAX_EXERCISES];

export const RAW_GYMPAX_MUSCLES: string[] = Array.from(
  new Set(GYMPAX_EXERCISES.map(ex => ex.rawPrimaryMuscle || ex.primaryMuscle))
).sort();

export function findExerciseDefinition(
  exerciseIdOrName?: string,
  fallbackMuscle?: MuscleGroup | string
): ExerciseDefinition | undefined {
  if (!exerciseIdOrName) return undefined;
  const key = exerciseIdOrName.toLowerCase().trim();
  const direct =
    EXERCISE_DATABASE.find(ex => ex.id.toLowerCase() === key) ||
    EXERCISE_DATABASE.find(ex => ex.name.toLowerCase() === key);
  if (direct) return direct;
  return resolveCatalogExercise(exerciseIdOrName, fallbackMuscle);
}

function loadSavedCustomExercisesFromStorage(): ExerciseDefinition[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('aesthetix_custom_exercises');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((ex: ExerciseDefinition) => ({ ...ex, isCustom: true }));
      }
    }
  } catch {
    // ignore storage read errors
  }
  return [];
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = (() => {
  const custom = loadSavedCustomExercisesFromStorage();
  const customIds = new Set(custom.map(c => c.id));
  return [
    ...custom,
    ...BASE_EXERCISE_DATABASE.filter(b => !customIds.has(b.id))
  ];
})();

export function syncExerciseDatabase(customList?: ExerciseDefinition[]): ExerciseDefinition[] {
  const custom = (customList ?? loadSavedCustomExercisesFromStorage()).map(ex => ({
    ...ex,
    isCustom: true
  }));
  const customIds = new Set(custom.map(c => c.id));
  const merged = [
    ...custom,
    ...BASE_EXERCISE_DATABASE.filter(b => !customIds.has(b.id))
  ];
  EXERCISE_DATABASE.splice(0, EXERCISE_DATABASE.length, ...merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gympax:exercises-updated', { detail: custom }));
  }
  return EXERCISE_DATABASE;
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Abs & Core',
  'Forearms',
  'Full Body',
  'Cardio'
];

export const EQUIPMENT_LIST: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Smith Machine',
  'Bodyweight',
  'Weighted'
];
