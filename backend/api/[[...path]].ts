/**
 * Vercel serverless catch-all: forwards every request to the Fastify app.
 * Static import lets Vercel's bundler trace all dependencies (fastify, prisma, etc.).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../src/build-app.js';

const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

let appPromise: ReturnType<typeof buildApp> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = buildApp();
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawPath = req.query.path;
    const pathSegments = Array.isArray(rawPath)
      ? rawPath
      : typeof rawPath === 'string' && rawPath
        ? rawPath.split('/').filter(Boolean)
        : undefined;
    const pathStr = pathSegments && pathSegments.length ? '/' + pathSegments.join('/') : '';
    const rawUrl = typeof req.url === 'string' ? req.url : '';

    let url: string;
    if (pathSegments && pathSegments.length > 0) {
      url = '/api' + pathStr;
      const q = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : '';
      if (q) url += q;
    } else if (rawUrl === '/' || rawUrl === '/api' || rawUrl === '/api/' || !rawUrl) {
      url = '/';
    } else {
      url = rawUrl;
    }

    const app = await getApp();
    const method: HttpMethod =
      req.method && HTTP_METHODS.includes(req.method as HttpMethod) ? (req.method as HttpMethod) : 'GET';

    const headers: Record<string, string> = {};
    if (req.headers) {
      for (const [k, v] of Object.entries(req.headers)) {
        if (v !== undefined && v !== null && k.toLowerCase() !== 'host') {
          headers[k] = Array.isArray(v) ? v.join(', ') : String(v);
        }
      }
    }

    const response = await app.inject({
      method,
      url,
      headers,
      ...(req.body !== undefined && req.body !== null ? { payload: JSON.stringify(req.body) } : {}),
    });

    res.status(response.statusCode);
    for (const [k, v] of Object.entries(response.headers)) {
      if (v !== undefined) res.setHeader(k, v);
    }
    res.end(response.payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('Serverless handler error:', message, stack);
    res.status(500).json({
      message: 'Internal server error',
      error: message,
      ...(process.env.VERCEL_ENV === 'development' && stack ? { stack } : {}),
    });
  }
}
