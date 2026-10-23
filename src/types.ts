import type { symbols } from './constants'

export type MathSymbol = typeof symbols[number]
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
  value: MathSymbol | undefined
}

export interface SymbolNode {
  type: 'symbol'
  leftNode: Node | undefined
  rightNode: Node | undefined
  value: MathSymbol | undefined
}

export type Node = VariableNode | FunctionNode | NumberNode | UnaryNode | SymbolNode | PercentageNode

export type MathFunction = (...numbers: number[]) => string | number

export type TokenType = 'number' | 'identifier' | 'symbol'
export interface Token {
  type: TokenType
  value: string
  position: number
}

export type ParseResult = Node
