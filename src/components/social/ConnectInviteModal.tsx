import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UserPlus,
  Send,
  Sparkles,
  MapPin,
  Dumbbell,
  MessageSquare
} from 'lucide-react';
import { NearbyAthlete } from '../../types';
import { GymAvatar } from '../common/GymAvatar';

interface ConnectInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: NearbyAthlete | null;
  onSendInvite: (athleteId: string, customMessage?: string) => void;
}

const PRESET_MESSAGES = [
  'Looking for a reliable gym buddy! 💪',
  'Loved your workout stats and consistency 🔥',
  'Train on a similar split. Let us connect! 🏋️‍♂️',
  'Let us keep each other accountable on heavy days ⚡'
];

export const ConnectInviteModal: React.FC<ConnectInviteModalProps> = ({
  isOpen,
  onClose,
  athlete,
  onSendInvite
}) => {
  const [customMessage, setCustomMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setCustomMessage('');
    }
  }, [isOpen, athlete]);

  if (!isOpen || !athlete) return null;

  const handleSend = (includeCustom: boolean) => {
    const messageToSend = includeCustom && customMessage.trim() ? customMessage.trim() : undefined;
    onSendInvite(athlete.id, messageToSend);
    onClose();
  };

  const handleSelectPreset = (preset: string) => {
    setCustomMessage(preset);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-xs">
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                Connect with Lifter
              </h2>
              <span className="text-[11px] text-zinc-400">
                Send an invitation to become gym buddies
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Athlete Summary Card */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-850 flex items-center gap-3">
          <GymAvatar
            avatarType={athlete.avatarType}
            avatarUrl={athlete.avatarUrl}
            avatarId={athlete.avatarId || athlete.id || athlete.avatarSeed}
            name={athlete.name}
            size="md"
            fallbackInitials={athlete.name.substring(0, 2).toUpperCase()}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-sm text-zinc-100 truncate">
                {athlete.name}
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {athlete.level}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-zinc-800 text-zinc-300">
                {athlete.badge}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{athlete.gymName ? athlete.gymName.split(' ')[0] : 'Gym'} · {athlete.area}</span>
              </span>
            </div>
            {athlete.workoutSplit && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                <Dumbbell className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                <span className="truncate">{athlete.workoutSplit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Custom Message Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Write a Custom Message</span>
              <span className="text-[10px] text-zinc-500 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              {customMessage.length}/180
            </span>
          </div>

          <textarea
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value.slice(0, 180))}
            placeholder={`Hey ${athlete.name.split(' ')[0]}! Saw your training consistency and would love to connect as gym buddies...`}
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed transition-colors shadow-inner"
          />

          {/* Preset Prompts / Quick Fill Suggestions */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick templates:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_MESSAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-[10.5px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-left active:scale-95 ${
                    customMessage === preset
                      ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 font-semibold'
                      : 'bg-zinc-950 border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-semibold text-xs transition-colors cursor-pointer border border-zinc-750 order-2 sm:order-1"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:flex-1 justify-end order-1 sm:order-2">
            {customMessage.trim() ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSend(false)}
                  className="px-3 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer border border-zinc-750"
                  title="Send standard invitation without custom note"
                >
                  Skip Note
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send with Message</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleSend(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Send Connection Request</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
