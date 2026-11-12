import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  Trash2,
  Globe,
  Lock,
  Zap,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserCommunityPhoto, PhotoTagType, PhotoVisibility, UserSubscription } from '../../types';
import { MAX_FREE_PHOTOS, MAX_PRO_PHOTOS, getUserPhotoLimit, compressImageFile, getUserPhotos } from '../../utils/userPhotosStorage';
import { checkImageSafetyWithAi, ImageModerationResult } from '../../utils/imageModeration';
import { ImageModerationBanner } from '../common/ImageModerationBanner';
import { WorkoutSelfieCameraModal } from '../workout/WorkoutSelfieCameraModal';
import { SavedAppPhotosPickerModal } from '../workout/SavedAppPhotosPickerModal';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto: (data: {
    url: string;
    tag: PhotoTagType;
    caption?: string;
    weightKg?: number;
    dateLabel?: string;
    visibility?: PhotoVisibility;
    shareToFeed?: boolean;
    isPro?: boolean;
  }) => { success: boolean; error?: string };
  currentPhotosCount: number;
  initialTag?: PhotoTagType;
  unit?: 'kg' | 'lbs';
  existingPhotos?: UserCommunityPhoto[];
  onDeletePhoto?: (photoId: string) => void;
  subscription?: UserSubscription;
  onOpenProModal?: () => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onAddPhoto,
  currentPhotosCount,
  initialTag = 'physique',
  unit = 'kg',
  existingPhotos = [],
  onDeletePhoto,
  subscription,
  onOpenProModal
}) => {
  const [uploadMode, setUploadMode] = useState<'single' | 'pair'>('single');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pro Subscription status & quota calculation
  const isPro = subscription?.isPro ?? false;
  const maxAllowedPhotos = getUserPhotoLimit(isPro);
  const isLimitReached = currentPhotosCount >= maxAllowedPhotos;
  const remainingSlots = Math.max(0, maxAllowedPhotos - currentPhotosCount);

  // Pro Upload Options
  const [highDefMode, setHighDefMode] = useState<boolean>(false);
  const [addLifterWatermark, setAddLifterWatermark] = useState<boolean>(false);

  // Visibility and Feed Selection
  const [visibility, setVisibility] = useState<PhotoVisibility>('community');
  const [shareToFeedNow, setShareToFeedNow] = useState<boolean>(true);

  // Single Photo State
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<PhotoTagType>(initialTag);
  const [caption, setCaption] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [dateLabel, setDateLabel] = useState<string>('');
  const [singleModeration, setSingleModeration] = useState<ImageModerationResult | null>(null);
  const [isCheckingSingleAi, setIsCheckingSingleAi] = useState<boolean>(false);

  // Pair Photo State (Before & After Pair)
  const [pairBeforePreview, setPairBeforePreview] = useState<string | null>(null);
  const [pairAfterPreview, setPairAfterPreview] = useState<string | null>(null);
  const [pairBeforeLabel, setPairBeforeLabel] = useState<string>('Baseline / Month 1');
  const [pairAfterLabel, setPairAfterLabel] = useState<string>('Current / Week 14');
  const [pairBeforeWeight, setPairBeforeWeight] = useState<string>('');
  const [pairAfterWeight, setPairAfterWeight] = useState<string>('');
  const [pairCaption, setPairCaption] = useState<string>('');
  const [pairBeforeModeration, setPairBeforeModeration] = useState<ImageModerationResult | null>(null);
  const [isCheckingPairBeforeAi, setIsCheckingPairBeforeAi] = useState<boolean>(false);
  const [pairAfterModeration, setPairAfterModeration] = useState<ImageModerationResult | null>(null);
  const [isCheckingPairAfterAi, setIsCheckingPairAfterAi] = useState<boolean>(false);

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const [showSelfieCamera, setShowSelfieCamera] = useState<boolean>(false);
  const [showSavedPhotosPicker, setShowSavedPhotosPicker] = useState<boolean>(false);
  const [activeSelfieTarget, setActiveSelfieTarget] = useState<'single' | 'before' | 'after'>('single');

  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const allSavedPhotos = existingPhotos && existingPhotos.length > 0 ? existingPhotos : getUserPhotos(isPro);

  const handleCaptureSelfie = async (imageDataUrl: string) => {
    setErrorMessage(null);
    if (activeSelfieTarget === 'single') {
      setSingleImagePreview(imageDataUrl);
      setSingleModeration(null);
      setIsCheckingSingleAi(true);
      if (!dateLabel) {
        setDateLabel(selectedTag === 'before' ? 'Baseline' : selectedTag === 'after' ? 'Current' : 'Week Check-in');
      }
      try {
        const modResult = await checkImageSafetyWithAi(imageDataUrl);
        setSingleModeration(modResult);
        if (modResult.flaggedAsNotAllowed) {
          setErrorMessage(modResult.reason || 'This image was flagged by AI as inappropriate.');
        }
      } catch {
        // non-blocking
      } finally {
        setIsCheckingSingleAi(false);
      }
    } else if (activeSelfieTarget === 'before') {
      setPairBeforePreview(imageDataUrl);
      setPairBeforeModeration(null);
      setIsCheckingPairBeforeAi(true);
      try {
        const modResult = await checkImageSafetyWithAi(imageDataUrl);
        setPairBeforeModeration(modResult);
        if (modResult.flaggedAsNotAllowed) {
          setErrorMessage(`Before Photo: ${modResult.reason || 'Flagged by AI as inappropriate.'}`);
        }
      } catch {
        // non-blocking
      } finally {
        setIsCheckingPairBeforeAi(false);
      }
    } else if (activeSelfieTarget === 'after') {
      setPairAfterPreview(imageDataUrl);
      setPairAfterModeration(null);
      setIsCheckingPairAfterAi(true);
      try {
        const modResult = await checkImageSafetyWithAi(imageDataUrl);
        setPairAfterModeration(modResult);
        if (modResult.flaggedAsNotAllowed) {
          setErrorMessage(`After Photo: ${modResult.reason || 'Flagged by AI as inappropriate.'}`);
        }
      } catch {
        // non-blocking
      } finally {
        setIsCheckingPairAfterAi(false);
      }
    }
  };

  const handleSelectSavedPhoto = (savedPhoto: UserCommunityPhoto) => {
    setErrorMessage(null);
    if (activeSelfieTarget === 'single') {
      setSingleImagePreview(savedPhoto.url);
      setSingleModeration({ isAllowed: true, flaggedAsNotAllowed: false, flagCategory: 'none', reason: '', checkedByAi: false });
      if (savedPhoto.caption && !caption) setCaption(savedPhoto.caption);
      if (savedPhoto.tag) setSelectedTag(savedPhoto.tag);
      if (savedPhoto.dateLabel && !dateLabel) setDateLabel(savedPhoto.dateLabel);
    } else if (activeSelfieTarget === 'before') {
      setPairBeforePreview(savedPhoto.url);
      setPairBeforeModeration({ isAllowed: true, flaggedAsNotAllowed: false, flagCategory: 'none', reason: '', checkedByAi: false });
      if (savedPhoto.dateLabel) setPairBeforeLabel(savedPhoto.dateLabel);
    } else if (activeSelfieTarget === 'after') {
      setPairAfterPreview(savedPhoto.url);
      setPairAfterModeration({ isAllowed: true, flaggedAsNotAllowed: false, flagCategory: 'none', reason: '', checkedByAi: false });
      if (savedPhoto.dateLabel) setPairAfterLabel(savedPhoto.dateLabel);
    }
  };

  if (!isOpen) return null;

  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setSingleModeration(null);
    setIsProcessing(true);
    setIsCheckingSingleAi(true);
    try {
      const maxDim = isPro && highDefMode ? 1440 : 960;
      const compressed = await compressImageFile(file, maxDim);
      setSingleImagePreview(compressed);
      if (!dateLabel) {
        setDateLabel(selectedTag === 'before' ? 'Baseline' : selectedTag === 'after' ? 'Current' : 'Week Check-in');
      }

      // Run AI Safety & Inappropriate Image Detection
      const modResult = await checkImageSafetyWithAi(compressed);
      setSingleModeration(modResult);
      if (modResult.flaggedAsNotAllowed) {
        setErrorMessage(modResult.reason || 'This image was flagged by AI as inappropriate and is not allowed.');
      }
    } catch {
      setErrorMessage('Could not process this image. Please select another JPEG/PNG file.');
    } finally {
      setIsProcessing(false);
      setIsCheckingSingleAi(false);
    }
  };

  const handleBeforeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setPairBeforeModeration(null);
    setIsProcessing(true);
    setIsCheckingPairBeforeAi(true);
    try {
      const maxDim = isPro && highDefMode ? 1440 : 960;
      const compressed = await compressImageFile(file, maxDim);
      setPairBeforePreview(compressed);

      // Run AI Safety & Inappropriate Image Detection
      const modResult = await checkImageSafetyWithAi(compressed);
      setPairBeforeModeration(modResult);
      if (modResult.flaggedAsNotAllowed) {
        setErrorMessage(`Before Photo: ${modResult.reason || 'Flagged by AI as inappropriate and not allowed.'}`);
      }
    } catch {
      setErrorMessage('Could not process Before image.');
    } finally {
      setIsProcessing(false);
      setIsCheckingPairBeforeAi(false);
    }
  };

  const handleAfterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setPairAfterModeration(null);
    setIsProcessing(true);
    setIsCheckingPairAfterAi(true);
    try {
      const maxDim = isPro && highDefMode ? 1440 : 960;
      const compressed = await compressImageFile(file, maxDim);
      setPairAfterPreview(compressed);

      // Run AI Safety & Inappropriate Image Detection
      const modResult = await checkImageSafetyWithAi(compressed);
      setPairAfterModeration(modResult);
      if (modResult.flaggedAsNotAllowed) {
        setErrorMessage(`After Photo: ${modResult.reason || 'Flagged by AI as inappropriate and not allowed.'}`);
      }
    } catch {
      setErrorMessage('Could not process After image.');
    } finally {
      setIsProcessing(false);
      setIsCheckingPairAfterAi(false);
    }
  };

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleImagePreview) {
      setErrorMessage('Please select or capture a photo first.');
      return;
    }

    if (singleModeration?.flaggedAsNotAllowed) {
      setErrorMessage(singleModeration.reason || 'Cannot upload: image flagged by AI as inappropriate.');
      return;
    }

    if (isCheckingSingleAi) {
      setErrorMessage('Please wait while AI finishes inspecting the image for safety.');
      return;
    }

    const weightNum = weight ? parseFloat(weight) : undefined;
    const res = onAddPhoto({
      url: singleImagePreview,
      tag: selectedTag,
      caption: caption || undefined,
      weightKg: weightNum,
      dateLabel: dateLabel || (selectedTag === 'before' ? 'Before' : selectedTag === 'after' ? 'After' : 'Physique'),
      visibility,
      shareToFeed: visibility === 'community' && shareToFeedNow,
      isPro
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to add photo.');
    } else {
      onClose();
    }
  };

  const handleSubmitPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairBeforePreview || !pairAfterPreview) {
      setErrorMessage('Please select both a Before photo and an After photo.');
      return;
    }

    if (pairBeforeModeration?.flaggedAsNotAllowed) {
      setErrorMessage(`Before photo cannot be uploaded: ${pairBeforeModeration.reason}`);
      return;
    }

    if (pairAfterModeration?.flaggedAsNotAllowed) {
      setErrorMessage(`After photo cannot be uploaded: ${pairAfterModeration.reason}`);
      return;
    }

    if (isCheckingPairBeforeAi || isCheckingPairAfterAi) {
      setErrorMessage('Please wait while AI finishes inspecting both images for safety.');
      return;
    }

    if (remainingSlots < 2) {
      setErrorMessage(`You only have ${remainingSlots} photo slot left. Maximum limit is ${maxAllowedPhotos}.`);
      return;
    }

    // Add before photo
    const beforeWeightNum = pairBeforeWeight ? parseFloat(pairBeforeWeight) : undefined;
    const resBefore = onAddPhoto({
      url: pairBeforePreview,
      tag: 'before',
      caption: pairCaption ? `[Before] ${pairCaption}` : undefined,
      weightKg: beforeWeightNum,
      dateLabel: pairBeforeLabel || 'Baseline',
      visibility,
      shareToFeed: false, // share the pair together
      isPro
    });

    if (!resBefore.success) {
      setErrorMessage(resBefore.error || 'Failed to save Before photo.');
      return;
    }

    // Add after photo
    const afterWeightNum = pairAfterWeight ? parseFloat(pairAfterWeight) : undefined;
    const resAfter = onAddPhoto({
      url: pairAfterPreview,
      tag: 'after',
      caption: pairCaption ? `[After] ${pairCaption}` : undefined,
      weightKg: afterWeightNum,
      dateLabel: pairAfterLabel || 'Current',
      visibility,
      shareToFeed: visibility === 'community' && shareToFeedNow,
      isPro
    });

    if (!resAfter.success) {
      setErrorMessage(resAfter.error || 'Failed to save After photo.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 my-auto text-zinc-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-zinc-100">
                  Upload Athlete Photos
                </h3>
                {isPro ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    PRO (Max {MAX_PRO_PHOTOS})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-[9px] uppercase tracking-wider">
                    Free (Max {MAX_FREE_PHOTOS})
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {currentPhotosCount} / {maxAllowedPhotos} photos used ({remainingSlots} remaining)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Quota Notice Banner */}
        <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          isPro
            ? 'bg-amber-400/5 border-amber-400/20 text-zinc-300'
            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
        }`}>
          <div className="flex items-center gap-2">
            {isPro ? (
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Shield className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <p className="text-[11px] leading-relaxed">
              {isPro ? (
                <>
                  <strong className="text-amber-300">Pro Subscribed Plan:</strong> Upload options active, capped at{' '}
                  <span className="font-mono font-bold text-zinc-100">{MAX_PRO_PHOTOS} photos</span>.
                </>
              ) : (
                <>
                  <strong className="text-zinc-200">Non-Subscribers:</strong> Limited to{' '}
                  <span className="font-mono font-bold text-amber-400">10 photos</span> maximum.
                </>
              )}
            </p>
          </div>

          {!isPro && onOpenProModal && (
            <button
              type="button"
              onClick={onOpenProModal}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
            >
              Get 50 with Pro
            </button>
          )}
        </div>

        {/* Limit Warning if full */}
        {isLimitReached ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                {isPro
                  ? `Pro Limit Reached (${MAX_PRO_PHOTOS} / ${MAX_PRO_PHOTOS} Photos)`
                  : `Free Limit Reached (${MAX_FREE_PHOTOS} / ${MAX_FREE_PHOTOS} Photos)`}
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {isPro
                ? `Your Pro profile is limited to a maximum of ${MAX_PRO_PHOTOS} photos. Delete any older photo below to free up a slot and immediately upload a new one.`
                : `Non-subscribers can upload only ${MAX_FREE_PHOTOS} photos. You can delete an older photo below to upload a new one, or upgrade to Pro to unlock up to ${MAX_PRO_PHOTOS} photos.`}
            </p>

            {/* In-Modal Photo List with Direct Delete Option */}
            {existingPhotos.length > 0 && (
              <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                  Select an old photo to delete:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {existingPhotos.map(p => (
                    <div
                      key={p.id}
                      className="relative rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 flex flex-col justify-between group overflow-hidden"
                    >
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-950">
                        <img src={p.url} alt="Profile photo" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-black/80 text-amber-400 border border-zinc-700">
                          {p.tag}
                        </span>
                        {p.visibility === 'private' && (
                          <span className="absolute top-1 right-1 px-1 py-0.5 rounded bg-zinc-950/90 text-purple-300 text-[8px] font-mono flex items-center gap-0.5">
                            <Lock className="w-2 h-2" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-zinc-850">
                        <span className="text-[9px] text-zinc-400 truncate max-w-[65px] font-mono">
                          {p.dateLabel || 'Check-in'}
                        </span>
                        {onDeletePhoto && (
                          <button
                            type="button"
                            onClick={() => onDeletePhoto(p.id)}
                            className="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Delete this photo"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-amber-500/20">
              <span className="text-[11px] text-zinc-400 font-mono">
                Deleting frees up space instantly
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold cursor-pointer border border-zinc-700 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Tabs: Single vs Before & After Pair */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setUploadMode('single')}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                  uploadMode === 'single'
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Single Photo Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('pair')}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  uploadMode === 'pair'
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Before & After Pair</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* VISIBILITY & FEED PRIVACY SELECTOR (Shared across both modes) */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-850 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase text-zinc-300 font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Feed & Community Visibility</span>
                </label>
                <span className="text-[10px] font-mono text-zinc-400">
                  {visibility === 'community' ? 'Visible to Community' : 'Private to You Only'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Option 1: Community Feed & Public */}
                <button
                  type="button"
                  onClick={() => setVisibility('community')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    visibility === 'community'
                      ? 'bg-amber-400/10 border-amber-400 text-zinc-100 ring-1 ring-amber-400/50'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Globe className={`w-4 h-4 ${visibility === 'community' ? 'text-amber-400' : 'text-zinc-500'}`} />
                      <span className="text-xs font-bold text-zinc-100">Visible to Community</span>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      visibility === 'community' ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                    }`}>
                      {visibility === 'community' && <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Show on your community athlete profile & eligible to appear in IronFeed.
                  </p>
                </button>

                {/* Option 2: Private Vault */}
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    visibility === 'private'
                      ? 'bg-purple-500/10 border-purple-400 text-zinc-100 ring-1 ring-purple-400/50'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Lock className={`w-4 h-4 ${visibility === 'private' ? 'text-purple-400' : 'text-zinc-500'}`} />
                      <span className="text-xs font-bold text-zinc-100">Stay Private</span>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      visibility === 'private' ? 'border-purple-400 bg-purple-400' : 'border-zinc-700'
                    }`}>
                      {visibility === 'private' && <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Personal progress vault only. Never shown on feed or to other community members.
                  </p>
                </button>
              </div>

              {/* Sub-toggle: Share directly to Feed now (if Community selected) */}
              {visibility === 'community' ? (
                <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shareToFeedNow}
                    onChange={e => setShareToFeedNow(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 bg-zinc-900 border-zinc-700 accent-amber-400 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-zinc-200">Share as a new post to IronFeed now</span>
                    <span className="text-[10px] text-zinc-400 block">Lifters in your gym & community can cheer and congratulate your milestone</span>
                  </div>
                </label>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-[11px] text-purple-300">
                  <EyeOff className="w-3.5 h-3.5 shrink-0" />
                  <span>Hidden from community feed & public profiles</span>
                </div>
              )}

              {/* Pro Upload Options Showcase */}
              <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Upload Options:</span>
                  <label className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono cursor-pointer transition-colors ${
                    isPro
                      ? highDefMode ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-zinc-850 text-zinc-400'
                      : 'bg-zinc-900 text-zinc-500 cursor-not-allowed opacity-75'
                  }`}>
                    <input
                      type="checkbox"
                      checked={highDefMode}
                      disabled={!isPro}
                      onChange={e => setHighDefMode(e.target.checked)}
                      className="hidden"
                    />
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    <span>HD 1440p Mode {!isPro && '(PRO)'}</span>
                  </label>
                </div>

                <span className="text-[10px] font-mono text-zinc-500">
                  {isPro ? 'Pro Upload Perks Active' : 'Non-subscribers: Max 10 photos'}
                </span>
              </div>
            </div>

            {/* TAB 1: Single Photo Upload */}
            {uploadMode === 'single' && (
              <form onSubmit={handleSubmitSingle} className="space-y-4">
                {/* File Dropzone / Selector */}
                <input
                  ref={singleFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSingleFileChange}
                  className="hidden"
                />

                {/* AI Safety Inspection Banner */}
                <ImageModerationBanner
                  result={singleModeration}
                  isChecking={isCheckingSingleAi}
                  onClear={() => {
                    setSingleImagePreview(null);
                    setSingleModeration(null);
                    setErrorMessage(null);
                  }}
                />

                {singleImagePreview ? (
                  <div className={`relative rounded-2xl bg-zinc-900 border p-2 overflow-hidden flex flex-col items-center ${
                    singleModeration?.flaggedAsNotAllowed
                      ? 'border-red-500/60 ring-1 ring-red-500/30'
                      : 'border-zinc-850'
                  }`}>
                    <div className="relative">
                      <img
                        src={singleImagePreview}
                        alt="Uploaded Preview"
                        className={`max-h-56 w-auto rounded-xl object-contain ${
                          singleModeration?.flaggedAsNotAllowed ? 'opacity-40 blur-xs' : ''
                        }`}
                      />
                      {singleModeration?.flaggedAsNotAllowed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-red-600 text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-lg">
                            Not Allowed Image
                          </span>
                          <span className="text-[10px] text-red-200 mt-1 font-semibold max-w-[200px]">
                            Flagged for inappropriate content
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase shadow-sm ${
                        visibility === 'community'
                          ? 'bg-amber-400 text-zinc-950'
                          : 'bg-purple-900 text-purple-200 border border-purple-700'
                      }`}>
                        {visibility === 'community' ? 'Community' : 'Private'}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-center gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSelfieTarget('single');
                          setShowSelfieCamera(true);
                        }}
                        className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                        title="Take a new selfie"
                      >
                        Selfie
                      </button>
                      <span className="text-zinc-600">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSelfieTarget('single');
                          setShowSavedPhotosPicker(true);
                        }}
                        className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
                        title="Pick from saved app photos"
                      >
                        Saved
                      </button>
                      <span className="text-zinc-600">·</span>
                      <button
                        type="button"
                        onClick={() => singleFileInputRef.current?.click()}
                        className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                        title="Upload from device"
                      >
                        Device
                      </button>
                      <span className="text-zinc-600">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSingleImagePreview(null);
                          setSingleModeration(null);
                          setErrorMessage(null);
                        }}
                        className="text-zinc-400 hover:text-rose-400 underline cursor-pointer"
                        title="Remove photo"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 3-Option Single Photo Source Selector */
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Choose Photo Option:</span>
                      <span className="text-[10px] text-amber-400 font-mono">3 Choices</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Option 1: Take a Selfie */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSelfieTarget('single');
                          setShowSelfieCamera(true);
                        }}
                        className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-left flex flex-col justify-between transition-all group hover:bg-zinc-850 cursor-pointer hover:shadow-md"
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Camera className="w-4 h-4" />
                          </div>
                          <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-1.5 py-0.5 rounded">
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
                        onClick={() => {
                          setActiveSelfieTarget('single');
                          setShowSavedPhotosPicker(true);
                        }}
                        className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-400 text-left flex flex-col justify-between transition-all group hover:bg-zinc-850 cursor-pointer hover:shadow-md"
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-sky-400/10 text-sky-400 border border-sky-400/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <span className="text-[8.5px] font-mono font-bold text-sky-400 uppercase tracking-wider bg-sky-400/10 px-1.5 py-0.5 rounded">
                            {allSavedPhotos.length} Saved
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
                        onClick={() => singleFileInputRef.current?.click()}
                        className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-400 text-left flex flex-col justify-between transition-all group hover:bg-zinc-850 cursor-pointer hover:shadow-md"
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Upload className="w-4 h-4" />
                          </div>
                          <span className="text-[8.5px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-1.5 py-0.5 rounded">
                            Device
                          </span>
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-zinc-100 group-hover:text-emerald-300 transition-colors">
                            Upload from Device
                          </h5>
                          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                            {isProcessing ? 'Optimizing...' : 'Files or camera roll'}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* THE OPTION CHECKER: Choose Before, After, or Standard */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-850">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase text-zinc-300 font-bold block">
                      Option Checker · Choose Photo Role
                    </label>
                    <span className="text-[10px] font-mono text-amber-400">
                      Required
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Designate this photo as Before or After to display next to each other in the My Photos showcase.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1.5">
                    {/* Option: BEFORE */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTag('before');
                        if (!dateLabel || dateLabel === 'After') setDateLabel('Baseline');
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between select-none ${
                        selectedTag === 'before'
                          ? 'bg-zinc-850 border-amber-400/80 text-zinc-100 ring-1 ring-amber-400/50'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">BEFORE</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedTag === 'before' ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                        }`}>
                          {selectedTag === 'before' && <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Baseline Comparison
                      </span>
                    </button>

                    {/* Option: AFTER */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTag('after');
                        if (!dateLabel || dateLabel === 'Baseline') setDateLabel('Current');
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between select-none ${
                        selectedTag === 'after'
                          ? 'bg-amber-400/10 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">AFTER</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedTag === 'after' ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                        }`}>
                          {selectedTag === 'after' && <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Current Progress
                      </span>
                    </button>

                    {/* Option: PHYSIQUE (Gallery) */}
                    <button
                      type="button"
                      onClick={() => setSelectedTag('physique')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between select-none ${
                        selectedTag === 'physique'
                          ? 'bg-zinc-850 border-zinc-700 text-zinc-100 ring-1 ring-zinc-700'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">PHYSIQUE</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedTag === 'physique' ? 'border-zinc-400 bg-zinc-400' : 'border-zinc-700'
                        }`}>
                          {selectedTag === 'physique' && <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Standard Gallery
                      </span>
                    </button>
                  </div>
                </div>

                {/* Additional Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                      Timeline Milestone / Label
                    </label>
                    <input
                      type="text"
                      value={dateLabel}
                      onChange={e => setDateLabel(e.target.value)}
                      placeholder={selectedTag === 'before' ? 'e.g. Month 1 Baseline' : 'e.g. Week 14 Current'}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                      Body Weight ({unit}) <span className="text-zinc-600">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="e.g. 82.5"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                    Caption / Notes <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="e.g. Focus on chest thickness and posterior chain progressive overload"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!singleImagePreview || isProcessing || isCheckingSingleAi || Boolean(singleModeration?.flaggedAsNotAllowed)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-transform active:scale-98 ${
                      singleModeration?.flaggedAsNotAllowed
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 cursor-not-allowed opacity-80'
                        : isCheckingSingleAi
                        ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                        : 'bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950'
                    }`}
                  >
                    {isCheckingSingleAi
                      ? 'AI Checking Safety...'
                      : singleModeration?.flaggedAsNotAllowed
                      ? 'Image Flagged · Not Allowed'
                      : `Save Photo (${remainingSlots - 1} slots left)`}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Upload Before & After Pair Side-by-Side */}
            {uploadMode === 'pair' && (
              <form onSubmit={handleSubmitPair} className="space-y-4">
                <input
                  ref={beforeFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBeforeFileChange}
                  className="hidden"
                />
                <input
                  ref={afterFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAfterFileChange}
                  className="hidden"
                />

                <p className="text-xs text-zinc-400">
                  Upload both your Before and After photos together to configure your side-by-side comparison in one step (uses 2 of your {maxAllowedPhotos} photo slots).
                </p>

                {/* Side-by-Side Upload Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Before Dropzone */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                      1. Before Photo
                    </span>

                    {/* AI safety banner for before photo */}
                    <ImageModerationBanner
                      result={pairBeforeModeration}
                      isChecking={isCheckingPairBeforeAi}
                      onClear={() => {
                        setPairBeforePreview(null);
                        setPairBeforeModeration(null);
                      }}
                    />

                    {pairBeforePreview ? (
                      <div className={`relative aspect-[3/4] w-full rounded-2xl bg-zinc-900 border overflow-hidden flex flex-col items-center justify-center ${
                        pairBeforeModeration?.flaggedAsNotAllowed ? 'border-red-500/60 ring-1 ring-red-500/30' : 'border-zinc-800'
                      }`}>
                        <img
                          src={pairBeforePreview}
                          alt="Before Preview"
                          className={`w-full h-full object-cover ${
                            pairBeforeModeration?.flaggedAsNotAllowed ? 'opacity-40 blur-xs' : ''
                          }`}
                        />
                        {pairBeforeModeration?.flaggedAsNotAllowed && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-black/60">
                            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-black uppercase">
                              Not Allowed
                            </span>
                            <span className="text-[9px] text-red-200 mt-1">
                              Flagged by AI
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => beforeFileInputRef.current?.click()}
                          className="absolute bottom-2 px-2 py-1 rounded bg-black/75 text-[10px] text-zinc-200 cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => beforeFileInputRef.current?.click()}
                        className="aspect-[3/4] rounded-2xl bg-zinc-900/60 border-2 border-dashed border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center p-3 text-center cursor-pointer space-y-1.5"
                      >
                        <Upload className="w-5 h-5 text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-300">Select Before</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Month 1</span>
                      </div>
                    )}
                    <input
                      type="text"
                      value={pairBeforeLabel}
                      onChange={e => setPairBeforeLabel(e.target.value)}
                      placeholder="e.g. Month 1 Baseline"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>

                  {/* After Dropzone */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase block">
                      2. After Photo
                    </span>

                    {/* AI safety banner for after photo */}
                    <ImageModerationBanner
                      result={pairAfterModeration}
                      isChecking={isCheckingPairAfterAi}
                      onClear={() => {
                        setPairAfterPreview(null);
                        setPairAfterModeration(null);
                      }}
                    />

                    {pairAfterPreview ? (
                      <div className={`relative aspect-[3/4] w-full rounded-2xl bg-zinc-900 border overflow-hidden flex flex-col items-center justify-center ${
                        pairAfterModeration?.flaggedAsNotAllowed ? 'border-red-500/60 ring-1 ring-red-500/30' : 'border-amber-400/40'
                      }`}>
                        <img
                          src={pairAfterPreview}
                          alt="After Preview"
                          className={`w-full h-full object-cover ${
                            pairAfterModeration?.flaggedAsNotAllowed ? 'opacity-40 blur-xs' : ''
                          }`}
                        />
                        {pairAfterModeration?.flaggedAsNotAllowed && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-black/60">
                            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-black uppercase">
                              Not Allowed
                            </span>
                            <span className="text-[9px] text-red-200 mt-1">
                              Flagged by AI
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => afterFileInputRef.current?.click()}
                          className="absolute bottom-2 px-2 py-1 rounded bg-black/75 text-[10px] text-zinc-200 cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => afterFileInputRef.current?.click()}
                        className="aspect-[3/4] rounded-2xl bg-zinc-900/60 border-2 border-dashed border-zinc-800 hover:border-amber-400/50 flex flex-col items-center justify-center p-3 text-center cursor-pointer space-y-1.5"
                      >
                        <Upload className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">Select After</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Current</span>
                      </div>
                    )}
                    <input
                      type="text"
                      value={pairAfterLabel}
                      onChange={e => setPairAfterLabel(e.target.value)}
                      placeholder="e.g. Week 14 Current"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                    Photo Caption
                  </label>
                  <input
                    type="text"
                    value={pairCaption}
                    onChange={e => setPairCaption(e.target.value)}
                    placeholder="e.g. Progressive overload on compound lifts & strict caloric surplus"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !pairBeforePreview ||
                      !pairAfterPreview ||
                      isProcessing ||
                      isCheckingPairBeforeAi ||
                      isCheckingPairAfterAi ||
                      Boolean(pairBeforeModeration?.flaggedAsNotAllowed) ||
                      Boolean(pairAfterModeration?.flaggedAsNotAllowed)
                    }
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-transform active:scale-98 ${
                      pairBeforeModeration?.flaggedAsNotAllowed || pairAfterModeration?.flaggedAsNotAllowed
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 cursor-not-allowed opacity-80'
                        : isCheckingPairBeforeAi || isCheckingPairAfterAi
                        ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                        : 'bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950'
                    }`}
                  >
                    {isCheckingPairBeforeAi || isCheckingPairAfterAi
                      ? 'AI Checking Safety...'
                      : pairBeforeModeration?.flaggedAsNotAllowed || pairAfterModeration?.flaggedAsNotAllowed
                      ? 'Image Flagged · Not Allowed'
                      : 'Save Both Photos (2 Slots)'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Selfie Camera Modal */}
      {showSelfieCamera && (
        <WorkoutSelfieCameraModal
          isOpen={showSelfieCamera}
          onClose={() => setShowSelfieCamera(false)}
          onCaptureSelfie={handleCaptureSelfie}
          onSwitchToDeviceUpload={() => {
            if (activeSelfieTarget === 'single') {
              singleFileInputRef.current?.click();
            } else if (activeSelfieTarget === 'before') {
              beforeFileInputRef.current?.click();
            } else {
              afterFileInputRef.current?.click();
            }
          }}
        />
      )}

      {/* Saved App Photos Picker Modal */}
      {showSavedPhotosPicker && (
        <SavedAppPhotosPickerModal
          isOpen={showSavedPhotosPicker}
          onClose={() => setShowSavedPhotosPicker(false)}
          savedPhotos={allSavedPhotos}
          onSelectPhoto={handleSelectSavedPhoto}
          onDeletePhoto={onDeletePhoto}
          onOpenSelfie={() => setShowSelfieCamera(true)}
          onOpenDeviceUpload={() => {
            if (activeSelfieTarget === 'single') {
              singleFileInputRef.current?.click();
            } else if (activeSelfieTarget === 'before') {
              beforeFileInputRef.current?.click();
            } else {
              afterFileInputRef.current?.click();
            }
          }}
        />
      )}
    </div>
  );
};
