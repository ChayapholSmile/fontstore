"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authAPI, type AuthState } from "@/lib/auth-client"

interface RegisterData {
  email: string
  password: string
  username: string
  displayName: string
  role: "buyer" | "seller"
  language: "en" | "th" | "zh"
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const refreshUser = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const user = await authAPI.getCurrentUser()
      setState((prev) => ({ ...prev, user, loading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load user",
      }))
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await authAPI.login(email, password)
      await refreshUser()
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }))
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await authAPI.register(data)
      await login(data.email, data.password)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Registration failed",
      }))
      throw error
    }
  }

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await authAPI.logout()
      setState((prev) => ({ ...prev, user: null, loading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      }))
      throw error
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
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
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
