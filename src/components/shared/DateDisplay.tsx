import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Timestamp } from 'firebase/firestore'

export function DateDisplay({ fecha }: { fecha: Timestamp | Date }) {
  const d = fecha instanceof Date ? fecha : fecha.toDate()
  return <span className="tabular-nums">{format(d, 'dd/MM/yyyy', { locale: es })}</span>
}
