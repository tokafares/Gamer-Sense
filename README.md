# GamerSense: League of Legends training & quiz platform

Sharpen your League of Legends game sense without the stress of ranked games or coaching. Inspired by chess.com, GamerSense turns real in-game situations (rotations, trades, fights and macro decisions) into quizzes, timed drills and head-to-head duels.

**Live demo:** currently offline. The production backend on Railway is not running, so there is no public link at the moment.

![GamerSense landing page](https://tokafares.vercel.app/screenshots/gamersense/landing.webp)

## Screenshots

| Features | Knowledge hub |
| --- | --- |
| ![Features overview](https://tokafares.vercel.app/screenshots/gamersense/features.webp) | ![Champion knowledge hub](https://tokafares.vercel.app/screenshots/gamersense/knowledge-hub.webp) |

| Champion detail | Mobile (375px) |
| --- | --- |
| ![Champion detail page](https://tokafares.vercel.app/screenshots/gamersense/champion.webp) | <img src="https://tokafares.vercel.app/screenshots/gamersense/mobile-landing.webp" alt="Landing page on a 375px mobile screen" width="280"> |

_Screenshots were captured from the frontend running locally and are hosted on [my portfolio](https://tokafares.vercel.app/projects/gamersense)._

## Features

**Training modes**
- **Scenarios:** real in-game situations per lane (top, jungle, mid, ADC, support), each with three options, an optional hint and an explanation of the right call.
- **Blitz:** rapid-fire questions on a 25-second timer.
- **Guess the Rank:** watch a gameplay clip (or image) and guess the player's rank, from Iron to Challenger. Scoring is based on how far your guess is from the real rank.
- **Knowledge hub:** every champion with role filters, search, a hover preview and a detail page with difficulty, strengths, weaknesses and a game-sense tip. Champion data and art come from Riot's Data Dragon, always on the latest patch.

**Multiplayer duels**
- Invite a friend with a link, then play a real-time 1v1 trivia or Guess the Rank match over Socket.io.
- The server owns the match state: it sends each round with a 20-second answer timer, scores answers and decides the winner (including draws). Players can reconnect and resume, and the host can start a rematch.
- Invite tokens are short-lived and stored in Redis.

**Progress**
- Accounts with JWT authentication and bcrypt-hashed passwords.
- A profile with points, a rank per lane and counts of completed quizzes, trivia and Guess the Rank rounds.
- XP-based levels (XP is the points earned in games), with a level-up popup and levels shown on the leaderboard.
- A global leaderboard, cached in Redis.

**Admin**
- A separate admin panel (`admin-panel/`) for creating, editing and deleting questions, managing Guess the Rank rounds, and managing users (change roles, reset passwords, rename and delete accounts). Admin routes require a user with the `admin` role.

## Architecture

```
gamersense/
├── src/                 React SPA (players)
│   ├── pages/           Landing, scenarios, blitz, trivia, duels, guess the rank, profile, knowledge hub…
│   ├── components/      Header, hero, leaderboard, login modal, game UI, shared UI
│   ├── hooks/           Data hooks (champions, leaderboard, profile, GTR rounds…)
│   ├── store/           Zustand stores (auth, game state, level-up)
│   ├── utils/ lib/      Data Dragon client, API helpers, shared animation variants
│   └── types/
├── admin-panel/         Separate React + Vite app for content management
└── backend/             Fastify API + Socket.io server
    ├── src/routes/      auth, questions, answers, champions, gtr, matches, profile, leaderboard, admin
    ├── src/services/    Business logic per domain
    ├── src/sockets/     Real-time match handler
    ├── src/middleware/  authGuard, adminGuard, error handler
    └── prisma/          Schema and seed data
```

- **Frontend:** React SPA talking to the REST API and the Socket.io server. Champion data is fetched straight from Data Dragon and cached in memory.
- **Backend:** Fastify REST API and a Socket.io server in one Node process.
- **Data:** PostgreSQL through Prisma (users, stats, questions, champions, Guess the Rank rounds and votes, matches and results). Redis holds invite tokens and the leaderboard cache.
- **Deployment:** the frontend and admin panel are built with Vite and served by nginx in Docker containers. The backend runs on Railway. A `vercel.json` is also included for deploying the frontend to Vercel.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS v4, Framer Motion, React Router v7, Zustand, lucide-react |
| Real-time | Socket.io |
| Backend | Node.js, Fastify, JWT (`jsonwebtoken`), bcrypt |
| Database | PostgreSQL with Prisma ORM |
| Cache | Redis (`ioredis`) |
| External data | Riot Data Dragon |
| Deployment | Docker + nginx, Railway, Vercel |

## Running locally

Requirements: Node 20+, PostgreSQL and Redis.

**1. Backend**

```bash
cd backend
npm install
cp .env.example .env      # fill in DATABASE_URL, REDIS_URL and JWT_SECRET
npm run db:push           # create the tables from prisma/schema.prisma
npm run db:seed           # seed questions, champions and Guess the Rank rounds
npm run dev               # API and Socket.io on http://localhost:3000
```

**2. Frontend**

```bash
npm install
npm run dev               # http://localhost:5173
```

Create a `.env.local` in the project root that points at the backend:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

Without `VITE_API_URL`, the public pages (landing, features, knowledge hub) still work, but sign-in, quizzes and duels need the backend.

**3. Admin panel (optional)**

```bash
cd admin-panel
npm install
npm run dev
```

### Scripts

| Where | Script | What it does |
| --- | --- | --- |
| root | `npm run dev` / `build` / `preview` / `lint` | Vite dev server, type-check + production build, preview, ESLint |
| backend | `npm run dev` | API with hot reload (`ts-node-dev`) |
| backend | `npm run build` / `start` | Compile to `dist/` and run it |
| backend | `npm run db:push` / `db:migrate` / `db:seed` | Prisma schema sync, migrations, seed data |

### Backend environment variables

| Name | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `PORT` | API port (default `3000`) |
| `FRONTEND_URL`, `ADMIN_URL` | Allowed CORS origins for the player app and admin panel |

More backend detail (full Prisma schema, routes and socket events) is in [`BACKEND.md`](BACKEND.md).

## Credits

League of Legends and all champion names and images are trademarks of Riot Games, Inc. GamerSense is a fan project and is not endorsed by Riot Games.
