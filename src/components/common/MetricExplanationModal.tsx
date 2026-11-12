import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Info, Flame, Zap, Dumbbell, Sparkles } from 'lucide-react';
import { AiProgramRecommendation } from '../../types';

export type MetricType = 'protein' | 'calories' | 'volume';

interface MetricExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMetric?: MetricType;
  recommendation: AiProgramRecommendation;
  weightUnit?: 'kg' | 'lbs';
  userWeightKg?: number;
  userAge?: number;
  userHeightCm?: number;
  primaryGoal?: string;
  daysPerWeek?: number;
}

export const MetricExplanationModal: React.FC<MetricExplanationModalProps> = ({
  isOpen,
  onClose,
  initialMetric = 'protein',
  recommendation,
  weightUnit = 'kg',
  userWeightKg = 75,
  userAge = 25,
  userHeightCm = 178,
  primaryGoal = 'Hypertrophy (Pure Muscle Mass)',
  daysPerWeek = 4
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>(initialMetric);

  // Sync initialMetric when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMetric(initialMetric);
    }
  }, [isOpen, initialMetric]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const weightDisplay = weightUnit === 'lbs'
    ? `${Math.round(userWeightKg * 2.20462)} lbs`
    : `${userWeightKg} kg`;

  const volumeDisplay = weightUnit === 'lbs'
    ? `${Math.round(recommendation.estimatedWeeklyTonnageKg * 2.20462).toLocaleString()} lbs`
    : `${recommendation.estimatedWeeklyTonnageKg.toLocaleString()} kg`;

  return typeof document !== 'undefined'
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl text-zinc-100 space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto overscroll-contain text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Prescription Metrics</h3>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    Scientific Reasoning & Formulas
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Minimalist Switcher Pills */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-850 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveMetric('protein')}
                className={`py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer text-center ${
                  activeMetric === 'protein'
                    ? 'bg-amber-400 text-zinc-950 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Protein ({recommendation.recommendedDailyProteinG}g)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('calories')}
                className={`py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer text-center ${
                  activeMetric === 'calories'
                    ? 'bg-amber-400 text-zinc-950 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Calories ({recommendation.recommendedCaloricIntake})
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('volume')}
                className={`py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer text-center ${
                  activeMetric === 'volume'
                    ? 'bg-amber-400 text-zinc-950 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Volume ({volumeDisplay.split(' ')[0]})
              </button>
            </div>

            {/* Content for Protein */}
            {activeMetric === 'protein' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                      Target Protein
                    </span>
                    <span className="text-xl font-extrabold font-mono text-amber-400">
                      {recommendation.recommendedDailyProteinG}g / day
                    </span>
                  </div>
                  <div className="text-right text-[11px] font-mono text-zinc-400">
                    <span>2.2g per kg</span>
                    <span className="block text-zinc-500">({weightDisplay} bodyweight)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
                    <span className="font-bold text-zinc-200 text-[11px] font-mono uppercase block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Why This Exact Number?
                    </span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Scientific literature shows that <strong className="text-zinc-200">1.6 to 2.2 grams of protein per kilogram of bodyweight</strong> (approx. 1g per pound) is the optimal ceiling for natural lifters. Consuming more than this offers no additional muscle gains, while consuming less reduces muscle protein synthesis (MPS).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
                    <span className="font-bold text-zinc-200 text-[11px] font-mono uppercase block">
                      How It Supports Your Goal
                    </span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      At {recommendation.recommendedDailyProteinG}g/day spread across 3–4 meals (~{Math.round(recommendation.recommendedDailyProteinG / 4)}g per meal), each feeding provides the ~3g of leucine required to activate mTOR, repairing myofibrillar micro-damage caused by your {daysPerWeek}-day training split.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content for Calories */}
            {activeMetric === 'calories' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                      Caloric Intake
                    </span>
                    <span className="text-xl font-extrabold font-mono text-zinc-100">
                      {recommendation.recommendedCaloricIntake} kcal / day
                    </span>
                  </div>
                  <div className="text-right text-[11px] font-mono text-zinc-400">
                    <span className="text-amber-400 font-bold">Goal Adjusted</span>
                    <span className="block text-zinc-500">{primaryGoal.split('(')[0].trim()}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
                    <span className="font-bold text-zinc-200 text-[11px] font-mono uppercase block flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      The Energy Formula (BMR &times; TDEE)
                    </span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Your baseline Basal Metabolic Rate (BMR) was calculated using the Mifflin-St Jeor equation for a {userAge}-year-old at {userHeightCm}cm and {weightDisplay}. An active multiplier (~1.55x) for {daysPerWeek} weekly gym sessions yields your maintenance energy expenditure.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
                    <span className="font-bold text-zinc-200 text-[11px] font-mono uppercase block">
                      Why {recommendation.recommendedCaloricIntake} kcal?
                    </span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      {primaryGoal.includes('Fat Loss') || primaryGoal.includes('Shred')
                        ? 'Includes a targeted -500 kcal deficit below maintenance. This forces your body to oxidize adipose tissue while preserving lean muscle mass through high protein.'
                        : primaryGoal.includes('Hypertrophy') || primaryGoal.includes('Muscle')
                        ? 'Includes a calibrated +350 kcal lean surplus above maintenance. This fuels the energetic cost of protein synthesis and glycogen restoration without unwanted body fat gain.'
                        : 'Calibrated to your active maintenance expenditure to support body recomposition and neuromuscular adaptation.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content for Volume */}
            {activeMetric === 'volume' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                      Weekly Tonnage
                    </span>
                    <span className="text-xl font-extrabold font-mono text-emerald-400">
                      {volumeDisplay}
                    </span>
                  </div>
                  <div className="text-right text-[11px] font-mono text-zinc-400">
                    <span>{recommendation.plan.routines.length} Routines</span>
                    <span className="block text-zinc-500">{daysPerWeek}d / week split</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
                    <span className="font-bold text-zinc-200 text-[11px] font-mono uppercase block flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                      What is Tonnage Volume?
                    </span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Volume is calculated as <strong className="text-zinc-200">Weight &times; Sets &times; Reps</strong> summed across all working sets in your week. It represents the total mechanical workload your muscular system will execute.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
                    <span className="font-bold text-zinc-200 text-[11px] font-mono uppercase block">
                      Why This Benchmark Matters
                    </span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Mechanical tension accumulated through volume is the primary driver of hypertrophy. This target ensures every muscle receives 12–18 direct weekly working sets without exceeding your Central Nervous System (CNS) recovery threshold.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Dismiss */}
            <div className="pt-1 border-t border-zinc-850">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
};
