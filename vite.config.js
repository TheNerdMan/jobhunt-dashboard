import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // hex-color-picker is a native custom element from vanilla-colorful
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })
  ],
  base: process.env.NODE_ENV === 'production' ? '/jobhunt-dashboard/' : '/',
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true
  }
})