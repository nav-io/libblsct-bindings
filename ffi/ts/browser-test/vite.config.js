import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Point to the local navio-blsct package
      'navio-blsct': resolve(__dirname, '../dist/browser/index.browser.js')
    }
  },
  optimizeDeps: {
    // Don't pre-bundle our local package so we can test the actual files
    exclude: ['navio-blsct']
  },
  server: {
    port: 3333,
    fs: {
      // Allow serving files from parent directories
      allow: [
        resolve(__dirname, '..'),
      ]
    }
  }
});

