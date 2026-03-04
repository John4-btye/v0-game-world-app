import { searchGames } from '@/lib/rawg'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get('q') ?? ''
  const genres = searchParams.get('genres') ?? ''
  const platforms = searchParams.get('platforms') ?? ''
  const tags = searchParams.get('tags') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  try {
    const data = await searchGames({
      query: query || undefined,
      genres: genres || undefined,
      platforms: platforms || undefined,
      tags: tags || undefined,
      page,
      page_size: 20,
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 },
    )
  }
}
