import type { Connect } from 'vite';
import type { IncomingMessage } from 'node:http';
import { routeApi, sendJson } from './handlers';

export { handleQuotes, handleHistory, handlePriceOnDate } from './handlers';

export const apiMiddleware: Connect.NextHandleFunction = (req: IncomingMessage, res, next) => {
  const url = new URL(req.url ?? '', 'http://localhost');
  if (!routeApi(url, req, res as Parameters<typeof sendJson>[0])) return next();
};
