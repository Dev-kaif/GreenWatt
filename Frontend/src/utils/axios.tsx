// src/services/axiosInstance.ts
import axios from 'axios';
import { BACKEND_URL } from './Config';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('token');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config; // Return the modified config
  },
  (error) => {
    return Promise.reject(error);
  }


  
);


axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  async (error) => {
    // Get the original request configuration
    const originalRequest = error.config;

    // Check if the error is a 401 Unauthorized and it's not already being retried,
    // and it's not the login endpoint itself (to prevent infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/login') {
      originalRequest._retry = true; // Mark the original request as retried

      console.warn("Access token expired or unauthorized. Redirecting to login.");

      // Clear any stored tokens and user data from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken'); // Clear if you were storing it
      localStorage.removeItem('userEmail');   // Clear if you were storing it
      localStorage.removeItem('userId');      // Clear if you were storing it

      // Redirect the user to the login page
      // Note: In a real React Router setup, you'd ideally use `useNavigate` or a custom history
      // context within your components. For a pure JS file like this, direct window.location.href
      // is a common fallback, but be aware it triggers a full page reload.
      window.location.href = '/auth/login';

      // Reject the promise to propagate the error
      return Promise.reject(error);
    }

    // For any other errors (not 401, or already retried), just reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;
