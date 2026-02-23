import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/kelime-oyunu-15e75abb/', // Repo adın buysa dokunma, farklıysa düzelt.
})
