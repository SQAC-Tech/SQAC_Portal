// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import OnboardingPage from "./Pages/Onboarding/Onboardingpg";
// import Login from "./Pages/Login";
// import LandingPage from "./Pages/landing";
// import Members from "./Pages/admin/Members";
// import CertGenerator from "./Pages/admin/CertGenerator";
// import Verify from "./Pages/Verify";

// import Notice from './Pages/notices/Notice';
// import { Toaster } from "react-hot-toast";

// function App() {
//   return (
//     <>
//       <Toaster position="top-right" reverseOrder={false} />
//       <Routes>
//         <Route path="/onboarding" element={<OnboardingPage />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/" element={<LandingPage />} />
//         <Route path='/notice' element={<Notice />} />
//       </Routes>
//     </>   
//   )
// }

// export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import OnboardingPage from "./Pages/Onboarding/Onboardingpg";
import Login from "./Pages/Login";
import LandingPage from "./Pages/landing";
import Members from "./Pages/admin/Members";
import CertGenerator from "./Pages/admin/CertGenerator";
import Verify from "./Pages/Verify";
import Notice from './Pages/notices/Notice';
import { Toaster } from "react-hot-toast";

import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/members" element={<Members />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/certificates" element={<CertGenerator />} />
      <Route path="/verify/:credentialId" element={<Verify />} />
      <Route path='/notice' element={<Notice />} />

      {/* Redirect all other routes to login for now */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;