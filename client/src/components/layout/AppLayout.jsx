/* ==========================================================================
   AppLayout — Shell principal de la aplicación
   
   Estructura: Sidebar (desktop) + MobileNav (móvil) + área de contenido.
   Usa <Outlet /> de React Router para renderizar la página activa.
   Todas las rutas autenticadas pasan por aquí.
   ========================================================================== */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
  return (
    <div className="app-shell">
      {/* Sidebar fija en desktop (>= 992px) */}
      <Sidebar />

      {/* Navbar superior en móvil (< 992px) */}
      <MobileNav />

      {/* Área principal donde se renderizan las páginas */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
