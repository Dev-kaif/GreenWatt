import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GreenWattLanding from "./Components/Landing/Landing";
import LoginPage from "./Components/Landing/Login";
import SignupPage from "./Components/Landing/Signup";
import Dashboard from "./Components/Dashboard/Dashboard";

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
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
