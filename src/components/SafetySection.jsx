import React from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, Info } from 'lucide-react';

export default function SafetySection() {
  return (
    <section id="safety" className="py-16 sm:py-24 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/80 px-3 py-1 text-xs font-bold text-rose-800 mb-3">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
            <span>Clinical Boundaries & Emergency Protocols</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Safety, Emergency & Clinical Notice
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Swasthya AI is an informational triage decision-support prototype designed to facilitate timely medical attention.
          </p>
        </div>

        {/* 1. Visually Distinct Emergency Warning Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 via-rose-50/70 to-red-50/50 p-6 sm:p-10 shadow-soft-lg mb-10">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 flex-shrink-0">
              <ShieldAlert className="h-7 w-7 animate-bounce" />
            </div>

            <div className="flex-grow">
              <span className="text-xs font-black uppercase tracking-wider text-rose-700">
                Critical Emergency Notice
              </span>
              <h3 className="mt-1 text-lg sm:text-2xl font-black text-rose-950 tracking-tight leading-snug">
                When to Seek Immediate Emergency Services
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-rose-900 leading-relaxed font-semibold">
                If you or someone you are assisting is experiencing severe chest pain, sudden numbness or signs of stroke, difficulty breathing, uncontrolled bleeding, loss of consciousness, or another life-threatening emergency, <strong>contact local emergency services immediately</strong>.
              </p>

              {/* Emergency Numbers in India */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="tel:108"
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-soft hover:bg-rose-700 transition-all cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call 108 (Ambulance / Emergency)</span>
                </a>
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-soft hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4 text-emerald-400" />
                  <span>Call 112 (National Emergency Helpline)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Clear Clinical Boundaries Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-soft-sm">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h4>Not a Substitute for a Doctor</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Swasthya AI does not provide a definitive medical diagnosis. It does not replace clinical evaluation, physical examinations, or prescriptions from a certified physician.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-soft-sm">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base mb-2">
              <Info className="h-4 w-4 text-teal-600" />
              <h4>Decision Support & Informational Guidance</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Assessments are algorithmic risk stratifications to help you determine urgency. Guidance may be incomplete and cannot account for all medical variables.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
