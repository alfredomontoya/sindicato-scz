import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Aporte } from '@/types'

/** Suma montos en centavos enteros para evitar errores de punto flotante. */
export function sumarMontos(montos: number[]): number {
  const centavos = montos.reduce((acc, m) => acc + Math.round(m * 100), 0)
  return centavos / 100
}

export interface ResumenPeriodo {
  /** Suma de aportes vigentes del período. */
  total: number
  /** Cantidad de aportes vigentes del período. */
  cantidad: number
  /** Cantidad de aportes anulados del período. */
  anulados: number
}

function rangoMes(year: number, month: number): { inicio: Date; fin: Date } {
  return {
    inicio: new Date(year, month - 1, 1, 0, 0, 0),
    fin: new Date(year, month, 0, 23, 59, 59),
  }
}

/**
 * Totales del mes (solo vigentes en lo financiero). Acotado a 2000
 * documentos por período; suficiente para la escala actual.
 */
export async function getResumenMes(
  year: number,
  month: number,
): Promise<ResumenPeriodo> {
  const { inicio, fin } = rangoMes(year, month)
  const ref = collection(db, 'aportes')
  const vigentesSnap = await getDocs(
    query(
      ref,
      where('estado', '==', 'vigente'),
      where('fecha', '>=', Timestamp.fromDate(inicio)),
      where('fecha', '<=', Timestamp.fromDate(fin)),
      limit(2000),
    ),
  )
  const montos = vigentesSnap.docs.map(
    (d) => (d.data() as { monto: number }).monto,
  )
  const anuladosSnap = await getCountFromServer(
    query(
      ref,
      where('estado', '==', 'anulado'),
      where('fecha', '>=', Timestamp.fromDate(inicio)),
      where('fecha', '<=', Timestamp.fromDate(fin)),
    ),
  )
  return {
    total: sumarMontos(montos),
    cantidad: vigentesSnap.size,
    anulados: anuladosSnap.data().count,
  }
}

export async function getUltimosAportes(cantidad: number): Promise<Aporte[]> {
  const snap = await getDocs(
    query(
      collection(db, 'aportes'),
      orderBy('fecha', 'desc'),
      limit(cantidad),
    ),
  )
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Aporte, 'id'>), id: d.id }))
}
