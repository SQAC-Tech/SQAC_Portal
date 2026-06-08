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

import Dashboard from "./Pages/Dashboard";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/members" element={<Members />} />
      <Route path="/admin/projects" element={<Projects />} />
      <Route path="/user/projects" element={<MyProjects />} />
      <Route path="/user/profile" element={<Profile />} />
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/dashboard/certificates" element={<CertGenerator />} />
      <Route path="/verify/:credentialId" element={<Verify />} />

      {/* Redirect all other routes to login for now */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
