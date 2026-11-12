import React, { useState, useEffect } from 'react';
import { findExerciseDefinition, resolveCatalogExercise } from '../../data/exercises';
import { Maximize2, X, Film } from 'lucide-react';

interface FitnessModelPictureProps {
  exerciseId: string;
  exerciseName?: string;
  primaryMuscle?: string;
  className?: string;
  aspect?: 'square' | 'wide' | 'banner';
  showZoom?: boolean;
  imageUrl?: string;
  cdnUrl?: string;
  cdn_url?: string;
  preferMotionGif?: boolean;
}

export const FitnessModelPicture: React.FC<FitnessModelPictureProps> = ({
  exerciseId,
  exerciseName = '',
  primaryMuscle = '',
  className = '',
  aspect = 'wide',
  showZoom = true,
  imageUrl,
  cdnUrl,
  cdn_url
}) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  const dbExercise = findExerciseDefinition(exerciseId) || findExerciseDefinition(exerciseName);
  const resolvedName = exerciseName || dbExercise?.name || 'Exercise Technique';
  const resolvedPrimaryMuscle = primaryMuscle || dbExercise?.primaryMuscle || 'Full Body';
  const resolvedRawMuscle = dbExercise?.primary_muscle || dbExercise?.rawPrimaryMuscle || resolvedPrimaryMuscle;

  const isMp4Url = (url?: string) => Boolean(url && /\.(mp4|webm|mov)($|\?)/i.test(url));

  // If no cdn url is explicitly provided or present on dbExercise, strictly ground to gympax catalog
  const catalogFallback =
    !cdn_url && !cdnUrl && !dbExercise?.cdn_url && !dbExercise?.cdnUrl
      ? resolveCatalogExercise(exerciseId || exerciseName, resolvedPrimaryMuscle)
      : undefined;

  const cdnVideoUrl =
    cdn_url ||
    cdnUrl ||
    dbExercise?.cdn_url ||
    dbExercise?.cdnUrl ||
    (isMp4Url(imageUrl) ? imageUrl : undefined) ||
    catalogFallback?.cdn_url ||
    catalogFallback?.cdnUrl;

  useEffect(() => {
    setVideoError(false);
  }, [exerciseId, cdnVideoUrl]);

  const aspectClass =
    aspect === 'square'
      ? 'aspect-square min-h-[200px]'
      : aspect === 'banner'
      ? 'aspect-[21/9] min-h-[160px]'
      : 'aspect-[4/3] sm:aspect-[16/10] min-h-[220px] sm:min-h-[260px]';

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-750/90 shadow-xs group ${aspectClass} ${className}`}
      >
        {cdnVideoUrl && !videoError ? (
          <video
            key={cdnVideoUrl}
            src={cdnVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-contain object-center transition-transform duration-300 filter brightness-[0.90] contrast-[1.08]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-2">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-semibold text-zinc-300 truncate max-w-full px-2">
              {resolvedName}
            </span>
            <span className="text-[10px] font-mono text-amber-400 mt-1 uppercase tracking-wide">
              Video Demonstration • {resolvedRawMuscle}
            </span>
          </div>
        )}

        {/* Studio gradient vignette and inner ring to soften bright background into dark frame */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />

        {/* Badge: Target Muscle */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-zinc-750 text-[10px] font-mono text-zinc-200 flex items-center gap-1.5 shadow-sm max-w-[65%] truncate pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-bold text-amber-300 truncate">
            {resolvedRawMuscle}
          </span>
        </div>

        {/* Simplified Video Expansion Button (Bottom Right) */}
        {cdnVideoUrl && !videoError && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
            title="Expand video to full screen"
            aria-label="Expand video to full screen"
            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-black text-amber-400 hover:text-amber-300 backdrop-blur-md border border-zinc-700/80 hover:border-amber-400/80 shadow-md cursor-pointer z-20 transition-all active:scale-95 flex items-center gap-1 text-[11px] font-mono font-medium"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Expand</span>
          </button>
        )}
      </div>

      {/* Full Screen Video Popup */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 sm:bg-black/90 backdrop-blur-md p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-4xl bg-zinc-950 sm:bg-zinc-900 sm:border sm:border-zinc-750 sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950/90 backdrop-blur-sm z-10">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <h4 className="font-bold text-zinc-100 text-sm sm:text-base truncate">
                    {resolvedName}
                  </h4>
                </div>
                <p className="text-[11px] text-amber-400 font-mono uppercase tracking-wider truncate mt-0.5">
                  Target: {resolvedRawMuscle}
                  {resolvedRawMuscle !== resolvedPrimaryMuscle ? ` (${resolvedPrimaryMuscle})` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                  aria-label="Close full screen"
                  title="Close full screen"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            {/* Full Screen Video Stage */}
            <div className="flex-1 w-full min-h-0 relative flex items-center justify-center bg-black overflow-hidden p-2 sm:p-4">
              {cdnVideoUrl && !videoError ? (
                <video
                  src={cdnVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  onError={() => setVideoError(true)}
                  className="w-full h-full max-h-full max-w-full object-contain object-center filter brightness-[0.94] contrast-[1.06]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <Film className="w-10 h-10 text-amber-400 animate-pulse mb-2" />
                  <span className="text-sm font-mono text-zinc-200">{resolvedName}</span>
                  <span className="text-xs font-mono text-amber-400 mt-1 uppercase">
                    Video Demonstration
                  </span>
                </div>
              )}
            </div>

            {/* Minimalistic Footer */}
            <div className="shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="truncate">Full Screen Video · {resolvedRawMuscle}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="px-3 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
