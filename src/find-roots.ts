import { DEFAULT_VARS } from './constants'
import { evaluate } from './evaluate'
import type { Node } from './types'

export interface RootSearchOptions {
  /** Dominio de búsqueda de funciones no polinómicas; por defecto [-100, 100]. */
  min?: number
  max?: number
  /** Número de subdivisiones del dominio; por defecto 4096. */
  samples?: number
  /** Precisión objetivo sobre x; por defecto 1e-11. */
  tolerance?: number
  /** Límite de raíces devueltas; por defecto 128. */
  maxRoots?: number
}

type Polynomial = number[] // [término independiente, coeficiente de x, x², ...]
const MAX_POLYNOMIAL_DEGREE = 12
const MAX_ITERATIONS = 120

function trim(coeffs: Polynomial): Polynomial {
  const result = [...coeffs]
  while (result.length > 1 && result[result.length - 1] === 0) result.pop()
  return result
}

function combine(a: Polynomial, b: Polynomial, subtract = false): Polynomial {
  const result = Array<number>(Math.max(a.length, b.length)).fill(0)
  for (let i = 0; i < result.length; i++) {
    result[i] = (a[i] ?? 0) + (subtract ? -1 : 1) * (b[i] ?? 0)
  }
  return trim(result)
}

function multiply(a: Polynomial, b: Polynomial): Polynomial | null {
  if (a.length + b.length - 2 > MAX_POLYNOMIAL_DEGREE) return null
  const result = Array<number>(a.length + b.length - 1).fill(0)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) result[i + j] += a[i] * b[j]
  }
  return trim(result)
}

/** Reconoce polinomios sin alterar el AST original. */
function asPolynomial(node: Node, variable: string): Polynomial | null {
  if (node.type === 'number') {
    const value = Number(node.value)
    return Number.isFinite(value) ? [value] : null
  }

  if (node.type === 'variable') {
    const name = node.value
    if (typeof name !== 'string') return null
    if (name === variable) return [0, 1]
    if (!(name in DEFAULT_VARS)) return null

    const constant = Number(DEFAULT_VARS[name as keyof typeof DEFAULT_VARS])
    return Number.isFinite(constant) ? [constant] : null
  }

  if (node.type !== 'symbol' || !node.rightNode) return null

  const right = asPolynomial(node.rightNode, variable)
  if (!right) return null

  // Soporte de operadores unarios cuando el AST omite leftNode.
  if (!node.leftNode) {
    if (node.value === '+') return right
    if (node.value === '-') return right.map(value => -value)
    return null
  }

  const left = asPolynomial(node.leftNode, variable)
  if (!left) return null

  switch (node.value) {
    case '+': return combine(left, right)
    case '-': return combine(left, right, true)
    case '*': return multiply(left, right)
    case '/': {
      const divisor = right[0]
      if (right.length !== 1 || divisor === undefined || divisor === 0) return null
      const divided = left.map(value => value / divisor)
      return divided.every(Number.isFinite) ? trim(divided) : null
    }
    default: return null
  }
}

function polyValue(coeffs: Polynomial, x: number): number {
  let value = 0
  for (let i = coeffs.length - 1; i >= 0; i--) value = value * x + coeffs[i]
  return value
}

function nearlyPolynomialZero(coeffs: Polynomial, x: number): boolean {
  const value = polyValue(coeffs, x)
  if (value === 0) return true
  if (!Number.isFinite(value)) return false

  // Margen por error de redondeo al evaluar el polinomio en x.
  let scale = 0
  for (let i = coeffs.length - 1; i >= 0; i--) {
    scale = scale * Math.abs(x) + Math.abs(coeffs[i])
  }
  return Math.abs(value) <= 64 * Number.EPSILON * scale
}

function addDistinct(roots: number[], root: number, tolerance: number): void {
  if (!Number.isFinite(root)) return
  if (roots.some(existing =>
    Math.abs(existing - root) <= tolerance * Math.max(1, Math.abs(existing), Math.abs(root))
  )) return
  roots.push(root)
}

function bisect(
  f: (x: number) => number,
  a: number,
  b: number,
  tolerance: number
): number | null {
  let fa = f(a)
  let fb = f(b)
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null
  if (fa === 0) return a
  if (fb === 0) return b
  if (Math.sign(fa) === Math.sign(fb)) return null

  const initialMagnitude = Math.min(Math.abs(fa), Math.abs(fb))

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = a + (b - a) / 2
    if (mid === a || mid === b) break
    const fm = f(mid)
    if (!Number.isFinite(fm)) return null
    if (fm === 0) return mid

    if (Math.sign(fm) === Math.sign(fa)) {
      a = mid
      fa = fm
    } else {
      b = mid
      fb = fm
    }

    if (b - a <= tolerance * Math.max(1, Math.abs(mid))) break
  }

  const root = a + (b - a) / 2
  const residual = Math.abs(f(root))

  // Evita aceptar un polo como raíz solo porque hay cambio de signo.
  if (!Number.isFinite(residual) || residual >= initialMagnitude) return null
  return root
}

/** Aísla raíces reales de un polinomio mediante raíces de la derivada. */
function polynomialRoots(coeffs: Polynomial, tolerance: number): number[] | null {
  coeffs = trim(coeffs)
  const degree = coeffs.length - 1
  if (degree === 0) return []
  if (degree === 1) {
    const root = -coeffs[0] / coeffs[1]
    return Number.isFinite(root) ? [root] : null
  }

  const leading = coeffs[degree]
  const ratios = coeffs.slice(0, -1).map(v => Math.abs(v / leading))
  const bound = 1 + Math.max(0, ...ratios)
  if (!Number.isFinite(bound)) return null

  const derivative = coeffs.slice(1).map((value, index) => value * (index + 1))
  const critical = polynomialRoots(derivative, tolerance)
  if (!critical) return null

  const inside = critical.filter(x => x > -bound && x < bound)
  const endpoints = [-bound, ...inside, bound].sort((a, b) => a - b)
  const roots: number[] = []

  for (const point of inside) {
    if (nearlyPolynomialZero(coeffs, point)) addDistinct(roots, point, tolerance)
  }

  for (let i = 1; i < endpoints.length; i++) {
    const root = bisect(x => polyValue(coeffs, x), endpoints[i - 1], endpoints[i], tolerance)
    if (root !== null) addDistinct(roots, root, tolerance)
  }

  return roots.sort((a, b) => a - b)
}

function minimizeAbs(
  f: (x: number) => number,
  a: number,
  b: number,
  tolerance: number
): number | null {
  const ratio = (Math.sqrt(5) - 1) / 2
  let c = b - ratio * (b - a)
  let d = a + ratio * (b - a)

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const fc = Math.abs(f(c))
    const fd = Math.abs(f(d))
    if (!Number.isFinite(fc) || !Number.isFinite(fd)) return null

    if (fc < fd) {
      b = d
      d = c
      c = b - ratio * (b - a)
    } else {
      a = c
      c = d
      d = a + ratio * (b - a)
    }
    if (b - a <= tolerance * Math.max(1, Math.abs((a + b) / 2))) break
  }

  return a + (b - a) / 2
}

/** Búsqueda por muestreo: no puede garantizar todas las raíces arbitrarias. */
function numericalRoots(
  f: (x: number) => number,
  min: number,
  max: number,
  samples: number,
  tolerance: number,
  maxRoots: number
): number[] {
  const roots: number[] = []
  const step = (max - min) / samples
  let previousX = min
  let previous = f(previousX)
  let beforePrevious = Number.NaN

  for (let i = 1; i <= samples; i++) {
    const x = i === samples ? max : min + i * step
    const current = f(x)

    if (Number.isFinite(previous) && previous === 0) {
      addDistinct(roots, previousX, tolerance * 10)
    }

    if (Number.isFinite(previous) && Number.isFinite(current)) {
      if (Math.sign(previous) !== Math.sign(current) && current !== 0 && previous !== 0) {
        const root = bisect(f, previousX, x, tolerance)
        if (root !== null) addDistinct(roots, root, tolerance * 10)
      }

      // Un mínimo local de |f| podría ser una raíz tangente.
      if (Number.isFinite(beforePrevious) && i >= 2 &&
          Math.abs(previous) < Math.abs(beforePrevious) &&
          Math.abs(previous) < Math.abs(current)) {
        const candidate = minimizeAbs(f, previousX - step, x, tolerance)
        if (candidate !== null && Math.abs(f(candidate)) < tolerance) {
          addDistinct(roots, candidate, tolerance * 10)
        }
      }
    }

    if (roots.length >= maxRoots) break
    beforePrevious = previous
    previous = current
    previousX = x
  }

  if (Number.isFinite(previous) && previous === 0) {
    addDistinct(roots, previousX, tolerance * 10)
  }
  return roots.sort((a, b) => a - b).slice(0, maxRoots)
}

/**
 * Devuelve raíces reales aproximadas.
 * - Polinomios de grado <= 12: aislamiento por puntos críticos (hasta el límite
 *   de precisión de number; raíces extremadamente próximas pueden fusionarse).
 * - Otras expresiones: búsqueda acotada por muestreo + bisección + mínimos.
 * Una lista vacía NO demuestra que no existan raíces.
 */
export function findRoots(
  expression: Node,
  variable: string,
  options: RootSearchOptions = {}
): string[] {
  const {
    min = -100,
    max = 100,
    samples = 4096,
    tolerance = 1e-16,
    maxRoots = 128
  } = options

  if (!(Number.isFinite(min) && Number.isFinite(max) && min < max)) {
    throw new RangeError('El dominio debe tener extremos finitos y min < max')
  }
  if (!(Number.isInteger(samples) && samples > 0 && samples <= 1_000_000)) {
    throw new RangeError('samples debe ser un entero entre 1 y 1_000_000')
  }
  if (!(Number.isFinite(tolerance) && tolerance > 0) ||
      !(Number.isInteger(maxRoots) && maxRoots > 0)) {
    throw new RangeError('tolerance y maxRoots deben ser positivos')
  }

  const polynomial = asPolynomial(expression, variable)
  if (polynomial && polynomial.length === 1 && polynomial[0] === 0) {
    throw new RangeError('La ecuación es una identidad: tiene infinitas soluciones reales')
  }

  if (polynomial && polynomial.length - 1 <= MAX_POLYNOMIAL_DEGREE) {
    const roots = polynomialRoots(polynomial, tolerance)
    if (roots) {
      // Sin dominio explícito, los polinomios se resuelven sobre toda la recta
      // real usando una cota matemática de sus raíces.
      return roots.filter(x =>
        (options.min === undefined || x >= min) &&
        (options.max === undefined || x <= max)
      )
        .slice(0, maxRoots).map(x => String(Object.is(x, -0) ? 0 : x))
    }
  }

  const f = (x: number): number => {
    try {
      return Number(evaluate(expression, { ...DEFAULT_VARS, [variable]: String(x) }))
    } catch {
      return Number.NaN
    }
  }

  return numericalRoots(f, min, max, samples, tolerance, maxRoots)
    .map(x => String(Object.is(x, -0) ? 0 : x))
}
