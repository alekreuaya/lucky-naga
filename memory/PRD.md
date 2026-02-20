# Lucky Wheel Website - PRD

## Original Problem Statement
Build a lucky wheel website with username, redeem code, and draw history. Valid username and redeem code needed to spin the wheel. History visible to anyone. Backend admin API to generate username/redeem codes. Admin can change prize pool from backend.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Framer Motion + React Confetti
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: Simple password-based admin login with JWT tokens
- **Database**: MongoDB with collections: `users`, `prizes`, `draw_history`

## User Personas
1. **End User**: Receives username + redeem code, spins the wheel once
2. **Admin**: Manages codes, prize pool, views statistics

## Core Requirements
- [x] Lucky wheel with 8 colorful segments (canvas-based)
- [x] Username + redeem code validation (single-use)
- [x] Spinning animation with confetti celebration on win
- [x] Public draw history / recent winners
- [x] Admin login (password-based)
- [x] Admin: Generate username/redeem codes
- [x] Admin: Manage prize pool (CRUD)
- [x] Admin: View all draw history and statistics
- [x] Mobile-friendly responsive design
- [x] Neo-brutalist playful design with Fredoka/Nunito fonts

## What's Been Implemented (Feb 2026)
- Full backend API (12 endpoints, all tested)
- Complete frontend with main page and admin dashboard
- Canvas-based spinning wheel with animation
- Confetti celebration modal on win
- Admin panel with 3 tabs: Codes, Prizes, Stats
- Prize distribution visualization in stats
- Default 8-segment point-based prize pool

## API Endpoints
- GET /api/prizes - Public prize list
- GET /api/history - Public draw history
- POST /api/spin - Validate & spin
- POST /api/admin/login - Admin auth
- POST /api/admin/generate-codes - Create codes
- GET /api/admin/codes - List codes
- PUT /api/admin/prizes - Update prize pool
- GET /api/admin/prizes - Admin prize list
- GET /api/admin/stats - Statistics

## Admin Credentials
- Password: Set in backend .env as ADMIN_PASSWORD

## Prioritized Backlog
- P1: Export codes to CSV
- P1: Bulk delete used codes
- P2: Sound effects on spin/win
- P2: Custom branding/logo upload
- P3: Email notification to winners
- P3: Time-limited redeem codes
