import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GreenWattLanding from "./Components/Landing/Landing";
import LoginPage from "./Components/Landing/Login";
import SignupPage from "./Components/Landing/Signup";
import ProtectedRoute from "./Components/Landing/Protected";
import Index from "./Components/Dashboard/DashboardPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the landing page */}
        <Route path="/" element={<GreenWattLanding />} />

        {/* Route for the login page */}
        <Route path="/auth/login" element={<LoginPage />} />

        {/* Route for the signup page */}
        <Route path="/auth/signup" element={<SignupPage />} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Index />} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
