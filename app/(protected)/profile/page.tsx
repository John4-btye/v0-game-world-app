import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getBannerStyle } from '@/lib/profile/banner-styles';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return <div className="p-6 text-muted-foreground">Profile not found.</div>;
  }

  // Banner logic (FIXED)
  const bannerUrl = profile.banner_url || null;
  const bannerStyle = getBannerStyle(profile.banner_preset);

  return (
    <div className="space-y-6">
      {/* ========================= */}
      {/* PROFILE HEADER */}
      {/* ========================= */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Banner */}
        <div
          className="relative h-28 w-full"
          style={
            bannerUrl
              ? {
                  backgroundImage: `url(${bannerUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  backgroundImage: bannerStyle,
                }
          }
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
              {profile.display_name?.[0] || 'U'}
            </div>

            {/* Name */}
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {profile.display_name || 'Unknown User'}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>

              <button className="mt-2 rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90 transition">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
            <div>
              <p className="font-semibold text-foreground">
                {profile.community_count ?? 0}
              </p>
              <p className="text-muted-foreground">Communities</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">
                {profile.friend_count ?? 0}
              </p>
              <p className="text-muted-foreground">Friends</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
              <p className="text-muted-foreground">Member Since</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= */}
      {/* GAMER IDENTITY */}
      {/* ========================= */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Gamer Identity
        </h3>

        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Favorite Games */}
          <div>
            <p className="text-muted-foreground mb-1">Favorite Games</p>
            <div className="flex flex-wrap gap-2">
              {(profile.favorite_games || []).length > 0 ? (
                profile.favorite_games.map((game: string) => (
                  <span
                    key={game}
                    className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                  >
                    {game}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">
                  None selected
                </span>
              )}
            </div>
          </div>

          {/* Play Style */}
          <div>
            <p className="text-muted-foreground mb-1">Play Style</p>
            <span className="rounded-md bg-secondary px-2 py-1 text-xs">
              {profile.play_style || 'Not set'}
            </span>
          </div>

          {/* Platforms */}
          <div>
            <p className="text-muted-foreground mb-1">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {(profile.platforms || []).map((platform: string) => (
                <span
                  key={platform}
                  className="rounded-md bg-secondary px-2 py-1 text-xs"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Active Hours */}
          <div>
            <p className="text-muted-foreground mb-1">Usually Active</p>
            <span className="rounded-md bg-secondary px-2 py-1 text-xs">
              {profile.active_hours || 'Not set'}
            </span>
          </div>
        </div>

        {/* Looking for squad */}
        {profile.looking_for_squad && (
          <div className="mt-4 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm text-primary">
            Looking for squad
          </div>
        )}
      </section>
    </div>
  );
}
