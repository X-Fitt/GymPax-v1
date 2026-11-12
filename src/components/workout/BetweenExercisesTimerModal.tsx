import React, { useState, useEffect } from 'react';
import {
  Timer,
  X,
  CheckCircle2,
  Bell,
  Zap,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Volume2,
  Clock
} from 'lucide-react';

export interface BetweenExercisesTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerEnabled: boolean;
  onToggleTimer: (enabled: boolean) => void;
  defaultRestSeconds: number;
  onChangeDefaultRestSeconds?: (seconds: number) => void;
}

export const STORAGE_KEY_HIDE_BETWEEN_TIMER_POPUP = 'gympax_hide_between_exercises_timer_popup';

export const BetweenExercisesTimerModal: React.FC<BetweenExercisesTimerModalProps> = ({
  isOpen,
  onClose,
  timerEnabled,
  onToggleTimer,
  defaultRestSeconds,
  onChangeDefaultRestSeconds
}) => {
  const [neverShowAgain, setNeverShowAgain] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_HIDE_BETWEEN_TIMER_POPUP) === 'true';
    } catch {
      return false;
    }
  });

  if (!isOpen) return null;

  const handleSaveAndClose = () => {
    try {
      if (neverShowAgain) {
        localStorage.setItem(STORAGE_KEY_HIDE_BETWEEN_TIMER_POPUP, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY_HIDE_BETWEEN_TIMER_POPUP);
      }
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 text-zinc-100">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Timer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Between Exercises Timer</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 font-semibold border border-amber-400/30">
                  Auto Rest
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Automatic transition timer after each exercise
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short Description */}
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850">
          <div className="space-y-1.5">
            <span className="font-bold text-zinc-200 block text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>How the timer works:</span>
            </span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              When you finish all prescribed sets of an exercise, a <strong className="text-zinc-200">between-exercises recovery timer</strong> starts automatically.
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <div className="flex items-start gap-2 text-[11px] text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-300">Physiological Recovery:</strong> Gives your central nervous system and ATP phosphocreatine reserves 90–120s to replenish before heavy lifts.
              </span>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-300">Station & Equipment Prep:</strong> Gives you time to re-rack weights, adjust bench angles, or sanitize the next machine.
              </span>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-300">Always In Control:</strong> You can pause, skip, or add +15s at any time from the sticky countdown bar.
              </span>
            </div>
          </div>
        </div>

        {/* Enable / Disable Timer Option */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-100">
                  Timer Between Exercises
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                    timerEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {timerEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {timerEnabled
                  ? 'Timer will automatically begin after each completed exercise'
                  : 'Timer is turned off; you pace your exercises manually'}
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => onToggleTimer(!timerEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                timerEnabled ? 'bg-amber-400' : 'bg-zinc-750'
              }`}
              role="switch"
              aria-checked={timerEnabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                  timerEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Duration Presets (When Enabled) */}
          {timerEnabled && onChangeDefaultRestSeconds && (
            <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                Default Duration:
              </span>
              <div className="flex items-center gap-1.5">
                {[60, 90, 120, 180].map(secs => (
                  <button
                    key={secs}
                    type="button"
                    onClick={() => onChangeDefaultRestSeconds(secs)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      defaultRestSeconds === secs
                        ? 'bg-amber-400 text-zinc-950 shadow-sm'
                        : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                    }`}
                  >
                    {secs}s
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Never Show Again Option Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200 select-none transition-colors">
            <input
              type="checkbox"
              checked={neverShowAgain}
              onChange={e => setNeverShowAgain(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-0 cursor-pointer w-4 h-4 shrink-0"
            />
            <span>Never show this popup again in the future</span>
          </label>
          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5 pl-6.5">
            You can always re-enable or change the timer from the top bar Auto-Rest button.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Got It</span>
          </button>
        </div>
      </div>
    </div>
  );
};
