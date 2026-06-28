import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ── Eager: public entry points (must render instantly, no spinner) ───────────
import LandingPage from "./Pages/landing";
import Login from "./Pages/Login";
import OnboardingPage from "./Pages/Onboarding/Onboardingpg";

import PwaInstallPrompt from "./components/common/PwaInstallPrompt";
import {
  ProtectedRoute,
  AdminRoute,
  SecretaryRoute,
  SecretaryOrJointRoute,
  COCRoute,
  ActiveRoute,
} from "./components/common/guards/AuthGuards";

// ── Lazy: everything behind auth — split into separate chunks, loaded on demand.
// Heavy admin-only libs (jszip/qrcode/papaparse in CertGenerator) ride along
// with their page chunk instead of bloating the landing bundle.
const Verify = lazy(() => import("./Pages/Verify"));
const AcceptCOC = lazy(() => import("./Pages/AcceptCOC"));
const CompleteProfile = lazy(() => import("./Pages/CompleteProfile"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const MyProjects = lazy(() => import("./Pages/user/MyProjects"));
const Profile = lazy(() => import("./Pages/admin/Profile"));
const Meet = lazy(() => import("./Pages/Meet"));
const Notice = lazy(() => import("./Pages/notices/Notice"));
const MOMGenerator = lazy(() => import("./Pages/mom/MOMGenerator"));
const MOMList = lazy(() => import("./Pages/mom/MOMList"));
const Members = lazy(() => import("./Pages/admin/Members"));
const Projects = lazy(() => import("./Pages/admin/Projects"));
const AttendancePage = lazy(() => import("./Pages/admin/Attendance"));
const CertGenerator = lazy(() => import("./Pages/admin/CertGenerator"));
const AdminMOMGenerator = lazy(() => import("./Pages/admin/AdminMOMGenerator"));
const AdminMOMList = lazy(() => import("./Pages/admin/AdminMOMList"));
const Approvals = lazy(() => import("./Pages/admin/Approvals"));
const COCRecords = lazy(() => import("./Pages/admin/COCRecords"));

// Lightweight full-screen fallback shown while a lazy chunk downloads.
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070910]">
      <span
        className="inline-block h-9 w-9 animate-spin rounded-full border-[3px] border-[#f183ff] border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

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
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>

      <PwaInstallPrompt />
    </>
  );
}

export default App;
