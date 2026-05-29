import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base is injected by CI for GitHub Pages project sites (e.g. "/my-repo/").
// Defaults to "/" so `npm run dev` and root/user sites work with no config.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',   // new version installs silently on next load
      injectRegister: 'auto',       // plugin injects the SW registration for us
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Work Bucket List',
        short_name: 'Bucket List',
        description: 'Track work goals and copy a clean status report.',
        theme_color: '#2563eb',
        background_color: '#eef4ff',
        display: 'standalone',
        // start_url/scope are relative so it works under any base path.
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // precache the built app shell so it loads with zero network after first visit
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
