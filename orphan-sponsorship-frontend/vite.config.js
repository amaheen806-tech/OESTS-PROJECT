import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This is the basic Vite configuration for our React app.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
