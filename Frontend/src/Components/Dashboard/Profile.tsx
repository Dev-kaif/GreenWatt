/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  Edit3,
  Save,
  XCircle,
  Target,
  Goal,
  IndianRupee,
} from "lucide-react";

import { motion } from "framer-motion";
import axiosInstance from "../../utils/axios";

// MessageBox component (re-used for consistency)
const MessageBox = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <div
    className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}
  >
    <div
      className={`bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center ${
        type === "success" ? "border-green-500" : "border-red-500"
      } border-2`}
    >
      <p
        className={`text-lg font-semibold mb-4 ${
          type === "success" ? "text-green-700" : "text-red-700"
        }`}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          type === "success"
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
        } text-white`}
      >
        OK
      </button>
    </div>
  </div>
);

// Animation variants (re-used for consistency)
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null); // Will store fetched data
  const [formData, setFormData] = useState({
    // State for form inputs (editable fields)
    firstName: "",
    lastName: "",
    phoneNumber: "",
    householdSize: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    targetReduction: "",
    ecoGoals: "",
    electricityRatePerKWh: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // NEW: State for analytics data
  const [totalSavings, setTotalSavings] = useState<number | null>(null);
  const [totalCo2Reduction, setTotalCo2Reduction] = useState<number | null>(null);

  // --- Fetch User Profile and Analytics Data ---
  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch User Profile Data
      const profileResponse = await axiosInstance.get("/api/profile");
      const user = profileResponse.data.user;
      setProfileData(user); // Store full user object

      // Populate formData with existing profile data
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        householdSize: user.householdSize?.toString() || "1", // Ensure string for select
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        targetReduction: user.userProfile?.targetReduction?.toString() || "", // Access nested userProfile
        ecoGoals: user.userProfile?.ecoGoals || "",
        electricityRatePerKWh: user.userProfile?.electricityRatePerKWh?.toString() || "",
      });

      // 2. Fetch Total Savings
      try {
        const savingsResponse = await axiosInstance.get("/api/analytics/total-savings");
        setTotalSavings(savingsResponse.data.totalSavings);
      } catch (err: any) {
        console.warn("Failed to fetch total savings:", err.message);
        setTotalSavings(null);
      }

      // 3. Fetch Total CO2 Reduction
      try {
        const co2Response = await axiosInstance.get("/api/analytics/total-co2-reduction");
        setTotalCo2Reduction(co2Response.data.totalCo2Reduction);
      } catch (err: any) {
        console.warn("Failed to fetch total CO2 reduction:", err.message);
        setTotalCo2Reduction(null);
      }

    } catch (err: any) {
      console.error("Failed to load user profile or analytics:", err);
      setError("Failed to load user profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // --- Handle Profile Form Submission (Update) ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        householdSize: formData.householdSize
          ? parseInt(formData.householdSize)
          : undefined, // Convert to number
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        targetReduction: formData.targetReduction
          ? parseFloat(formData.targetReduction)
          : undefined, // Convert to number
        ecoGoals: formData.ecoGoals || undefined,
        electricityRatePerKWh: formData.electricityRatePerKWh
          ? parseFloat(formData.electricityRatePerKWh)
          : undefined, // Convert to number
      };

      const response = await axiosInstance.put("/api/profile", payload);
      console.log("Profile updated:", response.data);
      setSuccessMessage("Profile updated successfully!");
      setProfileData(response.data.user); // Update main profileData state with fresh data
      setIsEditing(false); // Exit edit mode after successful save
      fetchUserProfile(); // Re-fetch analytics data after profile update
    } catch (err: any) {
      console.error("Error updating profile:", err);
      if (err.response) {
        setError(
          err.response.data.message ||
            "Failed to update profile. Please try again."
        );
      } else if (err.request) {
        setError(
          "No response from server. Please check your internet connection."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError(null); // Clear any old errors when entering edit mode
    setSuccessMessage(null); // Clear old success messages
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset formData to current profileData values
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phoneNumber: profileData.phoneNumber || "",
        householdSize: profileData.householdSize?.toString() || "1",
        address: profileData.address || "",
        city: profileData.city || "",
        state: profileData.state || "",
        zipCode: profileData.zipCode || "",
        targetReduction:
          profileData.userProfile?.targetReduction?.toString() || "",
        ecoGoals: profileData.userProfile?.ecoGoals || "",
        electricityRatePerKWh:
          profileData.userProfile?.electricityRatePerKWh?.toString() || "",
      });
    }
    setError(null); // Clear errors when canceling
    setSuccessMessage(null); // Clear success messages
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg
          className="animate-spin h-8 w-8 text-green-primary"
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
        <p className="ml-4 text-green-primary">Loading profile...</p>
      </div>
    );
  }

  if (error && !successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <MessageBox
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      </div>
    );
  }

  const userEmail = profileData?.email || "N/A";
  const joinDate = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <motion.div variants={fadeInUp} className="animate-fade-in p-4">
      {successMessage && (
        <MessageBox
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {error && (
        <MessageBox
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary">
                  Personal & Household Information
                </h2>
              </div>
              <button
                onClick={handleEditClick}
                className="flex items-center space-x-2 px-4 py-2 text-green-primary hover:bg-green-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={userEmail} // Email is fetched but not editable
                      disabled={true} // Email is immutable via this form
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Address Fields */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  {" "}
                  {/* Full width for address line */}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                      placeholder="e.g., 123 Main St"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Eco City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., 90210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Household Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="householdSize"
                      value={formData.householdSize}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select...</option>{" "}
                      {/* Added a default empty option */}
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5+ people</option>
                    </select>
                  </div>
                </div>

                {/* Electricity Rate Per kWh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Electricity Rate (₹/kWh)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="electricityRatePerKWh"
                      value={formData.electricityRatePerKWh}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="e.g., 0.15"
                      min="0"
                      step="0.001" // Allow decimal input
                    />
                  </div>
                </div>

                {/* Eco Goals and Target Reduction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Reduction (%)
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="targetReduction"
                      value={formData.targetReduction}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="e.g., 15"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eco Goals
                  </label>
                  <div className="relative">
                    <Goal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="ecoGoals"
                      value={formData.ecoGoals}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="e.g., Use less AC"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                    ) : (
                      <>
                        <span>Save Changes</span>
                        <Save className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Account Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-primary to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {profileData?.firstName ? profileData.firstName[0] : ""}
                    {profileData?.lastName ? profileData.lastName[0] : ""}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-semibold text-text-primary text-lg">
                  {profileData?.firstName} {profileData?.lastName}
                </h4>
                <p className="text-gray-600">{userEmail}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium text-text-primary">
                    {joinDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Electricity Rate:</span>
                  <span className="font-medium text-text-primary">
                    {profileData?.userProfile?.electricityRatePerKWh !== null && profileData?.userProfile?.electricityRatePerKWh !== undefined
                      ? `₹${profileData.userProfile.electricityRatePerKWh.toFixed(3)}/kWh` // Display with 3 decimal places
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  {/* Total Savings */}
                  <span className="text-gray-600">
                    {totalSavings !== null && totalSavings < 0 ? "Extra Cost:" : "Total Savings:"}
                  </span>
                  <span className={`font-medium ${totalSavings !== null && totalSavings < 0 ? "text-red-500" : "text-green-600"}`}>
                    {totalSavings !== null
                      ? `₹${Math.abs(totalSavings).toLocaleString('en-IN')}`
                      : isLoading ? "Calculating..." : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  {/* CO2 Reduction */}
                  <span className="text-gray-600">
                    {totalCo2Reduction !== null && totalCo2Reduction < 0 ? "CO2 Increase:" : "CO2 Reduction:"}
                  </span>
                  <span className={`font-medium ${totalCo2Reduction !== null && totalCo2Reduction < 0 ? "text-red-500" : "text-green-600"}`}>
                    {totalCo2Reduction !== null
                      ? `${Math.abs(totalCo2Reduction).toFixed(2)} tons`
                      : isLoading ? "Calculating..." : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-primary to-green-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">
              Energy Efficiency Score
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">85%</div>{" "}
              {/* Still a Placeholder */}
              <p className="text-green-100">You're doing great!</p>
            </div>
            <div className="mt-4 bg-white/50 rounded-full h-2">
              <div className="bg-white rounded-full h-2 w-4/5"></div>{" "}
              {/* Placeholder for progress bar */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;