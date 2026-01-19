import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingPage from './Pages/Onboarding/Onboardingpg'

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
      </Routes>
    </Router>
  )
}

export default App;
