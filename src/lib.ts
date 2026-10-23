import { symbols } from './constants'
import type { MathFunction, MathSymbol } from './types'

export const isSymbol = (str: any): str is MathSymbol => symbols.includes(str)
export const toRadians = (x: number) => x * Math.PI / 180
export const toDegrees = (x: number) => x * 180 / Math.PI

export const functions: Record<string, MathFunction> = {
  // Raíces y potencias
  sqrt: (x) => Math.sqrt(x),
  cbrt: (x) => Math.cbrt(x),
  pow: (x, y = 1) => Math.pow(x, y),
  exp: (x) => Math.exp(x),
  expm1: (x) => Math.expm1(x),

  // Trigonometría (grados)
  sin: (x) => Math.sin(toRadians(x)),
  cos: (x) => Math.cos(toRadians(x)),
  tan: (x) => Math.tan(toRadians(x)),

  asin: (x) => toDegrees(Math.asin(x)),
  acos: (x) => toDegrees(Math.acos(x)),
  atan: (x) => toDegrees(Math.atan(x)),
  atan2: (x, y = 1) => toDegrees(Math.atan2(x, y)),

  // Trigonometría hiperbólica
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  asinh: (x) => Math.asinh(x),
  acosh: (x) => Math.acosh(x),
  atanh: (x) => Math.atanh(x),

  // Logaritmos
  log: (x) => Math.log(x),
  log10: (x) => Math.log10(x),
  log2: (x) => Math.log2(x),
  log1p: (x) => Math.log1p(x),

  // Redondeos
  round: (x) => Math.round(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  trunc: (x) => Math.trunc(x),
  fround: (x) => Math.fround(x),

  // Valores y signos
  abs: (x) => Math.abs(x),
  sign: (x) => Math.sign(x),

  // Múltiples argumentos
  min: (x, y, z, ...a) => Math.min(...[x, y, z, ...a].filter((n): n is number => n !== undefined)),
  max: (x, y, z, ...a) => Math.max(...[x, y, z, ...a].filter((n): n is number => n !== undefined)),
  hypot: (x, y, z, ...a) => Math.hypot(...[x, y, z, ...a].filter((n): n is number => n !== undefined)),

  // Otras
  clz32: (x) => Math.clz32(x),
  imul: (x, y = 1) => Math.imul(x, y),

  // Conversiones
  rad: (x) => toRadians(x),
  deg: (x) => toDegrees(x)
}
