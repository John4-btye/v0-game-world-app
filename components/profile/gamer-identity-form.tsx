'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  profile: any
}

export function GamerIdentityForm({ profile }: Props) {
  const supabase = createClient()

  // --- STATE ---
  const [favoriteGames, setFavoriteGames] = useState<string[]>(
    profile?.favorite_games || []
  )

  const [platforms, setPlatforms] = useState<string[]>(
    profile?.platforms || []
  )

  const [playStyle, setPlayStyle] = useState<string>(
    profile?.play_style || 'casual'
  )

  const [activeHours, setActiveHours] = useState<string>(
    profile?.active_hours || 'flexible'
  )

  const [lookingForSquad, setLookingForSquad] = useState<boolean>(
    profile?.looking_for_squad || false
  )

  const [squadMessage, setSquadMessage] = useState<string>(
    profile?.squad_message || ''
  )

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // --- HELPERS ---
  function parseArrayInput(value: string): string[] {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }

  // --- SAVE HANDLER ---
  async function handleSave() {
    setLoading(true)
    setSuccess(false)
    setErrorMsg(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg('User not authenticated')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        favorite_games: favoriteGames,
        platforms,
        play_style: playStyle,
        active_hours: activeHours,
        looking_for_squad: lookingForSquad,
        squad_message: squadMessage,
      })
      .eq('id', user.id)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  // --- UI ---
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-5">
      <h2 className="text-sm font-semibold text-foreground">
        Gamer Identity
      </h2>

      {/* Favorite Games */}
      <div>
        <label className="text-xs text-muted-foreground">
          Favorite Games (comma separated)
        </label>
        <input
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          defaultValue={favoriteGames.join(', ')}
          onChange={(e) =>
            setFavoriteGames(parseArrayInput(e.target.value))
          }
        />
      </div>

      {/* Platforms */}
      <div>
        <label className="text-xs text-muted-foreground">
          Platforms (PC, Xbox, PlayStation)
        </label>
        <input
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          defaultValue={platforms.join(', ')}
          onChange={(e) =>
            setPlatforms(parseArrayInput(e.target.value))
          }
        />
      </div>

      {/* Play Style */}
      <div>
        <label className="text-xs text-muted-foreground">
          Play Style
        </label>
        <select
          value={playStyle}
          onChange={(e) => setPlayStyle(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="casual">Casual</option>
          <option value="competitive">Competitive</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      {/* Active Hours */}
      <div>
        <label className="text-xs text-muted-foreground">
          Active Hours
        </label>
        <select
          value={activeHours}
          onChange={(e) => setActiveHours(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      {/* Looking for squad */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={lookingForSquad}
          onChange={(e) => setLookingForSquad(e.target.checked)}
        />
        <span className="text-sm">Looking for squad</span>
      </div>

      {/* Squad message */}
      {lookingForSquad && (
        <div>
          <label className="text-xs text-muted-foreground">
            Squad Message
          </label>
          <textarea
            value={squadMessage}
            onChange={(e) => setSquadMessage(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="What kind of teammates are you looking for?"
          />
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Feedback */}
      {success && (
        <p className="text-xs text-green-500">
          Changes saved successfully
        </p>
      )}

      {errorMsg && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </div>
  )
}