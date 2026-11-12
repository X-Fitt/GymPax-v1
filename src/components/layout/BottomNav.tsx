import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  CalendarRange,
  TrendingUp,
  Users
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const renderNavItems = (isTopBar: boolean) => (
    <div className="grid grid-cols-5 h-16 items-center max-w-md mx-auto">
      {/* Tab 1: Home */}
      <button
        type="button"
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center h-full py-1 cursor-pointer transition-all active:scale-95 ${
          currentTab === 'dashboard'
            ? 'text-amber-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 transition-transform ${currentTab === 'dashboard' ? 'scale-110 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight mt-1 font-sans">Home</span>
      </button>

      {/* Tab 2: Plans */}
      <button
        type="button"
        onClick={() => onTabChange('plans')}
        className={`flex flex-col items-center justify-center h-full py-1 cursor-pointer transition-all active:scale-95 ${
          currentTab === 'plans'
            ? 'text-amber-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <CalendarRange className={`w-5 h-5 transition-transform ${currentTab === 'plans' ? 'scale-110 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight mt-1 font-sans">Plans</span>
      </button>

      {/* Tab 3: Center Elevated Workout Hero Action */}
      <div className={`flex items-center justify-center ${isTopBar ? '' : '-mt-4'}`}>
        <button
          type="button"
          onClick={() => onTabChange('workout')}
          title="Launch Workout Session"
          aria-label="Launch Workout Session"
          className={`${isTopBar ? 'w-12 h-12' : 'w-13 h-13'} rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer border ${
            currentTab === 'workout'
              ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 border-amber-300/80 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
              : 'bg-zinc-900 hover:bg-zinc-850 text-amber-400 border-zinc-700/80 shadow-[0_4px_16px_rgba(0,0,0,0.6)]'
          }`}
        >
          <Dumbbell className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Tab 4: Progress */}
      <button
        type="button"
        onClick={() => onTabChange('progress')}
        className={`flex flex-col items-center justify-center h-full py-1 cursor-pointer transition-all active:scale-95 ${
          currentTab === 'progress'
            ? 'text-amber-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <TrendingUp className={`w-5 h-5 transition-transform ${currentTab === 'progress' ? 'scale-110 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight mt-1 font-sans">Progress</span>
      </button>

      {/* Tab 5: Social (Athlete Community & IronFeed) */}
      <button
        type="button"
        onClick={() => onTabChange('community')}
        className={`flex flex-col items-center justify-center h-full py-1 cursor-pointer transition-all active:scale-95 ${
          currentTab === 'community'
            ? 'text-amber-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Users className={`w-5 h-5 transition-transform ${currentTab === 'community' ? 'scale-110 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight mt-1 font-sans">Social</span>
      </button>
    </div>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.7)] select-none">
      {renderNavItems(false)}
    </nav>
  );
};
