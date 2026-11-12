import React, { useState } from 'react';
import {
  X,
  Ruler,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowRight,
  Info
} from 'lucide-react';

interface MeasurementGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MuscleGuideItem {
  id: string;
  name: string;
  relaxedGuide: string;
  pumpedGuide: string;
  landmark: string;
  tip?: string;
}

const MUSCLE_GUIDES: MuscleGuideItem[] = [
  {
    id: 'arms',
    name: 'Arms (Biceps & Triceps)',
    landmark: 'Midpoint between top of shoulder (acromion) and elbow tip (olecranon).',
    relaxedGuide: 'Let arm hang loose and relaxed at your side with palm facing forward. Measure around the mid-bicep level.',
    pumpedGuide: 'Raise upper arm horizontal, curl forearm hard toward shoulder at a 90° angle, and wrap tape across the highest bicep peak.',
    tip: 'Keep tape strictly perpendicular to the humerus bone.'
  },
  {
    id: 'forearms',
    name: 'Forearms',
    landmark: 'Thickest point of the forearm, approximately 4–6 cm below the elbow crease.',
    relaxedGuide: 'Arm hanging straight down, fingers open and relaxed. Measure around the widest belly of the forearm.',
    pumpedGuide: 'Clench fist tightly and slightly extend or curl wrist upward to peak the brachioradialis muscle.',
    tip: 'Forearms swell significantly after heavy pulling, deadlifts, and farmer walks.'
  },
  {
    id: 'chest',
    name: 'Chest & Torso',
    landmark: 'Directly across the nipple line and mid-sternum, horizontally across the back.',
    relaxedGuide: 'Stand upright with arms relaxed at sides. Breathe out naturally (normal end-tidal expiration). Do not suck in air.',
    pumpedGuide: 'Gently flare your lats, take a comfortable full inhale to expand ribcage, and measure widest upper chest shelf.',
    tip: 'Ensure the tape stays parallel to the floor across your shoulder blades.'
  },
  {
    id: 'shoulders',
    name: 'Shoulders (Delts)',
    landmark: 'Widest horizontal line across the lateral deltoid heads and upper chest.',
    relaxedGuide: 'Stand relaxed with feet shoulder-width apart, arms hanging by sides without tensing.',
    pumpedGuide: 'Measure immediately after shoulder/push workout during peak deltoid blood flow (hyperemia).',
    tip: 'Best measured in front of a mirror or with a partner to ensure the tape remains level.'
  },
  {
    id: 'waist',
    name: 'Waist & Abdominals',
    landmark: 'Narrowest point of the torso, or directly level across the navel (belly button).',
    relaxedGuide: 'Stand naturally with weight balanced on both feet. Exhale normally without pushing belly out or sucking inward.',
    pumpedGuide: 'Tensed / Vacuum: Exhale completely and draw abdominal wall inward into a vacuum contraction.',
    tip: 'Never cinch the tape so tight that it depresses the skin.'
  },
  {
    id: 'hips',
    name: 'Hips & Glutes',
    landmark: 'Widest circumference around the maximum posterior protrusion of the gluteus maximus.',
    relaxedGuide: 'Stand with heels together and weight distributed evenly. Muscles relaxed.',
    pumpedGuide: 'Tensed: Firmly contract the glutes together as if locking out a heavy hip thrust.',
    tip: 'Wear thin athletic shorts or underwear for consistent accuracy.'
  },
  {
    id: 'thighs',
    name: 'Thighs (Quads & Hamstrings)',
    landmark: 'Midway between the inguinal hip crease and the upper border of the patella (kneecap).',
    relaxedGuide: 'Shift bodyweight onto the opposite leg. Keep measuring leg slightly bent and completely relaxed.',
    pumpedGuide: 'Plant foot firmly, lock knee straight, and contract quads hard to pop the teardrop (VMO) and outer sweep.',
    tip: 'Measure both legs or track dominant leg consistently.'
  },
  {
    id: 'calves',
    name: 'Calves (Gastrocnemius)',
    landmark: 'Widest horizontal cross-section of the calf muscle.',
    relaxedGuide: 'Seated or standing with weight off the measuring leg, foot flat on floor.',
    pumpedGuide: 'Rise onto the balls of your feet (plantar flexion) and tense the calf peaks hard.',
    tip: 'Calves respond well to high-rep pump tracking.'
  },
  {
    id: 'neck',
    name: 'Neck',
    landmark: 'Just below the thyroid prominence (Adam\'s apple).',
    relaxedGuide: 'Look straight ahead with neck and traps relaxed. Wrap tape horizontally without pressure.',
    pumpedGuide: 'Measure relaxed baseline; avoid straining neck musculature.',
    tip: 'Useful for body fat estimation formulas (US Navy method).'
  }
];

export const MeasurementGuideModal: React.FC<MeasurementGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedMuscleId, setSelectedMuscleId] = useState<string>('arms');

  if (!isOpen) return null;

  const activeMuscle = MUSCLE_GUIDES.find(m => m.id === selectedMuscleId) || MUSCLE_GUIDES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 my-auto max-h-[92vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100">
                  How to Measure Correctly
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Standardized Protocol
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Standard anatomical landmarks for accurate Relaxed vs. Pumped tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Golden Rules (Minimalist Horizontal Bar) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
              <span>1. Tape Tension</span>
            </span>
            <p className="text-[11px] text-zinc-300 leading-snug">
              Tape must stay flat and snug against skin. Never pull so tightly that it creates an indent in tissue.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
              <span>2. Relaxed Timing</span>
            </span>
            <p className="text-[11px] text-zinc-300 leading-snug">
              Measure Relaxed in morning fasted state before workout to capture genuine tissue hypertrophy.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
              <span>3. Pumped / Tensed</span>
            </span>
            <p className="text-[11px] text-zinc-300 leading-snug">
              Measure Pumped right after workout during peak muscle engorgement or hard 4-second flex.
            </p>
          </div>
        </div>

        {/* Muscle Selector Navigation (Pill-less Minimalist Segmented List) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
            Select Muscle Landmark:
          </label>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {MUSCLE_GUIDES.map(m => {
              const isActive = m.id === selectedMuscleId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMuscleId(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                      : 'bg-zinc-850/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {m.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Muscle Details Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-zinc-850">
            <div>
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>{activeMuscle.name}</span>
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                <strong className="text-zinc-300">Landmark:</strong> {activeMuscle.landmark}
              </p>
            </div>
            {activeMuscle.tip && (
              <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 self-start sm:self-auto">
                Tip: {activeMuscle.tip}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Relaxed Protocol */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 uppercase font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  <span>Relaxed State</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Resting Baseline</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeMuscle.relaxedGuide}
              </p>
            </div>

            {/* Pumped / Tensed Protocol */}
            <div className="p-3.5 rounded-xl bg-amber-400/5 border border-amber-400/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pumped / Tensed State</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300">Peak Hyperemia</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeMuscle.pumpedGuide}
              </p>
            </div>
          </div>
        </div>

        {/* Footer info & close */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-zinc-500 text-[11px] hidden sm:inline">
            Use fiberglass or vinyl tape (cm). Log every 2–4 weeks.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md ml-auto"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
