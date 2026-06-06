import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiProxyPlugin } from './server/plugin';

export default defineConfig({
  plugins: [react(), apiProxyPlugin()],
  server: { port: 5173, host: '0.0.0.0', allowedHosts: ['asx.ml1.app'] },
});
