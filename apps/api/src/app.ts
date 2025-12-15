import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerGenerateRoute } from './routes/generate.js';
import { registerFetchMaterialRoute } from './routes/fetchMaterial.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  const origin = process.env.CORS_ORIGIN || true;
  await app.register(cors, { origin });

  await registerGenerateRoute(app);
  await registerFetchMaterialRoute(app);

  app.get('/health', async () => ({ ok: true }));

  return app;
}
