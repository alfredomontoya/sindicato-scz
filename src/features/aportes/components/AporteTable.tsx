import { Eye } from 'lucide-react'
import { Link } from 'react-router'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Aporte } from '@/types'

export function AporteTable({
  aportes,
  nombres,
}: {
  aportes: Aporte[]
  nombres: Record<string, string>
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th scope="col" className="px-4 py-2.5 font-medium">
              Recibo
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Fecha
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Persona
            </th>
            <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">
              Concepto
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Monto
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Estado
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {aportes.map((a) => (
            <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-2.5 font-mono font-medium">{a.numeroRecibo}</td>
              <td className="px-4 py-2.5">
                <DateDisplay fecha={a.fecha} />
              </td>
              <td className="max-w-45 truncate px-4 py-2.5">
                {nombres[a.personaId] ?? '—'}
              </td>
              <td className="hidden max-w-55 truncate px-4 py-2.5 text-muted-foreground lg:table-cell">
                {a.concepto}
              </td>
              <td className="px-4 py-2.5 text-right">
                <MoneyDisplay monto={a.monto} />
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge
                  activo={a.estado === 'vigente'}
                  texto={a.estado === 'vigente' ? 'Vigente' : 'Anulado'}
                />
              </td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end">
                  <Link
                    to={`/aportes/${a.id}`}
                    aria-label={`Ver aporte con recibo ${a.numeroRecibo}`}
                    className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Eye className="size-4" aria-hidden />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
