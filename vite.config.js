import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standard Vite-konfiguration uden manuel chunk-splitting
// (for at undgå fejl i vendor-bundles, f.eks. med React/forwardRef)
export default defineConfig({
  base: '/Power-Abo/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/power': {
        target: 'https://www.power.dk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/power/, '/api/v2'),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Tilføj CORS headers til request
            proxyReq.setHeader('Origin', 'https://www.power.dk');
            proxyReq.setHeader('Referer', 'https://www.power.dk/');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Tilføj CORS headers til response
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'false';
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
  },
});

