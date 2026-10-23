import { evaluate } from './evaluate'
import { parser } from './parser'
import { preprocess } from './preprocess'
import { tokenize } from './tokenize'

const symbols = ['+', '-', '*', '/', '(', ')', '%'] as const
export type Symbol = typeof symbols[number]
export type Vars = Record<string, string>

export interface VariableNode {
  type: 'variable'
  value: string
}

export interface FunctionNode {
  type: 'function'
  function: string
  value: string
}

export interface PercentageNode {
  type: 'percentage'
  value: Node
}

export interface NumberNode {
  type: 'number'
  value: string
}

export interface UnaryNode {
  type: 'unary'
  node: Node | undefined
  value: Symbol | undefined
}

export interface SymbolNode {
  type: 'symbol'
  leftNode: Node | undefined
  rightNode: Node | undefined
  value: Symbol | undefined
}

export type Node = VariableNode | FunctionNode | NumberNode | UnaryNode | SymbolNode | PercentageNode

export const isSymbol = (str: any): str is Symbol => symbols.includes(str)
export const DEFAULT_VARS = {
  E: String(Math.E),
  LN10: String(Math.LN10),
  LN2: String(Math.LN2),
  LOG10E: String(Math.LOG10E),
  LOG2E: String(Math.LOG2E),
  PI: String(Math.PI),
  SQRT1_2: String(Math.SQRT1_2),
  SQRT2: String(Math.SQRT2),
}

type MathFunction = (...numbers: number[]) => string | number

const toRadians = (x: number) => x * Math.PI / 180
const toDegrees = (x: number) => x * 180 / Math.PI

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

export function calc (operation: string, vars: Vars = {}): string {
  if (!operation) return ''
  
  const preparedOperation = preprocess(operation)
  // console.log(preparedOperation)
  
  const tokens = tokenize(preparedOperation, Object.keys(functions))
  
  const tree = parser(tokens)
  // console.log('tree:', tree)
  
  const result = evaluate(tree, { ...DEFAULT_VARS, ...vars })
  // console.log('result:', result)

  return result
}

const operation = '(0.1 + 0.2) * 10 - 3 * 0 + 3'
console.log(operation, '=', calc(operation, { r: '2' }))