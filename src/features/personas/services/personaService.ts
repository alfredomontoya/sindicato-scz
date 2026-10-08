import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Persona } from '@/types'
import type { CreatePersonaInput } from '../types'

export const PERSONAS_PAGE_SIZE = 20

/** Carácter alto (U+F8FF) para cerrar rangos de prefijo en Firestore. */
const FIN_RANGO_PREFIJO = String.fromCharCode(0xf8ff)

/** Normaliza un nombre para búsquedas (minúsculas, sin tildes ni espacios extra). */
export function toNombreBusqueda(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function toPersona(
  snap: QueryDocumentSnapshot | DocumentSnapshot,
): Persona | null {
  if (!snap.exists()) {
    return null
  }
  const data = snap.data() as Omit<Persona, 'id' | 'nombreBusqueda'> & {
    nombreBusqueda?: string
  }
  return {
    ...data,
    id: snap.id,
    nombreBusqueda: data.nombreBusqueda ?? '',
  }
}

export async function createPersona(data: CreatePersonaInput): Promise<string> {
  const ref = await addDoc(collection(db, 'personas'), {
    nombre: data.nombre.trim(),
    direccion: data.direccion?.trim() ?? '',
    telefono: data.telefono?.trim() ?? '',
    estado: data.estado,
    nombreBusqueda: toNombreBusqueda(data.nombre),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePersona(
  id: string,
  data: CreatePersonaInput,
): Promise<void> {
  await updateDoc(doc(db, 'personas', id), {
    nombre: data.nombre.trim(),
    direccion: data.direccion?.trim() ?? '',
    telefono: data.telefono?.trim() ?? '',
    estado: data.estado,
    nombreBusqueda: toNombreBusqueda(data.nombre),
    updatedAt: serverTimestamp(),
  })
}

export async function setPersonaEstado(
  id: string,
  estado: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'personas', id), {
    estado,
    updatedAt: serverTimestamp(),
  })
}

export async function getPersona(id: string): Promise<Persona | null> {
  const snap = await getDoc(doc(db, 'personas', id))
  return toPersona(snap)
}

export async function getPersonaNombre(id: string): Promise<string> {
  const persona = await getPersona(id)
  return persona?.nombre ?? '—'
}

/** Conteo eficiente de personas activas (agregación del servidor). */
export async function contarPersonasActivas(): Promise<number> {
  const snap = await getCountFromServer(
    query(collection(db, 'personas'), where('estado', '==', true)),
  )
  return snap.data().count
}

export interface ListPersonasOptions {
  search: string
  estado: boolean | null
  telefono: string
  cursor: QueryDocumentSnapshot | null
  pageSize: number
}

export interface ListPersonasResult {
  personas: Persona[]
  lastVisible: QueryDocumentSnapshot | null
  hasMore: boolean
}

export async function listPersonas(
  options: ListPersonasOptions,
): Promise<ListPersonasResult> {
  const { search, estado, telefono, cursor, pageSize } = options
  const ref = collection(db, 'personas')

  // Búsqueda por teléfono exacto: consulta acotada sin orden (sin índice compuesto).
  const tel = telefono.trim()
  if (tel !== '') {
    const snap = await getDocs(
      query(ref, where('telefono', '==', tel), limit(pageSize)),
    )
    let personas = snap.docs
      .map((d) => toPersona(d))
      .filter((p): p is Persona => p !== null)
    const prefijo = toNombreBusqueda(search)
    if (prefijo !== '') {
      personas = personas.filter((p) => p.nombreBusqueda.includes(prefijo))
    }
    if (estado !== null) {
      personas = personas.filter((p) => p.estado === estado)
    }
    return { personas, lastVisible: null, hasMore: false }
  }

  // Listado principal: ordenado por nombre; el filtro de estado se aplica en
  // memoria sobre la página para no exigir un índice compuesto (ver Fase 7).
  const constraints: QueryConstraint[] = [orderBy('nombreBusqueda')]
  const prefijo = toNombreBusqueda(search)
  if (prefijo !== '') {
    constraints.push(
      where('nombreBusqueda', '>=', prefijo),
      where('nombreBusqueda', '<=', prefijo + FIN_RANGO_PREFIJO),
    )
  }
  constraints.push(limit(pageSize))
  if (cursor !== null) {
    constraints.push(startAfter(cursor))
  }
  const snap = await getDocs(query(ref, ...constraints))
  const docs = snap.docs
  let personas = docs
    .map((d) => toPersona(d))
    .filter((p): p is Persona => p !== null)
  if (estado !== null) {
    personas = personas.filter((p) => p.estado === estado)
  }
  return {
    personas,
    lastVisible: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === pageSize,
  }
}
