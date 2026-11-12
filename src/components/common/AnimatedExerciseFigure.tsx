import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Activity, Maximize2, X, Film } from 'lucide-react';
import { MuscleGroup } from '../../types';
import { findExerciseDefinition } from '../../data/exercises';

interface AnimatedExerciseFigureProps {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  category?: 'bench' | 'squat' | 'deadlift' | 'overhead' | 'pull' | 'curl' | 'dip' | 'cable';
  compact?: boolean;
  cdnUrl?: string;
  cdn_url?: string;
}

export const AnimatedExerciseFigure: React.FC<AnimatedExerciseFigureProps> = ({
  exerciseId,
  exerciseName,
  primaryMuscle,
  category,
  compact = false,
  cdnUrl,
  cdn_url
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const dbExercise = findExerciseDefinition(exerciseId) || findExerciseDefinition(exerciseName);
  const resolvedCdnUrl = cdn_url || cdnUrl || dbExercise?.cdn_url || dbExercise?.cdnUrl;
  const resolvedMuscleLabel = dbExercise?.primary_muscle || dbExercise?.rawPrimaryMuscle || primaryMuscle;

  useEffect(() => {
    setVideoError(false);
  }, [exerciseId, resolvedCdnUrl]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, speed, resolvedCdnUrl]);

  // Infer animation category if not explicitly provided
  const animType = category || (
    exerciseId.includes('bench') || exerciseId.includes('press') && exerciseId.includes('incline') || exerciseId.includes('dip')
      ? 'bench'
      : exerciseId.includes('squat') || exerciseId.includes('leg') || exerciseId.includes('calf')
      ? 'squat'
      : exerciseId.includes('deadlift') || exerciseId.includes('rdl')
      ? 'deadlift'
      : exerciseId.includes('overhead') || exerciseId.includes('lateral')
      ? 'overhead'
      : exerciseId.includes('curl')
      ? 'curl'
      : exerciseId.includes('lat') || exerciseId.includes('row') || exerciseId.includes('pull')
      ? 'pull'
      : 'cable'
  );

  // Smooth RAF loop for the lifter repetition
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      // standard 3.2 second full rep cycle at 1x
      const repDuration = 3.2 / speed;
      setProgress(prev => (prev + dt / repDuration) % 1);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  // Sine wave smooth movement between 0 (top/start) and 1 (bottom/peak stretch)
  // 0 -> 1 is eccentric, 1 -> 0 is concentric
  const t = Math.sin(progress * Math.PI * 2);
  const depth = (Math.cos(progress * Math.PI * 2) + 1) / 2; // 0 to 1 smooth

  const isConcentric = progress > 0.5;
  const phaseLabel = isConcentric ? 'Concentric (Power)' : 'Eccentric (Stretch)';

  // Muscle highlight color
  const muscleHighlight = '#facc15'; // Amber 400

  return (
    <>
      <div className={`relative flex flex-col items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden select-none ${compact ? 'p-2 min-h-[220px] sm:min-h-[240px] h-56 sm:h-60' : 'p-3 sm:p-4 min-h-[260px] sm:min-h-[320px] h-68 sm:h-80'}`}>
      {/* Exercise Phase & Rep Ticker */}
      <div className="absolute top-2.5 left-3 flex items-center gap-2 z-10 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-zinc-800/80">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
          {resolvedCdnUrl && !videoError ? `Video Stream • ${resolvedMuscleLabel}` : phaseLabel}
        </span>
      </div>

      <div className="absolute top-2.5 right-3 flex items-center gap-1.5 z-10">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
          title={isPlaying ? 'Pause Video' : 'Play Video'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
        </button>
        <button
          type="button"
          onClick={() => setSpeed(s => (s === 1 ? 1.5 : s === 1.5 ? 0.75 : 1))}
          className="px-1.5 py-0.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 font-mono text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {speed}x
        </button>
      </div>

      {resolvedCdnUrl && !videoError ? (
        <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            key={resolvedCdnUrl}
            src={resolvedCdnUrl}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-contain object-center rounded-xl filter brightness-[0.90] contrast-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none rounded-xl" />
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
          {/* Simplified Video Expansion Button (Bottom Right) */}
          <button
            type="button"
            onClick={() => setIsFullScreen(true)}
            title="Expand video to full screen"
            aria-label="Expand video to full screen"
            className="absolute bottom-8 right-2.5 p-1.5 rounded-lg bg-black/80 hover:bg-black text-amber-400 hover:text-amber-300 backdrop-blur-md border border-zinc-700/80 hover:border-amber-400/80 shadow-md cursor-pointer z-20 transition-all active:scale-95 flex items-center gap-1 text-[11px] font-mono font-medium"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Expand</span>
          </button>
        </div>
      ) : (
        /* SVG Vector Animation Arena Fallback */
        <svg
          viewBox="0 0 300 200"
          className="w-full h-full max-h-56 filter drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
        {/* Dynamic Scene based on exercise category */}
        {animType === 'bench' && (
          <g>
            {/* Gym Bench */}
            <rect x="40" y="140" width="220" height="12" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
            <rect x="70" y="152" width="10" height="36" fill="#18181b" />
            <rect x="220" y="152" width="10" height="36" fill="#18181b" />
            <rect x="50" y="184" width="50" height="6" rx="2" fill="#27272a" />
            <rect x="200" y="184" width="50" height="6" rx="2" fill="#27272a" />

            {/* Lifter Body on Bench */}
            {/* Torso & Head */}
            <circle cx="80" cy="132" r="10" fill="#71717a" />
            <path d="M90 134 L180 134" stroke="#a1a1aa" strokeWidth="18" strokeLinecap="round" />
            
            {/* Chest Muscle Highlight */}
            <path
              d="M105 132 L140 132"
              stroke={muscleHighlight}
              strokeWidth={16 + depth * 3}
              strokeLinecap="round"
              opacity={0.85 + depth * 0.15}
            />

            {/* Legs on floor */}
            <path d="M180 134 L215 155 L215 188" stroke="#71717a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Arms & Barbell Motion */}
            {/* Calculated Barbell Y: at top = 70, at chest = 115 */}
            {(() => {
              const barY = 70 + depth * 46;
              const elbowX = 120 - depth * 14;
              const elbowY = 110 + depth * 26;

              return (
                <g>
                  {/* Upper Arm & Forearm */}
                  <path
                    d={`M 115 130 Q ${elbowX} ${elbowY} 120 ${barY}`}
                    stroke="#e4e4e7"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {/* Barbell knurled shaft */}
                  <line x1="30" y1={barY} x2="210" y2={barY} stroke="#d4d4d8" strokeWidth="5" strokeLinecap="round" />
                  
                  {/* Left Olympic Plates */}
                  <rect x="36" y={barY - 24} width="8" height="48" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
                  <rect x="45" y={barY - 20} width="6" height="40" rx="1.5" fill="#3b82f6" />
                  {/* Right Olympic Plates */}
                  <rect x="186" y={barY - 20} width="6" height="40" rx="1.5" fill="#3b82f6" />
                  <rect x="193" y={barY - 24} width="8" height="48" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />

                  {/* Hands gripping bar */}
                  <circle cx="120" cy={barY} r="6" fill="#facc15" />
                </g>
              );
            })()}
          </g>
        )}

        {animType === 'squat' && (
          <g>
            {/* Gym Floor line */}
            <line x1="20" y1="185" x2="280" y2="185" stroke="#3f3f46" strokeWidth="3" />

            {(() => {
              // Squat depth: hip descends, knee flexes forward, torso tilts slightly
              const hipY = 110 + depth * 38;
              const hipX = 135 - depth * 12;
              const kneeX = 165 + depth * 8;
              const kneeY = 145 + depth * 10;
              const torsoAngle = depth * 18; // degrees tilt
              const barY = 60 + depth * 45;
              const barX = 148 - depth * 10;

              return (
                <g>
                  {/* Feet */}
                  <ellipse cx="165" cy="183" rx="12" ry="4" fill="#52525b" />

                  {/* Lower Legs (Shin) */}
                  <line x1="165" y1="183" x2={kneeX} y2={kneeY} stroke="#71717a" strokeWidth="12" strokeLinecap="round" />

                  {/* Upper Legs (Quads) - Highlighted */}
                  <line
                    x1={kneeX}
                    y1={kneeY}
                    x2={hipX}
                    y2={hipY}
                    stroke={muscleHighlight}
                    strokeWidth={14 + depth * 2}
                    strokeLinecap="round"
                  />

                  {/* Torso */}
                  <line x1={hipX} y1={hipY} x2={barX} y2={barY + 12} stroke="#a1a1aa" strokeWidth="16" strokeLinecap="round" />

                  {/* Head */}
                  <circle cx={barX + 4} cy={barY} r="9" fill="#71717a" />

                  {/* Barbell resting on upper traps */}
                  <line x1="60" y1={barY + 10} x2="240" y2={barY + 10} stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
                  
                  {/* Plates */}
                  <rect x="66" y={barY - 18} width="10" height="56" rx="2" fill="#ef4444" />
                  <rect x="78" y={barY - 14} width="8" height="48" rx="2" fill="#3b82f6" />
                  <rect x="214" y={barY - 14} width="8" height="48" rx="2" fill="#3b82f6" />
                  <rect x="224" y={barY - 18} width="10" height="56" rx="2" fill="#ef4444" />

                  {/* Hands securing barbell */}
                  <circle cx={barX - 25} cy={barY + 10} r="5" fill="#facc15" />
                  <circle cx={barX + 25} cy={barY + 10} r="5" fill="#facc15" />
                </g>
              );
            })()}
          </g>
        )}

        {animType === 'deadlift' && (
          <g>
            <line x1="20" y1="185" x2="280" y2="185" stroke="#3f3f46" strokeWidth="3" />

            {(() => {
              // Deadlift: depth 0 = standing lockout, depth 1 = barbell on floor
              const barY = 125 + depth * 45;
              const hipX = 145 - depth * 28;
              const hipY = 115 + depth * 25;
              const shoulderX = 150 + depth * 6;
              const shoulderY = 70 + depth * 40;

              return (
                <g>
                  {/* Feet */}
                  <ellipse cx="155" cy="183" rx="14" ry="4" fill="#52525b" />
                  {/* Shin */}
                  <line x1="155" y1="183" x2="152" y2="148" stroke="#71717a" strokeWidth="12" strokeLinecap="round" />
                  {/* Hamstrings & Glutes Highlight */}
                  <line
                    x1="152"
                    y1="148"
                    x2={hipX}
                    y2={hipY}
                    stroke={muscleHighlight}
                    strokeWidth={14 + (1 - depth) * 2}
                    strokeLinecap="round"
                  />
                  {/* Rigid Spine / Back - Highlighted */}
                  <line
                    x1={hipX}
                    y1={hipY}
                    x2={shoulderX}
                    y2={shoulderY}
                    stroke="#facc15"
                    strokeWidth="15"
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                  {/* Head */}
                  <circle cx={shoulderX + 5} cy={shoulderY - 10} r="9" fill="#71717a" />
                  {/* Arms hanging plumb vertical to bar */}
                  <line x1={shoulderX} y1={shoulderY} x2="160" y2={barY} stroke="#e4e4e7" strokeWidth="8" strokeLinecap="round" />

                  {/* Barbell and heavy plates */}
                  <line x1="60" y1={barY} x2="240" y2={barY} stroke="#d4d4d8" strokeWidth="6" strokeLinecap="round" />
                  <rect x="68" y={barY - 26} width="12" height="52" rx="3" fill="#ef4444" />
                  <rect x="82" y={barY - 22} width="10" height="44" rx="2" fill="#3b82f6" />
                  <rect x="208" y={barY - 22} width="10" height="44" rx="2" fill="#3b82f6" />
                  <rect x="220" y={barY - 26} width="12" height="52" rx="3" fill="#ef4444" />

                  {/* Grip */}
                  <circle cx="160" cy={barY} r="6" fill="#facc15" />
                </g>
              );
            })()}
          </g>
        )}

        {animType === 'overhead' && (
          <g>
            <line x1="40" y1="185" x2="260" y2="185" stroke="#3f3f46" strokeWidth="3" />

            {(() => {
              // Press bar straight up: depth 0 = locked overhead, depth 1 = on clavicles
              const barY = 40 + depth * 55;
              const elbowY = 70 + depth * 32;
              const elbowX = 135 - depth * 18;

              return (
                <g>
                  {/* Legs & Torso */}
                  <line x1="140" y1="183" x2="145" y2="140" stroke="#71717a" strokeWidth="12" strokeLinecap="round" />
                  <line x1="160" y1="183" x2="155" y2="140" stroke="#71717a" strokeWidth="12" strokeLinecap="round" />
                  <line x1="150" y1="140" x2="150" y2="95" stroke="#a1a1aa" strokeWidth="16" strokeLinecap="round" />

                  {/* Shoulders / Delts - Highlighted */}
                  <ellipse cx="150" cy="95" rx="16" ry="8" fill={muscleHighlight} opacity={0.9} />
                  <circle cx="150" cy="78" r="9" fill="#71717a" />

                  {/* Arms */}
                  <path
                    d={`M 138 95 Q ${elbowX} ${elbowY} 135 ${barY}`}
                    stroke="#e4e4e7"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={`M 162 95 Q ${300 - elbowX} ${elbowY} 165 ${barY}`}
                    stroke="#e4e4e7"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Barbell */}
                  <line x1="60" y1={barY} x2="240" y2={barY} stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
                  <rect x="70" y={barY - 18} width="8" height="36" rx="2" fill="#3b82f6" />
                  <rect x="222" y={barY - 18} width="8" height="36" rx="2" fill="#3b82f6" />
                  
                  <circle cx="135" cy={barY} r="5" fill="#facc15" />
                  <circle cx="165" cy={barY} r="5" fill="#facc15" />
                </g>
              );
            })()}
          </g>
        )}

        {animType === 'curl' && (
          <g>
            <line x1="40" y1="185" x2="260" y2="185" stroke="#3f3f46" strokeWidth="3" />

            {(() => {
              // Bicep Curl: depth 0 = peak bicep squeeze at chest, depth 1 = full arm hang extension
              const handY = 85 + depth * 55;
              const handX = 168 - depth * 14;
              const elbowX = 148;
              const elbowY = 120;

              return (
                <g>
                  {/* Body */}
                  <line x1="135" y1="183" x2="138" y2="135" stroke="#71717a" strokeWidth="12" strokeLinecap="round" />
                  <line x1="138" y1="135" x2="142" y2="85" stroke="#a1a1aa" strokeWidth="16" strokeLinecap="round" />
                  <circle cx="142" cy="70" r="9" fill="#71717a" />

                  {/* Upper Arm Pin */}
                  <line x1="145" y1="88" x2={elbowX} y2={elbowY} stroke="#a1a1aa" strokeWidth="11" strokeLinecap="round" />
                  
                  {/* Biceps Highlight - peaks when curled */}
                  <ellipse
                    cx="150"
                    cy="104"
                    rx={7 + (1 - depth) * 4}
                    ry={9 + (1 - depth) * 3}
                    fill={muscleHighlight}
                    opacity={0.9}
                  />

                  {/* Forearm */}
                  <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round" />

                  {/* Dumbbell */}
                  <rect x={handX - 8} y={handY - 14} width="16" height="6" rx="2" fill="#52525b" />
                  <line x1={handX} y1={handY - 14} x2={handX} y2={handY + 14} stroke="#d4d4d8" strokeWidth="4" />
                  <rect x={handX - 8} y={handY + 8} width="16" height="6" rx="2" fill="#52525b" />
                  <circle cx={handX} cy={handY} r="6" fill="#facc15" />
                </g>
              );
            })()}
          </g>
        )}

        {animType === 'pull' && (
          <g>
            {/* Lat Pulldown Machine bar overhead */}
            <rect x="70" y="25" width="160" height="6" rx="2" fill="#3f3f46" />
            <line x1="150" y1="25" x2="150" y2="60" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />

            {(() => {
              // Pulldown: depth 0 = bar pulled down to clavicles, depth 1 = full stretch up
              const barY = 95 - (1 - depth) * 40;
              const elbowX = 120 - (1 - depth) * 12;
              const elbowY = 100 - (1 - depth) * 20;

              return (
                <g>
                  {/* Seat and Pad */}
                  <rect x="110" y="150" width="80" height="10" rx="3" fill="#27272a" />
                  <line x1="150" y1="160" x2="150" y2="185" stroke="#3f3f46" strokeWidth="8" />

                  {/* Lifter Seated */}
                  <line x1="148" y1="150" x2="150" y2="105" stroke="#a1a1aa" strokeWidth="16" strokeLinecap="round" />
                  {/* Lat Muscle V-Taper Highlight */}
                  <polygon
                    points={`135,115 165,115 156,145 144,145`}
                    fill={muscleHighlight}
                    opacity={0.85 + (1 - depth) * 0.15}
                  />
                  <circle cx="150" cy="92" r="8" fill="#71717a" />

                  {/* Wide Lat Pulldown Bar */}
                  <path
                    d={`M 70 ${barY + 6} L 90 ${barY} L 210 ${barY} L 230 ${barY + 6}`}
                    stroke="#e4e4e7"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Arms */}
                  <line x1="140" y1="105" x2="95" y2={barY} stroke="#d4d4d8" strokeWidth="7" strokeLinecap="round" />
                  <line x1="160" y1="105" x2="205" y2={barY} stroke="#d4d4d8" strokeWidth="7" strokeLinecap="round" />

                  {/* Hands */}
                  <circle cx="95" cy={barY} r="5" fill="#facc15" />
                  <circle cx="205" cy={barY} r="5" fill="#facc15" />
                </g>
              );
            })()}
          </g>
        )}

        {animType === 'cable' && (
          <g>
            {/* Cable Station Pulley Column */}
            <rect x="35" y="30" width="12" height="150" rx="2" fill="#27272a" />
            <circle cx="41" cy="45" r="7" fill="#3f3f46" stroke="#71717a" strokeWidth="2" />

            {(() => {
              // Cable movement
              const handleY = 80 + depth * 40;
              const handleX = 145 + depth * 15;

              return (
                <g>
                  {/* Cable Wire */}
                  <line x1="41" y1="45" x2={handleX} y2={handleY} stroke="#a1a1aa" strokeWidth="2" />

                  {/* Lifter */}
                  <line x1="170" y1="183" x2="168" y2="135" stroke="#71717a" strokeWidth="12" strokeLinecap="round" />
                  <line x1="168" y1="135" x2="160" y2="90" stroke="#a1a1aa" strokeWidth="16" strokeLinecap="round" />
                  
                  {/* Primary Muscle Highlight */}
                  <circle cx="155" cy="95" r="9" fill={muscleHighlight} opacity={0.85} />
                  <circle cx="160" cy="74" r="8" fill="#71717a" />

                  {/* Arm extending */}
                  <line x1="160" y1="92" x2={handleX} y2={handleY} stroke="#e4e4e7" strokeWidth="8" strokeLinecap="round" />
                  <circle cx={handleX} cy={handleY} r="6" fill="#facc15" />
                </g>
              );
            })()}
          </g>
        )}
        </svg>
      )}

      {/* Target Muscle Tag */}
      <div className="absolute bottom-2.5 flex items-center justify-between w-full px-3 text-[11px] text-zinc-400 bg-black/50 backdrop-blur-xs py-0.5">
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Focus: <strong className="text-zinc-200">{resolvedMuscleLabel}</strong></span>
        </span>
        <span className="text-[10px] text-zinc-400 font-mono">
          {resolvedCdnUrl && !videoError ? 'Video Stream' : `${Math.round(progress * 100)}% Rep Progress`}
        </span>
      </div>
    </div>

      {/* Full Screen Video Popup */}
      {isFullScreen && (
        <div
          onClick={() => setIsFullScreen(false)}
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
                    {exerciseName}
                  </h4>
                </div>
                <p className="text-[11px] text-amber-400 font-mono uppercase tracking-wider truncate mt-0.5">
                  Target: {resolvedMuscleLabel}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFullScreen(false)}
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
              {resolvedCdnUrl && !videoError ? (
                <video
                  src={resolvedCdnUrl}
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
                  <span className="text-sm font-mono text-zinc-200">{exerciseName}</span>
                </div>
              )}
            </div>

            {/* Minimalistic Footer */}
            <div className="shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="truncate">Full Screen Video · {resolvedMuscleLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
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
