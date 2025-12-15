import type { GenerateRequest, GenerateResponse } from './schema.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';
import type { ParsedSignals } from './parser.js';

type OpenAIResponsesAPIOutputText = {
  type: 'output_text';
  text: string;
};

type OpenAIResponsesAPIResponse = {
  id: string;
  model: string;
  output: Array<{
    type: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
};

function extractText(resp: OpenAIResponsesAPIResponse): string {
  const parts: string[] = [];
  for (const o of resp.output || []) {
    for (const c of o.content || []) {
      if ((c as OpenAIResponsesAPIOutputText).type === 'output_text' && c.text) parts.push(c.text);
      if (c.type === 'output_text' && c.text) parts.push(c.text);
    }
  }
  return parts.join('\n').trim();
}

export async function generateWithOpenAI(args: {
  apiKey: string;
  model: string;
  input: GenerateRequest;
  parsed: ParsedSignals;
  retryHint?: string;
}): Promise<{ rawText: string; model: string }> {
  const system = buildSystemPrompt();
  const user = buildUserPrompt(args.input, args.parsed);
  const prompt = args.retryHint
    ? `${user}\n\nIMPORTANT: Your previous output was invalid. Fix it and output ONLY valid JSON. Hint: ${args.retryHint}`
    : user;

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${args.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: args.model,
      input: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText} ${text}`.trim());
  }

  const json = (await res.json()) as OpenAIResponsesAPIResponse;
  const rawText = extractText(json);
  return { rawText, model: json.model || args.model };
}

export function safeJsonParse(rawText: string): unknown {
  const trimmed = rawText.trim();
  if (!trimmed) throw new Error('Empty model output');
  return JSON.parse(trimmed);
}

export function coerceMeta(output: GenerateResponse, input: GenerateRequest, model: string, mockMode: boolean) {
  output.meta = {
    language: input.language,
    style: input.style,
    createdAt: new Date().toISOString(),
    model,
    mockMode,
  };
  return output;
}

