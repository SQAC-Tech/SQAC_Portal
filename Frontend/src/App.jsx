import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OnboardingPage from './Pages/Onboarding/Onboardingpg';
import Login from './Pages/Login';
import LandingPage from './Pages/landing';
<<<<<<< HEAD
import Notice from './Pages/notices/Notice';
import { Toaster } from "react-hot-toast";
=======
import CertGenerator from './Pages/admin/CertGenerator';
import Verify from './Pages/Verify';

import Dashboard from './Pages/Dashboard';
>>>>>>> 770d6eaf53725142af0858b4cdb3368db0853323

function App() {
  return (
<<<<<<< HEAD
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path='/notice' element={<Notice />} />
      </Routes>
    </>   
  )
=======
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
>>>>>>> 770d6eaf53725142af0858b4cdb3368db0853323
}

export default App;
