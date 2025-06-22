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
  DollarSign, // Added for total savings icon
  CloudRain,
  CheckCircle, // Added for CO2 reduction icon
} from "lucide-react";

import { motion, AnimatePresence, type TargetAndTransition, type Transition, type Variants } from "framer-motion"; // Import AnimatePresence, TargetAndTransition, Transition
import axiosInstance from "../../utils/axios";

// --- Animation Variants ---

// General page entry animation
const pageVariants:Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Message Box animation
const messageBoxVariants:Variants = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 20 } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
};

// Common button press animation
const buttonPress: TargetAndTransition = {
  scale: 0.95,
  y: 1,
  transition: { type: "spring", stiffness: 300, damping: 10 } as Transition
};

// Common input focus animation
const inputFocus: TargetAndTransition = {
  scale: 1.005,
  boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)", // Primary color with transparency
  transition: { type: "spring", stiffness: 200, damping: 15 } as Transition
};

// Stagger container for grid items (e.g., summary cards)
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1, // Stagger items by 0.1 seconds
    },
  },
};

// Item variant for staggered children
const itemVariants:Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};


// MessageBox component
const MessageBox = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      variants={messageBoxVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`fixed top-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl z-50 flex items-center space-x-3 border-2 ${type === "success" ? "border-green-500" : "border-red-500"}`}
    >
      {type === "success" ? (
        <CheckCircle className="w-6 h-6 text-green-500" />
      ) : (
        <XCircle className="w-6 h-6 text-red-500" />
      )}
      <p className={`text-lg font-semibold ${type === "success" ? "text-green-700" : "text-red-700"}`}>
        {message}
      </p>
      <motion.button
        onClick={onClose}
        className={`ml-4 px-3 py-1 rounded-lg font-medium transition-colors ${type === "success" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`}
        whileHover={{ scale: 1.05 }}
        whileTap={buttonPress}
      >
        OK
      </motion.button>
    </motion.div>
  </AnimatePresence>
);

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
      // console.log("Profile updated:", response.data);
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
        <motion.svg
          className="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
        </motion.svg>
        <p className="ml-4 text-primary">Loading profile...</p>
      </div>
    );
  }

  // Render message boxes only if they exist
  // We wrap them in AnimatePresence because they are conditionally rendered
  const renderMessageBoxes = () => (
    <AnimatePresence>
      {successMessage && (
        <MessageBox
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {error && !successMessage && ( // Only show error if no success message is present
        <MessageBox
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </AnimatePresence>
  );


  const userEmail = profileData?.email || "N/A";
  const joinDate = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <motion.div initial="initial" animate="animate" variants={pageVariants} className="p-4 sm:p-6 lg:p-8">
      {renderMessageBoxes()} {/* Render message boxes here */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-card p-6 mb-6"
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary">
                  Personal & Household Information
                </h2>
              </div>
              {!isEditing && ( // Only show edit button when not editing
                <motion.button
                  onClick={handleEditClick}
                  className="flex items-center space-x-2 px-4 py-2 text-primary hover:bg-green-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={buttonPress}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </motion.button>
              )}
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <motion.input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    whileFocus={inputFocus}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <motion.input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    whileFocus={inputFocus}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="+1 (555) 123-4567"
                      whileFocus={inputFocus}
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
                    <motion.textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                      placeholder="e.g., 123 Main St"
                      whileFocus={inputFocus}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <motion.input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Eco City"
                    whileFocus={inputFocus}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <motion.input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., CA"
                    whileFocus={inputFocus}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <motion.input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., 90210"
                    whileFocus={inputFocus}
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
                    <motion.select
                      name="householdSize"
                      value={formData.householdSize}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      whileFocus={inputFocus}
                    >
                      <option value="">Select...</option>{" "}
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5+ people</option>
                    </motion.select>
                  </div>
                </div>

                {/* Electricity Rate Per kWh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Electricity Rate (₹/kWh)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input
                      type="number"
                      name="electricityRatePerKWh"
                      value={formData.electricityRatePerKWh}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="e.g., 0.15"
                      min="0"
                      step="0.001"
                      whileFocus={inputFocus}
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
                    <motion.input
                      type="number"
                      name="targetReduction"
                      value={formData.targetReduction}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="e.g., 15"
                      min="0"
                      max="100"
                      step="1"
                      whileFocus={inputFocus}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eco Goals
                  </label>
                  <div className="relative">
                    <Goal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input
                      type="text"
                      name="ecoGoals"
                      value={formData.ecoGoals}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="e.g., Use less AC"
                      whileFocus={inputFocus}
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence> {/* Use AnimatePresence for conditional rendering of buttons */}
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 flex justify-end space-x-4"
                  >
                    <motion.button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={buttonPress}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Cancel</span>
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={buttonPress}
                    >
                      {isSubmitting ? (
                        <motion.svg
                          className="h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
                        </motion.svg>
                      ) : (
                        <>
                          <span>Save Changes</span>
                          <Save className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>

        {/* Account Summary */}
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-card p-6"
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Account Summary
            </h3>
            <div className="space-y-4">
              <motion.div
                className="flex items-center justify-center mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {profileData?.firstName ? profileData.firstName[0] : ""}
                    {profileData?.lastName ? profileData.lastName[0] : ""}
                  </span>
                </div>
              </motion.div>

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
                      ? `₹${profileData.userProfile.electricityRatePerKWh.toFixed(3)}/kWh`
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span>{totalSavings !== null && totalSavings < 0 ? "Extra Cost:" : "Total Savings:"}</span>
                  </span>
                  <motion.span
                    className={`font-medium ${totalSavings !== null && totalSavings < 0 ? "text-red-500" : "text-green-600"}`}
                    key={totalSavings} // Key for re-animation on value change
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {totalSavings !== null
                      ? `₹${Math.abs(totalSavings).toLocaleString('en-IN')}`
                      : isLoading ? "Calculating..." : "N/A"}
                  </motion.span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center space-x-1">
                    <CloudRain className="w-4 h-4 text-gray-500" />
                    <span>{totalCo2Reduction !== null && totalCo2Reduction < 0 ? "CO2 Increase:" : "CO2 Reduction:"}</span>
                  </span>
                  <motion.span
                    className={`font-medium ${totalCo2Reduction !== null && totalCo2Reduction < 0 ? "text-red-500" : "text-green-600"}`}
                    key={totalCo2Reduction} // Key for re-animation on value change
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {totalCo2Reduction !== null
                      ? `${Math.abs(totalCo2Reduction).toFixed(2)} tons`
                      : isLoading ? "Calculating..." : "N/A"}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-primary to-green-600 rounded-2xl p-6 text-white"
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h3 className="text-lg font-semibold mb-2">
              Energy Efficiency Score
            </h3>
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold mb-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              >
                85%
              </motion.div>
              <p className="text-green-100">You're doing great!</p>
            </div>
            <div className="mt-4 bg-white/50 rounded-full h-2">
              <motion.div
                className="bg-white rounded-full h-2 w-4/5"
                initial={{ width: 0 }}
                animate={{ width: "85%" }} // Match the 85% score
                transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              ></motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;