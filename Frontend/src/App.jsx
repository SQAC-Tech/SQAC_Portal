import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingPage from './Pages/Onboarding/Onboardingpg'
import Login from './Pages/Login';
import LandingPage from './Pages/landing';
import Notice from './Pages/notices/Notice';
import { Toaster } from "react-hot-toast";

function App() {


  return (
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
}

export default App;
