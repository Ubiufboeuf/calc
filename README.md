# Zalk

Motor de expresiones matemáticas desarrollado en TypeScript. Permite evaluar operaciones complejas, utilizar variables y funciones científicas, y resolver ecuaciones numéricamente.

## Instalación

```bash
# npm
npm install -E @mangufaf/zalk

# pnpm
pnpm add -E @mangufaf/zalk

# bun
bun add -E @mangufaf/zalk
```

## Uso

```ts
import { calc, prepare, solve } from '@mangufaf/zalk'

calc('2 + 3 * 4')               // '14'
calc('sqrt(16) + pow(2, 3)')    // '12'
calc('100 + 15%')               // '115'
calc('2PI * r', { r: 5 })       // '31.41592653589793'

// Evaluaciones repetidas con AST preprocesado
const expr = prepare('sqrt(pow(x, 2) + pow(y, 2))')
expr.evaluate({ x: 3, y: 4 })  // '5'

// Resolución numérica de ecuaciones
solve('2x = 5', 'x')           // ['2.5']
solve('x^2 = 4', 'x')          // ['-2', '2']
solve('x(2x + 1) = 10', 'x')   // ['-2.5', '2']

// Búsqueda de raíces con opciones personalizadas
solve('sin(x) = 0', 'x', {
  min: -20,
  max: 20,
  samples: 8192,
  tolerance: 1e-16
})
```

## Características

- Operaciones matemáticas con precedencia y paréntesis.
- Funciones científicas, variables y constantes matemáticas.
- Multiplicación implícita y porcentajes contextuales.
- Función `prepare` para optimizar evaluaciones repetidas.
- Función `solve` para encontrar raíces reales, incluyendo múltiples soluciones.
- Búsqueda configurable mediante intervalo, muestreo y tolerancia.
- Tokenizador, parser, AST y evaluador propios.
- Sin dependencias de ejecución.

**Nota:** `solve` utiliza métodos numéricos y no garantiza encontrar todas las raíces de funciones generales. Los resultados están sujetos a la precisión de JavaScript.

## Funcionamiento

**Tokenización → Análisis sintáctico → AST → Evaluación**

Todo el procesamiento está implementado en TypeScript, sin utilizar `eval()`.

## Licencia

MIT