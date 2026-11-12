import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { MemberAccount } from '../../types';
import {
  registerMemberAccount,
  verifyMemberAccount,
  resendVerificationEmail,
  loginMemberAccount,
  setGuestAccount
} from '../../utils/storage';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'register' | 'login' | 'verify';
  initialEmail?: string;
  onSuccess: (account: MemberAccount) => void;
  onEnterGuestLater?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'register',
  initialEmail = '',
  onSuccess,
  onEnterGuestLater
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'verify' | 'welcome'>(initialTab);

  // Form Fields
  const [name, setName] = useState<string>('Alex Hunter');
  const [email, setEmail] = useState<string>(initialEmail || 'xfitt.mail@gmail.com');
  const [password, setPassword] = useState<string>('GymPaxPro2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [optInDigest, setOptInDigest] = useState<boolean>(true);

  // Verification state
  const [verificationCodeInput, setVerificationCodeInput] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [pendingAccount, setPendingAccount] = useState<MemberAccount | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendSuccessNotice, setResendSuccessNotice] = useState<string>('');

  // Error & Feedback
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showEmailSentPopup, setShowEmailSentPopup] = useState<boolean>(false);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMessage('');
      setResendSuccessNotice('');
    }
  }, [isOpen, initialTab]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Password Strength Calculation (Strava / Whoop style)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const passwordScore = calculatePasswordStrength(password);
  const strengthLabels = ['Too weak', 'Basic', 'Good', 'Strong', 'Ironclad'];
  const strengthColors = ['bg-zinc-700', 'bg-rose-500', 'bg-amber-500', 'bg-lime-400', 'bg-emerald-400'];

  // Handle Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your user name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const { account, code } = registerMemberAccount(email, name, password, optInDigest);
      setPendingAccount(account);
      setGeneratedCode(code);
      setVerificationCodeInput(code); // Pre-fill convenience for user testability while still showing the full verification UX
      setResendCooldown(30);
      setIsSubmitting(false);
      setShowEmailSentPopup(true);
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Failed to register account. Please try again.');
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const account = loginMemberAccount(email, name || 'Alex Hunter', optInDigest);
      setIsSubmitting(false);
      onSuccess(account);
      onClose();
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Could not sign in. Please check credentials.');
    }
  };

  // Handle Verification Confirm
  const handleVerifySubmit = (overrideCode?: string) => {
    const codeToTest = overrideCode || verificationCodeInput;
    if (!codeToTest) {
      setErrorMessage('Please enter the 6-digit confirmation code from your email');
      return;
    }

    setErrorMessage('');
    const res = verifyMemberAccount(codeToTest);
    if (res.success) {
      setPendingAccount(res.account);
      // Move to Welcome Screen showcasing all app features!
      setActiveTab('welcome');
    } else {
      setErrorMessage(res.message || 'Invalid confirmation code. Please check your email.');
    }
  };

  // Resend Email handler
  const handleResendEmail = () => {
    if (resendCooldown > 0) return;
    const res = resendVerificationEmail(email);
    setGeneratedCode(res.code);
    setVerificationCodeInput(res.code);
    setResendCooldown(30);
    setResendSuccessNotice(`A fresh 6-digit code (${res.code}) has been dispatched to ${email}`);
    setTimeout(() => setResendSuccessNotice(''), 6000);
  };

  // Fast Demo Fill
  const handleQuickDemoFill = () => {
    setName('Alex Hunter');
    setEmail('xfitt.mail@gmail.com');
    setPassword('GymPax2026!');
    setErrorMessage('');
  };

  // Enter App and Register Later (Guest mode)
  const handleRegisterLater = () => {
    setGuestAccount();
    if (onEnterGuestLater) {
      onEnterGuestLater();
    }
    onClose();
  };

  // Complete Onboarding from Welcome modal
  const handleCompleteWelcome = () => {
    if (pendingAccount) {
      onSuccess(pendingAccount);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative my-auto animate-in zoom-in-95 duration-200 text-zinc-100 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="font-display font-black tracking-wider text-zinc-200 uppercase text-xs">
              GymPax Athlete Access
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB NAVIGATION (REGISTER vs SIGN IN) — Only in auth modes   */}
        {/* ============================================================ */}
        {activeTab !== 'verify' && activeTab !== 'welcome' && (
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 p-1 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="p-6">
          {/* ============================================================ */}
          {/* STEP 1A: REGISTER / CREATE ACCOUNT FORM                      */}
          {/* ============================================================ */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight">
                  Join the Pax. Train with Purpose.
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Register your athlete profile to sync workouts, track progressive overload, and connect with gym partners.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* User Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Athlete User Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Hunter"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="athlete@gympax.app"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Password</span>
                    </label>
                    {password && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        {strengthLabels[passwordScore]}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[1, 2, 3, 4].map(idx => (
                        <div
                          key={idx}
                          className={`h-1 rounded-full transition-colors ${
                            passwordScore >= idx ? strengthColors[passwordScore] : 'bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Opt-in Weekly Digest Checkbox */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optInDigest}
                    onChange={e => setOptInDigest(e.target.checked)}
                    className="mt-0.5 rounded text-amber-400 focus:ring-amber-400/30 accent-amber-400 bg-zinc-950 border-zinc-700"
                  />
                  <span className="text-[11px] text-zinc-400 leading-snug">
                    Send me automated Sunday progress reports, volume breakdowns, and suggested gym partners.
                  </span>
                </label>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Register</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Pre-fill Shortcut */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                >
                  Fill Demo Athlete (Alex Hunter)
                </button>

                <button
                  type="button"
                  onClick={handleRegisterLater}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors font-semibold cursor-pointer"
                >
                  Enter App & Register Later →
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 1B: SIGN IN FORM                                        */}
          {/* ============================================================ */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight">
                  Welcome Back, Athlete.
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Sign in to your GymPax account to load your routines, PRs, and community feed.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="athlete@gympax.app"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setName('Alex Hunter');
                    setEmail('xfitt.mail@gmail.com');
                    handleLoginSubmit({ preventDefault: () => {} } as any);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Demo Sign In (Alex Hunter)</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-zinc-400 hover:text-amber-400 transition-colors font-medium cursor-pointer"
                  >
                    Need an account? <span className="underline font-bold text-amber-400">Register</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterLater}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors font-semibold cursor-pointer"
                  >
                    Enter App & Register Later →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: CONFIRMATION EMAIL VERIFICATION SCREEN               */}
          {/* ============================================================ */}
          {activeTab === 'verify' && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center mx-auto shadow-md">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight">
                  Verify Your Athlete Account
                </h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  We've sent a confirmation email to <span className="text-amber-400 font-mono font-semibold">{email}</span>. Click the button in the email preview below or enter the 6-digit confirmation code.
                </p>
              </div>

              {resendSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{resendSuccessNotice}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Interactive Email Inbox Preview Card (Industry Standard) */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-400/30 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] border-b border-zinc-800 pb-2 text-zinc-400">
                  <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>GymPax Security</span>
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">Just now</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-zinc-100">
                    Action Required: Verify Your GymPax Account
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Hi {name}, click below to instantly verify your email address and launch into GymPax with all features unlocked:
                  </p>
                </div>

                {/* 1-Click Verification Action Button */}
                <button
                  type="button"
                  onClick={() => handleVerifySubmit('1-click-verify')}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Email & Enter App Now</span>
                </button>

                <div className="pt-1 text-center">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Confirmation Code:{' '}
                    <span className="text-amber-400 font-bold tracking-widest">{generatedCode || '••••••'}</span>
                  </span>
                </div>
              </div>

              {/* Or Manual 6-Digit Code Entry */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-zinc-300 text-center block">
                  Or Enter 6-Digit Code
                </label>
                <div className="flex gap-2 justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCodeInput}
                    onChange={e => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-48 text-center px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-lg font-mono font-bold tracking-[0.3em] text-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifySubmit()}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>

              {/* Resend & Edit Email Controls */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0}
                  className={`text-[11px] font-semibold cursor-pointer ${
                    resendCooldown > 0
                      ? 'text-zinc-600 cursor-not-allowed'
                      : 'text-amber-400 hover:text-amber-300 underline'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend confirmation email'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Change email address
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: WELCOME CONFIRMATION                                 */}
          {/* ============================================================ */}
          {activeTab === 'welcome' && (
            <div className="space-y-5 py-2 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  Account Verified & Activated
                </div>
                <h2 className="text-xl font-black text-zinc-100 tracking-tight">
                  Welcome to GymPax, {pendingAccount?.name || name}!
                </h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Your athlete profile is active. Track workouts, log weights, and break your personal records.
                </p>
              </div>

              {/* Action: Enter App */}
              <button
                type="button"
                onClick={handleCompleteWelcome}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Enter GymPax & Start Training</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Verification Email Sent Popup */}
        {showEmailSentPopup && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-amber-400/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/30 shadow-md">
                <Mail className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-zinc-100">
                  Verification Email Sent
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  An email has been sent to <span className="text-amber-400 font-mono font-semibold">{email}</span> to verify your athlete account.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Please check your inbox or spam folder to complete verification and launch into GymPax.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEmailSentPopup(false);
                  setActiveTab('verify');
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-98"
              >
                Continue to Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
