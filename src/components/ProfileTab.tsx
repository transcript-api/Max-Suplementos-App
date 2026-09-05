import React, { useState, useEffect } from 'react';
import { calculateLevelFromXP } from '../lib/gamification';

interface ProfileTabProps {
  xp: number;
  streakDays: number;
  userName?: string;
  userEmail?: string;
  isDemoMode?: boolean;
  onToggleDemoMode?: (demo: boolean) => void;
  onOpenOnboarding?: () => void;
  onOpenPremium?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  onOpenAuth?: () => void;
  weightKg?: number;
  formScore?: number;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  xp,
  streakDays,
  userName = 'Santiago',
  userEmail,
  isDemoMode = true,
  onToggleDemoMode,
  onOpenOnboarding,
  onOpenPremium,
  onLogout,
  onDeleteAccount,
  onOpenAuth,
  weightKg,
  formScore = 0,
}) => {
  const [commitmentLevel, setCommitmentLevel] = useState<'Básico' | 'Intermedio' | 'Avanzado' | 'Extremo'>('Avanzado');
  const [bpm, setBpm] = useState(72);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const levelInfo = calculateLevelFromXP(xp);

  // Simulación de frecuencia cardíaca de wearable
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(Math.floor(70 + Math.sin(Date.now() / 1000) * 4));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Fecha,Peso(kg),FormDiaria(%),Proteina(g),Calorias(kcal),Agua(L)\n"
      + "2026-10-24,72.4,84,128,1920,2.1\n"
      + "2026-10-23,72.6,90,152,2250,3.0\n"
      + "2026-10-22,72.8,85,148,2180,3.0\n"
      + "2026-10-21,73.0,100,155,2300,3.2\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "maxform_telemetria_santiago.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage("¡Archivo CSV exportado exitosamente!");
    setTimeout(() => setExportMessage(null), 4000);
  };

  const handleExportPDF = () => {
    setExportMessage("Generando informe clínico y biomecánico en PDF...");
    setTimeout(() => {
      setExportMessage("¡Informe PDF descargado para tu entrenador y nutricionista!");
      setTimeout(() => setExportMessage(null), 4000);
    }, 1500);
  };

  const handleTestNotification = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("MAXFORM: Meta de Hidratación", {
            body: "¡Vas en 2.1L! Un vaso más y aseguras el 100% de tu Form Diaria.",
            icon: "https://lh3.googleusercontent.com/aida/AEtjO1W-1OkTB85R5IfT2PGhDWBPbi3ZqqPttYelnE4TRH24XwLRAs-AJhR8X9mXE6u9krPg7ZEgNdnXC0lrGegTojvPP0djaChpq-GNpSk8qW98LjQODzsmInCTIvtPt-pqj15s5Kr29bO_5u4A2KxL-V9JO9wdy5UxqHmCLwLoYcePVaXvoG01PcVcsMNm8Mc3KdS3PbFYyUPWnOAjzzDJbrA_2GMmzUlxcfO3_pP1qEKACZvjkmEoXRj0dU38"
          });
          setNotificationStatus("Notificación de prueba enviada a tu dispositivo.");
        } else {
          setNotificationStatus("Simulación activa: Alerta de meta mostrada en pantalla.");
        }
      });
    } else {
      setNotificationStatus("Simulación activa: Notificaciones configuradas.");
    }
    setTimeout(() => setNotificationStatus(null), 4000);
  };

  return (
    <div className="flex flex-col w-full px-4 space-y-5 max-w-[1280px] mx-auto pb-24">
      {/* Banner de Control: Modo Demo vs Usuario Real */}
      <div className="bg-[#102A56]/60 border border-[#2563EB]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center flex-shrink-0 text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">
              {isDemoMode ? 'labs' : 'person'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isDemoMode ? 'Modo Presentación (Demo Santiago)' : 'Modo Usuario Real (Atleta)'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDemoMode ? 'bg-[#2563EB] text-white' : 'bg-emerald-500 text-white'}`}>
                {isDemoMode ? 'DEMO' : 'EN VIVO'}
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1] mt-0.5">
              {isDemoMode
                ? 'Datos cargados para presentar a Max Suplementos (4.860 XP, 12 días, Nivel 7).'
                : 'Cuenta limpia desde cero con progreso diario real y sincronización en Firestore.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onToggleDemoMode && (
            <button
              type="button"
              onClick={() => onToggleDemoMode(!isDemoMode)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#101A2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-bold text-white transition-all active:scale-95"
            >
              {isDemoMode ? 'Cambiar a Usuario Real (0 XP)' : 'Cargar Modo Demo Santiago'}
            </button>
          )}

          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="px-3 py-2 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-bold transition-all active:scale-95 shadow-md flex items-center gap-1"
              title="Reiniciar onboarding para configurar nuevo atleta"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Onboarding</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjeta de Perfil de Atleta */}
      <div className="bg-[#101A2B] rounded-2xl p-6 border border-[#1E293B] shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative">
            <img
              alt="Perfil Atleta"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-[#2563EB]"
              src={isDemoMode
                ? "https://lh3.googleusercontent.com/aida-public/AB6AXuB00Sme5qLyZzyIcklY0V1cNgikF0b-przMsFdt9GlxaDvjn41F6y-xbkVD5ke3cL80Ug9uhsWESJxMGuCMTNvUtMAnjCpU3FOpHn7ZRbCwS_U97WAfOyfA_iLMXBcCrxvgHFd_KuE_9H20o5rVMKworvuJ7T_KvRzBEfK5-8cWzNQyhT4Syy65tezqrvCui3VxNf0_ctWPMHP3yWL077ZYnGDwYAP6ukdWpgVJAQwJUFxXEam8u9NFkw"
                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              }
            />
            <span className="absolute bottom-0 right-0 bg-[#2563EB] text-white p-1 rounded-full text-xs">
              ⭐
            </span>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-headline-lg text-white font-bold text-xl sm:text-2xl">{userName}</h2>
                <p className="text-sm text-[#64748B]">
                  {isDemoMode ? 'Atleta de Rendimiento · Miembro Pro' : 'Atleta en Formación · Cuenta Personal'}
                </p>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="px-3 py-1 rounded-full bg-[#2563EB]/20 text-[#3B82F6] text-xs font-bold border border-[#2563EB]/30">
                  Nivel {levelInfo.levelNumber} · {levelInfo.levelName}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  🔥 {streakDays} {streakDays === 1 ? 'día' : 'días'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1E293B] text-center">
              <div className="bg-[#0B1220] p-2.5 rounded-xl border border-[#1E293B]">
                <span className="text-[11px] text-[#64748B] uppercase block font-bold">Experiencia</span>
                <span className="text-sm text-white font-bold">{xp.toLocaleString('es-ES')} XP</span>
              </div>
              <div className="bg-[#0B1220] p-2.5 rounded-xl border border-[#1E293B]">
                <span className="text-[11px] text-[#64748B] uppercase block font-bold">Peso actual</span>
                <span className="text-sm text-white font-bold">{weightKg ? weightKg.toFixed(1).replace('.', ',') : (isDemoMode ? '72,4' : '70,0')} kg</span>
              </div>
              <div className="bg-[#0B1220] p-2.5 rounded-xl border border-[#1E293B]">
                <span className="text-[11px] text-[#64748B] uppercase block font-bold">Form media</span>
                <span className="text-sm text-[#3B82F6] font-bold">{formScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner MAXFORM Pro */}
      {onOpenPremium && (
        <div className="p-4 bg-gradient-to-r from-[#102A56] to-[#0B1220] border border-[#2563EB]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">MAXFORM Pro & Beneficios MAX Suplementos</h4>
              <p className="text-xs text-[#CBD5E1]">
                Desbloquea el análisis con IA de comidas por foto y 20% OFF en suplementación.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPremium}
            className="w-full sm:w-auto px-4 py-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            Ver Planes & Beneficios
          </button>
        </div>
      )}

      {notificationStatus && (
        <div className="p-3 bg-[#2563eb]/20 border border-[#2563eb]/40 text-[#b4c5ff] rounded-xl text-xs font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span>{notificationStatus}</span>
        </div>
      )}

      {exportMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">download_done</span>
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Selector de Nivel de Compromiso */}
      <div className="bg-[#1d2024] rounded-xl p-5 border border-[#282a2f] space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">tune</span>
            <h3 className="font-headline-md text-white font-bold">Nivel de Compromiso</h3>
          </div>
          <p className="text-xs text-[#8d90a0] mt-1">
            Ajusta el rigor de las recomendaciones de MAX AI y la tolerancia de tus metas metabólicas.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Básico', 'Intermedio', 'Avanzado', 'Extremo'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setCommitmentLevel(lvl)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                commitmentLevel === lvl
                  ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-md scale-[1.02]'
                  : 'bg-[#191c20] text-[#8d90a0] border-[#282a2f] hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Explicación del nivel seleccionado */}
        <div className="p-3.5 bg-[#191c20] rounded-xl border border-[#282a2f] space-y-1.5 text-xs text-[#c3c6d7]">
          <span className="text-[#b4c5ff] font-bold block uppercase tracking-wider text-[11px]">
            Reglas del Nivel {commitmentLevel}:
          </span>
          {commitmentLevel === 'Básico' && (
            <p>2 litros de agua diarios, registro libre sin pesaje obligatorio, 3 entrenamientos semanales.</p>
          )}
          {commitmentLevel === 'Intermedio' && (
            <p>120g de proteína asegurada, control calórico moderado, 4 entrenamientos y chequeo quincenal.</p>
          )}
          {commitmentLevel === 'Avanzado' && (
            <p>150g de proteína estricta, telemetría biométrica continua, 3L de agua y control de sobrecarga progresiva en cada sesión.</p>
          )}
          {commitmentLevel === 'Extremo' && (
            <p>Pesaje al gramo, fotos biométricas cada 7 días, telemetría cardíaca en vivo, sin cheat meals permitidas.</p>
          )}
        </div>
      </div>

      {/* Dispositivos Wearables Sincronizados */}
      <div className="bg-[#1d2024] rounded-xl p-5 border border-[#282a2f] space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">watch</span>
            <h3 className="font-headline-md text-white font-bold">Dispositivos y Sensores</h3>
          </div>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            En vivo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[#191c20] rounded-xl border border-[#282a2f] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8d90a0] uppercase block font-bold">Frecuencia Cardíaca</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-white">{bpm}</span>
                <span className="text-xs text-[#8d90a0]">BPM</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-red-400 text-[24px] animate-pulse">favorite</span>
          </div>

          <div className="p-3 bg-[#191c20] rounded-xl border border-[#282a2f] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8d90a0] uppercase block font-bold">Calorías Activas</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-white">540</span>
                <span className="text-xs text-[#8d90a0]">kcal</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-amber-400 text-[24px]">local_fire_department</span>
          </div>

          <div className="p-3 bg-[#191c20] rounded-xl border border-[#282a2f] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8d90a0] uppercase block font-bold">Pasos Hoy</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-white">8.420</span>
                <span className="text-xs text-[#8d90a0]">pasos</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#b4c5ff] text-[24px]">directions_walk</span>
          </div>
        </div>
      </div>

      {/* Exportar Reportes y Datos */}
      <div className="bg-[#1d2024] rounded-xl p-5 border border-[#282a2f] space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">ios_share</span>
          <h3 className="font-headline-md text-white font-bold">Exportar Telemetría e Informes</h3>
        </div>
        <p className="text-xs text-[#8d90a0]">
          Exporta tus datos estructurados para análisis en hojas de cálculo o envía un PDF a tu preparador físico.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-[#191c20] hover:bg-[#282a2f] text-white p-3 rounded-xl border border-[#282a2f] text-xs font-bold transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] text-[#b4c5ff]">table_view</span>
            <span>Descargar datos CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 bg-[#191c20] hover:bg-[#282a2f] text-white p-3 rounded-xl border border-[#282a2f] text-xs font-bold transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] text-[#adc6ff]">picture_as_pdf</span>
            <span>Informe para Nutricionista (PDF)</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleTestNotification}
            className="w-full flex items-center justify-center gap-2 bg-[#2563eb]/20 hover:bg-[#2563eb]/30 text-[#b4c5ff] p-2.5 rounded-xl border border-[#2563eb]/40 text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">notifications_active</span>
            <span>Probar Notificaciones Push de Rendimiento</span>
          </button>
        </div>
      </div>

      {/* Administración de Cuenta y Sesión */}
      <div className="bg-[#101A2B] rounded-2xl p-5 border border-[#1E293B] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3B82F6] text-[22px]">manage_accounts</span>
            <h3 className="font-bold text-sm text-white">Cuenta y Seguridad</h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {userEmail || (isDemoMode ? 'santiago@maxform.app' : 'Usuario Local')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="flex items-center justify-center gap-2 bg-[#151D30] hover:bg-[#1E293B] text-slate-200 p-3 rounded-xl border border-[#1E293B] text-xs font-bold transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-[#3B82F6]">tune</span>
              <span>Reconfigurar Metas (Onboarding)</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center gap-2 bg-[#151D30] hover:bg-rose-500/20 text-rose-300 p-3 rounded-xl border border-[#1E293B] hover:border-rose-500/40 text-xs font-bold transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>

        {onDeleteAccount && !isDemoMode && (
          <div className="pt-3 border-t border-[#1E293B]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-rose-400 block">Zona de Peligro</span>
              <span className="text-[11px] text-slate-500">Eliminar permanentemente los datos locales y la cuenta de este dispositivo.</span>
            </div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDeleteAccount}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                >
                  Confirmar Eliminación
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2"
              >
                Eliminar Cuenta y Datos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
