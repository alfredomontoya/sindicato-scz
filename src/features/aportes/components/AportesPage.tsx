import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { can } from '@/features/auth/permissions'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePersona } from '@/features/personas/hooks/usePersonas'
import { fechaInputADate } from '../services/aporteService'
import { useAportes, usePersonasNombres } from '../hooks/useAportes'
import { AporteTable } from './AporteTable'

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export function AportesPage() {
  const { profile } = useAuth()
  const puedeRegistrar = can(profile?.rol, 'aportes.registrar')
  const [params] = useSearchParams()

  const [personaId, setPersonaId] = useState(params.get('personaId') ?? '')
  const [recibo, setRecibo] = useState('')
  const [estado, setEstado] = useState<'todos' | 'vigente' | 'anulado'>('vigente')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const reciboDeb = useDebouncedValue(recibo)
  const { data: personaFiltro } = usePersona(personaId === '' ? undefined : personaId)

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAportes({
      personaId: personaId === '' ? null : personaId,
      estado: estado === 'todos' ? null : estado,
      numeroRecibo: reciboDeb,
      desde: desde === '' ? null : fechaInputADate(desde),
      hasta: hasta === '' ? null : fechaInputADate(hasta),
    })

  const aportes = useMemo(
    () => data?.pages.flatMap((p) => p.aportes) ?? [],
    [data],
  )
  const ids = useMemo(
    () => [...new Set(aportes.map((a) => a.personaId))],
    [aportes],
  )
  const { data: nombres } = usePersonasNombres(ids)

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo="Aportes"
        descripcion="Consulta y registro de aportes voluntarios."
        acciones={
          puedeRegistrar ? (
            <Button asChild>
              <Link to="/aportes/nuevo">
                <Plus className="size-4" aria-hidden />
                Registrar aporte
              </Link>
            </Button>
          ) : undefined
        }
      />

      {personaFiltro !== undefined && personaFiltro !== null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtrado por:</span>
          <span className="font-medium">{personaFiltro.nombre}</span>
          <button
            type="button"
            onClick={() => setPersonaId('')}
            className="text-primary underline-offset-4 hover:underline"
          >
            Quitar filtro
          </button>
        </div>
      )}

      <section
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Filtros"
      >
        <input
          type="search"
          aria-label="Buscar por número de recibo"
          placeholder="Recibo N.º…"
          value={recibo}
          onChange={(e) => setRecibo(e.target.value)}
          className={inputClass}
        />
        <select
          aria-label="Filtrar por estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value as 'todos' | 'vigente' | 'anulado')}
          className={inputClass}
        >
          <option value="vigente">Vigentes</option>
          <option value="anulado">Anulados</option>
          <option value="todos">Todos</option>
        </select>
        <input
          type="date"
          aria-label="Desde la fecha"
          value={desde}
          max={hasta === '' ? undefined : hasta}
          onChange={(e) => setDesde(e.target.value)}
          className={inputClass}
        />
        <input
          type="date"
          aria-label="Hasta la fecha"
          value={hasta}
          min={desde === '' ? undefined : desde}
          onChange={(e) => setHasta(e.target.value)}
          className={inputClass}
        />
      </section>

      {isLoading && <LoadingState mensaje="Cargando aportes…" />}
      {isError && (
        <>
          <ErrorState mensaje="No se pudieron cargar los aportes. Si el problema persiste, verifique que los índices de Firestore estén desplegados." />
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
      {!isLoading && !isError && aportes.length === 0 && (
        <EmptyState mensaje="No hay aportes con esos criterios." />
      )}
      {!isLoading && !isError && aportes.length > 0 && (
        <AporteTable aportes={aportes} nombres={nombres ?? {}} />
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
