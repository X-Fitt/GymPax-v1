import React from 'react';
import {
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { WorkoutPlan } from '../../types';

interface ReplaceWorkoutPlanWarningModalProps {
  isOpen: boolean;
  currentPlan: WorkoutPlan;
  newPlan: WorkoutPlan | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const ReplaceWorkoutPlanWarningModal: React.FC<ReplaceWorkoutPlanWarningModalProps> = ({
  isOpen,
  currentPlan,
  newPlan,
  onAccept,
  onDecline
}) => {
  if (!isOpen || !newPlan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] overflow-hidden text-zinc-100">
        {/* Pinned Header (Never cut off) */}
        <div className="shrink-0 px-5 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                Replace Workout Program?
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                Adjust active schedule in Workout tab
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDecline}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Decline and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 overscroll-contain">
          {/* Primary Warning Callout */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-300 leading-snug">
                The current Workout will be lost and the new plan will be added to the workout.
              </p>
              <p className="text-[11px] text-zinc-300/90 leading-relaxed">
                Any ongoing session or draft workout will be cleared and replaced with this plan's schedule.
              </p>
            </div>
          </div>

          {/* Comparison Details Card */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Current Workout Plan */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1 min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block truncate">
                  Current Program
                </span>
                <h4 className="text-xs font-bold text-zinc-300 truncate" title={currentPlan.title}>
                  {currentPlan.title}
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {currentPlan.daysPerWeek}d/wk · {currentPlan.routines.length} routines
                </p>
              </div>

              {/* New Workout Plan */}
              <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/25 space-y-1 min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400/90 font-bold block truncate">
                  Incoming Plan
                </span>
                <h4 className="text-xs font-bold text-amber-300 truncate" title={newPlan.title}>
                  {newPlan.title}
                </h4>
                <p className="text-[10px] text-zinc-300 font-mono">
                  {newPlan.daysPerWeek}d/wk · {newPlan.routines.length} routines
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Action Buttons Footer (Never cut off) */}
        <div className="shrink-0 px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/95 flex items-center gap-2">
          {/* Decline Button */}
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer border border-zinc-750 text-center"
          >
            Decline (Keep Current)
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer shadow-sm text-center"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Accept & Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
