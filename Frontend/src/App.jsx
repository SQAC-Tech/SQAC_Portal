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
import Meet from "./Pages/Meet";
import AttendancePage from "./Pages/admin/Attendance";
import { ProtectedRoute, AdminRoute } from "./components/common/guards/AuthGuards";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin Deck Routes (Admin / Subadmin / Lead only) */}
      <Route path="/admin/members" element={<AdminRoute><Members /></AdminRoute>} />
      <Route path="/admin/projects" element={<AdminRoute><Projects /></AdminRoute>} />
      <Route path="/admin/attendance" element={<AdminRoute><AttendancePage /></AdminRoute>} />
      <Route path="/admin/notice" element={<ProtectedRoute><Notice /></ProtectedRoute>} />
      <Route path="/dashboard/certificates" element={<AdminRoute><CertGenerator /></AdminRoute>} />
      <Route path="/admin/mom/create" element={<AdminRoute><AdminMOMGenerator /></AdminRoute>} />
      <Route path="/admin/mom/list" element={<AdminRoute><AdminMOMList /></AdminRoute>} />

      {/* Protected General Routes (Any Logged In User) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/user/projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
      <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/meet" element={<ProtectedRoute><Meet /></ProtectedRoute>} />
      
      {/* MOM Standalone Routes (Any Logged In User) */}
      <Route path="/mom/create" element={<ProtectedRoute><MOMGenerator /></ProtectedRoute>} />
      <Route path="/mom/list" element={<ProtectedRoute><MOMList /></ProtectedRoute>} />

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/verify/:credentialId" element={<Verify />} />

      {/* Redirect all other routes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;