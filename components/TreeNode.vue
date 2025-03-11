<script setup lang="ts">
  type TreeViewNode = { id: number, label: string, children: TreeViewNode[] | null }


  const props = defineProps<{
    node: TreeViewNode,
  }>()
</script>

<template>
  <div>
    <p>{{ node.label }}</p>

    <div class="ml-2 border-l-2 border-gray-300 border-spacing-1 border-dotted pl-2">
      <div v-for="node in node.children">
        <TreeNode :node="node" />
      </div>
    </div>
  </div>
</template>