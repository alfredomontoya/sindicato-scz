import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import type { Aporte } from '@/types'
import {
  APORTES_PAGE_SIZE,
  getAporte,
  listAportes,
  type ListAportesResult,
} from '../services/aporteService'
import { getPersonaNombre } from '@/features/personas/services/personaService'

export interface AporteFilters {
  personaId: string | null
  estado: 'vigente' | 'anulado' | null
  numeroRecibo: string
  desde: Date | null
  hasta: Date | null
}

type Cursor = QueryDocumentSnapshot<DocumentData> | null

export function useAportes(
  filters: AporteFilters,
): UseInfiniteQueryResult<InfiniteData<ListAportesResult>, Error> {
  return useInfiniteQuery({
    queryKey: ['aportes', filters],
    queryFn: ({ pageParam }) =>
      listAportes({
        personaId: filters.personaId,
        estado: filters.estado,
        numeroRecibo: filters.numeroRecibo,
        desde: filters.desde,
        hasta: filters.hasta,
        usuarioRegistroId: null,
        cursor: pageParam,
        pageSize: APORTES_PAGE_SIZE,
      }),
    initialPageParam: null as Cursor,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastVisible : undefined,
  })
}

export function useAporte(id: string | undefined): UseQueryResult<Aporte | null, Error> {
  return useQuery({
    queryKey: ['aportes', id],
    queryFn: async () => {
      if (id === undefined || id === '') {
        throw new Error('Falta el identificador del aporte.')
      }
      return getAporte(id)
    },
    enabled: id !== undefined && id !== '',
  })
}

/** Resuelve los nombres de un conjunto de personas (una lectura por id). */
export function usePersonasNombres(
  ids: string[],
): UseQueryResult<Record<string, string>, Error> {
  const clave = [...ids].sort().join(',')
  return useQuery({
    queryKey: ['personas-nombres', clave],
    queryFn: async () => {
      const unicos = [...new Set(ids)].filter((id) => id !== '')
      const entradas = await Promise.all(
        unicos.map(async (id) => [id, await getPersonaNombre(id)] as const),
      )
      return Object.fromEntries(entradas)
    },
    enabled: ids.length > 0,
  })
}
