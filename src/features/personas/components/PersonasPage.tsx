import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { can } from '@/features/auth/permissions'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePersonas } from '../hooks/usePersonas'
import { PersonaTable } from './PersonaTable'

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export function PersonasPage() {
  const { profile } = useAuth()
  const puedeEditar = can(profile?.rol, 'personas.crear')

  const [busqueda, setBusqueda] = useState('')
  const [telefono, setTelefono] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')

  const busquedaDeb = useDebouncedValue(busqueda)
  const telefonoDeb = useDebouncedValue(telefono)

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePersonas({
      search: busquedaDeb,
      estado: filtroEstado === 'todos' ? null : filtroEstado === 'activo',
      telefono: telefonoDeb,
    })

  const personas = data?.pages.flatMap((p) => p.personas) ?? []

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo="Personas"
        descripcion="Registro y administración de personas."
        acciones={
          puedeEditar ? (
            <Button asChild>
              <Link to="/personas/nueva">
                <Plus className="size-4" aria-hidden />
                Nueva persona
              </Link>
            </Button>
          ) : undefined
        }
      />

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Filtros">
        <div className="relative sm:col-span-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            aria-label="Buscar por nombre"
            placeholder="Buscar por nombre…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
        <input
          type="tel"
          aria-label="Buscar por teléfono"
          placeholder="Teléfono exacto…"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className={inputClass}
        />
        <select
          aria-label="Filtrar por estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as 'todos' | 'activo' | 'inactivo')}
          className={inputClass}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </section>

      {isLoading && <LoadingState mensaje="Cargando personas…" />}
      {isError && (
        <>
          <ErrorState mensaje="No se pudieron cargar las personas." />
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
      {!isLoading && !isError && personas.length === 0 && (
        <EmptyState mensaje="No hay personas registradas con esos criterios." />
      )}
      {!isLoading && !isError && personas.length > 0 && (
        <PersonaTable personas={personas} puedeEditar={puedeEditar} />
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
