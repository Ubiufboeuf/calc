import { TOKEN_REGEX } from './src/constants'
import type { Token, TokenType } from './src/types'

export function tokenize (operation: string, functionNames: readonly string[]): string[] {
  const functions = new Set(functionNames)
  const tokens: Token[] = []
  const openParens: number[] = []

  let cursor = 0

  // Etapa 1: reconocimiento de tokens
  while (cursor < operation.length) {
    const char = operation[cursor]
    if (!char) continue

    if (/\s/.test(char)) {
      cursor++
      continue
    }

    TOKEN_REGEX.lastIndex = cursor
    const match = TOKEN_REGEX.exec(operation)

    if (!match) {
      throw new SyntaxError(
        `Token inválido en posición ${cursor}: ${char}`
      )
    }

    const value = match[0]

    const type: TokenType = match.groups?.number !== undefined
      ? 'number'
      : match.groups?.identifier !== undefined
        ? 'identifier'
        : 'symbol'

    const token: Token = {
      type,
      value,
      position: cursor
    }

    // Validación de paréntesis y comas
    if (value === '(') {
      openParens.push(cursor)
    } else if (value === ')') {
      if (!openParens.length) {
        throw new SyntaxError(
          `Paréntesis de cierre inesperado en posición ${cursor}`
        )
      }

      openParens.pop()
    } else if (value === ',' && !openParens.length) {
      throw new SyntaxError(
        `Coma fuera de paréntesis en posición ${cursor}`
      )
    }

    tokens.push(token)
    cursor = TOKEN_REGEX.lastIndex
  }

  if (openParens.length) {
    throw new SyntaxError(
      `Paréntesis sin cerrar en posición ${openParens.at(-1)}`
    )
  }

  // Etapa 2: multiplicación implícita
  const result: string[] = []

  for (let i = 0; i < tokens.length; i++) {
    const previous = tokens[i - 1]
    const current = tokens[i]
    const next = tokens[i + 1]

    // Las funciones registradas necesitan paréntesis
    if (
      current?.type === 'identifier' &&
      functions.has(current.value) &&
      next?.value !== '('
    ) {
      throw new SyntaxError(
        `La función ${current.value} necesita paréntesis`
      )
    }

    if (previous) {
      // Evitar interpretar "2 3" o "2.3.4" como expresiones válidas
      if (previous.type === 'number' && current?.type === 'number') {
        throw new SyntaxError(
          `Dos números consecutivos en posición ${current.position}`
        )
      }

      const left =
        previous.type === 'number' ||
        previous.type === 'identifier' ||
        previous.value === ')' ||
        previous.value === '%'

      const right =
        current?.type === 'number' ||
        current?.type === 'identifier' ||
        current?.value === '('

      const isFunctionCall =
        previous.type === 'identifier' &&
        current?.value === '(' &&
        functions.has(previous.value)

      if (left && right && !isFunctionCall) {
        result.push('*')
      }
    }

    if (current?.value) result.push(current.value)
  }

  return result
}
