export function getBannerClass(preset?: string | null): string {
  switch (preset) {
    case 'nebula':
      return 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500';
    case 'aurora':
      return 'bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600';
    case 'arcade':
      return 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500';
    case 'midnight':
      return 'bg-gradient-to-r from-slate-900 via-indigo-900 to-black';
    case 'sunset':
      return 'bg-gradient-to-r from-orange-400 via-pink-500 to-red-500';
    case 'cobalt':
      return 'bg-gradient-to-r from-blue-500 via-blue-700 to-indigo-800';
    default:
      return 'bg-gradient-to-r from-gray-800 to-gray-900';
  }
}
