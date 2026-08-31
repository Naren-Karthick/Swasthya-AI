import React from 'react';
import { FileDown, Calendar, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

export default function DashboardHistory({
  reports = [],
  onSelectReport,
  onDownloadReport,
  translations
}) {
  const getUrgencyBadgeColor = (level) => {
    switch (level) {
      case 'EMERGENCY':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MODERATE':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'LOW':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {translations.pastAssessments}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View or download previous clinical screening reports
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            No history found
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            {translations.noAssessments}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center text-xs font-semibold text-slate-500">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                  <span className={`rounded-md border px-2 py-0.5 text-3xs font-extrabold uppercase tracking-wide ${getUrgencyBadgeColor(report.urgencyLevel)}`}>
                    {report.urgencyLevel}
                  </span>
                </div>

                {/* Symptoms Summary */}
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Symptoms
                </h4>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2 font-medium">
                  {report.symptoms}
                </p>

                {/* AI Assessment Preview */}
                <h4 className="mt-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assessment Summary
                </h4>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2 italic font-medium">
                  {report.fullAssessment.primaryAssessment}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center space-x-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => onSelectReport(report)}
                  className="flex flex-1 items-center justify-center space-x-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{translations.viewReport}</span>
                </button>
                
                <button
                  onClick={() => onDownloadReport(report)}
                  className="flex items-center justify-center rounded-lg bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title={translations.downloadReport}
                >
                  <FileDown className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
