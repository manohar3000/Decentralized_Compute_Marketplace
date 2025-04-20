import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // default port
    open: true, // open browser on server start
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
}) 