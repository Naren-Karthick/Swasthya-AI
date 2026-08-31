import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import LanguageSelector from './components/LanguageSelector';
import SymptomInput from './components/SymptomInput';
import TriageReportCard from './components/TriageReportCard';
import AuthModal from './components/AuthModal';
import DashboardHistory from './components/DashboardHistory';

import { localizations } from './localization';
import { fetchUsersDatabase, updateUsersDatabase, analyzeSymptoms } from './api';
import { generateTriagePDF } from './utils/pdfGenerator';

export default function App() {
  // App States
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [user, setUser] = useState(null);
  const [usersDb, setUsersDb] = useState({ users: [] });
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'symptoms' | 'report' | 'dashboard'
  
  // Modals visibility
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
        const loggedUser = JSON.parse(savedSession);
        // Cross-reference with db to get fresh reports
        const freshUser = db.users.find(u => u.email === loggedUser.email);
        if (freshUser) {
          setUser(freshUser);
        } else {
          setUser(loggedUser);
        }
      }
    };
    loadData();
  }, []);

  // 2. Auth submission handler
  const handleAuthSubmit = async (mode, credentials) => {
    const updatedUsers = [...usersDb.users];

    if (mode === 'signup') {
      // Validate unique email
      const exist = updatedUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      if (exist) {
        throw new Error('User already exists with this email.');
      }

      const newUser = {
        userId: 'USR' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        name: credentials.name,
        email: credentials.email.toLowerCase(),
        password: credentials.password,
        savedReports: []
      };

      updatedUsers.push(newUser);
      const newDb = { users: updatedUsers };
      
      // Save locally & npoint
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

      setUser(found);
      localStorage.setItem('swasthya_active_user', JSON.stringify(found));

      // Retrospective saving of active report if present
      if (currentReport && currentPatientInfo) {
        await saveReportToUser(found, currentReport, currentPatientInfo, usersDb);
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
      
      const patientInfo = {
        id: 'SES' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        symptoms: symptomsText,
        ageGroup: ageGroup || 'N/A',
        duration: durationDays || 'N/A',
        language: currentLanguage === 'en' ? 'English' : 
                  currentLanguage === 'ta' ? 'Tamil' : 
                  currentLanguage === 'hi' ? 'Hindi' : 
                  currentLanguage === 'te' ? 'Telugu' : 
                  currentLanguage === 'kn' ? 'Kannada' : 
                  currentLanguage === 'ml' ? 'Malayalam' : 
                  currentLanguage === 'bn' ? 'Bengali' : 'Marathi',
        date: new Date().toISOString()
      };

      setCurrentReport(result);
      setCurrentPatientInfo(patientInfo);
      setActiveTab('report');

      // Auto-save if logged in
      if (user) {
        await saveReportToUser(user, result, patientInfo, usersDb);
      }
    } catch (err) {
      alert('An error occurred during clinical analysis. Please try again.');
    } finally {
      setLoading(false);
    }
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
    setActiveTab('report');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased">
      {/* Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLanguage={currentLanguage}
        translations={translations}
      />

      {/* Main Pages */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <LandingHero
            onStart={() => setShowLanguageSelector(true)}
            translations={translations}
          />
        )}

        {activeTab === 'symptoms' && (
          <SymptomInput
            languageCode={currentLanguage}
            translations={translations}
            onBack={() => setShowLanguageSelector(true)}
            onAnalyze={handleAnalyzeSymptoms}
            loading={loading}
          />
        )}

        {activeTab === 'report' && currentReport && currentPatientInfo && (
          <TriageReportCard
            report={currentReport}
            patientInfo={currentPatientInfo}
            isLoggedIn={!!user}
            onOpenAuth={() => setShowAuthModal(true)}
            onDownloadPdf={handleDownloadPdf}
            translations={translations}
          />
        )}

        {activeTab === 'dashboard' && user && (
          <DashboardHistory
            reports={user.savedReports}
            onSelectReport={handleSelectDashboardReport}
            onDownloadReport={handleDownloadDashboardReport}
            translations={translations}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SwasthyaAI. All rights reserved.</p>
          <p className="mt-1">
            Built as a professional medical triage prototype. Rely on certified healthcare professionals for diagnoses.
          </p>
        </div>
      </footer>

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <LanguageSelector
          onSelect={(langCode) => {
            setCurrentLanguage(langCode);
            setShowLanguageSelector(false);
            setActiveTab('symptoms');
          }}
          onClose={() => setShowLanguageSelector(false)}
        />
      )}

      {/* Auth Modal */}
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
