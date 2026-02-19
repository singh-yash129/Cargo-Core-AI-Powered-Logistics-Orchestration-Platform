import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('spline-')
        }
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cargo-core-logo.png'],
      manifest: {
        name: 'Cargo-Core Logistics Platform',
        short_name: 'Cargo-Core',
        description: 'Moving What Matters - Advanced Logistics Management',
        theme_color: '#0F1115',
        background_color: '#0F1115',
        display: 'standalone',
        icons: [
          {
            src: 'cargo-core-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'cargo-core-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024 // 4MB
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
