import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Transaction,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Persona } from '@/types'
import type { CreatePersonaInput } from '../types'

export const PERSONAS_PAGE_SIZE = 10

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

/** Normaliza un CI (mayúsculas, sin espacios) validando formato alfanumérico. */
export function normalizarCi(ci: string): string {
  const limpio = ci.trim().toUpperCase()
  if (!/^[A-Z0-9]+$/.test(limpio) || limpio.length < 3 || limpio.length > 20) {
    throw new Error('El CI debe ser alfanumérico, de 3 a 20 caracteres.')
  }
  return limpio
}

function toPersona(
  snap: QueryDocumentSnapshot | DocumentSnapshot,
): Persona | null {
  if (!snap.exists()) {
    return null
  }
  const data = snap.data() as Omit<Persona, 'id' | 'nombreBusqueda' | 'ci'> & {
    nombreBusqueda?: string
    ci?: string
  }
  return {
    ...data,
    id: snap.id,
    nombreBusqueda: data.nombreBusqueda ?? '',
    ci: data.ci ?? '',
  }
}

/**
 * Reserva el CI en `personaCi/{ci}` dentro de la transacción. El marcador
 * nunca se libera (el CI no se reutiliza) y así el CI es único incluso
 * ante registros concurrentes.
 */
async function reclamarCi(
  tx: Transaction,
  ci: string,
  personaId: string,
): Promise<void> {
  const marcador = doc(db, 'personaCi', ci)
  const snap = await tx.get(marcador)
  if (snap.exists()) {
    throw new Error('El CI ya está registrado en otra persona.')
  }
  tx.set(marcador, { personaId, createdAt: serverTimestamp() })
}

async function existeCi(ci: string, excluirId?: string): Promise<boolean> {
  const snap = await getDocs(
    query(collection(db, 'personas'), where('ci', '==', ci), limit(1)),
  )
  return snap.docs.some((d) => d.id !== excluirId)
}

export async function createPersona(data: CreatePersonaInput): Promise<string> {
  const ci = normalizarCi(data.ci)
  if (await existeCi(ci)) {
    throw new Error('El CI ya está registrado en otra persona.')
  }
  const ref = doc(collection(db, 'personas'))
  await runTransaction(db, async (tx) => {
    await reclamarCi(tx, ci, ref.id)
    tx.set(ref, {
      nombre: data.nombre.trim(),
      ci,
      direccion: data.direccion?.trim() ?? '',
      telefono: data.telefono?.trim() ?? '',
      estado: data.estado,
      nombreBusqueda: toNombreBusqueda(data.nombre),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
  return ref.id
}

export async function updatePersona(
  id: string,
  data: CreatePersonaInput,
): Promise<void> {
  const ci = normalizarCi(data.ci)
  const actual = await getPersona(id)
  if (actual === null) {
    throw new Error('La persona no existe.')
  }
  const cambioCi = actual.ci !== ci
  if (cambioCi && (await existeCi(ci, id))) {
    throw new Error('El CI ya está registrado en otra persona.')
  }
  const payload = {
    nombre: data.nombre.trim(),
    ci,
    direccion: data.direccion?.trim() ?? '',
    telefono: data.telefono?.trim() ?? '',
    estado: data.estado,
    nombreBusqueda: toNombreBusqueda(data.nombre),
    updatedAt: serverTimestamp(),
  }
  if (!cambioCi) {
    await updateDoc(doc(db, 'personas', id), payload)
    return
  }
  await runTransaction(db, async (tx) => {
    await reclamarCi(tx, ci, id)
    tx.update(doc(db, 'personas', id), payload)
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
  const vistos = new Set(docs.map((d) => d.id))
  let personas = docs
    .map((d) => toPersona(d))
    .filter((p): p is Persona => p !== null)
  // La búsqueda también considera el prefijo del CI (consulta acotada
  // adicional de un solo campo; se fusiona sin romper la paginación).
  if (prefijo !== '') {
    const prefCi = prefijo.toUpperCase()
    const ciSnap = await getDocs(
      query(
        ref,
        orderBy('ci'),
        where('ci', '>=', prefCi),
        where('ci', '<=', prefCi + FIN_RANGO_PREFIJO),
        limit(pageSize),
      ),
    )
    for (const d of ciSnap.docs) {
      if (!vistos.has(d.id)) {
        const p = toPersona(d)
        if (p !== null) {
          personas.push(p)
        }
      }
    }
  }
  if (estado !== null) {
    personas = personas.filter((p) => p.estado === estado)
  }
  return {
    personas,
    lastVisible: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === pageSize,
  }
}
