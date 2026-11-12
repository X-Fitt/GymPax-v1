import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Share2,
  Users,
  Check,
  Sparkles,
  Send,
  UserCheck,
  Search,
  CheckCircle2,
  Trophy,
  Flame,
  Scale,
  TrendingUp,
  Dumbbell
} from 'lucide-react';
import { ProgressStageShareData, UserProfile, UserSubscription } from '../../types';
import { getRegisteredAthletes } from '../../utils/nearbyAthletesStorage';
import { shareProgressStageToCommunity } from '../../utils/storage';
import { GymAvatar } from '../common/GymAvatar';

interface ShareProgressStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageData: ProgressStageShareData | null;
  userProfile?: UserProfile | null;
  subscription?: UserSubscription;
  onShared?: (stage: ProgressStageShareData, targetNames: string[], note: string) => void;
}

export const ShareProgressStageModal: React.FC<ShareProgressStageModalProps> = ({
  isOpen,
  onClose,
  stageData,
  userProfile,
  subscription,
  onShared
}) => {
  const [shareMode, setShareMode] = useState<'all' | 'select'>('all');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [searchFriendQuery, setSearchFriendQuery] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  // Load registered community connections
  const communityFriends = useMemo(() => {
    return getRegisteredAthletes();
  }, [isOpen]);

  // Default informative message based on the progress stage data
  const defaultNote = useMemo(() => {
    if (!stageData) return '';
    if (stageData.defaultMessage) return stageData.defaultMessage;
    return `Just achieved a new progress milestone on GymPax: "${stageData.title}" — ${stageData.highlightValue}! ${
      stageData.highlightSubtext ? `(${stageData.highlightSubtext})` : ''
    } Keep the iron moving! 💪`;
  }, [stageData]);

  // Reset state when opening
  useEffect(() => {
    if (stageData && isOpen) {
      setCustomNote(defaultNote);
      setSelectedFriendIds([]);
      setShareMode('all');
      setIsSent(false);
      setSearchFriendQuery('');
    }
  }, [stageData, defaultNote, isOpen]);

  if (!isOpen || !stageData) return null;

  const filteredFriends = communityFriends.filter(
    f =>
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

  const handleSend = () => {
    const isPro = !!subscription?.isPro;
    const authorName = userProfile?.name || 'Athlete (You)';
    const authorBadge = isPro ? 'PRO' : 'LIFTER';
    const userRank = userProfile?.experienceLevel || 'Elite Lifter';

    const targetNames =
      shareMode === 'all'
        ? ['All Connections']
        : communityFriends
            .filter(f => selectedFriendIds.includes(f.id))
            .map(f => f.name);

    const messageToUse = customNote.trim() || defaultNote;

    // Post to community feed
    shareProgressStageToCommunity(
      stageData,
      authorName,
      authorBadge,
      userRank,
      messageToUse,
      targetNames
    );

    if (onShared) {
      onShared(stageData, targetNames, messageToUse);
    }

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1300);
  };

  // Icon for stage badge
  const getStageIcon = () => {
    switch (stageData.stageType) {
      case 'athlete_rank':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'iron_streak':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'personal_records_summary':
      case 'single_pr':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'body_measurements':
        return <Scale className="w-3.5 h-3.5 text-amber-400" />;
      case 'exercise_progression':
        return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
      case 'muscle_distribution':
        return <Dumbbell className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-progress-title"
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
              <h3 id="share-progress-title" className="text-sm sm:text-base font-bold text-zinc-100">
                Share Progress Milestone
              </h3>
              <p className="text-[11px] text-zinc-400">
                Send this progress milestone to your gym connections or community feed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Progress Stage Summary Card */}
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-black text-[9px] uppercase font-mono tracking-wider flex items-center gap-1">
                {getStageIcon()}
                <span>{stageData.badgeLabel}</span>
              </span>
              {stageData.highlightSubtext && (
                <span className="text-[11px] font-mono text-zinc-400">
                  {stageData.highlightSubtext}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Verified Milestone
            </span>
          </div>

          <div>
            <h4 className="font-bold text-sm text-zinc-100">
              {stageData.title}
            </h4>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-lg sm:text-xl font-black text-amber-400 tabular-nums">
                {stageData.highlightValue}
              </span>
            </div>
          </div>

          {/* Optional bullets / tags */}
          {stageData.summaryBullets && stageData.summaryBullets.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {stageData.summaryBullets.map((bullet, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                >
                  {bullet}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Audience Selection Tabs: Minimalistic */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Audience: Send Milestone
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShareMode('all')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                shareMode === 'all'
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Share with all</span>
            </button>

            <button
              type="button"
              onClick={() => setShareMode('select')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                shareMode === 'select'
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Select Connections {selectedFriendIds.length > 0 ? `(${selectedFriendIds.length})` : ''}</span>
            </button>
          </div>
        </div>

        {/* Specific Connections Selection List */}
        {shareMode === 'select' && (
          <div className="space-y-2 p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 animate-in fade-in">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFriendQuery}
                  onChange={e => setSearchFriendQuery(e.target.value)}
                  placeholder="Search connections..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                <button
                  type="button"
                  onClick={selectAllFriends}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-zinc-600">|</span>
                <button
                  type="button"
                  onClick={clearSelectedFriends}
                  className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-zinc-850">
              {filteredFriends.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No connections found matching "{searchFriendQuery}"
                </div>
              ) : (
                filteredFriends.map(friend => {
                  const isChecked = selectedFriendIds.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`pt-1.5 first:pt-0 pb-1.5 flex items-center justify-between gap-2 px-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-amber-400/10' : 'hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GymAvatar
                          avatarType={friend.avatarType}
                          avatarUrl={friend.avatarUrl}
                          avatarId={friend.avatarId || friend.id || friend.avatarSeed}
                          name={friend.name}
                          size="xs"
                          fallbackInitials={friend.name.substring(0, 2)}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-zinc-200 block truncate">
                            {friend.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 block truncate">
                            {friend.badge} · {friend.city || friend.area || 'GymPax Connection'}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-amber-400 border-amber-400 text-zinc-950'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-[10px] text-zinc-500 text-right font-mono">
              {selectedFriendIds.length} of {communityFriends.length} selected
            </div>
          </div>
        )}

        {/* Short Informative Message / Note */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Milestone Summary Note</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-normal">
              Edit message
            </span>
          </div>

          <textarea
            value={customNote}
            onChange={e => setCustomNote(e.target.value)}
            rows={3}
            placeholder="Write a message about your progress..."
            className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs text-zinc-300 font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isSent || (shareMode === 'select' && selectedFriendIds.length === 0)}
            className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isSent
                ? 'bg-emerald-500 text-white cursor-default'
                : shareMode === 'select' && selectedFriendIds.length === 0
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 active:scale-95'
            }`}
          >
            {isSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SENT!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>SEND</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
