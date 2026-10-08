import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import type { Usuario } from '@/types'
import {
  getUsuario,
  listUsuarios,
  type ListUsuariosResult,
} from '../services/usuarioService'

export function useUsuario(
  uid: string | undefined,
): UseQueryResult<Usuario | null, Error> {
  return useQuery({
    queryKey: ['usuarios', uid],
    queryFn: async () => {
      if (uid === undefined || uid === '') {
        throw new Error('Falta el identificador del usuario.')
      }
      return getUsuario(uid)
    },
    enabled: uid !== undefined && uid !== '',
  })
}

type Cursor = QueryDocumentSnapshot<DocumentData> | null

export function useUsuarios(): UseInfiniteQueryResult<
  InfiniteData<ListUsuariosResult>,
  Error
> {
  return useInfiniteQuery({
    queryKey: ['usuarios'],
    queryFn: ({ pageParam }) => listUsuarios(pageParam),
    initialPageParam: null as Cursor,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastVisible : undefined,
  })
}

/** Resuelve los nombres de un conjunto de usuarios. */
export function useUsuariosNombres(
  ids: string[],
): UseQueryResult<Record<string, string>, Error> {
  const clave = [...ids].sort().join(',')
  return useQuery({
    queryKey: ['usuarios-nombres', clave],
    queryFn: async () => {
      const unicos = [...new Set(ids)].filter((id) => id !== '')
      const entradas = await Promise.all(
        unicos.map(async (id) => {
          const u = await getUsuario(id)
          return [id, u?.nombre ?? '—'] as const
        }),
      )
      return Object.fromEntries(entradas)
    },
    enabled: ids.length > 0,
  })
}
