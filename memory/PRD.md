# NAGA1001 Lucky Wheel - Product Requirements

## Original Problem Statement
Lucky wheel website "NAGA1001" with red/gold dragon theme. Users enter username + redeem code to spin. Admin panel (master + admin) manages users, codes, prizes, history. Public draw history. Confetti + win modal → livechat. Mobile responsive.

**Language**: Bahasa Indonesia.

## Tech Stack
- Frontend: React + Tailwind + framer-motion (Cloudflare Pages)
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
- **[2026-02-01]** Wheel layering finalized to user's exact spec:
  - dragon-container: 500×500
  - wheel-wrapper: 320×320, `position:absolute; left:50%; top:50%; transform: translate(-50%,-50%) translateY(8px); z-index:10`
  - dragon img: `z-index:20; pointer-events:none` (head & claws overlap wheel)
  - indicator: `z-index:30` (top-most layer)
  - Wheel internal size synced to 320px

## Test Credentials
- Spin: username `previewtest`, redeem code `BXY8NQU1`
- Admin: username `master`, password `masterdragon2024!`

## Backlog
- None — visual layering matches user spec.
