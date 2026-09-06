import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  HeartPulse, 
  ArrowRight, 
  ShieldAlert, 
  RefreshCw, 
  Globe, 
  User,
  Sparkles,
  Volume2
} from 'lucide-react';
import { liveDoctorInitialGreeting, doctorCompletionMessage, completionKeywords, languages } from '../localization';
import { converseDoctorSession, generateGeminiSpeech } from '../api';

export default function LiveVoiceConsultation({
  currentLanguage,
  onLanguageChange,
  onClose,
  onCompleteConsultation
}) {
  const initialGreeting = liveDoctorInitialGreeting[currentLanguage] || liveDoctorInitialGreeting.en;

  // Conversation session state
  const [sessionState, setSessionState] = useState('GREETING'); // 'GREETING' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'COMPLETING'
  const [messages, setMessages] = useState(() => [
    { sender: 'doctor', text: initialGreeting, timestamp: new Date() }
  ]);
  const [interimText, setInterimText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(1);
  const [speechError, setSpeechError] = useState(null);

  // Refs for Web Speech & Web Audio
  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const currentAudioRef = useRef(null);
  const audioCleanupRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const isListeningRef = useRef(false);
  const currentLanguageRef = useRef(currentLanguage);
  const handlePatientSpeechRef = useRef(null);

  useEffect(() => {
    currentLanguageRef.current = currentLanguage;
  }, [currentLanguage]);

  // Get locale for Speech Recognition
  const getLocale = useCallback((code) => {
    const map = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      bn: 'bn-IN',
      mr: 'mr-IN'
    };
    return map[code] || 'en-IN';
  }, []);

  // Stop all active audio elements and cleanup
  const stopAllAudio = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {
        console.warn(e);
      }
      currentAudioRef.current = null;
    }
    if (audioCleanupRef.current) {
      try {
        audioCleanupRef.current();
      } catch (e) {
        console.warn(e);
      }
      audioCleanupRef.current = null;
    }
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  // Browser TTS fallback if Gemini Voice encounters network drop
  const speakWithBrowserTTS = useCallback((text, onEndCallback) => {
    if (!synthRef.current) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      synthRef.current.cancel();
    } catch (e) {
      console.warn(e);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = getLocale(currentLanguageRef.current);
    utterance.lang = targetLocale;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(targetLocale.split('-')[0])) ||
                         voices.find(v => v.lang.includes('IN')) ||
                         null;
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setSessionState('SPEAKING');
    };

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    synthRef.current.speak(utterance);
  }, [getLocale]);

  // Primary: Speak with Gemini AI Audio (Direct Gemini Voice generation)
  const speakText = useCallback(async (text, onEndCallback) => {
    stopAllAudio();
    setSessionState('SPEAKING');

    try {
      // Call Gemini 2.5 TTS directly
      const { audioUrl, cleanup } = await generateGeminiSpeech(text, 'Aoede');
      audioCleanupRef.current = cleanup;

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        stopAllAudio();
        if (onEndCallback) onEndCallback();
      };

      audio.onerror = (err) => {
        console.warn('Gemini audio playback error, falling back to browser voice:', err);
        stopAllAudio();
        speakWithBrowserTTS(text, onEndCallback);
      };

      await audio.play();
    } catch (err) {
      console.warn('Gemini Voice synthesis unavailable, using browser speech fallback:', err);
      speakWithBrowserTTS(text, onEndCallback);
    }
  }, [speakWithBrowserTTS, stopAllAudio]);

  // Audio level visualizer with Web Audio API
  const setupAudioVisualizer = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(1 + (avg / 128) * 1.5);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.warn('Microphone visualizer notice:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.warn(e);
      }
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
  }, []);

  const checkCompletionKeyword = useCallback((text) => {
    const lower = text.toLowerCase();
    return completionKeywords.some(keyword => lower.includes(keyword.toLowerCase()));
  }, []);

  // Finish consultation, speak closing acknowledgment, and pass to clinical triage
  const finishConsultation = useCallback((finalMessages) => {
    setSessionState('COMPLETING');
    stopListening();

    const closingText = doctorCompletionMessage[currentLanguageRef.current] || doctorCompletionMessage.en;
    
    speakText(closingText, () => {
      const patientStatements = finalMessages
        .filter(m => m.sender === 'patient')
        .map(m => m.text)
        .join('. ');

      const fullDialogue = finalMessages
        .map(m => `${m.sender === 'doctor' ? 'Doctor' : 'Patient'}: ${m.text}`)
        .join('\n');

      onCompleteConsultation(patientStatements || 'Reported symptoms from AI doctor audio intake', fullDialogue);
    });
  }, [onCompleteConsultation, speakText, stopListening]);

  // Start Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      setSessionState('LISTENING');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.warn(e);
      }
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = getLocale(currentLanguageRef.current);

    rec.onstart = () => {
      isListeningRef.current = true;
      setSessionState('LISTENING');
      setInterimText('');
      setupAudioVisualizer();
    };

    rec.onresult = (e) => {
      // Accumulate full live transcript from beginning of current speech
      let fullTranscript = '';
      for (let i = 0; i < e.results.length; ++i) {
        fullTranscript += e.results[i][0].transcript;
      }
      if (fullTranscript) {
        setInterimText(fullTranscript);
      }
    };

    rec.onerror = (e) => {
      isListeningRef.current = false;
      if (e.error !== 'no-speech') {
        setSpeechError(`Microphone notice: ${e.error}`);
      }
    };

    rec.onend = () => {
      isListeningRef.current = false;
      setInterimText((latest) => {
        if (latest && latest.trim() && handlePatientSpeechRef.current) {
          handlePatientSpeechRef.current(latest.trim());
        } else {
          setSessionState('LISTENING');
        }
        return '';
      });
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.warn('Recognition start notice:', err);
    }
  }, [getLocale, setupAudioVisualizer]);

  // Process Patient Speech Turn
  const handlePatientSpeech = useCallback(async (patientText) => {
    stopListening();

    const patientMsg = { sender: 'patient', text: patientText, timestamp: new Date() };
    setMessages((prev) => {
      const updatedMessages = [...prev, patientMsg];

      // Check if patient said completion keyword ("that's it", "nothing else", etc.)
      const hasKeyword = checkCompletionKeyword(patientText);
      if (hasKeyword) {
        finishConsultation(updatedMessages);
        return updatedMessages;
      }

      // Otherwise consult AI doctor
      setSessionState('THINKING');

      converseDoctorSession(updatedMessages, currentLanguageRef.current, patientText)
        .then((response) => {
          const doctorMsg = { sender: 'doctor', text: response.spokenResponse, timestamp: new Date() };
          setMessages((m) => [...m, doctorMsg]);

          if (response.isCompleted) {
            finishConsultation([...updatedMessages, doctorMsg]);
          } else {
            speakText(response.spokenResponse, () => {
              startListening();
            });
          }
        })
        .catch((err) => {
          console.error('Doctor consultation error:', err);
          const fallbackText = currentLanguageRef.current === 'hi' 
            ? 'मैं समझ गया। क्या आपको सांस लेने में तकलीफ या सीने में दर्द है?'
            : 'I understand. Are you experiencing any chest pain or difficulty breathing?';
          
          const fallbackMsg = { sender: 'doctor', text: fallbackText, timestamp: new Date() };
          setMessages((m) => [...m, fallbackMsg]);
          speakText(fallbackText, () => {
            startListening();
          });
        });

      return updatedMessages;
    });
  }, [checkCompletionKeyword, finishConsultation, speakText, startListening, stopListening]);

  useEffect(() => {
    handlePatientSpeechRef.current = handlePatientSpeech;
  }, [handlePatientSpeech]);

  // Initial greeting effect on mount & language switch
  useEffect(() => {
    const greeting = liveDoctorInitialGreeting[currentLanguage] || liveDoctorInitialGreeting.en;
    
    // Speak greeting aloud with Gemini Voice, then begin listening
    const timer = setTimeout(() => {
      speakText(greeting, () => {
        startListening();
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      stopListening();
      stopAllAudio();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [currentLanguage, speakText, startListening, stopAllAudio, stopListening]);

  // Toggle Mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      stopListening();
      stopAllAudio();
      setSessionState('LISTENING');
    }
  };

  const latestDoctorMsg = [...messages].reverse().find(m => m.sender === 'doctor');
  const latestPatientMsg = [...messages].reverse().find(m => m.sender === 'patient');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-300">
      <div className="relative flex flex-col justify-between w-full max-w-2xl h-[94vh] max-h-[780px] overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 sm:px-6 py-4 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25">
              <HeartPulse className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border-2 border-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Swasthya AI Doctor Live
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-950/80 border border-teal-500/40 px-2 py-0.5 text-[10px] font-extrabold text-teal-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  Gemini Audio Voice
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Spoken clinical triage in {languages.find(l => l.code === currentLanguage)?.name || 'Native Language'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector Pill */}
            <div className="relative">
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="appearance-none rounded-xl border border-slate-700 bg-slate-800/90 py-1.5 pl-7 pr-3 text-xs font-semibold text-slate-200 hover:border-teal-500 focus:outline-none cursor-pointer"
                title="Change Spoken Language"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.name}
                  </option>
                ))}
              </select>
              <Globe className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-teal-400" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Close Voice Session"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Central Visualizer & Live Speech Transcription */}
        <div className="relative flex flex-col items-center justify-start flex-grow px-4 py-4 sm:py-6 overflow-y-auto space-y-4">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <div 
              className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/20 to-cyan-500/15 blur-3xl transition-transform duration-300"
              style={{ transform: `scale(${audioLevel})` }}
            />
          </div>

          {/* Fluid Central Doctor Orb */}
          <div className="relative flex items-center justify-center pt-2 mb-2">
            {/* Outer Pulsing Waves */}
            <div 
              className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-teal-400/30 transition-all duration-300 ${
                sessionState === 'SPEAKING' || sessionState === 'LISTENING' ? 'animate-ping opacity-30' : 'opacity-10'
              }`} 
            />
            <div 
              className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-teal-500/10 border border-teal-500/40 animate-pulse-ring" 
            />

            {/* Core Organic Shape */}
            <div 
              className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 shadow-2xl shadow-teal-500/40 animate-fluid-orb transition-transform duration-200"
              style={{ transform: `scale(${sessionState === 'LISTENING' ? Math.min(audioLevel, 1.3) : 1})` }}
            >
              {sessionState === 'SPEAKING' ? (
                /* Soundwave bars when doctor speaks */
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 rounded-full bg-white animate-live-wave-1"></div>
                  <div className="w-1.5 rounded-full bg-white animate-live-wave-2"></div>
                  <div className="w-1.5 rounded-full bg-white animate-live-wave-3"></div>
                  <div className="w-1.5 rounded-full bg-white animate-live-wave-4"></div>
                  <div className="w-1.5 rounded-full bg-white animate-live-wave-5"></div>
                </div>
              ) : sessionState === 'THINKING' ? (
                <RefreshCw className="h-7 w-7 text-white animate-spin" />
              ) : (
                <Mic className={`h-7 w-7 sm:h-8 sm:w-8 text-white ${sessionState === 'LISTENING' ? 'animate-pulse' : ''}`} />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="text-center">
            <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${
              sessionState === 'SPEAKING'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : sessionState === 'THINKING'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : sessionState === 'COMPLETING'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {sessionState === 'SPEAKING' && (
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-teal-300 animate-pulse" />
                  <span>Dr. Swasthya is speaking (Gemini Voice)</span>
                </span>
              )}
              {sessionState === 'LISTENING' && 'Listening to you... Speak your symptoms'}
              {sessionState === 'THINKING' && (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                  <span>Dr. Swasthya is thinking...</span>
                </span>
              )}
              {sessionState === 'COMPLETING' && 'Compiling clinical triage report...'}
            </span>
          </div>

          {/* PROMINENT LIVE USER SPEECH CARD ("WHEN THE USER SPEAKS DISPLAY WHAT THEY ARE SAYING") */}
          <div className="w-full max-w-xl space-y-3">
            
            {/* 1. Live Patient Speech Bubble */}
            <div className={`rounded-3xl border-2 transition-all p-4 sm:p-5 backdrop-blur-xl shadow-xl ${
              interimText 
                ? 'border-emerald-400 bg-emerald-950/50 shadow-emerald-500/20' 
                : sessionState === 'LISTENING'
                ? 'border-teal-500/60 bg-slate-900/90 shadow-teal-500/10'
                : 'border-slate-800 bg-slate-900/60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <User className="h-3.5 w-3.5" />
                  <span>You Are Saying:</span>
                </span>
                
                <span className="text-[11px] font-semibold text-emerald-400/90 bg-emerald-900/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  {interimText ? 'Live Voice Input' : sessionState === 'LISTENING' ? 'Microphone Active' : 'Recorded'}
                </span>
              </div>

              {/* Spoken Text in Real-Time */}
              <div className="min-h-[52px] flex items-center">
                {interimText ? (
                  <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    "{interimText}"
                    <span className="inline-block w-2 h-5 ml-1.5 bg-emerald-400 animate-pulse align-middle" />
                  </p>
                ) : latestPatientMsg && sessionState !== 'LISTENING' ? (
                  <p className="text-sm sm:text-base font-semibold text-slate-200 leading-relaxed">
                    "{latestPatientMsg.text}"
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 italic font-medium leading-relaxed">
                    "Describe how you are feeling, where it hurts, and when it started..."
                  </p>
                )}
              </div>
            </div>

            {/* 2. Doctor Question / Response Card */}
            {latestDoctorMsg && (
              <div className="rounded-2xl border border-teal-500/30 bg-slate-900/80 p-3.5 sm:p-4 backdrop-blur-md shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
                    <HeartPulse className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                    <span>Dr. Swasthya (AI Doctor):</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-950/90 border border-teal-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-300">
                    <Sparkles className="h-2.5 w-2.5 text-teal-400" />
                    <span>Gemini Audio Voice</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  "{latestDoctorMsg.text}"
                </p>
              </div>
            )}

            {speechError && (
              <div className="rounded-xl bg-amber-500/20 border border-amber-500/40 p-2.5 text-xs text-amber-300 text-center font-medium">
                {speechError}
              </div>
            )}
          </div>

          {/* "That's it" Helper Hint */}
          <div className="text-center pt-1">
            <p className="text-[11px] sm:text-xs text-slate-400">
              💡 When finished describing symptoms, say <span className="font-bold text-teal-300">"That's it"</span> or <span className="font-bold text-teal-300">"बस इतना ही"</span> / <span className="font-bold text-teal-300">"அவ்வளவுதான்"</span>.
            </p>
          </div>

        </div>

        {/* Bottom Interactive Controls */}
        <div className="border-t border-slate-800/80 bg-slate-900/95 px-4 sm:px-6 py-3.5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl mx-auto">
            
            {/* Mic Toggle Button */}
            <button
              onClick={toggleMute}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-soft-sm ${
                isMuted
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-teal-400" />}
              <span>{isMuted ? 'Microphone Muted' : 'Mute Mic'}</span>
            </button>

            {/* Primary "That's All / Generate Triage" Button */}
            <button
              onClick={() => finishConsultation(messages)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-soft-lg shadow-glow-teal hover:from-teal-400 hover:to-emerald-500 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              <span>That's all / Generate Report</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Safety Micro-Disclaimer */}
          <p className="mt-2.5 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldAlert className="h-3 w-3 text-amber-400 flex-shrink-0" />
            <span>AI Doctor guidance simulation. For medical emergencies, immediately call 108 or 112.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
