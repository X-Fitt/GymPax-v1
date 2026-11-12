import React from 'react';
import {
  AlertTriangle,
  X,
  RotateCcw
} from 'lucide-react';
import { WorkoutPlan } from '../../types';

interface RedoWorkoutWarningModalProps {
  isOpen: boolean;
  plan: WorkoutPlan | null;
  onContinue: () => void;
  onDiscard: () => void;
}

export const RedoWorkoutWarningModal: React.FC<RedoWorkoutWarningModalProps> = ({
  isOpen,
  plan,
  onContinue,
  onDiscard
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/20 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] overflow-hidden text-zinc-100">
        {/* Pinned Header */}
        <div className="shrink-0 px-5 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                Redo Workout Session?
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                Workout will become active again
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDiscard}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Discard and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 overscroll-contain">
          {/* Primary Warning Callout */}
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-300 leading-snug">
                The workout will become active again and replace all current workout plans.
              </p>
              <p className="text-[11px] text-zinc-300/90 leading-relaxed">
                All exercise completion check marks will be reset so you can train through the sets from the beginning.
              </p>
            </div>
          </div>

          {/* Plan Info Card */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Target Workout Program
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {plan.daysPerWeek} Days/Wk
              </span>
            </div>
            <h4 className="text-sm font-bold text-zinc-200 truncate">
              {plan.title}
            </h4>
          </div>
        </div>

        {/* Pinned Action Buttons Footer */}
        <div className="shrink-0 px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/95 flex items-center gap-2.5">
          {/* Discard Button */}
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer border border-zinc-700 text-center"
          >
            Discard
          </button>

          {/* Continue Button */}
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer shadow-sm text-center"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
