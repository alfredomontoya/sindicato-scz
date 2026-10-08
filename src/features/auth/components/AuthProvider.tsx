import { onAuthStateChanged, type User } from 'firebase/auth'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { auth } from '@/firebase/config'
import { signIn as firebaseSignIn, signOut as firebaseSignOut } from '@/firebase/auth'
import type { Usuario } from '@/types'
import { getUsuario } from '@/features/usuarios/services/usuarioService'

export interface AuthContextValue {
  user: User | null
  profile: Usuario | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PREFIJO_INTERNO = '[[AUTH]]'

function mensajeAmigable(error: unknown): string {
  if (error instanceof Error && error.message.startsWith(PREFIJO_INTERNO)) {
    return error.message.slice(PREFIJO_INTERNO.length)
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Correo electrónico o contraseña incorrectos.'
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espere unos minutos e intente nuevamente.'
      case 'auth/network-request-failed':
        return 'Error de conexión. Revise su conexión a internet.'
      default:
        break
    }
  }
  console.error(error)
  return 'No se pudo iniciar sesión. Intente nuevamente.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      void (async () => {
        try {
          if (fbUser === null) {
            setUser(null)
            setProfile(null)
            return
          }
          setUser(fbUser)
          const perfil = await getUsuario(fbUser.uid)
          setProfile(perfil !== null && perfil.estado ? perfil : null)
        } catch (error) {
          console.error(error)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      })()
    })
    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signIn: async (email: string, password: string) => {
        try {
          const fbUser = await firebaseSignIn(email.trim(), password)
          const perfil = await getUsuario(fbUser.uid)
          if (perfil === null) {
            throw new Error(
              `${PREFIJO_INTERNO}Su cuenta no está registrada en el sistema. Contacte al administrador.`,
            )
          }
          if (!perfil.estado) {
            throw new Error(
              `${PREFIJO_INTERNO}Su cuenta está deshabilitada. Contacte al administrador.`,
            )
          }
          setUser(fbUser)
          setProfile(perfil)
        } catch (error) {
          if (error instanceof Error && error.message.startsWith(PREFIJO_INTERNO)) {
            await firebaseSignOut().catch((e: unknown) => console.error(e))
          }
          throw new Error(mensajeAmigable(error))
        }
      },
      signOut: async () => {
        await firebaseSignOut()
        setUser(null)
        setProfile(null)
      },
    }),
    [user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
