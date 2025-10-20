import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
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
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

