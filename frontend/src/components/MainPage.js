import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import LuckyWheel from "@/components/LuckyWheel";
import SpinForm from "@/components/SpinForm";
import WinnersList from "@/components/WinnersList";
import WinModal from "@/components/WinModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_GIF = "https://customer-assets.emergentagent.com/job_fortune-wheel-hub/artifacts/0p68npsx_gif%20naga1001.gif";
const DRAGON_FRAME = "https://res.cloudinary.com/dagep4x49/image/upload/v1782912552/wheel_naga_b64j7d.png";

// Ukuran frame dragon dan wheel harus proporsional
// Frame: 1254x1254, lingkaran roda ada di tengah
// Kita tampilkan frame di 500x500px → rasio = 500/1254 = 0.3987
// Diameter lingkaran roda di dalam frame kira-kira 58% dari lebar frame
// → 500 * 0.58 = 290px → kita set wheel 290px agar pas di dalam lingkaran
const FRAME_SIZE = 500;   // ukuran frame dragon yang ditampilkan (px)
const WHEEL_SIZE = 295;   // ukuran wheel agar pas di dalam lingkaran frame

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
      if (wheelRef.current?.startSpin) {
        wheelRef.current.startSpin(idx);
      } else {
        setTimeout(() => { setShowWin(true); fetchHistory(); }, 500);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Gagal spin. Coba lagi.";
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
    <div
      className="min-h-screen bg-[#0f0505]"
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(155,27,48,0.18) 0%, transparent 65%)' }}
      data-testid="main-page"
    >
      {/* ── HEADER ── */}
      <motion.header
        className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-[#D4A030]/12"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <img src={LOGO_GIF} alt="NAGA1001" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold font-['Cinzel'] gold-text tracking-widest">NAGA1001</span>
        </div>
        <a
          href="https://okenaga.com/nagalogin"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold font-['Cinzel'] tracking-wider transition-all duration-300 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#D4A030,#B8860B)', color: '#0f0505' }}
        >
          MASUK NAGA1001
        </a>
      </motion.header>

      {/* ── MAIN ── */}
      <main className="px-4 md:px-10 pb-16 pt-4">
        <div className="max-w-7xl mx-auto">

          {/* Title */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Cinzel'] gold-text leading-tight">
              Lucky Spin
            </h1>
            <p className="text-[#D4A030]/50 text-sm sm:text-base tracking-widest mt-2 uppercase font-medium">
              Putar roda &amp; raih hadiahmu
            </p>
          </motion.div>

          {/* Content grid */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start justify-center">

            {/* ── WHEEL + DRAGON FRAME ── */}
            <motion.div
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              {/*
                Container: FRAME_SIZE x FRAME_SIZE
                Dragon image: absolute, fills 100% container, pointer-events-none
                Wheel: absolute, centered via translate(-50%,-50%)
                Pointer: bawaan LuckyWheel (built-in SVG)
              */}
              <div
                className="relative flex-shrink-0"
                style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
                data-testid="dragon-container"
              >
                {/* Ambient glow */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(218,165,32,0.12) 30%, transparent 70%)',
                    zIndex: 0,
                  }}
                />

                {/* Spinning outer ring when active */}
                <AnimatePresence>
                  {spinning && (
                    <motion.div
                      className="absolute pointer-events-none rounded-full"
                      style={{
                        inset: FRAME_SIZE * 0.17,
                        border: '2px solid transparent',
                        borderTopColor: '#FFD700',
                        borderRightColor: 'rgba(212,160,48,0.4)',
                        zIndex: 5,
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    />
                  )}
                </AnimatePresence>

                {/* ── WHEEL — tepat di tengah container ── */}
                <div
                  className="absolute"
                  style={{
                    width: WHEEL_SIZE,
                    height: WHEEL_SIZE,
                    top: '50%',
                    left: '50%',
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
                    size={WHEEL_SIZE}
                  />
                </div>

                {/* ── DRAGON FRAME — di atas wheel, pointer-events-none ── */}
                <img
                  src={DRAGON_FRAME}
                  alt="Dragon Frame"
                  className="absolute inset-0 w-full h-full pointer-events-none select-none"
                  style={{
                    objectFit: 'contain',
                    zIndex: 20,
                    filter: 'drop-shadow(0 0 24px rgba(218,165,32,0.35))',
                  }}
                  draggable={false}
                  data-testid="dragon-frame"
                />
              </div>

              {/* Mobile CTA */}
              <a
                href="https://okenaga.com/nagalogin"
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden mt-4 px-8 py-3 rounded-full font-bold text-base font-['Cinzel'] tracking-wider"
                style={{ background: 'linear-gradient(135deg,#D4A030,#B8860B)', color: '#0f0505' }}
                data-testid="mobile-naga-button"
              >
                MASUK NAGA1001
              </a>
            </motion.div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:w-[400px] xl:w-[440px] flex flex-col gap-6 w-full">
              <SpinForm onSpin={handleSpin} spinning={spinning} />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-[#D4A030]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A030]/60 font-['Cinzel']">
                    Pemenang Terbaru
                  </span>
                </div>
                <WinnersList history={history} />
              </div>
            </div>
          </div>

          {/* ── INFO SECTIONS ── */}
          <motion.section
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            data-testid="info-sections"
          >
            {/* Cara Bermain */}
            <div
              className="rounded-2xl border border-[#D4A030]/25 p-6 md:p-8"
              style={{ background: 'linear-gradient(135deg, rgba(26,10,10,0.9), rgba(42,15,15,0.9))' }}
              data-testid="cara-bermain-section"
            >
              <h3 className="text-xl md:text-2xl font-bold font-['Cinzel'] gold-text mb-5">
                🎯 Cara Bermain
              </h3>
              <p className="text-[#D4A030]/60 text-sm mb-5 italic">Langkah mudah mengikuti Lucky Spin:</p>
              <ol className="space-y-4">
                {[
                  { t: "Login", d: "Masukkan Username resmi Anda yang terdaftar di Naga1001." },
                  { t: "Kode Redeem", d: "Masukkan 8 digit Kode Redeem dari Admin atau Customer Service." },
                  { t: "Putar Roda", d: "Klik 'PUTAR RODA' dan tunggu hingga roda berhenti." },
                  { t: "Klaim Hadiah", d: "Screenshot hasilmu dan hubungi Livechat untuk klaim hadiah." },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="shrink-0 w-7 h-7 rounded-full border border-[#D4A030]/50 flex items-center justify-center text-[#D4A030] font-bold font-['Cinzel'] text-sm bg-[#9B1B30]/30">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-[#FFD700] text-sm mb-0.5">{step.t}</p>
                      <p className="text-[#F5E6C8]/75 text-sm leading-relaxed">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Syarat & Ketentuan */}
            <div
              className="rounded-2xl border border-[#D4A030]/25 p-6 md:p-8"
              style={{ background: 'linear-gradient(135deg, rgba(26,10,10,0.9), rgba(42,15,15,0.9))' }}
              data-testid="syarat-ketentuan-section"
            >
              <h3 className="text-xl md:text-2xl font-bold font-['Cinzel'] gold-text mb-5">
                📋 Syarat &amp; Ketentuan
              </h3>
              <p className="text-[#D4A030]/60 text-sm mb-5 italic">Peraturan event Lucky Spin:</p>
              <ul className="space-y-4">
                {[
                  "Setiap kode redeem hanya dapat digunakan satu kali per akun.",
                  "Pemenang wajib screenshot saat mendapatkan hadiah.",
                  "Hadiah tidak dapat diuangkan dan wajib diklaim dalam 1×24 jam.",
                  "Keputusan manajemen NAGA1001 bersifat mutlak dan tidak dapat diganggu gugat.",
                ].map((rule, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-[#FFD700]"
                      style={{ boxShadow: '0 0 6px rgba(255,215,0,0.6)' }} />
                    <p className="text-[#F5E6C8]/80 text-sm leading-relaxed">{rule}</p>
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
