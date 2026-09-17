import { generateGeminiSpeech } from '../api.js';

// Internal references for single-instance speech controller
let activeAudio = null;
let activeCleanup = null;
let activeUtterance = null;
let currentSessionId = 0;

/**
 * Locale mapping for major Indian languages
 */
export const LANGUAGE_LOCALES = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN',
  mr: 'mr-IN'
};

/**
 * Localized UI button labels for the Audio Narration player
 */
export const AUDIO_LABELS = {
  en: {
    listen: 'Listen to Assessment Aloud',
    listenShort: 'Listen Aloud',
    stop: 'Stop Audio',
    preparing: 'Preparing Voice...',
    speaking: 'Playing Voice Narration',
    sbarListen: 'Listen to SBAR Note',
    readTyped: 'Read Typed Symptoms',
    voiceAssistant: 'Talk to Voice Assistant'
  },
  ta: {
    listen: 'மதிப்பீட்டை குரலில் கேட்க (Listen Aloud)',
    listenShort: 'குரலில் கேட்க',
    stop: 'ஆடியோவை நிறுத்து',
    preparing: 'குரல் தயாராகிறது...',
    speaking: 'குரல் ஒலிக்கிறது...',
    sbarListen: 'மருத்துவர் குறிப்பை கேட்க',
    readTyped: 'எழுதியதை கேட்க',
    voiceAssistant: 'குரல் உதவியாளருடன் பேச'
  },
  hi: {
    listen: 'आकलन आवाज़ में सुनें (Listen Aloud)',
    listenShort: 'आवाज़ में सुनें',
    stop: 'ऑडियो रोकें',
    preparing: 'आवाज़ तैयार हो रही है...',
    speaking: 'आवाज़ में सुनाया जा रहा है...',
    sbarListen: 'डॉक्टर सारांश सुनें',
    readTyped: 'लिखे हुए लक्षण सुनें',
    voiceAssistant: 'आवाज़ सहायक से बात करें'
  },
  te: {
    listen: 'అంచనాను వినండి (Listen Aloud)',
    listenShort: 'వినండి',
    stop: 'ఆడియో ఆపండి',
    preparing: 'వాయిస్ సిద్ధమవుతోంది...',
    speaking: 'వినిపిస్తోంది...',
    sbarListen: 'డాక్టర్ నోట్ వినండి',
    readTyped: 'టైప్ చేసినది వినండి',
    voiceAssistant: 'వాయిస్ అసిస్టెంట్ తో మాట్లాడండి'
  },
  kn: {
    listen: 'ಅಂದಾಜನ್ನು ಆಲಿಸಿ (Listen Aloud)',
    listenShort: 'ಆಲಿಸಿ',
    stop: 'ಆಡಿಯೋ ನಿಲ್ಲಿಸಿ',
    preparing: 'ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',
    speaking: 'ಧ್ವನಿ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...',
    sbarListen: 'ವೈದ್ಯರ ಟಿಪ್ಪಣಿ ಆಲಿಸಿ',
    readTyped: 'ಟೈಪ್ ಮಾಡಿದ್ದನ್ನು ಆಲಿಸಿ',
    voiceAssistant: 'ಧ್ವನಿ ಸಹಾಯಕರೊಂದಿಗೆ ಮಾತನಾಡಿ'
  },
  ml: {
    listen: 'വിലയിരുത്തൽ കേൾക്കുക (Listen Aloud)',
    listenShort: 'കേൾക്കുക',
    stop: 'ഓഡിയോ നിർത്തുക',
    preparing: 'ശബ്ദം തയ്യാറാക്കുന്നു...',
    speaking: 'ശബ്ദം പ്ലേ ചെയ്യുന്നു...',
    sbarListen: 'ഡോക്ടറുടെ കുറിപ്പ് കേൾക്കുക',
    readTyped: 'ടൈപ്പ് ചെയ്തത് കേൾക്കുക',
    voiceAssistant: 'വോയ്സ് അസിസ്റ്റന്റോട് സംസാരിക്കുക'
  },
  bn: {
    listen: 'অ্যাসেসমেন্ট শুনুন (Listen Aloud)',
    listenShort: 'শুনুন',
    stop: 'অডিও থামান',
    preparing: 'ভয়েস তৈরি হচ্ছে...',
    speaking: 'ভয়েস চলছে...',
    sbarListen: 'ডাক্তারের নোট শুনুন',
    readTyped: 'টাইপ করা তথ্য শুনুন',
    voiceAssistant: 'ভয়েস অ্যাসিস্ট্যান্টের সাথে কথা বলুন'
  },
  mr: {
    listen: 'मूल्यांकन आवाजात ऐका (Listen Aloud)',
    listenShort: 'ऐका',
    stop: 'ऑडिओ थांबवा',
    preparing: 'आवाज तयार होत आहे...',
    speaking: 'आवाज सुरू आहे...',
    sbarListen: 'डॉक्टर टीप ऐका',
    readTyped: 'टाईप केलेले ऐका',
    voiceAssistant: 'व्हॉईस असिस्टंटशी बोला'
  }
};

/**
 * Check if audio speech synthesis or playback is supported
 */
export const isAudioSupported = () => {
  return typeof window !== 'undefined' && Boolean(
    window.speechSynthesis || window.Audio
  );
};

/**
 * Safely stop any running audio or speech synthesis across the entire app
 */
export const stopSpeech = () => {
  currentSessionId++;

  // 1. Stop HTML5 audio element
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = '';
    } catch (e) {
      console.warn('Audio pause notice:', e);
    }
    activeAudio = null;
  }

  // 2. Run object URL cleanup
  if (activeCleanup) {
    try {
      activeCleanup();
    } catch (e) {
      console.warn('Audio cleanup notice:', e);
    }
    activeCleanup = null;
  }

  // 3. Stop browser Web Speech Synthesis & flush Chromium queue
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      // On Chromium, resume clears any stuck paused state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.warn('SpeechSynthesis cancel notice:', e);
    }
  }

  if (activeUtterance) {
    activeUtterance.onstart = null;
    activeUtterance.onend = null;
    activeUtterance.onerror = null;
    activeUtterance = null;
  }
};

/**
 * Speaks text with zero latency and robust concurrency control.
 * Prioritizes instant, native Indian-accented Web Speech API (zero quota limits, zero 503 overload),
 * with optional high-fidelity Gemini TTS fallback.
 *
 * @param {string} text - The clinical assessment text to speak
 * @param {object} options - Configuration options
 * @param {string} [options.language='en'] - 2-letter language code
 * @param {string} [options.voiceName='Aoede'] - Gemini voice profile
 * @param {boolean} [options.useGeminiCloud=false] - Whether to use Gemini Cloud TTS
 * @param {function} [options.onStart] - Callback when audio starts
 * @param {function} [options.onEnd] - Callback when audio ends
 * @param {function} [options.onError] - Callback when error occurs
 * @returns {Promise<boolean>} Resolves to true on start
 */
export const speakAssessmentText = async (text, options = {}) => {
  const {
    language = 'en',
    voiceName = 'Aoede',
    useGeminiCloud = false,
    onStart,
    onEnd,
    onError
  } = options;

  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return false;
  }

  // Stop any active audio before starting a new track
  stopSpeech();
  const sessionId = currentSessionId;

  // Helper for safe end notification
  const handleFinished = () => {
    if (sessionId !== currentSessionId) return;
    stopSpeech();
    if (onEnd) onEnd();
  };

  // Helper for browser Web Speech Synthesis (instant, zero quota, zero network delay)
  const speakWithBrowserSynthesis = () => {
    if (sessionId !== currentSessionId) return false;
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onError) onError(new Error('Audio synthesis not supported'));
      if (onEnd) onEnd();
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      activeUtterance = utterance;

      const targetLocale = LANGUAGE_LOCALES[language] || 'en-IN';
      utterance.lang = targetLocale;
      // Senior-friendly, calm pacing (0.92x)
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      // Select matching regional Indian voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langVoice = voices.find(v => v.lang === targetLocale || v.lang.startsWith(language));
        if (langVoice) {
          utterance.voice = langVoice;
        }
      }

      utterance.onstart = () => {
        if (sessionId !== currentSessionId) {
          window.speechSynthesis.cancel();
          return;
        }
        if (onStart) onStart('browser');
      };

      utterance.onend = () => {
        handleFinished();
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error:', err);
        handleFinished();
      };

      // 20ms microtask tick ensures Chromium speech pipeline flushes previous cancel
      setTimeout(() => {
        if (sessionId !== currentSessionId) return;
        window.speechSynthesis.speak(utterance);
      }, 20);

      return true;
    } catch (synthErr) {
      console.warn('SpeechSynthesis execution failure:', synthErr);
      if (onError) onError(synthErr);
      handleFinished();
      return false;
    }
  };

  // 1. If Gemini Cloud Audio is explicitly requested
  if (useGeminiCloud) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TTS timeout')), 3000)
      );
      const speechResult = await Promise.race([
        generateGeminiSpeech(text, voiceName),
        timeoutPromise
      ]);

      if (sessionId !== currentSessionId) {
        if (speechResult?.cleanup) speechResult.cleanup();
        return false;
      }

      if (speechResult?.audioUrl) {
        const audio = new Audio(speechResult.audioUrl);
        activeAudio = audio;
        activeCleanup = speechResult.cleanup;

        audio.onplay = () => {
          if (sessionId !== currentSessionId) {
            audio.pause();
            return;
          }
          if (onStart) onStart('gemini');
        };

        audio.onended = () => {
          handleFinished();
        };

        audio.onerror = (e) => {
          console.warn('Gemini audio playback error, falling back to Web Speech:', e);
          speakWithBrowserSynthesis();
        };

        await audio.play();
        return true;
      }
    } catch (geminiErr) {
      console.warn('Gemini TTS error or rate-limit, falling back immediately to Web Speech:', geminiErr?.message);
    }
  }

  // 2. Default Instant Path: Native Web Speech API
  return speakWithBrowserSynthesis();
};
