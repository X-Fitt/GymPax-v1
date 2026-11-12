import React, { useState } from 'react';
import {
  X,
  Scale,
  Ruler,
  Flame,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { BodyMeasurement } from '../../types';
import { MeasurementGuideModal } from './MeasurementGuideModal';
import { MuscleMeasurementExplanationModal } from './MuscleMeasurementExplanationModal';

interface AddMeasurementModalProps {
  unit: 'kg' | 'lbs';
  onClose: () => void;
  onSave: (measurement: BodyMeasurement) => void;
}

interface MuscleFieldConfig {
  key: string;
  label: string;
  subtitle: string;
  hasPumped: boolean;
  relaxedState: string;
  setRelaxedState: (val: string) => void;
  pumpedState?: string;
  setPumpedState?: (val: string) => void;
  defaultRelaxed: string;
  defaultPumped?: string;
}

export const AddMeasurementModal: React.FC<AddMeasurementModalProps> = ({
  unit,
  onClose,
  onSave
}) => {
  const [weight, setWeight] = useState<string>('84.5');
  const [viewFilter, setViewFilter] = useState<'all' | 'relaxed' | 'pumped'>('all');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [explainingMuscleKey, setExplainingMuscleKey] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  // 1. Arms (Biceps & Triceps)
  const [armsRelaxed, setArmsRelaxed] = useState<string>('37.5');
  const [armsPumped, setArmsPumped] = useState<string>('41.0');

  // 2. Forearms
  const [forearmsRelaxed, setForearmsRelaxed] = useState<string>('30.5');
  const [forearmsPumped, setForearmsPumped] = useState<string>('32.5');

  // 3. Chest
  const [chestRelaxed, setChestRelaxed] = useState<string>('103.5');
  const [chestPumped, setChestPumped] = useState<string>('107.0');

  // 4. Shoulders (Delts)
  const [shouldersRelaxed, setShouldersRelaxed] = useState<string>('122.0');
  const [shouldersPumped, setShouldersPumped] = useState<string>('125.0');

  // 5. Waist (Navel)
  const [waistRelaxed, setWaistRelaxed] = useState<string>('83.5');
  const [waistTensed, setWaistTensed] = useState<string>('81.0');

  // 6. Hips & Glutes
  const [hipsRelaxed, setHipsRelaxed] = useState<string>('100.0');
  const [hipsTensed, setHipsTensed] = useState<string>('99.0');

  // 7. Thighs (Quads)
  const [thighsRelaxed, setThighsRelaxed] = useState<string>('61.0');
  const [thighsPumped, setThighsPumped] = useState<string>('63.2');

  // 8. Calves
  const [calvesRelaxed, setCalvesRelaxed] = useState<string>('37.5');
  const [calvesPumped, setCalvesPumped] = useState<string>('39.5');

  // 9. Neck
  const [neck, setNeck] = useState<string>('40.0');

  const muscleConfigs: MuscleFieldConfig[] = [
    {
      key: 'arms',
      label: 'Arms (Biceps & Triceps)',
      subtitle: 'Peak flexed bicep apex vs. resting',
      hasPumped: true,
      relaxedState: armsRelaxed,
      setRelaxedState: setArmsRelaxed,
      pumpedState: armsPumped,
      setPumpedState: setArmsPumped,
      defaultRelaxed: '37.5',
      defaultPumped: '41.0'
    },
    {
      key: 'forearms',
      label: 'Forearms',
      subtitle: 'Brachioradialis peak fist vs. open palm',
      hasPumped: true,
      relaxedState: forearmsRelaxed,
      setRelaxedState: setForearmsRelaxed,
      pumpedState: forearmsPumped,
      setPumpedState: setForearmsPumped,
      defaultRelaxed: '30.5',
      defaultPumped: '32.5'
    },
    {
      key: 'chest',
      label: 'Chest & Torso',
      subtitle: 'Nipple line lat flare vs. normal breath',
      hasPumped: true,
      relaxedState: chestRelaxed,
      setRelaxedState: setChestRelaxed,
      pumpedState: chestPumped,
      setPumpedState: setChestPumped,
      defaultRelaxed: '103.5',
      defaultPumped: '107.0'
    },
    {
      key: 'shoulders',
      label: 'Shoulders (Delts)',
      subtitle: 'Lateral deltoid cap width',
      hasPumped: true,
      relaxedState: shouldersRelaxed,
      setRelaxedState: setShouldersRelaxed,
      pumpedState: shouldersPumped,
      setPumpedState: setShouldersPumped,
      defaultRelaxed: '122.0',
      defaultPumped: '125.0'
    },
    {
      key: 'waist',
      label: 'Waist & Abdominals',
      subtitle: 'Resting navel vs. vacuum / tensed',
      hasPumped: true,
      relaxedState: waistRelaxed,
      setRelaxedState: setWaistRelaxed,
      pumpedState: waistTensed,
      setPumpedState: setWaistTensed,
      defaultRelaxed: '83.5',
      defaultPumped: '81.0'
    },
    {
      key: 'hips',
      label: 'Hips & Glutes',
      subtitle: 'Gluteus maximus maximum protrusion',
      hasPumped: true,
      relaxedState: hipsRelaxed,
      setRelaxedState: setHipsRelaxed,
      pumpedState: hipsTensed,
      setPumpedState: setHipsTensed,
      defaultRelaxed: '100.0',
      defaultPumped: '99.0'
    },
    {
      key: 'thighs',
      label: 'Thighs (Quads & Hamstrings)',
      subtitle: 'Mid-thigh teardrop (VMO) flex vs. loose',
      hasPumped: true,
      relaxedState: thighsRelaxed,
      setRelaxedState: setThighsRelaxed,
      pumpedState: thighsPumped,
      setPumpedState: setThighsPumped,
      defaultRelaxed: '61.0',
      defaultPumped: '63.2'
    },
    {
      key: 'calves',
      label: 'Calves (Gastrocnemius)',
      subtitle: 'Toes standing peak flex vs. flat',
      hasPumped: true,
      relaxedState: calvesRelaxed,
      setRelaxedState: setCalvesRelaxed,
      pumpedState: calvesPumped,
      setPumpedState: setCalvesPumped,
      defaultRelaxed: '37.5',
      defaultPumped: '39.5'
    },
    {
      key: 'neck',
      label: 'Neck',
      subtitle: 'Midpoint below thyroid cartilage',
      hasPumped: false,
      relaxedState: neck,
      setRelaxedState: setNeck,
      defaultRelaxed: '40.0'
    }
  ];

  const handleSave = () => {
    const numWeight = parseFloat(weight) || 80;

    const parsedArmsRel = parseFloat(armsRelaxed) || undefined;
    const parsedArmsPmp = parseFloat(armsPumped) || undefined;
    const parsedForearmsRel = parseFloat(forearmsRelaxed) || undefined;
    const parsedForearmsPmp = parseFloat(forearmsPumped) || undefined;
    const parsedChestRel = parseFloat(chestRelaxed) || undefined;
    const parsedChestPmp = parseFloat(chestPumped) || undefined;
    const parsedShouldersRel = parseFloat(shouldersRelaxed) || undefined;
    const parsedShouldersPmp = parseFloat(shouldersPumped) || undefined;
    const parsedWaistRel = parseFloat(waistRelaxed) || undefined;
    const parsedWaistTensed = parseFloat(waistTensed) || undefined;
    const parsedHipsRel = parseFloat(hipsRelaxed) || undefined;
    const parsedHipsTensed = parseFloat(hipsTensed) || undefined;
    const parsedThighsRel = parseFloat(thighsRelaxed) || undefined;
    const parsedThighsPmp = parseFloat(thighsPumped) || undefined;
    const parsedCalvesRel = parseFloat(calvesRelaxed) || undefined;
    const parsedCalvesPmp = parseFloat(calvesPumped) || undefined;
    const parsedNeck = parseFloat(neck) || undefined;

    const measurement: BodyMeasurement = {
      id: `m_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      bodyweightKg: unit === 'kg' ? numWeight : Math.round((numWeight / 2.20462) * 10) / 10,
      bodyweightLbs: unit === 'lbs' ? numWeight : Math.round(numWeight * 2.20462 * 10) / 10,

      // Core legacy compatibility (prefer pumped or relaxed)
      chestCm: parsedChestPmp || parsedChestRel,
      armsCm: parsedArmsPmp || parsedArmsRel,
      waistCm: parsedWaistRel || parsedWaistTensed,
      thighsCm: parsedThighsPmp || parsedThighsRel,
      shouldersCm: parsedShouldersPmp || parsedShouldersRel,

      // Relaxed vs. Pumped granular states
      armsRelaxedCm: parsedArmsRel,
      armsPumpedCm: parsedArmsPmp,
      forearmsRelaxedCm: parsedForearmsRel,
      forearmsPumpedCm: parsedForearmsPmp,
      chestRelaxedCm: parsedChestRel,
      chestPumpedCm: parsedChestPmp,
      shouldersRelaxedCm: parsedShouldersRel,
      shouldersPumpedCm: parsedShouldersPmp,
      waistRelaxedCm: parsedWaistRel,
      waistTensedCm: parsedWaistTensed,
      hipsRelaxedCm: parsedHipsRel,
      hipsTensedCm: parsedHipsTensed,
      thighsRelaxedCm: parsedThighsRel,
      thighsPumpedCm: parsedThighsPmp,
      calvesRelaxedCm: parsedCalvesRel,
      calvesPumpedCm: parsedCalvesPmp,
      neckCm: parsedNeck,

      notes: notes.trim() || undefined
    };

    onSave(measurement);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 my-auto max-h-[92vh] overflow-y-auto font-sans">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight text-zinc-100">
                    Log Body Measurements
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Measure relaxed baseline and post-workout pump
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer border border-zinc-700/60"
                title="How to measure correctly guide"
                aria-label="How to measure correctly guide"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Measurement Guide</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bodyweight Section */}
          <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Current Bodyweight
                </label>
                <button
                  type="button"
                  onClick={() => setExplainingMuscleKey('weight')}
                  className="w-4 h-4 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 border border-zinc-750 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                  title="How to measure bodyweight accurately"
                  aria-label="How to measure bodyweight accurately"
                >
                  ?
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Morning Fasted</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full bg-transparent font-mono text-2xl font-bold text-zinc-100 focus:outline-none"
              />
              <span className="text-sm font-semibold text-amber-400 font-mono">{unit}</span>
            </div>
          </div>

          {/* Circumferences Section */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Muscles to Measure (cm)
                </span>
                {/* Minimalist Question Mark Button */}
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-zinc-950 flex items-center justify-center text-[10px] font-black cursor-pointer transition-colors"
                  title="Click for measurement landmarks and technique"
                >
                  ?
                </button>
              </div>

              {/* Minimalist View Filter Toggle */}
              <div className="flex items-center p-0.5 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    viewFilter === 'all'
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Both States
                </button>
                <button
                  type="button"
                  onClick={() => setViewFilter('relaxed')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    viewFilter === 'relaxed'
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Relaxed
                </button>
                <button
                  type="button"
                  onClick={() => setViewFilter('pumped')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    viewFilter === 'pumped'
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Pumped / Tensed
                </button>
              </div>
            </div>

            {/* Muscle Inputs Grid */}
            <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
              {muscleConfigs.map(m => {
                const relVal = parseFloat(m.relaxedState);
                const pmpVal = m.pumpedState ? parseFloat(m.pumpedState) : NaN;
                const hasBoth = !isNaN(relVal) && !isNaN(pmpVal) && relVal > 0 && pmpVal > 0;
                const pumpDelta = hasBoth ? Math.round((pmpVal - relVal) * 10) / 10 : null;

                return (
                  <div
                    key={m.key}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700/80 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-200 block truncate">
                            {m.label}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExplainingMuscleKey(m.key);
                            }}
                            className="w-4 h-4 rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 border border-zinc-750 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                            title={`How to correctly measure ${m.label}`}
                            aria-label={`How to correctly measure ${m.label}`}
                          >
                            ?
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {m.subtitle}
                        </span>
                      </div>

                      {/* Calculated pump delta badge */}
                      {hasBoth && m.key !== 'waist' && m.key !== 'hips' && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${
                          (pumpDelta || 0) >= 0
                            ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {(pumpDelta || 0) >= 0 ? `+${pumpDelta} cm pump` : `${pumpDelta} cm`}
                        </span>
                      )}
                      {hasBoth && m.key === 'waist' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {pmpVal < relVal ? `${Math.round((pmpVal - relVal) * 10) / 10} cm vacuum` : 'Braced'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Relaxed Input */}
                      {(viewFilter === 'all' || viewFilter === 'relaxed') && (
                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase text-zinc-400">
                            Relaxed
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={m.relaxedState}
                              onChange={e => m.setRelaxedState(e.target.value)}
                              placeholder={m.defaultRelaxed}
                              className="w-16 text-right bg-transparent font-mono text-sm font-bold text-zinc-100 focus:outline-none"
                            />
                            <span className="text-[10px] text-zinc-500 font-mono">cm</span>
                          </div>
                        </div>
                      )}

                      {/* Pumped / Tensed Input */}
                      {m.hasPumped && (viewFilter === 'all' || viewFilter === 'pumped') && m.pumpedState !== undefined && m.setPumpedState && (
                        <div className="p-2 rounded-lg bg-amber-400/5 border border-amber-400/30 flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400" />
                            <span>{m.key === 'waist' || m.key === 'hips' ? 'Tensed' : 'Pumped'}</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={m.pumpedState}
                              onChange={e => m.setPumpedState && m.setPumpedState(e.target.value)}
                              placeholder={m.defaultPumped || '0.0'}
                              className="w-16 text-right bg-transparent font-mono text-sm font-bold text-amber-300 focus:outline-none"
                            />
                            <span className="text-[10px] text-amber-400/80 font-mono">cm</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Condition Notes */}
          <div>
            <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
              Condition & Session Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Morning fasted weigh-in, post-arm day pump..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Measurements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Standalone Question Mark How to Measure Guide Modal */}
      <MeasurementGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Specific Muscle Measurement Explanation Popup */}
      <MuscleMeasurementExplanationModal
        isOpen={!!explainingMuscleKey}
        muscleKey={explainingMuscleKey}
        onClose={() => setExplainingMuscleKey(null)}
      />
    </>
  );
};
