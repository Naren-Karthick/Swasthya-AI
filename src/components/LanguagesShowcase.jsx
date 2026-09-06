import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';

export default function LanguagesShowcase({ onSelectLanguage }) {
  const languageDetails = [
    { code: 'en', name: 'English', native: 'English', script: 'Hello, how can I help?', speakers: 'Primary / Pan-India' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'नमस्ते, आपको क्या तकलीफ है?', speakers: 'North & Central India' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'வணக்கம், உங்களுக்கு என்ன அறிகுறிகள்?', speakers: 'Tamil Nadu & Puducherry' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'నమస్కారం, మీ సమస్య ఏమిటి?', speakers: 'Andhra Pradesh & Telangana' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'ನಮಸ್ಕಾರ, ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳೇನು?', speakers: 'Karnataka' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'നമസ്കാരം, എന്താണ് നിങ്ങളുടെ പ്രശ്നം?', speakers: 'Kerala' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'নমস্কার, আপনার কী সমস্যা হচ্ছে?', speakers: 'West Bengal & Tripura' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', script: 'नमस्कार, तुम्हाला काय त्रास होत आहे?', speakers: 'Maharashtra' }
  ];

  return (
    <section id="languages" className="py-16 sm:py-24 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 px-3 py-1 text-xs font-bold text-cyan-800 mb-3">
            <Globe className="h-3.5 w-3.5 text-cyan-600" />
            <span>Inclusive Vernacular Healthcare</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Supported Indian Languages
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Swasthya AI transcribes, reasons, and speaks fluently across 8 major Indian languages in text and audio.
          </p>
        </div>

        {/* 8 Languages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {languageDetails.map((lang) => (
            <div
              key={lang.code}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-soft-sm hover:shadow-soft-lg hover:border-teal-400 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    {lang.code.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {lang.speakers}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {lang.native}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {lang.name}
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <p className="text-xs text-slate-600 italic">
                    "{lang.script}"
                  </p>
                </div>
              </div>

              {/* Quick Start in this language */}
              <button
                onClick={() => onSelectLanguage(lang.code)}
                className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800 active:scale-95 transition-all cursor-pointer shadow-soft-sm"
              >
                <span>Triage in {lang.name}</span>
                <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
