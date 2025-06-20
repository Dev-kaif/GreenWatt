/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/DataEntry.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Zap, UploadCloud, BarChart2, Edit, Trash2, XCircle, CheckCircle } from 'lucide-react';
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

// ConfirmationModal component
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

const DataEntry = () => {
  const [formData, setFormData] = useState({
    id: null as string | null, // Added for edit functionality
    date: new Date().toISOString().split('T')[0],
    consumptionKWH: '',
    emissionCO2kg: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [isFetchingEntries, setIsFetchingEntries] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  // Message states
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  // Ref to scroll to the form section
  const formRef = React.useRef<HTMLDivElement>(null);

  // --- Function to fetch recent meter readings ---
  const fetchRecentEntries = async () => {
    setIsFetchingEntries(true);
    setFetchError(null);
    try {
      const response = await axiosInstance.get('/api/meter-readings', {
        params: {
          limit: 5,
          sort: 'readingDate',
          order: 'desc'
        }
      });

      const formattedEntries = response.data.readings.map((entry: any) => ({
        ...entry,
        // Format the date for display (backend returns ISO string)
        readingDate: new Date(entry.readingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        // Also keep the original date for form pre-population on edit
        originalDateString: new Date(entry.readingDate).toISOString().split('T')[0],
      }));
      setRecentEntries(formattedEntries);
    } catch (err: any) {
      console.error("Failed to fetch recent entries:", err);
      setFetchError("Failed to load recent entries. Please check your connection.");
    } finally {
      setIsFetchingEntries(false);
    }
  };

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  // --- Handle Manual Form Submission (Add/Update) ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!formData.date || !formData.consumptionKWH) {
        setSubmissionError("Date and Consumption (kWh) are required for manual entry.");
        setIsSubmitting(false);
        return;
    }

    try {
      const dataToSend = {
        readingDate: formData.date,
        consumptionKWH: parseFloat(formData.consumptionKWH),
        emissionCO2kg: formData.emissionCO2kg ? parseFloat(formData.emissionCO2kg) : undefined,
        source: 'manual',
      };

      let response;
      if (isEditing && formData.id) {
        response = await axiosInstance.put(`/api/meter-readings/${formData.id}`, dataToSend);
        setSuccessMessage("Energy data updated successfully!");
      } else {
        response = await axiosInstance.post('/api/meter-readings', dataToSend);
        setSuccessMessage("Energy data saved successfully!");
      }
      console.log('Meter reading operation successful:', response.data);


      fetchRecentEntries(); // Refresh entries
      handleCancelEdit(); // Reset form and exit edit mode

    } catch (err: any) {
      console.error('Error saving/updating energy data:', err);
      if (err.response) {
        setSubmissionError(err.response.data.message || 'Failed to save data. Please check your input.');
      } else if (err.request) {
        setSubmissionError('No response from server. Please try again later.');
      } else {
        setSubmissionError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' && value !== '' ? parseFloat(value) : value,
    }));
  };

  // --- Handle CSV Upload ---
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleCsvUploadSubmit = async () => {
    setSubmissionError(null);
    setSuccessMessage(null);
    setIsUploadingCsv(true);

    if (!selectedFile) {
      setSubmissionError("Please select a CSV file to upload.");
      setIsUploadingCsv(false);
      return;
    }

    const formDataToUpload = new FormData(); // Use a different name to avoid conflict
    formDataToUpload.append('csvFile', selectedFile); // 'csvFile' should match the name expected by Multer

    try {
      const response = await axiosInstance.post('/api/meter-readings/upload-csv', formDataToUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('CSV Upload successful:', response.data);
      setSuccessMessage(response.data.message || 'CSV data uploaded successfully!');

      fetchRecentEntries(); // Refresh entries
      setSelectedFile(null); // Clear selected file

    } catch (err: any) {
      console.error('Error uploading CSV:', err);
      if (err.response) {
        const backendErrors = err.response.data.errors ? err.response.data.errors.join(', ') : '';
        setSubmissionError(err.response.data.message + (backendErrors ? `: ${backendErrors}` : '') || 'Failed to upload CSV. Please check the file format.');
      } else if (err.request) {
        setSubmissionError('No response from server. Please try again later.');
      } else {
        setSubmissionError('An unexpected error occurred during CSV upload.');
      }
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // --- Handle Edit Functionality ---
  const handleEdit = (entry: any) => {
    setIsEditing(true);
    setFormData({
      id: entry.id,
      date: entry.originalDateString, // Use the YYYY-MM-DD string for input value
      consumptionKWH: entry.consumptionKWH.toString(), // Convert number to string for input
      emissionCO2kg: entry.emissionCO2kg?.toString() || '', // Convert to string, handle null/undefined
    });
    setSubmissionError(null); // Clear any previous submission errors
    setSuccessMessage(null); // Clear any previous success messages
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- Handle Cancel Edit ---
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      date: new Date().toISOString().split('T')[0],
      consumptionKWH: '',
      emissionCO2kg: '',
    });
    setSubmissionError(null); // Clear errors when canceling
    setSuccessMessage(null); // Clear success messages when canceling
  };

  // --- Handle Delete Confirmation ---
  const handleDeleteConfirm = (id: string) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  };

  // --- Handle Actual Delete ---
  const handleDelete = async () => {
    setShowConfirmModal(false); // Close modal
    if (!itemToDeleteId) return;

    setSubmissionError(null);
    setSuccessMessage(null);
    setIsSubmitting(true); // Use submitting state for delete as well

    try {
      const response = await axiosInstance.delete(`/api/meter-readings/${itemToDeleteId}`);
      console.log('Meter reading deleted:', response.data);
      setSuccessMessage("Entry deleted successfully!");
      fetchRecentEntries(); // Refresh list after deletion
    } catch (err: any) {
      console.error('Error deleting meter reading:', err);
      if (err.response) {
        setSubmissionError(err.response.data.message || 'Failed to delete entry.');
      } else if (err.request) {
        setSubmissionError('No response from server. Please try again later.');
      } else {
        setSubmissionError('An unexpected error occurred during deletion.');
      }
    } finally {
      setIsSubmitting(false);
      setItemToDeleteId(null); // Clear the ID to delete
    }
  };

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
      {submissionError && (
        <MessageBox
          message={submissionError}
          type="error"
          onClose={() => setSubmissionError(null)}
        />
      )}
      {fetchError && (
        <MessageBox
          message={fetchError}
          type="error"
          onClose={() => setFetchError(null)}
        />
      )}
      {showConfirmModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this entry?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Data Entry</h1>
        <p className="text-gray-600">Record your daily energy consumption data to track your usage patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section - Manual Entry */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-card p-6" ref={formRef}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">
              {isEditing ? 'Edit Energy Data' : 'Manual Energy Data Entry'}
            </h2>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="date">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleManualChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="consumptionKWH">Electricity Consumption (kWh)</label>
                <input
                  type="number"
                  id="consumptionKWH"
                  name="consumptionKWH"
                  value={formData.consumptionKWH}
                  onChange={handleManualChange}
                  placeholder="e.g., 25.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="emissionCO2kg">Estimated CO2 Emission (kg)</label>
                <input
                  type="number"
                  id="emissionCO2kg"
                  name="emissionCO2kg"
                  value={formData.emissionCO2kg}
                  onChange={handleManualChange}
                  placeholder="e.g., 12.3 (Optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                  step="0.1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>{isEditing ? 'Update Entry' : 'Save Energy Data'}</span>
                  {isEditing ? <CheckCircle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                </>
              )}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="w-full mt-2 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>Cancel Edit</span>
              </button>
            )}
          </form>
        </motion.div>

        {/* CSV Upload Section */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center space-x-3">
                <UploadCloud className="w-6 h-6 text-blue-500" />
                <span>Upload CSV Data</span>
            </h2>
            <p className="text-gray-600 mb-4">Upload multiple meter readings at once using a CSV file. Ensure your CSV has columns named <code className="bg-gray-100 p-1 rounded font-mono">readingDate</code> (YYYY-MM-DD), <code className="bg-gray-100 p-1 rounded font-mono">consumptionKWH</code>, <code className="bg-gray-100 p-1 rounded font-mono">emissionCO2kg</code> (optional), and <code className="bg-gray-100 p-1 rounded font-mono">source</code> (optional).</p>
            <input
              type="file"
              accept=".csv"
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={handleCsvFileChange}
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">Selected file: <span className="font-medium">{selectedFile.name}</span></p>
            )}
            <button
              onClick={handleCsvUploadSubmit}
              disabled={isUploadingCsv || !selectedFile}
              className="w-full mt-4 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUploadingCsv ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                <>
                  <span>Upload CSV</span>
                  <UploadCloud className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              <span className="font-semibold">Note:</span> CSV columns must exactly match: <code className="bg-gray-200 p-1 rounded font-mono">readingDate</code>, <code className="bg-gray-200 p-1 rounded font-mono">consumptionKWH</code>, <code className="bg-gray-200 p-1 rounded font-mono">emissionCO2kg</code> (optional), <code className="bg-gray-200 p-1 rounded font-mono">source</code> (optional).
            </p>
        </motion.div>

        {/* Recent Entries */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Recent Entries</h2>
          </div>

          {isFetchingEntries ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fetching entries...
            </div>
          ) : recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map((entry: any) => (
                <motion.div
                  key={entry.id}
                  variants={fadeInUp}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-text-primary">{entry.readingDate}</span>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Source: {entry.source || 'Manual'}</span>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit entry"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(entry.id)}
                        className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Consumption:</span>
                      <span className="block font-semibold text-text-primary">{entry.consumptionKWH || 0} kWh</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Emissions:</span>
                      <span className="block font-semibold text-text-primary">{entry.emissionCO2kg || 0} kg CO2</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              <p>No recent entries found. Start by adding your first reading or upload a CSV!</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DataEntry;