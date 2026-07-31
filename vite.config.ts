import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Vite builds the SPA to ./dist. Wrangler bundles the Worker (worker/index.ts) and serves ./dist
// as static assets — see wrangler.jsonc. Local end-to-end testing (Worker + Durable Objects +
// WebSockets) runs through `npm run cf-dev` (wrangler dev).
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    // In `npm run dev`, proxy API + WebSocket calls to the local Worker (npm run cf-dev).
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true, ws: true },
    },
  },
})
