/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Components/Onboarding/OnboardingWizard.tsx
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PersonalInfoForm from "./PersonalInfoForm";
import AddApplianceForm from "./AddApplianceForm";
import AddReadingForm from "./AddReadingForm";
import axiosInstance from "../../utils/axios"; // Ensure correct path

const OnboardingWizard = () => {
  const navigate = useNavigate();
  // Using 0-indexed steps: 0 = Personal Info, 1 = Add Appliance, 2 = Add Reading
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({}); // Collects data across steps
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animation variants for step transitions
  const stepVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    }),
  };

  const [direction, setDirection] = useState(0); // 0: no movement, 1: next, -1: back

  const handleNextStep = (data: any) => {
    setDirection(1); // Moving forward
    setFormData((prevData: any) => ({ ...prevData, ...data }));
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setDirection(-1); // Moving backward
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleOnboardingFinalize = async (readingData: any) => {
    setError(null);
    setLoading(true);

    try {
      // Step 1: Update User and UserProfile with data from PersonalInfoForm
      // The backend `updateUserProfile` controller expects these fields at the top level
      const personalInfoPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber, // Assuming phoneNumber might be collected too
        householdSize: parseInt(formData.householdSize),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        electricityRatePerKWh: parseFloat(formData.electricityRate), // Matches backend field name
        targetReduction: formData.targetReduction
          ? parseFloat(formData.targetReduction)
          : undefined,
        ecoGoals: formData.ecoGoals,
        onboardingComplete: true,
      };

      await axiosInstance.put("/api/profile", personalInfoPayload);
      console.log("User profile and onboarding status updated successfully.");

      // Step 2: Add Appliance (from AddApplianceForm)
      if (formData.appliance) {
        await axiosInstance.post("/api/appliances", formData.appliance);
        console.log("Appliance added successfully.");
      }

      // Step 3: Add Initial Reading (from AddReadingForm)
      if (readingData.reading) {
        // readingData contains the 'reading' object
        await axiosInstance.post("/api/meter-readings", readingData.reading);
        console.log("Initial meter reading added successfully.");
      }

      navigate("/dashboard"); 
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

  // Render current step component
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
        return <p>Unknown step.</p>;
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

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentStep} // Important for AnimatePresence to detect change and animate
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            className="w-full" // Ensure the child content takes full width
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingWizard;
