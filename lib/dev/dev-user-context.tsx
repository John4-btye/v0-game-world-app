'use client'

import { createContext, useContext, useState, useCallback, useSyncExternalStore, useEffect } from 'react'
import { FAKE_USERS, FakeUser, devStore } from './fake-users'

interface RealUserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface DevUserContextType {
  // Active simulated user (null = using real auth)
  activeDevUser: FakeUser | null
  setActiveDevUser: (user: FakeUser | null) => void
  
  // Dev mode toggle
  isDevMode: boolean
  toggleDevMode: () => void
  
  // All users (fake + real)
  fakeUsers: FakeUser[]
  allUsers: FakeUser[]
  
  // Real authenticated user
  realUser: FakeUser | null
  
  // Store subscription for re-renders
  storeVersion: number
  
  // Helper to get user by ID
  getUser: (id: string) => FakeUser | undefined
}

const DevUserContext = createContext<DevUserContextType | null>(null)

export function DevUserProvider({ children }: { children: React.ReactNode }) {
  const [activeDevUser, setActiveDevUser] = useState<FakeUser | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const [realUser, setRealUser] = useState<FakeUser | null>(null)
  
  // Fetch real user profile on mount
  useEffect(() => {
    const fetchRealUser = async () => {
      try {
        console.log('[v0 DevUser] Fetching real user profile...')
        const res = await fetch('/api/user')
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            const profile = data.profile as RealUserProfile
            const realUserData = {
              id: profile.id,
              username: profile.username || 'unknown',
              display_name: profile.display_name || profile.username || 'You',
              avatar_url: profile.avatar_url,
              status: 'online' as const,
              isRealUser: true,
            }
            console.log('[v0 DevUser] Real user loaded:', {
              id: realUserData.id,
              username: realUserData.username,
              display_name: realUserData.display_name,
            })
            setRealUser(realUserData)
          } else {
            console.log('[v0 DevUser] No profile found in response')
          }
        } else {
          console.log('[v0 DevUser] Failed to fetch user, status:', res.status)
        }
      } catch (error) {
        console.log('[v0 DevUser] Error fetching real user:', error)
      }
    }
    fetchRealUser()
  }, [])
  
  // Combine fake users with real user
  const allUsers = realUser ? [realUser, ...FAKE_USERS] : FAKE_USERS
  
  // Log merged user list when it changes
  useEffect(() => {
    if (realUser) {
      console.log('[v0 DevUser] Merged user list:', allUsers.map(u => ({
        id: u.id,
        username: u.username,
        isRealUser: u.isRealUser || false,
      })))
    }
  }, [realUser, allUsers])
  
  // Subscribe to store changes for re-renders
  const storeVersion = useSyncExternalStore(
    devStore.subscribe.bind(devStore),
    () => Date.now(), // Trigger re-render on any change
    () => 0
  )

  const toggleDevMode = useCallback(() => {
    setIsDevMode(prev => {
      if (prev) {
        // Turning off dev mode - clear active dev user
        setActiveDevUser(null)
        console.log('[v0 DevUser] Dev mode disabled')
      } else {
        console.log('[v0 DevUser] Dev mode enabled')
      }
      return !prev
    })
  }, [])
  
  // Log when active user changes
  const handleSetActiveDevUser = useCallback((user: FakeUser | null) => {
    console.log('[v0 DevUser] Selected user:', user ? {
      id: user.id,
      username: user.username,
      isRealUser: user.isRealUser || false,
    } : 'None (using real auth)')
    setActiveDevUser(user)
  }, [])

  const getUser = useCallback((id: string) => {
    if (realUser && realUser.id === id) return realUser
    return FAKE_USERS.find(u => u.id === id)
  }, [realUser])

  return (
    <DevUserContext.Provider value={{
      activeDevUser,
      setActiveDevUser: handleSetActiveDevUser,
      isDevMode,
      toggleDevMode,
      fakeUsers: FAKE_USERS,
      allUsers,
      realUser,
      storeVersion,
      getUser,
    }}>
      {children}
    </DevUserContext.Provider>
  )
}

export function useDevUser() {
  const context = useContext(DevUserContext)
  if (!context) {
    throw new Error('useDevUser must be used within DevUserProvider')
  }
  return context
}
