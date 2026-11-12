import React, { useState } from 'react';
import { X, ShieldAlert, Stethoscope, AlertTriangle, CheckCircle, FileText, Scale, HeartPulse, Info, Check } from 'lucide-react';

interface TermsOfUseModalProps {
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({
  onClose,
  onAccept
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'medical' | 'trainer' | 'personal' | 'liability'>('all');
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(false);

  const handleAcknowledgeAndClose = () => {
    setHasAcknowledged(true);
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-750 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-zinc-100 my-auto max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Legal Terms & Health Safety Protocols</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              Terms of Use & Medical Disclaimer
            </h2>
            <p className="text-xs text-zinc-400">
              Please read carefully prior to utilizing any bodybuilding protocols, workout logs, or exercise demonstrations.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Terms of Use"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRIMARY CALLOUT HIGHLIGHT BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-amber-950/40 to-zinc-900 border border-red-500/40 text-xs shrink-0 space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-extrabold uppercase font-mono tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>Critical Health Warning & Non-Medical Status</span>
          </div>
          <p className="text-zinc-200 text-xs sm:text-[13px] leading-relaxed font-medium">
            <strong>This app and the company is NOT a registered personal trainer, licensed physician, physical therapist, or medical doctor of any kind.</strong> All information, routines, suggestions, poundages, and biomechanical illustrations are provided <strong>for personal and informational use only</strong>.
          </p>
          <div className="p-2.5 rounded-xl bg-red-900/30 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 font-bold">
            <Stethoscope className="w-4 h-4 shrink-0 text-red-400" />
            <span>Always speak to your doctor or physician before using this app as a bodybuilding or resistance training regimen.</span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none text-xs scroll-smooth snap-x snap-mandatory px-8 sm:px-1 scroll-px-8 sm:scroll-px-1">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              setActiveSection('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 snap-center snap-always ${
              activeSection === 'all'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Complete Terms
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              setActiveSection('medical');
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 snap-center snap-always ${
              activeSection === 'medical'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Consultation</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              setActiveSection('trainer');
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 snap-center snap-always ${
              activeSection === 'trainer'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Not a Trainer</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              setActiveSection('personal');
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 snap-center snap-always ${
              activeSection === 'personal'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Personal Use Only</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              setActiveSection('liability');
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 snap-center snap-always ${
              activeSection === 'liability'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Liability & Risk</span>
          </button>
        </div>

        {/* Scrollable Clauses Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
          {/* Section 1: Non-Registered Trainer & Non-Doctor Status */}
          {(activeSection === 'all' || activeSection === 'trainer') && (
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono uppercase text-xs">
                <FileText className="w-4 h-4" />
                <span>1. Non-Registered Trainer & Non-Medical Entity Disclaimer</span>
              </div>
              <p>
                The creators, authors, software engineers, and company operating this application are <strong>not registered personal fitness trainers, licensed physicians, cardiologists, orthopedic specialists, or medical doctors of any kind</strong>.
              </p>
              <p>
                No content, code, algorithmic recommendations, rest-timer countdowns, animated muscle figures, exercise substitution maps, or AI hypertrophy prescriptions generated within the app constitute certified athletic instruction, physical therapy, rehabilitation, or medical diagnoses.
              </p>
            </div>
          )}

          {/* Section 2: Speak to Your Doctor Before Bodybuilding Training */}
          {(activeSection === 'all' || activeSection === 'medical') && (
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-red-500/30 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold font-mono uppercase text-xs">
                <Stethoscope className="w-4 h-4" />
                <span>2. Mandatory Physician / Doctor Consultation</span>
              </div>
              <p>
                <strong>You must speak with your doctor or qualified healthcare professional before using this app as a bodybuilding or resistance training app</strong>, especially before:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                <li>Lifting heavy compound weights (e.g. barbell squats, deadlifts, overhead presses, bench presses).</li>
                <li>Engaging in high mechanical tension, maximum voluntary contraction, or training to muscular failure (RPE 9–10 or 0 RIR).</li>
                <li>Attempting maximum 1-Rep Max (1RM) lifts or progressive overload tonnage increases.</li>
                <li>Starting any high-protein, calorie surplus/deficit, or fitness conditioning protocol.</li>
              </ul>
              <p className="text-zinc-400 text-[11px] pt-1">
                Prior medical clearance is strictly required if you have any history of hypertension, cardiovascular anomalies, respiratory conditions, joint or spinal injuries, hernias, or are taking medication that alters heart rate or blood pressure.
              </p>
            </div>
          )}

          {/* Section 3: For Personal Use Only */}
          {(activeSection === 'all' || activeSection === 'personal') && (
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono uppercase text-xs">
                <Info className="w-4 h-4" />
                <span>3. Strictly For Personal & Recreational Use Only</span>
              </div>
              <p>
                All data, analytics, 1RM estimations, weight plate loading diagrams, suggested sets, workout templates, and biometric graphs provided by this application are for your <strong>sole, personal, and recreational self-tracking use only</strong>.
              </p>
              <p>
                This software is not calibrated or certified as a medical diagnostic device, clinical health monitor, or commercial fitness training service. You are solely responsible for verifying the suitability, safety, and physical appropriateness of any workout executed.
              </p>
            </div>
          )}

          {/* Section 4: Inherent Physical Risks & Assumption of Liability */}
          {(activeSection === 'all' || activeSection === 'liability') && (
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono uppercase text-xs">
                <Scale className="w-4 h-4" />
                <span>4. Assumption of Risk & Release of Liability</span>
              </div>
              <p>
                Bodybuilding, heavy free-weight lifting, dumbbell exercises, and calisthenics inherently carry physical risks including, but not limited to, muscle strains, ligament tears, joint impingement, rhabdomyolysis, drop injuries, cardiovascular events, or catastrophic trauma.
              </p>
              <p>
                By using this application, you voluntarily and knowingly assume all risks associated with your workouts. To the fullest extent permissible by applicable law, you release the application developers, owners, affiliates, and representatives from any and all claims, demands, or liabilities for personal injury, illness, property damage, or loss resulting from your training.
              </p>
            </div>
          )}

          {/* Section 5: Emergency Discontinue Protocol */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
            <HeartPulse className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-zinc-100 block">
                Emergency & Discontinue Protocol
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                If at any point during exercise you experience dizziness, lightheadedness, chest pain, abnormal heart palpitations, shortness of breath, or sharp joint pain, <strong>STOP IMMEDIATELY</strong> and seek emergency medical care.
              </p>
            </div>
          </div>
        </div>

        {/* Footer & Acceptance Action */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-400">
            Last updated: October 2026 · Personal Use License
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleAcknowledgeAndClose}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>I Understand & Agree</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
