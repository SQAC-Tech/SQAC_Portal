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
import Profile from "./Pages/admin/Profile";
import Projects from "./Pages/admin/Projects";
import MyProjects from "./Pages/user/MyProjects";
import Verify from "./Pages/Verify";
import Notice from './Pages/notices/Notice';
import { Toaster } from "react-hot-toast";
import MOMGenerator from "./Pages/mom/MOMGenerator";
import MOMList from "./Pages/mom/MOMList";
import AdminMOMGenerator from "./Pages/admin/AdminMOMGenerator";
import AdminMOMList from "./Pages/admin/AdminMOMList";

import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/members" element={<Members />} />
      <Route path="/admin/projects" element={<Projects />} />
      <Route path="/user/projects" element={<MyProjects />} />
      <Route path="/user/profile" element={<Profile />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/certificates" element={<CertGenerator />} />
      <Route path="/verify/:credentialId" element={<Verify />} />
      <Route path='/admin/notice' element={<Notice />} />

      {/* MOM — admin routes (with sidebar) */}
      <Route path="/admin/mom/create" element={<AdminMOMGenerator />} />
      <Route path="/admin/mom/list" element={<AdminMOMList />} />

      {/* MOM — standalone routes (no sidebar, accessible to all logged-in users) */}
      <Route path="/mom/create" element={<MOMGenerator />} />
      <Route path="/mom/list" element={<MOMList />} />

      {/* Redirect all other routes to login for now */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;