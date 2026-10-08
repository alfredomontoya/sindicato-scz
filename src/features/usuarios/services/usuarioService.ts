import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from 'firebase/auth'
import { getApps, initializeApp } from 'firebase/app'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db, firebaseOptions } from '@/firebase/config'
import type { RolUsuario, Usuario } from '@/types'

export const USUARIOS_PAGE_SIZE = 50

export async function getUsuario(uid: string): Promise<Usuario | null> {
  const snap = await getDoc(doc(db, 'usuarios', uid))
  return toUsuario(snap)
}

function toUsuario(
  snap: { exists(): boolean; id: string; data(): unknown },
): Usuario | null {
  if (!snap.exists()) {
    return null
  }
  return { ...(snap.data() as Omit<Usuario, 'id'>), id: snap.id }
}

/**
 * App secundaria para crear credenciales sin cerrar la sesión del admin.
 * La escritura del perfil usa la app principal (sesión del admin).
 */
function secondaryAuth() {
  const existing = getApps().find((a) => a.name === 'admin-secundaria')
  const app = existing ?? initializeApp(firebaseOptions, 'admin-secundaria')
  return getAuth(app)
}

function mensajeCreacion(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code
    if (code === 'auth/email-already-in-use') {
      return 'El correo electrónico ya está registrado.'
    }
    if (code === 'auth/invalid-email') {
      return 'El correo electrónico no es válido.'
    }
    if (code === 'auth/weak-password') {
      return 'La contraseña es muy débil (mínimo 6 caracteres).'
    }
  }
  console.error(error)
  return 'No se pudo crear el usuario.'
}

export interface CreateUsuarioInput {
  nombre: string
  email: string
  password: string
  rol: RolUsuario
}

export async function createUsuario(data: CreateUsuarioInput): Promise<string> {
  const auth2 = secondaryAuth()
  try {
    const cred = await createUserWithEmailAndPassword(
      auth2,
      data.email.trim(),
      data.password,
    )
    await signOut(auth2)
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      rol: data.rol,
      estado: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return cred.user.uid
  } catch (error) {
    await signOut(auth2).catch((e: unknown) => console.error(e))
    throw new Error(mensajeCreacion(error))
  }
}

export interface UpdateUsuarioInput {
  nombre: string
  rol: RolUsuario
  estado: boolean
}

export async function updateUsuario(
  id: string,
  data: UpdateUsuarioInput,
): Promise<void> {
  await updateDoc(doc(db, 'usuarios', id), {
    nombre: data.nombre.trim(),
    rol: data.rol,
    estado: data.estado,
    updatedAt: serverTimestamp(),
  })
}

export interface ListUsuariosResult {
  usuarios: Usuario[]
  lastVisible: QueryDocumentSnapshot | null
  hasMore: boolean
}

/** Lista paginada por nombre; como son pocos registros, filtra en memoria. */
export async function listUsuarios(
  cursor: QueryDocumentSnapshot | null,
): Promise<ListUsuariosResult> {
  const constraints: QueryConstraint[] = [
    orderBy('nombre'),
    limit(USUARIOS_PAGE_SIZE),
  ]
  if (cursor !== null) {
    constraints.push(startAfter(cursor))
  }
  const snap = await getDocs(query(collection(db, 'usuarios'), ...constraints))
  const docs = snap.docs
  return {
    usuarios: docs
      .map((d) => toUsuario(d))
      .filter((u): u is Usuario => u !== null),
    lastVisible: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === USUARIOS_PAGE_SIZE,
  }
}
