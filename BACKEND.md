# GamerSense Backend

## Stack
Node.js + TypeScript + Fastify + PostgreSQL + Prisma + Redis + Socket.io

## Project Structure
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── questions.ts
│   │   ├── champions.ts
│   │   ├── answers.ts
│   │   ├── gtr.ts
│   │   ├── matches.ts
│   │   ├── profile.ts
│   │   └── leaderboard.ts
│   ├── middleware/
│   │   ├── authGuard.ts
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── questionService.ts
│   │   ├── answerService.ts
│   │   ├── gtrService.ts
│   │   ├── matchService.ts
│   │   ├── profileService.ts
│   │   └── leaderboardService.ts
│   ├── sockets/
│   │   ├── index.ts
│   │   └── matchHandler.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── tier.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

## Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/gamersense
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

## Prisma Schema (All Models)

```prisma
model User {
  id             String      @id @default(uuid())
  username       String      @unique
  email          String      @unique
  passwordHash   String
  avatarUrl      String?
  level          Int         @default(1)
  membershipTier String      @default("free") // free | pro
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  stats          UserStats?
  matchesAsHost  Match[]     @relation("HostMatches")
  matchesAsGuest Match[]     @relation("GuestMatches")
}

model UserStats {
  id             String   @id @default(uuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  quizCompleted  Int      @default(0)
  triviaPlayed   Int      @default(0)
  gtrCompleted   Int      @default(0)
  points         Int      @default(0)
  topLaneRank    String   @default("iron")
  jungleRank     String   @default("iron")
  midLaneRank    String   @default("iron")
  adcRank        String   @default("iron")
  supportRank    String   @default("iron")
  updatedAt      DateTime @updatedAt
}

model Question {
  id            String   @id @default(uuid())
  type          String   // scenario | blitz | trivia
  lane          String   // top | jungle | mid | adc | support
  text          String
  imageUrl      String?
  hint          String?
  options       Json     // [{ id: "A", text: "..." }, ...]
  correctAnswer String   // "A" | "B" | "C"
  explanation   String
  createdAt     DateTime @default(now())
}

model Champion {
  id       String @id @default(uuid())
  name     String @unique
  lane     String // top | jungle | mid | adc | support
  imageUrl String
}

model GTRRound {
  id           String   @id @default(uuid())
  imageUrl     String
  correctRank  String   // iron | bronze | silver | gold | platinum | emerald | diamond | master | grandmaster | challenger
  createdAt    DateTime @default(now())
  votes        GTRVote[]
}

model GTRVote {
  id         String   @id @default(uuid())
  roundId    String
  round      GTRRound @relation(fields: [roundId], references: [id])
  userId     String
  votedRank  String
  createdAt  DateTime @default(now())

  @@unique([roundId, userId])
}

model Match {
  id          String       @id @default(uuid())
  hostId      String
  host        User         @relation("HostMatches", fields: [hostId], references: [id])
  invitedId   String?
  invited     User?        @relation("GuestMatches", fields: [invitedId], references: [id])
  status      String       @default("waiting") // waiting | active | completed
  inviteToken String       @unique
  createdAt   DateTime     @default(now())
  result      MatchResult?
}

model MatchResult {
  id          String  @id @default(uuid())
  matchId     String  @unique
  match       Match   @relation(fields: [matchId], references: [id])
  winnerId    String
  hostScore   Int
  invitedScore Int
}
```

## REST API Routes

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | ✗ | Register with email + password |
| POST | /auth/login | ✗ | Login, returns JWT |

### Profile
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /profile/:userId | ✓ | Get profile + stats + ranks |
| PUT | /profile/:userId | ✓ | Update username / avatarUrl |

### Questions
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /questions | ✓ | Get questions — query: `?type=trivia&lane=top&limit=10` |

### Answers
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /answers/submit | ✓ | Submit answer, returns correct answer + points earned |

### GTR (Guess The Rank)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /gtr/round | ✓ | Get a random GTR round |
| GET | /gtr/:roundId/stats | ✓ | Get voting breakdown (percentages per rank) |
| POST | /gtr/:roundId/vote | ✓ | Submit rank vote |

### Leaderboard
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /leaderboard | ✗ | Top players by points — query: `?limit=10` — served from Redis cache |

### Champions
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /champions | ✗ | Get all champions — query: `?lane=top` |

### Matches
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /matches/create | ✓ | Create match, returns inviteToken + match URL |
| GET | /matches/join/:token | ✓ | Join match by invite token |

### Health
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /health | ✗ | Server health check |

## WebSocket Events (Socket.io)

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `match:join` | `{ token, userId }` | Player joins match room |
| `round:answer` | `{ matchId, roundIndex, answer }` | Player submits answer for current round |
| `match:rematch` | `{ matchId }` | Host requests rematch |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `match:waiting` | `{ matchId }` | Waiting for opponent to join |
| `match:start` | `{ matchId, questions[] }` | Both players connected, game begins |
| `round:question` | `{ roundIndex, question }` | Server pushes current round question |
| `round:result` | `{ roundIndex, correctAnswer, hostScore, invitedScore }` | Round resolved |
| `match:end` | `{ winnerId, hostScore, invitedScore }` | Match over, final scores |
| `match:error` | `{ message }` | Token expired / invalid / match full |

## Auth Strategy
- Passwords hashed with **bcrypt** (salt rounds: 12)
- Auth via **JWT** in `Authorization: Bearer <token>` header
- Fastify `preHandler` hook used as auth guard on protected routes
- JWT payload: `{ userId, email, username }`

## Caching Strategy (Redis)
| Key | TTL | Content |
|-----|-----|---------|
| `leaderboard:top10` | 60s | Top 10 players serialized as JSON |
| `match:<token>` | 10min | Match invite token → matchId |
| `match:state:<matchId>` | 2h | Live match state (questions, scores, round index) |

- Leaderboard cache invalidated on every `POST /answers/submit` that changes a player's rank
- Match state lives entirely in Redis during the game — written to PostgreSQL only on `match:end`

## Points & Tier System
| Tier | Points Range |
|------|-------------|
| Iron | 0 – 499 |
| Bronze | 500 – 999 |
| Silver | 1000 – 1499 |
| Gold | 1500 – 1999 |
| Platinum | 2000 – 2499 |
| Emerald | 2500 – 2999 |
| Diamond | 3000 – 3499 |
| Master | 3500 – 3999 |
| Grandmaster | 4000 – 4499 |
| Challenger | 4500+ |

### Points per action
- Correct answer (Scenario / Blitz / Trivia): +100 pts
- Wrong answer: +10 pts (participation)
- GTR correct rank: +150 pts
- GTR one tier off: +75 pts
- Win trivia match: +200 pts bonus

## Invite Token Flow
1. Authenticated host calls `POST /matches/create`
2. Backend generates UUID token, stores `match:<token> → matchId` in Redis (TTL 10min)
3. Response returns `{ matchId, inviteUrl: "https://gamersense.gg/match/join/<token>" }`
4. Host shares URL with opponent
5. Opponent calls `GET /matches/join/:token` → backend looks up token in Redis, pairs players, updates Match.invitedId and Match.status = "active"
6. Both players connect via Socket.io using `match:join` event
7. Server fires `match:start` when both sockets are in the room

## Development Phases

### Phase 1 — Foundation + Auth ✅ Start here
- Init `/backend` with Fastify + TypeScript
- Connect Prisma to PostgreSQL
- Connect Redis client
- `POST /auth/register` + `POST /auth/login`
- JWT auth middleware
- `GET /health`
- `npm run build` must pass with zero errors

### Phase 2 — Content Layer
- All Question endpoints with lane/type filtering
- Champion list endpoint
- Seed script: 30+ questions (mix of scenario/blitz/trivia across all lanes) + all champions

### Phase 3 — Solo Game Modes
- `POST /answers/submit` with points calculation + UserStats update
- GTR round endpoint + voting + stats aggregation
- Tier recalculation on every point change

### Phase 4 — Profile + Leaderboard
- Full profile endpoint (stats + per-lane ranks)
- Leaderboard with Redis caching + cache invalidation

### Phase 5 — Real-time 1v1 Trivia
- Socket.io server integrated with Fastify
- Match creation + invite token flow
- Full WebSocket event flow: join → start → rounds → end
- Match state managed in Redis

### Phase 6 — Frontend Integration
- Add `VITE_API_URL` + `VITE_SOCKET_URL` to frontend `.env`
- Replace all hardcoded/mock data with real API calls
- Add Socket.io client to trivia matchmaking pages (Page1, Page10, Page12)
- Add JWT storage + auth headers to all protected requests

## Rules
- TypeScript strict mode — no `any`
- All route inputs validated with Fastify JSON schema
- Business logic lives in `/services` only — route handlers just call services
- Never store match state in PostgreSQL mid-game — use Redis
- Always run `npm run build` and fix all errors before finishing any task
- Leaderboard must always be served from Redis cache, never direct DB query
- **Self-update rule:** Whenever a new pattern, fix, or lesson surfaces during a session, append it to the relevant section of this file before ending the session

## Lessons & Patterns

### Phase 6 — Frontend Integration

**Backend wraps arrays in objects — hooks must unwrap**
Backend returns `{ leaderboard: [...] }` and `{ questions: [...] }`, not bare arrays. Every hook that calls `apiGet` must destructure the wrapper key. Returning bare arrays from REST endpoints (without a named key) makes it impossible to add metadata later — always wrap.

**Frontend `Question` type field names differed from backend**
Frontend used `question`, `answers`, `correctAnswerId`; backend uses `text`, `options`, `correctAnswer`. The mismatch caused silent `undefined` renders on all Q&A pages. Fix: update the type and grep all consumers before calling a phase complete.

**`LeaderboardEntry.name` vs `username`**
The old frontend type had `name`; backend returns `username`. Both `Leaderboard.tsx` and `Page1.tsx` rendered blank names silently. Always align type field names exactly with the API response.

**Socket.io singleton pattern for frontend**
Create the socket once via `getSocket()` (lazy init, `autoConnect: false`). Call `connectSocket()` explicitly only from pages that need live events. `disconnectSocket()` in cleanup. This prevents multiple connections and stale listeners across React re-renders.

**`_prefix` suppresses TS6133 unused-variable errors**
TypeScript strict mode (`noUnusedLocals`) rejects unused state variables. Prefix with `_` (e.g., `_matchId`) to suppress the error without deleting the setter — the setter is needed for future renders or side-effect updates.

**`void` on floating promises in JSX onClick handlers**
TypeScript flags `onClick={() => asyncFn()}` as a floating promise (returns `Promise` where `void` expected). Use `onClick={() => { void asyncFn() }}` to satisfy both TS and ESLint without wrapping in a try/catch at the call site.

**RequireAuth pattern — open modal, render null**
Protected routes render `null` while unauthenticated and call `openLoginModal()` in a `useEffect`. This avoids redirect complexity while still gating content. The modal handles re-auth inline; after login, `isAuthenticated` becomes true and `RequireAuth` renders `children`.

### Phase 5 — Real-time 1v1 Trivia

**Socket.io must attach to the Fastify HTTP server after `app.ready()`**
`app.server` (the underlying `http.Server`) is not fully initialised until `await app.ready()` is called. Attach Socket.io via `new Server(app.server, …)` after `ready()` but before `app.listen()`. Calling `app.decorate('io', …)` after `listen()` throws `FST_ERR_DEC_AFTER_START` — if routes don't need the io instance, skip the decoration entirely.

**`app.decorate` cannot be called after `app.listen()`**
Fastify locks decorators once the server starts. If you need to share the `io` instance with routes, decorate before `listen()` (e.g. right after `app.ready()`). Better: pass `io` via a plugin closure or module-level singleton if only sockets need it.

**POST with no body requires explicit empty-body handling**
Fastify rejects `POST /matches/create` with no `Content-Type` header with `415 Unsupported Media Type`. Fix: send `Content-Type: application/json` with body `{}` from the client, OR add a global `addContentTypeParser('application/x-www-form-urlencoded', …)` that returns `{}`. The latter is added in `index.ts` to handle clients (like PowerShell's `Invoke-RestMethod`) that send the wrong content-type.

**Concurrent `round:answer` events cause a lost-update race**
Both sockets fire `round:answer` within milliseconds. Without a lock, both read stale state (with an empty `answers` map), each saves only their own answer, and `bothAnswered` is never true. Fix: a per-match in-process async mutex (`withMatchLock`) serialises handlers for the same `matchId`. The lock is a chained `Promise` stored in `matchLocks` — each new handler waits for the previous one to finish before it reads/writes state. This is only safe on a single server; horizontal scaling would require a Redis-based distributed lock (e.g. Redlock).

**Invite token is single-use — delete from Redis on first successful join**
After the guest calls `GET /matches/join/:token`, the token is deleted from Redis (`redis.del(tokenKey(token))`). If a socket then emits `match:join` with that same token, `redis.get` returns null. The handler falls back to a DB lookup (`prisma.match.findFirst` by userId and status=active). This is the correct flow — the socket join does not need the invite token; it just needs the `matchId`.

**`$host` / `$guest` are reserved variables in PowerShell 5.1**
`$host` is a built-in PowerShell automatic variable (console host object). Using it as a response variable silently fails. Always use non-conflicting names (`$hostAuth`, `$hostReg`, etc.) for HTTP response variables in PowerShell scripts.

**Match state lives entirely in Redis; DB write only on `match:end`**
`initMatchState` writes the full state (questions, scores, current round, answers map) to `match:state:<matchId>` with a 2-hour TTL. On `match:end`, `finalizeMatch` writes `MatchResult` to PostgreSQL and deletes the Redis key. If the server crashes mid-game, the 2-hour TTL acts as a safety net — the state remains accessible for reconnection.

### Phase 4 — Profile + Leaderboard

**Circular import between answerService ↔ leaderboardService**
`answerService` needs to call `invalidateLeaderboardCache()` from `leaderboardService`, and `leaderboardService` originally imported `tierFromPoints` from `answerService` — a circular dependency that Node.js resolves as `undefined` at import time and causes silent runtime errors. Fix: extract shared pure functions (`tierFromPoints`, `rankDistance`) into `src/lib/tier.ts` so both services import from the lib without any cycle. Rule: services must never import from each other; shared logic goes in `src/lib/`.

**Redis cache scoping by limit**
Only cache the `limit=10` (default) leaderboard result under `leaderboard:top10`. Requests with `limit > 10` always hit the DB directly — caching arbitrary limits would require a separate key per limit value and complex invalidation. The 60-second TTL is acceptable for the uncached path since large-limit calls are rare (admin/debug use).

**`PUT /profile` ownership check via JWT, not DB query**
Authorization is done by comparing `request.user.userId` (from the verified JWT) with the `:userId` URL param. No extra DB query needed — the JWT is already trusted after `authGuard` runs. Returns 403, not 404, to avoid leaking whether the userId exists.

**`avatarUrl: null` as a valid update value**
`updateProfile` checks `input.avatarUrl !== undefined` (not `!input.avatarUrl`) so that passing `avatarUrl: null` explicitly clears the field. Using a falsy check would silently ignore null and prevent users from removing their avatar.

**Leaderboard filters `points > 0`**
`WHERE points > 0` prevents newly registered users with no activity from appearing on the leaderboard. Users without a `UserStats` row (created lazily on first answer) are excluded automatically by the `findMany` on `UserStats`.

### Phase 3 — Solo Game Modes

**Prisma unique constraint violations — catch by message, not error type**
Prisma throws a `PrismaClientKnownRequestError` with code `P2002` on unique constraint violations. Safest guard in strict TS: `err instanceof Error && err.message.includes('Unique constraint')`. Cleaner alternative: `import { Prisma } from '@prisma/client'` and check `err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'`.

**`upsert` for UserStats on every submit**
`UserStats` is created lazily on first answer submission, not at register time. `upsert` on `userId` handles both first-submit creation and subsequent `{ increment }` updates without a separate `findUnique` check.

**Random row selection: `count()` + `skip` offset**
To pick a random `GTRRound` without loading all rows: `prisma.count()` then `findMany({ take: 1, skip: randomOffset })`. O(skip) in DB — fine for small tables. For large tables use a UUID-range approach with a fallback.

**GTR seed rounds use placeholder images**
The 10 seeded GTR rounds point to `placehold.co` URLs. Replace with real replay screenshots when available — just UPDATE the `imageUrl` column; no migration needed.

### Phase 2 — Content Layer

**DDragon version in seed is pinned, not dynamic**
The seed script uses a hardcoded DDragon version (`14.24.1`) for champion image URLs. This is intentional for seed data — the frontend's `championData.ts` fetches the live version dynamically. When updating the seed after a major patch, bump the `DDRAGON_VERSION` constant at the top of `prisma/seed.ts`.

**DDragon IDs differ from display names for many champions**
Use the DDragon `id` field (not `name`) as the image URL key. Special cases: `JarvanIV`, `Kaisa`, `Khazix`, `LeeSin`, `Leblanc`, `MasterYi`, `MissFortune`, `TahmKench`, `TwistedFate`, `XinZhao`, `Velkoz`, `Belveth`, `Chogath`, `RekSai`, `MonkeyKing` (Wukong). The `RAW_CHAMPIONS` array in `seed.ts` maps DDragon IDs → display names explicitly.

**`prisma.seed` key in package.json enables `npx prisma db seed`**
Add `"prisma": { "seed": "ts-node prisma/seed.ts" }` to `package.json` so that `npx prisma db seed` and `prisma migrate reset` work correctly.

**Seed idempotency with `deleteMany` + `upsert`**
Questions use `deleteMany()` before re-inserting (simpler, acceptable since there are no foreign key references yet). Champions use `upsert` on the `name` unique key so re-running the seed is safe without duplicates.

**`options` is stored as `Json` in Prisma — pass the array directly**
Prisma's `Json` type accepts plain JS objects/arrays. Pass the options array directly to `data.options` — no `JSON.stringify()` needed.

### Phase 1 — Foundation + Auth

**Top-level await requires ESM module format**
`tsconfig.json` with `"module": "commonjs"` does not support top-level `await`. Wrap startup logic in an `async function main()` instead. Alternatively, switch to `"module": "node16"` + `"moduleResolution": "node16"`, but that requires `.js` extensions on all local imports (which Prisma client and ioredis handle fine). The `async main()` wrapper keeps the simpler commonjs config without touching import paths.

**PostgreSQL on non-default port**
Local dev runs PostgreSQL 17 on port **5433** (not the default 5432). Always use `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/gamersense` in `.env`. The `.env.example` keeps the conventional `:5432` for production reference.

**`dotenv` must be a runtime dependency, not devDependency**
`import 'dotenv/config'` runs at startup. If `dotenv` is only in `devDependencies`, production builds will fail at runtime. Add it to `dependencies`.

**`redis.connect()` required when `lazyConnect: true`**
ioredis with `lazyConnect: true` does not auto-connect. Call `await redis.connect()` explicitly in `main()` before the server starts listening. The `lazyConnect` option is useful to avoid crashing on import if Redis is briefly unavailable — but connection is still required before use.

**`prisma db push` creates the database if it doesn't exist**
Running `npx prisma db push` on a fresh PostgreSQL instance will create the `gamersense` database automatically. No need to manually `CREATE DATABASE gamersense` first.
