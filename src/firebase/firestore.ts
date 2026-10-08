import { collection, type CollectionReference } from 'firebase/firestore'
import { db } from './config'

export const collections = {
  usuarios: collection(db, 'usuarios'),
  personas: collection(db, 'personas'),
  aportes: collection(db, 'aportes'),
  recibos: collection(db, 'recibos'),
  auditoria: collection(db, 'auditoria'),
} satisfies Record<string, CollectionReference>
