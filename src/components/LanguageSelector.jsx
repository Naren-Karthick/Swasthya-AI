import React from 'react';
import { languages } from '../localization';
import { Globe, X } from 'lucide-react';

export default function LanguageSelector({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center space-x-2 text-slate-800">
            <Globe className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-bold">Select Preferred Language / மொழி ಆಯ್ಕೆ</h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Select a language. The diagnostic steps, voice intake, and AI analysis report will be presented in your chosen language.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="flex items-center justify-center rounded-xl border border-slate-200 p-4 text-center font-semibold text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 active:bg-emerald-100 transition-all cursor-pointer text-base"
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
