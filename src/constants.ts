export const symbols = ['+', '-', '*', '/', '(', ')', '%'] as const
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

export const TOKEN_REGEX = /(?<number>(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)|(?<identifier>[a-zA-Z_]\w*)|(?<symbol>[+\-*/()%(),])/y
