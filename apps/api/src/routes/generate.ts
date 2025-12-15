import type { FastifyInstance } from 'fastify';
import { generateRequestSchema } from '../lib/schema.js';
import { generateResume } from '../lib/generate.js';

export async function registerGenerateRoute(app: FastifyInstance) {
  app.post('/api/generate', async (request, reply) => {
    try {
      const input = generateRequestSchema.parse(request.body ?? {});
      const output = await generateResume(input);
      return reply.send(output);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return reply.status(400).send({
        error: 'GENERATE_FAILED',
        message,
        hint: 'If model is unavailable or schema keeps failing, try setting MOCK_MODE=true.',
      });
    }
  });
}

