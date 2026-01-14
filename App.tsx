
import React, { useState, useEffect } from 'react';
import { Page, AppStatus, Application } from './types';
import LandingPage from './pages/LandingPage';
import ApplicationForm from './pages/ApplicationForm';
import ConfirmationPage from './pages/ConfirmationPage';
import StatusChecker from './pages/StatusChecker';
import FAQPage from './pages/FAQPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { submitApplication, checkApplicationStatus, isAdminLoggedIn, SubmitApplicationData } from './lib/api';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminLoggedIn());
  const [apiError, setApiError] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setApiError('');
  };

  const handleFormSubmit = async (newApp: Partial<Application>) => {
    try {
      setApiError('');

      // Convert to API format
      const apiData: SubmitApplicationData = {
        fullName: newApp.fullName || '',
        email: newApp.email || '',
        phone: newApp.phone || '',
        department: newApp.department || '',
        level: newApp.level || '',
        talents: newApp.talents || [],
        instruments: newApp.instruments,
        otherTalent: newApp.otherTalents,
        experience: newApp.experience || 'No',
        experienceDetails: newApp.experienceDetails,
        motivation: newApp.motivation || '',
        gain: newApp.gain,
        availability: newApp.availability || [],
        preferredSlot: newApp.preferredSlot,
      };

      const response = await submitApplication(apiData);

      if (response.success) {
        setLastSubmittedId(response.refNumber);
        setCurrentPage(Page.CONFIRMATION);
      } else {
        setApiError('Failed to submit application. Please try again.');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      setApiError(error.message || 'Failed to submit application. Please try again.');
    }
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setCurrentPage(Page.ADMIN_DASHBOARD);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setCurrentPage(Page.HOME);
  };

  // Show admin pages without normal layout
  if (currentPage === Page.ADMIN_LOGIN) {
    return <AdminLogin onLogin={handleAdminLogin} onNavigate={handleNavigate} />;
  }

  if (currentPage === Page.ADMIN_DASHBOARD) {
    if (!isAdmin) {
      setCurrentPage(Page.ADMIN_LOGIN);
      return null;
    }
    return <AdminDashboard onLogout={handleAdminLogout} onNavigate={handleNavigate} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <LandingPage onNavigate={handleNavigate} />;
      case Page.APPLY:
        return (
          <>
            {apiError && (
              <div className="max-w-4xl mx-auto px-4 pt-20">
                <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-4 font-bold">
                  {apiError}
                </div>
              </div>
            )}
            <ApplicationForm onSubmit={handleFormSubmit} onCancel={() => handleNavigate(Page.HOME)} />
          </>
        );
      case Page.CONFIRMATION:
        return <ConfirmationPage referenceId={lastSubmittedId} onNavigate={handleNavigate} />;
      case Page.CHECK_STATUS:
        return <StatusChecker applications={[]} onNavigate={handleNavigate} />;
      case Page.FAQ:
        return <FAQPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={handleNavigate} activePage={currentPage} />
      <main className="flex-grow pt-16">
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
