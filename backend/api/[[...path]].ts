/**
 * Vercel serverless catch-all: forwards all requests to Fastify with the correct path.
 * Ensures / and /api/* work when the backend is deployed on Vercel.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

let appPromise: Promise<unknown> | null = null;

async function getAppModule() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, '..', 'dist', 'build-app.js');
  const appUrl = pathToFileURL(distPath).href;
  return import(appUrl);
}

async function getApp() {
  if (!appPromise) {
    appPromise = getAppModule().then((m: { buildApp: () => Promise<unknown> }) => m.buildApp());
  }
  return appPromise;
}

function readBody(req: VercelRequest): Promise<Buffer | undefined> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
    req.on('error', reject);
  });
}

interface InjectedResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  payload: string;
}

interface FastifyInject {
  inject(opts: Record<string, unknown>): Promise<InjectedResponse>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pathSegments = (req.query.path as string[] | undefined);
    const pathStr = pathSegments && pathSegments.length ? '/' + pathSegments.join('/') : '';
    const rawUrl = typeof req.url === 'string' ? req.url : '';
    // Build URL for Fastify: prefer pathSegments so /api/auth/login always works even if req.url is wrong
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
    const app = (await getApp()) as FastifyInject;
    const body = await readBody(req);
    const headers: Record<string, string> = {};
    if (req.headers) {
      for (const [k, v] of Object.entries(req.headers)) {
        if (v !== undefined && v !== null && k.toLowerCase() !== 'host') {
          headers[k] = Array.isArray(v) ? v.join(', ') : String(v);
        }
      }
    }
    const method: HttpMethod =
      req.method && HTTP_METHODS.includes(req.method as HttpMethod) ? (req.method as HttpMethod) : 'GET';
    const response = await app.inject({
      method,
      url,
      headers,
      payload: body,
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
