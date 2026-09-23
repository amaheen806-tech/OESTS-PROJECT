import { createContext, useContext, useState, useEffect } from 'react'

// This context keeps track of the logged in user everywhere in the app.
// Right now it works with the backend API. Once you connect the real
// Django backend, the login/register functions below will call it.

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // When the app first loads, check if a user was already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('oests_user')
    const savedToken = localStorage.getItem('oests_token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  function login(userData, token) {
    setUser(userData)
    localStorage.setItem('oests_user', JSON.stringify(userData))
    localStorage.setItem('oests_token', token)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('oests_user')
    localStorage.removeItem('oests_token')
  }

  const value = { user, login, logout, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
