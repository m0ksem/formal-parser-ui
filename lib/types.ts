export type ComparisonToken = '>' | '<' | '=';
export type LogicalToken = '&&' | '||';
export type OperatorToken = '+' | '-' | '*' | '/' | '^';
export type FunctionToken = 'sin' | 'cos' | 'sqrt';
export type ConstantToken = 'true' | 'false' | 'PI';
export type GroupToken = '(' | ')';

export type Token = `${number}` | FunctionToken | OperatorToken| ComparisonToken | LogicalToken | GroupToken | ConstantToken;

type AstNodeGroup = { type: 'group', value: AstNode };
type AstNodeNumber = { type: 'number', value: number };
type AstNodeBoolean = { type: 'boolean', value: 'true' | 'false' };
type AstNodeAdd = { type: 'add', left: AstNode, right: AstNode };
type AstNodeSub = { type: 'sub', left: AstNode, right: AstNode };
type AstNodeMul = { type: 'mul', left: AstNode, right: AstNode };
type AstNodeDiv = { type: 'div', left: AstNode, right: AstNode };
type AstNodePow = { type: 'pow', left: AstNode, right: AstNode };
type AstNodeFunction = { type: 'function', name: 'sin' | 'cos' | 'sqrt', value: AstNode };
type AstNodeComparison = { type: 'comparison', left: AstNode, right: AstNode, operator: ComparisonToken };
type AstNodeLogical = { type: 'logical', left: AstNode, right: AstNode, operator: '&&' | '||' };
type AstNodeConstant = { type: 'constant', value: string };

export type AstNode = AstNodeAdd | AstNodeSub | AstNodeMul | AstNodeDiv | AstNodeNumber | AstNodePow | AstNodeGroup | AstNodeComparison | AstNodeLogical | AstNodeBoolean | AstNodeFunction | AstNodeConstant;
export type Ast = (AstNode)[];