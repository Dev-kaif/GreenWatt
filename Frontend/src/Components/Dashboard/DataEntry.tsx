/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/DataEntry.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  Zap,
  UploadCloud,
  BarChart2,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  Square,
  CheckSquare,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import axiosInstance from "../../utils/axios";

// --- Utility function to calculate date ranges ---
const getDateRangeForPeriod = (
  period: string
): { startDate: string | null; endDate: string | null } => {
  const today = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  switch (period) {
    case "all":
      startDate = null;
      endDate = null;
      break;
    case "this_year":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
    case "last_year":
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31);
      break;
    case "last_3_months":
      startDate = new Date();
      startDate.setMonth(today.getMonth() - 2);
      startDate.setDate(1);
      endDate = today;
      break;
    case "last_6_months":
      startDate = new Date();
      startDate.setMonth(today.getMonth() - 5);
      startDate.setDate(1);
      endDate = today;
      break;
    case "last_12_months":
      startDate = new Date();
      startDate.setFullYear(today.getFullYear() - 1);
      startDate.setMonth(today.getMonth());
      startDate.setDate(today.getDate());
      endDate = today;
      break;
    default:
      startDate = null;
      endDate = null;
      break;
  }

  return {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
};

// MessageBox component (with AnimatePresence for exit animation)
const MessageBox = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ duration: 0.2 }}
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
  </motion.div>
);

// ConfirmationModal component (with AnimatePresence for exit animation)
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmButtonText = "Confirm",
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
  >
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
          {confirmButtonText}
        </button>
      </div>
    </div>
  </motion.div>
);

// Animation variants for the main page layout (for sections like forms and recent entries)
const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren", // Animate parent first, then children
      staggerChildren: 0.1, // Stagger child sections (forms, recent entries section)
    },
  },
};

// Variants for main sections (manual entry, csv upload, recent entries)
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// Variants for the list of entries container (to apply stagger to its children)
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 1,
    },
  },
};

// Item variants for individual entries in the list
const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98, filter: "blur(1.5px)" }, // Subtle blur + slight move/scale on entry
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)", // Clear the blur once visible
    transition: {
      type: "spring",
      stiffness: 120, // Controls how "stiff" the spring is (faster initial movement)
      damping: 15, // Controls how much the spring is "damped" (less oscillation)
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.98,
    filter: "blur(1.5px)", // Subtle blur + slight move/scale on exit
    transition: {
      duration: 0.15, // Quick exit transition
    },
  },
};

// Variants for the bulk action bar
const bulkActionVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.15,
    },
  },
};

const DataEntry = () => {
  const [formData, setFormData] = useState({
    id: null as string | null,
    date: new Date().toISOString().split("T")[0],
    consumptionKWH: "",
    emissionCO2kg: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [isFetchingEntries, setIsFetchingEntries] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [filterPeriod, setFilterPeriod] = useState<
    | "all"
    | "this_year"
    | "last_year"
    | "last_3_months"
    | "last_6_months"
    | "last_12_months"
  >("all");
  const [filterSource, setFilterSource] = useState<
    "" | "manual" | "csv_upload"
  >("");

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [areAllSelected, setAreAllSelected] = useState(false);

  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  const formRef = useRef<HTMLDivElement>(null);

  const fetchRecentEntries = useCallback(async () => {
    setIsFetchingEntries(true);
    setFetchError(null);
    try {
      const { startDate, endDate } = getDateRangeForPeriod(filterPeriod);

      const params: any = {
        sort: "readingDate",
        order: "desc",
      };

      // Only apply limit if filterPeriod is NOT 'all'
      if (filterPeriod !== "all") {
        params.limit = 5; // You can adjust this default limit as needed for specific periods
      }

      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }
      if (filterSource) {
        params.source = filterSource;
      }

      const response = await axiosInstance.get("/api/meter-readings", {
        params,
      });

      const formattedEntries = response.data.readings.map((entry: any) => ({
        ...entry,
        readingDate: new Date(entry.readingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        originalDateString: new Date(entry.readingDate)
          .toISOString()
          .split("T")[0],
      }));
      setRecentEntries(formattedEntries);
      // Reset selected entries and "select all" status when new entries are fetched
      setSelectedEntryIds([]);
      setAreAllSelected(false);
    } catch (err: any) {
      console.error("Failed to fetch recent entries:", err);
      setFetchError(
        "Failed to load recent entries. Please check your connection or filter settings."
      );
    } finally {
      setIsFetchingEntries(false);
    }
  }, [filterPeriod, filterSource]);

  useEffect(() => {
    fetchRecentEntries();
  }, [fetchRecentEntries]);

  // Effect to update "Select All" checkbox state
  useEffect(() => {
    // Only set true if there are entries AND all are selected
    setAreAllSelected(
      recentEntries.length > 0 &&
        selectedEntryIds.length === recentEntries.length
    );
  }, [selectedEntryIds, recentEntries]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!formData.date || !formData.consumptionKWH) {
      setSubmissionError(
        "Date and Consumption (kWh) are required for manual entry."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const dataToSend: {
        readingDate?: string;
        consumptionKWH: number;
        emissionCO2kg?: number;
        source?: string;
      } = {
        consumptionKWH: parseFloat(formData.consumptionKWH),
        emissionCO2kg: formData.emissionCO2kg
          ? parseFloat(formData.emissionCO2kg)
          : undefined,
        source: "manual",
      };

      let response;
      if (isEditing && formData.id) {
        response = await axiosInstance.put(
          `/api/meter-readings/${formData.id}`,
          dataToSend
        );
        setSuccessMessage("Energy data updated successfully!");
      } else {
        dataToSend.readingDate = formData.date;
        response = await axiosInstance.post("/api/meter-readings", dataToSend);
        setSuccessMessage("Energy data saved successfully!");
      }
      console.log("Meter reading operation successful:", response.data);

      fetchRecentEntries();
      handleCancelEdit();
    } catch (err: any) {
      console.error("Error saving/updating energy data:", err);
      if (err.response) {
        setSubmissionError(
          err.response.data.message ||
            "Failed to save data. Please check your input."
        );
      } else if (err.request) {
        setSubmissionError("No response from server. Please try again later.");
      } else {
        setSubmissionError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    const formDataToUpload = new FormData();
    formDataToUpload.append("csvFile", selectedFile);

    try {
      const response = await axiosInstance.post(
        "/api/meter-readings/upload-csv",
        formDataToUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("CSV Upload successful:", response.data);
      setSuccessMessage(
        response.data.message || "CSV data uploaded successfully!"
      );

      fetchRecentEntries();
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Error uploading CSV:", err);
      if (err.response) {
        const backendErrors = err.response.data.errors
          ? err.response.data.errors.join(", ")
          : "";
        setSubmissionError(
          err.response.data.message +
            (backendErrors ? `: ${backendErrors}` : "") ||
            "Failed to upload CSV. Please check the file format."
        );
      } else if (err.request) {
        setSubmissionError("No response from server. Please try again later.");
      } else {
        setSubmissionError("An unexpected error occurred during CSV upload.");
      }
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const handleEdit = (entry: any) => {
    setIsEditing(true);
    setFormData({
      id: entry.id,
      date: entry.originalDateString,
      consumptionKWH: entry.consumptionKWH?.toString() || "",
      emissionCO2kg: entry.emissionCO2kg?.toString() || "",
    });
    setSubmissionError(null);
    setSuccessMessage(null);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      date: new Date().toISOString().split("T")[0],
      consumptionKWH: "",
      emissionCO2kg: "",
    });
    setSubmissionError(null);
    setSuccessMessage(null);
  };

  const handleDeleteConfirm = (id: string) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDeleteId) return;

    setSubmissionError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.delete(
        `/api/meter-readings/${itemToDeleteId}`
      );
      console.log("Meter reading deleted:", response.data);
      setSuccessMessage("Entry deleted successfully!");
      fetchRecentEntries();
    } catch (err: any) {
      console.error("Error deleting meter reading:", err);
      if (err.response) {
        setSubmissionError(
          err.response.data.message || "Failed to delete entry."
        );
      } else if (err.request) {
        setSubmissionError("No response from server. Please try again later.");
      } else {
        setSubmissionError("An unexpected error occurred during deletion.");
      }
    } finally {
      setIsSubmitting(false);
      setItemToDeleteId(null);
    }
  };

  const handleSelectEntry = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedEntryIds((prev) => [...prev, id]);
    } else {
      setSelectedEntryIds((prev) => prev.filter((entryId) => entryId !== id));
    }
  };

  const handleToggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedEntryIds([]);
    } else {
      setSelectedEntryIds(recentEntries.map((entry) => entry.id));
    }
  };

  const handleDeleteSelectedConfirm = () => {
    if (selectedEntryIds.length === 0) return;
    setShowConfirmModal(true);
  };

  const handleBulkDelete = async () => {
    setShowConfirmModal(false);

    if (selectedEntryIds.length === 0) return;

    setSubmissionError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.delete("/api/meter-readings/bulk", {
        data: { ids: selectedEntryIds },
      });
      console.log("Bulk delete successful:", response.data);
      setSuccessMessage(
        `${
          response.data.deletedCount || selectedEntryIds.length
        } entries deleted successfully!`
      );
      setSelectedEntryIds([]);
      fetchRecentEntries();
    } catch (err: any) {
      console.error("Error deleting entries in bulk:", err);
      if (err.response) {
        setSubmissionError(
          err.response.data.message || "Failed to delete selected entries."
        );
      } else if (err.request) {
        setSubmissionError("No response from server. Please try again later.");
      } else {
        setSubmissionError(
          "An unexpected error occurred during bulk deletion."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConfirmAction = itemToDeleteId ? handleDelete : handleBulkDelete;
  const currentConfirmMessage = itemToDeleteId
    ? "Are you sure you want to delete this entry?"
    : `Are you sure you want to delete ${selectedEntryIds.length} selected entries?`;
  const currentConfirmButtonText = itemToDeleteId
    ? "Confirm Delete"
    : "Delete Selected";

  return (
    <motion.div
      variants={pageContainerVariants} // Apply page-level container variants
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 lg:p-8"
    >
      {/* Message Boxes and Modals */}
      <AnimatePresence>
        {successMessage && (
          <MessageBox
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage(null)}
            key="success-msg"
          />
        )}
        {submissionError && (
          <MessageBox
            message={submissionError}
            type="error"
            onClose={() => setSubmissionError(null)}
            key="submission-err"
          />
        )}
        {fetchError && (
          <MessageBox
            message={fetchError}
            type="error"
            onClose={() => setFetchError(null)}
            key="fetch-err"
          />
        )}
        {showConfirmModal && (
          <ConfirmationModal
            message={currentConfirmMessage}
            onConfirm={() => {
              if (itemToDeleteId) {
                currentConfirmAction();
              } else if (selectedEntryIds.length > 0) {
                currentConfirmAction();
              }
              setItemToDeleteId(null);
            }}
            onCancel={() => {
              setShowConfirmModal(false);
              setItemToDeleteId(null);
            }}
            confirmButtonText={currentConfirmButtonText}
            key="confirm-modal"
          />
        )}
      </AnimatePresence>

      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Data Entry
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto lg:mx-0">
          Record your daily energy consumption data to track your usage patterns
          and carbon footprint.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Manual Entry Form */}
        <motion.div
          variants={sectionVariants} // Individual section animation
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
          ref={formRef}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">
              {isEditing ? "Edit Energy Data" : "Manual Energy Data Entry"}
            </h2>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="date"
              >
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleManualChange}
                  disabled={isEditing}
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm transition-all focus:outline-none focus:border-primary-light ${
                    isEditing
                      ? "bg-gray-100 cursor-not-allowed border-gray-300"
                      : "border-gray-300"
                  }`}
                  required
                />
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold">Note:</span> Date cannot be
                  changed for an existing entry.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="consumptionKWH"
                >
                  Electricity Consumption (kWh)
                </label>
                <input
                  type="number"
                  id="consumptionKWH"
                  name="consumptionKWH"
                  value={formData.consumptionKWH}
                  onChange={handleManualChange}
                  placeholder="e.g., 25.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm transition-all focus:outline-none focus:border-primary-light"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="emissionCO2kg"
                >
                  Estimated CO2 Emission (kg)
                </label>
                <input
                  type="number"
                  id="emissionCO2kg"
                  name="emissionCO2kg"
                  value={formData.emissionCO2kg}
                  onChange={handleManualChange}
                  placeholder="e.g., 12.3 (Optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm transition-all focus:outline-none focus:border-primary-light"
                  step="0.1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-2.5 px-4 rounded-xl font-medium hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                  <span>{isEditing ? "Update Entry" : "Save Data"}</span>
                  {isEditing ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="w-full mt-2 bg-gray-200 text-gray-800 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm shadow-md hover:shadow-lg"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Edit</span>
              </button>
            )}
          </form>
        </motion.div>

        {/* CSV Upload Section */}
        <motion.div
          variants={sectionVariants} // Individual section animation
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center space-x-3">
            <UploadCloud className="w-6 h-6 text-blue-500" />
            <span>Upload CSV Data</span>
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Upload multiple meter readings at once using a CSV file. Ensure your
            CSV has columns named{" "}
            <code className="bg-gray-100 p-1 rounded font-mono text-xs">
              readingDate
            </code>{" "}
            (YYYY-MM-DD),{" "}
            <code className="bg-gray-100 p-1 rounded font-mono text-xs">
              consumptionKWH
            </code>
            ,{" "}
            <code className="bg-gray-100 p-1 rounded font-mono text-xs">
              emissionCO2kg
            </code>{" "}
            (optional), and{" "}
            <code className="bg-gray-100 p-1 rounded font-mono text-xs">
              source
            </code>{" "}
            (optional).
          </p>
          <input
            type="file"
            accept=".csv"
            className="w-full p-2 border border-gray-300 rounded-xl transition-all text-sm focus:outline-none focus:border-blue-500"
            onChange={handleCsvFileChange}
          />
          {selectedFile && (
            <p className="text-xs text-gray-600 mt-2">
              Selected file:{" "}
              <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}
          <button
            onClick={handleCsvUploadSubmit}
            disabled={isUploadingCsv || !selectedFile}
            className="w-full mt-4 bg-blue-500 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm shadow-md hover:shadow-lg"
          >
            {isUploadingCsv ? (
              <svg
                className="animate-spin h-4 w-4 text-white"
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
                <span>Upload CSV</span>
                <UploadCloud className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-semibold">Note:</span> CSV columns must
            exactly match:{" "}
            <code className="bg-gray-200 p-1 rounded font-mono text-xs">
              readingDate
            </code>
            ,{" "}
            <code className="bg-gray-200 p-1 rounded font-mono text-xs">
              consumptionKWH
            </code>
            ,{" "}
            <code className="bg-gray-200 p-1 rounded font-mono text-xs">
              emissionCO2kg
            </code>{" "}
            (optional),{" "}
            <code className="bg-gray-200 p-1 rounded font-mono text-xs">
              source
            </code>{" "}
            (optional).
          </p>
        </motion.div>
      </div>

      {/* Recent Entries - Now includes filters */}
      <motion.div
        variants={sectionVariants} // Individual section animation
        className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2 border border-gray-100"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Recent Entries
          </h2>
        </div>

        {/* Filter Controls integrated within Recent Entries */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mr-2 flex items-center space-x-2">
            <Filter className="w-4 h-4 text-indigo-500" />
            <span>Filters:</span>
          </h3>
          {/* Period Filter */}
          <div className="flex-1">
            <label htmlFor="filterPeriod" className="sr-only">
              Filter by Period:
            </label>
            <select
              id="filterPeriod"
              value={filterPeriod}
              onChange={(e) =>
                setFilterPeriod(e.target.value as typeof filterPeriod)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm transition-all bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="this_year">This Year</option>
              <option value="last_year">Last Year</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="last_12_months">Last 12 Months</option>
            </select>
          </div>
          {/* Source Filter */}
          <div className="flex-1">
            <label htmlFor="filterSource" className="sr-only">
              Filter by Source:
            </label>
            <select
              id="filterSource"
              value={filterSource}
              onChange={(e) =>
                setFilterSource(e.target.value as "" | "manual" | "csv_upload")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm transition-all bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Sources</option>
              <option value="manual">Manual Entry</option>
              <option value="csv_upload">CSV Upload</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <AnimatePresence>
          {selectedEntryIds.length > 0 && (
            <motion.div
              key="bulk-action-bar"
              variants={bulkActionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
            >
              <div className="flex items-center space-x-2">
                <span className="text-red-700 font-medium">
                  {selectedEntryIds.length} selected
                </span>
                {recentEntries.length > 0 && (
                  <button
                    onClick={handleToggleSelectAll}
                    className="px-2 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium"
                  >
                    {areAllSelected ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <button
                  onClick={() => setSelectedEntryIds([])}
                  className="px-2 py-1 text-xs rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleDeleteSelectedConfirm}
                  disabled={isSubmitting}
                  className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Delete Selected ({selectedEntryIds.length})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isFetchingEntries ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center py-10 text-gray-600"
          >
            <svg
              className="animate-spin h-6 w-6 mr-3 text-blue-500"
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
            Fetching entries...
          </motion.div>
        ) : recentEntries.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {recentEntries.map((entry: any) => (
                <motion.div
                  key={entry.id}
                  variants={listItemVariants} // Apply individual list item animation (with blur)
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-3 bg-gray-50 rounded-xl flex items-start space-x-2 border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <label className="flex items-center cursor-pointer mt-0.5">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedEntryIds.includes(entry.id)}
                      onChange={(e) =>
                        handleSelectEntry(entry.id, e.target.checked)
                      }
                    />
                    {selectedEntryIds.includes(entry.id) ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </label>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-text-primary text-sm">
                        {entry.readingDate}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <span>Source: {entry.source || "Manual"}</span>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit entry"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(entry.id)}
                          className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Consumption:</span>
                        <span className="block font-semibold text-text-primary">
                          {entry.consumptionKWH || 0} kWh
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Emissions:</span>
                        <span className="block font-semibold text-text-primary">
                          {entry.emissionCO2kg || 0} kg CO2
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="py-10 text-center text-gray-500 text-sm"
          >
            <p>
              No recent entries found or no entries match your current filters.
              Try adjusting them!
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DataEntry;
