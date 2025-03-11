import type { Ast, AstNode, ComparisonToken, Token } from "./types";

const nodeOrders: Record<AstNode['type'], number> = {
  'comparison': -2,
  'logical': -3,
  'add': 1,
  'sub': 1,
  'mul': 2,
  'div': 2,
  'pow': 3,
  'function': 99,
  'group': 100,
  'number': 100,
  'constant': 100,
  'boolean': 100
}

function getNodeOrder(node: AstNode): number {
  return nodeOrders[node.type]
}

export function tokenize(expression: string): Token[] {
  const tokens = expression.match(/(\d+|\+|\-|\*|\/|\^|\(|\)|sin|cos|sqrt|>|<|=|&&|\|\||PI|true|false|.)/g);

  if (!tokens) {
    throw new Error('Invalid expression');
  }

  return tokens.filter((t) => t.length > 0 && t !== ' ') as Token[];
}

function findCloseParenthesis(tokens: Token[]): number {
  let open = 1;
  let i = 0;

  if (tokens[0] === ')') {
    return 0
  }

  while (open > 0) {
    i++;
    if (tokens[i] === '(') {
      open++;
    } else if (tokens[i] === ')') {
      open--;
    }

    if (i >= tokens.length) {
      throw new Error('Invalid expression: Missing closing parenthesis');
    }
  }

  return i;
}

function buildAst(tokens: Token[], left: Ast = []) {
  const ast: Ast = [...left];

  while (tokens.length) {
    const token = tokens.shift();

    if (token === undefined) {
      break;
    }

    if (token === '(') {
      const endTokenIndex = findCloseParenthesis(tokens);
      const groupValue = buildAst(tokens.slice(0, endTokenIndex));
      if (groupValue === undefined) {
        throw new Error('Invalid expression: Group can not be empty');
      }
      const right = buildAst(tokens.slice(endTokenIndex + 1), [{ type: 'group', value: groupValue }]);

      if (right === undefined) {
        ast.push({ type: 'group', value: groupValue });
      } else {
        ast.push(right);
      }
    }
    else if (token === ')') {
      return ast.at(-1)!;
    }
    else if (!isNaN(Number(token))) {
      ast.push({ type: 'number', value: Number(token) });
    }
    else if (token === 'true' || token === 'false') {
      ast.push({ type: 'boolean', value: token });
    }
    else if (token === '+') {
      ast.push({ type: 'add', left: ast.pop() as AstNode, right: buildAst(tokens) });
    }
    else if (token === '-') {
      ast.push({ type: 'sub', left: ast.pop() as AstNode, right: buildAst(tokens) });
    }
    else if (token === '*') {
      const left = ast.pop() as AstNode;
      const right = buildAst(tokens);

      ast.push({ type: 'mul', left, right: right });
    }
    else if (token === '/') {
      const left = ast.pop() as AstNode;
      const right = buildAst(tokens);

      ast.push({ type: 'div', left, right });
    }
    else if (token === '^') {
      const left = ast.pop() as AstNode;
      const right = buildAst(tokens);

      ast.push({ type: 'pow', left, right });
    }
    else if (['>', '<', '='].includes(token)) {
      ast.push({ type: 'comparison', left: ast.pop() as AstNode, right: buildAst(tokens), operator: token as ComparisonToken });
    }
    else if ([ '&&', '||' ].includes(token)) {
      ast.push({ type: 'logical', left: ast.pop() as AstNode, right: buildAst(tokens), operator: token as '&&' | '||' });
    } 
    else if (['sin', 'cos', 'sqrt'].includes(token)) {
      const nextToken = tokens.shift();
      if (nextToken !== '(') {
        throw new Error('Invalid expression: Expected "(" after function');
      }

      const endTokenIndex = findCloseParenthesis(tokens);
      const value = buildAst(tokens.slice(0, endTokenIndex));
      if (value === undefined) {
        throw new Error('Invalid expression: Function requires argument');
      }

      const right = buildAst(tokens.slice(endTokenIndex + 1), [{ type: 'function', name: token as 'sin' | 'cos' | 'sqrt', value }]);

      if (right === undefined) {
        ast.push({ type: 'function', name: token as 'sin' | 'cos' | 'sqrt', value });
      } else {
        ast.push(right);
      }

      return ast[0];
    } else if (['PI'].includes(token)) {
      ast.push({ type: 'constant', value: 'PI' });
    } else {
      throw new Error(`Invalid expression: Unexpected token ${token}`);
    }
  }

  return (ast)[0];
}

function reorderAst(ast: AstNode): AstNode {
  if (!ast) { throw new Error('Invalid expression') }

  if ('left' in ast) {
    ast.left = reorderAst(ast.left)
  }

  if ('right' in ast) {
    ast.right = reorderAst(ast.right)
  }

  if ('value' in ast && typeof ast.value === 'object') {
    ast.value = reorderAst(ast.value)
  }

  if ('right' in ast && ast.right && 'left' in ast.right) {
    if (getNodeOrder(ast.right) < getNodeOrder(ast)) {
      Object.assign(ast, {
        ...ast.right,
        left: {
          ...ast,
          right: ast.right.left
        }
      })
    }
  }

  if ('left' in ast) {
    ast.left = reorderAst(ast.left)
  }

  if ('right' in ast) {
    ast.right = reorderAst(ast.right)
  }

  return ast
}

export const parse = (expression: string): AstNode => {
  const tokens = tokenize(expression);
  const ast = buildAst(tokens);
  return reorderAst(ast);
}
