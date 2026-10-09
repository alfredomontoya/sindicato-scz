import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/States'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { can } from '@/features/auth/permissions'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePersona, usePersonas } from '@/features/personas/hooks/usePersonas'
import { formatearNombre } from '@/utils/nombres'
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
  const [personaTxt, setPersonaTxt] = useState('')
  const [recibo, setRecibo] = useState('')
  const [estado, setEstado] = useState<'todos' | 'vigente' | 'anulado'>('vigente')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const reciboDeb = useDebouncedValue(recibo)
  const personaTxtDeb = useDebouncedValue(personaTxt)
  const { data: personaFiltro } = usePersona(personaId === '' ? undefined : personaId)

  // Filtro por nombre o CI: primero se resuelven los ids coincidentes.
  const buscarPersonas =
    personaId === '' && personaTxtDeb.trim() !== ''
  const personasMatch = usePersonas(
    { search: personaTxtDeb, estado: null, telefono: '' },
    buscarPersonas,
  )
  const personaIds = useMemo<string[] | null>(() => {
    if (personaId !== '') {
      return [personaId]
    }
    if (personaTxtDeb.trim() === '') {
      return null
    }
    const paginas = personasMatch.data?.pages.flatMap((p) => p.personas) ?? []
    if (personasMatch.isLoading || personasMatch.isError) {
      return []
    }
    return paginas.slice(0, 30).map((p) => p.id)
  }, [personaId, personaTxtDeb, personasMatch.data, personasMatch.isLoading, personasMatch.isError])

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAportes({
      personaIds,
      estado: estado === 'todos' ? null : estado,
      numeroRecibo: reciboDeb,
      desde: desde === '' ? null : fechaInputADate(desde),
      hasta: hasta === '' ? null : fechaInputADate(hasta),
    })
  const cargando = isLoading || (buscarPersonas && personasMatch.isLoading)
  const conError = isError || (buscarPersonas && personasMatch.isError)

  const aportes = useMemo(
    () => data?.pages.flatMap((p) => p.aportes) ?? [],
    [data],
  )
  const ids = useMemo(
    () => [...new Set(aportes.map((a) => a.personaId))],
    [aportes],
  )
  const { data: personas } = usePersonasNombres(ids)

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
          <span className="font-medium">{formatearNombre(personaFiltro.nombre)}</span>
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
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
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
        {personaId === '' && (
          <input
            type="search"
            aria-label="Filtrar por nombre o CI de la persona"
            placeholder="Persona (nombre o CI)…"
            value={personaTxt}
            onChange={(e) => setPersonaTxt(e.target.value)}
            className={inputClass}
          />
        )}
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

      {cargando && <LoadingState mensaje="Cargando aportes…" />}
      {conError && (
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
      {!cargando && !conError && aportes.length === 0 && (
        <EmptyState mensaje="No hay aportes con esos criterios." />
      )}
      {!cargando && !conError && aportes.length > 0 && (
        <AporteTable aportes={aportes} personas={personas ?? {}} />
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
