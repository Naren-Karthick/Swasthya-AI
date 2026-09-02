import React from 'react';
import { languages } from '../localization';
import { Globe, X, Check, Languages } from 'lucide-react';

export default function LanguageSelector({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center space-x-2.5 text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Choose Language / மொழி தேர்வு
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                Real-time translation for symptom intake & AI reports
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="p-6 sm:p-7">
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-4 text-center hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-soft active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {lang.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  {lang.code}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
