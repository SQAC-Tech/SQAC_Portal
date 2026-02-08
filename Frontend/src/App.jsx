import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingPage from './Pages/Onboarding/Onboardingpg'
import Login from './Pages/Login';
import MemberProfile from './Pages/MembProfile/MembProfile';

function App() {


  return (
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<MemberProfile />} />

      </Routes>
  )
}

export default App;
