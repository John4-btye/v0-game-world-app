// ============================================================
// RAWG API client — fetches game data for community search
// Docs: https://rawg.io/apidocs
// ============================================================

const RAWG_BASE = 'https://api.rawg.io/api'
const API_KEY = process.env.RAWG_API_KEY || process.env.NEXT_PUBLIC_RAWG_API_KEY

if (!API_KEY) {
  throw new Error('Missing RAWG_API_KEY (preferred) or NEXT_PUBLIC_RAWG_API_KEY')
}

export interface RawgGame {
  id: number
  name: string
  slug: string
  background_image: string | null
  released: string | null
  metacritic: number | null
  genres: { id: number; name: string; slug: string }[]
  tags: { id: number; name: string; slug: string }[]
  platforms: { platform: { id: number; name: string; slug: string } }[]
  short_screenshots: { id: number; image: string }[]
}

export interface RawgSearchResponse {
  count: number
  next: string | null
  previous: string | null
  results: RawgGame[]
}

/** Search games by name, with optional platform and tag filters */
export async function searchGames(params: {
  query?: string
  genres?: string
  tags?: string
  platforms?: string
  page?: number
  page_size?: number
}): Promise<RawgSearchResponse> {
  const url = new URL(`${RAWG_BASE}/games`)
  url.searchParams.set('key', API_KEY)
  url.searchParams.set('page_size', String(params.page_size ?? 20))
  if (params.query) url.searchParams.set('search', params.query)
  if (params.genres) url.searchParams.set('genres', params.genres)
  if (params.tags) url.searchParams.set('tags', params.tags)
  if (params.platforms) url.searchParams.set('platforms', params.platforms)
  if (params.page) url.searchParams.set('page', String(params.page))
  // Only multiplayer-relevant games
  url.searchParams.set('tags', [params.tags, 'multiplayer'].filter(Boolean).join(','))

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`RAWG API error: ${res.status}`)
  return res.json()
}

/** Get a single game by slug */
export async function getGameBySlug(slug: string): Promise<RawgGame | null> {
  const res = await fetch(`${RAWG_BASE}/games/${slug}?key=${API_KEY}`, {
    next: { revalidate: 3600 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`RAWG API error: ${res.status}`)
  return res.json()
}

/** Platform IDs for RAWG filtering */
export const PLATFORM_IDS = {
  pc: '4',
  playstation: '187,18,16', // PS5, PS4, PS3
  xbox: '186,1,14', // Xbox Series, Xbox One, Xbox 360
  nintendo: '7', // Nintendo Switch
  mobile: '21,3', // Android, iOS
} as const

export const PLATFORM_OPTIONS = [
  { label: 'PC', value: PLATFORM_IDS.pc },
  { label: 'PlayStation', value: PLATFORM_IDS.playstation },
  { label: 'Xbox', value: PLATFORM_IDS.xbox },
  { label: 'Nintendo Switch', value: PLATFORM_IDS.nintendo },
  { label: 'Mobile', value: PLATFORM_IDS.mobile },
] as const

export const GENRE_OPTIONS = [
  { label: 'Action', value: 'action' },
  { label: 'Shooter', value: 'shooter' },
  { label: 'RPG', value: 'role-playing-games-rpg' },
  { label: 'Strategy', value: 'strategy' },
  { label: 'Sports', value: 'sports' },
  { label: 'Racing', value: 'racing' },
  { label: 'Fighting', value: 'fighting' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Puzzle', value: 'puzzle' },
  { label: 'MMO', value: 'massively-multiplayer' },
] as const
