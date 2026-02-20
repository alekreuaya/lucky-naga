import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";

export default function WinModal({ show, prize, onClose }) {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || !prize) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={500}
              recycle={false}
              colors={["#8B5CF6", "#F472B6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"]}
              data-testid="confetti-animation"
            />
          )}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="win-modal-overlay"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              className="relative neo-card p-8 md:p-12 max-w-md w-full text-center z-10"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
              data-testid="win-modal"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FDF8F6] border-2 border-[#1F1F1F] flex items-center justify-center hover:bg-[#EEE] transition-colors"
                data-testid="win-modal-close"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#F59E0B]" />
              </motion.div>

              <h2 className="text-3xl md:text-5xl font-bold font-['Fredoka'] mb-2" style={{ color: prize.color }}>
                YOU WON!
              </h2>

              <motion.div
                className="my-6 py-6 px-4 rounded-3xl border-2 border-[#1F1F1F]"
                style={{ backgroundColor: prize.color + "15" }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                data-testid="prize-display"
              >
                <p className="text-4xl md:text-6xl font-bold font-['Fredoka']" style={{ color: prize.color }}>
                  {prize.points}
                </p>
                <p className="text-lg font-bold text-[#1F1F1F] mt-1">
                  {prize.label}
                </p>
              </motion.div>

              <p className="text-[#666] font-medium mb-6">
                Congratulations on your amazing win!
              </p>

              <motion.button
                onClick={onClose}
                className="neo-btn bg-[#10B981] text-white px-8 py-3 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="win-modal-ok"
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
