import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Info
} from 'lucide-react';


export default function InteractiveTriagePreview({ onStartRealTriage }) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [previewLanguage, setPreviewLanguage] = useState('en');

  const scenarios = [
    {
      id: "moderate-flu",
      title: "Viral Flu & Cough",
      urgency: "MODERATE",
      symptoms: {
        en: "Persistent fever of 101°F with dry barking cough, body aches, and fatigue for 3 days.",
        hi: "३ दिनों से १०१°F बुखार, सूखी खांसी, बदन दर्द और अत्यधिक कमजोरी महसूस हो रही है।",
        ta: "3 நாட்களாக 101°F காய்ச்சல், வறட்டு இருமல், உடல் வலி மற்றும் சோர்வு உள்ளது."
      },
      duration: "3 Days",
      ageGroup: "Adult (20-64)",
      clinicalTerms: ["Pyrexia", "Acute Upper Respiratory Tract Irritation", "Myalgia"],
      assessment: {
        en: "Probable acute viral upper respiratory infection. Fever persisting beyond 72 hours warrants clinical auscultation.",
        hi: "तीव्र वायरल श्वसन तंत्र संक्रमण की संभावना। ७२ घंटे से अधिक बुखार रहने पर चिकित्सक से परामर्श आवश्यक है।",
        ta: "வைரஸ் தொற்றினால் ஏற்படும் சுவாசக்குழாய் எரிச்சல். 3 நாட்களுக்கு மேல் காய்ச்சல் நீடிப்பதால் மருத்துவரை அணுகவும்."
      },
      recommendation: {
        en: "Schedule an outpatient consult with a general physician within 24-48 hours. Maintain hydration.",
        hi: "२४ से ४८ घंटों के भीतर सामान्य चिकित्सक से परामर्श लें। पर्याप्त तरल पदार्थों का सेवन करें।",
        ta: "24-48 மணி நேரத்திற்குள் மருத்துவரை அணுகவும். போதுமான நீர்ச்சத்து எடுத்துக்கொள்ளவும்."
      }
    },
    {
      id: "emergency-chest",
      title: "Chest Tightness (Emergency)",
      urgency: "EMERGENCY",
      symptoms: {
        en: "Sudden crushing retrosternal chest pressure radiating to left jaw, accompanied by profuse sweating and dyspnea.",
        hi: "सीने में तेज दबाव जो बाएं जबड़े तक जा रहा है, अत्यधिक पसीना और सांस लेने में कठिनाई हो रही है।",
        ta: "நெஞ்சில் கடுமையான அழுத்தம், இடது தாடை வரை பரவும் வலி, அதிக வியர்வை மற்றும் மூச்சுத்திணறல்."
      },
      duration: "Under 1 Hour",
      ageGroup: "Senior (65+)",
      clinicalTerms: ["Acute Coronary Syndrome Rule-Out", "Angina Pectoris", "Dyspnea"],
      assessment: {
        en: "High suspicion of acute cardiovascular or respiratory emergency. Critical signs warrant immediate intervention.",
        hi: "कार्डियोवैस्कुलर (हृदय) आपातकाल की अत्यधिक संभावना। तत्काल आपातकालीन चिकित्सा सहायता लें।",
        ta: "இதயம் தொடர்பான அவசர நிலைக்கான அறிகுறிகள். உடனடியாக அவசர சிகிச்சை பிரிவை அணுகவும்."
      },
      recommendation: {
        en: "Call local emergency services (108 / 112) or reach the nearest Emergency Department immediately.",
        hi: "तुरंत आपातकालीन नंबर (१०८ / ११२) पर कॉल करें या निकटतम आपातकालीन कक्ष में जाएं।",
        ta: "உடனடியாக அவசர உதவி எண் 108 / 112-ஐ அழைக்கவும் அல்லது அவசர சிகிச்சை பிரிவுக்குச் செல்லவும்."
      }
    },
    {
      id: "low-sprain",
      title: "Mild Ankle Inversion",
      urgency: "LOW",
      symptoms: {
        en: "Twisted right ankle during morning walk. Mild localized swelling, but able to bear weight without sharp bone tenderness.",
        hi: "सुबह टहलते समय दाहिने टखने में मोच आ गई। हल्का सूजन है, लेकिन बिना तेज दर्द के वजन संभाल पा रहे हैं।",
        ta: "நடைப்பயிற்சியின் போது வலது கணுக்கால் சுளுக்கு. லேசான வீக்கம், ஆனால் நடக்க முடிகிறது."
      },
      duration: "1 Day",
      ageGroup: "Young Adult",
      clinicalTerms: ["Lateral Ankle Ligament Sprain Grade I", "Mild Edema"],
      assessment: {
        en: "Low-grade soft tissue strain without gross deformity or neurovascular compromise.",
        hi: "सामान्य लिगामेंट खिंचाव। कोई गंभीर विकृति या हड्डी टूटने के लक्षण नहीं हैं।",
        ta: "லேசான தசைநார் சுளுக்கு. எலும்பு முறிவுக்கான அறிகுறிகள் இல்லை."
      },
      recommendation: {
        en: "Apply R.I.C.E protocol (Rest, Ice, Compression, Elevation). Seek clinical review if swelling worsens over 48 hours.",
        hi: "R.I.C.E विधि (आराम, बर्फ, हल्की पट्टी, ऊंचाई) अपनाएं। ४८ घंटों में आराम न मिलने पर डॉक्टर को दिखाएं।",
        ta: "ஓய்வு மற்றும் பனிக்கட்டி ஒத்தடம் கொடுக்கவும். 48 மணி நேரத்தில் சரியாகாவிடில் மருத்துவரை அணுகவும்."
      }
    }
  ];

  const currentScenario = scenarios[selectedScenarioIndex];

  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case 'EMERGENCY':
        return {
          badgeBg: 'bg-rose-600 text-white',
          border: 'border-rose-300',
          bg: 'bg-rose-50/70',
          textColor: 'text-rose-950',
          icon: ShieldAlert,
          label: 'CRITICAL EMERGENCY PROTOCOL'
        };
      case 'MODERATE':
        return {
          badgeBg: 'bg-amber-500 text-white',
          border: 'border-amber-300',
          bg: 'bg-amber-50/70',
          textColor: 'text-amber-950',
          icon: AlertTriangle,
          label: 'MODERATE / CLINICAL REVIEW'
        };
      case 'LOW':
      default:
        return {
          badgeBg: 'bg-emerald-600 text-white',
          border: 'border-emerald-300',
          bg: 'bg-emerald-50/70',
          textColor: 'text-emerald-950',
          icon: CheckCircle2,
          label: 'LOW / ROUTINE GUIDANCE'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(currentScenario.urgency);
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <section id="triage-preview" className="py-16 sm:py-24 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200/80 px-3 py-1 text-xs font-bold text-teal-800 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Interactive Demonstration</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore How Triage Stratification Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Test realistic sample scenarios in English, Hindi, or Tamil to see how Swasthya AI categorizes clinical risk.
          </p>
        </div>

        {/* Control Bars: Scenarios & Languages */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {scenarios.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioIndex(idx)}
                className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                  selectedScenarioIndex === idx
                    ? 'bg-slate-900 text-white shadow-soft-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{sc.title}</span>
              </button>
            ))}
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 rounded-2xl bg-white border border-slate-200 p-1 shadow-soft-sm">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिन्दी' },
              { code: 'ta', label: 'தமிழ்' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setPreviewLanguage(lang.code)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  previewLanguage === lang.code
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Mock Triage Card */}
        <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-soft-lg">
          
          {/* Top Demo Banner */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 sm:px-6 py-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Info className="h-4 w-4 text-teal-600" />
              <span>Simulated Triage Demonstration</span>
            </span>
            <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-600">
              Sample Case #{selectedScenarioIndex + 1}
            </span>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            
            {/* Input Symptom Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Patient Reported Symptoms
                </span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                  Duration: {currentScenario.duration} • {currentScenario.ageGroup}
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                "{currentScenario.symptoms[previewLanguage] || currentScenario.symptoms.en}"
              </p>
            </div>

            {/* AI Urgency Stratification Box */}
            <div className={`rounded-2xl border p-4 sm:p-6 transition-all ${urgencyConfig.bg} ${urgencyConfig.border}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider ${urgencyConfig.badgeBg}`}>
                  <UrgencyIcon className="h-4 w-4" />
                  <span>{urgencyConfig.label}</span>
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Urgency Score: {currentScenario.urgency === 'EMERGENCY' ? 'High Risk' : currentScenario.urgency === 'MODERATE' ? 'Medium Risk' : 'Low Risk'}
                </span>
              </div>

              {/* Assessment Text */}
              <div className="mt-3">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Clinical Assessment
                </h4>
                <p className={`mt-1 text-sm sm:text-base font-bold ${urgencyConfig.textColor} leading-relaxed`}>
                  {currentScenario.assessment[previewLanguage] || currentScenario.assessment.en}
                </p>
              </div>

              {/* Clinical Terminology Tags */}
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Extracted Clinical Terms
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentScenario.clinicalTerms.map((term, tIdx) => (
                    <span key={tIdx} className="rounded-lg bg-white/90 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Directive */}
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Recommended Action
                </h4>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  👉 {currentScenario.recommendation[previewLanguage] || currentScenario.recommendation.en}
                </p>
              </div>
            </div>

            {/* Launch Real Triage Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                ⚠️ This is a simulation using pre-configured medical scenarios for demo purposes.
              </p>
              <button
                onClick={onStartRealTriage}
                className="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-soft hover:bg-teal-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap min-h-[44px]"
              >
                <span>Check Your Own Symptoms</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
