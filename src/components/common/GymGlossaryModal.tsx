import React, { useState } from 'react';
import { X, Search, BookOpen, Sparkles, Filter, Lightbulb } from 'lucide-react';
import { GYM_GLOSSARY, GlossaryTerm } from '../../data/gymGlossary';

interface GymGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string;
}

export const GymGlossaryModal: React.FC<GymGlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTermId
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(
    initialTermId && GYM_GLOSSARY[initialTermId] ? GYM_GLOSSARY[initialTermId] : null
  );

  const allTerms = Object.values(GYM_GLOSSARY);

  React.useEffect(() => {
    if (initialTermId && GYM_GLOSSARY[initialTermId]) {
      setSelectedTerm(GYM_GLOSSARY[initialTermId]);
    } else if (!selectedTerm && allTerms.length > 0) {
      setSelectedTerm(allTerms[0]);
    }
  }, [initialTermId, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTerms = allTerms.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.detailedExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Terms' },
    { id: 'biometrics', label: 'Bio-Metrics' },
    { id: 'hypertrophy', label: 'Hypertrophy' },
    { id: 'programming', label: 'Programming & RIR' },
    { id: 'biomechanics', label: 'Biomechanics' },
    { id: 'nutrition', label: 'Nutrition' }
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-zinc-900 border border-zinc-750 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-zinc-100">
                GymPax Fitness & Bodybuilding Glossary
              </h3>
              <p className="text-xs text-zinc-400">
                Evidence-based definitions for gym terminology, biometrics, and intensity scales.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search gym terms (e.g. BMI, RIR, RPE, Hypertrophy, Axial Load)..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Tabs - Wrapped for mobile with no horizontal scroll */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-zinc-950 font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Term List & Detail Panel */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          {/* Terms Column (5 cols) */}
          <div className="md:col-span-5 p-3 space-y-2 overflow-y-auto max-h-[60vh]">
            {filteredTerms.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No matching terms found.
              </div>
            ) : (
              filteredTerms.map(item => {
                const isSelected = selectedTerm?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTerm(item)}
                    className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-850 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{item.term}</span>
                      <span className="text-[9px] font-mono uppercase text-zinc-500">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.shortDefinition}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Detailed View Column (7 cols) */}
          <div className="md:col-span-7 p-5 overflow-y-auto max-h-[60vh] space-y-4">
            {selectedTerm ? (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      {selectedTerm.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100 mt-1.5">
                    {selectedTerm.term}
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium mt-1 leading-snug">
                    {selectedTerm.shortDefinition}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                    Detailed Clinical Breakdown:
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedTerm.detailedExplanation}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Why it matters for your training:</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {selectedTerm.whyItMatters}
                  </p>
                </div>

                {selectedTerm.exampleOrTip && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2 text-xs text-zinc-300">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-100 font-semibold">Practical Gym Application: </strong>
                      <span className="text-zinc-400 font-mono text-[11px]">{selectedTerm.exampleOrTip}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-zinc-500">
                Select any term on the left to read its complete breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
