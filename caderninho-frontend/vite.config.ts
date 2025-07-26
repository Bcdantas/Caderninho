import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { 
    host: '127.0.0.1', // Força o Vite a usar IPv4 para localhost
    port: 5173,      // Opcional, se você quiser garantir a porta
  }
})