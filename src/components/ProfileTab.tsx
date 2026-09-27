import React, { useState, useEffect } from 'react';
import { calculateLevelFromXP } from '../lib/gamification';
import { LEVEL_PROTOCOLS, checkLevelCooldown, CooldownStatus } from '../lib/levelProtocols';
import { CommitmentLevel } from '../types';

// Emails habilitados para acceso al panel administrativo (verificación en servidor)
const ADMIN_EMAIL_HINTS = ['admin@maxsuplementos.com', 'gerencia@maxsuplementos.com'];

interface ProfileTabProps {
  xp: number;
  streakDays: number;
  userName?: string;
  userEmail?: string;
  isDemoMode?: boolean;
  isPro?: boolean;
  proExpiry?: string;
  onToggleDemoMode?: (demo: boolean) => void;
  onOpenOnboarding?: () => void;
  onResetNewUser?: () => void;
  onOpenPremium?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  onOpenAuth?: () => void;
  onOpenAdmin?: () => void;
  weightKg?: number;
  formScore?: number;
  commitmentLevel?: CommitmentLevel;
  levelSelectedAt?: string;
  levelGraceAvailable?: boolean;
  nextLevelChangeAllowedAt?: string;
  dailyHistory?: Record<string, number>;
  onDownloadApp?: () => void;
  isAppInstalled?: boolean;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  xp,
  streakDays,
  userName = 'Atleta',
  userEmail,
  isDemoMode = false,
  isPro = false,
  proExpiry,
  onToggleDemoMode,
  onOpenOnboarding,
  onResetNewUser,
  onOpenPremium,
  onLogout,
  onDeleteAccount,
  onOpenAuth,
  onOpenAdmin,
  weightKg,
  formScore = 0,
  commitmentLevel = 'Básico',
  levelSelectedAt,
  levelGraceAvailable = false,
  nextLevelChangeAllowedAt,
  onOpenLevelModal,
  dailyHistory,
  onDownloadApp,
  isAppInstalled = false,
}) => {
  const isAdminEmail = userEmail
    ? ADMIN_EMAIL_HINTS.includes(userEmail.toLowerCase())
    : false;
  const [bpm, setBpm] = useState(72);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const levelInfo = calculateLevelFromXP(xp);

  // Simulación de frecuencia cardíaca de wearable solo en modo demostración
  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setBpm(Math.floor(70 + Math.sin(Date.now() / 1000) * 4));
    }, 2000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const handleExportCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    const rows = [
      "Fecha,Atleta,NivelCompromiso,Peso(kg),FormDiaria(%),XP",
      `${today},"${userName}","${commitmentLevel}",${weightKg || 70},${formScore},${xp}`
    ];

    if (dailyHistory && Object.keys(dailyHistory).length > 0) {
      Object.entries(dailyHistory).forEach(([date, score]) => {
        if (date !== today) {
          rows.push(`${date},"${userName}","${commitmentLevel}",${weightKg || 70},${score},--`);
        }
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute("download", `maxmind_telemetria_${cleanName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage("¡Archivo CSV con tus registros reales descargado!");
    setTimeout(() => setExportMessage(null), 4000);
  };

  const handleExportPDF = () => {
    const todayStr = new Date().toLocaleDateString('es-ES', { dateStyle: 'full' });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Informe MAXMIND - ${userName}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; }
              .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
              h1 { font-size: 22px; margin: 0; color: #0f172a; font-weight: 800; letter-spacing: -0.5px; }
              .meta { color: #64748b; font-size: 13px; margin-top: 4px; }
              .badge { background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px; border: 1px solid #bfdbfe; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
              .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
              .card h3 { margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
              .card p { font-size: 22px; font-weight: 800; margin: 6px 0 0; color: #0f172a; }
              .protocol-card { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
              .protocol-card h3 { margin: 0 0 8px 0; font-size: 14px; font-weight: bold; }
              .protocol-card p { font-size: 13px; line-height: 1.6; color: #334155; margin: 0; }
              .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>MAXMIND · Informe Clínico y Telemetría</h1>
                <p class="meta">Atleta: <strong>${userName}</strong> | Fecha: <strong>${todayStr}</strong></p>
              </div>
              <span class="badge">Nivel ${commitmentLevel}</span>
            </div>
            <div class="grid">
              <div class="card"><h3>Form Diaria</h3><p>${formScore}%</p></div>
              <div class="card"><h3>Racha Activa</h3><p>${streakDays} Días</p></div>
              <div class="card"><h3>Peso Registrado</h3><p>${weightKg ? `${weightKg} kg` : '70 kg'}</p></div>
              <div class="card"><h3>Puntaje Acumulado</h3><p>${xp} XP</p></div>
            </div>
            <div class="protocol-card">
              <h3>Protocolo de Rendimiento (${commitmentLevel})</h3>
              <p>
                Este informe consolida las métricas de consistencia del atleta. El protocolo seleccionado exige ciclos mínimos de adaptación neuromuscular y nutricional sin alteraciones intempestivas. Válido para revisión con preparador físico o nutricionista deportivo.
              </p>
            </div>
            <div class="footer">MAXMIND Telemetría Oficial · Documento generado para seguimiento clínico y deportivo</div>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
      setExportMessage("Ventana de impresión y guardado PDF abierta.");
    } else {
      setExportMessage("Por favor autoriza las ventanas emergentes para imprimir o guardar el PDF.");
    }
    setTimeout(() => setExportMessage(null), 4000);
  };

  const handleTestNotification = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("MAXMIND: Meta de Rendimiento", {
            body: `¡Llevas ${formScore}% de tu Form Diaria! Mantén el ritmo para sellar el 100%.`,
            icon: "/maxmind-symbol.svg"
          });
          setNotificationStatus("Notificación enviada a tu dispositivo.");
        } else {
          setNotificationStatus("Notificaciones no permitidas por el navegador.");
        }
      });
    } else {
      setNotificationStatus("Este navegador no soporta la API de notificaciones nativas.");
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
              title="Abrir asistente de metas para configurar perfil"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Metas</span>
            </button>
          )}

          {onResetNewUser && (
            <button
              type="button"
              onClick={onResetNewUser}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95 shadow-md flex items-center gap-1"
              title="Reiniciar como nuevo usuario desde cero"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
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
        <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border ${
          isPro 
            ? 'bg-gradient-to-r from-[#0F291E] to-[#0B1220] border-emerald-500/40'
            : 'bg-gradient-to-r from-[#102A56] to-[#0B1220] border-[#2563EB]/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              isPro 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">MAXMIND Pro & Beneficios MAX Suplementos</h4>
                {isPro && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                    ACTIVO
                  </span>
                )}
              </div>
              <p className="text-xs text-[#CBD5E1]">
                {isPro 
                  ? `Suscripción Pro activa hasta ${proExpiry ? new Date(proExpiry).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '30 días'}. IA sin límites y 20% OFF en tienda.`
                  : 'Desbloquea el análisis con IA de comidas por foto y 20% OFF en suplementación.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPremium}
            className={`w-full sm:w-auto px-4 py-2 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap ${
              isPro
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-[#2563EB] hover:bg-[#3B82F6]'
            }`}
          >
            {isPro ? 'Gestionar Membresía' : 'Ver Planes & Canjear'}
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

      {/* Protocolo de Nivel de Compromiso y Cooldown */}
      {(() => {
        const proto = LEVEL_PROTOCOLS[commitmentLevel] || LEVEL_PROTOCOLS.Básico;
        const cooldown: CooldownStatus = checkLevelCooldown(
          levelSelectedAt,
          levelGraceAvailable,
          nextLevelChangeAllowedAt
        );

        return (
          <div className="bg-[#1d2024] rounded-xl p-5 border border-[#282a2f] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">tune</span>
                  <h3 className="font-headline-md text-white font-bold">Protocolo de Nivel de Compromiso</h3>
                </div>
                <p className="text-xs text-[#8d90a0] mt-1">
                  Ciclos cerrados de 14 días para asegurar adaptaciones fisiológicas reales sin alternar a capricho.
                </p>
              </div>

              {onOpenLevelModal && (
                <button
                  type="button"
                  onClick={onOpenLevelModal}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border self-start sm:self-auto bg-[#14161c] text-white hover:scale-[1.02] shadow-sm flex items-center gap-1.5"
                  style={{ borderColor: `${proto.themeColor}55` }}
                >
                  {cooldown.isAllowed ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{cooldown.hasGraceOpportunity ? '⚡ Recalibrar nivel (1 oportunidad)' : '🔄 Calibrar próximo ciclo'}</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span className="text-amber-300">Bloqueado: {cooldown.daysRemaining}d {cooldown.hoursRemaining}h</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Banner de estado del protocolo actual */}
            <div 
              className={`p-3.5 rounded-xl border ${proto.bgTint} ${proto.borderTint} flex items-start justify-between gap-3`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Nivel Actual: {proto.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${proto.badgeClass}`}>
                    {proto.badgeTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "{proto.tagline}"
                </p>
                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>🏋️ {proto.weeklyWorkouts} ({proto.workoutDuration})</div>
                  <div>🥩 {proto.proteinRatio}</div>
                  <div>💧 {proto.hydrationGoal}</div>
                  <div>📋 {proto.taskCount} tareas diarias</div>
                </div>
              </div>
            </div>

            {/* Explicación científica del período de 14 días */}
            <div className="p-3 bg-[#13151a] rounded-xl border border-[#23252b] text-xs text-slate-400 space-y-1">
              <span className="text-slate-300 font-bold block text-[11px]">
                ⚖️ Por qué el protocolo exige 14 días:
              </span>
              <p className="text-[11px] leading-relaxed">
                La síntesis proteica miofibrilar, los depósitos de glucógeno y la adaptación del sistema nervioso central requieren estabilidad en el estímulo. MAXFORM restringe el cambio a 1 oportunidad inicial y posteriormente ventanas quincenales.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Dispositivos Wearables Sincronizados */}
      <div className="bg-[#1d2024] rounded-xl p-5 border border-[#282a2f] space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">watch</span>
            <h3 className="font-headline-md text-white font-bold">Dispositivos y Sensores</h3>
          </div>
          {isDemoMode ? (
            <span className="text-xs text-blue-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Modo Demo
            </span>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Dispositivo no vinculado
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[#191c20] rounded-xl border border-[#282a2f] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8d90a0] uppercase block font-bold">Frecuencia Cardíaca</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-white">{isDemoMode ? bpm : '--'}</span>
                <span className="text-xs text-[#8d90a0]">BPM</span>
              </div>
            </div>
            <span className={`material-symbols-outlined ${isDemoMode ? 'text-red-400 animate-pulse' : 'text-slate-600'} text-[24px]`}>favorite</span>
          </div>

          <div className="p-3 bg-[#191c20] rounded-xl border border-[#282a2f] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8d90a0] uppercase block font-bold">Calorías Activas</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-white">{isDemoMode ? '540' : '--'}</span>
                <span className="text-xs text-[#8d90a0]">kcal</span>
              </div>
            </div>
            <span className={`material-symbols-outlined ${isDemoMode ? 'text-amber-400' : 'text-slate-600'} text-[24px]`}>local_fire_department</span>
          </div>

          <div className="p-3 bg-[#191c20] rounded-xl border border-[#282a2f] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8d90a0] uppercase block font-bold">Pasos Hoy</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-white">{isDemoMode ? '8.420' : '--'}</span>
                <span className="text-xs text-[#8d90a0]">pasos</span>
              </div>
            </div>
            <span className={`material-symbols-outlined ${isDemoMode ? 'text-[#b4c5ff]' : 'text-slate-600'} text-[24px]`}>directions_walk</span>
          </div>
        </div>

        {!isDemoMode && (
          <p className="text-[11px] text-slate-400">
            Sincronización con Apple Health y Google Fit en preparación para próximas versiones.
          </p>
        )}
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

      {/* Aplicación Móvil PWA e Instalación Directa */}
      <div className="bg-[#151a24] rounded-2xl p-5 border border-[#232b3b] space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-[#3b82f6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">install_mobile</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Aplicación Móvil MAXMIND</h3>
              <p className="text-[11px] text-slate-400">Instálala en tu teléfono para acceso directo sin barras del navegador.</p>
            </div>
          </div>
          {isAppInstalled ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Instalada
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-[#60a5fa] border border-blue-500/30 text-[10px] font-extrabold">
              PWA Lista
            </span>
          )}
        </div>

        <div className="p-3 bg-[#0d1117] rounded-xl border border-[#1b2230] text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-bold text-white block">
              {isAppInstalled ? '✅ App ejecutándose en modo nativo' : '📲 Descarga desde el navegador'}
            </span>
            <p className="text-[11px] text-slate-400">
              {isAppInstalled
                ? 'Tienes instalada la versión completa con aceleración local y soporte offline en tu dispositivo.'
                : 'Instala con un solo toque desde Google Chrome, Edge o Safari (iOS) sin pasar por tiendas.'}
            </p>
          </div>

          {onDownloadApp && !isAppInstalled && (
            <button
              type="button"
              onClick={onDownloadApp}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all touch-manipulation cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>Instalar en el Teléfono</span>
            </button>
          )}
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
              <span>Reconfigurar Metas</span>
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

          {/* Panel Administrativo — visible solo para emails de administrador */}
          {isAdminEmail && onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="col-span-full flex items-center justify-center gap-2 bg-[#0f1929] hover:bg-[#162040] text-blue-300 p-3 rounded-xl border border-blue-900/50 hover:border-blue-700/60 text-xs font-bold transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-400">admin_panel_settings</span>
              <span>Panel Administrativo</span>
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
