import React from 'react';
import { ShieldAlert, ShieldCheck, Sparkles, RefreshCw, XCircle } from 'lucide-react';
import { ImageModerationResult } from '../../utils/imageModeration';

interface ImageModerationBannerProps {
  result: ImageModerationResult | null;
  isChecking: boolean;
  onClear?: () => void;
  className?: string;
}

export const ImageModerationBanner: React.FC<ImageModerationBannerProps> = ({
  result,
  isChecking,
  onClear,
  className = ''
}) => {
  if (isChecking) {
    return (
      <div className={`p-3 rounded-xl bg-zinc-900 border border-amber-400/30 flex items-center gap-2.5 text-xs text-zinc-300 animate-pulse ${className}`}>
        <div className="w-6 h-6 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            AI Safety Scanner
          </p>
          <p className="text-[11px] text-zinc-400 truncate">
            Inspecting image for inappropriate or prohibited content...
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  if (result.flaggedAsNotAllowed) {
    return (
      <div className={`p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 space-y-2 animate-in fade-in ${className}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[9px] font-black uppercase tracking-wider border border-red-500/30">
                Not Allowed · AI Safety Flag
              </span>
              <h4 className="text-xs font-bold text-red-300 mt-0.5">
                Inappropriate Image Detected
              </h4>
            </div>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Remove image"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-[11px] text-red-300/90 leading-relaxed font-sans pl-8">
          {result.reason || 'This image was flagged by AI safety as containing inappropriate, explicit, or prohibited content. GymPax strictly prohibits explicit nudity, violence, and unsafe material.'}
        </p>

        {onClear && (
          <div className="pl-8 pt-1">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-700/50 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Choose Another Photo</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (result.checkedByAi && result.isAllowed) {
    return (
      <div className={`py-1 px-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 w-fit ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>AI Safety: Verified Allowed</span>
      </div>
    );
  }

  return null;
};
