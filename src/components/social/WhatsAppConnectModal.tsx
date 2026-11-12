import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MessageCircle,
  Phone,
  PhoneCall,
  Video,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Dumbbell,
  Sparkles,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NearbyAthlete } from '../../types';
import { GymAvatar } from '../common/GymAvatar';

interface WhatsAppConnectModalProps {
  athlete: NearbyAthlete | null;
  isOpen?: boolean;
  initialTab?: 'message' | 'call';
  onClose: () => void;
  onUpdatePhone?: (athleteId: string, newPhone: string) => void;
}

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({
  athlete,
  isOpen = true,
  initialTab = 'message',
  onClose,
  onUpdatePhone
}) => {
  if (!isOpen || !athlete) return null;

  const [activeTab, setActiveTab] = useState<'message' | 'call'>(initialTab);
  const [phoneNumber, setPhoneNumber] = useState<string>(
    athlete.whatsappNumber || '+15125550192'
  );
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [tempPhone, setTempPhone] = useState<string>(
    athlete.whatsappNumber || '+15125550192'
  );
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [callInitiated, setCallInitiated] = useState<boolean>(false);

  // Preset greetings
  const PRESET_MESSAGES = [
    `Hey ${athlete.name.split(' ')[0]}! Down to hit a workout session today? 🏋️‍♂️`,
    `Hey! What time are you training today? Need a spotter for heavy sets! 💪`,
    `Great lifting session recently! Keep crushing those PRs 🔥`,
    `Are you hitting Push, Pull, or Legs today? Let's sync workouts!`,
    `Heading to workout in 30 mins! Free for a session? ⏱️`
  ];

  const [customMessage, setCustomMessage] = useState<string>(PRESET_MESSAGES[0]);

  // Clean phone number (strip spaces, dashes, parens, keep only leading + and digits)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  const handleSavePhone = () => {
    if (tempPhone.trim()) {
      setPhoneNumber(tempPhone.trim());
      setIsEditingPhone(false);
      if (onUpdatePhone) {
        onUpdatePhone(athlete.id, tempPhone.trim());
      }
    }
  };

  // Launch WhatsApp Message
  const handleSendWhatsAppMessage = () => {
    const encodedText = encodeURIComponent(customMessage.trim());
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Launch WhatsApp Voice Call
  const handleStartVoiceCall = () => {
    setCallInitiated(true);
    // wa.me URL directs directly to the contact's chat with direct Voice & Video Call buttons
    const waUrl = `https://wa.me/${cleanPhone}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => setCallInitiated(false), 3000);
  };

  // Launch WhatsApp Video Call / App Direct
  const handleStartDirectApp = () => {
    setCallInitiated(true);
    // Try custom protocol for mobile first or fallback to wa.me
    const appProtocol = `whatsapp://send?phone=${cleanPhone}`;
    window.location.href = appProtocol;
    setTimeout(() => {
      window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
      setCallInitiated(false);
    }, 500);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[120] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-zinc-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-zinc-900 border-0 sm:border border-zinc-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] max-h-full sm:my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Cover */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600/20 via-zinc-900 to-zinc-900 border-b border-zinc-800 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative">
              <GymAvatar
                avatarType={athlete.avatarType}
                avatarUrl={athlete.avatarUrl}
                avatarId={athlete.avatarId || athlete.id || athlete.avatarSeed}
                name={athlete.name}
                size="lg"
                fallbackInitials={athlete.name.substring(0, 2)}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-zinc-950 shadow-sm" title="WhatsApp Connected">
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display tracking-tight text-zinc-100">
                  {athlete.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  WhatsApp Contact
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono">
                  {phoneNumber}
                </span>
                <button
                  onClick={() => {
                    setTempPhone(phoneNumber);
                    setIsEditingPhone(prev => !prev);
                  }}
                  className="text-[10px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  {isEditingPhone ? 'Cancel' : 'Edit'}
                </button>
                <span>·</span>
                <button
                  onClick={handleCopyNumber}
                  className="text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer flex items-center gap-0.5"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-0.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{athlete.area}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Inline Phone Edit Drawer */}
        {isEditingPhone && (
          <div className="p-3.5 bg-zinc-950 border-b border-zinc-800 space-y-2">
            <span className="text-xs text-zinc-300 font-medium block">
              Update WhatsApp phone number (with country code):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempPhone}
                onChange={e => setTempPhone(e.target.value)}
                placeholder="+15125550192"
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSavePhone}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs cursor-pointer transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Nav Tabs: Send Message vs Call */}
        <div className="flex border-b border-zinc-800 px-6 pt-2 bg-zinc-950/20">
          <button
            onClick={() => setActiveTab('message')}
            className={`pb-3 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'message'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send WhatsApp Message</span>
          </button>

          <button
            onClick={() => setActiveTab('call')}
            className={`pb-3 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'call'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Call on WhatsApp</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 min-h-0 pb-8">
          {/* TAB 1: SEND MESSAGE */}
          {activeTab === 'message' && (
            <div className="space-y-4">
              {/* Quick Gym Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Workout Greetings</span>
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {PRESET_MESSAGES.map((msg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomMessage(msg)}
                      className={`p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer border ${
                        customMessage === msg
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60'
                      }`}
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Draft Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Message to send:</span>
                  <button
                    onClick={handleCopyMessage}
                    className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Type a custom message for your gym buddy..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400 transition-colors leading-relaxed"
                />
              </div>

              {/* Direct Send WhatsApp Button */}
              <button
                onClick={handleSendWhatsAppMessage}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Open in WhatsApp & Send Message</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <p className="text-[11px] text-zinc-500 text-center">
                Launches your WhatsApp app (or WhatsApp Web on desktop) with the text pre-filled.
              </p>
            </div>
          )}

          {/* TAB 2: CALL ON WHATSAPP */}
          {activeTab === 'call' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-950 border border-emerald-500/20 text-xs space-y-1.5">
                <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Call {athlete.name} Directly via WhatsApp</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Call your gym partner over WhatsApp for a quick workout sync, coordinating gym arrival times, or form check video calls.
                </p>
              </div>

              {/* Call Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Voice Call Card */}
                <button
                  onClick={handleStartVoiceCall}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/60 hover:bg-zinc-900 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      AUDIO
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                      WhatsApp Voice Call
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Sync workout timing & gym meetups over audio.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 pt-1">
                    <span>Start Audio Call</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </button>

                {/* Video Call Card */}
                <button
                  onClick={handleStartDirectApp}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-teal-500/60 hover:bg-zinc-900 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      VIDEO
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-teal-400 transition-colors">
                      WhatsApp Video Call
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Live technique breakdown & form check from anywhere.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1 pt-1">
                    <span>Launch Video Chat</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </button>
              </div>

              {/* Direct Open in WhatsApp Action */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">
                    Direct Contact Number
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {phoneNumber}
                  </span>
                </div>

                <a
                  href={`tel:${cleanPhone}`}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>Standard Phone Dial</span>
                </a>
              </div>

              {callInitiated && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Opening WhatsApp to connect your call with {athlete.name}...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/98 flex items-center justify-between shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>End-to-End Encrypted via WhatsApp</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold cursor-pointer min-h-[40px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
