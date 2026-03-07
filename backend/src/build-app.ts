import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { healthRoutes } from './routes/health.js';
import { speechToTextRoutes } from './routes/speech-to-text.js';
import { authRoutes } from './routes/auth.js';
import { extractQuoteItemsRoutes } from './routes/extract-quote-items.js';
import { quotesRoutes } from './routes/quotes.js';
import { authPlugin } from './plugins/auth.js';

function getCorsOrigin(): boolean | string | string[] {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) return true;
  return origin.split(',').map((o) => o.trim()).filter(Boolean);
}

/** Build and return the configured Fastify app (no listen). Used by index.ts and Vercel serverless. */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  const secret = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

  await app.register(cors, {
    origin: getCorsOrigin(),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.register(jwt, { secret });
  await app.register(authPlugin);
  await app.register(multipart, {
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  });

  app.get('/', async (_request, reply) => {
    return reply.send({
      name: 'Voice Quote API',
      version: '1.0',
      docs: 'API is under /api. Try GET /api/health',
    });
  });

  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(speechToTextRoutes, { prefix: '/api' });
  await app.register(extractQuoteItemsRoutes, { prefix: '/api' });
  await app.register(quotesRoutes, { prefix: '/api' });

  return app;
}
