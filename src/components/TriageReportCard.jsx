import React from 'react';
import { 
  AlertTriangle, 
  Lock, 
  FileDown, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  Stethoscope, 
  ShieldCheck, 
  HeartPulse,
  ArrowLeft
} from 'lucide-react';

export default function TriageReportCard({
  report,
  patientInfo,
  isLoggedIn,
  onOpenAuth,
  onDownloadPdf,
  onBackToHome,
  translations
}) {
  const isEmergency = report.isEmergency || report.urgencyLevel === 'EMERGENCY';

  // Styles based on Urgency Levels
  const getUrgencyStyles = (level) => {
    switch (level) {
      case 'EMERGENCY':
        return {
          bg: 'bg-rose-50/90 border-rose-200',
          text: 'text-rose-900',
          badge: 'bg-rose-600 text-white shadow-sm shadow-rose-600/30',
          pillBg: 'bg-rose-100/80 text-rose-800 border-rose-300',
          icon: ShieldAlert,
          label: translations.emergencyWarningTitle || 'CRITICAL EMERGENCY'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-50/90 border-amber-200',
          text: 'text-amber-950',
          badge: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',
          pillBg: 'bg-amber-100/80 text-amber-900 border-amber-300',
          icon: AlertTriangle,
          label: 'MODERATE / CLINICAL CONSULT'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50/90 border-emerald-200',
          text: 'text-emerald-950',
          badge: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
          pillBg: 'bg-emerald-100/80 text-emerald-900 border-emerald-300',
          icon: CheckCircle2,
          label: 'LOW / ROUTINE GUIDANCE'
        };
    }
  };

  const styles = getUrgencyStyles(report.urgencyLevel);
  const StatusIcon = styles.icon;

  return (
    <div className="mx-auto max-w-3xl px-3.5 py-6 sm:py-12">
      
      {/* Top Back Nav */}
      {onBackToHome && (
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBackToHome}
            className="group inline-flex items-center space-x-2 rounded-xl bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 shadow-soft-sm transition-all cursor-pointer min-h-[38px]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-teal-600" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-soft-lg">
        
        {/* Top Header Card */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-teal-500 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {translations.resultsTitle}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">
              Ref ID: <span className="font-mono text-slate-700">{patientInfo.id}</span> • Language: <span className="font-bold text-slate-700">{patientInfo.language}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-soft-sm">
              {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </span>
          </div>
        </div>

        {/* 1. Critical Emergency Banner (Always Visible if EMERGENCY) */}
        {isEmergency && (
          <div className="border-y border-rose-300 bg-gradient-to-r from-rose-600 to-red-700 px-4 py-4 sm:px-8 sm:py-5 text-white shadow-inner">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="h-6 w-6 sm:h-7 sm:w-7 text-white flex-shrink-0 animate-bounce mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight leading-tight">
                  {translations.emergencyWarningTitle || 'IMMEDIATE MEDICAL ATTENTION REQUIRED'}
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
                  {translations.emergencyWarningDesc || 'Symptoms indicate a potentially critical condition. Please contact emergency services (108 / 112) or visit the nearest ER immediately.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-8 space-y-5 sm:space-y-7">
          
          {/* Urgency Classification Section (Always Visible) */}
          <div className={`rounded-2xl border p-4 sm:p-6 transition-all ${styles.bg}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider ${styles.badge}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{styles.label}</span>
              </span>
              
              <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border ${styles.pillBg}`}>
                Triage Stratification
              </span>
            </div>

            <div className="mt-3 sm:mt-4">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                {translations.urgencyLabel}
              </h4>
              <p className={`text-lg sm:text-xl font-extrabold ${styles.text} mt-1 leading-tight`}>
                {report.urgencyLevel === 'EMERGENCY' 
                  ? (translations.emergencyWarningTitle || 'Emergency Protocol Triggered')
                  : report.urgencyLevel === 'MODERATE' 
                  ? 'Clinical Review & Consult Recommended' 
                  : 'Self-Monitoring & Guided Recovery'}
              </p>
            </div>
          </div>

          {/* 2. Detailed Report Container with Gate/Blur for Logged-Out */}
          <div className="relative">
            
            {/* The Frosted Glass Paywall Cover for Logged-Out Users */}
            {!isLoggedIn && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 medical-blur rounded-2xl p-3 sm:p-6 transition-all">
                <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/95 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 shadow-soft-sm border border-teal-200/50">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {translations.paywallTitle || 'Sign in to View Full Clinical Analysis'}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {translations.paywallSubtitle || 'Create a free account or login to view standardized clinical terms, diagnostic assessments, and export official PDF summaries.'}
                  </p>
                  <button
                    onClick={onOpenAuth}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-soft-lg shadow-glow-teal hover:from-teal-500 hover:to-emerald-500 active:scale-98 transition-all cursor-pointer min-h-[44px]"
                  >
                    <span>{translations.signUp || 'Sign Up'} / {translations.login || 'Login'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Assessment Content Details (Blurred if not logged in) */}
            <div className={`space-y-5 sm:space-y-6 ${!isLoggedIn ? 'select-none pointer-events-none filter blur-[6px] opacity-70' : ''}`}>
              
              {/* Primary Assessment */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-teal-600" />
                  <span>{translations.primaryAssessmentLabel}</span>
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {report.primaryAssessment}
                </p>
              </div>

              {/* Clinical Terminology */}
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-3">
                  <Stethoscope className="h-4 w-4 text-cyan-600" />
                  <span>{translations.clinicalTerminologyLabel}</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {report.clinicalTerms && report.clinicalTerms.map((term, index) => (
                    <span
                      key={index}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200/80 shadow-soft-sm"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contributing Factors */}
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{translations.contributingFactorsLabel}</span>
                </h4>
                <div className="space-y-2">
                  {report.contributingFactors && report.contributingFactors.map((factor, index) => (
                    <div
                      key={index}
                      className="flex items-start rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 sm:p-3 text-xs sm:text-sm text-slate-700 font-medium"
                    >
                      <ChevronRight className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="border-t border-slate-100 pt-4 sm:pt-6">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2 sm:mb-3">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>{translations.recommendedActionLabel}</span>
                </h4>
                <div className={`rounded-2xl border p-4 sm:p-5 text-xs sm:text-sm font-semibold leading-relaxed shadow-soft-sm ${
                  report.urgencyLevel === 'EMERGENCY' 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : 'bg-teal-50/80 border-teal-200 text-teal-950'
                }`}>
                  {report.recommendedAction}
                </div>
              </div>
            </div>
          </div>

          {/* Download PDF button (Visible only when logged in) */}
          {isLoggedIn && (
            <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>Verified Diagnostic Session</span>
              </div>
              <button
                onClick={onDownloadPdf}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-soft hover:bg-slate-800 active:scale-95 transition-all cursor-pointer min-h-[44px]"
              >
                <FileDown className="h-4 w-4" />
                <span>{translations.downloadPdfReport}</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
