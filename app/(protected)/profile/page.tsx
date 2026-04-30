import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getGameImage } from '@/lib/game-images';
import { bannerCssForPreset } from '@/lib/profile-banner';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // -------------------------
  // Fetch profile
  // -------------------------
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return <div className="text-muted-foreground">Profile not found</div>;
  }

  const profileRow = profile as Partial<{
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
    bio: string | null;
    favorite_games: unknown;
    platforms: unknown;
    play_style: unknown;
    active_hours: unknown;
    looking_for_squad: boolean | null;
    squad_message: string | null;
    banner_preset: string | null;
    banner_url: string | null;
  }>;

  // -------------------------
  // User metadata
  // -------------------------
  const meta = user.user_metadata ?? {};

  const displayName =
    profileRow.display_name ||
    meta.full_name ||
    meta.name ||
    (meta as any)?.custom_claims?.global_name ||
    'Gamer';

  const avatarUrl =
    profileRow.avatar_url || meta.avatar_url || meta.picture || null;

  const username =
    profileRow.username ||
    meta.preferred_username ||
    meta.user_name ||
    user.email?.split('@')[0] ||
    'user';

  const bio = profileRow.bio || null;

  const provider = user.app_metadata?.provider ?? 'unknown';

  const createdAt = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // -------------------------
  // Memberships
  // -------------------------
  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id, communities(name, slug, icon_url, game_tags)')
    .eq('user_id', user.id)
    .limit(10);

  // -------------------------
  // Friend count
  // -------------------------
  const { count: friendCount } = await supabase
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  // -------------------------
  // Favorite games logic
  // -------------------------
  const gameTagsFromCommunities: string[] = [];

  memberships?.forEach((m: any) => {
    const comm = m.communities;
    if (comm?.game_tags) {
      gameTagsFromCommunities.push(...comm.game_tags);
    }
  });

  const favoriteGamesFromProfile = Array.isArray(profileRow.favorite_games)
    ? profileRow.favorite_games.filter(
        (g): g is string => typeof g === 'string'
      )
    : [];

  const favoriteGames =
    favoriteGamesFromProfile.length > 0
      ? favoriteGamesFromProfile
      : [...new Set(gameTagsFromCommunities)].slice(0, 5);

  const platforms = Array.isArray(profileRow.platforms)
    ? profileRow.platforms.filter((p): p is string => typeof p === 'string')
    : [];

  const playStyle =
    typeof profileRow.play_style === 'string'
      ? profileRow.play_style
      : 'casual';

  const activeHours =
    typeof profileRow.active_hours === 'string'
      ? profileRow.active_hours
      : 'flexible';

  // -------------------------
  // Banner logic
  // -------------------------
  const bannerUrl = profileRow.banner_url || null;
  const bannerClass = bannerCssForPreset(profileRow.banner_preset);

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>

      {/* ========================= */}
      {/* PROFILE CARD */}
      {/* ========================= */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Banner */}
        <div
          className={`relative h-28 w-full ${bannerUrl ? '' : bannerClass}`}
          style={
            bannerUrl
              ? {
                  backgroundImage: `url(${bannerUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/45" />
        </div>

        {/* Profile Content */}
        <div className="p-6 pt-0">
          <div className="-mt-10 flex items-start gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName}'s avatar`}
                className="h-20 w-20 rounded-full border-2 border-primary/30 bg-card object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-card text-2xl font-bold text-primary">
                {displayName[0]?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1 pt-10">
              <h2 className="text-lg font-bold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">@{username}</p>

              <a
                href="/settings"
                className="mt-2 inline-block rounded-md bg-primary px-3 py-1.5 text-xs text-white"
              >
                Edit Profile
              </a>

              {bio && <p className="mt-2 text-sm">{bio}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-6 border-t pt-4">
            <div>
              <p className="text-lg font-bold">{memberships?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Communities</p>
            </div>

            <div>
              <p className="text-lg font-bold">{friendCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Friends</p>
            </div>

            <div>
              <p className="text-lg font-bold">{createdAt}</p>
              <p className="text-xs text-muted-foreground">Member Since</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* GAMER IDENTITY */}
      {/* ========================= */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold">Gamer Identity</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Favorite Games */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Favorite Games</p>

            {favoriteGames.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {favoriteGames.map((game) => (
                  <span
                    key={game}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    {game}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">
                Join communities to show your favorite games
              </p>
            )}
          </div>

          {/* Play Style */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Play Style</p>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-500">
              {playStyle}
            </span>
          </div>

          {/* Platforms */}
          {platforms.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-secondary px-2 py-1 text-xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Active Hours */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Usually Active</p>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">
              {activeHours}
            </span>
          </div>
        </div>

        {profileRow.looking_for_squad && (
          <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-semibold text-primary">
              Looking for squad
            </p>
            {profileRow.squad_message && (
              <p className="text-sm">{profileRow.squad_message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
