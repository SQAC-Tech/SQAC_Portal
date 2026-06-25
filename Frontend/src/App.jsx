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
import Approvals from "./Pages/admin/Approvals";
import AcceptCOC from "./Pages/AcceptCOC";
import CompleteProfile from "./Pages/CompleteProfile";
import COCRecords from "./Pages/admin/COCRecords";

import {
  ProtectedRoute,
  AdminRoute,
  SecretaryRoute,
  SecretaryOrJointRoute,
  COCRoute,
  ActiveRoute,
} from "./components/common/guards/AuthGuards";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(12, 15, 26, 0.92)",
            color: "#f5eefc",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            padding: "12px 16px",
            fontSize: "14px",
            fontFamily: "Manrope, sans-serif",
            backdropFilter: "blur(16px)",
            boxShadow: "0 24px 60px rgba(4, 6, 20, 0.45)",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#0c0f1a" } },
          error: { iconTheme: { primary: "#ff6e84", secondary: "#0c0f1a" } },
          loading: { iconTheme: { primary: "#f183ff", secondary: "#0c0f1a" } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:credentialId" element={<Verify />} />

        {/* COC + Profile completion (approved users, no COC yet) */}
        <Route path="/accept-coc" element={<ProtectedRoute><AcceptCOC /></ProtectedRoute>} />
        <Route path="/complete-profile" element={<COCRoute><CompleteProfile /></COCRoute>} />

        {/* Dashboard and all portal routes — require full activation */}
        <Route path="/dashboard" element={<ActiveRoute><Dashboard /></ActiveRoute>} />
        <Route path="/user/projects" element={<ActiveRoute><MyProjects /></ActiveRoute>} />
        <Route path="/user/profile" element={<ActiveRoute><Profile /></ActiveRoute>} />
        <Route path="/meet" element={<ActiveRoute><Meet /></ActiveRoute>} />
        <Route path="/admin/notice" element={<ActiveRoute><Notice /></ActiveRoute>} />
        <Route path="/mom/create" element={<ActiveRoute><MOMGenerator /></ActiveRoute>} />
        <Route path="/mom/list" element={<ActiveRoute><MOMList /></ActiveRoute>} />

        {/* Admin routes (role-gated + fully active) */}
        <Route path="/admin/members" element={<AdminRoute><Members /></AdminRoute>} />
        <Route path="/admin/projects" element={<AdminRoute><Projects /></AdminRoute>} />
        <Route path="/admin/attendance" element={<AdminRoute><AttendancePage /></AdminRoute>} />
        <Route path="/dashboard/certificates" element={<AdminRoute><CertGenerator /></AdminRoute>} />
        <Route path="/admin/mom/create" element={<AdminRoute><AdminMOMGenerator /></AdminRoute>} />
        <Route path="/admin/mom/list" element={<ActiveRoute><AdminMOMList /></ActiveRoute>} />
        <Route path="/admin/approvals" element={<SecretaryRoute><Approvals /></SecretaryRoute>} />
        <Route path="/admin/coc" element={<SecretaryOrJointRoute><COCRecords /></SecretaryOrJointRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
