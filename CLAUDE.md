# GamerSense Project

## Stack
React 18 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + React Router v7

## Routes
/page1 → Page1.tsx
/page2 → Page2.tsx
/page3 → Page3.tsx
/page4 → Page4.tsx
/page5 → Page5.tsx
/page6 → Page6.tsx
/page7 → Page7.tsx
/page8 → Page8.tsx
/page9 → Page9.tsx
/page10 → Page10.tsx
/page11 → Page11.tsx
/page12 → Page12.tsx

## Colors
bg: #F0F2F5
navy: #060F1E
card: #0D1F3C
cardLight: #112040
footer: #0A1628
border: #1E3A5F
teal: #00C9A7
tealLight: #38E8CC
gold: #C9A227
text: #E8EDF5
textMuted: #8FA3C0

## Rules
- Import animation variants from `src/lib/animations.ts` only
- Always use `useReducedMotion()` guard on every animation
- TypeScript strict mode — no `any`
- Run `npm run build` and fix all errors before finishing any task
- Always Glob before writing an asset import to confirm exact filename
- **Self-update rule:** Whenever a new pattern, fix, or lesson surfaces during a session that would have saved time if known upfront, append it to the relevant section of this file before ending the session
- Always set `background: 'transparent'` on `<main>` in page components. App.tsx owns the global background (Group 249.png fixed div at `zIndex: -1`). Adding background images inside `<main>` creates duplicate layers at different scales.

## Async Fetch Patterns

### Module-level promise deduplication
Prevents duplicate concurrent fetches without a listener queue. Store the in-flight promise at module scope; all callers share it. Pair with a sync `getCached*()` accessor so hooks initialise without a loading flash on re-mount.
```ts
let cache: T[] | null = null
let promise: Promise<T[]> | null = null

export const getCached = (): T[] | null => cache
export async function getAll(): Promise<T[]> {
  if (cache) return cache
  if (promise) return promise
  promise = (async () => { /* fetch, set cache, return */ })()
  return promise
}
```

## Framer Motion Patterns

### Two-layer motion div — entry + hover
Use two nested `motion.div`s so entry and hover animations don't conflict. Outer owns entry (`initial`/`animate`/`transition`), inner owns hover (`whileHover` only). Never put `whileHover` on the same element that has an `animate` with conflicting properties.
```tsx
<motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.65, delay }}>
  <motion.div whileHover={reduced ? {} : { scale:1.04, y:-8, transition:{ duration:0.3 } }}>
    {/* content */}
  </motion.div>
</motion.div>
```

### Hover-stuck bug — animated property missing from `animate`
Framer Motion only reverts a `whileHover` property when that property also exists in `animate`. If `filter` (or any CSS property) appears only in `whileHover`, it stays applied after cursor leaves. Fix: define the rest-state value in `animate` and use the `default` key in `transition` to isolate the entry timing from the hover timing:
```tsx
animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
transition={{ default: { duration:0.35, delay:0.1 }, filter: { duration:0.15 } }}
whileHover={{ filter: 'brightness(1.2) drop-shadow(0 0 8px #00D4D8)' }}
```

### Duplicate `transition` prop TS error
Adding a second `transition` prop to fix the hover-stuck bug causes TS17001. Merge everything into one prop using per-property keys (`default`, `filter`, etc.) as shown above.

## Header / Nav Patterns

### Excluding a page from the feature nav
`FEATURE_PATHS` controls which nav style the Header renders. To give a page the HOME + FEATURES nav (instead of the 6-item feature nav) while still keeping it as a link inside the feature nav for other pages:
```tsx
// Keep in FEATURE_NAV so it appears as a link on /page3, /page4, etc.
// Filter it out of FEATURE_PATHS so visiting it uses the home nav style
const FEATURE_PATHS = new Set(FEATURE_NAV.map(n => n.to).filter(p => p !== '/page2'))
```
Then add `isX = pathname === '/pageN'` and use it to drive active color + NavIcon on the home-nav link.

### Multi-page feature active state
When a feature spans multiple pages (e.g., Trivia: /page6, /page7, /page9), define a named path set and spread it into `FEATURE_PATHS`. Use a per-item active check in the render loop:
```tsx
const TRIVIA_PATHS = new Set(['/page6', '/page7', '/page9'])
const FEATURE_PATHS = new Set([...FEATURE_NAV.map(n => n.to), ...TRIVIA_PATHS])
// in render:
const active = label === 'TRIVIA' ? TRIVIA_PATHS.has(pathname) : pathname === to
```

## Asset Filenames
All asset filenames use **spaces**, not underscores on disk. Always Glob to confirm before importing.

## Gradient Text Pattern (double-layer)
Used on all section headings:
```tsx
<div className="relative">
  <h2 className="... bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
      style={{ mixBlendMode: 'multiply' as const }}>Title</h2>
  <h2 className="absolute inset-0 ... bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
      aria-hidden="true">Title</h2>
</div>
```

## Champion System

### Architecture
- Types: `src/types/champion.ts` — `Champion`, `ChampionsData`, `Role`
- Utility: `src/utils/championData.ts` — `getChampions()` (async, fetches + merges DDragon data, cached via module-level promise) + `getCachedChampions()` (sync, used by hook for zero-flash initial state)
- Hook: `src/hooks/useChampions.ts` — delegates to `getChampions()`; initialises state from `getCachedChampions()` so re-mounting components skip `loading: true` when cache is warm
- Grid page: `src/pages/Page5.tsx` — role filter, search, hover preview modal
- Detail page: `src/pages/ChampionDetail.tsx` — route `/champion/:id`
- App.tsx: `<Route path="/champion/:id" element={<ChampionDetail />} />`
- Header: `isChampion = pathname.startsWith('/champion/')` → `isFeaturePage = FEATURE_PATHS.has(pathname) || isChampion` + active highlight for 'KNOWLEDGE HUB' nav item

### DDragon data gotchas
- **Version is dynamic**: `getDDragonVersion()` (private, in `championData.ts`) fetches `https://ddragon.leagueoflegends.com/api/versions.json` and uses `versions[0]`. Cached in `cachedVersion` / `versionPromise` using the same module-level deduplication pattern as `getChampions`. Falls back to `FALLBACK_VERSION = '16.10.1'` on any error without throwing.
- The list endpoint (`champion.json`) has `name`, `title`, `blurb`, `info.difficulty`, `tags` — but NOT `lore`, `allytips`, or `enemytips`. Fetch individual files (`champion/{id}.json`) for those.
- DDragon IDs differ from display names for: `JarvanIV`, `Kaisa`, `Khazix`, `LeeSin`, `Leblanc`, `MasterYi`, `MissFortune`, `TahmKench`, `TwistedFate`, `XinZhao`, `Velkoz`, `Belveth`, `Chogath`, `RekSai`, and `MonkeyKing` (Wukong). IDs in `champions.json` already align — use `id` field directly as the DDragon lookup key.

### Scrollable grid inside a fixed-height background panel
Use `overflow: hidden` on the outer div (bg image owner) and `overflow-y: auto` on the inner grid div. The outer clips scroll overflow; the background stays fixed. Scrollbar CSS lives in `index.css` under `.champion-grid-scroll`.

### Fixed-position tooltip — avoid transform conflict with Framer Motion
Never combine CSS `transform: translateY(-50%)` with Framer Motion's `x`/`y` animate values — they overwrite each other. Center vertically with `top: '50%'` and `marginTop: -N` (half estimated height) instead.

### Dynamic-prefix routes + nav active state
For routes like `/champion/:id` in a feature group: detect with `pathname.startsWith('/champion/')`, apply to both `isFeaturePage` and the per-nav-item `active` check for 'KNOWLEDGE HUB'.

## CSS Rules & Gotchas

### z-index only works on positioned elements
`z-index` has no effect unless the element also has `position` set (relative/absolute/fixed/sticky). Always pair z-index with a position value.

### overflow-hidden creates scroll containers
`overflow-x: hidden` forces `overflow-y: auto`, making the element a scroll container. Use `overflow: hidden` (both axes) only when intentional, and never when child elements need to overflow a boundary (e.g. images at `top: -150px`).

### clip-path for asymmetric clipping
When you need to allow overflow in one direction but clip in another, use `clip-path: inset()` with negative values instead of overflow-hidden:
- `inset(-250px 0 0 0)` = extend clip region 250px above, clip exactly at right/bottom/left
- Does NOT create a scroll container
- Does NOT affect layout flow

### Images in flex containers — implicit bottom spacing
An `<img>` inside a `flex-col` container can produce implicit bottom spacing even with `pb-0`. Fix: move the image outside the flex container into a sibling `<div style={{ lineHeight: 0, fontSize: 0 }}>`.

### Hardcoded height vs visual content gap
If a section has `height: Xpx` but absolute-positioned content only fills `(X - gap)px`, a visible gap appears before the next section. Match the height to the actual visual content height.

### Negative marginTop for seamless section overlap
Use `marginTop: -Npx` to pull a section slightly under its predecessor for a seamless visual join. Account for this offset when calculating subsequent element positions.

### `margin` shorthand silently overrides `marginTop`
In a React style object, `{ margin: '0 auto', marginTop: '80px' }` — the shorthand sets `margin-top: 0`, killing `marginTop`. Fix: always split into `{ marginLeft: 'auto', marginRight: 'auto', marginTop: '80px' }`.

### SVG assets with hidden `<foreignObject>` glow
SVG files may contain a `<foreignObject>` element with `backdrop-filter: blur()` that produces an always-on glow. This is invisible in the SVG source at a glance. If a button or panel has an unexpected persistent glow, open the SVG and delete the `<foreignObject>` block entirely.

### Tailwind arbitrary-value gradient classes may not generate for page headings
`bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent` on `<h1>` elements may produce no visible gradient at build time. Use inline CSS instead:
```tsx
style={{
  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}}

### Profile hook
- Types: `src/types/profile.ts` — `UserProfile { id, username, avatarUrl, level, membershipTier }`
- Hook: `src/hooks/useProfile(userId)` — `GET /profile/:userId`; skips fetch when `userId` is falsy or `VITE_API_URL` is not set; re-fetches when `userId` changes; returns `{ profile, loading, error }`
- **Data sourcing split:** Pages 6/7/9 use `useAuthStore().user` directly for the local player (data already available from login); Page10 uses `useProfile(user?.id)` for the dedicated profile fetch
- Fallback image: `gray profile.png` used on all cards when `avatarUrl` is absent or user is not authenticated
- **Page6** — added `label` prop to local `PlayerCard` component (was hardcoded); local player: `user?.avatarUrl ?? GrayProfile` + `user?.username`; opponent: `GrayProfile` + "Player Profile"
- **Page7** — same pattern; host card: auth user data; invited card: `GrayProfile`; removed `Player1`/`Player2` imports
- **Page9** — winner card: `user?.avatarUrl ?? GrayProfile` (still blurred + WinnerCup overlay); removed unused `Player1` import
- **Page10** — `Group 367.svg` is a pure SVG frame (0 text elements); avatar overlaid at `top:6%, left:9%, width:82%, height:62%`; username text overlaid at `top:71%` centred; all positions are approximations of the SVG portrait/name zones

### Game store
- Location: `src/store/gameStore.ts` — Zustand 5
- State: `currentRound` (1-based), `totalRounds` (default 3), `points`, `answers: AnswerRecord[]`, `opponentScore`
- `AnswerRecord`: `{ round, selectedId, correctId, isCorrect, pointsEarned }`
- `submitAnswer(answer)` — appends to answers, increments `currentRound` up to `totalRounds`
- `addPoints(pts)` — accumulates into `points`
- `resetGame()` — resets all fields to initial values (keeps `totalRounds`)
- Page9 left score: `answers.filter(a => a.isCorrect).length`; right score: `opponentScore` (0 until backend sets it)
- Page11 round bar: `currentRound/{totalRounds}` + diamond indicators + `points`
- Page12 results bar: `answers.length || currentRound` (completed round number, not the next round); points card: `points`
- Score SVGs (`Group 322`, `Group 12`) replaced entirely — they had no text and no purpose without live data
- `RoundText` SVG (`Group 364`) replaced with dynamic div — same absolute position inside `RoundBg` container
- `PointsCard` SVG (`Group _349`) and `ResultsBar` SVG (`Group 370`) kept as visual frames with dynamic text overlaid

### Leaderboard hook
- Types: `src/types/leaderboard.ts` — `LeaderboardEntry { rank, name, points, tier }`
- Hook: `src/hooks/useLeaderboard()` — `GET /leaderboard`; no params; cancel-on-unmount pattern; returns `{ entries, loading, error }`
- **Two leaderboard consumers:** `src/components/Leaderboard.tsx` (at `/`) and `src/pages/Page1.tsx` (at `/page1`) — both call `useLeaderboard()` independently
- `Leaderboard.tsx` was originally a static SVG image (`Group 386.svg` — 0 text elements, pure visual frame). It was rewritten to an HTML table using `useLeaderboard()`, replacing only the SVG table image while keeping the heading, PrizeDraw SVG, and ViewBtn SVG unchanged.
- Skeleton: 5 ghost rows in a single pulsing `motion.div`; placeholder bars `height: 20px` (matches real ~14px text row height); column widths `[28, 55, 35, 45]%` for Rank/Name/Points/Tier; pulse `animate={{ opacity: [0.5, 1, 0.5] }}` disabled when `reduced`
- Error state: `display: flex; alignItems: center; justifyContent: center; height: 260px` — keeps the table frame from collapsing; error message centred
- Body wrapper `minHeight: 260px` (≈ 5 rows × 52px) prevents frame collapse in all states
- **Watch-out:** if only `Page1.tsx` was updated (not `Leaderboard.tsx`), the leaderboard at `/` would still show the blank SVG frame — Task 5's original scope missed this.

### Questions hook
- Types: `src/types/question.ts` — `Answer { id, text }`, `Question { id, type, lane, question, hint, answers, correctAnswerId, explanation }`
- Hook: `src/hooks/useQuestions(type, lane)` — `GET /questions?type=&lane=`; re-fetches whenever either param changes; returns `{ question, loading, error }`
- Page3 (Scenarios): `useQuestions('scenario', activeLane)` — resets `selectedAnswer`/`locked` on lane change
- Page4 (Blitz): `useQuestions('blitz', activeLane)` — same reset pattern
- Page8 (Trivia): `useQuestions('trivia', '')` — no lane
- Answer text overlays: `Group 269.svg` has no baked-in text — always overlay answer text on each button region
- Lock-in button: guarded by `!loading` so it stays disabled until a question is loaded

### `erasableSyntaxOnly` — no parameter properties in classes
`tsconfig.app.json` enables `"erasableSyntaxOnly": true`, which bans TypeScript-specific syntax that emits JavaScript (enums, namespaces, parameter properties). Never write `constructor(public readonly x: T)`. Instead expand into an explicit class field plus assignment:
```ts
class Foo extends Error {
  readonly x: number
  constructor(x: number) { super(); this.x = x }
}
```

---

## Backend Integration

### API client
- Location: `src/lib/api.ts`
- Base URL: `import.meta.env.VITE_API_URL` (set in `.env.local`)
- Auth token: stored in `localStorage` under key `gs_token`
- 401 handler: only redirects when `getToken()` is non-null (expired session). Login failures (no token yet) fall through to normal error handling so the modal can show "Invalid email or password".
- Update `REDIRECT_ON_401` constant to `'/login'` once that route exists
- Exports: `apiGet<T>`, `apiPost<T>`, `apiPut<T>`, plus `getToken`, `setToken`, `clearToken`, `ApiError`
- Env type: declared in `src/vite-env.d.ts` (`VITE_API_URL?: string`)

### Auth store
- Location: `src/store/authStore.ts` — Zustand 5 store
- State: `user: AuthUser | null`, `token: string | null`, `isAuthenticated: boolean`, `loginModalOpen: boolean`
- `AuthUser`: `{ id, username, email, avatarUrl, level, membershipTier: 'free' | 'premium' }`
- `login(token, user)` — writes token via `setToken()`, persists user JSON to `localStorage` under `gs_user`, closes modal
- `logout()` — clears both keys, resets state
- `loadFromStorage()` — called in `main.tsx` before `createRoot`; reads `gs_token` + `gs_user` and rehydrates state
- `openLoginModal()` / `closeLoginModal()` — drive the modal from anywhere

### LoginModal
- Location: `src/components/LoginModal.tsx` — rendered once in `App.tsx` after `<Routes>`
- Reads `loginModalOpen` from store; uses `AnimatePresence` for entry/exit
- Backdrop click and Escape key both close and reset form state
- Calls `POST /auth/login` via `apiPost<LoginResponse>`; on 401 shows "Invalid email or password" (no redirect, because no existing token at login time)

---

## Champion System Task

### Build complete champion pages for all 181 League of Legends champions

**Data:** `/public/data/champions.json` (181 champions ready to use)
**Reference:** `/public/data/sample_champions_database.json` (5 examples)
**Full Specs:** `COMPLETE_CHAMPION_SYSTEM_IMPLEMENTATION.md`

### 1. Update Page5.tsx (Knowledge Hub)
Add to existing page:
- Load champions from `/public/data/champions.json`
- Role filter buttons (already exist, make them functional)
- Search bar above grid
- Hover effect: blur grid + show preview modal
- Click champion → navigate to `/champion/[name]`

### 2. Create ChampionDetail.tsx
New dynamic route: `/champion/:name`

Page sections:
- Hero: Splash art + name overlay (use champion.color for gradient)
- Info + Stats: Two columns (description left, stat bars right)
- Strengths/Weaknesses: Two columns with bullets
- Game Sense Tip: Highlighted box with 💡
- Navigation: Prev/Next/Back buttons

### Design:
- Match existing Gamersense dark theme (navy bg, cyan accents)
- Use champion.color for per-champion theming (hero gradient, stats bars, borders)
- Follow existing card/button styles from Page5

### Notes:
- Use React Router dynamic routes
- Filter/search champions by role and name
- Responsive layout
- Use existing animation patterns (see Framer Motion section above)

---

## Deployment

### Server routing — required before going live

The app uses `BrowserRouter`, which means React Router handles navigation client-side. In production, any direct URL hit (e.g. `/page5`, `/champion/Ahri`) goes straight to the server. The server must return `index.html` for every route so the client-side router can take over.

**Without this config, all routes except `/` return a 404 after deployment.**

#### nginx
Add `try_files` inside the `server` block:
```nginx
location / {
    try_files $uri /index.html;
}
```

#### Express (static file serving)
Add a catch-all after any other routes:
```js
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))
```

#### Vercel
Add to `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### Netlify
Add to `public/_redirects` (or `netlify.toml`):
```
/*  /index.html  200
```

## Backend Integration — Phase 6 Complete

### Environment
- Frontend `.env.local`: `VITE_API_URL=http://localhost:3000`, `VITE_SOCKET_URL=http://localhost:3000`
- Backend runs on port 3000 (PostgreSQL on 5433, Redis on 6379)

### API response shapes (frontend must unwrap)
- `GET /leaderboard` → `{ leaderboard: LeaderboardEntry[] }`
- `GET /questions` → `{ questions: Question[] }`
- `POST /answers/submit` → `{ correct, correctAnswer, explanation, pointsEarned, totalPoints, tier }`
- `POST /matches/create` → `{ matchId, inviteToken, inviteUrl }`
- `GET /matches/join/:token` → `{ matchId, hostId, invitedId }`

### Question field names — backend vs old frontend type
| Old frontend | Backend (current) |
|---|---|
| `question` | `text` |
| `answers` | `options` |
| `correctAnswerId` | `correctAnswer` |

### Socket.io client — `src/lib/socket.ts`
- Singleton: `getSocket()` (lazy init, autoConnect false) / `connectSocket()` (explicit) / `disconnectSocket()`
- Auth token sent via `socket.auth = { token }` in handshake
- Pages that use sockets: Page7 (match create), Page1 (live trivia), Page9 (GTR + match:end), Page10 (match:end banner), Page12 (guest join via URL token)

### Auth protection — `RequireAuth` component
Wraps protected route children. Opens login modal and renders null when unauthenticated.
Protected routes: pages 3, 4, 6, 7, 8, 9, 10, 11, 12. Public: `/`, `/page1`, `/page2`, `/page5`, `/champions/*`.

### LoginModal — register tab added
Toggle between LOGIN and CREATE ACCOUNT modes. Register calls `POST /auth/register` with `{ username, email, password }`.

### `void` pattern for async onClick handlers
```tsx
onClick={() => { void handleAsync() }}
```
Avoids floating-promise TS errors without try/catch boilerplate at the call site.

## SVG Asset Patterns

### New clean SVG frames vs old underscore variants
Assets come in two variants: `Group _349.svg` (old, may have baked-in PNG text) and `Group 349.svg` (new, pure vector frame, no text). Always Glob before importing — user-supplied filenames may use underscores as space-separators (e.g. `Group_374.svg` means `Group 374.svg`). Verify the file actually exists before writing the import.

### Baked-in SVG text — cover vs overlay
If a SVG contains no `<text>` elements but has a large embedded `<image>` (base64 PNG), placeholder text is rasterised into that PNG and cannot be removed. Cover it with a `background`-coloured div inset 2px from the border, then overlay dynamic text on top. For new clean SVGs (no embedded PNG text), overlay text directly — no cover div needed.

### SVG text overlay typography pattern
When overlaying text on a card SVG frame, position with `position: absolute, inset: 0` and use flex for alignment. Apply gradient text with:
```tsx
style={{
  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}}
```
For bottom-anchored labels (rank cards): `justifyContent: 'flex-end', paddingBottom: '10%'`.

### GTR result flow — Page 9 → Page 12
After `submitVote` resolves in `useGTRRound`, save result + stats to game store via `setGTRResult`. Page 12 reads `gtrResult` from the store to render `votedRank`, `correctRank`, `totalVotes`, and `percentages`. Bar heights are derived dynamically: `height = (pct / maxPct) * BAR_RENDER_MAX`. User's pick renders teal, correct answer renders gold.
