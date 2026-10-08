import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States'
import { useUsuariosNombres } from '@/features/usuarios/hooks/useUsuarios'
import { useAuditoria } from '../hooks/useAuditoria'

const ACCION_ETIQUETA: Record<string, string> = {
  'persona.crear': 'Persona creada',
  'persona.editar': 'Persona modificada',
  'persona.estado': 'Estado de persona',
  'aporte.crear': 'Aporte registrado',
  'aporte.anular': 'Aporte anulado',
  'usuario.crear': 'Usuario creado',
  'usuario.editar': 'Usuario modificado',
}

export function AuditoriaPage() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAuditoria()
  const registros = useMemo(
    () => data?.pages.flatMap((p) => p.registros) ?? [],
    [data],
  )
  const ids = useMemo(
    () => [...new Set(registros.map((r) => r.usuarioId))],
    [registros],
  )
  const { data: nombres } = useUsuariosNombres(ids)

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo="Auditoría"
        descripcion="Operaciones importantes registradas en el sistema."
      />

      {isLoading && <LoadingState mensaje="Cargando auditoría…" />}
      {isError && (
        <>
          <ErrorState mensaje="No se pudo cargar la auditoría." />
          <div>
            <Button
              variant="outline"
              onClick={() => {
                void refetch()
              }}
            >
              Reintentar
            </Button>
          </div>
        </>
      )}
      {!isLoading && !isError && registros.length === 0 && (
        <EmptyState mensaje="Aún no hay operaciones registradas." />
      )}
      {!isLoading && !isError && registros.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Usuario
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Acción
                </th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">
                    {r.createdAt.toDate().toLocaleString('es-BO')}
                  </td>
                  <td className="px-4 py-2.5">{nombres?.[r.usuarioId] ?? '—'}</td>
                  <td className="px-4 py-2.5 font-medium">
                    {ACCION_ETIQUETA[r.accion] ?? r.accion}
                  </td>
                  <td className="hidden max-w-70 truncate px-4 py-2.5 text-muted-foreground lg:table-cell">
                    {r.descripcion ?? `${r.entidad}/${r.entidadId}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasNextPage === true && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => {
              void fetchNextPage()
            }}
          >
            {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </Button>
        </div>
      )}
    </main>
  )
}
