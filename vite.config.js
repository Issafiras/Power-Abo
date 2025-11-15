import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
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
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React vendor chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Large component chunks
          if (id.includes('components/StreamingSelector')) {
            return 'streaming-selector';
          }
          if (id.includes('components/ComparisonPanel')) {
            return 'comparison-panel';
          }
          if (id.includes('components/Cart')) {
            return 'cart';
          }
          if (id.includes('components/PlanCard')) {
            return 'plan-card';
          }
          // Other vendor chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkSizeWarningLimit: 1000,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Performance optimizations
    target: 'es2015',
    chunkSizeWarningLimit: 1000
  }
}})

