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

const AddApplianceForm: React.FC<AddApplianceFormProps> = ({
  onSubmit,
  onBack,
  initialData,
}) => {
  const [applianceType, setApplianceType] = useState(
    initialData?.appliance?.applianceType || ""
  );
  const [modelName, setModelName] = useState(
    initialData?.appliance?.modelName || ""
  );
  const [ageYears, setAgeYears] = useState(
    initialData?.appliance?.ageYears || ""
  );
  const [purchaseDate, setPurchaseDate] = useState(
    initialData?.appliance?.purchaseDate || ""
  );
  const [energyStarRating, setEnergyStarRating] = useState(
    initialData?.appliance?.energyStarRating || ""
  );
  const [powerConsumption, setPowerConsumption] = useState(
    initialData?.appliance?.powerConsumption || ""
  );
  const [energyEfficiencyRating, setEnergyEfficiencyRating] = useState(
    initialData?.appliance?.energyEfficiencyRating || ""
  );
  const [capacity, setCapacity] = useState(
    initialData?.appliance?.capacity || ""
  );
  const [avgDailyUsageHours, setAvgDailyUsageHours] = useState(
    initialData?.appliance?.avgDailyUsageHours || ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation for at least required fields as per screenshot
    if (
      !applianceType ||
      !powerConsumption ||
      parseFloat(powerConsumption) <= 0
    ) {
      setFormError(
        "Please enter Appliance Type and a valid Power Consumption."
      );
      return;
    }

    const applianceData = {
      type: applianceType, // This needs to match 'type' in your Prisma Appliance model
      modelName: modelName || undefined,
      ageYears: ageYears ? parseInt(ageYears) : undefined,
      purchaseDate: purchaseDate
        ? new Date(purchaseDate).toISOString()
        : undefined, // Convert to ISO string
      energyStarRating: energyStarRating || undefined,
      powerConsumptionWatts: parseFloat(powerConsumption), // Matches backend field name
      energyEfficiencyRating: energyEfficiencyRating || undefined,
      capacity: capacity || undefined,
      averageDailyUsageHours: avgDailyUsageHours
        ? parseFloat(avgDailyUsageHours)
        : undefined, // Matches backend field name
    };

    onSubmit({ appliance: applianceData }); // Wrap appliance data in an 'appliance' key
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 p-4"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 0, x: -1000 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { staggerChildren: 0.07, delayChildren: 0.2 },
        },
      }}
      custom={1} // Custom prop for exit direction from parent AnimatePresence
    >
      <motion.p
        variants={itemVariants}
        className="text-center text-gray-600 mb-6"
      >
        Let's add your first appliance. You can add more later.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <label
            htmlFor="applianceType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
        <motion.div variants={itemVariants}>
          <label
            htmlFor="modelName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <Tag className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Model Name
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
        <motion.div variants={itemVariants}>
          <label
            htmlFor="ageYears"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <Calendar className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Age (Years)
          </label>
          <input
            type="number"
            id="ageYears"
            value={ageYears}
            onChange={(e) => setAgeYears(e.target.value)}
            placeholder="e.g., 5"
            min="0"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <label
            htmlFor="purchaseDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <Calendar className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Purchase Date
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
        <motion.div variants={itemVariants}>
          <label
            htmlFor="energyStarRating"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <Star className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Energy Star Rating
          </label>
          <input
            type="text"
            id="energyStarRating"
            value={energyStarRating}
            onChange={(e) => setEnergyStarRating(e.target.value)}
            placeholder="e.g., 5-star"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <label
            htmlFor="powerConsumption"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
        <motion.div variants={itemVariants}>
          <label
            htmlFor="energyEfficiencyRating"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <BatteryCharging className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Energy Efficiency Rating
          </label>
          <input
            type="text"
            id="energyEfficiencyRating"
            value={energyEfficiencyRating}
            onChange={(e) => setEnergyEfficiencyRating(e.target.value)}
            placeholder="e.g., A++, B"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <Gauge className="inline-block mr-1 w-4 h-4 text-gray-500" />
            Capacity
          </label>
          <input
            type="text"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g., 500L, 7kg"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <label
          htmlFor="avgDailyUsageHours"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          <Clock className="inline-block mr-1 w-4 h-4 text-gray-500" />
          Avg. Daily Usage (Hours)
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
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        />
      </motion.div>

      {formError && (
        <motion.div
          className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
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

      <div className="flex justify-between gap-4">
        <motion.button
          type="button"
          onClick={onBack}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-300"
        >
          Back
        </motion.button>
        <motion.button
          type="submit"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300"
        >
          Next: Add a Reading{" "}
          <PlusCircle className="inline-block ml-2 w-5 h-5" />
        </motion.button>
      </div>
    </motion.form>
  );
};

export default AddApplianceForm;
