// Local game image mapping - falls back to placeholder
export function getGameImage(slug: string): string | null {
  const localImages: Record<string, boolean> = {
    'fortnite': true,
    'minecraft': true,
    'valorant': true,
    'apex-legends': true,
    'call-of-duty-warzone': true,
    'league-of-legends': true,
    'rocket-league': true,
    'among-us': true,
    'gta-online': true,
    'overwatch-2': true,
  }
  return localImages[slug] ? `/games/${slug}.jpg` : null
}
