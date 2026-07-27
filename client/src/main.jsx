import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Importar CSS global (esto carga variables, reset y Bootstrap)
import './styles/global.css';

// Importar script de Bootstrap (necesario para el Offcanvas)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
