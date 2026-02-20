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
      className="neo-card p-6 md:p-8 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      data-testid="spin-form"
    >
      <h3 className="text-2xl md:text-3xl font-bold font-['Fredoka'] text-[#1F1F1F]">
        Spin to Win!
      </h3>
      <p className="text-sm font-semibold text-[#666] uppercase tracking-widest">
        Enter your credentials to spin
      </p>

      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B5CF6]" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="neo-input w-full pl-12"
            disabled={spinning}
            data-testid="username-input"
          />
        </div>

        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F472B6]" />
          <input
            type="text"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value)}
            placeholder="Redeem Code"
            className="neo-input w-full pl-12"
            disabled={spinning}
            data-testid="redeem-code-input"
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={spinning || !username.trim() || !redeemCode.trim()}
        className="neo-btn w-full py-4 px-8 text-xl bg-[#8B5CF6] text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
