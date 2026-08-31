import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';

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
    { key: 'fever', label: translations.symptoms.fever },
    { key: 'cough', label: translations.symptoms.cough },
    { key: 'breath', label: translations.symptoms.breath },
    { key: 'chest', label: translations.symptoms.chest },
    { key: 'dizziness', label: translations.symptoms.dizziness },
    { key: 'fatigue', label: translations.symptoms.fatigue },
    { key: 'headache', label: translations.symptoms.headache },
    { key: 'nausea', label: translations.symptoms.nausea }
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center space-x-1 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Change Language / வேறொரு மொழி</span>
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-emerald-500" />
          {translations.symptomIntakeTitle}
        </h2>

        {/* Quick select chips */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {translations.quickSymptomChips}
          </label>
          <div className="flex flex-wrap gap-2">
            {quickChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => handleChipClick(chip.label)}
                className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
              >
                + {chip.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Symptom Text Area */}
          <div>
            <div className="relative">
              <textarea
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder={translations.symptomInputPlaceholder}
                rows={5}
                className="w-full rounded-xl border border-slate-200 p-4 pb-14 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-base"
                required
              />

              {/* Voice-to-Text Button */}
              {speechSupported ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-4 bottom-4 flex h-10 items-center justify-center rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="mr-1.5 h-4 w-4" />
                      <span>{translations.voiceRecordListening}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="mr-1.5 h-4 w-4" />
                      <span>{translations.voiceRecordHold}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="absolute right-4 bottom-4 text-xs font-medium text-slate-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Voice typing not supported in this browser
                </div>
              )}
            </div>
          </div>

          {/* Context Options Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ageGroup" className="block text-sm font-semibold text-slate-700 mb-1.5">
                {translations.ageGroupLabel}
              </label>
              <select
                id="ageGroup"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">{translations.ageGroupSelect}</option>
                <option value="Child">{translations.ageGroupChild}</option>
                <option value="Teenager">{translations.ageGroupTeen}</option>
                <option value="Adult">{translations.ageGroupAdult}</option>
                <option value="Senior">{translations.ageGroupSenior}</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-slate-700 mb-1.5">
                {translations.durationLabel}
              </label>
              
              {/* Quick Select Duration Chips */}
              <div className="flex flex-wrap gap-2 mb-2.5">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDuration(day)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                      Number(duration) === day
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
                placeholder="Or type custom number of days..."
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading || !symptomsText.trim()}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-4 text-base font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{translations.analyzing}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
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
