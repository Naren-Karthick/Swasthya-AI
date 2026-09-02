import React, { useState } from 'react';
import { HeartPulse, User, LogOut, History, Home, Globe, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  onOpenAuth,
  activeTab,
  setActiveTab,
  currentLanguage,
  onOpenLanguage,
  translations
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 glass-panel">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('home')} 
          className="group flex cursor-pointer items-center space-x-2.5 sm:space-x-3 transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Swasthya<span className="text-emerald-600">AI</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
              Clinical Triage
            </span>
          </div>
        </div>

        {/* Desktop / Tablet Controls */}
        <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
          {/* Home Nav */}
          <button
            onClick={() => handleNav('home')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${
              activeTab === 'home'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>{translations.backToHome || 'Home'}</span>
          </button>

          {/* Quick Language Trigger */}
          {onOpenLanguage && (
            <button
              onClick={onOpenLanguage}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-soft-sm hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all cursor-pointer min-h-[40px]"
              title="Change Language"
            >
              <Globe className="h-4 w-4 text-emerald-600" />
              <span className="uppercase font-bold text-xs">{currentLanguage}</span>
            </button>
          )}

          {user ? (
            <>
              {/* Dashboard */}
              <button
                onClick={() => handleNav('dashboard')}
                className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <History className="h-4 w-4" />
                <span>{translations.dashboard || 'Dashboard'}</span>
              </button>

              {/* User Profile Info & Logout */}
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 max-w-[130px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer min-h-[40px]"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">{translations.logout || 'Logout'}</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer min-h-[40px]"
            >
              <User className="h-4 w-4" />
              <span>{translations.login || 'Sign In'}</span>
            </button>
          )}
        </div>

        {/* Mobile Quick Action Buttons & Menu Toggle */}
        <div className="flex sm:hidden items-center space-x-1.5">
          {onOpenLanguage && (
            <button
              onClick={onOpenLanguage}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-soft-sm active:bg-slate-100 min-h-[40px] min-w-[40px]"
              aria-label="Change Language"
            >
              <Globe className="h-4 w-4 text-emerald-600" />
            </button>
          )}

          {!user ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm active:scale-95 min-h-[40px]"
            >
              <User className="h-3.5 w-3.5 mr-1" />
              <span>{translations.login || 'Sign In'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleNav('dashboard')}
              className={`flex items-center justify-center rounded-xl p-2 text-xs font-semibold min-h-[40px] min-w-[40px] ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
              title="Dashboard"
            >
              <History className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-soft-sm active:bg-slate-100 min-h-[40px] min-w-[40px]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-slate-900" /> : <Menu className="h-5 w-5 text-slate-900" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNav('home')}
            className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all min-h-[44px] ${
              activeTab === 'home'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>{translations.backToHome || 'Home'}</span>
          </button>

          {user && (
            <button
              onClick={() => handleNav('dashboard')}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all min-h-[44px] ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <History className="h-4 w-4 text-emerald-600" />
              <span>{translations.dashboard || 'Dashboard & History'}</span>
            </button>
          )}

          {user && (
            <div className="pt-2 border-t border-slate-100">
              <div className="px-4 py-2">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all min-h-[44px]"
              >
                <LogOut className="h-4 w-4" />
                <span>{translations.logout || 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}


