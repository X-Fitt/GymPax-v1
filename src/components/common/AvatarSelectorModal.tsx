import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  Check,
  Trash2,
  Users,
  Image as ImageIcon,
  Flame,
  Info,
  Move,
  Maximize2
} from 'lucide-react';
import { GYM_AVATARS, GymAvatarCharacter } from '../../data/gymAvatars';
import { GymAvatar } from './GymAvatar';
import { CameraSelfieModal } from './CameraSelfieModal';
import { AvatarCropModal } from './AvatarCropModal';
import { checkImageSafetyWithAi, ImageModerationResult } from '../../utils/imageModeration';
import { ImageModerationBanner } from './ImageModerationBanner';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarType?: 'upload' | 'animated';
  currentAvatarUrl?: string;
  currentAvatarId?: string;
  athleteName?: string;
  onSelectAvatar: (avatarData: {
    avatarType: 'upload' | 'animated';
    avatarUrl?: string;
    avatarId?: string;
  }) => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAvatarType = 'animated',
  currentAvatarUrl,
  currentAvatarId = 'gym_m1',
  athleteName = 'Athlete',
  onSelectAvatar
}) => {
  const [activeTab, setActiveTab] = useState<'animated' | 'upload'>(
    currentAvatarType === 'upload' && currentAvatarUrl ? 'upload' : 'animated'
  );
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<'all' | 'men' | 'women'>('all');
  const [tempAvatarType, setTempAvatarType] = useState<'upload' | 'animated'>(currentAvatarType);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
  const [tempAvatarId, setTempAvatarId] = useState<string | undefined>(currentAvatarId || 'gym_m1');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [avatarModeration, setAvatarModeration] = useState<ImageModerationResult | null>(null);
  const [isCheckingAvatarAi, setIsCheckingAvatarAi] = useState<boolean>(false);

  // Modals for Camera Selfie & Circle Cropper
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fallbackCameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredAvatars = GYM_AVATARS.filter(a => {
    if (selectedGenderFilter === 'all') return true;
    return a.gender === selectedGenderFilter;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadError(null);
    setAvatarModeration(null);
    const reader = new FileReader();
    reader.onload = async event => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setIsCheckingAvatarAi(true);
        try {
          const modResult = await checkImageSafetyWithAi(dataUrl);
          setAvatarModeration(modResult);
          if (modResult.flaggedAsNotAllowed) {
            setUploadError(modResult.reason || 'This photo was flagged by AI as inappropriate and cannot be used as an avatar.');
            return;
          }
          setRawImageForCrop(dataUrl);
          setShowCropModal(true);
        } catch {
          setRawImageForCrop(dataUrl);
          setShowCropModal(true);
        } finally {
          setIsCheckingAvatarAi(false);
        }
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be selected again if needed
    e.target.value = '';
  };

  const handleSelfieCaptured = async (imageDataUrl: string) => {
    setShowCameraModal(false);
    setIsCheckingAvatarAi(true);
    setAvatarModeration(null);
    try {
      const modResult = await checkImageSafetyWithAi(imageDataUrl);
      setAvatarModeration(modResult);
      if (modResult.flaggedAsNotAllowed) {
        setUploadError(modResult.reason || 'This selfie was flagged by AI as inappropriate.');
        return;
      }
      setRawImageForCrop(imageDataUrl);
      setShowCropModal(true);
    } catch {
      setRawImageForCrop(imageDataUrl);
      setShowCropModal(true);
    } finally {
      setIsCheckingAvatarAi(false);
    }
  };

  const handleCropConfirmed = (croppedDataUrl: string) => {
    setTempAvatarUrl(croppedDataUrl);
    setTempAvatarType('upload');
    setActiveTab('upload');
    setShowCropModal(false);
    setRawImageForCrop(null);
  };

  const handleSelectGymCharacter = (character: GymAvatarCharacter) => {
    setTempAvatarId(character.id);
    setTempAvatarType('animated');
  };

  const handleConfirm = () => {
    try {
      if (tempAvatarType === 'upload' && tempAvatarUrl) {
        localStorage.setItem('gympax_user_avatar_type', 'upload');
        localStorage.setItem('gympax_user_avatar_url', tempAvatarUrl);
      } else if (tempAvatarId) {
        localStorage.setItem('gympax_user_avatar_type', 'animated');
        localStorage.setItem('gympax_user_avatar_id', tempAvatarId);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('gympax:avatar-changed', {
            detail: {
              avatarType: tempAvatarType,
              avatarUrl: tempAvatarType === 'upload' ? tempAvatarUrl : undefined,
              avatarId: tempAvatarType === 'animated' ? tempAvatarId : undefined
            }
          })
        );
      }
    } catch {}

    onSelectAvatar({
      avatarType: tempAvatarType,
      avatarUrl: tempAvatarType === 'upload' ? tempAvatarUrl : undefined,
      avatarId: tempAvatarType === 'animated' ? tempAvatarId : undefined
    });
    onClose();
  };

  const handleRemovePhoto = () => {
    setTempAvatarUrl(undefined);
    setTempAvatarType('animated');
    setTempAvatarId('gym_m1');
    setActiveTab('animated');
  };

  const modalNode = (
    <>
      <div
        className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md px-3 py-6 sm:py-8 flex items-start justify-center animate-in fade-in duration-200"
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-3rem)] sm:max-h-[86vh] my-auto shrink-0"
          onClick={e => e.stopPropagation()}
        >
          {/* Header & Live Preview - Clean, Prominent & Perfectly Visible */}
          <div className="p-3.5 sm:p-4.5 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900/95 backdrop-blur-sm gap-2 sm:gap-3 sticky top-0 z-20">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <GymAvatar
                avatarType={tempAvatarType}
                avatarUrl={tempAvatarUrl}
                avatarId={tempAvatarId}
                size="md"
                className="ring-2 ring-amber-400/70 shadow-md shrink-0"
                fallbackInitials={athleteName ? athleteName.slice(0, 2) : 'AT'}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                    {athleteName || 'Athlete Avatar'}
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0 font-semibold">
                    {tempAvatarType === 'upload' ? 'Photo' : 'Avatar'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {tempAvatarType === 'upload'
                    ? 'Personal cropped photo'
                    : GYM_AVATARS.find(a => a.id === tempAvatarId)?.name || 'Athletic avatar character'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleConfirm}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1 active:scale-95"
                title="Save & Apply Avatar"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="inline">Apply</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="px-3 sm:px-4 pt-2.5 flex items-center justify-between gap-2 border-b border-zinc-850/80 shrink-0 bg-zinc-950">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('animated')}
                className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'animated'
                    ? 'border-amber-400 text-amber-400 bg-zinc-900/60'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Athlete Avatars (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'upload'
                    ? 'border-amber-400 text-amber-400 bg-zinc-900/60'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Personal Photo / Selfie</span>
              </button>
            </div>

            {activeTab === 'animated' && (
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[10px] mb-1">
                <button
                  type="button"
                  onClick={() => setSelectedGenderFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                    selectedGenderFilter === 'all'
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All (10)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGenderFilter('men')}
                  className={`px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                    selectedGenderFilter === 'men'
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Men (5)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGenderFilter('women')}
                  className={`px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                    selectedGenderFilter === 'women'
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Women (5)
                </button>
              </div>
            )}
          </div>

          {/* Tab Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {/* TAB 1: REALISTIC AI-GENERATED MEN & WOMEN ATHLETE AVATARS */}
            {activeTab === 'animated' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/90">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-semibold text-zinc-200 truncate">
                      Real AI-Generated Men &amp; Women Athlete Mockups
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/90 shrink-0">
                    5 Men · 5 Women
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {filteredAvatars.map(character => {
                    const isSelected = tempAvatarType === 'animated' && tempAvatarId === character.id;
                    return (
                      <button
                        key={character.id}
                        type="button"
                        onClick={() => handleSelectGymCharacter(character)}
                        className={`relative p-2.5 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer group border ${
                          isSelected
                            ? 'bg-zinc-900 border-amber-400 shadow-lg ring-2 ring-amber-400/30'
                            : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        {/* Check badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Realistic AI-Generated Character Portrait */}
                        <div className="relative mb-2">
                          <GymAvatar
                            avatarId={character.id}
                            avatarUrl={character.imageUrl}
                            size="xl"
                            animate={true}
                            className="group-hover:scale-105 transition-transform ring-1 ring-zinc-700/80 group-hover:ring-amber-400/60"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border shadow-xs ${
                              character.gender === 'men'
                                ? 'bg-zinc-950 border-sky-500/40 text-sky-300'
                                : 'bg-zinc-950 border-pink-500/40 text-pink-300'
                            }`}
                          >
                            {character.gender === 'men' ? 'Man' : 'Woman'}
                          </span>
                        </div>

                        {/* Name & Tagline */}
                        <span className="text-xs font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                          {character.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                          {character.role}
                        </span>
                        <span className="text-[9px] font-mono text-amber-400/80 mt-1 line-clamp-1">
                          {character.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD PERSONAL PHOTO OR SELECT AI MOCKUP PORTRAIT */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                {/* AI Safety Inspection Banner */}
                <ImageModerationBanner
                  result={avatarModeration}
                  isChecking={isCheckingAvatarAi}
                  onClear={() => {
                    setAvatarModeration(null);
                    setUploadError(null);
                  }}
                />

                {uploadError && !avatarModeration?.flaggedAsNotAllowed && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                    {uploadError}
                  </div>
                )}

                {/* Upload Drop Zone / Actions */}
                <div className="p-5 rounded-3xl bg-zinc-900/50 border-2 border-dashed border-zinc-800 hover:border-amber-400/60 transition-colors flex flex-col items-center justify-center text-center space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input
                    ref={fallbackCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                    <Camera className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">
                      Upload Photo or Take a Selfie
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mt-1">
                      Snap a selfie, upload from your library, or pick a realistic AI-generated man or woman mockup portrait below.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
                    {/* Primary Camera Selfie Button - asks for device permission */}
                    <button
                      type="button"
                      onClick={() => setShowCameraModal(true)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-amber-400/10"
                    >
                      <Camera className="w-4 h-4 stroke-[2.5]" />
                      <span>Take Live Selfie</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 border border-zinc-750"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Choose From Library</span>
                    </button>
                  </div>
                </div>

                {/* Quick-Select Real AI-Generated Men & Women Mockup Avatars */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-zinc-100">
                        AI-Generated Men &amp; Women Mockup Avatars
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Tap to use or crop
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {GYM_AVATARS.map(character => {
                      const isCurrentPhoto =
                        (tempAvatarType === 'upload' && tempAvatarUrl === character.imageUrl) ||
                        (tempAvatarType === 'animated' && tempAvatarId === character.id);
                      return (
                        <button
                          key={character.id}
                          type="button"
                          onClick={() => {
                            setTempAvatarUrl(character.imageUrl);
                            setTempAvatarId(character.id);
                            setTempAvatarType('upload');
                          }}
                          className={`p-1.5 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer group ${
                            isCurrentPhoto
                              ? 'bg-zinc-800/90 border-amber-400 ring-1 ring-amber-400/40'
                              : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                          }`}
                          title={`${character.name} (${character.gender === 'men' ? 'Man' : 'Woman'})`}
                        >
                          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-zinc-700 group-hover:border-amber-400/60">
                            <img
                              src={character.imageUrl}
                              alt={character.name}
                              className="w-full h-full object-cover object-[center_20%]"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[9px] font-medium text-zinc-300 truncate w-full text-center">
                            {character.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Uploaded Photo Preview & Crop Editor Launcher Card */}
                {tempAvatarUrl && (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0">
                          <img
                            src={tempAvatarUrl}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover object-[center_20%]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-zinc-200 block">
                            Personal Avatar Ready
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            Fits Circle Reference · Active Selection
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                        title="Remove personal photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Action buttons: Adjust Circle Crop / Take New / Replace */}
                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-850">
                      <button
                        type="button"
                        onClick={() => {
                          setRawImageForCrop(tempAvatarUrl);
                          setShowCropModal(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-400 hover:text-amber-300 text-xs font-bold font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-zinc-700"
                      >
                        <Move className="w-3.5 h-3.5" />
                        <span>Resize / Fit Circle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCameraModal(true)}
                        className="py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border border-zinc-750"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>New Selfie</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border border-zinc-750"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Replace</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Use Avatar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Live Selfie Modal */}
      {showCameraModal && (
        <CameraSelfieModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={handleSelfieCaptured}
          onFallbackToFile={() => fileInputRef.current?.click()}
        />
      )}

      {/* Interactive Circular Cropper & Resizer Modal */}
      {showCropModal && rawImageForCrop && (
        <AvatarCropModal
          isOpen={showCropModal}
          imageSrc={rawImageForCrop}
          athleteName={athleteName}
          onClose={() => setShowCropModal(false)}
          onConfirmCrop={handleCropConfirmed}
        />
      )}
    </>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
