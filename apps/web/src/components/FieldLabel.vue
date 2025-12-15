<template>
  <label class="text-sm font-medium text-slate-700">
    <span class="flex items-center justify-between gap-2">
      <span><slot /></span>
      <span v-if="hint" class="text-xs text-slate-500">{{ hint }}</span>
    </span>
  </label>
</template>

<script setup lang="ts">
defineProps<{ hint?: string }>();
</script>

