import { AnimatePresence } from "motion/react";
import { motion, type Variants } from 'framer-motion';
import { CheckCircle, XCircle } from "lucide-react";

const messageBoxVariants:Variants = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 20 } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
};

export const MessageBox = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <AnimatePresence>
    <motion.div
      variants={messageBoxVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`fixed top-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl z-50 flex items-center space-x-3 border-2 ${type === "success" ? "border-green-500" : "border-red-500"}`}
    >
      {type === "success" ? (
        <CheckCircle className="w-6 h-6 text-green-500" />
      ) : (
        <XCircle className="w-6 h-6 text-red-500" />
      )}
      <p className={`text-lg font-semibold ${type === "success" ? "text-green-700" : "text-red-700"}`}>
        {message}
      </p>
      <motion.button
        onClick={onClose}
        className={`ml-4 px-3 py-1 rounded-lg font-medium transition-colors ${type === "success" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`}
        whileHover={{ scale: 1.05 }}
      >
        OK
      </motion.button>
    </motion.div>
  </AnimatePresence>
);
