import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OnboardingPage from './Pages/Onboarding/Onboardingpg';
import Login from './Pages/Login';
import LandingPage from './Pages/landing';
import CertGenerator from './Pages/admin/CertGenerator';
import Verify from './Pages/Verify';

import Dashboard from './Pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/certificates" element={<CertGenerator />} />
      <Route path="/verify/:credentialId" element={<Verify />} />
      
      {/* Redirect all other routes to login for now */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
