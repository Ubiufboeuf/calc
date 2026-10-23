# Zalk

Motor de expresiones matemáticas desarrollado en TypeScript. Permite evaluar operaciones complejas con variables, funciones científicas, constantes y multiplicación implícita.

## Instalación

```bash
npm install @mangufaf/zalk
```

## Uso

```ts
import { calc } from '@mangufaf/zalk'

calc('2 + 3 * 4')               // '14'
calc('sqrt(16) + pow(2, 3)')    // '12'
calc('100 + 15%')               // '115'
calc('2PI * r', { r: '5' })     // '31.41592653589793'
```

## Características

- Operaciones matemáticas con precedencia y paréntesis.
- Funciones científicas: trigonometría, logaritmos, raíces y más.
- Variables personalizadas y constantes matemáticas integradas.
- Multiplicación implícita (`2PI`, `2(3 + 4)`).
- Porcentajes contextuales y funciones anidadas.
- Analizador léxico, parser, AST y evaluador propios.
- Sin dependencias de ejecución.

## Funcionamiento

Zalk procesa las expresiones mediante cuatro etapas:

**Tokenización → Análisis sintáctico → AST → Evaluación**

Todo el procesamiento está implementado en TypeScript, sin utilizar `eval()`.

## Licencia

MIT
