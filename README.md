# Zalk

Motor de expresiones matemáticas desarrollado en TypeScript. Permite evaluar operaciones complejas con variables, funciones científicas, constantes y multiplicación implícita.

## Instalación

```bash
npm install @mangufaf/zalk
```

## Uso

```ts
import { calc, prepare } from '@mangufaf/zalk'

calc('2 + 3 * 4')               // '14'
calc('sqrt(16) + pow(2, 3)')    // '12'
calc('100 + 15%')               // '115'
calc('2PI * r', { r: 5 })       // '31.41592653589793'

// Preprocesamiento del AST para evaluaciones repetidas de alto rendimiento
const expr = prepare('sqrt(pow(x, 2) + pow(y, 2))')
expr.evaluate({ x: 3, y: 4 })  // '5'
```

## Características

- Operaciones matemáticas con precedencia y paréntesis.
- Funciones científicas: trigonometría, logaritmos, raíces y más.
- Variables flexibles (números y strings) y constantes matemáticas integradas.
- Multiplicación implícita (`2PI`, `2(3 + 4)`).
- Porcentajes contextuales y funciones anidadas.
- Función `prepare` para cachear el AST y optimizar bucles o llamadas masivas.
- Analizador léxico, parser, AST y evaluador propios.
- Sin dependencias de ejecución.

## Funcionamiento

Zalk procesa las expresiones mediante cuatro etapas:

**Tokenización → Análisis sintáctico → AST → Evaluación**

Todo el procesamiento está implementado en TypeScript, sin utilizar `eval()`.

## Licencia

MIT
