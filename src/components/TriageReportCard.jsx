import React from 'react';
import { AlertTriangle, Lock, FileDown, ArrowRight, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

export default function TriageReportCard({
  report,
  patientInfo,
  isLoggedIn,
  onOpenAuth,
  onDownloadPdf,
  translations
}) {
  const isEmergency = report.isEmergency || report.urgencyLevel === 'EMERGENCY';

  // Styles based on Urgency Levels
  const getUrgencyStyles = (level) => {
    switch (level) {
      case 'EMERGENCY':
        return {
          bg: 'bg-rose-50 border-rose-200',
          text: 'text-rose-800',
          badge: 'bg-rose-600 text-white',
          label: translations.emergencyWarningTitle || 'EMERGENCY'
        };
      case 'MODERATE':
        return {
          bg: 'bg-teal-50 border-teal-200',
          text: 'text-teal-900',
          badge: 'bg-teal-600 text-white',
          label: 'MODERATE / CLINICAL REVIEW'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          text: 'text-slate-800',
          badge: 'bg-slate-600 text-white',
          label: 'LOW / SELF-MONITORING'
        };
    }
  };

  const styles = getUrgencyStyles(report.urgencyLevel);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        
        {/* Top Header */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
          <h3 className="text-xl font-bold text-slate-800">
            {translations.resultsTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Session ID: {patientInfo.id} | Language: {patientInfo.language}
          </p>
        </div>

        {/* 1. Critical Emergency Banner (Always Visible) */}
        {isEmergency && (
          <div className="border-y border-rose-200 bg-rose-600 px-6 py-5 text-white sm:px-8">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="h-6 w-6 text-white flex-shrink-0 animate-bounce mt-0.5" />
              <div>
                <h4 className="font-bold text-base md:text-lg">
                  {translations.emergencyWarningTitle}
                </h4>
                <p className="mt-1 text-sm text-rose-100 font-medium">
                  {translations.emergencyWarningDesc}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Urgency Classification Section (Always Visible) */}
          <div className={`rounded-xl border p-5 ${styles.bg}`}>
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${styles.badge}`}>
              {styles.label}
            </span>
            <div className="mt-3 flex items-start justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {translations.urgencyLabel}
                </h4>
                <p className={`text-lg font-bold ${styles.text} mt-1`}>
                  {report.urgencyLevel === 'EMERGENCY' 
                    ? (translations.emergencyWarningTitle || 'Emergency Triage')
                    : report.urgencyLevel === 'MODERATE' 
                    ? 'Clinical Review Needed' 
                    : 'Self-monitoring & Home Care'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Detailed Report Container with Gate/Blur */}
          <div className="relative">
            
            {/* The Blur Cover for Logged-Out Users */}
            {!isLoggedIn && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/10 medical-blur rounded-xl p-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-lg font-bold text-slate-800">
                    {translations.paywallTitle}
                  </h4>
                  <p className="mt-2 text-sm text-slate-600">
                    {translations.paywallSubtitle}
                  </p>
                  <button
                    onClick={onOpenAuth}
                    className="mt-6 flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-500 hover:shadow-emerald-600/10 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>{translations.signUp} / {translations.login}</span>
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Assessment Content Details (Blurred if not logged in) */}
            <div className={`space-y-6 ${!isLoggedIn ? 'select-none pointer-events-none filter blur-[5px]' : ''}`}>
              
              {/* Primary Assessment */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {translations.primaryAssessmentLabel}
                </h4>
                <div className="mt-2 rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed font-medium">
                  {report.primaryAssessment}
                </div>
              </div>

              {/* Clinical Terminology */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {translations.clinicalTerminologyLabel}
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {report.clinicalTerms && report.clinicalTerms.map((term, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contributing Factors */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {translations.contributingFactorsLabel}
                </h4>
                <ul className="mt-2 space-y-2">
                  {report.contributingFactors && report.contributingFactors.map((factor, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-slate-700 font-medium"
                    >
                      <ChevronRight className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Action */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-emerald-600" />
                  {translations.recommendedActionLabel}
                </h4>
                <div className={`mt-2 rounded-xl border p-4 text-sm font-semibold leading-relaxed ${
                  report.urgencyLevel === 'EMERGENCY' 
                    ? 'bg-rose-50 border-rose-100 text-rose-800' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                }`}>
                  {report.recommendedAction}
                </div>
              </div>
            </div>
          </div>

          {/* Download PDF button (Visible only when logged in) */}
          {isLoggedIn && (
            <div className="border-t border-slate-100 pt-6 flex justify-end">
              <button
                onClick={onDownloadPdf}
                className="flex items-center space-x-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
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
