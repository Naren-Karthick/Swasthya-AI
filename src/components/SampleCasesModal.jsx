import React from 'react';
import { X, BookmarkCheck, ArrowRight } from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';

export default function SampleCasesModal({ isOpen, onClose, onSelectCase }) {
  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="sampleCasesTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-soft-sm">
              <BookmarkCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black uppercase text-amber-900">
                Interactive Demo
              </span>
              <h2 id="sampleCasesTitle" className="text-base sm:text-xl font-black text-slate-900 mt-0.5">
                Select a Deterministic Fictional Case
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informational Sub-bar */}
        <div className="bg-amber-50/80 border-b border-amber-100 px-5 py-2 text-xs font-semibold text-amber-950">
          <span>⚡ Designed for 60–90 second hackathon evaluation. Zero latency, no microphone access, and no live API token required.</span>
        </div>

        {/* Scrollable list of 5 cases */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {SAMPLE_CASES.map((sc) => {
            const isEmerg = sc.urgencyLevel === 'EMERGENCY';
            const isModerate = sc.urgencyLevel === 'MODERATE';
            return (
              <div
                key={sc.id}
                onClick={() => {
                  onSelectCase(sc);
                  onClose();
                }}
                className={`rounded-2xl border-2 p-4 transition-all cursor-pointer hover:shadow-soft-md ${
                  isEmerg 
                    ? 'border-rose-300 bg-rose-50/50 hover:bg-rose-50' 
                    : isModerate 
                    ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50' 
                    : 'border-teal-300 bg-teal-50/50 hover:bg-teal-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase ${
                    isEmerg ? 'bg-rose-600 text-white' :
                    isModerate ? 'bg-amber-600 text-white' :
                    'bg-teal-700 text-white'
                  }`}>
                    {sc.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {sc.category} • {sc.patientContext.ageGroup} • {sc.patientContext.duration} day(s)
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  {sc.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-700 line-clamp-2 leading-relaxed font-medium">
                  "{sc.symptomsText}"
                </p>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs font-bold">
                  <span className="text-slate-500">
                    Language: {sc.patientContext.language}
                  </span>
                  <span className="text-teal-700 font-extrabold flex items-center gap-1">
                    <span>Load Case Result</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 flex justify-between items-center text-xs text-slate-500">
          <span>All sample records are strictly fictional and intended for testing.</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[40px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
