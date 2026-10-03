// Runtime mode flags.
//
// VITE_DEMO_MODE=true builds a backend-free demo: API calls are answered in the
// browser by src/lib/demo/mockApi.ts, the visitor is signed in as a guest, and
// features that need the real-time server (duels) show a "needs live server" screen.

export const DEMO_MODE: boolean = import.meta.env.VITE_DEMO_MODE === 'true'

/** True when REST data is available: a real backend URL, or the in-browser demo API. */
export const HAS_API: boolean = DEMO_MODE || !!import.meta.env.VITE_API_URL
