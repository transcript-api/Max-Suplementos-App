import { useState, useEffect } from 'react';

// Declaración de tipos para BeforeInstallPromptEvent
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya está instalada / modo standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detectar si es iOS (Safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // En iOS Safari no hay beforeinstallprompt, pero se puede instalar vía menú compartir
      setIsInstallable(true);
    }

    // 3. Capturar evento de instalación nativo (Chrome / Edge / Android / Samsung)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // 4. Capturar cuando se completa la instalación
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (isInstalled) return false;

    // Si es iOS Safari, mostrar el modal de instrucciones
    if (isIos) {
      setShowIosModal(true);
      return false;
    }

    // Si tenemos el prompt nativo de Chrome / Android / Edge
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          return true;
        }
      } catch (err) {
        console.error('Error al invocar instalación PWA:', err);
      }
    } else {
      // Fallback para navegadores donde el prompt no fue capturado aún
      setShowIosModal(true);
    }

    return false;
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    isIos,
    showIosModal,
    setShowIosModal,
    triggerInstall,
  };
}
