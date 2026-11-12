import React, { useState } from 'react';
import { X, Award, Target, Calculator } from 'lucide-react';
import { calculateOneRepMax } from '../../utils/calculations';
import { TermHelpTooltip } from '../common/TermHelpTooltip';

interface OneRepMaxCalculatorModalProps {
  initialWeight?: number;
  initialReps?: number;
  unit: 'kg' | 'lbs';
  onClose: () => void;
  onApplyWeight?: (weight: number) => void;
}

export const OneRepMaxCalculatorModal: React.FC<OneRepMaxCalculatorModalProps> = ({
  initialWeight = 100,
  initialReps = 5,
  unit,
  onClose,
  onApplyWeight
}) => {
  const [weight, setWeight] = useState<number>(initialWeight);
  const [reps, setReps] = useState<number>(initialReps);

  const { oneRepMax, percentages } = calculateOneRepMax(weight, reps);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div className="flex items-center">
              <h3 className="text-base font-bold tracking-tight">1-Rep Max (1RM) Estimator</h3>
              <TermHelpTooltip termId="one_rm" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs for Lifted Weight & Reps */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <label className="text-[11px] text-zinc-400 block mb-1 uppercase font-semibold">Weight Lifted</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                step="0.5"
                value={weight || ''}
                onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-xl font-bold text-zinc-100 focus:outline-none"
              />
              <span className="text-xs text-amber-400 font-semibold">{unit}</span>
            </div>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <label className="text-[11px] text-zinc-400 block mb-1 uppercase font-semibold">Reps Completed</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="30"
                value={reps || ''}
                onChange={e => setReps(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-transparent font-mono text-xl font-bold text-zinc-100 focus:outline-none"
              />
              <span className="text-xs text-zinc-400 font-semibold">reps</span>
            </div>
          </div>
        </div>

        {/* Estimated 1RM Highlight */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400/90 font-bold block">
              Estimated 1-Rep Max
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-zinc-100 tabular-nums">
                {oneRepMax}
              </span>
              <span className="text-sm font-semibold text-amber-400">{unit}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Submaximal Percentages Table */}
        <div className="bg-zinc-950/40 rounded-xl p-3 border border-zinc-800/80">
          <div className="flex items-center mb-2">
            <span className="text-xs font-semibold text-zinc-400">Training Percentages & Target Reps</span>
            <TermHelpTooltip termId="rir" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {percentages.map(p => (
              <div
                key={p.percentage}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                <div className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-zinc-500" />
                  <span className="text-zinc-400 font-medium">{p.percentage}% (~{p.repsEstimate}R)</span>
                </div>
                <span className="font-mono font-bold text-zinc-200">
                  {p.weight} {unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {onApplyWeight && (
            <button
              onClick={() => {
                onApplyWeight(oneRepMax);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide uppercase hover:bg-amber-300 transition-colors cursor-pointer shadow-md"
            >
              Set as 1RM ({oneRepMax} {unit})
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
