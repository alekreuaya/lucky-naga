import { motion } from "framer-motion";

const DRAGON_IMAGE = "https://customer-assets.emergentagent.com/job_dc52c29e-a80c-443c-b910-34fef7a5ad1f/artifacts/1jopxgos_watermarked-d2698214-2b91-46d5-b7e2-c2a8cea08b57%20%281%29.jpg";

export default function DragonFrame() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-[1] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.3 }}
      data-testid="dragon-decoration"
    >
      <img
        src={DRAGON_IMAGE}
        alt="Dragon Frame"
        className="w-full h-full object-contain"
        style={{
          filter: "drop-shadow(0 0 25px rgba(212,160,48,0.35)) drop-shadow(0 0 60px rgba(155,27,48,0.2))",
        }}
        draggable={false}
      />
    </motion.div>
  );
}
