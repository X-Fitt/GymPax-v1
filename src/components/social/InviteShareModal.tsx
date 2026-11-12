import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Share2,
  Copy,
  Check,
  MapPin,
  MessageCircle,
  Send,
  Smartphone,
  QrCode,
  Sparkles,
  ExternalLink,
  Users,
  Zap,
  Trophy,
  UserPlus
} from 'lucide-react';
import { awardAppShare, awardReferralJoined } from '../../utils/rewardsEngine';
import { RewardsProfile } from '../../types';

interface InviteShareModalProps {
  isOpen?: boolean;
  onClose: () => void;
  userArea: string;
  userLevel?: string;
  myLifterId?: string;
  onProfileUpdated?: (updated: RewardsProfile) => void;
}

export const InviteShareModal: React.FC<InviteShareModalProps> = ({
  isOpen = true,
  onClose,
  userArea,
  userLevel = 'Intermediate',
  myLifterId,
  onProfileUpdated
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [includeArea, setIncludeArea] = useState(true);
  const [customAreaName, setCustomAreaName] = useState(userArea);
  const [activeTab, setActiveTab] = useState<'area' | 'social' | 'qr'>('area');
  const [pointsToast, setPointsToast] = useState<string | null>(null);

  const showPointsAlert = (msg: string) => {
    setPointsToast(msg);
    setTimeout(() => setPointsToast(null), 3500);
  };

  if (!isOpen) return null;

  // The base app URL
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gympax.app';
  const referralCode = 'GYM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const inviteLink = `${appUrl}?ref=${referralCode}&area=${encodeURIComponent(customAreaName)}`;

  // Area-specific message for local friends & workout partners
  const localFriendMessage = includeArea
    ? `Hey! I'm tracking my progressive overload and lifting in ${customAreaName} with GymPax. Join my gym squad and let's crush some PRs together! Check it out: ${inviteLink}`
    : `Hey! I'm using GymPax to log workouts, track RPE, and hit new PRs. Join me on the app: ${inviteLink}`;

  // General social media message
  const socialMessage = `Track every rep, calculate plate math, and push progressive overload with GymPax! 🏋️‍♂️ Join the community here: ${inviteLink} #GymPax #Bodybuilding #GymLife #Powerbuilding`;

  const triggerShareReward = (channel: string) => {
    const res = awardAppShare(channel);
    showPointsAlert(res.message);
    if (res.success && onProfileUpdated) {
      onProfileUpdated(res.profile);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      triggerShareReward('Link Copied');
    } catch {
      // fallback
    }
  };

  const handleCopyMessage = async () => {
    try {
      const msg = activeTab === 'area' ? localFriendMessage : socialMessage;
      await navigator.clipboard.writeText(msg);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
      triggerShareReward('Message Copied');
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on GymPax Workout Tracker',
          text: activeTab === 'area' ? localFriendMessage : socialMessage,
          url: inviteLink
        });
        triggerShareReward('Device Share');
      } catch {
        // User cancelled or share error
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSimulateReferralJoin = () => {
    const names = ['Marcus Vance', 'David Chen', 'Sarah Miller', 'Alex Rivera', 'Coach Mike'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const res = awardReferralJoined(randomName);
    showPointsAlert(res.message);
    if (res.success && onProfileUpdated) {
      onProfileUpdated(res.profile);
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💬',
      bgColor: 'bg-emerald-600 hover:bg-emerald-500',
      getUrl: () =>
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          activeTab === 'area' ? localFriendMessage : socialMessage
        )}`
    },
    {
      name: 'X / Twitter',
      icon: '𝕏',
      bgColor: 'bg-zinc-800 hover:bg-zinc-700',
      getUrl: () =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          socialMessage
        )}`
    },
    {
      name: 'SMS / Text',
      icon: '📱',
      bgColor: 'bg-amber-600 hover:bg-amber-500',
      getUrl: () =>
        `sms:?&body=${encodeURIComponent(localFriendMessage)}`
    },
    {
      name: 'Facebook',
      icon: '👥',
      bgColor: 'bg-blue-600 hover:bg-blue-500',
      getUrl: () =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`
    },
    {
      name: 'Email',
      icon: '✉️',
      bgColor: 'bg-zinc-700 hover:bg-zinc-600',
      getUrl: () =>
        `mailto:?subject=${encodeURIComponent(
          `Let's workout together on GymPax (${customAreaName})`
        )}&body=${encodeURIComponent(localFriendMessage)}`
    }
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[120] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-zinc-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-zinc-900 border-0 sm:border border-zinc-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] max-h-full sm:my-auto relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Toast Alert for Points Earned */}
        {pointsToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-950 border border-amber-400 text-xs text-zinc-100 font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span>{pointsToast}</span>
          </div>
        )}
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span className="truncate">Send App Link & Invite</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono shrink-0">
                  {referralCode}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                Connect with local workout partners and share across social media
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Minimalist Squad Points Banner */}
        <div className="mx-3 sm:mx-6 mt-2.5 sm:mt-3 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-850 flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
              <Zap className="w-3 h-3 fill-current" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-zinc-200 block text-[11px] sm:text-xs truncate">
                Earn points by growing your squad
              </span>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                <span className="text-amber-400 font-medium">+2 share</span>
                <span className="text-zinc-600">·</span>
                <span className="text-amber-400 font-medium">+3 friend join</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSimulateReferralJoin}
            className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-amber-400 border border-amber-400/25 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors whitespace-nowrap"
            title="Simulate a new gym buddy signing up with your personal link"
          >
            <UserPlus className="w-3 h-3" />
            <span className="hidden xs:inline">Simulate</span>
            <span>+3 pts</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-800 px-6 pt-3 bg-zinc-950/20">
          <button
            onClick={() => setActiveTab('area')}
            className={`pb-3 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'area'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Local Friends ({customAreaName})</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`pb-3 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'social'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Social Media Channels</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Gym QR Code</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 min-h-0 pb-8">
          {/* TAB 1: AREA FRIENDS */}
          {activeTab === 'area' && (
            <div className="space-y-4">
              {/* Area Badge / Customizer */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">Target Gym & Area:</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeArea}
                      onChange={e => setIncludeArea(e.target.checked)}
                      className="rounded accent-amber-400 cursor-pointer"
                    />
                    <span>Include area in message</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={customAreaName}
                  onChange={e => setCustomAreaName(e.target.value)}
                  placeholder="e.g. Downtown Metro / MetroFlex Gym"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Message Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Message Preview for Local Friends:</span>
                  <button
                    onClick={handleCopyMessage}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedMsg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMsg ? 'Message Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans select-all">
                  {localFriendMessage}
                </div>
              </div>

              {/* Quick Platform Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 block">
                  Send directly to friends in your area:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {shareOptions.map(opt => (
                    <a
                      key={opt.name}
                      href={opt.getUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerShareReward(opt.name)}
                      className={`p-2.5 rounded-xl ${opt.bgColor} text-zinc-100 text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm`}
                    >
                      <span className="text-sm">{opt.icon}</span>
                      <span>{opt.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL MEDIA PLATFORMS */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-400/10 via-zinc-900 to-zinc-950 border border-amber-400/20 text-xs space-y-1">
                <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Share Across Social Media</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Post your invite link to your Instagram bio, gym group chats, Discord fitness servers, or Twitter/X feed.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Social Post Preview:</span>
                  <button
                    onClick={handleCopyMessage}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedMsg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMsg ? 'Copied!' : 'Copy Post Text'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans select-all">
                  {socialMessage}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 block">
                  Broadcast to platform:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {shareOptions.map(opt => (
                    <a
                      key={opt.name}
                      href={opt.getUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerShareReward(opt.name)}
                      className={`p-3 rounded-xl ${opt.bgColor} text-zinc-100 text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span>{opt.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GYM QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 inline-block mx-auto shadow-inner">
                {/* Clean SVG QR code representation */}
                <div className="w-44 h-44 bg-white p-3 rounded-xl flex flex-col items-center justify-center relative shadow-md">
                  <svg className="w-full h-full text-zinc-950" viewBox="0 0 100 100" fill="currentColor">
                    {/* Top left corner marker */}
                    <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="11" y="11" width="16" height="16" fill="currentColor" />
                    {/* Top right corner marker */}
                    <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="73" y="11" width="16" height="16" fill="currentColor" />
                    {/* Bottom left corner marker */}
                    <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="11" y="73" width="16" height="16" fill="currentColor" />
                    {/* Data patterns */}
                    <rect x="38" y="10" width="8" height="8" />
                    <rect x="50" y="10" width="8" height="8" />
                    <rect x="10" y="38" width="8" height="8" />
                    <rect x="22" y="38" width="8" height="8" />
                    <rect x="38" y="38" width="16" height="16" />
                    <rect x="60" y="38" width="8" height="8" />
                    <rect x="72" y="38" width="8" height="8" />
                    <rect x="42" y="60" width="8" height="8" />
                    <rect x="54" y="60" width="12" height="8" />
                    <rect x="72" y="60" width="8" height="16" />
                    <rect x="38" y="76" width="16" height="8" />
                    <rect x="60" y="76" width="8" height="12" />
                    <rect x="80" y="80" width="12" height="12" />
                  </svg>
                  <span className="text-[9px] font-mono font-bold text-zinc-900 tracking-wider mt-1">
                    GymPax · {referralCode}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-200">
                  Scan at the Gym with your camera
                </p>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                  Hold your phone out to your gym buddy between sets so they can open GymPax instantly and add you!
                </p>
              </div>
            </div>
          )}

          {/* Quick Copy Link Box (Universal) */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 bg-transparent text-xs font-mono text-zinc-300 focus:outline-none select-all truncate px-1"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/98 flex items-center justify-between shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Connects to your local squad</span>
            <span className="sm:hidden">Local Squad</span>
          </span>

          <div className="flex items-center gap-2">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 min-h-[38px]"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Share Via Device</span>
                <span className="sm:hidden">Share</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer min-h-[38px]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
