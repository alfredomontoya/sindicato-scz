import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import type { Persona } from '@/types'
import {
  getPersona,
  listPersonas,
  PERSONAS_PAGE_SIZE,
  type ListPersonasResult,
} from '../services/personaService'

export interface PersonaFilters {
  search: string
  estado: boolean | null
  telefono: string
}

type Cursor = QueryDocumentSnapshot<DocumentData> | null

export function usePersonas(
  filters: PersonaFilters,
  enabled = true,
): UseInfiniteQueryResult<InfiniteData<ListPersonasResult>, Error> {
  return useInfiniteQuery({
    queryKey: ['personas', filters],
    queryFn: ({ pageParam }) =>
      listPersonas({
        search: filters.search,
        estado: filters.estado,
        telefono: filters.telefono,
        cursor: pageParam,
        pageSize: PERSONAS_PAGE_SIZE,
      }),
    initialPageParam: null as Cursor,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastVisible : undefined,
    enabled,
  })
}

export function usePersona(id: string | undefined): UseQueryResult<Persona | null, Error> {
  return useQuery({
    queryKey: ['personas', id],
    queryFn: async () => {
      if (id === undefined || id === '') {
        throw new Error('Falta el identificador de la persona.')
      }
      return getPersona(id)
    },
    enabled: id !== undefined && id !== '',
  })
}
