/* ==========================================================================
   PwaInstallBanner — Banner contextual de instalación de la PWA
   Invita al paciente a instalar la aplicación en su móvil o escritorio
   para acceso rápido y soporte de citas sin conexión.
   ========================================================================== */

import { useState, useEffect } from 'react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Si ya lo descartó en esta sesión o está en modo standalone
    const isDismissed = localStorage.getItem('psiagenda_pwa_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      // Simulación de instalación para navegadores de escritorio / desarrollo
      setInstalledSuccess(true);
      setTimeout(() => {
        setDismissed(true);
      }, 3000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('psiagenda_pwa_dismissed', 'true');
  };

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <div className="pwa-banner" role="region" aria-label="Instalar aplicación">
      <div className="pwa-banner-content">
        <div className="pwa-banner-icon" aria-hidden="true">📱</div>
        <div>
          <div className="pwa-banner-title">
            {installedSuccess ? '¡Aplicación lista en tu dispositivo!' : 'Instala PsiAgenda en tu celular'}
          </div>
          <p className="pwa-banner-subtitle">
            {installedSuccess
              ? 'Puedes acceder directamente desde tu pantalla de inicio incluso sin conexión a internet.'
              : 'Accede a tus próximas citas, notas y recursos directamente desde tu pantalla de inicio, incluso sin red.'}
          </p>
        </div>
      </div>

      <div className="pwa-banner-actions">
        {!installedSuccess ? (
          <button
            type="button"
            className="pwa-banner-install-btn"
            onClick={handleInstallClick}
          >
            Instalar ahora
          </button>
        ) : (
          <span style={{ fontSize: '0.8125rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
            ✓ Instalada
          </span>
        )}
        <button
          type="button"
          className="pwa-banner-close-btn"
          onClick={handleDismiss}
          aria-label="Cerrar notificación"
          title="Descartar"
        >
          ×
        </button>
      </div>
    </div>
  );
}
