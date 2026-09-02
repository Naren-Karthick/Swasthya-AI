import React from 'react';
import { FileDown, Calendar, AlertTriangle, Eye, ShieldAlert, CheckCircle2, Stethoscope, Clock, FileText } from 'lucide-react';

export default function DashboardHistory({
  reports = [],
  onSelectReport,
  onDownloadReport,
  translations
}) {
  const getUrgencyBadgeColor = (level) => {
    switch (level) {
      case 'EMERGENCY':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {translations.pastAssessments}
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Review previous AI triage screenings, diagnosis notes, and export official summaries.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200/80 shadow-soft-sm self-start sm:self-auto">
          <FileText className="h-4 w-4 text-emerald-600" />
          <span>{reports.length} Total Assessments</span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-soft-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600 shadow-soft-sm">
            <Calendar className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-lg font-bold text-slate-900">
            No screening history found
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {translations.noAssessments || 'You have not conducted any diagnostic assessments yet. Start a new triage session to build your personal health history.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft-sm hover:shadow-soft hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center text-xs font-semibold text-slate-500">
                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    {new Date(report.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                  <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${getUrgencyBadgeColor(report.urgencyLevel)}`}>
                    {report.urgencyLevel}
                  </span>
                </div>

                {/* Symptoms Summary */}
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Reported Symptoms
                </h4>
                <p className="mt-1 text-sm text-slate-800 font-semibold line-clamp-2 leading-snug">
                  {report.symptoms}
                </p>

                {/* AI Assessment Preview */}
                <h4 className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Clinical Impression
                </h4>
                <p className="mt-1 text-xs text-slate-600 line-clamp-3 italic leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1.5">
                  "{report.fullAssessment.primaryAssessment}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center space-x-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => onSelectReport(report)}
                  className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl border border-slate-200/90 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700 shadow-soft-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{translations.viewReport || 'View Details'}</span>
                </button>
                
                <button
                  onClick={() => onDownloadReport(report)}
                  className="flex items-center justify-center rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 shadow-soft active:scale-95 transition-all cursor-pointer"
                  title={translations.downloadReport || 'Download PDF Report'}
                >
                  <FileDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

