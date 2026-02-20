import { motion } from "framer-motion";

export default function DragonSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10" data-testid="dragon-decoration">
      {/* Left Dragon - gripping wheel */}
      <motion.svg
        viewBox="0 0 300 700"
        className="absolute left-[-80px] sm:left-[-50px] md:left-[-20px] top-[-30px] w-[180px] sm:w-[220px] md:w-[260px] h-auto"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <defs>
          <linearGradient id="bodyGoldL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="40%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="bodyRedL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC143C" />
            <stop offset="100%" stopColor="#8B0000" />
          </linearGradient>
          <linearGradient id="fireL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B3D" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
          <filter id="dragonGlowL">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dragon body - serpentine curve from top down to wheel */}
        <motion.path
          d="M200,20 C230,60 250,120 220,170 C190,220 140,230 170,290 C200,350 240,370 220,420 C200,460 170,480 190,520"
          fill="none"
          stroke="url(#bodyGoldL)"
          strokeWidth="22"
          strokeLinecap="round"
          filter="url(#dragonGlowL)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 0.4 }}
        />
        {/* Body red underbelly stripe */}
        <motion.path
          d="M200,25 C228,62 246,118 218,168 C192,216 145,228 172,286 C198,345 236,366 218,416 C200,455 172,476 188,515"
          fill="none"
          stroke="url(#bodyRedL)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 0.6 }}
        />

        {/* Scales */}
        {[170, 290, 420].map((y, i) => (
          <g key={i}>
            <motion.path
              d={`M${i % 2 === 0 ? 210 : 165},${y - 15} Q${i % 2 === 0 ? 225 : 150},${y} ${i % 2 === 0 ? 210 : 165},${y + 15}`}
              fill="none"
              stroke="#FFD700"
              strokeWidth="2"
              opacity="0.6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.2 }}
            />
            <motion.ellipse
              cx={i % 2 === 0 ? 215 : 160}
              cy={y}
              rx="8"
              ry="12"
              fill="url(#bodyRedL)"
              stroke="#DAA520"
              strokeWidth="1"
              opacity="0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.15 }}
            />
          </g>
        ))}

        {/* CLAW gripping the wheel - bottom right */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {/* Arm reaching to grip */}
          <path
            d="M190,520 C200,540 220,555 245,560"
            fill="none"
            stroke="url(#bodyGoldL)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Claw fingers */}
          <path d="M245,555 L265,545 L258,555 L275,552 L262,560 L278,562 L260,566" fill="url(#bodyGoldL)" stroke="#8B6914" strokeWidth="1.5" />
          {/* Claw tips */}
          <path d="M265,545 L270,538" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M275,552 L282,547" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M278,562 L285,559" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Dragon HEAD */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          {/* Head base */}
          <path
            d="M170,0 L215,0 L235,18 L230,40 L215,52 L185,55 L160,42 L155,20 Z"
            fill="url(#bodyRedL)"
            stroke="#DAA520"
            strokeWidth="2"
          />
          {/* Mane/frill */}
          <path d="M155,20 C130,10 120,25 125,35 C115,30 110,45 120,48" fill="url(#bodyGoldL)" stroke="#8B6914" strokeWidth="1" />
          <path d="M160,42 C135,45 128,55 140,60" fill="url(#bodyGoldL)" stroke="#8B6914" strokeWidth="1" />
          {/* Horns */}
          <path d="M180,0 L172,-22 L185,-5" fill="url(#bodyGoldL)" stroke="#8B6914" strokeWidth="1" />
          <path d="M205,0 L210,-20 L200,-3" fill="url(#bodyGoldL)" stroke="#8B6914" strokeWidth="1" />
          {/* Eyes */}
          <ellipse cx="190" cy="18" rx="6" ry="5" fill="#FFD700" />
          <ellipse cx="190" cy="18" rx="3" ry="4" fill="#1a0a0a" />
          <circle cx="189" cy="16" r="1.5" fill="#FFF" opacity="0.8" />
          <ellipse cx="215" cy="20" rx="5" ry="4" fill="#FFD700" />
          <ellipse cx="215" cy="20" rx="2.5" ry="3.5" fill="#1a0a0a" />
          <circle cx="214" cy="18" r="1.2" fill="#FFF" opacity="0.8" />
          {/* Snout */}
          <path d="M230,25 L248,20 L250,30 L235,35" fill="url(#bodyRedL)" stroke="#DAA520" strokeWidth="1" />
          {/* Nostril */}
          <circle cx="245" cy="24" r="2" fill="#1a0a0a" />
          {/* Mouth / Jaw */}
          <path d="M235,35 L255,38 L250,42 L230,40" fill="#5C0A1A" stroke="#DAA520" strokeWidth="1" />
          {/* Teeth */}
          <path d="M238,35 L240,38 L242,35 L244,38 L246,35" fill="#FFF8E7" />

          {/* Fire breath */}
          <motion.g
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <path d="M255,28 C268,20 280,28 275,35 C285,28 290,38 278,40 C288,36 285,45 272,42" fill="url(#fireL)" opacity="0.9" />
            <path d="M258,32 C265,28 272,33 268,37" fill="#FFD700" opacity="0.5" />
          </motion.g>

          {/* Whiskers */}
          <motion.path
            d="M248,22 C270,12 285,18 290,8"
            fill="none" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"
            animate={{ d: ["M248,22 C270,12 285,18 290,8", "M248,22 C270,15 285,14 290,12", "M248,22 C270,12 285,18 290,8"] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          <motion.path
            d="M250,35 C272,38 288,32 295,38"
            fill="none" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"
            animate={{ d: ["M250,35 C272,38 288,32 295,38", "M250,35 C272,42 288,36 295,42", "M250,35 C272,38 288,32 295,38"] }}
            transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
          />
        </motion.g>

        {/* Upper claw (near head) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <path d="M215,52 C230,65 250,72 265,68" fill="none" stroke="url(#bodyGoldL)" strokeWidth="8" strokeLinecap="round" />
          <path d="M265,65 L278,58 L272,65 L285,63 L270,70" fill="url(#bodyGoldL)" stroke="#8B6914" strokeWidth="1" />
          <path d="M278,58 L282,52" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M285,63 L290,58" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </motion.svg>

      {/* Right Dragon (mirrored) */}
      <motion.svg
        viewBox="0 0 300 700"
        className="absolute right-[-80px] sm:right-[-50px] md:right-[-20px] top-[-30px] w-[180px] sm:w-[220px] md:w-[260px] h-auto"
        style={{ transform: "scaleX(-1)" }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <defs>
          <linearGradient id="bodyGoldR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="40%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="bodyRedR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC143C" />
            <stop offset="100%" stopColor="#8B0000" />
          </linearGradient>
          <linearGradient id="fireR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B3D" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
          <filter id="dragonGlowR">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <motion.path
          d="M200,20 C230,60 250,120 220,170 C190,220 140,230 170,290 C200,350 240,370 220,420 C200,460 170,480 190,520"
          fill="none" stroke="url(#bodyGoldR)" strokeWidth="22" strokeLinecap="round" filter="url(#dragonGlowR)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.6 }}
        />
        <motion.path
          d="M200,25 C228,62 246,118 218,168 C192,216 145,228 172,286 C198,345 236,366 218,416 C200,455 172,476 188,515"
          fill="none" stroke="url(#bodyRedR)" strokeWidth="10" strokeLinecap="round" opacity="0.7"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.8 }}
        />

        {[170, 290, 420].map((y, i) => (
          <motion.ellipse key={i} cx={i % 2 === 0 ? 215 : 160} cy={y} rx="8" ry="12"
            fill="url(#bodyRedR)" stroke="#DAA520" strokeWidth="1" opacity="0.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 + i * 0.15 }}
          />
        ))}

        {/* Claw gripping */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
          <path d="M190,520 C200,540 220,555 245,560" fill="none" stroke="url(#bodyGoldR)" strokeWidth="14" strokeLinecap="round" />
          <path d="M245,555 L265,545 L258,555 L275,552 L262,560 L278,562 L260,566" fill="url(#bodyGoldR)" stroke="#8B6914" strokeWidth="1.5" />
          <path d="M265,545 L270,538" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M275,552 L282,547" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M278,562 L285,559" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Head */}
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 100 }}>
          <path d="M170,0 L215,0 L235,18 L230,40 L215,52 L185,55 L160,42 L155,20 Z" fill="url(#bodyRedR)" stroke="#DAA520" strokeWidth="2" />
          <path d="M155,20 C130,10 120,25 125,35 C115,30 110,45 120,48" fill="url(#bodyGoldR)" stroke="#8B6914" strokeWidth="1" />
          <path d="M160,42 C135,45 128,55 140,60" fill="url(#bodyGoldR)" stroke="#8B6914" strokeWidth="1" />
          <path d="M180,0 L172,-22 L185,-5" fill="url(#bodyGoldR)" stroke="#8B6914" strokeWidth="1" />
          <path d="M205,0 L210,-20 L200,-3" fill="url(#bodyGoldR)" stroke="#8B6914" strokeWidth="1" />
          <ellipse cx="190" cy="18" rx="6" ry="5" fill="#FFD700" />
          <ellipse cx="190" cy="18" rx="3" ry="4" fill="#1a0a0a" />
          <circle cx="189" cy="16" r="1.5" fill="#FFF" opacity="0.8" />
          <ellipse cx="215" cy="20" rx="5" ry="4" fill="#FFD700" />
          <ellipse cx="215" cy="20" rx="2.5" ry="3.5" fill="#1a0a0a" />
          <path d="M230,25 L248,20 L250,30 L235,35" fill="url(#bodyRedR)" stroke="#DAA520" strokeWidth="1" />
          <circle cx="245" cy="24" r="2" fill="#1a0a0a" />
          <path d="M235,35 L255,38 L250,42 L230,40" fill="#5C0A1A" stroke="#DAA520" strokeWidth="1" />
          <path d="M238,35 L240,38 L242,35 L244,38 L246,35" fill="#FFF8E7" />
          <motion.g animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}>
            <path d="M255,28 C268,20 280,28 275,35 C285,28 290,38 278,40" fill="url(#fireR)" opacity="0.9" />
          </motion.g>
          <motion.path d="M248,22 C270,12 285,18 290,8" fill="none" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"
            animate={{ d: ["M248,22 C270,12 285,18 290,8", "M248,22 C270,15 285,14 290,12", "M248,22 C270,12 285,18 290,8"] }}
            transition={{ repeat: Infinity, duration: 3, delay: 0.3 }}
          />
        </motion.g>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
          <path d="M215,52 C230,65 250,72 265,68" fill="none" stroke="url(#bodyGoldR)" strokeWidth="8" strokeLinecap="round" />
          <path d="M265,65 L278,58 L272,65 L285,63 L270,70" fill="url(#bodyGoldR)" stroke="#8B6914" strokeWidth="1" />
          <path d="M278,58 L282,52" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </motion.svg>
    </div>
  );
}
