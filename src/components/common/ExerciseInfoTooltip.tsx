import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle, Wind, Clock, Sparkles, Dumbbell, Info, Plus } from 'lucide-react';
import { getExerciseHowTo, ExerciseHowToGuide } from '../../data/exerciseHowTo';
import { FitnessModelPicture } from './FitnessModelPicture';

interface ExerciseInfoTooltipProps {
  exerciseId?: string;
  exerciseName: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  showText?: boolean;
  onAddExercise?: () => void;
  isAlreadyAdded?: boolean;
  addLabel?: string;
}

export const ExerciseInfoTooltip: React.FC<ExerciseInfoTooltipProps> = ({
  exerciseId,
  exerciseName,
  size = 'xs',
  className = '',
  showText = false,
  onAddExercise,
  isAlreadyAdded = false,
  addLabel
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'cues' | 'mistakes'>('steps');
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const guide: ExerciseHowToGuide = getExerciseHowTo(exerciseId || exerciseName);

  // Close on outside click or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    xs: 'w-4 h-4 text-[10px]',
    sm: 'w-4.5 h-4.5 text-xs',
    md: 'w-5 h-5 text-xs'
  }[size];

  return (
    <span className={`inline-flex items-center align-middle relative ${className}`}>
      {/* Information Trigger Button for Exercise Form Guide */}
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        title={`How to perform ${exerciseName}? Tap for form guide and technique cues`}
        aria-label={`How to perform ${exerciseName}? Tap for form guide and technique cues`}
        className={`${sizeClasses} relative rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 hover:border-amber-400 border border-zinc-700 flex items-center justify-center font-mono font-bold transition-all duration-150 cursor-pointer shadow-xs ml-1 shrink-0 focus:outline-none focus:ring-1 focus:ring-amber-400 touch-manipulation before:absolute before:-inset-3 before:content-['']`}
      >
        <Info className="w-2.5 h-2.5" />
      </button>

      {showText && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          className="text-[11px] text-zinc-400 hover:text-amber-400 cursor-pointer ml-1 underline decoration-zinc-700 hover:decoration-amber-400"
        >
          Form Guide
        </span>
      )}

      {/* Floating Modal / Popover Guide rendered via portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] bg-zinc-900 border border-zinc-750 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl text-zinc-100 flex flex-col gap-2.5 animate-in zoom-in-95 duration-150 overflow-hidden text-left"
          >
            {/* Header - Pinned at top */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-2.5 shrink-0">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 mt-0.5 shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight leading-tight">
                    {guide.name}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[10px] font-mono text-zinc-400">
                    <span className="px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30">
                      {guide.rawPrimaryMuscle && guide.rawPrimaryMuscle !== guide.primaryMuscle
                        ? `${guide.rawPrimaryMuscle} (${guide.primaryMuscle})`
                        : guide.primaryMuscle}
                    </span>
                    <span>·</span>
                    <span>{guide.equipment}</span>
                    <span>·</span>
                    <span className="text-zinc-300">{guide.tier}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Motion Video / GIF Demonstration - Pinned visible the whole time for each button */}
            <div className="shrink-0 w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
              <FitnessModelPicture
                exerciseId={guide.id}
                exerciseName={guide.name}
                primaryMuscle={guide.primaryMuscle}
                cdnUrl={guide.cdnUrl}
                aspect="wide"
                showZoom={true}
                preferMotionGif={true}
                className="h-44 sm:h-52 w-full"
              />
            </div>

            {/* Short Bio Description - Pinned */}
            <p className="text-xs text-zinc-300 leading-relaxed shrink-0 line-clamp-2">
              {guide.description}
            </p>

            {/* Navigation Sub-Tabs (Button 1, Button 2, Button 3) - Pinned visible above scrollable body */}
            <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('steps')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === 'steps'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                How To Do It
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cues')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === 'cues'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Form Cues
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mistakes')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === 'mistakes'
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Avoid
              </button>
            </div>

            {/* Scrollable Tab Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-3">

          {/* TAB 1: STEP-BY-STEP EXECUTION */}
          {activeTab === 'steps' && (
            <div className="space-y-3 pt-1">
              {/* Step 1: Setup */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  1. Setup & Starting Stance
                </span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {guide.setupSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-zinc-500 font-mono text-[11px] shrink-0 mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step 2: Movement */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  2. Execution & Loaded Range
                </span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {guide.executionSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-zinc-500 font-mono text-[11px] shrink-0 mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step 3: Peak Contraction */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  3. Peak Contraction & Return
                </span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {guide.peakAndLockout.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-zinc-500 font-mono text-[11px] shrink-0 mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: PRO FORM CUES */}
          {activeTab === 'cues' && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-amber-400/5 border border-amber-400/20 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block font-mono">
                  Master Checklist for Hypertrophy:
                </span>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {guide.formCues.map((cue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Coach Tip */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-2.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400 block font-semibold text-[11px]">Pro Coach Secret:</strong>
                  <span className="text-zinc-300">{guide.proTip}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMON MISTAKES */}
          {activeTab === 'mistakes' && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block font-mono">
                  Critical Mistakes to Avoid:
                </span>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {guide.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Quick Biomechanical Specs: Breathing & Cadence */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1 font-semibold">
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>Breathing</span>
              </span>
              <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
                {guide.breathingPattern}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Recommended Cadence</span>
              </span>
              <p className="text-[11px] text-amber-400 font-mono font-bold mt-1">
                {guide.tempo}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons: Add and Close - Pinned at bottom */}
        <div className="pt-2 border-t border-zinc-850 flex items-center gap-2 shrink-0">
            {onAddExercise && (
              <button
                type="button"
                disabled={isAlreadyAdded}
                onClick={() => {
                  onAddExercise();
                  setIsOpen(false);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                  isAlreadyAdded
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
                    : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 active:scale-98'
                }`}
              >
                {isAlreadyAdded ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Already Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{addLabel || 'Add Exercise'}</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`${onAddExercise ? 'px-5' : 'w-full'} py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center`}
            >
              Close
            </button>
          </div>
        </div>
      </div>, document.body)}
    </span>
  );
};
