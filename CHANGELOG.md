# Changelog

All notable changes to the Swasthya AI project will be documented in this file.

---

## [Hackathon Readiness] - 2026-09-17

### 1. Deterministic Fictional Sample Cases (60–90 Second Demo)
- Added `src/data/sampleCases.js` containing five deterministic, pre-vetted fictional scenarios:
  1. **Emergency Chest Pain / Breathlessness** (Acute Coronary Syndrome presentation, senior demographic)
  2. **Possible Stroke Warning Signs** (Acute FAST signs with unilateral weakness and facial droop)
  3. **Moderate Viral Symptoms** (Subacute cough & fever persisting 4 days)
  4. **Low-Risk Ankle Sprain** (Weight-bearing joint injury with R.I.C.E. protocol guidance)
  5. **Vernacular Tamil Case** (Acute geriatric respiratory infection in native language)
- Added prominent "Try a Sample Case" CTA on the landing page and navigation header.
- Added `src/components/SampleCasesModal.jsx` allowing hackathon judges to trigger an instant end-to-end evaluation without microphone permissions or API keys.
- Strictly labeled every seeded scenario: `"Interactive demo — fictional case"`.

### 2. Four-Step Symptom-Check Journey
- Created `src/components/SymptomCheckerFlow.jsx` replacing the legacy flat input with a guided 4-step clinical flow:
  - **Step 1: Intake & Modality** (Text description, voice dictation, common clinical symptom chips, and native language selection)
  - **Step 2: Patient Context & Red Flags** (Age group, duration in days, severity scale 1–10, and 4 high-priority Yes/No red-flag screening checks)
  - **Step 3: Urgency Guidance** (Plain-language urgency classification, timeframe, clinical terms, and next steps)
  - **Step 4: Clinician Handoff & PDF** (Standardized SBAR clinical summary, copy to clipboard with toast feedback, doctor-ready PDF export)
- Replaced blocking `window.alert()` calls with accessible inline status banners.
- Added visible step progress indicators, back/edit navigation, and validation.

### 3. Medical Safety & Emergency Escalation
- Created `src/components/EmergencyActionBanner.jsx` with high visual priority.
- For emergency and red-flag results, renders a high-contrast red emergency card *before* general guidance.
- Added direct one-touch dialers for **Call 108 (Ambulance)** and **Call 112 (National Emergency)**, plus a Google Maps link for nearest emergency hospital.
- Enforced standard clinical safety warning: *"If symptoms are severe, worsening, or life-threatening, do not wait for this tool. Contact emergency services immediately."*
- Strictly prevented reassuring self-care copy from appearing above emergency escalations.
- Removed unverified claims including `"99.2% Protocol Match"` and replaced `"AI Doctor"` with `"Clinical Triage Assistant"`.

### 4. Elderly & Senior Accessibility
- Redesigned landing page with large, high-contrast typography (WCAG AAA compliant text).
- Ensured all interactive touch targets meet or exceed $\ge 48\text{px}$–$54\text{px}$.
- Added large native script language switcher chips (हिन्दी, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം, বাংলা, मराठी, English) directly in the hero.
- Prominently placed an Emergency Contact Strip at the top of the landing page.
- Simplified language to eliminate technical jargon and provide a calm, reassuring bedside tone.

### 5. Safe Privacy & Anonymous Demo Boundary
- Configured default state to **Anonymous Demo Mode** requiring zero sign-in, names, emails, or passwords.
- Completely removed insecure remote database synchronization (`npoint.io`) and plaintext password storage.
- Implemented client-side non-sensitive demo session store in `src/api.js` under `'swasthya_local_demo_data'` with a one-click **"Clear Demo Data"** action.
- Added documented server boundary notice: `TODO: Route model calls through a secure backend proxy for production deployments`.

### 6. Progressive & Resilient Voice Intake
- Overhauled `src/components/LiveVoiceConsultation.jsx` with capability checking upfront.
- Implemented explicit state machine: `READY`, `LISTENING`, `PROCESSING`, `PERMISSION_DENIED`, `UNSUPPORTED_BROWSER`, `TIMEOUT`, and `REVIEW_TRANSCRIPT`.
- Added integrated typed fallback directly in the voice consultation modal.
- Added an editable transcript screen allowing patients to inspect and edit words before triage analysis.
- Implemented complete resource cleanup: stops all `MediaStreamTrack` audio tracks, cancels animation frames, closes audio contexts, and cancels speech synthesis on modal close or `Escape` key.

### 7. Performance & Code Splitting
- Optimized `src/utils/pdfGenerator.js` by dynamically importing `html2pdf.js` on demand only when the user clicks "Download Doctor Summary".
- Configured `vite.config.js` with Rollup `manualChunks` to split vendor libraries (`react-vendor`, `icons`, `genai-sdk`).
- Reduced initial bundle size by **90%** from `1,679 kB` to **`151 kB`** (`40 kB` gzipped).
- Eliminated all Vite `chunkSizeWarningLimit` warnings.

### 8. Testing Harness & Validation
- Created `src/__tests__/triageEngine.test.js` using Node.js native test runner (`node --test`).
- Added 14 unit and integration tests covering red-flag detection, 3-tier urgency mapping, sample cases schema, multilingual localization integrity, privacy boundaries, and medical safety disclaimers.
- All 14 tests passing in `< 5ms`.
- Verified clean build (`npm run build`) and clean linter (`npm run lint` with 0 errors).
