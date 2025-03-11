<script setup lang="ts">
import { ref } from 'vue'
import { evaluateAstStepByStep, parse, tokenize } from './lib'
import type { AstNode } from './lib/types'

const expression = ref('2 * (3 + 4 * (3 + 3) * 3 + 2) > 150 && 5 > 10')
const error = ref('')

const ast = computed(() => {
  try {
    error.value = ''
    return parse(expression.value)
  } catch (e) {
    error.value = (e as Error).message
    console.error(e)
    return null
  }
})

type TreeViewNode = { id: number, label: string, children: TreeViewNode[] | null }

const uniqueId = (() => {
  let id = 0
  return () => id++
})()

const normalizeAst = (ast: AstNode) => {
  const newAst: TreeViewNode[] = []

  if (!ast) {
    newAst.push({ id: uniqueId(), label: 'EMPTY', children: null })
  }
  else if (ast.type === 'number' || ast.type === 'boolean' || ast.type === 'constant') {
    newAst.push({ id: uniqueId(), label: ast.type + ' : ' + ast.value.toString(), children: null })
  } else if (ast.type === 'add' || ast.type === 'sub' || ast.type === 'div' || ast.type === 'mul' || ast.type === 'pow' || ast.type === 'comparison' || ast.type === 'logical') {
    newAst.push({
      id: uniqueId(),
      label: ast.type + ('operator' in ast ? ' : ' + ast.operator : ''),
      children: [
        ...normalizeAst(ast.left),
        ...normalizeAst(ast.right)
      ]
    })
  } else if (ast.type === 'group') {
    newAst.push({
      id: uniqueId(),
      label: 'group',
      children: normalizeAst(ast.value)
    })
  } else if (ast.type === 'function') {
    newAst.push({
      id: uniqueId(),
      label: ast.name,
      children: normalizeAst(ast.value)
    })
  }

  return newAst
}

const astNormalized = computed(() => {
  if (!ast.value) return []

  return normalizeAst(ast.value)
})

const evaluation = computed(() => {
  if (!ast.value) return null

  try {
    return evaluateAstStepByStep(ast.value)
  } catch (e) {
    error.value = (e as Error).message
    console.error(e)
    return null
  }
})
</script>

<template>
  <div class="p-4 flex flex-col gap-2">
    <VaCard>
      <VaCardContent>
        <VaCollapse>
          <template #header-content>
            Instruction
          </template>
          <template #content>
            Allowed tokens: 
            <div class="flex gap-2">
              <span v-for="token in ['number', 'true', 'false', '+', '-', '*', '/', '^', '(', ')', '>', '<', '=', '&&', '||', 'sin', 'cos', 'sqrt', 'PI']" class="p-1 bg-gray-200 font-mono">
                {{ token }}
              </span>
            </div>
          </template>
        </VaCollapse>
      </VaCardContent>
    </VaCard>

    <div class="grid grid-cols-2 gap-2">
      <VaCard>
        <VaCardContent>
          <div class="flex items-center gap-2">
            <VaInput label="Expression" v-model="expression" class="w-full" />
            <span v-if="evaluation?.at(-1)" class="mt-3 whitespace-nowrap">
              = {{ evaluation?.at(-1) }}
            </span>
          </div>
          <VaDivider />
        </VaCardContent>
        <VaCardTitle>
          Step by step
        </VaCardTitle>
        <VaCardContent>
          <VaAlert v-if="error" color="danger">{{ error }}</VaAlert>        
          <div class="flex items-center gap-2" v-for="step, index in evaluation" :key="step">
            <span class="w-5">{{ index }}</span>: <div class="va-code-snippet w-full">{{ step }}</div>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard>
        <VaCardTitle>
          Tokens
        </VaCardTitle>
        <VaCardContent>
          <VaScrollContainer horizontal>
            <div class="flex gap-2">
              <span v-for="token in tokenize(expression)" class="p-1 bg-gray-200 font-mono">{{ token }}</span>
            </div>
          </VaScrollContainer>
        </VaCardContent>
        <VaCardTitle>
          AST viewer
        </VaCardTitle>
        <VaCardContent>
          <VaAlert v-if="error" color="danger">{{ error }}</VaAlert>
          <TreeNode :node="{ id: 0, label: 'ast root', children: astNormalized }" />
        </VaCardContent>
      </VaCard>
    </div>
    <VaCard>
      <VaCardContent>
        <Tests />
      </VaCardContent>
    </VaCard>
  </div>
</template>