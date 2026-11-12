import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Share2,
  Calendar,
  Scale,
  Camera,
  CheckCircle2,
  Layers,
  Maximize2,
  X,
  Globe,
  Lock
} from 'lucide-react';
import { UserCommunityPhoto } from '../../types';

interface BeforeAfterShowcaseProps {
  beforePhoto?: UserCommunityPhoto;
  afterPhoto?: UserCommunityPhoto;
  allPhotos: UserCommunityPhoto[];
  onOpenUpload: (defaultTag?: 'before' | 'after') => void;
  onSetTag: (photoId: string, tag: 'before' | 'after' | 'physique') => void;
  onShareToFeed?: (before: UserCommunityPhoto, after: UserCommunityPhoto, notes: string) => void;
  unit?: 'kg' | 'lbs';
}

export const BeforeAfterShowcase: React.FC<BeforeAfterShowcaseProps> = ({
  beforePhoto,
  afterPhoto,
  allPhotos,
  onOpenUpload,
  onSetTag,
  onShareToFeed,
  unit = 'kg'
}) => {
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareCaption, setShareCaption] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const hasBoth = Boolean(beforePhoto && afterPhoto);
  const hasEither = Boolean(beforePhoto || afterPhoto);

  // Compute weight delta if available
  let weightDelta: number | null = null;
  if (beforePhoto?.weightKg && afterPhoto?.weightKg) {
    weightDelta = Math.round((afterPhoto.weightKg - beforePhoto.weightKg) * 10) / 10;
  }

  const handlePublishShare = () => {
    if (beforePhoto && afterPhoto && onShareToFeed) {
      onShareToFeed(beforePhoto, afterPhoto, shareCaption);
      setShowShareModal(false);
      setShareCaption('');
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-zinc-100">
              Before & After Photos
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
              Side-by-Side
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare baseline vs current progress. Displayed next to each other for visual hypertrophy evaluation.
          </p>
        </div>

        {hasBoth && onShareToFeed && (
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share to Feed</span>
          </button>
        )}
      </div>

      {/* Main Side-by-Side Display */}
      {hasBoth ? (
        <div className="space-y-4">
          {/* Side-by-side photos displayed next to each other */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 relative">
            {/* Left: BEFORE Photo */}
            <div className="relative group rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col">
              <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                <img
                  src={beforePhoto!.url}
                  alt="Before Photo"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />
                {/* Before Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-950/90 backdrop-blur-md text-zinc-300 border border-zinc-700/80 font-mono font-bold text-[10px] sm:text-xs tracking-wider uppercase shadow-md">
                    BEFORE
                  </span>
                  {beforePhoto!.visibility === 'private' ? (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 text-purple-300 border border-purple-800/80 font-mono text-[9px] flex items-center gap-1 shadow-xs">
                      <Lock className="w-2.5 h-2.5" />
                      Private
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 text-amber-400 border border-amber-400/30 font-mono text-[9px] flex items-center gap-1 shadow-xs">
                      <Globe className="w-2.5 h-2.5" />
                      Community
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewImage({ url: beforePhoto!.url, title: 'Before Photo' })}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Expand Photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Before Details */}
              <div className="p-2.5 sm:p-3 bg-zinc-900/90 border-t border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="font-semibold text-zinc-200 truncate">
                    {beforePhoto!.dateLabel || 'Baseline'}
                  </span>
                  {beforePhoto!.weightKg && (
                    <span className="text-zinc-400 shrink-0">
                      {unit === 'kg'
                        ? `${beforePhoto!.weightKg} kg`
                        : `${Math.round(beforePhoto!.weightKg * 2.20462)} lbs`}
                    </span>
                  )}
                </div>
                {beforePhoto!.caption && (
                  <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                    "{beforePhoto!.caption}"
                  </p>
                )}
              </div>
            </div>

            {/* Right: AFTER Photo */}
            <div className="relative group rounded-2xl bg-zinc-950 border border-amber-400/40 overflow-hidden flex flex-col shadow-sm">
              <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                <img
                  src={afterPhoto!.url}
                  alt="After Photo"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />
                {/* After Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-zinc-950 font-mono font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-md">
                    AFTER
                  </span>
                  {afterPhoto!.visibility === 'private' ? (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 text-purple-300 border border-purple-800/80 font-mono text-[9px] flex items-center gap-1 shadow-xs">
                      <Lock className="w-2.5 h-2.5" />
                      Private
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 text-amber-400 border border-amber-400/30 font-mono text-[9px] flex items-center gap-1 shadow-xs">
                      <Globe className="w-2.5 h-2.5" />
                      Community
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewImage({ url: afterPhoto!.url, title: 'After Photo' })}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Expand Photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* After Details */}
              <div className="p-2.5 sm:p-3 bg-zinc-900/90 border-t border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="font-semibold text-amber-300 truncate">
                    {afterPhoto!.dateLabel || 'Current'}
                  </span>
                  {afterPhoto!.weightKg && (
                    <span className="text-zinc-300 shrink-0 font-bold">
                      {unit === 'kg'
                        ? `${afterPhoto!.weightKg} kg`
                        : `${Math.round(afterPhoto!.weightKg * 2.20462)} lbs`}
                    </span>
                  )}
                </div>
                {afterPhoto!.caption && (
                  <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                    "{afterPhoto!.caption}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Transformation Metrics Summary Bar */}
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-around text-center text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Baseline</span>
              <strong className="text-zinc-200 font-mono">
                {beforePhoto!.dateLabel || 'Month 1'}
              </strong>
            </div>

            <div className="h-6 w-px bg-zinc-800" />

            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Current</span>
              <strong className="text-amber-300 font-mono">
                {afterPhoto!.dateLabel || 'Current'}
              </strong>
            </div>

            {weightDelta !== null && (
              <>
                <div className="h-6 w-px bg-zinc-800" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Scale Delta</span>
                  <strong className={`font-mono ${weightDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {weightDelta > 0 ? `+${weightDelta}` : weightDelta} {unit}
                  </strong>
                </div>
              </>
            )}

            <div className="h-6 w-px bg-zinc-800" />

            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Status</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px] inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Active</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Incomplete Before & After state */
        <div className="p-6 rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-zinc-200">
              {hasEither
                ? `You have a ${beforePhoto ? 'Before' : 'After'} photo selected`
                : 'No Before & After Pair Configured'}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {hasEither
                ? `Select or upload an ${beforePhoto ? 'AFTER' : 'BEFORE'} photo to complete your side-by-side photo display.`
                : 'Upload or tag your photos as "Before" and "After" to display them side by side next to each other.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {!beforePhoto && (
              <button
                type="button"
                onClick={() => onOpenUpload('before')}
                className="px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer border border-zinc-700 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-400" />
                <span>Upload Before Photo</span>
              </button>
            )}

            {!afterPhoto && (
              <button
                type="button"
                onClick={() => onOpenUpload('after')}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-950" />
                <span>Upload After Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-zinc-100">
                  Share Photos to IronFeed
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Publish your side-by-side before and after photos to the community feed so fellow athletes can see your progressive overload milestones!
            </p>

            <div>
              <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                Photo Caption
              </label>
              <textarea
                value={shareCaption}
                onChange={e => setShareCaption(e.target.value)}
                placeholder="e.g. 14 weeks of progressive overload & dialed nutrition. Staying consistent with high mechanical tension!"
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishShare}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Publish to Feed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white p-2 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[80vh] w-auto rounded-2xl object-contain border border-zinc-800 shadow-2xl"
            />
            <span className="text-xs font-mono text-zinc-400 mt-2">
              {previewImage.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
