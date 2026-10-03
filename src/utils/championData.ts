import type { Champion, ChampionsData } from '../types/champion'

const VERSIONS_URL    = 'https://ddragon.leagueoflegends.com/api/versions.json'
const CDN_BASE        = 'https://ddragon.leagueoflegends.com/cdn'
const FALLBACK_VERSION = '16.10.1'

interface DDragonBasic {
  name: string
  title: string
  blurb: string
  info: { difficulty: number }
  tags: string[]
}

interface DDragonDetail {
  lore?: string
  allytips?: string[]
  enemytips?: string[]
}

// ── DDragon version cache ──────────────────────────────────────────────────────

let cachedVersion: string | null = null
let versionPromise: Promise<string> | null = null

async function getDDragonVersion(): Promise<string> {
  if (cachedVersion !== null) return cachedVersion
  if (versionPromise !== null) return versionPromise

  versionPromise = (async (): Promise<string> => {
    try {
      const res = await fetch(VERSIONS_URL)
      if (!res.ok) {
        cachedVersion = FALLBACK_VERSION
        return FALLBACK_VERSION
      }
      const versions = (await res.json()) as string[]
      const version = versions[0] ?? FALLBACK_VERSION
      cachedVersion = version
      return version
    } catch {
      cachedVersion = FALLBACK_VERSION
      return FALLBACK_VERSION
    }
  })()

  return versionPromise
}

// ── Champion cache ─────────────────────────────────────────────────────────────

let cachedChampions: Champion[] | null = null
let fetchPromise: Promise<Champion[]> | null = null

/**
 * Resolves a local champion to its Data Dragon id, i.e. its key in champion.json's `data`
 * (e.g. local "Lee" -> "LeeSin", "Wukong" -> "MonkeyKing", "BelVeth" -> "Belveth").
 * Local ids and names don't always match Data Dragon, so try in order:
 *   1. the local id, if it is already a champion.json key
 *   2. the id in the local splash URL (`.../splash/LeeSin_0.jpg`), which uses Data Dragon ids
 *   3. a punctuation/case-insensitive match against champion.json keys and display names
 */
function resolveDDragonId(champ: Champion, ddMap: Record<string, DDragonBasic>): string | null {
  if (ddMap[champ.id]) return champ.id

  const fromSplash = champ.splashUrl.match(/\/splash\/([A-Za-z0-9]+)_\d+\.jpg$/)?.[1]
  if (fromSplash && ddMap[fromSplash]) return fromSplash

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const wanted = new Set([normalize(champ.id), normalize(champ.name)])
  for (const [key, dd] of Object.entries(ddMap)) {
    if (wanted.has(normalize(key)) || wanted.has(normalize(dd.name))) return key
  }
  return null
}

function mapDifficulty(d: number): number {
  if (d <= 4) return 1
  if (d <= 7) return 2
  return 3
}

export function getCachedChampions(): Champion[] | null {
  return cachedChampions
}

export async function getChampions(): Promise<Champion[]> {
  if (cachedChampions !== null) return cachedChampions
  if (fetchPromise !== null) return fetchPromise

  fetchPromise = (async (): Promise<Champion[]> => {
    try {
      const version = await getDDragonVersion()
      const base    = `${CDN_BASE}/${version}/data/en_US`

      // Fetch local JSON and DDragon list simultaneously
      const [localRes, listRes] = await Promise.all([
        fetch('/data/champions.json'),
        fetch(`${base}/champion.json`),
      ])
      if (!localRes.ok) throw new Error('Failed to load local champions')
      if (!listRes.ok)  throw new Error('Failed to load DDragon list')

      const local = (await localRes.json()) as ChampionsData
      const list  = (await listRes.json()) as { data: Record<string, DDragonBasic> }
      const ddMap = list.data

      // Local id -> Data Dragon id (champion.json key). Every Data Dragon request uses the latter.
      const ddIds = new Map(local.champions.map(c => [c.id, resolveDDragonId(c, ddMap)] as const))

      // Fetch all individual champion files in parallel for lore, allytips, enemytips
      // (these fields are not present in the list endpoint)
      const detailMap = new Map<string, DDragonDetail>()
      await Promise.allSettled(
        local.champions.map(async c => {
          const ddId = ddIds.get(c.id)
          if (!ddId) return
          const r = await fetch(`${base}/champion/${ddId}.json`)
          if (!r.ok) return
          const json = (await r.json()) as { data: Record<string, DDragonDetail> }
          const d = json.data[ddId]
          if (d) detailMap.set(c.id, d)
        })
      )

      const merged = local.champions.map(champ => {
        const ddId   = ddIds.get(champ.id) ?? undefined
        const dd     = ddId ? ddMap[ddId] : undefined
        const detail = detailMap.get(champ.id)

        const strengths  = (detail?.allytips  ?? []).filter(Boolean).slice(0, 3)
        const weaknesses = (detail?.enemytips ?? []).filter(Boolean).slice(0, 2)

        return {
          ...champ,
          ddragonId:   ddId,
          name:        dd?.name      ?? champ.name,
          title:       dd?.title     ?? champ.title,
          description: detail?.lore  ?? dd?.blurb   ?? champ.description,
          tags:        dd?.tags      ?? champ.tags,
          difficulty:  dd ? mapDifficulty(dd.info.difficulty) : champ.difficulty,
          strengths:   strengths.length  > 0 ? strengths  : champ.strengths,
          weaknesses:  weaknesses.length > 0 ? weaknesses : champ.weaknesses,
        }
      })

      cachedChampions = merged
      return merged
    } catch (err) {
      // Clear fetchPromise so callers can retry on next mount
      fetchPromise = null
      throw err
    }
  })()

  return fetchPromise
}
