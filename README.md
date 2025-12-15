# Code2Resume (MVP)

把用户提供的仓库材料（commit log / PR 描述 / release notes / 项目介绍文本）转换为**可用于简历的项目亮点**（STAR 风格），输出结构化 JSON + Markdown，并提供可视化页面与复制功能。

## Monorepo 结构

- `apps/api`: Node.js + TypeScript + Fastify 后端
- `apps/web`: Vue3 + TypeScript + Vite 前端

## 环境变量

复制并修改根目录环境变量：

```bash
cp .env.example .env
```

关键变量：
- `MOCK_MODE=true`：不调用模型，返回稳定 mock 数据（推荐先用它跑通）
- `OPENAI_API_KEY`：关闭 `MOCK_MODE` 时需要
- `CORS_ORIGIN`：允许的前端 origin（默认 `http://localhost:5173`）
- `PORT`：后端端口（默认 `8787`）

前端可选：
- `VITE_API_BASE_URL=http://localhost:8787`

## 本地启动

需要 `pnpm`（Node 18+）。

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:8787/health

## Mock 模式

`.env` 中设置：

```bash
MOCK_MODE=true
```

后端会根据你的输入生成“看起来合理”的结果，但不会调用模型，适合本地开发与演示。

## API

### `POST /api/generate`

请求体：

```json
{
  "projectName": "Code2Resume",
  "techStack": "Vue3/TypeScript/Fastify/Tailwind",
  "material": "feat: ...\nfix: ...",
  "count": 6,
  "language": "zh",
  "style": "balanced"
}
```

成功响应固定 schema（字段不可缺失）：
- `bullets: string[]`
- `stars: { situation; task; action; result }[]`
- `skills: string[]`
- `metrics: string[]`
- `risks: string[]`
- `assumptions: string[]`
- `missing_info_questions: string[]`
- `meta: { language; style; createdAt; model; mockMode }`

失败响应示例：

```json
{
  "error": "GENERATE_FAILED",
  "message": "OPENAI_API_KEY is not set. Set it or enable MOCK_MODE=true.",
  "hint": "If model is unavailable or schema keeps failing, try setting MOCK_MODE=true."
}
```

### `POST /api/fetch-material`

从 GitHub API 拉取最近 N 条 commit message / PR title+body，并拼接成 `material` 文本，供后续生成。

请求体：

```json
{
  "repo": "owner/name",
  "token": "ghp_xxx (optional)",
  "commitCount": 20,
  "prCount": 20
}
```

响应体：

```json
{
  "repo": "owner/name",
  "material": "GitHub Repo: ...\n\ncommit log:\n- ...\n\nPRs:\n- ...\n",
  "counts": { "commits": 20, "prs": 20 },
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

说明：
- `token` 只在后端使用，不落库；公开仓库可不填。
- 若遇到模型不可用或 schema 失败，建议开启 `MOCK_MODE=true` 先跑通流程。

## 示例材料与输出

- 输入：`sample-input.txt`
- 输出：`sample-output.json`

## 测试

```bash
pnpm --filter @code2resume/api test
```

该测试会在 `MOCK_MODE=true` 下调用 `POST /api/generate` 并使用 zod 做 schema 校验。

## 导出 PDF

前端支持将生成的 Markdown 渲染为简历项目模块并导出 PDF（基于 `html2canvas` + `jspdf`）。
