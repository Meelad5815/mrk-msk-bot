# MRK MSK WhatsApp Multi-Device Chatbot

A GitHub-ready full-stack WhatsApp chatbot application built with Node.js, Express.js, MongoDB, Socket.IO, and the Baileys WhatsApp Web API.

## Features

- Professional responsive dashboard with dark/light mode.
- Phone-number based WhatsApp Multi-Device pairing code and QR login.
- Persistent Baileys auth sessions in `sessions/` so users do not reconnect every time.
- Super-admin JWT login, password hashing, rate limiting, secure cookies, input validation, and encrypted-session utility.
- Admin control panel APIs for connected numbers, disconnect, restart, broadcast, logs, stats, users, bans, and command configuration.
- Bot commands: basic, group management stubs, auto settings, AI/media/utility command hooks.
- MongoDB models for users, sessions, command configs, logs, and statistics.
- Docker and Docker Compose deployment for VPS, Ubuntu, Railway, and Render-style hosts.

## Folder Structure

```text
src/
  config/          Environment and MongoDB connection
  models/          MongoDB schemas
  routes/          Auth, admin, and public session APIs
  services/        WhatsApp socket manager, commands, logging
  public/          Dashboard HTML, CSS, and browser JavaScript
scripts/           Admin seeding utilities
sessions/          Baileys multi-file auth state (gitignored)
logs/              Runtime logs (gitignored)
```

## Installation

```bash
git clone <your-repo-url>
cd mrk-msk-bot
cp .env.example .env
npm install
npm run seed:admin
npm start
```

Open `http://localhost:3000`, enter a WhatsApp phone number in international format, then enter the displayed pairing code in WhatsApp > Linked Devices > Link with phone number. If WhatsApp returns a QR challenge, scan the QR code shown on the dashboard.

## Environment Variables

See `.env.example` for all required variables. Set strong values for `SESSION_SECRET`, `JWT_SECRET`, and `ENCRYPTION_KEY` before production deployment.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Admin

Seed the initial super admin:

```bash
npm run seed:admin
```

Default development credentials come from `.env.example` and should be changed before deployment.

## Security Checklist

- Use HTTPS in production.
- Store secrets in the deployment provider's secret manager.
- Restrict MongoDB network access.
- Rotate admin credentials regularly.
- Keep Baileys and Express dependencies updated.
- Back up `sessions/` and MongoDB securely.

## Deployment Notes

- **VPS/Ubuntu:** install Node.js 20+, MongoDB, clone the repo, configure `.env`, run with PM2 or systemd.
- **Docker:** use the included `Dockerfile` and `docker-compose.yml`.
- **Railway/Render:** create a Node service, add MongoDB, configure environment variables, and persist `sessions/` with a volume when available.
- **Vercel:** supported for the dashboard and API preview through `api/index.js` and `vercel.json`; configure `MONGODB_URI` in Vercel environment variables. WhatsApp sockets need a long-running server/volume for reliable production use, so deploy the bot worker on VPS, Docker, Railway, or Render for live WhatsApp connectivity.

## Disclaimer

Use WhatsApp automation responsibly and comply with WhatsApp's terms, local laws, and user consent requirements.
