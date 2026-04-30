export const bannerStyles: Record<string, string> = {
  nebula: 'linear-gradient(90deg, #7c3aed, #4f46e5, #3b82f6)',
  aurora: 'linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)',
  arcade: 'linear-gradient(90deg, #ec4899, #ef4444, #eab308)',
  midnight: 'linear-gradient(90deg, #020617, #1e293b, #000000)',
  sunset: 'linear-gradient(90deg, #fb923c, #f472b6, #ef4444)',
  cobalt: 'linear-gradient(90deg, #3b82f6, #1d4ed8, #1e40af)',
};

export function getBannerStyle(preset?: string) {
  return bannerStyles[preset || 'nebula'] || bannerStyles['nebula'];
}
