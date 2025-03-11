import { printAstExpression } from "./renderer"
import type { AstNode } from "./types"

/** @deprecated Use StepByStep */
export function evaluateAst(node: AstNode): number | 'true' | 'false' {
  if (node.type === 'number') {
    return node.value
  }

  if (node.type === 'add') {
    const left = evaluateAst(node.left)
    const right = evaluateAst(node.right)
    if (typeof left === 'string' || typeof right === 'string') {
      throw new Error('Unable to add logical values')
    }
    return left + right
  }

  if (node.type === 'sub') {
    const left = evaluateAst(node.left)
    const right = evaluateAst(node.right)
    if (typeof left === 'string' || typeof right === 'string') {
      throw new Error('Unable to sub logical values')
    }
    return left - right
  }

  if (node.type === 'mul') {
    const left = evaluateAst(node.left)
    const right = evaluateAst(node.right)
    if (typeof left === 'string' || typeof right === 'string') {
      throw new Error('Unable to multiply logical values')
    }
    return left * right
  }

  if (node.type === 'div') {
    const left = evaluateAst(node.left)
    const right = evaluateAst(node.right)
    if (typeof left === 'string' || typeof right === 'string') {
      throw new Error('Unable to divide logical values')
    }
    return left / right
  }

  if (node.type === 'pow') {
    const left = evaluateAst(node.left)
    const right = evaluateAst(node.right)
    if (typeof left === 'string' || typeof right === 'string') {
      throw new Error('Unable to pow logical values')
    }
    return Math.pow(left, right)
  }

  if (node.type === 'function') {
    const value = evaluateAst(node.value)

    if (typeof value === 'string') {
      throw new Error('Unable to evaluate logical values')
    }
    
    if (node.name === 'sin') {
      return Math.sin(value)
    }

    if (node.name === 'cos') {
      return Math.cos(value)
    }

    if (node.name === 'sqrt') {
      return Math.sqrt(value)
    }
  }

  if (node.type === 'group') {
    return evaluateAst(node.value)
  }

  if (node.type === 'comparison') {
    if (node.operator === '>') {
      return evaluateAst(node.left) > evaluateAst(node.right) ? 'true' : 'false'
    }

    if (node.operator === '<') {
      return evaluateAst(node.left) < evaluateAst(node.right) ? 'true' : 'false'
    }

    if (node.operator === '=') {
      return evaluateAst(node.left) === evaluateAst(node.right) ? 'true' : 'false'
    }
  }

  if (node.type === 'logical') {
    if (node.operator === '&&') {
      return evaluateAst(node.left) === 'true' && evaluateAst(node.right) === 'true' ? 'true' : 'false'
    }

    if (node.operator === '||') {
      return evaluateAst(node.left) === 'true' || evaluateAst(node.right) === 'true' ? 'true' : 'false'
    }
  }

  if (node.type === 'constant') {
    if (node.value === 'PI') {
      return Math.PI
    }
  }

  if (node.type === 'boolean') {
    return node.value
  }

  throw new Error('Unable to evaluate node')
}

export function evaluateAstStepByStep(ast: AstNode): string[] {
  const history = [] as string[]
  const astCopy = structuredClone(ast)

  history.push(printAstExpression(astCopy))

  function makeNodeFromValue(value: number | 'true' | 'false'): AstNode {
    return typeof value !== 'string' ? { type: 'number', value } : { type: 'boolean', value }
  }

  function evaluateNode(node: AstNode): number | 'true' | 'false' {
    if (!node) {
      throw new Error('Unable to evaluate node')
    }
    
    if (node.type === 'number') {
      return node.value
    }

    if ('right' in node) {
      const left = evaluateNode(node.left)
      node.left = makeNodeFromValue(left)

      const right = evaluateNode(node.right)
      node.right =  makeNodeFromValue(right)
  
      history.push(printAstExpression(astCopy))

      if (node.type === 'add') {
        if (typeof left === 'string' || typeof right === 'string') {
          throw new Error('Unable to add logical values')
        }
        return left + right
      } else if (node.type === 'sub') {
        if (typeof left === 'string' || typeof right === 'string') {
          throw new Error('Unable to sub logical values')
        }
        return left - right
      } else if (node.type === 'mul') {
        if (typeof left === 'string' || typeof right === 'string') {
          throw new Error('Unable to multiply logical values')
        }
        return left * right
      } else if (node.type === 'div') {
        if (typeof left === 'string' || typeof right === 'string') {
          throw new Error('Unable to divide logical values')
        }
        return left / right
      } else if (node.type === 'pow') {
        if (typeof left === 'string' || typeof right === 'string') {
          throw new Error('Unable to pow logical values')
        }
        return Math.pow(left, right)
      } else if (node.type === 'comparison') {
        if (node.operator === '>') {
          return left > right ? 'true' : 'false'
        }
        if (node.operator === '<') {
          return left < right ? 'true' : 'false'
        }
        if (node.operator === '=') {
          return left === right ? 'true' : 'false'
        }
      } else if (node.type === 'logical') {
        if (node.operator === '&&') {
          return left === 'true' && right === 'true' ? 'true' : 'false'
        }
        if (node.operator === '||') {
          return left === 'true' || right === 'true' ? 'true' : 'false'
        }
      }
    }

    if (node.type === 'function') {
      const value = evaluateNode(node.value)
  
      if (typeof value === 'string') {
        throw new Error('Unable to evaluate logical values')
      }

      Object.assign(node, makeNodeFromValue(value))
      
      if (node.name === 'sin') {
        return Math.sin(value)
      }
  
      if (node.name === 'cos') {
        return Math.cos(value)
      }
  
      if (node.name === 'sqrt') {
        return Math.sqrt(value)
      }
    }

    if (node.type === 'group') {
      return evaluateNode(node.value)
    }

    if (node.type === 'constant') {
      if (node.value === 'PI') {
        return Math.PI
      }
    }

    throw new Error('Unable to evaluate node')
  }
  

  const result = evaluateNode(astCopy)
  history.push(printAstExpression(makeNodeFromValue(result)))

  return history
}