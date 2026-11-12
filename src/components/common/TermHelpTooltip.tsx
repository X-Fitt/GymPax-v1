import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, BookOpen, Lightbulb, Info } from 'lucide-react';
import { GYM_GLOSSARY, GlossaryTerm } from '../../data/gymGlossary';
import { FitnessModelPicture } from './FitnessModelPicture';

interface TermHelpTooltipProps {
  termId?: string;
  customTitle?: string;
  customShort?: string;
  customExplanation?: string;
  customWhyItMatters?: string;
  customExample?: string;
  exerciseId?: string;
  exerciseName?: string;
  primaryMuscle?: string;
  size?: 'xs' | 'sm' | 'md';
  align?: 'left' | 'center' | 'right';
  className?: string;
  iconVariant?: 'help' | 'info';
}

export const TermHelpTooltip: React.FC<TermHelpTooltipProps> = ({
  termId,
  customTitle,
  customShort,
  customExplanation,
  customWhyItMatters,
  customExample,
  exerciseId,
  exerciseName,
  primaryMuscle,
  size = 'xs',
  align = 'center',
  className = '',
  iconVariant = 'help'
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const termData: GlossaryTerm | null = termId ? GYM_GLOSSARY[termId] || null : null;

  const title = customTitle || termData?.term || 'Gym Terminology';
  const shortDef = customShort || termData?.shortDefinition || '';
  const explanation = customExplanation || termData?.detailedExplanation || '';
  const whyItMatters = customWhyItMatters || termData?.whyItMatters || '';
  const example = customExample || termData?.exampleOrTip || '';
  const category = termData?.category || (exerciseId ? 'warmup & mobility' : 'fitness');

  // Close on Escape key
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
    xs: 'w-3.5 h-3.5 text-[9px]',
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs'
  }[size];

  return (
    <span className={`inline-flex items-center align-middle relative ${className}`}>
      {/* Trigger Button: Question Mark or Info icon depending on iconVariant */}
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        title={`What is ${title}? Tap for explanation`}
        aria-label={`What is ${title}? Tap for explanation`}
        className={`${sizeClasses} relative rounded-full bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400 hover:border-amber-400 border border-zinc-700 flex items-center justify-center font-mono font-bold transition-all duration-150 cursor-pointer shadow-xs ml-1 -mt-0.5 shrink-0 focus:outline-none focus:ring-1 focus:ring-amber-400 touch-manipulation before:absolute before:-inset-3 before:content-['']`}
      >
        {iconVariant === 'info' ? (
          <Info className="w-2.5 h-2.5" />
        ) : (
          '?'
        )}
      </button>

      {/* Floating Explanation Popover Card rendered via portal: Works across phones, tablets, and web */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-900 border border-zinc-750 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl text-zinc-100 space-y-3 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto overscroll-contain text-left"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/30 shrink-0">
                  <Info className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100 tracking-tight leading-tight">
                    {title}
                  </h4>
                  <span className="text-[10px] font-mono uppercase font-semibold text-amber-400">
                    {category} {exerciseId ? 'guide' : 'glossary'}
                  </span>
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

            {/* Animated Illustration for Warmup / Exercise Demonstration */}
            {exerciseId && (
              <div className="shrink-0 w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
                <FitnessModelPicture
                  exerciseId={exerciseId}
                  exerciseName={exerciseName || title}
                  primaryMuscle={primaryMuscle || ''}
                  aspect="wide"
                  showZoom={false}
                  preferMotionGif={true}
                  className="h-44 sm:h-52 w-full"
                />
              </div>
            )}

            {/* Quick Summary Definition */}
            {shortDef && (
              <p className="text-xs font-semibold text-zinc-200 leading-snug">
                {shortDef}
              </p>
            )}

            {/* Detailed Plain-English Explanation */}
            {explanation && (
              <p className="text-xs text-zinc-400 leading-relaxed font-normal whitespace-pre-line">
                {explanation}
              </p>
            )}

            {/* Why It Matters Callout */}
            {whyItMatters && (
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-300 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Why it matters for your training:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {whyItMatters}
                </p>
              </div>
            )}

            {/* Example / Gym Tip */}
            {example && (
              <div className="flex items-start gap-2 text-xs text-zinc-400 font-mono pt-1">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-zinc-300">Gym Tip:</strong> {example}</span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('soma:open-glossary', {
                        detail: { termId: termId || 'bmi' }
                      })
                    );
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Full Glossary →</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </span>
  );
};
