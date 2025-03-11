import type { AstNode } from "./types"

export function printAstExpression(node: AstNode): string {
  if (!node) {
    return ''
  }

  if (node.type === 'group') {
    return `(${printAstExpression(node.value)})`
  }

  if (node.type === 'logical') {
    return `${printAstExpression(node.left)} ${node.operator} ${printAstExpression(node.right)}`
  }

  if (node.type === 'comparison') {
    return `${printAstExpression(node.left)} ${node.operator} ${printAstExpression(node.right)}`
  }

  if (node.type === 'number' || node.type === 'constant') {
    return `${node.value}`
  }

  if (node.type === 'boolean') {
    return node.value
  }

  if (node.type === 'function') {
    return `${node.name}(${printAstExpression(node.value)})`
  }

  function addBrackets(str: string, node: AstNode) {
    if (!node) {
      return str
    }
    if ('left' in node) {
      return `(${printAstExpression(node)})`
    }

    return printAstExpression(node)
  }

  const typeOperators = {
    'add': '+',
    'sub': '-',
    'mul': '*',
    'div': '/',
    'pow': '^'
  }

  return `${addBrackets(printAstExpression(node.left), node.left)} ${typeOperators[node.type] ?? node.type} ${addBrackets(printAstExpression(node.right), node.right)}`
}
