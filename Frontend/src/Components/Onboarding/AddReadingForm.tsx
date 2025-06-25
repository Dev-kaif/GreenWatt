/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Calendar, Zap, Cloud } from "lucide-react";

interface AddReadingFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  loading: boolean;
}

const fadeContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const AddReadingForm: React.FC<AddReadingFormProps> = ({
  onSubmit,
  onBack,
  initialData,
  loading,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const [readingDate, setReadingDate] = useState(
    initialData?.reading?.readingDate || today
  );
  const [consumptionKWH, setConsumptionKWH] = useState(
    initialData?.reading?.consumptionKWH || ""
  );
  const [emissionCO2kg, setEmissionCO2kg] = useState(
    initialData?.reading?.emissionCO2kg || ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!readingDate || !consumptionKWH || parseFloat(consumptionKWH) <= 0) {
      setFormError("Please enter a valid date and energy consumption (kWh).");
      return;
    }

    const readingData = {
      readingDate,
      consumptionKWH: parseFloat(consumptionKWH),
      emissionCO2kg: emissionCO2kg ? parseFloat(emissionCO2kg) : undefined,
    };

    onSubmit({ reading: readingData });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeContainer}
    >
      <motion.p
        variants={fadeItem}
        className="text-center text-gray-600 mb-6"
      >
        Lastly, let's add your first energy meter reading to get started with
        tracking!
      </motion.p>

      <motion.div variants={fadeItem}>
        <label
          htmlFor="readingDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          <Calendar className="inline-block mr-1 w-4 h-4 text-gray-500" />
          Date
        </label>
        <input
          type="date"
          id="readingDate"
          value={readingDate}
          onChange={(e) => setReadingDate(e.target.value)}
          max={today}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        />
      </motion.div>

      <motion.div variants={fadeItem}>
        <label
          htmlFor="consumptionKWH"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          <Zap className="inline-block mr-1 w-4 h-4 text-gray-500" />
          Electricity Consumption (kWh)
        </label>
        <input
          type="number"
          id="consumptionKWH"
          value={consumptionKWH}
          onChange={(e) => setConsumptionKWH(e.target.value)}
          placeholder="e.g., 25.5"
          step="0.1"
          min="0"
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        />
      </motion.div>

      <motion.div variants={fadeItem}>
        <label
          htmlFor="emissionCO2kg"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          <Cloud className="inline-block mr-1 w-4 h-4 text-gray-500" />
          Estimated CO2 Emission (kg) (Optional)
        </label>
        <input
          type="number"
          id="emissionCO2kg"
          value={emissionCO2kg}
          onChange={(e) => setEmissionCO2kg(e.target.value)}
          placeholder="e.g., 12.3"
          step="0.1"
          min="0"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        />
      </motion.div>

      {formError && (
        <motion.div
          variants={fadeItem}
          className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {formError}
        </motion.div>
      )}

      <div className="flex justify-between gap-4">
        <motion.button
          type="button"
          onClick={onBack}
          variants={fadeItem}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-300"
        >
          Back
        </motion.button>
        <motion.button
          type="submit"
          variants={fadeItem}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Completing..." : "Complete Onboarding"}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default AddReadingForm;
