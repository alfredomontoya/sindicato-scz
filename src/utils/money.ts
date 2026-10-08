export function formatBs(monto: number): string {
  if (!Number.isFinite(monto)) {
    throw new Error('Monto inválido')
  }
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(monto)
}

const UNIDADES = [
  'CERO',
  'UNO',
  'DOS',
  'TRES',
  'CUATRO',
  'CINCO',
  'SEIS',
  'SIETE',
  'OCHO',
  'NUEVE',
  'DIEZ',
  'ONCE',
  'DOCE',
  'TRECE',
  'CATORCE',
  'QUINCE',
  'DIECISÉIS',
  'DIECISIETE',
  'DIECIOCHO',
  'DIECINUEVE',
  'VEINTE',
]

function enteroALiteral(n: number): string {
  if (n <= 20) return UNIDADES[n]
  if (n < 30) return `VEINTI${UNIDADES[n - 20].toLowerCase()}`.toUpperCase()
  if (n < 100) {
    const dec = Math.floor(n / 10) * 10
    const resto = n % 10
    const decenas: Record<number, string> = {
      30: 'TREINTA',
      40: 'CUARENTA',
      50: 'CINCUENTA',
      60: 'SESENTA',
      70: 'SETENTA',
      80: 'OCHENTA',
      90: 'NOVENTA',
    }
    return resto === 0 ? decenas[dec] : `${decenas[dec]} Y ${UNIDADES[resto]}`
  }
  if (n < 1000) {
    const cent = Math.floor(n / 100)
    const resto = n % 100
    const base =
      cent === 1 && resto === 0
        ? 'CIEN'
        : cent === 1
          ? 'CIENTO'
          : `${UNIDADES[cent]}CIENTOS`.replace('UNO', 'UN')
    return resto === 0 ? base : `${base} ${enteroALiteral(resto)}`
  }
  throw new Error('Fuera de rango en esta versión inicial')
}

export function montoALiteral(monto: number): string {
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new Error('Monto inválido')
  }
  const entero = Math.floor(monto)
  const centavos = Math.round((monto - entero) * 100)
  const literal = enteroALiteral(entero)
  const centStr = String(centavos).padStart(2, '0')
  return `${literal} ${centStr}/100 BOLIVIANOS`
}
