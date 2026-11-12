import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  History,
  Dumbbell,
  Clock,
  Flame,
  Trophy,
  ArrowRight,
  ExternalLink,
  Layers,
  Crown,
  Calendar,
  Sparkles,
  Camera,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SocialPost } from '../../types';
import { GymAvatar } from '../common/GymAvatar';

export interface HistoricalPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postOwner: {
    userId: string;
    userName: string;
    userBadge?: string;
    userRank?: string;
    userAvatarSeed?: string;
    streakDays?: number;
    avatarType?: 'upload' | 'animated';
    avatarUrl?: string;
    avatarId?: string;
  };
  posts: SocialPost[];
  unit: 'kg' | 'lbs';
  onReviewCard: (post: SocialPost) => void;
}

export const HistoricalPostsModal: React.FC<HistoricalPostsModalProps> = ({
  isOpen,
  onClose,
  postOwner,
  posts,
  unit,
  onReviewCard
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) {
      setVisibleCount(5);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMe = postOwner.userId === 'u_me';

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Historical Workout Posts"
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-[#F6721D]/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <GymAvatar
              avatarType={postOwner.avatarType}
              avatarUrl={postOwner.avatarUrl}
              avatarId={postOwner.avatarId || postOwner.userId || postOwner.userAvatarSeed}
              name={postOwner.userName}
              size="md"
              fallbackInitials={postOwner.userName.substring(0, 2)}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-zinc-100 truncate">
                  {isMe ? 'Your Historical Posts' : `${postOwner.userName}'s History`}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10.5px] font-mono font-bold">
                  {posts.length} {posts.length === 1 ? 'Past Post' : 'Past Posts'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Older workout sessions & milestones (not shown in main feed)</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer border border-zinc-700/60 shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Historical List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
          {posts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/70 text-center space-y-2">
              <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No older historical posts yet</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Only the last completed session is displayed on the community page to keep the feed clean. Completed past workouts will appear here.
              </p>
            </div>
          ) : (
            posts.slice(0, visibleCount).map((post, idx) => {
              const cardKey = post.id || `hist_${idx}`;
              const isExpanded = !!expandedPostIds[cardKey];
              const toggleExpand = () =>
                setExpandedPostIds(prev => ({ ...prev, [cardKey]: !isExpanded }));

              const displayVol =
                unit === 'kg'
                  ? Math.round(post.volumeKg).toLocaleString()
                  : Math.round(post.volumeKg * 2.20462).toLocaleString();

              const formattedDate = new Date(post.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <article
                  key={cardKey}
                  className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-2.5 shadow-xs"
                >
                  {/* 1. HEADER: Avatar, Name, Metadata, Review Card & Expand/Collapse */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <GymAvatar
                        avatarType={postOwner.avatarType}
                        avatarUrl={postOwner.avatarUrl}
                        avatarId={postOwner.avatarId || postOwner.userId || postOwner.userAvatarSeed}
                        name={postOwner.userName}
                        size="md"
                        fallbackInitials={postOwner.userName.substring(0, 2)}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-zinc-100 truncate">
                            {postOwner.userName}
                          </span>
                          {isMe && (
                            <span className="text-[11px] text-amber-400 font-medium">· You</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 flex-wrap">
                          <span>{formattedDate}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-zinc-300">
                            {post.postType === 'before_after'
                              ? 'Transformation'
                              : `Session #${posts.length - idx}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onReviewCard(post)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-amber-300 border border-zinc-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Review full session workout card"
                      >
                        <Dumbbell className="w-3 h-3 text-amber-400" />
                        <span>Review Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleExpand}
                        aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title={isExpanded ? 'Collapse card' : 'Expand card'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <>
                      <div>
                        <h4
                          onClick={() => onReviewCard(post)}
                          className="font-bold text-base text-zinc-100 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {post.workoutTitle}
                        </h4>
                        {post.topSet && (
                          <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                            Top Set: {post.topSet}
                          </p>
                        )}
                      </div>

                      {/* 3-Column Metrics Bar */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                        <div>
                          <span className="text-[11px] text-zinc-500 block">Time</span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                            {post.durationMinutes}m
                          </span>
                        </div>
                        <div className="border-x border-zinc-800/80 px-3">
                          <span className="text-[11px] text-zinc-500 block">Volume</span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                            {displayVol} {unit}
                          </span>
                        </div>
                        <div className="pl-1">
                          <span className="text-[11px] text-zinc-500 block">
                            {post.prBroken ? 'Records' : 'Session'}
                          </span>
                          {post.prBroken ? (
                            <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1 truncate">
                              <Trophy className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{post.prBroken}</span>
                            </span>
                          ) : (
                            <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                              #{posts.length - idx}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Attached photo thumbnail if present */}
                      {post.photoUrl && (
                        <div className="relative aspect-[16/9] max-h-48 w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                          <img src={post.photoUrl} alt="Session photo" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Transformation side-by-side if present */}
                      {post.postType === 'before_after' && post.beforePhotoUrl && post.afterPhotoUrl && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                            <img src={post.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-zinc-300 font-mono text-[9px] uppercase">
                              Before
                            </span>
                          </div>
                          <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-zinc-950 border border-amber-400/40">
                            <img src={post.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 font-mono font-bold text-[9px] uppercase">
                              After
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                        <button
                          type="button"
                          onClick={() => onReviewCard(post)}
                          className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Full Set Breakdown</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={toggleExpand}
                          aria-label="Collapse card"
                          className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                          title="Collapse card"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}

          {posts.length > 5 && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-400">
                Showing <strong className="text-zinc-200">{Math.min(visibleCount, posts.length)}</strong> of{' '}
                <strong className="text-zinc-200">{posts.length}</strong> past sessions
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {visibleCount > 5 && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(5)}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Collapse to 5</span>
                  </button>
                )}

                {visibleCount < posts.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 5)}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Load 5 More Sessions</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="font-mono text-[11px]">
            {isMe ? 'Only your last session appears on the community page' : 'Only latest session shown on feed'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
