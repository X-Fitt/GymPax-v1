import React, { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp, Trophy, ArrowRight } from 'lucide-react';
import { NearbyAthlete } from '../../types';
import { GymAvatar } from '../common/GymAvatar';

interface NewAreaMembersCardProps {
  athletes: NearbyAthlete[];
  userArea: string;
  onToggleConnection: (athleteId: string) => void;
  onOpenProfile: (athlete: NearbyAthlete) => void;
  distanceUnit?: 'mi' | 'km';
  className?: string;
}

export const NewAreaMembersCard: React.FC<NewAreaMembersCardProps> = ({
  athletes,
  userArea,
  onToggleConnection,
  onOpenProfile,
  distanceUnit = 'mi',
  className = ''
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  if (!athletes || athletes.length === 0) return null;

  const displayAthletes = athletes.slice(0, 3);
  const cleanAreaName = userArea.split(',')[0].trim() || 'Your Area';

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-[#F6721D]/80 shadow-xs space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
            New Members in {cleanAreaName}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
            {displayAthletes.length}
          </span>
        </div>
      </div>

      {/* Member Cards using Default User Card Design */}
      <div className="grid grid-cols-1 gap-3.5">
        {displayAthletes.map(athlete => {
          const isConnected = athlete.connectionStatus === 'connected';
          const isPending = athlete.connectionStatus === 'pending';
          const isExpanded = !!expandedIds[athlete.id];
          const toggleExpand = () =>
            setExpandedIds(prev => ({ ...prev, [athlete.id]: !isExpanded }));

          const distanceStr = athlete.distanceMiles !== undefined
            ? (distanceUnit === 'km'
                ? `${Math.round(athlete.distanceMiles * 1.60934 * 10) / 10} km`
                : `${athlete.distanceMiles} mi`)
            : 'Nearby';

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
                      <span>{distanceStr} · {athlete.gymName || athlete.area}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-zinc-300">{athlete.badge || athlete.level}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
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
    </div>
  );
};
