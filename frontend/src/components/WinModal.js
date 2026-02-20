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
              colors={["#FFD700", "#D4A030", "#9B1B30", "#B8860B", "#DAA520", "#FF4444", "#FFA500", "#FFEC8B"]}
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
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              className="relative dragon-card ornate-corners p-8 md:p-12 max-w-md w-full text-center z-10"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
              data-testid="win-modal"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1a0a0a] border border-[#D4A030]/30 flex items-center justify-center hover:border-[#D4A030]/60 transition-colors"
                data-testid="win-modal-close"
              >
                <X className="w-4 h-4 text-[#D4A030]" />
              </button>

              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#FFD700]" />
              </motion.div>

              <h2 className="text-3xl md:text-5xl font-bold font-['Cinzel'] gold-text mb-2">
                YOU WON!
              </h2>

              <motion.div
                className="my-6 py-6 px-4 rounded-2xl border border-[#D4A030]/40 bg-[#9B1B30]/15"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                data-testid="prize-display"
              >
                <p className="text-4xl md:text-6xl font-bold font-['Cinzel'] gold-text">
                  {prize.points}
                </p>
                <p className="text-lg font-bold text-[#FFF8E7] mt-1 font-['Cinzel']">
                  {prize.label}
                </p>
              </motion.div>

              <p className="text-[#D4A030]/60 font-medium mb-6">
                Congratulations on your magnificent victory!
              </p>

              <motion.button
                onClick={onClose}
                className="dragon-btn bg-gradient-to-r from-[#D4A030] to-[#B8860B] text-[#1a0a0a] px-8 py-3 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="win-modal-ok"
              >
                Claim Victory
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
