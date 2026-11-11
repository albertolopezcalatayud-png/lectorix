import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
// CAP_BUILD=1 builds the web app that is packaged inside the Android app (Capacitor):
// served from the app itself, so base '/' and no service worker.
const CAP = process.env.CAP_BUILD === '1';

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.2') },
  base: CAP ? '/' : '/lectorix/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      disable: CAP,
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'sounds/*.mp3'],
      manifest: {
        name: 'Lectorix',
        short_name: 'Lectorix',
        description: 'Ejercicios de lectoescritura para niños con dislexia',
        start_url: '/lectorix/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#8B5CF6',
        background_color: '#F7F5FF',
        lang: 'es',
        categories: ['education', 'kids'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        importScripts: ['push-sw.js'],
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        globIgnores: ['tesseract/**'],
        runtimeCaching: [
          {
            // Spelling word lists: downloaded the first time "Write and listen" checks a text, then offline
            urlPattern: /\/dict\/[a-z]+\.fc\.gz$/,
            handler: 'CacheFirst',
            options: { cacheName: 'lectorix-dict', expiration: { maxEntries: 6 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
