import React, { useState } from 'react';
import { MemberAccount } from '../../types';
import { RegisterModal } from '../auth/RegisterModal';

interface FrontPageViewProps {
  onGetStarted: () => void;
  onLogin: (email: string, name?: string) => void;
  onExploreGuest?: () => void;
  onRegisterSuccess?: (account: MemberAccount) => void;
}

export const FrontPageView: React.FC<FrontPageViewProps> = ({
  onGetStarted,
  onLogin,
  onExploreGuest,
  onRegisterSuccess
}) => {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'login'>('login');

  const handleOpenRegister = () => {
    setAuthModalTab('register');
    setShowAuthModal(true);
  };

  const handleOpenLogin = () => {
    setAuthModalTab('login');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (account: MemberAccount) => {
    setShowAuthModal(false);
    if (onRegisterSuccess) {
      onRegisterSuccess(account);
    } else {
      onLogin(account.email, account.name);
    }
  };

  return (
    <div
      data-surface="dark"
      className="fixed inset-0 z-50 w-full h-full flex flex-col items-center justify-center font-sans overflow-y-auto py-8 px-4 dark-surface"
      style={{
        backgroundColor: '#070709',
        backgroundImage: `
          radial-gradient(ellipse at 50% 42%, rgba(246, 114, 29, 0.16) 0%, transparent 62%),
          linear-gradient(45deg, #101014 25%, transparent 25%),
          linear-gradient(-45deg, #101014 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #101014 75%),
          linear-gradient(-45deg, transparent 75%, #101014 75%)
        `,
        backgroundSize: '100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px',
        backgroundPosition: '0 0, 0 0, 0 4px, 4px -4px, -4px 0px'
      }}
    >
      {/* Aerodynamic Carbon Ribbon - Top Left */}
      <svg
        className="absolute -top-10 -left-10 w-64 sm:w-96 h-64 sm:h-96 pointer-events-none select-none opacity-20 z-0"
        viewBox="0 0 300 300"
        fill="none"
      >
        <defs>
          <linearGradient id="ribbonTL" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a1a20" />
            <stop offset="60%" stopColor="#121216" />
            <stop offset="100%" stopColor="#070709" />
          </linearGradient>
          <filter id="glowTL" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M-40,-40 C40,0 110,60 145,160 C165,220 150,265 110,310 L-40,310 Z"
          fill="url(#ribbonTL)"
        />
        <path
          d="M-20,-30 C55,10 120,70 155,165 C175,225 160,270 120,315"
          stroke="#F6721D"
          strokeWidth="2.5"
          strokeOpacity="0.9"
          filter="url(#glowTL)"
        />
      </svg>

      {/* Aerodynamic Carbon Ribbon - Bottom Right */}
      <svg
        className="absolute -bottom-10 -right-10 w-64 sm:w-96 h-64 sm:h-96 pointer-events-none select-none opacity-20 z-0"
        viewBox="0 0 300 300"
        fill="none"
      >
        <defs>
          <linearGradient id="ribbonBR" x1="300" y1="300" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a1a20" />
            <stop offset="60%" stopColor="#121216" />
            <stop offset="100%" stopColor="#070709" />
          </linearGradient>
          <filter id="glowBR" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M340,340 C260,300 190,240 155,140 C135,80 150,35 190,-10 L340,-10 Z"
          fill="url(#ribbonBR)"
        />
        <path
          d="M320,330 C245,290 180,230 145,135 C125,75 140,30 180,-15"
          stroke="#F6721D"
          strokeWidth="2.5"
          strokeOpacity="0.9"
          filter="url(#glowBR)"
        />
      </svg>

      {/* Center Hero Card directly matching 3.jpg */}
      <div className="relative z-20 w-full max-w-sm px-6 flex flex-col items-center text-center">
        {/* 3D Barbell + GP Monogram Logo */}
        <div
          onClick={onExploreGuest || onGetStarted}
          className="relative mb-6 cursor-pointer group focus:outline-none"
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (onExploreGuest) onExploreGuest();
              else onGetStarted();
            }
          }}
        >
          <img
            src="/assets/aistudio/5_eca6fdc9.webp"
            alt="GymPax"
            className="relative w-56 sm:w-64 h-auto object-contain mx-auto bg-transparent drop-shadow-[0_8px_18px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Primary Action Button: GET STARTED */}
        <div className="w-full space-y-3.5 max-w-[280px] sm:max-w-[300px]">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#F6721D] hover:bg-[#ff7e2e] text-white font-extrabold uppercase text-xs sm:text-sm tracking-[0.18em] shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center border border-amber-300/30"
          >
            GET STARTED
          </button>

          {/* Under-Button Auth Links: Log In · Register (Pure text links, no button frames) */}
          <div className="flex items-center justify-center gap-2 pt-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={handleOpenLogin}
              className="bg-transparent border-0 p-0 font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer hover:underline underline-offset-4 focus:outline-none"
            >
              Log In
            </button>
            <span className="text-zinc-600 select-none" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleOpenRegister}
              className="bg-transparent border-0 p-0 font-semibold text-[#F6721D] hover:text-amber-400 transition-colors cursor-pointer hover:underline underline-offset-4 focus:outline-none"
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal (Register & Login) */}
      <RegisterModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab={authModalTab}
        onSuccess={handleAuthSuccess}
        onEnterGuestLater={onExploreGuest}
      />
    </div>
  );
};
