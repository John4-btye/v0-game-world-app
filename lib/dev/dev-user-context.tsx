'use client'

import { createContext, useContext, useState, useCallback, useSyncExternalStore, useEffect } from 'react'
import { FakeUser, devStore } from './fake-users'

interface DevUserContextType {
  // Active simulated user (null = using real auth)
  activeDevUser: FakeUser | null
  setActiveDevUser: (user: FakeUser | null) => void
  
  // Dev mode toggle
  isDevMode: boolean
  toggleDevMode: () => void
  
  // All users from unified API (includes real + fake)
  allUsers: FakeUser[]
  
  // Real authenticated user (if logged in)
  realUser: FakeUser | null
  
  // Loading state
  isLoading: boolean
  
  // Store subscription for re-renders
  storeVersion: number
  
  // Helper to get user by ID
  getUser: (id: string) => FakeUser | undefined
}

const DevUserContext = createContext<DevUserContextType | null>(null)

export function DevUserProvider({ children }: { children: React.ReactNode }) {
  const [activeDevUser, setActiveDevUser] = useState<FakeUser | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const [allUsers, setAllUsers] = useState<FakeUser[]>([])
  const [realUser, setRealUser] = useState<FakeUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch users from unified API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('[v0 DevUser] Fetching users from /api/dev/users...')
        const res = await fetch('/api/dev/users')
        if (res.ok) {
          const data = await res.json()
          const users = data.users as FakeUser[]
          
          console.log('[v0 DevUser] Fetched users:', users.map(u => ({
            id: u.id,
            username: u.username,
            isRealUser: u.isRealUser || false,
          })))
          
          setAllUsers(users)
          
          // Find and set the real user
          const foundRealUser = users.find(u => u.isRealUser)
          if (foundRealUser) {
            console.log('[v0 DevUser] Real user identified:', foundRealUser.username)
            setRealUser(foundRealUser)
          } else {
            console.log('[v0 DevUser] No real user in response (not logged in)')
          }
        } else {
          console.log('[v0 DevUser] Failed to fetch users, status:', res.status)
        }
      } catch (error) {
        console.log('[v0 DevUser] Error fetching users:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])
  
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
    return allUsers.find(u => u.id === id)
  }, [allUsers])

  return (
    <DevUserContext.Provider value={{
      activeDevUser,
      setActiveDevUser: handleSetActiveDevUser,
      isDevMode,
      toggleDevMode,
      allUsers,
      realUser,
      isLoading,
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
