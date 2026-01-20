import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingPage from './Pages/Onboarding/Onboardingpg'
import Login from './Pages/Login';

function App() {


  return (
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
  )
}

export default App;
