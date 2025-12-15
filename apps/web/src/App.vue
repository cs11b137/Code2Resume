<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-slate-900"></div>
          <div>
            <div class="text-lg font-semibold">Code2Resume</div>
            <div class="text-xs text-slate-500">repo materials → resume highlights (STAR)</div>
          </div>
        </div>
        <a
          class="text-sm text-slate-600 hover:text-slate-900"
          href="https://localhost"
          @click.prevent
          >MVP</a
        >
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <HomePage />
    </main>

    <footer class="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500">
      API: <code class="rounded bg-slate-100 px-1 py-0.5">POST /api/generate</code>
    </footer>
  </div>
</template>

<script setup lang="ts">
import HomePage from './pages/HomePage.vue';
</script>

