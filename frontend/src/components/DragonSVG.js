import { motion } from "framer-motion";

const DRAGON_IMAGE = "https://customer-assets.emergentagent.com/job_fortune-wheel-hub/artifacts/hltkrfch_wheelnaga.png";

export default function DragonFrame() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-[20] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.3 }}
      data-testid="dragon-decoration"
    >
      <img
        src={DRAGON_IMAGE}
        alt="Dragon Frame"
        className="w-[340px] h-[340px] sm:w-[430px] sm:h-[430px] md:w-[480px] md:h-[480px] object-contain"
        style={{
          filter: "drop-shadow(0 0 25px rgba(212,160,48,0.35)) drop-shadow(0 0 60px rgba(155,27,48,0.2))",
        }}
        draggable={false}
      />
    </motion.div>
  );
}
