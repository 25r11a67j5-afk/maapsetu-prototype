import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import OwnerDashboard from './pages/OwnerDashboard';
import InstrumentPassport from './pages/InstrumentPassport';
import ApplyWizard from './pages/ApplyWizard';
import AdminDashboard from './pages/AdminDashboard';
import LmoFieldVerification from './pages/LmoFieldVerification';
import LmoSuccess from './pages/LmoSuccess';
import CertificateViewer from './pages/CertificateViewer';
import PublicVerification from './pages/PublicVerification';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen bg-neutralSlate text-navy-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Page 1: Welcome Page */}
            <Route path="/" element={<WelcomePage />} />

            {/* Page 2: Login Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* Page 3: Owner Dashboard */}
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />

            {/* Page 4: Instrument Passport */}
            <Route path="/owner/instrument/:id" element={<InstrumentPassport />} />

            {/* Page 5: Verification Application Wizard */}
            <Route path="/owner/apply" element={<ApplyWizard />} />

            {/* Page 6: Admin Dashboard */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Pages 7-10: LMO Field Verification (Substeps 1-4) */}
            <Route path="/lmo/field-verification" element={<LmoFieldVerification />} />

            {/* Page 11: Verification Success */}
            <Route path="/lmo/success" element={<LmoSuccess />} />

            {/* Page 12: Digital Certificate Viewer */}
            <Route path="/certificate/:id" element={<CertificateViewer />} />

            {/* Page 13: Public QR Verification (No Login Required) */}
            <Route path="/verify/:certId" element={<PublicVerification />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
