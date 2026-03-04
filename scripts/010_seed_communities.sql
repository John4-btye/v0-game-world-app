-- Seed popular multiplayer gaming communities.
-- owner_id is set to '00000000-0000-0000-0000-000000000000' as a system placeholder.
-- These are pre-seeded so new users can discover and join them immediately.

INSERT INTO public.communities (name, slug, description, icon_url, game_tags, is_nsfw, owner_id)
VALUES
  -- Battle Royale / Shooters
  ('Fortnite', 'fortnite', 'The ultimate Battle Royale. Squad up and claim Victory Royale.', 'https://media.rawg.io/media/games/dcb/dcbb67f7f8bbc13c14a46c0d834e0346.jpg', ARRAY['battle-royale','shooter','cross-platform','pc','playstation','xbox','nintendo-switch','mobile'], false, '00000000-0000-0000-0000-000000000000'),
  ('Call of Duty: Warzone', 'call-of-duty-warzone', 'Free-to-play battle royale from the Call of Duty franchise.', 'https://media.rawg.io/media/games/736/73619d4e68dc22ac3528083c3531d4de.jpg', ARRAY['battle-royale','shooter','fps','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Apex Legends', 'apex-legends', 'Fast-paced hero shooter battle royale by Respawn Entertainment.', 'https://media.rawg.io/media/games/b72/b7233d5d5b1e75e86bb860ccc7aeca85.jpg', ARRAY['battle-royale','shooter','fps','pc','playstation','xbox','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),
  ('Valorant', 'valorant', 'Tactical 5v5 character-based shooter by Riot Games.', 'https://media.rawg.io/media/games/530/5302dd22a190e664531236ca724e8726.jpg', ARRAY['shooter','fps','tactical','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Counter-Strike 2', 'counter-strike-2', 'The definitive competitive FPS. Precision gunplay and strategy.', 'https://media.rawg.io/media/games/736/73619d4e68dc22ac3528083c3531d4de.jpg', ARRAY['shooter','fps','tactical','competitive','pc'], false, '00000000-0000-0000-0000-000000000000'),
  ('Overwatch 2', 'overwatch-2', 'Team-based hero shooter. Pick a role and fight for victory.', 'https://media.rawg.io/media/games/4f0/4f0cd318a44bb2b29984c3792e475808.jpg', ARRAY['shooter','fps','hero-shooter','pc','playstation','xbox','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),
  ('Rainbow Six Siege', 'rainbow-six-siege', 'Tactical team-based FPS with destructible environments.', 'https://media.rawg.io/media/games/1e5/1e5e33b88be978f451cb60aae4f6e853.jpg', ARRAY['shooter','fps','tactical','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Halo Infinite', 'halo-infinite', 'Master Chief returns. Free-to-play multiplayer arena combat.', 'https://media.rawg.io/media/games/e1f/e1ffbeb1bac25b19749ad285ca29e158.jpg', ARRAY['shooter','fps','arena','pc','xbox'], false, '00000000-0000-0000-0000-000000000000'),

  -- MOBA / Strategy
  ('League of Legends', 'league-of-legends', 'The world''s most popular MOBA. 5v5 strategic team battles.', 'https://media.rawg.io/media/games/78b/78bc81e247fc7e77af700cbd632a9297.jpg', ARRAY['moba','strategy','competitive','pc'], false, '00000000-0000-0000-0000-000000000000'),
  ('Dota 2', 'dota-2', 'Deep strategic MOBA with over 100 heroes. The International awaits.', 'https://media.rawg.io/media/games/83f/83f6f70a7c1b86571e9b103cd8f5e3be.jpg', ARRAY['moba','strategy','competitive','pc'], false, '00000000-0000-0000-0000-000000000000'),

  -- Survival / Sandbox
  ('Minecraft', 'minecraft', 'Build, explore, survive. Endless multiplayer worlds.', 'https://media.rawg.io/media/games/b4e/b4e4c73d5aa4ec66bbf75571572571ce.jpg', ARRAY['sandbox','survival','creative','cross-platform','pc','playstation','xbox','nintendo-switch','mobile'], false, '00000000-0000-0000-0000-000000000000'),
  ('Rust', 'rust', 'Harsh survival multiplayer. Gather, build, raid.', 'https://media.rawg.io/media/games/13a/13a528ac9cf48bbb6be5d35fe029336d.jpg', ARRAY['survival','sandbox','pvp','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('ARK: Survival Ascended', 'ark-survival-ascended', 'Survive and tame dinosaurs in this massive open-world multiplayer.', 'https://media.rawg.io/media/games/a44/a446530e5e5ae7d95cfacc8de3fb06b0.jpg', ARRAY['survival','sandbox','open-world','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Palworld', 'palworld', 'Catch creatures, build bases, and survive with friends.', 'https://media.rawg.io/media/games/b37/b37e233e9ccc3a0558371ea4bca94245.jpg', ARRAY['survival','sandbox','open-world','pc','xbox'], false, '00000000-0000-0000-0000-000000000000'),

  -- MMORPGs
  ('Final Fantasy XIV', 'final-fantasy-xiv', 'Award-winning MMORPG with an incredible story and community.', 'https://media.rawg.io/media/games/3a2/3a2e2fb7cae83e0e89a8bc2b0c71b9e6.jpg', ARRAY['mmorpg','rpg','fantasy','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('World of Warcraft', 'world-of-warcraft', 'The legendary MMORPG. Explore Azeroth with millions of players.', 'https://media.rawg.io/media/games/149/149b6b780eba052ef9b7e5625e3fbfa1.jpg', ARRAY['mmorpg','rpg','fantasy','pc'], false, '00000000-0000-0000-0000-000000000000'),
  ('Destiny 2', 'destiny-2', 'Looter-shooter MMO with raids, dungeons, and PvP.', 'https://media.rawg.io/media/games/34b/34b1f1850a1c06fd971bc9f7dd4ac6f5.jpg', ARRAY['mmorpg','shooter','looter','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),

  -- Sports / Racing
  ('Rocket League', 'rocket-league', 'Soccer meets rocket-powered cars. Competitive and chaotic.', 'https://media.rawg.io/media/games/8cc/8cce7c0e99dcc43d66c8efd42f9c277b.jpg', ARRAY['sports','racing','competitive','cross-platform','pc','playstation','xbox','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),
  ('EA FC 25', 'ea-fc-25', 'The world''s biggest football/soccer game. Ultimate Team and Pro Clubs.', 'https://media.rawg.io/media/games/14a/14a83c56ff668baaced6e8c8704b6391.jpg', ARRAY['sports','football','competitive','pc','playstation','xbox','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),
  ('NBA 2K25', 'nba-2k25', 'Hit the court with friends in the premier basketball sim.', 'https://media.rawg.io/media/games/473/473bd9a5e9522c43d6e0cec707cf38f9.jpg', ARRAY['sports','basketball','competitive','pc','playstation','xbox','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),
  ('Mario Kart 8 Deluxe', 'mario-kart-8-deluxe', 'Race against friends with iconic Nintendo characters.', 'https://media.rawg.io/media/games/267/267bd0dbc839e24b2b2cee7ac9afe3d7.jpg', ARRAY['racing','party','competitive','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),

  -- Co-op / Party
  ('Among Us', 'among-us', 'Social deduction at its finest. Find the impostor!', 'https://media.rawg.io/media/games/e74/e74458058b35e01c1ae3feeb39a3f724.jpg', ARRAY['party','social-deduction','cross-platform','pc','mobile','nintendo-switch','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Lethal Company', 'lethal-company', 'Co-op horror. Scavenge moons for scrap with your crew.', 'https://media.rawg.io/media/screenshots/4c0/4c043fd1a016acd461e3c5227ef37812.jpg', ARRAY['co-op','horror','indie','pc'], false, '00000000-0000-0000-0000-000000000000'),
  ('Phasmophobia', 'phasmophobia', 'Co-op ghost hunting. Use real equipment to identify spirits.', 'https://media.rawg.io/media/games/2c8/2c877e87e2b6a6e406e3b6c96f8e7eda.jpg', ARRAY['co-op','horror','indie','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Deep Rock Galactic', 'deep-rock-galactic', 'Co-op FPS mining. Rock and Stone, brother!', 'https://media.rawg.io/media/games/6fe/6fef21eba5af6d8f0daa3f999e1fddde.jpg', ARRAY['co-op','shooter','fps','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('It Takes Two', 'it-takes-two', 'Award-winning co-op adventure for two players.', 'https://media.rawg.io/media/games/d47/d479582b3f0e83652b907751bbd5f0b2.jpg', ARRAY['co-op','adventure','platformer','pc','playstation','xbox','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),

  -- Fighting
  ('Super Smash Bros. Ultimate', 'super-smash-bros-ultimate', 'Everyone is here! The ultimate crossover fighting game.', 'https://media.rawg.io/media/games/224/224de2e39f216ef4a9d1183e36f35dce.jpg', ARRAY['fighting','party','competitive','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),
  ('Street Fighter 6', 'street-fighter-6', 'The legendary fighting franchise reborn with modern controls.', 'https://media.rawg.io/media/games/6b8/6b85c5e44e512e6e4e442c5dd7826d60.jpg', ARRAY['fighting','competitive','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Mortal Kombat 1', 'mortal-kombat-1', 'Brutal fighting reborn. A new era begins.', 'https://media.rawg.io/media/games/d74/d74154014e5a1989e41e36e8e1486b1b.jpg', ARRAY['fighting','competitive','pc','playstation','xbox','nintendo-switch'], false, '00000000-0000-0000-0000-000000000000'),

  -- Mobile-first
  ('Genshin Impact', 'genshin-impact', 'Open-world action RPG with co-op. Explore Teyvat with friends.', 'https://media.rawg.io/media/games/d1a/d1a2e99ade53494c6330a7e05b0267a0.jpg', ARRAY['rpg','open-world','co-op','cross-platform','pc','playstation','xbox','mobile'], false, '00000000-0000-0000-0000-000000000000'),
  ('PUBG Mobile', 'pubg-mobile', 'Battle royale on the go. 100 players, one winner.', 'https://media.rawg.io/media/games/4a0/4a0a1316102366260e6f38fd2a9cfdce.jpg', ARRAY['battle-royale','shooter','mobile'], false, '00000000-0000-0000-0000-000000000000'),
  ('Brawl Stars', 'brawl-stars', 'Fast-paced 3v3 and battle royale by Supercell.', 'https://media.rawg.io/media/screenshots/4c0/4c043fd1a016acd461e3c5227ef37812.jpg', ARRAY['shooter','party','competitive','mobile'], false, '00000000-0000-0000-0000-000000000000'),
  ('Clash Royale', 'clash-royale', 'Real-time strategy card battles. Build your deck, destroy towers.', 'https://media.rawg.io/media/screenshots/4c0/4c043fd1a016acd461e3c5227ef37812.jpg', ARRAY['strategy','card-game','competitive','mobile'], false, '00000000-0000-0000-0000-000000000000'),

  -- Sandbox / Creative
  ('Roblox', 'roblox', 'Create and play millions of user-made multiplayer experiences.', 'https://media.rawg.io/media/games/34b/34b1f1850a1c06fd971bc9f7dd4ac6f5.jpg', ARRAY['sandbox','creative','cross-platform','pc','xbox','mobile'], false, '00000000-0000-0000-0000-000000000000'),
  ('GTA Online', 'gta-online', 'Los Santos is your playground. Heists, races, and mayhem.', 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg', ARRAY['open-world','action','pvp','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Sea of Thieves', 'sea-of-thieves', 'Pirate adventure on the open seas. Crew up and sail.', 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg', ARRAY['adventure','open-world','co-op','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000'),
  ('Helldivers 2', 'helldivers-2', 'Co-op third-person shooter. Spread managed democracy across the galaxy.', 'https://media.rawg.io/media/games/b37/b37e233e9ccc3a0558371ea4bca94245.jpg', ARRAY['co-op','shooter','action','pc','playstation'], false, '00000000-0000-0000-0000-000000000000'),
  ('Monster Hunter Wilds', 'monster-hunter-wilds', 'Hunt massive creatures with friends in a living ecosystem.', 'https://media.rawg.io/media/games/2c8/2c877e87e2b6a6e406e3b6c96f8e7eda.jpg', ARRAY['co-op','action','rpg','pc','playstation','xbox'], false, '00000000-0000-0000-0000-000000000000')

ON CONFLICT (slug) DO NOTHING;
