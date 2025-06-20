/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Components/Landing/ProtectedRoute.tsx

import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axios"; // Adjust path as needed

const ProtectedRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setIsOnboarded(false);
        setLoading(false);
        return;
      }

      try {
        const profileResponse = await axiosInstance.get("/api/profile");

        const isUserValid = !!profileResponse.data?.user;
        const onboardingComplete = profileResponse.data?.userProfile?.onboardingComplete === true;

        setIsAuthenticated(isUserValid);
        setIsOnboarded(onboardingComplete);
        
      } catch (error: any) {
        console.error(
          "❌ Auth/Profile check failed:",
          error.response?.status,
          error.message
        );

        setIsAuthenticated(false);
        setIsOnboarded(false);

        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-700 text-lg">
        <svg
          className="animate-spin h-8 w-8 text-green-700 mr-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Verifying access...
      </div>
    );
  }

  // --- Redirection Logic ---

  // Not authenticated? Send to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  // Authenticated but not onboarded? Force onboarding
  if (!isOnboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Already onboarded? Block access to onboarding page
  if (isOnboarded && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  // All good: allow access
  return <Outlet />;
};

export default ProtectedRoute;
