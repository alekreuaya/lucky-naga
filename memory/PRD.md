# NAGA1001 Lucky Wheel - Product Requirements

## Original Problem Statement
Build a lucky wheel website "NAGA1001" with red/gold dragon theme. Users enter username + redeem code to spin. Admin panel (master + admin roles) to manage users, codes, prizes (name, image, probability), and view history. Public history of recent draws. Confetti animations and win modals directing to livechat. Mobile responsive.

**Language**: Respond in Bahasa Indonesia.

## Tech Stack
- Frontend: React + Tailwind + framer-motion (deployed on Cloudflare Pages)
- Backend: FastAPI + JWT auth (deployed on Render)
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
- Backend + Frontend functional with full admin system
- All UI text translated to Indonesian
- Custom dragon-frame + wheel image assets integrated
- Mobile-only "MASUK NAGA1001" button + Livechat claim link
- Title/favicon/meta updated; Emergent watermark removed
- Deployment on Cloudflare Pages + Render with --legacy-peer-deps fix
- **[2026-02-01]** Z-index layering fixed: dragon head & claws now on top (z:20), wheel spins behind (no z-index), indicator visible above (z:30 floats through). Dragon img has pointer-events:none.

## Test Credentials
- Spin: username `previewtest`, redeem code `BXY8NQU1`
- Admin: username `master`, password `masterdragon2024!`

## Backlog
- None currently. Visual layering complete per user reference.
