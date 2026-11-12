import { MuscleGroup } from '../types';

export interface MobilityExercise {
  id: string;
  name: string;
  targetMuscles: MuscleGroup[];
  focusJoint: string;
  intensity: 'Gentle' | 'Moderate' | 'Dynamic';
  durationDefaultSec: number;
  repsOrHold: string;
  whyItMatters: string;
  cues: string[];
  equipmentNeeded: 'Bodyweight' | 'Mat / Floor' | 'Wall / Doorframe' | 'Pull-Up Bar (Hang)';
  cdnUrl?: string;
  cdn_url?: string;
}

export const WARMUP_VIDEOS: Record<string, string> = {
  dynamic_arm_swings_pec_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Back-Slaps-Wrap-Arround-Stretch_Back.mp4',
  scapular_push_up_plus: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Cat-Stretch-m_Back.mp4',
  doorway_pec_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Back-Pec-Stretch-(female)_Back.mp4',
  prone_y_t_w_raises: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Backhand-Raise-(female)_Back.mp4',
  side_lying_rotator_rotations: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/-Kneeling-Back-Rotation-Stretch-(female)_Back.mp4',
  wall_overhead_slides: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Scapular-Slide-Back-to-Wall_Back_.mp4',
  cat_cow_thoracic_rotations: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Cat-Stretch-m_Back.mp4',
  deadhang_scap_pullups: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Fixed-Bar-Back-Stretch_Back.mp4',
  bench_lat_prayer_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Kneeling-Lat-Stretch_Back.mp4',
  dynamic_back_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Dynamic-Back-Stretch-(male)_Back.mp4',
  standing_quad_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Quadriceps-Stretch-(female)_Thighs.mp4',
  wall_ankle_dorsiflexion: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Calf-Stretch-With-Hands-Against-Wall_Calves_.mp4',
  side_lunge_adductor_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Side-Lunge-Stretch-(female)_Thighs.mp4',
  standing_hamstring_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Hamstring-Stretch_Thighs.mp4',
  calf_push_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Calf-Push-Stretch-With-Hands-Against-Wall_Calves_.mp4',
  dynamic_leg_swings_hamstring: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Flexion-And-Extension-Hip-Stretch-(male)_Hips.mp4',
  hip_90_90_flow: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/-Kneeling-Back-Rotation-Stretch-(female)_Back.mp4',
  adductor_groin_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Adductor-Stretch-(female)_Hips.mp4',
  cossack_squat_adductor_rocker: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Side-Lunge-Stretch-(female)_Thighs.mp4',
  wrist_flexor_extensor_waves: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Wrist-Flexor-Stretch-(female)_Forearms_.mp4',
  overhead_triceps_lat_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Overhead-Triceps-Stretch_Upper-Arms.mp4',
  bird_dog_isometric_brace: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Bird-Dog-male_Back.mp4',
  deadbug_anti_extension: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Abdominal-Stretch-(female)_Waist.mp4',
  worlds_greatest_stretch: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/-Kneeling-Back-Rotation-Stretch-(female)_Back.mp4',
  deep_bodyweight_squat_pry: 'https://cdn.jsdelivr.net/gh/x-fitt/gympax-assets@main/gifs/Side-Lunge-Stretch-(female)_Thighs.mp4'
};

export const MOBILITY_DATABASE: MobilityExercise[] = [
  // CHEST & ANTERIOR SHOULDER
  {
    id: 'dynamic_arm_swings_pec_stretch',
    name: 'Dynamic Arm Swings & Chest Cross Stretch',
    targetMuscles: ['Chest', 'Shoulders'],
    focusJoint: 'Glenohumeral & Rotator Cuff',
    intensity: 'Dynamic',
    durationDefaultSec: 45,
    repsOrHold: '2 sets × 12-15 swings',
    whyItMatters: 'Activates chest and posterior shoulder stabilizers with pure dynamic bodyweight motion before lifting.',
    cues: [
      'Stand tall with feet shoulder-width apart and relax shoulders down',
      'Swing arms wide to open chest, feeling a dynamic stretch across the pectorals',
      'Cross arms in front of your chest alternating top and bottom arm smoothly'
    ],
    equipmentNeeded: 'Bodyweight'
  },
  {
    id: 'scapular_push_up_plus',
    name: 'Scapular Plank & Serratus Stretch',
    targetMuscles: ['Chest', 'Shoulders', 'Abs & Core'],
    focusJoint: 'Scapulothoracic Joint & Serratus',
    intensity: 'Moderate',
    durationDefaultSec: 40,
    repsOrHold: '2 sets × 10 reps',
    whyItMatters: 'Fires up the serratus anterior to ensure smooth scapular upward rotation and prevent shoulder impingement.',
    cues: [
      'Assume a solid high plank position or quadruped stance with core braced',
      'Keep arms locked straight and allow chest to sink toward floor (retraction)',
      'Press the floor away aggressively, protracting your shoulder blades at top'
    ],
    equipmentNeeded: 'Bodyweight'
  },
  {
    id: 'doorway_pec_stretch',
    name: 'Standing Chest & Pec Wall Stretch',
    targetMuscles: ['Chest', 'Shoulders'],
    focusJoint: 'Anterior Capsule & Pec Minor',
    intensity: 'Gentle',
    durationDefaultSec: 45,
    repsOrHold: '30s per side',
    whyItMatters: 'Alleviates rounded-shoulder posture and opens up pectoral muscle fibers for full active range of motion.',
    cues: [
      'Place forearm and palm flat against a wall or doorframe at shoulder height',
      'Gently step forward until a mild stretch is felt across the chest wall',
      'Breathe deeply into ribcage and avoid over-twisting the lumbar spine'
    ],
    equipmentNeeded: 'Wall / Doorframe'
  },

  // SHOULDERS & ROTATOR CUFF
  {
    id: 'prone_y_t_w_raises',
    name: 'Prone Scapular Y-T-W Floor Stretch',
    targetMuscles: ['Shoulders', 'Back'],
    focusJoint: 'Lower Trapezius & Rotator Cuff',
    intensity: 'Moderate',
    durationDefaultSec: 50,
    repsOrHold: '2 sets × 8 reps each shape',
    whyItMatters: 'Strengthens mid/lower traps and infraspinatus to establish an active, stable upper-back posture.',
    cues: [
      'Lie face down on a mat with thumbs pointed up toward the ceiling',
      'Raise arms in a Y position pinching lower blades, hold for 1 sec',
      'Transition to T (perpendicular) and W (elbows tucked), focusing on blade control'
    ],
    equipmentNeeded: 'Mat / Floor'
  },
  {
    id: 'side_lying_rotator_rotations',
    name: 'Kneeling Thoracic & Shoulder Rotation Stretch',
    targetMuscles: ['Shoulders', 'Back'],
    focusJoint: 'Infraspinatus & Teres Minor',
    intensity: 'Gentle',
    durationDefaultSec: 40,
    repsOrHold: '12 reps per side',
    whyItMatters: 'Mobilizes external rotators and thoracic rotation to ensure smooth shoulder mechanics.',
    cues: [
      'Kneel on all fours and place one hand lightly behind your head',
      'Rotate thoracic spine upward, pointing elbow toward the ceiling',
      'Follow your elbow with your eyes and keep hips square and stable'
    ],
    equipmentNeeded: 'Bodyweight'
  },
  {
    id: 'wall_overhead_slides',
    name: 'Wall Overhead Slide & Shoulder Opener',
    targetMuscles: ['Shoulders', 'Back'],
    focusJoint: 'Thoracic Extension & Deltoid Control',
    intensity: 'Moderate',
    durationDefaultSec: 45,
    repsOrHold: '10 smooth reps',
    whyItMatters: 'Restores thoracic spine extension and overhead reach freedom without arching the lower back.',
    cues: [
      'Back flat against the wall, heels 4 inches out, lower back gently flat',
      'Keep forearms and back of wrists in contact with wall',
      'Slide arms upward into an overhead V, pausing for 2 seconds at full extension'
    ],
    equipmentNeeded: 'Wall / Doorframe'
  },

  // BACK & LATS
  {
    id: 'cat_cow_thoracic_rotations',
    name: 'Cat-Cow Spine & Thoracic Mobility Stretch',
    targetMuscles: ['Back', 'Abs & Core'],
    focusJoint: 'Thoracic & Lumbar Spine',
    intensity: 'Gentle',
    durationDefaultSec: 45,
    repsOrHold: '8-10 reps per side',
    whyItMatters: 'Decompresses vertebrae, hydrates intervertebral discs, and unglues the mid-back.',
    cues: [
      'Begin on hands and knees with hands under shoulders and knees under hips',
      'Inhale and drop belly toward the floor, lifting chest and tailbone (cow)',
      'Exhale and round spine upward toward the ceiling, tucking chin to chest (cat)'
    ],
    equipmentNeeded: 'Bodyweight'
  },
  {
    id: 'deadhang_scap_pullups',
    name: 'Overhead Bar Hang & Spinal Decompression Stretch',
    targetMuscles: ['Back', 'Forearms'],
    focusJoint: 'Latissimus Dorsi & Glenohumeral Traction',
    intensity: 'Moderate',
    durationDefaultSec: 40,
    repsOrHold: '2 sets × 30s hang',
    whyItMatters: 'Decompresses the entire spine, elongates the lats, and warms up grip and shoulder flexibility.',
    cues: [
      'Hang passively from a pull-up bar with an overhand grip, relaxed shoulders',
      'Breathe deeply into your abdomen and allow gravity to lengthen your spine',
      'Hold for 25-30 seconds, then step down with control'
    ],
    equipmentNeeded: 'Pull-Up Bar (Hang)'
  },
  {
    id: 'bench_lat_prayer_stretch',
    name: 'Kneeling Lat & Tricep Prayer Stretch',
    targetMuscles: ['Back', 'Triceps'],
    focusJoint: 'Lat Insertion & Thoracic Extension',
    intensity: 'Gentle',
    durationDefaultSec: 45,
    repsOrHold: '2 sets × 35s hold',
    whyItMatters: 'Deeply stretches the latissimus dorsi, teres major, and triceps long head for overhead freedom.',
    cues: [
      'Kneel on the floor with knees wide and sit hips back toward heels',
      'Extend arms long in front with palms flat on the mat or bench edge',
      'Drop chest and head down toward the floor while breathing into ribcage'
    ],
    equipmentNeeded: 'Mat / Floor'
  },
  {
    id: 'dynamic_back_stretch',
    name: 'Standing Dynamic Spine & Back Stretch',
    targetMuscles: ['Back', 'Shoulders'],
    focusJoint: 'Rhomboids, Traps & Spinal Extension',
    intensity: 'Dynamic',
    durationDefaultSec: 45,
    repsOrHold: '2 sets × 12 reps',
    whyItMatters: 'Bodyweight posture primer that recruits rhomboids and opens the anterior chest.',
    cues: [
      'Stand tall with feet hip-width apart and arms relaxed at your sides',
      'Extend arms outward and gently arch back to lengthen the thoracic spine',
      'Sweep arms forward, softly rounding upper back to stretch between shoulder blades'
    ],
    equipmentNeeded: 'Bodyweight'
  },

  // LEGS / QUADS & KNEES
  {
    id: 'standing_quad_stretch',
    name: 'Standing Quadriceps & Hip Flexor Stretch',
    targetMuscles: ['Quads'],
    focusJoint: 'Patellar Tendon & Rectus Femoris',
    intensity: 'Gentle',
    durationDefaultSec: 45,
    repsOrHold: '30s per leg',
    whyItMatters: 'Lengthens the rectus femoris and hip flexors under control to shield knees in deep squats.',
    cues: [
      'Stand on one leg, holding a wall or bar for balance if needed',
      'Bend opposite knee and grasp ankle behind you, gently pulling heel toward glute',
      'Keep knees together and stand tall without arching lower back'
    ],
    equipmentNeeded: 'Bodyweight'
  },
  {
    id: 'wall_ankle_dorsiflexion',
    name: 'Hands-to-Wall Ankle & Calf Stretch',
    targetMuscles: ['Calves', 'Quads'],
    focusJoint: 'Talocrural Joint & Achilles Tendon',
    intensity: 'Gentle',
    durationDefaultSec: 40,
    repsOrHold: '12-15 drives per foot',
    whyItMatters: 'Directly improves ankle dorsiflexion, which is the #1 requirement for squat depth.',
    cues: [
      'Stand facing a wall with palms flat at chest height, stepping one foot back',
      'Keep back heel flat on floor while driving front knee toward wall',
      'Hold 2 seconds, back off, and repeat with controlled oscillatory rhythm'
    ],
    equipmentNeeded: 'Wall / Doorframe'
  },
  {
    id: 'side_lunge_adductor_stretch',
    name: 'Side Lunge Adductor & Knee Mobility Stretch',
    targetMuscles: ['Quads', 'Glutes'],
    focusJoint: 'Knee Joint Capsule & Hip Adductors',
    intensity: 'Moderate',
    durationDefaultSec: 45,
    repsOrHold: '8 reps per side',
    whyItMatters: 'Dynamic frontal-plane mobility stretch that warms the knees and stretches inner thighs.',
    cues: [
      'Step feet wide into a sumo stance with toes angled slightly outward',
      'Shift weight onto one heel, sinking hips down while keeping opposite leg straight',
      'Keep chest tall and heel flat, pausing for 2 seconds at the bottom'
    ],
    equipmentNeeded: 'Bodyweight'
  },

  // HAMSTRINGS & POSTERIOR CHAIN
  {
    id: 'standing_hamstring_stretch',
    name: 'Standing Hamstring & Posterior Chain Stretch',
    targetMuscles: ['Hamstrings', 'Glutes', 'Back'],
    focusJoint: 'Acetabulofemoral (Hip) Hinge',
    intensity: 'Moderate',
    durationDefaultSec: 45,
    repsOrHold: '30s hold per leg',
    whyItMatters: 'Safely mobilizes hamstrings under active tension before squats and deadlifts.',
    cues: [
      'Place one heel forward with toes pointed up and slight bend in back knee',
      'Hinge forward from the hips with a flat neutral back',
      'Reach hands gently toward the front foot until a comfortable stretch is felt'
    ],
    equipmentNeeded: 'Bodyweight'
  },
  {
    id: 'calf_push_stretch',
    name: 'Wall Calf Push & Achilles Tendon Stretch',
    targetMuscles: ['Hamstrings', 'Calves'],
    focusJoint: 'Entire Posterior Kinetic Chain',
    intensity: 'Gentle',
    durationDefaultSec: 45,
    repsOrHold: '30s per leg',
    whyItMatters: 'Lengthens gastrocnemius, soleus, and Achilles tendon to ensure free ankle articulation.',
    cues: [
      'Stand facing a wall with palms pressed against it at eye level',
      'Step one leg straight back, driving the heel firmly into the ground',
      'Keep back leg completely straight and push hips gently toward the wall'
    ],
    equipmentNeeded: 'Wall / Doorframe'
  },
  {
    id: 'dynamic_leg_swings_hamstring',
    name: 'Dynamic Leg Swings & Hip Flexion Stretch',
    targetMuscles: ['Hamstrings', 'Glutes', 'Quads'],
    focusJoint: 'Hip Flexion/Extension Mechanics',
    intensity: 'Dynamic',
    durationDefaultSec: 40,
    repsOrHold: '15 swings per leg',
    whyItMatters: 'Safely prepares hamstring and hip flexor elasticity before high-intensity lifting.',
    cues: [
      'Place one hand against a wall or bar for balance',
      'Swing your inside leg forward and backward smoothly in a pendulum arc',
      'Keep torso upright without excessive arching in the lower back'
    ],
    equipmentNeeded: 'Wall / Doorframe'
  },

  // GLUTES & HIPS
  {
    id: 'hip_90_90_flow',
    name: 'Kneeling Torso & Hip Rotation Stretch',
    targetMuscles: ['Glutes', 'Hamstrings'],
    focusJoint: 'Hip Internal & External Rotation',
    intensity: 'Moderate',
    durationDefaultSec: 50,
    repsOrHold: '8-10 transitions per side',
    whyItMatters: 'Restores rotational mobility inside the hip socket, ensuring symmetric hip drive.',
    cues: [
      'Kneel on all fours and place one hand lightly behind your head',
      'Rotate torso smoothly upward, feeling the stretch through hips and thoracic spine',
      'Breathe deeply and alternate sides with fluid control'
    ],
    equipmentNeeded: 'Mat / Floor'
  },
  {
    id: 'adductor_groin_stretch',
    name: 'Adductor & Inner Thigh Stretch',
    targetMuscles: ['Glutes', 'Abs & Core'],
    focusJoint: 'Pelvic Neutral & Hip Adductors',
    intensity: 'Moderate',
    durationDefaultSec: 45,
    repsOrHold: '30s hold per side',
    whyItMatters: 'Relieves tight inner thighs and groin to permit effortless, pain-free squat depth.',
    cues: [
      'Kneel on a soft mat and extend one leg out directly to the side',
      'Gently shift hips back toward the resting heel to open inner thigh',
      'Maintain steady breathing without bouncing'
    ],
    equipmentNeeded: 'Mat / Floor'
  },
  {
    id: 'cossack_squat_adductor_rocker',
    name: 'Dynamic Adductor & Groin Mobility Stretch',
    targetMuscles: ['Glutes', 'Quads', 'Hamstrings'],
    focusJoint: 'Hip Frontal Plane & Groin Mobility',
    intensity: 'Dynamic',
    durationDefaultSec: 45,
    repsOrHold: '6-8 reps per side',
    whyItMatters: 'Unlocks tight groin and adductor muscles, allowing a wide, stable stance.',
    cues: [
      'Take a wide sumo stance with toes angled slightly out',
      'Shift weight onto one heel, sinking down while keeping opposite leg straight',
      'Keep chest tall and heel flat on the working side before shifting across'
    ],
    equipmentNeeded: 'Bodyweight'
  },

  // TRICEPS, BICEPS & FOREARMS / ELBOWS
  {
    id: 'wrist_flexor_extensor_waves',
    name: 'Wrist Flexor & Forearm Mobility Stretch',
    targetMuscles: ['Forearms', 'Biceps', 'Triceps'],
    focusJoint: 'Radiocarpal Joint & Elbow Common Tendons',
    intensity: 'Gentle',
    durationDefaultSec: 35,
    repsOrHold: '20-30s per arm',
    whyItMatters: 'Relieves forearm tightness and protects elbows and wrists during gripping and pressing.',
    cues: [
      'Extend one arm forward with palm facing up',
      'Gently use opposite hand to pull fingers back toward wrist',
      'Hold steadily feeling stretch through inner forearm, then switch'
    ],
    equipmentNeeded: 'Bodyweight'
  },
  {
    id: 'overhead_triceps_lat_stretch',
    name: 'Overhead Triceps & Lat Stretch',
    targetMuscles: ['Triceps', 'Back'],
    focusJoint: 'Elbow Flexion & Glenohumeral Elevation',
    intensity: 'Gentle',
    durationDefaultSec: 35,
    repsOrHold: '30s per side',
    whyItMatters: 'Ensures the triceps long-head tendon is warm and supple to eliminate elbow irritation.',
    cues: [
      'Reach one elbow toward ceiling, placing hand behind opposite shoulder blade',
      'Gently guide elbow back with opposite hand, engaging core to prevent rib flare',
      'Take slow breaths while feeling the stretch travel down the back of the arm'
    ],
    equipmentNeeded: 'Bodyweight'
  },

  // ABS & CORE / LUMBAR
  {
    id: 'bird_dog_isometric_brace',
    name: 'Bird-Dog Core Stability & Back Reach',
    targetMuscles: ['Abs & Core', 'Glutes', 'Back'],
    focusJoint: 'Lumbopelvic Rhythm & Spine Sparing',
    intensity: 'Moderate',
    durationDefaultSec: 45,
    repsOrHold: '8 reps per side (3s hold)',
    whyItMatters: 'Premier bodyweight spine-sparing primer that activates core and multifidus safely.',
    cues: [
      'Quadruped position on hands and knees with neutral spine',
      'Reach opposite arm forward and leg straight back, forming a pencil-straight line',
      'Hold for 3 seconds with abdomen braced, then return with control'
    ],
    equipmentNeeded: 'Mat / Floor'
  },
  {
    id: 'deadbug_anti_extension',
    name: 'Lying Abdominal & Anterior Core Stretch',
    targetMuscles: ['Abs & Core'],
    focusJoint: 'Anterior Core & Pelvic Alignment',
    intensity: 'Gentle',
    durationDefaultSec: 40,
    repsOrHold: '30s hold',
    whyItMatters: 'Lengthens abdominal wall and decompresses the anterior torso before heavy compound lifts.',
    cues: [
      'Lie face down on a mat with hands under shoulders',
      'Gently press chest upward while keeping hips resting on the floor',
      'Inhale deeply into belly, feeling a stretch across the abdominal muscles'
    ],
    equipmentNeeded: 'Mat / Floor'
  },

  // FULL BODY / PRIMERS
  {
    id: 'worlds_greatest_stretch',
    name: "World's Greatest Dynamic Bodyweight Stretch",
    targetMuscles: ['Glutes', 'Hamstrings', 'Back', 'Chest', 'Abs & Core'],
    focusJoint: 'Whole Body Kinetic Chain',
    intensity: 'Dynamic',
    durationDefaultSec: 60,
    repsOrHold: '5 reps per side with pauses',
    whyItMatters: 'Hits thoracic rotation, hip flexor opening, hamstring mobility, and groin extensibility all in one flow.',
    cues: [
      'Step into a deep bodyweight runner lunge with both hands inside front foot',
      'Drop inside elbow toward front ankle, then rotate that arm up to the sky',
      'Place hand down, sit back slightly to straighten front leg for a hamstring sweep'
    ],
    equipmentNeeded: 'Bodyweight'
  },
  {
    id: 'deep_bodyweight_squat_pry',
    name: 'Deep Bodyweight Squat & Hip Pry',
    targetMuscles: ['Quads', 'Glutes', 'Calves', 'Back'],
    focusJoint: 'Ankles, Hips, & Thoracic Spine',
    intensity: 'Moderate',
    durationDefaultSec: 45,
    repsOrHold: '40-60s active hold',
    whyItMatters: 'Opens the hips and primes deep ankle dorsiflexion while training an upright chest angle without any weight.',
    cues: [
      'Descend into your deepest comfortable bodyweight squat with feet flat on the floor',
      'Place elbows inside knees and press outward to pry hips open',
      'Take 5 deep belly breaths, lifting the chest proudly toward the ceiling'
    ],
    equipmentNeeded: 'Bodyweight'
  }
];

/**
 * Intelligent Warmup Matcher:
 * Evaluates the muscle groups targeted across all exercises in the current workout,
 * selects the highest-priority mobility drills, and sorts them logically:
 * 1. General flow / spine primer
 * 2. Primary target muscle mobility
 * 3. Secondary muscle & stabilizer priming
 */
export function getRecommendedWarmup(
  workoutExercises: { targetMuscle: MuscleGroup; secondaryMuscles?: MuscleGroup[] }[]
): {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  recommendedDrills: MobilityExercise[];
  estimatedMinutes: number;
} {
  // Collect unique primary and secondary muscles
  const primarySet = new Set<MuscleGroup>();
  const secondarySet = new Set<MuscleGroup>();

  workoutExercises.forEach(ex => {
    if (ex.targetMuscle) primarySet.add(ex.targetMuscle);
    if (ex.secondaryMuscles) {
      ex.secondaryMuscles.forEach(m => secondarySet.add(m));
    }
  });

  const primaryMuscles = Array.from(primarySet);
  const secondaryMuscles = Array.from(secondarySet).filter(m => !primarySet.has(m));

  // Determine if workout is Upper, Lower, or Full Body
  const upperMuscles: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms'];
  const lowerMuscles: MuscleGroup[] = ['Quads', 'Hamstrings', 'Glutes', 'Calves'];

  const hasUpper = primaryMuscles.some(m => upperMuscles.includes(m));
  const hasLower = primaryMuscles.some(m => lowerMuscles.includes(m));

  // Candidate scoring
  const scoredDrills: { drill: MobilityExercise; score: number }[] = MOBILITY_DATABASE.map(drill => {
    let score = 0;

    // Check matches with primary muscles
    drill.targetMuscles.forEach(m => {
      if (primarySet.has(m)) score += 10;
      else if (secondarySet.has(m)) score += 4;
    });

    // Universal openers bonus if matching category
    if (drill.id === 'worlds_greatest_stretch') {
      score += 6; // Excellent for almost any session
    }
    if (hasLower && (drill.id === 'deep_bodyweight_squat_pry' || drill.id === 'wall_ankle_dorsiflexion' || drill.id === 'standing_quad_stretch')) {
      score += 7;
    }
    if (hasUpper && (drill.id === 'dynamic_arm_swings_pec_stretch' || drill.id === 'scapular_push_up_plus' || drill.id === 'doorway_pec_stretch')) {
      score += 7;
    }

    return { drill, score };
  });

  // Filter drills with meaningful relevance and sort descending
  const sorted = scoredDrills
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.drill);

  // Take top 4-5 drills, ensuring distinct focus joints
  const selected: MobilityExercise[] = [];
  const chosenJoints = new Set<string>();

  for (const drill of sorted) {
    if (!chosenJoints.has(drill.focusJoint) || selected.length < 3) {
      selected.push(drill);
      chosenJoints.add(drill.focusJoint);
    }
    if (selected.length >= 5) break;
  }

  // Fallback if workout has no exercises yet
  if (selected.length === 0) {
    const fallbackIds = ['worlds_greatest_stretch', 'dynamic_arm_swings_pec_stretch', 'standing_hamstring_stretch', 'cat_cow_thoracic_rotations'];
    const fallbacks = MOBILITY_DATABASE.filter(d => fallbackIds.includes(d.id));
    selected.push(...fallbacks);
  }

  const totalSeconds = selected.reduce((acc, d) => acc + (d.durationDefaultSec * 2), 0); // 2 sets/sides
  const estimatedMinutes = Math.max(4, Math.round(totalSeconds / 60));

  return {
    primaryMuscles,
    secondaryMuscles,
    recommendedDrills: selected.map(d => ({
      ...d,
      cdnUrl: WARMUP_VIDEOS[d.id] || d.cdnUrl,
      cdn_url: WARMUP_VIDEOS[d.id] || d.cdn_url
    })),
    estimatedMinutes
  };
}
