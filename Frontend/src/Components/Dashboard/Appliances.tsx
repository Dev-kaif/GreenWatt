/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Appliances.tsx
import React, { useState, useEffect} from 'react';
import { Plug, Zap, Clock, DollarSign, Plus, Edit, Trash2, XCircle, CheckCircle, CalendarDays, Star, Power, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';

// MessageBox component (re-used for consistency)
const MessageBox = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
    <div className={`bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center ${type === "success" ? "border-green-500" : "border-red-500"} border-2`}>
      <p className={`text-lg font-semibold mb-4 ${type === "success" ? "text-green-700" : "text-red-700"}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${type === "success" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`}
      >
        OK
      </button>
    </div>
  </div>
);

// ConfirmationModal component (re-used for consistency)
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center border border-gray-200">
      <p className="text-xl font-semibold text-gray-800 mb-6">{message}</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// Animation variants (re-used for consistency)
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Appliances = () => {
  const [appliances, setAppliances] = useState<any[]>([]);
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

      let response;
      if (isEditing && currentApplianceId) {
        response = await axiosInstance.put(`/api/appliances/${currentApplianceId}`, payload);
        setSuccessMessage("Appliance updated successfully!");
      } else {
        // Basic validation for type, as it's required by backend
        if (!payload.type) {
          setError("Appliance Type is required.");
          setIsSubmitting(false);
          return;
        }
        response = await axiosInstance.post('/api/appliances', payload);
        setSuccessMessage("Appliance added successfully!");
      }
      console.log('Appliance operation successful:', response.data);

      await fetchAppliances(); // Refresh the list
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
  const handleEdit = (appliance: any) => {
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
      const response = await axiosInstance.delete(`/api/appliances/${itemToDeleteId}`);
      console.log('Appliance deleted:', response.data);
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
    // Form reset handled within handleFormSubmit on success
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

  // const getStatusColor = (status: string) => {
  //   return status === 'active'
  //     ? 'bg-green-100 text-green-800'
  //     : 'bg-gray-100 text-gray-800';
  // };

  // Calculate summary stats (use actual fetched data)
  const totalMonthlyCost = appliances.reduce((sum, appliance) => sum + (appliance.powerConsumptionWatts && appliance.averageDailyUsageHours ? ((appliance.powerConsumptionWatts / 1000) * appliance.averageDailyUsageHours * 30 * 0.12) : 0), 0); // Assuming $0.12/kWh
  const activeAppliancesCount = appliances.filter(app => app.status === 'active').length;
  const totalDailyUsageHours = appliances.reduce((sum, app) => sum + (app.averageDailyUsageHours || 0), 0);
  const avgDailyUsageHours = appliances.length > 0 ? (totalDailyUsageHours / appliances.length).toFixed(1) : '0';


  return (
    <motion.div variants={fadeInUp} className="animate-fade-in p-4">
      {/* Message Boxes */}
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
      {showConfirmModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this appliance?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Appliance Form Modal */}
      {showApplianceFormModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative"
          >
            <button
              onClick={handleCloseApplianceFormModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {isEditing ? 'Edit Appliance' : 'Add New Appliance'}
            </h2>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Appliance Type (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">Appliance Type <span className="text-red-500">*</span></label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  required
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
                </select>
              </div>
              {/* Model Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="modelName">Model Name</label>
                <input
                  type="text"
                  id="modelName"
                  name="modelName"
                  value={formData.modelName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  placeholder="e.g., Samsung RT20"
                />
              </div>
              {/* Age (Years) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ageYears">Age (Years)</label>
                <input
                  type="number"
                  id="ageYears"
                  name="ageYears"
                  value={formData.ageYears}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>
              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="purchaseDate">Purchase Date</label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                />
              </div>
              {/* Energy Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="energyStarRating">Energy Star Rating</label>
                <input
                  type="text"
                  id="energyStarRating"
                  name="energyStarRating"
                  value={formData.energyStarRating}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  placeholder="e.g., 5-star"
                />
              </div>
              {/* Power Consumption (Watts) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="powerConsumptionWatts">Power Consumption (Watts)</label>
                <input
                  type="number"
                  id="powerConsumptionWatts"
                  name="powerConsumptionWatts"
                  value={formData.powerConsumptionWatts}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  placeholder="e.g., 150"
                  step="0.1"
                />
              </div>
              {/* Energy Efficiency Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="energyEfficiencyRating">Energy Efficiency Rating</label>
                <input
                  type="text"
                  id="energyEfficiencyRating"
                  name="energyEfficiencyRating"
                  value={formData.energyEfficiencyRating}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  placeholder="e.g., A++, B"
                />
              </div>
              {/* Average Daily Usage Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="averageDailyUsageHours">Avg. Daily Usage (Hours)</label>
                <input
                  type="number"
                  id="averageDailyUsageHours"
                  name="averageDailyUsageHours"
                  value={formData.averageDailyUsageHours}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  placeholder="e.g., 8.5"
                  step="0.1"
                />
              </div>
              {/* Capacity */}
              <div className="md:col-span-2"> {/* Span full width for capacity if needed */}
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="capacity">Capacity</label>
                <input
                  type="text"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  placeholder="e.g., 500L, 7kg"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseApplianceFormModal}
                  className="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-green-600 transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>{isEditing ? 'Update Appliance' : 'Add Appliance'}</span>
                      {isEditing ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Appliances</h1>
        <p className="text-gray-600">Monitor and manage your household appliances and their energy consumption.</p>
      </div>

      {/* Summary Cards */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appliances</p>
              <p className="text-2xl font-bold text-text-primary">{appliances.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Plug className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-green-600">{activeAppliancesCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Monthly Cost</p>
              <p className="text-2xl font-bold text-text-primary">${totalMonthlyCost.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Daily Usage</p>
              <p className="text-2xl font-bold text-text-primary">{avgDailyUsageHours}h</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add New Appliance Button */}
      <motion.div variants={fadeInUp} className="mb-6">
        <button
          onClick={handleOpenAddApplianceModal}
          className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Appliance</span>
        </button>
      </motion.div>

      {/* Appliances Grid */}
      {isLoadingAppliances ? (
        <div className="flex items-center justify-center py-20 text-gray-600">
          <svg className="animate-spin h-8 w-8 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading appliances...
        </div>
      ) : appliances.length > 0 ? (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliances.map((appliance, index) => (
            <motion.div
              key={appliance.id}
              variants={fadeInUp}
              className="bg-white rounded-2xl shadow-card p-6 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }} // Adjusted delay
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {/* Using icons based on type, or default Plug icon */}
                  <div className="text-3xl">
                    {appliance.type === 'Refrigerator' && '🧊'}
                    {appliance.type === 'Washing Machine' && '🌊'}
                    {appliance.type === 'Air Conditioner' && '❄️'}
                    {appliance.type === 'Television' && '📺'}
                    {appliance.type === 'Dishwasher' && '🍽️'}
                    {appliance.type === 'Heater' && '🔥'}
                    {appliance.type === 'Oven' && '🍕'}
                    {appliance.type === 'Microwave' && '♨️'}
                    {appliance.type === 'Water Heater' && '🛁'}
                    {appliance.type === 'Lighting' && '💡'}
                    {appliance.type === 'Other' && '⚙️'}
                    {/* Fallback to Plug icon if no specific emoji/icon for type */}
                    {!appliance.type || !['Refrigerator', 'Washing Machine', 'Air Conditioner', 'Television', 'Dishwasher', 'Heater', 'Oven', 'Microwave', 'Water Heater', 'Lighting', 'Other'].includes(appliance.type) ? <Plug className="w-8 h-8 text-blue-500" /> : null}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{appliance.modelName || appliance.type || 'N/A'}</h3> {/* Use modelName first, then type */}
                    <p className="text-sm text-gray-500">{appliance.type || 'Appliance'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(appliance)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Edit Appliance"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(appliance.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete Appliance"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center space-x-1"><Power className="w-4 h-4" /> <span>Power:</span></span>
                  <span className="font-semibold text-text-primary">{appliance.powerConsumptionWatts ? `${appliance.powerConsumptionWatts}W` : 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center space-x-1"><Clock className="w-4 h-4" /> <span>Daily Usage:</span></span>
                  <span className="font-semibold text-text-primary">{appliance.averageDailyUsageHours ? `${appliance.averageDailyUsageHours}h` : 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center space-x-1"><DollarSign className="w-4 h-4" /> <span>Est. Monthly Cost:</span></span>
                  {/* Simple estimate: (watts / 1000) * hours/day * 30 days * $0.12/kWh */}
                  <span className="font-semibold text-green-primary">
                    {appliance.powerConsumptionWatts && appliance.averageDailyUsageHours
                      ? `$${((appliance.powerConsumptionWatts / 1000) * appliance.averageDailyUsageHours * 30 * 0.12).toFixed(2)}`
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center space-x-1"><CalendarDays className="w-4 h-4" /> <span>Age:</span></span>
                  <span className="font-semibold text-text-primary">{appliance.ageYears ? `${appliance.ageYears} years` : (appliance.purchaseDate ? `${new Date().getFullYear() - new Date(appliance.purchaseDate).getFullYear()} years` : 'N/A')}</span>
                </div>
                {appliance.capacity && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center space-x-1"><Sun className="w-4 h-4" /> <span>Capacity:</span></span>
                    <span className="font-semibold text-text-primary">{appliance.capacity}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {appliance.energyEfficiencyRating && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(appliance.energyEfficiencyRating)}`}>
                      {appliance.energyEfficiencyRating}
                    </span>
                  )}
                  {appliance.energyStarRating && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center space-x-1`}>
                      <Star className="w-3 h-3 fill-current" /><span>{appliance.energyStarRating}</span>
                    </span>
                  )}
                  {/* Status is not in backend schema for Appliance */}
                  {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appliance.status)}`}>
                    {appliance.status}
                  </span> */}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-20 text-center text-gray-500">
          <p>No appliances found. Click "Add New Appliance" to get started!</p>
        </div>
      )}
    </motion.div>
  );
};

export default Appliances;