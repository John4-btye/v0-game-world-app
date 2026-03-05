import { CommunitySearch } from '@/components/communities/community-search'

export default function CommunitiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          Communities
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover gaming communities by name, platform, or genre
        </p>
      </div>
      <CommunitySearch />
    </div>
  )
}
