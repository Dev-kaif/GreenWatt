/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PersonalInfoForm from "./PersonalInfoForm";
import AddApplianceForm from "./AddApplianceForm";
import AddReadingForm from "./AddReadingForm";
import axiosInstance from "../../utils/axios"; // Adjust path if needed

const fadeVariants: Variants = {
  enter: {
    opacity: 0,
    scale: 0.98,
  },
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

const OnboardingWizard = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setDirection] = useState(0);

  const handleNextStep = (data: any) => {
    setDirection(1);
    setFormData((prev: any) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  const handleOnboardingFinalize = async (readingData: any) => {
    setError(null);
    setLoading(true);

    try {
      const personalInfoPayload = {
        phoneNumber: formData.phoneNumber,
        householdSize: parseInt(formData.householdSize),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        electricityRatePerKWh: parseFloat(formData.electricityRate),
        targetReduction: formData.targetReduction
          ? parseFloat(formData.targetReduction)
          : undefined,
        ecoGoals: formData.ecoGoals,
        onboardingComplete: true,
      };

      await axiosInstance.put("/api/profile", personalInfoPayload);
      if (formData.appliance) {
        await axiosInstance.post("/api/appliances", formData.appliance);
      }
      if (readingData.reading) {
        await axiosInstance.post("/api/meter-readings", readingData.reading);
      }
      navigate("/dashboard");
      window.location.reload(); 
      
    } catch (err: any) {
      console.error("Onboarding finalization failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to complete onboarding. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoForm
            key="step0"
            onSubmit={handleNextStep}
            initialData={formData}
          />
        );
      case 1:
        return (
          <AddApplianceForm
            key="step1"
            onSubmit={handleNextStep}
            onBack={handlePreviousStep}
            initialData={formData}
          />
        );
      case 2:
        return (
          <AddReadingForm
            key="step2"
            onSubmit={handleOnboardingFinalize}
            onBack={handlePreviousStep}
            initialData={formData}
            loading={loading}
          />
        );
      default:
        return <p>Unknown step</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-inter antialiased">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-700">
            GreenWatt Onboarding
          </h1>
          <p className="text-gray-600">Step {currentStep + 1} of 3</p>
          {error && (
            <motion.div
              className="flex items-center justify-center p-3 mt-4 rounded-lg bg-red-100 text-red-700 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingWizard;
