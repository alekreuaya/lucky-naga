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
      setWonPrize(prize);
      if (wheelRef.current && wheelRef.current.startSpin) {
        wheelRef.current.startSpin(idx);
      } else {
        // Fallback: if wheel ref not ready, still show modal after short delay
        console.warn("Wheel ref not available, showing modal directly");
        setTimeout(() => {
          setShowWin(true);
          fetchHistory();
        }, 500);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to spin. Please try again.";
      toast.error(msg);
    }
  };

  const handleSpinEnd = () => {
    setShowWin(true);
    fetchHistory();
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
                className="dragon-container relative mb-8"
                style={{ 
                  width: '500px', 
                  height: '500px',
                }}
                data-testid="dragon-container"
              >
                {/* Wheel Container - NATURAL center, no offsets */}
                <div 
                  className="wheel-wrapper absolute flex items-center justify-center"
                  style={{
                    position: 'absolute',
                    width: '325px',
                    height: '325px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                  data-testid="wheel-wrapper"
                >
                  <LuckyWheel
                    ref={wheelRef}
                    prizes={prizes}
                    spinning={spinning}
                    setSpinning={setSpinning}
                    onSpinEnd={handleSpinEnd}
                  />
                </div>

                {/* Dragon frame - shifted to match wheel's natural center */}
                <img
                  src="https://customer-assets.emergentagent.com/wingman/c27e33be-75fc-4a30-9656-213581633813/attachments/d335098d229e40a7a93ad2d2bbf1b1f0_dragon.png"
                  alt="Dragon Frame"
                  className="absolute pointer-events-none"
                  style={{ 
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    zIndex: 20,
                    transform: 'translate(-5px, -35px)',
                    filter: 'drop-shadow(0 0 20px rgba(218,165,32,0.5))'
                  }}
                />

                {/* Pointer/Indicator - at natural top-center of wheel */}
                <img
                  src="/shard-indicator.png"
                  alt="Indicator"
                  className="absolute pointer-events-none"
                  style={{
                    position: 'absolute',
                    zIndex: 30,
                    left: '50%',
                    top: '75px',
                    width: '50px',
                    height: 'auto',
                    transform: 'translateX(-50%)',
                    filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))'
                  }}
                  data-testid="wheel-indicator"
                />
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

          {/* Informational sections - Cara Bermain & Syarat Ketentuan */}
          <motion.section
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            data-testid="info-sections"
          >
            {/* Cara Bermain */}
            <div
              className="relative rounded-2xl border border-[#D4A030]/30 bg-gradient-to-br from-[#1a0a0a] to-[#2a0f0f] p-6 md:p-8 shadow-[0_0_30px_rgba(218,165,32,0.08)]"
              data-testid="cara-bermain-section"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A030] to-[#B8860B] text-[#1a0a0a] font-bold font-['Cinzel'] text-lg shadow-md">
                  ?
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-['Cinzel'] gold-text">
                  Cara Bermain
                </h3>
              </div>
              <p className="text-[#D4A030]/70 italic text-sm md:text-base mb-5">
                Langkah Mudah Mengikuti Lucky Spin NAGA1001:
              </p>
              <ol className="space-y-4">
                {[
                  { t: "Login", d: "Masukkan Username resmi Anda yang terdaftar." },
                  { t: "Kode Redeem", d: "Masukkan 8 digit Kode Redeem yang Anda dapatkan dari Admin atau Customer Service." },
                  { t: "Putar Roda", d: "Klik tombol 'PUTAR RODA' dan tunggu hingga naga berhenti memberikan keberuntungan Anda." },
                  { t: "Klaim Hadiah", d: "Jika Anda menang, ambil screenshot hasil kemenangan dan hubungi Livechat kami untuk klaim." },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-[#9B1B30]/40 border border-[#D4A030]/50 flex items-center justify-center text-[#D4A030] font-bold font-['Cinzel']">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-[#FFD700] mb-1">{step.t}:</p>
                      <p className="text-[#F5E6C8]/80 text-sm md:text-base leading-relaxed">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Syarat & Ketentuan */}
            <div
              className="relative rounded-2xl border border-[#D4A030]/30 bg-gradient-to-br from-[#1a0a0a] to-[#2a0f0f] p-6 md:p-8 shadow-[0_0_30px_rgba(218,165,32,0.08)]"
              data-testid="syarat-ketentuan-section"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A030] to-[#B8860B] text-[#1a0a0a] font-bold font-['Cinzel'] text-lg shadow-md">
                  !
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-['Cinzel'] gold-text">
                  Syarat &amp; Ketentuan
                </h3>
              </div>
              <p className="text-[#D4A030]/70 italic text-sm md:text-base mb-5">
                Peraturan Event Lucky Spin:
              </p>
              <ul className="space-y-3">
                {[
                  "Setiap kode redeem hanya dapat digunakan satu kali per akun.",
                  "Pemenang wajib melakukan screenshot saat mendapatkan hadiah.",
                  "Hadiah tidak dapat diuangkan dan harus diklaim dalam waktu 1x24 jam.",
                  "Keputusan manajemen NAGA1001 bersifat mutlak dan tidak dapat diganggu gugat.",
                ].map((rule, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_6px_rgba(255,215,0,0.6)]" />
                    <p className="text-[#F5E6C8]/85 text-sm md:text-base leading-relaxed">{rule}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        </div>
      </main>

      <WinModal show={showWin} prize={wonPrize} onClose={handleCloseWin} />
    </div>
  );
}
