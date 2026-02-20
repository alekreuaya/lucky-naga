import { motion } from "framer-motion";
import { Trophy, Clock } from "lucide-react";

export default function WinnersList({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="dragon-card p-6 md:p-8 text-center" data-testid="winners-list-empty">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-[#D4A030]" />
        <p className="text-lg font-bold font-['Cinzel'] text-[#D4A030]/60">No winners yet</p>
        <p className="text-sm text-[#D4A030]/30">Be the first to spin!</p>
      </div>
    );
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="dragon-card p-6 md:p-8" data-testid="winners-list">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-[#FFD700]" />
        <h3 className="text-2xl md:text-3xl font-bold font-['Cinzel'] gold-text">
          Recent Winners
        </h3>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {history.slice(0, 20).map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl bg-[#1a0a0a]/60 border border-[#D4A030]/15 hover:border-[#D4A030]/35 transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            data-testid={`winner-item-${index}`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#FFD700] font-bold text-xs shrink-0 border border-[#D4A030]/30"
              style={{ backgroundColor: "#9B1B30" }}
            >
              {item.prize_points}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#FFF8E7] truncate font-['Cinzel'] text-sm">{item.username}</p>
              <p className="text-sm font-semibold text-[#D4A030]">
                {item.prize_label}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#D4A030]/40 shrink-0">
              <Clock className="w-3 h-3" />
              {formatTime(item.drawn_at)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
