import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'retention',
      filename: 'remoteEntry.js',
      exposes: { './Module': './src/Module.tsx' },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: { target: 'esnext', modulePreload: false, cssCodeSplit: false },
  server: { port: 5180 },
  preview: { port: 5180 },
});
