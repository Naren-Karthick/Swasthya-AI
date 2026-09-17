import React from 'react';
import { PhoneCall, AlertOctagon, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';

export const EmergencyActionBanner = ({ 
  detectedWarningSigns = [],
  customWarningMessage = null
}) => {
  return (
    <div 
      role="alert"
      aria-live="assertive"
      className="rounded-3xl border-2 border-rose-600 bg-gradient-to-b from-rose-50 via-rose-50/70 to-red-100/40 p-5 sm:p-7 shadow-lg shadow-rose-600/10 mb-6 text-slate-900"
    >
      {/* Top Banner Alert Bar */}
      <div className="flex items-start sm:items-center gap-3.5 pb-4 border-b border-rose-200">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30 flex-shrink-0">
          <AlertOctagon className="h-7 w-7 sm:h-8 sm:w-8 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white mb-1 shadow-xs">
            <span>🚨 Critical Urgency: Act Now</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight leading-tight">
            Potential Medical Emergency Detected
          </h2>
        </div>
      </div>

      {/* Explicit Mandate Disclaimer */}
      <div className="mt-4 rounded-2xl bg-white/90 border border-rose-200 p-4 sm:p-4.5 shadow-soft-sm">
        <p className="text-sm sm:text-base font-bold text-rose-900 leading-relaxed">
          ⚠️ If symptoms are severe, worsening, or life-threatening, do not wait for this tool. Contact emergency services immediately.
        </p>
        {customWarningMessage && (
          <p className="mt-2 text-xs sm:text-sm font-semibold text-rose-800">
            {customWarningMessage}
          </p>
        )}
      </div>

      {/* Detected Critical Warning Signs */}
      {detectedWarningSigns && detectedWarningSigns.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-rose-900 flex items-center gap-1.5 mb-2">
            <ShieldAlert className="h-4 w-4 text-rose-700" />
            <span>Identified Red Flags & Warning Signs:</span>
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {detectedWarningSigns.map((sign, idx) => (
              <li 
                key={idx} 
                className="flex items-start gap-2 rounded-xl bg-white/80 border border-rose-200/80 p-2.5 text-xs sm:text-sm font-bold text-rose-950"
              >
                <span className="text-rose-600 text-base leading-none font-black">•</span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Emergency Immediate Action Buttons (Large, Touch-Friendly for Seniors >= 48px) */}
      <div className="mt-6 pt-4 border-t border-rose-200/80">
        <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-950 mb-3 flex items-center gap-1.5">
          <PhoneCall className="h-4 w-4 text-rose-700" />
          <span>Immediate Direct Action Contacts:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Call 108 */}
          <a
            href="tel:108"
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white px-4 py-3.5 sm:py-4 text-base sm:text-lg font-black shadow-md shadow-rose-600/30 transition-all cursor-pointer min-h-[52px] text-center"
            aria-label="Call 108 Emergency Ambulance"
          >
            <PhoneCall className="h-5 w-5 animate-bounce" />
            <span>Call 108 (Ambulance)</span>
          </a>

          {/* Call 112 */}
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-4 py-3.5 sm:py-4 text-base sm:text-lg font-black shadow-md shadow-slate-900/20 transition-all cursor-pointer min-h-[52px] text-center"
            aria-label="Call 112 National Emergency Response"
          >
            <PhoneCall className="h-5 w-5" />
            <span>Call 112 (Emergency)</span>
          </a>

          {/* Find Nearest Hospital */}
          <a
            href="https://www.google.com/maps/search/nearest+emergency+room+hospital/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-rose-50 border-2 border-rose-600 text-rose-800 active:scale-98 px-4 py-3.5 sm:py-4 text-sm sm:text-base font-black shadow-soft-sm transition-all cursor-pointer min-h-[52px] text-center"
            aria-label="Find Nearest Emergency Hospital on Maps"
          >
            <MapPin className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <span>Find Nearest Hospital</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmergencyActionBanner;
