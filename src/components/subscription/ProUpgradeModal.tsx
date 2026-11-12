import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  BookOpen,
  TrendingUp,
  Trophy,
  ShieldCheck,
  CreditCard,
  Clock,
  Info,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { UserSubscription } from '../../types';

interface ProUpgradeModalProps {
  subscription: UserSubscription;
  onUpdateSubscription: (sub: UserSubscription) => void;
  onClose: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  subscription,
  onUpdateSubscription,
  onClose
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [showDowngradePopup, setShowDowngradePopup] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const perks = [
    {
      title: 'All Pro Training Programs & Splits',
      badge: 'Pro Splits',
      desc: 'Unlock all Pro training Programs & Splits. No more limits on your training goals.'
    },
    {
      title: 'Unlimited Personal & Downloaded Programs',
      badge: 'Free: 5 Max → Unlimited',
      desc: 'Build unlimited personalized multi-day splits and save unlimited shared programs from community lifters.'
    },
    {
      title: 'Unlimited Monthly Community Challenges',
      badge: 'Free: 3 Max → Unlimited',
      desc: 'Join unlimited monthly challenges at once to stack +10 Rank Point finishers and milestone badges.'
    },
    {
      title: 'Unlimited Custom Workouts & Exercises',
      badge: 'Free: 5 Each → Unlimited',
      desc: 'Create unlimited custom workouts and add unlimited custom exercises with your own photos and form cues.'
    },
    {
      title: 'Unlimited Streak Freeze Shields',
      badge: 'Free: 1/2 Mo → Unlimited',
      desc: 'Protect your active streak and Rank Points on rest or travel days—zero -2 pts/day inactivity penalties.'
    },
    {
      title: '50-Photo Vault & HD 1440p Uploads',
      badge: 'Free: 10 Max → 50 HD',
      desc: 'Store up to 50 transformation & physique photos (5× Free limit) with crisp 1440p HD upload quality.'
    },
    {
      title: 'Verified PRO Athlete Badge',
      badge: 'PRO Crown',
      desc: 'Display the gold PRO badge across your profile, shared workout plans, progress milestones, and photo showcases.'
    }
  ];

  const isYearly = subscription.plan === 'yearly';
  const isLifetime = subscription.plan === 'lifetime';

  // Compute effective date when the last payment cycle is complete (1 year for annual, 1 month for monthly)
  const getCycleEndDate = () => {
    if (subscription.downgradeEffectiveDate) {
      try {
        const d = new Date(subscription.downgradeEffectiveDate);
        if (!isNaN(d.getTime())) return d;
      } catch {}
    }
    if (subscription.renewsAt) {
      try {
        const d = new Date(subscription.renewsAt);
        if (!isNaN(d.getTime())) return d;
      } catch {}
    }
    const d = new Date();
    if (isYearly) {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d;
  };

  const cycleEndDate = getCycleEndDate();
  const formattedCycleEndDate = cycleEndDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      const renewDate = new Date();
      if (billingPeriod === 'yearly') {
        renewDate.setFullYear(renewDate.getFullYear() + 1);
      } else if (billingPeriod === 'monthly') {
        renewDate.setMonth(renewDate.getMonth() + 1);
      }
      const updated: UserSubscription = {
        isPro: true,
        plan: billingPeriod,
        renewsAt: billingPeriod === 'lifetime' ? undefined : renewDate.toISOString().split('T')[0],
        cancelAtPeriodEnd: false,
        downgradeEffectiveDate: undefined
      };
      onUpdateSubscription(updated);
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 900);
  };

  const handleConfirmScheduledDowngrade = () => {
    const effectiveDateStr = cycleEndDate.toISOString().split('T')[0];
    const updated: UserSubscription = {
      ...subscription,
      isPro: true, // Pro privileges remain active until current payment cycle completes
      cancelAtPeriodEnd: true,
      downgradeEffectiveDate: effectiveDateStr
    };
    onUpdateSubscription(updated);
    setShowDowngradePopup(false);
  };

  const handleConfirmImmediateDowngrade = () => {
    const updated: UserSubscription = {
      isPro: false,
      plan: 'free',
      cancelAtPeriodEnd: false,
      downgradeEffectiveDate: undefined
    };
    onUpdateSubscription(updated);
    setShowDowngradePopup(false);
    onClose();
  };

  const handleResumePro = () => {
    const updated: UserSubscription = {
      ...subscription,
      cancelAtPeriodEnd: false,
      downgradeEffectiveDate: undefined
    };
    onUpdateSubscription(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] text-zinc-100 relative overflow-hidden">
        {/* Decorative subtle background aura */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pinned Header with Highly Visible Exit Button */}
        <div className="shrink-0 px-5 sm:px-7 py-4 border-b border-zinc-800/90 flex items-center justify-between gap-3 bg-zinc-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display uppercase tracking-wider text-zinc-100">
                  GYMPAX PRO
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  ALL-ACCESS
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">All Workout Plans & Elite Features Included</p>
            </div>
          </div>

          {/* Primary Exit Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
            aria-label="Exit Pro Plan modal"
            title="Exit and return to app"
          >
            <span>Exit</span>
            <X className="w-4 h-4 text-zinc-400 hover:text-white" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-4 scrollbar-thin">
          {subscription.isPro ? (
            /* Active Pro Management */
            <div className="space-y-4 py-1">
              {subscription.cancelAtPeriodEnd ? (
                /* Scheduled Downgrade Notice Card */
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                      Downgrade Scheduled
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      Ends: {formattedCycleEndDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Pro Access Active Until Cycle Completes
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Your downgrade will take effect after your current <strong className="text-amber-300">{isYearly ? 'one-year' : 'one-month'}</strong> payment cycle completes on <strong className="text-zinc-100">{formattedCycleEndDate}</strong>. You continue to have full access to all masterclasses and Pro features until that date. No further charges will occur.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResumePro}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                    >
                      Keep / Resume Pro Membership
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Active Pro Card */
                <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/40 text-center space-y-1">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Active Subscription
                  </span>
                  <h3 className="text-lg font-extrabold text-zinc-100">
                    You are a Pro Member
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isLifetime
                      ? 'Plan: Pro Lifetime ($69.99 one-time) · Lifetime All-Access'
                      : `Last Payment: ${
                          isYearly
                            ? 'Pro Yearly ($22.99/yr · Saving 35%)'
                            : 'Pro Monthly ($2.99/mo)'
                        } · Cycle ends: ${formattedCycleEndDate}`}
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-1">
                {!subscription.cancelAtPeriodEnd && !isLifetime && (
                  <button
                    type="button"
                    onClick={() => setShowDowngradePopup(true)}
                    className="w-full py-2.5 rounded-xl bg-zinc-850 hover:bg-red-500/20 hover:text-red-300 text-zinc-400 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Downgrade to Free Tier
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Upgrade Flow */
            <>
              {/* Billing Options Selector: Pro Monthly $2.99, Pro Yearly $22.99 (Saving 35%), Pro Lifetime $69.99 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Pro Monthly Card */}
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    billingPeriod === 'monthly'
                      ? 'bg-zinc-800/90 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-zinc-200">
                        Pro Monthly
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        billingPeriod === 'monthly'
                          ? 'border-amber-400 bg-amber-400 text-zinc-950'
                          : 'border-zinc-700'
                      }`}>
                        {billingPeriod === 'monthly' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                      </div>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-black text-zinc-100">$2.99</span>
                      <span className="text-[11px] text-zinc-400 font-semibold">/ mo</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1.5 leading-snug">
                    Billed monthly · Cancel anytime
                  </p>
                </button>

                {/* Pro Yearly Card (Saving 35%) */}
                <button
                  type="button"
                  onClick={() => setBillingPeriod('yearly')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    billingPeriod === 'yearly'
                      ? 'bg-amber-400/10 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="absolute -top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black font-mono text-[9px] uppercase tracking-wider shadow-sm">
                    SAVING 35%
                  </div>
                  <div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-amber-400 shrink-0" />
                        <span>Pro Yearly</span>
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        billingPeriod === 'yearly'
                          ? 'border-amber-400 bg-amber-400 text-zinc-950'
                          : 'border-zinc-700'
                      }`}>
                        {billingPeriod === 'yearly' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                      </div>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1 flex-wrap">
                      <span className="font-mono text-2xl font-black text-amber-400">$22.99</span>
                      <span className="text-[11px] text-zinc-300 font-semibold">/ yr</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-300/90 mt-1.5 font-mono font-medium leading-snug">
                    Billed annually · Saving 35% (~$1.92/mo)
                  </p>
                </button>

                {/* Pro Lifetime Card */}
                <button
                  type="button"
                  onClick={() => setBillingPeriod('lifetime')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    billingPeriod === 'lifetime'
                      ? 'bg-zinc-800/90 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="absolute -top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black font-mono text-[9px] uppercase tracking-wider shadow-sm">
                    ONE-TIME
                  </div>
                  <div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Pro Lifetime</span>
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        billingPeriod === 'lifetime'
                          ? 'border-amber-400 bg-amber-400 text-zinc-950'
                          : 'border-zinc-700'
                      }`}>
                        {billingPeriod === 'lifetime' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                      </div>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-black text-zinc-100">$69.99</span>
                      <span className="text-[11px] text-zinc-400 font-semibold">once</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1.5 leading-snug">
                    Pay once · Lifetime Pro access forever
                  </p>
                </button>
              </div>

              {/* Price Headline Summary */}
              <div className="text-center py-2.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-3">
                <div className="flex items-baseline justify-center gap-2 flex-wrap">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-100">
                    {billingPeriod === 'yearly'
                      ? '$22.99'
                      : billingPeriod === 'lifetime'
                      ? '$69.99'
                      : '$2.99'}
                  </span>
                  <span className="text-xs text-zinc-300 font-semibold">
                    {billingPeriod === 'yearly'
                      ? '/ year · Saving 35% (billed annually)'
                      : billingPeriod === 'lifetime'
                      ? 'one-time payment · Lifetime Pro'
                      : '/ month (billed monthly)'}
                  </span>
                </div>
              </div>

              {/* Perks List */}
              <div className="space-y-3 bg-zinc-950/60 p-3.5 sm:p-4 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    Pro Member Benefits
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wide">
                    Free vs. Pro Unlocked
                  </span>
                </div>
                <div className="space-y-2.5">
                  {perks.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 pb-2.5 last:pb-0 border-b border-zinc-900 last:border-b-0"
                    >
                      <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-zinc-100">{p.title}</h4>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/25 shrink-0">
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pinned Bottom Actions: Always Visible Proceed to Payment & Cancel Buttons */}
        {!subscription.isPro && (
          <div className="shrink-0 px-5 sm:px-7 py-3.5 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm space-y-2 z-10">
            {/* Primary CTA: Proceed to Payment */}
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isProcessing || success}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : success ? (
                <span>Payment Confirmed! Welcome to Pro 🎉</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 fill-current shrink-0" />
                  <span>
                    Proceed to Payment ·{' '}
                    {billingPeriod === 'yearly'
                      ? '$22.99 / year (Save 35%)'
                      : billingPeriod === 'lifetime'
                      ? '$69.99 Lifetime'
                      : '$2.99 / month'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>

            {/* Secondary CTA: Cancel Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-zinc-700/80 text-center flex items-center justify-center gap-1.5"
                title="Cancel and return to app"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel / Return to Free Tier</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulated Secure Sandbox Checkout · Cancel Anytime</span>
            </div>
          </div>
        )}

        {/* Downgrade Cycle Confirmation Popup Window */}
        {showDowngradePopup && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
            onClick={e => {
              if (e.target === e.currentTarget) setShowDowngradePopup(false);
            }}
          >
            <div
              className="w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 relative overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">
                      Downgrade Notice
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Payment cycle completion policy
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDowngradePopup(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors cursor-pointer"
                  title="Close notice"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Policy Alert Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs text-zinc-200 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Cycle Completion Terms</span>
                </div>
                <p>
                  Please note: your downgrade <strong className="text-amber-300">will only take effect after your last payment cycle is complete</strong> ({isYearly ? 'after one year' : 'after one month'}), depending on your last payment method.
                </p>
              </div>

              {/* Breakdown Details Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Last Payment Method</span>
                  <span className="font-semibold text-zinc-100">
                    {isYearly ? 'Pro Yearly ($22.99/year · Saving 35%)' : 'Pro Monthly ($2.99/month)'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Payment Cycle Length</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {isYearly ? '1 Year (Annual Cycle)' : '1 Month (Monthly Cycle)'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Downgrade Effective Date</span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    {formattedCycleEndDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Future Automatic Billing</span>
                  <span className="text-emerald-400 font-medium">Cancelled ($0.00)</span>
                </div>
              </div>

              {/* Retained Features Explanation */}
              <div className="text-[11px] text-zinc-400 space-y-1.5 px-1">
                <p className="font-semibold text-zinc-300">
                  Until your {isYearly ? 'one-year' : 'one-month'} cycle finishes on {formattedCycleEndDate}:
                </p>
                <div className="space-y-1 pl-1">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>All 15 Pro workout plans, unlimited programs, challenges, streak shields & 50-photo vault remain active</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>No surprise renewal charges or automatic deductions</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmScheduledDowngrade}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-98"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm Downgrade After Cycle Completes</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDowngradePopup(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Keep Pro Membership
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImmediateDowngrade}
                    className="py-2.5 px-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 text-[11px] font-medium cursor-pointer transition-colors"
                    title="Forfeit remaining paid days and switch to Free Tier immediately"
                  >
                    Downgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
