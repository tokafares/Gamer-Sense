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
- The list endpoint (`champion.json`) has `name`, `title`, `blurb`, `info.difficulty`, `tags` — but NOT `lore`, `allytips`, or `enemytips`. Fetch individual files (`champion/{id}.json`) for those.
- Portrait URL version is `16.10.1` (not `14.23.1`).
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
