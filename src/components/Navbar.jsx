import React from 'react';
import { HeartPulse, User, LogOut, History, Home } from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  onOpenAuth,
  activeTab,
  setActiveTab,
  currentLanguage,
  translations
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="flex cursor-pointer items-center space-x-2 text-emerald-600 hover:opacity-90"
        >
          <HeartPulse className="h-8 w-8 text-emerald-500 animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Swasthya<span className="text-emerald-600">AI</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'home'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">{translations.backToHome || 'Home'}</span>
          </button>

          {user ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">{translations.dashboard || 'Dashboard'}</span>
              </button>

              <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                <span className="hidden text-sm font-medium text-slate-700 lg:inline-block">
                  Hi, {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{translations.logout || 'Logout'}</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>{translations.login || 'Login / Sign Up'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
