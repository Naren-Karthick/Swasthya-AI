import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, ArrowLeft, Send, Sparkles, Volume2, UserCheck, CalendarDays, RefreshCw } from 'lucide-react';

export default function SymptomInput({
  languageCode,
  translations,
  onBack,
  onAnalyze,
  loading
}) {
  const [symptomsText, setSymptomsText] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [duration, setDuration] = useState('');
  
  // Voice recording states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Quick Chips in selected language
  const quickChips = [
    { key: 'fever', label: translations.symptoms?.fever || 'Fever' },
    { key: 'cough', label: translations.symptoms?.cough || 'Cough' },
    { key: 'breath', label: translations.symptoms?.breath || 'Shortness of breath' },
    { key: 'chest', label: translations.symptoms?.chest || 'Chest pain' },
    { key: 'dizziness', label: translations.symptoms?.dizziness || 'Dizziness' },
    { key: 'fatigue', label: translations.symptoms?.fatigue || 'Fatigue' },
    { key: 'headache', label: translations.symptoms?.headache || 'Headache' },
    { key: 'nausea', label: translations.symptoms?.nausea || 'Nausea' }
  ];

  // Map app language code to Speech Recognition locale
  const getLocaleCode = (code) => {
    const locales = {
      en: 'en-IN',
      ta: 'ta-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      bn: 'bn-IN',
      mr: 'mr-IN'
    };
    return locales[code] || 'en-US';
  };

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = getLocaleCode(languageCode);

    rec.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setSymptomsText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
      }
    };

    rec.onerror = (e) => {
      console.error('Speech recognition error', e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [languageCode]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleChipClick = (chipLabel) => {
    setSymptomsText((prev) => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) return chipLabel;
      // Append matching punctuation or spacing
      if (cleanPrev.endsWith(',') || cleanPrev.endsWith('.')) {
        return `${cleanPrev} ${chipLabel}`;
      }
      return `${cleanPrev}, ${chipLabel}`;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symptomsText.trim()) return;
    onAnalyze(symptomsText, ageGroup, duration);
  };

  return (
    <div className="mx-auto max-w-3xl px-3.5 py-6 sm:py-12">
      {/* Top Header Navigation */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="group inline-flex items-center space-x-1.5 sm:space-x-2 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-900 shadow-soft-sm transition-all cursor-pointer min-h-[38px]"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:-translate-x-1 text-emerald-600 flex-shrink-0" />
          <span className="truncate">Switch Language</span>
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold text-emerald-800 border border-emerald-200/70 flex-shrink-0">
          <Sparkles className="h-3 w-3 text-emerald-600" />
          <span>Clinical Intake AI</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-10 shadow-soft-lg">
        {/* Card Title */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {translations.symptomIntakeTitle}
          </h2>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Please describe all current symptoms, onset, and severity accurately in your native language.
          </p>
        </div>

        {/* Quick select chips with pill styles */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              {translations.quickSymptomChips}
            </label>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">Click to add</span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {quickChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => handleChipClick(chip.label)}
                className="group inline-flex items-center rounded-xl bg-slate-50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-300 shadow-soft-sm active:scale-95 transition-all cursor-pointer min-h-[36px]"
              >
                <span className="text-emerald-500 group-hover:scale-125 mr-1 font-bold transition-transform">+</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Main Symptom Text Area */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 sm:mb-2">
              Detailed Description
            </label>
            <div className="relative">
              <textarea
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder={translations.symptomInputPlaceholder}
                rows={4}
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/40 p-3.5 sm:p-4 pb-14 sm:pb-16 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base shadow-inner transition-all leading-relaxed"
                required
              />

              {/* Voice-to-Text Recording Trigger */}
              {speechSupported ? (
                <div className="absolute right-2.5 sm:right-3.5 bottom-2.5 sm:bottom-3.5 flex items-center gap-1.5 sm:gap-2">
                  {isListening && (
                    <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-600 animate-pulse bg-rose-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-rose-100">
                      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-rose-600 animate-ping" />
                      Listening
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex h-9 sm:h-10 items-center justify-center rounded-xl px-3 sm:px-4 text-xs font-bold transition-all cursor-pointer shadow-soft-sm ${
                      isListening
                        ? 'bg-rose-600 text-white shadow-rose-600/30'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>{translations.voiceRecordListening}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                        <span>{translations.voiceRecordHold}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="absolute right-3 bottom-3 text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Voice typing unavailable
                </div>
              )}
            </div>
          </div>

          {/* Demographic & Duration Context Grid */}
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            {/* Age Group */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-3.5 sm:p-4">
              <label htmlFor="ageGroup" className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 sm:mb-2">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{translations.ageGroupLabel}</span>
              </label>
              <select
                id="ageGroup"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 text-xs sm:text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-soft-sm min-h-[42px]"
              >
                <option value="">{translations.ageGroupSelect}</option>
                <option value="Child">{translations.ageGroupChild}</option>
                <option value="Teenager">{translations.ageGroupTeen}</option>
                <option value="Adult">{translations.ageGroupAdult}</option>
                <option value="Senior">{translations.ageGroupSenior}</option>
              </select>
            </div>

            {/* Symptom Duration */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-3.5 sm:p-4">
              <label htmlFor="duration" className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 sm:mb-2">
                <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                <span>{translations.durationLabel}</span>
              </label>
              
              {/* Quick Duration Days Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[1, 2, 3, 5, 7].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDuration(day)}
                    className={`rounded-lg px-2 sm:px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer min-h-[34px] ${
                      Number(duration) === day
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-soft-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day === 7 ? '7+ Days' : `${day} ${day === 1 ? 'Day' : 'Days'}`}
                  </button>
                ))}
              </div>

              <input
                id="duration"
                type="number"
                min="0"
                max="365"
                placeholder="Or custom days (e.g. 10)..."
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium shadow-soft-sm min-h-[40px]"
              />
            </div>
          </div>

          {/* Submit Triage Analysis */}
          <button
            type="submit"
            disabled={loading || !symptomsText.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-soft-lg shadow-glow-emerald hover:from-emerald-500 hover:to-teal-500 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer min-h-[48px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white" />
                <span>{translations.analyzing || 'Analyzing symptoms with Medical AI...'}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>{translations.analyzeButton}</span>
                <Send className="h-4 w-4" />
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


