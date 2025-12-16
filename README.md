# Code2Resume (MVP)

Turn user-provided repository materials (commit logs / PR descriptions / release notes / project intro text) into **resume-ready project highlights** in the STAR format, outputting structured **JSON + Markdown**, with a visual UI and one-click copy.

## Monorepo Structure

- `apps/api`: Node.js + TypeScript + Fastify backend
- `apps/web`: Vue3 + TypeScript + Vite frontend

## Environment Variables

Copy and edit the root environment file:

```bash
cp .env.example .env
```

Key variables:
- `MOCK_MODE=true`: Don’t call the model; return stable mock data (recommended to get things running first)
- `OPENAI_API_KEY`: Required when `MOCK_MODE` is disabled
- `CORS_ORIGIN`: Allowed frontend origin (default `http://localhost:5173`)
- `PORT`: Backend port (default `8787`)

Frontend (optional):
- `VITE_API_BASE_URL=http://localhost:8787`

## Local Development

Requires `pnpm` (Node 18+).

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:5173  
- API: http://localhost:8787/health  

## Mock Mode

Set in `.env`:

```bash
MOCK_MODE=true
```

The backend will generate “reasonable-looking” results based on your input, but will **not** call any model—great for local development and demos.

## API

### `POST /api/generate`

Request body:

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

Successful responses follow a fixed schema (fields must not be missing):
- `bullets: string[]`
- `stars: { situation; task; action; result }[]`
- `skills: string[]`
- `metrics: string[]`
- `risks: string[]`
- `assumptions: string[]`
- `missing_info_questions: string[]`
- `meta: { language; style; createdAt; model; mockMode }`

Failure response example:

```json
{
  "error": "GENERATE_FAILED",
  "message": "OPENAI_API_KEY is not set. Set it or enable MOCK_MODE=true.",
  "hint": "If model is unavailable or schema keeps failing, try setting MOCK_MODE=true."
}
```

### `POST /api/fetch-material`

Fetch the latest N commit messages / PR titles + bodies from the GitHub API, then concatenate them into a single `material` string for generation.

Request body:

```json
{
  "repo": "owner/name",
  "token": "ghp_xxx (optional)",
  "commitCount": 20,
  "prCount": 20
}
```

Response body:

```json
{
  "repo": "owner/name",
  "material": "GitHub Repo: ...\n\ncommit log:\n- ...\n\nPRs:\n- ...\n",
  "counts": { "commits": 20, "prs": 20 },
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

Notes:
- `token` is used **only** on the backend and is not stored; for public repos you can omit it.
- If the model is unavailable or schema validation fails, enable `MOCK_MODE=true` to run through the full flow first.

## Sample Input & Output

- Input: `sample-input.txt`
- Output: `sample-output.json`

## Testing

```bash
pnpm --filter @code2resume/api test
```

This test calls `POST /api/generate` with `MOCK_MODE=true` and validates the response schema using Zod.

## Export PDF

The frontend supports rendering the generated Markdown as a resume project module and exporting it to PDF (based on `html2canvas` + `jspdf`).
