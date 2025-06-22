/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { MapPin, DollarSign, Target, Home, Sparkles } from "lucide-react";

// Animation Variants
const fadeInUpStaggered: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const formContainer: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 1, 0.5, 1],
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -40,
    transition: {
      duration: 0.4,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

interface PersonalInfoFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "");
  const [zipCode, setZipCode] = useState(initialData?.zipCode || "");
  const [householdSize, setHouseholdSize] = useState(initialData?.householdSize || "");
  const [electricityRate, setElectricityRate] = useState(initialData?.electricityRate || "");
  const [targetReduction, setTargetReduction] = useState(initialData?.targetReduction || "");
  const [ecoGoals, setEcoGoals] = useState(initialData?.ecoGoals || "");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!address || !city || !state || !zipCode || !householdSize || !electricityRate) {
      setFormError("Please fill in all required personal and address fields.");
      return;
    }

    if (parseFloat(electricityRate) <= 0) {
      setFormError("Electricity rate must be a positive number.");
      return;
    }

    if (parseInt(householdSize) <= 0) {
      setFormError("Household size must be at least 1.");
      return;
    }

    if (targetReduction && (parseFloat(targetReduction) < 0 || parseFloat(targetReduction) > 100)) {
      setFormError("Target reduction must be between 0 and 100%.");
      return;
    }

    onSubmit({
      address,
      city,
      state,
      zipCode,
      householdSize,
      electricityRate,
      targetReduction,
      ecoGoals,
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={formContainer}
    >
      <motion.div variants={fadeInUpStaggered} custom={0}>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Green Street"
            required
            className="pl-9 pr-4 py-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={fadeInUpStaggered} custom={1}>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Mumbai"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>

        <motion.div variants={fadeInUpStaggered} custom={2}>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Maharashtra"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
      </div>

      <motion.div variants={fadeInUpStaggered} custom={3}>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
          Zip Code
        </label>
        <input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="400001"
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={fadeInUpStaggered} custom={4}>
          <label htmlFor="householdSize" className="block text-sm font-medium text-gray-700 mb-1">
            <Home className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Household Size (Number of People)
          </label>
          <input
            type="number"
            id="householdSize"
            value={householdSize}
            onChange={(e) => setHouseholdSize(e.target.value)}
            placeholder="e.g., 4"
            min="1"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>

        <motion.div variants={fadeInUpStaggered} custom={5}>
          <label htmlFor="electricityRate" className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Electricity Rate (₹ per kWh)
          </label>
          <input
            type="number"
            id="electricityRate"
            value={electricityRate}
            onChange={(e) => setElectricityRate(e.target.value)}
            placeholder="e.g., 7.50"
            step="0.01"
            min="0"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
      </div>

      <motion.div variants={fadeInUpStaggered} custom={6}>
        <label htmlFor="targetReduction" className="block text-sm font-medium text-gray-700 mb-1">
          <Target className="inline-block mr-1 w-4 h-4 text-gray-500" />
          Target Energy Reduction (% Optional)
        </label>
        <input
          type="number"
          id="targetReduction"
          value={targetReduction}
          onChange={(e) => setTargetReduction(e.target.value)}
          placeholder="e.g., 15 (for 15% reduction)"
          min="0"
          max="100"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
        <p className="mt-2 text-xs text-gray-500">
          Set a goal for how much you want to reduce your energy consumption.
        </p>
      </motion.div>

      <motion.div variants={fadeInUpStaggered} custom={7}>
        <label htmlFor="ecoGoals" className="block text-sm font-medium text-gray-700 mb-1">
          <Sparkles className="inline-block mr-1 w-4 h-4 text-gray-500" />
          Eco Goals (Optional)
        </label>
        <textarea
          id="ecoGoals"
          value={ecoGoals}
          onChange={(e) => setEcoGoals(e.target.value)}
          placeholder="e.g., Reduce AC usage, use more natural light"
          rows={3}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        ></textarea>
      </motion.div>

      {formError && (
        <motion.div
          variants={fadeInUpStaggered}
          custom={8}
          className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            ></path>
          </svg>
          {formError}
        </motion.div>
      )}

      <motion.button
        type="submit"
        variants={fadeInUpStaggered}
        custom={9}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300"
      >
        Next: Add an Appliance
      </motion.button>
    </motion.form>
  );
};

export default PersonalInfoForm;
