import {
  collection,
  count,
  doc,
  getAggregateFromServer,
  getDoc,
  query,
  serverTimestamp,
  setDoc,
  sum,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { CierreMensual, EstadoCierre } from '@/types'

/** Id del documento de cierre: "2026-10". */
export function docIdCierre(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export interface TotalesCierre {
  total: number
  cantidad: number
  anulados: number
  totalAnulados: number
}

export interface MovimientoCierre {
  montoCentavos: number
  esAnulacion: boolean
}

/** Aplica un alta o anulación a los totales (cálculos en centavos). Puro y testeable. */
export function aplicarMovimientoCierre(
  base: TotalesCierre | null,
  mov: MovimientoCierre,
): TotalesCierre {
  const b = base ?? { total: 0, cantidad: 0, anulados: 0, totalAnulados: 0 }
  const totalC =
    Math.round(b.total * 100) + (mov.esAnulacion ? -mov.montoCentavos : mov.montoCentavos)
  const anulC =
    Math.round(b.totalAnulados * 100) + (mov.esAnulacion ? mov.montoCentavos : 0)
  return {
    total: totalC / 100,
    cantidad: Math.max(0, b.cantidad + (mov.esAnulacion ? -1 : 1)),
    anulados: b.anulados + (mov.esAnulacion ? 1 : 0),
    totalAnulados: anulC / 100,
  }
}

export function totalesDesdeCierre(
  cierre: CierreMensual | null,
): TotalesCierre | null {
  if (cierre === null) {
    return null
  }
  return {
    total: cierre.total,
    cantidad: cierre.cantidad,
    anulados: cierre.anulados,
    totalAnulados: cierre.totalAnulados,
  }
}

export async function getCierre(
  year: number,
  month: number,
): Promise<CierreMensual | null> {
  const snap = await getDoc(doc(db, 'cierres', docIdCierre(year, month)))
  if (!snap.exists()) {
    return null
  }
  const data = snap.data() as Omit<CierreMensual, 'id'>
  return { ...data, id: snap.id }
}

function rangoMes(year: number, month: number): { inicio: Date; fin: Date } {
  return {
    inicio: new Date(year, month - 1, 1, 0, 0, 0),
    fin: new Date(year, month, 0, 23, 59, 59),
  }
}

/** Snapshot calculado con agregaciones del servidor (sin leer documentos). */
export async function calcularSnapshotMes(
  year: number,
  month: number,
): Promise<TotalesCierre> {
  const { inicio, fin } = rangoMes(year, month)
  const ref = collection(db, 'aportes')
  const vigentes = await getAggregateFromServer(
    query(
      ref,
      where('estado', '==', 'vigente'),
      where('fecha', '>=', Timestamp.fromDate(inicio)),
      where('fecha', '<=', Timestamp.fromDate(fin)),
    ),
    { total: sum('monto'), cantidad: count() },
  )
  const anulados = await getAggregateFromServer(
    query(
      ref,
      where('estado', '==', 'anulado'),
      where('fecha', '>=', Timestamp.fromDate(inicio)),
      where('fecha', '<=', Timestamp.fromDate(fin)),
    ),
    { total: sum('monto'), cantidad: count() },
  )
  return {
    total: vigentes.data().total ?? 0,
    cantidad: vigentes.data().cantidad,
    anulados: anulados.data().cantidad,
    totalAnulados: anulados.data().total ?? 0,
  }
}

/** Recalcula y guarda el snapshot del mes (no cambia su estado). */
export async function recalcularMes(
  year: number,
  month: number,
): Promise<TotalesCierre> {
  const totales = await calcularSnapshotMes(year, month)
  const ref = doc(db, 'cierres', docIdCierre(year, month))
  const previo = await getDoc(ref)
  await setDoc(
    ref,
    {
      ...totales,
      year,
      month,
      estado: ((previo.data() as { estado?: EstadoCierre } | undefined)?.estado ??
        'abierto') as EstadoCierre,
      updatedAt: serverTimestamp(),
      ...(previo.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  )
  return totales
}

export async function cerrarMes(
  year: number,
  month: number,
  uid: string,
): Promise<void> {
  const totales = await calcularSnapshotMes(year, month)
  const ref = doc(db, 'cierres', docIdCierre(year, month))
  const previo = await getDoc(ref)
  await setDoc(
    ref,
    {
      ...totales,
      year,
      month,
      estado: 'cerrado' as EstadoCierre,
      cerradoPor: uid,
      cerradoEl: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(previo.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  )
}

export async function reabrirMes(year: number, month: number): Promise<void> {
  await setDoc(
    doc(db, 'cierres', docIdCierre(year, month)),
    { estado: 'abierto' as EstadoCierre, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
