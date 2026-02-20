import { useState } from "react";
import { motion } from "framer-motion";
import { User, KeyRound, Zap } from "lucide-react";

export default function SpinForm({ onSpin, spinning }) {
  const [username, setUsername] = useState("");
  const [redeemCode, setRedeemCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !redeemCode.trim()) return;
    onSpin(username.trim(), redeemCode.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="dragon-card ornate-corners p-6 md:p-8 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      data-testid="spin-form"
    >
      <h3 className="text-2xl md:text-3xl font-bold font-['Cinzel'] gold-text">
        Spin to Win
      </h3>
      <p className="text-sm font-semibold text-[#D4A030]/60 uppercase tracking-[0.2em]">
        Enter your credentials to spin
      </p>

      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4A030]" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="dragon-input w-full pl-12"
            disabled={spinning}
            data-testid="username-input"
          />
        </div>

        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B1B30]" />
          <input
            type="text"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value)}
            placeholder="Redeem Code"
            className="dragon-input w-full pl-12"
            disabled={spinning}
            data-testid="redeem-code-input"
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={spinning || !username.trim() || !redeemCode.trim()}
        className="dragon-btn fire-glow w-full py-4 px-8 text-xl bg-gradient-to-r from-[#9B1B30] to-[#7A1526] text-[#FFD700] disabled:opacity-40 disabled:cursor-not-allowed"
        whileHover={!spinning ? { scale: 1.02 } : {}}
        whileTap={!spinning ? { scale: 0.98 } : {}}
        data-testid="spin-button"
      >
        <span className="flex items-center justify-center gap-2">
          <Zap className="w-6 h-6" />
          {spinning ? "Spinning..." : "SPIN THE WHEEL"}
        </span>
      </motion.button>
    </motion.form>
  );
}
