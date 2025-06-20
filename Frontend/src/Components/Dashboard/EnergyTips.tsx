/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/EnergyTips.tsx
import { useState, useEffect} from 'react';
import { Lightbulb, RefreshCw, Sparkles, AlertCircle, Send } from 'lucide-react'; // Adjusted icons
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios'; // Adjust path if needed

// MessageBox component (re-used for consistency)
const MessageBox = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4`}>
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

// Animation variants (re-used for consistency)
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

interface HistoricalTip {
  id: string;
  tipText: string;
  createdAt: string;
}

const EnergyTips = () => {
  const [currentQueryInput, setCurrentQueryInput] = useState<string>(''); // For the input query
  const [latestGeneratedTip, setLatestGeneratedTip] = useState<string | null>(null); // To display the single latest generated tip
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);
  const [historicalTips, setHistoricalTips] = useState<HistoricalTip[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [messageBox, setMessageBox] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // --- Function to fetch all historical energy tips ---
  const fetchHistoricalTips = async () => {
    setIsLoadingHistory(true);
    setMessageBox(null); // Clear previous messages
    try {
      const response = await axiosInstance.get('/api/energy-tips/history');
      setHistoricalTips(response.data.tips || []);
    } catch (err: any) {
      console.error("Failed to fetch historical tips:", err);
      setMessageBox({ message: "Failed to load historical tips. Please try again.", type: "error" });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // --- Function to generate a new energy tip based on query ---
  const handleGenerateTipFromQuery = async () => {
    if (currentQueryInput.trim() === '' && !latestGeneratedTip) { // Allow generating a tip without explicit query if no previous tip exists
        setMessageBox({ message: "Please enter a query or click 'Generate Tip' for a general tip.", type: "error" });
        return;
    }

    setIsGeneratingTip(true);
    setMessageBox(null); // Clear previous messages
    setLatestGeneratedTip(null); // Clear previous latest tip to show loading

    try {
      // Send the query to the backend's generateTipsController
      // The backend will interpret the query and generate a personalized, conversational tip
      const response = await axiosInstance.get('/api/energy-tips', {
        params: { q: currentQueryInput.trim() }, // Pass the user's query
      });

      const generatedTipText = response.data.generatedTips?.[0]?.tipText || "I couldn't generate a specific tip for that. Please try rephrasing.";
      setLatestGeneratedTip(generatedTipText);
      setMessageBox({ message: "New energy tip generated!", type: "success" });
      setCurrentQueryInput(''); // Clear input after successful generation

      // After generating and displaying a tip, refresh the historical tips list
      fetchHistoricalTips();

    } catch (err: any) {
      console.error("Error generating tip:", err);
      const errorMessage = err.response?.data?.error || err.message || "Something went wrong while generating the tip.";
      setMessageBox({ message: errorMessage, type: "error" });
      setLatestGeneratedTip("Failed to generate a new tip. Please try again or check your backend connection.");
    } finally {
      setIsGeneratingTip(false);
    }
  };

  // Initial fetch of historical tips on component mount
  useEffect(() => {
    fetchHistoricalTips();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <motion.div variants={fadeInUp} className="animate-fade-in p-4">
      {messageBox && (
        <MessageBox
          message={messageBox.message}
          type={messageBox.type}
          onClose={() => setMessageBox(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Energy Saving Tips</h1>
        <p className="text-gray-600">Get personalized suggestions and discover practical ways to reduce your energy consumption.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Adjusted grid for query + history */}
        {/* Generate Tip by Query Section (left column) */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-card p-6 flex flex-col h-[600px]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Get a Personalized Tip</h2>
          </div>

          <p className="text-gray-600 mb-4">Enter your question or a topic to get a tailored energy-saving tip:</p>

          <div className="flex space-x-3 mb-6">
            <input
              type="text"
              value={currentQueryInput}
              onChange={(e) => setCurrentQueryInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter' && !isGeneratingTip) handleGenerateTipFromQuery(); }}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
              placeholder="e.g., How to save on AC? Tips for my old fridge..."
              disabled={isGeneratingTip}
            />
            <button
              onClick={handleGenerateTipFromQuery}
              disabled={isGeneratingTip} // Only disable if loading, allow empty input for general tip
              className="bg-primary text-white p-3 rounded-xl hover:bg-green-600 transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingTip ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {isGeneratingTip && !latestGeneratedTip && ( // Show general loading for tip generation
            <div className="flex flex-col items-center justify-center flex-1 text-gray-600">
              <Sparkles className="w-12 h-12 mb-4 text-yellow-500 animate-pulse" />
              <p className="text-lg">Generating your personalized tip...</p>
            </div>
          )}

          {latestGeneratedTip && !isGeneratingTip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 bg-green-50 border border-green-200 rounded-xl shadow-inner w-full max-w-full flex-1 overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <span>Your Personalized Tip:</span>
              </h3>
              <p className="text-gray-700 text-left">{latestGeneratedTip}</p>
            </motion.div>
          )}

        {!latestGeneratedTip && !isGeneratingTip && ( // Message if no tip yet and not loading
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 py-10">
                <Lightbulb className="w-10 h-10 mb-3" />
                <p className="text-lg text-center">Your personalized tip will appear here.</p>
                <p className="text-sm text-center">Ask a question or click the button to get started!</p>
            </div>
        )}

        </motion.div>

        {/* Historical Tips Section (right column) */}
        <motion.div variants={fadeInUp} className="lg:col-span-1 bg-white rounded-2xl shadow-card p-6 flex flex-col h-[600px]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">All Generated Tips</h2>
            <button
              onClick={fetchHistoricalTips}
              disabled={isLoadingHistory}
              className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh tips"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-600">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Loading historical tips...</p>
            </div>
          ) : historicalTips.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <motion.div variants={staggerContainer} initial="initial" animate="animate">
                {historicalTips.map((tip) => (
                  <motion.div
                    key={tip.id}
                    variants={fadeInUp}
                    className="bg-gray-50 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-800 font-medium">{tip.tipText}</p>
                        <span className="text-xs text-gray-500 mt-1 block">
                          Generated: {new Date(tip.createdAt).toLocaleDateString()} at {new Date(tip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 py-10">
              <AlertCircle className="w-10 h-10 mb-3" />
              <p className="text-lg text-center">No historical tips found.</p>
              <p className="text-sm text-center">Generate a new tip to see it here!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Stats - Updated to reflect actual generated tips count */}
      <div className="mt-8 bg-gradient-to-r from-green-primary to-green-600 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{historicalTips.length}+</div> {/* Reflects actual generated tips */}
            <div className="text-green-100">Energy Saving Tips Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">$500+</div>
            <div className="text-green-100">Potential Annual Savings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">30%</div>
            <div className="text-green-100">Average Energy Reduction</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnergyTips;
