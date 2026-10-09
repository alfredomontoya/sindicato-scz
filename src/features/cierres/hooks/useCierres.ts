import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { CierreMensual } from '@/types'
import { getCierre } from '../services/cierreService'

export function useCierre(
  year: number,
  month: number,
): UseQueryResult<CierreMensual | null, Error> {
  return useQuery({
    queryKey: ['cierres', year, month],
    queryFn: () => getCierre(year, month),
  })
}
