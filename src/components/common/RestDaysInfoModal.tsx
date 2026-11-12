import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Info,
  ShieldCheck,
  Brain,
  Zap,
  Activity,
  Heart,
  Moon,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface RestDaysInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDays?: number;
}

export const RestDaysInfoModal: React.FC<RestDaysInfoModalProps> = ({
  isOpen,
  onClose,
  selectedDays = 5
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const restDaysCount = Math.max(0, 7 - selectedDays);

  return typeof document !== 'undefined'
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rest-days-modal-title"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-zinc-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto overscroll-contain text-left"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-850 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="rest-days-modal-title"
                    className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight"
                  >
                    Why Rest Days Are Essential
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    The science of muscular recovery, CNS reset & long-term gains
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Selection Context Card */}
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                  {selectedDays}d / week selected
                </span>
                <span className="text-zinc-400">
                  = <strong className="text-zinc-200">{restDaysCount} rest {restDaysCount === 1 ? 'day' : 'days'}</strong> per week
                </span>
              </div>
              {selectedDays === 7 ? (
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1 shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  No Rest Days
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Scheduled Rest
                </span>
              )}
            </div>

            {/* Core Principle Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>The Golden Rule of Hypertrophy</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Muscles are stimulated in the gym through mechanical tension and microscopic fiber breakdown, but{' '}
                <strong className="text-amber-300 font-semibold">they grow during rest and sleep</strong>. Without adequate recovery time, muscle protein synthesis remains suppressed, leading to systemic overtraining and plateaued strength.
              </p>
            </div>

            {/* 4 Pillars of Rest Days */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Why Your Body Needs Rest Days
              </h4>

              {/* Pillar 1: CNS */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-zinc-200">
                    Central Nervous System (CNS) Recovery
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Heavy compound lifts heavily tax neuromuscular firing pathways. While muscles can recover in 24-48 hours, the central nervous system takes 48-72 hours to restore peak motor unit recruitment and reaction velocity.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Joints & Connective Tissue */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-zinc-200">
                    Tendons, Ligaments & Joint Remodeling
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Cartilage, tendons, and ligaments receive a fraction of the blood flow that muscles do. Consecutive training days without scheduled deloads or rest lead to accumulated micro-tears, chronic inflammation, and tendinopathy.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Glycogen & Hormonal Balance */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-zinc-200">
                    Hormonal Balance & Glycogen Stores
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Non-stop daily training elevates systemic cortisol (stress hormone) and suppresses natural testosterone and growth hormone. Rest days replenish muscle glycogen stores, giving you maximal explosive force for upcoming sessions.
                  </p>
                </div>
              </div>

              {/* Pillar 4: Deep Sleep & Cellular Repair */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-zinc-200">
                    Deep Sleep & Growth Hormone Pulse
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Over-stressed lifters experience elevated resting heart rates and lower HRV, interrupting stage-3 deep slow-wave sleep where over 95% of daily human growth hormone is secreted.
                  </p>
                </div>
              </div>
            </div>

            {/* Special Guidance If Choosing 7 Days */}
            {selectedDays === 7 && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-amber-300 uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Important for 7-Day Lifters</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  If you train 7 days a week, make sure at least 1-2 sessions are dedicated solely to light active recovery (walking, gentle mobility, foam rolling, or core flow) rather than heavy resistance lifting to prevent burnout.
                </p>
              </div>
            )}

            {/* Recommended Split Benchmarks */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
              <h5 className="font-mono text-[11px] uppercase text-zinc-400 font-bold">
                Weekly Recovery Reference
              </h5>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-850">
                  <span className="font-bold text-zinc-200 block">3-4 Days/Wk</span>
                  <span className="text-zinc-400">3-4 Rest Days · Maximum recovery, perfect for busy lifters.</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-850">
                  <span className="font-bold text-amber-300 block">5 Days/Wk (Sweet Spot)</span>
                  <span className="text-zinc-400">2 Rest Days · Optimal balance of high volume and repair.</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-850">
                  <span className="font-bold text-zinc-200 block">6 Days/Wk</span>
                  <span className="text-zinc-400">1 Rest Day · High frequency, requires disciplined nutrition.</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-850">
                  <span className="font-bold text-zinc-200 block">7 Days/Wk</span>
                  <span className="text-zinc-400">0 Rest Days · Must include active recovery/mobility days.</span>
                </div>
              </div>
            </div>

            {/* Bottom Dismiss Button */}
            <div className="pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-amber-400/20"
              >
                Understood · Continue Setup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
};
