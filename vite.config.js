import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo.png', 'bg-today.jpg', 'bg-progress.jpg', 'bg-history.jpg'],
      manifest: {
        name: 'FitTrack',
        short_name: 'FitTrack',
        description: 'Track · Improve · Dominate',
        theme_color: '#0ea5e9',
        background_color: '#0a0e1a',
        display: 'standalone',
        icons: [
          { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
          { src: '/favicon.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}']
      }
    })
  ]
})
