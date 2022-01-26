import Router from "next/router"
import { createContext, ReactNode, useState } from "react"
import { api } from "../services/api"
import { setCookie } from 'nookies'

type User = {
  email: string;
  permissions: string[];
  roles: string[]
}

type SignInCredentials = {
  email: string;
  password: string
}

type AuthContextData = {
  signIn(credential: SignInCredentials): Promise<void>
  isAuthenticated: boolean
  user: User
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null)
  const isAuthenticated = !!user

  async function signIn({ email, password }: SignInCredentials) {

    try {
      const response = await api.post('/sessions', { email, password })

      const { token, refreshToken, permissions, roles } = response.data

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: '/'
      })
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })

      Router.push("/dashboard")
    } catch (error) {
      console.warn(error)
    }

  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}