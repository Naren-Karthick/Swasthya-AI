import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Globe, 
  Menu, 
  X, 
  Mic, 
  RotateCcw, 
  ShieldCheck, 
  BookmarkCheck,
  History,
  LogIn,
  LogOut,
  User,
  Stethoscope
} from 'lucide-react';
import { languages } from '../localization';

export default function Header({
  activeTab,
  setActiveTab,
  currentLanguage,
  onOpenLanguage,
  onStartLiveVoice,
  onStartTriage,
  onOpenSampleCases,
  onClearDemoData,
  demoRecordCount = 0,
  currentUser = null,
  onOpenAuthModal,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
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
        : 'border-b border-slate-200/60 bg-white/90 backdrop-blur-md'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo with Plain Identity */}
        <div 
          onClick={() => handleNav('home')} 
          className="group flex cursor-pointer items-center space-x-2.5 sm:space-x-3 transition-transform duration-200 hover:scale-[1.01]"
        >
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-600/20 flex-shrink-0">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              Swasthya<span className="text-teal-600">AI</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              Clinical Triage Guidance
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs sm:text-sm font-bold text-slate-700">
          <button
            onClick={() => handleNav('home')}
            className={`rounded-xl px-3 py-2 transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'home' ? 'text-teal-900 bg-teal-50 font-black' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Home
          </button>

          {/* Dedicated Start Triage Tab */}
          <button
            onClick={() => {
              if (onStartTriage) onStartTriage();
              else handleNav('triage');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'triage'
                ? 'text-teal-950 bg-teal-100 border border-teal-300 font-black shadow-soft-sm'
                : 'hover:bg-teal-50 hover:text-teal-900 text-teal-800 font-bold'
            }`}
          >
            <Stethoscope className="h-4 w-4 text-teal-600" />
            <span>Start Triage</span>
          </button>

          {/* Past Triage Tab Trigger */}
          <button
            onClick={() => handleNav('dashboard')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition-colors cursor-pointer min-h-[44px] ${
              activeTab === 'dashboard' ? 'text-teal-900 bg-teal-100/70 border border-teal-200 font-black' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History className="h-4 w-4 text-teal-600" />
            <span>Past Triage</span>
            {demoRecordCount > 0 && (
              <span className="rounded-full bg-teal-600 text-white text-[10px] font-black px-2 py-0.5 ml-0.5">
                {demoRecordCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => handleNav('home', 'how-it-works')}
            className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer min-h-[44px]"
          >
            How It Works
          </button>

          <button
            onClick={() => handleNav('home', 'safety')}
            className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-amber-800 min-h-[44px]"
          >
            Emergency & Safety
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="hidden sm:flex items-center space-x-2.5">

          {/* Anonymous Demo Badge */}
          {!currentUser && (
            <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Anonymous Demo Mode</span>
            </div>
          )}

          {/* Clear Demo Data if records exist */}
          {demoRecordCount > 0 && (
            <button
              onClick={onClearDemoData}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-700 transition-colors cursor-pointer min-h-[44px]"
              title="Clear all local demo reports from this browser"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear History ({demoRecordCount})</span>
            </button>
          )}

          {/* Language Selector Trigger */}
          <button
            onClick={onOpenLanguage}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:border-teal-400 hover:bg-teal-50/50 transition-all cursor-pointer min-h-[44px]"
            aria-label="Change Language"
          >
            <Globe className="h-4 w-4 text-teal-600" />
            <span>{currentLangObj.name}</span>
          </button>

          {/* Sample Cases Trigger (Judge Demo) */}
          <button
            onClick={onOpenSampleCases}
            className="flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-950 hover:bg-amber-100 transition-all cursor-pointer min-h-[44px]"
          >
            <BookmarkCheck className="h-4 w-4 text-amber-700" />
            <span>Sample Cases</span>
          </button>

          {/* Live Voice Consultation Trigger */}
          {onStartLiveVoice && (
            <button
              onClick={onStartLiveVoice}
              className="flex items-center space-x-1.5 rounded-xl bg-teal-50 border border-teal-200 px-3.5 py-2 text-xs sm:text-sm font-bold text-teal-900 hover:bg-teal-100 transition-all cursor-pointer min-h-[44px]"
            >
              <Mic className="h-4 w-4 text-teal-600" />
              <span>Voice Intake</span>
            </button>
          )}

          {/* User Authentication Mode (Login / User Chip) */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className="flex items-center gap-2 rounded-xl border-2 border-teal-600 bg-teal-50/80 hover:bg-teal-100 px-3 py-1.5 text-xs text-left cursor-pointer min-h-[44px]"
                title="Open Triage Dashboard"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-white text-xs font-black">
                  {currentUser.role === 'doctor' ? '🩺' : '👤'}
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-slate-900 max-w-[110px] truncate leading-tight">
                    {currentUser.name || 'User'}
                  </span>
                  <span className="text-[10px] font-extrabold text-teal-800 uppercase leading-none">
                    {currentUser.role === 'doctor' ? 'Clinician' : 'Patient'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 p-2.5 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 rounded-xl border-2 border-teal-600 bg-white hover:bg-teal-50 px-3.5 py-2 text-xs sm:text-sm font-black text-teal-900 shadow-soft-sm transition-all cursor-pointer min-h-[44px]"
            >
              <LogIn className="h-4 w-4 text-teal-700" />
              <span>Sign In</span>
            </button>
          )}

        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex sm:hidden items-center space-x-1.5">
          {/* Quick Language Toggle */}
          <button
            onClick={onOpenLanguage}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 shadow-soft-sm active:bg-slate-100 min-h-[44px] min-w-[44px]"
            aria-label="Change Language"
          >
            <Globe className="h-4 w-4 text-teal-600" />
          </button>

          {/* Mobile Login / User Profile */}
          {currentUser ? (
            <button
              onClick={() => handleNav('dashboard')}
              className="flex items-center justify-center rounded-xl bg-teal-100 border border-teal-300 p-2.5 text-teal-900 min-h-[44px] min-w-[44px]"
              aria-label="Dashboard"
            >
              <User className="h-4 w-4 text-teal-700" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center justify-center rounded-xl bg-teal-50 border border-teal-300 p-2.5 text-teal-900 min-h-[44px] min-w-[44px]"
              aria-label="Sign In"
            >
              <LogIn className="h-4 w-4 text-teal-700" />
            </button>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 shadow-soft-sm active:bg-slate-100 min-h-[44px] min-w-[44px]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-slate-900" /> : <Menu className="h-5 w-5 text-slate-900" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-2.5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNav('home')}
            className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-bold min-h-[48px] ${
              activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>Home / Details</span>
          </button>

          <button
            onClick={() => {
              if (onStartTriage) onStartTriage();
              else handleNav('triage');
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-bold min-h-[48px] ${
              activeTab === 'triage' ? 'bg-teal-700 text-white' : 'border border-teal-300 bg-teal-50 text-teal-950'
            }`}
          >
            <Stethoscope className="h-4 w-4 text-teal-600" />
            <span>Start Clinical Triage</span>
          </button>

          {/* Mobile Dashboard Link */}
          <button
            onClick={() => handleNav('dashboard')}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold min-h-[48px] ${
              activeTab === 'dashboard' ? 'bg-teal-700 text-white' : 'border border-teal-300 bg-teal-50 text-teal-950'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Past Triage Dashboard</span>
            </div>
            {demoRecordCount > 0 && (
              <span className="rounded-full bg-white text-teal-900 text-xs font-black px-2 py-0.5">
                {demoRecordCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSampleCases();
            }}
            className="flex w-full items-center space-x-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950 min-h-[48px]"
          >
            <BookmarkCheck className="h-4 w-4 text-amber-700" />
            <span>Try a Sample Case (Judge Demo)</span>
          </button>

          {onStartLiveVoice && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartLiveVoice();
              }}
              className="flex w-full items-center space-x-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-900 min-h-[48px]"
            >
              <Mic className="h-4 w-4 text-teal-600" />
              <span>Voice Intake Assistant</span>
            </button>
          )}

          {/* Mobile Login / Logout Option */}
          {currentUser ? (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-extrabold text-slate-900">{currentUser.name}</span>
                <span className="block text-[10px] text-teal-700 font-bold uppercase">{currentUser.role || 'Patient'}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 min-h-[40px]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal();
              }}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-soft min-h-[48px]"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In / Login Mode</span>
            </button>
          )}

          {demoRecordCount > 0 && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onClearDemoData();
              }}
              className="flex w-full items-center space-x-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 min-h-[48px]"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
              <span>Clear History Records ({demoRecordCount})</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
