/**
 * Import popular games as communities (top ~100 across PC/PlayStation/Xbox).
 *
 * Requirements:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - RAWG_API_KEY (or NEXT_PUBLIC_RAWG_API_KEY)
 *
 * Usage:
 *   node scripts/import_popular_games.mjs
 *
 * Notes:
 * - Uses RAWG cover art (`background_image`) as `icon_url`.
 * - Inserts only missing communities (by slug).
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RAWG_KEY = process.env.RAWG_API_KEY || process.env.NEXT_PUBLIC_RAWG_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!RAWG_KEY) {
  console.error('Missing RAWG_API_KEY or NEXT_PUBLIC_RAWG_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

const RAWG_BASE = 'https://api.rawg.io/api'
const PLATFORM_IDS = {
  pc: '4',
  playstation: '187,18,16', // PS5, PS4, PS3
  xbox: '186,1,14', // Xbox Series, Xbox One, Xbox 360
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function normalizePlatforms(rawgPlatforms = []) {
  const slugs = new Set()
  for (const p of rawgPlatforms) {
    const s = p?.platform?.slug
    if (!s) continue
    if (s.includes('playstation')) slugs.add('playstation')
    if (s.includes('xbox')) slugs.add('xbox')
    if (s === 'pc') slugs.add('pc')
  }
  return Array.from(slugs)
}

function normalizeTags(rawgGame) {
  const tags = new Set()
  const platforms = normalizePlatforms(rawgGame.platforms)
  for (const p of platforms) tags.add(p)
  if (platforms.length >= 2) tags.add('cross-platform')

  for (const g of rawgGame.genres || []) {
    if (g?.slug) tags.add(g.slug)
  }
  // Keep the UI filters happy for common slugs
  for (const t of rawgGame.tags || []) {
    if (!t?.slug) continue
    if (t.slug === 'battle-royale') tags.add('battle-royale')
    if (t.slug === 'co-op') tags.add('co-op')
    if (t.slug === 'mmo') tags.add('mmorpg')
    if (t.slug === 'racing') tags.add('racing')
    if (t.slug === 'sports') tags.add('sports')
    if (t.slug === 'shooter') tags.add('shooter')
  }

  return Array.from(tags).slice(0, 12)
}

async function rawgFetchGames({ platforms, page, pageSize }) {
  const url = new URL(`${RAWG_BASE}/games`)
  url.searchParams.set('key', RAWG_KEY)
  url.searchParams.set('page', String(page))
  url.searchParams.set('page_size', String(pageSize))
  url.searchParams.set('platforms', platforms)
  // A decent proxy for "popular right now" on RAWG
  url.searchParams.set('ordering', '-added')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`RAWG error ${res.status}`)
  return res.json()
}

async function getExistingSlugs() {
  const slugs = new Set()
  let from = 0
  const pageSize = 1000
  for (;;) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from('communities')
      .select('slug')
      .range(from, to)
    if (error) throw error
    if (!data || data.length === 0) break
    for (const row of data) {
      if (row?.slug) slugs.add(row.slug)
    }
    if (data.length < pageSize) break
    from += pageSize
  }
  return slugs
}

async function main() {
  const existingSlugs = await getExistingSlugs()
  console.log(`Existing communities: ${existingSlugs.size}`)

  const candidates = []
  const seen = new Set()

  for (const [platformKey, platforms] of Object.entries(PLATFORM_IDS)) {
    let page = 1
    while (candidates.length < 140 && page <= 8) {
      const data = await rawgFetchGames({ platforms, page, pageSize: 40 })
      for (const game of data?.results || []) {
        const name = game?.name
        if (!name) continue
        const slug = game?.slug || slugify(name)
        if (!slug || seen.has(slug) || existingSlugs.has(slug)) continue

        const iconUrl = game?.background_image || null
        const description = `Community hub for ${name}. Find teammates, chat, and schedule sessions.`
        const platformsNormalized = normalizePlatforms(game.platforms)
        const gameTags = normalizeTags(game)

        candidates.push({
          name,
          slug,
          description,
          icon_url: iconUrl,
          platforms: platformsNormalized,
          game_tags: gameTags,
          is_nsfw: false,
          is_deleted: false,
          created_by: null,
        })
        seen.add(slug)
        if (candidates.length >= 140) break
      }
      page += 1
      if (!data?.next) break
    }
    console.log(`Collected ${candidates.length} candidates after ${platformKey}`)
  }

  // Keep top 100 inserts (stable ordering by name).
  candidates.sort((a, b) => a.name.localeCompare(b.name))
  const toInsert = candidates.slice(0, 100)
  console.log(`Inserting ${toInsert.length} communities...`)

  const { error } = await supabase
    .from('communities')
    .insert(toInsert, { returning: 'minimal' })

  if (error) {
    console.error('Insert error:', error.message)
    process.exit(1)
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

