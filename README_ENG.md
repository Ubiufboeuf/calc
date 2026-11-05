# Zalk

Mathematical expression engine developed in TypeScript. Supports complex expressions, variables, scientific functions, and numerical equation solving.

## Installation

```bash
# npm
npm install -E @mangufaf/zalk

# pnpm
pnpm add -E @mangufaf/zalk

# bun
bun add -E @mangufaf/zalk
```

## Usage

```ts
import { calc, prepare, solve } from '@mangufaf/zalk'

calc('2 + 3 * 4')               // '14'
calc('sqrt(16) + pow(2, 3)')    // '12'
calc('100 + 15%')               // '115'
calc('2PI * r', { r: 5 })       // '31.41592653589793'

// Repeated evaluations with a preprocessed AST
const expr = prepare('sqrt(pow(x, 2) + pow(y, 2))')
expr.evaluate({ x: 3, y: 4 })  // '5'

// Numerical equation solving
solve('2x = 5', 'x')           // ['2.5']
solve('x^2 = 4', 'x')          // ['-2', '2']
solve('x(2x + 1) = 10', 'x')   // ['-2.5', '2']

// Root finding with custom options
solve('sin(x) = 0', 'x', {
  min: -20,
  max: 20,
  samples: 8192,
  tolerance: 1e-16
})
```

## Features

- Mathematical operations with operator precedence and parentheses.
- Scientific functions, variables, and mathematical constants.
- Implicit multiplication and contextual percentages.
- `prepare` function for optimizing repeated evaluations.
- `solve` function for finding real roots, including multiple solutions.
- Configurable search interval, sampling, and tolerance.
- Custom tokenizer, parser, AST, and evaluator.
- No runtime dependencies.

**Note:** `solve` uses numerical methods and does not guarantee finding all roots of general functions. Results are subject to JavaScript's numerical precision.

## How It Works

**Tokenization → Parsing → AST → Evaluation**

All processing is implemented in TypeScript without using `eval()`.

## License

MIT