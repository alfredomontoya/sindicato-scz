import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Aporte } from '@/types'
import {
  aplicarMovimientoCierre,
  docIdCierre,
  type TotalesCierre,
} from '@/features/cierres/services/cierreService'
import type { CreateAporteInput } from '../types'

export const APORTES_PAGE_SIZE = 10
const CONTADOR_RECIBOS_ID = 'recibos'

/** Formatea el correlativo como número de recibo de 6 dígitos. */
export function formatearNumeroRecibo(correlativo: number): string {
  return String(correlativo).padStart(6, '0')
}

/** Convierte un input date (yyyy-MM-dd) a Date local (mediodía evita bordes). */
export function fechaInputADate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0)
}

/** Normaliza y valida un monto: finito, > 0 y con máximo 2 decimales. */
export function normalizarMonto(monto: number): number {
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new Error('El monto debe ser mayor que cero.')
  }
  const redondeado = Math.round(monto * 100) / 100
  if (redondeado <= 0 || redondeado > 999999999.99) {
    throw new Error('El monto no es válido.')
  }
  return redondeado
}

function toAporte(
  snap: QueryDocumentSnapshot | DocumentSnapshot,
): Aporte | null {
  if (!snap.exists()) {
    return null
  }
  const data = snap.data() as Omit<Aporte, 'id'>
  return { ...data, id: snap.id }
}

export interface CrearAporteMeta {
  usuarioRegistroId: string
}

/**
 * Registra un aporte asignando el número de recibo correlativo dentro de una
 * transacción sobre `contadores/recibos` (nunca Math.random ni Date.now).
 */
export async function createAporte(
  input: CreateAporteInput,
  meta: CrearAporteMeta,
): Promise<{ id: string; numeroRecibo: string }> {
  const personaSnap = await getDoc(doc(db, 'personas', input.personaId))
  if (!personaSnap.exists()) {
    throw new Error('La persona seleccionada no existe.')
  }
  const personaData = personaSnap.data() as { estado?: boolean }
  if (personaData.estado !== true) {
    throw new Error('La persona está inactiva y no puede recibir aportes.')
  }
  const monto = normalizarMonto(input.monto)
  const concepto = input.concepto.trim()
  if (concepto.length < 2) {
    throw new Error('El concepto es obligatorio.')
  }

  const aporteRef = doc(collection(db, 'aportes'))
  const year = input.fecha.getFullYear()
  const month = input.fecha.getMonth() + 1
  const cierreRef = doc(db, 'cierres', docIdCierre(year, month))
  const numeroRecibo = await runTransaction(db, async (tx) => {
    const contadorRef = doc(db, 'contadores', CONTADOR_RECIBOS_ID)
    const contadorSnap = await tx.get(contadorRef)
    const actual = contadorSnap.exists()
      ? ((contadorSnap.data() as { valor?: number }).valor ?? 0)
      : 0
    const siguiente = actual + 1
    tx.set(
      contadorRef,
      { valor: siguiente, updatedAt: serverTimestamp() },
      { merge: true },
    )
    tx.set(aporteRef, {
      personaId: input.personaId,
      fecha: Timestamp.fromDate(input.fecha),
      monto,
      concepto,
      numeroRecibo: formatearNumeroRecibo(siguiente),
      usuarioRegistroId: meta.usuarioRegistroId,
      estado: 'vigente',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    // Acumulador mensual: el total del mes queda en un solo registro.
    const cierreSnap = await tx.get(cierreRef)
    const base = (
      cierreSnap.exists() ? (cierreSnap.data() as TotalesCierre) : null
    )
    const nuevos = aplicarMovimientoCierre(base, {
      montoCentavos: Math.round(monto * 100),
      esAnulacion: false,
    })
    if (cierreSnap.exists()) {
      tx.set(
        cierreRef,
        { ...nuevos, year, month, updatedAt: serverTimestamp() },
        { merge: true },
      )
    } else {
      tx.set(cierreRef, {
        ...nuevos,
        year,
        month,
        estado: 'abierto',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
    return formatearNumeroRecibo(siguiente)
  })
  return { id: aporteRef.id, numeroRecibo }
}

export async function getAporte(id: string): Promise<Aporte | null> {
  const snap = await getDoc(doc(db, 'aportes', id))
  return toAporte(snap)
}

/**
 * Anula un aporte vigente. Nunca elimina el documento (trazabilidad).
 * Mueve los montos del cierre mensual en la misma transacción.
 */
export async function anularAporte(
  id: string,
  motivo: string,
  usuarioAnulacionId: string,
): Promise<void> {
  const motivoLimpio = motivo.trim()
  if (motivoLimpio.length < 3) {
    throw new Error('El motivo de anulación es obligatorio.')
  }
  const ref = doc(db, 'aportes', id)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) {
      throw new Error('El aporte no existe.')
    }
    const data = snap.data() as {
      estado?: string
      monto?: number
      fecha?: Timestamp
    }
    if (data.estado !== 'vigente') {
      throw new Error('Solo se puede anular un aporte vigente.')
    }
    tx.update(ref, {
      estado: 'anulado',
      motivoAnulacion: motivoLimpio,
      usuarioAnulacionId,
      fechaAnulacion: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    const fecha = data.fecha?.toDate() ?? new Date()
    const year = fecha.getFullYear()
    const month = fecha.getMonth() + 1
    const cierreRef = doc(db, 'cierres', docIdCierre(year, month))
    const cierreSnap = await tx.get(cierreRef)
    const base = (
      cierreSnap.exists() ? (cierreSnap.data() as TotalesCierre) : null
    )
    const nuevos = aplicarMovimientoCierre(base, {
      montoCentavos: Math.round((data.monto ?? 0) * 100),
      esAnulacion: true,
    })
    if (cierreSnap.exists()) {
      tx.set(
        cierreRef,
        { ...nuevos, year, month, updatedAt: serverTimestamp() },
        { merge: true },
      )
    } else {
      tx.set(cierreRef, {
        ...nuevos,
        year,
        month,
        estado: 'abierto',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  })
}

export interface ListAportesOptions {
  personaIds: string[] | null
  estado: 'vigente' | 'anulado' | null
  numeroRecibo: string
  desde: Date | null
  hasta: Date | null
  usuarioRegistroId: string | null
  cursor: QueryDocumentSnapshot | null
  pageSize: number
}

export interface ListAportesResult {
  aportes: Aporte[]
  lastVisible: QueryDocumentSnapshot | null
  hasMore: boolean
}

export async function listAportes(
  options: ListAportesOptions,
): Promise<ListAportesResult> {
  const { personaIds, estado, numeroRecibo, desde, hasta, usuarioRegistroId, cursor, pageSize } =
    options
  const ref = collection(db, 'aportes')

  // Búsqueda por número de recibo exacto: consulta acotada.
  const recibo = numeroRecibo.trim()
  if (recibo !== '') {
    const snap = await getDocs(
      query(ref, where('numeroRecibo', '==', recibo), limit(pageSize)),
    )
    const aportes = snap.docs
      .map((d) => toAporte(d))
      .filter((a): a is Aporte => a !== null)
    return { aportes, lastVisible: null, hasMore: false }
  }

  // Listado ordenado por número de recibo descendente (correlativo con
  // ceros a la izquierda: el orden lexicográfico equivale al numérico).
  // Índices compuestos requeridos en firestore.indexes.json.
  const constraints: QueryConstraint[] = [orderBy('numeroRecibo', 'desc')]
  if (personaIds !== null) {
    if (personaIds.length === 0) {
      return { aportes: [], lastVisible: null, hasMore: false }
    }
    constraints.push(
      personaIds.length === 1
        ? where('personaId', '==', personaIds[0])
        : where('personaId', 'in', personaIds.slice(0, 30)),
    )
  }
  if (estado !== null) {
    constraints.push(where('estado', '==', estado))
  }
  if (usuarioRegistroId !== null && usuarioRegistroId !== '') {
    constraints.push(where('usuarioRegistroId', '==', usuarioRegistroId))
  }
  if (desde !== null) {
    constraints.push(where('fecha', '>=', Timestamp.fromDate(desde)))
  }
  if (hasta !== null) {
    constraints.push(where('fecha', '<=', Timestamp.fromDate(hasta)))
  }
  constraints.push(limit(pageSize))
  if (cursor !== null) {
    constraints.push(startAfter(cursor))
  }
  const snap = await getDocs(query(ref, ...constraints))
  const docs = snap.docs
  return {
    aportes: docs
      .map((d) => toAporte(d))
      .filter((a): a is Aporte => a !== null),
    lastVisible: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === pageSize,
  }
}
