import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import {
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiPrisma,
  SiSupabase,
  SiLangchain,
} from "react-icons/si";

import {
  Leaf,
  BarChart3,
  Upload,
  Lightbulb,
  TrendingDown,
  Shield,
  Play,
  ArrowRight,
  CheckCircle,
  Zap,
  Star,
  Lock,
  Award,
  Plus,
  Minus,
  Twitter,
  Linkedin,
  Github,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react"; // Import useEffect
import { useNavigate } from "react-router-dom"; // Import useNavigate

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function GreenWattLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state to track login status

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token"); // Assuming 'token' is your key for the access token
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setMobileMenuOpen(false);
  };

  // Subtle parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Function to handle "Get Started" / "Start Trial" clicks
  const handleAuthRedirect = () => {
    if (isLoggedIn) {
      navigate("/dashboard"); // If logged in, go to dashboard
    } else {
      navigate("/auth/signup"); // If not logged in, go to signup
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-700 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white backdrop-blur-md z-50 border-b border-primary/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-secondary">
                GreenWatt
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { label: "Features", id: "features" },
                { label: "Working", id: "how-it-works" },
                { label: "Reviews", id: "testimonials" },
                { label: "FAQ", id: "FAQ" },
                { label: "Contact", id: "contact" },
              ].map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-600 hover:text-primary transition-colors cursor-pointer"
                  whileHover={{ opacity: 0.7 }}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ transitionDelay: `${index * 0.1 + 0.3}s` }}
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.button // Changed from <a> to <button> for onClick
                onClick={handleAuthRedirect} // Use the new handler
                className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ transitionDelay: "0.7s" }}
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started"}{" "}
                {/* Dynamic text */}
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden border-t border-primary/10 bg-accent/95"
              >
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="px-4 py-4 space-y-4"
                >
                  {[
                    { label: "Features", id: "features" },
                    { label: "How It Works", id: "how-it-works" }, // Updated label to match ID for clarity
                    { label: "Testimonials", id: "testimonials" }, // Updated label to match ID for clarity
                    { label: "FAQ", id: "FAQ" },
                    { label: "Contact", id: "contact" },
                  ].map((item) => (
                    <motion.button
                      key={item.id}
                      variants={fadeInUp}
                      onClick={() => scrollToSection(item.id)}
                      className="block w-full text-left text-gray-600 hover:text-primary transition-colors py-2"
                    >
                      {item.label}
                    </motion.button>
                  ))}
                  <motion.button // Changed from <a> to <button> for onClick
                    variants={fadeInUp}
                    onClick={handleAuthRedirect} // Use the new handler
                    className="w-full bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Get Started"}{" "}
                    {/* Dynamic text */}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-36 pb-32 bg-accent relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
          style={{ y: heroY, opacity: heroOpacity }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
              >
                <Zap className="h-4 w-4" />
                <span>Join 50,000+ eco-conscious households</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl lg:text-6xl font-bold text-secondary leading-tight"
              >
                <span className="block">Track Your Energy,</span>
                <span className="text-primary block">Save the Planet</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-600/70 leading-relaxed"
              >
                Monitor your household electricity consumption with intelligent
                analytics, get personalized energy-saving tips, and reduce your
                carbon footprint while cutting costs by up to 30%.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button // Changed from <a> to <button> for onClick
                  onClick={handleAuthRedirect} // Use the new handler
                  className="bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 8px 25px rgba(50, 198, 134, 0.25)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span>
                    {isLoggedIn ? "Go to Dashboard" : "Start Free 14-Day Trial"}
                  </span>{" "}
                  {/* Dynamic text */}
                  <ArrowRight className="h-5 w-5" />
                </motion.button>

                <motion.button
                  className="border-2 border-primary text-primary px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-primary/5"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Demo (2 min)</span>
                </motion.button>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex items-center space-x-6 text-sm text-gray-500"
              >
                {[
                  { icon: CheckCircle, text: "No credit card required" },
                  { icon: CheckCircle, text: "Setup in 5 minutes" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <motion.img
                src="https://images.unsplash.com/photo-1658753145551-8f44e5811d21?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Energy Dashboard Illustration"
                className="w-full h-auto rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary mb-4">
              Powerful Features for Smart Energy Management
            </h2>
            <p className="text-xl text-gray-600/70 max-w-3xl mx-auto">
              Everything you need to understand, track, and optimize your
              household energy consumption
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: BarChart3,
                title: "Smart Analytics",
                description:
                  "Get detailed insights into your energy usage patterns with interactive charts and real-time monitoring.",
                features: [
                  "Real-time monitoring",
                  "Historical trends",
                  "Peak usage alerts",
                ],
              },
              {
                icon: Upload,
                title: "Easy CSV Import",
                description:
                  "Upload your utility bills and energy data effortlessly. Our system automatically processes and analyzes your consumption.",
                features: [
                  "Multiple formats",
                  "Auto-processing",
                  "Error detection",
                ],
              },
              {
                icon: Lightbulb,
                title: "AI-Powered Tips",
                description:
                  "Receive personalized recommendations tailored to your usage patterns to maximize savings and efficiency.",
                features: [
                  "Custom recommendations",
                  "Seasonal adjustments",
                  "Goal tracking",
                ],
              },
              {
                icon: TrendingDown,
                title: "Cost Reduction",
                description:
                  "Track your savings over time and see how small changes lead to significant reductions in your energy bills.",
                features: [
                  "Savings calculator",
                  "ROI tracking",
                  "Bill predictions",
                ],
              },
              {
                icon: Shield,
                title: "Data Security",
                description:
                  "Your energy data is encrypted and secure. We prioritize your privacy while helping you save energy.",
                features: [
                  "End-to-end encryption",
                  "GDPR compliant",
                  "Regular audits",
                ],
              },
              {
                icon: Leaf,
                title: "Carbon Impact",
                description:
                  "Monitor your environmental impact and celebrate milestones as you reduce your household's carbon footprint.",
                features: [
                  "CO₂ tracking",
                  "Impact visualization",
                  "Green achievements",
                ],
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-8 rounded-2xl border border-primary/10 hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-xl font-semibold text-secondary mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600/70 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <CheckCircle className="h-4 w-4 text-primary mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary mb-4">
              How GreenWatt Works
            </h2>
            <p className="text-xl text-gray-600/70 max-w-3xl mx-auto">
              Get started in three simple steps and begin your journey to energy
              efficiency
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-12"
          >
            {[
              {
                step: "01",
                title: "Upload Your Data",
                description:
                  "Import your energy bills or connect your smart meter. Our system supports multiple formats and providers.",
                image:
                  "https://plus.unsplash.com/premium_photo-1677093905912-a653c6301260?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              },
              {
                step: "02",
                title: "Analyze Patterns",
                description:
                  "Our AI analyzes your consumption patterns, identifies peak usage times, and spots inefficiencies.",
                image:
                  "https://plus.unsplash.com/premium_photo-1681487767138-ddf2d67b35c1?q=80&w=1910&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              },
              {
                step: "03",
                title: "Save & Optimize",
                description:
                  "Follow personalized recommendations, track your progress, and watch your bills decrease month by month.",
                image: "public/dashboard.png",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative mb-8">
                  <motion.img
                    src={step.image} // Using placeholder images
                    alt={step.title}
                    className="w-full h-64 object-cover object-left rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute -top-4 -left-4 bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-secondary mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600/70 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Inspirational Quote Section */}
      <section className="py-20 bg-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Leaf className="h-16 w-16 text-primary mx-auto mb-8" />
            <blockquote className="text-3xl lg:text-4xl font-light leading-relaxed mb-8">
              "The greatest threat to our planet is the belief that someone else
              will save it."
            </blockquote>
            <cite className="text-xl text-white/70">
              — Robert Swan, Polar Explorer
            </cite>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600/70">
              Join thousands of satisfied customers saving energy and money
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                name: "Sarah Johnson",
                role: "Homeowner",
                image: "https://placehold.co/80x80/e0e0e0/333333?text=SJ",
                rating: 5,
                text: "GreenWatt helped us reduce our electricity bill by 35% in just 3 months. The insights are incredible!",
              },
              {
                name: "Mike Chen",
                role: "Environmental Consultant",
                image: "https://placehold.co/80x80/d0d0d0/333333?text=MC",
                rating: 5,
                text: "As someone who cares about sustainability, this app is a game-changer. Easy to use and very effective.",
              },
              {
                name: "Emily Rodriguez",
                role: "Family of 4",
                image: "https://placehold.co/80x80/c0c0c0/333333?text=ER",
                rating: 5,
                text: "The personalized tips are spot-on. We've made simple changes that resulted in significant savings.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-8 rounded-2xl border border-primary/10 hover:shadow-lg transition-shadow duration-300"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image} // Using placeholder images
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-secondary">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary mb-4">
              Your Data is Safe & Secure
            </h2>
            <p className="text-xl text-gray-600/70">
              Enterprise-grade security you can trust
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              {
                icon: Lock,
                title: "256-bit Encryption",
                desc: "Bank-level security",
              },
              {
                icon: Shield,
                title: "GDPR Compliant",
                desc: "Privacy by design",
              },
              {
                icon: Award,
                title: "SOC 2 Certified",
                desc: "Audited security",
              },
              {
                icon: CheckCircle,
                title: "99.9% Uptime",
                desc: "Always available",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-secondary mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="FAQ" className="py-20 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600/70">
              Everything you need to know about GreenWatt
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {[
              {
                question: "How does GreenWatt track my energy consumption?",
                answer:
                  "GreenWatt works by analyzing your utility bills and smart meter data. You can upload your bills directly or connect compatible smart meters for real-time monitoring.",
              },
              {
                question: "Is my energy data secure and private?",
                answer:
                  "Absolutely. We use end-to-end encryption and follow strict data protection protocols. Your data is never shared with third parties and you maintain full control over your information.",
              },
              {
                question: "How much can I expect to save on my energy bills?",
                answer:
                  "Our users typically see 20-30% reduction in their energy bills within the first 3 months. Savings depend on your current usage patterns and how well you implement our recommendations.",
              },
              {
                question: "Do I need special equipment to use GreenWatt?",
                answer:
                  "No special equipment required! GreenWatt works with your existing utility bills. For real-time monitoring, we support most popular smart meters and IoT devices.",
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer:
                  "Yes, you can cancel your subscription at any time with no cancellation fees. Your data will remain accessible for 30 days after cancellation.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-lg border border-primary/10 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <motion.button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="font-semibold text-secondary">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {openFaq === index ? (
                      <Minus className="h-5 w-5 text-primary" />
                    ) : (
                      <Plus className="h-5 w-5 text-primary" />
                    )}
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="px-6 pb-4"
                      >
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600/70">
              Powered by industry-leading tools and frameworks
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-wrap justify-center items-center gap-8"
          >
            {[
              {
                name: "React",
                logo: <SiReact className="text-sky-400" />,
              },
              {
                name: "Tailwind CSS",
                logo: <SiTailwindcss className="text-teal-400" />,
              },
              {
                name: "Supabase",
                logo: <SiSupabase className="text-green-700" />,
              },
              {
                name: "Prisma",
                logo: <SiPrisma />,
              },
              {
                name: "Node.js",
                logo: <SiNodedotjs className="text-green-500" />,
              },
              {
                name: "Langchain",
                logo: <SiLangchain />,
              },
              {
                name: "Typescript",
                logo: <SiTypescript className="text-blue-500" />,
              },
            ].map((tech, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-accent p-6 rounded-2xl border border-primary/10 hover:shadow-md transition-shadow duration-300 flex flex-col items-center  gap-2"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-2xl">{tech.logo}</div>
                <p className="text-sm font-medium text-secondary text-center">
                  {tech.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Ready to Start Saving Energy?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of households already reducing their energy
              consumption and environmental impact with GreenWatt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button // Changed from <a> to <button> for onClick
                onClick={handleAuthRedirect} // Use the new handler
                className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}
                transition={{ duration: 0.2 }}
              >
                <span>
                  {isLoggedIn ? "Go to Dashboard" : "Start Free Trial"}
                </span>{" "}
                {/* Dynamic text */}
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                Schedule Demo
              </motion.button>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm opacity-80">
              {[
                { icon: CheckCircle, text: "Free 14-day trial" },
                { icon: CheckCircle, text: "No credit card required" },
                { icon: CheckCircle, text: "Cancel anytime" },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-5 gap-8"
          >
            <motion.div variants={fadeInUp} className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">GreenWatt</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Empowering households to reduce energy consumption and
                environmental impact through intelligent monitoring and
                analytics.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: Twitter, href: "#" },
                  { icon: Linkedin, href: "#" },
                  { icon: Github, href: "#" },
                  { icon: MessageCircle, href: "#" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="text-primary hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <social.icon className="h-6 w-6" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {[
              {
                title: "Product",
                links: [
                  "Features",
                  "Dashboard",
                  "Analytics",
                  "Mobile App",
                  "Integrations",
                ],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press", "Contact"],
              },
              {
                title: "Support",
                links: [
                  "Help Center",
                  "Privacy Policy",
                  "Terms of Service",
                  "Security",
                  "Status",
                ],
              },
            ].map((section, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2 text-white/70">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="hover:text-primary transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <p className="text-white/70">
              &copy; 2024 GreenWatt. All rights reserved. Built with 💚 for a
              sustainable future.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-white/70">
              {["Privacy", "Terms", "Cookies"].map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
