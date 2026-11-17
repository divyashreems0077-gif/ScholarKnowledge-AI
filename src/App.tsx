/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  AuthUser,
  PageRoute,
  Scholarship,
  StudentProfile,
  VerificationStatus,
} from './types/scholarship';
import { DEFAULT_STUDENT_PROFILE, INITIAL_SCHOLARSHIPS } from './data/scholarships';
import { LandingPage } from './components/LandingPage';
import { LoginPage, RegisterPage } from './components/AuthPages';
import { AppShell } from './components/AppShell';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentProfilePage } from './components/StudentProfilePage';
import { ExploreScholarshipsPage } from './components/ExploreScholarshipsPage';
import { ScholarshipDetailsPage } from './components/ScholarshipDetailsPage';
import { EligibilityCheckerPage } from './components/EligibilityCheckerPage';
import { MyResultsPage } from './components/MyResultsPage';
import { CompareScholarshipsPage } from './components/CompareScholarshipsPage';
import { AskAssistantPage } from './components/AskAssistantPage';
import { SavedScholarshipsPage } from './components/SavedScholarshipsPage';
import { StudentSettingsPage } from './components/StudentSettingsPage';
import { AdminDashboard } from './components/AdminDashboard';

const STORAGE_KEYS = {
  scholarships: 'sk_ai_scholarships_v1',
  profile: 'sk_ai_student_profile_v1',
  saved: 'sk_ai_saved_ids_v1',
  user: 'sk_ai_user_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const ROUTE_TITLES: Record<PageRoute, string> = {
  landing: 'Home',
  login: 'Login',
  register: 'Register',
  'student-dashboard': 'Dashboard',
  'student-profile': 'My Profile',
  'explore-scholarships': 'Explore Scholarships',
  'scholarship-details': 'Scholarship Details',
  'check-eligibility': 'Check Eligibility',
  'my-results': 'My Results',
  'compare-scholarships': 'Compare Scholarships',
  'ask-assistant': 'Ask ScholarKnowledge',
  'saved-scholarships': 'Saved Scholarships',
  'student-settings': 'Settings',
  'admin-dashboard': 'Dashboard',
  'admin-manage': 'Manage Scholarships',
  'admin-add': 'Add Scholarship',
  'admin-edit': 'Edit Scholarship',
  'admin-rules': 'Eligibility Rules',
  'admin-verification': 'Verification',
  'admin-students': 'Student Overview',
};

export default function App() {
  const [scholarships, setScholarships] = useState<Scholarship[]>(() =>
    readStorage(STORAGE_KEYS.scholarships, INITIAL_SCHOLARSHIPS)
  );
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() =>
    readStorage(STORAGE_KEYS.profile, DEFAULT_STUDENT_PROFILE)
  );
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.saved, ['sch-csss-01', 'sch-hdfc-05'])
  );
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    readStorage(STORAGE_KEYS.user, null)
  );

  const [route, setRoute] = useState<PageRoute>(() => {
    const existing = readStorage<AuthUser | null>(STORAGE_KEYS.user, null);
    if (!existing) return 'landing';
    return existing.role === 'admin' ? 'admin-dashboard' : 'student-dashboard';
  });

  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>(
    scholarships[0]?.id ?? 'sch-csss-01'
  );
  const [editingScholarshipId, setEditingScholarshipId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.scholarships, JSON.stringify(scholarships));
  }, [scholarships]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(studentProfile));
  }, [studentProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [authUser]);

  const navigate = (nextRoute: PageRoute) => {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ensureStudentSession = (): AuthUser => {
    if (authUser) return authUser;
    const guestStudent: AuthUser = {
      id: 'student-demo',
      name: studentProfile.fullName || 'Aarav Sharma',
      email: studentProfile.email || 'aarav.sharma@student.edu.in',
      role: 'student',
    };
    setAuthUser(guestStudent);
    return guestStudent;
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    if (user.role === 'student') {
      setStudentProfile((prev) => ({
        ...prev,
        email: prev.email || user.email,
      }));
      navigate('student-dashboard');
    } else {
      navigate('admin-dashboard');
    }
  };

  const handleRegisterSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setStudentProfile((prev) => ({
      ...prev,
      fullName: user.name,
      email: user.email,
    }));
    navigate('student-dashboard');
  };

  const handleLogout = () => {
    setAuthUser(null);
    navigate('landing');
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (id: string) => {
    ensureStudentSession();
    setSelectedScholarshipId(id);
    navigate('scholarship-details');
  };

  const handleCheckEligibility = (id?: string) => {
    ensureStudentSession();
    if (id) setSelectedScholarshipId(id);
    navigate('check-eligibility');
  };

  const handleSaveScholarship = (updated: Scholarship) => {
    setScholarships((prev) => {
      const exists = prev.some((s) => s.id === updated.id);
      if (exists) {
        return prev.map((s) => (s.id === updated.id ? updated : s));
      }
      return [updated, ...prev];
    });
  };

  const handleDeleteScholarship = (id: string) => {
    setScholarships((prev) => prev.filter((s) => s.id !== id));
    setSavedIds((prev) => prev.filter((sid) => sid !== id));
  };

  const handleUpdateVerification = (id: string, status: VerificationStatus) => {
    const today = new Date().toISOString().slice(0, 10);
    setScholarships((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, verificationStatus: status, lastVerifiedDate: today } : s
      )
    );
  };

  const handleResetDemoData = () => {
    setScholarships(INITIAL_SCHOLARSHIPS);
    setStudentProfile(DEFAULT_STUDENT_PROFILE);
    setSavedIds(['sch-csss-01', 'sch-hdfc-05']);
  };

  const handleSwitchPortal = (targetMode: 'student' | 'admin') => {
    if (targetMode === 'admin') {
      setAuthUser({
        id: 'admin-1',
        name: 'Dr. Kavita Rao (Admin)',
        email: 'admin@scholarknowledge.edu.in',
        role: 'admin',
      });
      navigate('admin-dashboard');
    } else {
      setAuthUser({
        id: 'student-1',
        name: studentProfile.fullName || 'Aarav Sharma',
        email: studentProfile.email || 'aarav.sharma@student.edu.in',
        role: 'student',
      });
      navigate('student-dashboard');
    }
  };

  // Public Pages
  if (route === 'landing') {
    return (
      <LandingPage
        scholarships={scholarships.filter((s) => s.isPublished)}
        sampleProfile={studentProfile}
        onNavigateLogin={() => navigate('login')}
        onNavigateRegister={() => navigate('register')}
        onQuickExplore={() => {
          ensureStudentSession();
          navigate('explore-scholarships');
        }}
        onQuickCheckEligibility={() => handleCheckEligibility()}
        onInspectScholarship={handleViewDetails}
      />
    );
  }

  if (route === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoRegister={() => navigate('register')}
        onBackHome={() => navigate('landing')}
      />
    );
  }

  if (route === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={handleRegisterSuccess}
        onGoLogin={() => navigate('login')}
        onBackHome={() => navigate('landing')}
      />
    );
  }

  const activeUser: AuthUser = authUser ?? {
    id: 'student-1',
    name: studentProfile.fullName || 'Student',
    email: studentProfile.email || 'student@college.edu.in',
    role: 'student',
  };

  const isAdminRoute = route.startsWith('admin-');
  const activeScholarship =
    scholarships.find((s) => s.id === selectedScholarshipId) ?? scholarships[0];

  return (
    <AppShell
      mode={isAdminRoute ? 'admin' : 'student'}
      currentRoute={route}
      breadcrumbTitle={ROUTE_TITLES[route]}
      user={activeUser}
      onNavigate={navigate}
      onSwitchPortal={handleSwitchPortal}
      onLogout={handleLogout}
    >
      {route === 'student-dashboard' && (
        <StudentDashboard
          studentName={studentProfile.fullName || activeUser.name}
          profile={studentProfile}
          scholarships={scholarships}
          savedIds={savedIds}
          onNavigate={navigate}
          onViewDetails={handleViewDetails}
          onCheckEligibility={handleCheckEligibility}
        />
      )}

      {route === 'student-profile' && (
        <StudentProfilePage
          profile={studentProfile}
          onSaveProfile={(updated) => setStudentProfile(updated)}
        />
      )}

      {route === 'explore-scholarships' && (
        <ExploreScholarshipsPage
          scholarships={scholarships}
          profile={studentProfile}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
          onViewDetails={handleViewDetails}
          onCheckEligibility={handleCheckEligibility}
        />
      )}

      {route === 'scholarship-details' && activeScholarship && (
        <ScholarshipDetailsPage
          scholarship={activeScholarship}
          profile={studentProfile}
          isSaved={savedIds.includes(activeScholarship.id)}
          onToggleSave={handleToggleSave}
          onCheckEligibility={handleCheckEligibility}
          onBack={() => navigate('explore-scholarships')}
        />
      )}

      {route === 'check-eligibility' && (
        <EligibilityCheckerPage
          scholarships={scholarships}
          selectedScholarshipId={selectedScholarshipId}
          savedProfile={studentProfile}
          onSelectScholarship={(id) => setSelectedScholarshipId(id)}
          onViewDetails={handleViewDetails}
        />
      )}

      {route === 'my-results' && (
        <MyResultsPage
          scholarships={scholarships}
          profile={studentProfile}
          onCheckEligibility={handleCheckEligibility}
          onViewDetails={handleViewDetails}
        />
      )}

      {route === 'compare-scholarships' && (
        <CompareScholarshipsPage
          scholarships={scholarships}
          profile={studentProfile}
          onViewDetails={handleViewDetails}
        />
      )}

      {route === 'ask-assistant' && (
        <AskAssistantPage
          scholarships={scholarships}
          profile={studentProfile}
          onViewDetails={handleViewDetails}
        />
      )}

      {route === 'saved-scholarships' && (
        <SavedScholarshipsPage
          scholarships={scholarships}
          savedIds={savedIds}
          profile={studentProfile}
          onRemoveSaved={handleToggleSave}
          onViewDetails={handleViewDetails}
          onCheckEligibility={handleCheckEligibility}
          onExplore={() => navigate('explore-scholarships')}
        />
      )}

      {route === 'student-settings' && (
        <StudentSettingsPage
          onResetDemoData={handleResetDemoData}
          onSwitchToAdmin={() => handleSwitchPortal('admin')}
        />
      )}

      {isAdminRoute && (
        <AdminDashboard
          currentRoute={route}
          scholarships={scholarships}
          editingScholarshipId={editingScholarshipId}
          sampleStudentProfile={studentProfile}
          onNavigate={navigate}
          onStartEdit={(id) => {
            setEditingScholarshipId(id);
            navigate('admin-edit');
          }}
          onSaveScholarship={handleSaveScholarship}
          onDeleteScholarship={handleDeleteScholarship}
          onUpdateVerification={handleUpdateVerification}
        />
      )}
    </AppShell>
  );
}
