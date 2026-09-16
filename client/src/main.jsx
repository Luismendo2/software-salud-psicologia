import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Importar CSS global (esto carga variables, reset y Bootstrap)
import './styles/global.css';
import './styles/ai-clinical.css';

// Importar script de Bootstrap (necesario para el Offcanvas)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Registrar Service Worker para PWA si está soportado
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.info('SW registration failed:', err);
    });
  });
}
