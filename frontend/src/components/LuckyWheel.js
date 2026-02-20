import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

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
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    // Outer gold ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, Math.PI * 2);
    const outerGrad = ctx.createRadialGradient(center, center, radius - 5, center, center, radius + 8);
    outerGrad.addColorStop(0, "#DAA520");
    outerGrad.addColorStop(0.5, "#FFD700");
    outerGrad.addColorStop(1, "#B8860B");
    ctx.fillStyle = outerGrad;
    ctx.fill();

    // Inner gold ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#8B6914";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentRotation * Math.PI) / 180);

    // Draw segments - alternating white/cream
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (i * segmentAngle * Math.PI) / 180 - Math.PI / 2;
      const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180 - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius - 2, startAngle, endAngle);
      ctx.closePath();

      // Alternating white and very light cream
      ctx.fillStyle = i % 2 === 0 ? "#FFFFFF" : "#FFF9F0";
      ctx.fill();

      // Gold divider lines
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const lineX = Math.cos(startAngle) * (radius - 2);
      const lineY = Math.sin(startAngle) * (radius - 2);
      ctx.lineTo(lineX, lineY);
      ctx.strokeStyle = "rgba(218, 165, 32, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw text along the segment
      ctx.save();
      const midAngle = (startAngle + endAngle) / 2;
      ctx.rotate(midAngle);
      ctx.translate(radius * 0.6, 0);
      ctx.rotate(Math.PI / 2);

      // Dark text for readability on white
      ctx.shadowColor = "rgba(0,0,0,0.1)";
      ctx.shadowBlur = 2;
      ctx.fillStyle = "#2D1810";
      ctx.font = `bold ${Math.max(10, Math.floor(radius / 14))}px Cinzel, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const label = prizes[i]?.label || `Prize ${i + 1}`;
      const maxLen = 12;
      if (label.length > maxLen) {
        const mid = label.lastIndexOf(' ', maxLen) || maxLen;
        const lines = [label.slice(0, mid), label.slice(mid + 1)];
        lines.forEach((line, li) => {
          ctx.fillText(line, 0, (li - (lines.length - 1) / 2) * 14);
        });
      } else {
        ctx.fillText(label, 0, 0);
      }
      ctx.restore();
    }

    // Last divider line
    const lastAngle = (segmentCount * segmentAngle * Math.PI) / 180 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(lastAngle) * (radius - 2), Math.sin(lastAngle) * (radius - 2));
    ctx.strokeStyle = "rgba(218, 165, 32, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Large gold center medallion
    const medalRadius = radius * 0.18;

    // Outer medallion ring
    ctx.beginPath();
    ctx.arc(0, 0, medalRadius + 4, 0, Math.PI * 2);
    const medalOuterGrad = ctx.createRadialGradient(0, 0, medalRadius - 2, 0, 0, medalRadius + 4);
    medalOuterGrad.addColorStop(0, "#FFD700");
    medalOuterGrad.addColorStop(0.5, "#DAA520");
    medalOuterGrad.addColorStop(1, "#8B6914");
    ctx.fillStyle = medalOuterGrad;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Medallion face
    ctx.beginPath();
    ctx.arc(0, 0, medalRadius, 0, Math.PI * 2);
    const medalGrad = ctx.createRadialGradient(-medalRadius * 0.3, -medalRadius * 0.3, 0, 0, 0, medalRadius);
    medalGrad.addColorStop(0, "#FFE44D");
    medalGrad.addColorStop(0.4, "#FFD700");
    medalGrad.addColorStop(0.8, "#DAA520");
    medalGrad.addColorStop(1, "#B8860B");
    ctx.fillStyle = medalGrad;
    ctx.fill();

    // Concentric rings on medallion
    ctx.beginPath();
    ctx.arc(0, 0, medalRadius * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139, 105, 20, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, medalRadius * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139, 105, 20, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dragon emblem in center (simplified)
    ctx.fillStyle = "rgba(139, 105, 20, 0.5)";
    ctx.font = `bold ${Math.floor(medalRadius * 0.8)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u9F8D", 0, 2); // Dragon kanji character

    // Radiating lines from medallion
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * medalRadius * 0.8, Math.sin(angle) * medalRadius * 0.8);
      ctx.lineTo(Math.cos(angle) * (medalRadius + 3), Math.sin(angle) * (medalRadius + 3));
      ctx.strokeStyle = "rgba(139, 105, 20, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

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
    const targetAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const target = rotation + fullSpins * 360 + targetAngle - (rotation % 360) + (Math.random() * segmentAngle * 0.4 - segmentAngle * 0.2);
    setTargetRotation(target);
    setSpinning(true);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.startSpin = startSpin;
    }
  });

  // Calculate canvas size to fit inside the dragon golden ring (approximately 42% of container)
  const getCanvasSize = () => {
    if (typeof window === 'undefined') return 180;
    const width = window.innerWidth;
    if (width < 640) return 180;  // Mobile: 420 * 0.42
    if (width < 768) return 210;  // Tablet: 500 * 0.42
    return 230;                   // Desktop: 540 * 0.42
  };
  const canvasSize = getCanvasSize();

  return (
    <div className="wheel-container" data-testid="wheel-container">
      {/* Purple pointer */}
      <div className="wheel-pointer-gem" data-testid="wheel-pointer" />
      <motion.div
        className="wheel-glow"
        animate={spinning ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="wheel-canvas-new"
          data-testid="wheel-canvas"
        />
      </motion.div>
    </div>
  );
}
