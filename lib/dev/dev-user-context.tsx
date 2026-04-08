'use client'

import { createContext, useContext, useState, useCallback, useSyncExternalStore } from 'react'
import { FAKE_USERS, FakeUser, devStore } from './fake-users'

interface DevUserContextType {
  // Active simulated user (null = using real auth)
  activeDevUser: FakeUser | null
  setActiveDevUser: (user: FakeUser | null) => void
  
  // Dev mode toggle
  isDevMode: boolean
  toggleDevMode: () => void
  
  // All fake users
  fakeUsers: FakeUser[]
  
  // Store subscription for re-renders
  storeVersion: number
  
  // Helper to get user by ID
  getFakeUser: (id: string) => FakeUser | undefined
}

const DevUserContext = createContext<DevUserContextType | null>(null)

export function DevUserProvider({ children }: { children: React.ReactNode }) {
  const [activeDevUser, setActiveDevUser] = useState<FakeUser | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  
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
      }
      return !prev
    })
  }, [])

  const getFakeUser = useCallback((id: string) => {
    return FAKE_USERS.find(u => u.id === id)
  }, [])

  return (
    <DevUserContext.Provider value={{
      activeDevUser,
      setActiveDevUser,
      isDevMode,
      toggleDevMode,
      fakeUsers: FAKE_USERS,
      storeVersion,
      getFakeUser,
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
