export interface GlossaryTerm {
  id: string;
  term: string;
  shortDefinition: string;
  detailedExplanation: string;
  whyItMatters: string;
  exampleOrTip?: string;
  category: 'biometrics' | 'hypertrophy' | 'programming' | 'biomechanics' | 'nutrition';
}

export const GYM_GLOSSARY: Record<string, GlossaryTerm> = {
  bmi: {
    id: 'bmi',
    term: 'BMI (Body Mass Index)',
    shortDefinition: 'A statistical ratio of body weight divided by height squared.',
    detailedExplanation:
      'BMI is a quick general health screening metric (Weight in kg / Height in meters squared). While standard medical guidelines label BMI > 25 as overweight, for muscular athletes and bodybuilders, BMI is often skewed upward because dense muscle weighs significantly more than adipose fat tissue.',
    whyItMatters:
      'For lifters, a high BMI with low body fat reflects high lean muscle mass and muscular density, not unhealthy adiposity.',
    exampleOrTip: 'A competitive natural bodybuilder at 5\'10" and 190 lbs at 8% body fat will have a BMI of ~27.3 ("overweight" on medical charts, yet in peak athletic condition).',
    category: 'biometrics'
  },
  bmr: {
    id: 'bmr',
    term: 'BMR (Basal Metabolic Rate)',
    shortDefinition: 'The baseline number of calories your body burns in 24 hours just staying alive at rest.',
    detailedExplanation:
      'BMR accounts for the energy expended to keep your vital organs functioning, breathe, circulate blood, and repair cellular tissue while lying motionless. Every pound of active skeletal muscle increases your resting BMR.',
    whyItMatters:
      'Your BMR serves as the scientific baseline to calculate total daily energy expenditure (TDEE). To build muscle, you eat 250-500 kcal above maintenance; to cut body fat, you eat in a caloric deficit.',
    exampleOrTip: 'An 80kg male lifter usually has a BMR around 1,750-1,850 calories before adding physical activity.',
    category: 'biometrics'
  },
  hypertrophy: {
    id: 'hypertrophy',
    term: 'Muscular Hypertrophy',
    shortDefinition: 'The biological enlargement of skeletal muscle fiber cross-sectional area.',
    detailedExplanation:
      'Hypertrophy occurs when muscle fibers experience high mechanical tension (especially under a loaded stretch) and fatigue close to concentric failure, triggering the mTOR signaling pathway to synthesize new actin and myosin myofibrillar protein strands.',
    whyItMatters:
      'This is the primary goal of bodybuilding. It focuses on maximizing muscle volume, shape, and thickness through controlled tempos and high effective reps rather than testing pure 1-rep maximums.',
    exampleOrTip: 'Training in the 6-15 rep range with 1-2 Reps in Reserve (RIR) provides optimal hypertrophic signaling.',
    category: 'hypertrophy'
  },
  powerbuilding: {
    id: 'powerbuilding',
    term: 'Powerbuilding',
    shortDefinition: 'A hybrid training style combining powerlifting compound strength with bodybuilding aesthetic volume.',
    detailedExplanation:
      'Powerbuilding blends the Big 3 compound power lifts (Squat, Bench Press, Deadlift) programmed with heavy percentage loads (1-5 reps for pure central nervous system force) followed immediately by bodybuilding isolation accessories (8-15 reps) for maximum muscle fullness.',
    whyItMatters:
      'It gives lifters both elite functional strength under heavy barbells and a dense, symmetrical physique with full muscle bellies.',
    exampleOrTip: 'Start your workout with 3 sets of heavy 3-5 rep squats, then follow with 4 sets of 12-rep leg press and hamstring curls.',
    category: 'programming'
  },
  v_taper: {
    id: 'v_taper',
    term: 'Aesthetic V-Taper',
    shortDefinition: 'The classic physique silhouette featuring wide shoulders and flared lats narrowing into a lean, tight waistline.',
    detailedExplanation:
      'The V-Taper is the foundational visual standard of classic physique bodybuilding. It emphasizes the development of the lateral deltoids (side shoulders), latissimus dorsi (upper back wings), and upper chest, combined with low body fat around the abdominal midsection.',
    whyItMatters:
      'Maximizing shoulder and lat width creates the optical illusion of an ultra-tiny waist, regardless of your bone structure.',
    exampleOrTip: 'Prioritize lateral cable raises, wide-grip pull-ups, and avoid heavy oblique side-bends that widen the waist.',
    category: 'hypertrophy'
  },
  rir: {
    id: 'rir',
    term: 'RIR (Reps in Reserve)',
    shortDefinition: 'How many more clean repetitions you could physically perform before reaching complete muscle failure.',
    detailedExplanation:
      'RIR is the gold standard for calibrating training intensity. RIR 0 means you hit absolute concentric failure (could not do another rep). RIR 1 means with maximal grit you had exactly 1 rep left in the tank. RIR 2 means you had 2 reps left.',
    whyItMatters:
      'Research shows that sets performed at RIR 1-2 trigger 95-98% of the muscle growth stimulus of training to complete failure (RIR 0), but with 50% less systemic nervous system exhaustion and injury risk.',
    exampleOrTip: 'If your target is 10 reps at RIR 2, you pick a weight with which you would fail at rep 12.',
    category: 'programming'
  },
  rpe: {
    id: 'rpe',
    term: 'RPE (Rate of Perceived Exertion)',
    shortDefinition: 'A 1 to 10 scale gauging how hard an exercise set felt.',
    detailedExplanation:
      'Adapted from the Borg exertion scale for strength training, RPE directly mirrors RIR: RPE 10 = 0 RIR (Max effort / failure); RPE 9 = 1 RIR (1 rep remaining); RPE 8 = 2 RIR (2 reps remaining); RPE 7 = 3 RIR (smooth bar speed, bar decelerates slightly).',
    whyItMatters:
      'RPE allows autoregulation: if you are tired or under-slept, an RPE 8 workout will automatically use slightly lighter weights to match your true physiological readiness that day.',
    exampleOrTip: 'Heavy compound barbell work is commonly programmed at RPE 8 (2 RIR) to sustain progressive overload week after week.',
    category: 'programming'
  },
  one_rm: {
    id: 'one_rm',
    term: '1RM (One-Repetition Maximum)',
    shortDefinition: 'The absolute heaviest weight you can successfully lift for a single, full repetition with proper technique.',
    detailedExplanation:
      'Your 1RM is the standard benchmark of absolute strength. Instead of dangerously testing your true 1RM in every session, coaches calculate estimated 1RM using scientifically validated formulas (e.g. Brzycki or Epley) based on sub-maximal rep performance.',
    whyItMatters:
      'Many periodized strength programs prescribe percentages of your 1RM (e.g., "4 sets of 6 reps at 75% 1RM").',
    exampleOrTip: 'Lifting 100 kg for 5 reps translates to an estimated 1RM of approximately 116 kg.',
    category: 'programming'
  },
  progressive_overload: {
    id: 'progressive_overload',
    term: 'Progressive Overload',
    shortDefinition: 'Gradually increasing the mechanical demands placed on the musculoskeletal system over time.',
    detailedExplanation:
      'Muscle will not grow unless forced to adapt to a tension greater than what it has previously experienced. You achieve progressive overload by adding weight to the bar, adding clean reps, improving movement tempo, or taking shorter rests with identical load.',
    whyItMatters:
      'Progressive overload is the single most important law in all of strength training and natural bodybuilding. Without it, muscle growth stalls permanently.',
    exampleOrTip: 'If you benched 80kg for 8 reps last week, hitting 80kg for 9 reps or 82.5kg for 8 reps this week is progressive overload.',
    category: 'hypertrophy'
  },
  axial_load: {
    id: 'axial_load',
    term: 'Axial Loading (Spinal Compression)',
    shortDefinition: 'Compressive force directed downward through the vertebral column and spinal cord.',
    detailedExplanation:
      'Exercises where the barbell rests directly on your shoulders or is held in your hands while standing (such as Barbell Back Squats, Overhead Presses, and Conventional Deadlifts) place significant axial loading on the spine and lumbar vertebrae.',
    whyItMatters:
      'For lifters with lower back disc issues or accumulated spinal fatigue, GymPax replaces high axial exercises with non-axial alternatives (e.g. Chest-Supported Rows instead of Bent-Over Rows; Hack Squats instead of Barbell Back Squats).',
    exampleOrTip: 'A hack squat delivers identical quad hypertrophy with 75% less spinal compressive shear.',
    category: 'biomechanics'
  },
  sfr: {
    id: 'sfr',
    term: 'SFR (Stimulus-to-Fatigue Ratio)',
    shortDefinition: 'The amount of muscle growth stimulus an exercise provides divided by the fatigue it generates.',
    detailedExplanation:
      'Every exercise produces two outcomes: a local hypertrophic stimulus to the target muscle, and systemic/joint fatigue. An exercise with a high SFR gives massive targeted muscle disruption while creating very little spinal, systemic, or joint exhaustion.',
    whyItMatters:
      'Selecting high SFR exercises allows you to train with higher weekly volume and recover rapidly without feeling beaten down.',
    exampleOrTip: 'Dumbbell incline press has a much higher pectoral SFR than a flat barbell bench press with locked elbows.',
    category: 'hypertrophy'
  },
  ppl: {
    id: 'ppl',
    term: 'PPL (Push / Pull / Legs)',
    shortDefinition: 'A 3-way training split organizing workouts by movement patterns rather than isolated muscle groups.',
    detailedExplanation:
      'Push Day trains upper body pushing muscles (Chest, Shoulders, Triceps); Pull Day trains upper body pulling muscles (Back, Lats, Traps, Biceps); Leg Day trains the lower body (Quads, Hamstrings, Glutes, Calves).',
    whyItMatters:
      'It prevents joint and muscle overlap: your triceps and front delts get 48-72 hours of total rest while you train back and legs.',
    exampleOrTip: 'Run as a 3-day split (once per week) or a high-frequency 6-day split (PPL twice per week for advanced lifters).',
    category: 'programming'
  },
  upper_lower: {
    id: 'upper_lower',
    term: 'Upper / Lower Split',
    shortDefinition: 'A 4-day split alternating complete upper-body sessions with complete lower-body sessions.',
    detailedExplanation:
      'Upper Day trains chest, back, shoulders, and arms. Lower Day trains quadriceps, hamstrings, glutes, calves, and core. Typically run as Upper A, Lower A, Rest, Upper B, Lower B, Rest, Rest.',
    whyItMatters:
      'Widely considered the sweet spot for natural lifters: allows hitting every muscle twice every 7 days with optimal 72-hour recovery windows.',
    exampleOrTip: 'Ideal for anyone with 4 available gym days per week balancing busy schedules and serious muscle growth.',
    category: 'programming'
  },
  deload: {
    id: 'deload',
    term: 'Deload Week',
    shortDefinition: 'A planned period of reduced training volume and intensity to dissipate accumulated fatigue.',
    detailedExplanation:
      'Over 4 to 8 weeks of heavy progressive overload, micro-trauma accumulates in tendons, ligaments, and the nervous system. During a deload, you reduce total working sets by 50% and keep 3-4 reps in reserve (RIR 3-4).',
    whyItMatters:
      'Deloads prevent chronic overtraining syndrome, heal joint inflammation, and restore full muscle sensitivity to progressive overload.',
    exampleOrTip: 'Take a deload week whenever your morning resting heart rate is elevated, joints ache, or barbell weights feel unusually heavy.',
    category: 'programming'
  },
  drop_set: {
    id: 'drop_set',
    term: 'Drop Set (Strip Set)',
    shortDefinition: 'Lifting a set to failure, immediately reducing the weight by 20-30%, and continuing reps without resting.',
    detailedExplanation:
      'Drop sets push muscles past initial concentric fatigue by stripping plates or moving up the dumbbell rack with zero rest between drops. This exhausts residual lower-threshold motor units and creates immense metabolic metabolite accumulation.',
    whyItMatters:
      'It allows packing high effective volume into minimal workout time. Best used on selectorized pin-loaded machines or dumbbells.',
    exampleOrTip: 'Perform lateral raises with 15kg to failure, immediately grab 10kg for 6 more reps, then 6kg for 6 reps.',
    category: 'hypertrophy'
  },
  superset: {
    id: 'superset',
    term: 'Antagonist Superset',
    shortDefinition: 'Pairing two opposing muscle groups back-to-back with minimal rest in between.',
    detailedExplanation:
      'Rooted in reciprocal innervation: when an agonist muscle (e.g. Pectorals) contracts, the nervous system signals the antagonist muscle (e.g. Lats) to relax. Pioneered in the Golden Era by Arnold Schwarzenegger.',
    whyItMatters:
      'Cuts workout duration in half while creating an immense localized pump in the torso or arms without impairing strength output.',
    exampleOrTip: 'Pairing Barbell Incline Bench Press immediately with Chest-Supported Rows.',
    category: 'hypertrophy'
  },
  limb_leverages: {
    id: 'limb_leverages',
    term: 'Biomechanical Leverages & Moment Arms',
    shortDefinition: 'How limb lengths (femurs, humerus, torso) dictate optimal exercise mechanics and joint torque.',
    detailedExplanation:
      'A lifter with long femurs (thigh bones) will naturally have to lean forward more during a barbell back squat to keep their center of gravity balanced over midfoot compared to someone with short femurs who can squat upright.',
    whyItMatters:
      'There is no one "perfect" universal form for every human body. GymPax calibrates stance widths, bench grips, and squat variants to match your unique skeletal proportions.',
    exampleOrTip: 'Lifters with long arms get extraordinary pectoral stretch on bench press but face longer barbell travel distance.',
    category: 'biomechanics'
  },
  cns_fatigue: {
    id: 'cns_fatigue',
    term: 'CNS (Central Nervous System) Fatigue',
    shortDefinition: 'Systemic reduction in the brain and spinal cord’s ability to send electrical nerve impulses to muscle fibers.',
    detailedExplanation:
      'Unlike local muscle soreness, CNS fatigue is systemic. It occurs from maximal-effort compound lifts (heavy deadlifts, squats), inadequate sleep, or chronic stress, leaving your entire body feeling sluggish.',
    whyItMatters:
      'When your CNS is fatigued, you cannot recruit the highest-threshold fast-twitch motor units regardless of how hard you mentally focus.',
    exampleOrTip: 'Keep heavy 1-3 rep deadlifts and squats to 1-2 times per week to preserve systemic neural drive.',
    category: 'programming'
  },
  mev_mrv: {
    id: 'mev_mrv',
    term: 'MEV vs MRV (Volume Benchmarks)',
    shortDefinition: 'Minimum Effective Volume (least sets to grow) vs Maximum Recoverable Volume (most sets before overtraining).',
    detailedExplanation:
      'MEV is the threshold of weekly hard sets (~8-10 sets/muscle/week) required to trigger measurable hypertrophy. MRV is the ceiling (~18-22 sets/muscle/week) beyond which additional sets become "junk volume" that impairs recovery.',
    whyItMatters:
      'Helps you program the optimal volume sweet spot (MAV: Maximum Adaptive Volume) without wasting energy or grinding joints into inflammation.',
    exampleOrTip: 'Start a mesocycle at MEV (10 sets) and ramp up weekly volume gradually toward your MRV before deloading.',
    category: 'programming'
  },
  protein_target: {
    id: 'protein_target',
    term: 'Target Daily Protein (2.2g/kg / 1g/lb)',
    shortDefinition: 'The recommended daily dietary protein intake to maximize muscle protein synthesis and recovery.',
    detailedExplanation:
      'Evidence-based sports nutrition research shows that consuming 1.6 to 2.2 grams of protein per kilogram of bodyweight (roughly 1 gram per pound) fully maximizes the rate of muscle repair, hypertrophy, and nitrogen retention.',
    whyItMatters:
      'Lifting weights stimulates the signal for muscle growth, but without adequate dietary amino acids (especially leucine), the body cannot physically construct new muscle tissue.',
    exampleOrTip: 'An 80kg (176 lb) lifter should aim for approximately 160-176 grams of protein spread across 4 meals daily.',
    category: 'nutrition'
  },
  lagging_bodypart: {
    id: 'lagging_bodypart',
    term: 'Lagging Body Part Specialization',
    shortDefinition: 'Intentionally increasing weekly volume and session priority on a muscle group that is falling behind.',
    detailedExplanation:
      'Most lifters have muscles that respond slower due to genetic insertion points or motor control. Specialization involves placing that muscle first in your workout when energy is fresh, and increasing its weekly sets to 16-20 while reducing volume elsewhere.',
    whyItMatters:
      'Ensures aesthetic symmetry, balanced posture, and prevents dominant muscle groups from overpowering smaller stabilizers.',
    exampleOrTip: 'If your upper chest is lagging, start every push workout with Incline Dumbbell Presses before doing any flat pressing.',
    category: 'programming'
  },
  bar_tare: {
    id: 'bar_tare',
    term: 'Bar Tare Weight',
    shortDefinition: 'The weight of the unloaded barbell alone (typically 20kg / 45lbs for an Olympic bar).',
    detailedExplanation:
      'A standard Olympic barbell weighs exactly 20 kilograms (or 44-45 pounds). Specialized women\'s bars weigh 15kg (33 lbs), and EZ-curl bars typically weigh 7.5 to 10kg (15-22 lbs).',
    whyItMatters:
      'When calculating plate math or logging PRs, you always include the bar weight in your total lifted tonnage.',
    exampleOrTip: 'A barbell with one 20kg (45 lb) plate on each side equals 60kg (135 lbs) total weight moved.',
    category: 'biomechanics'
  },
  compound: {
    id: 'compound',
    term: 'Compound Exercise (Multi-Joint)',
    shortDefinition: 'An exercise that recruits multiple muscle groups across two or more joint articulations.',
    detailedExplanation:
      'Lifts like Squats (hip and knee), Bench Press (shoulder and elbow), Deadlifts, and Overhead Presses require multiple major muscle groups to fire in unison. They allow lifting the heaviest mechanical loads and stimulating maximum systemic anabolic signaling.',
    whyItMatters:
      'Compounds form the cornerstone foundation of every muscle-building routine. They provide the highest rate of mechanical work per minute spent in the gym.',
    exampleOrTip: 'Always program heavy compounds at the beginning of workouts when neurological freshness and coordination are highest.',
    category: 'hypertrophy'
  },
  isolation: {
    id: 'isolation',
    term: 'Isolation Exercise (Single-Joint)',
    shortDefinition: 'A movement targeting one specific muscle group across a single joint pivot.',
    detailedExplanation:
      'Examples include Dumbbell Bicep Curls (elbow flexion), Lateral Raises (shoulder abduction), and Leg Extensions (knee extension). They bypass multi-joint stabilizers and focus 100% of tension into one muscle belly.',
    whyItMatters:
      'Isolations allow you to accumulate targeted hypertrophic volume and bring up lagging muscle shapes without exhausting your spine or nervous system.',
    exampleOrTip: 'Use cables and machines for isolations to sustain constant tension through peak contraction and stretched positions.',
    category: 'hypertrophy'
  },
  volume: {
    id: 'volume',
    term: 'Training Volume (Tonnage)',
    shortDefinition: 'The total mathematical workload performed: Sets × Reps × Weight lifted.',
    detailedExplanation:
      'Tonnage measures the total mechanical work your muscles did during a workout (e.g. 3 sets × 10 reps × 100 kg = 3,000 kg volume). Over months, total effective training volume is the primary driver of muscular hypertrophy.',
    whyItMatters:
      'Tracking volume progression ensures you are steadily performing more work over time, which forces the body to synthesize new muscle tissue.',
    exampleOrTip: 'If your chest volume increased from 4,500 kg to 5,200 kg over 6 weeks with identical form, your pecs grew.',
    category: 'programming'
  },
  pr: {
    id: 'pr',
    term: 'PR (Personal Record)',
    shortDefinition: 'Your all-time highest performance for a specific lift, rep count, or tonnage.',
    detailedExplanation:
      'PRs can be 1-Rep Max benchmarks, rep PRs (e.g. hitting 100kg for 8 reps instead of 6), or volume PRs. Natural bodybuilding relies on stacking rep PRs on target exercises over years.',
    whyItMatters:
      'Setting new PRs is definitive proof that progressive overload is functioning and neuromuscular adaptations are taking place.',
    exampleOrTip: 'A 5kg increase on your working sets of Romanian Deadlifts over 8 weeks is a massive PR for posterior chain hypertrophy.',
    category: 'programming'
  },
  tdee: {
    id: 'tdee',
    term: 'TDEE (Total Daily Energy Expenditure)',
    shortDefinition: 'The total sum of calories your body burns in a 24-hour period.',
    detailedExplanation:
      'TDEE comprises four components: Basal Metabolic Rate (BMR ~60-70%), Non-Exercise Activity Thermogenesis (NEAT ~15%), Thermic Effect of Food (TEF ~10%), and Exercise Activity Thermogenesis (EAT ~5-10%).',
    whyItMatters:
      'Knowing your TDEE maintenance enables precise nutrition control: eat 300 calories above TDEE to gain lean muscle, or 400 calories below to burn body fat.',
    exampleOrTip: 'A moderately active 80kg lifter often has a TDEE around 2,400 to 2,700 kcal/day.',
    category: 'nutrition'
  },
  caloric_surplus: {
    id: 'caloric_surplus',
    term: 'Caloric Surplus (Lean Bulking)',
    shortDefinition: 'Consuming slightly more daily calories than your body burns to support new muscle tissue synthesis.',
    detailedExplanation:
      'Building new muscle fibers requires both mechanical stimulus and biochemical building blocks. A modest surplus of 250-400 kcal above maintenance provides energy for optimal protein synthesis while minimizing adipose fat storage.',
    whyItMatters:
      'Without adequate energy surplus, natural athletes quickly plateau in strength gains and muscular recovery.',
    exampleOrTip: 'Aim for 0.5% to 1.5% bodyweight gain per month during an aesthetic lean bulk.',
    category: 'nutrition'
  },
  caloric_deficit: {
    id: 'caloric_deficit',
    term: 'Caloric Deficit (Cutting)',
    shortDefinition: 'Consuming fewer calories than your body expends, forcing the body to burn stored fat for fuel.',
    detailedExplanation:
      'During a cut or definition phase, a deficit of 300-500 kcal per day induces steady fat loss of ~0.5 to 1 lb per week. High protein (2.2g/kg) and heavy lifting preserve 100% of hard-earned muscle mass during the deficit.',
    whyItMatters:
      'Reveals vascularity, striations, and the sculpted V-taper physique by stripping away subcutaneous body fat.',
    exampleOrTip: 'Keep lifting weights heavy during a cut to signal the body that muscle mass is vital and must not be catabolized.',
    category: 'nutrition'
  },
  body_fat: {
    id: 'body_fat',
    term: 'Body Fat Percentage',
    shortDefinition: 'The fraction of total body mass that consists of adipose lipid tissue.',
    detailedExplanation:
      'For athletic men, 10-14% body fat displays sharp abdominal definition and vascularity; competitive stage shape is 5-8%. For athletic women, 18-22% displays athletic definition while safeguarding endocrine and hormonal health.',
    whyItMatters:
      'Far more accurate than BMI for lifters, as it isolates adipose tissue from dense contractile muscle and skeletal mass.',
    exampleOrTip: 'Track waist circumference and skinfold calipers or progress photos alongside scale weight to monitor true fat loss.',
    category: 'biometrics'
  },
  tempo: {
    id: 'tempo',
    term: 'Repetition Tempo (e.g. 3-0-1-0)',
    shortDefinition: 'The programmed speed in seconds for each phase of a repetition.',
    detailedExplanation:
      'Written as 4 digits: [Eccentric / Lowering] - [Pause at Stretch] - [Concentric / Lifting] - [Pause at Peak Contraction]. For example, 3-1-1-0 means lower the weight under control for 3 seconds, pause 1 second in the stretch, lift in 1 second, and immediately begin the next rep without resting at top.',
    whyItMatters:
      'Eliminates momentum, protects connective ligaments, and maximizes continuous mechanical tension across the target muscle.',
    exampleOrTip: 'A controlled 3-second negative produces up to 30% more micro-damage signaling than dropping the weight rapidly.',
    category: 'hypertrophy'
  },
  warmup_set: {
    id: 'warmup_set',
    term: 'Warm-Up Set vs Working Set',
    shortDefinition: 'Graduated lighter sets to prime synovial fluid and neural pathways without inducing muscular exhaustion.',
    detailedExplanation:
      'Warm-up sets use progressively higher percentages (e.g. 40%, 60%, 80% of working weight) for low reps (3-5 reps) solely to groove motor patterns and elevate muscle temperature. They are never taken to failure.',
    whyItMatters:
      'Exhausting yourself on warm-up sets drains adenosine triphosphate (ATP) and limits the performance of your actual heavy working sets.',
    exampleOrTip: 'If benching 100kg for 4 sets of 8, warm up with Bar × 10, 50kg × 5, 75kg × 3, 90kg × 1, then rest 2 mins before starting set 1.',
    category: 'programming'
  },
  fat_loss: {
    id: 'fat_loss',
    term: 'Fat Loss & Shred (Caloric Deficit Conditioning)',
    shortDefinition: 'Accelerates metabolic expenditure and fat oxidation while preserving dense lean muscle mass.',
    detailedExplanation:
      'The Fat Loss & Shred protocol combines high-density resistance circuits, moderate-high repetition ranges (10-15 reps), and shorter rest intervals (45-60 seconds) with compound movements. When paired with a strategic caloric deficit (300-500 kcal below maintenance), this forces the body to utilize adipose tissue for energy while the heavy mechanical load protects muscle tissue from catabolism.',
    whyItMatters:
      'Standard steady-state cardio burns calories but often burns muscle as well. High-density resistance conditioning signals the body to preserve lean muscle while burning body fat, resulting in a lean, sculpted, athletic physique.',
    exampleOrTip: 'Maintain high protein (2.2g per kg body weight) and perform supersets or paired complexes to keep heart rate elevated throughout the workout.',
    category: 'programming'
  },
  lean_cut: {
    id: 'lean_cut',
    term: 'Lean Cut & Muscle Definition',
    shortDefinition: 'Preserve 100% of muscle fullness and strength while trimming subcutaneous body fat.',
    detailedExplanation:
      'Focused on revealing muscle striations, vascularity, and deep cuts without dropping weights or losing strength. Training volume is slightly condensed while intensity per set remains high (RIR 1-2).',
    whyItMatters:
      'Prevents the common mistake of switching to ultra-light weights during a cut, which signals the body to dump muscle mass.',
    exampleOrTip: 'Keep heavy compound lifts in your routine and let your diet drive the fat loss.',
    category: 'hypertrophy'
  },
  section_beginner: {
    id: 'section_beginner',
    term: 'Beginner Section (Level 1 to 3)',
    shortDefinition: 'For lifters with under 1 year of structured training experience building foundation.',
    detailedExplanation:
      'The Beginner section focuses on establishing pristine biomechanical motor pathways, building baseline connective tissue resilience, and enjoying rapid linear progression. Each section requires 1,000 points to graduate to the next section, and 333 points to level up (e.g. Level 1 to Level 2 requires 333 points). Each completed workout awards exactly 5 points.',
    whyItMatters:
      'Mastering form on fundamental compound lifts early on prevents bad habits and builds the structural base for decades of injury-free lifting.',
    exampleOrTip: 'Complete ~67 workouts to level up from Beginner - Level 1 to Level 2.',
    category: 'programming'
  },
  section_intermediate: {
    id: 'section_intermediate',
    term: 'Intermediate Section (Level 1 to 3)',
    shortDefinition: 'For dedicated athletes with 1 to 3 years of consistent gym training experience.',
    detailedExplanation:
      'Intermediate lifters have developed solid foundational strength and require periodized progressive overload, higher training volume, and structured frequency to continue gaining muscle. 1,000 points are required to advance to Pro (333 points per level).',
    whyItMatters:
      'At this stage, gains no longer happen automatically every week; you need strategic variation in rep ranges, RPE calibration, and deloading.',
    exampleOrTip: 'Intermediate lifters benefit from Push-Pull-Legs or Upper-Lower splits targeting each muscle 2x per week.',
    category: 'programming'
  },
  section_pro: {
    id: 'section_pro',
    term: 'Pro Bodybuilding Section (Level 1 to 3)',
    shortDefinition: 'For competitive bodybuilders and advanced athletes with 3+ years of intense training.',
    detailedExplanation:
      'Professional bodybuilders and advanced lifters can choose to start directly in the Pro section. Training at this tier incorporates advanced hypertrophy techniques (rest-pause, drop sets, targeted weakpoint prioritization, and strict joint alignment). You need 1,000 points in the Pro section to unlock the pinnacle Elite section.',
    whyItMatters:
      'Advanced athletes need precise mechanical tension and specialized exercise execution to recruit stubborn high-threshold motor units.',
    exampleOrTip: 'Pro - Level 1 advances to Level 2 at 333 points, and reaching 1,000 points earns promotion to Elite.',
    category: 'programming'
  },
  section_elite: {
    id: 'section_elite',
    term: 'Elite Section (Earned Exclusively in App)',
    shortDefinition: 'The pinnacle athletic honor that can ONLY be earned through active training in the app.',
    detailedExplanation:
      'Elite cannot be chosen at profile setup—it must be earned through dedication and discipline by logging 1,000 points in the Pro section (200 completed workouts). It represents the highest echelon of consistency and mastery.',
    whyItMatters:
      'A prestigious social profile badge proving long-term dedication, disciplined streaks, and athletic excellence.',
    exampleOrTip: 'Crown insignia displayed proudly across your social profile, gym leaderboard, and workout recaps.',
    category: 'programming'
  }
};
