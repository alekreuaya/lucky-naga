# NAGA1001 Lucky Wheel - Product Requirements

## Original Problem Statement
Lucky wheel website "NAGA1001" with red/gold dragon theme. Users enter username + redeem code to spin. Admin panel manages users, codes, prizes, history. Public draw history. Confetti + win modal → livechat. Mobile responsive.

**Language**: Bahasa Indonesia.

## Tech Stack
- Frontend: React + Tailwind + framer-motion (Cloudflare Pages: lucky-naga.pages.dev)
- Backend: FastAPI + JWT (Render)
- Database: MongoDB Atlas

## DB Schema
- `admins`: {username, hashed_password, is_master}
- `users`: {username, redeem_code, used, spun_at, prize_won}
- `prizes`: {name, color, imageUrl, probability}
- `draw_history`: {username, prize_name, timestamp}

## Key API Endpoints
- POST /api/admin/login
- POST /api/spin
- GET /api/prizes
- GET /api/history

## Completed
- Full backend + admin system with JWT auth
- All UI Indonesian; custom NAGA1001 branding (title/favicon/meta), Emergent watermark removed
- Mobile-only "MASUK NAGA1001" button + Livechat claim link
- Cloudflare Pages + Render deploy with `--legacy-peer-deps`
- **[2026-02-01] Spin/Modal Logic Fixes**:
  - LuckyWheel refactored to use `forwardRef` + `useImperativeHandle` exposing `startSpin`
  - MainPage now calls `wheelRef.current.startSpin(idx)` instead of stale DOM querySelector
  - Fixed stale closure in `handleSpinEnd` (removed `if (wonPrize)` check — modal handles null)
  - Replaced state-based `targetRotation` with `targetRotationRef` to avoid race condition with RAF
- **[2026-02-01] Final Visual Anchoring (user-calibrated)**:
  - dragon-container: 500×500 (no offset)
  - wheel-container: NO transform (natural 0,0 center within wrapper)
  - wheel-wrapper: 325×325, `transform: translate(-50%, -50%)` (clean centering)
  - dragon-frame img: `transform: translate(36px, 22px)`, z:20
  - shard indicator: `transform: translateX(-50%) translate(-14px, -60px)`, top:50%, width:50px, z:30
  - Custom assets: `/shard-indicator.png` (neon purple shard, BG removed via PIL flood-fill)

## Test Credentials
- Admin: username `master`, password `masterdragon2024!`
- Test users created during this session (one-time codes):
  - finaltest / WNHHZ669 (used)
  - spintest, spintest2, spintest3 (used)
  - previewtest / BXY8NQU1 (used)
- For fresh test: create new user via admin panel or DB

## Deployment Notes
- Production: lucky-naga.pages.dev (Cloudflare Pages)
- Preview: naga-spin.preview.emergentagent.com (auto hot-reload from /app)
- **IMPORTANT**: Changes in preview ≠ production. User must "Save to Github" → Cloudflare auto-builds (2-3 min) to update production.

## Backlog
- None — wheel/dragon/indicator/popup all verified working in preview.
