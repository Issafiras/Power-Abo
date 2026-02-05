import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Optimeret Vite-konfiguration med code-splitting
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
    chunkSizeWarningLimit: 600,
    // Optimeret code-splitting for bedre caching og mindre initiel load
    rollupOptions: {
      output: {
        // Split vendors og app kode
        manualChunks: (id) => {
          // Data filer - planer og streaming services
          if (id.includes('/data/plans') || id.includes('/data/streamingServices')) {
            return 'app-data';
          }
          // Utilities og beregninger
          if (id.includes('/utils/calculations/') || id.includes('/utils/powerApi')) {
            return 'app-utils';
          }
          // Alt fra node_modules ryger i én vendor chunk for at undgå init-problemer
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        },
        // Optimerede filnavne for bedre caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // Optimer dependencies der skal pre-bundles
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});

