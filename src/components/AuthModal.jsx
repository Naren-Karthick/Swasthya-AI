import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Stethoscope, 
  UserCheck, 
  Sparkles,
  Database
} from 'lucide-react';

export default function AuthModal({ 
  onClose, 
  onSubmit, 
  _translations = {}
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1-Click Quick Demo Sign-In Presets for Hackathon Judges
  const handleQuickDemo = async (presetRole) => {
    setError('');
    setLoading(true);
    try {
      if (presetRole === 'patient') {
        await onSubmit('login', {
          email: 'narenkarthickgururaju@gmail.com',
          password: 'Narenguru',
          name: 'Naren Karthick G',
          role: 'patient'
        });
      } else {
        await onSubmit('login', {
          email: 'priya.sharma@swasthya.ai',
          password: 'DoctorPassword123',
          name: 'Dr. Priya Sharma, MD',
          role: 'doctor'
        });
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Authentication error. Falling back to local demo mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(mode, { 
        name: name.trim() || (role === 'doctor' ? 'Dr. Physician' : 'Patient User'), 
        email: email.trim(), 
        password: password.trim(),
        role 
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="authModalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-7 py-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-soft-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="authModalTitle" className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {mode === 'signup' ? 'Create Swasthya Account' : 'Sign In to Swasthya AI'}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-700 mt-0.5">
                <Database className="h-3 w-3" />
                <span>Cloud Synced Database (npoint.io)</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close authentication modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-4 max-h-[85vh] overflow-y-auto">
          
          {/* Quick Demo Access Bar (Highlighted for Judge Demo) */}
          <div className="rounded-2xl border-2 border-teal-500/80 bg-gradient-to-br from-teal-50/90 via-emerald-50/60 to-white p-4 shadow-soft-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-950">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span>Quick 1-Click Judge Demo</span>
              </span>
              <span className="text-[11px] font-bold text-teal-700 bg-white border border-teal-200 px-2 py-0.5 rounded-full">
                Instant Access
              </span>
            </div>
            
            <p className="text-xs text-slate-600 font-medium">
              Skip typing credentials. Tap below to log in directly and inspect past triage history:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Demo Patient Button */}
              <button
                type="button"
                onClick={() => handleQuickDemo('patient')}
                disabled={loading}
                className="flex items-center justify-between gap-2 rounded-xl bg-white border-2 border-teal-600/40 hover:border-teal-600 hover:bg-teal-50/80 p-3 text-left shadow-soft-sm transition-all cursor-pointer min-h-[50px] active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-black text-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Demo Patient</div>
                    <div className="text-[10px] font-bold text-teal-700">12 Past Triages in Cloud</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-teal-600 flex-shrink-0" />
              </button>

              {/* Demo Doctor Button */}
              <button
                type="button"
                onClick={() => handleQuickDemo('doctor')}
                disabled={loading}
                className="flex items-center justify-between gap-2 rounded-xl bg-white border-2 border-slate-300 hover:border-slate-600 hover:bg-slate-50 p-3 text-left shadow-soft-sm transition-all cursor-pointer min-h-[50px] active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-black text-xs">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Dr. Priya Sharma</div>
                    <div className="text-[10px] font-bold text-slate-500">Clinician Portal Mode</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 flex-shrink-0" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <span className="relative bg-white px-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              Or Sign In With Credentials
            </span>
          </div>

          {/* Role Switcher Pill */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold transition-all cursor-pointer min-h-[44px] ${
                role === 'patient'
                  ? 'bg-white text-teal-900 shadow-soft-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Patient Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold transition-all cursor-pointer min-h-[44px] ${
                role === 'doctor'
                  ? 'bg-white text-teal-900 shadow-soft-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Clinician / Doctor</span>
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
              {error}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={role === 'doctor' ? 'Dr. Name, MD' : 'Your Full Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none text-sm font-medium min-h-[48px]"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={role === 'doctor' ? 'doctor@hospital.org' : 'patient@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none text-sm font-medium min-h-[48px]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password / Secure PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none text-sm font-medium min-h-[48px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 py-3.5 text-sm sm:text-base font-black text-white shadow-soft hover:shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer min-h-[50px]"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account & Sign In' : 'Sign In'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Sign Up */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup');
                setError('');
              }}
              className="font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              {mode === 'signup'
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>

            <span className="text-slate-400">•</span>

            <button
              type="button"
              onClick={onClose}
              className="font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Continue anonymously
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
