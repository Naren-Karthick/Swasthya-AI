import { GoogleGenAI } from '@google/genai';

const DB_URL = 'https://kvdb.io/3QV8UytSSApqnB7xYUGvn7/users';

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
    if (res.status === 404) {
      // Key does not exist yet on new bucket, return empty structure
      return { users: [] };
    }
    if (!res.ok) throw new Error('Failed to fetch from database');
    const data = await res.json();
    if (data && Array.isArray(data.users)) {
      saveLocalData(data); // Sync local
      return data;
    }
    return getLocalData();
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
      method: 'PUT', // kvdb uses PUT to overwrite a key
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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
    console.error('Error calling Gemini API:', err);
    throw err;
  }
};
