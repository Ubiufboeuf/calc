import { evaluate } from './evaluate'
import { parser } from './parser'
import { preprocess } from './preprocess'
import { DEFAULT_VARS } from './constants'
import { functions } from './lib'
import type { Vars } from './types'
import { tokenize } from './tokenize'

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