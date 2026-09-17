import React from 'react';
import { ArrowRight, Mic, ShieldAlert, HeartPulse } from 'lucide-react';

export default function FinalCTA({ onStartLiveVoice, onStartTriage }) {
  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      
      {/* Soft Gradient Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-gradient-to-tr from-teal-200/40 to-emerald-200/30 blur-3xl opacity-60" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-4 py-1.5 text-xs font-bold text-teal-800 mb-4 shadow-soft-sm">
          <HeartPulse className="h-4 w-4 text-teal-600 animate-pulse" />
          <span>Multilingual AI Triage Support</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Start with a clearer next step.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-lg text-slate-600 leading-relaxed font-medium">
          Share your symptoms in the language that feels most comfortable. Receive rapid urgency stratification and a structured summary for your physician.
        </p>

        {/* Dual CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          {/* Live Audio AI Button */}
          <button
            onClick={onStartLiveVoice}
            className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-soft-lg shadow-glow-teal hover:from-teal-500 hover:to-emerald-500 active:scale-95 transition-all cursor-pointer min-h-[48px]"
          >
            <Mic className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            <span>Voice Intake Consultation</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Standard Triage Button */}
          <button
            onClick={onStartTriage}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-slate-800 shadow-soft-sm hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-800 active:scale-95 transition-all cursor-pointer min-h-[48px]"
          >
            <span>Start Symptom Check</span>
          </button>
        </div>

        {/* Concise Disclaimer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          <span>Informational triage prototype. Always consult certified medical practitioners for clinical emergencies.</span>
        </div>
      </div>
    </section>
  );
}
