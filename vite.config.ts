import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.platform': JSON.stringify('browser'),
    'process.version': JSON.stringify('v16.0.0'),
    'process.stdout': JSON.stringify({ isTTY: false }),
    'process.stderr': JSON.stringify({ isTTY: false }),
  },
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
