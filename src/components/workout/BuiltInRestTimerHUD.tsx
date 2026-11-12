import React, { useEffect, useState, useRef } from 'react';
import {
  Timer,
  X,
  Plus,
  Minus,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Zap,
  CheckCircle2,
  Flame,
  RotateCcw,
  Info
} from 'lucide-react';
import { playTimerTick, playRestTimerComplete } from '../../utils/audio';

export interface BuiltInRestTimerHUDProps {
  exerciseName: string;
  totalSeconds: number;
  initialRemaining?: number;
  soundEnabled?: boolean;
  onFinish?: () => void;
  onDismiss: () => void;
  isBetweenExercises?: boolean;
  onOpenBetweenTimerModal?: () => void;
  autoTimerEnabled?: boolean;
  onToggleAutoTimer?: () => void;
}

export const BuiltInRestTimerHUD: React.FC<BuiltInRestTimerHUDProps> = ({
  exerciseName,
  totalSeconds: initialTotalSeconds,
  initialRemaining,
  soundEnabled = true,
  onFinish,
  onDismiss,
  isBetweenExercises = false,
  onOpenBetweenTimerModal,
  autoTimerEnabled = true,
  onToggleAutoTimer
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialTotalSeconds);
  const [remaining, setRemaining] = useState<number>(initialRemaining ?? initialTotalSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(soundEnabled);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const hasAlertedRef = useRef<boolean>(false);

  // Sync if new initialTotalSeconds arrives (e.g. another set completed)
  useEffect(() => {
    setTotalSeconds(initialTotalSeconds);
    setRemaining(initialRemaining ?? initialTotalSeconds);
    setIsPaused(false);
    hasAlertedRef.current = false;
  }, [initialTotalSeconds, initialRemaining]);

  // Main countdown timer interval
  useEffect(() => {
    if (isPaused) return;

    if (remaining <= 0) {
      if (!hasAlertedRef.current) {
        hasAlertedRef.current = true;
        if (isSoundOn) {
          playRestTimerComplete();
        }
        // Haptic pulse on mobile devices
        if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
          try {
            navigator.vibrate([200, 100, 200]);
          } catch {
            // ignore
          }
        }
        onFinish?.();
      }
      return;
    }

    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        if (isSoundOn && next <= 3 && next > 0) {
          playTimerTick();
        } else if (isSoundOn && next === 0) {
          playRestTimerComplete();
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, isPaused, isSoundOn, onFinish]);

  const addTime = (secs: number) => {
    setRemaining(prev => Math.max(0, prev + secs));
    setTotalSeconds(prev => Math.max(prev, remaining + secs));
    hasAlertedRef.current = false;
  };

  const setPreset = (secs: number) => {
    setTotalSeconds(secs);
    setRemaining(secs);
    setIsPaused(false);
    hasAlertedRef.current = false;
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const progressFraction = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const progressPercent = Math.min(100, Math.max(0, progressFraction * 100));

  // Circular progress ring calculations (Radius: 36px)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressFraction * circumference);

  // Dynamic coaching status based on rest stage
  const getCoachingTip = () => {
    if (remaining === 0) {
      return { text: 'Rest complete! Attack your next set with full intensity.', badge: '⚡ TIME TO LIFT' };
    }
    if (remaining <= 10) {
      return { text: 'Chalk up and set your grip on the bar.', badge: '🔥 GET READY' };
    }
    if (remaining <= 30) {
      return { text: 'Lactate clearance & central nervous system reset.', badge: '🧠 FOCUS' };
    }
    return { text: 'ATP-CP phosphagen system replenishing (deep belly breaths).', badge: '🫁 RECOVER' };
  };

  const tip = getCoachingTip();

  // Floating Minimized Indicator Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-50 bg-zinc-900/95 border border-orange-500 ring-1 ring-orange-500/30 rounded-2xl px-3.5 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(249,115,22,0.25)] backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
        {/* Mini circular progress indicator */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-zinc-800"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 15}
              strokeDashoffset={2 * Math.PI * 15 * (1 - progressFraction)}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                remaining === 0 ? 'text-emerald-400' : remaining <= 10 ? 'text-rose-500' : 'text-amber-400'
              }`}
            />
          </svg>
          <Timer className="w-3.5 h-3.5 text-amber-400 absolute" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono font-extrabold text-sm tabular-nums ${
                remaining === 0
                  ? 'text-emerald-400 animate-pulse'
                  : remaining <= 10
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {remaining === 0 ? 'GO!' : formattedTime}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Rest</span>
          </div>
          <div className="text-[10px] text-zinc-400 truncate max-w-[110px]">{exerciseName}</div>
        </div>

        <div className="flex items-center gap-1 pl-1 border-l border-zinc-800">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title="Expand Rest HUD"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Floating Rest Timer Popup HUD
  return (
    <div className="sticky top-2 z-40 mx-3 sm:mx-auto mt-2.5 mb-1 max-w-3xl w-[calc(100%-1.5rem)] sm:w-full rounded-2xl bg-zinc-900/95 border border-orange-500 ring-1 ring-orange-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(249,115,22,0.22)] backdrop-blur-xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner Row */}
      <div className="px-3.5 sm:px-4 py-2 max-w-3xl mx-auto flex items-center justify-end gap-2">

        {/* Right Header Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          {onToggleAutoTimer && (
            <button
              type="button"
              onClick={onToggleAutoTimer}
              className="px-2 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 border border-zinc-700/70 text-[11px] font-medium text-zinc-300 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title={autoTimerEnabled ? 'Disable timer between exercises' : 'Enable timer between exercises'}
            >
              <Timer className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{autoTimerEnabled ? 'Disable Timer' : 'Enable Timer'}</span>
            </button>
          )}
          {onOpenBetweenTimerModal && (
            <button
              type="button"
              onClick={onOpenBetweenTimerModal}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Between Exercises Timer Info & Settings"
              aria-label="Between Exercises Timer Settings"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isSoundOn ? 'Mute Audio Chime' : 'Unmute Audio Chime'}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Minimize to Floating Pill"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Dismiss Rest Timer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Countdown Display & Action Strip */}
      <div className="px-4 pb-3.5 max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Circular Countdown Ring & Time display */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
              {/* Background Ring Track */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-zinc-800/80"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-700 ${
                  remaining === 0
                    ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : remaining <= 10
                    ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                }`}
              />
            </svg>

            {/* Inner Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`font-mono text-xl sm:text-2xl font-black tabular-nums tracking-tight ${
                  remaining === 0
                    ? 'text-emerald-400 animate-bounce'
                    : remaining <= 10
                    ? 'text-rose-400 animate-pulse'
                    : 'text-zinc-100'
                }`}
              >
                {remaining === 0 ? 'GO!' : formattedTime}
              </span>
              <span className="text-[9px] font-mono text-zinc-400 uppercase font-semibold">
                {isPaused ? 'PAUSED' : `${Math.round(progressPercent)}% left`}
              </span>
            </div>
          </div>

          {/* Quick Presets & Status */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
              Preset Durations
            </span>
            <div className="flex items-center gap-1.5">
              {[60, 90, 120, 180].map(preset => (
                <button
                  key={preset}
                  onClick={() => setPreset(preset)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    totalSeconds === preset && remaining > 0
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-zinc-100 border border-zinc-700/60'
                  }`}
                >
                  {preset}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Adjustments & Primary CTA Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick increment/decrement buttons */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
            <button
              onClick={() => addTime(-15)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono font-semibold flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Minus 15 seconds"
            >
              <Minus className="w-3 h-3" />
              <span>15s</span>
            </button>
            <span className="w-px h-4 bg-zinc-800" />
            <button
              onClick={() => addTime(15)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono font-semibold flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Add 15 seconds"
            >
              <Plus className="w-3 h-3" />
              <span>15s</span>
            </button>
            <span className="w-px h-4 bg-zinc-800" />
            <button
              onClick={() => addTime(30)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono font-semibold flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Add 30 seconds"
            >
              <Plus className="w-3 h-3" />
              <span>30s</span>
            </button>
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isPaused
                ? 'bg-amber-400 text-zinc-950 border-amber-300'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
            title={isPaused ? 'Resume Rest' : 'Pause Rest'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Primary Skip / Ready Button */}
          <button
            onClick={onDismiss}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/20 transition-transform active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Ready to Lift</span>
          </button>
        </div>
      </div>

      {/* Bottom Linear Progress Bar Strip */}
      <div className="w-full bg-zinc-800/80 h-1 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            remaining === 0
              ? 'bg-emerald-400'
              : remaining <= 10
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-amber-500 to-amber-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
