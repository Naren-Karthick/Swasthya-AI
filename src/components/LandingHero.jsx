import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  Mic, 
  Sparkles, 
  Clock, 
  FileDown, 
  Languages, 
  AlertTriangle
} from 'lucide-react';

export default function LandingHero({ onStartTriage, onStartLiveVoice }) {
  // Interactive mock preview state
  const [mockSelectedLang, setMockSelectedLang] = useState('hi');


  const mockSamples = {
    en: {
      text: "Mild chest pressure after climbing stairs, shortness of breath, and mild dizziness for 2 hours.",
      result: "MODERATE / PROMPT CLINICAL CONSULT",
      urgency: "MODERATE",
      action: "Avoid exertion. Have an adult accompany you to an urgent care clinic within 4-6 hours."
    },
    hi: {
      text: "सीढ़ियाँ चढ़ने के बाद सीने में हल्का दबाव, सांस फूलना और २ घंटे से हल्का चक्कर आ रहा है।",
      result: "मध्यम / त्वरित डॉक्टर परामर्श आवश्यक",
      urgency: "MODERATE",
      action: "परिश्रम से बचें। ४-६ घंटे के भीतर नजदीकी क्लिनिक या डॉक्टर से परामर्श लें।"
    },
    ta: {
      text: "படியேறிய பிறகு நெஞ்சில் லேசான அழுத்தம், மூச்சுத் திணறல் மற்றும் 2 மணி நேரமாக தலைச்சுற்றல் உள்ளது.",
      result: "மிதமான அவசரம் / உடனடி மருத்துவ ஆலோசனை",
      urgency: "MODERATE",
      action: "உடனடியாக கடுமையான வேலைகளைத் தவிர்க்கவும். 4-6 மணி நேரத்திற்குள் மருத்துவரை அணுகவும்."
    }
  };

  const currentSample = mockSamples[mockSelectedLang] || mockSamples.en;

  return (
    <div className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-18 lg:pb-28 bg-mesh-clinical">
      
      {/* Background Decorative Mesh Shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-teal-100/40 via-cyan-50/30 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Disclaimer Pill */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-teal-900 shadow-soft-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Educational Triage Support • Not a replacement for emergency care</span>
          </div>
        </div>

        {/* Hero Grid: Main Pitch (Left) + Interactive Live Mock Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headlines, Explanations, and Action CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-5 sm:space-y-6">
            
            <div className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-800 border border-teal-200/60 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
              <span>Multilingual Clinical Guidance System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Understand Your Symptoms.{' '}
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Know What to Do Next.
              </span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-lg text-slate-600 leading-relaxed font-medium mx-auto lg:mx-0">
              Describe your symptoms by text or live voice in your preferred Indian language. Swasthya AI provides an instant triage assessment and clear next steps, designed to help you make informed decisions about seeking care.
            </p>

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              
              {/* Primary CTA: Live Doctor Audio with Gemini Voice */}
              <button
                onClick={onStartLiveVoice}
                className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white shadow-soft-lg shadow-glow-teal hover:from-teal-500 hover:to-emerald-500 active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <Mic className="h-5 w-5 animate-pulse text-teal-100" />
                <span>Talk to AI Doctor (Gemini Voice)</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary CTA: Manual Symptom Entry on Same Page */}
              <button
                onClick={onStartTriage}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-slate-800 shadow-soft-sm hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <span>Check Symptoms (Manual Entry)</span>
              </button>
            </div>

            {/* Micro Trust Strip under CTA */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                <span>Under 60 seconds</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-teal-600" />
                <span>8+ Indian Languages</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <FileDown className="h-3.5 w-3.5 text-teal-600" />
                <span>Doctor-Ready PDF</span>
              </span>
            </div>

            {/* Non-alarming Medical Disclaimer */}
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3.5 text-left max-w-xl mx-auto lg:mx-0">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed font-medium">
                  <strong>Clinical Notice:</strong> Informational triage guidance only. If you experience severe chest pain, shortness of breath, or sudden weakness, call <strong>108 / 112</strong> or visit the nearest emergency room immediately.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Visually Appealing Mock Product Interface Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Glow Behind Card */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-500 opacity-20 blur-xl"></div>
              
              {/* Mock Window Card */}
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-soft-lg">
                
                {/* Mock Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-rose-400"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                    <span className="ml-2 text-xs font-bold text-slate-800">
                      Live Triage Simulator
                    </span>
                  </div>

                  {/* Language Switcher in Mock */}
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                    {[
                      { code: 'hi', label: 'हिन्दी' },
                      { code: 'en', label: 'EN' },
                      { code: 'ta', label: 'தமிழ்' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setMockSelectedLang(lang.code)}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold cursor-pointer transition-colors ${
                          mockSelectedLang === lang.code
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mock Live Symptom Input */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 mb-3.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Mic className="h-3 w-3 text-teal-600 animate-pulse" />
                      Patient Voice Transcription
                    </span>
                    <span className="text-teal-600">Active</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    "{currentSample.text}"
                  </p>
                </div>

                {/* Processing State Indicator */}
                <div className="flex items-center justify-between bg-teal-50/70 border border-teal-100 rounded-xl px-3 py-2 text-xs font-semibold text-teal-900 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    <span>AI Urgency Evaluation Complete</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-white border border-teal-200 px-2 py-0.5 rounded-full">
                    99.2% Protocol Match
                  </span>
                </div>

                {/* Triage Urgency Result Preview */}
                <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      <AlertTriangle className="h-3 w-3" />
                      {currentSample.result}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800">Tier 2 of 3</span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {currentSample.action}
                  </p>
                </div>

                {/* Quick Action Button to Launch Real Check */}
                <button
                  onClick={onStartTriage}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-soft-sm"
                >
                  <span>Launch Full Triage for Your Symptoms</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
