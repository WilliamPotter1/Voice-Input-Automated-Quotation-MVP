import Fastify from 'fastify';
import { buildApp } from './build-app.js';

const app = await buildApp();
export default app;
