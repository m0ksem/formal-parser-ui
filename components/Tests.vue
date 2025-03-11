<script setup lang="ts">
import { evaluateAstStepByStep, parse } from '../lib'

  const tests = [
    '2 * (3 + 4 * (3 + 3) * 3 + 2) > 150 && 5 > 10',
    '2 * (3 + 4) > 10 && 5 > 10',
    '2 + 3 * 2 + 2 ^ 2 / 4 > 3 && 7 < sin(PI / 2)',
    "sin(PI / 2)",
    "cos(0)",
    "sqrt(16)",
    "3 + 4 * 2",
    "(3 + 4) * 2",
    "2 ^ 3",
    "5 > 3 && 2 < 4",
    "!(3 == 3)",
    "!false",
    "!(5 > 2) || 0 < 9"
  ]
  
  const evaluate = (expression: string) => {
    try {
      const ast = parse(expression)
      if (!ast) return 'Empty expression'
      const result = evaluateAstStepByStep(ast)
      if (result === undefined) return 'Undefined result'
      return result.at(-1)
    } catch (e) {
      return (e as Error).message
    }
  }

  const jsEval = (expression: string) => {
    try {
      expression = expression.replace(/PI/g, 'Math.PI')
      expression = expression.replace(/sin/g, 'Math.sin')
      expression = expression.replace(/cos/g, 'Math.cos')
      expression = expression.replace(/sqrt/g, 'Math.sqrt')
      expression = expression.replace(/\^/g, '**')

      return String(eval(expression))
    } catch (e) {
      return (e as Error).message
    }
  }
</script>

<template>
  <div>
    <h1>Tests</h1>
    <div v-for="test in tests" class="mb-4">
      <div class="flex items-center gap-2">
        <span v-if="evaluate(test) === jsEval(test)" class="text-green-500">PASS</span>
        <span v-else name="x" class="text-red-500">FAIL</span>
        <span class="bg-gray-200 p-1 font-mono">
          {{ test }}
        </span>
        <VaSpacer />
        <span class="bg-gray-200 p-1 font-mono">{{ evaluate(test) }}</span> == <span class="bg-gray-200 p-1 font-mono">{{ jsEval(test) }}</span>
      </div>
    </div>
  </div>
</template>