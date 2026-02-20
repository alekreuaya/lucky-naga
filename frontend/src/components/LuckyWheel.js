import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SEGMENT_COLORS = [
  "#8B5CF6", "#F472B6", "#06B6D4", "#10B981",
  "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"
];

export default function LuckyWheel({ prizes, onSpinEnd, spinning, setSpinning }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startRotRef = useRef(0);

  const segmentCount = prizes.length || 8;
  const segmentAngle = 360 / segmentCount;

  const drawWheel = useCallback((currentRotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentRotation * Math.PI) / 180);

    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (i * segmentAngle * Math.PI) / 180 - Math.PI / 2;
      const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180 - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      const color = prizes[i]?.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fillStyle = color;
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      const midAngle = (startAngle + endAngle) / 2;
      ctx.rotate(midAngle);
      ctx.translate(radius * 0.62, 0);
      ctx.rotate(Math.PI / 2);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.max(11, Math.floor(radius / 12))}px Fredoka, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const label = prizes[i]?.label || `Prize ${i + 1}`;
      const lines = label.length > 10 ? [label.slice(0, label.lastIndexOf(' ') || 8), label.slice(label.lastIndexOf(' ') + 1 || 8)] : [label];
      lines.forEach((line, li) => {
        ctx.fillText(line, 0, (li - (lines.length - 1) / 2) * 16);
      });

      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "#1F1F1F";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#FDF8F6";
    ctx.fill();

    ctx.restore();
  }, [prizes, segmentCount, segmentAngle]);

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation, drawWheel]);

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
      // Calculate which prize was won based on final rotation
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
  }, [spinning, animateSpin]);

  const startSpin = (prizeIndex) => {
    if (spinning) return;
    // Calculate target angle to land on the given prize index
    const targetAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const target = rotation + fullSpins * 360 + targetAngle - (rotation % 360) + (Math.random() * segmentAngle * 0.4 - segmentAngle * 0.2);
    setTargetRotation(target);
    setSpinning(true);
  };

  // Expose startSpin via ref
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.startSpin = startSpin;
    }
  });

  const canvasSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 300 : 400;

  return (
    <div className="wheel-container" data-testid="wheel-container">
      <div className="wheel-pointer" data-testid="wheel-pointer" />
      <motion.div
        className="wheel-glow"
        animate={spinning ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="wheel-canvas"
          data-testid="wheel-canvas"
        />
      </motion.div>
    </div>
  );
}
