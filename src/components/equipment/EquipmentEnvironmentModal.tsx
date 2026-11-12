import React, { useState } from 'react';
import { X, Check, Sparkles, ArrowRight, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { EquipmentEnvironment, EquipmentAccessType } from '../../types';
import {
  EQUIPMENT_ENVIRONMENTS,
  ENVIRONMENT_LIST,
  environmentToAccessType
} from '../../data/equipmentEnvironments';

interface EquipmentEnvironmentModalProps {
  currentEnvironment: EquipmentEnvironment;
  onSelectEnvironment: (env: EquipmentEnvironment, title: EquipmentAccessType) => void;
  onClose: () => void;
}

export const EquipmentEnvironmentModal: React.FC<EquipmentEnvironmentModalProps> = ({
  currentEnvironment,
  onSelectEnvironment,
  onClose
}) => {
  const [selectedEnv, setSelectedEnv] = useState<EquipmentEnvironment>(currentEnvironment);
  const [pendingConfirmationEnv, setPendingConfirmationEnv] = useState<EquipmentEnvironment | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<EquipmentEnvironment | null>(null);

  const toggleCardExpand = (envId: EquipmentEnvironment, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedCardId(prev => (prev === envId ? null : envId));
  };

  const handleCardClick = (envId: EquipmentEnvironment) => {
    setSelectedEnv(envId);
    setExpandedCardId(prev => (prev === envId ? null : envId));
  };

  const handleActivateOption = (envId: EquipmentEnvironment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEnv(envId);
    if (envId === currentEnvironment) {
      onClose();
    } else {
      setPendingConfirmationEnv(envId);
    }
  };

  const handleApply = () => {
    if (selectedEnv === currentEnvironment) {
      onClose();
      return;
    }
    setPendingConfirmationEnv(selectedEnv);
  };

  const handleConfirmProceed = () => {
    if (!pendingConfirmationEnv) return;
    const targetEnv = pendingConfirmationEnv;
    onSelectEnvironment(targetEnv, environmentToAccessType(targetEnv));
    setPendingConfirmationEnv(null);
    onClose();
  };

  const handleDiscard = () => {
    setPendingConfirmationEnv(null);
    setSelectedEnv(currentEnvironment);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-zinc-100 my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Adaptive Equipment Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight mt-0.5">
              Change Training Environment
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-lg">
              Switching your training setup immediately recalibrates all scheduled workouts, exercise substitutions, and library filters.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Environment Cards */}
        <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
          {ENVIRONMENT_LIST.map(env => {
            const isSelected = selectedEnv === env.id;
            const isCurrentActive = currentEnvironment === env.id;
            const isExpanded = expandedCardId === env.id;

            return (
              <div
                key={env.id}
                onClick={() => handleCardClick(env.id)}
                className={`rounded-2xl border transition-all cursor-pointer relative group overflow-hidden ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 hover:bg-zinc-950'
                }`}
              >
                {/* Minimized / Collapsed Header: Selected Workout Text + Badges + Expand/Collapse Icon */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-lg shadow-inner">
                      <span>{env.emoji}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                          {env.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider bg-black/60 text-zinc-400 border border-zinc-800 shrink-0">
                          {env.badge}
                        </span>
                        {isCurrentActive && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            CURRENT ACTIVE
                          </span>
                        )}
                        {isSelected && !isCurrentActive && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider bg-amber-400 text-zinc-950 shrink-0">
                            SELECTED TARGET
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand / Collapse Icon on the card */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => toggleCardExpand(env.id, e)}
                      aria-label={isExpanded ? `Collapse details for ${env.title}` : `Expand details for ${env.title}`}
                      title={isExpanded ? "Collapse details" : "Expand details"}
                      className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/40 text-zinc-400 hover:text-amber-300 transition-all cursor-pointer flex items-center justify-center"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Opens or closes more details of the selected option */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 sm:px-4 sm:pb-4 pt-1 border-t border-zinc-850/80 animate-in fade-in duration-150 space-y-3">
                    <div className="space-y-1 pt-1">
                      <p className="text-xs text-zinc-300 font-medium">
                        {env.tagline}
                      </p>

                      <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-normal break-words">
                        {env.description}
                      </p>

                      {/* Equipment Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {env.allowedEquipment.map(eq => (
                          <span
                            key={eq}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900/90 border border-zinc-800 text-zinc-400"
                          >
                            ✓ {eq}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Action / Activation Button */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850/60">
                      <button
                        type="button"
                        onClick={(e) => handleActivateOption(env.id, e)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-md shadow-amber-500/20 active:scale-95'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isCurrentActive ? 'Active' : isSelected ? 'Save & Activate' : 'Select'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-amber-500/25"
          >
            <Sparkles className="w-4 h-4 fill-current shrink-0" />
            <span>Save & Activate {EQUIPMENT_ENVIRONMENTS[selectedEnv].shortTitle} Setup</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Confirmation Modal */}
        {pendingConfirmationEnv && (
          <div
            onClick={handleDiscard}
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-900 border border-amber-400/80 rounded-3xl p-6 shadow-2xl space-y-4 text-zinc-100 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40">
                  <AlertTriangle className="w-5 h-5 text-amber-400 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-100">
                    Change Equipment Setup?
                  </h3>
                  <span className="text-xs text-amber-400 font-mono font-semibold">
                    Workout Recalibration
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                You are switching your setup to{' '}
                <strong className="text-amber-400 font-bold">
                  {EQUIPMENT_ENVIRONMENTS[pendingConfirmationEnv].title}
                </strong>
                . This will recalculate your active workout program and replace exercises to fit your available equipment.
              </p>

              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start sm:items-center gap-3 text-xs text-zinc-400">
                <span className="text-xl shrink-0">
                  {EQUIPMENT_ENVIRONMENTS[pendingConfirmationEnv].emoji}
                </span>
                <span className="whitespace-normal break-words leading-relaxed">
                  Allowed: {EQUIPMENT_ENVIRONMENTS[pendingConfirmationEnv].allowedEquipment.join(', ')}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleConfirmProceed}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <span>Proceed</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
