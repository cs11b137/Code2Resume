import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { generateResponseSchema } from '../src/lib/schema.js';

describe('POST /api/generate', () => {
  it('returns schema-valid response in mock mode', async () => {
    process.env.MOCK_MODE = 'true';
    const app = await buildApp();

    const res = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: {
        projectName: 'Code2Resume',
        techStack: 'Vue3/TypeScript/Fastify',
        material: 'feat: add generate endpoint\nperf: reduce latency by caching\nfix: handle null input',
        count: 4,
        language: 'zh',
        style: 'balanced',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    const parsed = generateResponseSchema.parse(body);
    expect(parsed.bullets.length).toBeGreaterThan(0);
  });
});

