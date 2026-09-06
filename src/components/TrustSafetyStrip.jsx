import React from 'react';
import { ShieldCheck, Lock, Globe, Stethoscope } from 'lucide-react';

export default function TrustSafetyStrip() {
  const trustPoints = [
    {
      icon: ShieldCheck,
      title: "Safety-First Triage",
      desc: "Heuristic and protocol-based clinical urgency stratification to prioritize critical signs."
    },
    {
      icon: Lock,
      title: "Privacy-Conscious",
      desc: "Client-controlled sessions. No advertising trackers and no selling of sensitive patient data."
    },
    {
      icon: Globe,
      title: "Multilingual Inclusivity",
      desc: "Engineered for linguistic diversity across 8 major Indian languages in text and voice."
    },
    {
      icon: Stethoscope,
      title: "Clinical Decision Support",
      desc: "Structured symptom guidance to inform discussions with your licensed healthcare provider."
    }
  ];

  return (
    <section className="border-y border-slate-200/80 bg-white/70 backdrop-blur-md py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {trustPoints.map((point, idx) => {
            const Icon = point.icon;
            return (
              <div key={idx} className="flex items-start space-x-3.5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-100/80 text-teal-700 shadow-soft-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed font-medium">
                    {point.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
