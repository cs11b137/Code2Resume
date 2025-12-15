<template>
  <div class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <TabButton :active="tab === 'md'" @click="tab = 'md'">Markdown</TabButton>
        <TabButton :active="tab === 'json'" @click="tab = 'json'">JSON</TabButton>
        <TabButton :active="tab === 'preview'" @click="tab = 'preview'">Preview</TabButton>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          type="button"
          :disabled="!copyTextValue"
          @click="onCopy"
        >
          复制当前 Tab
        </button>
        <span v-if="copied" class="text-xs text-emerald-600">已复制</span>
      </div>
    </div>

    <div v-if="tab === 'md'" class="prose max-w-none">
      <pre class="max-h-[70vh] overflow-auto rounded-xl bg-slate-900 p-4 text-slate-50"><code>{{ markdown }}</code></pre>
    </div>
    <div v-else-if="tab === 'json'" class="prose max-w-none">
      <pre class="max-h-[70vh] overflow-auto rounded-xl bg-slate-900 p-4 text-slate-50"><code>{{ jsonPretty }}</code></pre>
    </div>
    <div v-else class="max-h-[70vh] overflow-auto rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div class="origin-top-left scale-[0.78]">
        <ResumeModule :sections="resumeSections" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TabButton from './TabButton.vue';
import { copyText } from '../lib/clipboard';
import ResumeModule from './ResumeModule.vue';
import type { ResumeSection } from '../lib/markdownParse';

const props = defineProps<{ markdown: string; jsonPretty: string; resumeSections: ResumeSection[] }>();

const tab = ref<'md' | 'json' | 'preview'>('md');
const copied = ref(false);

const copyTextValue = computed(() => {
  if (tab.value === 'md') return props.markdown;
  if (tab.value === 'json') return props.jsonPretty;
  return '';
});

async function onCopy() {
  copied.value = false;
  await copyText(copyTextValue.value || '');
  copied.value = true;
  window.setTimeout(() => (copied.value = false), 1200);
}

watch(
  () => props.markdown,
  () => {
    copied.value = false;
  },
);
</script>
