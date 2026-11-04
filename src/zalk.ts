import { evaluate } from './evaluate'
import { parser } from './parser'
import { preprocess } from './preprocess'
import { DEFAULT_VARS } from './constants'
import { functions } from './lib'
import type { ExternalVars, Vars } from './types'
import { tokenize } from './tokenize'

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