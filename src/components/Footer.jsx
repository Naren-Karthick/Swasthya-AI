import React from 'react';
import { HeartPulse, Globe, PhoneCall, ShieldCheck } from 'lucide-react';


export default function Footer({ onOpenLanguage, currentLanguage }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/90 backdrop-blur-md pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Swasthya<span className="text-teal-600">AI</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed font-medium">
              An intelligent, multilingual clinical symptom triage and voice AI consultation platform supporting 8+ Indian languages. Designed to help patients and families understand urgency and take informed next steps.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 font-semibold">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Safety-First Decision Support</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600">
              <li>
                <a href="#features" className="hover:text-teal-600 transition-colors">Core Capabilities</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#triage-preview" className="hover:text-teal-600 transition-colors">Interactive Triage Demo</a>
              </li>
              <li>
                <a href="#languages" className="hover:text-teal-600 transition-colors">Supported Indian Languages</a>
              </li>
              <li>
                <a href="#safety" className="hover:text-teal-600 transition-colors">Safety Guidelines</a>
              </li>
            </ul>
          </div>

          {/* Emergency & Language Contacts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Emergency Hotlines (India)
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600">
              <li className="flex items-center gap-1.5 text-rose-600 font-bold">
                <PhoneCall className="h-3.5 w-3.5" />
                <a href="tel:108" className="hover:underline">108 - Medical Emergency & Ambulance</a>
              </li>
              <li className="flex items-center gap-1.5 text-slate-800">
                <PhoneCall className="h-3.5 w-3.5 text-teal-600" />
                <a href="tel:112" className="hover:underline">112 - National Emergency Support</a>
              </li>
              <li className="flex items-center gap-1.5 text-slate-700">
                <PhoneCall className="h-3.5 w-3.5 text-teal-600" />
                <a href="tel:102" className="hover:underline">102 - Maternity & Child Referral</a>
              </li>
            </ul>

            {onOpenLanguage && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={onOpenLanguage}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-teal-400 hover:text-teal-700 shadow-soft-sm cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5 text-teal-600" />
                  <span>Change Language ({currentLanguage.toUpperCase()})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Swasthya AI. All rights reserved.</p>
          <p className="max-w-xl text-center sm:text-right font-medium">
            Clinical triage prototype. This software does not provide medical diagnoses or prescriptions. In life-threatening situations, immediately contact local emergency healthcare facilities.
          </p>
        </div>

      </div>
    </footer>
  );
}
