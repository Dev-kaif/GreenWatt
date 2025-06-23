/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  PlusCircle,
  Home,
  Calendar,
  Power,
  Star,
  Gauge,
  Tag,
  BatteryCharging,
  Clock,
} from "lucide-react";

interface AddApplianceFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

// Fade-in / fade-out variants
const fadeContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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

// Hardcoded options for dropdowns
const energyStarRatings = ["1-Star", "2-Star", "3-Star", "4-Star", "5-Star"];
const energyEfficiencyGrades = ["A+++", "A++", "A+", "A", "B", "C", "D"]; // Interpreted "grades" here
const capacityUnits = ["Liters (L)", "Kilograms (kg)", "BTU", "Tons", "Cubic Feet (cu ft)", "Gallons (gal)", "Other"];


const AddApplianceForm: React.FC<AddApplianceFormProps> = ({
  onSubmit,
  onBack,
  initialData,
}) => {
  const [applianceType, setApplianceType] = useState(initialData?.appliance?.applianceType || "");
  const [modelName, setModelName] = useState(initialData?.appliance?.modelName || "");
  const [ageYears, setAgeYears] = useState(initialData?.appliance?.ageYears || "");
  const [purchaseDate, setPurchaseDate] = useState(initialData?.appliance?.purchaseDate || "");
  const [energyStarRating, setEnergyStarRating] = useState(initialData?.appliance?.energyStarRating || "");
  const [powerConsumption, setPowerConsumption] = useState(initialData?.appliance?.powerConsumption || "");
  const [energyEfficiencyRating, setEnergyEfficiencyRating] = useState(initialData?.appliance?.energyEfficiencyRating || "");
  const [capacity, setCapacity] = useState(initialData?.appliance?.capacity || "");
  const [capacityUnit, setCapacityUnit] = useState(initialData?.appliance?.capacityUnit || ""); // New state for capacity unit
  const [avgDailyUsageHours, setAvgDailyUsageHours] = useState(initialData?.appliance?.avgDailyUsageHours || "");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Updated validation: Appliance Type, Power Consumption, Age (Years), Energy Star Rating, and Avg. Daily Usage are now required
    if (
      !applianceType ||
      !powerConsumption ||
      parseFloat(powerConsumption) <= 0 ||
      !ageYears || // Now required
      !energyStarRating || // Now required
      !avgDailyUsageHours // Now required
    ) {
      setFormError("Please fill out all required fields.");
      return;
    }

    // Combine capacity and unit for storage if both exist
    const combinedCapacity = capacity && capacityUnit ? `${capacity} ${capacityUnit}` : capacity || undefined;


    const applianceData = {
      type: applianceType,
      modelName: modelName || undefined,
      ageYears: ageYears ? parseInt(ageYears) : undefined,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : undefined,
      energyStarRating: energyStarRating || undefined,
      powerConsumptionWatts: parseFloat(powerConsumption),
      energyEfficiencyRating: energyEfficiencyRating || undefined,
      capacity: combinedCapacity, // Use combined capacity
      averageDailyUsageHours: avgDailyUsageHours ? parseFloat(avgDailyUsageHours) : undefined,
    };

    onSubmit({ appliance: applianceData });
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
      <motion.p variants={fadeItem} className="text-center text-gray-600 mb-6">
        Let's add your first appliance. You can add more later.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={fadeItem}>
          <label htmlFor="applianceType" className="block text-sm font-medium text-gray-700 mb-1">
            <Home className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Appliance Type <span className="text-red-500">*</span>
          </label>
          <select
            id="applianceType"
            value={applianceType}
            onChange={(e) => setApplianceType(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="">Select Type</option>
            <option value="Refrigerator">Refrigerator</option>
            <option value="Air Conditioner">Air Conditioner</option>
            <option value="Washing Machine">Washing Machine</option>
            <option value="Television">Television</option>
            <option value="Microwave">Microwave</option>
            <option value="Water Heater">Water Heater</option>
            <option value="Laptop">Laptop</option>
            <option value="Other">Other</option>
          </select>
        </motion.div>

        <motion.div variants={fadeItem}>
          <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-1">
            <Tag className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Model Name (Optional)
          </label>
          <input
            type="text"
            id="modelName"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g., Samsung RT20"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={fadeItem}>
          <label htmlFor="ageYears" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Age (Years) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="ageYears"
            value={ageYears}
            onChange={(e) => setAgeYears(e.target.value)}
            placeholder="e.g., 5"
            min="0"
            required // Now required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>

        <motion.div variants={fadeItem}>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Purchase Date (Optional)
          </label>
          <input
            type="date"
            id="purchaseDate"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Energy Star Rating Dropdown */}
        <motion.div variants={fadeItem}>
          <label htmlFor="energyStarRating" className="block text-sm font-medium text-gray-700 mb-1">
            <Star className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Energy Star Rating <span className="text-red-500">*</span>
          </label>
          <select
            id="energyStarRating"
            value={energyStarRating}
            onChange={(e) => setEnergyStarRating(e.target.value)}
            required // Now required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="">Select Rating</option>
            {energyStarRatings.map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div variants={fadeItem}>
          <label htmlFor="powerConsumption" className="block text-sm font-medium text-gray-700 mb-1">
            <Power className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Power Consumption (Watts) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="powerConsumption"
            value={powerConsumption}
            onChange={(e) => setPowerConsumption(e.target.value)}
            placeholder="e.g., 150"
            min="0"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Energy Efficiency Rating (Grades) Dropdown */}
        <motion.div variants={fadeItem}>
          <label htmlFor="energyEfficiencyRating" className="block text-sm font-medium text-gray-700 mb-1">
            <BatteryCharging className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Energy Efficiency Grade (Optional)
          </label>
          <select
            id="energyEfficiencyRating"
            value={energyEfficiencyRating}
            onChange={(e) => setEnergyEfficiencyRating(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="">Select Grade</option>
            {energyEfficiencyGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Capacity Input with Unit Dropdown */}
        <motion.div variants={fadeItem}>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
            <Gauge className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Capacity (Optional)
          </label>
          <div className="flex space-x-2 mt-1">
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g., 500"
              min="0"
              step="0.01"
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <select
              id="capacityUnit"
              value={capacityUnit}
              onChange={(e) => setCapacityUnit(e.target.value)}
              className="block flex-shrink-0 px-2 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="">Unit</option>
              {capacityUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeItem}>
        <label htmlFor="avgDailyUsageHours" className="block text-sm font-medium text-gray-700 mb-1">
          <Clock className="inline-block mr-1 w-4 h-4 text-gray-500" />
          Avg. Daily Usage (Hours) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="avgDailyUsageHours"
          value={avgDailyUsageHours}
          onChange={(e) => setAvgDailyUsageHours(e.target.value)}
          placeholder="e.g., 8.5"
          step="0.1"
          min="0"
          max="24"
          required // Now required
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
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300"
        >
          Next: Add a Reading <PlusCircle className="inline-block ml-2 w-5 h-5" />
        </motion.button>
      </div>
    </motion.form>
  );
};

export default AddApplianceForm;