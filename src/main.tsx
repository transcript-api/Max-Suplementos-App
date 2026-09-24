import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registro resiliente de Service Worker para carga instantánea en 0ms y soporte PWA instalable
if ('serviceWorker' in navigator && (import.meta.env.PROD || process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[SW] Service Worker registrado exitosamente con scope:', reg.scope);
    }).catch((err) => {
      console.warn('[SW] Registro diferido:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
