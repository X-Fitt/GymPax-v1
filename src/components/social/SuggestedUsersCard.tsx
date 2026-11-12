import React, { useState, useMemo } from 'react';
import {
  RotateCw,
  UserPlus,
  UserCheck,
  Clock,
  MapPin,
  Globe,
  Sparkles,
  Search,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { NearbyAthlete, UserProfile } from '../../types';
import {
  SuggestedAthleteItem,
  AthleteSearchFilters,
  searchAthletes
} from '../../utils/suggestedAthletes';
import { GymAvatar } from '../common/GymAvatar';

interface SuggestedUsersCardProps {
  suggestions: SuggestedAthleteItem[];
  onRefresh: () => void;
  onToggleConnection: (athleteId: string) => void;
  onRejectConnection?: (athleteId: string) => void;
  onOpenProfile: (athlete: NearbyAthlete) => void;
  allAthletes?: NearbyAthlete[];
  userProfile?: UserProfile | null;
  userArea?: string;
  distanceUnit?: 'mi' | 'km';
  isRefreshing?: boolean;
  className?: string;
}

export const SuggestedUsersCard: React.FC<SuggestedUsersCardProps> = ({
  suggestions,
  onRefresh,
  onToggleConnection,
  onRejectConnection,
  onOpenProfile,
  allAthletes = [],
  userProfile,
  userArea,
  distanceUnit = 'mi',
  isRefreshing = false,
  className = ''
}) => {
  const [spinAnimation, setSpinAnimation] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchPageOffset, setSearchPageOffset] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Search & Filter State: Name, Location, Level, Gender
  const [filters, setFilters] = useState<AthleteSearchFilters>({
    name: '',
    location: '',
    level: 'all',
    gender: 'all'
  });

  const isFilterActive = Boolean(
    filters.name.trim() ||
    filters.location.trim() ||
    filters.level !== 'all' ||
    filters.gender !== 'all'
  );

  const handleRefreshClick = () => {
    setSpinAnimation(true);
    if (isFilterActive) {
      // Cycle to the next 3 search results if search is active
      setSearchPageOffset(prev => prev + 3);
    } else {
      onRefresh();
    }
    setTimeout(() => setSpinAnimation(false), 500);
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      location: '',
      level: 'all',
      gender: 'all'
    });
    setSearchPageOffset(0);
  };

  // Filter athletes when user uses the search bar
  const searchResults = useMemo(() => {
    if (!isFilterActive) return [];
    const pool = allAthletes.length > 0 ? allAthletes : suggestions.map(s => s.athlete);
    return searchAthletes(pool, filters);
  }, [allAthletes, suggestions, filters, isFilterActive]);

  // Sliced search results for display (strictly 3 at a time for 3-cards-in-a-row)
  const displayedSearchResults = useMemo(() => {
    if (!isFilterActive) return [];
    if (searchResults.length === 0) return [];
    const start = searchPageOffset % Math.max(searchResults.length, 1);
    const slice = searchResults.slice(start, start + 3);
    if (slice.length < 3 && searchResults.length > 3) {
      return [...slice, ...searchResults.slice(0, 3 - slice.length)];
    }
    return slice;
  }, [searchResults, searchPageOffset, isFilterActive]);

  // Strictly cap at 3 suggested members for 3-cards-in-a-row layout matching NewAreaMembersCard
  const displaySuggestions = useMemo(() => {
    return suggestions.slice(0, 3);
  }, [suggestions]);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 shadow-xs space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
                {isFilterActive ? 'Filtered Lifters' : 'Suggested Connections'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                {isFilterActive ? `${searchResults.length} Found` : `${displaySuggestions.length} Suggested`}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {isFilterActive
                ? 'Results matching your custom name, location, level, or gender search'
                : 'Lifters near your area and global lifters matching your goal & level'}
            </p>
          </div>
        </div>

        {/* Minimalist Action Controls: Search Toggle + Refresh */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
              showSearch || isFilterActive
                ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-zinc-750 hover:text-zinc-100'
            }`}
            title="Search for lifters by name, location, level, or gender"
            aria-label="Search and filter lifters"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden xs:inline">Search</span>
            {isFilterActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRefreshClick}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-750 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title={isFilterActive ? 'Cycle next 3 search results' : 'Refresh for new suggested lifters'}
            aria-label="Refresh suggested users"
          >
            <RotateCw className={`w-3.5 h-3.5 ${spinAnimation || isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="text-[11px] font-medium hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Minimalist Search & Filter Bar */}
      {showSearch && (
        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {/* 1. Name Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Name or ID (e.g. Marcus)"
                value={filters.name}
                onChange={e => {
                  setFilters(prev => ({ ...prev, name: e.target.value }));
                  setSearchPageOffset(0);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400/60 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
              {filters.name && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, name: '' }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 2. Location Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Location (city, country, area)"
                value={filters.location}
                onChange={e => {
                  setFilters(prev => ({ ...prev, location: e.target.value }));
                  setSearchPageOffset(0);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400/60 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors"
              />
              {filters.location && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, location: '' }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 3. Level Dropdown */}
            <div>
              <select
                value={filters.level}
                onChange={e => {
                  setFilters(prev => ({ ...prev, level: e.target.value }));
                  setSearchPageOffset(0);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400/60 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer transition-colors"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced Pro</option>
                <option value="Pro">Pro / Elite</option>
              </select>
            </div>

            {/* 4. Gender Dropdown */}
            <div>
              <select
                value={filters.gender}
                onChange={e => {
                  setFilters(prev => ({ ...prev, gender: e.target.value }));
                  setSearchPageOffset(0);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400/60 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer transition-colors"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Search Footer / Reset */}
          {isFilterActive && (
            <div className="flex items-center justify-between pt-1 border-t border-zinc-850/80 text-[11px]">
              <span className="text-zinc-400">
                Found <strong className="text-amber-400 font-mono">{searchResults.length}</strong> lifters matching filters
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suggested or Searched Users Grid (Strictly 3 cards in a row matching NewAreaMembersCard) */}
      {isFilterActive ? (
        searchResults.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-850 text-center space-y-2">
            <p className="text-xs text-zinc-400">
              No athletes found matching your search criteria.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-amber-400 text-xs font-semibold cursor-pointer border border-zinc-750 transition-colors"
            >
              Clear Search & Show Suggestions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {displayedSearchResults.map(athlete => {
              const isConnected = athlete.connectionStatus === 'connected';
              const isPending = athlete.connectionStatus === 'pending';
              const isIncoming = athlete.connectionStatus === 'incoming_request';
              const isExpanded = !!expandedIds[athlete.id];
              const toggleExpand = () =>
                setExpandedIds(prev => ({ ...prev, [athlete.id]: !isExpanded }));

              const isLocal = Boolean(
                userArea &&
                (athlete.area?.toLowerCase().includes(userArea.toLowerCase()) ||
                 athlete.cityOrTown?.toLowerCase().includes(userArea.toLowerCase()))
              );
              const distanceStr = athlete.distanceMiles !== undefined
                ? (distanceUnit === 'km'
                    ? `${Math.round(athlete.distanceMiles * 1.60934 * 10) / 10} km`
                    : `${athlete.distanceMiles} mi`)
                : (isLocal ? 'Nearby' : (athlete.country || 'Global'));

              return (
                <article
                  key={athlete.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-2.5 shadow-xs"
                >
                  {/* 1. HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => onOpenProfile(athlete)}
                      className="flex items-center gap-3 cursor-pointer group min-w-0"
                      title={`View ${athlete.name}'s profile`}
                    >
                      <GymAvatar
                        avatarType={athlete.avatarType}
                        avatarUrl={athlete.avatarUrl}
                        avatarId={athlete.avatarId || athlete.id || athlete.avatarSeed}
                        name={athlete.name}
                        size="md"
                        fallbackInitials={athlete.name.substring(0, 2).toUpperCase()}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                            {athlete.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 flex-wrap">
                          <span>{athlete.country || 'United States'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-zinc-300">{athlete.badge || athlete.level}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isIncoming ? (
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onToggleConnection(athlete.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="Accept invitation and connect"
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Accept</span>
                          </button>
                          {onRejectConnection && (
                            <button
                              type="button"
                              onClick={() => onRejectConnection(athlete.id)}
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                              title="Reject invitation"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onToggleConnection(athlete.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 border ${
                            isConnected
                              ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                              : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 border-amber-400 shadow-xs'
                          }`}
                          title={isConnected ? 'Connected' : isPending ? 'Request Pending' : 'Connect'}
                        >
                          {isConnected ? (
                            <>
                              <UserCheck className="w-3 h-3 stroke-[2.5]" />
                              <span>Connected</span>
                            </>
                          ) : isPending ? (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 stroke-[2.5]" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      )}

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
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                        <div>
                          <span className="text-[11px] text-zinc-500 block">Experience</span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                            {athlete.level}
                          </span>
                        </div>
                        <div className="border-x border-zinc-800/80 px-3">
                          <span className="text-[11px] text-zinc-500 block">Distance</span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                            {distanceStr}
                          </span>
                        </div>
                        <div className="pl-1">
                          <span className="text-[11px] text-zinc-500 block">Streak</span>
                          <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1 truncate">
                            <Trophy className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{athlete.streakDays}d streak</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                        <button
                          type="button"
                          onClick={() => onOpenProfile(athlete)}
                          className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Athlete Profile</span>
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
            })}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {displaySuggestions.map(({ athlete, reason, isArea, matchType }) => {
            const isConnected = athlete.connectionStatus === 'connected';
            const isPending = athlete.connectionStatus === 'pending';
            const isIncoming = athlete.connectionStatus === 'incoming_request';
            const isExpanded = !!expandedIds[athlete.id];
            const toggleExpand = () =>
              setExpandedIds(prev => ({ ...prev, [athlete.id]: !isExpanded }));

            const distanceStr = athlete.distanceMiles !== undefined
              ? (distanceUnit === 'km'
                  ? `${Math.round(athlete.distanceMiles * 1.60934 * 10) / 10} km`
                  : `${athlete.distanceMiles} mi`)
              : (isArea ? 'Nearby' : (athlete.country || 'Global'));

            const matchReasonLabel = isArea
              ? 'Local Area'
              : matchType === 'goal_and_level'
              ? 'Same Goal & Level'
              : matchType === 'goal'
              ? 'Same Goal'
              : 'Level Match';

            return (
              <article
                key={athlete.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 hover:border-[#F6721D] transition-colors space-y-2.5 shadow-xs"
              >
                {/* 1. HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => onOpenProfile(athlete)}
                    className="flex items-center gap-3 cursor-pointer group min-w-0"
                    title={`View ${athlete.name}'s profile`}
                  >
                    <GymAvatar
                      avatarType={athlete.avatarType}
                      avatarUrl={athlete.avatarUrl}
                      avatarId={athlete.avatarId || athlete.id || athlete.avatarSeed}
                      name={athlete.name}
                      size="md"
                      fallbackInitials={athlete.name.substring(0, 2).toUpperCase()}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                          {athlete.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 flex-wrap">
                        <span>{athlete.country || 'United States'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-zinc-300">{athlete.badge || athlete.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isIncoming ? (
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleConnection(athlete.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all cursor-pointer shadow-xs"
                          title="Accept invitation and connect"
                        >
                          Accept
                        </button>
                        {onRejectConnection && (
                          <button
                            type="button"
                            onClick={() => onRejectConnection(athlete.id)}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                            title="Reject invitation"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onToggleConnection(athlete.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 border ${
                          isConnected
                            ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                            : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 border-amber-400 shadow-xs'
                        }`}
                        title={isConnected ? 'Connected' : isPending ? 'Request Pending' : 'Connect'}
                      >
                        {isConnected ? 'Connected' : isPending ? 'Pending' : 'Connect'}
                      </button>
                    )}

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
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                      <div>
                        <span className="text-[11px] text-zinc-500 block">Experience</span>
                        <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums">
                          {athlete.level}
                        </span>
                      </div>
                      <div className="border-x border-zinc-800/80 px-3">
                        <span className="text-[11px] text-zinc-500 block">Match</span>
                        <span className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tabular-nums truncate block">
                          {matchReasonLabel}
                        </span>
                      </div>
                      <div className="pl-1">
                        <span className="text-[11px] text-zinc-500 block">Streak</span>
                        <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1 truncate">
                          <Trophy className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{athlete.streakDays}d streak</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                      <button
                        type="button"
                        onClick={() => onOpenProfile(athlete)}
                        className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Athlete Profile</span>
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
          })}
        </div>
      )}
    </div>
  );
};
