import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { setOnUnauthorized } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children, initialUser = null, skipInitialFetch = false }) {
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(!skipInitialFetch)

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getMe()
      setUser(me)
      return me
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null)
    })
    if (!skipInitialFetch) {
      refreshUser()
    }
    return () => setOnUnauthorized(null)
  }, [refreshUser, skipInitialFetch])

  const login = async (credentials) => {
    const loggedUser = await authService.login(credentials)
    setUser(loggedUser)
    return loggedUser
  }

  const register = async (payload) => {
    const newUser = await authService.register(payload)
    setUser(newUser)
    return newUser
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return ctx
}
