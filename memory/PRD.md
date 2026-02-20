# NAGA1001 Lucky Wheel Website - PRD

## Original Problem Statement
Build a lucky wheel website with username, redeem code, and draw history. Valid username and redeem code needed to spin the wheel. History visible to anyone. Backend admin API to generate username/redeem codes. Admin can change prize pool from backend.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Framer Motion + React Confetti
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: Multi-level JWT authentication (Master Admin + Regular Admins)
- **Database**: MongoDB with collections: `admins`, `users`, `prizes`, `draw_history`

## User Personas
1. **End User**: Receives username + redeem code, spins the wheel once
2. **Regular Admin**: Manages codes, prize pool, views statistics
3. **Master Admin**: Full access including managing other admin accounts

## Core Requirements
- [x] Lucky wheel with dynamic segments (canvas-based)
- [x] Username + redeem code validation (single-use)
- [x] Spinning animation with confetti celebration on win
- [x] Public draw history / recent winners
- [x] Multi-level admin system (Master + Regular admins)
- [x] Admin: Generate username/redeem codes
- [x] Admin: Manage prize pool with images and 0-100 probability
- [x] Admin: View all draw history and statistics
- [x] Admin: Filter codes by status (active/used)
- [x] Admin: Change password functionality
- [x] Master Admin: Create/delete other admin accounts
- [x] Mobile-friendly responsive design
- [x] Red-gold dragon theme with "NAGA1001" branding
- [x] Dragon frame background with wheel positioned inside circle

## What's Been Implemented (Feb 2026)
- Full backend API with JWT authentication
- Multi-level admin system (master + regular admins)
- Canvas-based spinning wheel with gold/white segments
- Confetti celebration modal on win
- Admin panel with tabs: Codes, Prizes, Stats, Admins (master only), Settings
- Prize management with image URLs and probability (0-100)
- Code filtering by status (active/used)
- Password change functionality for admins
- Dragon frame background design with wheel inside circle
- Responsive design for desktop and mobile

## API Endpoints
- GET /api/prizes - Public prize list
- GET /api/history - Public draw history
- POST /api/spin - Validate & spin
- POST /api/admin/login - Admin JWT auth
- POST /api/admin/change-password - Change admin password
- POST /api/admin/generate-codes - Create codes
- GET /api/admin/codes - List codes (with status filter)
- PUT /api/admin/prizes - Update prize pool
- GET /api/admin/prizes - Admin prize list
- GET /api/admin/stats - Statistics
- POST /api/admin/admins - Create admin (master only)
- DELETE /api/admin/admins/{username} - Delete admin (master only)

## Admin Credentials
- Master credentials stored in backend/.env (MASTER_ADMIN_USERNAME, MASTER_ADMIN_PASSWORD)
- JWT_SECRET for token signing

## Prioritized Backlog
- P1: Export codes to CSV
- P1: Bulk delete used codes
- P2: Sound effects on spin/win
- P2: Custom branding/logo upload
- P3: Email notification to winners
- P3: Time-limited redeem codes
