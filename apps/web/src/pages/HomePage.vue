<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <section class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div class="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold">输入</h2>
          <p class="text-sm text-slate-500">粘贴 commit log / PR 描述 / release notes / 项目介绍文本</p>
        </div>
        <button
          class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
          type="button"
          @click="fillSample"
        >
          一键填充示例
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div class="mb-2 text-sm font-semibold text-slate-800">从 GitHub 拉取材料（可选）</div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="space-y-2">
              <FieldLabel hint="owner/name 或 URL">Repo</FieldLabel>
              <input
                v-model.trim="github.repo"
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="例如：vercel/next.js"
              />
            </div>
            <div class="space-y-2">
              <FieldLabel hint="仅后端使用，不落库">GitHub Token</FieldLabel>
              <input
                v-model="github.token"
                type="password"
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="可留空（公开仓库）"
              />
            </div>
          </div>
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="space-y-2">
              <FieldLabel>Commit 条数</FieldLabel>
              <input
                v-model.number="github.commitCount"
                type="number"
                min="1"
                max="50"
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div class="space-y-2">
              <FieldLabel>PR 条数</FieldLabel>
              <input
                v-model.number="github.prCount"
                type="number"
                min="0"
                max="50"
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div class="flex items-end">
              <button
                class="w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
                type="button"
                :disabled="loading || githubLoading || !github.repo"
                @click="onFetchFromGitHub"
              >
                {{ githubLoading ? '拉取中…' : '从 GitHub 拉取并填充' }}
              </button>
            </div>
          </div>
          <div v-if="githubInfo" class="mt-2 text-xs text-slate-600">
            已拉取 {{ githubInfo.repo }}：commits={{ githubInfo.counts.commits }} prs={{ githubInfo.counts.prs }}
          </div>
        </div>

        <div class="space-y-2">
          <FieldLabel hint="必填">项目名称</FieldLabel>
          <input
            v-model.trim="form.projectName"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            placeholder="例如：Code2Resume"
            required
          />
        </div>

        <div class="space-y-2">
          <FieldLabel hint="可选">技术栈</FieldLabel>
          <input
            v-model.trim="form.techStack"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            placeholder="例如：Vue3/TypeScript/Fastify/Tailwind"
          />
        </div>

        <div class="space-y-2">
          <FieldLabel hint="必填，多行">原始材料文本</FieldLabel>
          <textarea
            v-model="form.material"
            class="min-h-[240px] w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-5 focus:border-slate-400 focus:outline-none"
            placeholder="粘贴材料…"
            required
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="space-y-2">
            <FieldLabel>输出条数</FieldLabel>
            <input
              v-model.number="form.count"
              type="number"
              min="1"
              max="12"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div class="space-y-2">
            <FieldLabel>语言</FieldLabel>
            <select
              v-model="form.language"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
          <div class="space-y-2">
            <FieldLabel>输出风格</FieldLabel>
            <select
              v-model="form.style"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="aggressive">aggressive</option>
              <option value="balanced">balanced</option>
              <option value="conservative">conservative</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? '生成中…' : '生成' }}
          </button>
          <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        </div>

        <div v-if="errorHint" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div class="font-medium">错误详情</div>
          <div class="mt-1 whitespace-pre-wrap">{{ errorHint }}</div>
        </div>
      </form>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold">输出</h2>
          <p class="text-sm text-slate-500">右侧支持 Markdown/JSON 预览与复制</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
            type="button"
            :disabled="!out || pdfLoading"
            @click="onExportPdf"
          >
            {{ pdfLoading ? '导出中…' : '导出 PDF' }}
          </button>
          <div v-if="out" class="text-xs text-slate-500">
            {{ out.meta.language }} · {{ out.meta.style }} · {{ out.meta.model }} · mock={{ String(out.meta.mockMode) }}
          </div>
        </div>
      </div>

      <OutputPanel v-if="out" :markdown="markdown" :jsonPretty="jsonPretty" :resumeSections="resumeSections" />
      <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        还没有输出。点击“生成”开始。
      </div>

      <div v-if="out" class="fixed left-[-10000px] top-0">
        <div ref="pdfRoot" class="inline-block shadow">
          <ResumeModule :sections="resumeSections" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import FieldLabel from '../components/FieldLabel.vue';
import OutputPanel from '../components/OutputPanel.vue';
import ResumeModule from '../components/ResumeModule.vue';
import { fetchMaterial, generate } from '../lib/api';
import { toMarkdown } from '../lib/markdown';
import { parseMarkdownToSections } from '../lib/markdownParse';
import { exportElementToPdf } from '../lib/pdf';
import type {
  ApiErrorBody,
  FetchMaterialResponseBody,
  GenerateRequestBody,
  GenerateResponseBody,
} from '../types/api';

const loading = ref(false);
const error = ref<string | null>(null);
const errorHint = ref<string | null>(null);
const out = ref<GenerateResponseBody | null>(null);
const githubLoading = ref(false);
const githubInfo = ref<FetchMaterialResponseBody | null>(null);
const pdfLoading = ref(false);
const pdfRoot = ref<HTMLElement | null>(null);

const form = ref<Required<GenerateRequestBody>>({
  projectName: 'Code2Resume',
  techStack: 'Vue3/TypeScript/Fastify/Tailwind',
  material: '',
  count: 6,
  language: 'zh',
  style: 'balanced',
});

const github = ref({
  repo: '',
  token: '',
  commitCount: 20,
  prCount: 20,
});

const SAMPLE = `feat: add /api/generate endpoint with schema validation
perf: reduce response time by caching parsed materials
fix: handle empty input and provide user-friendly errors
dx: add eslint+prettier and CI checks
security: tighten CORS and sanitize model output
release: v0.1.0 initial MVP`;

function fillSample() {
  form.value.material = SAMPLE;
}

const jsonPretty = computed(() => (out.value ? JSON.stringify(out.value, null, 2) : ''));
const markdown = computed(() => (out.value ? toMarkdown(form.value.projectName, out.value) : ''));
const resumeSections = computed(() => parseMarkdownToSections(markdown.value));

async function onExportPdf() {
  if (!out.value || !pdfRoot.value) return;
  pdfLoading.value = true;
  error.value = null;
  errorHint.value = null;
  try {
    const filename = `${form.value.projectName}-resume.pdf`;
    await exportElementToPdf({ element: pdfRoot.value, filename });
  } catch (e: any) {
    error.value = e?.message || '导出 PDF 失败';
    errorHint.value = '建议：尝试更短的内容；或检查浏览器是否禁用 canvas / 下载。';
  } finally {
    pdfLoading.value = false;
  }
}

async function onFetchFromGitHub() {
  githubLoading.value = true;
  error.value = null;
  errorHint.value = null;
  githubInfo.value = null;
  try {
    const res = await fetchMaterial({
      repo: github.value.repo,
      token: github.value.token || undefined,
      commitCount: github.value.commitCount,
      prCount: github.value.prCount,
    });
    githubInfo.value = res;
    form.value.material = res.material;
  } catch (e: any) {
    const data = e?.response?.data as ApiErrorBody | undefined;
    error.value = data?.message || e?.message || 'GitHub 拉取失败';
    errorHint.value =
      data?.hint || (data ? JSON.stringify(data, null, 2) : '建议检查 token scopes / repo 格式 / rate limit');
  } finally {
    githubLoading.value = false;
  }
}

async function onSubmit() {
  loading.value = true;
  error.value = null;
  errorHint.value = null;
  out.value = null;

  try {
    const payload: GenerateRequestBody = {
      projectName: form.value.projectName,
      techStack: form.value.techStack || undefined,
      material: form.value.material,
      count: form.value.count,
      language: form.value.language,
      style: form.value.style,
    };
    out.value = await generate(payload);
  } catch (e: any) {
    const data = e?.response?.data as ApiErrorBody | undefined;
    error.value = data?.message || e?.message || '请求失败';
    errorHint.value = data?.hint || (data ? JSON.stringify(data, null, 2) : null);
  } finally {
    loading.value = false;
  }
}
</script>
