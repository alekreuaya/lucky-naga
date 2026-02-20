import { motion } from "framer-motion";

export default function DragonSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none" data-testid="dragon-decoration">
      {/* Left Dragon */}
      <motion.svg
        viewBox="0 0 200 600"
        className="absolute left-[-60px] md:left-[-30px] top-[10%] w-[160px] md:w-[200px] h-auto opacity-50 md:opacity-70"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 0.7, x: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        {/* Dragon body - left side curving around */}
        <defs>
          <linearGradient id="dragonGoldL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#D4A030" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <linearGradient id="dragonRedL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B1B30" />
            <stop offset="100%" stopColor="#5C0A1A" />
          </linearGradient>
          <filter id="glowL">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Dragon serpentine body */}
        <motion.path
          d="M140,30 C160,60 180,100 160,140 C140,180 100,190 120,230 C140,270 180,280 160,320 C140,360 100,370 120,410 C140,450 180,460 160,500 C140,540 120,560 140,580"
          fill="none"
          stroke="url(#dragonGoldL)"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#glowL)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        
        {/* Scales along body */}
        {[140, 230, 320, 410, 500].map((y, i) => (
          <motion.ellipse
            key={i}
            cx={i % 2 === 0 ? 155 : 115}
            cy={y}
            rx="12"
            ry="8"
            fill="url(#dragonRedL)"
            stroke="#D4A030"
            strokeWidth="1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + i * 0.2 }}
          />
        ))}
        
        {/* Dragon head (top) */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {/* Head shape */}
          <path
            d="M120,10 L155,5 L165,25 L155,45 L130,50 L115,35 Z"
            fill="url(#dragonRedL)"
            stroke="#D4A030"
            strokeWidth="1.5"
          />
          {/* Eye */}
          <circle cx="142" cy="22" r="4" fill="#FFD700" />
          <circle cx="142" cy="22" r="2" fill="#1a0a0a" />
          {/* Horn */}
          <path d="M150,5 L160,-10 L145,2" fill="#D4A030" />
          <path d="M130,8 L125,-8 L135,5" fill="#D4A030" />
          {/* Nostril flame */}
          <motion.path
            d="M165,25 C172,20 178,28 170,32 C175,26 168,22 165,25"
            fill="#FF6B3D"
            opacity="0.8"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.g>

        {/* Whiskers / tendrils */}
        <motion.path
          d="M115,35 C80,25 60,40 50,20"
          fill="none"
          stroke="#D4A030"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ d: ["M115,35 C80,25 60,40 50,20", "M115,35 C80,30 60,35 50,25", "M115,35 C80,25 60,40 50,20"] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
        <motion.path
          d="M120,42 C85,45 65,60 55,45"
          fill="none"
          stroke="#D4A030"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ d: ["M120,42 C85,45 65,60 55,45", "M120,42 C85,50 65,55 55,50", "M120,42 C85,45 65,60 55,45"] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
        />

        {/* Tail (bottom) */}
        <motion.path
          d="M140,580 C150,590 145,600 130,595 C120,590 125,580 140,580"
          fill="url(#dragonGoldL)"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          style={{ transformOrigin: "140px 580px" }}
        />
      </motion.svg>

      {/* Right Dragon (mirrored) */}
      <motion.svg
        viewBox="0 0 200 600"
        className="absolute right-[-60px] md:right-[-30px] top-[10%] w-[160px] md:w-[200px] h-auto opacity-50 md:opacity-70"
        style={{ transform: "scaleX(-1)" }}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 0.7, x: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      >
        <defs>
          <linearGradient id="dragonGoldR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#D4A030" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <linearGradient id="dragonRedR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B1B30" />
            <stop offset="100%" stopColor="#5C0A1A" />
          </linearGradient>
          <filter id="glowR">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <motion.path
          d="M140,30 C160,60 180,100 160,140 C140,180 100,190 120,230 C140,270 180,280 160,320 C140,360 100,370 120,410 C140,450 180,460 160,500 C140,540 120,560 140,580"
          fill="none"
          stroke="url(#dragonGoldR)"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#glowR)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.7 }}
        />
        
        {[140, 230, 320, 410, 500].map((y, i) => (
          <motion.ellipse
            key={i}
            cx={i % 2 === 0 ? 155 : 115}
            cy={y}
            rx="12"
            ry="8"
            fill="url(#dragonRedR)"
            stroke="#D4A030"
            strokeWidth="1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.2 }}
          />
        ))}
        
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <path
            d="M120,10 L155,5 L165,25 L155,45 L130,50 L115,35 Z"
            fill="url(#dragonRedR)"
            stroke="#D4A030"
            strokeWidth="1.5"
          />
          <circle cx="142" cy="22" r="4" fill="#FFD700" />
          <circle cx="142" cy="22" r="2" fill="#1a0a0a" />
          <path d="M150,5 L160,-10 L145,2" fill="#D4A030" />
          <path d="M130,8 L125,-8 L135,5" fill="#D4A030" />
          <motion.path
            d="M165,25 C172,20 178,28 170,32 C175,26 168,22 165,25"
            fill="#FF6B3D"
            opacity="0.8"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
          />
        </motion.g>

        <motion.path
          d="M115,35 C80,25 60,40 50,20"
          fill="none"
          stroke="#D4A030"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ d: ["M115,35 C80,25 60,40 50,20", "M115,35 C80,30 60,35 50,25", "M115,35 C80,25 60,40 50,20"] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.3 }}
        />
        <motion.path
          d="M120,42 C85,45 65,60 55,45"
          fill="none"
          stroke="#D4A030"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ d: ["M120,42 C85,45 65,60 55,45", "M120,42 C85,50 65,55 55,50", "M120,42 C85,45 65,60 55,45"] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.8 }}
        />

        <motion.path
          d="M140,580 C150,590 145,600 130,595 C120,590 125,580 140,580"
          fill="url(#dragonGoldR)"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1.2 }}
          style={{ transformOrigin: "140px 580px" }}
        />
      </motion.svg>
    </div>
  );
}
