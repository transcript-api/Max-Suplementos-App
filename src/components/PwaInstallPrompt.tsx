import React, { useState, useEffect } from 'react';
import { MaxMindLogo } from './MaxMindLogo';

interface PwaInstallPromptProps {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  showIosModal: boolean;
  onCloseIosModal: () => void;
  onInstall: () => void;
  isDark?: boolean;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  isInstallable,
  isInstalled,
  isIos,
  showIosModal,
  onCloseIosModal,
  onInstall,
  isDark = true,
}) => {
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya descartó el banner en esta sesión
    const dismissed = sessionStorage.getItem('maxmind_pwa_banner_dismissed');
    if (dismissed) {
      setIsBannerDismissed(true);
      return;
    }

    // Mostrar el banner flotante sutilmente tras 1.5 segundos
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setShowFloatingBanner(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismissBanner = () => {
    setShowFloatingBanner(false);
    setIsBannerDismissed(true);
    sessionStorage.setItem('maxmind_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* 1. BANNER FLOTANTE INFERIOR SUTIL (Para teléfonos y navegadores móviles) */}
      {showFloatingBanner && !isInstalled && !isBannerDismissed && (
        <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-bounce-short">
          <div className="dark:bg-[#151921]/95 bg-white/95 backdrop-blur-xl border dark:border-[#282f3d] border-slate-200 rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 text-slate-800 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[24px]">
                  install_mobile
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-xs sm:text-sm tracking-tight leading-tight">
                  Instalar MAXMIND en tu móvil
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  App nativa ultrarrápida · Modo offline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={onInstall}
                className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-600/30 active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                Descargar
              </button>
              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1f242d] transition-colors"
                aria-label="Cerrar banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL DE INSTRUCCIONES DE DESCARGA / INSTALACIÓN (Safari iOS o Navegador General) */}
      {showIosModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md dark:bg-[#12141a] bg-white rounded-3xl border dark:border-[#282a2f] border-slate-200 shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-white space-y-5">
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onCloseIosModal}
              className="absolute top-4 right-4 p-2 rounded-xl dark:hover:bg-[#1d2027] hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* Encabezado con Icono */}
            <div className="flex flex-col items-center text-center space-y-2 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] flex items-center justify-center shadow-xl shadow-blue-500/30 p-2">
                <MaxMindLogo variant="symbol" size="sm" isDark={true} />
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                Instalar MAXMIND en tu Pantalla de Inicio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Disfruta de la experiencia completa a pantalla completa sin barra de navegación, con máxima velocidad y modo offline.
              </p>
            </div>

            {/* Pasos para iOS Safari */}
            {isIos ? (
              <div className="space-y-3 dark:bg-[#191c22] bg-slate-50 p-4 rounded-2xl border dark:border-[#262930] border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-[#2563eb] dark:text-[#b4c5ff] font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    En la barra de Safari, toca el botón de <strong>Compartir</strong>{' '}
                    <span className="inline-block p-1 bg-slate-200 dark:bg-[#252830] rounded font-mono text-[11px] align-middle">
                      ⎋
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-[#2563eb] dark:text-[#b4c5ff] font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    Desplázate hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong>{' '}
                    <span className="material-symbols-outlined text-[15px] align-middle text-blue-500">
                      add_box
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-[#2563eb] dark:text-[#b4c5ff] font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    Toca <strong>"Agregar"</strong> en la esquina superior derecha. ¡Listo!
                  </div>
                </div>
              </div>
            ) : (
              /* Pasos para Chrome / Android / Otros navegadores */
              <div className="space-y-3 dark:bg-[#191c22] bg-slate-50 p-4 rounded-2xl border dark:border-[#262930] border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-[#2563eb] dark:text-[#b4c5ff] font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    Toca el menú de opciones de tu navegador{' '}
                    <strong>(tres puntos ⋮ arriba a la derecha)</strong>.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-[#2563eb] dark:text-[#b4c5ff] font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    Selecciona <strong>"Instalar aplicación"</strong> o{' '}
                    <strong>"Agregar a la pantalla principal"</strong>.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-[#2563eb] dark:text-[#b4c5ff] font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    Confirma la descarga. Se creará el ícono en tu teléfono igual que una aplicación de la Play Store.
                  </div>
                </div>
              </div>
            )}

            {/* Ventajas */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Carga en 0ms offline
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Pantalla completa
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> No ocupa memoria
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Datos sincronizados
              </div>
            </div>

            {/* Botón Entendido */}
            <button
              type="button"
              onClick={onCloseIosModal}
              className="w-full py-3 min-h-[44px] rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all touch-manipulation cursor-pointer flex items-center justify-center gap-2"
            >
              <span>¡Entendido!</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
