import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export const AUDITORIA_PAGE_SIZE = 25

export type AccionAuditoria =
  | 'persona.crear'
  | 'persona.editar'
  | 'persona.estado'
  | 'aporte.crear'
  | 'aporte.anular'
  | 'usuario.crear'
  | 'usuario.editar'

export interface RegistrarAuditoriaInput {
  usuarioId: string
  accion: AccionAuditoria
  entidad: string
  entidadId: string
  descripcion?: string
}

/** Construye el documento de auditoría (puro y testeable). */
export function buildAuditoriaPayload(input: RegistrarAuditoriaInput) {
  return {
    usuarioId: input.usuarioId,
    accion: input.accion,
    entidad: input.entidad,
    entidadId: input.entidadId,
    ...(input.descripcion === undefined || input.descripcion === ''
      ? {}
      : { descripcion: input.descripcion }),
    createdAt: serverTimestamp(),
  }
}

export async function registrarAuditoria(
  input: RegistrarAuditoriaInput,
): Promise<void> {
  await addDoc(collection(db, 'auditoria'), buildAuditoriaPayload(input))
}

/**
 * Registra sin interrumpir el flujo principal: si falla, solo se reporta.
 */
export function auditar(input: RegistrarAuditoriaInput): void {
  registrarAuditoria(input).catch((error: unknown) => console.error(error))
}

export interface RegistroAuditoria {
  id: string
  usuarioId: string
  accion: string
  entidad: string
  entidadId: string
  descripcion?: string
  createdAt: { toDate(): Date }
}

export interface ListAuditoriaResult {
  registros: RegistroAuditoria[]
  lastVisible: QueryDocumentSnapshot | null
  hasMore: boolean
}

export async function listAuditoria(
  cursor: QueryDocumentSnapshot | null,
): Promise<ListAuditoriaResult> {
  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc'),
    limit(AUDITORIA_PAGE_SIZE),
  ]
  if (cursor !== null) {
    constraints.push(startAfter(cursor))
  }
  const snap = await getDocs(query(collection(db, 'auditoria'), ...constraints))
  const docs = snap.docs
  return {
    registros: docs.map((d) => {
      const data = d.data() as Omit<RegistroAuditoria, 'id' | 'createdAt'> & {
        createdAt: { toDate(): Date }
      }
      return { ...data, id: d.id }
    }),
    lastVisible: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === AUDITORIA_PAGE_SIZE,
  }
}
