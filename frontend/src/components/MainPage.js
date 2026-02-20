import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, History } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import LuckyWheel from "@/components/LuckyWheel";
import SpinForm from "@/components/SpinForm";
import WinnersList from "@/components/WinnersList";
import WinModal from "@/components/WinModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MainPage() {
  const [prizes, setPrizes] = useState([]);
  const [history, setHistory] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const wheelRef = useRef(null);

  const fetchPrizes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/prizes`);
      setPrizes(res.data.prizes || []);
    } catch (err) {
      console.error("Failed to fetch prizes:", err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/history`);
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  useEffect(() => {
    fetchPrizes();
    fetchHistory();
  }, [fetchPrizes, fetchHistory]);

  const handleSpin = async (username, redeemCode) => {
    if (spinning) return;

    try {
      const res = await axios.post(`${API}/spin`, { username, redeem_code: redeemCode });
      const prize = res.data.prize;

      // Find the prize index on the wheel
      const prizeIndex = prizes.findIndex(p => p.label === prize.label);
      const idx = prizeIndex >= 0 ? prizeIndex : 0;

      // Start wheel animation
      const canvas = document.querySelector('[data-testid="wheel-canvas"]');
      if (canvas && canvas.startSpin) {
        canvas.startSpin(idx);
      }

      // Set the won prize for the modal
      setWonPrize(prize);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to spin. Please try again.";
      toast.error(msg);
    }
  };

  const handleSpinEnd = () => {
    if (wonPrize) {
      setShowWin(true);
      fetchHistory();
    }
  };

  const handleCloseWin = () => {
    setShowWin(false);
    setWonPrize(null);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6]" data-testid="main-page">
      {/* Header */}
      <motion.header
        className="px-6 md:px-12 py-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#8B5CF6]" />
          <h1 className="text-2xl md:text-3xl font-bold font-['Fredoka'] text-[#1F1F1F]">
            Lucky Wheel
          </h1>
        </div>
        <a
          href="/admin"
          className="text-sm font-bold text-[#8B5CF6] hover:underline flex items-center gap-1"
          data-testid="admin-link"
        >
          Admin
        </a>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 md:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Desktop: Split Layout / Mobile: Stacked */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left: Wheel */}
            <motion.div
              className="flex-1 flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.h2
                className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Fredoka'] text-center mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-[#8B5CF6]">Try</span>{" "}
                <span className="text-[#F472B6]">Your</span>{" "}
                <span className="text-[#06B6D4]">Luck!</span>
              </motion.h2>
              <p className="text-base md:text-lg text-[#666] font-medium text-center mb-8">
                Spin the wheel and win exciting prizes
              </p>

              <div className="mb-8">
                <LuckyWheel
                  ref={wheelRef}
                  prizes={prizes}
                  spinning={spinning}
                  setSpinning={setSpinning}
                  onSpinEnd={handleSpinEnd}
                />
              </div>
            </motion.div>

            {/* Right: Form + History */}
            <div className="lg:w-[400px] xl:w-[440px] flex flex-col gap-8">
              <SpinForm onSpin={handleSpin} spinning={spinning} />

              {/* History Section */}
              <div className="flex items-center gap-2 -mb-4">
                <History className="w-5 h-5 text-[#06B6D4]" />
                <span className="text-sm font-bold uppercase tracking-widest text-[#06B6D4]">
                  Live Winners
                </span>
              </div>
              <WinnersList history={history} />
            </div>
          </div>
        </div>
      </main>

      {/* Win Modal */}
      <WinModal show={showWin} prize={wonPrize} onClose={handleCloseWin} />
    </div>
  );
}
