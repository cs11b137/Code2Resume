<template>
  <button
    class="rounded-lg px-3 py-1.5 text-sm transition"
    :class="
      active
        ? 'bg-slate-900 text-white'
        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
    "
    type="button"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>();
defineEmits<{ (e: 'click'): void }>();
</script>

