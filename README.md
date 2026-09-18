# Swasthya AI — Multilingual Clinical Urgency & Triage Guidance

[![Build Status](https://img.shields.io/badge/build-passing-emerald.svg)](https://github.com/Naren-Karthick/Swasthya-AI)
[![Tests](https://img.shields.io/badge/tests-20%2F20%20passing-teal.svg)](https://github.com/Naren-Karthick/Swasthya-AI)
[![Languages](https://img.shields.io/badge/languages-8%20Indian%20Languages-indigo.svg)](https://github.com/Naren-Karthick/Swasthya-AI)
[![Privacy](https://img.shields.io/badge/privacy-Anonymous%20Demo%20%2B%20Auth-green.svg)](https://github.com/Naren-Karthick/Swasthya-AI)

> **Healthcare Hackathon Submission — Clinical Urgency Guidance Prototype**  
> *Live Prototype:* [swasthya-ai-healix.vercel.app](https://swasthya-ai-healix.vercel.app/)  
> *Repository:* [github.com/Naren-Karthick/Swasthya-AI](https://github.com/Naren-Karthick/Swasthya-AI)  


---

## 1. Problem & Target Users

### The Problem
- **Pre-Hospital Delay & Misjudgment:** In acute conditions (e.g., Acute Coronary Syndrome, acute ischemic stroke), patients and caregivers often delay seeking emergency care or visit inappropriate outpatient clinics instead of emergency departments.
- **Overburdened Public Health Facilities:** Primary Healthcare Centres (PHCs) and emergency rooms face extreme overcrowding due to patients with low-acuity, self-limiting viral illnesses who seek reassurance because they lack clear urgency guidance.
- **Language Barriers & Digital Literacy:** Over 80% of India's population communicates primarily in regional languages. Existing medical decision-support tools are predominantly English-only, text-dense, and difficult for senior citizens to navigate.

### Target Users
1. **Elderly Individuals & Rural Families:** Senior citizens seeking clear, calm, high-contrast, large-typography guidance in their mother tongue with voice dictation.
2. **Community Health Workers (ASHAs / ANMs):** Grassroots health workers conducting rapid symptom screening in rural sub-centres.
3. **Patients Preparing for Doctor Consultations:** Individuals seeking a structured SBAR summary to communicate symptoms efficiently to clinicians.

---

## 2. Product Promise & Key Features

Swasthya AI is an **informational symptom-intake and urgency-stratification prototype** that helps users identify how soon they should seek medical attention.

- **Senior-Accessible Design:** High-contrast typography (WCAG AAA compliant text), comfortable touch targets ($\ge 48\text{px}$–$54\text{px}$), and simplified visual hierarchy.
- **Emergency Priority Escalation:** Red-flag symptoms (chest pressure, unilateral weakness, severe dyspnea) immediately render high-visibility emergency actions (`Call 108`, `Call 112`, and local hospital links) *before* general advice.
- **Three Plain-Language Urgency Tiers:**
  - `Emergency — act now` (Immediate emergency escalation)
  - `See a clinician soon` (Consultation recommended within 24–48 hours)
  - `Routine monitoring` (Self-care and observation over 48–72 hours)
- **8 Indian Languages:** English, हिन्दी (Hindi), தமிழ் (Tamil), తెలుగు (Telugu), ಕನ್ನಡ (Kannada), മലയാളം (Malayalam), বাংলা (Bengali), and मराठी (Marathi).
- **Progressive & Resilient Voice Intake:** Real-time Web Speech recognition with typed fallback, transcript review and editing before analysis, and strict audio resource cleanup.
- **Doctor-Ready PDF Summary:** Standardized SBAR handoff report with one-click PDF generation and copy-to-clipboard functionality.
- **Past Triage Dashboard & Analytics:**
  - Acuity summary metrics (Total Screenings, Emergency, Moderate, and Routine Care counts).
  - Search past screenings by symptom keywords.
  - Filter by urgency level (`All`, `Emergency`, `Moderate`, `Low`).
  - Read aloud past assessments with single-instance speech narration.
  - Export past assessments to doctor-ready PDFs and manage triage records.
- **1-Click Judge Demo Presets:**
  - 👤 **Demo Patient (`Naren Karthick G`):** Preloaded with 12 real multilingual past triages from the live npoint database.
  - 🩺 **Clinician Portal (`Dr. Priya Sharma, MD`):** Physician review mode with clinical summaries.

---

## 3. Architecture & Privacy Boundary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                              │
│                                                                         │
│  ┌─────────────────────────┐         ┌───────────────────────────────┐  │
│  │   Senior-Friendly UI    │         │  4-Step Clinical Triage Flow  │  │
│  │  - Large touch targets  │ ──────> │  Step 1: Intake & Samples     │  │
│  │  - Native language chips│         │  Step 2: Context & Red Flags  │  │
│  │  - High contrast colors │         │  Step 3: Urgency Guidance     │  │
│  └─────────────────────────┘         │  Step 4: Clinician Handoff    │  │
│                                      └──────────────┬────────────────┘  │
│                                                     │                   │
│                                      ┌──────────────▼────────────────┐  │
│                                      │    Triage Service Adapter     │  │
│                                      └──────────────┬────────────────┘  │
│                                                     │                   │
│                        ┌────────────────────────────┴─────────────┐     │
│                        ▼                                          ▼     │
│       ┌─────────────────────────────────┐   ┌─────────────────────────┐ │
│       │ Deterministic Engine & Samples  │   │  Gemini AI Integration  │ │
│       │ - Zero network calls            │   │  - Strict JSON Schema   │ │
│       │ - 5 vetted fictional cases      │   │  - Fallback Validation  │ │
│       │ - Instant 60-90s judge demo     │   │  - Structured Urgency   │ │
│       └─────────────────────────────────┘   └─────────────────────────┘ │
│                        │                                                │
│                        ▼                                                │
│       ┌─────────────────────────────────┐                               │
│       │  Anonymous Local Demo Store     │                               │
│       │  - Zero PII (No names/passwords)│                               │
│       │  - localStorage only            │                               │
│       │  - One-click "Clear demo data"  │                               │
│       └─────────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Privacy & Data Boundary Guarantees
- **Default to Anonymous Demo Mode:** No sign-up, login, email, or password required.
- **Zero Plaintext Credentials:** No plaintext passwords or sensitive health records stored on remote third-party databases (such as npoint.io).
- **Client-Side Demo Storage:** Saved sessions are strictly local demo evaluations labeled `"Local Demo Data"`, which can be wiped instantly with the **"Clear Demo Data"** action in the header.
- **Production Server Boundary Notice:**
  > *`TODO [Production Architecture]:` In production deployments, client-side model API calls must be proxied through an authenticated server-side gateway (`/api/v1/triage`) to safeguard API secrets and implement rate-limiting.*

---

## 4. AI Integration & Response Schema

When `VITE_GEMINI_API_KEY` is provided, Swasthya AI queries Google Gemini models (`gemini-2.5-flash`, `gemini-2.0-flash`) using strict JSON structured outputs (`responseMimeType: 'application/json'`).

### Strict Output Schema
```json
{
  "isEmergency": true,
  "urgencyLevel": "EMERGENCY",
  "urgencyState": "Emergency — act now",
  "recommendedTimeframe": "Immediate emergency care (next 15–30 minutes)",
  "primaryAssessment": "Acute severe chest pain radiating to the left arm...",
  "detectedWarningSigns": [
    "Crushing substernal chest pressure",
    "Radiation to left arm and jaw"
  ],
  "clinicalTerms": [
    "Acute Coronary Syndrome (ACS)",
    "Myocardial Infarction rule-out"
  ],
  "contributingFactors": [
    "Cardiovascular risk in senior patient",
    "Acute onset at rest"
  ],
  "recommendedAction": "Call 108 or 112 immediately. Rest seated while awaiting ambulance.",
  "nextActions": [
    "Call 108 or 112 immediately",
    "Notify family or caregiver",
    "Avoid all physical exertion"
  ],
  "limitations": "Informational triage screening, not a definitive medical diagnosis.",
  "disclaimer": "If symptoms are severe, worsening, or life-threatening, do not wait for this tool. Contact emergency services immediately."
}
```

---

## 5. 90-Second Hackathon Judge Demo Script

| Time | Action | What Judge Sees |
|------|--------|-----------------|
| **0:00–0:15** | Open home page at `http://localhost:5173/` | High-contrast, senior-friendly landing view with emergency ambulance buttons (`Call 108` / `Call 112`), native language switcher, and clear single CTA. |
| **0:15–0:35** | Click **"Try a Sample Case"** (Amber CTA) | Fictional Sample Cases Modal opens with 5 vetted scenarios: Chest Pain, Stroke FAST signs, Viral fever, Ankle injury, and Tamil vernacular case. |
| **0:35–0:50** | Select **"Chest Pressure & Shortness of Breath"** | Screen scrolls directly to **Step 3 (Urgency Result)**. A bright red Emergency Action Card renders immediately with one-touch `Call 108`, `Call 112`, and `Find Nearest Hospital` buttons. Timeframe: *Immediate (15–30 mins)*. |
| **0:50–1:10** | Click **"View Clinician Handoff & PDF"** (Step 4) | Displays formatted clinical SBAR summary for attending physician. Click **"Copy Summary Text"** (toast confirmation) and **"Download Doctor-Ready PDF"** (clean A4 clinical report). |
| **1:10–1:30** | Click **"Start Another Health Check"** & switch language to **हिन्दी** or **தமிழ்** | Interface instantly reflects native script language, showing full multilingual accessibility and resilience. |

---

## 6. Supported Indian Languages

| Language | Native Name | Code | Voice Support |
|----------|-------------|------|---------------|
| **English** | English | `en` | Web Speech API |
| **Hindi** | हिन्दी | `hi` | Web Speech API |
| **Tamil** | தமிழ் | `ta` | Web Speech API |
| **Telugu** | తెలుగు | `te` | Web Speech API |
| **Kannada** | ಕನ್ನಡ | `kn` | Web Speech API |
| **Malayalam** | മലയാളം | `ml` | Web Speech API |
| **Bengali** | বাংলা | `bn` | Web Speech API |
| **Marathi** | मराठी | `mr` | Web Speech API |

---

## 7. Local Setup & Environment Variables

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `10+`

### Installation
```bash
# 1. Clone repository
git clone https://github.com/Naren-Karthick/Swasthya-AI.git
cd Swasthya-AI

# 2. Install dependencies
npm install

# 3. (Optional) Configure Gemini API key for live AI reasoning
# By default, Swasthya AI runs in Anonymous Demo Mode with zero configuration!
# If you wish to enable live Gemini AI calls, create a .env file:
cp .env.example .env
# Add: VITE_GEMINI_API_KEY=your_key_here

# 4. Start local development server
npm run dev
```

The application will be accessible at: **`http://localhost:5173/`**

---

## 8. Testing & Build Commands

```bash
# Run automated test suite (14 unit/integration tests)
npm test

# Run linter
npm run lint

# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

### Production Bundle Size
- **Initial JS Bundle:** `151 kB` (`40 kB` gzipped) — *90% reduction from unoptimized prototype*
- **PDF Engine (`html2pdf.js`):** `935 kB` (dynamically lazy-loaded on demand only)
- **Vite Chunk Warnings:** `0` (Zero warnings)

---

## 9. Medical Safety Disclaimers & Boundaries

> [!IMPORTANT]
> **Clinical Boundary Statement**:
> Swasthya AI is an educational and informational symptom-triage decision-support prototype. It is **NOT** a medical diagnosis, clinical prescription, or replacement for a licensed healthcare professional.
> 
> - It does not provide medical treatment or prescribe pharmaceuticals.
> - It does not establish a formal doctor-patient relationship.
> - In any severe, rapidly worsening, or life-threatening situation, users are instructed to contact national emergency services immediately (`108` or `112` in India, or `911` / `999` internationally).

---

## 10. Future Roadmap

- [ ] **FHIR / ABDM Integration:** Export structured HL7 FHIR clinical observations compatible with Ayushman Bharat Digital Mission (ABDM).
- [ ] **Offline PWA / Service Worker Cache:** Full offline rule-based triage capability for remote clinics with zero internet connectivity.
- [ ] **Low-Bandwidth Audio Mode:** GSM/IVR voice integration for non-smartphone vernacular callers.
- [ ] **Secure Microservices Gateway:** Node.js/Go backend proxy for secure credential rotation and rate-limiting.

---

## 11. License
MIT License. Created for healthcare innovation and emergency triage accessibility.
