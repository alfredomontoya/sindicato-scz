import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { resolverEmailsAcceso } from '@/features/auth/constants'
import { auth } from './config'

export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

function esCredencialInvalida(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code
    return (
      code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password'
    )
  }
  return false
}

/**
 * Inicia sesión aceptando usuario o correo: prueba cada dominio de acceso
 * en orden y solo propaga errores que no sean de credencial.
 */
export async function signInConUsuario(
  usuario: string,
  password: string,
): Promise<User> {
  const candidatos = resolverEmailsAcceso(usuario)
  let ultimoError: unknown = null
  for (const email of candidatos) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      return cred.user
    } catch (error) {
      if (!esCredencialInvalida(error)) {
        throw error
      }
      ultimoError = error
    }
  }
  throw ultimoError instanceof Error
    ? ultimoError
    : new Error('No se pudo iniciar sesión.')
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}
