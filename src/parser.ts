import { functions, isSymbol } from './lib'
import type { Node, ParseResult } from './types'

const LOOP_LIMIT = 50
let iteration = 0

// Niveles de prioridad de menor a mayor (mayor el número, mayor la prioridad)
export function parser (tokens: string[]): Node {
  iteration = 0

  const ast = parseAdditive(tokens)
  return ast
}

// Nivel de Prioridad 1
function parseAdditive (tokens: string[]): ParseResult {
  if (iteration >= LOOP_LIMIT) throw new Error('Bucle')
  iteration++
  
  let depth = 0
  const additiveIndex = tokens.findLastIndex((t, i) => {
    // Están invertidos por ser find-last
    if (t === '(') {
      depth--
      return false
    }
    if (t === ')') {
      depth++
      return false
    }
    
    return depth === 0 &&
      i > 0 &&
      (t === '+' || t === '-') &&
      !['+', '-', '*', '/', '('].includes(tokens[i - 1]!)
  })

  if (additiveIndex === -1) {
    return parseMultiplicative(tokens)
  }

  const symbol = tokens[additiveIndex]
  if (!isSymbol(symbol)) {
    throw new Error('Símbolo inválido')
  }
  
  const left = tokens.slice(0, additiveIndex)
  const right = tokens.slice(additiveIndex + 1)

  // console.log(left, right, symbol)

  const node: Node = {
    type: 'symbol',
    value: symbol as any,
    leftNode: left.length ? parseAdditive(left) : undefined,
    rightNode: parseMultiplicative(right),
  }
  
  return node
}

// Nivel de Prioridad 2
function parseMultiplicative (tokens: string[]): ParseResult {
  let depth = 0
  const multiplicativeIndex = tokens.findLastIndex((t, i) => {
    // También invertidos por ser find-last
    if (t === '(') {
      depth--
      return false
    }
    if (t === ')') {
      depth++
      return false
    }

    return depth === 0 && i > 0 && Boolean(t.match(/[*/]/))
  })

  if (multiplicativeIndex === -1) {
    return parseUnary(tokens)
  }

  const symbol = tokens[multiplicativeIndex]
  if (!isSymbol(symbol)) {
    throw new Error('Símbolo inválido')
  }
  
  const left = tokens.slice(0, multiplicativeIndex)
  const right = tokens.slice(multiplicativeIndex + 1)

  const node: Node = {
    type: 'symbol',
    value: symbol as any,
    leftNode: parseMultiplicative(left),
    rightNode: parseUnary(right)
  }

  return node
}

// Nivel de Prioridad 3
function parseUnary (tokens: string[]): ParseResult {
  if (tokens[0] === '+' || tokens[0] === '-') {
    const node: Node = {
      type: 'unary',
      value: tokens[0],
      node: parseUnary(tokens.slice(1))
    }

    return node
  }

  return parsePrimary(tokens)
}

// Nivel de Prioridad 4
function parsePrimary (tokens: string[]): ParseResult {
  const lastToken = tokens[tokens.length - 1]

  if (lastToken === '%') {
    const innerTokens = tokens.slice(0, -1) // Quitamos el '%' y evaluamos lo que queda adentro
    return {
      type: 'percentage',
      value: parsePrimary(innerTokens)
    }
  }

  if (lastToken === '!') {
    const innerTokens = tokens.slice(0, -1) // Quitamos el '!' y evaluamos lo que queda adentro
    return {
      type: 'factorial',
      value: parsePrimary(innerTokens)
    }
  }

  const firstToken = tokens[0]

  if (firstToken === '(' && lastToken === ')') {
    const innerTokens = tokens.slice(1, -1)
    return parseAdditive(innerTokens)
  }

  if (Number.isNaN(Number(firstToken))) {
    if (firstToken && functions[firstToken]) {
      return {
        type: 'function',
        function: firstToken,
        value: tokens.join('')
      }
    }

    if (!firstToken) {
      return {
        type: 'number',
        value: '0'
      }
    }
    
    if (Number.isNaN(Number(firstToken))) {
      return {
        type: 'variable',
        value: firstToken
      }
    }

    const parts = firstToken.match(/\d+|[a-zA-Z_]+/g)

    if (!parts) throw new Error('Expresión inválida')

    return parseMultiplicative(parts.flatMap((part, i) =>
      i === 0 ? [part] : ['*', part]
    ))
  }
  
  const node: Node = {
    type: 'number',
    value: firstToken!
  }

  return node
}