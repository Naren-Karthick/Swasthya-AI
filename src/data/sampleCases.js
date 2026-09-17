/**
 * Swasthya AI — Deterministic Fictional Sample Cases
 * 
 * Used for instant, zero-latency 60-90 second hackathon judge demos without requiring:
 * - External network calls
 * - Active Gemini API keys
 * - Microphone permissions
 * 
 * Every case is strictly labeled: "Interactive demo — fictional case"
 * Schema adheres to the 3 plain-language urgency tiers:
 * - 'Emergency — act now' (EMERGENCY)
 * - 'See a clinician soon' (MODERATE)
 * - 'Routine monitoring' (LOW)
 */

export const SAMPLE_CASES = [
  {
    id: 'case-chest-pain',
    title: 'Chest Pressure & Shortness of Breath',
    titleVernacular: 'सीने में भारीपन और सांस फूलना (Emergency)',
    badge: 'Emergency — Act Now',
    urgencyLevel: 'EMERGENCY',
    urgencyState: 'Emergency — act now',
    category: 'Cardiovascular / Respiratory',
    patientContext: {
      ageGroup: 'Senior (65+ years)',
      duration: '1', // 1 day / acute
      severity: 9,
      language: 'English',
      languageCode: 'en',
      hasRedFlags: true,
      redFlags: ['Substernal crushing pressure', 'Radiating left arm & jaw ache', 'Cold sweats with dyspnea']
    },
    symptomsText: 'Severe squeezing chest pressure that started 45 minutes ago while resting. The pain radiates down my left arm and into my lower jaw. I feel dizzy, broke into cold sweats, and am struggling to catch my breath.',
    assessment: {
      isEmergency: true,
      urgencyLevel: 'EMERGENCY',
      urgencyState: 'Emergency — act now',
      recommendedTimeframe: 'Immediate emergency care (next 15–30 minutes)',
      primaryAssessment: 'Acute severe chest pain radiating to the left arm with dyspnea and diaphoresis. Clinical symptoms suggest potential Acute Coronary Syndrome (myocardial ischemia or infarction) requiring immediate emergency medical evaluation and ECG.',
      clinicalTerms: [
        'Acute Coronary Syndrome (ACS)',
        'Angina Pectoris',
        'Myocardial Infarction rule-out',
        'Diaphoresis & Dyspnea'
      ],
      detectedWarningSigns: [
        'Crushing substernal chest pressure at rest',
        'Radiation to left arm and jaw',
        'Associated dyspnea and cold diaphoresis',
        'Acute onset in senior patient'
      ],
      contributingFactors: [
        'Cardiovascular risk factors in senior demographic',
        'Atherosclerotic plaque disruption risk',
        'Acute hemodynamic stress'
      ],
      recommendedAction: 'Call 108 or 112 immediately or proceed to the nearest emergency department by ambulance. Do not drive yourself. Rest in a comfortable seated position while awaiting emergency responders.',
      nextActions: [
        'Call 108 or 112 immediately for emergency ambulance transport',
        'Notify a family member or caregiver right now',
        'Sit upright or semi-reclined; avoid all physical exertion',
        'Have previous cardiac medications / ECG records accessible for paramedics'
      ],
      limitations: 'Algorithmic urgency evaluation based on patient-reported symptoms. This is an informational triage screening, not a definitive medical diagnosis.',
      disclaimer: 'If symptoms are severe, worsening, or life-threatening, do not wait for this tool. Contact emergency services immediately.'
    }
  },

  {
    id: 'case-stroke-fast',
    title: 'Sudden Facial Droop & Arm Weakness (FAST Signs)',
    titleVernacular: 'चेहरे का टेढ़ापन व हाथ में कमजोरी (Emergency)',
    badge: 'Emergency — Act Now',
    urgencyLevel: 'EMERGENCY',
    urgencyState: 'Emergency — act now',
    category: 'Neurological',
    patientContext: {
      ageGroup: 'Senior (65+ years)',
      duration: '1',
      severity: 8,
      language: 'English',
      languageCode: 'en',
      hasRedFlags: true,
      redFlags: ['Facial asymmetry / droop', 'Unilateral arm drift/weakness', 'Slurred speech']
    },
    symptomsText: 'Woke up 25 minutes ago and noticed the right side of my face was drooping. When trying to lift both arms, my right arm drifts downward. My words sound slurred when speaking to my family.',
    assessment: {
      isEmergency: true,
      urgencyLevel: 'EMERGENCY',
      urgencyState: 'Emergency — act now',
      recommendedTimeframe: 'Immediate emergency stroke protocol (Time is Brain: <60 minutes)',
      primaryAssessment: 'Classical acute FAST warning signs (Facial droop, Arm weakness, Speech slurring). Highly suspicious for acute cerebrovascular accident (ischemic or hemorrhagic stroke) requiring emergency CT neuroimaging and thrombolysis evaluation within the therapeutic window.',
      clinicalTerms: [
        'Cerebrovascular Accident (CVA)',
        'Acute Ischemic Stroke rule-out',
        'Transient Ischemic Attack (TIA)',
        'Hemiparesis & Dysarthria'
      ],
      detectedWarningSigns: [
        'Acute unilateral facial droop',
        'Right-sided motor drift / weakness',
        'Sudden dysarthria (slurred speech)',
        'Onset within therapeutic intervention window'
      ],
      contributingFactors: [
        'Cerebral vascular thromboembolism risk',
        'Hypertension or atrial fibrillation history in seniors',
        'Sudden focal neurological deficit'
      ],
      recommendedAction: 'Call 108 or 112 immediately. Note the exact time symptoms were first noticed (critical for thrombolytic eligibility). Go directly to a comprehensive stroke-capable hospital.',
      nextActions: [
        'Call 108 / 112 emergency services immediately',
        'Note the exact time symptoms began for emergency clinicians',
        'Do not give food, water, or aspirin until swallowing is clinically evaluated',
        'Keep patient lying down on their side if vomiting or dizzy'
      ],
      limitations: 'Urgent informational triage guidance. Neuroimaging (CT/MRI) and physical exam are required to establish a clinical diagnosis.',
      disclaimer: 'If symptoms are severe, worsening, or life-threatening, do not wait for this tool. Contact emergency services immediately.'
    }
  },

  {
    id: 'case-viral-fever',
    title: 'Persistent Viral Fever & Dry Cough',
    titleVernacular: 'बुखार, सूखी खांसी और बदन दर्द (Clinician Soon)',
    badge: 'See a Clinician Soon',
    urgencyLevel: 'MODERATE',
    urgencyState: 'See a clinician soon',
    category: 'Respiratory / Infectious',
    patientContext: {
      ageGroup: 'Adult (20-64 years)',
      duration: '4',
      severity: 5,
      language: 'English',
      languageCode: 'en',
      hasRedFlags: false,
      redFlags: []
    },
    symptomsText: 'I have had a dry irritating cough and fever around 101°F for 4 days, accompanied by body aches, sore throat, and fatigue. No breathing difficulty, chest pain, or rash, but over-the-counter paracetamol only brings temporary relief.',
    assessment: {
      isEmergency: false,
      urgencyLevel: 'MODERATE',
      urgencyState: 'See a clinician soon',
      recommendedTimeframe: 'Consult a medical clinician within 24 to 48 hours',
      primaryAssessment: 'Subacute upper respiratory viral syndrome with persistent fever for 4 days. While red-flag respiratory distress is currently absent, persistent fever beyond 3 days warrants formal medical evaluation to rule out secondary bacterial bronchitis or influenza.',
      clinicalTerms: [
        'Upper Respiratory Tract Infection (URTI)',
        'Prolonged Pyrexia',
        'Acute Bronchitis evaluation',
        'Viral Myalgia'
      ],
      detectedWarningSigns: [
        'Fever persisting past 72 hours',
        'Productive or aggravating cough progression',
        'General malaise and fatigue'
      ],
      contributingFactors: [
        'Seasonal respiratory viral exposure',
        'Inadequate hydration or rest',
        'Secondary respiratory tract irritation'
      ],
      recommendedAction: 'Schedule a visit at an outpatient clinic or primary healthcare centre within 24–48 hours for clinical auscultation and basic blood counts if fever persists.',
      nextActions: [
        'Schedule an appointment with your family physician or local clinic',
        'Maintain oral hydration with warm fluids, soups, and electrolytes',
        'Monitor temperature twice daily and record readings',
        'Seek immediate emergency care if high fever (>103°F) develops or breathing becomes difficult'
      ],
      limitations: 'General triage estimate for informational purposes. Stethoscope examination and diagnostic lab tests may be necessary.',
      disclaimer: 'Informational guidance only. Consult a qualified healthcare professional for medical diagnosis and treatment.'
    }
  },

  {
    id: 'case-ankle-sprain',
    title: 'Mild Ankle Sprain from Sports',
    titleVernacular: 'पैर मुड़ना व हल्का दर्द (Routine Monitoring)',
    badge: 'Routine Monitoring',
    urgencyLevel: 'LOW',
    urgencyState: 'Routine monitoring',
    category: 'Musculoskeletal',
    patientContext: {
      ageGroup: 'Adult (20-64 years)',
      duration: '1',
      severity: 3,
      language: 'English',
      languageCode: 'en',
      hasRedFlags: false,
      redFlags: []
    },
    symptomsText: 'Twisted my right ankle while stepping off a curb 3 hours ago. Mild localized swelling on the outer ankle. I can walk on it with a slight limp. No visible bone deformity, numbness, or inability to bear weight.',
    assessment: {
      isEmergency: false,
      urgencyLevel: 'LOW',
      urgencyState: 'Routine monitoring',
      recommendedTimeframe: 'Monitor at home for 48–72 hours; see clinic if no improvement',
      primaryAssessment: 'Mild acute inversion ankle strain (Grade I ligamentous sprain). Ottawa Ankle Rules criteria for acute fracture are negative given preserved ability to bear weight and absence of bony tenderness over malleoli.',
      clinicalTerms: [
        'Lateral Ankle Ligament Sprain (Grade I)',
        'Inversion Ankle Injury',
        'Soft Tissue Contusion',
        'Ottawa Ankle Rules Negative'
      ],
      detectedWarningSigns: [
        'Mild localized swelling',
        'Minor antalgic gait (walking with mild limp)'
      ],
      contributingFactors: [
        'Sudden mechanical inversion of ankle joint',
        'Recent physical misstep'
      ],
      recommendedAction: 'Practice standard conservative R.I.C.E. principles (Rest, Ice for 15-20 min intervals, Compression bandage, Elevation above heart level). Avoid strenuous weight-bearing activities for 48 hours.',
      nextActions: [
        'Apply ice wrapped in a towel for 15 minutes, 3–4 times daily',
        'Keep ankle elevated on pillows while sitting or sleeping',
        'Use an elastic compression crepe bandage for joint support',
        'Consult an orthopedic doctor or physiotherapist if swelling worsens or walking becomes impossible'
      ],
      limitations: 'Informational triage guidance. If severe pain, visible deformity, or inability to bear weight arises, get an X-ray evaluation.',
      disclaimer: 'Informational guidance only. Consult a doctor if symptoms fail to improve or worsen.'
    }
  },

  {
    id: 'case-multilingual-tamil',
    title: 'முதியவருக்கு தீவிர காய்ச்சல் மற்றும் சளி (Tamil Vernacular Case)',
    titleVernacular: 'Acute Senior Fever with Productive Cough (Tamil)',
    badge: 'See a Clinician Soon',
    urgencyLevel: 'MODERATE',
    urgencyState: 'See a clinician soon',
    category: 'Geriatric Respiratory',
    patientContext: {
      ageGroup: 'Senior (65+ years)',
      duration: '3',
      severity: 6,
      language: 'Tamil',
      languageCode: 'ta',
      hasRedFlags: false,
      redFlags: []
    },
    symptomsText: '3 நாட்களாக காய்ச்சல் மற்றும் மஞ்சள் சளியுடன் கடுமையான இருமல் உள்ளது. உணவு சாப்பிட விருப்பமில்லை. மூச்சுத் திணறல் இல்லை, ஆனால் உடல் சோர்வாக உள்ளது.',
    assessment: {
      isEmergency: false,
      urgencyLevel: 'MODERATE',
      urgencyState: 'See a clinician soon',
      recommendedTimeframe: '24 மணி நேரத்திற்குள் மருத்துவரை அணுகவும் (Within 24 Hours)',
      primaryAssessment: 'முதியவருக்கு 3 நாட்களாக தொடரும் காய்ச்சல் மற்றும் சளி (Productive Cough). மூச்சுத் திணறல் இல்லை என்றாலும், முதியவர்கள் என்பதால் நிமோனியா (Pneumonia) அல்லது பாக்டீரியா தொற்றைத் தவிர்க்க உடனடியாக மருத்துவ பரிசோதனை தேவைப்படுகிறது.',
      clinicalTerms: [
        'Productive Cough with Pyrexia',
        'Lower Respiratory Tract Infection rule-out',
        'Geriatric Respiratory Assessment',
        'Asthenia (உடல் சோர்வு)'
      ],
      detectedWarningSigns: [
        '3 நாட்களாக நீடிக்கும் காய்ச்சல்',
        'மஞ்சள் நிற சளி வெளியேற்றம்',
        'பசியின்மை மற்றும் அதிக சோர்வு'
      ],
      contributingFactors: [
        'முதியோரின் குறைவான நோய் எதிர்ப்புத் திறன்',
        'சுவாசப்பாதை தொற்று பாதிப்பு'
      ],
      recommendedAction: 'அருகிலுள்ள ஆரம்ப சுகாதார நிலையம் அல்லது மருத்துவமனைக்கு சென்று 24 மணி நேரத்திற்குள் மருத்துவ பரிசோதனை செய்து கொள்ளவும். மருத்துவரின் பரிந்துரைப்படி இரத்த மற்றும் எக்ஸ்-ரே பரிசோதனைகள் செய்யலாம்.',
      nextActions: [
        '24 மணி நேரத்திற்குள் குடும்ப மருத்துவரை அல்லது அரசு மருத்துவமனையை அணுகவும்',
        'வெதுவெதுப்பான நீர் மற்றும் எளிதில் செரிக்கும் சத்தான கஞ்சி அருந்தவும்',
        'மூச்சுத் திணறல் அல்லது நெஞ்சு வலி ஏற்பட்டால் உடனடியாக 108 அவசர ஊர்தியை அழைக்கவும்',
        'மருத்துவர் ஆலோசனை இல்லாமல் சுயமாக ஆன்டிபயாடிக் மருந்துகளை எடுக்க வேண்டாம்'
      ],
      limitations: 'இது தகவல் வழிகாட்டல் மட்டுமே; நேரடி மருத்துவ சிகிச்சைக்கு மாற்றாகாது.',
      disclaimer: 'அவசர நிலைகளில் உடனடியாக 108 அல்லது 112 எண்ணை தொடர்பு கொள்ளவும்.'
    }
  }
];

export const getSampleCaseById = (id) => {
  return SAMPLE_CASES.find(c => c.id === id) || SAMPLE_CASES[0];
};
