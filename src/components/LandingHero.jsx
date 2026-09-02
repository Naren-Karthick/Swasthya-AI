import React from 'react';
import { ShieldAlert, Languages, Mic, Activity, FileDown, ArrowRight, CheckCircle, Stethoscope, Sparkles, Clock, Lock } from 'lucide-react';

export default function LandingHero({ onStart, translations }) {
  return (
    <div className="relative overflow-hidden py-8 sm:py-16 lg:py-20">
      {/* Dynamic Background Mesh Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80">
          <div 
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-emerald-200/40 via-cyan-200/40 to-teal-100/30 opacity-70" 
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
            }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        
        {/* Top Triage Alert Pill */}
        <div className="flex justify-center">
          <div className="group mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/90 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-rose-800 backdrop-blur-md shadow-soft-sm transition-all hover:bg-rose-100/80 text-left sm:text-center max-w-full">
            <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0 animate-pulse" />
            <span className="truncate sm:overflow-visible">{translations.safetyDisclaimer}</span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-50 px-3 py-1 text-[11px] sm:text-xs font-bold text-emerald-800 border border-emerald-200/60 mb-3 sm:mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <span>AI-Powered Clinical Guidance System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.18] sm:leading-[1.15]">
            Instant, Multilingual <br className="hidden xs:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Medical Symptom Triage
            </span>
          </h1>

          <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-sm sm:text-lg md:text-xl font-medium text-slate-600 leading-relaxed px-2">
            {translations.heroSubtitle || 'Analyze your symptoms in real-time in your native language. Get emergency urgency stratification, self-care guidance, and structured clinical reports.'}
          </p>

          {/* Primary CTA button with glowing hover */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
            <button
              onClick={onStart}
              className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-white shadow-soft-lg shadow-glow-emerald hover:from-emerald-500 hover:to-teal-500 active:scale-98 transition-all cursor-pointer min-h-[48px]"
            >
              <span>{translations.startDiagnosis}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 px-2 py-1">
              <Clock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Under 60 sec • 100% Confidential</span>
            </div>
          </div>
        </div>

        {/* Trust & Metric Highlights Bar */}
        <div className="mt-10 sm:mt-14 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl glass-panel p-3.5 sm:p-5 shadow-soft border border-slate-200/80 text-center">
            <div className="p-2 sm:p-3 border-r border-slate-100/80">
              <p className="text-xl sm:text-3xl font-extrabold text-slate-900">8+</p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Indian Languages</p>
            </div>
            <div className="p-2 sm:p-3 lg:border-r border-slate-100/80">
              <p className="text-xl sm:text-3xl font-extrabold text-emerald-600">Real-time</p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Voice-to-Text</p>
            </div>
            <div className="p-2 sm:p-3 border-r border-slate-100/80">
              <p className="text-xl sm:text-3xl font-extrabold text-slate-900">3-Tier</p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Triage Levels</p>
            </div>
            <div className="p-2 sm:p-3">
              <p className="text-xl sm:text-3xl font-extrabold text-teal-600">PDF</p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Clinical Export</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mx-auto mt-12 sm:mt-16 max-w-6xl">
          <div className="text-center mb-8 sm:mb-10 px-2">
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900">
              {translations.featuresTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2">
              Engineered with advanced AI reasoning and safety-first clinical triage standards
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Voice-to-Text */}
            <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-soft-sm hover:shadow-soft hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-3.5 text-emerald-700 shadow-sm">
                <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-3.5 sm:mt-4 text-sm sm:text-base font-bold text-slate-900">
                {translations.featureVoiceTitle}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {translations.featureVoiceDesc}
              </p>
            </div>

            {/* Multilingual */}
            <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-soft-sm hover:shadow-soft hover:border-cyan-300 hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 sm:p-3.5 text-cyan-700 shadow-sm">
                <Languages className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-3.5 sm:mt-4 text-sm sm:text-base font-bold text-slate-900">
                {translations.featureMultilingualTitle}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {translations.featureMultilingualDesc}
              </p>
            </div>

            {/* Triage */}
            <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-soft-sm hover:shadow-soft hover:border-teal-300 hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 p-3 sm:p-3.5 text-teal-700 shadow-sm">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-3.5 sm:mt-4 text-sm sm:text-base font-bold text-slate-900">
                {translations.featureUrgencyTitle}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {translations.featureUrgencyDesc}
              </p>
            </div>

            {/* PDF Report */}
            <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-soft-sm hover:shadow-soft hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-3.5 text-indigo-700 shadow-sm">
                <FileDown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-3.5 sm:mt-4 text-sm sm:text-base font-bold text-slate-900">
                {translations.featurePdfTitle}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {translations.featurePdfDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


