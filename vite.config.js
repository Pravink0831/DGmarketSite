/* =====================================================================
   DGmarket · Vite build configuration
   - base: './' → relative asset paths for any host sub-path.
   - Three.js split into its own vendor chunk for long-term caching.
   ===================================================================== */
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  server: { port: 5173, open: true, strictPort: false },
  preview: { port: 4173 },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2018',
    rollupOptions: {
      output: { manualChunks: { three: ['three'] } },
    },
  },
});
