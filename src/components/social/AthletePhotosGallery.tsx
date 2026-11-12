import React, { useState } from 'react';
import {
  Camera,
  Trash2,
  Check,
  Maximize2,
  AlertCircle,
  Plus,
  Scale,
  Calendar,
  X,
  Layers,
  Globe,
  Lock,
  Zap,
  Share2,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { UserCommunityPhoto, PhotoTagType, PhotoVisibility, UserSubscription } from '../../types';
import { getUserPhotoLimit, MAX_FREE_PHOTOS, MAX_PRO_PHOTOS } from '../../utils/userPhotosStorage';

interface AthletePhotosGalleryProps {
  photos: UserCommunityPhoto[];
  onOpenUpload: () => void;
  onDeletePhoto: (photoId: string) => void;
  onSetTag: (photoId: string, tag: PhotoTagType) => void;
  onToggleVisibility?: (photoId: string, visibility: PhotoVisibility) => void;
  onSharePhotoToFeed?: (photo: UserCommunityPhoto) => void;
  unit?: 'kg' | 'lbs';
  subscription?: UserSubscription;
  onOpenProModal?: () => void;
}

export const AthletePhotosGallery: React.FC<AthletePhotosGalleryProps> = ({
  photos,
  onOpenUpload,
  onDeletePhoto,
  onSetTag,
  onToggleVisibility,
  onSharePhotoToFeed,
  unit = 'kg',
  subscription,
  onOpenProModal
}) => {
  const [lightboxPhoto, setLightboxPhoto] = useState<UserCommunityPhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'community' | 'private'>('all');

  const isPro = subscription?.isPro ?? false;
  const maxLimit = getUserPhotoLimit(isPro);
  const count = photos.length;
  const isFull = count >= maxLimit;
  const remaining = Math.max(0, maxLimit - count);

  const communityCount = photos.filter(p => p.visibility !== 'private').length;
  const privateCount = photos.filter(p => p.visibility === 'private').length;

  const filteredPhotos = photos.filter(p => {
    if (activeFilter === 'community') return p.visibility !== 'private';
    if (activeFilter === 'private') return p.visibility === 'private';
    return true;
  });

  const handleConfirmDelete = (id: string) => {
    onDeletePhoto(id);
    setPhotoToDelete(null);
    if (lightboxPhoto?.id === id) setLightboxPhoto(null);
  };

  const handleToggleSingleVisibility = (photo: UserCommunityPhoto, nextVisibility: PhotoVisibility) => {
    if (onToggleVisibility) {
      onToggleVisibility(photo.id, nextVisibility);
    }
    if (lightboxPhoto?.id === photo.id) {
      setLightboxPhoto({ ...lightboxPhoto, visibility: nextVisibility });
    }
  };

  return (
    <div className="space-y-4">
      {/* Gallery Header & Quota Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm sm:text-base text-zinc-100 font-display uppercase tracking-wider">
                Profile Photos ({count} / {maxLimit})
              </h3>
              {isPro ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  PRO ({MAX_PRO_PHOTOS} Max)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-[9px] uppercase tracking-wider">
                  Non-Subscriber ({MAX_FREE_PHOTOS} Max)
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isPro ? (
                <>Pro members can upload up to <span className="text-amber-400 font-bold">{MAX_PRO_PHOTOS} photos</span>. Select which photos are public or stay private.</>
              ) : (
                <>Non-subscribers can upload only <span className="text-amber-400 font-bold">10 photos</span>. Choose photos to share on the feed or keep private.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isPro && onOpenProModal && (
              <button
                type="button"
                onClick={onOpenProModal}
                className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-750 text-amber-400 border border-amber-400/30 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Unlock 50 Photos</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenUpload}
              disabled={isFull}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isFull
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 active:scale-95'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isFull ? `Limit Reached (${maxLimit}/${maxLimit})` : 'Upload Photo'}</span>
            </button>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Storage Capacity</span>
            <span className={isFull ? 'text-rose-400 font-bold' : count >= maxLimit - 2 ? 'text-amber-400 font-bold' : 'text-zinc-300'}>
              {count} of {maxLimit} photos used ({remaining} free slots)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-850">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull
                  ? 'bg-rose-500'
                  : count >= maxLimit - 2
                  ? 'bg-amber-400'
                  : 'bg-amber-400/80'
              }`}
              style={{ width: `${Math.min(100, (count / maxLimit) * 100)}%` }}
            />
          </div>
        </div>

        {/* Visibility Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-850 text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Photos ({count})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('community')}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeFilter === 'community'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>Community & Feed ({communityCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('private')}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeFilter === 'private'
                ? 'bg-purple-950/40 text-purple-300 border border-purple-800/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Private Vault ({privateCount})</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPhotos.map(photo => {
            const isBefore = photo.tag === 'before';
            const isAfter = photo.tag === 'after';
            const isPrivate = photo.visibility === 'private';

            return (
              <article
                key={photo.id}
                className="group rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] p-3.5 flex flex-col justify-between transition-colors space-y-3 shadow-xs"
              >
                {/* Photo Thumbnail Container */}
                <div className="relative aspect-[3/4] w-full rounded-xl bg-zinc-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Physique photo'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />

                  {/* Top Left Badges: Visibility & Tag */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                    {/* Visibility Badge */}
                    {isPrivate ? (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 text-purple-300 border border-purple-800/80 font-mono font-bold text-[9px] uppercase flex items-center gap-1 shadow-sm">
                        <Lock className="w-2.5 h-2.5" />
                        PRIVATE VAULT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-mono font-black text-[9px] uppercase flex items-center gap-1 shadow-sm">
                        <Globe className="w-2.5 h-2.5" />
                        COMMUNITY FEED
                      </span>
                    )}

                    {/* Role Tag */}
                    {isBefore && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 text-zinc-300 border border-zinc-700 font-mono font-bold text-[9px] uppercase shadow-sm">
                        BEFORE
                      </span>
                    )}
                    {isAfter && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 text-amber-400 border border-amber-400/50 font-mono font-black text-[9px] uppercase shadow-sm">
                        AFTER
                      </span>
                    )}
                    {!isBefore && !isAfter && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 text-zinc-400 border border-zinc-800 font-mono text-[8px] uppercase">
                        PHYSIQUE
                      </span>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    {!isPrivate && onSharePhotoToFeed && (
                      <button
                        type="button"
                        onClick={() => onSharePhotoToFeed(photo)}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 transition-colors cursor-pointer"
                        title="Share to IronFeed"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setLightboxPhoto(photo)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="View Full Size"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoToDelete(photo.id)}
                      className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer border border-rose-900/50"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details & Caption */}
                <div className="space-y-1 px-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="font-semibold text-zinc-200 truncate">
                      {photo.dateLabel || 'Check-in'}
                    </span>
                    {photo.weightKg && (
                      <span className="text-zinc-400 shrink-0">
                        {unit === 'kg'
                          ? `${photo.weightKg} kg`
                          : `${Math.round(photo.weightKg * 2.20462)} lbs`}
                      </span>
                    )}
                  </div>
                  {photo.caption && (
                    <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                      "{photo.caption}"
                    </p>
                  )}
                </div>

                {/* OPTION CHECKER: Instant Segmented Selector for Role + Visibility Toggle */}
                <div className="pt-1.5 border-t border-zinc-850 space-y-2">
                  {/* Row 1: Visibility Switcher (Community vs Private) */}
                  <div>
                    <div className="flex items-center justify-between mb-1 px-0.5">
                      <span className="text-[9px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                        <span>Visibility:</span>
                        <span className={isPrivate ? 'text-purple-400 font-bold' : 'text-amber-400 font-bold'}>
                          {isPrivate ? 'Private' : 'Community Feed'}
                        </span>
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        {isPrivate ? 'Hidden from feed' : 'Visible on feed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-0.5 rounded-xl border border-zinc-850 text-[10px] font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => handleToggleSingleVisibility(photo, 'community')}
                        className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          !isPrivate
                            ? 'bg-amber-400 text-zinc-950 font-black shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>Community</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSingleVisibility(photo, 'private')}
                        className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isPrivate
                            ? 'bg-purple-900/80 text-purple-200 border border-purple-700 shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>Private</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Tag Switcher (Before / After / Gallery) */}
                  <div>
                    <div className="flex items-center justify-between mb-1 px-0.5">
                      <span className="text-[9px] font-mono uppercase text-zinc-500">
                        Option Checker · Role
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">
                        {isBefore ? 'Baseline' : isAfter ? 'Milestone' : 'Standard'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850 text-[10px] font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => onSetTag(photo.id, 'before')}
                        className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                          isBefore
                            ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Before
                      </button>

                      <button
                        type="button"
                        onClick={() => onSetTag(photo.id, 'after')}
                        className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                          isAfter
                            ? 'bg-amber-400 text-zinc-950 font-black shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        After
                      </button>

                      <button
                        type="button"
                        onClick={() => onSetTag(photo.id, 'physique')}
                        className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                          !isBefore && !isAfter
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Gallery
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Add Slot Card if not full */}
          {!isFull && (
            <div
              onClick={onOpenUpload}
              className="rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-400/50 bg-zinc-900/30 p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] space-y-2 group transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-850 group-hover:bg-amber-400/10 text-zinc-500 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-300 group-hover:text-zinc-100">
                Upload New Photo
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {remaining} slot{remaining > 1 ? 's' : ''} available
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-850 text-zinc-400 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-zinc-200">
              {activeFilter === 'all'
                ? 'No Photos Uploaded Yet'
                : activeFilter === 'community'
                ? 'No Community Photos Found'
                : 'No Private Photos Found'}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isPro
                ? `Pro members can upload up to ${MAX_PRO_PHOTOS} photos. Choose what photos to publish on the community feed or keep in your private vault.`
                : `Non-subscribers can upload only ${MAX_FREE_PHOTOS} photos. Choose what photos to publish on the feed or keep private.`}
            </p>
          </div>
          {activeFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Show All Photos
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Upload First Photo
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <Trash2 className="w-4 h-4" />
              <h4 className="font-bold text-sm text-zinc-100">Delete Photo?</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will remove the photo from your profile gallery and free up 1 slot for new photo uploads.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(photoToDelete)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-2xl max-h-[92vh] flex flex-col items-center bg-zinc-950/90 p-4 rounded-3xl border border-zinc-800 space-y-3"
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={lightboxPhoto.url}
              alt="Physique"
              className="max-h-[68vh] w-auto rounded-2xl object-contain border border-zinc-800 shadow-2xl"
            />

            <div className="w-full flex items-center justify-between gap-3 px-2 pt-1 border-t border-zinc-850">
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-100 uppercase">
                    {lightboxPhoto.tag} · {lightboxPhoto.dateLabel}
                  </span>
                  {lightboxPhoto.weightKg && (
                    <span className="text-xs font-mono text-zinc-400">
                      {unit === 'kg' ? `${lightboxPhoto.weightKg} kg` : `${Math.round(lightboxPhoto.weightKg * 2.20462)} lbs`}
                    </span>
                  )}
                </div>
                {lightboxPhoto.caption && (
                  <p className="text-xs text-zinc-400 max-w-sm italic">"{lightboxPhoto.caption}"</p>
                )}
              </div>

              {/* In-Lightbox Visibility Switcher */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleSingleVisibility(
                    lightboxPhoto,
                    lightboxPhoto.visibility === 'private' ? 'community' : 'private'
                  )}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer border ${
                    lightboxPhoto.visibility === 'private'
                      ? 'bg-purple-950/60 border-purple-800 text-purple-200'
                      : 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                  }`}
                >
                  {lightboxPhoto.visibility === 'private' ? (
                    <>
                      <Lock className="w-3 h-3 text-purple-400" />
                      <span>Private Vault</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 text-amber-400" />
                      <span>Community Feed</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
