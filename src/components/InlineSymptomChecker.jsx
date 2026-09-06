import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  UserCheck, 
  CalendarDays, 
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  ShieldCheck,
  FileDown,
  Globe,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { languages } from '../localization';
import { generateGeminiSpeech } from '../api';

export default function InlineSymptomChecker({
  currentLanguage,
  onLanguageChange,
  onAnalyze,
  loading,
  currentReport,
  currentPatientInfo,
  onDownloadPdf,
  onResetReport,
  isLoggedIn,
  onOpenAuth,
  onStartLiveVoice,
  translations
}) {
  const [symptomsText, setSymptomsText] = useState('');
  const [interimSpokenText, setInterimSpokenText] = useState('');
  const [ageGroup, setAgeGroup] = useState('Adult');
  const [duration, setDuration] = useState('2');
  const [isListening, setIsListening] = useState(false);

  // Gemini Voice Narration State for In-Place Report
  const [isSpeakingReport, setIsSpeakingReport] = useState(false);
  const [isSynthesizingReport, setIsSynthesizingReport] = useState(false);
  const reportAudioRef = useRef(null);
  const reportCleanupRef = useRef(null);
  
  const speechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const recognitionRef = useRef(null);

  // Stop Report Audio
  const stopReportAudio = () => {
    if (reportAudioRef.current) {
      try {
        reportAudioRef.current.pause();
        reportAudioRef.current.currentTime = 0;
      } catch (e) {
        console.warn(e);
      }
      reportAudioRef.current = null;
    }
    if (reportCleanupRef.current) {
      try {
        reportCleanupRef.current();
      } catch (e) {
        console.warn(e);
      }
      reportCleanupRef.current = null;
    }
    setIsSpeakingReport(false);
    setIsSynthesizingReport(false);
  };

  useEffect(() => {
    return () => {
      stopReportAudio();
    };
  }, []);

  // Play Doctor Voice for Assessment using Gemini Speech
  const handleToggleDoctorVoice = async () => {
    if (isSpeakingReport) {
      stopReportAudio();
      return;
    }

    if (!currentReport) return;

    const speechScript = `${currentReport.primaryAssessment}. ${currentReport.recommendedAction}`;
    setIsSynthesizingReport(true);

    try {
      const { audioUrl, cleanup } = await generateGeminiSpeech(speechScript, 'Aoede');
      reportCleanupRef.current = cleanup;

      const audio = new Audio(audioUrl);
      reportAudioRef.current = audio;

      audio.onended = () => {
        stopReportAudio();
      };

      audio.onerror = (e) => {
        console.warn('Gemini audio playback error:', e);
        stopReportAudio();
      };

      await audio.play();
      setIsSynthesizingReport(false);
      setIsSpeakingReport(true);
    } catch (err) {
      console.warn('Gemini Voice synthesis error in assessment:', err);
      stopReportAudio();
    }
  };

  // Common quick chips
  const quickChips = [
    { key: 'fever', label: translations?.symptoms?.fever || 'Fever' },
    { key: 'cough', label: translations?.symptoms?.cough || 'Dry Cough' },
    { key: 'breath', label: translations?.symptoms?.breath || 'Shortness of breath' },
    { key: 'chest', label: translations?.symptoms?.chest || 'Chest tightness' },
    { key: 'dizziness', label: translations?.symptoms?.dizziness || 'Dizziness' },
    { key: 'headache', label: translations?.symptoms?.headache || 'Headache' },
    { key: 'fatigue', label: translations?.symptoms?.fatigue || 'Fatigue' },
    { key: 'nausea', label: translations?.symptoms?.nausea || 'Nausea' }
  ];

  // Map language to locale
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
    return locales[code] || 'en-IN';
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = getLocaleCode(currentLanguage);

    rec.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (interim) {
        setInterimSpokenText(interim);
      }
      if (finalTranscript) {
        setSymptomsText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        setInterimSpokenText('');
      }
    };

    rec.onerror = (e) => {
      console.warn('Speech recognition notice:', e.error);
      setIsListening(false);
      setInterimSpokenText('');
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimSpokenText('');
    };

    recognitionRef.current = rec;
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLanguage]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimSpokenText('');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Voice typing error:', err);
      }
    }
  };

  const handleChipClick = (chipLabel) => {
    setSymptomsText((prev) => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) return chipLabel;
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

  // Helper for Urgency Styles
  const getUrgencyStyles = (level) => {
    switch (level) {
      case 'EMERGENCY':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-950',
          badge: 'bg-rose-600 text-white',
          pill: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: ShieldAlert,
          title: 'CRITICAL EMERGENCY'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          badge: 'bg-amber-500 text-white',
          pill: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertTriangle,
          title: 'MODERATE / CLINICAL CONSULT RECOMMENDED'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badge: 'bg-emerald-600 text-white',
          pill: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: CheckCircle2,
          title: 'LOW / ROUTINE GUIDANCE'
        };
    }
  };

  const hasResult = currentReport && currentPatientInfo;
  const urgencyStyles = hasResult ? getUrgencyStyles(currentReport.urgencyLevel) : null;
  const UrgencyIcon = urgencyStyles ? urgencyStyles.icon : null;

  return (
    <section id="symptom-checker" className="py-12 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-white relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-3.5 py-1 text-xs font-bold text-teal-800 mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>AI Symptom Intake & Manual Entry</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Manual Symptom Entry & AI Triage
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Enter your symptoms directly below—by manual typing, clicking quick clinical tags, or voice dictation—for instant Gemini clinical triage right on this page.
          </p>
        </div>

        {/* Main Checker Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-soft-lg">
          
          {/* Top Bar: Language & Audio Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 sm:px-6 py-3.5 gap-3">
            
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-teal-600" />
                <span>Language:</span>
              </span>
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:border-teal-500 focus:outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Switch to Spoken Doctor Consultation */}
            {onStartLiveVoice && (
              <button
                type="button"
                onClick={onStartLiveVoice}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-800 transition-colors cursor-pointer shadow-xs"
              >
                <Mic className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
                <span>Talk to AI Doctor (Gemini Voice)</span>
              </button>
            )}
          </div>

          <div className="p-5 sm:p-8">
            
            {/* If Report is NOT generated yet, show the Input Form */}
            {!hasResult ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Quick select chips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quick Add Common Symptoms:
                    </label>
                    <span className="text-[10px] text-slate-400">Click to append</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {quickChips.map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => handleChipClick(chip.label)}
                        className="group inline-flex items-center rounded-xl bg-slate-50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-300 shadow-soft-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="text-teal-500 mr-1 font-bold">+</span>
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptom Input Textarea with Microphone */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Describe Your Symptoms (Manual Typing or Voice)
                  </label>
                  
                  <div className="relative">
                    <textarea
                      value={symptomsText}
                      onChange={(e) => setSymptomsText(e.target.value)}
                      placeholder="Type or speak how you are feeling, pain location, fever, duration, or specific concerns..."
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/40 p-4 pb-14 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm sm:text-base shadow-inner transition-all leading-relaxed"
                      required
                    />

                    {/* Microphone Toggle Inside Textarea */}
                    {speechSupported ? (
                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        {isListening && (
                          <span className="flex items-center gap-1 text-xs font-bold text-rose-600 animate-pulse bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                            <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                            Listening
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`flex h-9 sm:h-10 items-center justify-center rounded-xl px-3 sm:px-4 text-xs font-bold transition-all cursor-pointer shadow-soft-sm ${
                            isListening
                              ? 'bg-rose-600 text-white shadow-rose-600/30'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50'
                          }`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span>Listening... Stop</span>
                            </>
                          ) : (
                            <>
                              <Mic className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
                              <span>Speak Symptoms</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="absolute right-3 bottom-3 text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Speech typing unavailable
                      </div>
                    )}
                  </div>

                  {/* PROMINENT LIVE DISPLAY WHEN SPEAKING */}
                  {isListening && (
                    <div className="mt-2.5 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-3.5 text-xs text-emerald-950 font-semibold shadow-xs animate-in fade-in">
                      <div className="flex items-center gap-2 mb-1 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                        </span>
                        <span>You are saying (Live Speech Transcription):</span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-emerald-950">
                        {interimSpokenText ? (
                          <span>"{interimSpokenText}"<span className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" /></span>
                        ) : (
                          <span className="text-emerald-700/80 font-medium italic">
                            Speak clearly into your microphone...
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Patient Demographic Context Grid */}
                <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                  
                  {/* Age Group */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-3.5 sm:p-4">
                    <label htmlFor="inlineAgeGroup" className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-teal-600" />
                      <span>Patient Age Group</span>
                    </label>
                    <select
                      id="inlineAgeGroup"
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-soft-sm min-h-[42px]"
                    >
                      <option value="Child">Child (0-12 years)</option>
                      <option value="Teenager">Teenager (13-19 years)</option>
                      <option value="Adult">Adult (20-64 years)</option>
                      <option value="Senior">Senior (65+ years)</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-3.5 sm:p-4">
                    <label htmlFor="inlineDuration" className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
                      <span>Symptom Duration (Days)</span>
                    </label>
                    
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[1, 2, 3, 5, 7].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDuration(String(day))}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer min-h-[32px] ${
                            Number(duration) === day
                              ? 'bg-teal-600 border-teal-600 text-white shadow-soft-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {day === 7 ? '7+ Days' : `${day} ${day === 1 ? 'Day' : 'Days'}`}
                        </button>
                      ))}
                    </div>

                    <input
                      id="inlineDuration"
                      type="number"
                      min="0"
                      max="365"
                      placeholder="Custom days (e.g. 10)..."
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium shadow-soft-sm min-h-[40px]"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading || !symptomsText.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-4 text-sm sm:text-base font-bold text-white shadow-soft-lg shadow-glow-teal hover:from-teal-500 hover:to-emerald-500 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer min-h-[48px]"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-white" />
                      <span>Analyzing symptoms with Gemini Clinical AI...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Run AI Clinical Triage</span>
                      <Send className="h-4 w-4" />
                    </div>
                  )}
                </button>
              </form>
            ) : (
              /* If Report IS generated, display it directly in-place! */
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Result Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Assessment Session #{currentPatientInfo.id}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Clinical Triage Evaluation
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      stopReportAudio();
                      onResetReport();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft-sm self-start sm:self-auto cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-teal-600" />
                    <span>Check Other Symptoms</span>
                  </button>
                </div>

                {/* Urgency Classification Card */}
                <div className={`rounded-2xl border p-5 sm:p-6 shadow-soft-sm ${urgencyStyles.bg}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${urgencyStyles.badge}`}>
                      <UrgencyIcon className="h-4 w-4" />
                      <span>{urgencyStyles.title}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                      Stratification Level
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Primary Assessment
                      </h4>
                      
                      {/* Gemini Voice Narration Button */}
                      <button
                        type="button"
                        onClick={handleToggleDoctorVoice}
                        disabled={isSynthesizingReport}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200/80 px-3 py-1 text-xs font-bold text-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer"
                        title="Listen to Doctor Assessment spoken by Gemini AI"
                      >
                        {isSynthesizingReport ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 text-teal-600 animate-spin" />
                            <span>Synthesizing Gemini Voice...</span>
                          </>
                        ) : isSpeakingReport ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
                            <span className="text-rose-700 font-extrabold">Stop Gemini Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5 text-teal-600" />
                            <span>Listen (Gemini Voice)</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="mt-1 text-base sm:text-lg font-bold leading-relaxed">
                      {currentReport.primaryAssessment}
                    </p>
                  </div>
                </div>

                {/* Symptoms Reviewed */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Analyzed Symptoms
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    "{currentPatientInfo.symptoms}"
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Age Group: {currentPatientInfo.ageGroup} • Duration: {currentPatientInfo.duration} days • Language: {currentPatientInfo.language}
                  </p>
                </div>

                {/* Clinical Terms */}
                {currentReport.clinicalTerms && currentReport.clinicalTerms.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                      <span>Standard Clinical Terms</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentReport.clinicalTerms.map((term, i) => (
                        <span key={i} className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contributing Factors */}
                {currentReport.contributingFactors && currentReport.contributingFactors.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Contributing Factors</span>
                    </h4>
                    <div className="space-y-1.5">
                      {currentReport.contributingFactors.map((factor, idx) => (
                        <div key={idx} className="flex items-start rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-xs text-slate-700 font-medium">
                          <ChevronRight className="h-3.5 w-3.5 text-teal-600 mt-0.5 mr-1.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Action */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                    <span>Recommended Care Action</span>
                  </h4>
                  <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-4 text-xs sm:text-sm font-semibold text-teal-950 leading-relaxed">
                    👉 {currentReport.recommendedAction}
                  </div>
                </div>

                {/* Download PDF & Auth Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    <span>Clinical decision support summary ready.</span>
                  </div>

                  {isLoggedIn ? (
                    <button
                      onClick={onDownloadPdf}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-soft hover:bg-slate-800 active:scale-95 transition-all cursor-pointer min-h-[44px]"
                    >
                      <FileDown className="h-4 w-4" />
                      <span>Download Clinical PDF</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenAuth}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-soft hover:from-teal-500 hover:to-emerald-500 active:scale-95 transition-all cursor-pointer min-h-[44px]"
                    >
                      <span>Sign In to Download Official PDF</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
