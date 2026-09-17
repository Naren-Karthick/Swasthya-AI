import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Globe, 
  Mic, 
  MicOff, 
  Send, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileDown, 
  Copy, 
  Check, 
  UserCheck, 
  CalendarDays, 
  Stethoscope, 
  ChevronRight, 
  RefreshCw, 
  Sliders, 
  BookmarkCheck
} from 'lucide-react';
import { languages } from '../localization';
import { SAMPLE_CASES, getSampleCaseById } from '../data/sampleCases';
import EmergencyActionBanner from './EmergencyActionBanner';
import AudioNarrationPlayer from './AudioNarrationPlayer';
import { stopSpeech } from '../utils/speechEngine';

export default function SymptomCheckerFlow({
  currentLanguage,
  onLanguageChange,
  onAnalyze,
  loading,
  currentReport,
  currentPatientInfo,
  onDownloadPdf,
  onResetReport,
  onStartLiveVoice,
  translations,
  onSelectSampleCaseDirect,
  onBackToHome
}) {
  // 4-Step Navigation: 1 = Intake, 2 = Context & Red Flags, 3 = Urgency Result, 4 = Doctor Handoff
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 States
  const [symptomsText, setSymptomsText] = useState('');
  const [interimSpokenText, setInterimSpokenText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);

  // Step 2 States
  const [ageGroup, setAgeGroup] = useState('Adult');
  const [duration, setDuration] = useState('2');
  const [severity, setSeverity] = useState(5); // 1-10
  const [redFlagAnswers, setRedFlagAnswers] = useState({
    chestPainOrBreathing: false,
    strokeSigns: false,
    severeBleeding: false,
    confusionOrUnconscious: false
  });

  // UI Feedback States
  const [inlineError, setInlineError] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);

  // Speech Recognition Ref
  const speechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const recognitionRef = useRef(null);

  // Sync state if currentReport is set externally or from sample
  useEffect(() => {
    if (currentReport && currentPatientInfo) {
      setCurrentStep(3);
    }
  }, [currentReport, currentPatientInfo]);

  // Clean up any running speech when step changes or on unmount
  useEffect(() => {
    stopSpeech();
  }, [currentStep]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    if (!speechSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;

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
    rec.lang = locales[currentLanguage] || 'en-IN';

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
      if (interim) setInterimSpokenText(interim);
      if (finalTranscript) {
        setSymptomsText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        setInterimSpokenText('');
      }
    };

    rec.onerror = (e) => {
      setIsListening(false);
      setInterimSpokenText('');
      if (e.error === 'not-allowed') {
        setInlineError('Microphone permission was denied. Please allow microphone access or type your symptoms.');
      }
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimSpokenText('');
    };

    recognitionRef.current = rec;
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [currentLanguage, speechSupported]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      setInlineError('Voice typing is not supported in this browser. Please type your symptoms.');
      return;
    }

    setInlineError(null);
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimSpokenText('');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Voice start error:', err);
      }
    }
  };

  // Quick Symptom Chips
  const quickChips = [
    { key: 'chest', label: translations?.symptoms?.chest || 'Chest tightness' },
    { key: 'breath', label: translations?.symptoms?.breath || 'Shortness of breath' },
    { key: 'fever', label: translations?.symptoms?.fever || 'High Fever' },
    { key: 'cough', label: translations?.symptoms?.cough || 'Dry Cough' },
    { key: 'headache', label: translations?.symptoms?.headache || 'Severe Headache' },
    { key: 'dizziness', label: translations?.symptoms?.dizziness || 'Dizziness / Vertigo' },
    { key: 'sprain', label: 'Joint / Ankle pain' },
    { key: 'fatigue', label: translations?.symptoms?.fatigue || 'Body Fatigue' }
  ];

  const handleAppendChip = (label) => {
    setInlineError(null);
    setSymptomsText(prev => {
      const clean = prev.trim();
      if (!clean) return label;
      return `${clean}, ${label}`;
    });
  };

  // Select a deterministic sample case
  const handleSelectSample = (sampleCase) => {
    setSelectedSampleId(sampleCase.id);
    setSymptomsText(sampleCase.symptomsText);
    setAgeGroup(sampleCase.patientContext.ageGroup);
    setDuration(sampleCase.patientContext.duration);
    setSeverity(sampleCase.patientContext.severity);
    if (sampleCase.patientContext.languageCode) {
      onLanguageChange(sampleCase.patientContext.languageCode);
    }
    setRedFlagAnswers({
      chestPainOrBreathing: sampleCase.id === 'case-chest-pain',
      strokeSigns: sampleCase.id === 'case-stroke-fast',
      severeBleeding: false,
      confusionOrUnconscious: false
    });
    setSampleModalOpen(false);
    setInlineError(null);

    // Call callback to load sample assessment directly
    if (onSelectSampleCaseDirect) {
      onSelectSampleCaseDirect(sampleCase);
    }
  };

  // Step 1 validation & proceed
  const handleProceedToStep2 = () => {
    if (!symptomsText.trim()) {
      setInlineError('Please describe your symptoms by typing, speaking, or selecting a sample case below.');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setInlineError(null);
    setCurrentStep(2);
  };

  // Step 2 submit & analyze
  const handleRunTriage = async (e) => {
    if (e) e.preventDefault();
    setInlineError(null);

    // Check if any critical red flag was checked
    const hasActiveRedFlag = Object.values(redFlagAnswers).some(Boolean);

    try {
      await onAnalyze(
        symptomsText, 
        ageGroup, 
        duration, 
        severity, 
        { ...redFlagAnswers, hasActiveRedFlag },
        selectedSampleId ? getSampleCaseById(selectedSampleId) : null
      );
      setCurrentStep(3);
    } catch (err) {
      console.error('Triage run error:', err);
      setInlineError('An error occurred during triage assessment. Please check your connection or retry.');
    }
  };

  // Reset check
  const handleStartNewCheck = () => {
    stopSpeech();
    setCurrentStep(1);
    setSymptomsText('');
    setInterimSpokenText('');
    setSelectedSampleId(null);
    setInlineError(null);
    setCopiedSummary(false);
    setRedFlagAnswers({
      chestPainOrBreathing: false,
      strokeSigns: false,
      severeBleeding: false,
      confusionOrUnconscious: false
    });
    onResetReport();
  };

  // Copy Summary Handler
  const handleCopySummary = async () => {
    if (!currentReport || !currentPatientInfo) return;
    const text = `
SWASTHYA AI — CLINICAL TRIAGE SUMMARY
Session ID: ${currentPatientInfo.id}
Date: ${new Date(currentPatientInfo.date || Date.now()).toLocaleDateString()}
Urgency Level: ${currentReport.urgencyState || currentReport.urgencyLevel}
Recommended Timeframe: ${currentReport.recommendedTimeframe || 'Prompt attention'}

PATIENT INFORMATION:
- Age Group: ${currentPatientInfo.ageGroup}
- Duration: ${currentPatientInfo.duration} days
- Reported Symptoms: ${currentPatientInfo.symptoms}

PRIMARY ASSESSMENT:
${currentReport.primaryAssessment}

RECOMMENDED ACTION:
${currentReport.recommendedAction}

LIMITATIONS & DISCLAIMER:
${currentReport.limitations || 'Informational triage guidance only. Not a medical diagnosis.'}
`.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (e) {
      console.warn('Failed to copy', e);
    }
  };

  // Urgency Visual Styling
  const getUrgencyConfig = (urgencyLevel, urgencyState) => {
    const isEmerg = urgencyLevel === 'EMERGENCY' || (urgencyState && urgencyState.toLowerCase().includes('emergency'));
    const isModerate = urgencyLevel === 'MODERATE' || (urgencyState && urgencyState.toLowerCase().includes('soon'));

    if (isEmerg) {
      return {
        badgeBg: 'bg-rose-600 text-white',
        cardBorder: 'border-rose-300 bg-rose-50/70',
        title: 'Emergency — act now',
        icon: ShieldAlert,
        accentColor: 'rose',
        timeframe: currentReport?.recommendedTimeframe || 'Immediate emergency medical care required'
      };
    } else if (isModerate) {
      return {
        badgeBg: 'bg-amber-600 text-white',
        cardBorder: 'border-amber-300 bg-amber-50/70',
        title: 'See a clinician soon',
        icon: AlertTriangle,
        accentColor: 'amber',
        timeframe: currentReport?.recommendedTimeframe || 'Within 24 to 48 hours'
      };
    } else {
      return {
        badgeBg: 'bg-teal-700 text-white',
        cardBorder: 'border-teal-300 bg-teal-50/70',
        title: 'Routine monitoring',
        icon: CheckCircle2,
        accentColor: 'teal',
        timeframe: currentReport?.recommendedTimeframe || 'Self-care & monitor over next 2–3 days'
      };
    }
  };

  const urgencyConfig = currentReport ? getUrgencyConfig(currentReport.urgencyLevel, currentReport.urgencyState) : null;
  const UrgencyIcon = urgencyConfig ? urgencyConfig.icon : null;
  const isEmergency = currentReport?.isEmergency || currentReport?.urgencyLevel === 'EMERGENCY';

  return (
    <section 
      id="symptom-checker" 
      className="py-10 sm:py-16 bg-gradient-to-b from-white via-slate-50 to-white relative"
      aria-label="Symptom Check & Clinical Urgency Guidance"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading with Plain Senior-Friendly Language */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-4 py-1 text-xs font-extrabold text-teal-900 mb-2.5 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>4-Step Urgency & Triage Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Check Your Symptoms Safely
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Answer a few quick questions in your language. We will guide you on whether you need emergency care, a doctor visit, or home rest.
          </p>
        </div>

        {/* Accessible Stepper Indicator */}
        <nav aria-label="Progress" className="mb-6 sm:mb-8">
          <ol className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            {[
              { num: 1, label: '1. Describe', desc: 'Symptoms' },
              { num: 2, label: '2. Check', desc: 'Red Flags' },
              { num: 3, label: '3. Result', desc: 'Urgency' },
              { num: 4, label: '4. Summary', desc: 'For Doctor' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <li 
                  key={step.num}
                  className={`rounded-2xl p-2.5 sm:p-3 border transition-all ${
                    isActive 
                      ? 'border-teal-600 bg-teal-50/80 shadow-soft-sm' 
                      : isDone 
                      ? 'border-emerald-300 bg-emerald-50/50' 
                      : 'border-slate-200 bg-white opacity-70'
                  }`}
                >
                  <div className={`text-xs sm:text-sm font-black ${
                    isActive ? 'text-teal-900' : isDone ? 'text-emerald-800' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                    {step.desc}
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Main Flow Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft-lg">

          {/* Top Bar: Language & Sample Case Selector (Accessible & High Contrast for Elderly) */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 sm:px-6 py-3.5 gap-3">
            
            {/* Back to Home & Language Selector */}
            <div className="flex items-center gap-2.5">
              {onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 min-h-[44px] cursor-pointer shadow-xs transition-colors"
                  aria-label="Back to Home / Details"
                >
                  <ArrowLeft className="h-4 w-4 text-teal-700" />
                  <span>Home</span>
                </button>
              )}

              <label htmlFor="flowLanguageSelect" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-teal-600" />
                <span>Language:</span>
              </label>
              <select
                id="flowLanguageSelect"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none cursor-pointer min-h-[44px]"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName ? `${l.nativeName} (${l.name})` : l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fictional Sample Case Quick Trigger (Judge Demo Button) */}
            <button
              type="button"
              onClick={() => setSampleModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-950 transition-colors cursor-pointer shadow-xs min-h-[44px]"
            >
              <BookmarkCheck className="h-4 w-4 text-amber-700" />
              <span>Try a Sample Case (60s Demo)</span>
            </button>
          </div>

          {/* Accessible Inline Error Banner */}
          {inlineError && (
            <div 
              role="alert" 
              className="mx-4 sm:mx-6 mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs sm:text-sm text-rose-900 font-semibold"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{inlineError}</span>
              </div>
              <button 
                onClick={() => setInlineError(null)}
                className="text-rose-600 hover:text-rose-900 font-black text-sm px-1 cursor-pointer"
                aria-label="Dismiss message"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Sample Banner if a Fictional Case is Selected */}
          {selectedSampleId && (
            <div className="mx-4 sm:mx-6 mt-4 flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-950">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                  Demo
                </span>
                <span>Interactive demo — fictional case active</span>
              </div>
              <button
                type="button"
                onClick={handleStartNewCheck}
                className="text-xs text-amber-800 underline hover:text-amber-950 font-extrabold cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          <div className="p-5 sm:p-8">

            {/* ========================================================================= */}
            {/* STEP 1: INTAKE & SYMPTOM DESCRIPTION */}
            {/* ========================================================================= */}
            {currentStep === 1 && (
              <div className="space-y-6">

                {/* Common quick symptom chips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700">
                      Tap Common Symptoms to Add:
                    </span>
                    <span className="text-xs text-slate-400">One tap adds to box</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickChips.map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => handleAppendChip(chip.label)}
                        className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 hover:border-teal-400 shadow-soft-sm active:scale-95 transition-all cursor-pointer min-h-[44px]"
                      >
                        <span className="text-teal-600 mr-1.5 font-black text-sm">+</span>
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Accessible Textarea */}
                <div>
                  <label htmlFor="symptomsTextInput" className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Describe How You Are Feeling (Type or Speak)
                  </label>

                  <div className="relative">
                    <textarea
                      id="symptomsTextInput"
                      value={symptomsText}
                      onChange={(e) => {
                        setSymptomsText(e.target.value);
                        if (inlineError) setInlineError(null);
                      }}
                      placeholder="Example: I have had a severe headache and fever for 2 days, feeling dizzy and weak..."
                      rows={4}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/40 p-4 pb-16 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none text-base sm:text-lg shadow-inner leading-relaxed"
                      required
                    />

                    {/* Microphone Dictation Trigger */}
                    {speechSupported ? (
                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        {isListening && (
                          <span className="flex items-center gap-1.5 text-xs font-extrabold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 animate-pulse">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping" />
                            Listening...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`flex items-center justify-center rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] shadow-soft-sm ${
                            isListening
                              ? 'bg-rose-600 text-white'
                              : 'bg-white text-teal-800 border-2 border-teal-600 hover:bg-teal-50'
                          }`}
                          aria-label={isListening ? 'Stop listening' : 'Start microphone voice typing'}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="mr-1.5 h-4 w-4" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Mic className="mr-1.5 h-4 w-4 text-teal-600" />
                              <span>Speak Symptoms</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="absolute right-3 bottom-3 text-xs text-slate-400">
                        Voice typing unavailable
                      </div>
                    )}
                  </div>

                  {/* Prominent Live Speech Transcription Feedback */}
                  {isListening && (
                    <div className="mt-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-emerald-950 font-bold shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-800 mb-1">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                        </span>
                        <span>Hearing your voice:</span>
                      </div>
                      <p className="text-base sm:text-lg">
                        {interimSpokenText || 'Speak clearly into your device microphone...'}
                      </p>
                    </div>
                  )}

                  {/* Prefer Direct Voice Consultation Link */}
                  {onStartLiveVoice && (
                    <div className="mt-3 flex items-center justify-between px-1 text-xs text-slate-500">
                      <span>Prefer conversational voice interview?</span>
                      <button
                        type="button"
                        onClick={onStartLiveVoice}
                        className="inline-flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                      >
                        <Mic className="h-3.5 w-3.5" />
                        <span>Launch Voice Assistant</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 1 Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSampleModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[48px]"
                  >
                    <BookmarkCheck className="h-4 w-4 text-teal-600" />
                    <span>Or Pick a Sample Case</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-3.5 text-base font-extrabold text-white shadow-soft-lg hover:from-teal-500 hover:to-emerald-500 active:scale-95 transition-all cursor-pointer min-h-[48px]"
                  >
                    <span>Next: Check Context & Red Flags</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: CONTEXT & RED FLAGS */}
            {/* ========================================================================= */}
            {currentStep === 2 && (
              <form onSubmit={handleRunTriage} className="space-y-6">

                <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 text-xs sm:text-sm text-teal-950 font-bold">
                  <span>Reviewed Symptoms: </span>
                  <span className="font-normal italic">"{symptomsText}"</span>
                </div>

                {/* Age & Duration Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  
                  {/* Age Group */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                    <label htmlFor="flowAgeGroup" className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <UserCheck className="h-4 w-4 text-teal-600" />
                      <span>Patient Age Group</span>
                    </label>
                    <select
                      id="flowAgeGroup"
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm sm:text-base font-bold text-slate-900 focus:border-teal-600 focus:outline-none cursor-pointer min-h-[48px]"
                    >
                      <option value="Senior (65+ years)">Senior (65+ years) — High Priority</option>
                      <option value="Adult (20-64 years)">Adult (20-64 years)</option>
                      <option value="Teenager (13-19 years)">Teenager (13-19 years)</option>
                      <option value="Child (0-12 years)">Child (0-12 years)</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                    <label htmlFor="flowDuration" className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <CalendarDays className="h-4 w-4 text-teal-600" />
                      <span>Duration (How many days?)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[1, 2, 3, 5, 7].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(String(d))}
                          className={`rounded-xl px-3 py-1.5 text-xs font-extrabold border transition-all cursor-pointer min-h-[38px] ${
                            Number(duration) === d
                              ? 'bg-teal-600 border-teal-600 text-white shadow-soft-sm'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {d === 7 ? '7+ Days' : `${d} ${d === 1 ? 'Day' : 'Days'}`}
                        </button>
                      ))}
                    </div>
                    <input
                      id="flowDuration"
                      type="number"
                      min="1"
                      max="365"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Severity Rating (1-10) */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="severityRange" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <Sliders className="h-4 w-4 text-teal-600" />
                      <span>Symptom Discomfort Level: {severity}/10</span>
                    </label>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      severity >= 8 ? 'bg-rose-100 text-rose-800' :
                      severity >= 5 ? 'bg-amber-100 text-amber-900' :
                      'bg-teal-100 text-teal-900'
                    }`}>
                      {severity >= 8 ? 'Severe' : severity >= 5 ? 'Moderate' : 'Mild'}
                    </span>
                  </div>
                  <input
                    id="severityRange"
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-bold mt-1">
                    <span>1 (Very Mild)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Extremely Severe)</span>
                  </div>
                </div>

                {/* Critical Red-Flag Yes/No Screening Questions */}
                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="h-5 w-5 text-rose-600" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-950">
                      Emergency Red Flag Screening (Answer Carefully)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'chestPainOrBreathing',
                        label: 'Crushing chest pressure, pain radiating to left arm/jaw, or severe breathing struggle?'
                      },
                      {
                        key: 'strokeSigns',
                        label: 'Sudden face drooping, one-sided arm weakness, or slurred speech?'
                      },
                      {
                        key: 'severeBleeding',
                        label: 'Heavy uncontrolled bleeding, vomiting blood, or severe head trauma?'
                      },
                      {
                        key: 'confusionOrUnconscious',
                        label: 'Fainting, altered mental state, or sudden inability to wake someone?'
                      }
                    ].map((item) => (
                      <div 
                        key={item.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-white p-3 border border-rose-100 shadow-xs"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.label}
                        </span>
                        <div className="flex gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setRedFlagAnswers(prev => ({ ...prev, [item.key]: true }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer min-h-[36px] ${
                              redFlagAnswers[item.key]
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-rose-50'
                            }`}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            onClick={() => setRedFlagAnswers(prev => ({ ...prev, [item.key]: false }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer min-h-[36px] ${
                              !redFlagAnswers[item.key]
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2 Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[48px]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Symptoms</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-3.5 text-base font-extrabold text-white shadow-soft-lg hover:from-teal-500 hover:to-emerald-500 active:scale-95 transition-all cursor-pointer min-h-[48px] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-white" />
                        <span>Evaluating Clinical Guidance...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Get Urgency Guidance</span>
                        <Send className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                </div>

              </form>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: URGENCY RESULT CARD */}
            {/* ========================================================================= */}
            {currentStep === 3 && currentReport && currentPatientInfo && (
              <div className="space-y-6">

                {/* HIGHEST VISUAL PRIORITY: Emergency Alert Banner if Emergency */}
                {isEmergency && (
                  <EmergencyActionBanner 
                    detectedWarningSigns={currentReport.detectedWarningSigns || currentReport.contributingFactors}
                    customWarningMessage={currentReport.recommendedAction}
                    currentLanguage={currentLanguage}
                  />
                )}

                {/* Single Authoritative Senior-Accessible Audio Narration Player */}
                <AudioNarrationPlayer
                  textToSpeak={
                    isEmergency
                      ? `Emergency alert: Immediate clinical medical evaluation is advised. ${currentReport.primaryAssessment}. Recommended immediate action: ${currentReport.recommendedAction}.`
                      : `Urgency level: ${urgencyConfig.title}. ${currentReport.primaryAssessment}. Recommended action: ${currentReport.recommendedAction}.`
                  }
                  currentLanguage={currentLanguage}
                  label="Listen to Assessment Aloud (आवाज़ में सुनें)"
                  variant="banner"
                />

                {/* Urgency Classification Card */}
                <div className={`rounded-3xl border-2 p-5 sm:p-7 shadow-soft-sm ${urgencyConfig.cardBorder}`}>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-1.5 text-sm font-black uppercase tracking-wider ${urgencyConfig.badgeBg}`}>
                      {UrgencyIcon && <UrgencyIcon className="h-5 w-5" />}
                      <span>{urgencyConfig.title}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full">
                      Triage Stratification Level
                    </span>
                  </div>

                  {/* Recommended Timeframe */}
                  <div className="mt-3 rounded-2xl bg-white/90 border border-slate-200/80 p-3.5">
                    <div className="text-xs font-black uppercase text-slate-500">
                      Recommended Care Timeframe:
                    </div>
                    <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      ⏱️ {urgencyConfig.timeframe}
                    </div>
                  </div>

                  {/* Primary Assessment */}
                  <div className="mt-4">
                    <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                      Clinical Assessment Overview:
                    </h3>
                    <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      {currentReport.primaryAssessment}
                    </p>
                  </div>
                </div>

                {/* Next Steps & Concrete Actions */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    <span>Recommended Next Actions:</span>
                  </h4>
                  <div className="rounded-xl bg-white p-3.5 border border-slate-200 mb-3 text-sm font-bold text-slate-900 leading-relaxed">
                    👉 {currentReport.recommendedAction}
                  </div>
                  {currentReport.nextActions && (
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium">
                      {currentReport.nextActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Standard Clinical Terms */}
                {currentReport.clinicalTerms && currentReport.clinicalTerms.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Stethoscope className="h-4 w-4 text-teal-600" />
                      <span>Standard Clinical Terms for Clinician:</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentReport.clinicalTerms.map((term, i) => (
                        <span key={i} className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-extrabold text-slate-800">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transparent Medical Limitations & Disclaimer */}
                <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3.5 text-xs text-slate-600 leading-relaxed font-medium">
                  <strong>Limitations & Safety Note: </strong>
                  {currentReport.limitations || 'This assessment is generated algorithmically for informational triage purposes and does not substitute for clinical medical diagnosis, prescription, or in-person evaluation.'}
                </div>

                {/* Step 3 Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[48px]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Edit Context</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartNewCheck}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[48px]"
                    >
                      <RotateCcw className="h-4 w-4 text-teal-600" />
                      <span>Start New Check</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-soft-md hover:bg-slate-800 active:scale-95 transition-all cursor-pointer min-h-[48px]"
                  >
                    <span>View Clinician Handoff & PDF</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: CLINICIAN HANDOFF & PDF DOWNLOAD */}
            {/* ========================================================================= */}
            {currentStep === 4 && currentReport && currentPatientInfo && (
              <div className="space-y-6">

                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Physician Handoff Summary
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      Standardized SBAR Note
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <AudioNarrationPlayer
                      textToSpeak={`Physician handoff for session ${currentPatientInfo.id}. Urgency: ${currentReport.urgencyState || currentReport.urgencyLevel}. Assessment: ${currentReport.primaryAssessment}. Action plan: ${currentReport.recommendedAction}.`}
                      currentLanguage={currentLanguage}
                      label="Listen to SBAR Note"
                      variant="compact"
                    />
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      Session #{currentPatientInfo.id}
                    </span>
                  </div>
                </div>

                {/* Structured Clinical Handoff Sheet */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 space-y-4 font-sans text-xs sm:text-sm text-slate-800">
                  
                  {/* Situation */}
                  <div className="border-b border-slate-200/80 pb-3">
                    <span className="font-extrabold uppercase tracking-wider text-teal-800 block text-xs">
                      1. Situation & Demographics
                    </span>
                    <p className="mt-1 font-bold text-slate-900 text-sm sm:text-base">
                      {currentPatientInfo.ageGroup} patient presenting with symptoms of duration {currentPatientInfo.duration} days.
                    </p>
                    <p className="mt-1 text-slate-600">
                      Language Mode: {currentPatientInfo.language} • Urgency Level: {currentReport.urgencyState || currentReport.urgencyLevel}
                    </p>
                  </div>

                  {/* Background / Symptoms */}
                  <div className="border-b border-slate-200/80 pb-3">
                    <span className="font-extrabold uppercase tracking-wider text-teal-800 block text-xs">
                      2. Background & Reported Symptoms
                    </span>
                    <p className="mt-1 font-semibold text-slate-900 bg-white p-3 rounded-xl border border-slate-200">
                      "{currentPatientInfo.symptoms}"
                    </p>
                  </div>

                  {/* Assessment */}
                  <div className="border-b border-slate-200/80 pb-3">
                    <span className="font-extrabold uppercase tracking-wider text-teal-800 block text-xs">
                      3. Algorithmic Assessment
                    </span>
                    <p className="mt-1 font-semibold text-slate-900 leading-relaxed">
                      {currentReport.primaryAssessment}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <span className="font-extrabold uppercase tracking-wider text-teal-800 block text-xs">
                      4. Triage Recommendation & Timeframe
                    </span>
                    <p className="mt-1 font-bold text-slate-900">
                      👉 {currentReport.recommendedAction}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Timeframe: {currentReport.recommendedTimeframe || 'Standard consultation'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons for Handoff & PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  
                  {/* Download PDF Button */}
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white py-4 px-6 font-extrabold text-sm sm:text-base shadow-soft-md transition-all cursor-pointer min-h-[52px]"
                  >
                    <FileDown className="h-5 w-5 text-teal-400" />
                    <span>Download Doctor-Ready PDF</span>
                  </button>

                  {/* Copy Summary Button */}
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-900 py-4 px-6 font-extrabold text-sm sm:text-base shadow-soft-sm transition-all cursor-pointer min-h-[52px]"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="h-5 w-5 text-emerald-600" />
                        <span className="text-emerald-700">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5 text-slate-600" />
                        <span>Copy Summary Text</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Reset or Edit */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    ← Back to Urgency Result
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNewCheck}
                    className="font-extrabold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                  >
                    Start Another Health Check
                  </button>

                  {onBackToHome && (
                    <button
                      type="button"
                      onClick={onBackToHome}
                      className="font-extrabold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      Return to Home Overview
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* Fictional Sample Case Picker Modal */}
      {sampleModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSampleModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 uppercase">
                  Judge Demo Mode
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  Select a Pre-Configured Fictional Case
                </h3>
                <p className="text-xs text-slate-500">
                  Instant complete results without typing or external API calls.
                </p>
              </div>
              <button
                onClick={() => setSampleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-black p-2 cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {SAMPLE_CASES.map((sc) => {
                const isEmerg = sc.urgencyLevel === 'EMERGENCY';
                return (
                  <div
                    key={sc.id}
                    onClick={() => handleSelectSample(sc)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-soft-md ${
                      isEmerg ? 'border-rose-300 bg-rose-50/50 hover:bg-rose-50' :
                      sc.urgencyLevel === 'MODERATE' ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50' :
                      'border-teal-300 bg-teal-50/50 hover:bg-teal-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase ${
                        isEmerg ? 'bg-rose-600 text-white' :
                        sc.urgencyLevel === 'MODERATE' ? 'bg-amber-600 text-white' :
                        'bg-teal-700 text-white'
                      }`}>
                        {sc.badge}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {sc.category} • {sc.patientContext.ageGroup}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {sc.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                      "{sc.symptomsText}"
                    </p>
                    <div className="mt-2 text-[11px] font-bold text-teal-700 flex items-center gap-1">
                      <span>Click to load instant demo evaluation →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
