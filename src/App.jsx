import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import LandingHero from './components/LandingHero';
import TrustSafetyStrip from './components/TrustSafetyStrip';
import SymptomCheckerFlow from './components/SymptomCheckerFlow';
import HowItWorks from './components/HowItWorks';
import SafetySection from './components/SafetySection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import { ArrowLeft, PhoneCall } from 'lucide-react';

import { localizations } from './localization';
import { 
  analyzeSymptoms, 
  getDemoReports, 
  saveDemoReport, 
  clearDemoReports,
  fetchUsersDatabase,
  updateUsersDatabase,
  saveReportToUser,
  deleteReportFromUser
} from './api';
import { SAMPLE_CASES } from './data/sampleCases';
import { generateTriagePDF } from './utils/pdfGenerator';

// Code-split / Lazy Load Non-Critical Modals & Views
const LiveVoiceConsultation = lazy(() => import('./components/LiveVoiceConsultation'));
const LanguageSelector = lazy(() => import('./components/LanguageSelector'));
const SampleCasesModal = lazy(() => import('./components/SampleCasesModal'));
const DashboardHistory = lazy(() => import('./components/DashboardHistory'));
const AuthModal = lazy(() => import('./components/AuthModal'));

export default function App() {
  // Active User Authentication & Role (Synced with npoint cloud database & local storage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('swasthya_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Primary Application States
  // 'home' = Informational Details & Overview
  // 'triage' = Dedicated Clinical Symptom Checker & Urgency Assessment Flow
  // 'dashboard' = Cloud-Synced Past Screenings & History
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('home'); 
  const [demoReports, setDemoReports] = useState(() => {
    try {
      const savedUser = localStorage.getItem('swasthya_active_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (Array.isArray(u.savedReports) && u.savedReports.length > 0) {
          return u.savedReports;
        }
      }
    } catch {
      // fallback
    }
    return getDemoReports();
  });

  // Modals Visibility
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showLiveVoice, setShowLiveVoice] = useState(false);
  const [showSampleCasesModal, setShowSampleCasesModal] = useState(false);

  // Active Diagnostic Assessment State
  const [currentReport, setCurrentReport] = useState(null);
  const [currentPatientInfo, setCurrentPatientInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const translations = localizations[currentLanguage] || localizations.en;

  // Background Cloud Sync with npoint.io
  useEffect(() => {
    let isMounted = true;
    const syncWithCloudDb = async () => {
      if (currentUser) {
        // Immediate local state update from currentUser.savedReports
        if (Array.isArray(currentUser.savedReports)) {
          setDemoReports(currentUser.savedReports);
        }
        try {
          const cloudDb = await fetchUsersDatabase();
          if (!isMounted) return;
          const found = (cloudDb.users || []).find(
            u => u.userId === currentUser.userId || (u.email && u.email.toLowerCase() === currentUser.email?.toLowerCase())
          );
          if (found && Array.isArray(found.savedReports)) {
            setDemoReports(found.savedReports);
            setCurrentUser(prev => prev ? { ...prev, savedReports: found.savedReports } : prev);
            localStorage.setItem('swasthya_active_user', JSON.stringify({ ...currentUser, savedReports: found.savedReports }));
          }
        } catch (err) {
          console.warn('npoint background sync notice:', err);
        }
      } else {
        setDemoReports(getDemoReports());
      }
    };

    syncWithCloudDb();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.userId, currentUser?.email]);

  // Navigation Helpers
  const navigateToTriage = () => {
    setActiveTab('triage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Clinical Triage Analyzer Handler
  const handleAnalyzeSymptoms = async (
    symptomsText, 
    ageGroup, 
    durationDays, 
    severity = 5, 
    redFlags = {},
    seededSample = null
  ) => {
    setLoading(true);
    try {
      const result = await analyzeSymptoms(
        symptomsText, 
        currentLanguage, 
        ageGroup, 
        durationDays, 
        severity, 
        redFlags,
        seededSample
      );
      
      const languageMap = {
        en: 'English',
        ta: 'Tamil',
        hi: 'Hindi',
        te: 'Telugu',
        kn: 'Kannada',
        ml: 'Malayalam',
        bn: 'Bengali',
        mr: 'Marathi'
      };

      const patientInfo = {
        id: 'SES' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        symptoms: symptomsText,
        ageGroup: ageGroup || 'Adult',
        duration: durationDays || '2',
        severity: severity,
        language: languageMap[currentLanguage] || 'English',
        date: new Date().toISOString()
      };

      setCurrentReport(result);
      setCurrentPatientInfo(patientInfo);

      // Save to npoint cloud account or local demo store
      if (currentUser) {
        try {
          const res = await saveReportToUser(currentUser, result, patientInfo);
          if (res?.newRecord) {
            setDemoReports(prev => [res.newRecord, ...prev]);
            if (res.updatedUser) {
              setCurrentUser(res.updatedUser);
            }
          }
        } catch (syncErr) {
          console.warn('Could not sync triage to npoint:', syncErr);
          const updated = saveDemoReport(result, patientInfo);
          setDemoReports(updated);
        }
      } else {
        const updated = saveDemoReport(result, patientInfo);
        setDemoReports(updated);
      }

      return result;
    } catch (err) {
      console.error('Analysis error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Direct Sample Case Selector Handler (Instant 60s Demo)
  const handleSelectSampleCaseDirect = (sampleCase) => {
    const languageMap = {
      en: 'English',
      ta: 'Tamil',
      hi: 'Hindi',
      te: 'Telugu',
      kn: 'Kannada',
      ml: 'Malayalam',
      bn: 'Bengali',
      mr: 'Marathi'
    };

    if (sampleCase.patientContext.languageCode) {
      setCurrentLanguage(sampleCase.patientContext.languageCode);
    }

    const patientInfo = {
      id: 'DEMO-' + sampleCase.id.replace('case-', '').toUpperCase(),
      symptoms: sampleCase.symptomsText,
      ageGroup: sampleCase.patientContext.ageGroup,
      duration: sampleCase.patientContext.duration,
      severity: sampleCase.patientContext.severity,
      language: languageMap[sampleCase.patientContext.languageCode] || 'English',
      date: new Date().toISOString()
    };

    setCurrentReport(sampleCase.assessment);
    setCurrentPatientInfo(patientInfo);

    // Save to npoint cloud account or local demo store
    if (currentUser) {
      saveReportToUser(currentUser, sampleCase.assessment, patientInfo)
        .then(res => {
          if (res?.newRecord) {
            setDemoReports(prev => [res.newRecord, ...prev]);
            if (res.updatedUser) setCurrentUser(res.updatedUser);
          }
        })
        .catch(err => {
          console.warn('Failed to sync sample case to npoint:', err);
          const updated = saveDemoReport(sampleCase.assessment, patientInfo);
          setDemoReports(updated);
        });
    } else {
      const updated = saveDemoReport(sampleCase.assessment, patientInfo);
      setDemoReports(updated);
    }

    // Immediately navigate to dedicated triage page showing results
    navigateToTriage();
  };

  // 3. Completion Callback from Live Voice Consultation
  const handleCompleteLiveVoice = async (symptomsText) => {
    setShowLiveVoice(false);
    await handleAnalyzeSymptoms(
      symptomsText, 
      'Adult (Voice Intake)', 
      '2', 
      5, 
      {}
    );
    navigateToTriage();
  };

  // 4. Download Doctor PDF
  const handleDownloadPdf = async () => {
    if (!currentReport || !currentPatientInfo) return;
    await generateTriagePDF(currentReport, currentPatientInfo);
  };

  // 5. Clear Local Demo Data / User Cloud Reports
  const handleClearDemoData = async () => {
    if (window.confirm('Clear all triage records from this session?')) {
      clearDemoReports();
      if (currentUser) {
        try {
          const cloudDb = await fetchUsersDatabase();
          const users = [...(cloudDb.users || [])];
          const userIdx = users.findIndex(
            u => u.userId === currentUser.userId || (u.email && u.email.toLowerCase() === currentUser.email?.toLowerCase())
          );
          if (userIdx >= 0) {
            users[userIdx].savedReports = [];
            await updateUsersDatabase({ users });
            setCurrentUser(users[userIdx]);
            localStorage.setItem('swasthya_active_user', JSON.stringify(users[userIdx]));
          }
        } catch (e) {
          console.warn('Error clearing cloud reports:', e);
        }
      }
      setDemoReports([]);
      setCurrentReport(null);
      setCurrentPatientInfo(null);
    }
  };

  // 6. Authentication Handler for Login / Sign Up with npoint.io
  const handleAuthSubmit = async (mode, credentials) => {
    const emailClean = (credentials.email || '').trim().toLowerCase();
    const cloudDb = await fetchUsersDatabase();
    const users = cloudDb.users || [];

    if (mode === 'login') {
      const found = users.find(
        u => u.email && u.email.trim().toLowerCase() === emailClean
      );

      if (found) {
        if (credentials.password && found.password && credentials.password !== found.password) {
          throw new Error('Invalid password. Please verify your credentials and try again.');
        }
        setCurrentUser(found);
        localStorage.setItem('swasthya_active_user', JSON.stringify(found));
        setDemoReports(found.savedReports || []);
        setActiveTab('dashboard');
        return found;
      }

      // Provision Clinician Doctor Demo Account if not yet in bin
      if (emailClean === 'priya.sharma@swasthya.ai') {
        const doctorUser = {
          userId: 'DOC-PRIYA-01',
          name: credentials.name || 'Dr. Priya Sharma, MD',
          email: emailClean,
          password: credentials.password || 'DoctorPassword123',
          role: 'doctor',
          createdAt: new Date().toISOString(),
          savedReports: users[0]?.savedReports ? [...users[0].savedReports] : []
        };
        const updatedUsers = [...users, doctorUser];
        await updateUsersDatabase({ users: updatedUsers });
        setCurrentUser(doctorUser);
        localStorage.setItem('swasthya_active_user', JSON.stringify(doctorUser));
        setDemoReports(doctorUser.savedReports);
        setActiveTab('dashboard');
        return doctorUser;
      }

      throw new Error('No account found with this email. Please check your spelling or switch to Create Account.');
    } else {
      // mode === 'signup'
      const existing = users.find(
        u => u.email && u.email.trim().toLowerCase() === emailClean
      );
      if (existing) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      const newUser = {
        userId: 'USR' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        name: credentials.name || credentials.email.split('@')[0],
        email: emailClean,
        password: credentials.password,
        role: credentials.role || 'patient',
        createdAt: new Date().toISOString(),
        savedReports: []
      };

      const updatedUsers = [...users, newUser];
      await updateUsersDatabase({ users: updatedUsers });
      setCurrentUser(newUser);
      localStorage.setItem('swasthya_active_user', JSON.stringify(newUser));
      setDemoReports([]);
      setActiveTab('dashboard');
      return newUser;
    }
  };

  // 7. Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('swasthya_active_user');
    } catch (e) {
      console.warn('Storage clear notice:', e);
    }
    setDemoReports(getDemoReports());
    setActiveTab('home');
  };

  // 8. Delete Single Report Handler (Cloud + Local)
  const handleDeleteReport = async (reportId) => {
    if (currentUser) {
      try {
        await deleteReportFromUser(currentUser.userId, reportId);
        setDemoReports(prev => prev.filter(r => r.id !== reportId));
        setCurrentUser(prev => prev ? {
          ...prev,
          savedReports: (prev.savedReports || []).filter(r => r.id !== reportId)
        } : prev);
      } catch (err) {
        console.warn('Failed to delete report from npoint:', err);
        setDemoReports(prev => prev.filter(r => r.id !== reportId));
      }
    } else {
      const updated = demoReports.filter(r => r.id !== reportId);
      try {
        localStorage.setItem('swasthya_local_demo_data', JSON.stringify(updated));
      } catch (e) {
        console.warn('Local storage write notice:', e);
      }
      setDemoReports(updated);
    }
  };

  // 9. Seed Sample Reports Handler for Empty Dashboards
  const handleSeedSampleReports = async () => {
    const sampleReports = SAMPLE_CASES.map((sc, idx) => ({
      id: 'CASE-' + (idx + 101),
      date: new Date(Date.now() - idx * 86400000 * 2).toISOString(),
      symptoms: sc.symptomsText,
      ageGroup: sc.patientContext.ageGroup,
      duration: sc.patientContext.duration + ' days',
      language: sc.patientContext.language,
      urgencyLevel: sc.urgencyLevel,
      urgencyState: sc.urgencyState,
      fullAssessment: sc.assessment
    }));

    if (currentUser) {
      try {
        const cloudDb = await fetchUsersDatabase();
        const users = [...(cloudDb.users || [])];
        const userIdx = users.findIndex(
          u => u.userId === currentUser.userId || (u.email && u.email.toLowerCase() === currentUser.email?.toLowerCase())
        );
        if (userIdx >= 0) {
          const combined = [...sampleReports, ...(users[userIdx].savedReports || [])];
          users[userIdx] = {
            ...users[userIdx],
            savedReports: combined
          };
          await updateUsersDatabase({ users });
          setCurrentUser(users[userIdx]);
          localStorage.setItem('swasthya_active_user', JSON.stringify(users[userIdx]));
        }
      } catch (err) {
        console.warn('Seed sample cases npoint error:', err);
      }
    } else {
      const combined = [...sampleReports, ...demoReports];
      try {
        localStorage.setItem('swasthya_local_demo_data', JSON.stringify(combined));
      } catch (e) {
        console.warn('Local storage write notice:', e);
      }
    }
    setDemoReports(prev => [...sampleReports, ...prev]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased text-slate-900">
      
      {/* Header with Navigation, Past Triage Badge & User Authentication Status */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLanguage={currentLanguage}
        onOpenLanguage={() => setShowLanguageSelector(true)}
        onStartLiveVoice={() => setShowLiveVoice(true)}
        onStartTriage={navigateToTriage}
        onOpenSampleCases={() => setShowSampleCasesModal(true)}
        onClearDemoData={handleClearDemoData}
        demoRecordCount={demoReports.length}
        currentUser={currentUser}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        translations={translations}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* PAGE 1: INFORMATIONAL LANDING PAGE (DETAILS ONLY) */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-200">
            {/* 1. Senior-Accessible Landing Hero */}
            <LandingHero
              onStartTriage={navigateToTriage}
              onStartLiveVoice={() => setShowLiveVoice(true)}
              onOpenSampleCases={() => setShowSampleCasesModal(true)}
              currentLanguage={currentLanguage}
              onLanguageChange={(code) => setCurrentLanguage(code)}
              translations={translations}
            />

            {/* 2. Trust & Safety Strip */}
            <TrustSafetyStrip />

            {/* 3. How It Works (Educational) */}
            <HowItWorks />

            {/* 4. Emergency Contacts & Safety Section */}
            <SafetySection />

            {/* 5. Bottom Invitation to Start Triage */}
            <FinalCTA
              onStartTriage={navigateToTriage}
              onStartLiveVoice={() => setShowLiveVoice(true)}
            />
          </div>
        )}

        {/* PAGE 2: DEDICATED CLINICAL TRIAGE PAGE (SEPARATE VIEW) */}
        {activeTab === 'triage' && (
          <div className="min-h-screen bg-slate-50 py-4 sm:py-8 animate-in fade-in duration-200">
            
            {/* Top Navigation & Emergency Action Bar */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200 shadow-soft-sm">
                
                {/* Back to Home Button */}
                <button
                  type="button"
                  onClick={navigateToHome}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 active:scale-95 px-3.5 py-2 text-xs sm:text-sm font-black text-slate-800 transition-all cursor-pointer min-h-[44px] w-fit"
                  aria-label="Return to Home details"
                >
                  <ArrowLeft className="h-4 w-4 text-teal-700" />
                  <span>← Back to Home / Details</span>
                </button>

                {/* Emergency Hotlines Strip */}
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
                  <span className="hidden md:inline text-rose-950 font-black">Severe Emergency?</span>
                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 text-xs font-black hover:bg-rose-100 min-h-[36px]"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Call 108</span>
                  </a>
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 text-xs font-black hover:bg-slate-200 min-h-[36px]"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Call 112</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 4-Step Clinical Symptom Checker Journey */}
            <SymptomCheckerFlow
              currentLanguage={currentLanguage}
              onLanguageChange={(code) => setCurrentLanguage(code)}
              onAnalyze={handleAnalyzeSymptoms}
              loading={loading}
              currentReport={currentReport}
              currentPatientInfo={currentPatientInfo}
              onDownloadPdf={handleDownloadPdf}
              onResetReport={() => {
                setCurrentReport(null);
                setCurrentPatientInfo(null);
              }}
              onStartLiveVoice={() => setShowLiveVoice(true)}
              translations={translations}
              onSelectSampleCaseDirect={handleSelectSampleCaseDirect}
              onBackToHome={navigateToHome}
            />
          </div>
        )}

        {/* PAGE 3: CLOUD-SYNCED PAST TRIAGE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Loading triage dashboard...</div>}>
            <DashboardHistory
              reports={demoReports}
              onSelectReport={(rec) => {
                setCurrentReport(rec.fullAssessment);
                setCurrentPatientInfo({
                  id: rec.id,
                  symptoms: rec.symptoms,
                  ageGroup: rec.ageGroup,
                  duration: rec.duration,
                  language: rec.language,
                  date: rec.date
                });
                navigateToTriage();
              }}
              onDownloadReport={(rec) => generateTriagePDF(rec.fullAssessment, rec)}
              onNewAssessment={() => {
                setCurrentReport(null);
                setCurrentPatientInfo(null);
                navigateToTriage();
              }}
              onDeleteReport={handleDeleteReport}
              onSeedSampleReports={handleSeedSampleReports}
              currentUser={currentUser}
              onOpenAuthModal={() => setShowAuthModal(true)}
              translations={translations}
            />
          </Suspense>
        )}
      </main>

      {/* Comprehensive Clean Footer */}
      <Footer 
        onOpenLanguage={() => setShowLanguageSelector(true)}
        currentLanguage={currentLanguage}
      />

      {/* Lazy Loaded Authentication Modal */}
      {showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSubmit={handleAuthSubmit}
            translations={translations}
          />
        </Suspense>
      )}

      {/* Lazy Loaded Live Voice Intake Modal */}
      {showLiveVoice && (
        <Suspense fallback={null}>
          <LiveVoiceConsultation
            currentLanguage={currentLanguage}
            onLanguageChange={(code) => setCurrentLanguage(code)}
            onClose={() => setShowLiveVoice(false)}
            onCompleteConsultation={handleCompleteLiveVoice}
            translations={translations}
          />
        </Suspense>
      )}

      {/* Lazy Loaded Language Selector Modal */}
      {showLanguageSelector && (
        <Suspense fallback={null}>
          <LanguageSelector
            onSelect={(langCode) => {
              setCurrentLanguage(langCode);
              setShowLanguageSelector(false);
            }}
            onClose={() => setShowLanguageSelector(false)}
          />
        </Suspense>
      )}

      {/* Lazy Loaded Fictional Sample Cases Modal */}
      {showSampleCasesModal && (
        <Suspense fallback={null}>
          <SampleCasesModal
            isOpen={showSampleCasesModal}
            onClose={() => setShowSampleCasesModal(false)}
            onSelectCase={handleSelectSampleCaseDirect}
          />
        </Suspense>
      )}
    </div>
  );
}
