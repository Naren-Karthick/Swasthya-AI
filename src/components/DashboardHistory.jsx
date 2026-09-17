import React, { useState, useMemo } from 'react';
import { 
  FileDown, 
  Calendar, 
  Eye, 
  FileText, 
  ArrowRight, 
  Plus, 
  Search, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Database,
  Trash2,
  Sparkles,
  User,
  Stethoscope,
  LogIn
} from 'lucide-react';
import AudioNarrationPlayer from './AudioNarrationPlayer';

export default function DashboardHistory({
  reports = [],
  onSelectReport,
  onDownloadReport,
  onNewAssessment,
  onDeleteReport,
  onSeedSampleReports,
  currentUser = null,
  onOpenAuthModal,
  _translations = {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL'); // 'ALL' | 'EMERGENCY' | 'MODERATE' | 'LOW'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = reports.length;
    const emergency = reports.filter(r => (r.urgencyLevel || '').toUpperCase() === 'EMERGENCY').length;
    const moderate = reports.filter(r => (r.urgencyLevel || '').toUpperCase() === 'MODERATE').length;
    const low = reports.filter(r => (r.urgencyLevel || '').toUpperCase() === 'LOW' || !r.urgencyLevel).length;
    return { total, emergency, moderate, low };
  }, [reports]);

  // Filtered & Sorted Reports
  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        // Urgency filter
        if (urgencyFilter !== 'ALL') {
          if ((report.urgencyLevel || '').toUpperCase() !== urgencyFilter) {
            return false;
          }
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSymptoms = (report.symptoms || '').toLowerCase().includes(q);
          const matchAssessment = (report.fullAssessment?.primaryAssessment || '').toLowerCase().includes(q);
          const matchLang = (report.language || '').toLowerCase().includes(q);
          const matchId = (report.id || '').toLowerCase().includes(q);
          return matchSymptoms || matchAssessment || matchLang || matchId;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [reports, urgencyFilter, searchQuery, sortOrder]);

  const getUrgencyConfig = (level) => {
    const norm = (level || '').toUpperCase();
    switch (norm) {
      case 'EMERGENCY':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-200',
          badge: 'bg-rose-600 text-white',
          icon: AlertOctagon,
          label: 'Critical / Emergency'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          badge: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          label: 'Moderate / Clinical Visit'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
          label: 'Routine / Home Care'
        };
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-3.5 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Top Banner & Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-soft-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-black text-teal-900">
                <Database className="h-3.5 w-3.5 text-teal-600" />
                <span>npoint.io Cloud Sync</span>
              </span>

              {currentUser ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">
                  {currentUser.role === 'doctor' ? (
                    <>
                      <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
                      <span>Clinician Portal</span>
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5 text-teal-400" />
                      <span>Patient History</span>
                    </>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  Guest Demo Mode
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentUser 
                ? `${currentUser.name}'s Triage History` 
                : 'Past Triage & Clinical Assessments'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Review previous AI symptom checks, access urgency guidance, listen to audio summaries, and download clinical PDFs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!currentUser && onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-teal-600 bg-white px-4 py-2.5 text-xs sm:text-sm font-black text-teal-900 hover:bg-teal-50 shadow-soft-sm transition-all cursor-pointer min-h-[44px]"
              >
                <LogIn className="h-4 w-4 text-teal-700" />
                <span>Sign In / Sync Cloud</span>
              </button>
            )}

            {onNewAssessment && (
              <button
                type="button"
                onClick={onNewAssessment}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-soft transition-all cursor-pointer min-h-[44px]"
              >
                <Plus className="h-4 w-4" />
                <span>New Symptom Check</span>
              </button>
            )}
          </div>
        </div>

        {/* Acuity Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          {/* Total Screenings */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>Total Screenings</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.total}</div>
            <div className="text-[10px] font-extrabold text-slate-400 mt-0.5">Stored in account</div>
          </div>

          {/* Emergency Cases */}
          <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-rose-800 text-xs font-black mb-1">
              <span>Emergency</span>
              <AlertOctagon className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-950">{metrics.emergency}</div>
            <div className="text-[10px] font-extrabold text-rose-700 mt-0.5">Immediate Attention</div>
          </div>

          {/* Moderate Cases */}
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-amber-800 text-xs font-black mb-1">
              <span>Moderate</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950">{metrics.moderate}</div>
            <div className="text-[10px] font-extrabold text-amber-700 mt-0.5">Doctor Visit Advised</div>
          </div>

          {/* Low Cases */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-black mb-1">
              <span>Routine Care</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950">{metrics.low}</div>
            <div className="text-[10px] font-extrabold text-emerald-700 mt-0.5">Self-Monitoring</div>
          </div>
        </div>
      </div>

      {/* Search, Filters, and Sorting Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by symptoms (e.g. fever, chest pain, தலைவலி)..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none min-h-[44px] shadow-soft-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setUrgencyFilter('ALL')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
              urgencyFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-soft-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All ({metrics.total})
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('EMERGENCY')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
              urgencyFilter === 'EMERGENCY'
                ? 'bg-rose-600 text-white shadow-soft-sm'
                : 'bg-white border border-slate-200 text-rose-800 hover:bg-rose-50'
            }`}
          >
            🚨 Emergency ({metrics.emergency})
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('MODERATE')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
              urgencyFilter === 'MODERATE'
                ? 'bg-amber-600 text-white shadow-soft-sm'
                : 'bg-white border border-slate-200 text-amber-900 hover:bg-amber-50'
            }`}
          >
            ⚠️ Moderate ({metrics.moderate})
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('LOW')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
              urgencyFilter === 'LOW'
                ? 'bg-emerald-600 text-white shadow-soft-sm'
                : 'bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            🟢 Low ({metrics.low})
          </button>

          {/* Sort Toggle */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-soft-sm focus:border-teal-600 focus:outline-none cursor-pointer min-h-[40px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Triage Records Grid */}
      {filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center shadow-soft-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-soft-sm">
            <Calendar className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900">
              {searchQuery || urgencyFilter !== 'ALL'
                ? 'No assessments match your current filters'
                : 'No triage history found'}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              {searchQuery || urgencyFilter !== 'ALL'
                ? 'Try changing or clearing your search term and urgency filters to view other records.'
                : 'Start a triage screening to generate clinical assessments, or load sample cases to inspect past history.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchQuery || urgencyFilter !== 'ALL' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setUrgencyFilter('ALL');
                }}
                className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-soft hover:bg-slate-800 cursor-pointer min-h-[44px]"
              >
                Reset Search Filters
              </button>
            ) : (
              <>
                {onSeedSampleReports && (
                  <button
                    type="button"
                    onClick={onSeedSampleReports}
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 px-5 py-2.5 text-xs sm:text-sm font-black text-amber-950 shadow-soft-sm transition-all cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="h-4 w-4 text-amber-700" />
                    <span>Load Sample Triage Cases</span>
                  </button>
                )}

                {onNewAssessment && (
                  <button
                    type="button"
                    onClick={onNewAssessment}
                    className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-soft transition-all cursor-pointer min-h-[44px]"
                  >
                    <span>Start Symptom Check</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => {
            const urgencyConfig = getUrgencyConfig(report.urgencyLevel);
            const UrgencyIcon = urgencyConfig.icon;

            return (
              <div
                key={report.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-soft-sm hover:shadow-soft hover:border-teal-400 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Top Header info */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex items-center text-xs font-semibold text-slate-500">
                      <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                      {report.date ? new Date(report.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Recent'}
                    </span>

                    <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${urgencyConfig.badge}`}>
                      <UrgencyIcon className="h-3 w-3" />
                      <span>{report.urgencyLevel || 'EVAL'}</span>
                    </span>
                  </div>

                  {/* Language Badge & ID */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                    <span>ID: {report.id}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                      {report.language || 'English'}
                    </span>
                  </div>

                  {/* Symptoms Summary */}
                  <div className="mb-3">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Reported Symptoms
                    </h4>
                    <p className="mt-1 text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {report.symptoms || 'General symptom consultation'}
                    </p>
                  </div>

                  {/* Clinical Impression Snippet */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Clinical Assessment
                    </h4>
                    <div className="mt-1 text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed line-clamp-3 italic">
                      "{report.fullAssessment?.primaryAssessment || 'Standard clinical assessment recorded.'}"
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* View Details / Open Result */}
                  <button
                    type="button"
                    onClick={() => onSelectReport(report)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 py-2.5 text-xs font-black text-white shadow-soft-sm active:scale-95 transition-all cursor-pointer min-h-[40px]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </button>

                  {/* Audio Narration Playback */}
                  <AudioNarrationPlayer
                    textToSpeak={`Assessment for ${report.symptoms ? report.symptoms.slice(0, 50) : 'patient'}. Urgency level: ${report.urgencyLevel}. ${report.fullAssessment?.primaryAssessment ? report.fullAssessment.primaryAssessment.slice(0, 100) : ''}.`}
                    currentLanguage="en"
                    variant="compact"
                  />

                  {/* Download PDF */}
                  {onDownloadReport && (
                    <button
                      type="button"
                      onClick={() => onDownloadReport(report)}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 p-2.5 text-slate-700 hover:text-slate-950 shadow-soft-sm active:scale-95 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Download PDF Report"
                      aria-label="Download PDF Report"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                  )}

                  {/* Delete Option */}
                  {onDeleteReport && (
                    <button
                      type="button"
                      onClick={() => onDeleteReport(report.id)}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 p-2.5 text-slate-400 hover:text-rose-600 shadow-soft-sm active:scale-95 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Delete Triage Record"
                      aria-label="Delete Triage Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
