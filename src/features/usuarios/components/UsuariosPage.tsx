import { Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States'
import { useUsuarios } from '../hooks/useUsuarios'

const ROL_ETIQUETA: Record<string, string> = {
  admin: 'Admin',
  registro: 'Registro',
  consulta: 'Consulta',
}

export function UsuariosPage() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUsuarios()
  const usuarios = data?.pages.flatMap((p) => p.usuarios) ?? []

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo="Usuarios"
        descripcion="Administración de usuarios y roles."
        acciones={
          <Button asChild>
            <Link to="/usuarios/nuevo">
              <Plus className="size-4" aria-hidden />
              Nuevo usuario
            </Link>
          </Button>
        }
      />

      {isLoading && <LoadingState mensaje="Cargando usuarios…" />}
      {isError && (
        <>
          <ErrorState mensaje="No se pudieron cargar los usuarios." />
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
      {!isLoading && !isError && usuarios.length === 0 && (
        <EmptyState mensaje="No hay usuarios registrados." />
      )}
      {!isLoading && !isError && usuarios.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Nombre
                </th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">
                  Correo
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Rol
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
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{u.nombre}</td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                    {u.email}
                  </td>
                  <td className="px-4 py-2.5">{ROL_ETIQUETA[u.rol] ?? u.rol}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge activo={u.estado} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end">
                      <Link
                        to={`/usuarios/${u.id}/editar`}
                        aria-label={`Editar a ${u.nombre}`}
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                    </div>
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
