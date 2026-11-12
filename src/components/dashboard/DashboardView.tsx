import React, { useState } from 'react';
import {
  CalendarRange,
  TrendingUp,
  Users,
  Dumbbell,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Crown,
  ArrowRight,
  X,
  Check,
  Zap,
  Flame,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Settings
} from 'lucide-react';
import {
  UserProfile,
  UserSubscription,
  WorkoutPlan,
  DailyWorkoutRoutine,
  ActiveWorkout,
  PersonalRecord,
  RewardsProfile,
  EquipmentEnvironment
} from '../../types';
import { adaptRoutineForEnvironment } from '../../data/equipmentEnvironments';

export interface DashboardViewProps {
  userProfile?: UserProfile | null;
  subscription: UserSubscription;
  onOpenProModal: () => void;
  onNavigate: (tab: string) => void;
  workoutHistory: ActiveWorkout[];
  activePlan: WorkoutPlan;
  personalRecords: PersonalRecord[];
  rewardsProfile?: RewardsProfile;
  currentEnvironment: EquipmentEnvironment;
  onOpenEquipmentModal: () => void;
  onOpenLibrary: () => void;
  onOpenProfileModal: () => void;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  unit: 'kg' | 'lbs';
  activeDraft?: ActiveWorkout | null;
  onStartRoutine?: (routine: DailyWorkoutRoutine) => void;
  onResumeDraft?: () => void;
}

interface OptionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  meta: string;
  icon: React.ElementType;
  accentColor: string;
  tabTarget?: string;
  action?: () => void;
  explainer: {
    title: string;
    summary: string;
    bullets: string[];
    actionLabel: string;
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  subscription,
  onOpenProModal,
  onNavigate,
  workoutHistory,
  activePlan,
  personalRecords,
  rewardsProfile,
  currentEnvironment,
  onOpenEquipmentModal,
  onOpenLibrary,
  onOpenProfileModal: _onOpenProfileModal,
  onUpdateUserProfile: _onUpdateUserProfile,
  unit: _unit,
  activeDraft,
  onStartRoutine,
  onResumeDraft
}) => {
  const [activeExplainer, setActiveExplainer] = useState<OptionItem | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const formatEnvironmentLabel = (env: string) => {
    switch (env) {
      case 'commercial_gym':
        return 'Commercial Gym';
      case 'home_gym':
        return 'Home Gym';
      case 'free_weights_only':
        return 'Free Weights';
      case 'dumbbell_only':
        return 'Dumbbells Only';
      case 'kettlebell_only':
        return 'Kettlebell Only';
      case 'bodyweight_travel':
        return 'Bodyweight';
      default:
        return 'Gym';
    }
  };

  const isPro = subscription.isPro;

  // Resolve today's routine from active plan adapted to current equipment
  const rawTodayRoutine = activePlan.routines?.[0] || {
    dayName: 'Full Body A',
    focus: 'Hypertrophy & Strength',
    exercises: []
  };
  const todaysRoutine = adaptRoutineForEnvironment(rawTodayRoutine, currentEnvironment);

  const options: OptionItem[] = [
    {
      id: 'plans',
      title: 'Workout Plans',
      category: 'Training',
      description: 'Custom training splits, periodization programs & automatic gym adaptations.',
      meta: `${activePlan.routines.length} Splits · ${activePlan.title}`,
      icon: CalendarRange,
      accentColor: 'text-amber-400',
      tabTarget: 'plans',
      explainer: {
        title: 'Workout Plans & Periodization',
        summary:
          'Workout Plans allows you to browse, customize, and switch your complete training system. Tailored for your split frequency, experience level, and available gym equipment.',
        bullets: [
          'Choose from Push/Pull/Legs, Upper/Lower, Full Body, and Arnold Splits',
          'AI-powered routine generator adapting to your schedule and goals',
          'Dynamically adapts all sets and exercises to your gym environment'
        ],
        actionLabel: 'Explore Workout Plans'
      }
    },
    {
      id: 'workout',
      title: 'My Workouts',
      category: 'Execution',
      description: 'Start today’s programmed routine, launch an empty session, or resume your draft.',
      meta: 'Rest Timers · Plate Loader · Logging',
      icon: Dumbbell,
      accentColor: 'text-emerald-400',
      tabTarget: 'workout',
      explainer: {
        title: 'Live Workout Session Hub',
        summary:
          'Your active training floor companion. Record completed sets, reps, and RPE with automated rest timers and barbell plate calculations.',
        bullets: [
          'Live set logging with smart previous-performance weight suggestions',
          'Automatic rest timer with fanfare notifications upon completion',
          'Barbell plate loading calculator for kg and lbs collars'
        ],
        actionLabel: 'Go to Workout Hub'
      }
    },
    {
      id: 'progress',
      title: 'Progress & PRs',
      category: 'Analytics',
      description: 'Track all-time 1RM personal records, body measurements, volume & strength trends.',
      meta: `${personalRecords.length} PRs · ${workoutHistory.length} Sessions`,
      icon: TrendingUp,
      accentColor: 'text-blue-400',
      tabTarget: 'progress',
      explainer: {
        title: 'Progress & Strength Analytics',
        summary:
          'Analyze your long-term progression. Track progressive overload trends across lifts, monitor 1RM projections, and log physical body measurements.',
        bullets: [
          'All-time Personal Record (PR) hall of fame with date & volume stamps',
          'One-Rep-Max (1RM) calculator based on Brzycki and Epley equations',
          'Body composition tracking (weight, waist, arms, chest, thighs)'
        ],
        actionLabel: 'View Analytics'
      }
    },
    {
      id: 'community',
      title: 'Social Feed',
      category: 'Community',
      description: 'Connect with nearby lifters, share physique photos & celebrate achievements.',
      meta: 'IronFeed · Photo Vault · Cheers',
      icon: Users,
      accentColor: 'text-purple-400',
      tabTarget: 'community',
      explainer: {
        title: 'IronFeed Athlete Community',
        summary:
          'A dedicated social environment for serious trainees. Share workout achievements, browse athlete photo timelines, and discover athletes training near you.',
        bullets: [
          'Post workout summaries with attached pump and physique photos',
          'Control photo visibility: share to community feed or save to private vault',
          'Before & After comparison showcase to track physical progress'
        ],
        actionLabel: 'Enter Community'
      }
    },
    {
      id: 'calendar',
      title: 'Calendar',
      category: 'History',
      description: 'Monthly training heatmaps, workout frequency & one-tap historical session repeat.',
      meta: 'Heatmap · Past Sessions',
      icon: Calendar,
      accentColor: 'text-yellow-400',
      tabTarget: 'calendar',
      explainer: {
        title: 'Workout History Calendar',
        summary:
          'Visual matrix showing every day you stepped onto the gym floor. Review past workout volumes and quickly repeat any previous session.',
        bullets: [
          'Monthly calendar view displaying workout consistency and rest days',
          'Detailed inspection of all completed exercises, sets, and weights',
          'Instant 1-tap re-launch of any historical workout as today’s session'
        ],
        actionLabel: 'Open Calendar'
      }
    },
    {
      id: 'library',
      title: 'Exercises',
      category: 'Directory',
      description: 'Explore 150+ categorized exercises with target muscle anatomy and coaching cues.',
      meta: '150+ Exercises · Cues & Form',
      icon: Sparkles,
      accentColor: 'text-sky-400',
      action: onOpenLibrary,
      explainer: {
        title: 'Exercise Library & Coaching Cues',
        summary:
          'Comprehensive exercise index categorized by primary muscle, secondary muscles, and equipment type.',
        bullets: [
          'Detailed step-by-step coaching cues for optimal biomechanical tension',
          'Filter by equipment (Barbell, Dumbbell, Cable, Machine, Bodyweight)',
          'Filter by target muscle groups (Chest, Back, Quads, Hamstrings, Delts)'
        ],
        actionLabel: 'Browse Exercises'
      }
    }
  ];

  const handleSelectOption = (item: OptionItem) => {
    setSelectedCardId(item.id);
    if (item.action) {
      item.action();
    } else if (item.tabTarget) {
      onNavigate(item.tabTarget);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-2 sm:pt-4 pb-4 sm:pb-6 space-y-3 sm:space-y-4 animate-in fade-in duration-200">

      {/* 2. Today's Lift Action (Minimized to only Start today's workout and View Hub) */}
      <section className="p-2 sm:p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2">
        {activeDraft ? (
          <button
            type="button"
            onClick={() => {
              if (onResumeDraft) onResumeDraft();
              else onNavigate('workout');
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Resume Workout</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onStartRoutine) onStartRoutine(todaysRoutine);
              else onNavigate('workout');
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-transform"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Today&apos;s Workout</span>
          </button>
        )}
      </section>



      {/* 3. Navigation Sections: Clean Icon & Title Cards with Spacious Mobile Grid */}
      <section className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {options.map((item, index) => {
            const Icon = item.icon;
            const isLastOdd = index === options.length - 1 && options.length % 2 !== 0;
            const isWorkoutPlansCard = item.id === 'plans';
            const isWorkoutHubCard = item.id === 'workout';
            const isProgressCard = item.id === 'progress';
            const isCommunityCard = item.id === 'community';
            const isCalendarCard = item.id === 'calendar';
            const isLibraryCard = item.id === 'library';
            const hasImageBackground =
              isWorkoutPlansCard ||
              isWorkoutHubCard ||
              isProgressCard ||
              isCommunityCard ||
              isCalendarCard ||
              isLibraryCard;
            const isSelected = selectedCardId === item.id;

            const cardImageSrc = isWorkoutPlansCard
              ? '/assets/aistudio/Smiling_Athletic_Man_Cutout_3a08d6f8.webp'
              : isWorkoutHubCard
              ? '/assets/aistudio/Calendar1_3197b451.webp'
              : isProgressCard
              ? '/assets/aistudio/Progress1_ccd299a2.webp'
              : isCommunityCard
              ? '/assets/aistudio/1__3__11004b18.webp'
              : isCalendarCard
              ? '/assets/aistudio/1__6__41f414bc.webp'
              : isLibraryCard
              ? '/assets/aistudio/Muscular_Bearded_Man_Curling_Barbell_9d6cbd76.webp'
              : '';

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectOption(item)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectOption(item);
                  }
                }}
                style={
                  hasImageBackground && isSelected
                    ? {
                        background:
                          'radial-gradient(ellipse at center, #F99B5F 0%, #F6721D 45%, #CC5408 80%, #7E2A01 100%)'
                      }
                    : undefined
                }
                className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer flex items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6721D] ${
                  hasImageBackground
                    ? `${
                        isSelected
                          ? 'border-[#F6721D] scale-[1.06] -translate-y-1.5 z-20 shadow-[0_16px_34px_rgba(246,114,29,0.5)]'
                          : 'bg-[#d4d7dd] border-zinc-400/60 scale-100 z-10 shadow-sm'
                      } hover:border-[#F6721D] active:border-[#F6721D] hover:scale-[1.06] active:scale-[1.06] focus-visible:scale-[1.06] hover:-translate-y-1.5 active:-translate-y-1.5 hover:z-20 active:z-20 hover:shadow-[0_16px_34px_rgba(246,114,29,0.48)] active:shadow-[0_16px_34px_rgba(246,114,29,0.55)] min-h-[170px] sm:min-h-[185px] p-2.5 sm:p-3 justify-end flex-col overflow-hidden`
                    : `bg-zinc-900/70 border-zinc-800/80 active:scale-[0.98] shadow-xs min-h-[105px] sm:min-h-[115px] overflow-hidden hover:border-[#F6721D] hover:bg-zinc-850/80 p-4 sm:p-5 justify-center ${
                        isLastOdd
                          ? 'col-span-2 sm:col-span-1 flex-row sm:flex-col gap-3.5 sm:gap-2.5'
                          : 'flex-col gap-2.5 sm:gap-3'
                      }`
                }`}
              >
                {/* Gradual Radial Orange Background Fill on Hover & Select (Theme Color #F6721D) */}
                {hasImageBackground && (
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ease-out ${
                      isSelected
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100'
                    }`}
                    style={{
                      background:
                        'radial-gradient(ellipse at center, #F99B5F 0%, #F6721D 45%, #CC5408 80%, #7E2A01 100%)'
                    }}
                  />
                )}

                {/* Cutout Image for Cards with Image Background (behind the text, filling the card without cropping head/sides) */}
                {hasImageBackground && (
                  <img
                    src={cardImageSrc}
                    alt={item.title}
                    className={`absolute inset-0 z-[1] w-full h-full pointer-events-none select-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)] transition-transform duration-300 ${
                      isCommunityCard
                        ? 'object-contain object-bottom scale-[1.18] origin-bottom group-hover:scale-[1.22]'
                        : 'pt-1 px-1 object-contain object-bottom group-hover:scale-[1.03]'
                    }`}
                  />
                )}

                {/* Section Icon Badge (removed for cards with cutout image background) */}
                {!hasImageBackground && (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-800/80 border border-zinc-750/70 group-hover:border-amber-400/40 group-hover:bg-amber-400/10 flex items-center justify-center transition-all duration-200 group-hover:scale-105 shrink-0">
                    <Icon className={`w-5 h-5 ${item.accentColor} group-hover:text-amber-400 transition-colors`} />
                  </div>
                )}

                {/* Section Title */}
                <span
                  className={`font-display font-bold text-xs sm:text-sm tracking-tight leading-snug select-none text-center ${
                    hasImageBackground
                      ? 'relative z-10 text-white group-hover:text-amber-200 bg-zinc-950/75 group-hover:bg-zinc-950/85 backdrop-blur-[2px] px-3 py-1 rounded-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]'
                      : 'text-zinc-100 group-hover:text-amber-300'
                  }`}
                >
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Explainer Modal Dialog (Touch-Friendly Bottom Sheet / Modal) */}
      {activeExplainer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setActiveExplainer(null)}
        >
          <div
            className="w-full sm:max-w-md bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-zinc-100 relative max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Handle for mobile */}
            <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                  <activeExplainer.icon className={`w-5 h-5 ${activeExplainer.accentColor}`} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                    Feature Detail
                  </span>
                  <h3 className="text-base font-bold text-zinc-100 font-display">
                    {activeExplainer.explainer.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveExplainer(null)}
                aria-label="Close explainer"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {activeExplainer.explainer.summary}
              </p>

              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  Key Capabilities:
                </span>
                <ul className="space-y-1.5">
                  {activeExplainer.explainer.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-normal">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions (Touch targets >= 44px) */}
            <div className="pt-3 border-t border-zinc-850 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = activeExplainer;
                  setActiveExplainer(null);
                  handleSelectOption(target);
                }}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase font-mono tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <span>{activeExplainer.explainer.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveExplainer(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
