import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// URLs de los remoteEntry.js de cada módulo independiente. En desarrollo
// apuntan a los puertos locales; en producción se sobreescriben mediante
// variables VITE_REMOTE_* (ver .env.example) para apuntar a cada módulo
// desplegado de forma independiente (posiblemente en otro dominio/CDN).
const remote = (envVar: string, port: number) =>
  process.env[envVar] || `http://localhost:${port}/assets/remoteEntry.js`;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        companiesUsers: remote('VITE_REMOTE_COMPANIES_USERS', 5175),
        consents: remote('VITE_REMOTE_CONSENTS', 5176),
        rat: remote('VITE_REMOTE_RAT', 5177),
        arco: remote('VITE_REMOTE_ARCO', 5178),
        breaches: remote('VITE_REMOTE_BREACHES', 5179),
        retention: remote('VITE_REMOTE_RETENTION', 5180),
        ethicsChannel: remote('VITE_REMOTE_ETHICS_CHANNEL', 5181),
        maturity: remote('VITE_REMOTE_MATURITY', 5182),
        training: remote('VITE_REMOTE_TRAINING', 5183),
        contracts: remote('VITE_REMOTE_CONTRACTS', 5184),
        audit: remote('VITE_REMOTE_AUDIT', 5185),
        evidence: remote('VITE_REMOTE_EVIDENCE', 5186),
        tasks: remote('VITE_REMOTE_TASKS', 5187),
        risk: remote('VITE_REMOTE_RISK', 5188),
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  build: {
    target: 'esnext',
    modulePreload: false,
    cssCodeSplit: false,
  },
  server: { port: 5173 },
  preview: { port: 5173 },
});
