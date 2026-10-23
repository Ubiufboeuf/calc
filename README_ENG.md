# Zalk

A lightweight mathematical expression engine written in TypeScript. Parse and evaluate complex expressions with variables, scientific functions, constants, and implicit multiplication.

## Installation

```bash
npm install @mangufaf/zalk
```

## Usage

```ts
import { calc } from '@mangufaf/zalk'

calc('2 + 3 * 4')               // '14'
calc('sqrt(16) + pow(2, 3)')    // '12'
calc('100 + 15%')               // '115'
calc('2PI * r', { r: '5' })     // '31.41592653589793'
```

## Features

- Mathematical expressions with operator precedence and parentheses.
- Scientific functions, including trigonometry, logarithms, and roots.
- Variables and built-in mathematical constants.
- Implicit multiplication (`2PI`, `2(3 + 4)`).
- Context-aware percentages and nested functions.
- Custom lexer, parser, AST, and evaluator.
- Zero runtime dependencies.

## How it works

Zalk processes expressions through four stages:

**Tokenization → Parsing → AST → Evaluation**

Each stage is implemented in TypeScript, without relying on `eval()`.

## License

MIT
