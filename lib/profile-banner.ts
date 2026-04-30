export type BannerPreset =
  | 'aurora'
  | 'nebula'
  | 'arcade'
  | 'midnight'
  | 'sunset'
  | 'cobalt'

export const BANNER_PRESETS: { key: BannerPreset; label: string; css: string }[] =
  [
    {
      key: 'aurora',
      label: 'Aurora',
      css: 'radial-gradient(800px 240px at 15% 20%, rgba(59,130,246,0.45), transparent 60%), radial-gradient(700px 260px at 85% 35%, rgba(168,85,247,0.35), transparent 60%), linear-gradient(135deg, rgba(2,6,23,1), rgba(15,23,42,1))',
    },
    {
      key: 'nebula',
      label: 'Nebula',
      css: 'radial-gradient(700px 220px at 25% 30%, rgba(236,72,153,0.35), transparent 62%), radial-gradient(700px 260px at 75% 35%, rgba(59,130,246,0.35), transparent 62%), linear-gradient(135deg, rgba(2,6,23,1), rgba(9,9,11,1))',
    },
    {
      key: 'arcade',
      label: 'Arcade',
      css: 'radial-gradient(900px 260px at 20% 25%, rgba(34,197,94,0.22), transparent 60%), radial-gradient(700px 240px at 80% 35%, rgba(59,130,246,0.35), transparent 58%), radial-gradient(650px 220px at 65% 0%, rgba(168,85,247,0.30), transparent 60%), linear-gradient(135deg, rgba(2,6,23,1), rgba(15,23,42,1))',
    },
    {
      key: 'midnight',
      label: 'Midnight',
      css: 'radial-gradient(800px 260px at 35% 25%, rgba(37,99,235,0.28), transparent 62%), linear-gradient(135deg, rgba(2,6,23,1), rgba(2,6,23,1))',
    },
    {
      key: 'sunset',
      label: 'Sunset',
      css: 'radial-gradient(900px 260px at 25% 35%, rgba(249,115,22,0.25), transparent 60%), radial-gradient(700px 240px at 80% 35%, rgba(168,85,247,0.28), transparent 60%), linear-gradient(135deg, rgba(2,6,23,1), rgba(15,23,42,1))',
    },
    {
      key: 'cobalt',
      label: 'Cobalt',
      css: 'radial-gradient(800px 260px at 30% 40%, rgba(14,165,233,0.30), transparent 62%), radial-gradient(700px 220px at 70% 25%, rgba(59,130,246,0.35), transparent 60%), linear-gradient(135deg, rgba(2,6,23,1), rgba(15,23,42,1))',
    },
  ]

export function resolveBannerPreset(
  preset: unknown,
  fallback: BannerPreset = 'aurora',
): BannerPreset {
  const key = typeof preset === 'string' ? preset : ''
  const found = BANNER_PRESETS.find((p) => p.key === key)?.key
  return found ?? fallback
}

export function bannerCssForPreset(preset: unknown): string {
  const key = resolveBannerPreset(preset)
  return BANNER_PRESETS.find((p) => p.key === key)?.css ?? BANNER_PRESETS[0].css
}

