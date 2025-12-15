import type { FastifyInstance } from 'fastify';
import { fetchMaterialRequestSchema } from '../lib/schema.js';
import { fetchGitHubMaterial } from '../lib/github.js';

export async function registerFetchMaterialRoute(app: FastifyInstance) {
  app.post('/api/fetch-material', async (request, reply) => {
    try {
      const input = fetchMaterialRequestSchema.parse(request.body ?? {});
      const out = await fetchGitHubMaterial(input);
      return reply.send(out);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return reply.status(400).send({
        error: 'FETCH_MATERIAL_FAILED',
        message,
        hint: 'Check repo format (owner/name), token scopes, and rate limits. For private repos, provide a token with repo access.',
      });
    }
  });
}

