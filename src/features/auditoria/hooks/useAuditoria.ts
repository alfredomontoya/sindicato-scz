import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import {
  listAuditoria,
  type ListAuditoriaResult,
} from '../services/auditoriaService'

type Cursor = QueryDocumentSnapshot<DocumentData> | null

export function useAuditoria(): UseInfiniteQueryResult<
  InfiniteData<ListAuditoriaResult>,
  Error
> {
  return useInfiniteQuery({
    queryKey: ['auditoria'],
    queryFn: ({ pageParam }) => listAuditoria(pageParam),
    initialPageParam: null as Cursor,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastVisible : undefined,
  })
}
