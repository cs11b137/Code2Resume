import type { GenerateRequest } from './schema.js';
import type { ParsedSignals } from './parser.js';

export const RESPONSE_JSON_SCHEMA_STRING = `{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "bullets",
    "stars",
    "skills",
    "metrics",
    "risks",
    "assumptions",
    "missing_info_questions",
    "meta"
  ],
  "properties": {
    "bullets": { "type": "array", "items": { "type": "string" } },
    "stars": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["situation", "task", "action", "result"],
        "properties": {
          "situation": { "type": "string" },
          "task": { "type": "string" },
          "action": { "type": "string" },
          "result": { "type": "string" }
        }
      }
    },
    "skills": { "type": "array", "items": { "type": "string" } },
    "metrics": { "type": "array", "items": { "type": "string" } },
    "risks": { "type": "array", "items": { "type": "string" } },
    "assumptions": { "type": "array", "items": { "type": "string" } },
    "missing_info_questions": { "type": "array", "items": { "type": "string" } },
    "meta": {
      "type": "object",
      "additionalProperties": false,
      "required": ["language", "style", "createdAt", "model", "mockMode"],
      "properties": {
        "language": { "type": "string", "enum": ["zh", "en"] },
        "style": { "type": "string", "enum": ["aggressive", "balanced", "conservative"] },
        "createdAt": { "type": "string" },
        "model": { "type": "string" },
        "mockMode": { "type": "boolean" }
      }
    }
  }
}`;

export function buildSystemPrompt() {
  return [
    'You are Code2Resume, a generator that converts repository materials into resume highlights.',
    'STRICT OUTPUT RULES:',
    '- Output JSON only. No markdown. No explanations. No code fences.',
    '- The JSON must strictly conform to the provided JSON Schema.',
    '- Do not omit any required fields; never output extra fields.',
    '- All array fields must exist (can be empty, but prefer non-empty).',
    '',
    'CONTENT RULES:',
    '- bullets: each starts with a strong verb; include tech stack; quantify if possible.',
    '- If material lacks numbers, use conservative wording and put missing numeric assumptions into assumptions + missing_info_questions.',
    '- Provide STAR items aligned with the same bullets (S/T/A/R).',
    '- Extract skills and metrics from input and materials; keep them resume-friendly.',
    '',
    `JSON Schema:\n${RESPONSE_JSON_SCHEMA_STRING}`,
  ].join('\n');
}

export function buildUserPrompt(input: GenerateRequest, parsed: ParsedSignals) {
  const techStackHint = [input.techStack || '', ...parsed.extractedTech].filter(Boolean).join(', ');
  const signalSummary = (['feat', 'perf', 'fix', 'security', 'dx'] as const)
    .map((k) => `- ${k}: ${parsed.byType[k].slice(0, 12).join(' | ')}`)
    .join('\n');

  return [
    'Generate resume-ready outputs for the project.',
    `language=${input.language}`,
    `style=${input.style}`,
    `count=${input.count}`,
    `projectName=${input.projectName}`,
    `techStackHint=${techStackHint || '(none provided)'}`,
    '',
    'Signals (already parsed from materials):',
    signalSummary,
    '',
    'Raw materials (truncated if long):',
    input.material.slice(0, 6000),
    '',
    'Return JSON only.',
  ].join('\n');
}

