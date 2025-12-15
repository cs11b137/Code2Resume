<template>
  <div class="w-[794px] bg-white p-10 text-slate-900">
    <div v-for="(s, idx) in sections" :key="idx">
      <h1 v-if="s.type === 'title'" class="mb-3 text-2xl font-bold tracking-tight">
        {{ s.text }}
      </h1>

      <h2 v-else-if="s.type === 'h2'" class="mt-4 border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide">
        {{ s.text }}
      </h2>

      <h3 v-else-if="s.type === 'h3'" class="mt-3 text-sm font-semibold">
        {{ s.text }}
      </h3>

      <ul v-else-if="s.type === 'bullet'" class="ml-4 list-disc">
        <li class="my-1 text-sm leading-5">{{ s.text }}</li>
      </ul>

      <div v-else-if="s.type === 'quote'" class="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        {{ s.text }}
      </div>

      <p v-else class="my-1 text-sm leading-5 text-slate-800">
        {{ s.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResumeSection } from '../lib/markdownParse';

defineProps<{ sections: ResumeSection[] }>();
</script>

