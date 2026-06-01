import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const WHEEL_IMAGE_URL = "https://customer-assets.emergentagent.com/wingman/c27e33be-75fc-4a30-9656-213581633813/attachments/0a1939a425cf471284cb46614a79cf81_wheel.png";
const INDICATOR_IMAGE_URL = "https://customer-assets.emergentagent.com/wingman/c27e33be-75fc-4a30-9656-213581633813/attachments/4c4ed96ac90549aeae1993d4ed25237d_indicator.png";
const CENTER_LOGO_URL = "https://customer-assets.emergentagent.com/job_dc52c29e-a80c-443c-b910-34fef7a5ad1f/artifacts/7zt5x325_logo%20naga1001.jpeg";

export default function LuckyWheel({ prizes, onSpinEnd, spinning, setSpinning }) {
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startRotRef = useRef(0);
  const wheelRef = useRef(null);

  const segmentCount = prizes.length || 8;
  const segmentAngle = 360 / segmentCount;

  // Wheel size - matches wheel-wrapper bounds (325px)
  const wheelSize = 325;

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const animateSpin = useCallback((timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const duration = 4500;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(progress);

    const current = startRotRef.current + (targetRotation - startRotRef.current) * eased;
    setRotation(current);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateSpin);
    } else {
      setRotation(targetRotation);
      setSpinning(false);
      const normalizedAngle = ((360 - (targetRotation % 360)) + 360) % 360;
      const winIndex = Math.floor(normalizedAngle / segmentAngle) % segmentCount;
      if (onSpinEnd) onSpinEnd(winIndex);
    }
  }, [targetRotation, segmentAngle, segmentCount, onSpinEnd, setSpinning]);

  useEffect(() => {
    if (spinning) {
      startTimeRef.current = null;
      startRotRef.current = rotation;
      animationRef.current = requestAnimationFrame(animateSpin);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [spinning, animateSpin, rotation]);

  const startSpin = (prizeIndex) => {
    if (spinning) return;
    const targetAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const target = rotation + fullSpins * 360 + targetAngle - (rotation % 360) + (Math.random() * segmentAngle * 0.4 - segmentAngle * 0.2);
    setTargetRotation(target);
    setSpinning(true);
  };

  useEffect(() => {
    if (wheelRef.current) {
      wheelRef.current.startSpin = startSpin;
    }
  });

  return (
    <div 
      className="wheel-container relative flex items-center justify-center" 
      style={{ width: wheelSize, height: wheelSize }}
      data-testid="wheel-container"
      ref={wheelRef}
    >
      {/* Spinning wheel with image */}
      <motion.div
        className="relative"
        style={{
          width: wheelSize,
          height: wheelSize,
          transform: `rotate(${rotation}deg)`,
        }}
        animate={spinning ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: spinning ? Infinity : 0, duration: 0.5 }}
      >
        {/* Wheel background image - shifted to align PNG visual center with rotation center */}
        <img
          src={WHEEL_IMAGE_URL}
          alt="Wheel"
          className="absolute inset-0 w-full h-full"
          style={{ 
            filter: 'drop-shadow(0 0 15px rgba(218,165,32,0.4))',
            transform: 'translate(1.5px, -6.5px)',
          }}
          draggable={false}
        />

        {/* Divider lines between segments */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${wheelSize} ${wheelSize}`}
        >
          {prizes.map((_, index) => {
            const angle = (index * segmentAngle - 90) * (Math.PI / 180);
            const centerX = wheelSize / 2;
            const centerY = wheelSize / 2;
            const innerRadius = wheelSize * 0.12;
            const outerRadius = wheelSize * 0.46;
            
            const x1 = centerX + Math.cos(angle) * innerRadius;
            const y1 = centerY + Math.sin(angle) * innerRadius;
            const x2 = centerX + Math.cos(angle) * outerRadius;
            const y2 = centerY + Math.sin(angle) * outerRadius;

            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#8B6914"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' }}
              />
            );
          })}
        </svg>

        {/* Prize labels overlay */}
        <div className="absolute inset-0" style={{ width: wheelSize, height: wheelSize }}>
          {prizes.map((prize, index) => {
            const angle = index * segmentAngle + segmentAngle / 2 - 90;
            const radians = (angle * Math.PI) / 180;
            const labelRadius = wheelSize * 0.35;
            const x = Math.cos(radians) * labelRadius + wheelSize / 2;
            const y = Math.sin(radians) * labelRadius + wheelSize / 2;

            return (
              <div
                key={index}
                className="absolute text-center"
                style={{
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                  width: '80px',
                }}
              >
                <span
                  className="text-white font-bold text-xs"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)',
                    fontFamily: 'Cinzel, serif',
                  }}
                >
                  {prize.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center logo */}
        <div
          className="absolute rounded-full overflow-hidden border-4 border-yellow-500"
          style={{
            width: wheelSize * 0.22,
            height: wheelSize * 0.22,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 15px rgba(218,165,32,0.6)',
          }}
        >
          <img
            src={CENTER_LOGO_URL}
            alt="Logo"
            className="w-full h-full object-cover"
            style={{ transform: `rotate(${-rotation}deg)` }}
          />
        </div>
      </motion.div>
    </div>
  );
}
