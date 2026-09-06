import React, { useState, useEffect } from 'react';
import { HeartPulse, User, LogOut, History, Globe, Menu, X, Sparkles, Mic } from 'lucide-react';
import { languages } from '../localization';

export default function Header({
  user,
  onLogout,
  onOpenAuth,
  activeTab,
  setActiveTab,
  currentLanguage,
  onOpenLanguage,
  onStartLiveVoice,
  onStartTriage,
  _translations
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (tab, targetId = null) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const currentLangObj = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
      scrolled 
        ? 'border-b border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-soft-sm' 
        : 'border-b border-slate-200/60 bg-white/80 backdrop-blur-md'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('home')} 
          className="group flex cursor-pointer items-center space-x-2.5 sm:space-x-3 transition-transform duration-200 hover:scale-[1.01]"
        >
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20 flex-shrink-0">
            <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-teal-500 border-2 border-white"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Swasthya<span className="text-teal-600">AI</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Clinical Triage
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={() => handleNav('home', 'features')}
            className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Capabilities
          </button>
          <button
            onClick={() => handleNav('home', 'how-it-works')}
            className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('home', 'triage-preview')}
            className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Interactive Demo
          </button>
          <button
            onClick={() => handleNav('home', 'languages')}
            className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            8+ Languages
          </button>
          <button
            onClick={() => handleNav('home', 'safety')}
            className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-amber-700"
          >
            Safety
          </button>
        </nav>

        {/* Desktop Controls & CTAs */}
        <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Language Trigger */}
          {onOpenLanguage && (
            <button
              onClick={onOpenLanguage}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-soft-sm hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-800 transition-all cursor-pointer min-h-[38px]"
              title="Change Language"
            >
              <Globe className="h-3.5 w-3.5 text-teal-600" />
              <span className="uppercase font-bold">{currentLanguage}</span>
              <span className="text-[11px] text-slate-400 hidden xl:inline">({currentLangObj.name.split(' ')[0]})</span>
            </button>
          )}

          {/* User Auth or Dashboard */}
          {user ? (
            <div className="flex items-center space-x-2 border-r border-slate-200 pr-3">
              <button
                onClick={() => handleNav('dashboard')}
                className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer min-h-[38px]"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Live Voice Doctor CTA */}
          <button
            onClick={onStartLiveVoice}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-soft-sm shadow-glow-teal hover:from-teal-500 hover:to-emerald-500 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer min-h-[38px]"
          >
            <Mic className="h-3.5 w-3.5 animate-pulse" />
            <span>AI Doctor Audio</span>
          </button>

          {/* Standard Triage CTA */}
          <button
            onClick={onStartTriage}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer min-h-[38px]"
          >
            <span>Start Triage</span>
          </button>
        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex sm:hidden items-center space-x-1.5">
          {/* Quick Voice Audio Button on Mobile */}
          <button
            onClick={onStartLiveVoice}
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-soft-sm active:scale-95 min-h-[38px]"
            title="Live AI Doctor Audio"
          >
            <Mic className="h-3.5 w-3.5 mr-1 animate-pulse" />
            <span>Voice AI</span>
          </button>

          {onOpenLanguage && (
            <button
              onClick={onOpenLanguage}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-soft-sm active:bg-slate-100 min-h-[38px] min-w-[38px]"
              aria-label="Change Language"
            >
              <Globe className="h-4 w-4 text-teal-600" />
            </button>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-soft-sm active:bg-slate-100 min-h-[38px] min-w-[38px]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-slate-900" /> : <Menu className="h-5 w-5 text-slate-900" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNav('home')}
            className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all min-h-[44px] ${
              activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onStartLiveVoice();
            }}
            className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 px-4 py-3 text-sm font-bold text-teal-900 min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-teal-600 animate-pulse" />
              Live AI Doctor Audio
            </span>
            <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">New</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onStartTriage();
            }}
            className="flex w-full items-center space-x-3 rounded-xl bg-teal-600 text-white px-4 py-3 text-sm font-bold min-h-[44px]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Start Symptom Check</span>
          </button>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <button
              onClick={() => handleNav('home', 'features')}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              Capabilities
            </button>
            <button
              onClick={() => handleNav('home', 'how-it-works')}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNav('home', 'triage-preview')}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              Interactive Triage Demo
            </button>
            <button
              onClick={() => handleNav('home', 'safety')}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg"
            >
              Safety Guidelines
            </button>
          </div>

          {user ? (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => handleNav('dashboard')}
                className="flex w-full items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                <History className="h-4 w-4 text-teal-600" />
                <span>My Past Assessments</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                <span>Login or Create Account</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
