import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Award,
  Share2,
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Crown,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  AlertCircle,
  X,
  Plus,
  Globe,
  Lock
} from 'lucide-react';
import { ActiveWorkout, PhotoTagType, PhotoVisibility, UserCommunityPhoto, UserProfile, UserSubscription } from '../../types';
import { playWorkoutCongratulationFanfare, playPrFanfare } from '../../utils/audio';
import { WorkoutRewardResult } from '../../utils/rewardsEngine';
import { GymAvatar } from '../common/GymAvatar';
import { WorkoutSessionGraphsCard } from './WorkoutSessionGraphsCard';
import { WorkoutSelfieCameraModal } from './WorkoutSelfieCameraModal';
import { SavedAppPhotosPickerModal } from './SavedAppPhotosPickerModal';
import {
  getUserPhotos,
  addUserPhoto,
  deleteUserPhoto,
  compressImageFile,
  getUserPhotoLimit,
  MAX_FREE_PHOTOS,
  MAX_PRO_PHOTOS,
  MAX_COMMUNITY_PHOTOS
} from '../../utils/userPhotosStorage';
import { checkImageSafetyWithAi, ImageModerationResult } from '../../utils/imageModeration';
import { ImageModerationBanner } from '../common/ImageModerationBanner';

interface WorkoutSummaryModalProps {
  workout: ActiveWorkout;
  unit: 'kg' | 'lbs';
  onClose: () => void;
  onShareToCommunity?: (
    workout: ActiveWorkout,
    attachedPhotoUrl?: string,
    photoTag?: PhotoTagType,
    photoCaption?: string
  ) => void;
  onShareToFeed?: (attachedPhotoUrl?: string, photoTag?: PhotoTagType, photoCaption?: string) => void;
  onOpenSocialShareCard: () => void;
  rewardResult?: WorkoutRewardResult | null;
  userProfile?: UserProfile | null;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  subscription?: UserSubscription;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  workout,
  unit,
  onClose,
  onShareToCommunity,
  onShareToFeed,
  onOpenSocialShareCard,
  rewardResult,
  userProfile,
  onUpdateUserProfile,
  subscription
}) => {
  // Photo upload states for post-workout session
  const isPro = subscription?.isPro ?? false;
  const maxQuota = getUserPhotoLimit(isPro);
  const [profilePhotos, setProfilePhotos] = useState<UserCommunityPhoto[]>(() => getUserPhotos(isPro));
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoTag, setPhotoTag] = useState<PhotoTagType>('after');
  const [photoVisibility, setPhotoVisibility] = useState<PhotoVisibility>('community');
  const [photoCaption, setPhotoCaption] = useState<string>('Post-workout pump! Crushed the session.');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSavedSuccess, setPhotoSavedSuccess] = useState<boolean>(false);
  const [showManagePhotos, setShowManagePhotos] = useState<boolean>(false);
  const [attachToFeed, setAttachToFeed] = useState<boolean>(true);
  const [photoModeration, setPhotoModeration] = useState<ImageModerationResult | null>(null);
  const [isCheckingPhotoAi, setIsCheckingPhotoAi] = useState<boolean>(false);
  const [showSelfieCamera, setShowSelfieCamera] = useState<boolean>(false);
  const [showSavedPhotosPicker, setShowSavedPhotosPicker] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = profilePhotos.length >= maxQuota;
  const remainingSlots = Math.max(0, maxQuota - profilePhotos.length);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setPhotoModeration(null);
    setIsProcessingPhoto(true);
    setIsCheckingPhotoAi(true);
    setPhotoSavedSuccess(false);
    try {
      const compressed = await compressImageFile(file);
      setPhotoPreview(compressed);

      // AI Safety & Inappropriate Image Detection
      const modResult = await checkImageSafetyWithAi(compressed);
      setPhotoModeration(modResult);
      if (modResult.flaggedAsNotAllowed) {
        setPhotoError(modResult.reason || 'This photo was flagged by AI as inappropriate and cannot be uploaded.');
      }
    } catch {
      setPhotoError('Unable to process photo. Please choose a standard JPEG/PNG image.');
    } finally {
      setIsProcessingPhoto(false);
      setIsCheckingPhotoAi(false);
    }
  };

  const handleCaptureSelfie = async (imageDataUrl: string) => {
    setPhotoError(null);
    setPhotoModeration(null);
    setPhotoSavedSuccess(false);
    setPhotoPreview(imageDataUrl);
    setPhotoTag('after');
    setIsCheckingPhotoAi(true);

    try {
      const modResult = await checkImageSafetyWithAi(imageDataUrl);
      setPhotoModeration(modResult);
      if (modResult.flaggedAsNotAllowed) {
        setPhotoError(modResult.reason || 'This selfie was flagged by AI moderation.');
      }
    } catch {
      // Non-blocking
    } finally {
      setIsCheckingPhotoAi(false);
    }
  };

  const handleSelectSavedPhoto = (savedPhoto: UserCommunityPhoto) => {
    setPhotoError(null);
    setPhotoModeration({ isAllowed: true, flaggedAsNotAllowed: false, flagCategory: 'none', reason: '', checkedByAi: false });
    setPhotoPreview(savedPhoto.url);
    setPhotoTag(savedPhoto.tag || 'after');
    if (savedPhoto.caption) {
      setPhotoCaption(savedPhoto.caption);
    }
    setPhotoSavedSuccess(true);
  };

  const handleSavePhotoToProfile = () => {
    if (!photoPreview) {
      setPhotoError('Please capture or select a photo first.');
      return;
    }

    if (photoModeration?.flaggedAsNotAllowed) {
      setPhotoError(photoModeration.reason || 'Cannot save: photo was flagged by AI as inappropriate.');
      return;
    }

    if (isCheckingPhotoAi) {
      setPhotoError('Please wait for AI safety inspection to complete.');
      return;
    }
    setPhotoError(null);

    const res = addUserPhoto({
      url: photoPreview,
      tag: photoTag,
      caption: photoCaption.trim() || undefined,
      weightKg: userProfile?.weightKg,
      dateLabel: photoTag === 'after' ? 'Post-Workout Pump' : photoTag === 'before' ? 'Pre-Workout Baseline' : 'Session Check-in',
      visibility: photoVisibility,
      shareToFeed: photoVisibility === 'community' && attachToFeed,
      isPro
    });

    if (!res.success) {
      setPhotoError(res.error || 'Failed to save photo.');
    } else {
      setProfilePhotos(res.photos);
      setPhotoSavedSuccess(true);
      if (userProfile && onUpdateUserProfile) {
        onUpdateUserProfile({ ...userProfile, photos: res.photos });
      }
    }
  };

  const handleDeleteOldPhoto = (photoId: string) => {
    const updated = deleteUserPhoto(photoId, isPro);
    setProfilePhotos(updated);
    setPhotoError(null);
    if (userProfile && onUpdateUserProfile) {
      onUpdateUserProfile({ ...userProfile, photos: updated });
    }
  };
  useEffect(() => {
    // 1. Triumphant congratulation sound effects
    try {
      playWorkoutCongratulationFanfare();
      if ((workout.prCount || 0) > 0) {
        setTimeout(() => playPrFanfare(), 600);
      }
    } catch {
      // Audio policies
    }

    // 2. High-energy celebratory confetti burst
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#10b981', '#ffffff']
      });
      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#ffffff', '#38bdf8']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#ffffff', '#a855f7']
        });
      }, 250);
    } catch {
      // ignore
    }
  }, [workout.prCount]);

  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );

  const displayVolume =
    unit === 'kg'
      ? Math.round(workout.totalVolumeKg).toLocaleString()
      : Math.round(workout.totalVolumeKg * 2.20462).toLocaleString();

  const minutes = Math.floor(workout.durationSeconds / 60);

  const profile = rewardResult?.updatedProfile;
  const rankTitle = profile?.rankTitle || 'Intermediate - Level 1';
  const section = profile?.section || 'Intermediate';
  const sectionPoints = profile?.sectionPoints ?? 0;
  const pointsToNextLevel = profile?.pointsToNextLevel ?? 333;
  const levelProgress = profile?.levelProgressPercent ?? 0;
  const workoutsToNextLevel = Math.ceil(pointsToNextLevel / 5);

  const isElite = section === 'Elite';
  const isProRank = section === 'Pro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 text-center font-sans max-h-[92vh] overflow-y-auto">
        {/* Top Congratulation Badge Component */}
        <div className="relative pt-2">
          {/* Glowing Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-amber-500/20 blur-xl pointer-events-none" />

          {/* Celebratory Congratulation Badge */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20 animate-in zoom-in-90 duration-300">
            <div className="w-full h-full rounded-[22px] bg-zinc-950 flex flex-col items-center justify-center text-amber-400 p-1">
              {isElite ? (
                <Crown className="w-8 h-8 fill-amber-400 text-amber-400" />
              ) : (
                <Trophy className="w-8 h-8 fill-amber-400/20 text-amber-400" />
              )}
              <span className="text-[10px] font-black font-mono tracking-tighter uppercase text-amber-300 mt-0.5">
                +5 PTS
              </span>
            </div>
          </div>
        </div>

        {/* Header Title with Athlete Avatar */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1.5 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800">
            <GymAvatar
              avatarType={userProfile?.avatarType}
              avatarUrl={userProfile?.avatarUrl}
              avatarId={userProfile?.avatarId}
              size="xs"
              fallbackInitials={userProfile?.name ? userProfile.name.substring(0, 2) : 'AH'}
            />
            <span className="text-xs font-bold text-zinc-200">
              {userProfile?.name || 'Athlete'}
            </span>
          </div>
          <span className="text-[11px] font-mono uppercase font-black tracking-widest text-amber-400">
            Congratulations!
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-100 mt-0.5">
            Workout Completed
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 whitespace-normal break-words">{workout.title}</p>
        </div>

        {/* 5 Points Reward & Rank Progress Card */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-400/30 text-left space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 font-mono font-black text-xs">
                +5
              </span>
              <div>
                <span className="text-xs font-bold text-zinc-100 block">
                  5 Points Awarded
                </span>
                <span className="text-[10px] text-zinc-400">
                  Daily workout logged successfully
                </span>
              </div>
            </div>

            {/* Current Rank Badge */}
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-bold font-mono">
                {isElite && <Crown className="w-3 h-3 fill-current" />}
                {rankTitle}
              </span>
            </div>
          </div>

          {/* Level Up / Promotion Announcement */}
          {rewardResult?.sectionPromoted && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Section Promotion! You unlocked {rankTitle}!</span>
            </div>
          )}

          {!rewardResult?.sectionPromoted && rewardResult?.levelUpOccurred && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Level Up! You reached {rankTitle}!</span>
            </div>
          )}

          {/* Progress Bar To Next Level */}
          <div className="space-y-1.5 pt-1 border-t border-zinc-850">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">
                {pointsToNextLevel > 0
                  ? `${pointsToNextLevel} points to ${profile?.nextRankTitle || 'Next Level'}`
                  : 'Max Section Pinnacle'}
              </span>
              <span className="font-mono font-bold text-amber-400">
                {sectionPoints} / 1000 pts
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%` }}
              />
            </div>

            <p className="text-[10px] text-zinc-500 pt-0.5">
              {pointsToNextLevel > 0
                ? `At 5 pts/workout, approx ${workoutsToNextLevel} completed workouts needed to level up.`
                : '1000 points reached! Ready for next section promotion.'}
            </p>
          </div>
        </div>

        {/* Big Numbers Stat Grid */}
        <div className="grid grid-cols-3 gap-2 py-2.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Volume</span>
            <span className="font-mono text-base sm:text-lg font-bold text-zinc-100 tabular-nums">
              {displayVolume}
            </span>
            <span className="text-[10px] text-amber-400">{unit}</span>
          </div>

          <div className="flex flex-col items-center border-x border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Duration</span>
            <span className="font-mono text-base sm:text-lg font-bold text-zinc-100 tabular-nums">
              {minutes}m
            </span>
            <span className="text-[10px] text-zinc-400">Time</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Sets</span>
            <span className="font-mono text-base sm:text-lg font-bold text-zinc-100 tabular-nums">
              {totalSets}
            </span>
            <span className="text-[10px] text-emerald-400">Done</span>
          </div>
        </div>

        {/* PR highlight if broken */}
        {(workout.prCount || 0) > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{workout.prCount} New Personal Record broken today!</span>
          </div>
        )}

        {/* Workout Session Graphs: Muscles, Exercised movements & Movement Types */}
        <WorkoutSessionGraphsCard
          workout={workout}
          unit={unit}
        />

        {/* POST-WORKOUT PHOTO UPLOAD SECTION */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                  Post-Workout Photo
                </h4>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Profile Quota: {profilePhotos.length} / {maxQuota} photos ({remainingSlots} remaining) · {isPro ? 'Pro Member' : 'Non-subscriber limit: 10'}
                </span>
              </div>
            </div>

            {profilePhotos.length > 0 && (
              <button
                type="button"
                onClick={() => setShowManagePhotos(!showManagePhotos)}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 cursor-pointer underline"
              >
                {showManagePhotos ? 'Hide Photos' : 'Manage / Delete Old'}
              </button>
            )}
          </div>

          {/* Manage Old Photos Drawer (to free up slots if needed) */}
          {showManagePhotos && profilePhotos.length > 0 && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                  Delete an older photo (Max {maxQuota} total):
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {profilePhotos.length}/{maxQuota} used
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {profilePhotos.map(p => (
                  <div key={p.id} className="relative rounded-lg bg-zinc-950 border border-zinc-800 p-1 flex flex-col justify-between group">
                    <div className="relative aspect-[4/3] rounded overflow-hidden">
                      <img src={p.url} alt="Profile photo" className="w-full h-full object-cover" />
                      <span className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded text-[7px] font-mono font-bold uppercase bg-black/80 text-amber-400">
                        {p.tag}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteOldPhoto(p.id)}
                      className="mt-1 w-full py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-[8px] font-bold flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                      title="Delete photo to free slot"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden File Input for Device Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoFileChange}
            className="hidden"
          />

          {/* Non-blocking Photo Quota Notice if Limit Reached */}
          {isLimitReached && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
              <div className="flex items-center justify-between gap-1.5 font-bold">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Photo Vault at Capacity ({profilePhotos.length} / {maxQuota} Photos)</span>
                </div>
                {!showManagePhotos && (
                  <button
                    type="button"
                    onClick={() => setShowManagePhotos(true)}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Manage Vault
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                You have reached the {maxQuota} photo vault limit. You can still pick an existing saved photo, or capture a selfie / device upload to attach to this workout session!
              </p>
            </div>
          )}

          {!photoPreview ? (
            /* 3-Option Post-Workout Photo Source Selector: Take Selfie, Saved App Photos, or Device Upload */
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Photo Source:</span>
                <span className="text-[10px] text-amber-400">3 Options Available</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Option 1: Take a Selfie */}
                <button
                  type="button"
                  onClick={() => setShowSelfieCamera(true)}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-left flex flex-col justify-between transition-all group hover:bg-zinc-850 cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-zinc-100 group-hover:text-amber-300 transition-colors">
                      Take a Selfie
                    </h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                      Camera with 3s timer
                    </p>
                  </div>
                </button>

                {/* Option 2: Upload from Saved Images on the App */}
                <button
                  type="button"
                  onClick={() => setShowSavedPhotosPicker(true)}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-400 text-left flex flex-col justify-between transition-all group hover:bg-zinc-850 cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-400/10 text-sky-400 border border-sky-400/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-wider bg-sky-400/10 px-1.5 py-0.5 rounded">
                      {profilePhotos.length} Saved
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-zinc-100 group-hover:text-sky-300 transition-colors">
                      Saved App Photos
                    </h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                      From your in-app vault
                    </p>
                  </div>
                </button>

                {/* Option 3: Upload from Device */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-400 text-left flex flex-col justify-between transition-all group hover:bg-zinc-850 cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-1.5 py-0.5 rounded">
                      Device
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-zinc-100 group-hover:text-emerald-300 transition-colors">
                      Upload from Device
                    </h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                      {isProcessingPhoto ? 'Compressing...' : 'Files or camera roll'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Photo Preview & Option Checker */
            <div className="space-y-3 pt-1 animate-in fade-in">
              {/* AI Safety Banner */}
              <ImageModerationBanner
                result={photoModeration}
                isChecking={isCheckingPhotoAi}
                onClear={() => {
                  setPhotoPreview(null);
                  setPhotoModeration(null);
                  setPhotoError(null);
                  setPhotoSavedSuccess(false);
                }}
              />

              <div className={`relative rounded-xl overflow-hidden bg-zinc-900 border p-2 flex flex-col sm:flex-row gap-3 items-center ${
                photoModeration?.flaggedAsNotAllowed ? 'border-red-500/60 ring-1 ring-red-500/30' : 'border-zinc-800'
              }`}>
                <div className="relative w-28 h-36 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                  <img
                    src={photoPreview}
                    alt="Post workout preview"
                    className={`w-full h-full object-cover ${
                      photoModeration?.flaggedAsNotAllowed ? 'opacity-40 blur-xs' : ''
                    }`}
                  />
                  {photoModeration?.flaggedAsNotAllowed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center bg-black/60">
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[8px] font-black uppercase">
                        Not Allowed
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-black/85 text-amber-400 border border-zinc-700">
                    {photoTag}
                  </span>
                </div>

                <div className="flex-1 w-full space-y-2 text-left">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[11px] font-bold text-zinc-200 font-mono">
                      Photo Staged for Upload
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setShowSelfieCamera(true)}
                        className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                        title="Take a new selfie"
                      >
                        Selfie
                      </button>
                      <span className="text-zinc-600">·</span>
                      <button
                        type="button"
                        onClick={() => setShowSavedPhotosPicker(true)}
                        className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
                        title="Pick from saved app photos"
                      >
                        Saved
                      </button>
                      <span className="text-zinc-600">·</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                        title="Upload from device"
                      >
                        Device
                      </button>
                    </div>
                  </div>

                  {/* Caption Input */}
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={e => setPhotoCaption(e.target.value)}
                    placeholder="Add caption (e.g. Incline DB pump was crazy)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                  />

                  {/* Action row to save or cancel */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {!photoSavedSuccess ? (
                      <button
                        type="button"
                        onClick={handleSavePhotoToProfile}
                        disabled={isLimitReached || isCheckingPhotoAi || Boolean(photoModeration?.flaggedAsNotAllowed)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase font-mono cursor-pointer transition-colors shadow-sm ${
                          photoModeration?.flaggedAsNotAllowed
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 cursor-not-allowed opacity-80'
                            : isCheckingPhotoAi
                            ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                            : 'bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950'
                        }`}
                      >
                        {isCheckingPhotoAi
                          ? 'Checking Safety...'
                          : photoModeration?.flaggedAsNotAllowed
                          ? 'Flagged · Not Allowed'
                          : isLimitReached
                          ? 'Profile Full (10/10)'
                          : 'Save to Profile'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold font-mono">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Saved to Profile ({profilePhotos.length}/10)</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoSavedSuccess(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* THE OPTION CHECKER: Choose Before vs After vs Physique */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-zinc-300 font-bold">
                    Option Checker · Photo Designation
                  </label>
                  <span className="text-[9px] font-mono text-amber-400">
                    Active: {photoTag.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono font-bold">
                  {/* AFTER OPTION */}
                  <button
                    type="button"
                    onClick={() => setPhotoTag('after')}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      photoTag === 'after'
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {photoTag === 'after' && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>AFTER (Pump)</span>
                  </button>

                  {/* BEFORE OPTION */}
                  <button
                    type="button"
                    onClick={() => setPhotoTag('before')}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      photoTag === 'before'
                        ? 'bg-zinc-200 text-zinc-950 border-zinc-200 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {photoTag === 'before' && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>BEFORE</span>
                  </button>

                  {/* PHYSIQUE OPTION */}
                  <button
                    type="button"
                    onClick={() => setPhotoTag('physique')}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      photoTag === 'physique'
                        ? 'bg-zinc-200 text-zinc-950 border-zinc-200 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {photoTag === 'physique' && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>PHYSIQUE</span>
                  </button>
                </div>
              </div>

              {/* Photo Visibility Selector: Community Feed vs Private Vault */}
              <div className="space-y-1 p-2 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-zinc-300 font-bold">
                    Visibility & Privacy
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    {photoVisibility === 'community' ? 'Community Feed' : 'Private Vault'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => setPhotoVisibility('community')}
                    className={`py-1 px-2 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      photoVisibility === 'community'
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Community</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoVisibility('private');
                      setAttachToFeed(false);
                    }}
                    className={`py-1 px-2 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      photoVisibility === 'private'
                        ? 'bg-purple-900/80 text-purple-200 border-purple-700 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Private Vault</span>
                  </button>
                </div>
              </div>

              {/* Attach to Feed Toggle (Only available if Community selected) */}
              {photoVisibility === 'community' ? (
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={attachToFeed}
                    onChange={e => setAttachToFeed(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-amber-400 cursor-pointer"
                  />
                  <span>Attach this photo when sharing workout to IronFeed community</span>
                </label>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-purple-300 bg-purple-950/20 border border-purple-900/40 px-2.5 py-1.5 rounded-lg">
                  <Lock className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>Private photo: Saved to your vault and will not be shared to the feed</span>
                </div>
              )}
            </div>
          )}

          {photoError && (
            <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2 rounded-lg">
              {photoError}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => {
              // Automatically save photo if user staged it but didn't click save
              if (photoPreview && !photoSavedSuccess) {
                handleSavePhotoToProfile();
              }
              const photoUrl = photoPreview && attachToFeed ? photoPreview : undefined;
              if (onShareToCommunity) {
                onShareToCommunity(
                  workout,
                  photoUrl,
                  photoTag,
                  photoCaption
                );
              } else if (onShareToFeed) {
                onShareToFeed(
                  photoUrl,
                  photoTag,
                  photoCaption
                );
              }
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 shadow-lg shadow-amber-500/20"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Share with Community</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenSocialShareCard();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Story Card</span>
            </button>

            <button
              onClick={() => {
                if (photoPreview && !photoSavedSuccess) {
                  handleSavePhotoToProfile();
                }
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* 1. Live Selfie Camera Modal */}
      {showSelfieCamera && (
        <WorkoutSelfieCameraModal
          isOpen={showSelfieCamera}
          onClose={() => setShowSelfieCamera(false)}
          onCaptureSelfie={handleCaptureSelfie}
          onSwitchToDeviceUpload={() => fileInputRef.current?.click()}
        />
      )}

      {/* 2. Saved App Photos Vault Picker Modal */}
      {showSavedPhotosPicker && (
        <SavedAppPhotosPickerModal
          isOpen={showSavedPhotosPicker}
          onClose={() => setShowSavedPhotosPicker(false)}
          savedPhotos={profilePhotos}
          onSelectPhoto={handleSelectSavedPhoto}
          onDeletePhoto={handleDeleteOldPhoto}
          onOpenSelfie={() => setShowSelfieCamera(true)}
          onOpenDeviceUpload={() => fileInputRef.current?.click()}
        />
      )}
    </div>
  );
};
