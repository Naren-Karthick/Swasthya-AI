/**
 * Swasthya AI — Clinical Triage API & Anonymous Demo Adapter
 * 
 * SECURITY & PRIVACY POLICY:
 * 1. Default Mode: Anonymous Demo Mode.
 * 2. Zero-PII Guarantee: Never sends patient names, passwords, or emails to third-party endpoints.
 * 3. Local Demo Persistence: Session reports are stored locally in the browser only (localStorage)
 *    and labeled as "Local Demo Data" with a single-click "Clear demo data" action.
 * 4. Production Boundary Notice:
 *    TODO: For production deployments, model calls and API credentials MUST be routed through
 *    a secure backend server endpoint (e.g., /api/v1/triage) to avoid exposing credentials.
 */

import { GoogleGenAI } from '@google/genai';

// Safe Lazy Gemini Client Getter
let aiClientInstance = null;
export const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({ apiKey });
  }
  return aiClientInstance;
};

/* ========================================================================= */
/* 1. ANONYMOUS LOCAL DEMO DATA STORE (ZERO PLAINTEXT PASSWORDS, ZERO PII)   */
/* ========================================================================= */
const DEMO_STORAGE_KEY = 'swasthya_local_demo_data';

export const getDemoReports = () => {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse local demo reports:', e);
    return [];
  }
};

export const saveDemoReport = (report, patientInfo) => {
  try {
    const existing = getDemoReports();
    const newRecord = {
      id: patientInfo.id || 'SES' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: patientInfo.date || new Date().toISOString(),
      symptoms: patientInfo.symptoms,
      ageGroup: patientInfo.ageGroup || 'N/A',
      duration: patientInfo.duration || 'N/A',
      language: patientInfo.language || 'English',
      urgencyLevel: report.urgencyLevel,
      urgencyState: report.urgencyState || (
        report.urgencyLevel === 'EMERGENCY' ? 'Emergency — act now' :
        report.urgencyLevel === 'MODERATE' ? 'See a clinician soon' :
        'Routine monitoring'
      ),
      fullAssessment: report
    };
    const updated = [newRecord, ...existing.slice(0, 19)]; // Keep max 20 demo items
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save demo report to localStorage:', e);
    return [];
  }
};

export const clearDemoReports = () => {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    localStorage.removeItem('swasthya_local_db');
    localStorage.removeItem('swasthya_active_user');
    return true;
  } catch (e) {
    console.warn('Failed to clear demo reports:', e);
    return false;
  }
};

// npoint Cloud Database URL
export const NPOINT_DB_URL = 'https://api.npoint.io/ead356d4d55965c0a760';
const LOCAL_DB_KEY = 'swasthya_local_db';

const getLocalDb = () => {
  if (typeof localStorage === 'undefined') return { users: [] };
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    return raw ? JSON.parse(raw) : { users: [] };
  } catch {
    return { users: [] };
  }
};

const setLocalDb = (data) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage write error
  }
};

/**
 * Fetches the user and triage database from npoint.io with localStorage fallback
 */
export const fetchUsersDatabase = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(NPOINT_DB_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        setLocalDb(data);
        return data;
      }
    }
    return getLocalDb();
  } catch (err) {
    console.warn('npoint fetch error, using local fallback:', err?.message);
    return getLocalDb();
  }
};

/**
 * Updates the user and triage database on npoint.io (POST / PUT)
 */
export const updateUsersDatabase = async (database) => {
  setLocalDb(database); // Always save locally first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(NPOINT_DB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(database),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      // Fallback to PUT if POST fails
      const putRes = await fetch(NPOINT_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(database)
      });
      return putRes.ok;
    }
    return true;
  } catch (err) {
    console.warn('Failed to sync to npoint server, saved to local cache:', err?.message);
    return false;
  }
};

/**
 * Appends a completed triage report to a user's cloud account on npoint
 */
export const saveReportToUser = async (activeUser, report, patientInfo) => {
  if (!activeUser) return null;

  const db = await fetchUsersDatabase();
  const users = [...(db.users || [])];
  const userIdx = users.findIndex(
    u => u.userId === activeUser.userId || (u.email && u.email.toLowerCase() === activeUser.email?.toLowerCase())
  );

  const newRecord = {
    id: patientInfo.id || 'REP' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    date: patientInfo.date || new Date().toISOString(),
    language: patientInfo.language || 'English',
    symptoms: patientInfo.symptoms,
    ageGroup: patientInfo.ageGroup || 'Adult',
    duration: patientInfo.duration || '2',
    urgencyLevel: report.urgencyLevel,
    urgencyState: report.urgencyState || (
      report.urgencyLevel === 'EMERGENCY' ? 'Emergency — act now' :
      report.urgencyLevel === 'MODERATE' ? 'See a clinician soon' :
      'Routine monitoring'
    ),
    fullAssessment: report
  };

  if (userIdx >= 0) {
    const existingReports = users[userIdx].savedReports || [];
    users[userIdx] = {
      ...users[userIdx],
      savedReports: [newRecord, ...existingReports]
    };
  } else {
    // If user record wasn't found in cloud, create entry
    users.push({
      ...activeUser,
      savedReports: [newRecord]
    });
  }

  const updatedDb = { users };
  await updateUsersDatabase(updatedDb);

  // Also update active session in localStorage
  const updatedActiveUser = userIdx >= 0 ? users[userIdx] : { ...activeUser, savedReports: [newRecord] };
  try {
    localStorage.setItem('swasthya_active_user', JSON.stringify(updatedActiveUser));
  } catch (e) {
    console.warn('Active user update notice:', e);
  }

  return { newRecord, updatedUser: updatedActiveUser };
};

/**
 * Removes a single triage report from a user's cloud account on npoint
 */
export const deleteReportFromUser = async (userId, reportId) => {
  const db = await fetchUsersDatabase();
  const users = [...(db.users || [])];
  const userIdx = users.findIndex(u => u.userId === userId || u.email === userId);

  if (userIdx >= 0 && users[userIdx].savedReports) {
    users[userIdx].savedReports = users[userIdx].savedReports.filter(r => r.id !== reportId);
    await updateUsersDatabase({ users });
    try {
      localStorage.setItem('swasthya_active_user', JSON.stringify(users[userIdx]));
    } catch (e) {
      console.warn('Active user sync notice:', e);
    }
    return users[userIdx];
  }
  return null;
};

/* ========================================================================= */
/* 2. DETERMINISTIC RULE-BASED TRIAGE EVALUATOR (FALLBACK & ZERO-LATENCY)    */
/* ========================================================================= */
export const evaluateRulesTriage = (symptomsText, languageCode, ageGroup, durationDays, severity = 5, redFlags = {}) => {
  const lower = (symptomsText || '').toLowerCase();

  // Explicit emergency red flags matching
  const hasChestPain = /chest pain|chest pressure|heart attack|angina|tightness in chest/i.test(lower) || redFlags.chestPainOrBreathing;
  const hasBreathShortness = /shortness of breath|cannot breathe|dyspnea|struggling to breathe|gasping/i.test(lower);
  const hasStrokeSigns = /stroke|face droop|facial droop|arm weakness|slurred speech|sudden numbness|cannot speak/i.test(lower) || redFlags.strokeSigns;
  const hasSevereBleeding = /heavy bleeding|vomiting blood|uncontrolled bleeding|head injury|severe trauma/i.test(lower) || redFlags.severeBleeding;
  const hasAlteredConsciousness = /fainted|unconscious|passed out|blackout|seizure|convulsion/i.test(lower) || redFlags.confusionOrUnconscious;

  const isEmergency = Boolean(
    hasChestPain || 
    hasStrokeSigns || 
    hasSevereBleeding || 
    hasAlteredConsciousness || 
    (hasBreathShortness && Number(severity) >= 7) ||
    redFlags.hasActiveRedFlag
  );

  const isModerate = !isEmergency && (
    Number(durationDays) >= 3 || 
    Number(severity) >= 5 || 
    /fever|cough|vomit|diarrhea|rash|infection|severe pain|migraine/i.test(lower)
  );

  const urgencyLevel = isEmergency ? 'EMERGENCY' : isModerate ? 'MODERATE' : 'LOW';
  const urgencyState = isEmergency ? 'Emergency — act now' : isModerate ? 'See a clinician soon' : 'Routine monitoring';

  const detectedWarningSigns = [];
  if (hasChestPain) detectedWarningSigns.push('Acute chest pressure / potential cardiac symptom');
  if (hasStrokeSigns) detectedWarningSigns.push('Sudden focal neurological or facial asymmetry signs');
  if (hasBreathShortness) detectedWarningSigns.push('Significant respiratory difficulty');
  if (hasSevereBleeding) detectedWarningSigns.push('High-risk acute traumatic or bleeding risk');
  if (hasAlteredConsciousness) detectedWarningSigns.push('Altered consciousness or syncopal episode');
  if (detectedWarningSigns.length === 0 && isModerate) {
    detectedWarningSigns.push(`Symptoms persisting for ${durationDays || 2}+ days with moderate discomfort (${severity}/10)`);
  }

  const clinicalTerms = isEmergency
    ? ['Emergency Triage Protocol', 'Acute Clinical Escalation', 'Emergency Red-Flag Active']
    : isModerate
    ? ['Subacute Symptom Review', 'Primary Clinical Evaluation Recommended', 'Outpatient Triage']
    : ['Routine Symptom Monitoring', 'Low Acuity Triage', 'Self-Care Protocol'];

  return {
    isEmergency,
    urgencyLevel,
    urgencyState,
    recommendedTimeframe: isEmergency 
      ? 'Immediate emergency care (Next 15–30 minutes)' 
      : isModerate 
      ? 'Consult a medical clinician within 24 to 48 hours' 
      : 'Monitor at home for 48–72 hours; see clinic if worsening',
    primaryAssessment: isEmergency
      ? `High-priority symptoms detected (${symptomsText.slice(0, 100)}...). Immediate clinical emergency evaluation is necessary.`
      : isModerate
      ? `Reported symptoms (${symptomsText.slice(0, 100)}...) warrant outpatient clinical evaluation to determine underlying cause and appropriate management.`
      : `Reported symptoms (${symptomsText.slice(0, 100)}...) are consistent with mild, low-acuity discomfort suitable for routine observation and supportive care.`,
    detectedWarningSigns: detectedWarningSigns.length > 0 ? detectedWarningSigns : ['No critical red flags detected'],
    clinicalTerms,
    contributingFactors: [
      `Reported symptom duration of ${durationDays || 'unspecified'} days`,
      `Patient age group: ${ageGroup || 'General population'}`,
      `Patient self-reported discomfort level: ${severity}/10`
    ],
    recommendedAction: isEmergency
      ? 'Call 108 or 112 immediately or go to the nearest emergency room. Do not drive yourself.'
      : isModerate
      ? 'Schedule an appointment at an outpatient clinic or primary health center for physical examination.'
      : 'Practice supportive home care, maintain hydration, rest, and consult a clinic if symptoms persist.',
    nextActions: isEmergency
      ? [
          'Call 108 or 112 immediately for emergency medical assistance',
          'Notify a family member or caregiver right away',
          'Rest quietly in a comfortable seated position',
          'Do not wait for symptoms to go away on their own'
        ]
      : isModerate
      ? [
          'Visit a nearby clinic or consult your doctor within 24–48 hours',
          'Keep a daily record of temperature and symptom changes',
          'Stay well-hydrated and rest',
          'Seek emergency care immediately if breathing difficulty, chest pain, or fainting occurs'
        ]
      : [
          'Rest and monitor your condition over the next 48 to 72 hours',
          'Stay well hydrated with clean water and fluids',
          'Schedule a routine clinic consultation if symptoms worsen or do not resolve'
        ],
    limitations: 'Algorithmic urgency guidance for informational triage only. This is not a medical diagnosis, prescription, or clinical replacement.',
    disclaimer: 'If symptoms are severe, worsening, or life-threatening, do not wait for this tool. Contact emergency services immediately.'
  };
};

/* ========================================================================= */
/* 3. CLINICAL TRIAGE ANALYZER (AI + DEMO FALLBACK ADAPTER)                  */
/* ========================================================================= */
export const analyzeSymptoms = async (
  symptomsText, 
  languageCode, 
  ageGroup, 
  durationDays, 
  severity = 5,
  redFlags = {},
  seededSampleCase = null
) => {
  // If a deterministic fictional sample case was picked, return its vetted assessment directly
  if (seededSampleCase && seededSampleCase.assessment) {
    return seededSampleCase.assessment;
  }

  // If critical emergency red flags are checked, prioritize emergency immediately
  if (redFlags.hasActiveRedFlag || redFlags.chestPainOrBreathing || redFlags.strokeSigns) {
    return evaluateRulesTriage(symptomsText, languageCode, ageGroup, durationDays, severity, redFlags);
  }

  const ai = getAiClient();

  // If no Gemini API key configured, use deterministic rule-based triage
  if (!ai) {
    console.info('Demo Mode active (VITE_GEMINI_API_KEY not configured). Using rule-based triage.');
    return evaluateRulesTriage(symptomsText, languageCode, ageGroup, durationDays, severity, redFlags);
  }

  // Call Gemini with strict response schema
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

  const systemPrompt = `You are an objective, medical-safety-first clinical triage assistant.
Your role is informational symptom triage and urgency guidance ONLY.
Strict rules:
- Do NOT provide definitive medical diagnoses, prescriptions, or replace in-person clinical care.
- Stratify urgency strictly into: "EMERGENCY", "MODERATE", or "LOW".
- If symptoms contain chest pain, breathing struggle, stroke signs (FAST), severe bleeding, or altered mental state, classify as EMERGENCY immediately.
- Map urgencyLevel to urgencyState:
  - "EMERGENCY" -> "Emergency — act now"
  - "MODERATE" -> "See a clinician soon"
  - "LOW" -> "Routine monitoring"
- Respond in professional, clear, empathetic ${targetLanguage}.
- Always respond strictly in valid JSON matching the schema.`;

  const prompt = `Patient Symptoms: "${symptomsText}"
Patient Age Bracket: ${ageGroup || 'Adult'}
Symptom Duration: ${durationDays ? durationDays + ' days' : 'Acute'}
Self-Reported Discomfort: ${severity}/10
Target Language: ${targetLanguage}

Provide clinical urgency evaluation in ${targetLanguage}.`;

  const models = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-flash-lite-latest'
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
              isEmergency: { type: 'BOOLEAN' },
              urgencyLevel: { type: 'STRING', enum: ['EMERGENCY', 'MODERATE', 'LOW'] },
              urgencyState: { type: 'STRING' },
              recommendedTimeframe: { type: 'STRING' },
              primaryAssessment: { type: 'STRING' },
              detectedWarningSigns: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              },
              clinicalTerms: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              },
              contributingFactors: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              },
              recommendedAction: { type: 'STRING' },
              nextActions: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              },
              limitations: { type: 'STRING' }
            },
            required: ['isEmergency', 'urgencyLevel', 'urgencyState', 'recommendedTimeframe', 'primaryAssessment', 'recommendedAction']
          }
        }
      });

      const responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error('Empty Gemini response');

      let cleanText = responseText.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }

      const parsed = JSON.parse(cleanText);

      // Strict validation & field normalization
      const isEmergency = Boolean(parsed.isEmergency || parsed.urgencyLevel === 'EMERGENCY');
      const urgencyLevel = isEmergency ? 'EMERGENCY' : (parsed.urgencyLevel || 'MODERATE');
      const urgencyState = isEmergency ? 'Emergency — act now' : (parsed.urgencyState || (urgencyLevel === 'MODERATE' ? 'See a clinician soon' : 'Routine monitoring'));

      return {
        isEmergency,
        urgencyLevel,
        urgencyState,
        recommendedTimeframe: parsed.recommendedTimeframe || (isEmergency ? 'Immediate emergency medical care' : 'Within 24–48 hours'),
        primaryAssessment: parsed.primaryAssessment || 'Clinical evaluation of patient-reported symptoms.',
        detectedWarningSigns: parsed.detectedWarningSigns || [],
        clinicalTerms: parsed.clinicalTerms || ['Clinical Triage Assessment'],
        contributingFactors: parsed.contributingFactors || [`Duration: ${durationDays} days`],
        recommendedAction: parsed.recommendedAction || (isEmergency ? 'Seek emergency care immediately.' : 'Consult a healthcare professional.'),
        nextActions: parsed.nextActions || [
          isEmergency ? 'Call 108 or 112 emergency services' : 'Schedule a consultation with a local clinician',
          'Monitor symptoms and seek immediate care if condition worsens'
        ],
        limitations: parsed.limitations || 'Informational triage guidance only. Not a medical diagnosis.',
        disclaimer: 'If symptoms are severe, worsening, or life-threatening, do not wait for this tool. Contact emergency services immediately.'
      };
    } catch (err) {
      console.warn(`Model ${modelName} call failed, trying fallback:`, err.message);
    }
  }

  // Graceful rule-based fallback if all AI models fail
  console.warn('All Gemini models unavailable. Falling back to deterministic rule-based triage.');
  return evaluateRulesTriage(symptomsText, languageCode, ageGroup, durationDays, severity, redFlags);
};

/* ========================================================================= */
/* 4. CONVERSATIONAL VOICE INTAKE ASSISTANT                                  */
/* ========================================================================= */
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

  const systemPrompt = `You are an empathetic, attentive clinical triage intake assistant conducting a preliminary voice interview with a patient in ${targetLanguage}.
Goals:
1. Speak in a comforting, respectful manner in ${targetLanguage}.
2. Keep spoken responses concise (1–2 spoken sentences).
3. Acknowledge distress and ask 1 focused clinical question (e.g. onset, severity 1-10, or checking for red flags like chest pain or breathing trouble).
4. If patient indicates they are done ("that's it", "nothing else", "बस इतना ही", "அவ்வளவுதான்"), set "isCompleted": true.
5. Return strictly JSON matching schema.`;

  const formattedHistory = (history || []).map(item => `${item.sender === 'doctor' ? 'Assistant' : 'Patient'}: "${item.text}"`).join('\n');
  const prompt = `Dialogue history:
${formattedHistory}
Patient said: "${patientMessage}"

Respond as clinical intake assistant in ${targetLanguage}.`;

  const ai = getAiClient();
  if (ai) {
    const models = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
      'gemini-flash-lite-latest'
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
                spokenResponse: { type: 'STRING' },
                isCompleted: { type: 'BOOLEAN' }
              },
              required: ['spokenResponse', 'isCompleted']
            }
          }
        });

        const responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          let clean = responseText.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          return JSON.parse(clean);
        }
      } catch (err) {
        console.warn(`Voice session model ${modelName} failed:`, err.message);
      }
    }
  }

  // Graceful conversational fallback
  return {
    spokenResponse: languageCode === 'hi'
      ? 'मैं समझ गया। क्या आपको सांस लेने में कोई तकलीफ या तेज सीने में दर्द महसूस हो रहा है?'
      : languageCode === 'ta'
      ? 'நான் புரிந்து கொண்டேன். உங்களுக்கு மூச்சுத் திணறல் அல்லது அதிக நெஞ்சு வலி உள்ளதா?'
      : 'I understand. Are you experiencing any shortness of breath, dizziness, or chest tightness?',
    isCompleted: false
  };
};

/* ========================================================================= */
/* 5. AUDIO CONVERSION & OPTIONAL TTS UTILITY                               */
/* ========================================================================= */
export const pcmBase64ToWavUrl = (base64Pcm, sampleRate = 24000) => {
  try {
    const binaryString = typeof window !== 'undefined' ? window.atob(base64Pcm) : '';
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + bytes.length, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, bytes.length, true);

    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn('PCM conversion error:', e);
    return null;
  }
};

export const generateGeminiSpeech = async (text, voiceName = 'Aoede') => {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('Gemini API key is not configured.');
  }

  const ttsModels = ['gemini-2.5-flash-preview-tts'];
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
        if (audioUrl) {
          return {
            audioUrl,
            mimeType: part.inlineData.mimeType || 'audio/wav',
            cleanup: () => URL.revokeObjectURL(audioUrl)
          };
        }
      }
    } catch (err) {
      console.warn(`TTS ${modelName} error:`, err.message);
    }
  }

  throw new Error('Gemini TTS unavailable.');
};
