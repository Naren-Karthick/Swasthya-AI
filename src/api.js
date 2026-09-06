import { GoogleGenAI } from '@google/genai';

const DB_URL = 'https://api.npoint.io/ead356d4d55965c0a760';

// Initialize Gemini Client
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// LocalStorage Fallback helper
const getLocalData = () => {
  const data = localStorage.getItem('swasthya_local_db');
  return data ? JSON.parse(data) : { users: [] };
};

const saveLocalData = (data) => {
  localStorage.setItem('swasthya_local_db', JSON.stringify(data));
};

// 1. Fetch Users Database
export const fetchUsersDatabase = async () => {
  try {
    const res = await fetch(DB_URL);
    if (!res.ok) throw new Error('Failed to fetch from database');
    const data = await res.json();
    if (data && Array.isArray(data.users)) {
      saveLocalData(data); // Sync local
      return data;
    }
    // Handle empty bin (e.g. first load)
    return { users: [] };
  } catch (err) {
    console.warn('Database fetch error, using localStorage fallback:', err);
    return getLocalData();
  }
};

// 2. Update Users Database
export const updateUsersDatabase = async (database) => {
  saveLocalData(database); // Always save local first
  try {
    const res = await fetch(DB_URL, {
      method: 'POST', // npoint uses POST to update
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(database)
    });
    if (!res.ok) throw new Error('Failed to update database');
    return true;
  } catch (err) {
    console.error('Failed to sync to database server:', err);
    return false;
  }
};

// 3. Clinical Analysis via Gemini
export const analyzeSymptoms = async (symptomsText, languageCode, ageGroup, durationDays) => {
  const languageNames = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    bn: 'Bengali',
    mr: 'Marathi'
  };
  
  const targetLanguage = languageNames[languageCode] || 'English';

  const systemPrompt = `You are a highly experienced, objective clinical triage and referral AI doctor.
Your goal is to perform a structured clinical triage assessment of the symptoms provided by the patient.
Determine whether there is an emergency or if it requires clinical review or self-monitoring.
Always respond strictly in JSON matching the specified schema. Keep assessments brief, professional, and clear.
Provide the text outputs in ${targetLanguage}.`;

  const prompt = `Patient Symptoms: "${symptomsText}"
Patient Age Group: ${ageGroup || 'Not provided'}
Symptom Duration: ${durationDays ? durationDays + ' days' : 'Not provided'}

Perform clinical triage. Provide translation of all clinical reports, assessments, and recommended actions in ${targetLanguage}.`;

  // Candidate models in priority order with fallback
  const models = [
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash'
  ];

  let lastError = null;

  for (const modelName of models) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              isEmergency: { type: 'BOOLEAN' },
              urgencyLevel: { type: 'STRING', enum: ['EMERGENCY', 'MODERATE', 'LOW'] },
              clinicalTerms: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Standardized clinical/medical terms associated with the symptoms'
              },
              primaryAssessment: {
                type: 'STRING',
                description: 'Concise medical assessment summarizing the potential condition in the target language'
              },
              contributingFactors: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Potential causes or contributing factors in the target language'
              },
              recommendedAction: {
                type: 'STRING',
                description: 'Clear directive (e.g., go to emergency, book appointment, home care) in the target language'
              }
            },
            required: ['isEmergency', 'urgencyLevel', 'clinicalTerms', 'primaryAssessment', 'contributingFactors', 'recommendedAction']
          }
        }
      });

      const responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error('Empty response from Gemini');
      
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }
      
      return JSON.parse(cleanText);
    } catch (err) {
      console.warn(`Model ${modelName} triage failed, trying fallback:`, err.message);
      lastError = err;
    }
  }

  console.error('All Gemini triage models failed:', lastError);
  throw lastError || new Error('Diagnostic analysis temporarily unavailable.');
};

// 4. Conversational Live AI Doctor Session
export const converseDoctorSession = async (history, languageCode, patientMessage) => {
  const languageNames = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    bn: 'Bengali',
    mr: 'Marathi'
  };

  const targetLanguage = languageNames[languageCode] || 'English';

  const systemPrompt = `You are an empathetic, attentive clinical triage doctor conducting a real-time voice consultation with a patient in ${targetLanguage}.
Your goals:
1. Speak in a comforting, natural bedside manner in ${targetLanguage}.
2. Keep your response very brief: 1 or 2 concise spoken sentences max, so it sounds great when spoken aloud.
3. If the patient has just started describing symptoms, acknowledge their distress empathetically and ask 1 specific clinical follow-up question (e.g. onset, pain severity from 1 to 10, or checking for red flags like chest pain or breathing trouble).
4. If the patient indicates they are finished or says things like "that's it", "nothing else", "that is all", "बस इतना ही", "அவ்வளவுதான்", "इतना ही", etc., set "isCompleted": true, and reply warmly that you have noted all symptoms and are preparing their triage assessment.
5. If the patient still has more symptoms or is answering your question, ask the next logical clinical follow-up and set "isCompleted": false.
Output strictly JSON matching the specified schema.`;

  const formattedHistory = (history || []).map(item => `${item.sender === 'doctor' ? 'Doctor' : 'Patient'}: "${item.text}"`).join('\n');
  const prompt = `Conversation so far:
${formattedHistory}
Patient's latest statement: "${patientMessage}"

Respond as the triage doctor in ${targetLanguage}.`;

  const models = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash'
  ];

  for (const modelName of models) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              spokenResponse: {
                type: 'STRING',
                description: 'Short spoken response from doctor (1-2 sentences) in target language'
              },
              isCompleted: {
                type: 'BOOLEAN',
                description: 'True if patient indicated they are finished describing symptoms'
              }
            },
            required: ['spokenResponse', 'isCompleted']
          }
        }
      });

      const responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error('Empty response from Gemini');
      
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }
      return JSON.parse(cleanText);
    } catch (err) {
      console.warn(`Model ${modelName} doctor conversation failed, trying fallback:`, err.message);
    }
  }

  // Graceful fallback if network/model unavailable
  return {
    spokenResponse: languageCode === 'hi' 
      ? 'मैं समझ गया। क्या आपको सांस लेने में कोई तकलीफ या तेज दर्द महसूस हो रहा है?'
      : languageCode === 'ta'
      ? 'நான் புரிந்து கொண்டேன். உங்களுக்கு மூச்சுத் திணறல் அல்லது அதிக வலி உள்ளதா?'
      : 'I understand. Are you experiencing any shortness of breath, dizziness, or chest pain?',
    isCompleted: false
  };
};

// 5. Convert Gemini Linear PCM 24000Hz 16-bit Mono Base64 to Playable WAV Blob URL
export const pcmBase64ToWavUrl = (base64Pcm, sampleRate = 24000) => {
  const binaryString = typeof window !== 'undefined' ? window.atob(base64Pcm) : Buffer.from(base64Pcm, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 44-byte standard RIFF WAV header
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // "RIFF"
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + bytes.length, true);
  // "WAVE"
  view.setUint32(8, 0x57415645, false);
  // "fmt "
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // Linear PCM format
  view.setUint16(22, 1, true); // Mono (1 channel)
  view.setUint32(24, sampleRate, true); // Sample rate 24000 Hz
  view.setUint32(28, sampleRate * 2, true); // Byte rate (sampleRate * 1 * 16/8)
  view.setUint16(32, 2, true); // Block align (1 * 16/8)
  view.setUint16(34, 16, true); // Bits per sample (16 bit)
  // "data"
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, bytes.length, true);

  const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

// 6. Generate Voice Audio directly from Gemini (Gemini Voice / Speech)
export const generateGeminiSpeech = async (text, voiceName = 'Aoede') => {
  const ttsModels = [
    'gemini-2.5-flash-preview-tts',
    'gemini-2.5-pro-preview-tts'
  ];

  for (const modelName of ttsModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: text,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Aoede'
              }
            }
          }
        }
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        const audioUrl = pcmBase64ToWavUrl(part.inlineData.data, 24000);
        return {
          audioUrl,
          mimeType: part.inlineData.mimeType || 'audio/wav',
          cleanup: () => URL.revokeObjectURL(audioUrl)
        };
      }
    } catch (err) {
      console.warn(`Gemini speech generation with ${modelName} failed:`, err.message);
    }
  }

  throw new Error('All Gemini TTS models unavailable.');
};

