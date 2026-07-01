import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

const CENTER_LOGO_URL =
  "https://customer-assets.emergentagent.com/job_dc52c29e-a80c-443c-b910-34fef7a5ad1f/artifacts/7zt5x325_logo%20naga1001.jpeg";

// ─── Colour palette per segment (cycles) ────────────────────────────────────
const SEGMENT_COLORS = [
  { outer: "#9B1B30", inner: "#7A1526" },
  { outer: "#D4A030", inner: "#B8860B" },
  { outer: "#8B0000", inner: "#6B0000" },
  { outer: "#C5943A", inner: "#A07020" },
  { outer: "#9B1B30", inner: "#7A1526" },
  { outer: "#B8860B", inner: "#8B6914" },
  { outer: "#8B0000", inner: "#6B0000" },
  { outer: "#DAA520", inner: "#B8860B" },
];

// ─── Easing ──────────────────────────────────────────────────────────────────
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

// ─── Canvas wheel renderer ───────────────────────────────────────────────────
function drawWheel(canvas, prizes) {
  if (!canvas || prizes.length === 0) return;
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4; // slight inset for border
  const ctx = canvas.getContext("2d");
  const n = prizes.length;
  const sliceAngle = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, size, size);

  // ── outer glow ring ──
  const ringGrad = ctx.createRadialGradient(cx, cy, radius - 8, cx, cy, radius + 4);
  ringGrad.addColorStop(0, "rgba(218,165,32,0.6)");
  ringGrad.addColorStop(1, "rgba(218,165,32,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 4, 0, 2 * Math.PI);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  prizes.forEach((prize, i) => {
    const startAngle = i * sliceAngle - Math.PI / 2;
    const endAngle = startAngle + sliceAngle;
    const colors = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

    // ── segment gradient ──
    const midAngle = startAngle + sliceAngle / 2;
    const gx1 = cx + (radius * 0.3) * Math.cos(midAngle);
    const gy1 = cy + (radius * 0.3) * Math.sin(midAngle);
    const gx2 = cx + radius * Math.cos(midAngle);
    const gy2 = cy + radius * Math.sin(midAngle);
    const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
    grad.addColorStop(0, colors.inner);
    grad.addColorStop(1, colors.outer);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // ── gold divider lines ──
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + radius * Math.cos(startAngle),
      cy + radius * Math.sin(startAngle)
    );
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "rgba(255,215,0,0.7)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── prize image or label ──
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);

    const labelR = radius * 0.62;

    if (prize.image_url) {
      // draw image
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(midAngle);
        ctx.translate(labelR, 0);
        ctx.rotate(Math.PI / 2);
        const imgSize = radius * 0.22;
        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();
      };
      img.src = prize.image_url;
    }

    // always draw label text
    ctx.translate(labelR, 0);
    ctx.rotate(Math.PI / 2); // rotate text upright along segment

    const fontSize = Math.max(9, Math.min(13, radius * 0.075));
    ctx.font = `bold ${fontSize}px 'Cinzel', serif`;
    ctx.fillStyle = "#FFF8E7";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 4;

    // wrap long labels
    const maxWidth = radius * 0.38;
    const words = prize.label.split(" ");
    if (words.length === 1 || ctx.measureText(prize.label).width <= maxWidth) {
      ctx.fillText(prize.label, 0, prize.image_url ? 14 : 0);
    } else {
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(" ");
      const line2 = words.slice(mid).join(" ");
      const lineH = fontSize + 2;
      const yOff = prize.image_url ? 14 : -lineH / 2;
      ctx.fillText(line1, 0, yOff);
      ctx.fillText(line2, 0, yOff + lineH);
    }

    ctx.restore();
  });

  // ── outer border ring ──
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#D4A030";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(218,165,32,0.8)";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ── inner dark circle (behind logo) ──
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.155, 0, 2 * Math.PI);
  ctx.fillStyle = "#0f0505";
  ctx.fill();
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(255,215,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ─── Main component ──────────────────────────────────────────────────────────
const LuckyWheel = forwardRef(function LuckyWheel(
  { prizes, onSpinEnd, spinning, setSpinning },
  ref
) {
  const WHEEL_SIZE = 340;
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);          // actual current rotation (degrees)
  const [rotateDeg, setRotateDeg] = useState(0);
  const rafRef = useRef(null);

  // Draw wheel whenever prizes change
  useEffect(() => {
    if (canvasRef.current && prizes.length > 0) {
      drawWheel(canvasRef.current, prizes);
    }
  }, [prizes]);

  // ── Spin logic ──────────────────────────────────────────────────────────────
  const startSpin = useCallback(
    (prizeIndex) => {
      if (spinning) return;
      const n = prizes.length;
      if (n === 0) return;

      const sliceAngle = 360 / n;

      // We want the pointer (at top = 0°) to land on the centre of prizeIndex's slice.
      // Wheel rotates clockwise. Slice i starts at i*sliceAngle (0° = top after -90 offset).
      // Centre of target slice in wheel coords: prizeIndex * sliceAngle + sliceAngle/2
      // We need that angle to end up at 0° (top), so we need to rotate by:
      //   -(centre_angle) mod 360
      const centreAngle = prizeIndex * sliceAngle + sliceAngle / 2;
      const toTop = (360 - centreAngle % 360) % 360;

      // Randomise a tiny offset within the slice so it doesn't always hit dead-centre
      const jitter = (Math.random() - 0.5) * sliceAngle * 0.5;

      const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360;
      const startRot = rotationRef.current;
      // Normalise current rotation so we only add forward motion
      const normStart = ((startRot % 360) + 360) % 360;
      const delta = fullSpins + toTop + jitter - normStart;
      const targetRot = startRot + delta;

      const duration = 5000 + Math.random() * 1000; // 5-6 s
      const startTime = performance.now();

      setSpinning(true);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuint(progress);
        const current = startRot + (targetRot - startRot) * eased;

        rotationRef.current = current;
        setRotateDeg(current);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          rotationRef.current = targetRot;
          setRotateDeg(targetRot);
          setSpinning(false);
          if (onSpinEnd) onSpinEnd();
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [spinning, prizes, setSpinning, onSpinEnd]
  );

  useImperativeHandle(ref, () => ({ startSpin }), [startSpin]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
      data-testid="wheel-container"
    >
      {/* Ambient glow behind wheel */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: WHEEL_SIZE * 1.15,
          height: WHEEL_SIZE * 1.15,
          background:
            "radial-gradient(circle, rgba(218,165,32,0.18) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />

      {/* Rotating canvas */}
      <canvas
        ref={canvasRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        style={{
          transform: `rotate(${rotateDeg}deg)`,
          transformOrigin: "center center",
          willChange: "transform",
          borderRadius: "50%",
          display: "block",
        }}
        data-testid="wheel-canvas"
      />

      {/* Center logo — outside rotating canvas, always stationary */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          width: WHEEL_SIZE * 0.195,
          height: WHEEL_SIZE * 0.195,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: "3px solid #FFD700",
          boxShadow:
            "0 0 14px rgba(218,165,32,0.7), 0 0 4px rgba(218,165,32,0.4)",
          zIndex: 20,
        }}
      >
        <img
          src={CENTER_LOGO_URL}
          alt="Naga1001"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Pointer indicator at top */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -6,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
        }}
      >
        <svg width="30" height="38" viewBox="0 0 30 38">
          <defs>
            <linearGradient id="ptr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon
            points="15,38 1,8 15,16 29,8"
            fill="url(#ptr)"
            filter="url(#glow)"
            stroke="#8B6914"
            strokeWidth="1"
          />
          <circle cx="15" cy="7" r="7" fill="url(#ptr)" stroke="#8B6914" strokeWidth="1" />
          <circle cx="15" cy="7" r="3.5" fill="#1a0a0a" />
        </svg>
      </div>
    </div>
  );
});

export default LuckyWheel;
