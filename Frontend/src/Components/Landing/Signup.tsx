import { motion } from "motion/react";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Leaf,
  Mail,
  Lock,
  User,
  ArrowRight,
  Home, // Import Home icon
} from "lucide-react";

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

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false); // Explicit type
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false); // Explicit type
  const [isLoading, setIsLoading] = useState<boolean>(false); // Explicit type
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false, // This seems missing in your form, consider adding a checkbox for it
    subscribeNewsletter: true,
  });

  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[]; // Explicitly define feedback as an array of strings
  }>({
    score: 0,
    feedback: [],
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    // Optionally, navigate to a success page or login after signup
    // router.push('/auth/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Password strength check
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string): void => {
    let score = 0;
    const feedback: string[] = []; // Explicitly define feedback as an array of strings here too

    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("One lowercase letter");

    if (/\d/.test(password)) score++;
    else feedback.push("One number");

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push("One special character");

    setPasswordStrength({ score, feedback });
  };

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score <= 3) return "bg-yellow-500";
    if (passwordStrength.score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (): string => {
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 3) return "Fair";
    if (passwordStrength.score <= 4) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen py-10 relative bg-white flex items-center justify-center p-4">

      {/* Home Button */}
      <motion.a
        href="/"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="mt-4 text-center absolute left-10 top-10 z-10"
      >
        <button className="inline-flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
      </motion.a>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #32C686 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #0F3D3E 0%, transparent 50%)`,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="flex items-center justify-center space-x-2 mb-6"
            >
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-secondary">
                GreenWatt
              </span>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-2xl font-bold text-secondary"
              >
                Create your account
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-gray-600">
                Start your journey to energy efficiency
              </motion.p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <motion.form
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={fadeInUp} className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <motion.input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="John"
                      // Removed whileFocus and transition props from here as input elements are not motion components by default
                      // If you want them, change input to motion.input
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <input // Changed to regular input, as it was not motion.input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Doe"
                    // Removed whileFocus and transition props
                  />
                </motion.div>
              </div>

              {/* Email Field */}
              <motion.div variants={fadeInUp} className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input // Changed to regular input, as it was not motion.input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="john@example.com"
                    // Removed whileFocus and transition props
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={fadeInUp} className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input // Changed to regular input, as it was not motion.input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Create a strong password"
                    // Removed whileFocus and transition props
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Missing: {passwordStrength.feedback.join(", ")}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={fadeInUp} className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input // Changed to regular input, as it was not motion.input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Confirm your password"
                    // Removed whileFocus and transition props
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-500"
                    >
                      Passwords don't match
                    </motion.p>
                  )}
              </motion.div>

              {/* Terms and Conditions Checkbox */}
              <motion.div
                variants={fadeInUp}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms and Conditions
                  </a>
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={fadeInUp}
                type="submit"
                disabled={isLoading || !formData.agreeToTerms} // Ensure agreeToTerms is part of the form
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Sign In Link */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                {/* Using a regular anchor tag for simplicity.
                    For client-side routing in Next.js, use the <Link> component from 'next/link'.
                    For React Router DOM, use the <Link> component from 'react-router-dom'. */}
                <a
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
