export function preprocess (operation: string): string {
  return operation
    .replace(/[·⋅∙×∗]/g, '*')
    .replace(/÷/g, '/')
}