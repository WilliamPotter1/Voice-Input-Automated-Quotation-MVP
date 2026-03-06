import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { healthRoutes } from './routes/health.js';
import { speechToTextRoutes } from './routes/speech-to-text.js';
import { authRoutes } from './routes/auth.js';
import { extractQuoteItemsRoutes } from './routes/extract-quote-items.js';
import { quotesRoutes } from './routes/quotes.js';
import { authPlugin } from './plugins/auth.js';

const app = Fastify({ logger: true });

function getCorsOrigin(): boolean | string | string[] {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) return true;
  return origin.split(',').map((o) => o.trim()).filter(Boolean);
}

async function main() {
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

  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(speechToTextRoutes, { prefix: '/api' });
  await app.register(extractQuoteItemsRoutes, { prefix: '/api' });
  await app.register(quotesRoutes, { prefix: '/api' });

  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Backend running at http://localhost:${port}`);
}

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
