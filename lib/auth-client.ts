export interface User {
  _id: string
  email: string
  name: string
  role: "buyer" | "seller"
  avatar?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export const authAPI = {
  async login(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    return response.json()
  },

  async register(email: string, password: string, name: string, role: "buyer" | "seller") {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  },

  async logout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Logout failed")
    }

    return response.json()
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/auth/me")

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      return null
    }
  },
}
