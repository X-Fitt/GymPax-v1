import React, { useState, useEffect } from 'react';
import { X, Ruler, Sparkles, Check, Flame, Target, Compass, ChevronRight } from 'lucide-react';

export interface MuscleGuideInfo {
  id: string;
  name: string;
  aliases?: string[];
  landmark: string;
  relaxedGuide: string;
  pumpedGuide: string;
  tip: string;
}

export const MUSCLE_MEASUREMENT_GUIDES: Record<string, MuscleGuideInfo> = {
  arms: {
    id: 'arms',
    name: 'Arms (Biceps & Triceps)',
    aliases: ['biceps', 'triceps', 'bicep'],
    landmark: 'Midpoint between the top of the shoulder acromion and elbow tip olecranon.',
    relaxedGuide: 'Hang arm naturally at your side with palm facing forward. Measure around the mid-bicep belly without flexing.',
    pumpedGuide: 'Raise upper arm horizontal, curl forearm hard toward shoulder at 90°, and wrap tape across the highest bicep peak.',
    tip: 'Keep tape strictly perpendicular to the humerus bone for consistent accuracy.'
  },
  forearms: {
    id: 'forearms',
    name: 'Forearms (Brachioradialis)',
    aliases: ['forearm'],
    landmark: 'Thickest point of forearm belly, approximately 4–6 cm below the elbow crease.',
    relaxedGuide: 'Arm hanging straight down, fingers open and fully relaxed. Measure around the widest cross-section.',
    pumpedGuide: 'Clench fist tightly and slightly cock or curl wrist upward to peak the brachioradialis muscle.',
    tip: 'Forearms swell noticeably after heavy deadlifts, pull-ups, and farmer carries.'
  },
  chest: {
    id: 'chest',
    name: 'Chest & Torso (Pecs & Lats)',
    aliases: ['pecs', 'torso'],
    landmark: 'Directly across the nipple line and mid-sternum, horizontally across the shoulder blades.',
    relaxedGuide: 'Stand upright with arms relaxed at sides. Exhale naturally (normal tidal breathing). Do not puff or hollow chest.',
    pumpedGuide: 'Gently flare your lats, take a controlled full inhale to expand ribcage shelf, and measure widest upper chest circumference.',
    tip: 'Check mirror to ensure measuring tape is perfectly parallel to the floor across your back.'
  },
  shoulders: {
    id: 'shoulders',
    name: 'Shoulders (Deltoids)',
    aliases: ['delts', 'deltoids'],
    landmark: 'Widest horizontal cross-section across lateral deltoid caps and upper clavicle shelf.',
    relaxedGuide: 'Stand straight with feet shoulder-width apart, arms hanging by sides without shrugging traps.',
    pumpedGuide: 'Measure right after an overhead press or lateral raise workout during peak deltoid blood volume.',
    tip: 'Best measured in front of a mirror or with a partner so tape stays level.'
  },
  waist: {
    id: 'waist',
    name: 'Waist & Abdominals',
    aliases: ['abs', 'stomach', 'core'],
    landmark: 'Narrowest point of the torso, or directly level across the navel (belly button).',
    relaxedGuide: 'Stand naturally with weight balanced on both feet. Exhale normally without pushing stomach out or sucking inward.',
    pumpedGuide: 'Tensed / Vacuum: Exhale air completely and draw abdominal wall inward into a controlled vacuum contraction.',
    tip: 'Never cinch the tape so tight that it depresses the skin tissue.'
  },
  hips: {
    id: 'hips',
    name: 'Hips & Glutes',
    aliases: ['glutes'],
    landmark: 'Widest circumference around the maximum posterior protrusion of the gluteus maximus.',
    relaxedGuide: 'Stand with heels together and weight distributed evenly across both feet. Muscles relaxed.',
    pumpedGuide: 'Tensed: Firmly contract the glutes together as if locking out a heavy barbell hip thrust.',
    tip: 'Wear thin athletic shorts or underwear for consistent measurements.'
  },
  thighs: {
    id: 'thighs',
    name: 'Thighs (Quads & Hamstrings)',
    aliases: ['quads', 'legs'],
    landmark: 'Midway between the inguinal hip crease and the upper border of the patella (kneecap).',
    relaxedGuide: 'Shift bodyweight onto the opposite leg. Keep measuring leg slightly bent and completely relaxed.',
    pumpedGuide: 'Plant foot firmly, lock knee straight, and contract quads hard to pop the teardrop (VMO) and outer sweep.',
    tip: 'Measure both legs or track dominant leg consistently on every log.'
  },
  calves: {
    id: 'calves',
    name: 'Calves (Gastrocnemius)',
    aliases: ['calf'],
    landmark: 'Widest horizontal cross-section of the calf muscle belly.',
    relaxedGuide: 'Seated or standing with weight off the measuring leg, foot resting flat on floor.',
    pumpedGuide: 'Rise onto the ball of your foot (plantar flexion) and tense the inner and outer calf heads hard.',
    tip: 'Calves respond well to high-rep pump tracking.'
  },
  neck: {
    id: 'neck',
    name: 'Neck',
    landmark: 'Just below the thyroid cartilage prominence (Adam\'s apple).',
    relaxedGuide: 'Look straight ahead with neck and traps relaxed. Wrap tape horizontally without tension.',
    pumpedGuide: 'Measure relaxed baseline; avoid straining neck musculature.',
    tip: 'Primary biological marker used for US Navy body fat estimation formulas.'
  },
  weight: {
    id: 'weight',
    name: 'Bodyweight',
    aliases: ['bodyweight'],
    landmark: 'Calibrated digital scale on a flat, hard, non-carpeted surface.',
    relaxedGuide: 'First thing in the morning after using the restroom, before food or water (fasted baseline).',
    pumpedGuide: 'Post-workout weight reflects sweat dehydration rather than true muscle or fat tissue changes.',
    tip: 'Focus on 7-day rolling weekly averages to filter out sodium and hydration fluctuations.'
  }
};

interface MuscleMeasurementExplanationModalProps {
  isOpen: boolean;
  muscleKey: string | null;
  onClose: () => void;
  onSelectOtherMuscle?: (key: string) => void;
}

export const MuscleMeasurementExplanationModal: React.FC<MuscleMeasurementExplanationModalProps> = ({
  isOpen,
  muscleKey,
  onClose,
  onSelectOtherMuscle
}) => {
  const [activeKey, setActiveKey] = useState<string>('arms');

  useEffect(() => {
    if (muscleKey) {
      const normalized = muscleKey.toLowerCase();
      // Match key or alias
      const foundKey = Object.keys(MUSCLE_MEASUREMENT_GUIDES).find(k => {
        if (k === normalized) return true;
        const aliases = MUSCLE_MEASUREMENT_GUIDES[k].aliases || [];
        return aliases.includes(normalized);
      });
      setActiveKey(foundKey || 'arms');
    }
  }, [muscleKey]);

  if (!isOpen) return null;

  const currentGuide = MUSCLE_MEASUREMENT_GUIDES[activeKey] || MUSCLE_MEASUREMENT_GUIDES['arms'];

  const handleSwitch = (key: string) => {
    setActiveKey(key);
    if (onSelectOtherMuscle) {
      onSelectOtherMuscle(key);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-zinc-100 my-auto max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Minimalist Top Bar */}
        <div className="flex items-start justify-between pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Ruler className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                Measurement Technique
              </span>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 leading-tight">
                {currentGuide.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Muscle Switcher Strip */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(MUSCLE_MEASUREMENT_GUIDES).map(([key, item]) => {
            const isSelected = key === activeKey;
            const shortName = item.name.split(' ')[0];
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSwitch(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>

        {/* Anatomical Landmark */}
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
              Tape Placement Landmark
            </span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed font-normal pl-5">
            {currentGuide.landmark}
          </p>
        </div>

        {/* Protocol Grid: Relaxed vs Pumped */}
        <div className="space-y-2">
          {/* Relaxed */}
          <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span>Relaxed State (Morning Baseline)</span>
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentGuide.relaxedGuide}
            </p>
          </div>

          {/* Pumped / Tensed */}
          <div className="p-3 rounded-xl bg-zinc-950/50 border border-amber-400/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Pumped / Tensed State (Post-Workout)</span>
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentGuide.pumpedGuide}
            </p>
          </div>
        </div>

        {/* Accuracy Tip */}
        <div className="p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/20 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-300 leading-snug">
            <strong className="text-amber-400 font-semibold">Pro tip: </strong>
            {currentGuide.tip}
          </p>
        </div>

        {/* Minimalist Bottom Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
