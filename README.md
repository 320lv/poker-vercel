# Poker Vercel — Minimal Bundle

This bundle is a minimal Next.js + Socket.io demo for a 9-player Texas Hold'em poker table with a 3D table scene (react-three-fiber).
**Important:** Vercel's serverless platform does not support long-lived WebSocket servers reliably. The included `pages/api/socket.js` implements a Socket.io server meant for environments that allow persistent servers (e.g., a VPS, Render, or local test). You can still deploy this to Vercel for demo purposes, but use a dedicated socket host for production.

## How to run locally

1. Install:
```bash
npm install
```
2. Run dev:
```bash
npm run dev
```
3. Open http://localhost:3000

## What is included
- Next.js app with a lobby and table UI.
- Socket.io server in `pages/api/socket.js` (for demo/local).
- Game logic skeleton (blinds, basic betting), evaluator for hands.
- 3D table scene (silhouettes + ambient fog) using react-three-fiber.
- Max players: 9.

## Deploy to Vercel
1. Push this repo to GitHub.
2. Import project in Vercel.
3. If you need stable sockets in production, host `pages/api/socket.js` on a platform supporting persistent WebSockets (Render / DigitalOcean) and set `NEXT_PUBLIC_SOCKET_URL` to that URL in Vercel environment variables.



## Avatars & Silhouettes
Added simple SVG avatar placeholders in `public/images` (avatar1..3) and silhouettes (silhouette1..6). Replace these with real PNG/GLB assets if you want higher fidelity.
