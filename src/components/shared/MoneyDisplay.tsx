import { formatBs } from '@/utils/money'

export function MoneyDisplay({ monto }: { monto: number }) {
  return (
    <span className="font-medium tabular-nums">{formatBs(monto)}</span>
  )
}
