import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { contarPersonasActivas } from '@/features/personas/services/personaService'
import {
  getResumenMes,
  getUltimosAportes,
  type ResumenPeriodo,
} from '../services/resumenService'
import type { Aporte } from '@/types'

export function useResumenMes(
  year: number,
  month: number,
): UseQueryResult<ResumenPeriodo, Error> {
  return useQuery({
    queryKey: ['resumen', year, month],
    queryFn: () => getResumenMes(year, month),
  })
}

export function usePersonasActivas(): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: ['personas-activas'],
    queryFn: contarPersonasActivas,
    staleTime: 60_000,
  })
}

export function useUltimosAportes(
  cantidad: number,
): UseQueryResult<Aporte[], Error> {
  return useQuery({
    queryKey: ['ultimos-aportes', cantidad],
    queryFn: () => getUltimosAportes(cantidad),
  })
}
