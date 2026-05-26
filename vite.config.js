import { defineConfig } from 'vite'; 
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bible Reader',
        short_name: 'Bible',
        description: 'Offline Bible Reader',
        theme_color: '#6B3D2E',
        background_color: '#6B3D2E',
        icons: [
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})