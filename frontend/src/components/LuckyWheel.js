import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const CENTER_LOGO_URL = "https://customer-assets.emergentagent.com/job_dc52c29e-a80c-443c-b910-34fef7a5ad1f/artifacts/7zt5x325_logo%20naga1001.jpeg";

export default function LuckyWheel({ prizes, onSpinEnd, spinning, setSpinning }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startRotRef = useRef(0);
  const logoImageRef = useRef(null);

  // Load logo image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoImageRef.current = img;
    };
    img.src = CENTER_LOGO_URL;
  }, []);

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

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentRotation * Math.PI) / 180);

    // Draw segments - transparent background, only lines and text
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (i * segmentAngle * Math.PI) / 180 - Math.PI / 2;
      const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180 - Math.PI / 2;

      // Gold divider lines
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const lineX = Math.cos(startAngle) * (radius - 2);
      const lineY = Math.sin(startAngle) * (radius - 2);
      ctx.lineTo(lineX, lineY);
      ctx.strokeStyle = "#DAA520";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text along the segment
      ctx.save();
      const midAngle = (startAngle + endAngle) / 2;
      ctx.rotate(midAngle);
      ctx.translate(radius * 0.6, 0);
      ctx.rotate(Math.PI / 2);

      // Gold text for visibility on transparent background
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#FFD700";
      ctx.strokeStyle = "#8B6914";
      ctx.lineWidth = 2;
      ctx.font = `bold ${Math.max(12, Math.floor(radius / 12))}px Cinzel, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const label = prizes[i]?.label || `Prize ${i + 1}`;
      const maxLen = 12;
      if (label.length > maxLen) {
        const mid = label.lastIndexOf(' ', maxLen) || maxLen;
        const lines = [label.slice(0, mid), label.slice(mid + 1)];
        lines.forEach((line, li) => {
          ctx.strokeText(line, 0, (li - (lines.length - 1) / 2) * 14);
          ctx.fillText(line, 0, (li - (lines.length - 1) / 2) * 14);
        });
      } else {
        ctx.strokeText(label, 0, 0);
        ctx.fillText(label, 0, 0);
      }
      ctx.restore();
    }

    // Last divider line
    const lastAngle = (segmentCount * segmentAngle * Math.PI) / 180 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(lastAngle) * (radius - 2), Math.sin(lastAngle) * (radius - 2));
    ctx.strokeStyle = "#DAA520";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Large center with logo
    const medalRadius = radius * 0.22;

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

    // Draw logo image in center (circular clip)
    if (logoImageRef.current) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, medalRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        logoImageRef.current,
        -medalRadius,
        -medalRadius,
        medalRadius * 2,
        medalRadius * 2
      );
      ctx.restore();
    } else {
      // Fallback if logo not loaded
      ctx.beginPath();
      ctx.arc(0, 0, medalRadius, 0, Math.PI * 2);
      const medalGrad = ctx.createRadialGradient(-medalRadius * 0.3, -medalRadius * 0.3, 0, 0, 0, medalRadius);
      medalGrad.addColorStop(0, "#FFE44D");
      medalGrad.addColorStop(0.4, "#FFD700");
      medalGrad.addColorStop(0.8, "#DAA520");
      medalGrad.addColorStop(1, "#B8860B");
      ctx.fillStyle = medalGrad;
      ctx.fill();
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

  // Fixed canvas size for all screens
  const canvasSize = 345;

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
