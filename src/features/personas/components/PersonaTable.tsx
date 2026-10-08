import { Eye, Pencil } from 'lucide-react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Persona } from '@/types'

export function PersonaTable({
  personas,
  puedeEditar,
}: {
  personas: Persona[]
  puedeEditar: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th scope="col" className="px-4 py-2.5 font-medium">
              Nombre
            </th>
            <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">
              Dirección
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Teléfono
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
          {personas.map((p) => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-2.5 font-medium">{p.nombre}</td>
              <td className="hidden max-w-55 truncate px-4 py-2.5 text-muted-foreground md:table-cell">
                {p.direccion === '' ? '—' : p.direccion}
              </td>
              <td className="px-4 py-2.5">{p.telefono === '' ? '—' : p.telefono}</td>
              <td className="px-4 py-2.5">
                <StatusBadge activo={p.estado} />
              </td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-1">
                  <Link
                    to={`/personas/${p.id}`}
                    aria-label={`Ver detalle de ${p.nombre}`}
                    className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Eye className="size-4" aria-hidden />
                  </Link>
                  {puedeEditar && (
                    <Link
                      to={`/personas/${p.id}/editar`}
                      aria-label={`Editar a ${p.nombre}`}
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
