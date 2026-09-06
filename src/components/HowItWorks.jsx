import React from 'react';
import { Mic, HelpCircle, FileCheck, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      stepNumber: "01",
      icon: Mic,
      title: "Describe Your Symptoms",
      desc: "Speak naturally using live audio consultation or type in your native Indian language. Mention where it hurts and when it began.",
      tag: "Voice or Text"
    },
    {
      stepNumber: "02",
      icon: HelpCircle,
      title: "Targeted Clinical Follow-ups",
      desc: "Answer concise questions about onset duration, pain intensity, and specific red flags so the AI can assess potential risk factors.",
      tag: "Interactive Dialogue"
    },
    {
      stepNumber: "03",
      icon: FileCheck,
      title: "Urgency Guidance & Doctor PDF",
      desc: "Get an immediate urgency classification (Emergency, Moderate, Low), clear self-care advice, and a downloadable summary for your doctor.",
      tag: "Actionable Summary"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200/80 px-3 py-1 text-xs font-bold text-teal-800 mb-3">
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Swasthya AI Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Designed for ease of use by patients and family members, even during stressful medical moments.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-soft-sm hover:shadow-soft-lg hover:border-teal-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Top Bar with Number & Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-slate-200 group-hover:text-teal-500/30 transition-colors">
                      {step.stepNumber}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 border border-slate-200/60">
                      {step.tag}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-soft-sm mb-4">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow indicator at bottom */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-teal-600 group-hover:text-teal-700">
                  <span>Step {idx + 1} of 3</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
