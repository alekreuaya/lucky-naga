import { motion } from "framer-motion";

const DRAGON_IMAGE = "https://customer-assets.emergentagent.com/job_fortune-wheel-hub/artifacts/hltkrfch_wheelnaga.png";

export default function DragonFrame() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-[5] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
      data-testid="dragon-decoration"
    >
      <img
        src={DRAGON_IMAGE}
        alt="Dragon Frame"
        className="absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] md:w-[490px] md:h-[490px] object-contain"
        style={{ imageRendering: "auto", filter: "drop-shadow(0 0 20px rgba(212,160,48,0.25))" }}
        draggable={false}
      />
    </motion.div>
  );
}
