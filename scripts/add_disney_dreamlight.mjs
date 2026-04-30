/**
 * Add a single community for "Disney Dreamlight Valley" (requested as "Disney Dreamlight").
 *
 * Requirements:
 * - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY
 * - RAWG_API_KEY (or NEXT_PUBLIC_RAWG_API_KEY)
 *
 * Usage (loads env from your shell):
 *   node scripts/add_disney_dreamlight.mjs
 *
 * Tip (load .env.development.local into the shell first):
 *   bash -lc 'set -a; source .env.development.local; set +a; node scripts/add_disney_dreamlight.mjs'
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RAWG_KEY = process.env.RAWG_API_KEY || process.env.NEXT_PUBLIC_RAWG_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
  )
  process.exit(1)
}
if (!RAWG_KEY) {
  console.error('Missing RAWG_API_KEY or NEXT_PUBLIC_RAWG_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

const RAWG_BASE = 'https://api.rawg.io/api'

function normalizePlatforms(rawgPlatforms = []) {
  const slugs = new Set()
  for (const p of rawgPlatforms) {
    const s = p?.platform?.slug
    if (!s) continue
    if (s.includes('playstation')) slugs.add('playstation')
    if (s.includes('xbox')) slugs.add('xbox')
    if (s === 'pc') slugs.add('pc')
    if (s.includes('nintendo')) slugs.add('nintendo-switch')
    if (s === 'ios' || s === 'android') slugs.add('mobile')
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
    if (t.slug === 'co-op') tags.add('co-op')
    if (t.slug === 'mmo') tags.add('mmorpg')
    if (t.slug === 'racing') tags.add('racing')
    if (t.slug === 'sports') tags.add('sports')
    if (t.slug === 'shooter') tags.add('shooter')
  }

  return Array.from(tags)
}

async function rawgSearchOne(query) {
  const url = new URL(`${RAWG_BASE}/games`)
  url.searchParams.set('key', RAWG_KEY)
  url.searchParams.set('search', query)
  url.searchParams.set('page_size', '5')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`RAWG API error: ${res.status}`)
  const data = await res.json()
  const results = Array.isArray(data?.results) ? data.results : []
  return results
}

async function main() {
  const queries = ['Disney Dreamlight Valley', 'Disney Dreamlight']
  let rawgGame = null

  for (const q of queries) {
    const results = await rawgSearchOne(q)
    rawgGame =
      results.find((g) => g?.slug === 'disney-dreamlight-valley') ||
      results[0] ||
      null
    if (rawgGame) break
  }

  if (!rawgGame) {
    console.error('RAWG search returned no results for Disney Dreamlight.')
    process.exit(1)
  }

  const name = rawgGame.name || 'Disney Dreamlight Valley'
  const slug = rawgGame.slug || 'disney-dreamlight-valley'

  const { data: existing, error: existingError } = await supabase
    .from('communities')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError) {
    console.error('Failed checking existing community:', existingError.message)
    process.exit(1)
  }

  if (existing) {
    console.log(`Community already exists: ${existing.slug} (${existing.id})`)
    return
  }

  const platforms = normalizePlatforms(rawgGame.platforms)
  const game_tags = normalizeTags(rawgGame)
  const description =
    rawgGame?.description_raw ||
    'A cozy life-sim adventure set in a magical Disney and Pixar world.'

  const insertRow = {
    name,
    slug,
    description,
    icon_url: rawgGame.background_image ?? null,
    banner_url: null,
    category: 'general',
    platforms,
    game_tags,
    is_nsfw: false,
    created_by: null,
    is_deleted: false,
  }

  const { data: inserted, error: insertError } = await supabase
    .from('communities')
    .insert(insertRow)
    .select('id, name, slug')
    .single()

  if (insertError) {
    console.error('Failed inserting community:', insertError.message)
    process.exit(1)
  }

  console.log(`Inserted community: ${inserted.name} (${inserted.slug})`)
}

main().catch((err) => {
  console.error(err?.message || String(err))
  process.exit(1)
})

