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

/** Build and return the configured Fastify app. Used by src/index.ts (Vercel Fastify entrypoint). */
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
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Voice Quote API</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem;">
  <h1>Voice Quote API</h1>
  <p>Version 1.0. Backend is running.</p>
  <p><a href="/api/health">Check health: GET /api/health</a></p>
</body>
</html>`;
    return reply.type('text/html').send(html);
  });

  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(speechToTextRoutes, { prefix: '/api' });
  await app.register(extractQuoteItemsRoutes, { prefix: '/api' });
  await app.register(quotesRoutes, { prefix: '/api' });

  return app;
}
