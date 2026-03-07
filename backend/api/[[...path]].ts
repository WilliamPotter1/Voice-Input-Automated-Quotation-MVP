/**
 * Vercel serverless catch-all: forwards every request to Fastify with the correct path.
 * Fixes "Route POST:/ not found" when the platform forwards requests as path "/".
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../dist/app.js';

const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

let appPromise: ReturnType<typeof buildApp> | null = null;

function getApp() {
  if (!appPromise) appPromise = buildApp();
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = (req.query.path as string[] | undefined);
    const pathStr = path && path.length ? '/' + path.join('/') : '';
    const rawUrl = typeof req.url === 'string' ? req.url : '';
    const url =
      rawUrl && rawUrl !== '/'
        ? rawUrl
        : path && path.length === 1 && path[0] === ''
          ? '/'
          : '/api' + pathStr;
    const app = await getApp();
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
    const response = (await app.inject({
      method,
      url,
      headers,
      payload: body,
    })) as unknown as InjectedResponse;
    res.status(response.statusCode);
    for (const [k, v] of Object.entries(response.headers)) {
      if (v !== undefined) res.setHeader(k, v);
    }
    res.end(response.payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: String(err) });
  }
}
