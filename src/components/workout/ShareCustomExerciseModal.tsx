import React, { useState, useMemo } from 'react';
import {
  X,
  Share2,
  Users,
  Check,
  Dumbbell,
  Sparkles,
  Send,
  UserCheck,
  Search,
  CheckCircle2
} from 'lucide-react';
import { ExerciseDefinition, UserProfile, UserSubscription } from '../../types';
import { getRegisteredAthletes } from '../../utils/nearbyAthletesStorage';
import { shareCustomExerciseToCommunity } from '../../utils/storage';
import { FitnessModelPicture } from '../common/FitnessModelPicture';
import { GymAvatar } from '../common/GymAvatar';

interface ShareCustomExerciseModalProps {
  exercise: ExerciseDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  subscription?: UserSubscription;
  onExerciseShared?: (exercise: ExerciseDefinition, sharedNames: string[], message: string) => void;
}

export const ShareCustomExerciseModal: React.FC<ShareCustomExerciseModalProps> = ({
  exercise,
  isOpen,
  onClose,
  userProfile,
  subscription,
  onExerciseShared
}) => {
  const [shareMode, setShareMode] = useState<'all' | 'select'>('all');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [searchFriendQuery, setSearchFriendQuery] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  // Load registered community friends
  const communityFriends = useMemo(() => {
    return getRegisteredAthletes();
  }, [isOpen]);

  // Pre-generate informative default message with exercise name, type, and helpful information
  const defaultMessage = useMemo(() => {
    if (!exercise) return '';
    const helpfulCue =
      exercise.cues && exercise.cues.length > 0
        ? `Cue: ${exercise.cues[0]}`
        : exercise.description || 'Focus on controlled eccentric tempo and peak contraction.';

    return `Check out my custom exercise: "${exercise.name}" (${exercise.primaryMuscle} · ${exercise.equipment} · ${exercise.tier}). ${helpfulCue} Add it to your workout profile!`;
  }, [exercise]);

  // Sync customNote with defaultMessage when modal opens or exercise changes
  React.useEffect(() => {
    if (exercise) {
      setCustomNote(defaultMessage);
      setSelectedFriendIds([]);
      setShareMode('all');
      setIsSent(false);
    }
  }, [exercise, defaultMessage, isOpen]);

  if (!isOpen || !exercise) return null;

  const filteredFriends = communityFriends.filter(f =>
    f.name.toLowerCase().includes(searchFriendQuery.toLowerCase()) ||
    (f.city && f.city.toLowerCase().includes(searchFriendQuery.toLowerCase())) ||
    (f.area && f.area.toLowerCase().includes(searchFriendQuery.toLowerCase()))
  );

  const toggleFriend = (id: string) => {
    setSelectedFriendIds(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const selectAllFriends = () => {
    setSelectedFriendIds(communityFriends.map(f => f.id));
  };

  const clearSelectedFriends = () => {
    setSelectedFriendIds([]);
  };

  const handleShare = () => {
    const isPro = !!subscription?.isPro;
    const authorName = userProfile?.name || 'Athlete (You)';
    const authorBadge = isPro ? 'PRO' : 'LIFTER';
    const userRank = userProfile?.experienceLevel || 'Elite Lifter';

    // Share exercise to the community feed
    const post = shareCustomExerciseToCommunity(
      exercise,
      authorName,
      authorBadge,
      userRank,
      customNote.trim() || defaultMessage
    );

    // Resolve target audience names
    const targetNames =
      shareMode === 'all'
        ? ['All Friends']
        : communityFriends
            .filter(f => selectedFriendIds.includes(f.id))
            .map(f => f.name);

    if (onExerciseShared) {
      onExerciseShared(exercise, targetNames, customNote.trim() || defaultMessage);
    }

    // Trigger local broadcast so other views sync immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gympax:exercise-shared', {
          detail: { exercise, post, targetNames }
        })
      );
    }

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1400);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-exercise-title"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-750 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 space-y-4 text-zinc-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="share-exercise-title" className="text-sm sm:text-base font-bold text-zinc-100">
                Share Custom Exercise
              </h3>
              <p className="text-[11px] text-zinc-400">
                Share with community friends with 1-tap add to their profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Exercise Preview Card */}
        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
          <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900">
            <FitnessModelPicture
              exerciseId={exercise.id}
              exerciseName={exercise.name}
              primaryMuscle={exercise.primaryMuscle}
              aspect="wide"
              showZoom={false}
              imageUrl={exercise.imageUrl || (exercise.images && exercise.images[0])}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                {exercise.name}
              </h4>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                Custom
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 font-mono">
              <span className="text-amber-400">{exercise.primaryMuscle}</span>
              <span>·</span>
              <span>{exercise.equipment}</span>
              <span>·</span>
              <span>{exercise.tier}</span>
            </div>
          </div>
        </div>

        {/* Audience Selector: Share with All vs Select Friends */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Select Who to Share With
          </label>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
            <button
              type="button"
              onClick={() => setShareMode('all')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                shareMode === 'all'
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Share with All ({communityFriends.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShareMode('select')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                shareMode === 'select'
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Select Friends {selectedFriendIds.length > 0 ? `(${selectedFriendIds.length})` : ''}</span>
            </button>
          </div>

          {/* Individual Friends Selector List */}
          {shareMode === 'select' && (
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFriendQuery}
                    onChange={e => setSearchFriendQuery(e.target.value)}
                    placeholder="Search friends by name or gym..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={selectAllFriends}
                    className="text-amber-400 hover:underline cursor-pointer font-semibold px-1"
                  >
                    All
                  </button>
                  <span className="text-zinc-600">·</span>
                  <button
                    type="button"
                    onClick={clearSelectedFriends}
                    className="text-zinc-400 hover:text-zinc-200 cursor-pointer px-1"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                {filteredFriends.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-3 text-center">No friends match your search.</p>
                ) : (
                  filteredFriends.map(friend => {
                    const isChecked = selectedFriendIds.includes(friend.id);
                    return (
                      <div
                        key={friend.id}
                        onClick={() => toggleFriend(friend.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-400/10 border-amber-400/60 ring-1 ring-amber-400/20'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <GymAvatar
                            avatarType={friend.avatarType}
                            avatarUrl={friend.avatarUrl}
                            avatarId={friend.avatarId || friend.id || friend.avatarSeed}
                            name={friend.name}
                            size="sm"
                            fallbackInitials={friend.name.substring(0, 2)}
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-zinc-100 block truncate">
                              {friend.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono block truncate">
                              {friend.gymName || friend.city || friend.area}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                            isChecked
                              ? 'bg-amber-400 border-amber-400 text-zinc-950 font-bold'
                              : 'border-zinc-700 bg-zinc-950 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Short Message Input with Exercise Details */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Message to Community
            </label>
            <button
              type="button"
              onClick={() => setCustomNote(defaultMessage)}
              className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
            >
              Reset to Default
            </button>
          </div>
          <textarea
            value={customNote}
            onChange={e => setCustomNote(e.target.value)}
            rows={3}
            placeholder="Write a message about how to perform this exercise..."
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
          />
          <p className="text-[10px] text-zinc-500 leading-tight">
            Shared friends will see this exercise in their community feed with a 1-tap option to save it to their own workout profile.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={isSent || (shareMode === 'select' && selectedFriendIds.length === 0)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md disabled:cursor-not-allowed"
          >
            {isSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                <span>Shared with Community!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>
                  {shareMode === 'all'
                    ? 'Share with All Friends'
                    : `Share with ${selectedFriendIds.length} Friends`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
