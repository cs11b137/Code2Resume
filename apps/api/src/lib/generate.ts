import { generateResponseSchema, type GenerateRequest, type GenerateResponse } from './schema.js';
import { parseMaterial } from './parser.js';
import { generateMock } from './mock.js';
import { coerceMeta, generateWithOpenAI, safeJsonParse } from './openai.js';

function envBool(name: string, defaultValue: boolean) {
  const v = process.env[name];
  if (v == null) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

export async function generateResume(input: GenerateRequest): Promise<GenerateResponse> {
  const parsed = parseMaterial(input.material);
  const mockMode = envBool('MOCK_MODE', false);
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  if (mockMode) {
    const out = generateMock(input, parsed, model);
    return generateResponseSchema.parse(out);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Set it or enable MOCK_MODE=true.');
  }

  let lastError: unknown = undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { rawText, model: usedModel } = await generateWithOpenAI({
        apiKey,
        model,
        input,
        parsed,
        retryHint: attempt === 1 ? String(lastError || 'schema validation failed') : undefined,
      });

      const parsedJson = safeJsonParse(rawText);
      const validated = generateResponseSchema.parse(parsedJson) as GenerateResponse;
      return coerceMeta(validated, input, usedModel, false);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`Model output validation failed after retry: ${String(lastError)}`);
}

