import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { History } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import LuckyWheel from "@/components/LuckyWheel";
import SpinForm from "@/components/SpinForm";
import WinnersList from "@/components/WinnersList";
import WinModal from "@/components/WinModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LOGO_GIF = "https://customer-assets.emergentagent.com/job_fortune-wheel-hub/artifacts/0p68npsx_gif%20naga1001.gif";

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
      const prizeIndex = prizes.findIndex(p => p.label === prize.label);
      const idx = prizeIndex >= 0 ? prizeIndex : 0;
      const canvas = document.querySelector('[data-testid="wheel-canvas"]');
      if (canvas && canvas.startSpin) {
        canvas.startSpin(idx);
      }
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
    <div className="min-h-screen bg-[#1a0a0a] dragon-pattern" data-testid="main-page">
      {/* Header */}
      <motion.header
        className="px-6 md:px-12 py-6 flex items-center justify-center border-b border-[#D4A030]/15"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <img src={LOGO_GIF} alt="NAGA1001" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          <h1 className="text-2xl md:text-3xl font-bold font-['Cinzel'] gold-text">
            NAGA1001
          </h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 md:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left: Wheel */}
            <motion.div
              className="flex-1 flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.h2
                className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Cinzel'] text-center mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="gold-text">Coba Kehokianmu</span>
              </motion.h2>
              <p className="text-base md:text-lg text-[#D4A030]/50 font-medium text-center mb-4 tracking-wider">
                Putar roda dan raih hadiahmu
              </p>
              
              {/* Mobile-only button */}
              <a
                href="https://okenaga.com/supernaga"
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden mb-6 px-8 py-3 bg-gradient-to-r from-[#D4A030] to-[#F4D03F] text-[#1a0a0a] font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                data-testid="mobile-naga-button"
              >
                MASUK NAGA1001
              </a>

              {/* Dragon Container with wheel inside */}
              <div 
                className="dragon-container relative flex items-center justify-center mb-8"
                style={{ 
                  width: '520px', 
                  height: '520px',
                  backgroundImage: 'url(https://customer-assets.emergentagent.com/job_dc52c29e-a80c-443c-b910-34fef7a5ad1f/artifacts/zini58es_ChatGPT%20Image%20May%2031%2C%202026%2C%2008_13_40%20PM.png)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'drop-shadow(0 0 20px rgba(218,165,32,0.3))'
                }}
                data-testid="dragon-container"
              >
                {/* Wheel Container - positioned inside the dragon's circle */}
                <div 
                  className="wheel-container absolute flex items-center justify-center"
                  style={{ marginTop: '40px' }}
                  data-testid="wheel-container"
                >
                  <LuckyWheel
                    ref={wheelRef}
                    prizes={prizes}
                    spinning={spinning}
                    setSpinning={setSpinning}
                    onSpinEnd={handleSpinEnd}
                  />
                </div>
              </div>
            </motion.div>

            {/* Right: Form + History */}
            <div className="lg:w-[400px] xl:w-[440px] flex flex-col gap-8">
              <SpinForm onSpin={handleSpin} spinning={spinning} />

              <div className="flex items-center gap-2 -mb-4">
                <History className="w-5 h-5 text-[#D4A030]" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4A030]/60 font-['Cinzel']">
                  Pemenang Terbaru
                </span>
              </div>
              <WinnersList history={history} />
            </div>
          </div>
        </div>
      </main>

      <WinModal show={showWin} prize={wonPrize} onClose={handleCloseWin} />
    </div>
  );
}
