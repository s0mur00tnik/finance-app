import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          id: 'com.kitefinance.app',
          name: 'KiteFinance - Personal Finance & Daily Expenses',
          short_name: 'KiteFinance',
          description: 'KiteFinance is an Android personal finance manager and daily expense tracker. Track daily expenditures, manage recurring bills and financial tasks with calendar export, monitor monthly budget limits, and log expenses rapidly with physical phone back-tap gestures with full offline support.',
          theme_color: '#0F172A',
          background_color: '#090D16',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          categories: ['finance', 'productivity', 'utilities'],
          shortcuts: [
            {
              name: 'Add Expense',
              short_name: 'Add',
              description: 'Quickly log a new daily expense',
              url: '/?action=add',
              icons: [{ src: '/icon.svg', sizes: '192x192' }],
            },
            {
              name: 'Finance Tasks & Bills',
              short_name: 'Tasks',
              description: 'View upcoming bills and finance tasks',
              url: '/?tab=tasks',
              icons: [{ src: '/icon.svg', sizes: '192x192' }],
            },
            {
              name: 'Budget & Analytics',
              short_name: 'Budget',
              description: 'Check monthly budget and spending pace',
              url: '/?tab=analytics',
              icons: [{ src: '/icon.svg', sizes: '192x192' }],
            },
          ],
          icons: [
            {
              src: '/icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
