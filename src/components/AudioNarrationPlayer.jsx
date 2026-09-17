import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RefreshCw, Radio } from 'lucide-react';
import { 
  speakAssessmentText, 
  stopSpeech, 
  AUDIO_LABELS 
} from '../utils/speechEngine';

export default function AudioNarrationPlayer({
  textToSpeak,
  currentLanguage = 'en',
  label,
  variant = 'banner', // 'banner' | 'button' | 'compact'
  className = ''
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeEngine, setActiveEngine] = useState(null); // 'gemini' | 'browser' | null
  const isMountedRef = useRef(true);

  const langLabels = AUDIO_LABELS[currentLanguage] || AUDIO_LABELS.en;

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopSpeech();
    };
  }, []);

  // Stop running audio if text or language changes
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [textToSpeak, currentLanguage]);

  const handleTogglePlay = async () => {
    if (isSpeaking || isSynthesizing) {
      stopSpeech();
      setIsSpeaking(false);
      setIsSynthesizing(false);
      setActiveEngine(null);
      return;
    }

    if (!textToSpeak || !textToSpeak.trim()) return;

    setIsSynthesizing(true);

    try {
      await speakAssessmentText(textToSpeak, {
        language: currentLanguage,
        voiceName: 'Aoede',
        onStart: (engine) => {
          if (!isMountedRef.current) return;
          setIsSynthesizing(false);
          setIsSpeaking(true);
          setActiveEngine(engine);
        },
        onEnd: () => {
          if (!isMountedRef.current) return;
          setIsSpeaking(false);
          setIsSynthesizing(false);
          setActiveEngine(null);
        },
        onError: () => {
          if (!isMountedRef.current) return;
          setIsSpeaking(false);
          setIsSynthesizing(false);
          setActiveEngine(null);
        }
      });
    } catch (err) {
      console.warn('Audio narration toggle notice:', err);
      if (isMountedRef.current) {
        setIsSpeaking(false);
        setIsSynthesizing(false);
        setActiveEngine(null);
      }
    }
  };

  // 1. Compact Button Variant
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={isSynthesizing}
        aria-label={isSpeaking ? langLabels.stop : (label || langLabels.listenShort)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer min-h-[38px] active:scale-95 shadow-soft-sm ${
          isSpeaking
            ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
            : 'bg-white border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/70'
        } ${className}`}
      >
        {isSynthesizing ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 text-teal-600 animate-spin" />
            <span>{langLabels.preparing}</span>
          </>
        ) : isSpeaking ? (
          <>
            <VolumeX className="h-4 w-4 text-rose-600 animate-pulse" />
            <span className="text-rose-700 font-extrabold">{langLabels.stop}</span>
            {/* Animated Equalizer Wave */}
            <span className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" />
            </span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 text-teal-600" />
            <span>{label || langLabels.listenShort}</span>
          </>
        )}
      </button>
    );
  }

  // 2. Full Accessible Banner Variant (Default for Step 3 & 4)
  return (
    <div
      className={`rounded-2xl border transition-all p-3 sm:p-4 shadow-soft-sm ${
        isSpeaking
          ? 'border-teal-400 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50'
          : 'border-slate-200/90 bg-white hover:border-teal-200'
      } ${className}`}
      role="region"
      aria-label="Audio Readout"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Speaker icon & descriptive title */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl flex-shrink-0 transition-transform ${
              isSpeaking
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-105'
                : 'bg-teal-50 text-teal-700 border border-teal-100'
            }`}
          >
            {isSpeaking ? (
              <Radio className="h-6 w-6 animate-pulse" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                {isSpeaking ? langLabels.speaking : (label || langLabels.listen)}
              </span>
              {activeEngine && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  {activeEngine === 'gemini' ? 'Gemini AI Voice' : 'Spoken Voice'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isSpeaking
                ? 'Listening to clinical assessment read aloud in your selected language.'
                : 'Designed for elderly patients and auditory review — tap to listen aloud.'}
            </p>
          </div>
        </div>

        {/* Right: Audio Control Button with Touch Target >= 48px */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={isSynthesizing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[48px] active:scale-95 shadow-soft-sm ${
              isSpeaking
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
            }`}
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>{langLabels.preparing}</span>
              </>
            ) : isSpeaking ? (
              <>
                <VolumeX className="h-4 w-4 text-white" />
                <span>{langLabels.stop}</span>
                {/* Audio Wave Bars */}
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2 bg-white rounded-full animate-bounce" />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-teal-400" />
                <span>{langLabels.listenShort}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
