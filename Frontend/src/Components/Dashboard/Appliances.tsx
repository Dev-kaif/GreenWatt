/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Appliances.tsx
import React, { useState, useEffect } from 'react';
import { Plug, Zap, Clock, DollarSign, Plus, Edit, Trash2, XCircle, CheckCircle, CalendarDays, Star, Power, Sun} from 'lucide-react';
import { motion, AnimatePresence, type Variants, type TargetAndTransition, type Transition } from 'framer-motion'; // Import AnimatePresence, TargetAndTransition, Transition
import axiosInstance from '../../utils/axios';

const pageVariants:Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const messageBoxVariants:Variants = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 20 } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
};

const modalVariants:Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const itemVariants:Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.07, 
    },
  },
};

const buttonPress: TargetAndTransition = {
  scale: 0.95,
  y: 1,
  transition: { type: "spring", stiffness: 300, damping: 10 } as Transition
};

const energyStarRatings = ["1-Star", "2-Star", "3-Star", "4-Star", "5-Star"];
const energyEfficiencyGrades = ["A+++", "A++", "A+", "A", "B", "C", "D"];



// MessageBox component
const MessageBox = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
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

// ConfirmationModal component
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center border border-gray-200"
      >
        <p className="text-xl font-semibold text-gray-800 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <motion.button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={buttonPress}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={buttonPress}
          >
            Confirm
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

interface Appliance {
  id: string;
  type: string;
  modelName?: string;
  ageYears?: number;
  purchaseDate?: string;
  energyStarRating?: string;
  powerConsumptionWatts?: number;
  energyEfficiencyRating?: string;
  averageDailyUsageHours?: number;
  capacity?: string;
  status?: string; // Add status to interface
}

const Appliances = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [isLoadingAppliances, setIsLoadingAppliances] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showApplianceFormModal, setShowApplianceFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentApplianceId, setCurrentApplianceId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: '',
    modelName: '',
    ageYears: '',
    purchaseDate: '',
    energyStarRating: '',
    powerConsumptionWatts: '',
    energyEfficiencyRating: '',
    averageDailyUsageHours: '',
    capacity: '',
  });


  // --- Fetch Appliances ---
  const fetchAppliances = async () => {
    setIsLoadingAppliances(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/appliances');
      setAppliances(response.data.appliances);
    } catch (err: any) {
      console.error("Failed to fetch appliances:", err);
      setError("Failed to load appliances. Please try again.");
    } finally {
      setIsLoadingAppliances(false);
    }
  };

  useEffect(() => {
    fetchAppliances();
  }, []);


  // --- Form Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' && value !== '' ? parseFloat(value) : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        ...formData,
        // Ensure numeric fields are numbers or undefined if empty strings
        ageYears: formData.ageYears ? parseInt(formData.ageYears) : undefined,
        powerConsumptionWatts: formData.powerConsumptionWatts ? parseFloat(formData.powerConsumptionWatts) : undefined,
        averageDailyUsageHours: formData.averageDailyUsageHours ? parseFloat(formData.averageDailyUsageHours) : undefined,
        // Convert empty string purchaseDate to undefined if optional
        purchaseDate: formData.purchaseDate || undefined,
      };

      // Basic validation for required fields
      if (
        !payload.type ||
        !payload.powerConsumptionWatts || payload.powerConsumptionWatts <= 0 ||
        !payload.ageYears ||
        !payload.energyStarRating ||
        !payload.averageDailyUsageHours
      ) {
        setError("Please fill out all required fields.");
        setIsSubmitting(false);
        return;
      }


      if (isEditing && currentApplianceId) {
         await axiosInstance.put(`/api/appliances/${currentApplianceId}`, payload);
        setSuccessMessage("Appliance updated successfully!");
      } else {
        await axiosInstance.post('/api/appliances', payload);
        setSuccessMessage("Appliance added successfully!");
      }

      await fetchAppliances();
      handleCloseApplianceFormModal(); // Close modal and reset form

    } catch (err: any) {
      console.error('Error saving/updating appliance:', err);
      if (err.response) {
        setError(err.response.data.message || 'Failed to save appliance. Please check your input.');
      } else if (err.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Edit/Delete Handlers ---
  const handleEdit = (appliance: Appliance) => {
    setIsEditing(true);
    setCurrentApplianceId(appliance.id);
    setFormData({
      type: appliance.type || '',
      modelName: appliance.modelName || '',
      ageYears: appliance.ageYears?.toString() || '',
      purchaseDate: appliance.purchaseDate ? new Date(appliance.purchaseDate).toISOString().split('T')[0] : '',
      energyStarRating: appliance.energyStarRating || '',
      powerConsumptionWatts: appliance.powerConsumptionWatts?.toString() || '',
      energyEfficiencyRating: appliance.energyEfficiencyRating || '',
      averageDailyUsageHours: appliance.averageDailyUsageHours?.toString() || '',
      capacity: appliance.capacity || '',
    });
    setShowApplianceFormModal(true); // Open modal for editing
  };

  const handleDeleteConfirm = (id: string) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDeleteId) return;

    setIsSubmitting(true); // Use this for delete too
    setError(null);
    setSuccessMessage(null);

    try {
      await axiosInstance.delete(`/api/appliances/${itemToDeleteId}`);
      setSuccessMessage("Appliance deleted successfully!");
      await fetchAppliances(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting appliance:', err);
      if (err.response) {
        setError(err.response.data.message || 'Failed to delete appliance.');
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('An unexpected error occurred during deletion.');
      }
    } finally {
      setIsSubmitting(false);
      setItemToDeleteId(null);
    }
  };

  // --- Modal Control ---
  const handleOpenAddApplianceModal = () => {
    setIsEditing(false);
    setCurrentApplianceId(null);
    setFormData({ // Reset form for new entry
      type: '', modelName: '', ageYears: '', purchaseDate: '',
      energyStarRating: '', powerConsumptionWatts: '', energyEfficiencyRating: '',
      averageDailyUsageHours: '', capacity: '',
    });
    setError(null);
    setSuccessMessage(null);
    setShowApplianceFormModal(true);
  };

  const handleCloseApplianceFormModal = () => {
    setShowApplianceFormModal(false);
    // Form reset handled within handleFormSubmit on success (or on cancel)
  };

  // --- Helper Functions for UI ---
  const getEfficiencyColor = (efficiency: string) => {
    if (!efficiency) return 'bg-gray-100 text-gray-800';
    const rating = efficiency.toUpperCase();
    if (rating.includes('A') || rating.includes('EXCELLENT')) return 'bg-green-100 text-green-800';
    if (rating.includes('B') || rating.includes('GOOD')) return 'bg-blue-100 text-blue-800';
    if (rating.includes('C') || rating.includes('AVERAGE')) return 'bg-yellow-100 text-yellow-800';
    if (rating.includes('D') || rating.includes('POOR')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const totalMonthlyCost = appliances.reduce((sum, appliance) => sum + (appliance.powerConsumptionWatts && appliance.averageDailyUsageHours ? ((appliance.powerConsumptionWatts / 1000) * appliance.averageDailyUsageHours * 30 * 0.12) : 0), 0); // Assuming $0.12/kWh
  const activeAppliancesCount = appliances.filter(app => app.status === 'active').length;
  const totalDailyUsageHours = appliances.reduce((sum, app) => sum + (app.averageDailyUsageHours || 0), 0);
  const avgDailyUsageHours = appliances.length > 0 ? (totalDailyUsageHours / appliances.length).toFixed(1) : '0';


  return (
    <motion.div initial="initial" animate="animate" variants={pageVariants} className="p-4 sm:p-6 lg:p-8">
      {/* Message Boxes */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmationModal
            message="Are you sure you want to delete this appliance?"
            onConfirm={handleDelete}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Appliance Form Modal */}
      <AnimatePresence>
        {showApplianceFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative"
            >
              <motion.button
                onClick={handleCloseApplianceFormModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ rotate: 90 }}
                whileTap={buttonPress}
              >
                <XCircle className="w-6 h-6" />
              </motion.button>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {isEditing ? 'Edit Appliance' : 'Add New Appliance'}
              </h2>
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">Appliance Type <span className="text-red-500">*</span></label>
                  <motion.select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  >
                    <option value="">Select Type</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Washing Machine">Washing Machine</option>
                    <option value="Dishwasher">Dishwasher</option>
                    <option value="Air Conditioner">Air Conditioner</option>
                    <option value="Heater">Heater</option>
                    <option value="Television">Television</option>
                    <option value="Oven">Oven</option>
                    <option value="Microwave">Microwave</option>
                    <option value="Water Heater">Water Heater</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Other">Other</option>
                  </motion.select>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modelName">Model Name (Optional)</label>
                  <motion.input
                    type="text"
                    id="modelName"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., Samsung RT20"
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ageYears">Age (Years) <span className="text-red-500">*</span></label>
                  <motion.input
                    type="number"
                    id="ageYears"
                    name="ageYears"
                    value={formData.ageYears}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., 5"
                    min="0"
                    required
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="purchaseDate">Purchase Date (Optional)</label>
                  <motion.input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  />
                </motion.div>

                {/* Energy Star Rating Dropdown - MODIFIED */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="energyStarRating">Energy Star Rating <span className="text-red-500">*</span></label>
                  <motion.select
                    id="energyStarRating"
                    name="energyStarRating"
                    value={formData.energyStarRating}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  >
                    <option value="">Select Rating</option>
                    {energyStarRatings.map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </motion.select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="powerConsumptionWatts">Power Consumption (Watts) <span className="text-red-500">*</span></label>
                  <motion.input
                    type="number"
                    id="powerConsumptionWatts"
                    name="powerConsumptionWatts"
                    value={formData.powerConsumptionWatts}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., 150"
                    step="0.1"
                    required
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  />
                </motion.div>

                {/* Energy Efficiency Rating Dropdown - MODIFIED */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="energyEfficiencyRating">Energy Efficiency Rating (Optional)</label>
                  <motion.select
                    id="energyEfficiencyRating"
                    name="energyEfficiencyRating"
                    value={formData.energyEfficiencyRating}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  >
                    <option value="">Select Grade</option>
                    {energyEfficiencyGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </motion.select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="averageDailyUsageHours">Avg. Daily Usage (Hours) <span className="text-red-500">*</span></label>
                  <motion.input
                    type="number"
                    id="averageDailyUsageHours"
                    name="averageDailyUsageHours"
                    value={formData.averageDailyUsageHours}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., 8.5"
                    step="0.1"
                    min="0"
                    max="24"
                    required
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="capacity">Capacity (Optional)</label>
                  <motion.input
                    type="text"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., 500L, 7kg"
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.2)" }}
                  />
                </motion.div>

                <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
                  <motion.button
                    type="button"
                    onClick={handleCloseApplianceFormModal}
                    className="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={buttonPress}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={buttonPress}
                  >
                    {isSubmitting ? (
                      <motion.svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </motion.svg>
                    ) : (
                      <>
                        <span>{isEditing ? 'Update Appliance' : 'Add Appliance'}</span>
                        {isEditing ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Appliances</h1>
        <p className="text-gray-600">Monitor and manage your household appliances and their energy consumption.</p>
      </div>

      {/* Summary Cards */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appliances</p>
              <p className="text-2xl font-bold text-text-primary">{appliances.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <Plug className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-green-600">{activeAppliancesCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Monthly Cost</p>
              <p className="text-2xl font-bold text-text-primary">${totalMonthlyCost.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Daily Usage</p>
              <p className="text-2xl font-bold text-text-primary">{avgDailyUsageHours}h</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add New Appliance Button */}
      <motion.div variants={itemVariants} className="mb-6">
        <motion.button
          onClick={handleOpenAddApplianceModal}
          className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200"
          whileHover={{ scale: 1.03, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}
          whileTap={buttonPress}
        >
          <Plus className="w-5 h-5" />
          <span>Add New Appliance</span>
        </motion.button>
      </motion.div>

      {/* Appliances Grid */}
      {isLoadingAppliances ? (
        <div className="flex items-center justify-center py-20 text-gray-600">
          <motion.svg className="animate-spin h-8 w-8 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </motion.svg>
          Loading appliances...
        </div>
      ) : appliances.length > 0 ? (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {appliances.map((appliance) => (
            <motion.div
              key={appliance.id}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl flex-shrink-0">
                    {/* Using icons based on type, or default Plug icon */}
                    {appliance.type === 'Refrigerator' && '🧊'}
                    {appliance.type === 'Washing Machine' && '🌊'}
                    {appliance.type === 'Dishwasher' && '🍽️'}
                    {appliance.type === 'Air Conditioner' && '❄️'}
                    {appliance.type === 'Heater' && '🔥'}
                    {appliance.type === 'Television' && '📺'}
                    {appliance.type === 'Oven' && '🍕'}
                    {appliance.type === 'Microwave' && '♨️'}
                    {appliance.type === 'Water Heater' && '🛁'}
                    {appliance.type === 'Lighting' && '💡'}
                    {appliance.type === 'Other' && '⚙️'}
                    {!appliance.type || !['Refrigerator', 'Washing Machine', 'Dishwasher', 'Air Conditioner', 'Heater', 'Television', 'Oven', 'Microwave', 'Water Heater', 'Lighting', 'Other'].includes(appliance.type) ? <Plug className="w-8 h-8 text-blue-500" /> : null}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary leading-tight">{appliance.modelName || appliance.type || 'Unnamed Appliance'}</h3>
                    <p className="text-sm text-gray-500">{appliance.type || 'Appliance'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <motion.button
                    onClick={() => handleEdit(appliance)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Edit Appliance"
                    whileHover={{ scale: 1.1 }}
                    whileTap={buttonPress}
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteConfirm(appliance.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete Appliance"
                    whileHover={{ scale: 1.1 }}
                    whileTap={buttonPress}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center space-x-1"><Power className="w-4 h-4 text-gray-500" /> <span className="font-medium">Power:</span></span>
                  <span className="font-semibold text-text-primary">{appliance.powerConsumptionWatts ? `${appliance.powerConsumptionWatts}W` : 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center space-x-1"><Clock className="w-4 h-4 text-gray-500" /> <span className="font-medium">Daily Usage:</span></span>
                  <span className="font-semibold text-text-primary">{appliance.averageDailyUsageHours ? `${appliance.averageDailyUsageHours}h` : 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-500" /> <span className="font-medium">Est. Monthly Cost:</span></span>
                  <span className="font-semibold text-primary">
                    {appliance.powerConsumptionWatts && appliance.averageDailyUsageHours
                      ? `$${((appliance.powerConsumptionWatts / 1000) * appliance.averageDailyUsageHours * 30 * 0.12).toFixed(2)}`
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center space-x-1"><CalendarDays className="w-4 h-4 text-gray-500" /> <span className="font-medium">Age:</span></span>
                  <span className="font-semibold text-text-primary">{appliance.ageYears ? `${appliance.ageYears} years` : (appliance.purchaseDate ? `${new Date().getFullYear() - new Date(appliance.purchaseDate).getFullYear()} years` : 'N/A')}</span>
                </div>
                {appliance.capacity && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center space-x-1"><Sun className="w-4 h-4 text-gray-500" /> <span className="font-medium">Capacity:</span></span>
                    <span className="font-semibold text-text-primary">{appliance.capacity}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-2 pt-4 border-t border-gray-100">
                {appliance.energyEfficiencyRating && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getEfficiencyColor(appliance.energyEfficiencyRating)}`}>
                    {appliance.energyEfficiencyRating}
                  </span>
                )}
                {appliance.energyStarRating && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center space-x-1`}>
                    <Star className="w-3 h-3 fill-current text-blue-500" /><span>{appliance.energyStarRating}</span>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-gray-500">
          <Plug className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-medium mb-2">No appliances found.</p>
          <p className="text-md">Click "Add New Appliance" to get started tracking your devices!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Appliances;