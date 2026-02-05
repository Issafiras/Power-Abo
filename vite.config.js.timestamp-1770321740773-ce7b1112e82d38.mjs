// vite.config.js
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  base: "/Power-Abo/",
  plugins: [react()],
  server: {
    port: 3e3,
    open: true,
    proxy: {
      "/api/power": {
        target: "https://www.power.dk",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/power/, "/api/v2"),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.error("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("Origin", "https://www.power.dk");
            proxyReq.setHeader("Referer", "https://www.power.dk/");
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            proxyRes.headers["Access-Control-Allow-Origin"] = "*";
            proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
            proxyRes.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
            proxyRes.headers["Access-Control-Allow-Credentials"] = "false";
          });
        }
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,
    cssCodeSplit: true,
    target: "es2015",
    chunkSizeWarningLimit: 600,
    // Optimeret code-splitting for bedre caching og mindre initiel load
    rollupOptions: {
      output: {
        // Split vendors og app kode
        manualChunks: (id) => {
          if (id.includes("/data/plans") || id.includes("/data/streamingServices")) {
            return "app-data";
          }
          if (id.includes("/utils/calculations/") || id.includes("/utils/powerApi")) {
            return "app-utils";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        // Optimerede filnavne for bedre caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    }
  },
  // Optimer dependencies der skal pre-bundles
  optimizeDeps: {
    include: ["react", "react-dom"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIE9wdGltZXJldCBWaXRlLWtvbmZpZ3VyYXRpb24gbWVkIGNvZGUtc3BsaXR0aW5nXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnL1Bvd2VyLUFiby8nLFxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGkvcG93ZXInOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vd3d3LnBvd2VyLmRrJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvcG93ZXIvLCAnL2FwaS92MicpLFxuICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb3h5IGVycm9yOicsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIC8vIFRpbGZcdTAwRjhqIENPUlMgaGVhZGVycyB0aWwgcmVxdWVzdFxuICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdPcmlnaW4nLCAnaHR0cHM6Ly93d3cucG93ZXIuZGsnKTtcbiAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignUmVmZXJlcicsICdodHRwczovL3d3dy5wb3dlci5kay8nKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgLy8gVGlsZlx1MDBGOGogQ09SUyBoZWFkZXJzIHRpbCByZXNwb25zZVxuICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSAnKic7XG4gICAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJ10gPSAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgT1BUSU9OUyc7XG4gICAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJ10gPSAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoJztcbiAgICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJ10gPSAnZmFsc2UnO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgY3NzTWluaWZ5OiB0cnVlLFxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNjAwLFxuICAgIC8vIE9wdGltZXJldCBjb2RlLXNwbGl0dGluZyBmb3IgYmVkcmUgY2FjaGluZyBvZyBtaW5kcmUgaW5pdGllbCBsb2FkXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFNwbGl0IHZlbmRvcnMgb2cgYXBwIGtvZGVcbiAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcbiAgICAgICAgICAvLyBEYXRhIGZpbGVyIC0gcGxhbmVyIG9nIHN0cmVhbWluZyBzZXJ2aWNlc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL2RhdGEvcGxhbnMnKSB8fCBpZC5pbmNsdWRlcygnL2RhdGEvc3RyZWFtaW5nU2VydmljZXMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdhcHAtZGF0YSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFV0aWxpdGllcyBvZyBiZXJlZ25pbmdlclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3V0aWxzL2NhbGN1bGF0aW9ucy8nKSB8fCBpZC5pbmNsdWRlcygnL3V0aWxzL3Bvd2VyQXBpJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnYXBwLXV0aWxzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQWx0IGZyYSBub2RlX21vZHVsZXMgcnlnZXIgaSBcdTAwRTluIHZlbmRvciBjaHVuayBmb3IgYXQgdW5kZ1x1MDBFNSBpbml0LXByb2JsZW1lclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIE9wdGltZXJlZGUgZmlsbmF2bmUgZm9yIGJlZHJlIGNhY2hpbmdcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJ1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgLy8gT3B0aW1lciBkZXBlbmRlbmNpZXMgZGVyIHNrYWwgcHJlLWJ1bmRsZXNcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nXVxuICB9XG59KTtcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLGNBQWM7QUFBQSxRQUNaLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxpQkFBaUIsU0FBUztBQUFBLFFBQzFELFFBQVE7QUFBQSxRQUNSLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsZ0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxNQUFNLFNBQVM7QUFDckMsb0JBQVEsTUFBTSxnQkFBZ0IsR0FBRztBQUFBLFVBQ25DLENBQUM7QUFDRCxnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUU1QyxxQkFBUyxVQUFVLFVBQVUsc0JBQXNCO0FBQ25ELHFCQUFTLFVBQVUsV0FBVyx1QkFBdUI7QUFBQSxVQUN2RCxDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFFNUMscUJBQVMsUUFBUSw2QkFBNkIsSUFBSTtBQUNsRCxxQkFBUyxRQUFRLDhCQUE4QixJQUFJO0FBQ25ELHFCQUFTLFFBQVEsOEJBQThCLElBQUk7QUFDbkQscUJBQVMsUUFBUSxrQ0FBa0MsSUFBSTtBQUFBLFVBQ3pELENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxjQUFjO0FBQUEsSUFDZCxRQUFRO0FBQUEsSUFDUix1QkFBdUI7QUFBQTtBQUFBLElBRXZCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBLFFBRU4sY0FBYyxDQUFDLE9BQU87QUFFcEIsY0FBSSxHQUFHLFNBQVMsYUFBYSxLQUFLLEdBQUcsU0FBUyx5QkFBeUIsR0FBRztBQUN4RSxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxjQUFJLEdBQUcsU0FBUyxzQkFBc0IsS0FBSyxHQUFHLFNBQVMsaUJBQWlCLEdBQUc7QUFDekUsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQTtBQUFBLFFBRUEsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxXQUFXO0FBQUEsRUFDaEM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
