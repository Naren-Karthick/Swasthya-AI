import React from 'react';
import { 
  PhoneCall, 
  ArrowRight, 
  Mic, 
  Sparkles, 
  Clock, 
  FileDown, 
  ShieldAlert,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import { languages } from '../localization';

export default function LandingHero({ 
  onStartTriage, 
  onStartLiveVoice, 
  onOpenSampleCases,
  currentLanguage,
  onLanguageChange 
}) {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-teal-50/40 via-white to-slate-50 border-b border-slate-200/80">
      
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* 1. Senior Emergency Alert Strip (High Visibility, One-Touch Call for Old People) */}
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-3.5 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5 text-rose-950">
            <span className="flex h-3 w-3 rounded-full bg-rose-600 animate-ping flex-shrink-0" />
            <p className="text-xs sm:text-sm font-black leading-tight">
              Life-threatening emergency? Call ambulance immediately:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="tel:108"
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-3.5 py-2 text-xs sm:text-sm font-black shadow-soft-sm cursor-pointer min-h-[44px]"
              aria-label="Call 108 Ambulance"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Call 108</span>
            </a>
            <a 
              href="tel:112"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-3.5 py-2 text-xs sm:text-sm font-black shadow-soft-sm cursor-pointer min-h-[44px]"
              aria-label="Call 112 National Emergency"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Call 112</span>
            </a>
          </div>
        </div>

        {/* 2. Main Pitch (Simple, Big Typography for Elderly Accessibility) */}
        <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/70 border border-teal-200 px-4 py-1.5 text-xs sm:text-sm font-black text-teal-900 shadow-xs">
            <Sparkles className="h-4 w-4 text-teal-700 flex-shrink-0" />
            <span>Simple Health & Symptom Guidance in 8 Indian Languages</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Check Your Health.{' '}
            <span className="bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
              Know What to Do Next.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-700 leading-relaxed font-semibold max-w-2xl mx-auto">
            Tell us how you feel by speaking or typing. We will guide you on whether you need emergency care, a doctor visit, or home rest.
          </p>

          {/* 3. Mother Tongue Language Quick Switcher (Large Native Script Buttons) */}
          <div className="pt-1 pb-2">
            <span className="text-xs sm:text-sm font-black text-slate-700 block mb-2 uppercase tracking-wider">
              Choose Your Language / भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும்:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {languages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onLanguageChange && onLanguageChange(lang.code)}
                    className={`rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-soft-sm scale-105 border-2 border-teal-700'
                        : 'bg-white text-slate-800 border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                    }`}
                  >
                    <span>{lang.nativeName || lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Three Big, Friendly Action Buttons (Senior-Friendly >= 52px Touch Targets) */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
            
            {/* Primary Action: Start Symptom Check */}
            <button
              type="button"
              onClick={onStartTriage}
              className="w-full sm:flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 active:scale-98 px-6 py-4 text-base sm:text-lg font-black text-white shadow-lg shadow-teal-700/20 transition-all cursor-pointer min-h-[54px]"
            >
              <span>Start Health Check</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Secondary Action: Try a Sample Case (Instant Judge Demo) */}
            <button
              type="button"
              onClick={onOpenSampleCases}
              className="w-full sm:flex-1 flex items-center justify-center gap-2.5 rounded-2xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 active:scale-98 px-5 py-4 text-base sm:text-lg font-black text-amber-950 shadow-soft-sm transition-all cursor-pointer min-h-[54px]"
            >
              <BookmarkCheck className="h-5 w-5 text-amber-700" />
              <span>Try a Sample Case</span>
            </button>

            {/* Optional Voice Consultation Button */}
            {onStartLiveVoice && (
              <button
                type="button"
                onClick={onStartLiveVoice}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-100 active:scale-98 px-5 py-4 text-sm sm:text-base font-black text-slate-800 shadow-soft-sm transition-all cursor-pointer min-h-[54px]"
                aria-label="Speak symptoms using microphone"
              >
                <Mic className="h-5 w-5 text-teal-700" />
                <span>Speak Symptoms</span>
              </button>
            )}

          </div>

          {/* 5. Reassuring Feature Indicators for Seniors */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>100% Free & Anonymous</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-teal-600" />
              <span>Takes under 2 minutes</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <FileDown className="h-4 w-4 text-teal-600" />
              <span>Doctor-Ready Summary</span>
            </span>
          </div>

          {/* 6. Plain-Language Medical Safety Notice */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 text-left shadow-soft-sm max-w-xl mx-auto">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                <strong>Please Note:</strong> This tool is an informational triage guide to help you decide how soon to seek medical attention. It does not provide prescriptions or medical diagnoses.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
