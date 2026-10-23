import { calc } from '.'
import { functions } from './src/lib'
import type { FunctionNode, Node, Vars } from './src/types'

export function evaluate (node: Node, vars: Vars): string {
  if (node.type === 'function') {
    return String(evaluateFunction(node, vars))
  }

  if (node.type === 'variable') {
    return calc(vars[node.value]!, vars)
  }

  if (node.type === 'number') {
    return node.value
  }

  if (node.type === 'percentage') {
    const val = Number(evaluate(node.value, vars))
    return `${val / 100}`
  }

  if (node.type === 'unary') {
    const { node: innerNode, value: symbol } = node
    if (!innerNode) return ''

    const value = Number(evaluate(innerNode, vars))

    if (symbol === '+') return `${value}`
    if (symbol === '-') return `${-value}`

    return ''
  }

  const { leftNode, rightNode, value: symbol } = node

  if (!rightNode) return ''

  const right = Number(evaluate(rightNode, vars))

  if (!leftNode) {
    if (symbol === '+') return `${right}`
    if (symbol === '-') return `${-right}`
    return ''
  }

  const left = Number(evaluate(leftNode, vars))

  if (symbol === '*') return `${left * right}`
  if (symbol === '/') return `${left / right}`

  if (symbol === '+') {
    return `${left + (isPercentage(rightNode) ? left * right : right)}`
  }

  if (symbol === '-') {
    return `${left - (isPercentage(rightNode) ? left * right : right)}`
  }

  return ''
}

function isPercentage (node: Node): boolean {
  if (node.type === 'percentage') return true

  if (node.type === 'unary' && node.node) {
    return isPercentage(node.node)
  }

  return false
}

function evaluateFunction (node: FunctionNode, vars: Vars): string | number {
  const firstParen = node.value.indexOf('(')
  const lastParen = node.value.lastIndexOf(')')
  const content = node.value.slice(firstParen + 1, lastParen)

  const args = splitArguments(content)

  return functions[node.function]!(
    ...args.map((arg) => Number(calc(arg, vars)))
  )
}

function splitArguments (content: string): string[] {
  const args: string[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === '(') depth++
    if (char === ')') depth--

    if (char === ',' && depth === 0) {
      args.push(content.slice(start, i).trim())
      start = i + 1
    }
  }

  args.push(content.slice(start).trim())

  return args
}
