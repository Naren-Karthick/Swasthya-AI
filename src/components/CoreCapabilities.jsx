import React from 'react';
import { 
  Mic, 
  Languages, 
  Activity, 
  FileDown, 
  HelpCircle, 
  Compass,
  ArrowRight
} from 'lucide-react';

export default function CoreCapabilities({ onStartLiveVoice, onStartTriage }) {
  const capabilities = [
    {
      icon: Mic,
      badge: "Gemini Live Style",
      title: "Audio Doctor Consultation",
      desc: "Speak naturally in your native language. An empathetic AI triage doctor leads the conversation with spoken follow-ups.",
      action: "Try Voice AI",
      onAction: onStartLiveVoice,
      accent: "teal"
    },
    {
      icon: Languages,
      badge: "8+ Regional Languages",
      title: "Vernacular Linguistic Model",
      desc: "Comprehensive support for Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, and English.",
      action: "View Languages",
      target: "languages",
      accent: "cyan"
    },
    {
      icon: Activity,
      badge: "3-Tier Stratification",
      title: "Urgency Triage Guidance",
      desc: "Instantly stratifies symptoms into Emergency, Moderate, or Low urgency levels with appropriate escalations.",
      action: "Test Simulator",
      target: "triage-preview",
      accent: "emerald"
    },
    {
      icon: FileDown,
      badge: "Doctor-Ready",
      title: "Standardized PDF Summaries",
      desc: "Exports structured clinical summaries including symptom onset, terminology, and triage indicators for your physician.",
      action: "Check Format",
      target: "triage-preview",
      accent: "indigo"
    },
    {
      icon: HelpCircle,
      badge: "Context-Aware",
      title: "Focused Follow-Up Questions",
      desc: "Gathers critical clinical parameters like age bracket, duration, and aggravating factors before triage.",
      action: "Start Intake",
      onAction: onStartTriage,
      accent: "blue"
    },
    {
      icon: Compass,
      badge: "Action-Oriented",
      title: "Clear Next-Step Guidance",
      desc: "Actionable recommendations on whether to seek emergency care, schedule a routine consult, or monitor at home.",
      action: "Learn More",
      target: "safety",
      accent: "amber"
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-800 mb-3">
            <span>Built for Real-World Care</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Core Capabilities of Swasthya AI
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Bridging linguistic and geographical barriers to deliver calm, prompt clinical triage guidance.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-soft-sm hover:shadow-soft-lg hover:border-teal-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-100/80 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {item.onAction ? (
                    <button
                      onClick={item.onAction}
                      className="inline-flex items-center text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
                    >
                      <span>{item.action}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <a
                      href={`#${item.target}`}
                      className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      <span>{item.action}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
