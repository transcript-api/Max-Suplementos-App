import React from 'react';
import { SyncStatus } from '../lib/offlineSync';

interface HeaderProps {
  currentTab: string;
  onProfileClick: () => void;
  streakDays?: number;
  isDark?: boolean;
  onToggleDark?: () => void;
  syncStatus?: SyncStatus;
  onManualSync?: () => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onProfileClick,
  streakDays = 12,
  isDark = true,
  onToggleDark,
  syncStatus,
  onManualSync,
  isDemoMode = true,
  onToggleDemoMode,
  userName = 'Santiago',
}) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'inicio': return 'Inicio';
      case 'progreso':
      case 'estadisticas': return 'Estadísticas';
      case 'nutricion': return 'Nutrición';
      case 'max-ai': return 'MAX AI';
      case 'retos': return 'Retos';
      case 'perfil': return 'Perfil';
      default: return 'MAXFORM';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 dark:bg-[#0c0e12]/90 bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b dark:border-[#1d2024] border-slate-200 pt-safe transition-colors duration-200">
      <div className="h-16 px-4 max-w-[1280px] mx-auto flex items-center justify-between">
        {/* Logo & Marca */}
        <div className="flex items-center gap-2.5">
          <img 
            alt="MAXFORM Logo" 
            className="h-8 w-auto object-contain rounded-md" 
            src="https://lh3.googleusercontent.com/aida/AEtjO1W-1OkTB85R5IfT2PGhDWBPbi3ZqqPttYelnE4TRH24XwLRAs-AJhR8X9mXE6u9krPg7ZEgNdnXC0lrGegTojvPP0djaChpq-GNpSk8qW98LjQODzsmInCTIvtPt-pqj15s5Kr29bO_5u4A2KxL-V9JO9wdy5UxqHmCLwLoYcePVaXvoG01PcVcsMNm8Mc3KdS3PbFYyUPWnOAjzzDJbrA_2GMmzUlxcfO3_pP1qEKACZvjkmEoXRj0dU38"
          />
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md tracking-tight uppercase dark:text-white text-slate-900 font-bold leading-none">
              MAXFORM
            </span>
            <span className="text-[9px] dark:text-[#8d90a0] text-slate-500 font-bold tracking-wider uppercase mt-0.5">
              Performance System
            </span>
          </div>
        </div>

        {/* Indicador de sincronización Offline/Firestore, Sección y Acciones */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Badge de Sincronización Offline / Firestore */}
          {syncStatus && (
            <button
              type="button"
              onClick={onManualSync}
              title={
                !syncStatus.isOnline
                  ? 'Modo Offline: Datos guardados localmente. Se sincronizarán automáticamente al reconectar.'
                  : syncStatus.isSyncing
                  ? 'Sincronizando registros con Firestore...'
                  : syncStatus.pendingCount > 0
                  ? `${syncStatus.pendingCount} cambios pendientes. Toca para sincronizar.`
                  : 'Sincronizado con Firestore en tiempo real.'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                !syncStatus.isOnline
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : syncStatus.isSyncing
                  ? 'bg-blue-500/15 text-blue-600 dark:text-[#b4c5ff] border-blue-500/30 animate-pulse'
                  : syncStatus.pendingCount > 0
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                  : 'dark:bg-[#191c20] bg-slate-100 dark:text-[#8d90a0] text-slate-600 dark:border-[#282a2f] border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  !syncStatus.isOnline
                    ? 'bg-amber-500'
                    : syncStatus.isSyncing
                    ? 'bg-[#2563eb] animate-ping'
                    : 'bg-emerald-500'
                }`}
              ></span>
              <span className="hidden md:inline">
                {!syncStatus.isOnline
                  ? 'Modo Offline'
                  : syncStatus.isSyncing
                  ? 'Sincronizando...'
                  : syncStatus.pendingCount > 0
                  ? `${syncStatus.pendingCount} pendientes`
                  : 'Firestore Activo'}
              </span>
              <span className="material-symbols-outlined text-[14px]">
                {!syncStatus.isOnline
                  ? 'cloud_off'
                  : syncStatus.isSyncing
                  ? 'sync'
                  : 'cloud_done'}
              </span>
            </button>
          )}

          {/* Indicador y Selector de Modo Demo vs Real */}
          {onToggleDemoMode && (
            <button
              type="button"
              onClick={onToggleDemoMode}
              title={isDemoMode ? "Modo Demo Activo (Santiago). Clic para cambiar a Usuario Real (0 XP)." : "Modo Usuario Real Activo. Clic para cargar Modo Demo Santiago."}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all active:scale-95 ${
                isDemoMode
                  ? 'bg-[#2563EB]/20 text-[#3B82F6] border-[#2563EB]/40 hover:bg-[#2563EB]/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-[#3B82F6]' : 'bg-emerald-400'}`}></span>
              <span>{isDemoMode ? 'Demo' : 'Real (0 XP)'}</span>
            </button>
          )}

          <span className="font-label-caps text-label-caps uppercase dark:text-[#8d90a0] text-slate-500 hidden lg:inline-block dark:bg-[#191c20] bg-slate-100 px-2.5 py-1 rounded-full border dark:border-[#282a2f] border-slate-200">
            {getTitle()}
          </span>

          {/* Switch Modo Claro / Modo Oscuro */}
          {onToggleDark && (
            <button
              type="button"
              onClick={onToggleDark}
              aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="p-2 rounded-xl dark:bg-[#191c20] bg-slate-100 dark:hover:bg-[#282a2f] hover:bg-slate-200 text-slate-700 dark:text-[#b4c5ff] border dark:border-[#282a2f] border-slate-200 transition-all flex items-center justify-center active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}

          {/* Avatar del Atleta */}
          <button 
            type="button"
            onClick={onProfileClick}
            aria-label={`Perfil de ${userName}`}
            title={`Perfil de ${userName}`}
            className="relative flex items-center justify-center p-0.5 rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#2563eb] active:scale-95"
          >
            {isDemoMode ? (
              <img 
                alt="Perfil de Santiago" 
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#2563eb]/50" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB00Sme5qLyZzyIcklY0V1cNgikF0b-przMsFdt9GlxaDvjn41F6y-xbkVD5ke3cL80Ug9uhsWESJxMGuCMTNvUtMAnjCpU3FOpHn7ZRbCwS_U97WAfOyfA_iLMXBcCrxvgHFd_KuE_9H20o5rVMKworvuJ7T_KvRzBEfK5-8cWzNQyhT4Syy65tezqrvCui3VxNf0_ctWPMHP3yWL077ZYnGDwYAP6ukdWpgVJAQwJUFxXEam8u9NFkw"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-1 ring-blue-400/50 shadow-sm">
                {userName ? userName.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2563eb] ring-2 dark:ring-[#0c0e12] ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

