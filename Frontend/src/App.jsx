import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingPage from './Pages/Onboarding/Onboardingpg'
import Login from './Pages/Login';
import LandingPage from './Pages/landing';
import Members from './Pages/admin/Members';

function App() {


  return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/members" element={<Members />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
  )
}

export default App;
