import { evaluate } from './evaluate'
import { parser } from './parser'
import { preprocess } from './preprocess'
import { DEFAULT_VARS } from './constants'
import { functions } from './lib'
import type { ExternalVars, Vars, Node } from './types'
import { tokenize } from './tokenize'
import { findRoots, type RootSearchOptions } from './find-roots'

export function calc (operation: string, externalVars: ExternalVars = {}): string {
  if (!operation) return ''

  const preparedOperation = preprocess(operation)
  // console.log(preparedOperation)
  
  const tokens = tokenize(preparedOperation, Object.keys(functions))
  
  const tree = parser(tokens)
  // console.log('tree:', tree)
  
  const vars: Vars = {}
  for (const k in externalVars) {
    const v = externalVars[k]
    vars[k] = typeof v === 'string' ? v : String(v)
  }

  const result = evaluate(tree, { ...DEFAULT_VARS, ...vars })
  // console.log('result:', result)

  return result
}

export function prepare (operation: string) {
  const preparedOperation = preprocess(operation)
  
  const tokens = tokenize(preparedOperation, Object.keys(functions))
  
  const tree = parser(tokens)

  const formula = (externalVars: ExternalVars = {}) => {
    const vars: Vars = {}
    for (const k in externalVars) {
      const v = externalVars[k]
      vars[k] = typeof v === 'string' ? v : String(v)
    }
    return evaluate(tree, { ...DEFAULT_VARS, ...vars })
  }

  formula.evaluate = formula

  return formula
}

/**
 * Encuentra raíces reales. Para polinomios de grado <= 12 busca todas las
 * raíces reales distintas; para otras funciones busca raíces numéricamente
 * dentro del intervalo indicado (sin garantía de encontrarlas todas).
 */
export function solve(
  equation: string,
  variable: string,
  options: RootSearchOptions = {}
): string[] {
  const parts = equation.split('=')
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) return []

  const leftAST = parser(tokenize(preprocess(parts[0].trim()), Object.keys(functions)))
  const rightAST = parser(tokenize(preprocess(parts[1].trim()), Object.keys(functions)))

  const difference: Node = {
    type: 'symbol',
    value: '-',
    leftNode: leftAST,
    rightNode: rightAST
  }

  return findRoots(difference, variable, options)
}
