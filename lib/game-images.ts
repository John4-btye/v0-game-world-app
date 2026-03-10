// All 36 games mapped to local images in /public/games/
const ALL_GAMES = [
  'fortnite', 'call-of-duty-warzone', 'apex-legends', 'valorant',
  'counter-strike-2', 'overwatch-2', 'rainbow-six-siege', 'halo-infinite',
  'league-of-legends', 'dota-2', 'minecraft', 'rust', 'ark-survival-ascended',
  'palworld', 'final-fantasy-xiv', 'world-of-warcraft', 'destiny-2',
  'rocket-league', 'ea-fc-25', 'nba-2k25', 'mario-kart-8-deluxe',
  'among-us', 'lethal-company', 'phasmophobia', 'deep-rock-galactic',
  'it-takes-two', 'super-smash-bros-ultimate', 'street-fighter-6',
  'mortal-kombat-1', 'genshin-impact', 'pubg-mobile', 'brawl-stars',
  'clash-royale', 'roblox', 'gta-online', 'sea-of-thieves',
  'helldivers-2', 'monster-hunter-wilds'
]

export function getGameImage(slug: string): string | null {
  return ALL_GAMES.includes(slug) ? `/games/${slug}.jpg` : null
}
