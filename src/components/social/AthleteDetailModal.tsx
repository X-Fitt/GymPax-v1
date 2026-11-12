import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MapPin,
  Dumbbell,
  Trophy,
  Flame,
  Calendar,
  UserPlus,
  UserCheck,
  Clock,
  Sparkles,
  MessageCircle,
  Phone,
  Camera,
  Edit3,
  Check,
  CheckCircle2,
  ZoomIn,
  Building2,
  MessageSquare
} from 'lucide-react';
import { NearbyAthlete, UserProfile, RewardsProfile, UserCommunityPhoto } from '../../types';
import { GymAvatar } from '../common/GymAvatar';
import { buildAthletePhysiquePhotos } from '../../data/userPhysiquePhotos';

export interface AthleteDetailModalProps {
  athlete: NearbyAthlete | null;
  onClose: () => void;
  onToggleConnection?: (athleteId: string, customMessage?: string) => void;
  onAcceptRequest?: (athleteId: string) => void;
  onRejectRequest?: (athleteId: string) => void;
  userLevel?: string;
  onOpenWhatsApp?: (athlete: NearbyAthlete, tab: 'message' | 'call') => void;
  distanceUnit?: 'mi' | 'km';
  isOwnProfile?: boolean;
  userProfile?: UserProfile | null;
  onUpdateBio?: (newBio: string) => void;
  rewardsProfile?: RewardsProfile;
}

export const AthleteDetailModal: React.FC<AthleteDetailModalProps> = ({
  athlete,
  onClose,
  onToggleConnection,
  onAcceptRequest,
  onRejectRequest,
  userLevel,
  onOpenWhatsApp,
  distanceUnit = 'mi',
  isOwnProfile = false,
  userProfile,
  onUpdateBio,
  rewardsProfile
}) => {
  if (!athlete) return null;

  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [bioInput, setBioInput] = useState<string>(
    isOwnProfile ? (userProfile?.bio || athlete.bio || '') : athlete.bio
  );
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  const isLevelMatch =
    !isOwnProfile &&
    userLevel &&
    athlete.level &&
    athlete.level.toLowerCase().includes(userLevel.toLowerCase());

  const handleSaveBio = () => {
    const trimmed = bioInput.trim();
    if (onUpdateBio) {
      onUpdateBio(trimmed);
    }
    athlete.bio = trimmed;
    setIsEditingBio(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // Resolve guaranteed unique, gender-matched mockup physique photos for this user
  const resolvedPhysique = buildAthletePhysiquePhotos({
    id: isOwnProfile ? 'u_me' : athlete.id,
    avatarSeed: athlete.avatarSeed,
    name: athlete.name,
    gender: isOwnProfile ? (userProfile?.gender || athlete.gender) : athlete.gender,
    avatarId: isOwnProfile ? userProfile?.avatarId : athlete.avatarId
  });

  // Compile photos to display
  const allPhotos: { url: string; label?: string; tag?: string }[] = [];
  const effectivePhotos =
    athlete.photos && athlete.photos.length > 0 ? athlete.photos : resolvedPhysique.photos;
  const effectiveBeforeUrl = athlete.beforePhotoUrl || resolvedPhysique.beforePhotoUrl;
  const effectiveAfterUrl = athlete.afterPhotoUrl || resolvedPhysique.afterPhotoUrl;

  if (effectiveBeforeUrl && effectiveAfterUrl) {
    allPhotos.push({ url: effectiveBeforeUrl, label: 'Before · Baseline', tag: 'before' });
    allPhotos.push({ url: effectiveAfterUrl, label: 'After · Current', tag: 'after' });
  } else if (effectiveAfterUrl) {
    allPhotos.push({ url: effectiveAfterUrl, label: 'Physique', tag: 'physique' });
  } else if (effectiveBeforeUrl) {
    allPhotos.push({ url: effectiveBeforeUrl, label: 'Baseline', tag: 'before' });
  }

  if (effectivePhotos && effectivePhotos.length > 0) {
    effectivePhotos.forEach((p: UserCommunityPhoto) => {
      if (!allPhotos.some(item => item.url === p.url)) {
        allPhotos.push({
          url: p.url,
          label: p.caption || p.dateLabel || p.tag.toUpperCase(),
          tag: p.tag
        });
      }
    });
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-zinc-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-zinc-900 border-0 sm:border border-[#F6721D]/80 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] max-h-full sm:my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Cover Banner */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border-b border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Close profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <GymAvatar
              avatarType={isOwnProfile ? userProfile?.avatarType : athlete.avatarType}
              avatarUrl={isOwnProfile ? userProfile?.avatarUrl : athlete.avatarUrl}
              avatarId={
                isOwnProfile
                  ? userProfile?.avatarId || 'u_me'
                  : athlete.avatarId || athlete.id || athlete.avatarSeed
              }
              name={athlete.name}
              size="lg"
              fallbackInitials={athlete.name.substring(0, 2)}
            />

            <div className="space-y-1 min-w-0 flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-zinc-100 truncate">
                  {athlete.name}
                </h2>

                {isOwnProfile ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    YOU
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-400 border border-amber-400/40">
                    {athlete.badge}
                  </span>
                )}

                {athlete.uniqueId && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-950 text-zinc-300 border border-zinc-700">
                    #{athlete.uniqueId}
                  </span>
                )}

                {isLevelMatch && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Your Level</span>
                  </span>
                )}
              </div>

              {/* Location & Gym metadata */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {!isOwnProfile && (
                      <span className="font-mono text-zinc-200 font-bold mr-1">
                        {distanceUnit === 'km'
                          ? `${(athlete as any).computedKm ?? Math.round(athlete.distanceMiles * 1.60934 * 10) / 10} km`
                          : `${(athlete as any).computedMiles ?? athlete.distanceMiles} mi`} ·
                      </span>
                    )}
                    {athlete.area}
                  </span>
                </span>
                {athlete.gymName && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate max-w-[200px]">{athlete.gymName}</span>
                  </span>
                )}
              </div>

              {/* Status & Joined date */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{athlete.lastActive}</span>
                {athlete.joinedDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{athlete.joinedDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 min-h-0 divide-y divide-zinc-800/60 pb-10">
          {/* Incoming Request Banner */}
          {!isOwnProfile && athlete.connectionStatus === 'incoming_request' && (
            <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/35 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-300">
                    Connection Request Received
                  </span>
                </div>
                {athlete.invitedAt && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {athlete.invitedAt}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-200 italic bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800">
                "{athlete.inviteMessage || 'Hey! Would love to connect and be workout buddies on GymPax!'}"
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onAcceptRequest) onAcceptRequest(athlete.id);
                    else if (onToggleConnection) onToggleConnection(athlete.id);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Accept Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onRejectRequest) onRejectRequest(athlete.id);
                    else if (onToggleConnection) onToggleConnection(athlete.id);
                  }}
                  className="py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-zinc-750 active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          )}

          {/* Outgoing Pending Request Banner */}
          {!isOwnProfile && athlete.connectionStatus === 'pending' && (
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-amber-400/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-zinc-200">
                    Connection Request Sent (Pending)
                  </span>
                </div>
                {athlete.invitedAt && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {athlete.invitedAt}
                  </span>
                )}
              </div>
              {athlete.inviteMessage && (
                <div className="text-xs text-zinc-300 italic bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>"{athlete.inviteMessage}"</span>
                </div>
              )}
            </div>
          )}

          {/* SECTION 1: Bio & Goals (with Edit Bio option for user) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isOwnProfile ? 'Your Bio' : 'Athlete Bio'}</span>
              </span>

              {isOwnProfile && !isEditingBio && (
                <button
                  type="button"
                  onClick={() => setIsEditingBio(true)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-zinc-700/60"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{athlete.bio?.trim() ? 'Edit Bio' : 'Write Bio'}</span>
                </button>
              )}
            </div>

            {saveSuccessNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Bio updated successfully!</span>
              </div>
            )}

            {isOwnProfile && isEditingBio ? (
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-amber-400/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Write a short bio about yourself:</span>
                  <span className="text-[10px] font-mono text-zinc-500">{bioInput.length}/240</span>
                </div>
                <textarea
                  value={bioInput}
                  onChange={e => setBioInput(e.target.value.slice(0, 240))}
                  placeholder="Share your lifting style, favorite compounds, PR targets, or gym background..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioInput(isOwnProfile ? (userProfile?.bio || athlete.bio || '') : athlete.bio);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
                  >
                    Save Bio
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-850 text-xs leading-relaxed space-y-1.5">
                {athlete.primaryGoal && (
                  <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                      Primary Goal
                    </span>
                    <span className="truncate">{athlete.primaryGoal}</span>
                  </p>
                )}
                {athlete.bio?.trim() ? (
                  <p className="text-zinc-300 italic pt-0.5 leading-relaxed">
                    "{athlete.bio.trim()}"
                  </p>
                ) : (
                  <p className="text-zinc-500 italic">
                    {isOwnProfile
                      ? 'No bio written yet. Click "Write Bio" above to introduce yourself to fellow gym lifters.'
                      : 'No bio written yet.'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: Photos (Physique & Progress Showcase) */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Photos ({allPhotos.length})</span>
              </span>

              {allPhotos.length > 0 && (
                <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                  Tap to expand
                </span>
              )}
            </div>

            {allPhotos.length > 0 ? (
              <div
                className={`grid gap-2.5 ${
                  allPhotos.length === 2
                    ? 'grid-cols-2'
                    : allPhotos.length === 1
                    ? 'grid-cols-1 max-w-xs mx-auto'
                    : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
                {allPhotos.map((photo, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => setPreviewPhoto(photo.url)}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 cursor-pointer transition-all shadow-sm"
                  >
                    <img
                      src={photo.url}
                      alt={photo.label || 'Physique photo'}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-zinc-200 font-mono font-bold text-[9px] uppercase border border-zinc-700/80">
                        {photo.tag || 'photo'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-zinc-200">
                      <span className="text-[10px] font-medium truncate drop-shadow">
                        {photo.label || 'Progress check-in'}
                      </span>
                      <ZoomIn className="w-3.5 h-3.5 text-amber-400 shrink-0 opacity-80 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-850 text-center space-y-1">
                <Camera className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">No physique photos uploaded yet</p>
                <p className="text-[11px] text-zinc-500">
                  {isOwnProfile
                    ? 'Upload before & after transformation shots in the My Photos tab.'
                    : 'This athlete has not published community photos.'}
                </p>
              </div>
            )}
          </div>

          {/* SECTION 3: Information (Training Profile & Frequency) */}
          <div className="pt-4 space-y-2.5">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Training Information</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-2xl">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block font-mono">
                  Training Split
                </span>
                <span className="font-semibold text-zinc-200 text-xs sm:text-[13px] mt-1 block truncate">
                  {athlete.workoutSplit || 'Push / Pull / Legs'}
                </span>
              </div>

              <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-2xl">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block font-mono">
                  Weekly Frequency
                </span>
                <span className="font-bold text-amber-400 text-xs sm:text-[13px] mt-1 block">
                  {athlete.trainingDaysPerWeek || 5} days / week
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 bg-zinc-950/60 border border-zinc-850 rounded-2xl">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block font-mono">
                  Experience Tier
                </span>
                <span className="font-bold text-zinc-200 text-xs sm:text-[13px] mt-1 block truncate">
                  {athlete.level || 'Intermediate'}
                </span>
              </div>
            </div>

            {athlete.favoriteLifts && (
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-850 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                  Favorite Lifts & Key Focus
                </span>
                <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                  {athlete.favoriteLifts}
                </p>
              </div>
            )}
          </div>

          {/* SECTION 4: Progress (Streaks, Rank, and PRs) */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Progress & Records</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{athlete.streakDays || 1}d Streak</span>
              </span>
            </div>

            {/* Rank progression if own profile */}
            {isOwnProfile && rewardsProfile && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200">{rewardsProfile.rankTitle}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      {rewardsProfile.points} pts
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {rewardsProfile.levelProgressPercent}% to {rewardsProfile.nextRankTitle}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${rewardsProfile.levelProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Key Personal Records (PRs) */}
            {athlete.prs && athlete.prs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {athlete.prs.map((pr, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center"
                  >
                    <span className="text-[10px] text-zinc-400 font-medium block truncate">
                      {pr.exercise}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400 block mt-0.5">
                      {pr.weight}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 block truncate">Flat Bench</span>
                  <span className="font-mono text-xs font-bold text-amber-400 block mt-0.5">120 kg</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 block truncate">Barbell Squat</span>
                  <span className="font-mono text-xs font-bold text-amber-400 block mt-0.5">165 kg</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 block truncate">Deadlift</span>
                  <span className="font-mono text-xs font-bold text-amber-400 block mt-0.5">200 kg</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:px-6 sm:py-3.5 border-t border-zinc-800 bg-zinc-950/98 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <div className="text-xs text-zinc-400">
            {isOwnProfile ? (
              <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Your GymPax Public Athlete Profile</span>
              </span>
            ) : athlete.connectionStatus === 'incoming_request' ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <UserPlus className="w-4 h-4" />
                <span>Invited You to Connect</span>
              </span>
            ) : athlete.connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <UserCheck className="w-4 h-4" />
                <span>Connected Gym Buddy</span>
              </span>
            ) : athlete.connectionStatus === 'pending' ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Request Pending</span>
              </span>
            ) : (
              <span className="text-zinc-500">Discoverable on GymPax</span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
            {!isOwnProfile && athlete.connectionStatus === 'connected' && onOpenWhatsApp && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp(athlete, 'message')}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm min-h-[40px]"
                  title="Send WhatsApp Message"
                >
                  <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                  <span>Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp(athlete, 'call')}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-emerald-400 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer border border-emerald-500/30 min-h-[40px] min-w-[40px]"
                  title="Call on WhatsApp"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                </button>
              </>
            )}

            {!isOwnProfile && athlete.connectionStatus === 'incoming_request' ? (
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={() => {
                    if (onAcceptRequest) onAcceptRequest(athlete.id);
                    else if (onToggleConnection) onToggleConnection(athlete.id);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md min-h-[40px] active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Accept Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onRejectRequest) onRejectRequest(athlete.id);
                    else if (onToggleConnection) onToggleConnection(athlete.id);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-zinc-750 min-h-[40px] active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            ) : !isOwnProfile && onToggleConnection && (
              <button
                type="button"
                onClick={() => onToggleConnection(athlete.id)}
                className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md min-h-[40px] ${
                  athlete.connectionStatus === 'connected'
                    ? 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                    : athlete.connectionStatus === 'pending'
                    ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 hover:bg-amber-400/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black'
                }`}
              >
                {athlete.connectionStatus === 'connected' && <span>Disconnect</span>}
                {athlete.connectionStatus === 'pending' && (
                  <>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Withdraw</span>
                  </>
                )}
                {athlete.connectionStatus === 'none' && (
                  <>
                    <UserPlus className="w-3.5 h-3.5 shrink-0" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer min-h-[40px]"
            >
              {isOwnProfile ? 'Done' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Expanded Photo View */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900/80 text-zinc-300 hover:text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewPhoto}
            alt="Expanded physique photo"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-zinc-800"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
