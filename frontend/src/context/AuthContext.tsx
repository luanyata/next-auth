import Router from "next/router"
import { createContext, ReactNode, useEffect, useState } from "react"

import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from "../services/apiClient"

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
  signIn: (credential: SignInCredentials) => Promise<void>
  signOut: () => void
  isAuthenticated: boolean
  user: User
}

type AuthProviderProps = {
  children: ReactNode
}

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, "nextauth.token")
  destroyCookie(undefined, "nextauth.refreshToken")

  authChannel.postMessage('signOut')

  Router.push('/')
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null)
  const isAuthenticated = !!user

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();
    if (token) {
      api.get('/me')
        .then(response => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles })

        }).catch(() => signOut())
    }
  }, [])


  useEffect(() => {
    authChannel = new BroadcastChannel('auth')
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          authChannel.close()
          break
        default:
          break
      }
    };
  }, [])

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

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push("/dashboard")
    } catch (error) {
      console.warn(error)
    }

  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}