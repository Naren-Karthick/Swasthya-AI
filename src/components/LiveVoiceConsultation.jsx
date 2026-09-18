import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  HeartPulse, 
  ShieldAlert, 
  RefreshCw, 
  AlertCircle,
  Edit3,
  CheckCircle2,
  VolumeX,
  Radio,
  Wifi,
  Sparkles
} from 'lucide-react';
import { liveDoctorInitialGreeting, languages } from '../localization';
import { converseDoctorSession } from '../api';
import { stopSpeech, speakAssessmentText } from '../utils/speechEngine';
import { LiveKitVoiceSession } from '../utils/livekitVoice';
import { getLiveKitConfig } from '../utils/livekitToken';

export default function LiveVoiceConsultation({
  currentLanguage,
  onLanguageChange,
  onClose,
  onCompleteConsultation,
  _translations
}) {
  const initialGreeting = liveDoctorInitialGreeting[currentLanguage] || liveDoctorInitialGreeting.en;
  const livekitConfig = getLiveKitConfig();

  // Modality & Capability State
  const speechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Flow State Machine:
  // 'INITIAL' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'REVIEW_TRANSCRIPT' | 'PERMISSION_DENIED' | 'UNSUPPORTED' | 'TIMEOUT'
  const [sessionState, setSessionState] = useState(speechSupported ? 'INITIAL' : 'UNSUPPORTED');
  
  // LiveKit WebRTC Session State
  const [livekitStatus, setLivekitStatus] = useState('CONNECTING'); // 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR' | 'DISCONNECTED'
  const [livekitRoomName] = useState(() => `swasthya-${Date.now().toString(36)}`);
  const [isRemoteSpeaking, setIsRemoteSpeaking] = useState(false);

  const [messages, setMessages] = useState(() => [
    { sender: 'assistant', text: initialGreeting, timestamp: new Date() }
  ]);
  const [interimText, setInterimText] = useState('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const [typedInputText, setTypedInputText] = useState('');
  const [editableFinalText, setEditableFinalText] = useState('');
  const [audioLevel, setAudioLevel] = useState(1);
  const [errorMessage, setErrorMessage] = useState(null);

  // Audio & Web Speech Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const currentAudioRef = useRef(null);
  const livekitSessionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Cleanup all audio, LiveKit WebRTC, and microphone streams
  const stopAllAudioAndStreams = useCallback(() => {
    stopSpeech();

    // 1. Cancel silence timer
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // 2. Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.warn(e);
      }
      recognitionRef.current = null;
    }

    // 3. Stop browser TTS
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {
        console.warn(e);
      }
    }

    // 4. Stop HTML5 audio
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {
        console.warn(e);
      }
      currentAudioRef.current = null;
    }

    // 5. Disconnect LiveKit WebRTC Session
    if (livekitSessionRef.current) {
      try {
        livekitSessionRef.current.disconnect();
      } catch (e) {
        console.warn('LiveKit cleanup note:', e);
      }
      livekitSessionRef.current = null;
    }

    setAudioLevel(1);
  }, []);

  // Connect to LiveKit WebRTC Cloud room on component mount
  useEffect(() => {
    const session = new LiveKitVoiceSession({
      onStateChange: (state, payload) => {
        if (state === 'CONNECTED') {
          setLivekitStatus('CONNECTED');
        } else if (state === 'CONNECTING') {
          setLivekitStatus('CONNECTING');
        } else if (state === 'RECONNECTING') {
          setLivekitStatus('RECONNECTING');
        } else if (state === 'DISCONNECTED') {
          setLivekitStatus('DISCONNECTED');
        } else if (state === 'ERROR') {
          setLivekitStatus('ERROR');
        } else if (state === 'SPEAKERS_UPDATE') {
          setIsRemoteSpeaking(Boolean(payload?.isRemoteSpeaking));
        }
      },
      onAudioLevel: (level) => {
        setAudioLevel(level);
      },
      onRemoteAudioStarted: ({ participant }) => {
        console.log('[LiveKit] Remote audio stream active from:', participant);
        setIsRemoteSpeaking(true);
      },
      onRemoteAudioEnded: () => {
        setIsRemoteSpeaking(false);
      },
      onDataMessage: ({ data }) => {
        if (data?.text && data?.sender) {
          setMessages(prev => [...prev, { sender: data.sender, text: data.text, timestamp: new Date() }]);
        }
      },
      onError: (err) => {
        console.warn('[LiveKit] Voice session error:', err);
        setLivekitStatus('ERROR');
      }
    });

    livekitSessionRef.current = session;

    session.connect({
      roomName: livekitRoomName,
      name: 'Swasthya Patient'
    }).catch((err) => {
      console.warn('[LiveKit] Connection fallback note:', err?.message);
      setLivekitStatus('ERROR');
    });

    return () => {
      session.disconnect();
    };
  }, [livekitRoomName]);

  // Modal Escape key listener & Unmount cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopAllAudioAndStreams();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopAllAudioAndStreams();
    };
  }, [stopAllAudioAndStreams, onClose]);

  // Spoken feedback using unified speechEngine
  const speakSpokenText = useCallback((text, onFinished) => {
    stopSpeech();
    speakAssessmentText(text, {
      language: currentLanguage,
      onStart: () => {
        setSessionState('SPEAKING');
      },
      onEnd: () => {
        if (onFinished) onFinished();
      },
      onError: () => {
        if (onFinished) onFinished();
      }
    });
  }, [currentLanguage]);

  // Process patient's statement with duplicate-request protection
  const processStatement = useCallback(async (statement) => {
    const trimmed = statement.trim();
    if (!trimmed || isProcessingRef.current) return;
    isProcessingRef.current = true;
    stopSpeech();

    // Broadcast user transcript to LiveKit room
    livekitSessionRef.current?.broadcastData({
      sender: 'patient',
      text: trimmed,
      language: currentLanguage,
      timestamp: new Date().toISOString()
    });

    // Add to message history
    const updatedMessages = [...messages, { sender: 'patient', text: trimmed, timestamp: new Date() }];
    setMessages(updatedMessages);

    // Update accumulated transcript
    const updatedTranscript = accumulatedTranscript 
      ? `${accumulatedTranscript}. ${trimmed}` 
      : trimmed;
    setAccumulatedTranscript(updatedTranscript);

    setSessionState('THINKING');

    try {
      const response = await converseDoctorSession(updatedMessages, currentLanguage, trimmed);
      
      const botMessage = {
        sender: 'assistant',
        text: response.spokenResponse,
        timestamp: new Date()
      };
      setMessages([...updatedMessages, botMessage]);

      // Broadcast assistant response over LiveKit data channel
      livekitSessionRef.current?.broadcastData({
        sender: 'assistant',
        text: response.spokenResponse,
        isCompleted: response.isCompleted,
        timestamp: new Date().toISOString()
      });

      if (response.isCompleted) {
        speakSpokenText(response.spokenResponse, () => {
          setEditableFinalText(updatedTranscript);
          setSessionState('REVIEW_TRANSCRIPT');
        });
      } else {
        speakSpokenText(response.spokenResponse, () => {
          // Brief 300ms cooldown to ensure speaker audio does not trigger microphone
          setTimeout(() => {
            setSessionState('INITIAL');
          }, 300);
        });
      }
    } catch (e) {
      console.warn('Converse error:', e);
      setEditableFinalText(updatedTranscript);
      setSessionState('REVIEW_TRANSCRIPT');
    } finally {
      isProcessingRef.current = false;
    }
  }, [messages, accumulatedTranscript, currentLanguage, speakSpokenText]);

  // Start Mic Listening with LiveKit WebRTC Audio Stream
  const startListening = async () => {
    setErrorMessage(null);
    stopSpeech(); // Silence running audio before listening

    if (!speechSupported) {
      setSessionState('UNSUPPORTED');
      return;
    }

    try {
      // 1. Start LiveKit WebRTC microphone publishing with echo cancellation & noise suppression
      if (livekitSessionRef.current && livekitStatus === 'CONNECTED') {
        try {
          await livekitSessionRef.current.startMicrophone();
        } catch (lkErr) {
          console.warn('[LiveKit] WebRTC mic stream warning:', lkErr);
        }
      }

      // 2. Initialize Speech Recognition for live text transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      const locales = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        bn: 'bn-IN',
        mr: 'mr-IN'
      };
      rec.lang = locales[currentLanguage] || 'en-IN';

      rec.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript + ' ';
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }

        if (interimStr) setInterimText(interimStr);

        if (finalStr.trim() && !isProcessingRef.current) {
          setInterimText('');
          stopListening();
          processStatement(finalStr.trim());
        }
      };

      rec.onerror = (e) => {
        console.warn('Speech rec error:', e.error);
        if (e.error === 'not-allowed') {
          setSessionState('PERMISSION_DENIED');
        } else if (e.error === 'no-speech') {
          setSessionState('TIMEOUT');
        } else {
          setSessionState('INITIAL');
        }
      };

      rec.onend = () => {
        if (sessionState === 'LISTENING') {
          setSessionState('INITIAL');
        }
      };

      recognitionRef.current = rec;
      rec.start();
      setSessionState('LISTENING');

      // 15-second silence timeout
      silenceTimeoutRef.current = setTimeout(() => {
        if (sessionState === 'LISTENING') {
          stopListening();
          setSessionState('TIMEOUT');
        }
      }, 15000);

    } catch (err) {
      console.warn('Microphone permission or start error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setSessionState('PERMISSION_DENIED');
      } else {
        setErrorMessage('Unable to access microphone. Please check your browser settings or use typing mode below.');
        setSessionState('INITIAL');
      }
    }
  };

  // Stop Mic Listening & mute LiveKit WebRTC microphone
  const stopListening = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.warn(e);
      }
      recognitionRef.current = null;
    }

    // Mute LiveKit microphone
    if (livekitSessionRef.current) {
      livekitSessionRef.current.muteMicrophone().catch(() => {});
    }

    setAudioLevel(1);
    setInterimText('');
  };

  // Handle Typed Input Submission
  const handleTypedSubmit = (e) => {
    e.preventDefault();
    if (!typedInputText.trim()) return;
    const text = typedInputText.trim();
    setTypedInputText('');
    processStatement(text);
  };

  // Final Complete Handler after user reviews transcript
  const handleConfirmAndTriage = () => {
    stopAllAudioAndStreams();
    const finalSymptoms = editableFinalText.trim() || accumulatedTranscript.trim() || 'General health evaluation';
    onCompleteConsultation(finalSymptoms);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="voiceModalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-3 sm:p-6 backdrop-blur-md animate-in fade-in"
    >
      <div 
        className="flex h-full max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/95 px-5 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-soft-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="voiceModalTitle" className="text-base sm:text-lg font-black text-slate-900">
                  Live Voice Consultation
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                LiveKit WebRTC Clinical Intake • Informational Triage
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:border-teal-500 focus:outline-none cursor-pointer min-h-[40px]"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>

            {/* Close Button */}
            <button
              onClick={() => {
                stopAllAudioAndStreams();
                onClose();
              }}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close voice consultation modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* LiveKit WebRTC Cloud Status Bar */}
        <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2.5 w-2.5 items-center justify-center">
              {livekitStatus === 'CONNECTED' ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </>
              ) : livekitStatus === 'CONNECTING' || livekitStatus === 'RECONNECTING' ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </>
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-400"></span>
              )}
            </div>

            <span className="flex items-center gap-1 font-mono tracking-tight text-[11px]">
              <Radio className="h-3.5 w-3.5 text-teal-400" />
              {livekitStatus === 'CONNECTED' ? (
                <span>
                  <strong className="text-emerald-400">LiveKit WebRTC Cloud Connected</strong>
                  <span className="hidden sm:inline text-slate-400 ml-1">({livekitConfig.url.replace('wss://', '')})</span>
                </span>
              ) : livekitStatus === 'CONNECTING' ? (
                <span className="text-amber-300">Connecting to LiveKit WebRTC Cloud...</span>
              ) : livekitStatus === 'RECONNECTING' ? (
                <span className="text-amber-300">Reconnecting LiveKit stream...</span>
              ) : (
                <span className="text-slate-300">LiveKit Standby (Web Speech Active)</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            {isRemoteSpeaking ? (
              <span className="flex items-center gap-1 text-teal-300 font-bold animate-pulse">
                <Sparkles className="h-3 w-3" /> Remote Audio Speaking
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Wifi className="h-3 w-3 text-emerald-400" /> HD Audio • 48kHz
              </span>
            )}
          </div>
        </div>

        {/* Informational Safety Warning */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          <span>⚠️ Voice intake assistant for preliminary clinical triage. In an emergency, dial 108 or 112 immediately.</span>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-100 px-4 py-2 text-center text-xs font-semibold text-rose-900">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body: Interactive Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">

          {/* STATE: UNSUPPORTED BROWSER */}
          {sessionState === 'UNSUPPORTED' && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-center">
              <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-base font-extrabold text-amber-950">
                Voice Recognition Not Supported in This Browser
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-amber-900 leading-relaxed">
                Your current browser does not support the Web Speech API. You can use the typed input box below to describe your symptoms directly.
              </p>
            </div>
          )}

          {/* STATE: PERMISSION DENIED */}
          {sessionState === 'PERMISSION_DENIED' && (
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 text-center">
              <ShieldAlert className="h-8 w-8 text-rose-600 mx-auto mb-2" />
              <h3 className="text-base font-extrabold text-rose-950">
                Microphone Permission Blocked
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-rose-900 leading-relaxed">
                Please allow microphone permissions in your browser's site settings to use voice dictation, or type your symptoms in the box below.
              </p>
              <button
                type="button"
                onClick={startListening}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-soft-sm hover:bg-rose-700 cursor-pointer min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry Microphone Permission</span>
              </button>
            </div>
          )}

          {/* STATE: TIMEOUT / NO SPEECH */}
          {sessionState === 'TIMEOUT' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                No speech was detected. Tap the microphone to try again, or use the text box below.
              </p>
            </div>
          )}

          {/* STATE: REVIEW & EDIT TRANSCRIPT BEFORE ANALYSIS */}
          {sessionState === 'REVIEW_TRANSCRIPT' ? (
            <div className="rounded-2xl border-2 border-teal-500 bg-teal-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm">
                <Edit3 className="h-4 w-4 text-teal-600" />
                <span>Review & Edit Spoken Symptoms Before Triage:</span>
              </div>
              <p className="text-xs text-slate-600">
                Check that your symptoms were captured accurately. You can edit or add details below:
              </p>
              <textarea
                value={editableFinalText}
                onChange={(e) => setEditableFinalText(e.target.value)}
                rows={4}
                className="w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm sm:text-base font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={startListening}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 min-h-[44px]"
                >
                  + Speak More
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndTriage}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2 text-sm font-extrabold text-white shadow-soft-sm hover:bg-teal-700 cursor-pointer min-h-[44px]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm & Run Triage</span>
                </button>
              </div>
            </div>
          ) : (
            /* Dialogue Messages History */
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.sender === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'assistant'
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : 'bg-teal-600 text-white font-semibold shadow-soft-sm'
                  }`}>
                    <div className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">
                      {msg.sender === 'assistant' ? 'Triage Assistant' : 'You (Patient)'}
                    </div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}

              {/* Live Interim Transcription */}
              {interimText && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-teal-50 border border-teal-200 p-3 text-xs sm:text-sm text-teal-900 font-bold italic animate-pulse">
                    "{interimText}"
                  </div>
                </div>
              )}

              {/* Thinking / Processing State */}
              {sessionState === 'THINKING' && (
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 p-2.5 rounded-xl">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Assistant is thinking...</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Controls */}
        <div className="border-t border-slate-200 bg-slate-50/90 p-4 sm:p-5 space-y-3">
          
          {/* Central Voice Pulse Button */}
          {sessionState !== 'REVIEW_TRANSCRIPT' && speechSupported && (
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-2">
                {sessionState === 'LISTENING' && (
                  <span 
                    className="absolute inset-0 rounded-full bg-rose-500 opacity-40 animate-ping"
                    style={{ transform: `scale(${audioLevel})` }}
                  />
                )}
                <button
                  type="button"
                  onClick={
                    sessionState === 'LISTENING'
                      ? stopListening
                      : sessionState === 'SPEAKING'
                      ? () => {
                          stopSpeech();
                          setSessionState('INITIAL');
                        }
                      : startListening
                  }
                  className={`relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full text-white shadow-lg transition-all cursor-pointer ${
                    sessionState === 'LISTENING'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/40'
                      : sessionState === 'SPEAKING'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/40'
                      : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:scale-105 shadow-teal-600/30'
                  }`}
                  aria-label={
                    sessionState === 'LISTENING' 
                      ? 'Stop recording voice' 
                      : sessionState === 'SPEAKING'
                      ? 'Stop assistant voice'
                      : 'Start speaking'
                  }
                >
                  {sessionState === 'LISTENING' ? (
                    <MicOff className="h-7 w-7 sm:h-8 sm:w-8" />
                  ) : sessionState === 'SPEAKING' ? (
                    <VolumeX className="h-7 w-7 sm:h-8 sm:w-8 animate-pulse" />
                  ) : (
                    <Mic className="h-7 w-7 sm:h-8 sm:w-8 animate-pulse" />
                  )}
                </button>
              </div>

              <span className="text-xs font-extrabold text-slate-700 text-center">
                {sessionState === 'LISTENING' 
                  ? 'Listening via LiveKit HD WebRTC... Tap to Stop & Process' 
                  : sessionState === 'SPEAKING'
                  ? 'Assistant Speaking — Tap to Stop Audio'
                  : 'Tap Microphone to Speak in Your Language'}
              </span>
            </div>
          )}

          {/* Typed Fallback Input Form */}
          {sessionState !== 'REVIEW_TRANSCRIPT' && (
            <form onSubmit={handleTypedSubmit} className="flex gap-2">
              <label htmlFor="voiceTypedFallback" className="sr-only">Type your symptoms</label>
              <input
                id="voiceTypedFallback"
                type="text"
                value={typedInputText}
                onChange={(e) => setTypedInputText(e.target.value)}
                placeholder="Prefer typing? Type your response here..."
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-teal-600 focus:outline-none min-h-[44px]"
              />
              <button
                type="submit"
                disabled={!typedInputText.trim()}
                className="rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px]"
              >
                Send
              </button>
            </form>
          )}

          {/* Direct Proceed Button if symptoms already recorded */}
          {accumulatedTranscript && sessionState !== 'REVIEW_TRANSCRIPT' && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditableFinalText(accumulatedTranscript);
                  setSessionState('REVIEW_TRANSCRIPT');
                }}
                className="text-xs font-black text-teal-800 hover:text-teal-950 underline cursor-pointer"
              >
                Finished speaking? Review and generate triage →
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
