import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      manifest: {
        name: 'Cuenta Regresiva | Jefry Sánchez',
        short_name: 'Cuenta Regresiva',
        description: 'Acompáñame en la cuenta regresiva hacia una fecha muy especial este 4 de diciembre de 2026.',
        display: 'standalone',
        theme_color: '#0B1120',
        background_color: '#0B1120',
        start_url: '/countdown',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});