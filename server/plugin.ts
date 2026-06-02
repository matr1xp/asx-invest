import type { Plugin } from 'vite';
import { apiMiddleware } from './middleware';

export function apiProxyPlugin(): Plugin {
  return {
    name: 'asx-api-proxy',
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}
