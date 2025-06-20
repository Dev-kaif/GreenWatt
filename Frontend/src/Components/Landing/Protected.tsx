// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component
 *
 * This component acts as a gatekeeper for routes that require user authentication.
 * It checks if an 'accessToken' exists in localStorage.
 * If the token is found, it renders the child routes (via <Outlet />).
 * If no token is found, it redirects the user to the login page (`/auth/login`).
 *
 * This provides a basic level of client-side route protection.
 * Note: Full security also relies on backend authentication middleware for API calls.
 */
const ProtectedRoute: React.FC = () => {
  // Retrieve the access token from localStorage
  const isAuthenticated = localStorage.getItem('token');

  // If a token exists, the user is considered authenticated for client-side routing
  if (isAuthenticated) {
    // Render the child routes (e.g., Dashboard, Profile)
    return <Outlet />;
  } else {
    // If no token, redirect to the login page
    // The `replace` prop ensures the login page replaces the current entry in history,
    // so the user can't just hit back to bypass the protection.
    return <Navigate to="/auth/login" replace />;
  }
};

export default ProtectedRoute;
