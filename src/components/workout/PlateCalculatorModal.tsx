import React, { useState } from 'react';
import { X, Plus, Minus, Disc, RotateCcw, Check, Sparkles } from 'lucide-react';
import { calculateBarbellPlates } from '../../utils/calculations';
import { TermHelpTooltip } from '../common/TermHelpTooltip';

interface PlateCalculatorModalProps {
  initialWeight?: number;
  unit: 'kg' | 'lbs';
  onClose: () => void;
  onApplyWeight?: (weight: number) => void;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeight = 100,
  unit,
  onClose,
  onApplyWeight
}) => {
  const defaultBarWeight = unit === 'kg' ? 20 : 45;
  const storageKey = `soma_clean_barbell_weight_${unit}`;

  // Clean barbell bare tare weight state: starts at 20kg as default (or 45 lbs)
  const [barWeight, setBarWeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {}
    return defaultBarWeight;
  });

  const [barInputText, setBarInputText] = useState<string>(() => barWeight.toString());
  const [weight, setWeight] = useState<number>(() => Math.max(barWeight, initialWeight));
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [targetInput, setTargetInput] = useState<string>(() => weight.toString());

  const breakdown = calculateBarbellPlates(weight, unit, barWeight);

  const handleUpdateBarWeight = (newBarWeight: number) => {
    const validWeight = Math.max(1, Math.round(newBarWeight * 10) / 10);
    setBarWeight(validWeight);
    setBarInputText(validWeight.toString());
    try {
      localStorage.setItem(storageKey, validWeight.toString());
    } catch {}
    if (weight < validWeight) {
      setWeight(validWeight);
      setTargetInput(validWeight.toString());
    }
  };

  const adjustBarWeight = (delta: number) => {
    const nextVal = Math.max(1, Math.round((barWeight + delta) * 10) / 10);
    handleUpdateBarWeight(nextVal);
  };

  const handleBarInputBlur = () => {
    const val = parseFloat(barInputText);
    if (!isNaN(val) && val > 0) {
      handleUpdateBarWeight(val);
    } else {
      setBarInputText(barWeight.toString());
    }
  };

  const adjustWeight = (delta: number) => {
    setWeight(prev => {
      const next = Math.max(barWeight, Math.round((prev + delta) * 10) / 10);
      setTargetInput(next.toString());
      return next;
    });
  };

  const handleTargetInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val >= barWeight) {
      setWeight(val);
      setIsEditingTarget(false);
    } else {
      setTargetInput(weight.toString());
      setIsEditingTarget(false);
    }
  };

  const isDefaultBar = barWeight === defaultBarWeight;

  const barPresets = unit === 'kg' ? [
    { value: 20, label: '20 kg', isDefault: true },
    { value: 15, label: '15 kg', isDefault: false },
    { value: 25, label: '25 kg', isDefault: false },
    { value: 10, label: '10 kg', isDefault: false }
  ] : [
    { value: 45, label: '45 lbs', isDefault: true },
    { value: 35, label: '35 lbs', isDefault: false },
    { value: 55, label: '55 lbs', isDefault: false },
    { value: 25, label: '25 lbs', isDefault: false }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-zinc-100 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-amber-400" />
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold tracking-tight">Barbell Plate Calculator</h3>
              <TermHelpTooltip termId="bar_tare" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MINIMALISTIC CLEAN BARBELL WEIGHT SECTION */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Clean Bar Weight
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                  isDefaultBar
                    ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                {isDefaultBar ? `${defaultBarWeight} ${unit} (Default)` : `Manual: ${barWeight} ${unit}`}
              </span>
            </div>

            {/* Reset to 20kg default if adjusted */}
            {!isDefaultBar && (
              <button
                type="button"
                onClick={() => handleUpdateBarWeight(defaultBarWeight)}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                title={`Reset to default ${defaultBarWeight} ${unit}`}
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset to {defaultBarWeight} {unit}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Manual Stepper & Direct Editable Input */}
            <div className="flex items-center bg-zinc-900 border border-zinc-750 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => adjustBarWeight(unit === 'kg' ? -1 : -2.5)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
                title="Decrease bar weight"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center px-2">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="60"
                  value={barInputText}
                  onChange={e => {
                    setBarInputText(e.target.value);
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed) && parsed > 0) {
                      handleUpdateBarWeight(parsed);
                    }
                  }}
                  onBlur={handleBarInputBlur}
                  className="w-12 text-center font-mono font-bold text-sm text-zinc-100 bg-transparent focus:outline-none"
                  title="Manually adjust bar weight"
                />
                <span className="text-xs font-mono font-bold text-amber-400 pl-0.5">{unit}</span>
              </div>

              <button
                type="button"
                onClick={() => adjustBarWeight(unit === 'kg' ? 1 : 2.5)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
                title="Increase bar weight"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 sm:px-0 scroll-px-4 sm:scroll-px-0 scroll-smooth">
              {barPresets.map(preset => {
                const isSelected = barWeight === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      handleUpdateBarWeight(preset.value);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer snap-center snap-always ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {preset.label}{preset.isDefault ? ' (Def)' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* TARGET WEIGHT CONTROLS */}
        <div className="flex flex-col items-center justify-center py-2 bg-zinc-950/70 rounded-xl border border-zinc-800 p-3.5">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
            Total Target Barbell Load (Bar + Plates)
          </span>

          <div className="flex items-center gap-3 my-1.5">
            <button
              onClick={() => adjustWeight(unit === 'kg' ? -5 : -10)}
              className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-200 transition-transform active:scale-95 cursor-pointer"
              title="Decrease weight"
            >
              <Minus className="w-4 h-4" />
            </button>

            {isEditingTarget ? (
              <form onSubmit={handleTargetInputSubmit} className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min={barWeight}
                  autoFocus
                  value={targetInput}
                  onChange={e => setTargetInput(e.target.value)}
                  onBlur={handleTargetInputSubmit}
                  className="w-28 text-center text-3xl font-extrabold font-mono text-zinc-100 bg-zinc-900 border border-amber-400 rounded-lg px-2 py-0.5 focus:outline-none"
                />
                <span className="text-base text-amber-400 font-semibold">{unit}</span>
              </form>
            ) : (
              <div
                onClick={() => setIsEditingTarget(true)}
                className="flex items-baseline gap-1 cursor-pointer group px-2 py-0.5 rounded-lg hover:bg-zinc-900/60 transition-colors"
                title="Click to type exact weight"
              >
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-100 tabular-nums group-hover:text-amber-300 transition-colors">
                  {weight}
                </span>
                <span className="text-base text-amber-400 font-semibold">{unit}</span>
              </div>
            )}

            <button
              onClick={() => adjustWeight(unit === 'kg' ? 5 : 10)}
              className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-200 transition-transform active:scale-95 cursor-pointer"
              title="Increase weight"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset increments */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-center">
            {[1.25, 2.5, 5, 10, 20].map(inc => (
              <button
                key={inc}
                type="button"
                onClick={() => adjustWeight(inc)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono font-medium text-zinc-300 transition-colors cursor-pointer border border-zinc-750"
              >
                +{inc}
              </button>
            ))}
            <button
              type="button"
              onClick={() => adjustWeight(unit === 'kg' ? -2.5 : -5)}
              className="px-2 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-[11px] font-mono text-zinc-400 cursor-pointer"
            >
              -{unit === 'kg' ? 2.5 : 5}
            </button>
          </div>
        </div>

        {/* Visual Barbell Sleeve */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <span>Clean Bar:</span>
              <strong className="text-zinc-200 font-mono">{breakdown.barWeight} {unit}</strong>
              <span className="text-[10px] text-zinc-500">
                {isDefaultBar ? '(Default standard)' : '(Manual clean tare)'}
              </span>
            </span>
            <span>
              Per Side: <strong className="text-amber-400 font-mono text-sm">{breakdown.weightPerSide} {unit}</strong>
            </span>
          </div>

          {/* Simulated Olympic Bar Sleeve Graphic */}
          <div className="relative h-20 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center px-4 overflow-x-auto">
            {/* Barbell shaft */}
            <div className="w-12 h-6 bg-zinc-600 rounded-l-sm border-r-2 border-zinc-400 shrink-0 flex items-center justify-center">
              <span className="text-[8px] font-mono text-zinc-300 rotate-90 leading-none">COLLAR</span>
            </div>

            {/* Plates loaded on this side */}
            <div className="flex items-center gap-1 pl-2">
              {breakdown.platesPerSide.length === 0 ? (
                <span className="text-xs text-zinc-500 italic pl-3">
                  Just the clean bar ({breakdown.barWeight} {unit} tare weight)
                </span>
              ) : (
                breakdown.platesPerSide.flatMap(p =>
                  Array.from({ length: p.countPerSide }).map((_, i) => (
                    <div
                      key={`${p.plateWeight}_${i}`}
                      style={{
                        backgroundColor: p.color,
                        height: Math.min(68, Math.max(34, p.plateWeight * 2.2)) + 'px',
                        width: '18px'
                      }}
                      className="rounded-sm border border-zinc-700 flex flex-col items-center justify-center shadow-md shrink-0"
                    >
                      <span className={`text-[9px] font-mono font-bold leading-none ${p.plateWeight === 5 ? 'text-black' : 'text-white'}`}>
                        {p.plateWeight}
                      </span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>

        {/* Plate Breakdown List */}
        <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-300">
              Plates Needed Per Side:
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {breakdown.weightPerSide} {unit} plate weight
            </span>
          </div>

          {breakdown.platesPerSide.length === 0 ? (
            <span className="text-xs text-zinc-500">
              No plates required for this weight (equals empty clean barbell).
            </span>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {breakdown.platesPerSide.map(p => (
                <div key={p.plateWeight} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-zinc-600" style={{ backgroundColor: p.color }} />
                    <span className="font-mono font-medium">{p.plateWeight} {unit}</span>
                  </div>
                  <span className="font-bold text-amber-400 font-mono">× {p.countPerSide}</span>
                </div>
              ))}
            </div>
          )}

          {breakdown.remainder > 0 && (
            <div className="mt-2 text-[11px] text-amber-400/90 italic">
              * Note: {breakdown.remainder} {unit} per side cannot be loaded with standard plate increments.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          {onApplyWeight && (
            <button
              onClick={() => {
                onApplyWeight(weight);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide uppercase hover:bg-amber-300 transition-colors cursor-pointer shadow-md"
            >
              Use {weight} {unit}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-xs hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
