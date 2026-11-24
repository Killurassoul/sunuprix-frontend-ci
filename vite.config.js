import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      // En dev, /api est relayé vers le backend FastAPI (même chemin relatif qu'en production derrière nginx).
      proxy: { '/api': env.VITE_API_TARGET || 'http://localhost:8000' },
    },
    test: { environment: 'jsdom' },
  };
});
