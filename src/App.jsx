import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingHero from './components/LandingHero';
import TrustSafetyStrip from './components/TrustSafetyStrip';
import InlineSymptomChecker from './components/InlineSymptomChecker';
import HowItWorks from './components/HowItWorks';
import CoreCapabilities from './components/CoreCapabilities';
import InteractiveTriagePreview from './components/InteractiveTriagePreview';
import LanguagesShowcase from './components/LanguagesShowcase';
import SafetySection from './components/SafetySection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

import LiveVoiceConsultation from './components/LiveVoiceConsultation';
import LanguageSelector from './components/LanguageSelector';
import SymptomInput from './components/SymptomInput';
import TriageReportCard from './components/TriageReportCard';
import AuthModal from './components/AuthModal';
import DashboardHistory from './components/DashboardHistory';

import { localizations } from './localization';
import { fetchUsersDatabase, updateUsersDatabase, analyzeSymptoms } from './api';
import { generateTriagePDF } from './utils/pdfGenerator';

export default function App() {
  // Application Primary States
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [user, setUser] = useState(null);
  const [usersDb, setUsersDb] = useState({ users: [] });
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'symptoms' | 'report' | 'dashboard'
  
  // Modals visibility
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLiveVoice, setShowLiveVoice] = useState(false);

  // Active diagnostic assessment state
  const [currentReport, setCurrentReport] = useState(null);
  const [currentPatientInfo, setCurrentPatientInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const translations = localizations[currentLanguage] || localizations.en;

  // 1. Initial Load: Fetch DB and verify local session
  useEffect(() => {
    const loadData = async () => {
      const db = await fetchUsersDatabase();
      setUsersDb(db);
      
      const savedSession = localStorage.getItem('swasthya_active_user');
      if (savedSession) {
        try {
          const loggedUser = JSON.parse(savedSession);
          // Cross-reference with db to get fresh reports
          const freshUser = db.users.find(u => u.email === loggedUser.email);
          if (freshUser) {
            setUser(freshUser);
          } else {
            setUser(loggedUser);
          }
        } catch (e) {
          console.warn('Session parse error', e);
        }
      }
    };
    loadData();
  }, []);

  // 2. Auth submission handler
  const handleAuthSubmit = async (mode, credentials) => {
    // Fetch fresh DB first to avoid out-of-sync states
    const freshDb = await fetchUsersDatabase();
    const updatedUsers = [...freshDb.users];

    if (mode === 'signup') {
      // Validate unique email
      const exist = updatedUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      if (exist) {
        throw new Error('User already exists with this email.');
      }

      const newUser = {
        userId: 'USR' + Date.now().toString(36).toUpperCase(),
        name: credentials.name,
        email: credentials.email.toLowerCase(),
        password: credentials.password,
        savedReports: []
      };

      updatedUsers.push(newUser);
      const newDb = { users: updatedUsers };
      
      // Save locally & server
      setUsersDb(newDb);
      setUser(newUser);
      localStorage.setItem('swasthya_active_user', JSON.stringify(newUser));
      await updateUsersDatabase(newDb);

      // Retrospective saving of active report if present
      if (currentReport && currentPatientInfo) {
        await saveReportToUser(newUser, currentReport, currentPatientInfo, newDb);
      }

    } else {
      // Login
      const found = updatedUsers.find(
        u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
      );
      if (!found) {
        throw new Error('Invalid email or password.');
      }

      // Sync active database cache in state
      setUsersDb(freshDb);
      setUser(found);
      localStorage.setItem('swasthya_active_user', JSON.stringify(found));

      // Retrospective saving of active report if present
      if (currentReport && currentPatientInfo) {
        await saveReportToUser(found, currentReport, currentPatientInfo, freshDb);
      }
    }
  };

  // Helper to save report under a specific user
  const saveReportToUser = async (targetUser, report, patientInfo, db) => {
    const updatedUsers = db.users.map(u => {
      if (u.email === targetUser.email) {
        const reportId = 'REP' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        // Avoid saving duplicate report if already exists
        const exists = u.savedReports.find(r => r.symptoms === patientInfo.symptoms);
        if (exists) return u;

        const newReport = {
          id: reportId,
          date: new Date().toISOString(),
          symptoms: patientInfo.symptoms,
          language: patientInfo.language,
          urgencyLevel: report.urgencyLevel,
          fullAssessment: report
        };

        const updatedReports = [newReport, ...u.savedReports];
        
        // Update user state in real time
        const updatedUser = { ...u, savedReports: updatedReports };
        setUser(updatedUser);
        localStorage.setItem('swasthya_active_user', JSON.stringify(updatedUser));
        
        return updatedUser;
      }
      return u;
    });

    const newDb = { users: updatedUsers };
    setUsersDb(newDb);
    await updateUsersDatabase(newDb);
  };

  // 3. Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('swasthya_active_user');
    setActiveTab('home');
    setCurrentReport(null);
    setCurrentPatientInfo(null);
  };

  // 4. Clinical Triage Analyzer
  const handleAnalyzeSymptoms = async (symptomsText, ageGroup, durationDays) => {
    setLoading(true);
    try {
      const result = await analyzeSymptoms(symptomsText, currentLanguage, ageGroup, durationDays);
      
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
        ageGroup: ageGroup || 'N/A',
        duration: durationDays || 'N/A',
        language: languageMap[currentLanguage] || 'English',
        date: new Date().toISOString()
      };

      setCurrentReport(result);
      setCurrentPatientInfo(patientInfo);

      // Auto-save if logged in
      if (user) {
        await saveReportToUser(user, result, patientInfo, usersDb);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('An error occurred during clinical analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Completion callback from Live Voice Consultation
  const handleCompleteLiveVoice = async (symptomsText, _fullDialogue) => {
    setShowLiveVoice(false);
    await handleAnalyzeSymptoms(symptomsText, 'Adult (from audio intake)', 2);
    // Smoothly scroll to the symptom assessment result
    setTimeout(() => {
      const el = document.getElementById('symptom-checker');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDownloadPdf = () => {
    if (!currentReport || !currentPatientInfo) return;
    const info = {
      ...currentPatientInfo,
      name: user ? user.name : 'Anonymous Patient'
    };
    generateTriagePDF(currentReport, info);
  };

  const handleDownloadDashboardReport = (savedRecord) => {
    const reportData = savedRecord.fullAssessment;
    const patientInfo = {
      id: savedRecord.id,
      symptoms: savedRecord.symptoms,
      ageGroup: reportData.ageGroup || 'N/A',
      duration: reportData.duration || 'N/A',
      language: savedRecord.language,
      date: savedRecord.date,
      name: user ? user.name : 'Anonymous Patient'
    };
    generateTriagePDF(reportData, patientInfo);
  };

  const handleSelectDashboardReport = (savedRecord) => {
    setCurrentReport(savedRecord.fullAssessment);
    setCurrentPatientInfo({
      id: savedRecord.id,
      symptoms: savedRecord.symptoms,
      ageGroup: savedRecord.fullAssessment.ageGroup || 'N/A',
      duration: savedRecord.fullAssessment.duration || 'N/A',
      language: savedRecord.language,
      date: savedRecord.date
    });
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('symptom-checker');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Scroll to manual symptom entry section on same page
  const scrollToSymptomChecker = () => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('symptom-checker');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased text-slate-900">
      
      {/* Modern Responsive Sticky Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLanguage={currentLanguage}
        onOpenLanguage={() => setShowLanguageSelector(true)}
        onStartLiveVoice={() => setShowLiveVoice(true)}
        onStartTriage={scrollToSymptomChecker}
        translations={translations}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div>
            {/* 1. Hero Section with Mock Preview */}
            <LandingHero
              onStartTriage={scrollToSymptomChecker}
              onStartLiveVoice={() => setShowLiveVoice(true)}
              translations={translations}
            />

            {/* 2. Trust and Safety Strip */}
            <TrustSafetyStrip />

            {/* 3. AI SYMPTOM MANUAL ENTRY SECTION DIRECTLY ON THE SAME PAGE */}
            <InlineSymptomChecker
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
              isLoggedIn={!!user}
              onOpenAuth={() => setShowAuthModal(true)}
              onStartLiveVoice={() => setShowLiveVoice(true)}
              translations={translations}
            />

            {/* 4. How It Works */}
            <HowItWorks />

            {/* 5. Core Capabilities */}
            <CoreCapabilities 
              onStartLiveVoice={() => setShowLiveVoice(true)}
              onStartTriage={scrollToSymptomChecker}
            />

            {/* 6. Interactive Triage Preview Simulation */}
            <InteractiveTriagePreview 
              onStartRealTriage={scrollToSymptomChecker}
            />

            {/* 7. Languages Showcase */}
            <LanguagesShowcase
              onSelectLanguage={(langCode) => {
                setCurrentLanguage(langCode);
                scrollToSymptomChecker();
              }}
            />

            {/* 8. Safety & Emergency Section */}
            <SafetySection />

            {/* 9. Final Responsible CTA */}
            <FinalCTA
              onStartLiveVoice={() => setShowLiveVoice(true)}
              onStartTriage={scrollToSymptomChecker}
            />
          </div>
        )}

        {/* Fallback standalone views if navigated directly */}
        {activeTab === 'symptoms' && (
          <SymptomInput
            languageCode={currentLanguage}
            translations={translations}
            onBack={() => setActiveTab('home')}
            onAnalyze={handleAnalyzeSymptoms}
            loading={loading}
            onSwitchToVoice={() => setShowLiveVoice(true)}
          />
        )}

        {activeTab === 'report' && currentReport && currentPatientInfo && (
          <TriageReportCard
            report={currentReport}
            patientInfo={currentPatientInfo}
            isLoggedIn={!!user}
            onOpenAuth={() => setShowAuthModal(true)}
            onDownloadPdf={handleDownloadPdf}
            onBackToHome={() => setActiveTab('home')}
            translations={translations}
          />
        )}

        {/* User Dashboard / Past Assessments */}
        {activeTab === 'dashboard' && user && (
          <DashboardHistory
            reports={user.savedReports}
            onSelectReport={handleSelectDashboardReport}
            onDownloadReport={handleDownloadDashboardReport}
            onNewAssessment={scrollToSymptomChecker}
            translations={translations}
          />
        )}
      </main>

      {/* Modern Comprehensive Footer */}
      <Footer 
        onOpenLanguage={() => setShowLanguageSelector(true)}
        currentLanguage={currentLanguage}
      />

      {/* Live AI Doctor Audio Consultation Modal */}
      {showLiveVoice && (
        <LiveVoiceConsultation
          currentLanguage={currentLanguage}
          onLanguageChange={(code) => setCurrentLanguage(code)}
          onClose={() => setShowLiveVoice(false)}
          onCompleteConsultation={handleCompleteLiveVoice}
          translations={translations}
        />
      )}

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <LanguageSelector
          onSelect={(langCode) => {
            setCurrentLanguage(langCode);
            setShowLanguageSelector(false);
          }}
          onClose={() => setShowLanguageSelector(false)}
        />
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSubmit={handleAuthSubmit}
          translations={translations}
        />
      )}
    </div>
  );
}
