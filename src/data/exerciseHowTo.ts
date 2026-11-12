import { EXERCISE_DATABASE } from './exercises';
import { ExerciseDefinition } from '../types';
import { MOBILITY_DATABASE, WARMUP_VIDEOS } from './warmupData';

export interface ExerciseHowToGuide {
  id: string;
  name: string;
  primaryMuscle: string;
  rawPrimaryMuscle?: string;
  secondaryMuscles?: string[];
  equipment: string;
  tier: 'Compound' | 'Isolation';
  description: string;
  cdnUrl?: string;
  mediaFile?: string;
  category?: string;
  setupSteps: string[];
  executionSteps: string[];
  peakAndLockout: string[];
  formCues: string[];
  commonMistakes: string[];
  breathingPattern: string;
  tempo: string;
  proTip: string;
}

/**
 * Detailed biomechanical execution guides for core gym movements
 */
export const EXERCISE_HOW_TO_REGISTRY: Record<string, Partial<ExerciseHowToGuide>> = {
  // CHEST
  barbell_bench_press: {
    setupSteps: [
      'Lie flat on the bench with eyes directly beneath the racked barbell.',
      'Grip the bar slightly wider than shoulder-width with a firm, closed grip (thumbs wrapped around).',
      'Plant both feet flat into the floor, drive shoulder blades back and down into the bench pad, and set a slight natural lumbar arch.'
    ],
    executionSteps: [
      'Unrack the bar and stabilize it directly over your chest with straight arms.',
      'Inhale deep into your diaphragm, brace your core, and lower the bar under strict control.',
      'Tuck elbows at roughly 45 to 70 degrees from your torso—do not allow them to flare 90 degrees out.',
      'Touch the bar softly to your lower-mid sternum (nipple line) with zero bouncing.'
    ],
    peakAndLockout: [
      'Drive aggressively upward in a subtle J-curve, pushing the bar back toward your shoulder line.',
      'Exhale through the sticking point and lock out arms under control without losing shoulder blade retraction.'
    ],
    commonMistakes: [
      'Bouncing the barbell off the sternum using momentum.',
      'Flaring elbows 90 degrees outward, which places high shearing stress on the rotator cuff.',
      'Lifting feet off the floor or allowing hips to rise off the bench pad.'
    ],
    breathingPattern: 'Inhale and brace at the top before descent; hold intra-abdominal pressure at bottom; exhale through the press.',
    tempo: '3-0-1-0 (3s slow descent, explosive press)',
    proTip: 'Think about bending the barbell in half or pulling your hands together to activate more pectoral fibers.'
  },

  incline_dumbbell_press: {
    setupSteps: [
      'Set an adjustable bench to a 30-degree incline (avoid steep 45° to keep focus on upper chest instead of front delts).',
      'Sit back with dumbbells resting vertically on your knees, then kick them up to shoulder level as you lean back.',
      'Retract your scapulae firmly into the backrest and maintain solid foot drive.'
    ],
    executionSteps: [
      'Lower the dumbbells with elbows angled at 45 to 60 degrees from your ribs.',
      'Descend until you feel a deep, loaded stretch across your upper chest (bells just outside chest level).',
      'Keep your wrists stacked directly over your forearms throughout the full range of motion.'
    ],
    peakAndLockout: [
      'Press dumbbells upward along a natural arc, converging them slightly above your upper clavicle.',
      'Squeeze the upper chest hard at the top without clinking the weights together.'
    ],
    commonMistakes: [
      'Setting bench angle too steep (>45°), turning it into an anterior delt press.',
      'Collapsing wrists backward instead of keeping knuckles pointing upward.',
      'Cutting the bottom stretch short.'
    ],
    breathingPattern: 'Inhale on the controlled lowering; exhale forcefully as you drive the dumbbells upward.',
    tempo: '3-1-1-0 (3s eccentric, 1s pause in deep stretch, 1s press)',
    proTip: 'Focus on driving your biceps toward each other at the peak of the press to maximize clavicular pectoral recruitment.'
  },

  cable_pec_flye: {
    setupSteps: [
      'Position pulleys at chest height (or slightly higher) with D-handles attached.',
      'Grab handles with a neutral grip and take one step forward into a staggered stance for stability.',
      'Maintain an upright chest with a soft, fixed bend in your elbows (approx. 15 degrees).'
    ],
    executionSteps: [
      'Allow your arms to open out to the sides in a wide hugging arc until you feel a deep pectoral stretch.',
      'Do not let elbows drift behind the plane of your shoulders.',
      'Engage your chest and bring your hands forward together in a wide arc, maintaining that same slight elbow bend.'
    ],
    peakAndLockout: [
      'Cross your wrists slightly or bring knuckles together in front of your mid-chest.',
      'Hold the peak contraction for 1 full second, squeezing your inner chest muscles hard.'
    ],
    commonMistakes: [
      'Turning the flye into a pressing motion by bending and straightening elbows excessively.',
      'Using excessive torso momentum or leaning forward and back to swing weights.',
      'Over-stretching behind the shoulder capsule.'
    ],
    breathingPattern: 'Inhale as your arms open wide; exhale as you bring hands together in front.',
    tempo: '3-0-1-1 (3s negative stretch, explosive close, 1s hard squeeze)',
    proTip: 'Imagine you are hugging a wide tree trunk—keep the elbow angle rigid and let your pectorals do all the work.'
  },

  // BACK
  barbell_deadlift: {
    setupSteps: [
      'Stand with feet hip-width apart, toes pointing straight or slightly out.',
      'Position barbell directly over midfoot (about 1 inch from your shins).',
      'Hinge back at hips with a flat back, bend knees slightly, and grip bar just outside knees (double overhand or hook grip).'
    ],
    executionSteps: [
      'Pull the slack out of the barbell until you hear a metallic "click" against the plates.',
      'Depress lats down into your back pockets, engage your core, and keep chest tall.',
      'Push the floor away through your midfoot while keeping the bar in constant contact with your shins.'
    ],
    peakAndLockout: [
      'Stand tall by driving hips forward to meet the bar; squeeze glutes firmly.',
      'Do not hyperextend your lower back at the top.',
      'Return the bar along the same path by hinging hips back before unlocking knees.'
    ],
    commonMistakes: [
      'Rounding the lumbar spine (cat back) when breaking the floor.',
      'Allowing the bar to drift away from the shins, drastically multiplying lower back shear.',
      'Hyperextending spine backward at lockout instead of finishing with glute contraction.'
    ],
    breathingPattern: 'Deep belly breath into lifting belt at the bottom; brace 360°; exhale once passing the knees or at full lockout.',
    tempo: '2-0-1-0 (Controlled eccentric return, explosive pull)',
    proTip: 'Think of the deadlift as pushing the world away with your legs rather than pulling the bar up with your arms.'
  },

  lat_pulldown_wide: {
    setupSteps: [
      'Adjust thigh pads so your legs are securely wedged with feet flat on the ground.',
      'Grip the wide lat pulldown bar with an overhand grip about 1.5 times shoulder width.',
      'Sit upright and lean back roughly 10-15 degrees with chest proud.'
    ],
    executionSteps: [
      'Initiate the pull by retracting and depressing your shoulder blades (scapular pull-down).',
      'Drive elbows downward and slightly backward toward your rear pockets.',
      'Pull bar smoothly down to your upper chest / collarbone level.'
    ],
    peakAndLockout: [
      'Hold the bar at your collarbone for a split second, feeling lats fully contract.',
      'Control the ascent under tension, allowing your arms to fully extend and lats to achieve a deep stretch at the top.'
    ],
    commonMistakes: [
      'Swinging your entire torso backward to jerk the weight down using momentum.',
      'Pulling behind the neck, which impinges the cervical spine and rotator cuff.',
      'Failing to let the scapulae elevate at the top for a complete stretch.'
    ],
    breathingPattern: 'Inhale as the bar ascends to stretch; exhale as you pull the bar down to your collarbone.',
    tempo: '3-0-1-1 (3s slow stretch up, 1s pull, 1s hard squeeze at chest)',
    proTip: 'Use a thumbless (suicide) grip to minimize forearm and bicep takeover and channel tension directly into your latissimus dorsi.'
  },

  seated_cable_row: {
    setupSteps: [
      'Sit on the bench, place feet on footrests with knees slightly bent (never locked).',
      'Reach forward to grab the V-bar attachment with a neutral grip.',
      'Sit tall with your spine neutral, shoulders rolled back, and chest proud.'
    ],
    executionSteps: [
      'Allow your lats to stretch forward on the reach without rounding your lower back.',
      'Pull the handle into your lower abdomen / belly button by driving your elbows past your torso.',
      'Keep your elbows tucked close to your ribs.'
    ],
    peakAndLockout: [
      'Pinch your shoulder blades tightly together at the peak contraction for 1 full second.',
      'Extend arms forward with control over 3 seconds to feel the eccentric stretch.'
    ],
    commonMistakes: [
      'Rocking back and forth from the lower back like a rowing boat.',
      'Shrugging shoulders up toward ears during the pull.',
      'Letting the weight stack slam on the eccentric return.'
    ],
    breathingPattern: 'Inhale on the stretch forward; exhale as you pull into your torso.',
    tempo: '3-0-1-1 (3s negative stretch, 1s squeeze)',
    proTip: 'Imagine pulling with your elbows rather than your hands to eliminate bicep fatigue.'
  },

  // SHOULDERS
  overhead_barbell_press: {
    setupSteps: [
      'Rack the barbell at mid-chest height. Grip the bar just outside shoulder width with vertical forearms.',
      'Step under the bar, unrack onto your front delts, and take two steps back with feet shoulder-width apart.',
      'Squeeze your glutes, flex your quadriceps, and lock your core down tight.'
    ],
    executionSteps: [
      'Tilt your chin back slightly to clear the bar path.',
      'Press the barbell straight up in a vertical line as close to your face as safely possible.',
      'Once the bar clears your forehead, push your head forward through the "window" of your arms.'
    ],
    peakAndLockout: [
      'Lock out overhead with bar directly over your midfoot and crown of head.',
      'Shrug your shoulders slightly at the top for active scapular support.',
      'Lower the bar under control back to your upper collarbone.'
    ],
    commonMistakes: [
      'Leaning backward excessively and hyper-extending the lumbar spine.',
      'Flaring wrists backward under the weight—keep wrists rigid and straight.',
      'Using knee dip momentum (this is a strict press, not a push press).'
    ],
    breathingPattern: 'Inhale deeply at the collarbone; brace core hard; exhale through top lockout.',
    tempo: '3-0-1-1 (3s controlled descent, strong vertical press)',
    proTip: 'Squeezing your glutes throughout the press acts as an unbreakable anchor for your spine.'
  },

  dumbbell_lateral_raise: {
    setupSteps: [
      'Stand with feet hip-width apart holding dumbbells by your sides with neutral grip.',
      'Hinge forward roughly 10-15 degrees at your hips to align with the lateral delt fiber orientation.',
      'Maintain a soft, fixed bend in your elbows (about 10-15 degrees).'
    ],
    executionSteps: [
      'Raise the dumbbells outward and slightly forward in the scapular plane (roughly 30 degrees forward of your sides).',
      'Lead the movement with your elbows and keep wrists neutral or slightly poured forward.',
      'Lift only until your elbows reach shoulder height (parallel to the ground).'
    ],
    peakAndLockout: [
      'Pause for a micro-second at shoulder height, feeling side delts engage.',
      'Control the descent smoothly for 2-3 seconds—do not let the weights simply drop.'
    ],
    commonMistakes: [
      'Shrugging traps upward to muscle the weight up.',
      'Swinging the torso or using momentum from the knees.',
      'Raising hands higher than elbows, shifting tension to the front delts.'
    ],
    breathingPattern: 'Exhale as you raise the dumbbells out to the sides; inhale as you lower them with control.',
    tempo: '2-1-1-0 (2s eccentric control, 1s peak hold, smooth raise)',
    proTip: 'Imagine pouring water from two pitchers at the top of the raise to isolate the lateral head.'
  },

  // LEGS - QUADS / HAMSTRINGS
  barbell_back_squat: {
    setupSteps: [
      'Step under the bar and rest it across upper traps (High Bar) or rear delt shelf (Low Bar).',
      'Grip the bar firmly, pull elbows down to lock your upper back, unrack with both feet even, and take 2-3 steps back.',
      'Set feet slightly wider than shoulder width with toes angled outward 15 to 30 degrees.'
    ],
    executionSteps: [
      'Take a deep 360-degree diaphragmatic breath, brace your abs like preparing for a punch.',
      'Hinge at hips and break at knees simultaneously, pushing knees outward in line with your toes.',
      'Descend with upright chest until the hip crease dips below the top of your knee cap (parallel or deeper).'
    ],
    peakAndLockout: [
      'Drive aggressively through your midfoot, extending knees and hips in unison.',
      'Keep chest elevated and maintain knee tracking on the ascent.',
      'Stand tall and reset your brace before the next repetition.'
    ],
    commonMistakes: [
      'Letting knees cave inward (valgus collapse) on the ascent.',
      'Collapsing the chest forward into a "good morning" squat.',
      'Rising up onto toes due to tight ankles or poor foot pressure distribution.'
    ],
    breathingPattern: 'Inhale deep into the abdomen and brace at the top; hold breath through the descent and turnaround; exhale past the sticking point.',
    tempo: '3-1-1-0 (3s slow descent, 1s pause in the hole, explosive drive up)',
    proTip: 'Screw your feet into the ground like turning corkscrews outward—this instantly activates your glutes and stabilizes your knees.'
  },

  romanian_deadlift_barbell: {
    setupSteps: [
      'Hold a barbell with an overhand grip at hip height, standing tall with feet hip-width apart.',
      'Unlock your knees slightly (maintain this soft knee bend throughout the entire set).',
      'Pull your shoulder blades back, engage lats, and brace your abdominal wall.'
    ],
    executionSteps: [
      'Initiate the movement purely by pushing your hips straight backward toward the wall behind you.',
      'Keep the barbell skimming close against your thighs and shins as you hinge down.',
      'Descend until you feel a maximal loaded stretch in your hamstrings (usually mid-shin level).'
    ],
    peakAndLockout: [
      'Drive hips forward through the floor by squeezing your glutes and hamstrings to return to standing.',
      'Keep your spine completely neutral and avoid leaning backward at the top.'
    ],
    commonMistakes: [
      'Bending the knees excessively, converting the hinge into a squat.',
      'Rounding the lower back to reach lower than your hamstring mobility allows.',
      'Letting the bar drift away from the legs.'
    ],
    breathingPattern: 'Inhale and brace before the hip hinge; hold pressure as you stretch; exhale as you drive hips forward.',
    tempo: '3-1-1-0 (3s controlled stretch back, 1s pause at max stretch, explosive drive)',
    proTip: 'Think of trying to touch a wall behind you with your tailbone—your knees should stay soft but motionless.'
  },

  // ARMS
  barbell_bicep_curl: {
    setupSteps: [
      'Stand with feet shoulder-width apart holding an Olympic or EZ-bar with an underhand grip.',
      'Pin your elbows firmly against your ribs and roll your shoulders back and down.',
      'Keep your chest proud and core tight.'
    ],
    executionSteps: [
      'Curl the bar upward toward your shoulders by flexing your biceps.',
      'Keep your upper arms stationary—do not swing your elbows forward until the very peak.',
      'Squeeze the bar tightly and supinate your forearms fully.'
    ],
    peakAndLockout: [
      'Squeeze biceps hard for 1 full second at the top contraction.',
      'Lower the bar with strict control over 3 seconds until arms are fully extended at the bottom.'
    ],
    commonMistakes: [
      'Swinging hips and lumbar spine back and forth to heave the weight up.',
      'Flaring elbows outward or letting them drift far in front of the body.',
      'Cutting the bottom range of motion short and missing the loaded bicep stretch.'
    ],
    breathingPattern: 'Exhale as you curl the bar up; inhale as you lower the barbell under full control.',
    tempo: '3-0-1-1 (3s negative stretch, 1s concentric curl, 1s hard peak squeeze)',
    proTip: 'Use an EZ-curl bar if straight bar curls cause wrist or forearm discomfort.'
  },

  cable_tricep_pushdown_rope: {
    setupSteps: [
      'Attach a rope to a high cable pulley. Grasp the ends of the rope with a neutral grip (palms facing).',
      'Step back slightly, hinge forward 10-15 degrees at hips, and lock your elbows into your sides.',
      'Keep shoulders depressed and chest open.'
    ],
    executionSteps: [
      'Push the rope downward by extending your elbows.',
      'Keep your upper arms glued to your ribcage—only your forearms should move.',
      'At the bottom of the movement, spread the rope ends apart laterally.'
    ],
    peakAndLockout: [
      'Lock out your triceps completely and flare wrists outward to recruit the lateral tricep head.',
      'Hold the contraction for 1 second, then control the return until forearms are just above 90 degrees.'
    ],
    commonMistakes: [
      'Letting elbows drift forward and backward, using lat momentum instead of triceps.',
      'Rounding shoulders forward over the rope.',
      'Failing to separate the rope ends at full extension.'
    ],
    breathingPattern: 'Exhale as you push down and spread the rope; inhale as hands return to chest level.',
    tempo: '3-0-1-1 (3s return, 1s extension, 1s hard lock)',
    proTip: 'Keep your elbows glued to your ribs as if holding two tennis balls under your armpits.'
  }
};

/**
 * Fallback pattern generator for any exercise in the database or custom added
 */
export function getExerciseHowTo(exerciseIdOrName: string): ExerciseHowToGuide {
  // 0. Check direct match in MOBILITY_DATABASE for stretches & warmup exercises
  const mobilityMatch = MOBILITY_DATABASE.find(
    m => m.id === exerciseIdOrName || m.name.toLowerCase() === exerciseIdOrName.toLowerCase() || m.name.toLowerCase().includes(exerciseIdOrName.toLowerCase())
  );
  if (mobilityMatch) {
    const videoUrl = WARMUP_VIDEOS[mobilityMatch.id] || mobilityMatch.cdnUrl;
    return {
      id: mobilityMatch.id,
      name: mobilityMatch.name,
      primaryMuscle: (mobilityMatch.targetMuscles[0] || 'Full Body') as any,
      rawPrimaryMuscle: mobilityMatch.focusJoint,
      secondaryMuscles: mobilityMatch.targetMuscles.slice(1).map(String),
      equipment: mobilityMatch.equipmentNeeded,
      tier: 'Compound',
      description: mobilityMatch.whyItMatters,
      cdnUrl: videoUrl,
      setupSteps: [
        `Prepare ${mobilityMatch.equipmentNeeded} and set up in a comfortable, open space.`,
        'Assume a balanced posture with a lengthened spine and relaxed shoulders.',
        `Target duration or repetitions: ${mobilityMatch.repsOrHold}.`
      ],
      executionSteps: mobilityMatch.cues,
      peakAndLockout: [
        'Breathe deeply into the stretch and hold the end-range position without bouncing.',
        'Ease smoothly out of the position along the same controlled path.'
      ],
      formCues: mobilityMatch.cues,
      commonMistakes: [
        'Holding your breath or bracing defensively against the stretch.',
        'Forcing the joint into sharp or pinching pain ranges.',
        'Rushing repetitions with ballistic jerking instead of controlled flow.'
      ],
      breathingPattern: 'Inhale deep into your diaphragm; exhale slowly through your mouth as you settle deeper into the stretch.',
      tempo: `Dynamic mobility flow with ${mobilityMatch.repsOrHold}`,
      proTip: mobilityMatch.whyItMatters
    };
  }

  // 1. Check direct match in EXERCISE_DATABASE
  const def: ExerciseDefinition | undefined =
    EXERCISE_DATABASE.find(e => e.id === exerciseIdOrName || e.name.toLowerCase() === exerciseIdOrName.toLowerCase()) ||
    EXERCISE_DATABASE.find(e => e.name.toLowerCase().includes(exerciseIdOrName.toLowerCase()));

  const id = def?.id || exerciseIdOrName.toLowerCase().replace(/\s+/g, '_');
  const name = def?.name || exerciseIdOrName;
  const primaryMuscle = def?.primaryMuscle || 'Target Muscle';
  const rawPrimaryMuscle = def?.rawPrimaryMuscle || primaryMuscle;
  const secondaryMuscles = def?.secondaryMuscles || [];
  const equipment = def?.equipment || 'Free Weight / Machine';
  const tier = def?.tier || 'Compound';
  const description = def?.description || 'Builds muscle fiber recruitment and strength with biomechanical progressive overload.';
  const cdnUrl = def?.cdnUrl;
  const mediaFile = def?.mediaFile;
  const category = def?.category;
  const cues = def?.cues || [
    'Maintain a rigid, braced core and neutral spinal alignment.',
    'Control the eccentric (lowering) phase under constant muscle tension.',
    'Achieve full range of motion without joint hyperextension.',
    'Focus on the mind-muscle connection with the primary mover.'
  ];

  // 2. Check if rich specific guide exists
  const specific = EXERCISE_HOW_TO_REGISTRY[id];
  if (specific) {
    return {
      id,
      name,
      primaryMuscle,
      rawPrimaryMuscle,
      secondaryMuscles,
      equipment,
      tier,
      description,
      cdnUrl,
      mediaFile,
      category,
      setupSteps: specific.setupSteps || [
        `Position equipment and adjust ${equipment} settings to fit your limb proportions.`,
        'Plant your feet firmly into the floor for total-body balance and stability.',
        'Brace your abdominal wall and retract shoulder blades into a stable base.'
      ],
      executionSteps: specific.executionSteps || [
        'Initiate the movement under control, feeling tension in the primary muscle.',
        'Keep joints aligned and avoid compensatory momentum.',
        'Lower or stretch the weight through the full active range of motion.'
      ],
      peakAndLockout: specific.peakAndLockout || [
        'Contract the target muscle hard at the peak for a full 1-second squeeze.',
        'Reverse the movement smoothly along the exact same path.'
      ],
      formCues: cues,
      commonMistakes: specific.commonMistakes || [
        'Using jerky body swing or momentum instead of target muscle contraction.',
        'Cutting the range of motion short at the stretch or peak.',
        'Allowing core brace to loosen during heavy repetitions.'
      ],
      breathingPattern: specific.breathingPattern || 'Inhale and brace on the eccentric phase; exhale forcefully on the concentric push/pull.',
      tempo: specific.tempo || '3-0-1-1 (3s lowering, 1s explosive lift, 1s peak contraction)',
      proTip: specific.proTip || 'Prioritize pristine mechanical form over weight on the bar for superior hypertrophy and injury prevention.'
    };
  }

  // 3. Dynamic Biomechanical Archetype Generator for any other exercise
  const lowerName = name.toLowerCase();
  let setupSteps: string[] = [];
  let executionSteps: string[] = [];
  let peakAndLockout: string[] = [];
  let commonMistakes: string[] = [];
  let breathingPattern = 'Inhale during the lowering (eccentric) phase; exhale as you drive/pull (concentric).';
  let tempo = '3-0-1-1';
  let proTip = 'Control the negative phase of every repetition to maximize muscle fiber damage and hypertrophy.';

  if (lowerName.includes('press') || lowerName.includes('bench') || lowerName.includes('push')) {
    setupSteps = [
      `Set up your ${equipment} with feet planted firmly into the floor.`,
      'Retract your shoulder blades and pin them back into the pad or your spine.',
      'Grip handles/barbell firmly with straight, neutral wrists.'
    ];
    executionSteps = [
      'Inhale deeply, brace your core, and lower the resistance with controlled tempo.',
      'Keep elbows angled comfortably (approx. 45-60 degrees from torso) rather than flared 90 degrees.',
      'Reach a deep, loaded stretch in the target muscles without letting shoulders roll forward.'
    ];
    peakAndLockout = [
      'Drive upward through the palms, focusing on squeezing target muscles together.',
      'Lock out smoothly without harsh joint jamming; maintain shoulder blade stability.'
    ];
    commonMistakes = [
      'Bouncing or yanking the weight at the bottom turnaround point.',
      'Flaring elbows straight out to the sides, shifting excessive strain onto anterior joints.',
      'Losing abdominal brace and arching excessively.'
    ];
    proTip = 'Focus on squeezing your upper arms across your chest rather than just pushing hands away.';
  } else if (lowerName.includes('pull') || lowerName.includes('row') || lowerName.includes('chin') || lowerName.includes('lat')) {
    setupSteps = [
      `Secure your stance or sit with legs anchored firmly against ${equipment} pads.`,
      'Grip with hands shoulder-width or slightly wider; roll shoulders down away from ears.',
      'Chest proud, slight arch in mid-back, core braced.'
    ];
    executionSteps = [
      'Initiate the pull by retracting and depressing your shoulder blades first.',
      'Lead with your elbows pulling straight back or down toward your hip pockets.',
      'Pull until target muscles reach full contraction against your ribcage.'
    ];
    peakAndLockout = [
      'Hold the peak squeeze for 1 second, pinching your shoulder blades together.',
      'Control the eccentric return over 3 seconds, letting lats achieve a full, safe stretch.'
    ];
    commonMistakes = [
      'Swinging your entire upper body back and forth using momentum.',
      'Shrugging traps up toward ears instead of driving elbows down.',
      'Letting the weight stack slam at the top of the stretch.'
    ];
    proTip = 'Use a hook or thumbless grip and think of your hands as hooks; pull with the elbows.';
  } else if (lowerName.includes('squat') || lowerName.includes('lunge') || lowerName.includes('press') && lowerName.includes('leg')) {
    setupSteps = [
      'Position feet shoulder-width apart or adjust footplate to align knees and hips.',
      'Take a deep 360-degree breath and lock down your abdominal brace.',
      'Ensure head and spine maintain neutral alignment throughout.'
    ];
    executionSteps = [
      'Descend by breaking at hips and knees, tracking knees outward over your mid-to-outer toes.',
      'Maintain an upright chest and keep whole foot (heel and ball) glued to the platform/floor.',
      'Descend to full depth (parallel or deeper) without tucking hips excessively.'
    ];
    peakAndLockout = [
      'Drive forcefully through midfoot and heels back to the starting point.',
      'Stand tall and squeeze glutes without hyperextending knees.'
    ];
    commonMistakes = [
      'Knees collapsing inward (valgus) on the ascent.',
      'Heels lifting off the ground or shifting weight to the toes.',
      'Rounding the lower back in the deep stretch.'
    ];
    proTip = 'Imagine spreading the floor apart with your feet to recruit more glute medius and hip stabilizers.';
  } else if (lowerName.includes('curl')) {
    setupSteps = [
      'Stand or sit tall with shoulders rolled back and elbows pinned close to your ribs.',
      'Grip handles/barbell firmly with palms supinated (facing upward) or neutral.',
      'Brace core and keep hips completely still.'
    ];
    executionSteps = [
      'Curl weight upward toward shoulders by flexing biceps only.',
      'Keep upper arms stationary; do not swing elbows forward.',
      'Squeeze biceps hard as forearms approach vertical.'
    ];
    peakAndLockout = [
      'Hold the peak contraction for 1 second at the top.',
      'Lower under control for 3 full seconds to full elbow extension.'
    ];
    commonMistakes = [
      'Leaning backward and using hip swing to throw the weight up.',
      'Flaring elbows out to the sides.',
      'Cutting the bottom range short.'
    ];
    proTip = 'Control the negative descent—the eccentric stretch is where 60% of bicep hypertrophy occurs.';
  } else if (lowerName.includes('extension') || lowerName.includes('pushdown') || lowerName.includes('dip')) {
    setupSteps = [
      `Set up ${equipment} with arms positioned to lock upper arms in space.`,
      'Depress shoulders and brace core.',
      'Fix your elbows in place relative to your torso.'
    ];
    executionSteps = [
      'Extend forearms away from elbows until arms are completely straight.',
      'Feel the deep stretch in the triceps as you return to the 90-degree flexion mark.',
      'Keep wrists rigid and aligned with forearms.'
    ];
    peakAndLockout = [
      'Lock out triceps completely for 1 second of intense contraction.',
      'Control the eccentric return smoothly without letting the weight pull your elbows out of position.'
    ];
    commonMistakes = [
      'Allowing elbows to flare or drift forward and backward.',
      'Using bodyweight to lean over the bar/handles instead of isolating the arms.'
    ];
    proTip = 'Keep your elbows completely motionless; imagine an axle running through both elbow joints.';
  } else {
    setupSteps = [
      `Prepare ${equipment} ensuring all pins and adjustments are locked securely.`,
      'Assume a balanced athletic stance with core engaged and spine neutral.',
      'Verify grip and joint alignment before initiating the first repetition.'
    ];
    executionSteps = [
      'Move the resistance through its natural physiological arc under continuous tension.',
      'Maintain an active, controlled cadence—never rely on jerking or momentum.',
      'Achieve a deep, loaded stretch in the target muscle tissue.'
    ];
    peakAndLockout = [
      'Contract the working muscle forcefully at the peak of the movement.',
      'Return to the starting position along the same controlled path.'
    ];
    commonMistakes = [
      'Rushing through repetitions without controlling the eccentric descent.',
      'Using compensatory movement patterns from non-target muscles.'
    ];
    proTip = 'Master form with lighter loads first to establish pristine motor control before adding heavy weight.';
  }

  return {
    id,
    name,
    primaryMuscle,
    rawPrimaryMuscle,
    secondaryMuscles,
    equipment,
    tier,
    description,
    cdnUrl,
    mediaFile,
    category,
    setupSteps,
    executionSteps,
    peakAndLockout,
    formCues: cues,
    commonMistakes,
    breathingPattern,
    tempo,
    proTip
  };
}
