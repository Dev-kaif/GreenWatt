import { HashRouter as Router, Routes, Route } from "react-router-dom";
import GreenWattLanding from "./Components/Landing/Landing";
import LoginPage from "./Components/Landing/Login";
import SignupPage from "./Components/Landing/Signup";
import ProtectedRoute from "./Components/Landing/Protected"; // This is the updated component
import Index from "./Components/Dashboard/DashboardPage"; // Your Dashboard component
import OnboardingWizard from "./Components/Onboarding/OnboardingWizard"; // Your Onboarding Wizard

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<GreenWattLanding />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/onboarding" element={<OnboardingWizard/>} />
        </Route>

        {/* Catch-all for 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;