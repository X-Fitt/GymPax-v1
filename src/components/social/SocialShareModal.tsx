import React, { useRef, useState } from 'react';
import { X, Share2, Download, Copy, Check, Trophy, Flame, Dumbbell } from 'lucide-react';
import { ActiveWorkout } from '../../types';

interface SocialShareModalProps {
  workout: ActiveWorkout;
  unit: 'kg' | 'lbs';
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  workout,
  unit,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const displayVolume = unit === 'kg'
    ? Math.round(workout.totalVolumeKg).toLocaleString()
    : Math.round(workout.totalVolumeKg * 2.20462).toLocaleString();

  const minutes = Math.floor(workout.durationSeconds / 60);
  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );

  const topExercise = workout.exercises[0]?.name || 'Heavy Compounds';

  const shareText = `Crushed today's workout on GymPax! 💪\n🏋️ ${workout.title}\n📊 ${displayVolume} ${unit} total volume lifted\n⏱️ ${minutes} mins · ${totalSets} completed sets${
    workout.prCount ? `\n🏆 ${workout.prCount} New Personal Record!` : ''
  }\n#GymPax #Bodybuilding #Hypertrophy`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GymPax: ${workout.title}`,
          text: shareText,
          url: window.location.href
        });
      } catch {
        // Share cancelled or unsupported
      }
    } else {
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = () => {
    // Generate an image canvas card and download
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; // 4:5 Instagram ratio
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1350);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#18181b');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Subtle gold border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, 1000, 1270);

    // App Brand Wordmark
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GYMPAX', 540, 140);

    // Subtitle
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('BODYBUILDING & HYPERTROPHY LOG', 540, 185);

    // Workout Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(workout.title, 540, 320);

    // Date
    ctx.fillStyle = '#71717a';
    ctx.font = '28px sans-serif';
    ctx.fillText(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 540, 380);

    // Big Volume Display Card
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.roundRect(140, 450, 800, 260, [30]);
    ctx.fill();

    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('TOTAL TONNAGE MOVED', 540, 520);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 96px monospace';
    ctx.fillText(`${displayVolume} ${unit.toUpperCase()}`, 540, 620);

    // Stat Row (Time & Sets)
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.roundRect(140, 750, 380, 200, [24]);
    ctx.fill();

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px sans-serif';
    ctx.fillText('DURATION', 330, 815);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px monospace';
    ctx.fillText(`${minutes} MIN`, 330, 895);

    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.roundRect(560, 750, 380, 200, [24]);
    ctx.fill();

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px sans-serif';
    ctx.fillText('SETS COMPLETED', 750, 815);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 64px monospace';
    ctx.fillText(`${totalSets}`, 750, 895);

    // Top Exercise
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px sans-serif';
    ctx.fillText(`Primary: ${topExercise}`, 540, 1040);

    if (workout.prCount) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`🏆 ${workout.prCount} NEW PERSONAL RECORD SET TODAY`, 540, 1110);
    }

    // Watermark
    ctx.fillStyle = '#52525b';
    ctx.font = '22px sans-serif';
    ctx.fillText('Tracked with GymPax · Progressive Overload Companion', 540, 1220);

    // Download trigger
    const link = document.createElement('a');
    link.download = `GymPax_Workout_${workout.date || 'Recap'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100">
        <div className="flex items-start justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold tracking-tight">Share Workout Story Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div
          ref={cardRef}
          className="relative p-6 rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-400/40 shadow-xl flex flex-col items-center text-center space-y-4"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-amber-400 uppercase font-display">
            <Dumbbell className="w-4 h-4" />
            <span>GYMPAX</span>
          </div>

          <div>
            <h4 className="text-lg font-extrabold text-zinc-100">{workout.title}</h4>
            <span className="text-xs text-zinc-500 font-mono mt-0.5 block">{workout.date || 'Today'}</span>
          </div>

          <div className="w-full py-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Total Volume Lifted</span>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <span className="font-mono text-3xl font-extrabold text-amber-400 tabular-nums">
                {displayVolume}
              </span>
              <span className="text-sm font-semibold text-zinc-300">{unit}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Duration</span>
              <span className="font-mono text-base font-bold text-zinc-200">{minutes} mins</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Completed Sets</span>
              <span className="font-mono text-base font-bold text-emerald-400">{totalSets} sets</span>
            </div>
          </div>

          {(workout.prCount || 0) > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{workout.prCount} New Personal Record!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleNativeShare}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
          >
            <Share2 className="w-4 h-4 fill-current" />
            <span>Share to Friends & Socials</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadCard}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Image</span>
            </button>

            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
