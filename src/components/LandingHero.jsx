import React from 'react';
import { ShieldAlert, Languages, Mic, Activity, FileDown } from 'lucide-react';

export default function LandingHero({ onStart, translations }) {
  return (
    <div className="relative overflow-hidden bg-slate-50 py-12 sm:py-16 lg:py-24">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.50),white)] opacity-70" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Safety Disclaimer Banner */}
          <div className="mx-auto mb-8 max-w-3xl rounded-full bg-rose-50 px-4 py-1.5 text-center text-xs sm:text-sm font-medium text-rose-800 border border-rose-100 flex items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <span>{translations.safetyDisclaimer}</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Swasthya<span className="text-emerald-600">AI</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-xl font-bold text-slate-800 sm:text-2xl md:mt-5 md:max-w-3xl">
            {translations.heroTitle}
          </p>
          <p className="mx-auto mt-3 max-w-md text-base text-slate-600 sm:text-lg md:mt-5 md:max-w-3xl">
            {translations.heroSubtitle}
          </p>

          <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
            <button
              onClick={onStart}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-500 hover:shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all sm:w-auto cursor-pointer"
            >
              {translations.startDiagnosis}
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mx-auto mt-20 max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-slate-800 mb-12">
            {translations.featuresTitle}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Voice-to-Text */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                {translations.featureVoiceTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {translations.featureVoiceDesc}
              </p>
            </div>

            {/* Multilingual */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <Languages className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                {translations.featureMultilingualTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {translations.featureMultilingualDesc}
              </p>
            </div>

            {/* Triage */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                {translations.featureUrgencyTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {translations.featureUrgencyDesc}
              </p>
            </div>

            {/* PDF Report */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <FileDown className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                {translations.featurePdfTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {translations.featurePdfDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
