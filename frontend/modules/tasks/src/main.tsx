import React from 'react';
import ReactDOM from 'react-dom/client';
import Module from './Module';

// Punto de entrada solo para desarrollo aislado de este módulo
// (`npm run dev` dentro de esta carpeta). En producción el módulo se
// consume embebido en el shell vía Module Federation (ver ./vite.config.ts).
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Module />
  </React.StrictMode>,
);
